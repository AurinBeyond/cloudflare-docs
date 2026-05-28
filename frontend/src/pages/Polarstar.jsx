/**
 * Polarstar v8 — REFERENCE-IMAGE CLICK MAP.
 *
 * §POLARSTAR v8 2026-02-13 — Founder lock-in. The painted reference
 * image IS the interface. UI is a layer of invisible click-zones
 * positioned over each painted button. Hover reveals a subtle brass
 * outline. This is the only way to honour the founder's pixel-exact
 * visual identity.
 *
 * Click-zone coordinates are PERCENTAGES of the reference image
 * (2048x2048 painted as 16:9 viewport with object-fit cover). The
 * background scales with `background-size: 100% auto` so percentages
 * stay aligned across viewports.
 *
 * Preview-only sandbox. No billing. No production.
 */
import { useNavigate } from "react-router-dom";
import PolarstarAtmosphere from "@/components/PolarstarAtmosphere";
import "@/styles/polarstar.css";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

/* Click zones — values are { top, left, w, h } as percentages of
   the painted background. Hand-tuned against the reference image
   (ChatGPT 29 mai 2026 00:00:57.png). */
const ZONES = [
  /* 3 age paths (top row) */
  { id: "discovery",   label: "Discovery Path",    route: "/kids-universe/polarstar/discovery",   top: 26, left: 11, w: 22, h: 12 },
  { id: "exploration", label: "Exploration Path",  route: "/kids-universe/polarstar/exploration", top: 26, left: 33, w: 34, h: 12 },
  { id: "creation",    label: "Creation Path",     route: "/kids-universe/polarstar/creation",    top: 26, left: 67, w: 22, h: 12 },

  /* Left column */
  { id: "library",     label: "Our Family Library", route: "/kids-universe/polarstar/library",     top: 41, left: 3.5, w: 7,   h: 8 },
  { id: "adventure",   label: "Adventure Hub",      route: "/kids-universe/polarstar/adventure",   top: 43, left: 11, w: 28,  h: 13 },
  { id: "tomorrow",    label: "Tomorrow's Adventure", route: "/kids-universe/polarstar/tomorrow",  top: 64, left: 17, w: 14,  h: 13 },

  /* Center path nodes */
  { id: "stars",       label: "Collect Story Stars", route: "/kids-universe/polarstar/stars",      top: 50, left: 41, w: 17,  h: 12 },
  { id: "story-space", label: "My Story Space",      route: "/kids-universe/polarstar/story-space", top: 67, left: 30, w: 26,  h: 13 },
  { id: "family",      label: "Family Connection Zone", route: "/kids-universe/polarstar/family",  top: 70, left: 49, w: 14,  h: 13 },

  /* Right column */
  { id: "evening",     label: "Evening Room",       route: "/kids-universe/polarstar/evening",     top: 47, left: 62, w: 28,  h: 18 },
  { id: "never-alone", label: "You are never alone", route: "/kids-universe/polarstar/aurin",      top: 60, left: 91, w: 7,   h: 8 },
  { id: "keepsakes",   label: "Our Keepsakes",      route: "/kids-universe/polarstar/keepsakes",   top: 70, left: 71, w: 22,  h: 13 },
];

/* Activity tiles on the path (the 7 day pills inside Exploration). */
const EXPLORATION_DAYS = [
  { id: "d1", route: "/kids-universe/polarstar/exploration?day=1", left: 35.5 },
  { id: "d2", route: "/kids-universe/polarstar/exploration?day=2", left: 39.5 },
  { id: "d3", route: "/kids-universe/polarstar/exploration?day=3", left: 43.5 },
  { id: "d4", route: "/kids-universe/polarstar/exploration?day=4", left: 47.5 },
  { id: "d5", route: "/kids-universe/polarstar/exploration?day=5", left: 51.5 },
  { id: "d6", route: "/kids-universe/polarstar/exploration?day=6", left: 55.5 },
  { id: "d7", route: "/kids-universe/polarstar/exploration?day=7", left: 59.5 },
];

/* Bottom rail items (Calm Music … Help & Support). */
const RAIL = [
  { id: "music",    label: "Calm Music",           left: 17 },
  { id: "breath",   label: "Breathing Together",   left: 27 },
  { id: "sleep",    label: "Sleep Well",           left: 36 },
  { id: "parent",   label: "Parent Corner",        left: 64 },
  { id: "guides",   label: "Guides & Tips",        left: 76 },
  { id: "help",     label: "Help & Support",       left: 86 },
];

export default function Polarstar() {
  const navigate = useNavigate();

  return (
    <PolarstarAtmosphere testid="polarstar-root">
      {() => (
        <div className="pw8-stage" data-testid="pw8-stage">

          {/* Each painted region becomes an invisible click target. */}
          {ZONES.map(({ id, label, route, top, left, w, h }) => (
            <button
              key={id}
              type="button"
              className="pw8-zone"
              data-testid={`pw8-zone-${id}`}
              aria-label={label}
              onClick={() => navigate(route)}
              style={{ top: `${top}%`, left: `${left}%`, width: `${w}%`, height: `${h}%` }}
            >
              <span className="pw8-zone-label" style={{ fontFamily: SERIF }}>{label}</span>
            </button>
          ))}

          {/* Exploration day chips */}
          {EXPLORATION_DAYS.map(({ id, route, left }) => (
            <button
              key={id}
              type="button"
              className="pw8-day"
              data-testid={`pw8-day-${id}`}
              aria-label={`Exploration ${id}`}
              onClick={() => navigate(route)}
              style={{ top: "31%", left: `${left}%` }}
            />
          ))}

          {/* Bottom rail — invisible buttons aligned with painted footer */}
          {RAIL.map(({ id, label, left }) => (
            <button
              key={id}
              type="button"
              className="pw8-rail-btn"
              data-testid={`pw8-rail-${id}`}
              aria-label={label}
              style={{ left: `${left}%` }}
            />
          ))}

        </div>
      )}
    </PolarstarAtmosphere>
  );
}
