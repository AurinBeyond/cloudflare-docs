/**
 * Polarstar v6 — /kids-universe/polarstar
 *
 * §POLARSTAR v6 2026-02-13 — Built to match the founder reference
 * image (Kids Universe Journey day meadow) pixel-faithfully:
 *
 *   ┌──────── HEADER (title centered) ──────────┐
 *   │ 4–6 DISCOVERY │ 7–10 EXPLORATION │ 11–13 CREATION │
 *   │  Daily Path   │  Adventure Path  │  Creation Studio
 *   │     icons     │     7 days       │      6 tiles    │
 *   │ fairy + speech│ fairy + speech   │ fairy + speech  │
 *   │   ── meadow + winding path + bridge ──    │
 *   │ Morning Boost │  (path stones)  │ Daily Challenges│
 *   │  +  TENT      │                 │ + Today I Feel  │
 *   │ ── bottom nav: Home Stories Activities … ──     │
 *   └────────────────────────────────────────────┘
 *
 * Preview sandbox only. NO billing. NO production deploy.
 */
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Palette, Leaf, Heart, Music, Star, Compass,
  Calendar, Mail, Users, Sun, Sparkles, Pencil, Mic,
  Hammer, Share2, Film, Search, Blocks, Code,
  Home, Gamepad2, Video, Folder, HelpCircle, Tent,
  Droplet, BookOpenCheck, Activity, Smile,
} from "lucide-react";
import PolarstarAtmosphere from "@/components/PolarstarAtmosphere";
import "@/styles/polarstar.css";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

/* ─ Age zone data ─ */
const AGE_ZONES = [
  {
    id: "discovery",
    band: "4–6 YEARS",
    title: "Discovery",
    accent: "#7aa8d4",
    route: "/kids-universe/polarstar/discovery",
    fairy: "/polarstar/guide-discovery.png",
    speech: "Is it time for a bedtime story?",
    section: "Daily Path",
    items: [
      { id: "morning",  Icon: Sun,      label: "Morning Mindful Start" },
      { id: "story",    Icon: BookOpen, label: "Story Time" },
      { id: "play",     Icon: Leaf,     label: "Play & Move" },
      { id: "create",   Icon: Palette,  label: "Create" },
      { id: "kindness", Icon: Heart,    label: "Kindness Mission" },
    ],
  },
  {
    id: "exploration",
    band: "7–10 YEARS",
    title: "Exploration",
    accent: "#7fc0bf",
    route: "/kids-universe/polarstar/exploration",
    fairy: "/polarstar/guide-exploration.png",
    speech: "Curious today? Let's explore!",
    section: "Today's Adventure Path",
    items: [
      { id: "discover", Icon: Search,   label: "Discover & Wonder",  day: 1 },
      { id: "build",    Icon: Blocks,   label: "Build & Create",     day: 2 },
      { id: "code",     Icon: Code,     label: "Code & Solve",       day: 3 },
      { id: "nature",   Icon: Leaf,     label: "Explore Nature",     day: 4 },
      { id: "help",     Icon: Heart,    label: "Help & Care",        day: 5 },
      { id: "music",    Icon: Music,    label: "Music & Move",       day: 6 },
      { id: "reflect",  Icon: Star,     label: "Share & Reflect",    day: 7 },
    ],
  },
  {
    id: "creation",
    band: "11–13 YEARS",
    title: "Creation",
    accent: "#b69ed5",
    route: "/kids-universe/polarstar/creation",
    fairy: "/polarstar/guide-creation.png",
    speech: "What will you create today?",
    section: "Creation Studio",
    items: [
      { id: "design",  Icon: Pencil,  label: "Design Lab" },
      { id: "build",   Icon: Hammer,  label: "Build Something" },
      { id: "code",    Icon: Code,    label: "Code Studio" },
      { id: "media",   Icon: Film,    label: "Media Studio" },
      { id: "voice",   Icon: Mic,     label: "Voice Studio" },
      { id: "share",   Icon: Share2,  label: "Share Project" },
    ],
  },
];

