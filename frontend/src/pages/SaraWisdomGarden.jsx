/**
 * SaraWisdomGarden.jsx — § SARA WORLD 8 · WISDOM GARDEN 2026-06-18
 * Painted Map interior. Some answers are found in books. Others
 * are found in quiet moments of reflection.
 */
import { Link, useSearchParams } from "react-router-dom";

const WORLD_IMAGE =
  "https://customer-assets.emergentagent.com/job_aurin-hub/artifacts/cmyiq27h_image.png";

const NEST_THEMES = [
  { slug: "different-ways-of-seeing", label: "Different Ways of Seeing" },
  { slug: "stories-that-teach",       label: "Stories That Teach" },
  { slug: "family-wisdom",            label: "Family Wisdom" },
  { slug: "questions-worth-asking",   label: "Questions Worth Asking" },
  { slug: "reflection-awareness",     label: "Reflection & Awareness" },
  { slug: "everyday-philosophy",      label: "Everyday Philosophy" },
];

const NEST_ZONES = [
  { slug: "different-ways-of-seeing", top: 13, left:  4, w: 22, h: 24 },
  { slug: "family-wisdom",            top: 13, left: 74, w: 22, h: 24 },
  { slug: "stories-that-teach",       top: 40, left:  4, w: 22, h: 24 },
  { slug: "questions-worth-asking",   top: 40, left: 74, w: 22, h: 24 },
  { slug: "reflection-awareness",     top: 68, left:  4, w: 22, h: 24 },
  { slug: "everyday-philosophy",      top: 68, left: 74, w: 22, h: 24 },
];

export default function SaraWisdomGarden() {
  const [params] = useSearchParams();
  const debug = params.get("debug") === "1";
  const zones = NEST_ZONES.map((z) => {
    const t = NEST_THEMES.find((n) => n.slug === z.slug);
    return { id: `nest-${t.slug}`, label: t.label, route: `/parents-room/category/wisdom-garden/${t.slug}`, ...z };
  });
  return (
    <div data-testid="sara-wisdom-garden" className="relative w-full" style={{ backgroundColor: "#0a0d15", minHeight: "100vh" }}>
      <div className="relative w-full mx-auto" style={{ aspectRatio: "1536 / 1024", maxWidth: "1400px" }}>
        <img src={WORLD_IMAGE} alt="Wisdom Garden — Some answers are found in books. Others are found in quiet moments of reflection." className="absolute inset-0 w-full h-full object-cover select-none" draggable={false} loading="eager" data-testid="sara-wisdom-garden-image" />
        {zones.map((z) => (
          <Link key={z.id} to={z.route} data-testid={`sara-wisdom-garden-zone-${z.id}`} aria-label={z.label} title={z.label} className="absolute block group" style={{ top: `${z.top}%`, left: `${z.left}%`, width: `${z.w}%`, height: `${z.h}%`, cursor: "pointer", background: debug ? "rgba(255, 200, 80, 0.25)" : "transparent", border: debug ? "1px dashed rgba(255, 200, 80, 0.9)" : "none", borderRadius: "12px" }}>
            {debug && <span className="absolute top-0 left-0 px-1 text-[10px] font-mono" style={{ background: "rgba(255,200,80,0.95)", color: "#1a1305", pointerEvents: "none", whiteSpace: "nowrap" }}>{z.id}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
