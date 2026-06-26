/**
 * VoiceStatusRow.jsx — single source of truth for the house
 * voice-status line.
 *
 * §Phase 1 follow-up (2026-02-14). Iter 69 / 70 / 71 each had to
 * remove the same banned soft-voice labels ("A small pause.",
 * "Listening, unhurried.", "Speaking softly.") from the same
 * three near-identical voice-status JSX blocks (ClarityRelease,
 * BodyRoomChat, ParentsRoomChat). The duplication created a
 * recurring regression surface — every cleanup pass had to be
 * applied three times, and the third pass was always the one that
 * got missed.
 *
 * This component is now the ONLY place where voice-status copy
 * lives. The phrasing has been audited against the founder's
 * Phase 0 House lock: technical state must be FELT, not READ.
 * The only strings we render are:
 *
 *   "Microphone paused."  — operationally meaningful (the wanderer
 *                           has acted; we acknowledge their act)
 *   "Hearing the words."  — STT is mid-flight; the wanderer needs
 *                           to know their voice is being processed
 *                           (otherwise the room feels broken)
 *   ""                    — every other state. The room SHOWS, it
 *                           doesn't tell. The coloured dot + ring
 *                           already signal listening/speaking
 *                           visually.
 *
 * **DO NOT** add a string for `speaking` or `listening` — those are
 * signalled by the dot animation + GuidePresence portrait state.
 *
 * Props:
 *   voice         the object returned by useVoiceIO()
 *   variant       "clarity" | "compact"
 *                 "clarity"  — bigger dot (w-2 h-2) + glow on speak,
 *                               row centred, used in /clarity-release
 *                 "compact"  — smaller dot (w-1.5 h-1.5), used in the
 *                               Body Room + Parents' Room chat cards
 *   testid        data-testid for the status div (room-prefixed)
 *   showMuteToggle  boolean — render the Pause/Resume mic button
 *                   alongside (only on the Clarity page so the Body
 *                   and Parents rooms stay button-free).
 *   muteTestid    data-testid for the mute button when shown
 */
import React from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function VoiceStatusRow({
  voice,
  variant = "compact",
  testid = "voice-status",
  showMuteToggle = false,
  muteTestid = "voice-mute",
}) {
  if (!voice || !voice.supportedIn) return null;

  const isClarity = variant === "clarity";

  // Coloured dot — visual signal for listening / transcribing /
  // speaking / muted / idle. The wanderer FEELS state from this dot
  // (plus the GuidePresence portrait state), never reads it.
  const dotClass = `inline-block rounded-full ${
    isClarity ? "w-2 h-2 transition-all" : "w-1.5 h-1.5"
  } ${
    voice.speaking
      ? isClarity
        ? "bg-[hsl(var(--aurin-sage))] shadow-[0_0_10px_hsl(var(--aurin-sage))]"
        : "bg-[hsl(var(--aurin-sage))]"
      : voice.transcribing
      ? "bg-[hsl(var(--aurin-sage))/0.6]"
      : voice.listening
      ? "bg-[hsl(var(--aurin-sage))/0.85] animate-pulse"
      : voice.muted
      ? "bg-[hsl(var(--aurin-text-muted))/0.4]"
      : "bg-[hsl(var(--aurin-sage))/0.35]"
  }`;

  // Founder lock — only these labels are permitted. Anything else
  // is house-broken vocabulary and must NEVER reach the wanderer.
  const label = voice.muted
    ? "Microphone paused."
    : voice.transcribing
    ? "Hearing the words."
    : "";

  const rowClass = isClarity
    ? "flex items-center gap-2 text-[12px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic"
    : "mt-1 flex items-center gap-2 text-[11px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic";

  const statusEl = (
    <div
      data-testid={testid}
      data-listening={voice.listening ? "true" : "false"}
      data-transcribing={voice.transcribing ? "true" : "false"}
      data-speaking={voice.speaking ? "true" : "false"}
      data-muted={voice.muted ? "true" : "false"}
      className={rowClass}
    >
      <span aria-hidden className={dotClass} />
      <span>{label}</span>
    </div>
  );

  if (!showMuteToggle) return statusEl;

  return (
    <div className="flex items-center justify-center gap-3">
      {statusEl}
      {voice.supportedOut && (
        <button
          type="button"
          onClick={voice.toggleMute}
          aria-label={voice.muted ? "Resume" : "Pause microphone"}
          data-testid={muteTestid}
          title={voice.muted ? "Resume" : "Pause"}
          className={`aurin-btn aurin-btn-ghost !p-2 ${
            voice.speaking
              ? "ring-1 ring-[hsl(var(--aurin-sage))]/70 text-[hsl(var(--aurin-sage))]"
              : ""
          }`}
        >
          {voice.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      )}
    </div>
  );
}
