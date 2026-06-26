import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import NewsletterSignup from "@/components/NewsletterSignup";
import CuratorIntroCard, { CURATOR_PALETTES } from "@/components/CuratorIntroCard";
import BodyArchitectureAudioShelf from "@/components/BodyArchitectureAudioShelf";
// §GHOST-FIX 2026-05-23 — Old <BodyRoomChat> import removed.
// Kaelan now runs solely through ConvaiPresenceTracker (ConvAI WebSocket).
// The file BodyRoomChat.jsx is preserved in the repo for rollback.
import RoomConvaiChat from "@/components/RoomConvaiChat"; // eslint-disable-line no-unused-vars
// §AUDIT-SCALE 2026-05-20 — Body Room joins Clarity in tracking
// presence_seconds. Without this Kaelan would never decrement
// credits, leaking value once the free-access window closes.
import ConvaiPresenceTracker from "@/components/ConvaiPresenceTracker";
import BodyLensSelector from "@/components/BodyLensSelector";
import LensForRegion from "@/components/LensForRegion";
import PostSessionMoodReflect from "@/components/PostSessionMoodReflect";
import { useAuth } from "@/contexts/AuthProvider";
import {
  fetchBodyHotspots,
  recordBodyInsight,
  fetchBodyInsights,
  fetchBodyChildrenPatterns,
  fetchBodyPatterns,
  fetchBodyQuestionnaire,
} from "@/lib/api";
import { ArrowRight, X, Wind, Sparkles, ChevronDown, ChevronUp, BookOpen, Sprout, Compass } from "lucide-react";
import { track } from "@/lib/telemetry";
import { BACKEND_URL as __BACKEND_URL__ } from "@/lib/backendUrl";
// §SPRINT-4 — 3-minute first step that sits under the hero.
import FirstActionBlock from "@/components/FirstActionBlock";
import RoomIntroCard from "@/components/RoomIntroCard";


/**
 * /body-room — "Learning to speak with your body".
 *
 * v1 ships with a hand-crafted minimalist silhouette and eight
 * hotspots arranged on a vertical psycho-anatomical map: crown,
 * throat, heart, solar plexus, belly, hips, hands, feet. Each
 * hotspot opens a modal that presents:
 *   - what the region often holds
 *   - a single-sentence symptom description
 *   - a soft "release" practice (1–2 lines, never clinical)
 *
 * Signed-in users can tap "I noticed this" and the click is recorded
 * as a body_insight in the database. Clarity Release reads that
 * insight at the start of the next session ("State Bridge"). The
 * guide can then open the conversation with: "I noticed your body
 * paused at the throat not long ago…"
 *
 * Aesthetic: deep black + sage. No medical terms, no anatomical
 * diagrams. The silhouette is symbolic, not clinical.
 */

