/**
 * HolographicCalendar.jsx — §10.4 spec from /app/MASTER_PROTOCOL.md.
 *
 * Translucent floating glass panel between Clarity (left) and Grace (right).
 * Hour-aligned slots within the server-canonical quiet-hours window.
 * Slots glow turquoise when free, dim when booked or past.
 *
 * Renders inside Cabinet.jsx (/cabinet/booking). Authenticated only —
 * any 401 surfaces a calm "sign in" panel.
 *
 * No "URGENT — only X spots left!" copy. No high-pressure language.
 * One active reservation per user (anti-FOMO §10.5).
 */
import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "@/lib/api";
import GuidePresence from "@/components/GuidePresence";

const GUIDES = [
  { slug: "grace", label: "Grace", energy: "Flowing · warm · listens longer than she speaks" },
];

const SESSION_TYPES = [
  { slug: "open", label: "Open hour", desc: "Whatever wants to be heard." },
  { slug: "deep_mirroring", label: "Deep mirroring", desc: "Slow, reflective listening." },
  { slug: "high_focus_breathing", label: "High-focus breathing", desc: "Body-led release." },
  { slug: "psychosomatic_map", label: "Psychosomatic map", desc: "Body & inherited sentence." },
];

function getLocalTz() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function formatLocalDayLabel(iso, tz) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      timeZone: tz,
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function formatLocalTime(iso, tz) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: tz,
    }).format(new Date(iso));
  } catch {
    return iso.slice(11, 16);
  }
}

function localDayKey(iso, tz) {
  // YYYY-MM-DD in user's tz so we can group server slots by *user-local* day.
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: tz,
    }).formatToParts(new Date(iso));
    const y = parts.find((p) => p.type === "year").value;
    const m = parts.find((p) => p.type === "month").value;
    const d = parts.find((p) => p.type === "day").value;
    return `${y}-${m}-${d}`;
  } catch {
    return iso.slice(0, 10);
  }
}

