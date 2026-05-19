/**
 * TestMic — Brutal diagnostic test page (§2026-05-20).
 *
 * Purpose: isolate whether the "voice-to-voice deafness" bug lives in
 *   (a) the founder's own browser / Chrome profile,
 *   (b) our custom CSS / DOM overlay stealing mic focus, or
 *   (c) the ElevenLabs WebSocket / format pipeline itself.
 *
 * Strategy: this page contains NO custom CSS, NO transparent overlays,
 * NO focus-stealing elements. Just inline styles and the raw
 * ElevenLabs SDK behind a single button. If voice-to-voice ALSO fails
 * here, the bug is browser/profile-side. If it WORKS here but fails
 * on /clarity-release, the bug is in our overlay/CSS stack.
 *
 * The page exposes live telemetry of:
 *   - INPUT AudioContext.state + sampleRate
 *   - OUTPUT AudioContext.state + sampleRate
 *   - Worklet "setMuted" message acknowledgement
 *   - Mic FFT spectrum sum (does the browser hear me?)
 *   - Server-side VAD score (does ElevenLabs hear me?)
 *   - WebSocket transport status
 *
 * Scope-lock: this is a NEW route, completely separate from the
 * production audio pipeline. Nothing in this file imports from
 * RoomConvaiChat.jsx or modifies it.
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
  const [micLevel, setMicLevel] = useState(0);
  const [vadScore, setVadScore] = useState(0);
  const [log, setLog] = useState([]);

  const pushLog = useCallback((line) => {
    const ts = new Date().toISOString().slice(11, 23);
    setLog((prev) => [...prev.slice(-30), `${ts}  ${line}`]);
    // eslint-disable-next-line no-console
    console.log(`[TestMic] ${line}`);
  }, []);

  const raw = useRawConversation();
  const { setMuted } = useConversationInput();

  const conversation = useConversation({
    onConnect: () => {
      pushLog("onConnect — session live");
      setStatus("live");
      setError("");
      try { setMuted(false); } catch { /* noop */ }
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
      }
    },
    onVadScore: (e) => {
      const s = e?.vadScore;
      if (typeof s === "number" && Number.isFinite(s)) setVadScore(s);
    },
  });

  // Continuous AudioContext audit while live
  useEffect(() => {
    if (status !== "live" || !raw) return undefined;
    const inputCtx = raw?.input?.context;
    const outputCtx = raw?.output?.context;
    const sample = () => {
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
    };
    sample();
    pushLog(`audit input=${inputCtx?.state}@${inputCtx?.sampleRate}Hz output=${outputCtx?.state}@${outputCtx?.sampleRate}Hz`);
    // Manual resume attempt
    if (inputCtx && inputCtx.state === "suspended") {
      pushLog("⚠ input ctx suspended — calling resume()");
      inputCtx.resume().then(() => {
        pushLog(`✓ input ctx resumed → ${inputCtx.state}`);
        sample();
      }).catch((e) => pushLog(`✗ input resume failed: ${e?.message}`));
    }
    if (outputCtx && outputCtx.state === "suspended") {
      outputCtx.resume().catch(() => {});
    }
    const id = setInterval(sample, 500);
    return () => clearInterval(id);
  }, [status, raw, pushLog]);

  // FFT mic-level meter
  useEffect(() => {
    if (status !== "live") { setMicLevel(0); setVadScore(0); return undefined; }
    const buf = new Uint8Array(1024);
    let raf = 0;
    const tick = () => {
      try {
        const fn = conversation.getInputByteFrequencyData;
        if (typeof fn === "function") {
          fn.call(conversation, buf);
          let sum = 0;
          for (let i = 0; i < 384; i += 1) sum += buf[i];
          setMicLevel(Math.min(1, sum / (384 * 64)));
        }
      } catch { /* noop */ }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, conversation]);

  // Cleanup
  useEffect(() => {
    return () => {
      try {
        const p = conversation.endSession();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch { /* noop */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(async () => {
    if (status === "connecting" || status === "live") return;
    setStatus("connecting");
    setError("");
    setLog([]);
    setAudit(null);
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

  // Inline styles — NO Tailwind, NO custom CSS, no transparent overlays
  const styles = {
    page: {
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "24px",
      maxWidth: "780px",
      margin: "0 auto",
      lineHeight: 1.5,
      color: "#1a1a1a",
      background: "#fff",
      minHeight: "100vh",
    },
    h1: { fontSize: "20px", marginBottom: "8px" },
    h2: { fontSize: "13px", margin: "20px 0 6px 0", color: "#444", letterSpacing: "0.08em", textTransform: "uppercase" },
    btn: {
      fontSize: "15px",
      padding: "12px 24px",
      background: status === "live" ? "#c0392b" : "#1976d2",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      marginRight: "8px",
    },
    bar: (v, color) => ({
      width: `${Math.min(100, Math.round(v * 100))}%`,
      height: "10px",
      background: color,
      transition: "width 80ms linear",
      borderRadius: "2px",
    }),
    barBg: { width: "100%", height: "10px", background: "#eee", borderRadius: "2px", marginBottom: "4px" },
    pre: {
      fontFamily: "ui-monospace, Menlo, monospace",
      fontSize: "11.5px",
      background: "#f7f7f7",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      maxHeight: "260px",
      overflow: "auto",
      whiteSpace: "pre-wrap",
      wordBreak: "break-all",
    },
    info: { fontSize: "13px", color: "#555" },
    err: { color: "#c0392b", fontSize: "13px", marginTop: "8px" },
  };

  return (
    <div style={styles.page} data-testid="test-mic-root">
      <h1 style={styles.h1}>Test Mic — Brutal ElevenLabs diagnostic</h1>
      <p style={styles.info}>
        No custom CSS, no overlays, no focus-stealing div. If voice-to-voice works HERE but
        fails on the styled rooms, the issue lives in our overlay/CSS stack. If it ALSO fails
        here, the issue lives in the browser/profile or upstream ElevenLabs WebSocket.
      </p>

      <div style={{ marginTop: "20px" }}>
        {status === "live" ? (
          <button style={styles.btn} onClick={stop} data-testid="test-mic-stop">
            End session
          </button>
        ) : (
          <button style={styles.btn} onClick={start} disabled={status === "connecting"} data-testid="test-mic-start">
            {status === "connecting" ? "Connecting…" : "Start voice session (Grace)"}
          </button>
        )}
        <span style={{ ...styles.info, marginLeft: "8px" }}>
          Status: <strong>{status}</strong>
        </span>
      </div>

      {error ? <p style={styles.err} data-testid="test-mic-error">⚠ {error}</p> : null}

      <h2 style={styles.h2}>AudioContext audit</h2>
      <pre style={styles.pre} data-testid="test-mic-audit">
        {audit ? JSON.stringify(audit, null, 2) : "(idle — start a session to see live audit)"}
      </pre>

      <h2 style={styles.h2}>Mic (browser FFT)</h2>
      <div style={styles.barBg}>
        <div style={styles.bar(micLevel, "#2e7d32")} data-testid="test-mic-bar" />
      </div>
      <p style={styles.info}>
        {micLevel > 0.05 ? "✓ browser hears your voice" : "speak into the mic"}
      </p>

      <h2 style={styles.h2}>VAD (ElevenLabs server-side)</h2>
      <div style={styles.barBg}>
        <div style={styles.bar(vadScore, "#f57c00")} data-testid="test-mic-vad-bar" />
      </div>
      <p style={styles.info}>
        {vadScore > 0.4
          ? "✓ ElevenLabs hears you clearly"
          : vadScore > 0.1
            ? "faint signal reaching ElevenLabs"
            : "ElevenLabs reports no audio"}
      </p>

      <h2 style={styles.h2}>Event log</h2>
      <pre style={styles.pre} data-testid="test-mic-log">
        {log.length === 0 ? "(no events yet)" : log.join("\n")}
      </pre>

      <p style={{ ...styles.info, marginTop: "20px", fontSize: "12px" }}>
        Open DevTools → Console for the parallel <code>[TestMic]</code> log stream.
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
