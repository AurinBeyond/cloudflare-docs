/**
 * MentorHookCard.jsx — §SYNERGY-2 2026-02-10
 *
 * The "mentor hook" is a quiet, single-shot invitation that appears
 * for a signed-in non-premium parent AFTER they have sat in any of
 * the three adult voice rooms (Grace / Body / Parents) a few times.
 *
 * It is not a marketing pop-up. It is a soft P.S. — one line saying
 * "you also deserve a quiet room", with a dotted link to Body Temple 28.
 * The parent can dismiss it once and it never returns.
 *
 * House tone. No urgency. No FOMO. Caveat handwriting on the title.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

const LS_KEY = "aurin_mentor_hook_dismissed";

export default function MentorHookCard() {
  const [state, setState] = useState({ loaded: false, eligible: false });
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    // Quick optimistic skip — once dismissed locally, don't even ping.
    if (typeof window !== "undefined" && localStorage.getItem(LS_KEY) === "1") {
      setState({ loaded: true, eligible: false });
      return;
    }
    let alive = true;
    api
      .get("/marketing/mentor-hook")
      .then((r) => {
        if (alive) setState({ loaded: true, ...r.data });
      })
      .catch(() => {
        if (alive) setState({ loaded: true, eligible: false });
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleDismiss = async () => {
    if (dismissing) return;
    setDismissing(true);
    try {
      localStorage.setItem(LS_KEY, "1");
    } catch {}
    try {
      await api.post("/marketing/mentor-hook/dismiss");
    } catch {
      // Soft fail — local key already set.
    }
    setState({ loaded: true, eligible: false });
  };

  if (!state.loaded || !state.eligible) return null;

  return (
    <section
      className="aurin-section-sm"
      data-testid="mentor-hook-card"
    >
      <div className="aurin-container max-w-[820px]">
        <div
          className="relative rounded-2xl p-6 md:p-7 overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, #fff8e8 0%, #f6e3bf 100%)",
            border: "1px solid #e8d2a8",
            boxShadow:
              "0 14px 30px -18px rgba(168,114,42,0.45), inset 0 1px 0 rgba(255,255,255,0.55)",
          }}
        >
          <button
            type="button"
            onClick={handleDismiss}
            data-testid="mentor-hook-dismiss"
            aria-label="Not yet"
            className="absolute top-3 right-3 text-[12px] tracking-wide opacity-60 hover:opacity-100 transition"
            style={{ color: "#7a5e2e" }}
          >
            not yet ×
          </button>
          <p
            className="text-[11px] uppercase tracking-[0.24em] mb-1"
            style={{ color: "#8a6428" }}
          >
            A small whisper for you
          </p>
          <p
            className="text-[28px] md:text-[32px] leading-tight max-w-[24ch]"
            style={{
              fontFamily: "'Caveat', cursive",
              color: "#3d2a14",
              fontWeight: 500,
            }}
          >
            You held space for them. There is a room for you too.
          </p>
          <p
            className="mt-3 text-[14px] leading-relaxed max-w-[55ch]"
            style={{ color: "#5a4628" }}
          >
            You've sat with Aurin a few times now. If a quieter rhythm
            would help — twenty-eight gentle days of breathing, touch,
            rest, presence — Body Temple opens its first day freely.
            No haste.
          </p>
          <Link
            to={state.cta_url || "/body-temple?utm_source=mentor_hook"}
            data-testid="mentor-hook-cta"
            className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium"
            style={{
              color: "#a65a2f",
              borderBottom: "1px dotted #a65a2f",
              paddingBottom: 1,
            }}
          >
            Read Day 1 →
          </Link>
        </div>
      </div>
    </section>
  );
}