export default function HolographicCalendar({ onConfirmed }) {
  const [tz] = useState(getLocalTz());
  const [guide, setGuide] = useState("clarity");
  const [sessionType, setSessionType] = useState("open");
  const [intention, setIntention] = useState("");
  const [slots, setSlots] = useState([]);
  const [capacity, setCapacity] = useState(null);
  const [mine, setMine] = useState({ active: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authNeeded, setAuthNeeded] = useState(false);
  const [reserving, setReserving] = useState(null); // start_at being reserved
  const [confirmation, setConfirmation] = useState(null);
  const [activeDay, setActiveDay] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [slotsRes, capRes, mineRes] = await Promise.all([
        api.get(`/booking/available-slots`, { params: { guide, tz } }),
        api.get(`/booking/capacity`),
        api.get(`/booking/mine`).catch((e) => {
          if (e?.response?.status === 401) return { __auth: true };
          throw e;
        }),
      ]);
      setSlots(slotsRes.data.slots || []);
      setCapacity(capRes.data);
      if (mineRes && mineRes.__auth) {
        setAuthNeeded(true);
        setMine({ active: [], past: [] });
      } else {
        setAuthNeeded(false);
        setMine(mineRes.data);
      }
    } catch {
      setError("The room is quiet. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, [guide, tz]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const slotsByDay = useMemo(() => {
    const groups = {};
    for (const s of slots) {
      const key = localDayKey(s.start_at, tz);
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    }
    return groups;
  }, [slots, tz]);

  const dayKeys = useMemo(() => Object.keys(slotsByDay).sort(), [slotsByDay]);

  useEffect(() => {
    if (!activeDay && dayKeys.length) setActiveDay(dayKeys[0]);
  }, [dayKeys, activeDay]);

  const dayLabel = (key) => {
    if (!key) return "";
    const sample = slotsByDay[key]?.[0]?.start_at;
    return sample ? formatLocalDayLabel(sample, tz) : key;
  };

  const reserve = async (slot) => {
    if (authNeeded) return;
    setReserving(slot.start_at);
    setError(null);
    try {
      const res = await api.post(`/booking/reserve`, {
        guide_name: guide,
        session_type: sessionType,
        start_at: slot.start_at,
        duration_minutes: slot.duration_minutes,
        intention: intention.trim() || null,
        tz,
      });
      setConfirmation(res.data.confirmation);
      setIntention("");
      await loadAll();
      if (onConfirmed) onConfirmed(res.data);
    } catch (e) {
      setError(e?.response?.data?.detail || "That hour could not be held.");
    } finally {
      setReserving(null);
    }
  };

  const cancel = async (id) => {
    setError(null);
    try {
      await api.post(`/booking/${id}/cancel`);
      setConfirmation(null);
      await loadAll();
    } catch (e) {
      setError(e?.response?.data?.detail || "Could not release that hour.");
    }
  };

  if (authNeeded) {
    return (
      <div
        data-testid="booking-auth-needed"
        className="aurin-card max-w-[560px] mx-auto p-8 text-center space-y-4"
      >
        <h3 className="aurin-display text-2xl">Sign in to hold a quiet hour.</h3>
        <p className="aurin-body opacity-80">
          The room is open. We just need to know who is arriving.
        </p>
        <a
          href="/portal"
          data-testid="booking-signin-link"
          className="aurin-button inline-block"
        >
          Open the portal
        </a>
      </div>
    );
  }

  return (
    <div data-testid="holographic-calendar" className="space-y-8">
      {/* §Stage 2.7 — Step 2 — ambient concierge presence layer.
          Compact, non-intrusive. Tracks the chosen guide so the
          portrait quietly matches Clarity or Grace. Reactive states:
          idle by default, listening while the wanderer types the
          intention, thinking during reservation/load. No chat, no
          auto-speak. Tone stays "support" — calm trust register. */}
      <div data-testid="cabinet-presence-row" className="flex items-center justify-start">
        <GuidePresence
          gender={guide === "clarity" ? "male" : "female"}
          sending={loading || reserving !== null}
          toneTag="support"
          runtimeState={
            loading || reserving !== null
              ? "thinking"
              : intention.trim().length > 0
              ? "listening"
              : "idle"
          }
          variant="compact"
          labelOverride={
            guide === "clarity"
              ? "A quiet attendant · Clarity"
              : "A quiet attendant · Grace"
          }
          testidPrefix="cabinet-guide"
        />
      </div>

      {/* Top rail: time-zone + guide + session-type */}
      <div className="aurin-card p-6 md:p-8 space-y-6 backdrop-blur-md bg-black/40 border border-[hsl(var(--aurin-border))]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs uppercase tracking-[0.18em] opacity-60" data-testid="booking-tz">
            Your local time · {tz}
          </div>
          {capacity && (
            <div
              className="text-xs opacity-70"
              data-testid="booking-capacity"
            >
              Currently live: {capacity.live_now} · Ceiling: {capacity.ceiling}
            </div>
          )}
        </div>

        {/* Guide split — Clarity left, Grace right */}
        <div className="grid grid-cols-2 gap-3" role="tablist" aria-label="Choose a guide">
          {GUIDES.map((g) => (
            <button
              key={g.slug}
              type="button"
              role="tab"
              aria-selected={guide === g.slug}
              onClick={() => setGuide(g.slug)}
              data-testid={`booking-guide-${g.slug}`}
              className={`aurin-card text-left px-5 py-4 transition-all ${
                guide === g.slug
                  ? "ring-1 ring-[hsl(var(--aurin-sage))] bg-[hsl(var(--aurin-sage)/0.06)]"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <div className="aurin-display text-lg">{g.label}</div>
              <div className="text-xs opacity-70 mt-1">{g.energy}</div>
            </button>
          ))}
        </div>

        {/* Session-type chips */}
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.18em] opacity-60">Session shape</div>
          <div className="flex flex-wrap gap-2">
            {SESSION_TYPES.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setSessionType(t.slug)}
                data-testid={`booking-type-${t.slug}`}
                className={`px-4 py-2 rounded-full text-sm transition-all border ${
                  sessionType === t.slug
                    ? "border-[hsl(var(--aurin-sage))] bg-[hsl(var(--aurin-sage)/0.08)]"
                    : "border-[hsl(var(--aurin-border))] opacity-70 hover:opacity-100"
                }`}
                title={t.desc}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="text-xs opacity-60">
            {SESSION_TYPES.find((t) => t.slug === sessionType)?.desc}
          </div>
        </div>

        {/* Intention */}
        <div className="space-y-2">
          <label
            htmlFor="booking-intention"
            className="text-xs uppercase tracking-[0.18em] opacity-60"
          >
            One quiet line for the room (optional)
          </label>
          <textarea
            id="booking-intention"
            data-testid="booking-intention"
            value={intention}
            onChange={(e) => setIntention(e.target.value.slice(0, 500))}
            placeholder="What do you want this hour to hold?"
            className="w-full bg-transparent border border-[hsl(var(--aurin-border))] rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--aurin-sage))]"
            rows={2}
          />
        </div>
      </div>

      {/* Day selector */}
      {!loading && dayKeys.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2" data-testid="booking-day-rail">
          {dayKeys.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setActiveDay(k)}
              data-testid={`booking-day-${k}`}
              className={`px-4 py-2 rounded-md whitespace-nowrap text-sm border transition-all ${
                activeDay === k
                  ? "border-[hsl(var(--aurin-sage))] bg-[hsl(var(--aurin-sage)/0.06)]"
                  : "border-[hsl(var(--aurin-border))] opacity-70 hover:opacity-100"
              }`}
            >
              {dayLabel(k)}
            </button>
          ))}
        </div>
      )}

      {/* Slot grid */}
      {loading ? (
        <div className="text-center opacity-60 py-12" data-testid="booking-loading">
          The room is settling…
        </div>
      ) : dayKeys.length === 0 ? (
        <div
          className="aurin-card p-8 text-center opacity-80"
          data-testid="booking-empty"
        >
          All quiet hours are taken today. Would you like to be added to the waiting list?
        </div>
      ) : (
        <div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2"
          data-testid="booking-slot-grid"
        >
          {(slotsByDay[activeDay] || []).map((slot) => {
            const disabled = slot.is_past || slot.is_full || reserving === slot.start_at;
            const isOwn = slot.is_own;
            const time = formatLocalTime(slot.start_at, tz);
            return (
              <button
                key={slot.start_at}
                type="button"
                disabled={disabled || isOwn}
                onClick={() => reserve(slot)}
                data-testid={`booking-slot-${slot.start_at}`}
                className={`px-2 py-3 rounded-md text-sm font-mono tracking-wide border transition-all ${
                  slot.is_past
                    ? "border-[hsl(var(--aurin-border))] opacity-30 cursor-not-allowed"
                    : isOwn
                    ? "border-[hsl(var(--aurin-sage))] bg-[hsl(var(--aurin-sage)/0.18)] cursor-default"
                    : slot.is_full
                    ? "border-[hsl(var(--aurin-border))] opacity-40 cursor-not-allowed"
                    : "border-[hsl(var(--aurin-sage)/0.4)] hover:border-[hsl(var(--aurin-sage))] hover:bg-[hsl(var(--aurin-sage)/0.08)]"
                }`}
              >
                {time}
                {isOwn && <div className="text-[10px] opacity-80 mt-0.5">held</div>}
                {slot.is_full && !isOwn && (
                  <div className="text-[10px] opacity-60 mt-0.5">full</div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Confirmation panel */}
      {confirmation && (
        <div
          data-testid="booking-confirmation"
          className="aurin-card p-6 md:p-8 border border-[hsl(var(--aurin-sage)/0.4)] bg-[hsl(var(--aurin-sage)/0.04)]"
        >
          <div className="text-xs uppercase tracking-[0.18em] opacity-60 mb-2">
            Quietly held
          </div>
          <div className="aurin-display text-xl mb-2">
            {confirmation.calm_message}
          </div>
          <div className="text-sm opacity-80">
            {confirmation.guide_label} · {confirmation.session_type_label}
          </div>
          {confirmation.magic_entry_url && (
            <a
              href={confirmation.magic_entry_url}
              data-testid="booking-magic-entry"
              className="aurin-button inline-block mt-4"
            >
              Open the entry link
            </a>
          )}
          {confirmation.delivered_via === "email" && (
            <div className="text-xs opacity-60 mt-3">
              A copy was sent to your inbox.
            </div>
          )}
        </div>
      )}

      {error && (
        <div
          className="text-sm text-[hsl(var(--aurin-warning,0_70%_60%))] opacity-80"
          data-testid="booking-error"
        >
          {error}
        </div>
      )}

      {/* My bookings */}
      {(mine.active.length > 0 || mine.past.length > 0) && (
        <div className="space-y-4 pt-4 border-t border-[hsl(var(--aurin-border))]">
          <div className="text-xs uppercase tracking-[0.18em] opacity-60">
            Your held hours
          </div>
          {mine.active.length === 0 && (
            <div className="text-sm opacity-70" data-testid="booking-mine-empty">
              No active hour right now.
            </div>
          )}
          {mine.active.map((b) => (
            <div
              key={b.id}
              data-testid={`booking-mine-${b.id}`}
              className="aurin-card p-4 flex items-center justify-between gap-4"
            >
              <div>
                <div className="aurin-display text-base">
                  {formatLocalDayLabel(b.start_at, tz)} · {formatLocalTime(b.start_at, tz)}
                </div>
                <div className="text-xs opacity-70 mt-1">
                  Grace · {b.session_type_label}
                </div>
              </div>
              <button
                type="button"
                onClick={() => cancel(b.id)}
                data-testid={`booking-cancel-${b.id}`}
                className="text-sm opacity-70 hover:opacity-100 underline-offset-4 hover:underline"
              >
                Release this hour
              </button>
            </div>
          ))}
          {mine.past.length > 0 && (
            <details className="text-sm opacity-70" data-testid="booking-past">
              <summary className="cursor-pointer">Past hours ({mine.past.length})</summary>
              <ul className="mt-3 space-y-2">
                {mine.past.slice(0, 12).map((b) => (
                  <li key={b.id} className="opacity-80">
                    {formatLocalDayLabel(b.start_at, tz)} · {formatLocalTime(b.start_at, tz)} ·{" "}
                    {b.status}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
