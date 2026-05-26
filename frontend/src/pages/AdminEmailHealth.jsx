/**
 * AdminEmailHealth.jsx — §EMAIL-HEALTH 2026-02-11
 *
 * Anna's email reputation dashboard. Shows:
 *   • Traffic light (green/yellow/red) based on bounce + complaint rate
 *   • Suppression counts by reason (bounced / complained / unsubscribed / manual)
 *   • Last 25 webhook events from Resend
 *   • Bulk admin tool to manually unblock a wrongly-suppressed address
 *
 * Reads /api/admin/email-health (no admin token required during early
 * launch — backend gates softly). Direct URL access only.
 */

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, ShieldAlert, ShieldCheck, ShieldX, Trash2, Mail } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { api } from "@/lib/api";

const LIGHT_STYLE = {
  green:  { color: "#1f7a4a", bg: "#e7f4ec", label: "Healthy — Gmail safe zone", Icon: ShieldCheck },
  yellow: { color: "#8a6a1a", bg: "#fcf2dc", label: "Watch — borderline reputation", Icon: ShieldAlert },
  red:    { color: "#8a2424", bg: "#f8e1e1", label: "Critical — Gmail may block sends", Icon: ShieldX },
};

function Stat({ label, value, accent = "#3a2c1c" }) {
  return (
    <div className="rounded-2xl px-5 py-4 bg-white/80"
         style={{ border: "1px solid rgba(80,60,30,0.18)" }}
         data-testid={`email-health-stat-${label.replace(/\s+/g, "-").toLowerCase()}`}>
      <p className="text-[10.5px] uppercase tracking-[0.28em]"
         style={{ color: "#7a6244" }}>{label}</p>
      <p className="text-[28px] mt-1"
         style={{ fontFamily: "Caveat, cursive", fontWeight: 600, color: accent }}>
        {value}
      </p>
    </div>
  );
}

