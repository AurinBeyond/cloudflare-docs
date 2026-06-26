/**
 * SovereignAnchor.jsx — the single-paragraph reveal on the Sovereign
 * Circle intro page. Reads live Founding Cohort seat counts from
 * /api/billing/cohort-seats and chooses the right copy line.
 *
 * Strategy v2.3.1 §6 + patch §3:
 *   - If founding seats remain → "By application. Quarterly engagement
 *     from €1,890. Founding Cohort: the first ten lock in the founder
 *     rate for life."
 *   - If founding seats exhausted → "By application. Quarterly
 *     engagement from €1,890." (single line, historical fact)
 *
 * No countdown timer, no "X spots left" widget. Quiet scarcity.
 */
import React, { useEffect, useState } from "react";

const STANDARD_QUARTER_SKU = "sovereign.standard.quarter";

export default function SovereignAnchor() {
  const [seatsRemaining, setSeatsRemaining] = useState(null);

  useEffect(() => {
    const apiBase = process.env.REACT_APP_BACKEND_URL;
    fetch(`${apiBase}/api/billing/cohort-seats`)
      .then((r) => r.json())
      .then((d) => {
        const std = (d?.sovereign_cohorts || []).find(
          (s) => s.sku === STANDARD_QUARTER_SKU,
        );
        if (std) setSeatsRemaining(std.seats_remaining);
      })
      .catch(() => {});
  }, []);

  const cohortOpen = typeof seatsRemaining === "number" && seatsRemaining > 0;

  return (
    <div
      data-testid="sovereign-anchor"
      className="my-12 mx-auto max-w-xl text-center"
    >
      <p
        className="aurin-display italic text-lg"
        style={{ color: "hsla(36, 22%, 86%, 0.92)", lineHeight: 1.7 }}
        data-testid="sovereign-anchor-headline"
      >
        By application. Quarterly engagement from <span className="not-italic">€1,890</span>.
      </p>
      {cohortOpen && (
        <p
          data-testid="sovereign-anchor-cohort"
          className="mt-3 text-[12px] tracking-[0.18em] uppercase"
          style={{ color: "hsla(36, 22%, 70%, 0.78)" }}
        >
          Founding Cohort · the first ten lock in the founder rate for life
        </p>
      )}
    </div>
  );
}
