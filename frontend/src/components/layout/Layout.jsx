import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import AiDock from "@/components/AiDock";
import AgeGate from "@/components/AgeGate";

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <>
      <Navigation />
      <main data-testid="main-content" className="relative z-[2]">
        <Outlet />
      </main>
      <Footer />
      <AiDock />
      <AgeGate />
    </>
  );
}
