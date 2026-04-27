import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthProvider";
import {
  fetchCabinet,
  startCabinet,
  sendCabinetMessage,
  clearCabinet,
} from "@/lib/api";
import { ArrowRight, RotateCcw, Send, Lock } from "lucide-react";

/**
 * Private Cabinet — The Quiet Room.
 *
 * One-to-one reflective space. Login-gated. The "guide" is presented
 * as a quiet mirror, never as AI / chatbot / therapist. Currently
 * uses a rotating set of curated reflective questions; an LLM layer
 * can be wired in later without changing the contract.
 *
 * Flow:
 *   not signed in  → soft entry gate (Sign in)
 *   signed in      → Intro letter + pre-session confirmation
 *   confirmed      → Chat: input → curated reflection
 *   after 3 replies → soft "continue deeper" placeholder
 *                    (payment is intentionally NOT wired today)
 */

const PHASES = {
  GATE: "gate", // sign-in soft gate
  INTRO: "intro", // open letter
  CONFIRM: "confirm", // awareness + responsibility
  CHAT: "chat", // active session
};

export default function PrivateRoom() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState(PHASES.GATE);
  const [confirms, setConfirms] = useState({ a: false, b: false, c: false });
  const [keepThread, setKeepThread] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showContinuation, setShowContinuation] = useState(false);
  const [threadKey, setThreadKey] = useState(null);
  const [error, setError] = useState(null);
  const scroller = useRef(null);

  // Move from GATE → INTRO once user is signed in
  useEffect(() => {
    if (loading) return;
    if (user) setPhase((p) => (p === PHASES.GATE ? PHASES.INTRO : p));
  }, [user, loading]);

  // Pull existing session on mount (only if signed in)
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const data = await fetchCabinet();
        if (!alive || !data.session) return;
        const msgs = (data.session.messages || []).filter((m) => m.role !== "system");
        if (msgs.length > 0) {
          setMessages(msgs);
          setShowContinuation(!!data.show_continuation);
          setThreadKey(data.session.thread_key || null);
          setPhase(PHASES.CHAT);
        }
      } catch {
        /* first-time visit, no session */
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  useEffect(() => {
    if (scroller.current) {
      scroller.current.scrollTop = scroller.current.scrollHeight;
    }
  }, [messages]);

  const allConfirmed = confirms.a && confirms.b && confirms.c;

  const beginSession = async () => {
    try {
      await startCabinet();
      setMessages([]);
      setShowContinuation(false);
      setPhase(PHASES.CHAT);
    } catch {
      setError("Could not open the room. Please try again.");
    }
  };

  const handleSignIn = () => {
    const back = encodeURIComponent("/private-room");
    navigate(`/portal?next=${back}`);
  };

  const handleSend = async (e) => {
    e?.preventDefault?.();
    setError(null);
    const text = input.trim();
    if (!text) return;
    setSending(true);
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    try {
      const res = await sendCabinetMessage(text, keepThread);
      setMessages((m) => [...m, res.guide]);
      setShowContinuation(!!res.show_continuation);
      if (res.thread_key) setThreadKey(res.thread_key);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Something didn't land. Try again in a moment."
      );
    } finally {
      setSending(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Begin a new session? This closes the current thread.")) return;
    await clearCabinet();
    setMessages([]);
    setShowContinuation(false);
    setThreadKey(null);
    setKeepThread(false);
    setConfirms({ a: false, b: false, c: false });
    setPhase(PHASES.INTRO);
  };

  return (
    <div data-testid="page-private-room">
      <PageHeader
        tone="default"
        eyebrow="The Quiet Room"
        title="A private space"
        italicWord="that listens."
        description="A place where you can write the way it actually is. Not to be fixed. Just to hear yourself more clearly."
      />

      {phase === PHASES.GATE && !user && (
        <SoftGate onSignIn={handleSignIn} />
      )}

      {phase === PHASES.INTRO && user && (
        <IntroLetter onContinue={() => setPhase(PHASES.CONFIRM)} />
      )}

      {phase === PHASES.CONFIRM && user && (
        <ConfirmPanel
          confirms={confirms}
          setConfirms={setConfirms}
          allConfirmed={allConfirmed}
          keepThread={keepThread}
          setKeepThread={setKeepThread}
          onBegin={beginSession}
          onBack={() => setPhase(PHASES.INTRO)}
        />
      )}

      {phase === PHASES.CHAT && user && (
        <ChatPanel
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          sending={sending}
          onReset={handleReset}
          showContinuation={showContinuation}
          threadKey={threadKey}
          error={error}
          scrollerRef={scroller}
        />
      )}
    </div>
  );
}

/* ------------------------- Sub-panels ------------------------- */

function SoftGate({ onSignIn }) {
  return (
    <section className="aurin-section-sm" data-testid="cabinet-gate">
      <div className="aurin-container max-w-[560px] text-center space-y-7">
        <div className="w-12 h-12 mx-auto rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))]">
          <Lock size={16} strokeWidth={1.4} />
        </div>
        <p className="aurin-display text-2xl md:text-3xl leading-snug">
          This room is built only{" "}
          <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
            for you.
          </span>
        </p>
        <p className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
          To keep it truly private, please step in for a moment.
        </p>
        <button
          onClick={onSignIn}
          data-testid="cabinet-gate-signin"
          className="aurin-btn aurin-btn-primary"
        >
          Enter <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

const INTRO_PARAS = [
  "These days, everything seems to be there.",
  "People. Contacts. Conversations.",
  "But something important has gone missing.",
  "Time, where someone actually listens.",
  "Or a place where you can speak without filtering yourself.",
  "There are thoughts you don't share. Not because you don't want to — but because you don't trust where they would land.",
  "Some things stay inside. And over time, they don't disappear. They just go quieter.",
  "This is a place where you don't have to hold them anymore.",
  "You won't be interrupted here. You won't be put in a box.",
  "You can speak the way it actually is.",
  "Sometimes it is enough that something is reflected back — without judgement. And from there, something begins to shift. Quietly. Without pressure.",
  "If you feel it, begin.",
];

function IntroLetter({ onContinue }) {
  return (
    <section className="aurin-section-sm" data-testid="cabinet-intro">
      <div className="aurin-container max-w-[640px] space-y-4">
        {INTRO_PARAS.map((p, i) => (
          <p
            key={i}
            data-testid={`cabinet-intro-p-${i}`}
            className="text-[16px] leading-[1.85] text-[hsl(var(--aurin-text))/0.94]"
          >
            {p}
          </p>
        ))}
        <div className="pt-6">
          <button
            onClick={onContinue}
            data-testid="cabinet-intro-begin"
            className="aurin-btn aurin-btn-primary"
          >
            Begin the conversation <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

function ConfirmPanel({
  confirms,
  setConfirms,
  allConfirmed,
  keepThread,
  setKeepThread,
  onBegin,
  onBack,
}) {
  const set = (k) => (e) => setConfirms((c) => ({ ...c, [k]: e.target.checked }));

  return (
    <section className="aurin-section-sm" data-testid="cabinet-confirm">
      <div className="aurin-container max-w-[640px] space-y-7">
        <div className="aurin-card p-7 md:p-8 space-y-6">
          <div>
            <div className="aurin-eyebrow !mb-1">Before beginning</div>
            <p className="text-[15px] leading-relaxed text-[hsl(var(--aurin-text-muted))] whitespace-pre-line">
              Please confirm that you are aware where you are right now, and
              that you are entering this conversation by your own choice.{"\n"}
              {"\n"}
              This space is built for clarity, not for crisis.
            </p>
          </div>
          <div className="space-y-3">
            <CheckLine
              testid="cabinet-confirm-a"
              label="I understand where I am."
              checked={confirms.a}
              onChange={set("a")}
            />
            <CheckLine
              testid="cabinet-confirm-b"
              label="I am here by my own choice."
              checked={confirms.b}
              onChange={set("b")}
            />
            <CheckLine
              testid="cabinet-confirm-c"
              label="I understand this does not replace professional help."
              checked={confirms.c}
              onChange={set("c")}
            />
          </div>
          <div className="aurin-hairline" />
          <div className="space-y-3">
            <p className="text-[13px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
              This is not counselling or therapy. It is a quiet room where you
              can hear yourself more clearly. What you do with what you find
              stays yours.
            </p>
            <p className="text-[12px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
              If you feel you are in crisis or need immediate support, please
              reach out to local emergency services, a doctor, or someone you
              trust.
            </p>
          </div>
          <div className="aurin-hairline" />
          <CheckLine
            testid="cabinet-confirm-thread"
            label="Keep this conversation linked to a private key, so I can return where I left off. (Optional)"
            checked={keepThread}
            onChange={(e) => setKeepThread(e.target.checked)}
            small
          />
          {keepThread && (
            <p className="text-[12px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
              The key is yours alone. It is not used against you and not shared
              without your consent. Stored securely.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBegin}
            disabled={!allConfirmed}
            data-testid="cabinet-confirm-continue"
            className="aurin-btn aurin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue <ArrowRight size={13} />
          </button>
          <button onClick={onBack} className="aurin-btn aurin-btn-ghost" data-testid="cabinet-confirm-back">
            Back
          </button>
        </div>
      </div>
    </section>
  );
}

function CheckLine({ label, checked, onChange, testid, small }) {
  return (
    <label
      data-testid={testid}
      className={`flex items-start gap-3 cursor-pointer select-none leading-relaxed ${
        small ? "text-[12.5px] text-[hsl(var(--aurin-text-muted))]" : "text-[14px] text-[hsl(var(--aurin-text))/0.92]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 accent-[hsl(var(--aurin-sage))]"
      />
      <span>{label}</span>
    </label>
  );
}

function ChatPanel({
  messages,
  input,
  setInput,
  onSend,
  sending,
  onReset,
  showContinuation,
  threadKey,
  error,
  scrollerRef,
}) {
  return (
    <section className="aurin-section-sm" data-testid="cabinet-chat">
      <div className="aurin-container max-w-[760px]">
        <div className="aurin-card p-5 md:p-6 flex flex-col" style={{ minHeight: 480 }}>
          <div
            ref={scrollerRef}
            data-testid="cabinet-messages"
            className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[55vh]"
          >
            {messages.length === 0 && (
              <p className="text-[14px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic">
                Begin when you're ready.
              </p>
            )}
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} text={m.text} index={i} />
            ))}
          </div>

          <form
            onSubmit={onSend}
            className="mt-5 flex items-end gap-3"
            data-testid="cabinet-input-form"
          >
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write here… as it actually is."
              data-testid="cabinet-input"
              disabled={sending || showContinuation}
              className="flex-1 bg-[hsl(var(--aurin-bg))] border border-[hsl(var(--aurin-border-soft))] rounded-xl px-4 py-3 text-[14.5px] leading-relaxed focus:border-[hsl(var(--aurin-sage))] outline-none transition-colors resize-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || showContinuation || !input.trim()}
              data-testid="cabinet-send"
              className="aurin-btn aurin-btn-primary !p-3 disabled:opacity-50"
              aria-label="Send"
            >
              <Send size={16} strokeWidth={1.6} />
            </button>
          </form>

          {error && (
            <p data-testid="cabinet-error" className="mt-3 text-[12.5px] text-red-300/90">
              {error}
            </p>
          )}
        </div>

        {showContinuation && (
          <div data-testid="cabinet-continuation" className="aurin-card p-7 md:p-8 mt-7 flex flex-col md:flex-row md:items-center gap-5">
            <div className="flex-1">
              <div className="aurin-eyebrow !mb-1">A small pause</div>
              <p className="aurin-display text-2xl leading-snug">
                Some conversations{" "}
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                  don't want to stop here.
                </span>
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                If you feel this is touching something real, you can keep going
                from here. The full version opens soon.
              </p>
            </div>
            <button
              type="button"
              disabled
              data-testid="cabinet-continue-deeper"
              title="Opens soon"
              className="aurin-btn aurin-btn-primary opacity-60 cursor-not-allowed shrink-0"
            >
              Continue deeper <ArrowRight size={13} />
            </button>
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-3 text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
          <button
            type="button"
            onClick={onReset}
            data-testid="cabinet-reset"
            className="inline-flex items-center gap-1.5 hover:text-[hsl(var(--aurin-sage))] transition-colors"
          >
            <RotateCcw size={12} /> Begin again
          </button>
          {threadKey && (
            <span data-testid="cabinet-thread-key" className="ml-auto">
              Your key: <code className="text-[hsl(var(--aurin-sage))]">{threadKey}</code>
            </span>
          )}
        </div>

        <p className="mt-4 text-[11.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[60ch]">
          You can leave this conversation at any moment. This is not counselling
          or therapy. If you feel you are in crisis, please reach out to local
          emergency services, a doctor, or someone you trust.
        </p>
      </div>
    </section>
  );
}

function Bubble({ role, text }) {
  const isUser = role === "user";
  return (
    <div
      data-testid={`cabinet-bubble-${role}`}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-[14.5px] leading-[1.7] whitespace-pre-line ${
          isUser
            ? "bg-[hsl(var(--aurin-text))] text-[hsl(var(--aurin-bg))]"
            : "bg-[hsl(var(--aurin-surface))] text-[hsl(var(--aurin-text))/0.94] aurin-serif-italic"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
