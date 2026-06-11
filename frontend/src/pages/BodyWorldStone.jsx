/**
 * BodyWorldStone.jsx — § BODY WORLD V2 · STONE PAGE 2026-02-13
 *
 * Skeleton placeholder for a single stone (world) inside Body World.
 * Authored content per stone will arrive later — this page keeps the
 * link graph stable so every hotspot from the Body World hub resolves
 * to a meaningful surface instead of a 404.
 *
 * Pattern mirrors Alistair's TopicDetail "Field Study · In Progress"
 * card. When founder authors a stone, swap this placeholder for the
 * authored renderer (same approach as MONEY_TREE_CONTENT vs the
 * other 10 labs).
 */
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BODY_WORLD_STONE_BY_SLUG, BODY_WORLD_STONES } from "@/data/bodyWorldStones";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

export default function BodyWorldStone() {
  const { stoneSlug } = useParams();
  const stone = BODY_WORLD_STONE_BY_SLUG[stoneSlug];

  if (!stone) {
    return <Navigate to="/body-room" replace />;
  }

  const idx = BODY_WORLD_STONES.findIndex((s) => s.slug === stoneSlug);
  const prev = idx > 0 ? BODY_WORLD_STONES[idx - 1] : null;
  const next = idx < BODY_WORLD_STONES.length - 1 ? BODY_WORLD_STONES[idx + 1] : null;

  return (
    <div
      data-testid={`body-world-stone-${stone.slug}`}
      className="min-h-screen w-full"
      style={{
        backgroundColor: "#0a0d15",
        color: "#e8dfc9",
        fontFamily: SERIF,
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          to="/body-room"
          data-testid="body-world-stone-back"
          className="inline-flex items-center gap-2 text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: "#d4c98f" }}
        >
          <ArrowLeft size={16} /> Back to Body World
        </Link>

        <p
          className="mt-12 text-xs tracking-[0.3em] uppercase opacity-60"
          style={{ color: "#a89968" }}
        >
          Stone {stone.n} of 15
        </p>

        <h1
          className="mt-3 text-4xl sm:text-5xl lg:text-6xl leading-tight"
          style={{ color: "#f3e9cc" }}
          data-testid="body-world-stone-title"
        >
          {stone.title}
        </h1>

        <p
          className="mt-6 text-xl sm:text-2xl italic opacity-80"
          style={{ color: "#cdbf8a" }}
          data-testid="body-world-stone-question"
        >
          “{stone.question}”
        </p>

        <div
          className="mt-16 p-8 rounded-sm border"
          style={{
            borderColor: "rgba(212, 201, 143, 0.25)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <p
            className="text-xs tracking-[0.3em] uppercase opacity-60"
            style={{ color: "#a89968" }}
          >
            Field Study · In Progress
          </p>
          <p className="mt-4 text-base sm:text-lg leading-relaxed opacity-90">
            This stone is being shaped. The traveler will be invited
            here when the path is ready — Kaelen is still listening
            for the questions only this world can answer.
          </p>
          <p className="mt-4 text-sm leading-relaxed opacity-70">
            Until then, sit with the question above. Notice where it
            lands in your body. That noticing is already the work.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-sm">
          {prev ? (
            <Link
              to={`/body-room/world/${prev.slug}`}
              data-testid="body-world-stone-prev"
              className="opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: "#d4c98f" }}
            >
              ← {prev.n}. {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={`/body-room/world/${next.slug}`}
              data-testid="body-world-stone-next"
              className="opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: "#d4c98f" }}
            >
              {next.n}. {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
