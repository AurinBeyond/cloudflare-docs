/**
 * HouseNav.jsx — §TRUST-NAV-SHARED 2026-06-26
 *
 * The two-row navigation used on the homepage (HousePreview). Extracted
 * here so the same nav can travel with the visitor onto /about — the
 * page where two of our five personas first land after clicking
 * STEP INSIDE. Identical nav across both surfaces closes the
 * "context-collapse" finding from the /about audit.
 *
 *   Row 1 (primary):    poetic house labels (Worlds · Compass · Rooms · …)
 *                       + Step Inside CTA on the right
 *   Row 2 (secondary):  small brass trust signals (What This Is ·
 *                       Pricing · Library · Contact) right-aligned
 *
 * `production={true}` removes the 28px Emergent preview-bar offset.
 * Pages using their own layout above (HousePreview itself) keep that
 * prop; pages without (like /about) pass false / omit it.
 */
import { Link } from "react-router-dom";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

export default function HouseNav({ production = false }) {
  return (
    <nav
      data-testid="house-nav"
      className={`fixed ${production ? "top-0" : "top-[28px]"} left-0 right-0 z-50 backdrop-blur-md bg-[rgba(10,9,8,0.42)] border-b border-[rgba(196,164,107,0.08)]`}
    >
      <div className="max-w-[1320px] mx-auto px-6 sm:px-10">
        <div className="h-[64px] flex items-center justify-between">
          <Link
            to="/"
            data-testid="house-logo"
            className="text-[13px] tracking-[0.42em] uppercase text-[#e8e1d5] font-light"
            style={{ fontFamily: SERIF, letterSpacing: "0.42em" }}
          >
            Matrix&nbsp;Aurin
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[11.5px] tracking-[0.24em] uppercase text-[#a59f93]">
            <Link to="/#worlds" className="hover:text-[#e8e1d5] transition-colors duration-500">Worlds</Link>
            <Link to="/#hero-compass" className="hover:text-[#e8e1d5] transition-colors duration-500">Compass</Link>
            <Link to="/#rooms" className="hover:text-[#e8e1d5] transition-colors duration-500">Rooms</Link>
            <Link to="/#open-world" className="hover:text-[#e8e1d5] transition-colors duration-500">Open&nbsp;World</Link>
            <Link to="/#ways" className="hover:text-[#e8e1d5] transition-colors duration-500">Ways&nbsp;to&nbsp;be&nbsp;here</Link>
            <Link to="/#philosophy" className="hover:text-[#e8e1d5] transition-colors duration-500">Philosophy</Link>
          </div>
          <Link
            to="/about"
            data-testid="house-portal-btn"
            aria-label="Step inside — read what Aurin is, then sign in if you are returning"
            className="text-[11px] tracking-[0.32em] uppercase text-[#c4a46b] border border-[rgba(196,164,107,0.55)] px-6 py-2.5 hover:text-[#0b0a08] hover:bg-[#c4a46b] transition-colors duration-500 whitespace-nowrap"
          >
            Step&nbsp;Inside
          </Link>
        </div>
        <div
          data-testid="house-trust-row"
          className="hidden md:flex items-center justify-end gap-5 pb-2 text-[10px] tracking-[0.32em] uppercase text-[#6f6760]"
        >
          <Link to="/about" className="hover:text-[#c4a46b] transition-colors duration-500" data-testid="house-trust-about">What&nbsp;This&nbsp;Is</Link>
          <span className="text-[#3a3530]">·</span>
          <Link to="/pricing" className="hover:text-[#c4a46b] transition-colors duration-500" data-testid="house-trust-pricing">Pricing</Link>
          <span className="text-[#3a3530]">·</span>
          <Link to="/library" className="hover:text-[#c4a46b] transition-colors duration-500" data-testid="house-trust-library">Library</Link>
          <span className="text-[#3a3530]">·</span>
          <Link to="/reach-out" className="hover:text-[#c4a46b] transition-colors duration-500" data-testid="house-trust-contact">Contact</Link>
        </div>
      </div>
    </nav>
  );
}
