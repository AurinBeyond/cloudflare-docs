/**
 * RoomConvaiChat — ElevenLabs Conversational AI surface for a single room.
 *
 * §Phase 1 STABILIZATION (2026-02-14)
 *
 * Phase A: only `room="clarity"` is wired in the UI. Backend routing
 *   handles all 4 (clarity|body|parents|courses) but the other 3
 *   stay unmounted until founder confirms Grace is stable.
 *
 * Architecture:
 *   1. Mount asks our backend for a signed wss:// URL via
 *      POST /api/clarity/convai/signed-url {room}
 *      (agent_id + xi-api-key never reach the browser)
 *   2. @elevenlabs/react `useConversation` opens a WebSocket to that
 *      signed URL with the SDK's built-in mic/audio worklet pipeline.
 *   3. Two interaction modes coexist in the same panel:
 *       a) voice (mic captured by SDK, agent speaks back)
 *       b) text input → SDK `sendUserMessage(text)` (agent voices reply)
 *   4. Transcript history captures both user + agent turns.
 *   5. If ANY step fails (network, 401/502/503, mic denied, browser
 *      blocked), we surface a calm "Use the older voice mode" fallback
 *      button that re-mounts the legacy `useVoiceIO` pipeline (handled
 *      by the parent page — we just emit an event).
 *
 * This component does NOT replace `useVoiceIO`; both can coexist on
 * the same page. The parent decides which one is active.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConversationProvider,
  useConversation,
  useConversationInput,
  useRawConversation,
} from "@elevenlabs/react";
// §AUDIT-P2 2026-05-20 — Centralised token storage.
import { getSessionToken } from "@/lib/auth";
import { BACKEND_URL as __BACKEND_URL__ } from "@/lib/backendUrl";

const BACKEND = __BACKEND_URL__;

const ALLOWED_ROOMS = new Set(["clarity", "body", "parents", "courses"]);

// §Phase B (2026-02-15) — room → agent display name mapping. Each
// room's voice surface MUST identify the correct dedicated agent so
// the wanderer never thinks they are talking to Grace inside Body
// Room. This is the ONLY copy-aware piece of the otherwise generic
// component.
const ROOM_AGENT_NAME = {
  clarity: "Grace",
  body: "Kaelan",
  parents: "Sara",
  courses: "Alistair",
  // §AURIN 2026-05-20 — Children's guardian. Single agent across all
  // three age tracks (3-5, 6-8, 9-12). Voice timbre is set on the
  // ElevenLabs side (Hope / cjVigY5qzO86Huf0OWal); we do NOT lock a
  // voice_id override here because the Aurin Dashboard allows the
  // prompt + tts overrides to flow from `AurinsRoomChat` instead.
  aurin: "Aurin",
};

// §FOUNDER 2026-05-22 — Static agent portraits.
// Founder directive: each speaking agent must wear a human face so
// the wanderer feels they are with a real person, not an AI. Portraits
// are displayed ALWAYS (not only during a live call) so the trust
// signal is present from the first moment the room loads. They sit
// BESIDE the chat surface as a separate panel (NOT inside the chat
// bubble area) — a deliberate UX choice to keep voice/text quality
// untouched. Aurin remains symbolic (no human face) because the
// children's room intentionally protects imagination.
//
// §FOUNDER 2026-05-22 (v2) — Founder uploaded new composite portrait
// mockups. For Grace + Alistair we now use those source files. Since
// the source includes a chat mockup on the right side, we use
// object-position to show only the LEFT ~55% of the image — that is
// where the clean portrait sits. Other agents keep the standalone
// portraits already in /assets/portraits/.
const ROOM_AGENT_PORTRAIT = {
  clarity: { src: "/assets/portraits/grace.png", focus: "20% center", crop: "left" },
  body: { src: "/assets/portraits/kaelan.png", focus: "22% center", crop: "left" },
  parents: { src: "/assets/portraits/sara.png", focus: "22% center", crop: "left" },
  courses: { src: "/assets/portraits/alistair.png", focus: "20% center", crop: "left" },
  // aurin: intentionally omitted — children's room is symbolic light, no face.
};

// §FOUNDER 2026-05-22 — Short, NOT-mystical taglines that sit under
// each portrait. Mission: feel supportive so the wanderer can open
// up. No spiritual / religious / esoteric language. Plain English.
const ROOM_AGENT_TAGLINE = {
  clarity: "Listens for the quiet beneath the noise.",
  body: "A steady voice for the body's first signals.",
  parents: "Warmth for the questions parenting brings.",
  courses: "A patient guide through what you study.",
  aurin: "A gentle friend who listens.",
};

// §FOUNDER 2026-05-22 (v2) — "Guide & Keeper" subtitle requested for
// the larger portrait hero card (mockup parity).
const ROOM_AGENT_SUBTITLE = {
  clarity: "Clarity Guide · Light Keeper",
  body: "Soul Guide · Wisdom Keeper",
  parents: "Heart Guide · Soul Confidant",
  courses: "Courage Guide · Truth Keeper",
};

// §ACCESSIBILITY 2026-02-15 — Three-mode toggle (founder directive,
// long-standing request). Each mode controls the SDK + UI behaviour:
//   - voice  : full voice-to-voice. Mic captured, agent speaks back.
//              (TextConversation is NOT used; SDK creates VoiceConversation.)
//   - text   : pure text-to-text. Mic never requested. Agent replies
//              with text only — no audio output. (SDK uses
//              TextConversation when overrides.conversation.textOnly=true.)
//   - hybrid : type-to-voice. Wanderer types; agent speaks the reply
//              aloud. Mic is captured by SDK (VoiceConversation) but
//              we mute it immediately after connect so ambient noise
//              never triggers a turn.
//
// REQUIREMENT — `overrides.conversation.textOnly` must be enabled in
// each agent's Dashboard → Security → Overrides (already enabled via
// API PATCH on 2026-02-15). Without it, the agent ignores the
// override and forces voice mode.
const MODES = [
  { key: "voice",  label: "Voice",  hint: "Speak — the guide speaks back." },
  { key: "text",   label: "Text",   hint: "Type — the guide writes back." },
  { key: "hybrid", label: "Hybrid", hint: "Type — the guide speaks back." },
];

/**
 * Mint a fresh signed URL from our backend.
 * Returns { signed_url } or throws.
 */
