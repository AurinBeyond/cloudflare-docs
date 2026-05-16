/**
 * useVoiceSessionCap — poll the backend voice-window endpoint and
 * surface a calm, structured snapshot the UI can render.
 *
 * §STABILIZATION 2026-05-16 — Founder directive: a THIN, ISOLATED
 * hook. It is intentionally a *passive observer* — it never touches
 * the ConvAI SDK, WebSocket, mic, or audio context. It does ONE
 * thing: polls `/api/clarity/convai/voice-window` and exposes the
 * shape the countdown banner consumes.
 *
 * Behaviour:
 *   - Polls every 15s while the wanderer is on a page that mounts
 *     the hook. Cheap (<1KB response).
 *   - Stops polling on unmount / `enabled=false`.
 *   - Soft-fails — every fetch error degrades into a "let the user
 *     in" state so the cap layer never blocks the realtime core on
 *     a flaky network.
 *   - Recomputes `secondsRemaining` locally between polls so the
 *     banner ticks smoothly without spamming the backend.
 *
 * Returns the canonical voice-window snapshot:
 *   {
 *     allowed: boolean,
 *     secondsRemaining: number,
 *     tier: "unlimited" | "free_access" | "30min" | "60min" |
 *           "season_30days" | "pending" | null,
 *     reason: string,
 *     capEnabled: boolean,
 *     expiringSoon: boolean,    // <= 60s warning state
 *     loading: boolean,
 *   }
 */
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

const POLL_INTERVAL_MS = 15_000;   // every 15s — cheap server call
const TICK_INTERVAL_MS = 1_000;    // 1s local tick for smooth UI
const EXPIRING_THRESHOLD_S = 60;   // <=60s left → "expiringSoon"

export function useVoiceSessionCap({ enabled = true } = {}) {
  const [snapshot, setSnapshot] = useState({
    allowed: true,
    secondsRemaining: 0,
    tier: null,
    reason: "loading",
    capEnabled: false,
    loading: true,
  });
  const remainingRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setSnapshot((prev) => ({ ...prev, loading: false }));
      return undefined;
    }
    let cancelled = false;

    const fetchOnce = async () => {
      try {
        const res = await api.get("/clarity/convai/voice-window");
        if (cancelled) return;
        const d = res?.data || {};
        const remaining = Number(d.seconds_remaining) || 0;
        remainingRef.current = remaining;
        setSnapshot({
          allowed: d.allowed !== false,
          secondsRemaining: remaining,
          tier: d.tier ?? null,
          reason: d.reason || "ok",
          capEnabled: !!d.cap_enabled,
          loading: false,
        });
      } catch {
        // Soft-fail: let the wanderer in. The signed-url endpoint
        // remains the authoritative gate; this hook is UI-only.
        if (!cancelled) {
          setSnapshot((prev) => ({
            ...prev,
            allowed: true,
            reason: "fetch_failed",
            loading: false,
          }));
        }
      }
    };

    fetchOnce();
    const pollId = setInterval(fetchOnce, POLL_INTERVAL_MS);

    // Local 1s tick — only decrements when we have a real countdown.
    const tickId = setInterval(() => {
      if (cancelled) return;
      if (remainingRef.current <= 0) return;
      remainingRef.current = Math.max(0, remainingRef.current - 1);
      setSnapshot((prev) =>
        prev.secondsRemaining === remainingRef.current
          ? prev
          : { ...prev, secondsRemaining: remainingRef.current },
      );
    }, TICK_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(pollId);
      clearInterval(tickId);
    };
  }, [enabled]);

  const expiringSoon =
    snapshot.secondsRemaining > 0 &&
    snapshot.secondsRemaining <= EXPIRING_THRESHOLD_S;

  return { ...snapshot, expiringSoon };
}

export default useVoiceSessionCap;
