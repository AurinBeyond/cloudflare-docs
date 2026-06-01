/**
 * ListenGardenInNovember.jsx — /listen/hearth/the-garden-in-november
 *
 * §HEARTH-AUDIO 2026-06-01 — Hearth Story #5 (final of the shelf).
 * Same anatomy as the previous four listen pages. Differences:
 * (1) "Story 5 of 5" shelf signal,
 * (2) previous-story breadcrumb points to Story #4,
 * (3) lantern-line copy nudges the listener that the first shelf
 *     is now complete.
 *
 * NOT YET ROUTED. App.js + HEARTH_STORIES wire-up happens in the
 * evening, once the audio file has been generated via:
 *     python3 /app/scripts/text_to_voice.py the-garden-in-november \
 *             --world hearth --voice anna-adult
 */
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowLeft, Play, Pause, ChevronDown, ChevronUp } from "lucide-react";
import HearthFunnelOptIn from "../components/HearthFunnelOptIn";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const AUDIO_SRC = "/assets/audio/hearth/the-garden-in-november.mp3";

const STORY_PARAGRAPHS = [
  "You step outside at quarter past ten to put the recycling out, and you forget for a second to come back in.",
  "It is November. The garden is in the state that gardens get in when nobody has been paying attention. The hydrangeas have gone brown at the edges. The lavender has the leggy, exhausted look of something that gave its best in July and is now refusing to perform any more. There are bulbs you meant to plant in October still in their paper bag on the bench by the door.",
  "You stand on the back step in your slippers and you can see your own breath.",
  "The kid is upstairs. She is fifteen. She closed her bedroom door about an hour ago. You haven't checked.",
  "You think about your garden.",
  "Specifically, you think about how you used to feel about your garden in November of the year you became a parent. You remember being furious at it. You remember standing in this exact spot holding a six-month-old and thinking, with quiet outrage, that nothing was blooming and the whole place looked like a graveyard and what was the point.",
  "You were younger. You wanted the garden to be a garden every month of the year. You wanted everything to be in flower at once. You took the absence of colour as a failure of either the soil or yourself.",
  "Nobody told you, then, that this is just what gardens do in November.",
  "They go quiet.",
  "Not dead. Not failing. Not broken. Just busy with a kind of work that happens below the surface and that you do not get to see.",
  "You look at the brown hydrangea heads, which you have not cut back, because somebody on the radio said years ago that you should leave them until spring because they protect the new buds from frost. You don't know if that's true. You leave them anyway. You leave most things in this garden alone now, in a way you did not when you were 32.",
  "You sit down on the cold back step.",
  "You think about your daughter.",
  "She has been quieter for about six weeks. Not unhappy quiet — something else. Something more interior. She still comes down for dinner. She still says yes to the trip to her grandmother's. She still hugs you in the kitchen sometimes, briefly, in passing, the way someone might touch a banister. But she has stopped narrating.",
  "You used to know almost everything by 9pm. You used to know what the lunch table dynamics were. You used to know which boy was being annoying and which girl had been mean about somebody's shoes. You used to get the full transcript, voluntarily, while she was eating yoghurt.",
  "Now you get a sentence. Sometimes two. Then she goes upstairs and closes the door and you have no idea what she is reading or thinking or carrying.",
  "For a while, in October, you took this as a problem.",
  "You were tempted to ask. To probe. To go in and sit on the edge of the bed and say \"is everything okay\" in the voice that means \"I am worried and would like to be reassured.\" You did it once and you watched her face do something private — a small flinch you were not meant to see — and you understood you had walked on a seed bed in your boots.",
  "You did not do it again.",
  "You look at the garden in the dark.",
  "The garden is also doing private work right now. Underground. Inside the bulbs you didn't plant. Inside the bare apple branch. Inside the soil that looks like nothing is happening. There is, in fact, an enormous amount happening. Cells rearranging. Sap withdrawing. Roots going deeper. The whole organism preparing for something you will not get to see until April.",
  "If you went out there with a trowel right now and tried to \"help\" — turn the soil, prune the roses, dig up the bulbs to check on them — you would do real damage. Not a little damage. Real damage. You would interrupt the underground work.",
  "The most loving thing you can do for a garden in November is notice that it is in November, and let it be in November.",
  "You feel the cold step through your slippers and you understand, sitting there in your own back garden at quarter past ten, that your daughter is in her November.",
  "Not depressed. Not in trouble. Not pulling away.",
  "Just doing the underground work of becoming someone slightly new, which is private work, which has to be done in the dark, which nobody — not even her — gets to fully see while it is happening.",
  "Your job is not to dig her up to check on her.",
  "Your job is to be the warm house behind the garden. The window with the light on. The smell of cooking that drifts out into the cold when she opens the back door in March.",
  "That is all. That is the whole thing.",
  "You stand up. Your knees crack. You go back inside. You do not go upstairs. You do not check on her. You leave her door closed.",
  "You make a cup of tea you don't really want, because the kettle sound is a familiar sound in this house and you want her to hear it if she is awake.",
  "You sit at the kitchen table.",
  "The kitchen light is on. The back door is closed but unlocked.",
  "You are the November house. You are the warmth she does not notice. You are doing the most important work of your parenting year, and it looks, from the outside, like absolutely nothing.",
  "And tomorrow you will get up. And you will not ask her what is happening underground.",
  "You will just put the kettle on.",
  "Quietly. In the warm house. Behind the garden.",
];

