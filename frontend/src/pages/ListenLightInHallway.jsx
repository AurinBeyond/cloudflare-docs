/**
 * ListenLightInHallway.jsx — /listen/hearth/the-light-in-the-hallway
 *
 * §HEARTH-AUDIO iter 86q 2026-05-31
 *
 * Second Hearth evening story. Same anatomy as ListenSockOnStairs:
 * deep blue house, lantern-amber accents, collapsible Read along.
 *
 * Adds: a quiet "Story 2 of 5" caption beneath the title so visitors
 * sense the wider shelf without any marketing tone.
 */

import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Play, Pause, ChevronDown, ChevronUp } from "lucide-react";
import HearthFunnelOptIn from "../components/HearthFunnelOptIn";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const AUDIO_SRC = "/assets/audio/hearth/the-light-in-the-hallway.mp3";

const STORY_PARAGRAPHS = [
  "The light in the hallway had been on for as long as she could remember.",
  "A small one. Just enough to see by, if you needed to find the bathroom in the middle of the night. Not bright enough to wake anyone.",
  "She had left it on every evening for years. At first because the children were small. Then because they were not so small. Then because she had simply forgotten that she had ever turned it off.",
  "Tonight, walking past it in her socks, she paused.",
  "The hallway was empty. The doors along it were closed.",
  "Behind one of them, a child she had once held in one arm was now nearly as tall as her. Behind another, a child who used to call out at three in the morning now slept through until breakfast. Behind a third, no child at all. Only a room that used to belong to one, and now held a guitar, a desk, and the quiet weight of a person becoming someone she did not yet entirely know.",
  "She stood there a long time. Long enough for the light to feel like a small living thing. A tiny breath of warmth in the hallway between her and the rest of the night.",
  "It struck her then. For all these years she had thought she was leaving the light on for them. In case they needed to find their way back to her.",
  "Tonight she wondered if perhaps it had also been on for herself. A small steady proof, set into the wall. That somebody was still here. That somebody still remembered. That the house was still tended, even when no hand was on the door.",
  "A long time ago she had believed that being a good parent meant being there for everything. Every step. Every fall. Every question. Every fear at midnight. Awake. Available. Within reach.",
  "She had carried that belief for so long it had begun to feel like part of her spine.",
  "Yet somewhere along the way, the children had stopped needing her at midnight. Then at bedtime. Then for homework. Then for stories. Each piece of need had quietly fallen away. Not because they had stopped loving her. Because they had simply grown into versions of themselves that could carry more of their own night.",
  "She had not noticed when it happened. There was no single evening when she said goodbye to being needed in that way. It had unfolded slowly, like a season turning underneath a long week of cloud.",
  "She thought about the light again. How small it was. How easy to overlook. How impossible to miss when it was off.",
  "Perhaps a parent did not need to be there for everything. Perhaps a parent only needed to be the light in the hallway.",
  "A small steady proof that the house was still tended. That if a child opened their door at any hour, the path back to the warm part of the home would be visible. Not lit by floodlights. Not announced. Just there. Quiet. Faithful.",
  "She thought about all the years she had spent trying to be the floodlight. Awake at every hour. Vigilant at every door. Available for every question that was never asked. She had often felt tired. She had often felt that she was failing.",
  "Yet here, in the hallway, with one small bulb between her and the dark, she began to wonder if she had been measuring her parenting against the wrong instrument.",
  "Perhaps the floodlight was not the standard. Perhaps it was the hallway light. Small. Easy. Enough.",
  "She turned to go back to her room. The light stayed on behind her. It would stay on tonight, as it had stayed on every other night. It would still be there in the morning, faintly visible against the daylight, until someone finally noticed and switched it off without thinking. It would come back on the next evening. It would keep coming back on. For as long as a single child in the house might need a quiet thread to follow home.",
  "And perhaps for a little longer than that. Because even after the children were gone — not gone, just grown — the hallway would still belong to a house. And the house would still belong to a parent who once stood there in her socks. And the parent would still need to know, somewhere inside her, that she had been the light in the hallway.",
  "Not the sun. Not the floodlight. Only the small steady one. Only enough to see by. Only enough to find the way back.",
  "She closed her bedroom door behind her. The hallway remained as it had always been. Quiet. Warm. Lit. And in some small, unspoken way, kept.",
];

