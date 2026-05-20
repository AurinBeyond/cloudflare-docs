import { useEffect, useState, useCallback } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { BACKEND_URL as __BACKEND_URL__ } from "@/lib/backendUrl";

/**
 * AdminObservation — calm 30-day post-launch observation dashboard.
 *
 * Reads /api/admin/observation. Admin token from URL ?token=… or
 * localStorage. NOT in main navigation — accessed by direct URL.
 *
 * Iter 64c · stabilization. No new backend, no LLM.
 */
const TOKEN_LS_KEY = "aurin_admin_token";

export default function AdminObservation() {
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return "";
    const fromUrl = new URLSearchParams(window.location.search).get("token");
    if (fromUrl) {
      window.localStorage.setItem(TOKEN_LS_KEY, fromUrl);
      return fromUrl;
    }
    return window.localStorage.getItem(TOKEN_LS_KEY) || "";
  });
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${__BACKEND_URL__}/api/admin/observation`,
        { headers: { "X-Admin-Token": token } }
      );
      if (!res.ok) {
        const detail = await res.text();
        setError(detail || `Status ${res.status}`);
        setData(null);
        return;
      }
      const j = await res.json();
      setData(j);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div data-testid="page-admin-observation">
      <PageHeader
        eyebrow="Observation mode"
        title="Beta signals (read-only)"
        description="Four signals to watch for the first 30 days post-launch. No alerts, no thresholds enforced — only quiet awareness."
      />

      <section className="aurin-section">
        <div className="aurin-container max-w-[1080px]">
          {!token && (
            <TokenForm
              onSubmit={(t) => {
                window.localStorage.setItem(TOKEN_LS_KEY, t);
                setToken(t);
              }}
            />
          )}

          {token && (
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="text-[12px] text-[hsl(var(--aurin-text-muted))]">
                {data?.generated_at
                  ? `Refreshed ${new Date(data.generated_at).toLocaleString()}`
                  : "Press refresh to load."}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={load}
                  disabled={loading}
                  data-testid="admin-obs-refresh"
                  className="aurin-btn aurin-btn-primary inline-flex items-center gap-1.5 disabled:opacity-40"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.localStorage.removeItem(TOKEN_LS_KEY);
                    setToken("");
                    setData(null);
                  }}
                  data-testid="admin-obs-clear"
                  className="aurin-btn"
                >
                  Clear token
                </button>
              </div>
            </div>
          )}

          {error && (
            <div
              data-testid="admin-obs-error"
              className="aurin-card p-4 mb-5 flex items-start gap-3 border border-[hsl(var(--aurin-warn))/0.4]"
            >
              <AlertCircle size={16} className="text-[hsl(var(--aurin-warn))] mt-[2px]" />
              <div>
                <div className="font-medium text-[hsl(var(--aurin-text))]">
                  Could not load observation data.
                </div>
                <div className="text-[12.5px] text-[hsl(var(--aurin-text-muted))] mt-1">
                  {String(error).slice(0, 200)}
                </div>
              </div>
            </div>
          )}

          {data && (
            <>
              <div className="grid md:grid-cols-2 gap-5">
                <SignalCard
                  testid="signal-cap-hits"
                  title="Cap hits"
                  subtitle="Wanderers reaching the daily 12/60 ceiling"
                  primary={data.signals.cap_hits.last_7_days}
                  primaryLabel="hits in last 7 days"
                  secondary={`${data.signals.cap_hits.today} today · free ceiling ${data.signals.cap_hits.free_ceiling}`}
                  hint="If > 5% of free users hit it daily, raise free cap to 15."
                />
                <SignalCard
                  testid="signal-body-engagement"
                  title="Body Room engagement"
                  subtitle="Users who sent ≥1 somatic chat message"
                  primary={`${data.signals.body_room_engagement.engagement_pct}%`}
                  primaryLabel={`${data.signals.body_room_engagement.unique_chat_users_total} of ${data.signals.body_room_engagement.total_users} users`}
                  secondary="Unique chat users / non-admin user count"
                  hint="If low (<10%), add prompt-suggestion chips below empty-state."
                />
                <SignalCard
                  testid="signal-eternal-thread"
                  title="Eternal Thread opt-in"
                  subtitle="Users who turned save_threads on"
                  primary={`${data.signals.eternal_thread_optin.optin_pct}%`}
                  primaryLabel={`${data.signals.eternal_thread_optin.save_threads_on} of ${data.signals.eternal_thread_optin.prefs_total} prefs rows`}
                  secondary="Among users who set any preference"
                  hint="Informs the post-beta paid-SKU decision."
                />
                <SignalCard
                  testid="signal-side-health"
                  title="Side metrics"
                  subtitle="Quick health snapshot"
                  primary={data.side_metrics.purchases_lifetime}
                  primaryLabel="lifetime purchases"
                  secondary={`${data.side_metrics.active_cabinet_sessions} active sessions · ${data.side_metrics.mentor_notes_stored} notes · ${data.side_metrics.bookings_active} bookings active`}
                  hint="If purchases_lifetime stops increasing, check LemonSqueezy webhook."
                />
              </div>

              <div className="mt-8" data-testid="signal-course-retention">
                <div className="aurin-eyebrow !mb-1">Letter 1 → 2 retention</div>
                <h3 className="text-[19px] font-medium text-[hsl(var(--aurin-text))] mb-1">
                  Course progression
                </h3>
                <p className="text-[12.5px] text-[hsl(var(--aurin-text-muted))] mb-4">
                  Of users who opened letter 1, how many opened letter 2.
                </p>
                <div className="aurin-card overflow-hidden">
                  <table className="w-full text-[13.5px]">
                    <thead className="text-[12px] uppercase tracking-[0.10em] text-[hsl(var(--aurin-text-muted))/0.85]">
                      <tr>
                        <th className="text-left p-3">Course</th>
                        <th className="text-right p-3">Letter 1</th>
                        <th className="text-right p-3">Letter 2</th>
                        <th className="text-right p-3">Retention</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.signals.course_letter_retention || []).map((r) => (
                        <tr
                          key={r.slug}
                          data-testid={`retention-row-${r.slug}`}
                          className="border-t border-[hsl(var(--aurin-border))]"
                        >
                          <td className="p-3 text-[hsl(var(--aurin-text))]">
                            {r.slug}
                          </td>
                          <td className="text-right p-3">{r.letter_1}</td>
                          <td className="text-right p-3">{r.letter_2}</td>
                          <td className="text-right p-3 text-[hsl(var(--aurin-sage))]">
                            {r.retention_pct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function SignalCard({ testid, title, subtitle, primary, primaryLabel, secondary, hint }) {
  return (
    <article data-testid={testid} className="aurin-card p-5 md:p-6">
      <div className="aurin-eyebrow !mb-1">{title}</div>
      <div className="text-[12.5px] text-[hsl(var(--aurin-text-muted))] mb-3">
        {subtitle}
      </div>
      <div className="text-[34px] leading-tight font-medium text-[hsl(var(--aurin-text))]">
        {primary}
      </div>
      <div className="text-[12px] text-[hsl(var(--aurin-text-muted))]">
        {primaryLabel}
      </div>
      <div className="aurin-hairline my-4" />
      <div className="text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
        {secondary}
      </div>
      {hint && (
        <div className="text-[11.5px] aurin-serif-italic text-[hsl(var(--aurin-sage))] mt-3">
          {hint}
        </div>
      )}
    </article>
  );
}

function TokenForm({ onSubmit }) {
  const [v, setV] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (v.trim()) onSubmit(v.trim());
      }}
      className="aurin-card p-5 md:p-6 max-w-[480px]"
      data-testid="admin-obs-token-form"
    >
      <div className="aurin-eyebrow !mb-1">Admin token required</div>
      <h3 className="text-[18px] font-medium text-[hsl(var(--aurin-text))] mb-2">
        Paste the admin token to view signals.
      </h3>
      <p className="text-[12.5px] text-[hsl(var(--aurin-text-muted))] mb-4">
        Stored only in this browser's localStorage. Use Clear token to remove.
      </p>
      <input
        type="password"
        value={v}
        onChange={(e) => setV(e.target.value)}
        data-testid="admin-obs-token-input"
        className="w-full bg-transparent border border-[hsl(var(--aurin-border))] rounded-md p-2 text-[14px]"
        placeholder="Admin token"
      />
      <button
        type="submit"
        data-testid="admin-obs-token-submit"
        className="mt-3 aurin-btn aurin-btn-primary"
      >
        Open
      </button>
    </form>
  );
}
