/**
 * BodyWorldTopic.jsx — § BODY WORLD V1 · TOPIC PLACEHOLDER 2026-02-13
 *
 * Per-sub-stone topic page. Reached from a sub-stone hotspot on a
 * painted world view (e.g. clicking "Recognize" on the Emotional
 * Body world page). For V1 every topic renders the Field Study
 * skeleton until founder authors content — same architectural
 * contract as Alistair lab topics.
 */
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BODY_WORLD_STONE_BY_SLUG } from "@/data/bodyWorldStones";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

export default function BodyWorldTopic() {
  const { stoneSlug, topicSlug } = useParams();
  const stone = BODY_WORLD_STONE_BY_SLUG[stoneSlug];
  if (!stone) return <Navigate to="/body-world" replace />;

  const subStone = (stone.subStones || []).find((s) => s.slug === topicSlug);
  if (!subStone) return <Navigate to={`/body-world/world/${stoneSlug}`} replace />;

  return (
    <div
      data-testid={`body-world-topic-${stoneSlug}-${topicSlug}`}
      className="min-h-screen w-full"
      style={{
        backgroundColor: "#0a0d15",
        color: "#e8dfc9",
        fontFamily: SERIF,
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          to={`/body-world/world/${stoneSlug}`}
          data-testid="body-world-topic-back"
          className="inline-flex items-center gap-2 text-sm tracking-wide opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: "#d4c98f" }}
        >
          <ArrowLeft size={16} /> Back to {stone.title}
        </Link>

        <p
          className="mt-12 text-xs tracking-[0.3em] uppercase opacity-60"
          style={{ color: "#a89968" }}
        >
          {stone.title} · Sub-stone {subStone.n}
        </p>

        <h1
          className="mt-3 text-4xl sm:text-5xl lg:text-6xl leading-tight"
          style={{ color: "#f3e9cc" }}
          data-testid="body-world-topic-title"
        >
          {subStone.title}
        </h1>

        <p
          className="mt-6 text-xl sm:text-2xl italic opacity-80"
          style={{ color: "#cdbf8a" }}
          data-testid="body-world-topic-hint"
        >
          {subStone.hint}
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
            Field Study · Under Exploration
          </p>
          <p className="mt-4 text-base sm:text-lg leading-relaxed opacity-90">
            This sub-stone is part of a living archive. New
            reflections, practices and questions are added as the
            world grows.
          </p>
        </div>

        {subStone.legacyAudio && (
          <div
            data-testid="body-world-topic-legacy-audio"
            className="mt-8 p-6 rounded-sm border"
            style={{ borderColor: "rgba(212, 201, 143, 0.25)", background: "rgba(255,255,255,0.02)" }}
          >
            <p className="text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: "#a89968" }}>
              {subStone.legacyAudio.credit}
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl" style={{ color: "#f3e9cc" }}>
              {subStone.legacyAudio.title}
            </h2>
            <audio
              controls
              preload="none"
              src={subStone.legacyAudio.src}
              data-testid="body-world-topic-legacy-audio-player"
              className="mt-4 w-full"
              style={{ filter: "invert(0.85) hue-rotate(180deg)" }}
            />
          </div>
        )}

        {subStone.legacyQuiz && (
          <Link
            to={subStone.legacyQuiz.href}
            data-testid="body-world-topic-legacy-quiz"
            className="mt-8 block p-6 rounded-sm border hover:opacity-90 transition-opacity"
            style={{ borderColor: "rgba(212, 201, 143, 0.25)", background: "rgba(255,255,255,0.02)", color: "#e8dfc9" }}
          >
            <p className="text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: "#a89968" }}>
              Cross-Stone Tool
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl" style={{ color: "#f3e9cc" }}>
              {subStone.legacyQuiz.title} →
            </h2>
            <p className="mt-2 text-sm italic opacity-80" style={{ color: "#cdbf8a" }}>
              {subStone.legacyQuiz.subtitle}
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
