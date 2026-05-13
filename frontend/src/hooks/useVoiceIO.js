/**
 * useVoiceIO — voice-first IO for Clarity Release & Body Room.
 *
 * INPUT  (mic)    : Browser MediaRecorder → backend /api/clarity/stt
 *                   (OpenAI Whisper-1). Cross-browser, accurate, calm.
 *                   Falls back to browser-native SpeechRecognition only
 *                   when MediaRecorder + getUserMedia are unavailable.
 * OUTPUT (voice)  : Backend OpenAI TTS (Phase B3). Returns mp3 from
 *                   `coral` (female / Jenny) or `echo` (male / Brian),
 *                   tts-1-hd, speed 0.92.
 *
 * Privacy:
 *  - Audio is streamed to the backend over HTTPS, transcribed in
 *    memory, discarded immediately. Only the transcript returns.
 *  - Transcript stays inside the input box until the user submits.
 *  - tts request sends the guide-reply text (already public to the
 *    user) plus the chosen voice gender — bound by bearer token.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const BACKEND = process.env.REACT_APP_BACKEND_URL;
const TOKEN_KEY = "aurin_session_token";

// Native browser SpeechRecognition — kept only as ultimate fallback.
const SR =
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

const AUDIO_SUPPORTED =
  typeof window !== "undefined" && typeof window.Audio !== "undefined";

const HAS_MEDIA_RECORDER =
  typeof window !== "undefined" &&
  typeof window.MediaRecorder !== "undefined" &&
  !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

// Hard cap on a single push-to-talk burst — keeps Whisper bills sane
// and keeps the wanderer's pace honest. 60 s is plenty for "one line".
const MAX_RECORDING_MS = 60_000;

// MediaRecorder mime negotiation — pick the first one the browser
// can encode. Whisper accepts webm, ogg, mp4, m4a, wav, mpeg, mpga.
const PREFERRED_MIMES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4",
];

function pickRecorderMime() {
  if (typeof window === "undefined" || !window.MediaRecorder) return "";
  for (const m of PREFERRED_MIMES) {
    try {
      if (window.MediaRecorder.isTypeSupported(m)) return m;
    } catch {
      /* noop */
    }
  }
  return "";
}

