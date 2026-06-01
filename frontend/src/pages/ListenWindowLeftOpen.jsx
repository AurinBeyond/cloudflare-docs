/**
 * ListenWindowLeftOpen.jsx — /listen/hearth/the-window-left-open
 *
 * §HEARTH-AUDIO 2026-06-01 — Hearth Story #4.
 * Same anatomy as the previous three listen pages. Differences:
 * (1) "Story 4 of 5" shelf signal,
 * (2) previous-story breadcrumb points to Story #3.
 *
 * NOT YET ROUTED. App.js + HEARTH_STORIES wire-up happens in the
 * evening, once the audio file has been generated via:
 *     python3 /app/scripts/text_to_voice.py the-window-left-open \
 *             --world hearth --voice anna-adult
 */
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowLeft, Play, Pause, ChevronDown, ChevronUp } from "lucide-react";
import HearthFunnelOptIn from "../components/HearthFunnelOptIn";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const AUDIO_SRC = "/assets/audio/hearth/the-window-left-open.mp3";

const STORY_PARAGRAPHS = [
  "Your 13-year-old left her bedroom window open.",
  "You notice it when you go upstairs to put the laundry away. The curtain is moving in a way that isn't quite right and you walk over and the window is open about a hand's width and the cold air is coming in steady and the room smells like outside.",
  "She is not in the room. She is downstairs, on the sofa, watching something on her phone with one earbud in and the other dangling against her collarbone.",
  "You stand by the open window.",
  "Your first thought is to close it. Of course your first thought is to close it. You are her parent. Her room is cold. That is a problem you can solve in three seconds and it would not even count as work.",
  "You put your hand on the latch.",
  "And then you don't close it.",
  "You stand there with your hand on the cold metal and you understand something that you have been arriving at slowly for about a year.",
  "She opened that window for a reason.",
  "Maybe she wanted the room to smell different. Maybe she was hot. Maybe she wanted to hear the rain. Maybe she did it without thinking and forgot. Maybe a friend texted something that made her feel trapped and she walked across the room and pushed the window open the way you used to roll the car window down on the motorway when you were sixteen and needed to remember you had a body.",
  "You will not find out. She will not tell you. She will not even know there was anything to tell.",
  "This is the part of parenting nobody briefed you on.",
  "For thirteen years you had access to almost everything. You knew what she ate. You knew when she pooped. You knew what scared her at night and which side of the bed she preferred and which song made her cry in the car and which teacher she hated in October and got fond of by March.",
  "You were inside her weather.",
  "And now you are outside it.",
  "Now there is a window in her room that she opened for a reason that belongs to her, and your job — your actual job, the new one — is to not close it.",
  "Even though closing it would be kinder to the room. Even though closing it would be the responsible thing. Even though every nerve in your body is telling you that cold air and teenage bedrooms is a problem you are paid to solve.",
  "You take your hand off the latch.",
  "You stand there for a moment longer and you notice the small things on her desk. A half-drunk glass of water. A book you didn't know she was reading. A bracelet you don't recognise. The corner of a notebook you are not going to open.",
  "You are in a museum of someone who used to be a small soft animal that lived in your arms and is now a person with a private interior that has nothing to do with you, and that is exactly what you wanted, and also it hurts in a precise place under your sternum that you have no good language for.",
  "You walk out of her room. You leave the window the way she left it.",
  "You go downstairs and you do not say anything about it. You make a cup of tea. She is still on the sofa with one earbud in. You sit on the other end of the sofa and you don't ask what she is watching.",
  "She doesn't look up.",
  "But after a few minutes, without saying anything, she shifts her feet a little to the side so that one of her socks is touching your leg.",
  "That is all. That is the entire interaction.",
  "You don't acknowledge it. She doesn't acknowledge it. You both just sit there for the rest of the episode with one of her socks pressed against the side of your knee, like a hand on a shoulder, like a small private signal in a language neither of you would ever name out loud.",
  "And you understand, finally, what the new job is.",
  "The new job is not to keep her warm. The new job is to be the safe end of the sofa.",
  "That is it. That is the whole brief. You are a piece of known furniture in a house full of unknown weather, and your only task is to stay exactly where she expects you to be, so that when she needs to put her foot somewhere safe, the foot has somewhere to go.",
  "It is a much smaller job than the one you used to have. It is also a much harder one.",
  "Because there is no proof of work at the end of the day. There is no fed-and-bathed checklist. There is just a sock against a knee, on a Tuesday, in November, and the fact that she chose your end of the sofa instead of going to her room.",
  "You finish your tea. You go to bed in a house where the bedroom window upstairs is still open, and the cold air is still coming in, and that is correct.",
  "And tomorrow you will get up. And you will not mention the window. You will just be in the kitchen.",
  "Familiar. Available. The safe end.",
];

