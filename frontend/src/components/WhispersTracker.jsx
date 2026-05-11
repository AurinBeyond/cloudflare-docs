import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { api } from "@/lib/api";

/**
 * WhispersTracker — silent micro-influencer attribution.
 *
 * If the URL carries a `?w=<slug>` parameter, the slug is stored in
 * localStorage (30-day window) and a single tracking ping is sent to
 * the backend. The slug then accompanies any future LemonSqueezy
 * checkout via `custom_data.whisper`, letting the founder thank the
 * source of the visit. Completely silent — no UI.
 */
export default function WhispersTracker() {
  const location = useLocation();
  // useRef guards against React StrictMode's double-mount in dev so we
  // never fire two identical tracking pings for the same slug.
  const firedFor = useRef(new Set());

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const slug = (params.get("w") || "").trim().toLowerCase();
      if (!slug || slug.length > 64) return;
      if (firedFor.current.has(slug)) return;
      firedFor.current.add(slug);

      // Persist for 30 days.
      const payload = {
        slug,
        captured_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      try {
        localStorage.setItem("aurin_whisper", JSON.stringify(payload));
      } catch {
        /* storage unavailable */
      }

      // Best-effort tracking ping.
      api
        .post("/whispers/track", {
          slug,
          referer: document.referrer || null,
          landing_path: location.pathname || "/",
        })
        .catch(() => {
          /* swallow — never block UI on a marketing ping */
        });
    } catch {
      /* never throw from here */
    }
  }, [location.search, location.pathname]);

  return null;
}