export default function useVoiceIO({
  onResult,
  gender = "female",
  autoVoice = false,           // when true: no button, continuous listen+VAD
  vadSilenceMs = 1700,         // ms of quiet before auto-stop+send (founder: natural pause, not pushy)
  vadVolumeThreshold = 0.018,  // RMS threshold for "is speaking"
  vadMinSpeechMs = 350,        // require at least this much voiced audio
  thoughtfulPauseMs,           // optional: ms of silence before TTS begins; defaults to 1100-1500 random
}) {
  const audioRef = useRef(null);
  const inflightRef = useRef(null); // AbortController for current TTS request

  // §Phase 1 "Digital Presence" (2026-02-14). Real-time mouth amplitude
  // ref written 60 Hz by the TTS AnalyserNode below. GuidePresence
  // reads this ref via its own RAF loop and writes the value into a
  // CSS custom property `--mouth-open` on its wrapper. 0..1.
  // Decoupled, no React re-renders, never blocks the audio pipeline.
  const mouthOpenRef = useRef(0);
  const ttsCtxRef = useRef(null);
  const ttsAnalyserRef = useRef(null);
  const ttsRafRef = useRef(null);

  // MediaRecorder refs
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const stopTimerRef = useRef(null);
  const sttAbortRef = useRef(null);

  // VAD refs (Web Audio API analyser, only used in autoVoice mode)
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const vadRafRef = useRef(null);
  const lastVoiceAtRef = useRef(0);
  const speechStartedAtRef = useRef(0);
  const hasVoicedRef = useRef(false);

  // Native-SR fallback ref
  const recognitionRef = useRef(null);

  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState(null);

  // Voice-in is supported if EITHER the modern path or the fallback
  // is available. The mic button uses the same flag.
  const supportedIn = HAS_MEDIA_RECORDER || !!SR;
  const supportedOut = AUDIO_SUPPORTED;

  // ---- Native SpeechRecognition fallback (one-shot setup) ----
  useEffect(() => {
    if (HAS_MEDIA_RECORDER || !SR) return undefined;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0]?.transcript || "")
        .join(" ")
        .trim();
      if (text && onResult) onResult(text);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    };
  }, [onResult]);

  // ---- Cleanup helpers ----
  const stopVadLoop = useCallback(() => {
    if (vadRafRef.current) {
      cancelAnimationFrame(vadRafRef.current);
      vadRafRef.current = null;
    }
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {
        /* noop */
      }
      analyserRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {
        /* noop */
      }
      audioCtxRef.current = null;
    }
    lastVoiceAtRef.current = 0;
    speechStartedAtRef.current = 0;
    hasVoicedRef.current = false;
  }, []);

  const cleanupStream = useCallback(() => {
    stopVadLoop();
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch {
        /* noop */
      }
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {
        /* noop */
      }
      mediaStreamRef.current = null;
    }
  }, [stopVadLoop]);

  // Always release mic when component unmounts.
  useEffect(() => () => cleanupStream(), [cleanupStream]);

  // ---- Modern path: MediaRecorder → backend Whisper ----
  const _transcribeBlob = useCallback(
    async (blob, mime) => {
      if (!blob || blob.size === 0) {
        setTranscribing(false);
        return;
      }
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem(TOKEN_KEY)
          : null;
      if (!token || !BACKEND) {
        setTranscribing(false);
        setVoiceError("Sign in to use voice input.");
        return;
      }

      // Pick a filename extension that matches the captured mime so
      // Whisper recognises the container.
      let ext = "webm";
      if (mime) {
        if (mime.includes("ogg")) ext = "ogg";
        else if (mime.includes("mp4") || mime.includes("m4a")) ext = "m4a";
        else if (mime.includes("wav")) ext = "wav";
        else if (mime.includes("mpeg")) ext = "mp3";
      }

      const form = new FormData();
      form.append("audio", blob, `clip.${ext}`);

      const controller = new AbortController();
      sttAbortRef.current = controller;
      try {
        const res = await fetch(`${BACKEND}/api/clarity/stt`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
          signal: controller.signal,
        });
        if (!res.ok) {
          let detail = "The room could not hear that clearly.";
          try {
            const j = await res.json();
            if (j?.detail) detail = j.detail;
          } catch {
            /* noop */
          }
          setVoiceError(detail);
          return;
        }
        const data = await res.json().catch(() => ({}));
        const text = (data?.text || "").trim();
        if (text && onResult) onResult(text);
      } catch (err) {
        if (err?.name !== "AbortError") {
          setVoiceError("Voice could not be sent right now.");
        }
      } finally {
        if (sttAbortRef.current === controller) {
          sttAbortRef.current = null;
        }
        setTranscribing(false);
      }
    },
    [onResult],
  );

  const _startMediaRecorder = useCallback(async () => {
    setVoiceError(null);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setVoiceError("Microphone permission needed.");
      return;
    }
    mediaStreamRef.current = stream;
    const mime = pickRecorderMime();
    let recorder;
    try {
      recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
    } catch {
      cleanupStream();
      setVoiceError("Voice recorder unavailable.");
      return;
    }
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = async () => {
      const finalMime = recorder.mimeType || mime || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: finalMime });
      chunksRef.current = [];
      // Stop the mic immediately so the indicator light goes off.
      if (mediaStreamRef.current) {
        try {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        } catch {
          /* noop */
        }
        mediaStreamRef.current = null;
      }
      mediaRecorderRef.current = null;
      setListening(false);
      setTranscribing(true);
      await _transcribeBlob(blob, finalMime);
    };
    recorder.onerror = () => {
      setListening(false);
      setTranscribing(false);
      setVoiceError("Voice recorder hiccup. Try again.");
      cleanupStream();
    };
    mediaRecorderRef.current = recorder;
    try {
      recorder.start();
    } catch {
      cleanupStream();
      setVoiceError("Voice recorder unavailable.");
      return;
    }
    setListening(true);
    // Hard stop after MAX_RECORDING_MS so a stuck button never bills.
    stopTimerRef.current = setTimeout(() => {
      try {
        if (recorder.state === "recording") recorder.stop();
      } catch {
        /* noop */
      }
    }, MAX_RECORDING_MS);

    // ---- Auto-VAD loop (no-button mode) ----
    // When autoVoice is on, monitor mic RMS volume and auto-stop after
    // vadSilenceMs of quiet — only AFTER we heard at least
    // vadMinSpeechMs of actual voiced audio. Prevents bogus empty sends.
    if (autoVoice && typeof window !== "undefined" && window.AudioContext) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        analyserRef.current = analyser;
        const buf = new Uint8Array(analyser.fftSize);
        const tick = () => {
          if (!analyserRef.current) return;
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) {
            const v = (buf[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / buf.length);
          const now = performance.now();
          if (rms > vadVolumeThreshold) {
            // Voiced frame
            if (!hasVoicedRef.current) {
              hasVoicedRef.current = true;
              speechStartedAtRef.current = now;
              // BARGE-IN: if guide is currently speaking, stop it.
              if (audioRef.current) {
                try {
                  audioRef.current.pause();
                  audioRef.current.src = "";
                } catch {
                  /* noop */
                }
                audioRef.current = null;
                setSpeaking(false);
              }
            }
            lastVoiceAtRef.current = now;
          } else if (hasVoicedRef.current && lastVoiceAtRef.current) {
            // Quiet frame after speech started
            const quietFor = now - lastVoiceAtRef.current;
            const voicedFor = lastVoiceAtRef.current - speechStartedAtRef.current;
            if (quietFor >= vadSilenceMs && voicedFor >= vadMinSpeechMs) {
              // End of utterance — stop the recorder, will trigger onstop+send.
              try {
                if (recorder.state === "recording") recorder.stop();
              } catch {
                /* noop */
              }
              return;
            }
          }
          vadRafRef.current = requestAnimationFrame(tick);
        };
        vadRafRef.current = requestAnimationFrame(tick);
      } catch {
        /* VAD setup failed — fall back to manual control */
      }
    }
  }, [
    _transcribeBlob,
    cleanupStream,
    autoVoice,
    vadSilenceMs,
    vadVolumeThreshold,
    vadMinSpeechMs,
  ]);

  const startListening = useCallback(() => {
    if (listening || transcribing) return;
    if (HAS_MEDIA_RECORDER) {
      _startMediaRecorder();
      return;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        /* already started */
      }
    }
  }, [listening, transcribing, _startMediaRecorder]);

  const stopListening = useCallback(() => {
    if (HAS_MEDIA_RECORDER) {
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
      const r = mediaRecorderRef.current;
      if (r && r.state === "recording") {
        try {
          r.stop();
        } catch {
          /* noop */
        }
      } else {
        cleanupStream();
        setListening(false);
      }
      return;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* already stopped */
      }
      setListening(false);
    }
  }, [cleanupStream]);

  // ---- Backend TTS playback ----
  const _stopTtsAnalyser = useCallback(() => {
    if (ttsRafRef.current) {
      cancelAnimationFrame(ttsRafRef.current);
      ttsRafRef.current = null;
    }
    if (ttsAnalyserRef.current) {
      try { ttsAnalyserRef.current.disconnect(); } catch { /* noop */ }
      ttsAnalyserRef.current = null;
    }
    mouthOpenRef.current = 0;
  }, []);

  const stopSpeaking = useCallback(() => {
    if (inflightRef.current) {
      try {
        inflightRef.current.abort();
      } catch {
        /* noop */
      }
      inflightRef.current = null;
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = "";
      } catch {
        /* noop */
      }
      audioRef.current = null;
    }
    _stopTtsAnalyser();
    setSpeaking(false);
  }, [_stopTtsAnalyser]);

  const speak = useCallback(
    async (text) => {
      if (!AUDIO_SUPPORTED || !text || muted) return;
      const token =
        typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
      if (!token || !BACKEND) return; // signed-out users get text-only

      stopSpeaking();

      const controller = new AbortController();
      inflightRef.current = controller;
      try {
        setSpeaking(true);
        const res = await fetch(`${BACKEND}/api/clarity/tts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text, gender }),
          signal: controller.signal,
        });
        if (!res.ok) {
          setSpeaking(false);
          return;
        }
        const blob = await res.blob();
        if (controller.signal.aborted) return;
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.preload = "auto";
        audio.crossOrigin = "anonymous";
        audio.onended = () => {
          setSpeaking(false);
          _stopTtsAnalyser();
          try {
            URL.revokeObjectURL(url);
          } catch {
            /* noop */
          }
        };
        audio.onerror = () => {
          setSpeaking(false);
          _stopTtsAnalyser();
          try {
            URL.revokeObjectURL(url);
          } catch {
            /* noop */
          }
        };
        audioRef.current = audio;

        // §Phase 1 — "Silence is part of the system". A randomized
        // 1.1–1.5 s thoughtful pause before the mentor speaks. Founder
        // mandate: the wanderer must FEEL considered, not processed.
        // Chaos factor: jitter so the wanderer's brain can't pattern-
        // match a metronome cadence.
        const pauseMs = thoughtfulPauseMs ?? (1100 + Math.random() * 400);
        await new Promise((r) => setTimeout(r, pauseMs));
        if (controller.signal.aborted) return;

        // §Phase 1 — amplitude-driven mouth sync. We wire an
        // AnalyserNode onto the TTS HTMLAudioElement BEFORE play()
        // (createMediaElementSource consumes the element, so we MUST
        // also connect to ctx.destination or audio output is muted).
        // Output amplitude (RMS, smoothed via low-pass lerp) drives
        // `mouthOpenRef` 0..1, which GuidePresence reads at 60 Hz and
        // applies to the CSS variable `--mouth-open`.
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (AC) {
            const ctx = ttsCtxRef.current || new AC();
            ttsCtxRef.current = ctx;
            // Some browsers suspend the context until a user gesture.
            // We've had one (the chat submit) by the time we get here.
            if (ctx.state === "suspended") {
              try { await ctx.resume(); } catch { /* noop */ }
            }
            const source = ctx.createMediaElementSource(audio);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.4;
            source.connect(analyser);
            analyser.connect(ctx.destination);
            ttsAnalyserRef.current = analyser;
            const buf = new Uint8Array(analyser.fftSize);
            const sampleLoop = () => {
              if (!ttsAnalyserRef.current) return;
              if (audio.paused || audio.ended) {
                mouthOpenRef.current = mouthOpenRef.current * 0.55;
                ttsRafRef.current = requestAnimationFrame(sampleLoop);
                return;
              }
              analyser.getByteTimeDomainData(buf);
              let sum = 0;
              for (let i = 0; i < buf.length; i++) {
                const v = (buf[i] - 128) / 128;
                sum += v * v;
              }
              const rms = Math.sqrt(sum / buf.length);
              // Map ~0.02..0.30 RMS to 0..1 with gentle compression.
              // Clamp ceiling so very loud frames can't fish-flap.
              const target = Math.min(
                1,
                Math.max(0, (rms - 0.02) * 4.5),
              );
              // Low-pass lerp: 0.55 keep / 0.45 new — smooth, never
              // snappy. This is the difference between "speaking"
              // and "fish-flapping".
              mouthOpenRef.current =
                mouthOpenRef.current * 0.55 + target * 0.45;
              ttsRafRef.current = requestAnimationFrame(sampleLoop);
            };
            ttsRafRef.current = requestAnimationFrame(sampleLoop);
          }
        } catch {
          /* AnalyserNode unavailable — audio still plays, mouth stays
             at rest. Never breaks the conversation. */
        }

        await audio.play().catch(() => {
          // Autoplay blocked — surface gracefully.
          setSpeaking(false);
          _stopTtsAnalyser();
        });
      } catch (err) {
        if (err?.name !== "AbortError") {
          // Silent fail keeps the room calm; text reply still landed.
        }
        setSpeaking(false);
        _stopTtsAnalyser();
      } finally {
        if (inflightRef.current === controller) {
          inflightRef.current = null;
        }
      }
    },
    [gender, muted, stopSpeaking, _stopTtsAnalyser, thoughtfulPauseMs],
  );

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (next) {
        stopSpeaking();
      }
      return next;
    });
  }, [stopSpeaking]);

  const dismissVoiceError = useCallback(() => setVoiceError(null), []);

  // ---- Auto-VAD loop control: after speak finishes (or on initial mount
  // if no audio is playing), automatically (re)start listening. Honor
  // muted state and don't double-start. This is what removes the button.
  useEffect(() => {
    if (!autoVoice) return undefined;
    if (!HAS_MEDIA_RECORDER) return undefined;
    if (listening || transcribing || speaking) return undefined;
    // Small breathing pause so we don't immediately re-grab the mic.
    const t = setTimeout(() => {
      _startMediaRecorder();
    }, 350);
    return () => clearTimeout(t);
  }, [autoVoice, listening, transcribing, speaking, _startMediaRecorder]);

  return {
    supportedIn,
    supportedOut,
    listening,
    transcribing,
    speaking,
    muted,
    voiceError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleMute,
    dismissVoiceError,
    // §Phase 1 — real-time mouth amplitude (0..1) for GuidePresence.
    mouthOpenRef,
  };
}
