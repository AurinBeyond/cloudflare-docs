/**
 * WalletStrip.jsx — discreet dashboard strip showing remaining
 * adult-voice and child-voice minutes for the signed-in user.
 *
 * Hidden entirely when both wallets are empty (no need to remind
 * a free-tier visitor what they don't have).
 *
 * Pulls from /api/billing/wallets. Both wallets are firewalled at
 * the backend (see services/credit_ledger.py).
 */
import React, { useEffect, useState } from "react";

export default function WalletStrip() {
  const [adult, setAdult] = useState(null);
  const [kids, setKids] = useState(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const apiBase = process.env.REACT_APP_BACKEND_URL;
    fetch(`${apiBase}/api/billing/wallets`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setAdult(d.adult?.minutes_remaining ?? 0);
        setKids(d.kids?.minutes_remaining ?? 0);
        if ((d.adult?.minutes_remaining || 0) + (d.kids?.minutes_remaining || 0) > 0) {
          setHidden(false);
        }
      })
      .catch(() => {});
  }, []);

  if (hidden) return null;

  return (
    <div
      data-testid="wallet-strip"
      className="flex items-center justify-end gap-5 text-[11.5px] uppercase tracking-[0.22em] px-4 py-2"
      style={{ color: "hsla(36, 18%, 72%, 0.82)" }}
    >
      {adult > 0 && (
        <span data-testid="wallet-strip-adult">
          Compass · {adult} min
        </span>
      )}
      {kids > 0 && (
        <span data-testid="wallet-strip-kids">
          Aurin · {kids} min
        </span>
      )}
    </div>
  );
}
