/**
 * BodyWorldStub.jsx — § BODY WORLD V1 · SIDEBAR STUB 2026-02-13
 *
 * Generic placeholder page for sidebar routes painted in every world
 * but not yet implemented:
 *   /body-world/journey
 *   /body-world/tools
 *   /body-world/insights
 *   /body-world/favourites
 *   /body-world/journals
 *
 * Replaces hard 404s with a quiet "this area is being prepared"
 * surface — same Field Study skeleton language as Alistair labs and
 * stone placeholders, so the visitor never lands on a dead URL.
 *
 * When a real surface is built, swap this component for the real
 * page at the route — no other change required.
 */
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

const TITLES = {
  "/body-world/journey":     { title: "My Journey",         line: "Your path through the worlds is being prepared." },
  "/body-world/tools":       { title: "Tools & Practices",  line: "The practice library is being curated." },
  "/body-world/insights":    { title: "Insights",           line: "The reflection layer is being assembled." },
  "/body-world/favourites":  { title: "Favourites",         line: "Saved stones and topics will live here." },
  "/body-world/journals":    { title: "Journals",           line: "A quiet place for your own writing is on its way." },
};

export default function BodyWorldStub() {
  const { pathname } = useLocation();
  const meta = TITLES[pathname] || { title: "Body World", line: "This area is being prepared." };

  return (
    <div
      data-testid={`body-world-stub-${pathname.split("/").pop()}`}
      className="min-h-screen w-full"
      style={{ backgroundColor: "#0a0d15", color: "#e8dfc9", fontFamily: SERIF }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          to="/body-world"
          data-testid="body-world-stub-back"
          className="inline-flex items-center gap-2 text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: "#d4c98f" }}
        >
          <ArrowLeft size={16} /> Back to Stone Map
        </Link>

        <p className="mt-12 text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: "#a89968" }}>
          Body World
        </p>

        <h1
          className="mt-3 text-4xl sm:text-5xl lg:text-6xl leading-tight"
          style={{ color: "#f3e9cc" }}
          data-testid="body-world-stub-title"
        >
          {meta.title}
        </h1>

        <p
          className="mt-6 text-xl sm:text-2xl italic opacity-80"
          style={{ color: "#cdbf8a" }}
          data-testid="body-world-stub-line"
        >
          {meta.line}
        </p>

        <div
          className="mt-16 p-8 rounded-sm border"
          style={{
            borderColor: "rgba(212, 201, 143, 0.25)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <p className="text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: "#a89968" }}>
            This Area Is Being Prepared
          </p>
          <p className="mt-4 text-base sm:text-lg leading-relaxed opacity-90">
            Body World is still being shaped, world by world. This area
            will open when its time arrives. The stones themselves are
            already walkable — return to the map and continue your
            exploration there.
          </p>
        </div>
      </div>
    </div>
  );
}
