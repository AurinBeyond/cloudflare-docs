/**
 * LensForRegion.jsx — Body Room modal lens display.
 *
 * Renders the active wisdom lens's view of a single hotspot region
 * inside the HotspotModal. Reads the active lens id from localStorage
 * (set by <BodyLensSelector />). If no lens is picked, falls back to
 * the EASTERN lens so the modal never feels empty — a calm default
 * rather than nothing.
 *
 * Fetches the lens registry from `/api/body-room/lenses` once and
 * caches it module-side. The payload is small (~6 KB) and authored
 * by us, never user-generated.
 */
import { useEffect, useState } from "react";
import { Sparkles, Wind, Activity, Compass } from "lucide-react";
import { api } from "@/lib/api";
import { LENS_STORE_KEY, LENS_EVENT, DEFAULT_LENS } from "@/components/BodyLensSelector";

let _LENS_CACHE = null;
let _LENS_PROMISE = null;

async function getLenses() {
  if (_LENS_CACHE) return _LENS_CACHE;
  if (!_LENS_PROMISE) {
    _LENS_PROMISE = api
      .get("/body-room/lenses")
      .then((r) => {
        _LENS_CACHE = r?.data?.lenses || [];
        return _LENS_CACHE;
      })
      .catch(() => {
        _LENS_CACHE = [];
        return _LENS_CACHE;
      });
  }
  return _LENS_PROMISE;
}

const ICON_FOR = {
  intuitive: Compass,
  eastern: Wind,
  psychosomatic: Sparkles,
  somatic_science: Activity,
};

export default function LensForRegion({ region }) {
  const [lenses, setLenses] = useState([]);
  const [activeId, setActiveId] = useState(() => {
    try {
      return typeof window !== "undefined"
        ? window.localStorage.getItem(LENS_STORE_KEY) || DEFAULT_LENS
        : DEFAULT_LENS;
    } catch {
      return DEFAULT_LENS;
    }
  });

  useEffect(() => {
    let alive = true;
    getLenses().then((data) => {
      if (alive) setLenses(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onChange = (e) => setActiveId(e?.detail?.id || DEFAULT_LENS);
    window.addEventListener(LENS_EVENT, onChange);
    return () => window.removeEventListener(LENS_EVENT, onChange);
  }, []);

  if (!region || lenses.length === 0) return null;

  const lensId = activeId || DEFAULT_LENS;
  const lens = lenses.find((l) => l.id === lensId);
  if (!lens) return null;

  const Icon = ICON_FOR[lensId] || Sparkles;

  // Intuitive Flow has no static per-region content — the mentor
  // reads context live and chooses. Render a calm placeholder.
  if (lensId === DEFAULT_LENS) {
    return (
      <div
        data-testid={`lens-region-intuitive-${region}`}
        className="space-y-2 pt-3 border-t border-[hsl(var(--aurin-border-soft))]"
      >
        <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.28em] text-[hsl(var(--aurin-text-muted))]">
          <Icon
            size={11}
            strokeWidth={1.4}
            className="text-[hsl(var(--aurin-sage))]"
          />
          <span>Through Intuitive Flow</span>
        </div>
        <p
          className="text-[13px] leading-relaxed aurin-serif-italic text-[hsl(var(--aurin-text))/0.92]"
          data-testid={`lens-region-intuitive-note-${region}`}
        >
          The mentor will read your words for this region and choose the
          quietest fitting practice — sometimes a breath, sometimes a
          gentle release, sometimes a single permission. Nothing is named
          aloud.
        </p>
      </div>
    );
  }

  const entry = lens.regions?.[region];
  if (!entry) return null;

  return (
    <div
      data-testid={`lens-region-${lensId}-${region}`}
      className="space-y-2 pt-3 border-t border-[hsl(var(--aurin-border-soft))]"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.28em] text-[hsl(var(--aurin-text-muted))]">
          <Icon
            size={11}
            strokeWidth={1.4}
            className="text-[hsl(var(--aurin-sage))]"
          />
          <span>Through the {lens.name}</span>
        </div>
      </div>
      <p
        className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.92]"
        data-testid={`lens-region-insight-${region}`}
      >
        {entry.insight}
      </p>
      <p
        className="text-[13px] leading-relaxed text-[hsl(var(--aurin-text))/0.9]"
        data-testid={`lens-region-practice-${region}`}
      >
        <span className="text-[hsl(var(--aurin-text-muted))]">A practice:</span>{" "}
        {entry.practice}
      </p>
      <p
        className="text-[13px] leading-relaxed aurin-serif-italic text-[hsl(var(--aurin-text))/0.95]"
        data-testid={`lens-region-permission-${region}`}
      >
        {entry.permission}
      </p>
    </div>
  );
}
