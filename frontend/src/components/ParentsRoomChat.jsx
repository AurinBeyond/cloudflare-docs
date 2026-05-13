/**
 * ParentsRoomChat.jsx — Parents' Room live mentor surface (Stage 3.3).
 *
 * Mirror of BodyRoomChat.jsx, tuned to parenting situations. Sends to
 * `/api/parents-room/chat` with the active parenting lens + the
 * currently-selected situation (when one is chosen). Cross-Room memory
 * is loaded server-side automatically.
 *
 * Browser-side history under `aurin_parents_chat_v1`. Voice-IO is
 * shared with the Body Room (same Whisper STT + auto-speak TTS).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Send, RotateCcw, Volume2, VolumeX } from "lucide-react";
import ChatUsageHint from "@/components/ChatUsageHint";
import GuidePresence from "@/components/GuidePresence";
import VoiceStatusRow from "@/components/VoiceStatusRow";
import TypingIndicator from "@/components/TypingIndicator";
import useVoiceIO from "@/hooks/useVoiceIO";

const STORE_KEY = "aurin_parents_chat_v1";
const SESSION_KEY = "aurin_parents_session_v1";
const MAX_TURNS = 30;
const DEFAULT_LENS = "intuitive";

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

export default function ParentsRoomChat({
  user,
  activeLens,
  activeSituation,
}) {
  const [messages, setMessages] = useState(() => readStored());
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [usageKey, setUsageKey] = useState(0);
  const [toneTag, setToneTag] = useState("neutral");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [guideGender, setGuideGender] = useState(undefined);
  const scrollerRef = useRef(null);
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

  useEffect(() => {
    if (!pendingAutoSendRef.current) return;
    if (!input.trim()) return;
    if (sending) return;
    pendingAutoSendRef.current = false;
    handleSend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, sending]);

  // Auto-speak the latest guide reply (mirrors Body Room).
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
        /* noop */
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

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
      const cur = window.localStorage.getItem(SESSION_KEY);
      if (cur) return cur;
      const next = `parents-${Math.random().toString(16).slice(2, 10)}`;
      window.localStorage.setItem(SESSION_KEY, next);
      return next;
    } catch {
      return undefined;
    }
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    if (!user) {
      setError("Sign in to talk with the parents' companion.");
      return;
    }
    setError(null);
    const userTurn = { role: "user", text, at: new Date().toISOString() };
    const next = [...messages, userTurn];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await api.post("/parents-room/chat", {
        message: text,
        history: next.slice(-10).map(({ role, text: t }) => ({ role, text: t })),
        situation: activeSituation || null,
        session_id: sessionId,
        lens: activeLens || DEFAULT_LENS,
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
      <section className="aurin-section-sm" data-testid="parents-room-chat-locked">
        <div className="aurin-container max-w-[680px]">
          <div className="aurin-card p-6 text-center space-y-3">
            <div className="aurin-eyebrow !mb-1">A small companion · for the loud evenings</div>
            <p className="text-[14px] opacity-80">
              Sign in to sit with a quiet parents' companion. The room
              stays open without it; this is just one warm voice that
              answers when an evening has been long.
            </p>
            <a
              href="/portal"
              data-testid="parents-room-chat-signin"
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
    <section className="aurin-section-sm" data-testid="parents-room-chat">
      <div className="aurin-container max-w-[680px]">
        <div className="aurin-card p-6 md:p-7 space-y-4">
          <GuidePresence
            gender={guideGender}
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
            labelOverride="A quiet hand · parents' companion"
            testidPrefix="parents-room-guide"
          />

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="aurin-eyebrow !mb-1">A quiet hand · for the long evenings</div>
              <p className="text-[12.5px] opacity-70 leading-relaxed">
                One sentence at a time. No advice you didn't ask for, no
                judgement. The room stays close to the texture of tonight.
              </p>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                data-testid="parents-room-chat-reset"
                className="text-xs opacity-60 hover:opacity-100 inline-flex items-center gap-1"
                title="Clear this conversation"
              >
                <RotateCcw size={12} /> Clear
              </button>
            )}
          </div>

          {(activeSituation || (activeLens && activeLens !== DEFAULT_LENS)) && (
            <div
              className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--aurin-text-muted))/0.7] flex flex-wrap gap-x-3 gap-y-1"
              data-testid="parents-room-chat-context"
            >
              {activeSituation && (
                <span>situation · {activeSituation.replace("_", " ")}</span>
              )}
              {activeLens && activeLens !== DEFAULT_LENS && (
                <span
                  className="text-[hsl(var(--aurin-sage))]"
                  data-testid="parents-room-chat-active-lens"
                >
                  lens · {activeLens.replace("_", " ")}
                </span>
              )}
            </div>
          )}

          <div
            ref={scrollerRef}
            className="space-y-3 max-h-[340px] overflow-y-auto pr-1"
            data-testid="parents-room-chat-scroller"
          >
            {messages.length === 0 && (
              <p
                className="text-[14px] aurin-serif-italic opacity-70"
                data-testid="parents-room-chat-empty"
              >
                Begin with one short line about the evening — what just
                happened, or what is still humming in the body now.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                data-testid={`parents-room-chat-msg-${m.role}-${i}`}
                className={
                  m.role === "user"
                    ? "text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text))]"
                    : "text-[14.5px] leading-relaxed aurin-serif-italic text-[hsl(var(--aurin-sage))]"
                }
              >
                {m.text}
              </div>
            ))}
            {sending && (
              <TypingIndicator visible testid="parents-room-chat-typing" />
            )}
          </div>

          {error && (
            <div
              className="text-[12.5px] text-[hsl(var(--aurin-warning,0_70%_60%))/0.85]"
              data-testid="parents-room-chat-error"
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
                  : "One short line about tonight…"
              }
              rows={2}
              data-testid="parents-room-chat-input"
              className="flex-1 bg-transparent border border-[hsl(var(--aurin-border))] rounded-md p-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--aurin-sage))]"
            />
            {voice.supportedOut && (
              <button
                type="button"
                onClick={voice.toggleMute}
                aria-label={voice.muted ? "Resume" : "Pause microphone"}
                title={voice.muted ? "Resume" : "Pause"}
                data-testid="parents-room-chat-mute"
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
              data-testid="parents-room-chat-send"
              className="aurin-btn aurin-btn-primary inline-flex items-center gap-1.5 disabled:opacity-40"
            >
              <Send size={13} /> Send
            </button>
          </div>

          {/* §Phase 1 follow-up — shared voice-status component. */}
          <VoiceStatusRow
            voice={voice}
            variant="compact"
            testid="parents-room-voice-status"
          />
          {voice.voiceError && (
            <button
              type="button"
              onClick={voice.dismissVoiceError}
              data-testid="parents-room-chat-voice-error"
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