const DAILY_CHALLENGES = [
  { id: "water",  Icon: Droplet,        label: "Drink water & take care",  done: true },
  { id: "kind",   Icon: Heart,          label: "Do something kind",        done: true },
  { id: "learn",  Icon: BookOpenCheck,  label: "Learn something new",      done: true },
  { id: "move",   Icon: Activity,       label: "Move your body",           done: false },
];

const FEELINGS = [
  { id: "happy",   label: "Happy",   emoji: "🙂" },
  { id: "calm",    label: "Calm",    emoji: "😌" },
  { id: "excited", label: "Excited", emoji: "🤩" },
  { id: "tired",   label: "Tired",   emoji: "😴" },
  { id: "other",   label: "Other",   emoji: "💜" },
];

const NAV_ITEMS = [
  { id: "home",       Icon: Home,        label: "Home", active: true },
  { id: "stories",    Icon: BookOpen,    label: "Stories" },
  { id: "activities", Icon: Sparkles,    label: "Activities" },
  { id: "games",      Icon: Gamepad2,    label: "Games" },
  { id: "music",      Icon: Music,       label: "Music" },
  { id: "videos",     Icon: Video,       label: "Videos" },
  { id: "resources",  Icon: Folder,      label: "Resources" },
];

/* ─ Top welcome strip ─ */
function TopStrip() {
  return (
    <div className="psv6-top" data-testid="polarstar-v6-top">
      <div className="psv6-welcome">
        <div className="psv6-avatar" aria-hidden="true">
          <Sparkles size={20} />
        </div>
        <div>
          <p style={{ fontFamily: SERIF }}>
            Welcome, <em>little one</em>.
          </p>
          <div className="psv6-level">
            <span>Explorer Level 7</span>
            <div className="psv6-level-bar">
              <span style={{ width: "62%" }} />
            </div>
            <span className="psv6-level-num">125 / 200</span>
          </div>
        </div>
      </div>

      <h1 className="psv6-title" style={{ fontFamily: SERIF }} data-testid="polarstar-headline">
        Kids Universe Journey
      </h1>

      <div className="psv6-quick-actions">
        <button type="button" className="psv6-qa" data-testid="psv6-calendar">
          <Calendar size={18} />
          <span>Calendar</span>
          <em className="psv6-badge">3</em>
        </button>
        <button type="button" className="psv6-qa" data-testid="psv6-messages">
          <Mail size={18} />
          <span>Messages</span>
        </button>
        <button type="button" className="psv6-qa" data-testid="psv6-parents">
          <Users size={18} />
          <span>Parents</span>
        </button>
      </div>
    </div>
  );
}

/* ─ Age zone panel ─ */
function AgeZone({ zone }) {
  const navigate = useNavigate();
  return (
    <div className={`psv6-zone psv6-zone--${zone.id}`} data-testid={`psv6-zone-${zone.id}`}>
      <div className="psv6-fairy" aria-hidden="true" data-testid={`psv6-fairy-${zone.id}`}>
        <img
          src={`${process.env.PUBLIC_URL || ""}${zone.fairy}`}
          alt=""
          className="psv6-fairy-img"
          loading="lazy"
        />
        <div className="psv6-speech" data-testid={`psv6-speech-${zone.id}`}>
          <p style={{ fontFamily: SERIF }}>{zone.speech}</p>
        </div>
      </div>

      <button
        type="button"
        className="psv6-zone-card"
        onClick={() => navigate(zone.route)}
        data-testid={`psv6-zone-card-${zone.id}`}
        style={{ fontFamily: SERIF }}
      >
        <p className="psv6-zone-band" style={{ color: zone.accent }}>{zone.band}</p>
        <h2 className="psv6-zone-title">{zone.title}</h2>
        <p className="psv6-zone-section">{zone.section}</p>

        <div className={`psv6-items psv6-items--${zone.items.length}`}>
          {zone.items.map(({ id, Icon, label, day }) => (
            <div key={id} className="psv6-item" data-testid={`psv6-item-${zone.id}-${id}`}>
              {day && <span className="psv6-day">Day {day}</span>}
              <div className="psv6-item-icon" aria-hidden="true">
                <Icon size={18} />
              </div>
              <small>{label}</small>
            </div>
          ))}
        </div>
      </button>
    </div>
  );
}

