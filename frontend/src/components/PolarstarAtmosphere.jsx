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

export default function PolarstarAtmosphere({ children, testid = "polarstar-root" }) {
  const initial = useMemo(() => getTimeMode(), []);
  const [mode, setMode] = useState(initial);
  const [imgReady, setImgReady] = useState(false);

  // Refresh every 15 min so a long-open tab transitions naturally.
  useEffect(() => {
    const id = setInterval(() => setMode(getTimeMode()), 15 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Pre-load painted background so we crossfade in rather than flash.
  useEffect(() => {
    setImgReady(false);
    // §POLARSTAR — night uses the richer v2 (no buildings, asymmetric path)
    const file = mode === "night" ? "night-world-v2.png" : `${mode}-world.png`;
    const url = `${process.env.PUBLIC_URL || ""}/polarstar/${file}`;
    const img = new Image();
    img.onload = () => setImgReady(true);
    img.onerror = () => setImgReady(false);
    img.src = url;
  }, [mode]);

  const bgFile = mode === "night" ? "night-world-v2.png" : `${mode}-world.png`;

  return (
    <main
      className={`ps-world-root ps-mode-${mode}`}
      data-testid={testid}
      data-time-mode={mode}
    >
      <div
        className={`ps-atmosphere ${imgReady ? "ps-atmosphere--ready" : ""}`}
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL || ""}/polarstar/${bgFile})` }}
        aria-hidden="true"
        data-testid="polarstar-atmosphere"
      />
      <div className="ps-glow"  aria-hidden="true" />
      <div className="ps-noise" aria-hidden="true" />
      {typeof children === "function" ? children(mode) : children}
    </main>
  );
}
