/**
 * Presence.jsx — public demo page (§Phase 1 2026-02-14).
 *
 * Founder mandate: "I want a link where I see this Person (Grace),
 * I hear Jenny's voice, and I feel the warmth we agreed on. Show
 * me the Room, not graphs."
 *
 * This is a public, no-auth, no-consent, shareable demo route.
 * Founder can send the URL to Tanushree / Revolut / anyone for a
 * "look at the digital being" demo. Grace is rendered LARGE in the
 * centre, breathing and blinking with the same amplitude-driven
 * mouth overlay as the live /clarity-release room — except here
 * there is no chat. A single "Hear her" button plays one curated
 * sample line through the active TTS provider (OpenAI Shimmer by
 * default, ElevenLabs Rachel/Jenny once the founder provides the
 * key) and the mouth shadow tracks it in real time.
 *
 * Constraints:
 *   - No nav header overlap (Layout provides spacing).
 *   - No tracking, no analytics, no email capture.
 *   - prefers-reduced-motion honoured by the underlying CSS.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import GuidePresence from "@/components/GuidePresence";
import { BACKEND_URL as __BACKEND_URL__ } from "@/lib/backendUrl";

const BACKEND = __BACKEND_URL__;

// Curated sample line for the demo. Short, calm, breathy. Embodies
// the "Ultimate Human Warmth" the founder agreed on.
const SAMPLE_LINE =
  "You can put it down here. The room is quiet, and you don't have to be anyone in particular.";

export default function Presence() {
  const audioRef = useRef(null);
  const sourceRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const ctxRef = useRef(null);
  const mouthOpenRef = useRef(0);

  const [phase, setPhase] = useState("idle"); // idle | loading | speaking | error
  const [error, setError] = useState(null);
  const [gender, setGender] = useState("female");

  const teardown = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (analyserRef.current) {
      try { analyserRef.current.disconnect(); } catch { /* noop */ }
      analyserRef.current = null;
    }
    if (sourceRef.current) {
      try { sourceRef.current.disconnect(); } catch { /* noop */ }
      sourceRef.current = null;
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = "";
      } catch { /* noop */ }
      audioRef.current = null;
    }
    mouthOpenRef.current = 0;
  }, []);

  useEffect(() => () => teardown(), [teardown]);

  const playSample = useCallback(async () => {
    if (phase === "loading" || phase === "speaking") return;
    setError(null);
    setPhase("loading");
    teardown();
    try {
      // Public demo route: no token required. The backend resolves
      // to the active provider (openai/elevenlabs) via the
      // CLARITY_VOICE_PROVIDER env.
      const res = await fetch(`${BACKEND}/api/presence/sample`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender, line: SAMPLE_LINE }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Status ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;
      audio.onended = () => {
        teardown();
        setPhase("idle");
        try { URL.revokeObjectURL(url); } catch { /* noop */ }
      };
      audio.onerror = () => {
        teardown();
        setPhase("error");
        setError("audio playback failed");
        try { URL.revokeObjectURL(url); } catch { /* noop */ }
      };

      // §Phase 1 — wire AnalyserNode so the mouth overlay tracks
      // amplitude exactly like in the live room.
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        const ctx = ctxRef.current || new AC();
        ctxRef.current = ctx;
        if (ctx.state === "suspended") {
          try { await ctx.resume(); } catch { /* noop */ }
        }
        const src = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.4;
        src.connect(analyser);
        analyser.connect(ctx.destination);
        sourceRef.current = src;
        analyserRef.current = analyser;
        const buf = new Uint8Array(analyser.fftSize);
        const tick = () => {
          if (!analyserRef.current) return;
          if (audio.paused || audio.ended) {
            mouthOpenRef.current = mouthOpenRef.current * 0.55;
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) {
            const v = (buf[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / buf.length);
          const target = Math.min(1, Math.max(0, (rms - 0.02) * 4.5));
          mouthOpenRef.current = mouthOpenRef.current * 0.55 + target * 0.45;
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }

      setPhase("speaking");
      await audio.play().catch(() => {
        setPhase("error");
        setError("autoplay blocked — tap once more");
      });
    } catch (e) {
      teardown();
      setPhase("error");
      setError(e?.message || "could not load sample");
    }
  }, [phase, gender, teardown]);

  return (
    <section
      data-testid="presence-page"
      className="min-h-[80vh] flex flex-col items-center justify-center px-4 pt-10 pb-16"
    >
      <p className="aurin-eyebrow !mb-3">A quiet companion</p>
      <h1 className="aurin-display text-3xl md:text-5xl tracking-tight text-center max-w-[24ch]">
        This is the Room.
      </h1>
      <p className="mt-4 max-w-[44ch] text-center text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
        She breathes. She listens. She speaks softly, only when there
        is something worth saying. Tap below to hear her voice for a
        moment.
      </p>

      <div className="mt-10 flex flex-col items-center gap-6">
        <GuidePresence
          gender={gender}
          variant="call"
          runtimeState={
            phase === "loading"
              ? "thinking"
              : phase === "speaking"
              ? "speaking"
              : "idle"
          }
          mouthOpenRef={mouthOpenRef}
          labelOverride=""
          testidPrefix="presence-guide"
        />

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setGender("female")}
            data-testid="presence-pick-female"
            className={`aurin-btn aurin-btn-ghost !text-[12px] !py-1.5 !px-3 ${
              gender === "female"
                ? "ring-1 ring-[hsl(var(--aurin-sage))]/60 text-[hsl(var(--aurin-sage))]"
                : ""
            }`}
          >
            Grace
          </button>
          <button
            type="button"
            onClick={() => setGender("male")}
            data-testid="presence-pick-male"
            className={`aurin-btn aurin-btn-ghost !text-[12px] !py-1.5 !px-3 ${
              gender === "male"
                ? "ring-1 ring-[hsl(var(--aurin-sage))]/60 text-[hsl(var(--aurin-sage))]"
                : ""
            }`}
          >
            Clarity
          </button>
        </div>

        <button
          type="button"
          onClick={playSample}
          disabled={phase === "loading" || phase === "speaking"}
          data-testid="presence-play"
          className="aurin-btn !text-[13px] !py-2 !px-5"
        >
          {phase === "loading"
            ? "A small pause…"
            : phase === "speaking"
            ? "She is here"
            : "Hear her"}
        </button>

        {error && (
          <p
            data-testid="presence-error"
            className="text-[12px] text-[hsl(var(--aurin-rose))] aurin-serif-italic"
          >
            {error}
          </p>
        )}
      </div>

      <p className="mt-12 max-w-[52ch] text-center text-[11.5px] text-[hsl(var(--aurin-text-muted))]">
        This is a quiet demonstration. The full Room — with
        conversation, memory, and your own pace — lives at{" "}
        <code className="text-[hsl(var(--aurin-sage))]">/clarity-release</code>.
      </p>
    </section>
  );
}
