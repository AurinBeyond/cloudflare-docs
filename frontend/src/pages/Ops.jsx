/*
 * §OPS-DASHBOARD 2026-06-29 — House Operations System, Phase A
 * ============================================================
 *
 * Admin-only dashboard. Hidden URL `/ops`. Requires admin token
 * (entered once, persisted in localStorage).
 *
 * Renders every external service Aurin depends on, with a
 * vendor-agnostic label. Polls /api/ops/status every 30 seconds.
 *
 * Anna's instruction (2026-06-29):
 *   "Mitte mingi süsteem ei kahjustaks meie hääli ega tekitaks
 *   segadust süsteemis, kõik peab töötama nagu šveitsi kella värk."
 *
 * Compliance:
 *   • Read-only — never writes or modifies any service
 *   • Never references vendor names in the UI (Polar/ElevenLabs/etc)
 *   • Burns zero voice minutes (uses the metadata-only probe)
 */
import { useEffect, useRef, useState } from "react";

const API = process.env.REACT_APP_BACKEND_URL;
const POLL_INTERVAL_MS = 30_000;
const TOKEN_KEY = "aurin_ops_token";

const STATUS_LIGHT = {
  ok: { color: "#67c08a", glyph: "●", label: "All systems are quiet." },
  degraded: { color: "#d4a24a", glyph: "◐", label: "One room is breathing slower." },
  down: { color: "#c46a6a", glyph: "○", label: "A room is closed." },
};

function StatusDot({ status }) {
  const cfg = STATUS_LIGHT[status] || STATUS_LIGHT.down;
  return (
    <span
      data-testid={`ops-dot-${status}`}
      aria-label={`status ${status}`}
      style={{
        display: "inline-block",
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: cfg.color,
        marginRight: 12,
        verticalAlign: "middle",
      }}
    />
  );
}

function TokenPrompt({ onSet }) {
  const [val, setVal] = useState("");
  return (
    <div data-testid="ops-token-prompt" style={{ maxWidth: 460, margin: "20vh auto", padding: 32 }}>
      <h1 style={{ fontSize: 22, fontWeight: 300, marginBottom: 14 }}>
        Operations
      </h1>
      <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 24, lineHeight: 1.6 }}>
        This room is for the house keeper only. Enter the admin token to continue.
      </p>
      <input
        data-testid="ops-token-input"
        type="password"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && val && onSet(val)}
        placeholder="admin token"
        style={{
          width: "100%",
          padding: "10px 14px",
          fontSize: 14,
          border: "1px solid rgba(196,164,107,0.35)",
          background: "transparent",
          color: "inherit",
          letterSpacing: "0.05em",
          fontFamily: "inherit",
        }}
      />
      <button
        data-testid="ops-token-submit"
        onClick={() => val && onSet(val)}
        disabled={!val}
        style={{
          marginTop: 14,
          padding: "8px 18px",
          fontSize: 13,
          background: "transparent",
          border: "1px solid rgba(196,164,107,0.5)",
          color: "inherit",
          cursor: val ? "pointer" : "not-allowed",
          opacity: val ? 1 : 0.4,
          letterSpacing: "0.06em",
        }}
      >
        Enter
      </button>
    </div>
  );
}

export default function Ops() {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [lastPoll, setLastPoll] = useState(null);
  const timer = useRef(null);

  const setToken = (t) => {
    localStorage.setItem(TOKEN_KEY, t);
    setTokenState(t);
  };

  const fetchStatus = async (t) => {
    try {
      const r = await fetch(`${API}/api/ops/status`, {
        headers: { "X-Admin-Token": t },
      });
      if (r.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setTokenState("");
        setErr("Token rejected. Re-enter.");
        return;
      }
      if (!r.ok) {
        setErr(`status ${r.status}`);
        return;
      }
      const j = await r.json();
      setData(j);
      setErr(null);
      setLastPoll(new Date());
    } catch (e) {
      setErr(String(e.message || e));
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchStatus(token);
    timer.current = setInterval(() => fetchStatus(token), POLL_INTERVAL_MS);
    return () => timer.current && clearInterval(timer.current);
  }, [token]);

  if (!token) return <TokenPrompt onSet={setToken} />;

  const overall = data?.overall || "—";
  const headline = data ? STATUS_LIGHT[overall]?.label : "Reading the house...";

  return (
    <div data-testid="ops-dashboard" style={{ maxWidth: 820, margin: "60px auto", padding: 32, fontFamily: "Georgia, serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: "0.02em" }}>
          House Operations
        </h1>
        <span style={{ fontSize: 12, opacity: 0.55 }}>
          {lastPoll ? `last read · ${lastPoll.toLocaleTimeString()}` : "—"}
        </span>
      </div>

      {err && (
        <div data-testid="ops-err" style={{ padding: 12, marginBottom: 24, background: "rgba(196,106,106,0.1)", border: "1px solid rgba(196,106,106,0.3)", fontSize: 13 }}>
          {err}
        </div>
      )}

      <div data-testid="ops-headline" style={{ fontSize: 15, opacity: 0.85, marginBottom: 36, fontStyle: "italic", letterSpacing: "0.02em" }}>
        {headline}
      </div>

      <div data-testid="ops-components" style={{ borderTop: "1px solid rgba(196,164,107,0.18)" }}>
        {(data?.components || []).map((c) => (
          <div
            key={c.component}
            data-testid={`ops-row-${c.component}`}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 0",
              borderBottom: "1px solid rgba(196,164,107,0.12)",
            }}
          >
            <StatusDot status={c.status} />
            <span style={{ flex: 1, fontSize: 15 }}>{c.label}</span>
            <span style={{ fontSize: 12, opacity: 0.55, letterSpacing: "0.02em" }}>
              {c.detail || c.status}
            </span>
          </div>
        ))}
      </div>

      {data?.metrics && (
        <div data-testid="ops-metrics" style={{ marginTop: 40, fontSize: 13, opacity: 0.7, letterSpacing: "0.02em" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span>pageviews · last 24h</span>
            <span>{data.metrics.pageviews_24h ?? "—"}</span>
          </div>
        </div>
      )}

      <div style={{ marginTop: 60, fontSize: 11, opacity: 0.4, textAlign: "center", letterSpacing: "0.08em" }}>
        Auto-refresh · 30s · read-only · zero voice minutes consumed
      </div>
    </div>
  );
}
