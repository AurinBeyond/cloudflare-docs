/**
 * BodyRoomChat.jsx — §G3 Somatic Mentor surface (iter 60).
 *
 * A small, calm chat panel inside the Body Room. Stateless on the
 * server — every turn carries its own short transcript + optional
 * body_context (the region the wanderer paused at, the pattern they
 * just read, their own short note).
 *
 * Browser-side history is kept under `aurin_body_chat_v1` so a return
 * visit on the same device can resume softly. Empty history = empty
 * room.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Send, RotateCcw, Volume2, VolumeX, Headphones } from "lucide-react";
import ChatUsageHint from "@/components/ChatUsageHint";
import GuidePresence from "@/components/GuidePresence";
import VoiceStatusRow from "@/components/VoiceStatusRow";
import TypingIndicator from "@/components/TypingIndicator";
import useVoiceIO from "@/hooks/useVoiceIO";
import { LENS_STORE_KEY, LENS_EVENT, DEFAULT_LENS } from "@/components/BodyLensSelector";
// §AUDIT-P2 2026-05-20 — Centralised token storage.
import { getSessionToken } from "@/lib/auth";
import { BACKEND_URL as __BACKEND_URL__ } from "@/lib/backendUrl";

const STORE_KEY = "aurin_body_chat_v1";
const MAX_TURNS = 30;
const TTS_BACKEND_URL = __BACKEND_URL__ || "";

function readStored() {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStored(arr) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORE_KEY, JSON.stringify(arr.slice(-MAX_TURNS)));
  } catch {
    /* noop */
  }
}

function clearStored() {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORE_KEY);
  } catch {
    /* noop */
  }
}