export default function BodyRoom() {
  const { user } = useAuth();
  const [hotspots, setHotspots] = useState([]);
  const [recent, setRecent] = useState([]);
  const [activeRegion, setActiveRegion] = useState(null);
  const [savedFlash, setSavedFlash] = useState(null);
  const [childrenPatterns, setChildrenPatterns] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [honestyAccepted, setHonestyAccepted] = useState(false);

  useEffect(() => {
    track("body_room_open");
    let alive = true;
    (async () => {
      try {
        const data = await fetchBodyHotspots();
        if (alive) setHotspots(data.hotspots || []);
      } catch {
        /* keep empty — UI degrades gracefully */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [kids, pats, quiz] = await Promise.all([
          fetchBodyChildrenPatterns().catch(() => null),
          fetchBodyPatterns().catch(() => null),
          fetchBodyQuestionnaire().catch(() => null),
        ]);
        if (alive) {
          if (kids) setChildrenPatterns(kids);
          if (pats) setPatterns(pats);
          if (quiz) setQuestionnaire(quiz);
        }
      } catch {
        /* non-critical — sections hide gracefully */
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      try {
        const data = await fetchBodyInsights(3);
        if (alive) setRecent(data.insights || []);
      } catch {
        /* fresh visitor — no insights yet */
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, savedFlash]);

  const active = hotspots.find((h) => h.region === activeRegion) || null;

  const handleNoted = async () => {
    if (!active || !user) return;
    try {
      await recordBodyInsight({ region: active.region });
      setSavedFlash(active.region);
      setTimeout(() => setSavedFlash(null), 2200);
    } catch {
      /* offline / 401 — UI shows nothing, no error toast */
    }
  };

  return (
    <div data-testid="page-body-room" className="house-room relative">
      <PageHeader
        tone="default"
        eyebrow="The Body Room"
        title="Learning to speak"
        italicWord="with your body."
        description="Before words, the body already knows. This room is a quiet place to listen — to what tightness, fatigue, or restlessness has been trying to say for a long time."
      />

      {/* §ROOM-INTRO 2026-02 — five-line "selguse kaart" for Kaelan. */}
      <RoomIntroCard roomId="kaelan" />

      {/* §SPRINT-4 2026-02 — Kaelan's 3-minute first step. Sits directly
          under the hero. One shared component, content in
          /src/data/firstActions.js. */}
      <FirstActionBlock id="kaelan" />

      {/* Intro chapter — "The Body Is Your First Temple" */}
      <section className="aurin-section-sm" data-testid="body-room-intro">
        <div className="aurin-container max-w-[760px]">
          <div className="aurin-card p-7 md:p-9 space-y-5">
            <div className="aurin-eyebrow !mb-1">Chapter 01</div>
            <h2 className="aurin-display text-3xl md:text-4xl leading-tight max-w-[24ch]">
              The body is your{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                first temple.
              </span>
            </h2>
            <p className="text-[15px] leading-[1.85] text-[hsl(var(--aurin-text))/0.92]">
              Long before you learned a word, your body was already keeping
              records. The first time you were held without warmth. The first
              time you were not heard. The first time you swallowed something
              you wanted to say. None of it was lost. It was carefully placed
              somewhere in your body, where it could wait until you were
              ready.
            </p>
            <p className="text-[14.5px] leading-[1.85] text-[hsl(var(--aurin-text))/0.88]">
              The mind tends to forget on purpose. The body never does. It
              keeps the record in the shoulders, in the throat, in the way
              you wake at four in the morning. This is not punishment. It is
              loyalty. The body has been waiting, very patiently, for you to
              be ready to listen.
            </p>
            <p className="text-[14.5px] leading-[1.85] text-[hsl(var(--aurin-text))/0.88]">
              In this room, we do not diagnose. We do not name what is wrong.
              We do not fix anything. We simply walk slowly across the
              silhouette below, pause where the body asks us to pause, and
              listen for one true sentence. Sometimes one sentence is enough
              for a whole night.
            </p>
            <p className="text-[14.5px] leading-[1.85] text-[hsl(var(--aurin-text))/0.88]">
              A wise person once said: <span className="aurin-serif-italic">"I am not the enemy of my body. To let an emotion arrive and let it stay for a moment is not poison — refusing it is."</span>{" "}
              That is the whole practice here. You are not your tightness. You
              are the one who has come to listen to it.
            </p>
            <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] aurin-serif-italic">
              Eight quiet places to begin with. The crown, the throat, the
              heart, the solar plexus, the belly, the hips, the hands, the
              feet. Walk to the one that speaks loudest tonight.
            </p>
          </div>
        </div>
      </section>

      {/* §KAELAN-VOICE-POC 2026-05-28 — Pre-recorded Daniel-voice
          introduction. Plays a single 15s MP3 served as a static
          asset for zero-latency luxury playback. This is a PoC step
          before any realtime ConvAI voice integration; the founder
          must approve the audio quality first. The actual live
          conversation still happens below via <ConvaiPresenceTracker
          room="body" /> which mints a signed ElevenLabs URL. */}
      <section className="aurin-section-sm" data-testid="body-room-kaelan-intro">
        <div className="aurin-container max-w-[760px]">
          <CuratorIntroCard slug="kaelan" eyebrow="✦ Meet your curator" {...CURATOR_PALETTES.kaelan} />
        </div>
      </section>

      {/* §Phase B (2026-02-15) — Kaelan ConvAI is now mounted. Body
          Room's voice surface is Kaelan, a dedicated somatic agent
          configured by founder in the ElevenLabs UI. Strict room
          isolation: Kaelan's signed URL is minted from
          ELEVENLABS_CONVAI_AGENT_KAELAN only; he never speaks for
          Grace, Sara, or Alistair. */}
      <section className="aurin-section-sm" data-testid="body-room-kaelan">
        <div className="aurin-container max-w-[760px]">
          {/* §AUDIT-SCALE 2026-05-20 — Wrapped in ConvaiPresenceTracker
              so Kaelan's voice sessions decrement credits. The tracker
              itself renders RoomConvaiChat internally — do NOT also
              render it here, that would mount the SDK twice. */}
          <ConvaiPresenceTracker room="body" />
        </div>
      </section>

      {/* §BODY-TEMPLE 2026-02-09 — Course entry card. Sits between
          the Kaelan voice and the silhouette so it surfaces early
          but doesn't pre-empt the interactive map. Wood-panel
          aesthetic from the founder's mood-board. */}
      <section className="aurin-section-sm" data-testid="body-room-temple-entry">
        <div className="aurin-container max-w-[760px]">
          <Link
            to="/body-temple"
            data-testid="body-room-temple-cta"
            className="house-wood block p-6 md:p-7 no-underline"
          >
            <div className="flex items-start gap-4 relative z-[1]">
              <Sprout size={28} className="house-wood-icon" />
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-[0.18em]" style={{color: "#7a5a26"}}>
                  Premium · 4 weeks
                </p>
                <p className="house-wood-title text-[30px] md:text-[34px] mt-0.5">
                  The Body Architecture
                </p>
                <p className="text-[13.5px] mt-2 leading-relaxed max-w-[52ch]" style={{color: "#5a4a26"}}>
                  A 28-day walk through the four ancient keys —
                  the breath, the armor, the radical pause, and
                  coming home. Yours forever after one quiet unlock.
                </p>
                <p className="text-[13px] mt-3 inline-flex items-center gap-1.5" style={{color: "#3d2e15"}}>
                  Walk the temple <ArrowRight size={13} />
                </p>
              </div>
            </div>
          </Link>

          {/* §BODY-ARCH-AUDIO-SHELF 2026-05-28 — All four weekly
              master-classes, founder-approved after Week 1 PoC. */}
          <div className="mt-6">
            <BodyArchitectureAudioShelf />
          </div>
        </div>
      </section>

      {/* Interactive silhouette */}
      <section className="aurin-section-sm" data-testid="body-room-silhouette">
        <div className="aurin-container max-w-[860px]">
          <div className="aurin-eyebrow">Walk the silhouette</div>
          <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[60ch] mb-8">
            Touch a region you feel today. The room will not tell you what is
            there — it will offer one possibility, and one quiet practice.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 items-start">
            <Silhouette
              activeRegion={activeRegion}
              onSelect={setActiveRegion}
              recentRegions={recent.map((r) => r.region)}
            />

            <SidePanel
              hotspots={hotspots}
              onSelect={setActiveRegion}
              activeRegion={activeRegion}
              recentRegions={recent.map((r) => r.region)}
            />
          </div>
        </div>
      </section>

      {/* §VOICE-MOOD-NLP 2026-02-09 — Phase 2 mood detection. A
          gentle one-sentence reflection prompt after Kaelan's voice
          session. Privacy-preserving (text discarded, only mood
          label kept). Renders only for signed-in users. */}
      {user && (
        <section className="aurin-section-sm" data-testid="body-room-mood-reflect">
          <div className="aurin-container max-w-[760px]">
            <PostSessionMoodReflect room="kaelan" />
          </div>
        </section>
      )}

      {/* If signed in, show a soft "the room remembers" panel. The
          cross-link to Clarity Release is preserved here ONLY as a
          gentle "the rooms remember each other" thread — the wanderer
          is NOT auto-redirected; they choose. §STABILIZATION 2026-02-15
          removed the previous "Just talk to Grace" CTA above (which
          was causing room-mix-up complaints). This panel below stays
          because it requires explicit prior body engagement to even
          render (recent.length > 0). */}
      {user && recent.length > 0 && (
        <section className="aurin-section-sm" data-testid="body-room-bridge">
          <div className="aurin-container max-w-[760px]">
            <div className="aurin-card p-6 md:p-7 space-y-4">
              <div className="aurin-eyebrow !mb-1">A quiet thread</div>
              <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text))/0.9]">
                Your last pauses are remembered, gently:{" "}
                {recent.map((r, i) => (
                  <span key={r.id} className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                    {i > 0 && ", "}
                    {labelFor(r.region, hotspots)}
                  </span>
                ))}
                . When you next step into Clarity Release, the room may begin
                there.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Inherited loads — how children carry the unresolved family
          material in their bodies. Framed strictly as understanding,
          never blame. Medical care is presumed and respected. */}
      {childrenPatterns && (
        <section className="aurin-section-sm" data-testid="body-room-children">
          <div className="aurin-container max-w-[820px]">
            <div className="aurin-card p-7 md:p-9 space-y-6">
              <div>
                <div className="aurin-eyebrow !mb-1">A gentle parallel</div>
                <h2 className="aurin-display text-2xl md:text-3xl leading-snug max-w-[26ch]">
                  What the family has not said,{" "}
                  <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                    the child sometimes carries.
                  </span>
                </h2>
              </div>
              <p
                className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9]"
                data-testid="children-preamble"
              >
                {childrenPatterns.preamble}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {childrenPatterns.patterns.map((p) => (
                  <article
                    key={p.id}
                    data-testid={`children-pattern-${p.id}`}
                    className="p-5 rounded-xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg))]/40 space-y-3"
                  >
                    <h3 className="aurin-display text-[16px] leading-snug">
                      {p.child_symptom}
                    </h3>
                    <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.9] aurin-serif-italic">
                      {p.in_the_child}
                    </p>
                    <div>
                      <div className="aurin-eyebrow !mb-1 text-[10px]">In the parent</div>
                      <p className="text-[13px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                        {p.parent_mirror}
                      </p>
                    </div>
                    <div>
                      <div className="aurin-eyebrow !mb-1 text-[10px] text-[hsl(var(--aurin-sage))]">Release path</div>
                      <p className="text-[13px] leading-relaxed text-[hsl(var(--aurin-text))/0.9]">
                        {p.release_path}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
              <p
                className="text-[12px] leading-relaxed text-[hsl(var(--aurin-text-muted))]/90 aurin-serif-italic pt-2 border-t border-[hsl(var(--aurin-border-soft))]"
                data-testid="children-medical-note"
              >
                {childrenPatterns.medical_note}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* The unwinding — a quiet library of human patterns. Not medical,
          not diagnostic; just the familiar shapes that show up in almost
          every life. Each card ends in new_rhythm (the light at the end
          of the tunnel), never in "diagnosis" or "fix". */}
      {patterns && (
        <section className="aurin-section-sm" data-testid="body-room-patterns">
          <div className="aurin-container max-w-[860px]">
            <div className="aurin-card p-7 md:p-9 space-y-6">
              <div>
                <div className="aurin-eyebrow !mb-1">The unwinding</div>
                <h2 className="aurin-display text-2xl md:text-3xl leading-snug max-w-[26ch]">
                  The patterns we all meet,{" "}
                  <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                    sooner or later.
                  </span>
                </h2>
              </div>
              <p
                className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9]"
                data-testid="patterns-preamble"
              >
                {patterns.preamble}
              </p>
              <div className="space-y-4">
                {patterns.patterns.map((p) => (
                  <article
                    key={p.id}
                    data-testid={`pattern-${p.id}`}
                    className="p-5 md:p-6 rounded-xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg))]/40 space-y-3"
                  >
                    <h3 className="aurin-display text-[18px] leading-snug">
                      {p.title}
                    </h3>
                    <div>
                      <div className="aurin-eyebrow !mb-1 text-[10px]">The shape</div>
                      <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">{p.surface}</p>
                    </div>
                    <div>
                      <div className="aurin-eyebrow !mb-1 text-[10px]">Beneath the pattern</div>
                      <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.9]">{p.beneath}</p>
                    </div>
                    <div>
                      <div className="aurin-eyebrow !mb-1 text-[10px] text-[hsl(var(--aurin-sage))]">The soft exit</div>
                      <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.9]">{p.soft_exit}</p>
                    </div>
                    <div className="pt-2 border-t border-[hsl(var(--aurin-border-soft))]">
                      <div className="aurin-eyebrow !mb-1 text-[10px] text-[hsl(var(--aurin-sage))] inline-flex items-center gap-1.5">
                        <Sprout size={11} strokeWidth={1.4} />
                        The new rhythm
                      </div>
                      <p className="text-[13.5px] leading-relaxed aurin-serif-italic text-[hsl(var(--aurin-text))/0.95]">{p.new_rhythm}</p>
                    </div>
                  </article>
                ))}
              </div>
              <p
                data-testid="patterns-honesty-note"
                className="text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] aurin-serif-italic pt-2 border-t border-[hsl(var(--aurin-border-soft))]"
              >
                {patterns.honesty_note}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Honesty questionnaire — five short questions. The frontend
          maps the answers into suggested regions + patterns, stored
          only in local component state (no account / no server save). */}
      {questionnaire && (
        <section className="aurin-section-sm" data-testid="body-room-questionnaire">
          <div className="aurin-container max-w-[720px]">
            <div className="aurin-card p-7 md:p-8 space-y-5">
              <div>
                <div className="aurin-eyebrow !mb-1 inline-flex items-center gap-1.5">
                  <Compass size={11} strokeWidth={1.4} className="text-[hsl(var(--aurin-sage))]" />
                  A soft map for tonight
                </div>
                <h2 className="aurin-display text-2xl leading-snug">
                  Five quiet questions.
                </h2>
                <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] mt-2">
                  {questionnaire.preamble}
                </p>
                <p className="text-[12.5px] leading-relaxed text-[hsl(var(--aurin-sage))] aurin-serif-italic mt-2">
                  {questionnaire.honesty_prompt}
                </p>
              </div>
              {!quizResult ? (
                !honestyAccepted ? (
                  <div className="space-y-5" data-testid="quiz-honesty-gate">
                    <div className="p-5 md:p-6 rounded-xl border border-[hsl(var(--aurin-sage))]/30 bg-[hsl(var(--aurin-sage))]/5 space-y-3">
                      <div className="aurin-eyebrow !mb-1 text-[10px] text-[hsl(var(--aurin-sage))]">
                        One quiet vow, before we begin
                      </div>
                      <p className="aurin-display text-[18px] leading-snug">
                        "I am willing to look at what I have been hiding —{" "}
                        <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                          not to judge it, but to find my own light again."
                        </span>
                      </p>
                      <p className="text-[13px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                        Nothing leaves this device. No server sees these answers.
                        The only one reading them, tonight, is you.
                      </p>
                      <p className="text-[12px] leading-relaxed text-[hsl(var(--aurin-text-muted))] pt-1 border-t border-[hsl(var(--aurin-border-soft))]">
                        By continuing, you accept the{" "}
                        <Link
                          to="/wanderers-agreement"
                          data-testid="quiz-agreement-link"
                          className="text-[hsl(var(--aurin-sage))] hover:underline"
                        >
                          Wanderer's Agreement
                        </Link>{" "}
                        — a quiet contract about what this room is, and is not.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        data-testid="quiz-honesty-accept"
                        onClick={() => setHonestyAccepted(true)}
                        className="aurin-btn aurin-btn-primary"
                      >
                        I am ready <ArrowRight size={13} />
                      </button>
                      <button
                        type="button"
                        data-testid="quiz-honesty-later"
                        onClick={() => {
                          const el = document.querySelector('[data-testid="body-room-patterns"]');
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="aurin-btn aurin-btn-ghost !py-2 !px-4 !text-[12.5px]"
                      >
                        Not tonight — just visiting
                      </button>
                    </div>
                  </div>
                ) : (
                <div className="space-y-5">
                  {questionnaire.questions.map((q) => (
                    <div key={q.id} data-testid={`quiz-q-${q.id}`} className="space-y-2">
                      <p className="text-[13.5px] leading-snug font-medium">{q.prompt}</p>
                      <div className="grid gap-2">
                        {q.options.map((opt) => {
                          const checked = quizAnswers[q.id] === opt.value;
                          return (
                            <label
                              key={opt.value}
                              data-testid={`quiz-opt-${q.id}-${opt.value}`}
                              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                checked
                                  ? "border-[hsl(var(--aurin-sage))] bg-[hsl(var(--aurin-sage))]/10"
                                  : "border-[hsl(var(--aurin-border-soft))] hover:border-[hsl(var(--aurin-sage))]/50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                value={opt.value}
                                checked={checked}
                                onChange={() => setQuizAnswers((a) => ({ ...a, [q.id]: opt.value }))}
                                className="mt-1 accent-[hsl(var(--aurin-sage))]"
                              />
                              <span className="text-[13px] leading-relaxed">{opt.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      data-testid="quiz-submit"
                      disabled={Object.keys(quizAnswers).length < questionnaire.questions.length}
                      onClick={() => setQuizResult(computeQuizResult(questionnaire, quizAnswers, patterns, hotspots))}
                      className="aurin-btn aurin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      See the small map <ArrowRight size={13} />
                    </button>
                    <button
                      type="button"
                      data-testid="quiz-reset"
                      onClick={() => { setQuizAnswers({}); setQuizResult(null); setHonestyAccepted(false); }}
                      className="aurin-btn aurin-btn-ghost !py-2 !px-4 !text-[12.5px]"
                    >
                      Start again
                    </button>
                  </div>
                </div>
                )
              ) : (
                <div data-testid="quiz-result" className="space-y-4">
                  <p className="text-[14px] leading-[1.85]">{quizResult.intro}</p>
                  {quizResult.regionCards.length > 0 && (
                    <div>
                      <div className="aurin-eyebrow !mb-2 text-[10px]">Places that may want a visit tonight</div>
                      <div className="flex flex-wrap gap-2">
                        {quizResult.regionCards.map((r) => (
                          <button
                            key={r.region}
                            data-testid={`quiz-result-region-${r.region}`}
                            onClick={() => setActiveRegion(r.region)}
                            className="aurin-chip hover:bg-[hsl(var(--aurin-sage))]/15 hover:border-[hsl(var(--aurin-sage))]"
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {quizResult.patternCards.length > 0 && (
                    <div>
                      <div className="aurin-eyebrow !mb-2 text-[10px]">A pattern worth a kind look</div>
                      <ul className="space-y-1">
                        {quizResult.patternCards.map((p) => (
                          <li key={p.id} data-testid={`quiz-result-pattern-${p.id}`} className="text-[13px] aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                            → {p.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] aurin-serif-italic pt-2 border-t border-[hsl(var(--aurin-border-soft))]">
                    {quizResult.closing}
                  </p>
                  <button
                    type="button"
                    data-testid="quiz-retake"
                    onClick={() => { setQuizAnswers({}); setQuizResult(null); }}
                    className="aurin-btn aurin-btn-ghost !py-2 !px-4 !text-[12.5px]"
                  >
                    Take it again another evening
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* §GHOST-FIX 2026-05-23 — Old <BodyRoomChat> mount removed.
          Reason: same dual-voice pattern that affected Parents Room
          (useVoiceIO with autoVoice:true + auto-speak useEffect on
          every guide message → parallel browser TTS while Kaelan
          ConvAI was already speaking). Kaelan now flows solely
          through ConvaiPresenceTracker above. The component file
          BodyRoomChat.jsx remains in the repo as a rollback option
          but is no longer rendered anywhere. */}

      {/* Newsletter — for the deeper Body Room releases later */}
      <section className="aurin-section-sm" data-testid="body-room-waitlist">
        <div className="aurin-container max-w-[640px]">
          <div className="aurin-card p-7 md:p-8 space-y-4">
            <div className="aurin-eyebrow !mb-1">More rooms coming</div>
            <p className="aurin-display text-2xl leading-snug">
              Each quiet place,{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                in its own time.
              </span>
            </p>
            <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
              We add depth to one region per cycle, never in a rush. Leave a
              quiet note and we will let you know when the next one opens.
            </p>
            <NewsletterSignup source="body-room:waitlist" />
          </div>
        </div>
      </section>

      <section className="aurin-section-sm" data-testid="body-room-disclaimer">
        <div className="aurin-container max-w-[640px] text-center">
          <p className="text-[12px] leading-relaxed text-[hsl(var(--aurin-text-muted))]/80 aurin-serif-italic">
            This room is not a medical service. If your body is asking for a
            doctor — please listen to that voice first.
          </p>
        </div>
      </section>

      {/* Modal */}
      {active && (
        <HotspotModal
          spot={active}
          user={user}
          savedFlash={savedFlash === active.region}
          onNoted={handleNoted}
          onClose={() => setActiveRegion(null)}
        />
      )}
    </div>
  );
}

/* ---------- Silhouette ---------- */
function Silhouette({ activeRegion, onSelect, recentRegions }) {
  // 8 hotspots arranged on a vertical centerline: crown, throat, heart,
  // solar_plexus, belly, hips, feet — plus hands at mid-height left/right.
  // Hand-tuned positions on a 200×440 human outline (matches the body
  // path drawn below). Coordinates derived from founder's spec
  // (crown 15%, throat 25%, heart 38%, plexus 48%, belly 58%, hips 72%,
  // hands 35%/65% × 50%, feet 90%) mapped onto viewBox 200×440.
  const isHot = (r) => activeRegion === r;
  const isRecent = (r) => recentRegions.includes(r);
  const dotProps = (r) => ({
    onClick: () => onSelect(r),
    "data-testid": `body-hotspot-${r}`,
    style: { cursor: "pointer" },
  });
  const dotClass = (r) =>
    `transition-all duration-300 ${
      isHot(r)
        ? "fill-[hsl(var(--aurin-sage))] opacity-100"
        : isRecent(r)
        ? "fill-[hsl(var(--aurin-sage))] opacity-70"
        : "fill-[hsl(var(--aurin-sage))] opacity-40 hover:opacity-90"
    }`;
  const ringClass = (r) =>
    `transition-opacity duration-300 stroke-[hsl(var(--aurin-sage))] fill-none ${
      isHot(r) ? "opacity-90" : "opacity-30"
    }`;

  // viewBox is 200 wide × 440 tall. Y values are anchored to anatomical
  // markers in the body path: crown ~50, throat ~110, heart ~165,
  // solar plexus ~200, belly ~235, hips ~280, feet ~395.
  const HOT = [
    { id: "crown",        cx: 100, cy:  50, r: 22, dr: 7 },
    { id: "throat",       cx: 100, cy: 108, r: 13, dr: 5 },
    { id: "heart",        cx: 100, cy: 165, r: 18, dr: 6 },
    { id: "solar_plexus", cx: 100, cy: 205, r: 16, dr: 6 },
    { id: "belly",        cx: 100, cy: 240, r: 18, dr: 6 },
    { id: "hips",         cx: 100, cy: 290, r: 20, dr: 7 },
    { id: "hands",        cx:  38, cy: 230, r: 12, dr: 5, twin: { cx: 162, cy: 230 } },
    { id: "feet",         cx: 100, cy: 395, r: 16, dr: 6 },
  ];

  return (
    <div
      data-testid="body-silhouette"
      className="mx-auto w-full max-w-[260px]"
      role="img"
      aria-label="Human silhouette with eight quiet regions: crown, throat, heart, solar plexus, belly, hips, hands, feet."
    >
      <svg
        viewBox="0 0 200 440"
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          stroke="hsl(var(--aurin-sage))"
          fill="none"
          strokeWidth="1.4"
          opacity="0.45"
        >
          <ellipse cx="100" cy="50" rx="28" ry="34" />
          <path d="M88 82 L88 100 L112 100 L112 82" />
          <path d="M48 110 Q58 100 88 100 L112 100 Q142 100 152 110 L150 200 Q140 230 130 260 L120 320 L110 380 L90 380 L80 320 L70 260 Q60 230 50 200 Z" />
          <path d="M48 110 L34 180 L34 240 L42 244" />
          <path d="M152 110 L166 180 L166 240 L158 244" />
          {/* feet hint lines */}
          <path d="M82 385 L78 410 L92 410 L92 385" />
          <path d="M118 385 L122 410 L108 410 L108 385" />
        </g>

        {HOT.map((h) => (
          <g key={h.id} {...dotProps(h.id)}>
            {/* Outer "presence" halo — slow, expansive, gentle */}
            <circle
              cx={h.cx}
              cy={h.cy}
              r={h.r * 1.7}
              className={`${ringClass(h.id)} body-presence-halo`}
              strokeOpacity="0.18"
              fill="none"
            />
            {/* Mid ring — the "breath" */}
            <circle cx={h.cx} cy={h.cy} r={h.r} className={ringClass(h.id)} strokeOpacity="0.35" />
            {/* Centre dot — the place itself */}
            <circle cx={h.cx} cy={h.cy} r={h.dr} className={dotClass(h.id)} />
            {/* Twin dot for two-handed regions (hands left + right) */}
            {h.twin && (
              <>
                <circle
                  cx={h.twin.cx}
                  cy={h.twin.cy}
                  r={h.r * 1.7}
                  className={`${ringClass(h.id)} body-presence-halo`}
                  strokeOpacity="0.18"
                  fill="none"
                />
                <circle cx={h.twin.cx} cy={h.twin.cy} r={h.r} className={ringClass(h.id)} strokeOpacity="0.35" />
                <circle cx={h.twin.cx} cy={h.twin.cy} r={h.dr} className={dotClass(h.id)} />
              </>
            )}
          </g>
        ))}

        <style>{`
          @keyframes body-pulse {
            0%, 100% { transform: scale(1);    opacity: 0.32; }
            50%      { transform: scale(1.12); opacity: 0.62; }
          }
          @keyframes body-halo {
            0%, 100% { transform: scale(0.85); opacity: 0.10; }
            50%      { transform: scale(1.25); opacity: 0.42; }
          }
          /* The "breath" ring — slow, gentle, never alarming */
          [data-testid^="body-hotspot-"] circle:nth-child(2) {
            transform-origin: center;
            transform-box: fill-box;
            animation: body-pulse 7s ease-in-out infinite;
          }
          /* The outer radiating presence — even slower, more expansive.
           * pointer-events:none so overlapping halos never steal clicks
           * intended for an adjacent hotspot's centre dot. */
          [data-testid^="body-hotspot-"] .body-presence-halo {
            transform-origin: center;
            transform-box: fill-box;
            animation: body-halo 9s ease-in-out infinite;
            pointer-events: none;
          }
          /* The breathing mid-ring is decorative too — let only the
           * centre filled dot catch the click. */
          [data-testid^="body-hotspot-"] circle:nth-child(2) {
            pointer-events: none;
          }
        `}</style>
      </svg>
      <p className="mt-3 text-center text-[11.5px] uppercase tracking-[0.28em] text-[hsl(var(--aurin-text-muted))]">
        Tap a region
      </p>
    </div>
  );
}

/* ---------- Side list (mobile-friendly entry point) ---------- */
function SidePanel({ hotspots, onSelect, activeRegion, recentRegions }) {
  return (
    <div className="space-y-3" data-testid="body-room-list">
      {hotspots.map((h) => (
        <button
          key={h.region}
          type="button"
          onClick={() => onSelect(h.region)}
          data-testid={`body-list-${h.region}`}
          className={`w-full text-left aurin-card p-5 transition-colors ${
            activeRegion === h.region
              ? "ring-1 ring-[hsl(var(--aurin-sage))]/60"
              : "hover:bg-[hsl(var(--aurin-surface))]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="aurin-display text-[17px] leading-tight">
              {h.label}
            </h3>
            {recentRegions.includes(h.region) && (
              <span className="text-[10px] uppercase tracking-[0.28em] text-[hsl(var(--aurin-sage))]">
                Visited
              </span>
            )}
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-[hsl(var(--aurin-text-muted))] aurin-serif-italic">
            {h.emotion}
          </p>
        </button>
      ))}
    </div>
  );
}

/* ---------- Modal ---------- */
function HotspotModal({ spot, user, savedFlash, onNoted, onClose }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [deepOpen, setDeepOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Reset image state when the spot changes.
  useEffect(() => {
    setImgFailed(false);
  }, [spot.image_slug]);

  return (
    <div
      data-testid="body-modal"
      role="dialog"
      aria-labelledby="body-modal-title"
      className="fixed inset-0 z-[80] flex items-center justify-center px-4"
    >
      <div
        className="absolute inset-0 bg-[hsl(var(--aurin-bg))]/85 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[600px] aurin-card p-7 md:p-9 space-y-5 z-10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          data-testid="body-modal-close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-sage))] hover:bg-[hsl(var(--aurin-surface))]/50 transition-colors"
        >
          <X size={14} strokeWidth={1.6} />
        </button>

        <div>
          <div className="aurin-eyebrow !mb-1">{spot.label}</div>
          <h3
            id="body-modal-title"
            className="aurin-display text-2xl md:text-3xl leading-snug"
          >
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
              {spot.emotion}
            </span>{" "}
            often lives here.
          </h3>
        </div>

        {spot.image_slug && !imgFailed && (
          <div
            data-testid="body-modal-illustration"
            className="-mx-1 md:-mx-2 overflow-hidden rounded-2xl aspect-square bg-[hsl(var(--aurin-bg))]/60"
          >
            <img
              src={`${__BACKEND_URL__}/api/body-room/image/${spot.image_slug}`}
              alt=""
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover opacity-95"
            />
          </div>
        )}

        <Section label="What this region tends to hold">
          {spot.what_it_carries}
        </Section>
        <Section label="The way it asks for attention">
          {spot.symptom}
        </Section>
        {spot.why_it_speaks_to_you && (
          <Section label="Why this place may be speaking to you" icon={Sparkles}>
            {spot.why_it_speaks_to_you}
          </Section>
        )}
        <Section label="One quiet release" icon={Wind}>
          {spot.release}
        </Section>

        <LensForRegion region={spot.region} />

        {spot.deep_layer && (
          <div
            data-testid={`body-modal-deep-${spot.region}`}
            className="pt-2 border-t border-[hsl(var(--aurin-border-soft))]"
          >
            <button
              type="button"
              onClick={() => setDeepOpen((o) => !o)}
              data-testid={`body-modal-deep-toggle-${spot.region}`}
              className="w-full flex items-center justify-between py-3 text-left aurin-link text-[13px]"
              aria-expanded={deepOpen}
            >
              <span className="inline-flex items-center gap-2">
                <BookOpen size={12} strokeWidth={1.4} className="text-[hsl(var(--aurin-sage))]" />
                Going deeper — understanding without blame
              </span>
              {deepOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {deepOpen && (
              <div className="space-y-4 pt-2 pb-2" data-testid={`body-modal-deep-body-${spot.region}`}>
                <div>
                  <div className="aurin-eyebrow !mb-1 text-[10px]">The pattern</div>
                  <p className="aurin-display text-[17px] leading-snug text-[hsl(var(--aurin-sage))]">
                    {spot.deep_layer.toxin_name}
                  </p>
                </div>
                <Section label="How it forms">
                  {spot.deep_layer.how_it_forms}
                </Section>
                <Section label="The path of understanding" icon={Sparkles}>
                  {spot.deep_layer.forgiveness_path}
                </Section>
                <Section label="How the body signals release" icon={Wind}>
                  {spot.deep_layer.release_signs}
                </Section>
                {spot.deep_layer.new_rhythm && (
                  <div className="pt-1">
                    <div className="aurin-eyebrow !mb-1 text-[10px] text-[hsl(var(--aurin-sage))] inline-flex items-center gap-1.5">
                      <Sprout size={11} strokeWidth={1.4} />
                      The new rhythm
                    </div>
                    <p className="text-[13.5px] leading-relaxed aurin-serif-italic text-[hsl(var(--aurin-text))/0.95]">
                      {spot.deep_layer.new_rhythm}
                    </p>
                  </div>
                )}
                <p className="text-[12px] leading-relaxed text-[hsl(var(--aurin-text-muted))]/90 aurin-serif-italic">
                  {spot.deep_layer.medical_note}
                </p>
              </div>
            )}
          </div>
        )}

        {user ? (
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onNoted}
              data-testid="body-modal-noted"
              className="aurin-btn aurin-btn-primary"
              disabled={savedFlash}
            >
              {savedFlash ? (
                <>
                  <Sparkles size={13} /> Noted, gently
                </>
              ) : (
                <>I noticed this <ArrowRight size={13} /></>
              )}
            </button>
            <span className="text-[12px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic">
              The room remembers. Clarity Release may begin here next time.
            </span>
          </div>
        ) : (
          <p className="text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
            Sign in if you'd like the room to remember which regions you have
            visited.
          </p>
        )}
      </div>
    </div>
  );
}

function Section({ label, children, icon: Icon }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.28em] text-[hsl(var(--aurin-text-muted))]">
        {Icon && <Icon size={11} strokeWidth={1.4} className="text-[hsl(var(--aurin-sage))]" />}
        <span>{label}</span>
      </div>
      <p className="text-[14px] leading-[1.8] text-[hsl(var(--aurin-text))/0.92]">
        {children}
      </p>
    </div>
  );
}

function labelFor(region, hotspots) {
  const found = hotspots.find((h) => h.region === region);
  return found ? found.label.toLowerCase() : region;
}

// Map quiz answers into a small, gentle result: which regions resonate,
// which patterns may want a visit, and an honesty-tuned closing note.
function computeQuizResult(quiz, answers, patternsPayload, hotspots) {
  const regionCount = {};
  const patternIds = new Set();
  let honestyWeight = 0;

  for (const q of quiz.questions) {
    const val = answers[q.id];
    if (!val) continue;
    const opt = q.options.find((o) => o.value === val);
    if (!opt) continue;
    (opt.regions || []).forEach((r) => {
      regionCount[r] = (regionCount[r] || 0) + 1;
    });
    (opt.patterns || []).forEach((p) => patternIds.add(p));
    if (typeof opt.weight === "number") honestyWeight = opt.weight;
  }

  const topRegions = Object.entries(regionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([region]) => {
      const h = hotspots.find((x) => x.region === region);
      return { region, label: h ? h.label : region };
    });

  const allPatterns = patternsPayload?.patterns || [];
  const patternCards = allPatterns.filter((p) => patternIds.has(p.id));

  const intro =
    honestyWeight >= 2
      ? "Good. You have brought honesty with you tonight. The map below is soft — take only what recognises itself."
      : "Welcome. Even visiting is enough tonight. Here is a soft map, for whenever you are ready to sit with it.";

  const closing =
    honestyWeight === 0
      ? "There is no hurry. The room will be here when you are. One evening's honesty is worth more than a year's reading."
      : honestyWeight === 1
      ? "You are allowed to be ambivalent. Change does not require certainty — it requires one small true step, and then the next."
      : "The willingness itself is already the work. Start with the place that feels loudest, in the smallest way you can tonight. The rest unfolds.";

  return { intro, regionCards: topRegions, patternCards, closing };
}

// =============================================================
// §KAELAN-VOICE-POC 2026-05-28 — Kaelan introduction card.
// Plays a pre-recorded 15s Daniel-voice MP3 from /public/audio.
// Zero backend round-trip, zero credit cost, founder-audited
// before any realtime ConvAI voice work is greenlit.
// =============================================================
function KaelanIntroCard() {
  const audioRef = useRef(null);
  const [state, setState] = useState("idle"); // idle | playing | ended

  const onToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state === "playing") {
      audio.pause();
      audio.currentTime = 0;
      setState("idle");
      return;
    }
    audio.currentTime = 0;
    audio.play().then(() => setState("playing")).catch(() => setState("idle"));
  };

  return (
    <div
      data-testid="kaelan-intro-card"
      className="rounded-[1.5rem] p-7 md:p-8 flex items-center gap-5 md:gap-7"
      style={{
        background: "linear-gradient(160deg, #131210 0%, #1c1a16 100%)",
        border: "1px solid rgba(139,132,120,0.22)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45), 0 0 28px rgba(139,132,120,0.18)",
      }}
    >
      <div
        className="shrink-0 rounded-full overflow-hidden"
        style={{
          width: 84,
          height: 84,
          border: "1px solid #8b8478",
          boxShadow: "0 0 26px rgba(139,132,120,0.32)",
        }}
      >
        <img
          src="/avatars/kaelan.png"
          alt="Kaelan, curator of the Body Room"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[10.5px] tracking-[0.36em] uppercase mb-1.5"
          style={{ color: "#a59f93", fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          data-testid="kaelan-intro-eyebrow"
        >
          ✦ Meet your curator
        </p>
        <p
          className="text-[24px] md:text-[28px] leading-[1.15] font-light italic mb-1.5"
          style={{ color: "#e8e1d5", fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          data-testid="kaelan-intro-name"
        >
          Kaelan
        </p>
        <p
          className="text-[13px] md:text-[13.5px] leading-[1.7] italic"
          style={{ color: "#bcb4a3", fontFamily: '"Cormorant Garamond", Georgia, serif' }}
        >
          A quiet listener of the body. Press play for a short hello — about fifteen seconds.
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        data-testid="kaelan-intro-play"
        aria-label={state === "playing" ? "Stop introduction" : "Play Kaelan introduction"}
        className="shrink-0 inline-flex items-center justify-center rounded-full transition-all"
        style={{
          width: 56,
          height: 56,
          background: "#8b8478",
          color: "#0b0a08",
          boxShadow: "0 0 22px rgba(139,132,120,0.36)",
        }}
      >
        {state === "playing" ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
      </button>
      <audio
        ref={audioRef}
        src="/audio/kaelan-intro.mp3"
        preload="auto"
        onEnded={() => setState("ended")}
        onError={() => setState("idle")}
        data-testid="kaelan-intro-audio"
      />
    </div>
  );
}
