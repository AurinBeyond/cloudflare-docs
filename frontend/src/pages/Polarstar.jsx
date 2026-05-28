/**
 * Polarstar — /kids-universe/polarstar (preview-only)
 *
 * §POLARSTAR 2026-02-13 — Founder directive: one living world for
 * the Kids layer. The background atmosphere shifts with the visitor's
 * local time of day (morning · day · evening · night). The UI itself
 * stays consistent across all four modes. See /app/memory/POLARSTAR_
 * NORTHSTAR.md for the locked design law.
 *
 * IMPORTANT — this route is a preview sandbox.
 *   • Do NOT touch /kids-universe (parallel route stays alive)
 *   • Do NOT wire billing / Polar SKUs
 *   • Do NOT deploy to production until founder gives explicit signal
 *   • All public copy must avoid "AI / chat / agent / companion"
 */
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen, Palette, Leaf, Heart, Moon, Mail,
  Library, Users, Sparkles, Star, Compass, Sunrise,
} from "lucide-react";
import "@/styles/polarstar.css";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

const AGE_GROUPS = [
  {
    id: "discovery",
    range: "4–6 years",
    title: "Discovery",
    blurb: "Simple stories, drawing, gentle play and parent-child moments.",
  },
  {
    id: "exploration",
    range: "7–10 years",
    title: "Exploration",
    blurb: "Stories, nature quests, kindness missions and imagination journeys.",
  },
  {
    id: "creation",
    range: "11–13 years",
    title: "Creation",
    blurb: "Creative projects, story making, reflection and family memories.",
  },
];

const ACTIVITIES = [
  { id: "story",    Icon: BookOpen, title: "Story Time",     blurb: "Read or listen together." },
  { id: "draw",     Icon: Palette,  title: "Draw Together",  blurb: "Create something from today's story." },
  { id: "nature",   Icon: Leaf,     title: "Explore Nature", blurb: "Find one small wonder outside." },
  { id: "kindness", Icon: Heart,    title: "Kindness Star",  blurb: "Do one kind thing today." },
  { id: "evening",  Icon: Moon,     title: "Evening Room",   blurb: "A gentle bedtime ritual." },
  { id: "memory",   Icon: Mail,     title: "Memory Box",     blurb: "Save a small family moment." },
];

const SIDE_LINKS = [
  { id: "library", Icon: Library, label: "Family Library" },
  { id: "evening", Icon: Moon,    label: "Evening Room" },
  { id: "memory",  Icon: Mail,    label: "Memory Box" },
  { id: "parent",  Icon: Users,   label: "Parent Corner" },
];

function getTimeMode() {
  const h = new Date().getHours();
  if (h >= 5  && h < 11) return "morning";
  if (h >= 11 && h < 17) return "day";
  if (h >= 17 && h < 22) return "evening";
  return "night";
}

const TIME_LABELS = {
  morning: "The world wakes gently",
  day:     "The path is open",
  evening: "Lanterns are lighting",
  night:   "Even the night carries light",
};

function TimeBadge({ mode }) {
  return (
    <p
      className="ps-time-badge"
      data-testid="polarstar-time-badge"
      style={{ fontFamily: SERIF }}
    >
      {TIME_LABELS[mode]}
    </p>
  );
}

function HeroBlock({ mode }) {
  return (
    <section className="ps-hero" data-testid="polarstar-hero">
      <TimeBadge mode={mode} />
      <h1
        className="ps-hero-title"
        style={{ fontFamily: SERIF }}
        data-testid="polarstar-headline"
      >
        Welcome to <span className="ps-italic">Polarstar.</span>
      </h1>
      <p
        className="ps-hero-line"
        style={{ fontFamily: SERIF }}
        data-testid="polarstar-tagline"
      >
        Here, even the night carries light.
      </p>
      <p
        className="ps-hero-sub"
        style={{ fontFamily: SERIF }}
        data-testid="polarstar-subcopy"
      >
        A calm family world for stories, creativity, memories
        and small daily adventures.
      </p>
    </section>
  );
}

