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

export function ConvaiPresenceTracker({ room = "clarity" }) {
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const sessionIdRef = useRef(null);
  const heartbeatRef = useRef(null);
  const prevStatusRef = useRef("idle");

  // Passive status emit from RoomConvaiChat.
  const onStatusChange = useCallback((nextStatus, nextError) => {
    setStatus(nextStatus);
    setErrorMsg(nextError || "");
  }, []);

  // Drive presence ledger off status transitions.
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    // Entering live → start session + heartbeat loop.
    if (prev !== "live" && status === "live") {
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
