/**
 * AurinSparkle — single Lottie wrapper used across the Kids Hubs +
 * Angel Stars surfaces.
 *
 * §KIDS-HUBS 2026-02-09 — Three variants matched to the three
 * Lottie assets shipped in /public/assets/lottie/:
 *
 *   variant="ambient"     → soft pulsing star, looped (Hub decoration)
 *   variant="celebrate"   → "well done" burst, plays once (star earned)
 *   variant="unlock"      → mystery reward open, plays once (tier hit)
 *
 * The JSON files are hand-authored in the House palette (warm
 * peach-gold) so no third-party CDN is in the runtime path. Loaded
 * lazily on the client only.
 */

import { useEffect, useState, useRef } from "react";
import Lottie from "lottie-react";

const VARIANT_TO_PATH = {
  ambient: "/assets/lottie/sparkle-ambient.json",
  celebrate: "/assets/lottie/star-celebration.json",
  unlock: "/assets/lottie/mystery-unlock.json",
};

const VARIANT_DEFAULTS = {
  ambient: { loop: true, autoplay: true },
  celebrate: { loop: false, autoplay: true },
  unlock: { loop: false, autoplay: true },
};

export default function AurinSparkle({
  variant = "ambient",
  size = 80,
  className = "",
  loop,
  autoplay,
  onComplete,
  "data-testid": dataTestId,
}) {
  const [data, setData] = useState(null);
  const lottieRef = useRef(null);
  const path = VARIANT_TO_PATH[variant] || VARIANT_TO_PATH.ambient;
  const defaults = VARIANT_DEFAULTS[variant] || VARIANT_DEFAULTS.ambient;
  const finalLoop = loop ?? defaults.loop;
  const finalAutoplay = autoplay ?? defaults.autoplay;

  useEffect(() => {
    let alive = true;
    fetch(path)
      .then((r) => r.json())
      .then((json) => {
        if (alive) setData(json);
      })
      .catch(() => {
        // Soft-fail: render nothing if asset missing rather than crash the page.
      });
    return () => {
      alive = false;
    };
  }, [path]);

  if (!data) {
    return (
      <span
        aria-hidden="true"
        className={className}
        style={{ display: "inline-block", width: size, height: size }}
        data-testid={dataTestId}
      />
    );
  }

  return (
    <span
      className={className}
      style={{ display: "inline-block", width: size, height: size, lineHeight: 0 }}
      data-testid={dataTestId}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={data}
        loop={finalLoop}
        autoplay={finalAutoplay}
        onComplete={onComplete}
        style={{ width: "100%", height: "100%" }}
      />
    </span>
  );
}
