/**
 * StonePath.jsx — "stein på stein" walking-stones row.
 *
 * §BODY-TEMPLE 2026-02-09 — Founder directive (Anna): replace the
 * chip-row inside each Body Temple week card with a curving path
 * of stones. Today's day pulses with golden glow; walked days
 * carry a soft sage tint; locked days are dimmed with a padlock.
 *
 * Pure visual layer — relies on the same `body_temple_progress`
 * data the chip row used. Each stone is clickable and opens the
 * day modal.
 *
 * Reusable: pass any list of `{day, locked, completed}` items.
 * Used today only by BodyTemple.jsx; future Adult Clarity courses
 * can reuse without changes.
 */

import { Lock, Check } from "lucide-react";

export default function StonePath({ days, currentDay, onPick, testIdPrefix = "stone-day" }) {
    if (!days?.length) return null;

    return (
        <div className="relative py-4" data-testid="stone-path">
            {/* Curved guide-line behind the stones (decorative). */}
            <svg
                aria-hidden="true"
                viewBox="0 0 400 70"
                preserveAspectRatio="none"
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-[60px] pointer-events-none"
            >
                <path
                    d="M 5 35 Q 60 5 120 35 T 240 35 T 395 35"
                    stroke="rgba(255, 222, 165, 0.65)"
                    strokeWidth="2"
                    strokeDasharray="2 4"
                    fill="none"
                />
            </svg>

            <div className="relative flex flex-wrap gap-2 justify-start items-center">
                {days.map((d) => {
                    const isCurrent = currentDay === d.day;
                    const isCompleted = !!d.completed;
                    const isLocked = !!d.locked;
                    return (
                        <button
                            key={d.day}
                            type="button"
                            onClick={() => onPick?.(d.day)}
                            data-testid={`${testIdPrefix}-${d.day}`}
                            aria-label={`Day ${d.day}${isCompleted ? ' walked' : isLocked ? ' locked' : ''}`}
                            className={[
                                "relative inline-flex items-center justify-center rounded-full",
                                "transition-all duration-300 hover:scale-110",
                                "text-[12px] font-medium",
                                isCurrent ? "stone-pulse" : "",
                            ].join(" ")}
                            style={{
                                width: 42,
                                height: 42,
                                background: isCurrent
                                    ? "radial-gradient(circle at 30% 30%, #fff7d6 0%, #f4c97a 55%, #d49a3a 100%)"
                                    : isCompleted
                                        ? "radial-gradient(circle at 30% 30%, #f0eadd 0%, #b9c9ab 60%, #7a9472 100%)"
                                        : isLocked
                                            ? "radial-gradient(circle at 30% 30%, #ede4d1 0%, #c9bda3 60%, #8a7d61 100%)"
                                            : "radial-gradient(circle at 30% 30%, #fbf3df 0%, #ddccaa 55%, #ad9772 100%)",
                                color: isCurrent ? "#3d2e15" : isCompleted ? "#2c3a25" : "#4a3a1c",
                                border: isCurrent
                                    ? "2px solid #d49a3a"
                                    : "1.5px solid rgba(120, 80, 30, 0.35)",
                                boxShadow: isCurrent
                                    ? "0 0 0 4px rgba(244, 201, 122, 0.35), 0 8px 18px -6px rgba(212, 154, 58, 0.7), inset 0 1px 2px rgba(255,255,255,0.9)"
                                    : isCompleted
                                        ? "0 4px 10px -4px rgba(122, 148, 114, 0.7), inset 0 1px 2px rgba(255,255,255,0.6)"
                                        : "0 4px 10px -6px rgba(120, 80, 30, 0.45), inset 0 1px 2px rgba(255,255,255,0.6)",
                                opacity: isLocked && !isCompleted ? 0.78 : 1,
                                cursor: "pointer",
                            }}
                        >
                            {isCompleted ? (
                                <Check size={14} strokeWidth={2.5} />
                            ) : isLocked ? (
                                <span className="flex flex-col items-center">
                                    <Lock size={10} strokeWidth={2.2} />
                                    <span className="text-[9px] mt-0.5 leading-none">{d.day}</span>
                                </span>
                            ) : (
                                <span>{d.day}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            <style>{`
                .stone-pulse {
                    animation: stone-pulse-anim 2.4s ease-in-out infinite;
                }
                @keyframes stone-pulse-anim {
                    0%, 100% {
                        box-shadow:
                            0 0 0 3px rgba(244, 201, 122, 0.35),
                            0 8px 18px -6px rgba(212, 154, 58, 0.7),
                            inset 0 1px 2px rgba(255,255,255,0.9);
                    }
                    50% {
                        box-shadow:
                            0 0 0 8px rgba(244, 201, 122, 0.2),
                            0 12px 26px -6px rgba(212, 154, 58, 0.9),
                            inset 0 1px 3px rgba(255,255,255,1);
                    }
                }
            `}</style>
        </div>
    );
}