async function fetchSignedUrl(room, mode) {
  const token = getSessionToken();
  if (!token) throw new Error("Not signed in");
  if (!BACKEND) throw new Error("Backend URL not configured");
  const res = await fetch(`${BACKEND}/api/clarity/convai/signed-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // §STABILIZATION 2026-05-19 — Send mode so the backend can apply
    // mode-aware cap gating. Text mode is unmetered (acquisition
    // layer); hybrid + voice both consume `presence_seconds_left`.
    body: JSON.stringify({ room, mode: mode || "voice" }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(
      `signed-url failed (${res.status}): ${detail.slice(0, 200)}`,
    );
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// §IDENTITY LOCK 2026-02-15 PM (founder explicit directive after voice
// drift kept recurring). Each room has ONE locked voice_id. Sent as
// `overrides.tts.voice_id` on every startSession so the wanderer
// CAN NEVER again hear Sara speak with a male voice, etc., even if a
// Dashboard PATCH or admin slip changes the voice elsewhere.
//
// The agents' personality, dialogue style, and warmth still live in
// the Dashboard system prompt — code only locks the *voice timbre*.
const ROOM_VOICE_LOCK = {
  clarity: "21m00Tcm4TlvDq8ikWAM",  // Rachel — warm female (Grace)
  parents: "EXAVITQu4vr4xnSDxMaL",  // Bella  — gentle female (Sara)
  body:    "ErXwobaYiN019PkySvjV",  // Antoni — calm male (Kaelan)
  courses: "pNInz6obpgDQGcFmaJgB",  // Adam   — deep male (Alistair)
};

// §STABILIZATION 2026-05-16 PM — Silence-based auto-disconnect REMOVED.
// Founder directive (2026-05-16): sessions may terminate ONLY via
//   - user intent (End button, room/mode change, page navigation),
//   - package/wallet limits,
//   - true technical failure surfaced by the SDK (onError/onDisconnect),
//   - or ElevenLabs server-side turn_timeout (Dashboard-controlled).
// The previous 10s mic-silence kill switch caused ~20s ghost
// disconnects across all 4 rooms (shared component) and violated the
// realtime-continuity requirement. The FFT diagnostic bars below
// remain — they are visual only and do not affect the session.

function ConvaiPanel({ room, onFallback, onStatusChange }) {
  const [status, setStatus] = useState("idle"); // idle | connecting | live | error
  const [errorMsg, setErrorMsg] = useState("");
  // §HARD-LOCK 2026-05-20 PM — separate "no presence balance" UI state
  // so the generic VoiceRecoveryCard ("A small connection issue …")
  // never appears on 402. One calm banner only.
  const [blocked, setBlocked] = useState(false);
  const [transcript, setTranscript] = useState([]); // [{role:"user"|"agent", text}]
  const [textInput, setTextInput] = useState("");
  const [mode, setMode] = useState("voice"); // "voice" | "text" | "hybrid"
  const modeRef = useRef("voice"); // capture mode for onConnect handler
  // §REFUND-FLAG 2026-02-09 — Wall-clock timestamp of last onConnect.
  // Read by onDisconnect to compute session length and decide whether
  // to ping `/api/refund-flag`. Resets to null after each disconnect
  // so an idle tab never accidentally fires the flag.
  const sessionStartedAtRef = useRef(null);
  const scrollRef = useRef(null);
  const agentName = ROOM_AGENT_NAME[room] || "the guide";

  // §STABILIZATION 2026-05-16 PM — Passive status observer.
  // Read-only callback fired on every status / errorMsg change.
  // The audio core remains sealed; this is a one-way emit so the
  // parent (e.g. ClarityRelease) can render the Voice Recovery Card
  // when an unexpected disconnect occurs. Never used to influence
  // the SDK, WebSocket, or audio pipeline.
  //
  // §TEXT-FREE 2026-05-19 — onStatusChange signature now also emits
  // the current `mode` ("voice"|"text"|"hybrid"). Downstream consumers
  // (ConvaiPresenceTracker, VoiceSessionCountdown) use it to skip
  // credit-ledger updates and hide the countdown in text mode.
  useEffect(() => {
    if (typeof onStatusChange === "function") {
      onStatusChange(status, errorMsg, mode);
    }
  }, [status, errorMsg, mode, onStatusChange]);

  // §AUDIT-SCALE 2026-05-20 — Graceful degradation when ElevenLabs is
  // unreachable. If the SDK lands in "error" while the wanderer is in
  // voice (or hybrid) mode, after a brief breath we soft-switch them
  // to text mode so the room keeps speaking through the keyboard.
  // The wanderer can always switch back to voice from the mode-toggle
  // when the upstream returns. This does not throw — only flips a
  // local state and (via onStatusChange) tells the tracker to close
  // any open ledger row.
  const fallbackTimerRef = useRef(null);
  useEffect(() => {
    if (status !== "error" || mode === "text") {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      return undefined;
    }
    // §DEAFNESS-FIX 2026-05-23 — Skip silent fallback for microphone
    // errors. If the wanderer's mic is blocked or missing, flipping
    // them silently to "text" mode hides the actual problem — they
    // see only a "text to voice" badge, type messages, and assume
    // the agent is deaf. The agent is not deaf; their mic was never
    // opened. By keeping `status === "error"` for mic-class errors,
    // the explanatory message ("Microphone is blocked... click the
    // lock icon → Site settings → Microphone → Allow") stays visible
    // until the wanderer fixes it at the OS/browser level. Other
    // transient errors (signed-url, network) still fall back so the
    // room is never fully unusable.
    const lower = (errorMsg || "").toLowerCase();
    const isMicBlocked =
      lower.includes("permission") ||
      lower.includes("denied") ||
      lower.includes("notallowed") ||
      lower.includes("not allowed");
    const isMicMissing =
      lower.includes("notfound") ||
      lower.includes("not found") ||
      lower.includes("device") ||
      lower.includes("no microphone");
    if (isMicBlocked || isMicMissing) {
      // Keep the error visible — do NOT auto-fallback to text.
      return undefined;
    }
    fallbackTimerRef.current = setTimeout(() => {
      modeRef.current = "text";
      setMode("text");
      setStatus("idle");
      setErrorMsg("");
    }, 4500);
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [status, mode, errorMsg]);


  const pushTranscript = useCallback((role, text) => {
    if (!text) return;
    setTranscript((prev) => {
      // Coalesce repeated agent fragments to keep history readable.
      const last = prev[prev.length - 1];
      if (last && last.role === role) {
        const next = prev.slice(0, -1);
        next.push({ role, text: last.text + text });
        return next;
      }
      return [...prev, { role, text }];
    });
  }, []);

  // §ACCESSIBILITY 2026-02-15 — Mic mute control (used only in HYBRID
  // mode, where the wanderer types but the guide replies aloud). The
  // SDK still allocates a mic track because VoiceConversation is used
  // for audio output; muting it ensures no ambient noise reaches the
  // agent's turn detector.
  const { setMuted } = useConversationInput();

  // §VOICE-TO-VOICE DEAFNESS HOTFIX 2026-05-20 — Raw conversation
  // instance grants us read/write access to the SDK's INPUT
  // AudioContext (`rawConversation.input.context`). This is the
  // surgical channel for the long-running "agent hears nothing in
  // voice mode while text-to-voice works fine" bug. Root cause
  // identified after reading @elevenlabs/client/utils/input.js#60:
  //
  //   The SDK calls `await context.resume()` AFTER several async
  //   hops (getUserMedia + loadRawAudioProcessor). On some machines
  //   (notably Chrome on macOS with strict autoplay policy + the
  //   founder's primary profile), the user-gesture token expires
  //   before resume() runs, so the OUTPUT context resumes (because
  //   it's created/touched on the synchronous click path) but the
  //   INPUT context silently stays in `suspended` state. The
  //   AudioWorklet then never processes incoming PCM frames, so the
  //   mic chunks sent over the WebSocket are silence — ElevenLabs
  //   sees a connected client that never speaks. This matches the
  //   exact symptom: text-to-text works, text-to-voice works, only
  //   voice-to-voice fails.
  //
  // We do NOT touch the SDK's mic constraints, format, or worklet.
  // We only inspect AudioContext state on `live` and call
  // `inputCtx.resume()` if it stayed suspended. Belt-and-suspenders
  // over the SDK's own resume call.
  const rawConversation = useRawConversation();

  // §MIC DIAGNOSTIC 2026-02-15 PM — Two independent signals:
  //
  //   micLevel    : local FFT spectrum sum from the browser's own
  //                 mic capture (via SDK getInputByteFrequencyData).
  //                 Tells us "browser hears my voice".
  //
  //   vadScore    : ElevenLabs server-side Voice Activity Detection
  //                 score (0..1) sent over the WebSocket on every
  //                 audio chunk. Tells us "ElevenLabs hears my voice".
  //
  // When the wanderer speaks:
  //   - If micLevel reacts but vadScore stays at 0 → audio is
  //     captured locally but is NOT reaching ElevenLabs (transport /
  //     format problem).
  //   - If both react but agent never replies with a transcript →
  //     ASR language config rejects the speech (e.g. Estonian on an
  //     English-only agent).
  //   - If neither reacts → browser-level mic problem (permission,
  //     wrong default device, hardware mute).
  const [micLevel, setMicLevel] = useState(0);
  const [vadScore, setVadScore] = useState(0);

  // §AUDIO PATH VERIFIED 2026-05-20 — Dev-only confidence signal.
  // Founder requested a single, sticky "✓ Audio Path Verified"
  // indicator that becomes true when BOTH conditions are observed at
  // least once in this session:
  //   1. Input AudioContext.state === "running"
  //   2. Server-side VAD score has crossed 0.1 (i.e. ElevenLabs
  //      acknowledged real audio reaching their endpoint)
  //
  // The indicator only renders when ?dev=1 is in the URL — it must
  // never be visible to a regular wanderer. Once true, it stays
  // true for the lifetime of the session (resets on next start()).
  const [audioInputRunning, setAudioInputRunning] = useState(false);
  const [vadEverHigh, setVadEverHigh] = useState(false);
  const showDev = (() => {
    if (typeof window === "undefined") return false;
    try {
      return new URLSearchParams(window.location.search).get("dev") === "1";
    } catch { return false; }
  })();
  useEffect(() => {
    if (vadScore > 0.1 && !vadEverHigh) setVadEverHigh(true);
  }, [vadScore, vadEverHigh]);
  const audioPathVerified = audioInputRunning && vadEverHigh;

  const conversation = useConversation({
    onConnect: () => {
      // §STABILIZATION 2026-02-17 — Diagnostic log so the wanderer can
      // copy the console output if the agent goes deaf again. Read-only.
      // eslint-disable-next-line no-console
      console.log("[ConvAI]", room, "onConnect — session live");
      setStatus("live");
      setErrorMsg("");
      // §REFUND-FLAG 2026-02-09 — Mark the wall-clock moment the
      // session went live so onDisconnect can compute a duration
      // and ask the backend whether this looks like a paid-session
      // crash worth Anna's manual review.
      sessionStartedAtRef.current = Date.now();
      // §STABILIZATION 2026-02-15 PM — Explicit mute state per mode.
      // VOICE: ensure mic is UNMUTED (the SDK's setMuted state may
      //        persist across sessions; without this an earlier
      //        HYBRID session would leave the next VOICE session
      //        silent and the wanderer's voice would never reach
      //        ElevenLabs — the "deafness" bug).
      // HYBRID: mute so ambient noise never triggers a turn.
      // TEXT: no mic exists; setMuted is a no-op (still safe).
      const m = modeRef.current;
      try {
        if (m === "hybrid") setMuted(true);
        else setMuted(false);
      } catch {
        // SDK not fully attached yet — retry on next microtask.
        queueMicrotask(() => {
          try {
            if (modeRef.current === "hybrid") setMuted(true);
            else setMuted(false);
          } catch { /* noop */ }
        });
      }
    },
    onDisconnect: (details) => {
      // §STABILIZATION 2026-02-17 — Surface disconnect reason so the
      // wanderer can see whether the agent itself ended the call, the
      // server timed out, or a transport error occurred.
      // eslint-disable-next-line no-console
      console.log("[ConvAI]", room, "onDisconnect", details);
      setStatus("idle");

      // §REFUND-FLAG 2026-02-09 — If the session lasted < 30s,
      // signal the backend so Anna can review whether the user is a
      // legitimate refund candidate. Pure telemetry — never
      // auto-refunds. Backend cross-checks against a fresh paid
      // pass before emailing Anna, so silent disconnects on free
      // sessions never spam her inbox.
      try {
        const started = sessionStartedAtRef.current;
        if (started) {
          const duration = (Date.now() - started) / 1000;
          sessionStartedAtRef.current = null;
          if (duration < 30) {
            const reason =
              typeof details === "string"
                ? details
                : (details && (details.reason || details.code)) || "short_session";
            fetch(`${__BACKEND_URL__}/api/refund-flag`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                room,
                duration_seconds: duration,
                reason: String(reason).slice(0, 120),
              }),
              credentials: "include",
            }).catch(() => { /* never bubble */ });
          }
        }
      } catch { /* never bubble */ }
    },
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.warn("[ConvAI]", room, "onError", err);
      setStatus("error");
      // §STABILIZATION 2026-05-16 — Precise error-cause routing.
      // The SDK reports browser mic permission denial via a payload
      // whose `message` contains either "NotAllowedError",
      // "Permission denied", or "permission dismissed". Routing
      // that to a generic "Conversation interrupted" hid the true
      // cause (per-Chrome-profile mic block) and forced the
      // wanderer to guess. We now classify the cause into one of
      // three buckets and let the UI render the right hint.
      const raw =
        typeof err === "string"
          ? err
          : err?.message || err?.error || "Conversation interrupted.";
      setErrorMsg(raw);
    },
    onMessage: (msg) => {
      // The SDK fires onMessage for both sides; payload shape:
      //   { source: "user" | "ai", message: "..." }
      const src = msg?.source;
      const text = msg?.message;
      if (!text) return;
      if (src === "user") pushTranscript("user", text);
      else if (src === "ai") pushTranscript("agent", text);
    },
    // §MIC DIAGNOSTIC 2026-02-15 PM — Server-side VAD score (0..1).
    // ElevenLabs streams this on every audio chunk. If it stays at
    // exactly 0 while the wanderer speaks, audio is not reaching
    // their servers (transport / format / mute problem). If it
    // rises but no `onMessage` with source=user fires, the ASR is
    // rejecting the speech (language / accent mismatch).
    onVadScore: (evt) => {
      const s = evt?.vadScore;
      if (typeof s === "number" && Number.isFinite(s)) {
        setVadScore(s);
      }
    },
  });

  // §VOICE-TO-VOICE DEAFNESS HOTFIX 2026-05-20 — AudioContext audit
  // + auto-resume. Fires on every status flip into `live` (and on
  // rawConversation identity change). Root cause documented above
  // at rawConversation declaration. Three responsibilities:
  //
  //   1. LOG the negotiated state of BOTH AudioContexts (input +
  //      output) so we have ground-truth telemetry in the console.
  //   2. RESUME the input AudioContext if it stayed `suspended`
  //      after the SDK's own resume() call (autoplay-policy race).
  //   3. Re-emit setMuted once contexts are confirmed running, so
  //      any queued worklet message is flushed against a live
  //      audio graph (not against a suspended port).
  useEffect(() => {
    if (status !== "live" || !rawConversation) return undefined;
    const inputCtx = rawConversation?.input?.context;
    const outputCtx = rawConversation?.output?.context;
    // eslint-disable-next-line no-console
    console.log("[ConvAI]", room, "AudioContext audit", {
      mode: modeRef.current,
      input: inputCtx
        ? {
            state: inputCtx.state,
            sampleRate: inputCtx.sampleRate,
            baseLatency: inputCtx.baseLatency,
          }
        : "(no input context — text mode?)",
      output: outputCtx
        ? {
            state: outputCtx.state,
            sampleRate: outputCtx.sampleRate,
            baseLatency: outputCtx.baseLatency,
          }
        : "(no output context)",
    });
    let cancelled = false;
    const resumeIfSuspended = async () => {
      try {
        if (inputCtx && inputCtx.state === "suspended") {
          // eslint-disable-next-line no-console
          console.warn("[ConvAI]", room, "⚠ INPUT AudioContext was suspended — resuming");
          await inputCtx.resume();
          // eslint-disable-next-line no-console
          console.log("[ConvAI]", room, "✓ INPUT AudioContext resumed; state =", inputCtx.state);
        }
        if (outputCtx && outputCtx.state === "suspended") {
          await outputCtx.resume().catch(() => {});
        }
        if (!cancelled && modeRef.current !== "text") {
          try {
            setMuted(modeRef.current === "hybrid");
          } catch { /* SDK detaching — ignore */ }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[ConvAI]", room, "AudioContext resume failed", err);
      }
    };
    resumeIfSuspended();
    // §AUDIO PATH VERIFIED — flip the dev indicator true once the
    // input context is confirmed running. Re-check every 500 ms
    // alongside the suspended-flip guard below so the indicator
    // stays accurate if Chrome ever pushes the ctx back to
    // suspended mid-session.
    const verifyTick = () => {
      if (inputCtx && inputCtx.state === "running") {
        setAudioInputRunning(true);
      } else {
        setAudioInputRunning(false);
      }
    };
    verifyTick();
    // 5-second guard — if Chrome flips the context back to suspended
    // (rare, documented for tab-focus loss mid-handshake), re-resume
    // within 500 ms so the wanderer doesn't have to re-click.
    const guard = setInterval(() => {
      if (cancelled) return;
      verifyTick();
      if (inputCtx && inputCtx.state === "suspended") {
        // eslint-disable-next-line no-console
        console.warn("[ConvAI]", room, "↺ input ctx flipped to suspended — re-resuming");
        inputCtx.resume().catch(() => {});
      }
    }, 500);
    const stop = setTimeout(() => clearInterval(guard), 5000);
    return () => {
      cancelled = true;
      clearInterval(guard);
      clearTimeout(stop);
    };
  }, [status, rawConversation, room, setMuted]);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // §MIC DIAGNOSTIC 2026-02-15 PM — Poll mic input via FFT spectrum.
  // SDK exposes getInputByteFrequencyData(buffer) which fills the
  // buffer with raw FFT magnitudes (Uint8 0..255). We sum the lower
  // half (voice band) and normalise to 0..1. This is independent of
  // the SDK's _isMuted flag — getInputVolume() returns 0 when muted,
  // but FFT data is the actual audio spectrum.
  //
  // §STABILIZATION 2026-05-16 PM — Silence-based auto-disconnect was
  // removed from this loop. The loop now only updates the visual
  // diagnostic bars and never calls endSession() on its own.
  useEffect(() => {
    if (status !== "live") {
      setMicLevel(0);
      setVadScore(0);
      return undefined;
    }
    const fftBuf = new Uint8Array(1024);
    let raf = 0;
    const tick = () => {
      try {
        const fn = conversation.getInputByteFrequencyData;
        if (typeof fn === "function") {
          fn.call(conversation, fftBuf);
          let sum = 0;
          for (let i = 0; i < 384; i += 1) sum += fftBuf[i];
          const v = Math.min(1, sum / (384 * 64));
          setMicLevel(v);
        }
      } catch {
        /* getInputByteFrequencyData may briefly throw during teardown */
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, conversation]);

  // §NUCLEAR KILL SWITCH 2026-02-15 PM — Strict cleanup on room
  // OR mode change. The SDK's endSession() is async and already
  // disconnects the WebSocket, releases the WakeLock, closes the
  // input MediaStream + AudioContext, and closes the output
  // AudioContext (verified in VoiceConversation.js handleEndSession,
  // lines 110-125). We just need to invoke it on every teardown.
  useEffect(() => {
    return () => {
      // endSession() is async but React cleanup is sync. We must
      // not await here — but the SDK's internal queue still
      // completes the teardown reliably before the next session
      // can start, because the next session won't enter `start()`
      // until React mounts the next page.
      try {
        const p = conversation.endSession();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch {
        /* SDK may already be torn down; ignore. */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally
    // only depend on `room`; `conversation` identity is stable per provider.
  }, [room]);

  // §ACCESSIBILITY 2026-02-15 — Mode kill-switch. Changing mode while a
  // session is live MUST end the session — VOICE↔TEXT swap requires
  // a different underlying SDK class (TextConversation vs
  // VoiceConversation) which is decided at startSession time only.
  //
  // §STABILIZATION 2026-02-17 — Guard against the initial-mount fire.
  // React fires this useEffect on every mount even when `mode` hasn't
  // changed from its initial value. In React 18 StrictMode (dev) the
  // effect fires twice on mount, and in some re-render edge cases the
  // earlier endSession() inside this block could clobber a session
  // that was opened a microtask earlier by `start()`. We now only
  // act when the *previous* mode (kept in modeRef) differs from the
  // incoming mode — i.e. a real, user-driven mode toggle.
  useEffect(() => {
    if (modeRef.current === mode) {
      // First mount, or a re-render with the same mode — keep the ref
      // in sync but never tear down a session.
      modeRef.current = mode;
      return;
    }
    modeRef.current = mode;
    if (status === "live" || status === "connecting") {
      try {
        const p = conversation.endSession();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch { /* noop */ }
      setStatus("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we only
    // want this effect to fire on real mode toggles, not on every
    // status change.
  }, [mode]);

  const stop = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch {
      /* SDK may already be torn down; ignore. */
    }
    setStatus("idle");
  }, [conversation]);

  const start = useCallback(async () => {
    if (status === "connecting" || status === "live") return;
    setStatus("connecting");
    setErrorMsg("");
    // §STABILIZATION 2026-02-15 — Reset transcript so stale lines
    // from a previous (now-ended) session never bleed into a fresh
    // conversation. Identity-lock means the agent's first_message
    // will repopulate this within ~1s.
    setTranscript([]);
    setMicLevel(0);
    setVadScore(0);
    // §AUDIO PATH VERIFIED — reset dev indicator for the new session.
    setAudioInputRunning(false);
    setVadEverHigh(false);
    // §STABILIZATION 2026-02-17 — Removed pre-emptive `endSession()` +
    // 220ms wait. Provider.startSession (see @elevenlabs/react
    // ConversationProvider.js line 56-61) ALREADY bails silently if a
    // session is in-flight or active, so the defensive teardown was
    // redundant. Worse: in some renders it set `shouldEndRef=true`
    // milliseconds before our own startSession reset it back to
    // false — a race that, under StrictMode or rapid state updates,
    // could mark the very-next-started session as "stale" and cause
    // the agent to appear connected but never receive audio chunks
    // (the "deaf agent" symptom). The SDK's own teardown chain
    // handles any prior session cleanly when a new one starts.
    try {
      // §HOTFIX 2026-05-18 — RESTORED page-level mic pre-warm.
      // Founder hard-evidence: a stable 4-minute voice call worked
      // on 2026-05-13 morning when this exact line was present.
      // It was removed by a May-15 commit on the (now-disproven)
      // theory that the SDK's own internal getUserMedia is enough.
      //
      // What the SDK actually does (see
      // @elevenlabs/client/VoiceConversation.js#startSession + then
      // @elevenlabs/client/utils/input.js#MediaDeviceInput.create):
      //   1. preliminary `getUserMedia({ audio: true })` — triggers
      //      the permission prompt and obtains a generic stream.
      //   2. immediately calls `MediaDeviceInput.create` which calls
      //      `getUserMedia({ audio: { voiceIsolation: true, ... } })`
      //      to obtain the REAL stream that feeds the worklet.
      // On macOS Sonoma + Chrome (Apple Silicon), if the underlying
      // CoreAudio device hasn't fully opened by the time the
      // voiceIsolation constraint is applied, the stream returns
      // silence — the agent is "live" but never receives audio,
      // i.e. the exact "deaf agent" symptom the founder reported.
      //
      // Pre-warming the device here gives the OS time to fully open
      // the input device before the SDK applies the voiceIsolation
      // constraint. Skipped in TEXT mode (no mic needed).
      if (mode !== "text") {
        try {
          const warmup = await navigator.mediaDevices.getUserMedia({ audio: true });
          // §DIAGNOSTIC 2026-05-19 — Log the device-side sample rate
          // the browser actually negotiated, plus channel count. This
          // tells us in production logs whether the user's hardware
          // gave us 44.1k / 48k stereo / 16k mono so we can debug
          // any future "agent doesn't hear me" reports without
          // guessing. Read-only — does NOT touch the SDK or stream.
          try {
            const track = warmup.getAudioTracks()[0];
            const settings = track?.getSettings?.() || {};
            // eslint-disable-next-line no-console
            console.log("[ConvAI]", room, "mic settings", {
              sampleRate: settings.sampleRate,
              channelCount: settings.channelCount,
              deviceId: settings.deviceId ? "***" : null,
              label: track?.label || "(unlabeled)",
            });
          } catch { /* diagnostics best-effort */ }
          // Release the warmup tracks immediately — the SDK will
          // re-acquire the device with its own constraints. The
          // permission grant and CoreAudio device handle persist
          // across this brief release on every modern browser.
          warmup.getTracks().forEach((t) => t.stop());
        } catch (warmupErr) {
          // Re-throw so the outer catch surfaces the precise
          // browser-mic error to the wanderer (permission denied
          // / device missing — handled by the three-bucket UI).
          throw warmupErr;
        }
      }
      const { signed_url: signedUrl } = await fetchSignedUrl(room, mode);
      // §IDENTITY LOCK 2026-02-15 PM — Force the locked voice_id on
      // every session start. Belt-and-suspenders over the API PATCH
      // already applied to the agent's Dashboard. Founder directive:
      // "Grace = naine. Alistair = mees. Ära puutu enam kunagi."
      const lockedVoiceId = ROOM_VOICE_LOCK[room];
      modeRef.current = mode;
      const isTextMode = mode === "text";
      // eslint-disable-next-line no-console
      console.log("[ConvAI]", room, "startSession", { mode, isTextMode });
      conversation.startSession({
        signedUrl,
        connectionType: "websocket",
        ...(isTextMode ? { textOnly: true } : {}),
        overrides: {
          // §FOUNDER 2026-05-22 — CRITICAL: 100% English product.
          // Earlier comments here mentioned a Finnish-as-Estonian-proxy
          // workaround. That was Agent's solo improvisation, never
          // authorised. Founder has confirmed: the product is and has
          // always been English-only. Any Finnish/Estonian configuration
          // surviving on an agent's Dashboard is a residual from that
          // unauthorised period and MUST be removed at the Dashboard.
          //
          // We add three defensive SDK-side overrides below. Dashboard
          // SECURITY OVERRIDES may silently drop them (Anna's prior
          // setting set agent.language override = false), in which case
          // the Dashboard is the source of truth — but if she enables
          // the override on the new agent SECURITY page, these kick in
          // immediately without redeploy of agent config.
          agent: {
            // Force the agent to speak nothing until the wanderer speaks
            // first. Removes the "ghost voice" that played intros.
            firstMessage: "",
            // Force English in case any agent's Dashboard still carries
            // the Finnish residual. Silently ignored if Dashboard
            // forbids client override.
            language: "en",
          },
          ...(lockedVoiceId
            ? { tts: { voiceId: lockedVoiceId } }
            : {}),
        },
      });
    } catch (err) {
      // §HARD-LOCK 2026-05-20 PM — 402 = no_presence_balance. Detect
      // FIRST and short-circuit BEFORE setStatus("error") so the
      // generic VoiceRecoveryCard ("A small connection issue …")
      // never appears. Show only the calm "Presence Time is empty"
      // banner via the new `blocked` state and silently fall to text.
      if (err?.status === 402 || /\b402\b/.test(err?.message || "")) {
        modeRef.current = "text";
        setMode("text");
        setStatus("idle");
        setBlocked(true);
        setErrorMsg("");
        return;
      }
      setStatus("error");
      const detail = err?.message || "Could not connect to the room.";
      setErrorMsg(detail);
    }
  }, [conversation, mode, room, status]);

  const sendText = useCallback(() => {
    const text = textInput.trim();
    if (!text || status !== "live") return;
    try {
      conversation.sendUserMessage(text);
      pushTranscript("user", text);
      setTextInput("");
    } catch (err) {
      setErrorMsg(err?.message || "Could not send message.");
    }
  }, [conversation, pushTranscript, status, textInput]);

  const isLive = status === "live";
  const isConnecting = status === "connecting";

  return (
    <div
      data-testid="convai-panel"
      data-room={room}
      data-status={status}
      className="rounded-2xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg-elev))/0.55] p-5 sm:p-6 backdrop-blur"
    >
      {blocked ? (
        <div
          data-testid="convai-blocked-card"
          className="mb-4 rounded-2xl border border-amber-400/40 bg-amber-50/[0.04] p-4"
        >
          <p className="aurin-serif text-[15px] text-[hsl(var(--aurin-text))/0.92]">
            Presence Time is empty — voice is paused.
          </p>
          <p className="mt-1 text-[12.5px] text-[hsl(var(--aurin-text))/0.65] leading-relaxed">
            Writing stays free. Top up to open voice again whenever you
            are ready.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href="/pricing"
              data-testid="convai-blocked-topup"
              className="aurin-btn-primary text-[12.5px]"
            >
              Add Presence Time
            </a>
            <button
              type="button"
              data-testid="convai-blocked-dismiss"
              onClick={() => setBlocked(false)}
              className="aurin-btn-ghost text-[12.5px]"
            >
              Continue in text
            </button>
          </div>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span
            data-testid="convai-status-dot"
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              isLive
                ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                : isConnecting
                  ? "bg-amber-400 animate-pulse"
                  : status === "error"
                    ? "bg-rose-400"
                    : "bg-[hsl(var(--aurin-text))/0.25]"
            }`}
          />
          <span
            data-testid="convai-status-label"
            className="aurin-mono text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--aurin-text))/0.6]"
          >
            {isLive
              ? "Listening"
              : isConnecting
                ? "Opening the room…"
                : status === "error"
                  ? "Quiet for now"
                  : "Ready"}
          </span>
          {/* §AUDIO PATH VERIFIED 2026-05-20 — dev-only confidence
              indicator. Appears only when ?dev=1 is in the URL.
              Three states reflect the two-condition audit
              (input ctx running + VAD ever > 0.1):
                • verified (both true) — solid emerald pill
                • partial (one true)   — amber pill
                • idle (none)          — dim grey pill
              Never visible to a regular wanderer. */}
          {showDev && isLive ? (
            <span
              data-testid="convai-audio-path-verified"
              data-verified={audioPathVerified ? "true" : "false"}
              title={`input.running=${audioInputRunning} vadEverHigh=${vadEverHigh}`}
              className={`ml-2 inline-flex items-center gap-1 px-2 py-[2px] rounded-full text-[10px] tracking-[0.18em] uppercase border ${
                audioPathVerified
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                  : audioInputRunning || vadEverHigh
                    ? "bg-amber-500/15 text-amber-300 border-amber-400/40"
                    : "bg-[hsl(var(--aurin-text))/0.06] text-[hsl(var(--aurin-text))/0.5] border-[hsl(var(--aurin-text))/0.15]"
              }`}
            >
              {audioPathVerified
                ? "✓ Audio Path Verified"
                : audioInputRunning
                  ? "ctx ok · awaiting VAD"
                  : vadEverHigh
                    ? "VAD ok · ctx pending"
                    : "auditing…"}
            </span>
          ) : null}
        </div>
        {isLive ? (
          <button
            data-testid="convai-stop-btn"
            onClick={stop}
            className="aurin-btn-ghost text-[12.5px]"
          >
            End
          </button>
        ) : (
          <button
            data-testid="convai-start-btn"
            onClick={start}
            disabled={isConnecting}
            className="aurin-btn-primary text-[13px] disabled:opacity-60"
          >
            {isConnecting
              ? "Connecting…"
              : mode === "text"
                ? `Write to ${agentName}`
                : mode === "hybrid"
                  ? `Write — ${agentName} speaks`
                  : `Speak with ${agentName}`}
          </button>
        )}
      </div>

      {/* §K1 AI DISCLOSURE 2026-02-29 — Builder Contest compliance.
          Quiet, single-line, non-modal. Visible on every keeper room
          so a wanderer is never under any illusion about what is on
          the other side of the conversation. Founder voice retained
          (the keepers are Aurin's keepers, not generic chatbots). */}
      <p
        data-testid="convai-ai-disclosure"
        className="aurin-mono text-[10.5px] tracking-[0.12em] text-[hsl(var(--aurin-text))/0.42] mb-4 leading-[1.55]"
      >
        You are speaking with one of Aurin&apos;s AI keepers.
      </p>

      {/* §ACCESSIBILITY 2026-02-15 — Three-mode toggle. Founder
          directive: explicit communication-mode choice for wanderers
          with hearing or speech needs, for privacy, or simply for
          those who want dialogue over monologue. Disabled while a
          session is live — the wanderer must end the current
          session before switching mode (the SDK uses a different
          underlying class per mode). */}
      <div
        data-testid="convai-mode-toggle"
        role="radiogroup"
        aria-label="Communication mode"
        className="flex items-center gap-1.5 mb-4 p-1 rounded-full bg-[hsl(var(--aurin-bg))/0.5] border border-[hsl(var(--aurin-border-soft))] w-fit"
      >
        {MODES.map((m) => {
          const selected = mode === m.key;
          return (
            <button
              key={m.key}
              data-testid={`convai-mode-${m.key}`}
              role="radio"
              aria-checked={selected}
              type="button"
              onClick={() => setMode(m.key)}
              className={`px-4 py-1.5 rounded-full text-[12px] tracking-[0.06em] transition-colors ${
                selected
                  ? "bg-[hsl(var(--aurin-sage))/0.18] text-[hsl(var(--aurin-text))] border border-[hsl(var(--aurin-sage))/0.45]"
                  : "text-[hsl(var(--aurin-text))/0.55] hover:text-[hsl(var(--aurin-text))/0.85] border border-transparent"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* §MIC DIAGNOSTIC 2026-02-15 PM — Two visible bars while
          VOICE-mode session is live:
            Mic    — your browser's mic spectrum (local capture)
            Heard  — ElevenLabs' server-side VAD score (remote)
          Two bars give the wanderer (and us) an instant, true picture
          of where the audio path is breaking when it breaks. */}
      {status === "live" && mode === "voice" ? (
        <div data-testid="convai-mic-meter" className="mb-4 space-y-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="aurin-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--aurin-text))/0.5]">
                Mic
              </span>
              <span className="aurin-mono text-[10px] text-[hsl(var(--aurin-text))/0.4]">
                {micLevel > 0.04 ? "your voice is reaching the browser" : "speak — I'm listening"}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[hsl(var(--aurin-bg))/0.6] overflow-hidden">
              <div
                data-testid="convai-mic-bar"
                className="h-full bg-[hsl(var(--aurin-sage))/0.85] transition-[width] duration-75"
                style={{ width: `${Math.min(100, Math.round(micLevel * 220))}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="aurin-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--aurin-text))/0.5]">
                Heard
              </span>
              <span className="aurin-mono text-[10px] text-[hsl(var(--aurin-text))/0.4]">
                {vadScore > 0.4
                  ? `${agentName} hears you clearly`
                  : vadScore > 0.1
                    ? `${agentName} hears faint sound`
                    : `${agentName} hears nothing yet`}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[hsl(var(--aurin-bg))/0.6] overflow-hidden">
              <div
                data-testid="convai-vad-bar"
                className="h-full bg-[hsl(var(--aurin-cream))/0.7] transition-[width] duration-100"
                style={{ width: `${Math.min(100, Math.round(vadScore * 100))}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {errorMsg ? (
        <div
          data-testid="convai-error"
          className="text-[12.5px] text-[hsl(var(--aurin-text))/0.7] mb-3"
        >
          {(() => {
            // §STABILIZATION 2026-05-16 — Three failure buckets, each
            // with a precise, actionable instruction so the wanderer
            // never has to guess whether the issue is the browser,
            // the network, the server, or themselves.
            //
            //  1. Mic permission blocked by the Chrome profile.
            //  2. Mic device missing / not selected.
            //  3. Signed-url / SDK / network failure (anything else).
            const lower = (errorMsg || "").toLowerCase();
            const isMicBlocked =
              lower.includes("notallowederror") ||
              lower.includes("permission denied") ||
              lower.includes("permission dismissed") ||
              lower.includes("not allowed");
            const isMicMissing =
              lower.includes("notfounderror") ||
              lower.includes("device not found") ||
              lower.includes("requested device not found");
            const isSignedUrl =
              lower.includes("signed-url failed") ||
              lower.includes("503") ||
              lower.includes("502") ||
              lower.includes("temporarily unavailable");
            if (isMicBlocked) {
              return (
                <p data-testid="convai-error-mic-blocked">
                  Microphone is blocked in this Chrome profile. Click
                  the lock icon (or "Not secure" / tune icon) in the
                  address bar → Site settings → Microphone → Allow,
                  then refresh the page.
                </p>
              );
            }
            if (isMicMissing) {
              return (
                <p data-testid="convai-error-mic-missing">
                  No microphone detected in this browser. Check your
                  system sound input (Settings → System → Sound) and
                  refresh once a microphone is selected.
                </p>
              );
            }
            if (isSignedUrl) {
              return (
                <p data-testid="convai-error-signed-url">
                  The room is taking a moment to wake up. Please try
                  again in a moment. If this keeps happening, refresh
                  the page (Ctrl + Shift + R).
                </p>
              );
            }
            return (
              <>
                <p data-testid="convai-error-generic">{errorMsg}</p>
                <p className="mt-2 text-[11.5px] text-[hsl(var(--aurin-text))/0.55]">
                  System initializing. Please refresh the page
                  (Ctrl + Shift + R) and try again in a moment.
                </p>
              </>
            );
          })()}
          {/* §DEAFNESS-FIX 2026-05-23 — "Try voice again" button.
              For mic-class errors the silent auto-fallback to text
              is now skipped, so the wanderer needs a way to retry
              voice once they've fixed the permission at the browser
              level — without losing their progress to a full page
              refresh. */}
          <button
            type="button"
            data-testid="convai-retry-voice-btn"
            onClick={() => {
              setErrorMsg("");
              setStatus("idle");
              modeRef.current = "voice";
              setMode("voice");
              // small delay so React commits the state reset
              // before we re-attempt start()
              setTimeout(() => { start(); }, 50);
            }}
            className="mt-3 inline-flex items-center gap-2 px-3 h-8 rounded-full border border-[hsl(var(--aurin-border))] text-[12px] text-[hsl(var(--aurin-text))/0.85] hover:text-[hsl(var(--aurin-sage))] hover:border-[hsl(var(--aurin-sage))/0.5] transition-colors"
          >
            Try voice again
          </button>
        </div>
      ) : null}

      {transcript.length > 0 ? (
        <div
          data-testid="convai-transcript"
          ref={scrollRef}
          className="max-h-64 overflow-y-auto rounded-xl bg-[hsl(var(--aurin-bg))/0.5] border border-[hsl(var(--aurin-border-soft))] p-4 mb-4 space-y-3"
        >
          {transcript.map((t, i) => (
            <p
              key={i}
              data-testid={`convai-transcript-${t.role}`}
              className={`text-[14px] leading-relaxed ${
                t.role === "user"
                  ? "text-[hsl(var(--aurin-text))/0.92]"
                  : "text-[hsl(var(--aurin-sage))/0.92] aurin-serif-italic"
              }`}
            >
              {t.text}
            </p>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <input
          data-testid="convai-text-input"
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendText();
            }
          }}
          placeholder={
            isLive
              ? "Or write a line here…"
              : "Open the room to speak or write."
          }
          disabled={!isLive}
          className="flex-1 bg-transparent border border-[hsl(var(--aurin-border-soft))] rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[hsl(var(--aurin-sage))/0.5] disabled:opacity-50"
        />
        <button
          data-testid="convai-send-btn"
          onClick={sendText}
          disabled={!isLive || !textInput.trim()}
          className="aurin-btn-ghost text-[13px] disabled:opacity-40"
        >
          Send
        </button>
      </div>

      <p
        data-testid="convai-mode-hint"
        className="mt-3 text-[11.5px] text-[hsl(var(--aurin-text))/0.45]"
      >
        {MODES.find((m) => m.key === mode)?.hint}
        {mode === "voice"
          ? " Microphone permission is needed."
          : mode === "hybrid"
            ? " Your mic stays muted — only what you type is sent."
            : " No microphone is requested."}
      </p>

      {/* §BRAND-SAFETY 2026-02-09 — Persistent legal/empathic disclaimer
          shown beneath every chat panel. Founder directive: protect
          against future malicious refund claims of the form
          "the AI said something inappropriate". This block makes the
          contract explicit and visible to every wanderer, every
          session, in plain English. The wording is calm so it does
          not feel like a "lawyer's box". */}
      <div
        data-testid="convai-safety-disclaimer"
        className="mt-5 pt-4 border-t border-[hsl(var(--aurin-border-soft))/0.5] text-[11px] leading-relaxed text-[hsl(var(--aurin-text))/0.55] space-y-1.5"
      >
        <p>
          This is a reflective companion — not a doctor, therapist,
          counsellor, legal or financial advisor. Conversations are
          AI-generated and may be imprecise; always use your own
          judgement and seek qualified human help for crises or
          clinical questions.
        </p>
        <p>
          By continuing, you acknowledge the{" "}
          <a
            href="/wanderers-agreement"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted hover:text-[hsl(var(--aurin-sage))]"
          >
            Wanderer&apos;s Agreement
          </a>
          {" "}and our{" "}
          <a
            href="/legal#refund-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted hover:text-[hsl(var(--aurin-sage))]"
          >
            Refund Policy
          </a>
          . If something goes wrong, the kindest path is to{" "}
          <a
            href="/reach-out"
            className="underline decoration-dotted hover:text-[hsl(var(--aurin-sage))]"
          >
            Reach Out
          </a>{" "}
          — we read every note.
        </p>
      </div>
    </div>
  );
}

/**
 * Outer component — guards the `room` prop and wraps the panel in the
 * SDK's ConversationProvider. If the prop is malformed, renders
 * nothing rather than risk loading a wrong agent.
 *
 * §FOUNDER 2026-05-22 — The outer layout now hosts a static portrait
 * panel BESIDE the chat surface (desktop) or above it (mobile). The
 * portrait is rendered as a separate sibling — the inner ConvaiPanel
 * is untouched, so voice/text/billing logic is bit-for-bit unchanged.
 * If a portrait fails to load it hides silently via onError.
 *
 * §FOUNDER 2026-05-22 (v2) — Layout shifted from side-by-side to
 * portrait-on-top (hero card). Founder shared new portrait mockups
 * where the agent's face fills the top half and the chat lives below
 * with the agent's name + "Guide & Keeper" subtitle. ConvaiPanel
 * remains untouched; only the surrounding wrapper changed.
 */
function AgentPortraitPanel({ room }) {
  const name = ROOM_AGENT_NAME[room] || "Mentor";
  const portrait = ROOM_AGENT_PORTRAIT[room];
  const tagline = ROOM_AGENT_TAGLINE[room];
  const subtitle = ROOM_AGENT_SUBTITLE[room];
  if (!portrait) return null;
  // §FOUNDER 2026-05-22 (v4) — DIRECTIVE: portrait on LEFT, chat on
  // RIGHT. NOT full-screen face. The composite source images have the
  // portrait + name on the left ~55% and a chat preview on the right.
  // We render only the left portion via background-image, sized to the
  // card. Founder also asked for a very subtle breathing animation —
  // CSS only, transform: scale, 8s cycle, no JS loops.
  const isComposite = portrait.crop === "left";
  return (
    <aside
      data-testid={`agent-portrait-panel-${room}`}
      className="shrink-0 md:sticky md:top-24 self-start"
    >
      <figure className="relative w-full md:w-[340px] lg:w-[380px] overflow-hidden rounded-3xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg-elev))/0.5] backdrop-blur">
        {isComposite ? (
          <div
            role="img"
            aria-label={`${name} — your guide in this room`}
            data-testid={`agent-portrait-img-${room}`}
            className="relative aurin-breathe h-[440px] md:h-[520px] w-full"
            style={{
              backgroundImage: `url(${portrait.src})`,
              backgroundSize: "182% auto",
              backgroundPosition: "0% 18%",
              backgroundRepeat: "no-repeat",
            }}
          />
        ) : (
          <div className="relative aurin-breathe h-[440px] md:h-[520px] w-full overflow-hidden">
            <img
              src={portrait.src}
              alt={`${name} — your guide in this room`}
              data-testid={`agent-portrait-img-${room}`}
              loading="eager"
              className="h-full w-full object-cover"
              style={{ objectPosition: portrait.focus || "center" }}
              onError={(e) => {
                const fig = e.currentTarget.closest("aside");
                if (fig) fig.style.display = "none";
              }}
            />
          </div>
        )}
        <figcaption className="px-5 py-5 md:px-6 md:py-5 text-center border-t border-[hsl(var(--aurin-border-soft))]">
          <p
            className="aurin-serif text-[24px] md:text-[28px] leading-none text-[hsl(var(--aurin-text))]"
            data-testid={`agent-portrait-name-${room}`}
          >
            {name}
          </p>
          {subtitle ? (
            <p className="mt-2 text-[10.5px] tracking-[0.34em] uppercase text-[hsl(var(--aurin-text-muted))]">
              {subtitle}
            </p>
          ) : null}
          {tagline ? (
            <p className="mt-3 text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.78] aurin-serif-italic">
              {tagline}
            </p>
          ) : null}
        </figcaption>
      </figure>
    </aside>
  );
}

export default function RoomConvaiChat({ room = "clarity", onFallback, onStatusChange }) {
  if (!ALLOWED_ROOMS.has(room)) return null;
  return (
    <ConversationProvider>
      <div className="flex flex-col md:flex-row md:items-start gap-6 lg:gap-8">
        <AgentPortraitPanel room={room} />
        <div className="flex-1 min-w-0">
          <ConvaiPanel room={room} onFallback={onFallback} onStatusChange={onStatusChange} />
        </div>
      </div>
    </ConversationProvider>
  );
}
