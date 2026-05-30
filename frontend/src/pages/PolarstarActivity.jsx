/**
 * PolarstarActivity.jsx — /kids-universe/polarstar/:roomId/:activitySlug
 *
 * §POLARSTAR-CONTENT iter 86 2026-02-29
 *
 * Universal themed content page. Renders one activity from
 * polarstarContentMap.js. Dispatches on activity.type:
 *
 *   story     → list of story cards (Listen/Read) + Pick-a-story CTA
 *   challenge → today's challenge card + 4 suggested actions + "I did it"
 *   breathe   → step-by-step quiet breathing card
 *   moves     → grid of movement cards
 *   draw      → Drawing Palette placeholder (HTML5 canvas Coming Soon)
 *   kindness  → identical to challenge, but with the kindness wording
 *   reflect   → quiet journal prompts
 *   project   → numbered project steps
 *   soon      → themed Coming Soon card (stays in painted world)
 *
 * All paths share the same PolarstarThemePage shell so the painted-
 * world feel is preserved across every leaf.
 */

import { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { BookOpen, Headphones, Check, Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import PolarstarThemePage from "@/components/PolarstarThemePage";
import PolarstarWaitlistModal from "@/components/PolarstarWaitlistModal";
import { getRoom, getActivity } from "@/data/polarstarContentMap";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const CAVEAT = '"Caveat", "Comic Sans MS", cursive';

export default function PolarstarActivity() {
  const { roomId, activitySlug } = useParams();
  const room = getRoom(roomId);
  const act = getActivity(roomId, activitySlug);
  const [doneClicked, setDoneClicked] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  if (!room || !act) {
    return <Navigate to={`/kids-universe/polarstar/${roomId || ""}`} replace />;
  }

  const backTo = `/kids-universe/polarstar/${room.id}`;
  const backLabel = `Back to ${room.title}`;
  const palette = room.palette;

  return (
    <>
      <PolarstarThemePage
        roomTitle={act.title}
        ageLabel={`${room.title} · ${room.ageLabel}`}
        subtitle={act.blurb}
        palette={palette}
        backTo={backTo}
        backLabel={backLabel}
        parentTip={act.parentTip}
        testid={`polarstar-activity-page-${room.id}-${act.slug}`}
      >
        {act.type === "story" && (
          <StoryDeck act={act} palette={palette} room={room} />
        )}

        {(act.type === "challenge" || act.type === "kindness") && (
          <ChallengeCard
            act={act}
            palette={palette}
            doneClicked={doneClicked}
            onDone={() => setDoneClicked(true)}
          />
        )}

        {act.type === "breathe" && (
          <StepsCard act={act} palette={palette} stepLabel="Breath" />
        )}

        {act.type === "moves" && act.journey && (
          <MovesJourney act={act} palette={palette} room={room} />
        )}

        {act.type === "moves" && !act.journey && (
          <MovesGrid act={act} palette={palette} />
        )}

        {act.type === "draw" && (
          <DrawingPlaceholder act={act} palette={palette} onAlert={() => setWaitlistOpen(true)} />
        )}

        {act.type === "reflect" && (
          <ReflectionPrompts act={act} palette={palette} />
        )}

        {act.type === "project" && (
          <StepsCard act={act} palette={palette} stepLabel="Step" />
        )}

        {act.type === "soon" && (
          <ComingSoonCard act={{ ...act, _roomId: room.id }} palette={palette} onAlert={() => setWaitlistOpen(true)} />
        )}
      </PolarstarThemePage>

      {waitlistOpen && (
        <PolarstarWaitlistModal
          isOpen={waitlistOpen}
          onClose={() => setWaitlistOpen(false)}
          context={{ zone: `${room.id}/${act.slug}`, label: act.title }}
          mode="day"
        />
      )}
    </>
  );
}

/* ──────────────────────────── StoryDeck ──────────────────────────── */
function StoryDeck({ act, palette, room }) {
  const stories = act._stories || [];
  if (stories.length === 0) {
    return <ComingSoonCard act={{ ...act, _roomId: room.id }} palette={palette} />;
  }
  return (
    <div
      data-testid="polarstar-story-deck"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 20,
      }}
    >
      {stories.map((s) => (
        <Link
          key={s.slug}
          to={`/kids-universe/polarstar/${room.id}/story-time/${s.slug}`}
          data-testid={`polarstar-story-card-${s.slug}`}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "16px 16px 18px",
            borderRadius: 20,
            textDecoration: "none",
            background: "rgba(255,252,244,0.96)",
            border: `1.5px solid ${palette.accent}55`,
            boxShadow: "0 12px 24px rgba(58,42,24,0.18)",
            color: "#3a2a18",
            transition: "transform 220ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
        >
          <div
            style={{
              aspectRatio: "3 / 4",
              borderRadius: 14,
              background: `linear-gradient(180deg, ${palette.accent}26 0%, ${palette.accent}10 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: CAVEAT,
              fontSize: 22,
              padding: 12,
              textAlign: "center",
              color: palette.accent,
            }}
          >
            {s.title}
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5, fontStyle: "italic", color: "#5b4a32", flex: 1 }}>
            {s.intro}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <span
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                padding: "8px 0",
                borderRadius: 999,
                background: `${palette.accent}22`,
                color: palette.accent,
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                opacity: s.audio ? 1 : 0.55,
              }}
            >
              <Headphones size={12} /> {s.audio ? "Listen" : "Soon"}
            </span>
            <span
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                padding: "8px 0",
                borderRadius: 999,
                background: palette.accent,
                color: "#fff",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              <BookOpen size={12} /> Read
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ──────────────────────────── ChallengeCard ──────────────────────────── */
function ChallengeCard({ act, palette, doneClicked, onDone }) {
  return (
    <div
      data-testid="polarstar-challenge-card"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 24,
      }}
    >
      <div
        style={{
          padding: "28px 28px 24px",
          borderRadius: 24,
          background: "rgba(255,252,244,0.96)",
          border: `1.5px solid ${palette.accent}55`,
          boxShadow: "0 14px 28px rgba(58,42,24,0.18)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: palette.accent,
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          Today's Challenge
        </div>
        <div style={{ fontFamily: CAVEAT, fontSize: 30, lineHeight: 1.1, color: "#3a2a18" }}>
          {act.challenge}
        </div>
      </div>

      <div
        style={{
          padding: "22px 24px",
          borderRadius: 24,
          background: "rgba(255,252,244,0.96)",
          border: `1.5px solid ${palette.accent}55`,
          boxShadow: "0 14px 28px rgba(58,42,24,0.18)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: palette.accent,
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          You can:
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
          {(act.actions || []).map((a, i) => (
            <li
              key={i}
              data-testid={`polarstar-challenge-action-${i}`}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                fontSize: 15.5,
                lineHeight: 1.5,
                color: "#3a2a18",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: `${palette.accent}22`,
                  color: palette.accent,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  flex: "0 0 auto",
                  marginTop: 1,
                }}
              >
                {i + 1}
              </span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          justifyContent: "center",
          marginTop: 8,
        }}
      >
        <button
          type="button"
          onClick={onDone}
          disabled={doneClicked}
          data-testid="polarstar-challenge-done"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 30px",
            borderRadius: 999,
            border: 0,
            background: doneClicked
              ? `${palette.accent}88`
              : `linear-gradient(180deg, ${palette.accent} 0%, ${palette.accent}dd 100%)`,
            color: "#fff",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "0.06em",
            cursor: doneClicked ? "default" : "pointer",
            boxShadow: "0 12px 24px rgba(58,42,24,0.25)",
            fontFamily: SERIF,
          }}
        >
          {doneClicked ? <Check size={16} /> : <Sparkles size={16} />}
          <span>{doneClicked ? "Lovely. Well done." : "I did it!"}</span>
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────── StepsCard (breathe / project) ──────────────────────────── */
function StepsCard({ act, palette, stepLabel = "Step" }) {
  return (
    <div
      data-testid="polarstar-steps-card"
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "28px 30px 24px",
        borderRadius: 24,
        background: "rgba(255,252,244,0.96)",
        border: `1.5px solid ${palette.accent}55`,
        boxShadow: "0 14px 28px rgba(58,42,24,0.18)",
      }}
    >
      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 16 }}>
        {(act.steps || []).map((s, i) => (
          <li
            key={i}
            data-testid={`polarstar-step-${i}`}
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              padding: "12px 14px",
              borderRadius: 14,
              background: `${palette.accent}11`,
            }}
          >
            <span
              style={{
                flex: "0 0 auto",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: palette.accent,
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {i + 1}
            </span>
            <div>
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: palette.accent,
                  fontWeight: 600,
                  marginBottom: 2,
                }}
              >
                {stepLabel} {i + 1}
              </div>
              <div style={{ fontSize: 16, lineHeight: 1.5, color: "#3a2a18" }}>{s}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ──────────────────────────── MovesGrid ──────────────────────────── */
function MovesGrid({ act, palette }) {
  return (
    <div
      data-testid="polarstar-moves-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 18,
      }}
    >
      {(act.moves || []).map((m, i) => (
        <div
          key={i}
          data-testid={`polarstar-move-${i}`}
          style={{
            padding: "18px 20px 16px",
            borderRadius: 20,
            background: "rgba(255,252,244,0.96)",
            border: `1.5px solid ${palette.accent}55`,
            boxShadow: "0 12px 22px rgba(58,42,24,0.16)",
          }}
        >
          <div style={{ fontFamily: CAVEAT, fontSize: 24, lineHeight: 1.05, color: "#3a2a18", marginBottom: 4 }}>
            {m.title}
          </div>
          <div style={{ fontSize: 14.5, lineHeight: 1.5, color: "#5b4a32" }}>{m.body}</div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────── MovesJourney ──────────────────────────── *
 * §POLARSTAR-PLAY-MOVE iter 86h+++ 2026-02-29
 * Narrative four-step movement journey with absolute session-end and
 * 18-hour cool-down. Implements play_move_mockup.md verbatim.
 * Pure client-side state; localStorage for cool-down; no backend.
 */
const COOLDOWN_KEY = "polarstar-play-move-finished-at";

function MovesJourney({ act, palette, room }) {
  const journey = act.journey || {};
  const moves = act.moves || [];
  const capMin = journey.sessionCapMinutes ?? 10;
  const softMin = journey.softWarningAtMinutes ?? 9;
  const coolHours = journey.coolDownHours ?? 18;

  // Initial phase = "resting" if last finish is within cool-down window
  const initialPhase = (() => {
    try {
      const last = localStorage.getItem(COOLDOWN_KEY);
      if (!last) return "intro";
      const finishedAt = new Date(last).getTime();
      if (Number.isNaN(finishedAt)) return "intro";
      const elapsedH = (Date.now() - finishedAt) / 3_600_000;
      return elapsedH < coolHours ? "resting" : "intro";
    } catch {
      return "intro";
    }
  })();

  const [phase, setPhase] = useState(initialPhase);
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(() => moves.map(() => false));
  const [sessionStartedAt, setSessionStartedAt] = useState(null);
  const [softWarning, setSoftWarning] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Absolute time guard: tick every 30s during "step" phase.
  useEffect(() => {
    if (phase !== "step" || !sessionStartedAt) return undefined;
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(tick);
  }, [phase, sessionStartedAt]);

  useEffect(() => {
    if (phase !== "step" || !sessionStartedAt) return;
    const elapsedMin = (now - sessionStartedAt) / 60_000;
    if (elapsedMin >= capMin) {
      finishToOutro();
    } else if (elapsedMin >= softMin && !softWarning) {
      setSoftWarning(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, sessionStartedAt, phase]);

  function beginJourney() {
    setPhase("step");
    setStepIndex(0);
    setSessionStartedAt(Date.now());
  }

  function markCurrent(done) {
    setCompleted((prev) => {
      const next = prev.slice();
      next[stepIndex] = done;
      return next;
    });
    if (stepIndex + 1 < moves.length) {
      setStepIndex(stepIndex + 1);
    } else {
      finishToOutro();
    }
  }

  function finishToOutro() {
    setPhase("outro");
    try {
      localStorage.setItem(COOLDOWN_KEY, new Date().toISOString());
    } catch {
      /* localStorage unavailable — gracefully skip cool-down persistence */
    }
  }

  const progressDots = (n, completedCount) => {
    const out = [];
    for (let i = 0; i < n; i += 1) {
      out.push(
        <span
          key={i}
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: 14,
            height: 14,
            borderRadius: "50%",
            margin: "0 6px",
            background: i < completedCount ? palette.accent : "transparent",
            border: `2px solid ${palette.accent}`,
            transition: "background 250ms ease",
          }}
        />,
      );
    }
    return out;
  };

  const containerStyle = {
    maxWidth: 760,
    margin: "0 auto",
    padding: "28px 30px 30px",
    borderRadius: 24,
    background: "rgba(255,252,244,0.96)",
    border: `1.5px solid ${palette.accent}55`,
    boxShadow: "0 14px 28px rgba(58,42,24,0.18)",
    textAlign: "center",
  };

  const eyebrowStyle = {
    fontSize: 11,
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color: palette.accent,
    fontWeight: 600,
    marginBottom: 14,
  };

  // ── RESTING (cool-down) ───────────────────────────────────
  if (phase === "resting") {
    return (
      <div data-testid="polarstar-move-journey-resting" style={containerStyle}>
        <div style={eyebrowStyle}>Tomorrow's Adventure</div>
        <div style={{ fontFamily: CAVEAT, fontSize: 38, lineHeight: 1.1, color: "#3a2a18", marginBottom: 12 }}>
          {journey.restingMessage || "The Star is resting. See you tomorrow."}
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#5b4a32", maxWidth: 480, margin: "0 auto 22px" }}>
          You moved your body today. The Little Star kept what you sent it.
          Come back tomorrow and there will be another adventure.
        </p>
        <Link
          to={`/kids-universe/polarstar/${room.id}`}
          data-testid="polarstar-move-journey-back"
          style={primaryBtnStyle(palette)}
        >
          Back to {room.title}
        </Link>
      </div>
    );
  }

  // ── INTRO ─────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div data-testid="polarstar-move-journey-intro" style={containerStyle}>
        <div style={eyebrowStyle}>
          Play &amp; Move · {room.ageLabel}
        </div>
        <div style={{ fontFamily: CAVEAT, fontSize: 38, lineHeight: 1.1, color: "#3a2a18", marginBottom: 18 }}>
          Help the Little Star reach the moon.
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: "#3a2a18", maxWidth: 520, margin: "0 auto 22px" }}>
          {journey.intro}
        </p>
        <div style={{ margin: "10px 0 18px" }} aria-hidden="true">
          {progressDots(moves.length, 0)}
        </div>
        <div style={{ fontSize: 13, color: "#8a7a5a", marginBottom: 22 }}>
          {moves.length} moves · about 5 minutes
        </div>
        <button
          type="button"
          onClick={beginJourney}
          data-testid="polarstar-move-journey-begin"
          style={primaryBtnStyle(palette)}
        >
          Let's begin <ArrowRight size={16} style={{ marginLeft: 6 }} />
        </button>
      </div>
    );
  }

  // ── STEP ──────────────────────────────────────────────────
  if (phase === "step") {
    const m = moves[stepIndex];
    const completedCount = completed.filter(Boolean).length;
    return (
      <div data-testid="polarstar-move-journey-stepcard" style={containerStyle}>
        <div style={{ marginBottom: 16 }} aria-hidden="true">
          {progressDots(moves.length, completedCount)}
        </div>
        <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: palette.accent, fontWeight: 600, marginBottom: 6 }}>
          Step {stepIndex + 1} of {moves.length}
        </div>
        <div
          data-testid={`polarstar-move-journey-step-${stepIndex}`}
          style={{ fontFamily: CAVEAT, fontSize: 34, lineHeight: 1.1, color: "#3a2a18", marginBottom: 14 }}
        >
          {m.title}
        </div>
        <p style={{ fontSize: 16.5, lineHeight: 1.6, color: "#3a2a18", maxWidth: 480, margin: "0 auto 24px" }}>
          {m.body}
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => markCurrent(true)}
            data-testid="polarstar-move-journey-done"
            style={primaryBtnStyle(palette)}
          >
            <Check size={16} style={{ marginRight: 6 }} /> I did it — next move
          </button>
          <button
            type="button"
            onClick={() => markCurrent(false)}
            data-testid="polarstar-move-journey-skip"
            style={secondaryBtnStyle(palette)}
          >
            Skip this one
          </button>
        </div>
        {softWarning && (
          <div
            data-testid="polarstar-move-journey-soft-warning"
            style={{ marginTop: 22, fontSize: 13, color: "#8a7a5a", fontStyle: "italic" }}
          >
            Two minutes left. We will close together.
          </div>
        )}
        <div style={{ marginTop: 22, fontSize: 11.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8a7a5a" }}>
          The page closes itself when the moves are done.
        </div>
      </div>
    );
  }

  // ── OUTRO ─────────────────────────────────────────────────
  return (
    <div data-testid="polarstar-move-journey-outro" style={containerStyle}>
      <div style={{ marginBottom: 18 }} aria-hidden="true">
        {progressDots(moves.length, moves.length)}
      </div>
      <div style={eyebrowStyle}>
        {(journey.outroEyebrow || "the star is glowing").toUpperCase()}
      </div>
      <div style={{ fontFamily: CAVEAT, fontSize: 42, lineHeight: 1.1, color: "#3a2a18", marginBottom: 18 }}>
        <Sparkles size={20} style={{ display: "inline", marginRight: 8, color: palette.accent }} />
        All four moves done.
      </div>
      <p style={{ fontSize: 16, lineHeight: 1.65, color: "#3a2a18", maxWidth: 480, margin: "0 auto 26px" }}>
        {journey.outro}
      </p>
      <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          to={`/kids-universe/polarstar/${room.id}`}
          data-testid="polarstar-move-journey-back"
          style={primaryBtnStyle(palette)}
        >
          Back to {room.title}
        </Link>
        <Link
          to={`/kids-universe/polarstar/${room.id}/story-time`}
          data-testid="polarstar-move-journey-story"
          style={secondaryBtnStyle(palette)}
        >
          One quiet story before bed <ArrowRight size={14} style={{ marginLeft: 4 }} />
        </Link>
      </div>
      <p style={{ marginTop: 28, fontSize: 12.5, color: "#8a7a5a", fontStyle: "italic" }}>
        Don't restart. The Star has done its work for tonight. Tomorrow there will be another adventure.
      </p>
    </div>
  );
}

function primaryBtnStyle(palette) {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "12px 22px",
    borderRadius: 999,
    background: palette.accent,
    color: "#fffbf1",
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: "0.02em",
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    boxShadow: `0 6px 18px ${palette.accent}40`,
  };
}

function secondaryBtnStyle(palette) {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "11px 20px",
    borderRadius: 999,
    background: "transparent",
    color: palette.accent,
    fontWeight: 600,
    fontSize: 14.5,
    letterSpacing: "0.02em",
    textDecoration: "none",
    border: `1.5px solid ${palette.accent}`,
    cursor: "pointer",
  };
}

/* ──────────────────────────── DrawingPlaceholder ──────────────────────────── */
function DrawingPlaceholder({ act, palette, onAlert }) {
  return (
    <div
      data-testid="polarstar-drawing-placeholder"
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "28px 30px",
        borderRadius: 24,
        background: "rgba(255,252,244,0.96)",
        border: `1.5px solid ${palette.accent}55`,
        boxShadow: "0 14px 28px rgba(58,42,24,0.18)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: palette.accent,
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        Drawing Studio
      </div>
      <div style={{ fontFamily: CAVEAT, fontSize: 28, lineHeight: 1.1, color: "#3a2a18", marginBottom: 12 }}>
        Until the digital canvas is ready, here are paper prompts.
      </div>
      <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.55, color: "#5b4a32", fontStyle: "italic" }}>
        Get a paper and your favourite pencils. Pick one prompt below and draw it slowly. There is no right way.
      </p>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
        {(act.prompts || []).map((p, i) => (
          <li
            key={i}
            data-testid={`polarstar-draw-prompt-${i}`}
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              background: `${palette.accent}11`,
              fontSize: 16,
              lineHeight: 1.5,
              color: "#3a2a18",
            }}
          >
            <strong style={{ color: palette.accent, marginRight: 8 }}>{i + 1}.</strong>
            {p}
          </li>
        ))}
      </ul>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button
          type="button"
          onClick={onAlert}
          data-testid="polarstar-draw-canvas-cta"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 22px",
            borderRadius: 999,
            border: `1.5px solid ${palette.accent}`,
            background: "transparent",
            color: palette.accent,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.08em",
            cursor: "pointer",
            fontFamily: SERIF,
          }}
        >
          <Sparkles size={14} />
          <span>Notify me when the digital canvas opens</span>
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────── ReflectionPrompts ──────────────────────────── */
function ReflectionPrompts({ act, palette }) {
  return (
    <div
      data-testid="polarstar-reflection"
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "28px 30px",
        borderRadius: 24,
        background: "rgba(255,252,244,0.96)",
        border: `1.5px solid ${palette.accent}55`,
        boxShadow: "0 14px 28px rgba(58,42,24,0.18)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: palette.accent,
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        A quiet question
      </div>
      <div style={{ fontFamily: CAVEAT, fontSize: 26, lineHeight: 1.1, color: "#3a2a18", marginBottom: 16 }}>
        Pick one. Sit with it. There is no rush.
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
        {(act.prompts || []).map((p, i) => (
          <li
            key={i}
            data-testid={`polarstar-reflect-prompt-${i}`}
            style={{
              padding: "14px 18px",
              borderRadius: 14,
              background: `${palette.accent}11`,
              fontSize: 16,
              lineHeight: 1.55,
              color: "#3a2a18",
              fontStyle: "italic",
            }}
          >
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ──────────────────────────── ComingSoonCard ──────────────────────────── */
/* Coming-Soon copy is brand-voice (no "Coming Soon" string anywhere).
 * Each direction in the world borrows a different metaphor so the
 * waitlist does not feel like the same wall five times. */
const SOON_VOICE = {
  exploration: {
    eyebrow: "The star is warming up",
    intro: "This corner of the world is still drawing its first breath.",
  },
  creation: {
    eyebrow: "A workshop in slow making",
    intro: "Tools are being laid out on the table. Not yet, but soon.",
  },
  discovery: {
    eyebrow: "Next discovery",
    intro: "A small new room is being prepared inside this world.",
  },
};

function ComingSoonCard({ act, palette, onAlert }) {
  const tone = SOON_VOICE[act._roomId] || SOON_VOICE.discovery;
  return (
    <div
      data-testid="polarstar-coming-soon"
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "32px 30px 28px",
        borderRadius: 28,
        background: "rgba(255,252,244,0.96)",
        border: `1.5px solid ${palette.accent}55`,
        boxShadow: "0 14px 28px rgba(58,42,24,0.18)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: palette.accent,
          fontWeight: 600,
          marginBottom: 8,
        }}
        data-testid="polarstar-coming-soon-eyebrow"
      >
        {tone.eyebrow}
      </div>
      <div style={{ fontFamily: CAVEAT, fontSize: 32, lineHeight: 1.1, color: "#3a2a18", marginBottom: 12 }}>
        {act.title}
      </div>
      <p style={{ margin: "0 0 20px", fontSize: 16, lineHeight: 1.6, color: "#5b4a32", fontStyle: "italic" }}>
        {act.blurb} {tone.intro} Leave your name on the Explorer List and you will be the first to know when it opens.
      </p>
      {onAlert && (
        <button
          type="button"
          onClick={onAlert}
          data-testid="polarstar-coming-soon-cta"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 24px",
            borderRadius: 999,
            border: 0,
            background: "linear-gradient(180deg, #d4b67d 0%, #b3935a 100%)",
            color: "#1f2a44",
            fontSize: 13.5,
            fontWeight: 500,
            letterSpacing: "0.08em",
            cursor: "pointer",
            fontFamily: SERIF,
            boxShadow: "0 10px 22px rgba(140,100,30,0.30)",
          }}
        >
          <Sparkles size={14} />
          <span>Save my spot on the Explorer List</span>
        </button>
      )}
    </div>
  );
}
