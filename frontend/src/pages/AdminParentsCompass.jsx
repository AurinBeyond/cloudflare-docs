/**
 * AdminParentsCompass.jsx — §SARA-COMPASS-V2 2026-05-28
 *
 * Founder-only admin page that surfaces the top crisis queries
 * parents have anonymously typed into Sara's Compass over the last
 * N days. Zero PII (only query text, day-bucket, top-matched
 * situation). Used to power Anna's marketing reports.
 *
 * Route: /admin/parents-compass
 *
 * 100% English UI.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";

const SERIF = '"Cormorant Garamond", Georgia, serif';

const SITUATION_LABELS = {
  bedtime: "Bedtime",
  mealtime: "Mealtime",
  big_emotions: "Big emotions",
  screen_time: "Screen time",
  sibling: "Sibling friction",
  separation: "Separation",
  school_stress: "School stress",
  connection: "Connection",
};

export default function AdminParentsCompass() {
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async (windowDays) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(
        `/parents-room/compass/top-queries?days=${windowDays}`
      );
      setRows(res?.data?.rows || []);
    } catch (e) {
      setError(
        e?.response?.status === 403
          ? "Founder only. Sign in with the founder account to view."
          : "Could not load the report. Please try again."
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(days); }, [days]);

  return (
    <div
      data-testid="admin-parents-compass"
      className="min-h-screen w-full"
      style={{
        background: "linear-gradient(180deg, #0e1320 0%, #131a2c 100%)",
        color: "#e8e1d5",
        fontFamily: SERIF,
      }}
    >
      <header className="max-w-[1180px] mx-auto px-6 sm:px-10 py-6 flex items-center justify-between border-b border-[rgba(106,143,190,0.16)]">
        <Link
          to="/"
          className="flex items-center gap-2 text-[11px] tracking-[0.32em] uppercase text-[#bcb4a3] hover:text-[#e8e1d5] transition-colors"
          data-testid="admin-pc-back"
        >
          <ArrowLeft size={14} /> Home
        </Link>
        <span
          className="text-[10.5px] tracking-[0.32em] uppercase"
          style={{ color: "#6a8fbe" }}
        >
          Sara's Compass · Founder Report
        </span>
      </header>

      <main className="max-w-[1180px] mx-auto px-6 sm:px-10 py-12">
        <p
          className="text-[10.5px] tracking-[0.36em] uppercase mb-3"
          style={{ color: "#6a8fbe" }}
        >
          ✦ What parents actually type
        </p>
        <h1
          className="text-[34px] sm:text-[44px] leading-[1.1] font-light italic mb-5"
        >
          Top crisis queries from the Parents' Room.
        </h1>
        <p
          className="text-[14.5px] leading-[1.85] max-w-[58ch] mb-8"
          style={{ color: "#a59f93" }}
        >
          Every query is anonymous. We store only the text, the day, and
          the top-matched situation. Useful for marketing copy, content
          decisions, and to see which lenses to expand next.
        </p>

        <div className="flex items-center gap-3 mb-8" data-testid="admin-pc-window">
          {[7, 30, 90].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setDays(n)}
              data-testid={`admin-pc-window-${n}`}
              className="px-5 py-2 rounded-full text-[11px] tracking-[0.22em] uppercase transition-all"
              style={{
                background: n === days ? "#6a8fbe" : "transparent",
                color: n === days ? "#0b0a08" : "#bcb4a3",
                border: "1px solid rgba(106,143,190,0.28)",
                fontFamily: SERIF,
              }}
            >
              Last {n} days
            </button>
          ))}
          <button
            type="button"
            onClick={() => load(days)}
            disabled={loading}
            data-testid="admin-pc-reload"
            className="ml-auto inline-flex items-center gap-2 px-5 py-2 rounded-full text-[11px] tracking-[0.22em] uppercase"
            style={{
              background: "transparent",
              color: "#bcb4a3",
              border: "1px solid rgba(196,164,107,0.20)",
              fontFamily: SERIF,
            }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Reload
          </button>
        </div>

        {error && (
          <p data-testid="admin-pc-error" className="text-[13px] italic text-[#c4a46b] mb-8">{error}</p>
        )}

        {!loading && !error && rows.length === 0 && (
          <p data-testid="admin-pc-empty" className="text-[14px] italic text-[#7a7468]">
            No queries yet for this window. As parents start using Sara's
            Compass, their words will gather here.
          </p>
        )}

        {!error && rows.length > 0 && (
          <table
            data-testid="admin-pc-table"
            className="w-full text-left"
            style={{ borderCollapse: "separate", borderSpacing: "0 6px" }}
          >
            <thead>
              <tr style={{ color: "#6a8fbe" }}>
                <th className="text-[10px] tracking-[0.28em] uppercase font-normal py-2 pr-3">#</th>
                <th className="text-[10px] tracking-[0.28em] uppercase font-normal py-2 pr-3">Query</th>
                <th className="text-[10px] tracking-[0.28em] uppercase font-normal py-2 pr-3">Total</th>
                <th className="text-[10px] tracking-[0.28em] uppercase font-normal py-2 pr-3">Days seen</th>
                <th className="text-[10px] tracking-[0.28em] uppercase font-normal py-2 pr-3">Top situations</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={`${r.query}-${idx}`}
                  data-testid={`admin-pc-row-${idx}`}
                  style={{
                    background: "rgba(106,143,190,0.05)",
                    border: "1px solid rgba(106,143,190,0.12)",
                  }}
                >
                  <td className="py-3 pr-3 pl-3 text-[12.5px] text-[#7a8499]">{idx + 1}</td>
                  <td className="py-3 pr-3 text-[14px] italic text-[#e8e1d5]">{r.query}</td>
                  <td className="py-3 pr-3 text-[13.5px] text-[#bcb4a3]">{r.total}</td>
                  <td className="py-3 pr-3 text-[13.5px] text-[#bcb4a3]">{r.days_seen_count}</td>
                  <td className="py-3 pr-3 text-[12.5px] text-[#a59f93] italic">
                    {(r.top_situations || []).map((s) => SITUATION_LABELS[s] || s).join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
