/**
 * Polarstar — world-map layout (NOT a dashboard).
 *
 * §POLARSTAR v5 2026-02-13 — Founder corrective: stop placing
 * dashboard cards on a pretty background. The landscape IS the
 * interface. Three compact age signposts at the top. Fairies live
 * inside the world, not above cards. Activity stones float along
 * the visible path.
 *
 * Preview sandbox only. Do NOT deploy. Do NOT touch billing.
 */
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Palette, Leaf, Heart, Moon, Mail,
  Star, Library, Sparkles, Music, Compass,
} from "lucide-react";
import PolarstarAtmosphere from "@/components/PolarstarAtmosphere";
import { POLARSTAR_AGE_GROUPS } from "@/data/polarstarAgeGroups";
import "@/styles/polarstar.css";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

const FAIRY_SPEECH = {
  night: {
    discovery:   "Is it time for a bedtime story?",
    exploration: "Shall we look at the stars?",
    creation:    "What will you create tonight?",
    leftCorner:  "The lanterns are warming up.",
    rightCorner: "One more wonder before rest.",
  },
  evening: {
    discovery:   "Almost time for stories.",
    exploration: "One more adventure first?",
    creation:    "What did today make you imagine?",
    leftCorner:  "Lanterns are lighting.",
    rightCorner: "The river is quiet now.",
  },
  day: {
    discovery:   "Shall we draw the sun?",
    exploration: "I found a secret path.",
    creation:    "Let's make something beautiful.",
    leftCorner:  "Did the sun wake you too?",
    rightCorner: "There are flowers everywhere.",
  },
  morning: {
    discovery:   "Good morning, little one.",
    exploration: "The path is open today.",
    creation:    "Today is a fresh page.",
    leftCorner:  "The mist is lifting.",
    rightCorner: "A new day, a new story.",
  },
};

/* ── Activity nodes scattered along the path ───────────────── */
const PATH_NODES = [
  { id: "story",    Icon: BookOpen, label: "Story Time",     pos: { top: "33%", left: "20%" } },
  { id: "draw",     Icon: Palette,  label: "Draw Together",  pos: { top: "46%", left: "12%" } },
  { id: "nature",   Icon: Leaf,     label: "Nature Quest",   pos: { top: "39%", left: "78%" } },
  { id: "kindness", Icon: Heart,    label: "Kindness Star",  pos: { top: "54%", left: "84%" } },
  { id: "evening",  Icon: Moon,     label: "Evening Room",   pos: { top: "62%", left: "32%" } },
  { id: "memory",   Icon: Mail,     label: "Memory Box",     pos: { top: "70%", left: "68%" } },
  { id: "library",  Icon: Library,  label: "Family Library", pos: { top: "78%", left: "20%" } },
  { id: "music",    Icon: Music,    label: "Calm Music",     pos: { top: "82%", left: "82%" } },
];


function Header({ mode }) {
  const titleByMode = {
    morning: "The world wakes gently",
    day:     "The path is open",
    evening: "Lanterns are lighting",
    night:   "Even the night carries light",
  };
  return (
    <header className="ps5-header" data-testid="polarstar-header">
      <p className="ps5-kicker" style={{ fontFamily: SERIF }}>
        Kids Universe Journey
      </p>
      <h1 className="ps5-title" style={{ fontFamily: SERIF }} data-testid="polarstar-headline">
        Polarstar
      </h1>
      <p className="ps5-sub" style={{ fontFamily: SERIF }}>
        {titleByMode[mode]} · <span className="ps5-italic">
          A calm world of stories, creativity and connection for the whole family.
        </span>
      </p>
    </header>
  );
}

