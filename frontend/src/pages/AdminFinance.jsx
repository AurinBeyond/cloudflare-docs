/**
 * AdminFinance.jsx — §GOVERNANCE 2026-02-11
 *
 * Anna's real-time runtime governance dashboard. Shows the three
 * guards that protect her against "$0 cash risk":
 *
 *   1. Vendor Balance Guard (ElevenLabs character headroom)
 *   2. Concurrency Guard (open voice sessions)
 *   3. Spend Velocity Breaker (sessions per 15 min)
 *
 * Plus:
 *   • Customer "debt" (presence_seconds_left across all users)
 *   • Vendor headroom vs debt ratio (financial safety multiplier)
 *   • Last 24h / 7d voice activity + actual vendor burn cost
 *
 * Requires admin token via ?token=... query param OR
 * localStorage.aurin_admin_token. Direct URL access only.
 */

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, ShieldCheck, ShieldAlert, ShieldX, Activity, Coins, Server, Zap, Pause, Play } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { api } from "@/lib/api";

const COLORS = {
  ok:   { fg: "#1f7a4a", bg: "#e7f4ec", Icon: ShieldCheck, label: "OK" },
  warn: { fg: "#8a6a1a", bg: "#fcf2dc", Icon: ShieldAlert, label: "Watch" },
  bad:  { fg: "#8a2424", bg: "#f8e1e1", Icon: ShieldX,     label: "Critical" },
};

function GuardCard({ title, ok, detail, hint, Icon }) {
  const tone = ok === true ? COLORS.ok : ok === false ? COLORS.bad : COLORS.warn;
  const Badge = tone.Icon;
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: tone.bg,
        border: `1px solid ${tone.fg}33`,
      }}
      data-testid={`finance-guard-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon size={20} style={{ color: tone.fg }} />
        <h3 className="text-base font-medium" style={{ color: tone.fg }}>
          {title}
        </h3>
        <span
          className="ml-auto inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
          style={{ background: tone.fg, color: "#fff" }}
        >
          <Badge size={12} /> {tone.label}
        </span>
      </div>
      <div className="text-2xl mb-2" style={{ fontFamily: "Caveat, cursive", color: "#3a2c1c" }}>
        {detail}
      </div>
      {hint && (
        <p className="text-xs" style={{ color: "#7a6244" }}>{hint}</p>
      )}
    </div>
  );
}

function StatBox({ label, value, sublabel, accent = "#3a2c1c" }) {
  return (
    <div
      className="rounded-2xl px-5 py-4 bg-white/80"
      style={{ border: "1px solid rgba(80,60,30,0.18)" }}
      data-testid={`finance-stat-${label.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <p className="text-[10.5px] uppercase tracking-[0.28em]" style={{ color: "#7a6244" }}>
        {label}
      </p>
      <p className="text-[28px] mt-1" style={{ fontFamily: "Caveat, cursive", fontWeight: 600, color: accent }}>
        {value}
      </p>
      {sublabel && (
        <p className="text-[11px] mt-1" style={{ color: "#7a6244" }}>{sublabel}</p>
      )}
    </div>
  );
}

