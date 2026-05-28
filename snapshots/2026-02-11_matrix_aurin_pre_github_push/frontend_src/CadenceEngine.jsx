/**
 * CadenceEngine — Live chrono-lock countdown for the Course Room.
 *
 * §CHRONO-LIVE 2026-02-11 — Founder directive (Variant: Live Clock).
 *   Replace the static T-0 / +24H / +48H reference strip with a
 *   personalised, ticking countdown for any authenticated user with
 *   one or more active enrollments. The countdown points at the
 *   soonest upcoming letter unlock across all their courses.
 *
 *   If the user is signed out OR has no upcoming locks (e.g. all
 *   letters already unlocked, or no enrollments yet), we fall back
 *   to the original static reference strip so the room never looks
 *   broken to a wanderer.
 *
 * Data source: GET /api/courses/me/next-unlock
 *   { unlocked_at, seconds_remaining, course_slug, course_title,
 *     letter_day, letter_title, enrollments }
 *
 * The countdown re-syncs with the server every 30s so we never drift
 * if the user keeps the tab open across days.
 */
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthProvider";

function formatRemaining(seconds) {
  if (seconds <= 0) return "0h 00m 00s";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

function StaticStrip() {
  // §FALLBACK — the original reference strip. Shown to signed-out
  // visitors and to anyone with no upcoming locks. Same testids as
  // before so existing tests keep passing.
  return (
    <div
      className="mt-6 grid grid-cols-3 gap-2 text-center"
      data-testid="course-room-chrono-strip"
    >
      {[
        { code: "T-0", label: "Read" },
        { code: "+24h", label: "Integrate" },
        { code: "+48h", label: "Next gate opens" },
      ].map((s) => (
        <div
          key={s.code}
          className="border border-[hsl(var(--aurin-sage))]/30 py-2 px-3"
          data-testid={`chrono-step-${s.code.toLowerCase()}`}
        >
          <p className="text-[10px] tracking-[0.22em] uppercase text-[hsl(var(--aurin-sage))]">
            {s.code}
          </p>
          <p className="text-[12px] text-[hsl(var(--aurin-text-muted))] mt-1">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function CadenceEngine() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [tick, setTick] = useState(0);
  const fetchedAt = useRef(0);

  const refetch = async () => {
    if (!user) {
      setData(null);
      return;
    }
    try {
      const r = await api.get("/courses/me/next-unlock");
      setData(r.data);
      fetchedAt.current = Date.now();
    } catch {
      setData(null);
    }
  };

  // Initial load + refresh on user change
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id || user?.email || null]);

  // 1-second tick for the visual countdown
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Re-sync with server every 30s to prevent drift
  useEffect(() => {
    if (!user) return undefined;
    const id = setInterval(() => {
      if (Date.now() - fetchedAt.current >= 30000) refetch();
    }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // No live data → static reference strip
  if (!user || !data || !data.unlocked_at) {
    return <StaticStrip />;
  }

  // Compute remaining seconds locally for smooth 1Hz tick
  const elapsed = Math.floor((Date.now() - fetchedAt.current) / 1000);
  const remaining = Math.max(0, (data.seconds_remaining || 0) - elapsed);

  // When countdown reaches zero, re-fetch so we either show the next
  // letter's lock or gracefully fall back to the static strip.
  if (remaining === 0 && fetchedAt.current > 0 && tick > 0) {
    // schedule a single refetch on the next tick — no infinite loop
    setTimeout(refetch, 1500);
  }

  return (
    <div
      className="mt-6 border border-[hsl(var(--aurin-sage))]/30 px-5 py-5"
      data-testid="course-room-cadence-engine"
    >
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <p
          className="text-[10px] tracking-[0.32em] uppercase text-[hsl(var(--aurin-sage))]"
          data-testid="cadence-engine-label"
        >
          ⏵ Cadence Engine · live
        </p>
        <p className="text-[11px] tracking-[0.18em] uppercase text-[hsl(var(--aurin-text-muted))/0.7]">
          Re-syncs every 30s
        </p>
      </div>
      <p
        className="text-[13.5px] leading-[1.8] text-[hsl(var(--aurin-text-muted))]"
        data-testid="cadence-engine-summary"
      >
        Your next transmission —{" "}
        <span className="aurin-serif-italic text-[hsl(var(--aurin-text))]">
          {data.letter_title || `Letter ${data.letter_day}`}
        </span>{" "}
        of{" "}
        <span className="aurin-serif-italic text-[hsl(var(--aurin-text))]">
          {data.course_title}
        </span>{" "}
        — unlocks in
      </p>
      <p
        className="mt-3 text-[28px] sm:text-[32px] tabular-nums tracking-[0.04em] text-[hsl(var(--aurin-text))] font-light"
        data-testid="cadence-engine-countdown"
      >
        {formatRemaining(remaining)}
      </p>
      <p
        className="mt-3 text-[11.5px] tracking-[0.22em] uppercase text-[hsl(var(--aurin-text-muted))/0.7]"
        data-testid="cadence-engine-note"
      >
        Anti-dopamine by design · the gate will not open early
      </p>
    </div>
  );
}
