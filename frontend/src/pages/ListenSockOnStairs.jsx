/**
 * ListenSockOnStairs.jsx — /listen/hearth/the-sock-on-the-stairs
 *
 * §HEARTH-AUDIO iter 86p 2026-05-31
 *
 * First Hearth evening story. Adult-facing surface — deep blue night
 * house, lantern-amber accents, warm cream typography. Anti-marketing:
 * no pop-ups, no urgency, no "Buy now" buttons. Only a soft italic
 * "Keep the lantern lit →" line back to /the-hearth.
 *
 * UX choice (founder approved 2026-05-31): the story prose is COLLAPSED
 * by default so a tired parent at 11pm meets only a title and a clean
 * audio player. A discreet "Read along →" link reveals the full text.
 *
 * Visual lineage: mirror of /listen/little-star's player anatomy,
 * recoloured for the Hearth (Matrix Aurin) adult palette.
 */

import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Play, Pause, ChevronDown, ChevronUp } from "lucide-react";
import HearthFunnelOptIn from "../components/HearthFunnelOptIn";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const AUDIO_SRC = "/assets/audio/hearth/the-sock-on-the-stairs.mp3";

// Story prose — collapsed by default. Lifted verbatim from the
// manuscript at /app/memory/hearth_story_01_the_sock_on_the_stairs.md
// so the page is self-contained and parents can read along if they choose.
const STORY_PARAGRAPHS = [
  "The house had finally gone quiet.",
  "Not completely.",
  "A washing machine was still turning somewhere behind a closed door. A small light above the stove remained on. A cup stood beside the sink. The tea inside had long since gone cold.",
  "She noticed it and smiled. Not because it was funny. Because it felt familiar.",
  "The day had started with that cup. And somehow it had ended there too. Between those two moments, an entire world had happened.",
  "Questions. Shoes that could not be found. Messages that needed answers. Meals. Schedules. Small problems. Large feelings. The thousand invisible things that seem to appear wherever a family lives.",
  "She pulled out a chair and sat down. Not because there was something left to do. For the first time all day, there wasn't.",
  "That felt strange. The quiet felt almost too large.",
  "She looked toward the staircase. Someone had left a sock on the third step. Just one. The other one was nowhere to be seen.",
  "Tomorrow she would probably find it under a bed. Or beneath a sofa. Or in some impossible place that only children seemed capable of inventing.",
  "She thought about getting up and putting it away. Instead, she stayed where she was. The sock could wait. Tomorrow would arrive whether she prepared for it or not.",
  "For years she had believed that being a good parent meant staying one step ahead of everything. The lunches. The appointments. The forms. The forgotten items. The worries. Especially the worries.",
  "Yet sitting there in the kitchen, she began to wonder if that was true.",
  "Because she knew someone. A father raising five children on his own. No perfect schedule. No perfect system. No secret reserve of energy. Yet every time she saw him, the children were laughing. The house was alive. And somehow, nobody seemed to be keeping score.",
  "That thought stayed with her.",
  "Perhaps being a good parent had less to do with staying ahead of life. And more to do with staying present inside it. The work was never really finished. Perhaps it was never meant to be.",
  "She suddenly realised something strange. Every day she measured herself against a finish line that moved.",
  "The lunches were made. Tomorrow there would be more. The washing was folded. Tomorrow there would be more. The questions were answered. Tomorrow there would be more.",
  "No wonder she felt tired. She had been trying to finish something that was never designed to end.",
  "Perhaps some things were not asking to be completed. Only lived.",
  "The washing machine stopped. The silence that followed felt different. Softer.",
  "She wrapped both hands around the cold cup. The tea had been waiting there since morning. At some point she had forgotten about it. Then remembered it. Then forgotten it again. Just like a dozen other small things that had passed through the day.",
  "Her eyes drifted back toward the staircase. The sock was still there. Waiting patiently on the third step. Its partner was somewhere out in the world. Under a bed. Behind a sofa. Inside a toy box. Or perhaps in some secret place known only to children.",
  "She smiled. Because she already knew what would happen. Tomorrow someone would find it. Or maybe they wouldn't. And somehow life would continue either way.",
  "The thought felt strangely comforting.",
  "For a long time she had believed that every loose end belonged to her. Every missing sock. Every forgotten form. Every unfinished task. Every worry. As if the whole house rested on her remembering.",
  "Yet tonight she wasn't so sure. Children found things. Children solved things. Children grew. Sometimes without her help. Sometimes because of it. And sometimes simply because life kept moving.",
  "She looked around the kitchen. The dishes were still there. The sock was still on the stairs. Tomorrow was still tomorrow. For once, none of it felt urgent.",
  "Perhaps that was the balance nobody talked about. Being there for the people you love. Without disappearing from your own life. Making memories together. And keeping a few quiet moments for yourself. Not one or the other. Both.",
  "The house had finally gone quiet. And for the first time all day, she allowed herself to be quiet too.",
  "Not because everything was finished. It wasn't. Not because every problem had been solved. It hadn't. Not because tomorrow would be easier. She had no way of knowing that.",
  "But because this moment belonged to her. Just as the day had belonged to everyone else.",
  "She picked up the cup. Turned off the light above the stove. And slowly made her way upstairs.",
  "The sock remained exactly where it was. Waiting for tomorrow's adventure. Tomorrow would find it. Or perhaps it wouldn't. Either way, morning would come. The children would laugh. The house would wake. And another imperfect, beautiful day would begin.",
  "But not yet. Tonight could wait a little longer. And so could tomorrow.",
];