export default function BodyRoomChat({
  user,
  bodyContext,
  transientContext,
}) {
  const [messages, setMessages] = useState(() => readStored());
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [usageKey, setUsageKey] = useState(0);
  // §Stage 2.9d — active wisdom lens. The default is Intuitive Flow:
  // when nothing is explicitly picked, the mentor still receives a
  // valid lens id and chooses its register live.
  const [activeLens, setActiveLens] = useState(() => {
    try {
      return typeof window !== "undefined"
        ? window.localStorage.getItem(LENS_STORE_KEY) || DEFAULT_LENS
        : DEFAULT_LENS;
    } catch {
      return DEFAULT_LENS;
    }
  });
  useEffect(() => {
    const onChange = (e) => setActiveLens(e?.detail?.id || DEFAULT_LENS);
    window.addEventListener(LENS_EVENT, onChange);
    return () => window.removeEventListener(LENS_EVENT, onChange);
  }, []);
  const scrollerRef = useRef(null);
  // §Stage 2.7 — concierge presence runtime signals.
  const [toneTag, setToneTag] = useState("neutral");
  const [audioPlaying, setAudioPlaying] = useState(false);
  // Pull the user's preferred guide gender from the same place
  // Clarity Release reads it. Best-effort, soft-fail.
  const [guideGender, setGuideGender] = useState(undefined);
  // Voice-first: §Faas 2 — no button, continuous VAD-driven listening.
  const pendingAutoSendRef = useRef(false);
  const voice = useVoiceIO({
    gender: guideGender || "female",
    autoVoice: true,
    onResult: (text) => {
      const trimmed = (text || "").trim();
      if (!trimmed) return;
      setInput(trimmed);
      pendingAutoSendRef.current = true;
    },
  });
  // §Faas 2 — when the VAD loop produced a transcript, auto-fire send
  // without the user having to press a button.
  useEffect(() => {
    if (!pendingAutoSendRef.current) return;
    if (!input.trim()) return;
    if (sending) return;
    pendingAutoSendRef.current = false;
    handleSend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, sending]);

  // Auto-speak the latest guide message (non-crisis, not already spoken).
  const lastSpokenIdRef = useRef(null);
  useEffect(() => {
    if (!voice.supportedOut || voice.muted) return;
    if (!messages || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "guide") return;
    const key = `${messages.length - 1}:${(last.text || "").slice(0, 24)}`;
    if (lastSpokenIdRef.current === key) return;
    lastSpokenIdRef.current = key;
    voice.speak(last.text || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, voice.muted, voice.supportedOut]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await api.get("/clarity/prefs");
        if (alive) setGuideGender(r?.data?.guide_gender || undefined);
      } catch {
        /* anonymous or no prefs yet — leave undefined (neutral portrait) */
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  // Global audio-element listener — any audio playing on the page
  // (e.g. the room's own TTS button) flips the presence into
  // `speaking`. Same pattern as Clarity Release.
  useEffect(() => {
    let active = 0;
    function onPlay() {
      active += 1;
      setAudioPlaying(true);
    }
    function onStop() {
      active = Math.max(0, active - 1);
      if (active === 0) setAudioPlaying(false);
    }
    document.addEventListener("play", onPlay, true);
    document.addEventListener("pause", onStop, true);
    document.addEventListener("ended", onStop, true);
    return () => {
      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("pause", onStop, true);
      document.removeEventListener("ended", onStop, true);
    };
  }, []);

  useEffect(() => {
    writeStored(messages);
  }, [messages]);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const sessionId = useMemo(() => {
    try {
      const k = "aurin_body_session_v1";
      const cur = window.localStorage.getItem(k);
      if (cur) return cur;
      const next = `body-${Math.random().toString(16).slice(2, 10)}`;
      window.localStorage.setItem(k, next);
      return next;
    } catch {
      return undefined;
    }
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    if (!user) {
      setError("Sign in to talk with the somatic companion.");
      return;
    }
    setError(null);
    const userTurn = { role: "user", text, at: new Date().toISOString() };
    const next = [...messages, userTurn];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await api.post("/body-room/chat", {
        message: text,
        history: next.slice(-10).map(({ role, text: t }) => ({ role, text: t })),
        body_context: bodyContext || null,
        transient_context: transientContext || null,
        session_id: sessionId,
        lens: activeLens || null,
      });
      const reply = res?.data?.reply;
      const newToneTag = res?.data?.tone_tag;
      if (newToneTag) setToneTag(newToneTag);
      if (!reply) {
        setError("The room is quiet. Please try again in a moment.");
      } else {
        setMessages((m) => [
          ...m,
          { role: "guide", text: reply, at: new Date().toISOString() },
        ]);
      }
      setUsageKey((k) => k + 1);
    } catch (e) {
      // §W-3 — daily ceiling reached → calm copy, not a generic toast.
      if (e?.response?.status === 429) {
        setError(
          e?.response?.data?.detail ||
            "You have reached the quiet limit for today. The room will reopen tomorrow morning."
        );
        setUsageKey((k) => k + 1);
      } else {
        setError(
          e?.response?.data?.detail ||
            "The room is quiet. Please try again in a moment."
        );
      }
    } finally {
      setSending(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    clearStored();
    setError(null);
  };

  if (!user) {
    return (
      <section
        className="aurin-section-sm"
        data-testid="body-room-chat-locked"
      >
        <div className="aurin-container max-w-[680px]">
          <div className="aurin-card p-6 text-center space-y-3">
            <div className="aurin-eyebrow !mb-1">A second hand at the edge</div>
            <p className="text-[14px] opacity-80">
              Sign in to sit with a brief somatic companion. The Body Room
              stays open without it; this is just a small voice that says
              one quiet thing back.
            </p>
            <a
              href="/portal"
              data-testid="body-room-chat-signin"
              className="aurin-btn aurin-btn-ghost inline-flex"
            >
              Open the portal
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="aurin-section-sm"
      data-testid="body-room-chat"
    >
      <div className="aurin-container max-w-[680px]">
        <div className="aurin-card p-6 md:p-7 space-y-4">
          {/* §Stage 2.7 — compact concierge presence layer for Body Room. */}
          {/* §BUGFIX 2026-05-22 — Pass a sensible default ("male" — Kaelan
              is Body Room's male agent) instead of raw `guideGender`
              which initialises to `undefined`. The undefined leaked into
              the portrait URL → /api/clarity/guide-face/undefined → 404
              in production console. PURE FALLBACK — once the agent
              actually identifies gender, `guideGender` takes over. */}
          <GuidePresence
            gender={guideGender || "male"}
            sending={sending}
            toneTag={toneTag}
            runtimeState={
              sending
                ? "thinking"
                : audioPlaying
                ? "speaking"
                : input.trim().length > 0
                ? "listening"
                : "idle"
            }
            variant="compact"
            mouthOpenRef={voice.mouthOpenRef}
            labelOverride="A quiet hand · somatic companion"
            testidPrefix="body-room-guide"
          />

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="aurin-eyebrow !mb-1">A quiet hand</div>
              <p className="text-[12.5px] opacity-70 leading-relaxed">
                One sentence at a time. The companion stays with the body, not
                the story. If something asks for more space, Clarity Release
                is the deeper room.
              </p>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                data-testid="body-room-chat-reset"
                className="text-xs opacity-60 hover:opacity-100 inline-flex items-center gap-1"
                title="Clear this conversation"
              >
                <RotateCcw size={12} /> Clear
              </button>
            )}
          </div>

          {bodyContext && (bodyContext.region || bodyContext.pattern_label) && (
            <div
              className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--aurin-text-muted))/0.7] flex flex-wrap gap-x-3 gap-y-1"
              data-testid="body-room-chat-context"
            >
              {bodyContext.region && (
                <span>region · {bodyContext.region}</span>
              )}
              {bodyContext.pattern_label && (
                <span>pattern · {bodyContext.pattern_label}</span>
              )}
              {activeLens && activeLens !== DEFAULT_LENS && (
                <span
                  className="text-[hsl(var(--aurin-sage))]"
                  data-testid="body-room-chat-active-lens"
                >
                  lens · {activeLens.replace("_", " ")}
                </span>
              )}
            </div>
          )}
          {(!bodyContext || (!bodyContext.region && !bodyContext.pattern_label)) && activeLens && activeLens !== DEFAULT_LENS && (
            <div
              className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--aurin-sage))]/85"
              data-testid="body-room-chat-active-lens"
            >
              lens · {activeLens.replace("_", " ")}
            </div>
          )}

          <div
            ref={scrollerRef}
            className="space-y-3 max-h-[340px] overflow-y-auto pr-1"
            data-testid="body-room-chat-scroller"
          >
            {messages.length === 0 && (
              <p
                className="text-[14px] aurin-serif-italic opacity-70"
                data-testid="body-room-chat-empty"
              >
                Begin with one short line about where in the body you are
                paused right now.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                data-testid={`body-room-chat-msg-${m.role}-${i}`}
                className={
                  m.role === "user"
                    ? "text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text))]"
                    : "text-[14.5px] leading-relaxed aurin-serif-italic text-[hsl(var(--aurin-sage))]"
                }
              >
                <div>{m.text}</div>
                {m.role === "guide" && m.text ? (
                  <SomaticTtsButton
                    msgIndex={i}
                    text={m.text}
                  />
                ) : null}
              </div>
            ))}
            {sending && (
              <TypingIndicator visible testid="body-room-chat-typing" />
            )}
          </div>

          {error && (
            <div
              className="text-[12.5px] text-[hsl(var(--aurin-warning,0_70%_60%))/0.85]"
              data-testid="body-room-chat-error"
            >
              {error}
            </div>
          )}

          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 1500))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                voice.transcribing
                  ? "Hearing the words…"
                  : voice.listening
                  ? "Listening… speak when you're ready."
                  : "One short line about the body…"
              }
              rows={2}
              data-testid="body-room-chat-input"
              className="flex-1 bg-transparent border border-[hsl(var(--aurin-border))] rounded-md p-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--aurin-sage))]"
            />
            {voice.supportedOut && (
              <button
                type="button"
                onClick={voice.toggleMute}
                aria-label={voice.muted ? "Resume" : "Pause microphone"}
                title={voice.muted ? "Resume" : "Pause"}
                data-testid="body-room-chat-mute"
                className={`aurin-btn aurin-btn-ghost !p-2 ${
                  voice.speaking
                    ? "ring-1 ring-[hsl(var(--aurin-sage))]/70 text-[hsl(var(--aurin-sage))]"
                    : ""
                }`}
              >
                {voice.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            )}
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              data-testid="body-room-chat-send"
              className="aurin-btn aurin-btn-primary inline-flex items-center gap-1.5 disabled:opacity-40"
            >
              <Send size={13} /> Send
            </button>
          </div>
          {/* §Faas 2 — calm voice status (replaces push-to-talk button).
              §Phase 1 follow-up — shared component. */}
          <VoiceStatusRow
            voice={voice}
            variant="compact"
            testid="body-room-voice-status"
          />
          {voice.voiceError && (
            <button
              type="button"
              onClick={voice.dismissVoiceError}
              data-testid="body-room-chat-voice-error"
              className="mt-1 text-[11px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic text-left hover:opacity-80"
            >
              {voice.voiceError} <span className="opacity-60">· tap to dismiss</span>
            </button>
          )}
          <div className="flex justify-end">
            <ChatUsageHint refreshKey={usageKey} />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * SomaticTtsButton — a tiny inline TTS toggle attached to each guide
 * reply. Shares the `/api/clarity/tts` endpoint with Course Room and
 * Clarity Release. Local audio cache per (msgIndex, text) so flipping
 * back to a previous reply does not re-bill the LLM key.
 */
function SomaticTtsButton({ msgIndex, text }) {
  const [state, setState] = useState("idle"); // idle | loading | playing | paused | error
  const audioRef = useRef(null);
  const urlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch { /* noop */ }
        audioRef.current = null;
      }
      if (urlRef.current) {
        try { URL.revokeObjectURL(urlRef.current); } catch { /* noop */ }
        urlRef.current = null;
      }
    };
  }, []);

  const handleClick = async () => {
    if (audioRef.current && (state === "playing" || state === "paused")) {
      if (state === "playing") {
        audioRef.current.pause();
        setState("paused");
      } else {
        audioRef.current.play().catch(() => setState("error"));
        setState("playing");
      }
      return;
    }
    const token = getSessionToken();
    if (!token || !TTS_BACKEND_URL) {
      setState("error");
      return;
    }
    setState("loading");
    try {
      const res = await fetch(`${TTS_BACKEND_URL}/api/clarity/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, gender: "female" }),
      });
      if (!res.ok) {
        setState("error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.onended = () => setState("idle");
      audio.onerror = () => setState("error");
      audioRef.current = audio;
      await audio.play().catch(() => setState("error"));
      setState("playing");
    } catch {
      setState("error");
    }
  };

  const label =
    state === "loading"
      ? "Loading…"
      : state === "playing"
      ? "Pause"
      : state === "paused"
      ? "Resume"
      : state === "error"
      ? "Voice unavailable"
      : "Listen";

  const Icon =
    state === "playing" ? VolumeX : state === "loading" ? Headphones : Volume2;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "loading"}
      data-testid={`body-room-chat-tts-${msgIndex}`}
      className="mt-1 inline-flex items-center gap-1 text-[11.5px] text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-sage))] disabled:opacity-50 transition-colors"
      title={label}
      aria-label={label}
    >
      <Icon size={12} strokeWidth={1.4} />
      <span>{label}</span>
    </button>
  );
}
