/**
 * §LAUNCH-PAUSE 2026-02 — one shared disabled pill used in place of
 * every active checkout CTA during Launch Pause Mode.
 *
 * Usage:
 *   import { LAUNCH_PAUSE } from "@/lib/launchPause";
 *   import LaunchPauseButton from "@/components/LaunchPauseButton";
 *   {LAUNCH_PAUSE
 *     ? <LaunchPauseButton testid="hearth-buy-cta" label="Coming soon · €19" />
 *     : <a href="..." data-testid="hearth-buy-cta">Step inside · €19</a>}
 *
 * The wrapper KEEPS the original data-testid on the pill itself so
 * existing Playwright selectors continue to resolve.
 */
import { Sparkles } from "lucide-react";
import { PAUSE_SUBTEXT_DEFAULT } from "@/lib/launchPause";

export default function LaunchPauseButton({
  label = "Coming soon",
  subtext = PAUSE_SUBTEXT_DEFAULT,
  testid,
  style,
  className = "",
  hideSubtext = false,
  size = "lg",
}) {
  const padding = size === "sm" ? "px-4 py-2" : "px-7 py-3.5";
  const fontSize = size === "sm" ? "text-[12.5px]" : "text-sm";
  return (
    <span className="inline-flex flex-col items-center gap-3">
      <span
        data-testid={testid}
        aria-disabled="true"
        className={`inline-flex items-center gap-2 ${padding} ${fontSize} rounded-full cursor-not-allowed ${className}`}
        style={{
          background: "rgba(100, 90, 70, 0.16)",
          color: "#8a7a5a",
          border: "1px solid rgba(140, 120, 90, 0.32)",
          letterSpacing: "0.04em",
          fontWeight: 500,
          ...style,
        }}
      >
        <Sparkles size={size === "sm" ? 12 : 14} strokeWidth={1.6} />
        {label}
      </span>
      {!hideSubtext && (
        <p
          data-testid={`${testid}-pause-note`}
          className="text-[11.5px] italic max-w-[44ch] text-center leading-relaxed"
          style={{ color: "#8a7a5a" }}
        >
          {subtext}
        </p>
      )}
    </span>
  );
}