function SidePanel() {
  return (
    <aside className="ps-side" data-testid="polarstar-side-panel">
      <div className="ps-card ps-card--child">
        <div className="ps-avatar" aria-hidden="true">
          <Sparkles size={28} />
        </div>
        <p className="ps-eyebrow">Today&apos;s path</p>
        <h3 className="ps-card-title" style={{ fontFamily: SERIF }}>
          Small hearts.<br /><span className="ps-italic">Big memories.</span>
        </h3>
      </div>

      {SIDE_LINKS.map(({ id, Icon, label }) => (
        <button
          key={id}
          type="button"
          className="ps-soft-button"
          data-testid={`polarstar-side-${id}`}
          style={{ fontFamily: SERIF }}
        >
          <Icon size={16} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </aside>
  );
}

function AgeSelector({ selectedId, onSelect }) {
  return (
    <div className="ps-age-row" data-testid="polarstar-age-row">
      {AGE_GROUPS.map((g) => (
        <button
          key={g.id}
          type="button"
          onClick={() => onSelect(g.id)}
          className={`ps-age-card ${selectedId === g.id ? "ps-age-card--active" : ""}`}
          data-testid={`polarstar-age-${g.id}`}
          style={{ fontFamily: SERIF }}
        >
          <span className="ps-eyebrow">{g.range}</span>
          <strong>{g.title}</strong>
        </button>
      ))}
    </div>
  );
}

function ActivityGrid() {
  return (
    <div className="ps-activity-grid" data-testid="polarstar-activity-grid">
      {ACTIVITIES.map(({ id, Icon, title, blurb }) => (
        <button
          key={id}
          type="button"
          className="ps-activity-card"
          data-testid={`polarstar-activity-${id}`}
          style={{ fontFamily: SERIF }}
        >
          <span className="ps-activity-icon" aria-hidden="true">
            <Icon size={26} />
          </span>
          <strong>{title}</strong>
          <small>{blurb}</small>
        </button>
      ))}
    </div>
  );
}

function TomorrowCard() {
  return (
    <div className="ps-tomorrow" data-testid="polarstar-tomorrow">
      <span className="ps-tomorrow-icon" aria-hidden="true">
        <Compass size={26} />
      </span>
      <div>
        <p className="ps-eyebrow">Tomorrow&apos;s Adventure</p>
        <h3 className="ps-tomorrow-title" style={{ fontFamily: SERIF }}>
          A new story awakens softly.
        </h3>
      </div>
    </div>
  );
}

function WorldMap({ selectedId, onSelect }) {
  const selected = AGE_GROUPS.find((g) => g.id === selectedId);
  return (
    <section className="ps-world" data-testid="polarstar-world">
      <AgeSelector selectedId={selectedId} onSelect={onSelect} />

      <div className="ps-selected" data-testid="polarstar-selected-path">
        <p className="ps-eyebrow">Current path</p>
        <h2 className="ps-selected-title" style={{ fontFamily: SERIF }}>
          {selected.title} <span className="ps-italic">Journey</span>
        </h2>
        <p className="ps-selected-blurb">{selected.blurb}</p>
      </div>

      <ActivityGrid />
      <TomorrowCard />
    </section>
  );
}

function RightPanel() {
  return (
    <aside className="ps-right" data-testid="polarstar-right-panel">
      <div className="ps-card ps-card--aurin">
        <div className="ps-avatar ps-avatar--aurin" aria-hidden="true">
          <Star size={26} />
        </div>
        <h3 className="ps-card-title" style={{ fontFamily: SERIF }}>Aurin</h3>
        <p className="ps-card-blurb">Your gentle story guide.</p>
      </div>

      <div className="ps-card ps-card--stars">
        <p className="ps-eyebrow">Story Stars</p>
        <h3 className="ps-card-title" style={{ fontFamily: SERIF }}>24 <span className="ps-of">/ 50</span></h3>
        <div className="ps-progress" aria-hidden="true">
          <span style={{ width: "48%" }} />
        </div>
      </div>

      <div className="ps-card ps-card--family">
        <p className="ps-eyebrow">Family Moment</p>
        <h3 className="ps-card-title" style={{ fontFamily: SERIF }}>
          Share one small <span className="ps-italic">memory</span> today.
        </h3>
      </div>

      <div className="ps-card ps-card--sunrise">
        <span className="ps-sunrise-icon" aria-hidden="true">
          <Sunrise size={22} />
        </span>
        <p className="ps-card-blurb">
          The atmosphere shifts with the hour of your day.
        </p>
      </div>
    </aside>
  );
}

export default function Polarstar() {
  const [selectedId, setSelectedId] = useState("exploration");
  const initialMode = useMemo(() => getTimeMode(), []);
  const [mode, setMode] = useState(initialMode);

  // Refresh every 15 minutes so a long-open tab transitions gracefully
  // from evening → night without forcing a reload.
  useEffect(() => {
    const id = setInterval(() => setMode(getTimeMode()), 15 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main
      className={`ps-world-root ps-mode-${mode}`}
      data-testid="polarstar-root"
      data-time-mode={mode}
    >
      <div className="ps-glow" aria-hidden="true" />
      <div className="ps-noise" aria-hidden="true" />

      <HeroBlock mode={mode} />

      <div className="ps-shell" data-testid="polarstar-shell">
        <SidePanel />
        <WorldMap selectedId={selectedId} onSelect={setSelectedId} />
        <RightPanel />
      </div>

      <footer className="ps-footer" data-testid="polarstar-footer">
        <p style={{ fontFamily: SERIF }}>
          Small moments. <span className="ps-italic">Big memories.</span> Forever.
        </p>
      </footer>
    </main>
  );
}