export default function ListenLightInHallway() {
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
      data-testid="listen-light-in-hallway-page"
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
          style={{ color: "#d6a560", letterSpacing: "0.32em" }}
          data-testid="listen-light-eyebrow"
        >
          The Hearth · Evening story
        </div>

        <h1
          className="text-5xl md:text-6xl text-center mb-3"
          style={{ fontWeight: 500, letterSpacing: "-0.01em", color: "#f4ead0" }}
          data-testid="listen-light-title"
        >
          The Light in the Hallway
        </h1>

        {/* Quiet shelf-signal: "Story 2 of 5" — no marketing tone */}
        <p
          className="text-center text-xs tracking-[0.22em] uppercase mb-5"
          style={{ color: "#7c6e54" }}
          data-testid="listen-light-shelf-position"
        >
          Story 2 of 5
        </p>

        <p
          className="text-center italic text-lg mb-16 px-4 leading-relaxed"
          style={{ color: "#b8a883" }}
          data-testid="listen-light-intro"
        >
          A six-minute evening story for the parent who has been trying to be the floodlight.
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
          data-testid="listen-light-player-card"
        >
          <audio
            ref={audioRef}
            src={AUDIO_SRC}
            preload="metadata"
            onTimeUpdate={onTime}
            onLoadedMetadata={onTime}
            onEnded={onEnded}
            data-testid="listen-light-audio-element"
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
              data-testid="listen-light-play-toggle"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
            </button>

            <div className="flex-1">
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "rgba(214, 165, 96, 0.18)" }}
                data-testid="listen-light-progress-track"
              >
                <div
                  className="h-full"
                  style={{
                    width: `${duration ? (progress / duration) * 100 : 0}%`,
                    background: "#d6a560",
                    transition: "width 200ms linear",
                  }}
                  data-testid="listen-light-progress-bar"
                />
              </div>
              <div
                className="flex justify-between text-sm mt-2"
                style={{ color: "#9c8a64" }}
              >
                <span data-testid="listen-light-current-time">{fmt(progress)}</span>
                <span data-testid="listen-light-duration">{fmt(duration)}</span>
              </div>
            </div>
          </div>

          <p
            className="text-xs italic text-center mt-6"
            style={{ color: "#7c6e54" }}
            data-testid="listen-light-rights-note"
          >
            One story. Read by the person who wrote it. For a quiet evening hour.
          </p>
        </div>

        <div className="text-center mb-4" data-testid="listen-light-readalong-wrap">
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
            data-testid="listen-light-readalong-toggle"
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
            data-testid="listen-light-story-text"
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

        {/* Previous story breadcrumb — keeps the shelf gently visible */}
        <p
          className="text-center text-xs tracking-[0.22em] uppercase mt-16 mb-2"
          style={{ color: "#7c6e54" }}
          data-testid="listen-light-prev-eyebrow"
        >
          Previous story
        </p>
        <p className="text-center mb-12">
          <Link
            to="/listen/hearth/the-sock-on-the-stairs"
            className="inline-flex items-center gap-2 italic"
            style={{
              color: "#d6a560",
              textDecoration: "none",
              borderBottom: "1px solid rgba(214,165,96,0.4)",
              paddingBottom: "2px",
            }}
            data-testid="listen-light-prev-link"
          >
            <ArrowLeft size={14} />
            The Sock on the Stairs
          </Link>
        </p>

        {/* §HEARTH-FUNNEL — quiet email opt-in for the 3-letter sequence */}
        <HearthFunnelOptIn source="listen/hearth/the-light-in-the-hallway" />

        <p
          className="text-center italic text-sm mt-16 leading-relaxed"
          style={{
            color: "#9c8a64",
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
          }}
          data-testid="listen-light-lantern-line"
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
            data-testid="listen-light-hearth-link"
          >
            keep the lantern lit
          </Link>
          .
        </p>

        <div className="mt-16 text-center">
          <Link
            to="/the-hearth"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase"
            style={{ color: "#7c6e54", opacity: 0.85 }}
            data-testid="listen-light-home-link"
          >
            <ArrowLeft size={14} />
            The Hearth
          </Link>
        </div>
      </div>
    </div>
  );
}