/* ── Age regions sit as compact signposts under the header ─── */
function AgeSignposts({ mode }) {
  const navigate = useNavigate();
  const speech = FAIRY_SPEECH[mode] || FAIRY_SPEECH.night;
  return (
    <section className="ps5-ages" data-testid="polarstar-ages">
      {POLARSTAR_AGE_GROUPS.map((g, idx) => {
        const Icon = g.Icon;
        const positionClass = ["ps5-age--left", "ps5-age--center", "ps5-age--right"][idx];
        return (
          <div
            key={g.id}
            className={`ps5-age ${positionClass}`}
            data-testid={`polarstar-age-region-${g.id}`}
          >
            {/* Fairy lives in the landscape, not above a card */}
            <div className="ps5-fairy" data-testid={`polarstar-fairy-${g.id}`}>
              <img
                src={`${process.env.PUBLIC_URL || ""}${g.guideImage}`}
                alt=""
                className="ps5-fairy-img"
                loading="lazy"
              />
              <div className="ps5-speech ps5-speech--fairy">
                <p style={{ fontFamily: SERIF }}>{speech[g.id]}</p>
              </div>
            </div>

            <button
              type="button"
              className="ps5-signpost"
              data-testid={`polarstar-signpost-${g.id}`}
              onClick={() => navigate(g.route)}
              style={{ fontFamily: SERIF }}
            >
              <span className="ps5-sign-icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <span className="ps5-sign-age">{g.age}</span>
              <span className="ps5-sign-title">
                {g.title.replace(" Path", " ")}<em>Path</em>
              </span>
            </button>
          </div>
        );
      })}
    </section>
  );
}

/* ── Clickable stones / leaves on the path ─────────────────── */
function PathNodes() {
  return (
    <div className="ps5-path-layer" aria-label="Polarstar path locations">
      {PATH_NODES.map(({ id, Icon, label, pos }) => (
        <button
          key={id}
          type="button"
          className={`ps5-stone ps5-stone--${id}`}
          style={{ ...pos, fontFamily: SERIF }}
          data-testid={`polarstar-stone-${id}`}
        >
          <span className="ps5-stone-icon" aria-hidden="true">
            <Icon size={18} />
          </span>
          <span className="ps5-stone-label">{label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Tomorrow's Adventure box pinned to bottom-left ─────────── */
function TomorrowBox() {
  return (
    <aside className="ps5-tomorrow" data-testid="polarstar-tomorrow">
      <span className="ps5-tomorrow-icon" aria-hidden="true">
        <Compass size={20} />
      </span>
      <div>
        <p className="ps5-eyebrow">Tomorrow&apos;s Adventure</p>
        <h3 className="ps5-tomorrow-title" style={{ fontFamily: SERIF }}>
          A new story <em>awakens softly.</em>
        </h3>
      </div>
    </aside>
  );
}

/* ── Aurin guide pinned to bottom-right ─────────────────────── */
function AurinGuide() {
  return (
    <aside className="ps5-aurin" data-testid="polarstar-aurin">
      <div className="ps5-aurin-icon" aria-hidden="true">
        <Sparkles size={20} />
      </div>
      <div>
        <p className="ps5-eyebrow">Aurin</p>
        <h3 className="ps5-aurin-title" style={{ fontFamily: SERIF }}>
          Your gentle <em>story guide.</em>
        </h3>
        <div className="ps5-stars">
          <Star size={11} aria-hidden="true" />
          <span>24 / 50 stars</span>
        </div>
      </div>
    </aside>
  );
}

/* ── Decorative corner fairies (live IN the world) ──────────── */
function CornerFairy({ corner, speech, name }) {
  return (
    <div
      className={`ps5-corner ps5-corner--${corner}`}
      data-testid={`polarstar-corner-${corner}`}
      aria-hidden="true"
    >
      <img
        src={`${process.env.PUBLIC_URL || ""}/polarstar/guide-${name}.png`}
        alt=""
        className="ps5-corner-img"
        loading="lazy"
      />
      <div className="ps5-speech ps5-speech--corner">
        <p style={{ fontFamily: SERIF }}>{speech}</p>
      </div>
    </div>
  );
}

export default function Polarstar() {
  return (
    <PolarstarAtmosphere testid="polarstar-root">
      {(mode) => {
        const speech = FAIRY_SPEECH[mode] || FAIRY_SPEECH.night;
        return (
          <>
            <Header mode={mode} />
            <AgeSignposts mode={mode} />
            <PathNodes />
            <TomorrowBox />
            <AurinGuide />

            <CornerFairy corner="left"  name="discovery" speech={speech.leftCorner}  />
            <CornerFairy corner="right" name="exploration" speech={speech.rightCorner} />

            <footer className="ps5-footer" data-testid="polarstar-footer">
              <p style={{ fontFamily: SERIF }}>
                Small moments. <span className="ps5-italic">Big memories.</span> Forever.
              </p>
            </footer>
          </>
        );
      }}
    </PolarstarAtmosphere>
  );
}
