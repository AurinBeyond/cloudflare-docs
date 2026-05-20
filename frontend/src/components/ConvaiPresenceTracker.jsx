/**
 * ConvaiPresenceTracker — drives the Presence Time runtime around a
 * single RoomConvaiChat instance.
 *
 * §STABILIZATION 2026-05-16 PM — Founder directive: track realtime
 * voice usage so the LemonSqueezy-purchased Presence Time balance is
 * deducted automatically. The tracker is a passive observer — it
 * never touches the SDK, WebSocket, or audio context. All it does is:
 *   - POST /api/presence/start  when status flips to "live"
 *   - POST /api/presence/heartbeat every 30s while live
 *   - POST /api/presence/end     when status leaves "live" (idle/error)
 *   - POST /api/presence/interrupted on error transitions for telemetry
 *   - Render the VoiceRecoveryCard when status === "error"
 *
 * The tracker reads status via the new passive `onStatusChange`
 * callback exposed by RoomConvaiChat (read-only emit).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import RoomConvaiChat from "./RoomConvaiChat";
import VoiceRecoveryCard from "./VoiceRecoveryCard";

const HEARTBEAT_INTERVAL_MS = 30_000;

export function ConvaiPresenceTracker({ room = "clarity", onModeChange }) {
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [mode, setMode] = useState("voice");
  const sessionIdRef = useRef(null);
  const heartbeatRef = useRef(null);
  const prevStatusRef = useRef("idle");
  // §TEXT-FREE 2026-05-19 — Hold the "live" mode in a ref so the
  // transition effect can read the most up-to-date mode without
  // needing it as a dependency (which would re-fire the effect).
  const modeRef = useRef("voice");

  // Passive status emit from RoomConvaiChat.
  const onStatusChange = useCallback(
    (nextStatus, nextError, nextMode) => {
      setStatus(nextStatus);
      setErrorMsg(nextError || "");
      if (nextMode && nextMode !== modeRef.current) {
        modeRef.current = nextMode;
        setMode(nextMode);
        if (typeof onModeChange === "function") onModeChange(nextMode);
      }
    },
    [onModeChange],
  );

  // Drive presence ledger off status transitions.
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    // Entering live → start session + heartbeat loop.
    // §TEXT-FREE 2026-05-19 — text mode bypasses the ledger entirely.
    // The SDK still flips to "live" for text-only conversations, but
    // we do NOT open a `voice_sessions` row, so no presence_seconds
    // are decremented. Founder directive: writing is always free.
    if (prev !== "live" && status === "live" && modeRef.current !== "text") {
      (async () => {
        try {
          const res = await api.post("/presence/start", { room });
          sessionIdRef.current = res?.data?.session_id || null;
        } catch {
          // Soft-fail — voice still works, just no presence tracking.
          sessionIdRef.current = null;
        }
      })();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      heartbeatRef.current = setInterval(() => {
        const sid = sessionIdRef.current;
        if (!sid) return;
        api.post("/presence/heartbeat", { session_id: sid }).catch(() => {});
      }, HEARTBEAT_INTERVAL_MS);
    }

    // Leaving live → close session + stop heartbeat.
    if (prev === "live" && status !== "live") {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      const sid = sessionIdRef.current;
      if (sid) {
        const reason = status === "error" ? "voice_error" : "user_end";
        api
          .post("/presence/end", { session_id: sid, reason })
          .catch(() => {});
        sessionIdRef.current = null;
      }
    }

    // Error transition → log telemetry for the recovery card.
    if (prev !== "error" && status === "error") {
      api
        .post("/presence/interrupted", {
          room,
          session_id: sessionIdRef.current,
          error: errorMsg,
        })
        .catch(() => {});
    }
  }, [status, errorMsg, room]);

  // §TEXT-FREE 2026-05-19 — Mid-session mode switch watchdog.
  // If the wanderer flips voice→text WHILE a presence row is open,
  // close the ledger immediately so credits stop draining the moment
  // they stop speaking. The room itself keeps running; only the
  // billed presence row ends. When they flip back to voice, the
  // status→live transition (or the next "live" tick) will reopen
  // a fresh presence row.
  useEffect(() => {
    if (mode === "text" && sessionIdRef.current) {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      const sid = sessionIdRef.current;
      sessionIdRef.current = null;
      api
        .post("/presence/end", { session_id: sid, reason: "mode_switch_text" })
        .catch(() => {});
    }
    // Voice→Hybrid→Voice transitions keep the ledger open. Only the
    // explicit drop to "text" closes the row.
  }, [mode]);

  // Tab close / page unload — flush the close beacon.
  useEffect(() => {
    const flush = () => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      try {
        const body = new Blob(
          [JSON.stringify({ session_id: sid, reason: "page_unload" })],
          { type: "application/json" },
        );
        const url = `${api.defaults.baseURL}/presence/end`;
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, body);
        }
      } catch {
        /* best-effort */
      }
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      const sid = sessionIdRef.current;
      if (sid) {
        api
          .post("/presence/end", { session_id: sid, reason: "auto" })
          .catch(() => {});
      }
    };
  }, []);

  return (
    <>
      <VoiceRecoveryCard
        visible={status === "error"}
        errorMsg={errorMsg}
        onDismiss={() => setStatus("idle")}
      />
      <RoomConvaiChat room={room} onStatusChange={onStatusChange} />
    </>
  );
}

export default ConvaiPresenceTracker;
