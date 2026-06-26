import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import RealtimeCompanion from "@/components/RealtimeCompanion";
import PageHeader from "@/components/layout/PageHeader";
import EmergencyExit from "@/components/EmergencyExit";
// HumanSilhouette removed §Phase 0 House 2026-02-14 — real
// portrait selector now lives in ClarityThreshold.
import MemoryPackageSelect from "@/components/MemoryPackageSelect";
import ChatUsageHint from "@/components/ChatUsageHint";
import { CabinetUpgradeHook } from "@/components/MembershipTiers";
import GuidePresence from "@/components/GuidePresence";
import VoiceStatusRow from "@/components/VoiceStatusRow";
import SessionCalmerPrompt from "@/components/SessionCalmerPrompt";
import TypingIndicator from "@/components/TypingIndicator";
import RoomConvaiChat from "@/components/RoomConvaiChat";
import VoiceSessionCountdown from "@/components/VoiceSessionCountdown";
import ConvaiPresenceTracker from "@/components/ConvaiPresenceTracker";
import CuratorIntroCard, { CURATOR_PALETTES } from "@/components/CuratorIntroCard";
import VoiceTopupSlider from "@/components/VoiceTopupSlider";
import UniversalMinuteBank from "@/components/UniversalMinuteBank";
import TodaysQuestCard from "@/components/TodaysQuestCard";
import GraceModeSelector from "@/components/GraceModeSelector";
import PostSessionMoodReflect from "@/components/PostSessionMoodReflect";
import useVoiceIO from "@/hooks/useVoiceIO";
import { useAuth } from "@/contexts/AuthProvider";
import { buildLemonCheckoutUrl } from "@/lib/lemonsqueezy";
import { LAUNCH_PAUSE } from "@/lib/launchPause";
import LaunchPauseButton from "@/components/LaunchPauseButton";
import {
  fetchCabinet,
  startCabinet,
  sendCabinetMessage,
  clearCabinet,
  fetchCabinetThreads,
  resumeCabinetThread,
  fetchClarityPasses,
  fetchClarityAccess,
  startClaritySession,
  fetchClarityPrefs,
  fetchClarityBetaWindow,
  grantBetaPass,
  updateClarityPrefs,
  api,
} from "@/lib/api";
import {
  ArrowRight,
  RotateCcw,
  Send,
  Lock,
  Shield,
  Ear,
  Eye,
  Wind,
  Sparkles,
  Volume2,
  VolumeX,
  History,
} from "lucide-react";
// §SPRINT-4 — 3-minute first step that sits under the hero.
import FirstActionBlock from "@/components/FirstActionBlock";
import RoomIntroCard from "@/components/RoomIntroCard";
import RoomShell from "@/components/RoomShell";
import GracePanels from "@/components/GracePanels";
import { GRACE_ROOM } from "@/data/roomConfigs";

/**
 * Clarity Release — formerly "Private Room".
 *
 * A private, encrypted-at-rest house. The flow:
 *   not signed in   → soft sign-in gate
 *   signed in       → welcome + Beta notice + 3 tier cards + intro letter
 *   continues       → confirmation panel → chat
 *
 * Each user message is encrypted server-side with AES-256-GCM. Without a
 * paid pass the room offers 3 free reflections (legacy behaviour). With
 * a 30-min, 60-min, or Season pass the room stays open until the timer
 * runs out. The Buy buttons are intentionally disabled on the frontend
 * until the founder hands over the LemonSqueezy variant IDs.
 */

const PHASES = {
  GATE: "gate",
  HUB: "hub", // welcome + tiers + intro CTA
  CONFIRM: "confirm",
  CHAT: "chat",
};