export default function ListenGardenInNovember() {
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

  const fmt = (s) => {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  return (
    <div
      data-testid="listen-garden-page"
      className="min-h-screen w-full"
      style={{
        background:
          "radial-gradient(ellipse at top, #141a20 0%, #0f1418 60%, #0a0d10 100%)",
        fontFamily: SERIF,
        color: "#e8dcc0",
      }}
    >
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div
          className="text-xs tracking-[0.32em] uppercase mb-4 text-center"
          style={{ color: "#d6a560" }}
          data-testid="listen-garden-eyebrow"
        >
          The Hearth · Evening story
        </div>

        <h1
          className="text-5xl md:text-6xl text-center mb-3"
          style={{ fontWeight: 500, letterSpacing: "-0.01em", color: "#f4ead0" }}
          data-testid="listen-garden-title"
        >
          The Garden in November
        </h1>

        <p
          className="text-center text-xs tracking-[0.22em] uppercase mb-5"
          style={{ color: "#7c6e54" }}
          data-testid="listen-garden-shelf-position"
        >
          Story 5 of 5
        </p>

        <p
          className="text-center italic text-lg mb-16 px-4 leading-relaxed"
          style={{ color: "#b8a883" }}
          data-testid="listen-garden-intro"
        >
          A seven-minute evening story for the parent of a teenager
          who has gone underground for the season.
          <br />
          <span
            className="text-sm not-italic tracking-widest uppercase mt-3 inline-block"
            style={{ color: "#d6a560" }}
          >
            Read by Anna · Close your eyes if you'd like.
          </span>
        </p>

        <div
          className="rounded-2xl px-8 py-10 mb-10"
          style={{
            background: "rgba(20, 26, 32, 0.6)",
            border: "1px solid rgba(214, 165, 96, 0.22)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.4)",
          }}
          data-testid="listen-garden-player-card"
        >
          <audio
            ref={audioRef}
            src={AUDIO_SRC}
            preload="metadata"
            onTimeUpdate={onTime}
            onLoadedMetadata={onTime}
            onEnded={() => setPlaying(false)}
            data-testid="listen-garden-audio-element"
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
              data-testid="listen-garden-play-toggle"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
            </button>
            <div className="flex-1">
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "rgba(214, 165, 96, 0.18)" }}
                data-testid="listen-garden-progress-track"
              >
                <div
                  className="h-full"
                  style={{
                    width: `${duration ? (progress / duration) * 100 : 0}%`,
                    background: "#d6a560",
                    transition: "width 200ms linear",
                  }}
                  data-testid="listen-garden-progress-bar"
                />
              </div>
              <div className="flex justify-between text-sm mt-2" style={{ color: "#9c8a64" }}>
                <span data-testid="listen-garden-current-time">{fmt(progress)}</span>
                <span data-testid="listen-garden-duration">{fmt(duration)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
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
            data-testid="listen-garden-readalong-toggle"
            aria-expanded={readAlong}
          >
            {readAlong ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {readAlong ? "Close the page" : "Read along"}
          </button>
        </div>

        {readAlong && (
          <article
            className="mt-8 mb-12 px-2 md:px-6"
            style={{ color: "#d8c9a8" }}
            data-testid="listen-garden-story-text"
          >
            {STORY_PARAGRAPHS.map((p, i) => (
              <p key={i} className="text-lg leading-loose mb-6">
                {p}
              </p>
            ))}
          </article>
        )}

        <p
          className="text-center text-xs tracking-[0.22em] uppercase mt-16 mb-2"
          style={{ color: "#7c6e54" }}
        >
          Previous story
        </p>
        <p className="text-center mb-12">
          <Link
            to="/listen/hearth/the-window-left-open"
            className="inline-flex items-center gap-2 italic"
            style={{
              color: "#d6a560",
              borderBottom: "1px solid rgba(214,165,96,0.4)",
              paddingBottom: "2px",
            }}
            data-testid="listen-garden-prev-link"
          >
            <ArrowLeft size={14} />
            The Window Left Open
          </Link>
        </p>

        {/* §HEARTH-FUNNEL — quiet email opt-in for the 3-letter sequence */}
        <HearthFunnelOptIn source="listen/hearth/the-garden-in-november" />

        <p
          className="text-center italic text-sm mt-16 leading-relaxed"
          style={{ color: "#9c8a64", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}
          data-testid="listen-garden-lantern-line"
        >
          The first shelf of five is now complete.
          <br />
          <Link
            to="/the-hearth"
            style={{
              color: "#d6a560",
              borderBottom: "1px solid rgba(214,165,96,0.4)",
              paddingBottom: "2px",
            }}
            data-testid="listen-garden-hearth-link"
          >
            Keep the lantern lit
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
