/**
 * BodyTemple.jsx — § ARCHIVED 2026-02-13
 *
 * FOUNDER DIRECTIVE 2026-02-13:
 *   "Body Temple = 28-päevane kursus = Alistari tuba. Body World =
 *    kivid = koormad. Tube EI MIX. Course peab olema Alistari tuba.
 *    Kursus ootab ümberkujundamist meie uue ideoloogia järgi.
 *    Sisu EI kustutata — arhiveerime."
 *
 * STATUS:
 *   - Page render replaced with "Under Redesign" notice.
 *   - Original component preserved in `_BodyTempleLegacy.jsx`
 *     (renamed alongside this file). When the redesign is ready
 *     under /alistair-laboratory/courses/body-temple (or similar),
 *     port the curriculum + day modal + Anna note from there.
 *   - All cross-room links (UserPortal, HighPerformers, KidsHub,
 *     StoryGiftRead, MentorHookCard, BodyRoom legacy) will resolve
 *     to this archived notice until the Alistair port is live.
 *
 * DO NOT:
 *   - delete the curriculum file (`backend/body_temple_curriculum.py`)
 *   - delete the Stripe unlock flow (`/clarity-release`)
 *   - delete `_BodyTempleLegacy.jsx`
 *   - link to /body-temple from inside Body World again
 */
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

export default function BodyTemple() {
  return (
    <div
      data-testid="body-temple-archived"
      className="min-h-screen w-full"
      style={{ backgroundColor: "#0a0d15", color: "#e8dfc9", fontFamily: SERIF }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          to="/"
          data-testid="body-temple-archived-home"
          className="inline-flex items-center gap-2 text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: "#d4c98f" }}
        >
          <ArrowLeft size={16} /> Home
        </Link>

        <p className="mt-12 text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: "#a89968" }}>
          Archived · Under Redesign
        </p>

        <h1
          className="mt-3 text-4xl sm:text-5xl lg:text-6xl leading-tight"
          style={{ color: "#f3e9cc" }}
          data-testid="body-temple-archived-title"
        >
          Body Temple
        </h1>

        <p
          className="mt-6 text-xl sm:text-2xl italic opacity-80"
          style={{ color: "#cdbf8a" }}
          data-testid="body-temple-archived-line"
        >
          The 28-day journey is being reshaped.
        </p>

        <div
          className="mt-16 p-8 rounded-sm border"
          style={{
            borderColor: "rgba(212, 201, 143, 0.25)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <p className="text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: "#a89968" }}>
            Moving Home
          </p>
          <p className="mt-4 text-base sm:text-lg leading-relaxed opacity-90">
            Body Temple is being redesigned and will return as a course
            inside the <span style={{ color: "#f3e9cc" }}>Alistair Laboratory</span>,
            where all guided courses now live. The original twenty-eight
            days are preserved — nothing has been lost.
          </p>
          <p className="mt-4 text-sm leading-relaxed opacity-70">
            Rooms stay distinct. Body World is for noticing the stones
            you carry. Alistair Laboratory is for the courses that help
            you set them down.
          </p>
        </div>
      </div>
    </div>
  );
}