export default function ClarityRelease() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState(PHASES.GATE);
  /* §GRACE-PROMPT-PIPING 2026-02-13 / 2026-06-16 — Sub-room prompts
   * (Write, Evening, Speak) land on /grace/room with ?write=… /
   * ?evening=… / ?speak=… URL params. We (a) auto-open the matching
   * Hearth panel and (b) seed its textarea with the prompt text so
   * the visitor's context is not lost between the curation page and
   * the chat/writing surface. */
  const urlPiping = (() => {
    if (typeof window === "undefined") return { panel: null, seed: "" };
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("write")) return { panel: "write", seed: sp.get("write") };
      if (sp.get("evening")) return { panel: "reflections", seed: sp.get("evening") };
      if (sp.get("speak")) return { panel: "speak", seed: sp.get("speak") };
      return { panel: null, seed: "" };
    } catch {
      return { panel: null, seed: "" };
    }
  })();
  const [hearthPanel, setHearthPanel] = useState(urlPiping.panel);
  const [confirms, setConfirms] = useState({ a: false, b: false, c: false, d: false, e: false });
  const [keepThread, setKeepThread] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(urlPiping.seed);
  const [sending, setSending] = useState(false);
  const [showContinuation, setShowContinuation] = useState(false);
  const [threadKey, setThreadKey] = useState(null);
  const [error, setError] = useState(null);
  // §Phase 1A — concierge presence runtime signals.
  const [toneTag, setToneTag] = useState("neutral");
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Tier catalog + this-user access
  const [passes, setPasses] = useState([]);
  const [betaNote, setBetaNote] = useState("");
  const [access, setAccess] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [guideGender, setGuideGender] = useState(null);
  const [betaWindow, setBetaWindow] = useState({ active: false, end: null });
  const [betaGrantingTier, setBetaGrantingTier] = useState(null);
  const [betaGrantError, setBetaGrantError] = useState(null);

  // §FREE-ACCESS WINDOW (public, no-auth) — global gift period that
  // hides every paywall ($15/$30/$50) for both guests and signed-in
  // visitors. Fetched on mount; the room stays open if the call fails.
  const [freeAccessWindow, setFreeAccessWindow] = useState({ active: false, until: null });

  // §TEXT-FREE 2026-05-19 — Track the live ConvAI mode at this level so
  // VoiceSessionCountdown (above the panel) and ConvaiPresenceTracker
  // (which wraps RoomConvaiChat) share one source of truth. When the
  // wanderer flips to text, the countdown is hidden and the ledger
  // is bypassed. Founder directive: writing is always free.
  const [convaiMode, setConvaiMode] = useState("voice");

  // Past quiet hours (cross-session memory) — sessions the user explicitly
  // opted into keep_thread for. Surfaced on the HUB phase as a soft "resume"
  // panel. Empty list = first-time visitor or user who never enabled keep_thread.
  const [pastThreads, setPastThreads] = useState([]);
  const [resumingThreadId, setResumingThreadId] = useState(null);
  const [usageKey, setUsageKey] = useState(0);
  const [threadsLoaded, setThreadsLoaded] = useState(false);

  const scroller = useRef(null);

  // GATE → HUB once signed in. If signed in but no consent, push to /threshold.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setPhase((p) => (p === PHASES.GATE ? PHASES.GATE : p));
      return;
    }
    let alive = true;
    (async () => {
      try {
        const prefs = await fetchClarityPrefs();
        if (!alive) return;
        if (!prefs?.has_consented) {
          navigate("/clarity-release/threshold", { replace: true });
          return;
        }
        if (prefs?.guide_gender) setGuideGender(prefs.guide_gender);
        // §HYBRID MEMORY (iter 59): Eternal Thread is opt-in, default
        // off. Mirror the user's pref into the toggle state.
        if (prefs && typeof prefs.save_threads === "boolean") {
          setKeepThread(prefs.save_threads);
        } else {
          setKeepThread(false);
        }
        setPhase((p) => (p === PHASES.GATE ? PHASES.HUB : p));
      } catch {
        // If prefs read fails, default to gate the user behind the threshold.
        navigate("/clarity-release/threshold", { replace: true });
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, loading, navigate]);

  // Load tier catalog (always, so signed-out visitors see prices too)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [data, win, freeWin] = await Promise.all([
          fetchClarityPasses(),
          fetchClarityBetaWindow().catch(() => ({ active: false, end: null })),
          api.get("/aurin/free-access").then(r => r.data).catch(() => ({ active: false, until: null })),
        ]);
        if (!alive) return;
        setPasses(data.passes || []);
        setBetaNote(data.beta_note || "");
        setBetaWindow(win || { active: false, end: null });
        setFreeAccessWindow(freeWin || { active: false, until: null });
      } catch {
        /* tier list is decorative — silent fail OK */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Load existing session + this-user access (signed-in only)
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const [me, acc] = await Promise.all([
          fetchCabinet().catch(() => null),
          fetchClarityAccess().catch(() => null),
        ]);
        if (!alive) return;
        if (acc) {
          setAccess(acc);
          setSecondsRemaining(acc.seconds_remaining || 0);
        }
        if (me?.session) {
          const msgs = (me.session.messages || []).filter((m) => m.role !== "system");
          if (msgs.length > 0) {
            setMessages(msgs);
            setShowContinuation(!!me.show_continuation);
            setThreadKey(me.session.thread_key || null);
            setPhase(PHASES.CHAT);
          }
        }
      } catch {
        /* first visit */
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  // Live countdown for paid sessions
  useEffect(() => {
    if (!secondsRemaining || phase !== PHASES.CHAT) return;
    const t = setInterval(() => {
      setSecondsRemaining((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [secondsRemaining, phase]);

  // Load past quiet hours when the user reaches HUB phase. Soft-fail on any
  // error — first-time visitors and users without keep_thread sessions just
  // see no panel.
  useEffect(() => {
    if (phase !== PHASES.HUB || !user || threadsLoaded) return;
    let alive = true;
    (async () => {
      try {
        const data = await fetchCabinetThreads();
        if (!alive) return;
        setPastThreads(data?.threads || []);
      } catch {
        /* silent */
      } finally {
        if (alive) setThreadsLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [phase, user, threadsLoaded]);

  const handleResumeThread = async (thread) => {
    setResumingThreadId(thread.id);
    setError(null);
    try {
      const data = await resumeCabinetThread({ thread_key: thread.thread_key });
      const sess = data?.session;
      if (!sess) {
        setError("That quiet hour could not be resumed.");
        return;
      }
      const msgs = (sess.messages || []).filter((m) => m.role !== "system");
      setMessages(msgs);
      setThreadKey(sess.thread_key || null);
      setKeepThread(true);
      setShowContinuation(false);
      // Refresh access so the countdown reflects any active pass.
      try {
        const acc = await fetchClarityAccess();
        if (acc) {
          setAccess(acc);
          setSecondsRemaining(acc.seconds_remaining || 0);
        }
      } catch {
        /* noop */
      }
      setPhase(PHASES.CHAT);
    } catch (e) {
      setError(
        e?.response?.data?.detail ||
          "That quiet hour could not be resumed right now."
      );
    } finally {
      setResumingThreadId(null);
    }
  };

  useEffect(() => {
    if (scroller.current) {
      scroller.current.scrollTop = scroller.current.scrollHeight;
    }
  }, [messages]);

  const allConfirmed = confirms.a && confirms.b && confirms.c && confirms.d && confirms.e;

  const beginSession = async () => {
    try {
      // Use Clarity-aware start so a queued one-time pass is activated.
      const opened = await startClaritySession().catch(() => null);
      if (!opened) {
        await startCabinet();
      } else if (opened.seconds_remaining) {
        setSecondsRemaining(opened.seconds_remaining);
      }
      let seeded = [];
      try {
        const data = await fetchCabinet();
        if (data?.session) {
          seeded = (data.session.messages || []).filter(
            (m) => m.role !== "system"
          );
          setThreadKey(data.session.thread_key || null);
        }
      } catch {
        /* fall through with empty messages */
      }
      setMessages(seeded);
      setShowContinuation(false);
      setPhase(PHASES.CHAT);
    } catch {
      setError("Could not open the room. Please try again.");
    }
  };

  const handleSignIn = () => {
    const back = encodeURIComponent("/clarity-release");
    navigate(`/portal?next=${back}`);
  };

  // §Stage 2.9 — Guest fast-path: a guest user lands directly in the
  // chat surface instead of dwelling on the HUB welcome card. Runs
  // once per session so a returning guest can still see the HUB if
  // they navigate back manually.
  const guestAutoOpenedRef = useRef(false);
  useEffect(() => {
    if (guestAutoOpenedRef.current) return;
    if (!user || user?.role !== "guest") return;
    if (phase !== PHASES.HUB) return;
    guestAutoOpenedRef.current = true;
    beginSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, phase]);

  // §Phase 1A — global audio-playback detector. Any HTMLAudioElement
  // on the page that starts playing flips the presence into the
  // `speaking` state; pausing or ending returns it. We do not start
  // audio ourselves here (that is opt-in TTS via the existing
  // /api/clarity/tts endpoint, currently button-driven elsewhere).
  // This keeps the runtime state reactive to real voice playback
  // without adding any new credit cost.
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
      // §Phase 1A — surface the concierge presence signal.
      if (res.tone_tag) setToneTag(res.tone_tag);
      setUsageKey((k) => k + 1);
    } catch (err) {
      // §W-3 — daily ceiling reached → surface the calm room-resting copy.
      if (err?.response?.status === 429) {
        setError(
          err?.response?.data?.detail ||
            "You have reached the quiet limit for today. The room will reopen tomorrow morning."
        );
        setUsageKey((k) => k + 1);
      } else {
        setError(
          err?.response?.data?.detail ||
            "Something didn't land. Try again in a moment."
        );
      }
    } finally {
      setSending(false);
    }
  };

  const handleReset = async () => {
    try {
      await clearCabinet();
    } catch {
      /* even if backend errors, return the user to a clean local state */
    }
    setMessages([]);
    setShowContinuation(false);
    setThreadKey(null);
    setKeepThread(false);
    setConfirms({ a: false, b: false, c: false, d: false, e: false });
    setInput("");
    setError(null);
    setPhase(PHASES.HUB);
  };

  return (
    <div data-testid="page-clarity-release" className="house-room relative">
      {/* §ROOM-SHELL 2026-02 — mockup-driven hero layout (sidebar +
          centre hero + right "How it works" panel + curator card).
          Wraps the existing room body as children below. */}
      {/* §GRACE-UX-UNIFY 2026-02-13 — Sidebar items now navigate to
          dedicated Grace sub-routes (/grace, /grace/speak, /grace/write,
          /grace/evening, /grace/messages, /grace/library). The "speak"
          item still opens the in-room voice panel because that is the
          actual chat target for this page. */}
      <RoomShell
        room={GRACE_ROOM}
        onSidebarClick={(item) => {
          if (item.id === "speak") {
            setHearthPanel("speak");
          } else if (item.href && item.href.startsWith("/")) {
            window.location.href = item.href;
          } else {
            setHearthPanel(item.id);
          }
        }}
        onPrimaryCta={() => setHearthPanel("speak")}
      >
        {/* §ROOM-INTRO 2026-02 — five-line "selguse kaart". */}
        <RoomIntroCard roomId="grace" />

        {/* §SPRINT-4 2026-02 — Grace's 3-minute first step. */}
        <FirstActionBlock id="grace" />

      {/* Inner Mirror — founder-supplied illustration of the doorway */}
      <section className="aurin-section-xs" data-testid="clarity-doorway-section">
        <div className="aurin-container max-w-[860px]">
          <figure
            data-testid="clarity-doorway-image"
            className="aurin-card overflow-hidden"
          >
            <img
              src="/assets/illustrations/inner-mirror.jpg"
              alt="A wooden doorway opening onto a quiet inner mirror"
              className="w-full h-auto block"
              loading="eager"
            />
          </figure>
        </div>
      </section>

      {/* §CURATOR-INTRO 2026-05-28 — Grace's pre-recorded 15s hello. */}
      <section className="aurin-section-sm" data-testid="clarity-grace-intro">
        <div className="aurin-container max-w-[760px]">
          <CuratorIntroCard slug="grace" eyebrow="✦ Meet your curator" {...CURATOR_PALETTES.grace} />
        </div>
      </section>

      {phase === PHASES.GATE && !user && <SoftGate onSignIn={handleSignIn} />}

      {phase === PHASES.HUB && user && (
        <>
          <section
            className="aurin-section-sm pt-2"
            data-testid="clarity-memory-disclosure"
          >
            <div className="aurin-container max-w-[640px]">
              <p className="text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))/0.85] aurin-serif-italic">
                The room remembers what you say within one hour. Between
                hours, only the last few sentences from this device come
                back with you — softly, at no cost. To carry mentor's notes
                between every device, activate <em>Eternal Thread</em>{" "}
                before you begin.
              </p>
            </div>
          </section>
          {pastThreads.length > 0 && (
            <PreviousQuietHoursPanel
              threads={pastThreads}
              onResume={handleResumeThread}
              resumingId={resumingThreadId}
            />
          )}
          {/* §GRACE-BOUNDARIES 2026-02-09 — Adult-clarity persona MVP.
              Optional pre-session focus selector. Pure addition. */}
          <section className="aurin-section-sm" data-testid="grace-mode-section">
            <div className="aurin-container max-w-[860px]">
              <GraceModeSelector />
            </div>
          </section>
          {/* §VOICE-MOOD-NLP 2026-02-09 — Phase 2 mood detection.
              Privacy-preserving post-session reflection. */}
          <section className="aurin-section-sm" data-testid="grace-mood-reflect">
            <div className="aurin-container max-w-[860px]">
              <PostSessionMoodReflect room="grace" />
            </div>
          </section>
          <HubPanel
          passes={passes}
          betaNote={betaNote}
          access={access}
          betaWindow={betaWindow}
          betaGrantingTier={betaGrantingTier}
          betaGrantError={betaGrantError}
          onBetaGrant={async (tier) => {
            setBetaGrantError(null);
            setBetaGrantingTier(tier);
            try {
              await grantBetaPass(tier);
              const acc = await fetchClarityAccess();
              setAccess(acc);
            } catch (e) {
              setBetaGrantError(
                e?.response?.data?.detail || "Could not grant a beta pass right now."
              );
            } finally {
              setBetaGrantingTier(null);
            }
          }}
          onContinue={() => setPhase(PHASES.CONFIRM)}
        />
        </>
      )}

      {phase === PHASES.CONFIRM && user && (
        <ConfirmPanel
          confirms={confirms}
          setConfirms={setConfirms}
          allConfirmed={allConfirmed}
          keepThread={keepThread}
          setKeepThread={setKeepThread}
          onBegin={beginSession}
          onBack={() => setPhase(PHASES.HUB)}
        />
      )}

      {phase === PHASES.CHAT && user && (
        <>
          {/* §FOUNDER 2026-05-22 — Static Grace portrait card.
              Shown ABOVE ChatPanel during a live talk so the wanderer
              feels a face is with them. PURE ADDITION: ChatPanel
              receives the exact props it always has — no legacy
              voice/text/billing logic is touched. Hidden if the
              portrait file fails to load (onError → display:none).
              §FOUNDER 2026-05-22 (v4) — DIRECTIVE: portrait card on
              LEFT, chat on RIGHT. The legacy ChatPanel manages all of
              its own width/layout, so the cleanest "additive" move is
              to render the Grace card ABOVE the chat (constrained
              width) — this matches the other 4 rooms' look without
              touching ChatPanel internals or breaking its column.
              Breathing animation uses the existing `.aurin-breathe`
              keyframe (CSS-only, 9s, scale 1→1.012). */}
          <section className="aurin-section-xs">
            <div className="aurin-container max-w-[420px]">
              <figure
                data-testid="clarity-grace-portrait"
                className="relative overflow-hidden rounded-3xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg-elev))/0.5] backdrop-blur"
              >
                <div
                  role="img"
                  aria-label="Grace — your guide"
                  data-testid="clarity-grace-portrait-img"
                  className="relative aurin-breathe h-[440px] md:h-[520px] w-full"
                  style={{
                    backgroundImage: "url(/assets/portraits/grace.png)",
                    backgroundSize: "182% auto",
                    backgroundPosition: "0% 18%",
                    backgroundRepeat: "no-repeat",
                  }}
                />
                <figcaption className="px-5 py-5 md:px-6 md:py-5 text-center border-t border-[hsl(var(--aurin-border-soft))]">
                  <p className="aurin-serif text-[24px] md:text-[28px] leading-none text-[hsl(var(--aurin-text))]">
                    Grace
                  </p>
                  <p className="mt-2 text-[10.5px] tracking-[0.34em] uppercase text-[hsl(var(--aurin-text-muted))]">
                    Clarity Guide · Light Keeper
                  </p>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.78] aurin-serif-italic">
                    Listens for the quiet beneath the noise.
                  </p>
                </figcaption>
              </figure>
            </div>
          </section>
          <ChatPanel
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          sending={sending}
          onReset={handleReset}
          showContinuation={showContinuation}
          freeAccessWindow={freeAccessWindow}
          threadKey={threadKey}
          error={error}
          scrollerRef={scroller}
          access={access}
          secondsRemaining={secondsRemaining}
          guideGender={guideGender}
          usageKey={usageKey}
          toneTag={toneTag}
          audioPlaying={audioPlaying}
          convaiMode={convaiMode}
          setConvaiMode={setConvaiMode}
        />
        </>
      )}

      {/* Emergency Exit — visible on every signed-in surface */}
      {user && <EmergencyExit />}
      </RoomShell>

      {/* §GRACE-PANELS 2026-02 — sidebar items open modal panels */}
      <GracePanels openId={hearthPanel} onClose={() => setHearthPanel(null)} seed={urlPiping.seed} />
    </div>
  );
}

/* ------------------------- Sub-panels ------------------------- */

function SoftGate({ onSignIn }) {
  return (
    <section className="aurin-section-sm" data-testid="clarity-gate">
      <div className="aurin-container max-w-[560px] text-center space-y-6">
        <div className="w-12 h-12 mx-auto rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))]">
          <Lock size={16} strokeWidth={1.4} />
        </div>
        <p className="aurin-display text-2xl md:text-3xl leading-snug">
          A small place that{" "}
          <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
            stays yours.
          </span>
        </p>
        <p className="text-[14.5px] leading-[1.85] text-[hsl(var(--aurin-text-muted))] max-w-[440px] mx-auto">
          What you read, what you write, what you don't say out loud — held in
          one quiet space.
        </p>
        <p className="text-[13.5px] leading-[1.85] text-[hsl(var(--aurin-text-muted))] max-w-[440px] mx-auto">
          There is no right way to be here. Only a place to slow down, notice,
          and return.
          <br />
          <span className="aurin-serif-italic">
            Everything stays where you leave it. Nothing is lost.
          </span>
        </p>
        <button
          onClick={onSignIn}
          data-testid="clarity-gate-signin"
          className="aurin-btn aurin-btn-primary"
        >
          Continue with email <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}

const PURPOSE_BLOCKS = [
  {
    icon: Ear,
    title: "To Listen",
    body: "Some things are easier to write than to say. Here, every word stays inside encrypted walls — only you ever see it again.",
    testid: "clarity-purpose-listen",
  },
  {
    icon: Eye,
    title: "To Clarify",
    body: "When the thought is reflected back, gently, the shape of it changes. What was tangled becomes one quiet thread you can hold.",
    testid: "clarity-purpose-clarify",
  },
  {
    icon: Wind,
    title: "To Release",
    body: "What no longer fits does not have to be carried. A small practice, a long breath — the body remembers what to set down.",
    testid: "clarity-purpose-release",
  },
];

function HubPanel({
  passes,
  betaNote,
  access,
  betaWindow,
  betaGrantingTier,
  betaGrantError,
  onBetaGrant,
  onContinue,
  freeAccessWindow,
}) {
  // §FREE-ACCESS WINDOW — global gift period. Honour either the
  // signed-in personal flag OR the public global window so guests
  // also see no paywall while the room is in gift mode.
  const giftActive = !!(access?.free_access || freeAccessWindow?.active);
  const giftUntil = access?.expires_at || freeAccessWindow?.until || null;
  const betaActive = !!(betaWindow && betaWindow.active);
  const betaEnds = formatBetaEnd(betaWindow && betaWindow.end);
  const alreadyHasPass = !!(access && access.has_active_pass);
  return (
    <section className="aurin-section-sm" data-testid="clarity-hub">
      <div className="aurin-container max-w-[860px] space-y-10">
        {/* Beta notice */}
        {betaNote && (
          <div
            data-testid="clarity-beta-notice"
            className="aurin-card p-5 md:p-6 flex items-start gap-4 border-[hsl(var(--aurin-sage))/0.4]"
          >
            <Sparkles size={18} className="text-[hsl(var(--aurin-sage))] mt-1 shrink-0" />
            <div>
              <div className="aurin-eyebrow !mb-1">Beta</div>
              <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text))/0.92]">
                {betaNote}
              </p>
            </div>
          </div>
        )}

        {/* Beta free-window banner (only while the gift window is open) */}
        {betaActive && !alreadyHasPass && (
          <div
            data-testid="clarity-beta-window"
            className="aurin-card p-5 md:p-6 flex items-start gap-4 border-[hsl(var(--aurin-sage))/0.5]"
          >
            <Shield size={18} className="text-[hsl(var(--aurin-sage))] mt-1 shrink-0" />
            <div>
              <div className="aurin-eyebrow !mb-1">A quiet gift</div>
              <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text))/0.92]">
                Passes are free to activate during this testing window
                {betaEnds ? (
                  <>
                    , until{" "}
                    <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                      {betaEnds}
                    </span>
                  </>
                ) : null}
                . Choose the depth that feels right — one tier is enough.
              </p>
            </div>
          </div>
        )}
        {betaGrantError && (
          <div
            data-testid="clarity-beta-grant-error"
            className="aurin-card p-4 border-[hsl(var(--aurin-rose))/0.5] text-[13px] text-[hsl(var(--aurin-text))/0.92]"
          >
            {betaGrantError}
          </div>
        )}

        {/* Purpose grid — Listen / Clarify / Release */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PURPOSE_BLOCKS.map((b) => (
            <div
              key={b.testid}
              data-testid={b.testid}
              className="aurin-card p-6 space-y-3"
            >
              <div className="w-10 h-10 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))]">
                <b.icon size={16} strokeWidth={1.5} />
              </div>
              <h3 className="aurin-display text-[19px] leading-tight">
                {b.title}
              </h3>
              <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                {b.body}
              </p>
            </div>
          ))}
        </div>

        {/* User access state */}
        {giftActive && (
          <div
            data-testid="clarity-free-access"
            className="aurin-card p-5 flex items-center gap-3"
          >
            <Shield size={16} className="text-[hsl(var(--aurin-sage))]" />
            <p className="text-[13.5px] text-[hsl(var(--aurin-text))/0.92]">
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                Your gift:
              </span>{" "}
              free access to every room until{" "}
              <span className="font-medium">
                {giftUntil
                  ? new Date(giftUntil).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "the opening date"}
              </span>
              . Walk slowly. There is no payment to make today.
            </p>
          </div>
        )}
        {access?.has_active_pass && !giftActive && (
          <div
            data-testid="clarity-active-pass"
            className="aurin-card p-5 flex items-center gap-3"
          >
            <Shield size={16} className="text-[hsl(var(--aurin-sage))]" />
            <p className="text-[13.5px] text-[hsl(var(--aurin-text))/0.92]">
              You have an active pass:{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                {access.tier === "season_30days"
                  ? "Full Access"
                  : access.tier === "60min"
                  ? "60-Minute Release"
                  : "30-Minute Release"}
              </span>
              .
            </p>
          </div>
        )}

        {/* §VARIANT-C 2026-02-09 — Pricing tiers as a compact list,
            not a 3-up grid of large cards. Founder directive: less
            "paywall feeling", more "quiet menu". Each row is a single
            line of warm copy + price + a small action button. Same
            data, same testids, same LemonSqueezy checkout path —
            only the visual layout changed. */}
        {!giftActive && (
          <div data-testid="clarity-tiers" className="space-y-3">
            <div className="aurin-eyebrow">Choose a depth</div>
            <div className="rounded-2xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg-elev))/0.35] overflow-hidden">
              {passes.map((p, i) => (
                <TierRow
                  key={p.tier}
                  pass={p}
                  isLast={i === passes.length - 1}
                  betaActive={betaActive}
                  alreadyHasPass={alreadyHasPass}
                  betaGrantingTier={betaGrantingTier}
                  onBetaGrant={onBetaGrant}
                />
              ))}
            </div>
            <p
              data-testid="clarity-tiers-footnote"
              className="text-[11.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] pt-1"
            >
              No subscription is required for the first two options. Cancel any time on the Season Pass.
            </p>
          </div>
        )}

        {/* Continue into intro / chat */}
        <div className="pt-6 flex flex-col items-start gap-3">
          <button
            onClick={onContinue}
            data-testid="clarity-hub-continue"
            className="aurin-btn aurin-btn-primary"
          >
            Continue into the room <ArrowRight size={14} />
          </button>
          <p className="text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
            Without a pass, the room offers a few quiet reflections so you can
            feel the space before deciding.
          </p>
        </div>

        {/* §UNIVERSAL-BANK + §TODAYS-QUEST 2026-02-09 — Soft entry
            point for hesitant visitors + Aurin's quest of the day.
            Both surface above the tier ladder. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
          <UniversalMinuteBank />
          <TodaysQuestCard />
        </div>

        {/* §CUSTOM-TOPUP 2026-02-09 — Flexible voice top-up. Lives
            beneath the fixed tier ladder so visitors who want a
            non-standard minute count have a clean path. */}
        <div className="mt-12 max-w-xl mx-auto" data-testid="clarity-hub-topup-section">
          <p className="aurin-eyebrow text-center mb-3">Or choose your own volume of presence</p>
          <VoiceTopupSlider />
        </div>
      </div>
    </section>
  );
}

function formatBetaEnd(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

function TierRow({ pass, isLast, betaActive, alreadyHasPass, betaGrantingTier, onBetaGrant }) {
  const isSub = pass.is_subscription;
  const betaEligible = betaActive && !alreadyHasPass;
  const thisBusy = betaGrantingTier === pass.tier;
  const checkoutUrl = !betaEligible ? buildLemonCheckoutUrl(pass.lemonsqueezy_variant_id) : null;
  return (
    <div
      data-testid={`clarity-tier-${pass.tier}`}
      className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 px-5 py-4 ${
        isLast ? "" : "border-b border-[hsl(var(--aurin-border-soft))]"
      } transition-colors hover:bg-[hsl(var(--aurin-bg-elev))/0.55]`}
    >
      {/* Left: title + blurb. Compact, single-line on desktop. */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3
            className="aurin-serif text-[16px] leading-tight text-[hsl(var(--aurin-text))]"
            data-testid={`clarity-tier-${pass.tier}-label`}
          >
            {pass.label}
          </h3>
          {isSub ? (
            <span className="text-[10px] tracking-[0.18em] uppercase text-[hsl(var(--aurin-sage))/0.85] border border-[hsl(var(--aurin-sage))/0.35] rounded-full px-2 py-[1px]">
              Monthly
            </span>
          ) : null}
        </div>
        <p
          data-testid={`clarity-tier-${pass.tier}-blurb`}
          className="mt-1 text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]"
        >
          {pass.blurb}
        </p>
      </div>

      {/* Right: price + action. Stays right-aligned on desktop. */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          {betaEligible ? (
            <>
              <div
                data-testid={`clarity-tier-${pass.tier}-price-beta`}
                className="aurin-display text-[20px] text-[hsl(var(--aurin-sage))] leading-none"
              >
                Free
              </div>
              <div className="text-[10.5px] line-through text-[hsl(var(--aurin-text-muted))] mt-0.5">
                ${pass.price}
              </div>
            </>
          ) : (
            <>
              <div className="aurin-display text-[20px] leading-none">
                ${pass.price}
              </div>
              <div className="text-[10.5px] text-[hsl(var(--aurin-text-muted))] mt-0.5">
                {pass.currency}
                {isSub ? " / 30 days" : ""}
              </div>
            </>
          )}
        </div>
        {betaEligible ? (
          <button
            type="button"
            disabled={thisBusy || !!betaGrantingTier}
            onClick={() => onBetaGrant && onBetaGrant(pass.tier)}
            data-testid={`clarity-tier-${pass.tier}-beta-activate`}
            className="aurin-btn aurin-btn-ghost text-[12px] px-3 py-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {thisBusy ? "Opening…" : "Activate"}
          </button>
        ) : checkoutUrl ? (
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`clarity-tier-${pass.tier}-buy`}
            className="aurin-btn aurin-btn-ghost text-[12px] px-3 py-1.5 inline-flex items-center gap-1"
          >
            Continue <ArrowRight size={12} />
          </a>
        ) : (
          <a
            href="/catalogue#7-days-of-clarity"
            data-testid={`clarity-tier-${pass.tier}-buy`}
            className="aurin-btn aurin-btn-ghost text-[12px] px-3 py-1.5 inline-flex items-center gap-1"
          >
            Waitlist <ArrowRight size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

// §VARIANT-C 2026-02-09 — Old TierCard kept for any external import
// that may still reference it; not used in render. Safe to remove
// once we confirm nothing else points at it.
// eslint-disable-next-line no-unused-vars
function TierCard({ pass, betaActive, alreadyHasPass, betaGrantingTier, onBetaGrant }) {
  const isSub = pass.is_subscription;
  const betaEligible = betaActive && !alreadyHasPass;
  const thisBusy = betaGrantingTier === pass.tier;
  return (
    <div
      data-testid={`clarity-tier-${pass.tier}`}
      className="aurin-card p-6 space-y-4 flex flex-col"
    >
      <div className="space-y-1">
        <div className="aurin-eyebrow !mb-0">
          {isSub ? "Subscription" : "One-time"}
        </div>
        <h3 className="aurin-display text-[20px] leading-tight">{pass.label}</h3>
      </div>
      <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] flex-1">
        {pass.blurb}
      </p>
      <div className="flex items-baseline gap-1.5">
        {betaEligible ? (
          <span
            data-testid={`clarity-tier-${pass.tier}-price-beta`}
            className="aurin-display text-[28px] text-[hsl(var(--aurin-sage))]"
          >
            Free
          </span>
        ) : (
          <>
            <span className="aurin-display text-[28px]">${pass.price}</span>
            <span className="text-[12px] text-[hsl(var(--aurin-text-muted))]">
              {pass.currency}
              {isSub ? " / 30 days" : ""}
            </span>
          </>
        )}
        {betaEligible && (
          <span className="ml-2 text-[11.5px] line-through text-[hsl(var(--aurin-text-muted))]">
            ${pass.price} {pass.currency}
          </span>
        )}
      </div>
      {betaEligible ? (
        <button
          type="button"
          disabled={thisBusy || !!betaGrantingTier}
          onClick={() => onBetaGrant && onBetaGrant(pass.tier)}
          data-testid={`clarity-tier-${pass.tier}-beta-activate`}
          className="aurin-btn aurin-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {thisBusy ? "Opening…" : "Activate free pass"}{" "}
          <ArrowRight size={13} />
        </button>
      ) : (
        (() => {
          const checkoutUrl = buildLemonCheckoutUrl(pass.lemonsqueezy_variant_id);
          if (checkoutUrl) {
            if (LAUNCH_PAUSE) {
              return (
                <LaunchPauseButton
                  testid={`clarity-tier-${pass.tier}-buy`}
                  label="Doors open soon"
                  hideSubtext
                  size="sm"
                />
              );
            }
            return (
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`clarity-tier-${pass.tier}-buy`}
                className="aurin-btn aurin-btn-primary"
              >
                Continue <ArrowRight size={13} />
              </a>
            );
          }
          return (
            <a
              href="/catalogue#7-days-of-clarity"
              data-testid={`clarity-tier-${pass.tier}-buy`}
              className="aurin-btn aurin-btn-primary"
            >
              Join the waitlist <ArrowRight size={13} />
            </a>
          );
        })()
      )}
    </div>
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
    <section className="aurin-section-sm" data-testid="clarity-confirm">
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
              testid="clarity-confirm-a"
              label="I understand where I am."
              checked={confirms.a}
              onChange={set("a")}
            />
            <CheckLine
              testid="clarity-confirm-b"
              label="I am here by my own choice."
              checked={confirms.b}
              onChange={set("b")}
            />
            <CheckLine
              testid="clarity-confirm-c"
              label="I understand this is not medical care and does not replace a licensed practitioner."
              checked={confirms.c}
              onChange={set("c")}
            />
            <CheckLine
              testid="clarity-confirm-d"
              label="I confirm I am not currently under psychiatric care and do not carry a psychiatric diagnosis. (If you do, please use a licensed practitioner instead — this space is not for you.)"
              checked={confirms.d}
              onChange={set("d")}
            />
            <CheckLine
              testid="clarity-confirm-e"
              label="I take full personal responsibility for what I share here and for how I use what I find. This room is a tool — the choices are mine."
              checked={confirms.e}
              onChange={set("e")}
            />
          </div>
          <div className="aurin-hairline" />
          <div className="space-y-3">
            <p className="text-[13px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
              This is a self-development and inner-balance space — a quiet
              room where you can hear yourself more clearly. It is not a
              medical service, not counselling, and not therapy. What you
              find here stays yours.
            </p>
            <p className="text-[12px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
              If you feel you are in crisis or need immediate support,
              please reach out to local emergency services, a licensed
              practitioner, or someone you trust.
            </p>
          </div>
          <div className="aurin-hairline" />
          <MemoryPackageSelect
            value={keepThread}
            onChange={(v) => {
              const prev = keepThread;
              setKeepThread(v);
              return updateClarityPrefs({ save_threads: v }).catch(() => {
                // Roll back UI state if the server didn't accept the change.
                setKeepThread(prev);
              });
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBegin}
            disabled={!allConfirmed}
            data-testid="clarity-confirm-continue"
            className="aurin-btn aurin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue <ArrowRight size={13} />
          </button>
          <button
            onClick={onBack}
            className="aurin-btn aurin-btn-ghost"
            data-testid="clarity-confirm-back"
          >
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
        small
          ? "text-[12.5px] text-[hsl(var(--aurin-text-muted))]"
          : "text-[14px] text-[hsl(var(--aurin-text))/0.92]"
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
  access,
  secondsRemaining,
  guideGender,
  usageKey,
  toneTag,
  audioPlaying,
  convaiMode,
  setConvaiMode,
}) {
  const pendingAutoSendRef = useRef(false);
  // §Phase 1 STABILIZATION (2026-02-14) — ConvAI live-dialogue panel.
  // Grace runs through ElevenLabs Conversational AI. If anything fails
  // (or the wanderer prefers the older mode), `convaiActive` flips
  // false and the existing useVoiceIO + /api/cabinet/message pipeline
  // below stays as a complete, untouched fallback.
  const [convaiActive, setConvaiActive] = useState(true);
  // §STABILIZATION 2026-05-16 — GHOSTING ROOT-CAUSE FIX.
  // The legacy useVoiceIO hook ran with `autoVoice: true` even when
  // ConvAI was the active surface. That left a parallel mic-VAD loop
  // AND an auto-speak useEffect alive — every guide message that
  // arrived through the legacy /api/cabinet/message pipeline was
  // played aloud through the LEGACY TTS endpoint (ElevenLabs TTS,
  // not the ConvAI WebSocket), producing the "second female voice"
  // the founder heard on Private Room. The fix is surgical:
  //   - autoVoice is gated to !convaiActive so VAD never starts
  //     listening while ConvAI owns the mic.
  //   - the auto-send and auto-speak useEffects short-circuit when
  //     convaiActive is true.
  // Nothing about prompts, personas, voices, agent_ids, Dashboard,
  // architecture, or room content is touched.
  const voice = useVoiceIO({
    gender: guideGender || "female",
    autoVoice: !convaiActive,        // §STABILIZATION 2026-05-16 — no parallel mic while ConvAI is live
    onResult: (text) => {
      const trimmed = (text || "").trim();
      if (!trimmed) return;
      setInput(trimmed);
      pendingAutoSendRef.current = true;
    },
  });

  // §Faas 2 — when the VAD loop produced a transcript, auto-fire onSend
  // without the user having to press a button.
  useEffect(() => {
    if (convaiActive) return;        // §STABILIZATION 2026-05-16 — never auto-send while ConvAI is live
    if (!pendingAutoSendRef.current) return;
    if (!input.trim()) return;
    if (sending || showContinuation) return;
    pendingAutoSendRef.current = false;
    onSend({ preventDefault: () => {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, sending, showContinuation, convaiActive]);

  // Auto-speak the latest guide message (non-crisis, not already spoken).
  const lastSpokenIdRef = useRef(null);
  useEffect(() => {
    if (convaiActive) return;        // §STABILIZATION 2026-05-16 — GHOSTING fix: never speak via legacy TTS while ConvAI is live
    if (!voice.supportedOut || voice.muted) return;
    if (!messages || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "guide") return;
    const key = last.id || `${messages.length - 1}:${(last.text || "").slice(0, 24)}`;
    if (lastSpokenIdRef.current === key) return;
    lastSpokenIdRef.current = key;
    voice.speak(last.text || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, voice.muted, voice.supportedOut, convaiActive]);

  const showTimer =
    access?.has_active_pass &&
    access?.tier !== "season_30days" &&
    secondsRemaining > 0;
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;

  return (
    <section className="aurin-section-sm" data-testid="clarity-chat">
      <div className="aurin-container max-w-[760px]">
        {/* Encryption badge + optional timer */}
        <div className="mb-4 flex flex-wrap items-center gap-3 text-[12px] text-[hsl(var(--aurin-text-muted))]">
          <span
            data-testid="clarity-encryption-badge"
            className="inline-flex items-center gap-1.5"
          >
            <Shield size={12} className="text-[hsl(var(--aurin-sage))]" />
            Encrypted at rest · AES-256
          </span>
          {showTimer && (
            <span
              data-testid="clarity-timer"
              className="ml-auto inline-flex items-center gap-1.5"
            >
              Time remaining:{" "}
              <code className="text-[hsl(var(--aurin-sage))]">
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </code>
            </span>
          )}
          {access?.tier === "season_30days" && (
            <span
              data-testid="clarity-season-active"
              className="ml-auto text-[hsl(var(--aurin-sage))]"
            >
              Season pass active
            </span>
          )}
        </div>

        {/* §FOUNDER 2026-05-22 — Removed legacy circular GuideHologram
            (the small "GUIDE PRESENCE · GRACE" avatar). The new full
            portrait card lower in this same PHASES.CHAT block is the
            canonical Grace presence now. Old hologram looked stale
            beside the new portrait. ChatPanel + ConvAI + voice engine
            untouched.
            -- Removed block --
            <GuideHologram gender={...} variant="call" ... />
        */}

        {/* §Phase 1 STABILIZATION (2026-02-14) — Grace via ElevenLabs
            Conversational AI. Mounted ONLY in Private Room (room="clarity").
            On any failure, the wanderer can fall back to the legacy
            useVoiceIO + /api/cabinet/message pipeline below. */}
        {convaiActive ? (
          <div data-testid="convai-grace-panel" className="mt-6">
            {/* §STABILIZATION 2026-05-16 — Isolated session-cap banner.
                Renders nothing when SESSION_CAP_ENABLED=false (default
                first deploy) or when the wanderer holds an unlimited /
                free-access tier. NEVER touches RoomConvaiChat's audio,
                SDK, or WebSocket state.
                §TEXT-FREE 2026-05-19 — Hidden entirely when the wanderer
                is in text-only mode so writing feels truly free. */}
            <VoiceSessionCountdown mode={convaiMode} />
            {/* §STABILIZATION 2026-05-16 PM — Presence Tracker wraps
                RoomConvaiChat with realtime ledger updates and the
                Voice Recovery Card. The tracker is a passive observer:
                it reads status via `onStatusChange` (read-only emit)
                and posts /api/presence/* without touching the SDK or
                audio. RoomConvaiChat's audio core remains sealed. */}
            <ConvaiPresenceTracker room="clarity" onModeChange={setConvaiMode} />
          </div>
        ) : null}

        {/* §STABILIZATION 2026-02-15 — Legacy chat surface is now
            architecturally disabled in Private Room. The wrapper
            below renders only when `convaiActive` is false; in
            current code that state is no longer flipped from any
            UI control, so this block is unreachable at runtime.
            We keep the code in place (rather than deleting) so the
            backend `/api/cabinet/message` pipeline retains a
            consumer if a future controlled re-introduction is
            decided. */}
        {!convaiActive && (
        <div
          className="mt-6 flex flex-col bg-[hsl(var(--aurin-bg))]/30 backdrop-blur-sm border-0 rounded-md px-1 md:px-2"
          style={{ minHeight: 180 }}
          data-testid="clarity-legacy-fallback"
        >
          <div
            ref={scrollerRef}
            data-testid="clarity-messages"
            className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[28vh] opacity-75"
          >
            {messages.length === 0 && (
              <div
                className="flex flex-col items-center justify-center text-center py-6 gap-2"
                data-testid="clarity-empty-state"
              >
                <p className="text-[13px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic">
                  {voice.supportedIn
                    ? "Tap the circle below and speak when you're ready."
                    : "Begin when you're ready."}
                </p>
                <p className="text-[11.5px] text-[hsl(var(--aurin-text-muted))]/70">
                  {voice.supportedIn
                    ? "Or type quietly instead — both arrive the same."
                    : ""}
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} text={m.text} index={i} />
            ))}
          </div>

          <form
            onSubmit={onSend}
            className="mt-4 flex flex-col gap-3"
            data-testid="clarity-input-form"
          >
            {/* §Faas 2 — when REALTIME_MODE=on and OPENAI_API_KEY is
                present, RealtimeCompanion renders itself and takes over
                the audio loop (sub-second latency via WebRTC straight to
                OpenAI). Until then it renders nothing and the legacy
                Whisper+Claude+TTS pipeline below stays the live path. */}
            <RealtimeCompanion gender={guideGender || "female"} />

            {/* §Faas 2 — Voice-first row, no push-to-talk button. The
                room is always quietly listening (VAD-driven) and the
                guide takes its turn when you fall silent. Visual state
                lives in the dot + GuidePresence; the line itself is
                near-silent (founder Phase 0 lock).
                §Phase 1 follow-up (2026-02-14) — extracted to
                <VoiceStatusRow> so the three rooms cannot drift apart
                and reintroduce banned labels. */}
            <VoiceStatusRow
              voice={voice}
              variant="clarity"
              testid="clarity-voice-status"
              showMuteToggle
              muteTestid="clarity-mute"
            />

            {/* Secondary text path — quieter, smaller, "or type" affordance. */}
            <details
              className="text-[11.5px] text-[hsl(var(--aurin-text-muted))]"
              data-testid="clarity-text-fallback"
              open={!voice.supportedIn || messages.length > 0 || input.trim().length > 0}
            >
              <summary className="cursor-pointer select-none aurin-serif-italic opacity-80 hover:opacity-100 transition-opacity outline-none">
                {voice.supportedIn ? "or type instead" : "type your line"}
              </summary>
              <div className="mt-2 flex items-end gap-2">
                <textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    voice.transcribing
                      ? "Hearing the words…"
                      : voice.listening
                      ? "Listening… speak when you're ready."
                      : "Write a quiet line."
                  }
                  data-testid="clarity-input"
                  disabled={sending || showContinuation}
                  className="flex-1 bg-[hsl(var(--aurin-bg))] border border-[hsl(var(--aurin-border-soft))] rounded-xl px-3 py-2 text-[13.5px] leading-relaxed focus:border-[hsl(var(--aurin-sage))] outline-none transition-colors resize-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sending || showContinuation || !input.trim()}
                  data-testid="clarity-send"
                  className="aurin-btn aurin-btn-ghost !p-2 disabled:opacity-40"
                  aria-label="Send"
                >
                  <Send size={14} strokeWidth={1.6} />
                </button>
              </div>
            </details>
          </form>

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex-1 min-h-[16px] text-[11.5px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic">
              {sending ? (
                <TypingIndicator visible testid="clarity-thinking" />
              ) : voice.speaking ? (
                <span
                  data-testid="clarity-speaking"
                  className="inline-flex items-center gap-1.5 opacity-80"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--aurin-sage))]" />
                </span>
              ) : null}
            </div>
            <ChatUsageHint refreshKey={usageKey} />
          </div>

          {error && (
            <p
              data-testid="clarity-error"
              className="mt-3 text-[12.5px] text-red-300/90"
            >
              {error}
            </p>
          )}

          {voice.voiceError && (
            <button
              type="button"
              data-testid="clarity-voice-error"
              onClick={voice.dismissVoiceError}
              className="mt-2 text-[11.5px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic text-left hover:opacity-80"
            >
              {voice.voiceError} <span className="opacity-60">· tap to dismiss</span>
            </button>
          )}
        </div>
        )}

        {showContinuation && (
          <div
            data-testid="clarity-continuation"
            className="aurin-card p-7 md:p-8 mt-7 flex flex-col md:flex-row md:items-center gap-5"
          >
            <div className="flex-1">
              <div className="aurin-eyebrow !mb-1">One more breath</div>
              <p className="aurin-display text-2xl leading-snug">
                Some conversations{" "}
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                  don't want to stop here.
                </span>
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                If you feel this is touching something real, leave your name
                on the quiet list — we'll send one short note when the next
                door opens.
              </p>
            </div>
            <a
              href="/catalogue#7-days-of-clarity"
              data-testid="clarity-continue-deeper"
              className="aurin-btn aurin-btn-primary shrink-0"
            >
              Join the waitlist <ArrowRight size={13} />
            </a>
          </div>
        )}

        {/* Iter 67 paywall hook — free-tier users see this when the
            conversation has actually started. Gentle, never urgent. */}
        {!access?.has_active_pass && messages.length >= 4 && (
          <CabinetUpgradeHook />
        )}

        {/* §Phase 1 calm-meter — only after a real conversation
            took place (>=3 guide replies). One-time per day. */}
        <SessionCalmerPrompt
          room="clarity"
          trigger={messages.filter((m) => m.role === "guide").length >= 3}
          testidPrefix="clarity-calmer"
        />

        <div className="mt-7 flex flex-wrap items-center gap-3 text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
          <button
            type="button"
            onClick={onReset}
            data-testid="clarity-reset"
            className="inline-flex items-center gap-1.5 hover:text-[hsl(var(--aurin-sage))] transition-colors"
          >
            <RotateCcw size={12} /> Begin again
          </button>
          {threadKey && (
            <span
              data-testid="clarity-thread-key"
              className="ml-auto"
            >
              Your key:{" "}
              <code className="text-[hsl(var(--aurin-sage))]">{threadKey}</code>
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
  // §Faas 2 mentor-call layout — chat log is a quiet transcript below the
  // mentor video, not a bubble UI. User lines are right-aligned and dim;
  // mentor lines are left-aligned and serif-italic, like a screenplay.
  const isUser = role === "user";
  return (
    <div
      data-testid={`clarity-bubble-${role}`}
      className={`flex ${isUser ? "justify-end" : "justify-start"} px-1`}
    >
      <p
        className={`max-w-[88%] text-[13.5px] leading-[1.7] whitespace-pre-line ${
          isUser
            ? "text-[hsl(var(--aurin-text-muted))]"
            : "text-[hsl(var(--aurin-text))/0.92] aurin-serif-italic"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

/* PreviousQuietHoursPanel — soft "resume" affordance shown on the HUB
 * phase when the signed-in user has previously closed sessions that they
 * explicitly opted into keeping (keep_thread). The panel is intentionally
 * understated: no urgency copy, no badge counts. One row per thread with
 * the first user message as preview, and a calm "Return to this hour"
 * link. Resuming reopens the closed session and routes the user straight
 * into the chat phase with their full encrypted history rehydrated. */
function PreviousQuietHoursPanel({ threads, onResume, resumingId }) {
  if (!threads || threads.length === 0) return null;
  return (
    <section
      data-testid="cabinet-past-threads"
      className="aurin-section-sm"
    >
      <div className="aurin-container max-w-[720px]">
        <div className="aurin-card p-6 md:p-7 space-y-4 border border-[hsl(var(--aurin-border))]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] opacity-60">
            <History size={14} />
            <span>Previous quiet hours</span>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">
            The hours below are still yours. Nothing inside them has been
            shown to anyone. You may return to one — the room remembers
            where you left it.
          </p>
          <ul className="divide-y divide-[hsl(var(--aurin-border))/0.6]">
            {threads.map((t) => {
              const startedAt = t.started_at
                ? new Date(t.started_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })
                : "—";
              const isResuming = resumingId === t.id;
              return (
                <li
                  key={t.id}
                  data-testid={`cabinet-thread-${t.id}`}
                  className="py-3 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs opacity-60 mb-1">
                      {startedAt} · {t.user_message_count} message
                      {t.user_message_count === 1 ? "" : "s"}
                    </div>
                    <div className="text-sm aurin-serif-italic opacity-90 truncate">
                      {t.preview || "(no opening line saved)"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onResume(t)}
                    disabled={isResuming}
                    data-testid={`cabinet-resume-${t.id}`}
                    className="text-sm whitespace-nowrap opacity-80 hover:opacity-100 underline-offset-4 hover:underline disabled:opacity-40"
                  >
                    {isResuming ? "Opening…" : "Return to this hour"}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="text-xs opacity-50 leading-relaxed">
            Each hour stays available as long as you keep returning to it.
            If you would prefer it cleared, simply do not return — silence is
            an honest choice.
          </p>
        </div>
      </div>
    </section>
  );
}


/* B2 — Guide Presence (iter 64c restoration).
 *
 * The visual is a calm premium portrait of either Clarity (M) or Grace
 * (F) — a "Neural Portrait" / signal-presence layer. NOT a talking
 * hologram, NOT an avatar, NOT a lip-synced character. Per founder
 * mandate: restrained micro-animation only — slow breathing scale,
 * occasional soft blink overlay, and a tiny head-sway. While a message
 * is being processed, the soft glow ring intensifies. No exaggerated
 * gestures, no uncanny-valley behavior, no fake emotional acting.
 *
 * Allowed motion: breathing, blink, subtle head sway, send-state glow.
 * Forbidden: lip-sync, hand gestures, posture changes, eye-tracking.
 */
function GuideHologram({ gender, sending, toneTag, runtimeState, mouthOpenRef }) {
  // §Stage 2.7 — thin wrapper preserving the original testid/contract.
  // The actual visual + state handling now lives in
  // `components/GuidePresence.jsx` so the Body Room can share it.
  return (
    <div data-testid="clarity-guide-hologram">
      <GuidePresence
        gender={gender}
        sending={sending}
        toneTag={toneTag}
        runtimeState={runtimeState}
        variant="full"
        testidPrefix="clarity-guide"
        mouthOpenRef={mouthOpenRef}
      />
    </div>
  );
}