export default function ListenSockOnStairs() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [readAlong, setReadAlong] = useState(false);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  const onTime = () => {
    const a = audioRef.current;
    if (!a) return;
    setProgress(a.currentTime);
    if (!duration && a.duration) setDuration(a.duration);
  };

  const onEnded = () => setPlaying(false);

  const fmt = (s) => {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  return (
    <div
      data-testid="listen-sock-on-stairs-page"
      className="min-h-screen w-full"
      style={{
        background:
          "radial-gradient(ellipse at top, #141a20 0%, #0f1418 60%, #0a0d10 100%)",
        fontFamily: SERIF,
        color: "#e8dcc0",
      }}
    >
      <div className="max-w-2xl mx-auto px-6 py-20">
        {/* Eyebrow */}
        <div
          className="text-xs tracking-[0.32em] uppercase mb-4 text-center"
          style={{ color: "#d6a560", letterSpacing: "0.32em" }}
          data-testid="listen-sock-eyebrow"
        >
          The Hearth · Evening story
        </div>

        {/* Title */}
        <h1
          className="text-5xl md:text-6xl text-center mb-5"
          style={{ fontWeight: 500, letterSpacing: "-0.01em", color: "#f4ead0" }}
          data-testid="listen-sock-title"
        >
          The Sock on the Stairs
        </h1>

        {/* Intro */}
        <p
          className="text-center italic text-lg mb-16 px-4 leading-relaxed"
          style={{ color: "#b8a883" }}
          data-testid="listen-sock-intro"
        >
          A six-minute evening story for the parent who finally sat down.
          <br />
          <span
            className="text-sm not-italic tracking-widest uppercase mt-3 inline-block"
            style={{ color: "#d6a560" }}
          >
            Read by Anna · Close your eyes if you'd like.
          </span>
        </p>

        {/* Player card */}
        <div
          className="rounded-2xl px-8 py-10 mb-10"
          style={{
            background: "rgba(20, 26, 32, 0.6)",
            border: "1px solid rgba(214, 165, 96, 0.22)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.4)",
          }}
          data-testid="listen-sock-player-card"
        >
          <audio
            ref={audioRef}
            src={AUDIO_SRC}
            preload="metadata"
            onTimeUpdate={onTime}
            onLoadedMetadata={onTime}
            onEnded={onEnded}
            data-testid="listen-sock-audio-element"
          />

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={toggle}
              className="flex items-center justify-center rounded-full transition-all hover:scale-105"
              style={{
                width: 72,
                height: 72,
                background: "#d6a560",
                color: "#0f1418",
                boxShadow: "0 4px 28px rgba(214, 165, 96, 0.4)",
              }}
              data-testid="listen-sock-play-toggle"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
            </button>

            <div className="flex-1">
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "rgba(214, 165, 96, 0.18)" }}
                data-testid="listen-sock-progress-track"
              >
                <div
                  className="h-full"
                  style={{
                    width: `${duration ? (progress / duration) * 100 : 0}%`,
                    background: "#d6a560",
                    transition: "width 200ms linear",
                  }}
                  data-testid="listen-sock-progress-bar"
                />
              </div>
              <div
                className="flex justify-between text-sm mt-2"
                style={{ color: "#9c8a64" }}
              >
                <span data-testid="listen-sock-current-time">{fmt(progress)}</span>
                <span data-testid="listen-sock-duration">{fmt(duration)}</span>
              </div>
            </div>
          </div>

          <p
            className="text-xs italic text-center mt-6"
            style={{ color: "#7c6e54" }}
            data-testid="listen-sock-rights-note"
          >
            One story. Read by the person who wrote it. For a quiet evening hour.
          </p>
        </div>

        {/* Read-along toggle — discreet, anti-laviin */}
        <div className="text-center mb-4" data-testid="listen-sock-readalong-wrap">
          <button
            type="button"
            onClick={() => setReadAlong((v) => !v)}
            className="inline-flex items-center gap-2 text-sm tracking-wider uppercase transition-opacity hover:opacity-80"
            style={{
              color: "#d6a560",
              letterSpacing: "0.2em",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            data-testid="listen-sock-readalong-toggle"
            aria-expanded={readAlong}
          >
            {readAlong ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {readAlong ? "Close the page" : "Read along"}
          </button>
        </div>

        {/* Collapsible story prose */}
        {readAlong && (
          <article
            className="mt-8 mb-12 px-2 md:px-6"
            style={{ color: "#d8c9a8" }}
            data-testid="listen-sock-story-text"
          >
            {STORY_PARAGRAPHS.map((p, i) => (
              <p
                key={i}
                className="text-lg leading-loose mb-6"
                style={{ fontWeight: 400 }}
              >
                {p}
              </p>
            ))}
          </article>
        )}

        {/* §HEARTH-FUNNEL — quiet email opt-in for the 3-letter sequence */}
        <HearthFunnelOptIn source="listen/hearth/the-sock-on-the-stairs" />

        {/* Lantern line — quiet anti-marketing micro-conversion to /the-hearth */}
        <p
          className="text-center italic text-sm mt-20 leading-relaxed"
          style={{
            color: "#9c8a64",
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
          }}
          data-testid="listen-sock-lantern-line"
        >
          If this story found a quiet place in your evening,
          <br />
          <Link
            to="/the-hearth"
            style={{
              color: "#d6a560",
              textDecoration: "none",
              borderBottom: "1px solid rgba(214,165,96,0.4)",
              paddingBottom: "2px",
            }}
            data-testid="listen-sock-hearth-link"
          >
            keep the lantern lit
          </Link>
          .
        </p>

        {/* Footer breadcrumb back */}
        <div className="mt-16 text-center">
          <Link
            to="/the-hearth"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase"
            style={{ color: "#7c6e54", opacity: 0.85 }}
            data-testid="listen-sock-home-link"
          >
            <ArrowLeft size={14} />
            The Hearth
          </Link>
        </div>
      </div>
    </div>
  );
}
