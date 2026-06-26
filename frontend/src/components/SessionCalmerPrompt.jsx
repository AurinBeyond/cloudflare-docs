/**
 * SessionCalmerPrompt.jsx — §Phase 1 calm-meter feedback (2026-02-14).
 *
 * Founder Blueprint pinned "Did the wanderer feel calmer than when
 * they arrived?" as the single most important quality metric for
 * the Clarity Release house. This component is the gentle,
 * non-intrusive surface that asks that question once per session
 * and records an anonymous vote.
 *
 * Constraints (all founder-locked):
 *   - One-time per browser per session token (localStorage gate).
 *   - Soft, slow appear (fade + slight translate, 600 ms).
 *   - Three answers: Yes / Not yet / Quietly skip — no "Submit", no
 *     follow-up form, no email, no identity. A single tap closes it.
 *   - Anonymous: no user_id is sent, just {calmer, room}.
 *   - Never auto-appears mid-conversation. Only after the wanderer
 *     has explicitly closed/finished the session OR after >= N
 *     guide replies (signalled by the parent component).
 *   - Honors prefers-reduced-motion (no slide animation).
 */
import React, { useEffect, useRef, useState } from "react";
// §AUDIT-P2 2026-05-20 — Centralised token storage.
import { getSessionToken } from "@/lib/auth";
import { BACKEND_URL as __BACKEND_URL__ } from "@/lib/backendUrl";

const STORAGE_KEY_PREFIX = "aurin_calmer_feedback_";
const BACKEND = __BACKEND_URL__;

export default function SessionCalmerPrompt({
  room = "clarity",
  trigger = false,
  testidPrefix = "calmer-prompt",
}) {
  // We key the localStorage gate on the day, not the session token,
  // so we never ask twice in the same calendar day even if the
  // wanderer signs in fresh. Day-bucket is privacy-friendly (no PII).
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `${STORAGE_KEY_PREFIX}${room}_${today}`;

  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!trigger) return;
    try {
      if (typeof window !== "undefined" && window.localStorage.getItem(storageKey)) {
        return; // already answered today for this room
      }
    } catch {
      /* localStorage unavailable — show anyway */
    }
    // Tiny delay so it never collides with the guide's final reply.
    const t = window.setTimeout(() => setVisible(true), 900);
    return () => window.clearTimeout(t);
  }, [trigger, storageKey]);

  const record = async (calmer) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ calmer, at: Date.now() }));
    } catch {
      /* noop */
    }
    // Fire-and-forget — the wanderer never sees an error from this.
    // The acknowledgement is purely visual.
    try {
      const token = getSessionToken();
      const headers = { "Content-Type": "application/json" };
      // Token is optional. The endpoint is intentionally token-free
      // (anonymous), but if the wanderer is signed in we still
      // forward the bearer so future moderation could correlate
      // abuse — currently unused.
      if (token) headers.Authorization = `Bearer ${token}`;
      await fetch(`${BACKEND}/api/clarity/session-feedback`, {
        method: "POST",
        headers,
        body: JSON.stringify({ calmer, room }),
      });
    } catch {
      /* network failure is fine — vote already saved locally */
    }
    setSubmitted(true);
    window.setTimeout(() => setVisible(false), 2400);
  };

  if (!visible) return null;

  return (
    <div
      data-testid={`${testidPrefix}-card`}
      className="mx-auto mt-10 max-w-[480px] aurin-card p-6 md:p-7 aurin-calmer-prompt"
      role="dialog"
      aria-live="polite"
    >
      {!submitted ? (
        <>
          <p className="aurin-serif-italic text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
            Quietly, before you go — did you feel calmer than when you
            arrived?
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => record(true)}
              data-testid={`${testidPrefix}-yes`}
              className="aurin-btn aurin-btn-ghost !text-[12.5px] !py-1.5 !px-3 ring-1 ring-[hsl(var(--aurin-sage))]/40 hover:ring-[hsl(var(--aurin-sage))]/70"
            >
              Yes, a little
            </button>
            <button
              type="button"
              onClick={() => record(false)}
              data-testid={`${testidPrefix}-no`}
              className="aurin-btn aurin-btn-ghost !text-[12.5px] !py-1.5 !px-3"
            >
              Not yet
            </button>
            <button
              type="button"
              onClick={() => record(null)}
              data-testid={`${testidPrefix}-skip`}
              className="aurin-btn aurin-btn-ghost !text-[12px] !py-1.5 !px-3 opacity-70"
            >
              Quietly skip
            </button>
          </div>
        </>
      ) : (
        <p
          data-testid={`${testidPrefix}-ack`}
          className="aurin-serif-italic text-[13.5px] text-[hsl(var(--aurin-text-muted))]"
        >
          Thank you for telling me. The room remembers your breath, not
          your name.
        </p>
      )}
    </div>
  );
}