export default function ListenWindowLeftOpen() {
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
      data-testid="listen-window-page"
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
          data-testid="listen-window-eyebrow"
        >
          The Hearth · Evening story
        </div>

        <h1
          className="text-5xl md:text-6xl text-center mb-3"
          style={{ fontWeight: 500, letterSpacing: "-0.01em", color: "#f4ead0" }}
          data-testid="listen-window-title"
        >
          The Window Left Open
        </h1>

        <p
          className="text-center text-xs tracking-[0.22em] uppercase mb-5"
          style={{ color: "#7c6e54" }}
          data-testid="listen-window-shelf-position"
        >
          Story 4 of 5
        </p>

        <p
          className="text-center italic text-lg mb-16 px-4 leading-relaxed"
          style={{ color: "#b8a883" }}
          data-testid="listen-window-intro"
        >
          A seven-minute evening story for the parent of a teenager
          whose interior is starting to belong only to her.
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
          data-testid="listen-window-player-card"
        >
          <audio
            ref={audioRef}
            src={AUDIO_SRC}
            preload="metadata"
            onTimeUpdate={onTime}
            onLoadedMetadata={onTime}
            onEnded={() => setPlaying(false)}
            data-testid="listen-window-audio-element"
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
              data-testid="listen-window-play-toggle"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
            </button>
            <div className="flex-1">
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "rgba(214, 165, 96, 0.18)" }}
                data-testid="listen-window-progress-track"
              >
                <div
                  className="h-full"
                  style={{
                    width: `${duration ? (progress / duration) * 100 : 0}%`,
                    background: "#d6a560",
                    transition: "width 200ms linear",
                  }}
                  data-testid="listen-window-progress-bar"
                />
              </div>
              <div className="flex justify-between text-sm mt-2" style={{ color: "#9c8a64" }}>
                <span data-testid="listen-window-current-time">{fmt(progress)}</span>
                <span data-testid="listen-window-duration">{fmt(duration)}</span>
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
            data-testid="listen-window-readalong-toggle"
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
            data-testid="listen-window-story-text"
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
            to="/listen/hearth/the-coat-on-the-chair"
            className="inline-flex items-center gap-2 italic"
            style={{
              color: "#d6a560",
              borderBottom: "1px solid rgba(214,165,96,0.4)",
              paddingBottom: "2px",
            }}
            data-testid="listen-window-prev-link"
          >
            <ArrowLeft size={14} />
            The Coat on the Chair
          </Link>
        </p>

        {/* §HEARTH-FUNNEL — quiet email opt-in for the 3-letter sequence */}
        <HearthFunnelOptIn source="listen/hearth/the-window-left-open" />

        <p
          className="text-center italic text-sm mt-16 leading-relaxed"
          style={{ color: "#9c8a64", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}
          data-testid="listen-window-lantern-line"
        >
          If this story found a quiet place in your evening,
          <br />
          <Link
            to="/the-hearth"
            style={{
              color: "#d6a560",
              borderBottom: "1px solid rgba(214,165,96,0.4)",
              paddingBottom: "2px",
            }}
            data-testid="listen-window-hearth-link"
          >
            keep the lantern lit
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
