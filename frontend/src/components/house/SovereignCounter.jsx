/**
 * SovereignCounter — anonymous live telemetry strip on the landing page.
 *
 * §SOVEREIGN-COUNTER 2026-02-11 — Founder directive.
 *   Eliminates the isolation of the waitlist by showing wanderers a
 *   live, anonymous count of fellow operators currently engaged with
 *   the platform. No names. No personalisation. Pure architectural
 *   telemetry. Quietly refreshes every 60 seconds.
 */
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

export default function SovereignCounter() {
  const [data, setData] = useState(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchOnce = async () => {
      try {
        const r = await api.get("/house/sovereign-counter");
        if (!cancelled) {
          setData(r.data);
          setErrored(false);
        }
      } catch {
        if (!cancelled) setErrored(true);
      }
    };
    fetchOnce();
    const id = setInterval(fetchOnce, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Silently disappear if the endpoint fails — the manifest above
  // already carries the philosophical weight. The counter is bonus.
  if (errored || !data) return null;

  const metrics = [
    {
      key: "sovereigns",
      value: data.sovereigns_under_cadence_lock,
      label: "Sovereigns under cadence-lock",
    },
    {
      key: "transmissions",
      value: data.transmissions_this_hour,
      label: "Transmissions executed this hour",
    },
    {
      key: "waitlist",
      value: data.waitlist_total,
      label: "On the threshold",
    },
  ];

  return (
    <div
      data-testid="sovereign-counter"
      className="mt-10 sm:mt-12 mx-auto max-w-[760px] grid grid-cols-1 sm:grid-cols-3 gap-px bg-[rgba(196,164,107,0.18)] border border-[rgba(196,164,107,0.22)]"
    >
      {metrics.map((m) => (
        <div
          key={m.key}
          data-testid={`sovereign-counter-${m.key}`}
          className="bg-[#0b0a08] px-5 py-5 text-center"
        >
          <p
            className="text-[26px] sm:text-[30px] tabular-nums text-[#f0eadd] font-light leading-none"
            style={{ fontFamily: SERIF }}
          >
            {m.value}
          </p>
          <p className="mt-2.5 text-[10px] tracking-[0.32em] uppercase text-[#7a7468]">
            {m.label}
          </p>
        </div>
      ))}
    </div>
  );
}
