/**
 * PageviewTracker — quietly beacons every route change to
 * /api/insights/event. Mounted once inside <BrowserRouter>; uses
 * useLocation so we capture client-side navigations as well as
 * full page loads.
 *
 * Built 2026-06-25 for the Substack soft-launch test window.
 */
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageview } from "../lib/track";

export default function PageviewTracker() {
  const location = useLocation();
  const last = useRef(null);

  useEffect(() => {
    const path = location.pathname || "/";
    if (last.current === path) return;
    last.current = path;
    trackPageview(path);
  }, [location.pathname]);

  return null;
}