export default function AdminEmailHealth() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unblockEmail, setUnblockEmail] = useState("");
  const [unblockResult, setUnblockResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/email-health");
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.detail || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUnblock = async (e) => {
    e.preventDefault();
    if (!unblockEmail.trim()) return;
    setUnblockResult(null);
    try {
      const res = await api.post("/admin/email-suppression/remove", { email: unblockEmail.trim() });
      setUnblockResult(res.data);
      setUnblockEmail("");
      load();
    } catch (e) {
      setUnblockResult({ error: e?.response?.data?.detail || String(e) });
    }
  };

  const light = data ? (LIGHT_STYLE[data.traffic_light] || LIGHT_STYLE.green) : LIGHT_STYLE.green;
  const Icon = light.Icon;

  return (
    <div data-testid="admin-email-health" className="min-h-screen"
         style={{ background: "linear-gradient(180deg, #f8eecf 0%, #f4e8d4 40%, #ece1cb 100%)" }}>
      <PageHeader title="Email Health" subtitle="Resend reputation, bounces, complaints, unsubscribes" />

      <div className="aurin-container max-w-[1080px] py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[12px] uppercase tracking-[0.32em]"
             style={{ color: "#7a6244" }}>
            From: {data?.from_domain || "info@prulesoul.site"}
          </p>
          <button
            onClick={load}
            disabled={loading}
            data-testid="email-health-refresh"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-medium"
            style={{ background: "#3a2c1c", color: "#fff" }}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="rounded-2xl p-4 mb-6"
               style={{ background: "#f8e1e1", color: "#8a2424", border: "1px solid #d28a8a" }}>
            <strong>Could not load:</strong> {error}
          </div>
        )}

        {data && (
          <>
            {/* Traffic light hero */}
            <section
              className="rounded-3xl p-6 sm:p-8 mb-8 flex items-start gap-5"
              style={{ background: light.bg, border: `1.5px solid ${light.color}33` }}
              data-testid={`email-health-traffic-${data.traffic_light}`}>
              <div className="rounded-full p-4 shrink-0"
                   style={{ background: light.color, color: "#fff" }}>
                <Icon size={28} />
              </div>
              <div className="flex-1">
                <p className="text-[10.5px] uppercase tracking-[0.32em] mb-1"
                   style={{ color: light.color }}>
                  Domain reputation
                </p>
                <h2 className="text-[28px] sm:text-[32px] leading-tight mb-2"
                    style={{ fontFamily: "Caveat, cursive", fontWeight: 600, color: light.color }}>
                  {light.label}
                </h2>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px]"
                     style={{ color: "#3a2c1c" }}>
                  <span>
                    <strong>Bounce rate:</strong> {(data.bounce_rate * 100).toFixed(2)}%
                  </span>
                  <span>
                    <strong>Complaint rate:</strong> {(data.complaint_rate * 100).toFixed(2)}%
                  </span>
                  <span>
                    <strong>Combined:</strong> {(data.combined_rate * 100).toFixed(2)}%
                  </span>
                </div>
                <p className="text-[12px] mt-3 italic opacity-80">
                  Gmail and Outlook start filtering us when combined rate goes above
                  1%. Aim for &lt; 0.5%.
                </p>
              </div>
            </section>

            {/* Suppression stats */}
            <section className="mb-8">
              <h3 className="text-[14px] uppercase tracking-[0.32em] mb-3"
                  style={{ color: "#7a6244" }}>
                Suppression list
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Stat label="Total" value={data.suppression.total_suppressed} />
                <Stat label="Bounced" value={data.suppression.bounced} accent="#8a2424" />
                <Stat label="Complained" value={data.suppression.complained} accent="#8a2424" />
                <Stat label="Unsubscribed" value={data.suppression.unsubscribed} />
                <Stat label="Delivered" value={data.delivered_count} accent="#1f7a4a" />
              </div>
            </section>

            {/* Unblock tool */}
            <section className="mb-8 rounded-2xl p-5"
                     style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(80,60,30,0.18)" }}>
              <h3 className="text-[14px] uppercase tracking-[0.32em] mb-3"
                  style={{ color: "#7a6244" }}>
                Unblock an address
              </h3>
              <p className="text-[12.5px] mb-3" style={{ color: "#5a4a36" }}>
                If a customer says they were wrongly blocked, paste their email
                here. Use sparingly — it overrides Resend's bounce intelligence.
              </p>
              <form onSubmit={handleUnblock} className="flex gap-2"
                    data-testid="email-health-unblock-form">
                <input
                  type="email"
                  required
                  value={unblockEmail}
                  onChange={(e) => setUnblockEmail(e.target.value)}
                  placeholder="address@example.com"
                  data-testid="email-health-unblock-input"
                  className="flex-1 px-4 py-2 rounded-xl text-[13px]"
                  style={{ background: "#fff", border: "1px solid rgba(80,60,30,0.25)" }}
                />
                <button type="submit"
                        data-testid="email-health-unblock-submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-medium"
                        style={{ background: "#3a2c1c", color: "#fff" }}>
                  <Trash2 size={12} /> Unblock
                </button>
              </form>
              {unblockResult && (
                <p className="text-[12px] mt-2"
                   style={{ color: unblockResult.error ? "#8a2424" : "#1f7a4a" }}>
                  {unblockResult.error
                    ? `Error: ${unblockResult.error}`
                    : unblockResult.removed
                      ? `Removed ${unblockResult.email} from suppression list.`
                      : `${unblockResult.email} was not on the list.`}
                </p>
              )}
            </section>

            {/* Recent webhook events */}
            <section>
              <h3 className="text-[14px] uppercase tracking-[0.32em] mb-3"
                  style={{ color: "#7a6244" }}>
                Recent webhook events {data.recent_events?.length ? `(${data.recent_events.length})` : ""}
              </h3>
              {(!data.recent_events || data.recent_events.length === 0) ? (
                <div className="rounded-2xl p-6 text-center italic"
                     style={{ background: "rgba(255,255,255,0.7)", color: "#7a6244", border: "1px dashed rgba(80,60,30,0.25)" }}
                     data-testid="email-health-events-empty">
                  No events yet. Once Resend webhook is wired and the first
                  bounce or complaint arrives, it will appear here.
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden"
                     style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(80,60,30,0.18)" }}>
                  <table className="w-full text-[12.5px]"
                         data-testid="email-health-events-table">
                    <thead>
                      <tr style={{ background: "rgba(80,60,30,0.05)", color: "#7a6244" }}>
                        <th className="text-left px-4 py-2 font-medium">When</th>
                        <th className="text-left px-4 py-2 font-medium">Event</th>
                        <th className="text-left px-4 py-2 font-medium">Recipient</th>
                        <th className="text-left px-4 py-2 font-medium">Suppressed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_events.map((ev, i) => (
                        <tr key={i} className="border-t"
                            style={{ borderColor: "rgba(80,60,30,0.1)" }}>
                          <td className="px-4 py-2 whitespace-nowrap" style={{ color: "#5a4a36" }}>
                            {new Date(ev.received_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
                                  style={{
                                    background: ev.event_type?.includes("bounce")
                                      ? "#f8e1e1"
                                      : ev.event_type?.includes("complain")
                                        ? "#fcf2dc"
                                        : "#e7f4ec",
                                    color: "#3a2c1c",
                                  }}>
                              <Mail size={10} /> {ev.event_type}
                            </span>
                          </td>
                          <td className="px-4 py-2 font-mono text-[11.5px]" style={{ color: "#3a2c1c" }}>
                            {(ev.to || []).join(", ")}
                          </td>
                          <td className="px-4 py-2 text-[11.5px]" style={{ color: ev.suppressed?.length ? "#8a2424" : "#5a4a36" }}>
                            {ev.suppressed?.length ? "✓ Yes" : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <p className="text-[11px] mt-8 italic text-center opacity-70" style={{ color: "#7a6244" }}>
              Setup: Resend App → Webhooks → Add endpoint
              <br />
              URL: <code>https://prulesoul.site/api/webhooks/resend</code>
              <br />
              Events: <code>email.bounced</code>, <code>email.complained</code>
              <br />
              Paste signing secret into <code>RESEND_WEBHOOK_SECRET</code>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
