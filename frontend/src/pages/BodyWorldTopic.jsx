/**
 * BodyWorldTopic.jsx — § BODY WORLD V1 · TOPIC PAGE 2026-06-16
 *
 * Per-sub-stone topic page. Reached from a sub-stone hotspot on a
 * painted map view. If the sub-stone is mapped to legacy V1 content
 * (region / child-pattern / adult-pattern key), we fetch from the
 * existing /api/body-room/* endpoint and render the founder-authored
 * text inside the V2 layout. Otherwise we show the Field Study
 * skeleton (Growing World pattern).
 */
import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BODY_WORLD_STONE_BY_SLUG } from "@/data/bodyWorldStones";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function LegacyRegionBlock({ regionId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch(`${API}/body-room/hotspots`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        const list = j.hotspots || [];
        setData(list.find((h) => h.region === regionId) || null);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [regionId]);
  if (!data) return null;
  return (
    <div data-testid={`body-world-topic-legacy-region-${regionId}`} className="mt-8 space-y-6">
      <Block kicker={data.emotion} title={data.label}>
        <Field label="What you may notice" body={data.symptom} />
        <Field label="What it carries" body={data.what_it_carries} />
        <Field label="A release" body={data.release} />
        <Field label="Why it speaks to you" body={data.why_it_speaks_to_you} />
      </Block>
    </div>
  );
}

function LegacyChildPatternBlock({ patternId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch(`${API}/body-room/children-patterns`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        const list = j.patterns || [];
        setData(list.find((p) => p.id === patternId) || null);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [patternId]);
  if (!data) return null;
  return (
    <div data-testid={`body-world-topic-legacy-child-${patternId}`} className="mt-8 space-y-6">
      <Block kicker="Children · Generational Pattern" title={data.child_symptom}>
        <Field label="In the child" body={data.in_the_child} />
        <Field label="Parent mirror" body={data.parent_mirror} />
        {data.release && <Field label="A release" body={data.release} />}
        {data.medical_note && (
          <p className="text-xs italic opacity-70" style={{ color: "#a89968" }}>{data.medical_note}</p>
        )}
      </Block>
    </div>
  );
}

function LegacyAdultPatternBlock({ patternId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch(`${API}/body-room/patterns`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        const list = j.patterns || [];
        setData(list.find((p) => p.id === patternId) || null);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [patternId]);
  if (!data) return null;
  return (
    <div data-testid={`body-world-topic-legacy-adult-${patternId}`} className="mt-8 space-y-6">
      <Block kicker={data.kicker || "Body-language pattern"} title={data.title || data.label || data.id}>
        {data.symptom && <Field label="Symptom" body={data.symptom} />}
        {data.what_it_carries && <Field label="What it carries" body={data.what_it_carries} />}
        {data.release && <Field label="A release" body={data.release} />}
        {data.why_it_speaks_to_you && <Field label="Why it speaks to you" body={data.why_it_speaks_to_you} />}
      </Block>
    </div>
  );
}

function Block({ kicker, title, children }) {
  return (
    <div
      className="p-8 rounded-sm border"
      style={{ borderColor: "rgba(212, 201, 143, 0.25)", background: "rgba(255,255,255,0.02)" }}
    >
      <p className="text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: "#a89968" }}>
        {kicker}
      </p>
      <h2 className="mt-2 text-2xl sm:text-3xl" style={{ color: "#f3e9cc" }}>
        {title}
      </h2>
      <div className="mt-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, body }) {
  if (!body) return null;
  return (
    <div>
      <p className="text-[0.65rem] tracking-[0.3em] uppercase opacity-60" style={{ color: "#cdbf8a" }}>
        {label}
      </p>
      <p className="mt-2 text-base sm:text-lg leading-relaxed opacity-90">{body}</p>
    </div>
  );
}

export default function BodyWorldTopic() {
  const { stoneSlug, topicSlug } = useParams();
  const stone = BODY_WORLD_STONE_BY_SLUG[stoneSlug];
  if (!stone) return <Navigate to="/body-world" replace />;
  const subStone = (stone.subStones || []).find((s) => s.slug === topicSlug);
  if (!subStone) return <Navigate to={`/body-world/world/${stoneSlug}`} replace />;

  const hasLegacy =
    subStone.legacyRegion ||
    subStone.legacyChildPattern ||
    subStone.legacyAdultPattern ||
    subStone.legacyAudio ||
    subStone.legacyQuiz;

  return (
    <div
      data-testid={`body-world-topic-${stoneSlug}-${topicSlug}`}
      className="min-h-screen w-full"
      style={{ backgroundColor: "#0a0d15", color: "#e8dfc9", fontFamily: SERIF }}
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

        <p className="mt-12 text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: "#a89968" }}>
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

        {!hasLegacy && (
          <div
            className="mt-16 p-8 rounded-sm border"
            style={{ borderColor: "rgba(212, 201, 143, 0.25)", background: "rgba(255,255,255,0.02)" }}
          >
            <p className="text-xs tracking-[0.3em] uppercase opacity-60" style={{ color: "#a89968" }}>
              Field Study · Under Exploration
            </p>
            <p className="mt-4 text-base sm:text-lg leading-relaxed opacity-90">
              This sub-stone is part of a living archive. New reflections, practices and questions are added as the world grows.
            </p>
          </div>
        )}

        {subStone.legacyRegion && <LegacyRegionBlock regionId={subStone.legacyRegion} />}
        {subStone.legacyChildPattern && <LegacyChildPatternBlock patternId={subStone.legacyChildPattern} />}
        {subStone.legacyAdultPattern && <LegacyAdultPatternBlock patternId={subStone.legacyAdultPattern} />}

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
            style={{
              borderColor: "rgba(212, 201, 143, 0.25)",
              background: "rgba(255,255,255,0.02)",
              color: "#e8dfc9",
            }}
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
