/**
 * SpatialCompass.jsx — §SPATIAL-COMPASS 2026-05-28
 *
 * A founder-locked sub-section inside the Course Room (Alistair's
 * shelf). Three ancient principles of spatial biomechanics —
 * Power Position, Cognitive Load, and The First Foot — rendered as
 * a calm three-card grid. Not Feng Shui in the consumer sense:
 * structural nervous-system hygiene for the room around the body.
 *
 * Anti-wellness vocabulary throughout. No crystals, no chakras.
 *
 * 100% English UI.
 */

import { Compass, Eye, LayoutGrid } from "lucide-react";

const SERIF = '"Cormorant Garamond", Georgia, serif';

const PRINCIPLES = [
  {
    id: "power_position",
    icon: Compass,
    eyebrow: "Principle I",
    title: "The Power Position",
    body:
      "Place the chair, the bed, the desk so the entrance to the room is in your direct line of sight, never behind you. The reptilian brain spends a measurable amount of its day in low-grade vigilance when the door is at your back — energy you cannot then spend on what you actually came to do. Move the furniture by ten degrees. Feel the difference within a week.",
    practice:
      "Tonight, sit in your most-used chair. Where is the door? If it is behind you, schedule the move for tomorrow morning.",
  },
  {
    id: "cognitive_load",
    icon: Eye,
    eyebrow: "Principle II",
    title: "Cognitive Load",
    body:
      "Every unfinished object in your line of sight is a background process — a tab the body cannot close. The half-opened mail, the laundry pile, the cable that no longer leads anywhere, the device you have not used in fourteen months: each holds a sliver of your daily attention without permission. The room does the housekeeping if you remove the unfinished from the field of view.",
    practice:
      "Pick one surface — desk, kitchen counter, bedside table. Remove everything except what is in active use this week. Notice the room after.",
  },
  {
    id: "first_foot",
    icon: LayoutGrid,
    eyebrow: "Principle III",
    title: "The First Foot",
    body:
      "The first thing the foot touches in the morning sets the contract for the day. A cold polished floor signals one nervous-system message; a softer surface, another. This is structural, not sentimental: the body is reading the floor. Decide what you would like the first signal to be, and make the floor honest with that decision.",
    practice:
      "Place a small, deliberate object exactly where your foot lands first when you rise. A small rug, a worn book, the right pair of socks. Let the floor mean something tomorrow.",
  },
];

export default function SpatialCompass() {
  return (
    <div data-testid="spatial-compass" className="aurin-card p-7 md:p-9">
      <div className="mb-7">
        <p
          className="text-[10.5px] tracking-[0.36em] uppercase mb-3"
          style={{ color: "#6a8fbe", fontFamily: SERIF }}
          data-testid="spatial-compass-eyebrow"
        >
          ✦ The Spatial Compass · 3 ancient principles
        </p>
        <h3
          className="text-[26px] md:text-[32px] leading-[1.2] font-light italic mb-3"
          style={{ color: "#1c2536", fontFamily: SERIF }}
          data-testid="spatial-compass-title"
        >
          The room you live in is doing more than holding the walls.
        </h3>
        <p
          className="text-[14.5px] leading-[1.8] max-w-[58ch]"
          style={{ color: "#5a6378", fontFamily: SERIF }}
        >
          Three structural rules that high-performers, founders, and quiet
          builders use to stop their environment from drinking their day.
          Not decoration. Not optimisation. Just three honest moves the
          nervous system has been waiting for.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PRINCIPLES.map((p) => {
          const Icon = p.icon;
          return (
            <article
              key={p.id}
              data-testid={`spatial-compass-card-${p.id}`}
              className="rounded-[1.1rem] p-6"
              style={{
                background: "rgba(106,143,190,0.05)",
                border: "1px solid rgba(106,143,190,0.18)",
                fontFamily: SERIF,
              }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    width: 34,
                    height: 34,
                    background: "rgba(106,143,190,0.12)",
                    border: "1px solid rgba(106,143,190,0.28)",
                  }}
                >
                  <Icon size={15} color="#6a8fbe" strokeWidth={1.5} />
                </div>
                <p
                  className="text-[10px] tracking-[0.32em] uppercase"
                  style={{ color: "#6a8fbe" }}
                >
                  {p.eyebrow}
                </p>
              </div>
              <h4
                className="text-[22px] leading-[1.2] font-light italic mb-3"
                style={{ color: "#1c2536" }}
              >
                {p.title}
              </h4>
              <p
                className="text-[13.5px] leading-[1.75] mb-4"
                style={{ color: "#5a6378" }}
              >
                {p.body}
              </p>
              <div
                className="rounded-lg p-3.5"
                style={{
                  background: "rgba(106,143,190,0.08)",
                  border: "1px solid rgba(106,143,190,0.16)",
                }}
              >
                <p
                  className="text-[10.5px] tracking-[0.30em] uppercase mb-1.5"
                  style={{ color: "#6a8fbe" }}
                >
                  Tonight
                </p>
                <p
                  className="text-[12.5px] leading-[1.7] italic"
                  style={{ color: "#3d4759" }}
                >
                  {p.practice}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <p
        className="mt-7 text-[12px] italic leading-[1.7]"
        style={{ color: "#7a8499", fontFamily: SERIF }}
        data-testid="spatial-compass-pdf-note"
      >
        A downloadable PDF — <em>The Spatial Operating System</em> — is being
        prepared and will appear here when finished. No rush. The three
        principles above are already enough work for a week.
      </p>
    </div>
  );
}
