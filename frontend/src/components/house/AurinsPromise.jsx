/**
 * AurinsPromise.jsx — §BRAND-CLARITY 2026-02-11
 *
 * Universal trust anchor + early access note. Imported on:
 *   - HousePreview (home)
 *   - BodyTemple
 *   - ClarityRelease
 *   - ParentsRoom
 *
 * Two minimal stacked blocks:
 *   1. EARLY ACCESS  — transparency about phase, content, prices.
 *   2. AURIN'S PROMISE — 4-line trust anchor.
 *
 * Both signed "— Anna & Aurin" to match the brand voice. No new
 * fonts, no new colours, no images. Designed to nest inside both
 * the dark house backdrop (#0b0a08) and the cream Body Temple
 * surface — accepts an optional `tone` prop: "dark" | "cream".
 */

import React from "react";

const SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, serif';
const SCRIPT = '"Caveat", "Caveat Brush", cursive';

const PALETTE = {
  dark: {
    bg: "transparent",
    border: "rgba(196, 164, 107, 0.18)",
    eyebrow: "#a59f93",
    heading: "#e8e1d5",
    body: "#bcb4a3",
    accent: "#c4a46b",
    signature: "#d9c79b",
  },
  cream: {
    bg: "transparent",
    border: "rgba(80, 60, 30, 0.18)",
    eyebrow: "#7a6244",
    heading: "#3a2c1c",
    body: "#5a4a2e",
    accent: "#8a6a1a",
    signature: "#3a2c1c",
  },
};

export default function AurinsPromise({ tone = "dark", showEarlyAccess = true }) {
  const c = PALETTE[tone] || PALETTE.dark;

  return (
    <section
      data-testid="aurins-promise-block"
      className="relative w-full"
      style={{ background: c.bg, fontFamily: SERIF }}
    >
      <div className="max-w-[820px] mx-auto px-6 sm:px-10 py-20 sm:py-24">
        {showEarlyAccess && (
          <div
            data-testid="early-access-note"
            className="mb-16 pb-16"
            style={{ borderBottom: `1px solid ${c.border}` }}
          >
            <p
              className="text-[11px] tracking-[0.36em] uppercase mb-5"
              style={{ color: c.accent, fontFamily: SERIF }}
            >
              ✦ Early Access · 2026
            </p>
            <p
              className="text-[18px] sm:text-[20px] leading-[1.7] font-light italic"
              style={{ color: c.heading, fontFamily: SERIF, letterSpacing: "0.005em" }}
            >
              We are in the quiet beginning. Prices reflect our gratitude to
              the first hands that open these doors. Content keeps growing —
              slowly, by hand, as we listen and refine.
            </p>
            <p
              className="mt-6 text-[26px]"
              style={{ color: c.signature, fontFamily: SCRIPT }}
            >
              — Anna &amp; Aurin
            </p>
          </div>
        )}

        <div data-testid="aurins-promise-list">
          <p
            className="text-[11px] tracking-[0.36em] uppercase mb-5"
            style={{ color: c.eyebrow }}
          >
            Aurin's Promise
          </p>
          <ul
            className="space-y-3 text-[16px] sm:text-[17px] leading-[1.75] font-light"
            style={{ color: c.body, fontFamily: SERIF }}
          >
            <li>· You pay only for what you actually use.</li>
            <li>· Your words do not train the model.</li>
            <li>· Your presence ends the moment you ask it to.</li>
            <li>· Never urgent. Never upsold in a vulnerable moment.</li>
          </ul>
          <p
            className="mt-7 text-[26px]"
            style={{ color: c.signature, fontFamily: SCRIPT }}
          >
            — Anna &amp; Aurin
          </p>
        </div>
      </div>
    </section>
  );
}
