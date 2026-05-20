/**
 * AdminScheduler.jsx — §10 admin view of held quiet hours.
 *
 * Read-only ops surface for the founder. Auth via X-Admin-Token.
 * Token lives in localStorage `aurin_admin_token` (same convention
 * as AdminPreviewAssets).
 *
 * Privacy: user_ids are anonymized server-side to short ids so no
 * raw uuid leaks here.
 */
import { useCallback, useEffect, useState } from "react";
import { BACKEND_URL as __BACKEND_URL__ } from "@/lib/backendUrl";

const API = __BACKEND_URL__;

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function AdminScheduler() {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("aurin_admin_token") || "";
    } catch {
      return "";
    }
  });
  const [authed, setAuthed] = useState(false);
  const [date, setDate] = useState(todayIso());
  const [schedule, setSchedule] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [dispatching, setDispatching] = useState(false);

  const headers = useCallback(
    () => ({ "X-Admin-Token": token, "Content-Type": "application/json" }),
    [token]
  );

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [sRes, stRes] = await Promise.all([
        fetch(`${API}/api/admin/booking/schedule?date=${date}`, { headers: headers() }),
        fetch(`${API}/api/admin/booking/stats`, { headers: headers() }),
      ]);
      if (sRes.status === 401 || stRes.status === 401) {
        setError("Token rejected.");
        setAuthed(false);
        setLoading(false);
        return;
      }
      if (!sRes.ok) throw new Error("schedule");
      if (!stRes.ok) throw new Error("stats");
      setSchedule(await sRes.json());
      setStats(await stRes.json());
      setAuthed(true);
    } catch {
      setError("Could not load schedule.");
    } finally {
      setLoading(false);
    }
  }, [token, date, headers]);

  useEffect(() => {
    if (token) load();
  }, [token, date, load]);

  const saveToken = (v) => {
    setToken(v);
    try {
      localStorage.setItem("aurin_admin_token", v);
    } catch {
      /* ignore */
    }
  };

  const dispatchSixNights = async () => {
    setDispatching(true);
    setDispatchResult(null);
    try {
      const res = await fetch(`${API}/api/admin/six-nights/dispatch`, {
        method: "POST",
        headers: headers(),
      });
      const data = await res.json();
      if (!res.ok) {
        setDispatchResult({ error: data.detail || "dispatch failed" });
      } else {
        setDispatchResult(data);
      }
    } catch {
      setDispatchResult({ error: "network" });
    } finally {
      setDispatching(false);
    }
  };

  if (!authed) {
    return (
      <div
        data-testid="admin-scheduler-auth"
        className="aurin-section-sm"
      >
        <div className="aurin-container max-w-[480px]">
          <h1 className="aurin-display text-2xl mb-4">Scheduler · Admin</h1>
          <p className="opacity-70 text-sm mb-4">
            Paste the founder admin token to view held quiet hours.
          </p>
          <input
            data-testid="admin-token-input"
            type="password"
            value={token}
            onChange={(e) => saveToken(e.target.value)}
            placeholder="ADMIN_TOKEN"
            className="w-full bg-transparent border border-[hsl(var(--aurin-border))] rounded-md p-3"
          />
          <button
            type="button"
            data-testid="admin-load"
            onClick={load}
            className="aurin-button mt-4"
            disabled={!token}
          >
            Open the schedule
          </button>
          {error && (
            <div className="text-sm opacity-70 mt-3" data-testid="admin-error">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="page-admin-scheduler" className="aurin-section-sm">
      <div className="aurin-container max-w-[1080px] space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] opacity-60">
              Cabinet · Scheduler
            </div>
            <h1 className="aurin-display text-3xl mt-1">Held quiet hours</h1>
          </div>
          <div className="flex items-center gap-3">
            <input
              data-testid="admin-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border border-[hsl(var(--aurin-border))] rounded-md px-3 py-2"
            />
            <button
              type="button"
              onClick={load}
              data-testid="admin-refresh"
              className="text-sm opacity-70 hover:opacity-100 underline-offset-4 hover:underline"
            >
              Refresh
            </button>
          </div>
        </header>

        {/* Stats */}
        {stats && (
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
            data-testid="admin-stats"
          >
            {[
              ["Today", stats.today_total],
              ["This week", stats.week_total],
              ["Reserved", stats.by_status?.reserved ?? 0],
              ["Cancelled", stats.by_status?.cancelled ?? 0],
            ].map(([label, val]) => (
              <div
                key={label}
                className="aurin-card p-4 text-center"
              >
                <div className="text-xs uppercase tracking-[0.18em] opacity-60">{label}</div>
                <div className="aurin-display text-2xl mt-1">{val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Day table */}
        <div className="aurin-card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-[hsl(var(--aurin-border))] flex items-center justify-between">
            <div className="text-sm opacity-80">
              {schedule?.date} · {schedule?.count ?? 0} held hours
            </div>
            <div className="text-xs opacity-60">
              Quiet hours: {schedule?.quiet_hours?.start}:00 – {schedule?.quiet_hours?.end}:00
            </div>
          </div>
          {loading ? (
            <div className="p-8 text-center opacity-60" data-testid="admin-loading">
              Loading…
            </div>
          ) : !schedule?.items?.length ? (
            <div className="p-8 text-center opacity-60" data-testid="admin-day-empty">
              No held hours that day.
            </div>
          ) : (
            <table className="w-full text-sm" data-testid="admin-schedule-table">
              <thead className="text-xs uppercase tracking-[0.12em] opacity-60">
                <tr className="border-b border-[hsl(var(--aurin-border))]">
                  <th className="px-6 py-3 text-left">Start (UTC)</th>
                  <th className="px-4 py-3 text-left">Guide</th>
                  <th className="px-4 py-3 text-left">Shape</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Held at</th>
                </tr>
              </thead>
              <tbody>
                {schedule.items.map((b) => (
                  <tr
                    key={b.id}
                    data-testid={`admin-row-${b.id}`}
                    className="border-b border-[hsl(var(--aurin-border))/0.4]"
                  >
                    <td className="px-6 py-3 font-mono">{b.start_at.slice(11, 16)}</td>
                    <td className="px-4 py-3">{b.guide_name}</td>
                    <td className="px-4 py-3">{b.session_type_label}</td>
                    <td className="px-4 py-3 opacity-80">{b.status}</td>
                    <td className="px-4 py-3 font-mono opacity-70">{b.user_short}</td>
                    <td className="px-4 py-3 opacity-60 text-xs">
                      {b.created_at?.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Six-Nights dispatcher manual trigger */}
        <div className="aurin-card p-6 space-y-3">
          <div className="text-xs uppercase tracking-[0.18em] opacity-60">
            Six Nights · manual dispatch
          </div>
          <p className="text-sm opacity-80">
            Sends the next-due night to every active subscriber. Idempotent — gap
            window honours the configured minimum.
          </p>
          <button
            type="button"
            onClick={dispatchSixNights}
            data-testid="admin-dispatch-six-nights"
            className="aurin-button"
            disabled={dispatching}
          >
            {dispatching ? "Sending…" : "Dispatch tonight's nights"}
          </button>
          {dispatchResult && (
            <pre
              className="text-xs opacity-70 mt-2 whitespace-pre-wrap"
              data-testid="admin-dispatch-result"
            >
              {JSON.stringify(dispatchResult, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
