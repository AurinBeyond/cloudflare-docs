/**
 * ListenCoatOnChair.jsx — /listen/hearth/the-coat-on-the-chair
 *
 * §HEARTH-AUDIO iter 86r 2026-05-31 — Hearth Story #3.
 * Same anatomy as the previous two listen pages. Differences:
 * (1) "Story 3 of 5" shelf signal,
 * (2) previous-story breadcrumb points to Story #2.
 */
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowLeft, Play, Pause, ChevronDown, ChevronUp } from "lucide-react";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const AUDIO_SRC = "/assets/audio/hearth/the-coat-on-the-chair.mp3";

const STORY_PARAGRAPHS = [
  "Your 14-year-old hasn't worn that coat in two weeks.",
  "It's the one you bought him last winter. He chose it. You sat in the shop for forty minutes while he tried on six different ones and you texted your partner photos and then he settled on this one and you paid and you remember thinking, in the car on the way home, that he was getting old enough to choose things for himself.",
  "That feels like a long time ago and also like last Tuesday.",
  "You sit at the kitchen table and look at the coat on the chair, and you suddenly realise something that hits in a specific place under your ribs.",
  "He is becoming someone who is going to be cold without telling you about it.",
  "Not on purpose. Not because he doesn't love you. Just because that is the shape of becoming a person.",
  "You used to know when he was cold before he did. You'd see him from across a playground and your hand would already be reaching for an extra layer in the bag. You were the early-warning system for his small body. You were the layer between him and the weather.",
  "That job is ending. Not in one day. Slowly. Across months you barely noticed. The coat on the chair is just the part you can see tonight.",
  "There will be a hundred other things you used to do for him that he will, in the next few years, do for himself without mentioning it to you. Cold hands. Empty water bottles. A small cut on his hand that heals before you see it. A bad afternoon at school that he handles in the bus on the way home, without crying, without telling anyone.",
  "Each of those is a piece of independence that is going to make you proud one day, and quietly heartbroken about ten minutes earlier.",
  "You sit with the coat for a long time. You don't fold it. You don't put it away. You don't even move it to his room. You leave it where he left it, because moving it would be solving a problem he didn't ask you to solve.",
  "The whole project of parenting, you realise, has been quietly rewriting itself for years and nobody warned you. The job description changes every six months and nobody hands you the new one. You just keep showing up, and the kid keeps becoming, and the work keeps shifting, and one Tuesday at 11pm you look at a coat on a chair and realise you have been promoted out of the only job you knew how to do.",
  "Promoted, not retired.",
  "Because here is the thing nobody tells parents of teenagers.",
  "The role of being needed is ending. The role of being there is just beginning.",
  "Those are different jobs. The first job is loud. The first job is visible. The first job comes with daily proof — a fed kid, a bandaged knee, a found shoe, a comforted cry. You finish the day and you can count what you did.",
  "The second job is mostly invisible. The second job is being the familiar shape in the kitchen when he comes home. The car you don't miss the parents' evening at. The phone you pick up at midnight, six years from now, when he calls from a city you have never been to and needs to talk for nineteen minutes about nothing in particular.",
  "You don't get to count what you did. You get to be available.",
  "That is the harder job. Not because it requires more work. Because it requires more patience and almost no proof.",
  "You think about your own mother for a moment. You think about all the small things she did when you were 14 that you didn't notice — the hallway light, the tea she made you when you came home, the way she didn't ask about the friend you had stopped mentioning. You didn't notice them. You couldn't have. You were becoming a person.",
  "She was being there. And it took you twenty-two years to understand what she had been doing.",
  "You look at the coat again.",
  "He will be cold one day this winter and he will not tell you. He will figure it out — borrow a jumper, buy a hat, run the last hundred metres. He will solve it without needing you, and he will not even know that he solved it.",
  "That is the success. That is what you have spent fourteen years building.",
  "It is also why you are sitting in the kitchen at 11pm feeling something you don't have a clean word for.",
  "You leave the coat on the chair. You turn off the kitchen light. You go to bed in a house where one of the people you love most is becoming, very slowly, somebody you do not entirely know any more.",
  "And tomorrow you will get up. And you will not say a word about the coat. You will just be in the kitchen.",
  "Available. Quiet. There.",
];

export default function ListenCoatOnChair() {
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
      data-testid="listen-coat-on-chair-page"
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
          data-testid="listen-coat-eyebrow"
        >
          The Hearth · Evening story
        </div>

        <h1
          className="text-5xl md:text-6xl text-center mb-3"
          style={{ fontWeight: 500, letterSpacing: "-0.01em", color: "#f4ead0" }}
          data-testid="listen-coat-title"
        >
          The Coat on the Chair
        </h1>

        <p
          className="text-center text-xs tracking-[0.22em] uppercase mb-5"
          style={{ color: "#7c6e54" }}
          data-testid="listen-coat-shelf-position"
        >
          Story 3 of 5
        </p>

        <p
          className="text-center italic text-lg mb-16 px-4 leading-relaxed"
          style={{ color: "#b8a883" }}
          data-testid="listen-coat-intro"
        >
          A seven-minute evening story for the parent of a teenager
          who is becoming someone they do not entirely know any more.
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
          data-testid="listen-coat-player-card"
        >
          <audio
            ref={audioRef}
            src={AUDIO_SRC}
            preload="metadata"
            onTimeUpdate={onTime}
            onLoadedMetadata={onTime}
            onEnded={() => setPlaying(false)}
            data-testid="listen-coat-audio-element"
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
              data-testid="listen-coat-play-toggle"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
            </button>
            <div className="flex-1">
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "rgba(214, 165, 96, 0.18)" }}
                data-testid="listen-coat-progress-track"
              >
                <div
                  className="h-full"
                  style={{
                    width: `${duration ? (progress / duration) * 100 : 0}%`,
                    background: "#d6a560",
                    transition: "width 200ms linear",
                  }}
                  data-testid="listen-coat-progress-bar"
                />
              </div>
              <div className="flex justify-between text-sm mt-2" style={{ color: "#9c8a64" }}>
                <span data-testid="listen-coat-current-time">{fmt(progress)}</span>
                <span data-testid="listen-coat-duration">{fmt(duration)}</span>
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
            data-testid="listen-coat-readalong-toggle"
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
            data-testid="listen-coat-story-text"
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
            to="/listen/hearth/the-light-in-the-hallway"
            className="inline-flex items-center gap-2 italic"
            style={{
              color: "#d6a560",
              borderBottom: "1px solid rgba(214,165,96,0.4)",
              paddingBottom: "2px",
            }}
            data-testid="listen-coat-prev-link"
          >
            <ArrowLeft size={14} />
            The Light in the Hallway
          </Link>
        </p>

        <p
          className="text-center italic text-sm mt-16 leading-relaxed"
          style={{ color: "#9c8a64", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}
          data-testid="listen-coat-lantern-line"
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
            data-testid="listen-coat-hearth-link"
          >
            keep the lantern lit
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
