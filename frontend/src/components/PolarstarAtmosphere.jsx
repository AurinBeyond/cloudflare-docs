/**
 * PolarstarAtmosphere.jsx — the shared "living world" wrapper used by
 * the Polarstar homepage AND each per-age room. Keeps the time-of-day
 * detection + painted background layer in one place so every screen
 * shares the same atmosphere.
 *
 * §POLARSTAR 2026-02-13
 */
import { useEffect, useMemo, useState } from "react";

export function getTimeMode() {
  const h = new Date().getHours();
  if (h >= 5  && h < 11) return "morning";
  if (h >= 11 && h < 17) return "day";
  if (h >= 17 && h < 22) return "evening";
  return "night";
}

/* §POLARSTAR v10 iter 85g — Founder decision: the PUBLIC Polarstar
 * world opens in DAY MODE by default. Auto-detected time mood is too
 * subtle a hook for a preview-only product, and the founder's first
 * reference image is the day painting. A subtle mode toggle (sun /
 * moon) lets visitors flip to night if they wish; we do NOT auto-
 * shift the surface based on the visitor's local clock anymore.
 */
export function getDefaultMode() {
  return "day";
}

export default function PolarstarAtmosphere({ children, testid = "polarstar-root" }) {
  const initial = useMemo(() => getDefaultMode(), []);
  const [mode, setMode] = useState(initial);
  const [imgReady, setImgReady] = useState(false);

  /* §POLARSTAR v10 iter 85g — Allow any descendant to flip the mode
   * via `polarstar:setMode` events. Used by the painted sun / moon
   * toggle in the top-right of the world. */
  useEffect(() => {
    const handler = (e) => {
      const next = (e.detail && e.detail.mode) || null;
      if (next === "day" || next === "night") setMode(next);
    };
    window.addEventListener("polarstar:setMode", handler);
    return () => window.removeEventListener("polarstar:setMode", handler);
  }, []);

  // Pre-load painted background so we crossfade in rather than flash.
  // §POLARSTAR v10 iter 85f — only TWO paintings carry the UI map:
  //   day-world-v2.png  → used for morning + day  (light mood)
  //   night-world-v2.png → used for evening + night (dark mood)
  // The older single-scene paintings (morning-world.png / evening-world.png)
  // are decorative-only and DO NOT contain the click-zone targets, so
  // we never serve them as the world background.
  useEffect(() => {
    setImgReady(false);
    const isLight = mode === "morning" || mode === "day";
    const file = isLight ? "day-world-v2.png" : "night-world-v2.png";
    const url = `${process.env.PUBLIC_URL || ""}/polarstar/${file}`;
    const img = new Image();
    img.onload = () => setImgReady(true);
    img.onerror = () => setImgReady(false);
    img.src = url;
  }, [mode]);

  const isLight = mode === "morning" || mode === "day";
  const bgFile = isLight ? "day-world-v2.png" : "night-world-v2.png";

  return (
    <main
      className={`ps-world-root ps-mode-${mode}`}
      data-testid={testid}
      data-time-mode={mode}
    >
      {/* §POLARSTAR v10 iter 85h — On day/morning, PolarstarDayWorld
       * provides its OWN painted background to keep the hitbox % map
       * aligned with the painted pixels. We render the atmosphere bg
       * only for night/evening (NightClickMap layout). */}
      {!isLight && (
        <div
          className={`ps-atmosphere ${imgReady ? "ps-atmosphere--ready" : ""}`}
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL || ""}/polarstar/${bgFile})` }}
          aria-hidden="true"
          data-testid="polarstar-atmosphere"
        />
      )}
      <div className="ps-glow"  aria-hidden="true" />
      <div className="ps-noise" aria-hidden="true" />
      {typeof children === "function" ? children(mode) : children}
    </main>
  );
}