export default function AdminFinance() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [freezeWorking, setFreezeWorking] = useState(false);

  const getToken = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("token");
    if (fromQuery) {
      try { localStorage.setItem("aurin_admin_token", fromQuery); } catch {}
      return fromQuery;
    }
    try { return localStorage.getItem("aurin_admin_token") || ""; } catch { return ""; }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError("Admin token required. Append ?token=... to the URL.");
        setLoading(false);
        return;
      }
      const backend = process.env.REACT_APP_BACKEND_URL;
      const res = await api.get("/admin/governance/status", { params: { token } });
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.detail || String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
    // Auto-refresh every 60s.
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  const toggleFreeze = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError("Admin token required.");
      return;
    }
    const wantFreeze = !(data?.frozen);
    const action = wantFreeze ? "freeze" : "unfreeze";
    const confirmMsg = wantFreeze
      ? "Activate EMERGENCY FREEZE? This blocks ALL new voice sessions, even unlimited_voice users."
      : "Lift emergency freeze? Voice sessions will resume.";
    if (!window.confirm(confirmMsg)) return;
    setFreezeWorking(true);
    try {
      await api.post(`/admin/governance/${action}`, {}, { params: { token } });
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || String(e?.message || e));
    } finally {
      setFreezeWorking(false);
    }
  }, [data, getToken, load]);

  const guards = data?.guards || {};
  const debt = data?.customer_debt || {};
  const headroom = data?.vendor_headroom || {};
  const activity = data?.activity || {};
  const thresholds = data?.thresholds || {};

  // Overall traffic light from ratio:
  //   ≥ 3.0x → ok (green)
  //   1.5x - 3.0x → warn (yellow)
  //   < 1.5x → bad (red)
  const ratio = headroom.headroom_vs_debt_ratio || 0;
  const overallOk = ratio >= 3.0 ? true : ratio >= 1.5 ? null : false;

  return (
    <div className="min-h-screen house-cream" data-testid="admin-finance-page">
      <PageHeader title="Finance & Runtime Governance" subtitle="Real-time vendor protection" />

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "#7a6244" }}>
              Last checked
            </p>
            <p className="text-sm" style={{ color: "#3a2c1c" }}>
              {data?.checked_at ? new Date(data.checked_at).toLocaleString() : "—"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {data && (
              <button
                onClick={toggleFreeze}
                disabled={freezeWorking}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{
                  background: data.frozen ? "#8a2424" : "#fff",
                  color: data.frozen ? "#fff" : "#8a2424",
                  border: `1px solid #8a2424`,
                  opacity: freezeWorking ? 0.5 : 1,
                  fontWeight: 500,
                }}
                data-testid="finance-freeze-toggle-btn"
              >
                {data.frozen ? <Play size={14} /> : <Pause size={14} />}
                {data.frozen ? "Lift Freeze" : "Emergency Freeze"}
              </button>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "#3a2c1c",
                color: "#f8efde",
                opacity: loading ? 0.6 : 1,
              }}
              data-testid="finance-refresh-btn"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {data?.frozen && (
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ background: "#8a2424", color: "#fff" }}
            data-testid="finance-frozen-banner"
          >
            <div className="flex items-center gap-3">
              <Pause size={20} />
              <div>
                <strong>EMERGENCY FREEZE ACTIVE</strong> — All new voice sessions are blocked, including unlimited_voice users.
                Click "Lift Freeze" above to resume.
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ background: "#f8e1e1", border: "1px solid #8a2424", color: "#8a2424" }}
            data-testid="finance-error"
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {data && (
          <>
            {/* Overall health */}
            <div
              className="rounded-2xl p-6 mb-8"
              style={{
                background: overallOk === true ? "#e7f4ec" : overallOk === false ? "#f8e1e1" : "#fcf2dc",
                border: `1px solid ${overallOk === true ? "#1f7a4a" : overallOk === false ? "#8a2424" : "#8a6a1a"}55`,
              }}
              data-testid="finance-overall"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">
                  {overallOk === true ? "🟢" : overallOk === false ? "🔴" : "🟡"}
                </div>
                <div>
                  <h2 className="text-2xl" style={{ fontFamily: "Caveat, cursive", color: "#3a2c1c" }}>
                    {overallOk === true
                      ? "Healthy — vendor reserves comfortably cover customer debt."
                      : overallOk === false
                      ? "Critical — vendor balance may not cover what you owe customers."
                      : "Watch zone — vendor reserves are tight relative to customer debt."}
                  </h2>
                  <p className="text-sm mt-2" style={{ color: "#5a4a2e" }}>
                    Headroom vs Debt ratio: <strong>{ratio.toFixed(2)}x</strong> (green ≥ 3.0x · yellow 1.5-3.0x · red &lt; 1.5x)
                  </p>
                </div>
              </div>
            </div>

            {/* Three guards */}
            <h3 className="text-sm uppercase tracking-[0.28em] mb-3" style={{ color: "#7a6244" }}>
              Runtime Guards
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <GuardCard
                title="Vendor Balance"
                Icon={Server}
                ok={guards.vendor_balance?.ok}
                detail={
                  guards.vendor_balance?.usage_ratio != null
                    ? `${(guards.vendor_balance.usage_ratio * 100).toFixed(1)}% used`
                    : "—"
                }
                hint={
                  guards.vendor_balance?.remaining_chars != null
                    ? `${guards.vendor_balance.remaining_chars.toLocaleString()} chars left · ${guards.vendor_balance.tier || "?"}`
                    : guards.vendor_balance?.reason
                }
              />
              <GuardCard
                title="Concurrency"
                Icon={Activity}
                ok={guards.concurrency?.ok}
                detail={`${guards.concurrency?.open_sessions ?? "—"} / ${guards.concurrency?.threshold ?? "—"}`}
                hint="Open voice sessions vs cap"
              />
              <GuardCard
                title="Spend Velocity"
                Icon={Zap}
                ok={guards.spend_velocity?.ok}
                detail={`${guards.spend_velocity?.sessions_last_15min ?? 0} / ${guards.spend_velocity?.threshold ?? "—"}`}
                hint="Sessions opened in last 15 min"
              />
            </div>

            {/* Customer debt */}
            <h3 className="text-sm uppercase tracking-[0.28em] mb-3" style={{ color: "#7a6244" }}>
              Customer Debt (what you owe)
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <StatBox
                label="Active users with balance"
                value={debt.active_users_with_balance ?? 0}
                sublabel="Users holding paid voice credits"
              />
              <StatBox
                label="Total owed (minutes)"
                value={`${debt.total_owed_minutes ?? 0}`}
                sublabel={`${debt.total_owed_seconds ?? 0} seconds`}
              />
              <StatBox
                label="Projected vendor cost"
                value={`$${debt.projected_vendor_cost_usd ?? 0}`}
                sublabel="If all credits consumed (ElevenLabs + LLM)"
              />
            </div>

            {/* Vendor headroom */}
            <h3 className="text-sm uppercase tracking-[0.28em] mb-3" style={{ color: "#7a6244" }}>
              Vendor Headroom (what's available)
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <StatBox
                label="ElevenLabs chars left"
                value={(headroom.elevenlabs_remaining_chars ?? 0).toLocaleString()}
                sublabel="Until next monthly reset"
              />
              <StatBox
                label="Est. voice minutes available"
                value={`${headroom.elevenlabs_remaining_minutes_est ?? 0}`}
                sublabel="~1000 chars per minute estimate"
              />
              <StatBox
                label="Headroom / Debt ratio"
                value={`${ratio.toFixed(2)}x`}
                sublabel="≥3x healthy · 1.5-3x watch · <1.5x critical"
                accent={overallOk === true ? "#1f7a4a" : overallOk === false ? "#8a2424" : "#8a6a1a"}
              />
            </div>

            {/* Activity */}
            <h3 className="text-sm uppercase tracking-[0.28em] mb-3" style={{ color: "#7a6244" }}>
              Recent Activity
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              <StatBox
                label="Sessions last 24h"
                value={activity.sessions_last_24h ?? 0}
                sublabel="New voice sessions opened"
              />
              <StatBox
                label="Sessions last 7d"
                value={activity.sessions_last_7d ?? 0}
                sublabel={`${activity.actual_burn_minutes_7d ?? 0} min actual burn`}
              />
              <StatBox
                label="Actual cost last 7d"
                value={`$${activity.actual_burn_cost_usd_7d ?? 0}`}
                sublabel="Closed sessions only (vendor billed)"
                accent="#5a4a2e"
              />
            </div>

            {/* Thresholds */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(80,60,30,0.18)" }}
            >
              <h3 className="text-sm uppercase tracking-[0.28em] mb-3" style={{ color: "#7a6244" }}>
                Current Thresholds (env-controlled)
              </h3>
              <div className="grid md:grid-cols-2 gap-2 text-sm" style={{ color: "#3a2c1c" }}>
                <div>Max concurrent voice: <strong>{thresholds.max_concurrent_voice}</strong></div>
                <div>Max sessions / 15 min: <strong>{thresholds.max_sessions_per_15min}</strong></div>
                <div>ElevenLabs usage floor: <strong>{((thresholds.elevenlabs_usage_floor ?? 0) * 100).toFixed(0)}%</strong></div>
                <div>Vendor poll TTL: <strong>{thresholds.vendor_poll_ttl_sec}s</strong></div>
              </div>
              <p className="text-xs mt-3" style={{ color: "#7a6244" }}>
                Adjust via <code>GOVERNANCE_*</code> env variables. Governance enabled:{" "}
                <strong>{data.governance_enabled ? "yes" : "no"}</strong>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
