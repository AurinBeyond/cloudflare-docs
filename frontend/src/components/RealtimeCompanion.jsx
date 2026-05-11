/**
 * RealtimeCompanion.jsx — frontend WebRTC peer for OpenAI Realtime API.
 *
 * Activation flow:
 *   1. Founder sets OPENAI_API_KEY and REALTIME_MODE=on in backend/.env
 *      (the Universal Key does NOT cover Realtime; OpenAI direct only).
 *   2. Frontend probes GET /api/clarity/realtime/health.
 *      - {enabled:false, ...}  → component renders nothing; parent shows legacy.
 *      - {enabled:true, has_openai_key:true} → component mints an ephemeral
 *        token via POST /api/clarity/realtime/session and opens a WebRTC
 *        peer connection straight to OpenAI.
 *   3. Mic audio is streamed to OpenAI; the model's audio reply is piped
 *      back into a hidden <audio> element which the parent's
 *      GuidePresence component listens to via the `speaking` runtimeState
 *      we expose through onStateChange.
 *
 * The legacy Whisper+Claude+TTS path is left intact in `useVoiceIO` so a
 * single env flag can roll back any time.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function RealtimeCompanion({
  gender = "female",
  onStateChange = () => {},
  onTranscript = () => {},
  testidPrefix = "clarity-realtime",
}) {
  const [available, setAvailable] = useState(null); // null | false | true
  const [status, setStatus] = useState("idle");     // idle | connecting | listening | speaking | error
  const [error, setError] = useState(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const dataChannelRef = useRef(null);

  // ---- 1. Probe health to decide whether to render at all -----------
  useEffect(() => {
    let cancelled = false;
    fetch(`${BACKEND_URL}/api/clarity/realtime/health`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setAvailable(Boolean(d?.enabled && d?.has_openai_key));
      })
      .catch(() => !cancelled && setAvailable(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Surface status changes to the parent (so GuidePresence can pulse).
  useEffect(() => {
    onStateChange(status);
  }, [status, onStateChange]);

  // ---- 2. Cleanup helpers ------------------------------------------
  const teardown = useCallback(() => {
    try {
      dataChannelRef.current?.close();
    } catch {
      /* noop */
    }
    dataChannelRef.current = null;
    try {
      pcRef.current?.close();
    } catch {
      /* noop */
    }
    pcRef.current = null;
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {
        /* noop */
      }
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      try {
        remoteAudioRef.current.srcObject = null;
      } catch {
        /* noop */
      }
    }
    setStatus("idle");
  }, []);

  useEffect(() => teardown, [teardown]);

  // ---- 3. Connect to OpenAI Realtime via WebRTC --------------------
  const connect = useCallback(async () => {
    if (pcRef.current) return; // already connected
    setStatus("connecting");
    setError(null);
    try {
      // 3a. Mint an ephemeral session token from our backend.
      const sessionResp = await fetch(
        `${BACKEND_URL}/api/clarity/realtime/session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ gender }),
        }
      );
      if (!sessionResp.ok) {
        throw new Error(`session mint failed: ${sessionResp.status}`);
      }
      const session = await sessionResp.json();
      const ephemeral = session?.client_secret?.value;
      if (!ephemeral) throw new Error("session missing client_secret");

      // 3b. Set up RTCPeerConnection.
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // 3c. Hidden <audio> element to play mentor audio.
      const audioEl = remoteAudioRef.current;
      if (audioEl) {
        audioEl.autoplay = true;
      }
      pc.ontrack = (event) => {
        if (audioEl && event.streams && event.streams[0]) {
          audioEl.srcObject = event.streams[0];
        }
      };

      // 3d. Add the local mic track.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      // 3e. Open the data channel for events (VAD, transcripts, etc.)
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;
      dc.onmessage = (e) => {
        try {
          const ev = JSON.parse(e.data);
          // The most actionable events:
          // - input_audio_buffer.speech_started   → user is speaking (we listen)
          // - input_audio_buffer.speech_stopped   → user paused (server VAD)
          // - response.audio.delta                → mentor audio is streaming
          // - response.done                       → mentor finished
          // - conversation.item.input_audio_transcription.completed
          //                                       → user transcript
          if (ev.type === "input_audio_buffer.speech_started") {
            setStatus("listening");
          } else if (ev.type === "response.audio.delta") {
            setStatus("speaking");
          } else if (ev.type === "response.done") {
            setStatus("listening");
          } else if (
            ev.type === "conversation.item.input_audio_transcription.completed"
          ) {
            onTranscript?.(ev.transcript || "");
          }
        } catch {
          /* ignore unparseable */
        }
      };

      // 3f. Standard WebRTC SDP offer/answer with OpenAI.
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const model = session?.model || "gpt-realtime";
      const sdpResp = await fetch(
        `https://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`,
        {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${ephemeral}`,
            "Content-Type": "application/sdp",
            "OpenAI-Beta": "realtime=v1",
          },
        }
      );
      if (!sdpResp.ok) {
        throw new Error(`SDP exchange failed: ${sdpResp.status}`);
      }
      const answerSdp = await sdpResp.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
      setStatus("listening");
    } catch (e) {
      setError(e?.message || String(e));
      setStatus("error");
      teardown();
    }
  }, [gender, onTranscript, teardown]);

  if (available !== true) return null; // legacy pipeline owns the UI

  return (
    <div
      data-testid={`${testidPrefix}-root`}
      data-status={status}
      className="flex items-center justify-center gap-3"
    >
      <audio ref={remoteAudioRef} hidden data-testid={`${testidPrefix}-audio`} />
      {status === "idle" ? (
        <button
          type="button"
          onClick={connect}
          data-testid={`${testidPrefix}-connect`}
          className="aurin-btn aurin-btn-primary"
        >
          Open the realtime room
        </button>
      ) : (
        <div
          data-testid={`${testidPrefix}-status`}
          className="flex items-center gap-2 text-[12px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))]"
        >
          <span
            aria-hidden
            className={`inline-block w-2 h-2 rounded-full transition-all ${
              status === "speaking"
                ? "bg-[hsl(var(--aurin-sage))] shadow-[0_0_10px_hsl(var(--aurin-sage))]"
                : status === "listening"
                ? "bg-[hsl(var(--aurin-sage))/0.85] animate-pulse"
                : status === "connecting"
                ? "bg-[hsl(var(--aurin-sage))/0.55]"
                : status === "error"
                ? "bg-[hsl(var(--aurin-text-muted))/0.6]"
                : "bg-[hsl(var(--aurin-sage))/0.35]"
            }`}
          />
          <span>
            {status === "connecting"
              ? "Opening the room."
              : status === "listening"
              ? "Listening."
              : status === "speaking"
              ? "Speaking."
              : status === "error"
              ? `A small problem: ${error || "could not open"}`
              : "A small pause."}
          </span>
          {status !== "connecting" && (
            <button
              type="button"
              onClick={teardown}
              data-testid={`${testidPrefix}-close`}
              className="aurin-btn aurin-btn-ghost !p-1.5 text-[11px]"
              aria-label="Close the realtime room"
              title="Close"
            >
              Close
            </button>
          )}
        </div>
      )}
    </div>
  );
}
