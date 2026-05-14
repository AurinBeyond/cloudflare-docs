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
import { ConversationProvider, useConversation } from "@elevenlabs/react";

const BACKEND = process.env.REACT_APP_BACKEND_URL;
const TOKEN_KEY = "aurin_session_token";

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
};

/**
 * Mint a fresh signed URL from our backend.
 * Returns { signed_url } or throws.
 */
async function fetchSignedUrl(room) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (!token) throw new Error("Not signed in");
  if (!BACKEND) throw new Error("Backend URL not configured");
  const res = await fetch(`${BACKEND}/api/clarity/convai/signed-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ room }),
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

function ConvaiPanel({ room, onFallback }) {
  const [status, setStatus] = useState("idle"); // idle | connecting | live | error
  const [errorMsg, setErrorMsg] = useState("");
  const [transcript, setTranscript] = useState([]); // [{role:"user"|"agent", text}]
  const [textInput, setTextInput] = useState("");
  const scrollRef = useRef(null);
  const agentName = ROOM_AGENT_NAME[room] || "the guide";

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

  const conversation = useConversation({
    onConnect: () => {
      setStatus("live");
      setErrorMsg("");
    },
    onDisconnect: () => {
      setStatus("idle");
    },
    onError: (err) => {
      setStatus("error");
      setErrorMsg(
        typeof err === "string"
          ? err
          : err?.message || "Conversation interrupted.",
      );
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
  });

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const start = useCallback(async () => {
    if (status === "connecting" || status === "live") return;
    setStatus("connecting");
    setErrorMsg("");
    try {
      // Mic permission first — required by the SDK before startSession.
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { signed_url: signedUrl } = await fetchSignedUrl(room);
      // §STABILIZATION 2026-02-15 — Using WebSocket transport.
      // WebRTC would shave ~200-400 ms but requires a different
      // auth flow (`conversationToken` from `/v1/convai/conversation/token`
      // — SDK rejects `signedUrl` for WebRTC at the type level).
      // The actual perceived "long pauses + monologue" the founder
      // reports are configured in the ElevenLabs agent UI
      // (Latency optimization, Turn-taking, System Prompt length),
      // not in our transport choice. WebRTC migration is queued as
      // a separate iter once the agent-UI settings are dialled in.
      conversation.startSession({
        signedUrl,
        connectionType: "websocket",
      });
    } catch (err) {
      setStatus("error");
      const detail = err?.message || "Could not connect to the room.";
      setErrorMsg(detail);
    }
  }, [conversation, room, status]);

  const stop = useCallback(() => {
    try {
      conversation.endSession();
    } catch {
      /* noop */
    }
    setStatus("idle");
  }, [conversation]);

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
              ? "Live"
              : isConnecting
                ? "Opening the room…"
                : status === "error"
                  ? "Quiet for now"
                  : "Ready"}
          </span>
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
            {isConnecting ? "Connecting…" : `Speak with ${agentName}`}
          </button>
        )}
      </div>

      {errorMsg ? (
        <div
          data-testid="convai-error"
          className="text-[12.5px] text-[hsl(var(--aurin-text))/0.7] mb-3"
        >
          <p>{errorMsg}</p>
          {/* §STABILIZATION 2026-02-15 — Hard-disable fallback.
              The legacy useVoiceIO + Whisper + Claude pipeline is no
              longer reachable from this surface. If ConvAI fails, the
              wanderer is shown a calm initialization notice and asked
              to refresh — they are NEVER routed into the older,
              hallucinatory STT path. The `onFallback` prop is left in
              place for future controlled re-introduction but is no
              longer wired to a visible CTA. */}
          <p className="mt-2 text-[11.5px] text-[hsl(var(--aurin-text))/0.55]">
            System initializing. Please refresh the page (Ctrl + Shift + R)
            and try again in a moment.
          </p>
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

      <p className="mt-3 text-[11.5px] text-[hsl(var(--aurin-text))/0.45]">
        Voice or text — both reach {agentName} the same way. Microphone
        permission is needed only for voice.
      </p>
    </div>
  );
}

/**
 * Outer component — guards the `room` prop and wraps the panel in the
 * SDK's ConversationProvider. If the prop is malformed, renders
 * nothing rather than risk loading a wrong agent.
 */
export default function RoomConvaiChat({ room = "clarity", onFallback }) {
  if (!ALLOWED_ROOMS.has(room)) return null;
  return (
    <ConversationProvider>
      <ConvaiPanel room={room} onFallback={onFallback} />
    </ConversationProvider>
  );
}
