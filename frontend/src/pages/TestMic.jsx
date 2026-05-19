/**
 * TestMic — Brutal voice runtime audit (§2026-05-20 evening).
 *
 * Founder explicit: English voice ALSO fails (not just Estonian).
 * Mic verified working in other tools. We must now show the direct
 * truth of the live ElevenLabs voice runtime chain.
 *
 * This page exposes — in real time — every step of the chain:
 *   1. Raw browser mic (independent of SDK constraints):
 *        a. permission state
 *        b. negotiated sampleRate / channelCount / deviceLabel
 *        c. live RMS volume from a stand-alone AnalyserNode
 *   2. SDK session state:
 *        a. INPUT AudioContext state + sampleRate + baseLatency
 *        b. OUTPUT AudioContext state + sampleRate + baseLatency
 *        c. SDK's own getInputVolume() (proves the worklet sees audio)
 *   3. WebSocket egress:
 *        a. count of `user_audio_chunk` messages we send to ElevenLabs
 *        b. total bytes of PCM transmitted
 *        c. count of OTHER messages (text, override, etc.)
 *   4. Server side:
 *        a. live VAD score (proves ElevenLabs receives the audio)
 *        b. transcript messages (proves ASR returned text)
 *        c. agent reply messages (proves the LLM responded)
 *
 * Diagnostic ground truth — read top-to-bottom while speaking:
 *   • independent mic bar moves                → browser mic OK
 *   • SDK input ctx state = "running"          → audio graph alive
 *   • SDK getInputVolume() > 0                 → worklet sees audio
 *   • WS audio_chunk count grows               → frames leaving us
 *   • VAD bar moves                            → ElevenLabs hears us
 *   • transcript appears                       → ASR transcribed
 *   • agent reply appears                      → LLM responded
 *
 * If everything above the dotted line moves but VAD stays at 0:
 * the audio is leaving our browser but ElevenLabs server is rejecting
 * it (format mismatch, signed-url scope, agent config mismatch).
 *
 * If SDK input ctx is "running" but getInputVolume()==0 while raw
 * mic bar moves: the SDK's voiceIsolation constraint silenced the
 * stream client-side. We can hot-patch by re-acquiring without it.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConversationProvider,
  useConversation,
  useRawConversation,
  useConversationInput,
} from "@elevenlabs/react";

const BACKEND = process.env.REACT_APP_BACKEND_URL;
const TOKEN_KEY = "aurin_session_token";

async function fetchSignedUrl() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (!token) throw new Error("Not signed in (open /portal first)");
  if (!BACKEND) throw new Error("Backend URL not configured");
  const res = await fetch(`${BACKEND}/api/clarity/convai/signed-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ room: "clarity", mode: "voice" }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`signed-url failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  return res.json();
}

function TestMicInner() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [audit, setAudit] = useState(null);
  const [sdkVolume, setSdkVolume] = useState(0);
  const [rawMicVolume, setRawMicVolume] = useState(0);
  const [rawMicInfo, setRawMicInfo] = useState(null);
  const [vadScore, setVadScore] = useState(0);
  const [wsStats, setWsStats] = useState({ audio_chunks: 0, audio_bytes: 0, other_msgs: 0, last_other: "" });
  const [transcript, setTranscript] = useState([]);
  const [log, setLog] = useState([]);

  // Refs to keep stats live without React re-render churn
  const wsStatsRef = useRef({ audio_chunks: 0, audio_bytes: 0, other_msgs: 0, last_other: "" });
  const patchedRef = useRef(false);

  // Independent raw-mic acquisition state (does NOT use SDK).
  // Acquires the device with NO constraints, attaches an AnalyserNode,
  // and reports live RMS volume so we know whether the browser CAN
  // capture audio at all on this machine in this profile.
  const rawMicCtxRef = useRef(null);
  const rawMicStreamRef = useRef(null);
  const rawMicAnalyserRef = useRef(null);
  const rawMicRafRef = useRef(0);

  const pushLog = useCallback((line) => {
    const ts = new Date().toISOString().slice(11, 23);
    setLog((prev) => [...prev.slice(-40), `${ts}  ${line}`]);
    // eslint-disable-next-line no-console
    console.log(`[TestMic] ${line}`);
  }, []);

  const startRawMic = useCallback(async () => {
    if (rawMicStreamRef.current) return; // already running
    try {
      // Constraints OFF to bypass SDK's voiceIsolation / NS / AGC chain.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const track = stream.getAudioTracks()[0];
      const settings = track?.getSettings?.() || {};
      setRawMicInfo({
        label: track?.label || "(unlabeled)",
        sampleRate: settings.sampleRate,
        channelCount: settings.channelCount,
        deviceId: settings.deviceId ? "***" : null,
      });
      pushLog(`raw mic ✓ label=${track?.label || "?"} rate=${settings.sampleRate} ch=${settings.channelCount}`);
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      if (ctx.state === "suspended") await ctx.resume();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      rawMicCtxRef.current = ctx;
      rawMicStreamRef.current = stream;
      rawMicAnalyserRef.current = analyser;
      const tick = () => {
        analyser.getByteFrequencyData(buf);
        // Voice band: bins 5..120 (≈80Hz–2kHz @ 48kHz / 2048 fft)
        let sum = 0;
        for (let i = 5; i < 120; i += 1) sum += buf[i];
        const v = Math.min(1, sum / (115 * 64));
        setRawMicVolume(v);
        rawMicRafRef.current = requestAnimationFrame(tick);
      };
      rawMicRafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      pushLog(`raw mic ✗ ${e?.message}`);
      setRawMicInfo({ error: e?.message });
    }
  }, [pushLog]);

  const stopRawMic = useCallback(() => {
    if (rawMicRafRef.current) cancelAnimationFrame(rawMicRafRef.current);
    rawMicRafRef.current = 0;
    try { rawMicStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* noop */ }
    try { rawMicCtxRef.current?.close(); } catch { /* noop */ }
    rawMicStreamRef.current = null;
    rawMicCtxRef.current = null;
    rawMicAnalyserRef.current = null;
    setRawMicVolume(0);
  }, []);

  const raw = useRawConversation();
  const { setMuted } = useConversationInput();

  const conversation = useConversation({
    onConnect: () => {
      pushLog("onConnect — session live");
      setStatus("live");
      setError("");
      try { setMuted(false); pushLog("setMuted(false) ✓"); } catch (e) { pushLog(`setMuted err: ${e?.message}`); }
    },
    onDisconnect: (d) => {
      pushLog(`onDisconnect ${JSON.stringify(d || {}).slice(0, 120)}`);
      setStatus("idle");
    },
    onError: (err) => {
      const msg = typeof err === "string" ? err : err?.message || "error";
      pushLog(`onError ${msg}`);
      setError(msg);
      setStatus("error");
    },
    onMessage: (m) => {
      if (m?.source && m?.message) {
        pushLog(`msg:${m.source} → ${String(m.message).slice(0, 80)}`);
        setTranscript((prev) => [...prev.slice(-20), { source: m.source, text: m.message }]);
      }
    },
    onVadScore: (e) => {
      const s = e?.vadScore;
      if (typeof s === "number" && Number.isFinite(s)) setVadScore(s);
    },
  });

  // §RUNTIME AUDIT 2026-05-20 EVE — monkey-patch the SDK's connection
  // .sendMessage() so we can count exactly how many `user_audio_chunk`
  // messages leave this tab. If this counter does NOT grow while you
  // speak, the SDK is NOT transmitting audio (worklet isMuted,
  // suspended ctx, voiceIsolation silenced stream, or worse).
  // If it grows but VAD stays at 0, the audio reaches our send buffer
  // but is rejected by the ElevenLabs server (format / scope / agent).
  useEffect(() => {
    if (status !== "live" || !raw || patchedRef.current) return;
    const conn = raw?.connection;
    if (!conn || typeof conn.sendMessage !== "function") {
      pushLog("⚠ no connection.sendMessage to patch");
      return;
    }
    const original = conn.sendMessage.bind(conn);
    conn.sendMessage = (msg) => {
      try {
        if (msg && typeof msg === "object") {
          if ("user_audio_chunk" in msg) {
            const chunk = msg.user_audio_chunk;
            const len = typeof chunk === "string" ? chunk.length : 0;
            // base64 → bytes ≈ len * 3 / 4 (close enough for diagnostics)
            wsStatsRef.current.audio_chunks += 1;
            wsStatsRef.current.audio_bytes += Math.round((len * 3) / 4);
          } else {
            wsStatsRef.current.other_msgs += 1;
            wsStatsRef.current.last_other = Object.keys(msg).join(",").slice(0, 60);
          }
        }
      } catch { /* never throw inside the SDK send path */ }
      return original(msg);
    };
    patchedRef.current = true;
    pushLog("✓ sendMessage patched — runtime audit live");
    return () => {
      // restore on session teardown
      try { conn.sendMessage = original; } catch { /* noop */ }
      patchedRef.current = false;
    };
  }, [status, raw, pushLog]);

  // Continuous AudioContext audit + SDK volume sampling
  useEffect(() => {
    if (status !== "live" || !raw) return undefined;
    const inputCtx = raw?.input?.context;
    const outputCtx = raw?.output?.context;
    const sampleAll = () => {
      setAudit({
        input: inputCtx ? {
          state: inputCtx.state,
          sampleRate: inputCtx.sampleRate,
          baseLatency: inputCtx.baseLatency,
        } : null,
        output: outputCtx ? {
          state: outputCtx.state,
          sampleRate: outputCtx.sampleRate,
          baseLatency: outputCtx.baseLatency,
        } : null,
      });
      // SDK's own internal volume — independent of our raw mic bar
      try {
        const vol = typeof raw?.getInputVolume === "function"
          ? raw.getInputVolume()
          : 0;
        setSdkVolume(Math.min(1, Number(vol) || 0));
      } catch { /* noop */ }
      // Mirror runtime stats to React state at sampling cadence
      setWsStats({ ...wsStatsRef.current });
    };
    sampleAll();
    pushLog(`audit input=${inputCtx?.state}@${inputCtx?.sampleRate}Hz output=${outputCtx?.state}@${outputCtx?.sampleRate}Hz`);
    if (inputCtx && inputCtx.state === "suspended") {
      pushLog("⚠ input ctx suspended — calling resume()");
      inputCtx.resume().then(() => {
        pushLog(`✓ input ctx resumed → ${inputCtx.state}`);
        sampleAll();
      }).catch((e) => pushLog(`✗ input resume failed: ${e?.message}`));
    }
    if (outputCtx && outputCtx.state === "suspended") {
      outputCtx.resume().catch(() => {});
    }
    const id = setInterval(sampleAll, 250);
    return () => clearInterval(id);
  }, [status, raw, pushLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        const p = conversation.endSession();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch { /* noop */ }
      stopRawMic();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(async () => {
    if (status === "connecting" || status === "live") return;
    setStatus("connecting");
    setError("");
    setLog([]);
    setAudit(null);
    setTranscript([]);
    setVadScore(0);
    setSdkVolume(0);
    wsStatsRef.current = { audio_chunks: 0, audio_bytes: 0, other_msgs: 0, last_other: "" };
    setWsStats(wsStatsRef.current);
    try {
      pushLog("→ pre-warm getUserMedia");
      const warm = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = warm.getAudioTracks()[0];
      const s = track?.getSettings?.() || {};
      pushLog(`✓ mic ok — rate=${s.sampleRate} ch=${s.channelCount} label=${track?.label || "(unlabeled)"}`);
      warm.getTracks().forEach((t) => t.stop());
      pushLog("→ fetch signed-url");
      const { signed_url: signedUrl } = await fetchSignedUrl();
      pushLog(`✓ signed-url (len=${signedUrl?.length || 0})`);
      pushLog("→ startSession");
      conversation.startSession({
        signedUrl,
        connectionType: "websocket",
        // We deliberately DO NOT pass agent.language override here —
        // the Dashboard security overrides disallow it, and the
        // agents are already configured (Grace voice_id below is
        // still allowed and harmless).
        overrides: { tts: { voiceId: "21m00Tcm4TlvDq8ikWAM" } },
      });
    } catch (err) {
      pushLog(`✗ start failed: ${err?.message}`);
      setError(err?.message || "could not start");
      setStatus("error");
    }
  }, [conversation, pushLog, status]);

  const stop = useCallback(async () => {
    pushLog("→ endSession");
    try { await conversation.endSession(); } catch { /* noop */ }
    setStatus("idle");
  }, [conversation, pushLog]);

  const dumpToClipboard = useCallback(async () => {
    const dump = {
      ts: new Date().toISOString(),
      status,
      error,
      audit,
      sdkVolume: sdkVolume.toFixed(4),
      rawMicVolume: rawMicVolume.toFixed(4),
      rawMicInfo,
      vadScore: vadScore.toFixed(4),
      wsStats,
      transcript: transcript.slice(-10),
      log: log.slice(-25),
      ua: navigator.userAgent,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(dump, null, 2));
      pushLog("✓ snapshot copied to clipboard — paste here");
    } catch {
      pushLog("✗ clipboard blocked — open DevTools to copy manually");
    }
  }, [status, error, audit, sdkVolume, rawMicVolume, rawMicInfo, vadScore, wsStats, transcript, log, pushLog]);

  const S = {
    page: { fontFamily: "system-ui, -apple-system, sans-serif", padding: "20px", maxWidth: "920px", margin: "0 auto", lineHeight: 1.45, color: "#1a1a1a", background: "#fff", minHeight: "100vh" },
    h1: { fontSize: "20px", marginBottom: "6px" },
    h2: { fontSize: "12px", margin: "16px 0 6px 0", color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 },
    btn: { fontSize: "14px", padding: "10px 18px", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", marginRight: "8px" },
    primary: (s) => ({ background: s === "live" ? "#c0392b" : "#1976d2" }),
    secondary: { background: "#555" },
    barBg: { width: "100%", height: "10px", background: "#eee", borderRadius: "2px", marginBottom: "2px", position: "relative" },
    bar: (v, color) => ({ width: `${Math.min(100, Math.round(v * 100))}%`, height: "10px", background: color, transition: "width 80ms linear", borderRadius: "2px" }),
    pre: { fontFamily: "ui-monospace, Menlo, monospace", fontSize: "11px", background: "#f7f7f7", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", maxHeight: "240px", overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" },
    info: { fontSize: "12px", color: "#666" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
    err: { color: "#c0392b", fontSize: "13px", marginTop: "8px" },
    pill: (good) => ({ display: "inline-block", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: good ? "#2e7d32" : "#aaa", color: "white", marginLeft: "6px" }),
  };

  const inputRunning = audit?.input?.state === "running";
  const sendingAudio = wsStats.audio_chunks > 0;
  const elHearing = vadScore > 0.1;

  return (
    <div style={S.page} data-testid="test-mic-root">
      <h1 style={S.h1}>Voice Pipeline — Runtime Truth Audit</h1>
      <p style={S.info}>
        Read top-to-bottom while speaking. Each row is one link in the chain. The first row that
        does NOT light up green is exactly where the pipeline breaks.
      </p>

      <div style={{ marginTop: "16px" }}>
        {status === "live" ? (
          <button style={{ ...S.btn, ...S.primary(status) }} onClick={stop} data-testid="test-mic-stop">End</button>
        ) : (
          <button style={{ ...S.btn, ...S.primary(status) }} onClick={start} disabled={status === "connecting"} data-testid="test-mic-start">
            {status === "connecting" ? "Connecting…" : "Start voice session"}
          </button>
        )}
        <button style={{ ...S.btn, ...S.secondary }} onClick={startRawMic}>Test raw mic (no SDK)</button>
        <button style={{ ...S.btn, ...S.secondary }} onClick={stopRawMic}>Stop raw mic</button>
        <button style={{ ...S.btn, ...S.secondary }} onClick={dumpToClipboard}>Copy snapshot</button>
        <span style={S.info}>Status: <strong>{status}</strong></span>
      </div>

      {error ? <p style={S.err} data-testid="test-mic-error">⚠ {error}</p> : null}

      <h2 style={S.h2}>
        Link 1 · Raw browser mic (constraints OFF, independent of SDK)
        <span style={S.pill(rawMicVolume > 0.04)}>{rawMicVolume > 0.04 ? "OK" : "—"}</span>
      </h2>
      <div style={S.barBg}><div style={S.bar(rawMicVolume, "#2e7d32")} /></div>
      <p style={S.info}>{rawMicInfo ? JSON.stringify(rawMicInfo) : "Click 'Test raw mic' to verify the browser can capture audio at all."}</p>

      <h2 style={S.h2}>
        Link 2 · SDK INPUT AudioContext
        <span style={S.pill(inputRunning)}>{inputRunning ? "running" : "—"}</span>
      </h2>
      <pre style={S.pre} data-testid="test-mic-audit">{audit ? JSON.stringify(audit, null, 2) : "(start a session)"}</pre>

      <h2 style={S.h2}>
        Link 3 · SDK getInputVolume() — does the worklet see audio?
        <span style={S.pill(sdkVolume > 0.02)}>{sdkVolume > 0.02 ? "OK" : "—"}</span>
      </h2>
      <div style={S.barBg}><div style={S.bar(sdkVolume * 6, "#1976d2")} /></div>
      <p style={S.info}>raw value: {sdkVolume.toFixed(4)} · if this stays 0 while Link 1 moves, the SDK's voiceIsolation/NS/AGC silenced the stream.</p>

      <h2 style={S.h2}>
        Link 4 · WebSocket → ElevenLabs (audio chunks transmitted)
        <span style={S.pill(sendingAudio)}>{sendingAudio ? `${wsStats.audio_chunks} chunks` : "—"}</span>
      </h2>
      <pre style={S.pre}>{JSON.stringify(wsStats, null, 2)}</pre>
      <p style={S.info}>If this counter does NOT grow while you speak, no audio is leaving your browser. If it grows but Link 5 stays 0, the server rejects the audio.</p>

      <h2 style={S.h2}>
        Link 5 · ElevenLabs VAD score — does the server hear us?
        <span style={S.pill(elHearing)}>{elHearing ? `${vadScore.toFixed(2)}` : "—"}</span>
      </h2>
      <div style={S.barBg}><div style={S.bar(vadScore, "#f57c00")} /></div>

      <h2 style={S.h2}>
        Link 6 · Transcript / agent reply
        <span style={S.pill(transcript.length > 0)}>{transcript.length > 0 ? `${transcript.length} msgs` : "—"}</span>
      </h2>
      <pre style={S.pre} data-testid="test-mic-transcript">
        {transcript.length === 0 ? "(nothing yet — speak after 'Start')" : transcript.map((t) => `${t.source}: ${t.text}`).join("\n")}
      </pre>

      <h2 style={S.h2}>Event log</h2>
      <pre style={S.pre} data-testid="test-mic-log">{log.length === 0 ? "(no events yet)" : log.join("\n")}</pre>

      <p style={{ ...S.info, marginTop: "12px", fontSize: "11px" }}>
        Open DevTools → Console for the parallel <code>[TestMic]</code> log stream. Use "Copy snapshot"
        to grab a full JSON dump and paste it back so we can diagnose the exact failing link.
      </p>
    </div>
  );
}

export default function TestMic() {
  return (
    <ConversationProvider>
      <TestMicInner />
    </ConversationProvider>
  );
}
