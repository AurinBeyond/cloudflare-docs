/**
 * BodyTemple.jsx — § ARCHIVED 2026-02-13
 *
 * FOUNDER DIRECTIVE 2026-02-13:
 *   "Body Temple = 28-päevane kursus. Body World = kivid = koormad.
 *    Tube EI MIX. Body Temple jääb eraldi tooteks /body-temple all
 *    ja ootab ümberkujundamist meie uue ideoloogia järgi.
 *    Sisu EI kustutata — arhiveerime."
 *
 *   "Iga tuba jääb oma stiiliga ja sisuga." — Body Temple on
 *   iseseisev product, MITTE Alistari alamosa.
 *
 * STATUS:
 *   - Page render replaced with "Under Redesign" notice.
 *   - Legacy 502-line implementation removed 2026-02 cleanup
 *     (HighPerformers + _BodyTempleLegacy + LuxurySanctuaryLanding).
 *   - Backend `body_temple_curriculum.py` + Stripe unlock flow
 *     (`/clarity-release`) + `/api/body-temple/*` endpoints all
 *     untouched and ready to wire when redesign is complete.
 *
 * DO NOT:
 *   - delete the curriculum file
 *   - delete the Stripe unlock flow
 *   - link to /body-temple from inside Body World
 *   - merge Body Temple into Alistair Laboratory or any other room
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
            Quietly Being Reworked
          </p>
          <p className="mt-4 text-base sm:text-lg leading-relaxed opacity-90">
            Body Temple is being redesigned. The original twenty-eight
            days, the breath, the touch, the rest and the presence —
            all of it is preserved and waiting. When the new shape is
            ready, it will return here.
          </p>
          <p className="mt-4 text-sm leading-relaxed opacity-70">
            Nothing is lost. Only quieter for a while.
          </p>
        </div>
      </div>
    </div>
  );
}

