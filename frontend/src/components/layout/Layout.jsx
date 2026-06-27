import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import HouseNav from "./HouseNav";
import Footer from "./Footer";
import AiDock from "@/components/AiDock";
import AgeGate from "@/components/AgeGate";

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  // §HOUSE-CONSISTENCY 2026-06-27 — Layout now uses the same
  // HouseNav as `/` and `/about`, so every page inside the wrapper
  // (pricing, legal, library, account, contact, all keeper rooms…)
  // inherits a single coherent maja-feel. The legacy Navigation is
  // retired but kept in /components/layout/Navigation.jsx for one
  // release in case of rollback.

  // §Phase 0 — House mode. The mentor rooms must feel like a
  // house, not a marketing site. Hide the AiDock ("The Guardian ·
  // soon") teaser on every mentor surface so it never overlaps the
  // wanderer's speaking experience.
  const isHouse = (
    location.pathname.startsWith("/grace") ||
    location.pathname.startsWith("/clarity-release") ||
    location.pathname.startsWith("/body-room") ||
    location.pathname.startsWith("/body-world") ||
    location.pathname.startsWith("/parents-room") ||
    location.pathname.startsWith("/kids-universe") ||
    location.pathname.startsWith("/cabinet") ||
    location.pathname.startsWith("/portal/guest") ||
    location.pathname.startsWith("/guest")
  );

  return (
    <>
      <HouseNav />
      <main data-testid="main-content" className="relative z-[2] pt-[96px]">
        <Outlet />
      </main>
      <Footer />
      {!isHouse && <AiDock />}
      <AgeGate />
    </>
  );
}