/* ─ Morning Boost (bottom-left) ─ */
function MorningBoost() {
  return (
    <aside className="psv6-morning" data-testid="psv6-morning">
      <div className="psv6-tent-icon" aria-hidden="true">
        <Tent size={24} />
      </div>
      <div>
        <p className="psv6-eyebrow" style={{ color: "#a8845a" }}>Morning Boost</p>
        <h3 style={{ fontFamily: SERIF }}>
          Start your day with <em>calm and focus.</em>
        </h3>
      </div>
      <div className="psv6-sun" aria-hidden="true">
        <Sun size={28} />
      </div>
    </aside>
  );
}

/* ─ Collect Discovery Stars (center path chest) ─ */
function StarsChest() {
  return (
    <button
      type="button"
      className="psv6-chest"
      data-testid="psv6-chest"
      style={{ fontFamily: SERIF }}
    >
      <Star size={20} aria-hidden="true" />
      <span>Collect Discovery Stars</span>
    </button>
  );
}

/* ─ Daily Challenges + Today I Feel (bottom-right) ─ */
function ChallengesAndFeelings() {
  return (
    <aside className="psv6-right-rail" data-testid="psv6-right-rail">
      <div className="psv6-challenges">
        <p className="psv6-eyebrow" style={{ color: "#6f9b6f" }}>Daily Challenges</p>
        <ul>
          {DAILY_CHALLENGES.map(({ id, Icon, label, done }) => (
            <li key={id} className={done ? "psv6-done" : ""}>
              <span className="psv6-check" aria-hidden="true">
                {done ? "✓" : "○"}
              </span>
              <Icon size={14} aria-hidden="true" />
              <span style={{ fontFamily: SERIF }}>{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="psv6-feelings">
        <p className="psv6-eyebrow" style={{ color: "#c08a52" }}>Today I Feel</p>
        <div className="psv6-feelings-row">
          {FEELINGS.map(({ id, label, emoji }) => (
            <button
              key={id}
              type="button"
              className="psv6-feeling"
              data-testid={`psv6-feeling-${id}`}
            >
              <span className="psv6-feeling-emoji" aria-hidden="true">{emoji}</span>
              <small>{label}</small>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ─ Bottom nav bar ─ */
function BottomNav() {
  return (
    <nav className="psv6-nav" data-testid="psv6-nav">
      {NAV_ITEMS.map(({ id, Icon, label, active }) => (
        <button
          key={id}
          type="button"
          className={`psv6-nav-btn ${active ? "psv6-nav-btn--active" : ""}`}
          data-testid={`psv6-nav-${id}`}
        >
          <Icon size={18} aria-hidden="true" />
          <small>{label}</small>
        </button>
      ))}
      <div className="psv6-nav-cta" data-testid="psv6-nav-cta">
        <div className="psv6-cta-icon" aria-hidden="true">
          <Compass size={22} />
        </div>
        <span style={{ fontFamily: SERIF }}>
          What will we <em>discover today?</em>
        </span>
      </div>
    </nav>
  );
}

export default function Polarstar() {
  return (
    <PolarstarAtmosphere testid="polarstar-root">
      {() => (
        <div className="psv6-wrap" data-testid="psv6-wrap">
          <TopStrip />

          <section className="psv6-age-row" data-testid="psv6-age-row">
            {AGE_ZONES.map((z) => <AgeZone key={z.id} zone={z} />)}
          </section>

          <div className="psv6-mid-shelf" data-testid="psv6-mid-shelf">
            <MorningBoost />
            <StarsChest />
            <ChallengesAndFeelings />
          </div>

          <BottomNav />
        </div>
      )}
    </PolarstarAtmosphere>
  );
}
