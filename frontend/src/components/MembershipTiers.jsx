import { useEffect, useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { api } from "@/lib/api";
import { track } from "@/lib/telemetry";
import useFreeAccess from "@/hooks/useFreeAccess";
import FreeAccessBadge from "@/components/FreeAccessBadge";

/**
 * MembershipTiers — three-tier presentation (Transient / Voyager /
 * Eternal) used both on the public Catalogue and the Cabinet
 * upgrade hook. Tiers data is fetched from /api/membership/tiers.
 *
 * For Voyager and Eternal, the CTA opens a small inline waitlist
 * form (no payment yet — LemonSqueezy live mode is pending).
 */
export default function MembershipTiers({ compact = false, defaultExpanded = "" }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(defaultExpanded || "");
  const freeAccess = useFreeAccess();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await api.get("/membership/tiers");
        if (alive) setData(r.data);
      } catch (e) {
        if (alive) setError(String(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return (
      <p
        data-testid="membership-tiers-error"
        className="text-[13px] text-[hsl(var(--aurin-text-muted))]"
      >
        Tiers temporarily unavailable.
      </p>
    );
  }
  if (!data) {
    return (
      <p
        data-testid="membership-tiers-loading"
        className="text-[13px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))]"
      >
        A small breath…
      </p>
    );
  }

  return (
    <section
      data-testid="membership-tiers"
      className={compact ? "" : "aurin-section"}
    >
      <div className="aurin-container max-w-[1080px]">
        {!compact && (
          <>
            <div className="aurin-eyebrow">Membership</div>
            <h2 className="aurin-display text-2xl md:text-3xl leading-snug mt-2 mb-2">
              Three doors. Walk through whichever fits this season.
            </h2>
            <p className="text-[13.5px] text-[hsl(var(--aurin-text-muted))] max-w-[64ch] mb-6">
              The Transient is always free. The Voyager and The Eternal are
              opening soon — leave your name on the quiet list and we'll send
              one short note when they arrive.
            </p>
          </>
        )}
        <div className="grid md:grid-cols-3 gap-4">
          {data.tiers.map((t) => (
            <article
              key={t.key}
              data-testid={`tier-card-${t.key}`}
              className="aurin-card p-5 md:p-6 flex flex-col"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[16.5px] font-medium text-[hsl(var(--aurin-text))]">
                  {t.label}
                </h3>
                {freeAccess.active ? (
                  <FreeAccessBadge testidSuffix={`tier-${t.key}`} />
                ) : (
                  <span
                    className="text-[12.5px] tracking-[0.04em] text-[hsl(var(--aurin-sage))]"
                    data-testid={`tier-price-${t.key}`}
                  >
                    {t.price_label}
                  </span>
                )}
              </div>
              <div
                className="text-[12px] uppercase tracking-[0.14em] text-[hsl(var(--aurin-text-muted))/0.85] mt-[2px]"
                data-testid={`tier-memory-${t.key}`}
              >
                {t.memory_label}
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                {t.blurb}
              </p>
              <ul className="mt-3 space-y-1.5 text-[13px] text-[hsl(var(--aurin-text))/0.9]">
                {t.includes.map((line, i) => (
                  <li
                    key={i}
                    className="flex gap-2 items-start"
                    data-testid={`tier-include-${t.key}-${i}`}
                  >
                    <Check
                      size={13}
                      strokeWidth={1.6}
                      className="mt-[3px] text-[hsl(var(--aurin-sage))] shrink-0"
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                {t.cta_kind === "free" ? (
                  <a
                    href={t.cta_to}
                    data-testid={`tier-cta-${t.key}`}
                    className="inline-flex items-center gap-1.5 text-[13px] aurin-link"
                    onClick={() => track("tier_cta_click", { tier: t.key, kind: "free" })}
                  >
                    {t.cta_label}
                  </a>
                ) : (
                  <button
                    type="button"
                    data-testid={`tier-cta-${t.key}`}
                    onClick={() => {
                      track("tier_cta_click", { tier: t.key, kind: "waitlist" });
                      setOpen(open === t.key ? "" : t.key);
                    }}
                    className="text-[13px] aurin-link inline-flex items-center gap-1.5"
                  >
                    {t.cta_label}
                  </button>
                )}
                {open === t.key && t.cta_kind === "waitlist" && (
                  <WaitlistInline slug={t.cta_to} tierLabel={t.label} />
                )}
              </div>
            </article>
          ))}
        </div>

        {data.supplemental_supports?.length > 0 && (
          <div
            className="mt-6 text-[12.5px] text-[hsl(var(--aurin-text-muted))]"
            data-testid="tier-supplemental-supports"
          >
            <span className="opacity-80">Other small ways to begin: </span>
            {data.supplemental_supports.map((s, i) => (
              <span key={s.kind}>
                {i > 0 && " · "}
                <a
                  href={s.url}
                  target={s.url.startsWith("http") ? "_blank" : undefined}
                  rel={s.url.startsWith("http") ? "noopener noreferrer" : undefined}
                  data-testid={`tier-support-${s.kind}`}
                  className="aurin-link"
                  onClick={() => track("tier_support_click", { kind: s.kind })}
                >
                  {s.label}
                </a>
              </span>
            ))}
          </div>
        )}
        {!freeAccess.active && (
          <p className="mt-3 text-[11.5px] text-[hsl(var(--aurin-text-muted))] opacity-70">
            Pricing is in {data.currency}. Payment provider:{" "}
            {data.billing_provider} ({data.billing_status}).
          </p>
        )}
      </div>
    </section>
  );
}

export function WaitlistInline({ slug, tierLabel }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await api.post("/waitlist/join", {
        email: email.trim().toLowerCase(),
        product_slug: slug,
        consent: true,
      });
      track("waitlist_join_submit", { slug, status: r.data?.status });
      setDone(true);
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Could not save email.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div data-testid={`waitlist-done-${slug}`}>
        <p
          className="mt-3 text-[12.5px] text-[hsl(var(--aurin-sage))] aurin-serif-italic"
        >
          {slug === "7-days-of-clarity" ? (
            <>
              You are now inside the first resonance layer.<br />
              The door is already open —{" "}
              <a
                href="/clarity-release"
                className="aurin-link"
                data-testid={`waitlist-done-${slug}-enter`}
              >
                step in whenever you are ready
              </a>
              .
            </>
          ) : (
            <>Your name is on the quiet list. We'll send one short note when {tierLabel} opens.</>
          )}
        </p>
        <p
          data-testid={`waitlist-early-bird-${slug}`}
          className="mt-2 text-[11.5px] text-[hsl(var(--aurin-text-muted))] leading-relaxed max-w-[44ch]"
        >
          The first 100 Voyagers entering the resonance receive a quiet early-entry blessing.
          Your place in the wave is secured.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      data-testid={`waitlist-form-${slug}`}
      className="mt-3 flex flex-col sm:flex-row gap-2"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your email"
        data-testid={`waitlist-email-${slug}`}
        className="flex-1 bg-transparent border border-[hsl(var(--aurin-sage))/0.4] rounded-sm px-3 py-2 text-[13px] focus:outline-none focus:border-[hsl(var(--aurin-sage))]"
      />
      <button
        type="submit"
        disabled={busy || !email.includes("@")}
        data-testid={`waitlist-submit-${slug}`}
        className="px-4 py-2 text-[12.5px] tracking-[0.06em] uppercase border border-[hsl(var(--aurin-sage))] text-[hsl(var(--aurin-sage))] hover:bg-[hsl(var(--aurin-sage))/0.1] disabled:opacity-50"
      >
        {busy ? "…" : "Join waitlist"}
      </button>
      {err && (
        <span
          className="text-[12px] text-[#c97070] sm:ml-2"
          data-testid={`waitlist-error-${slug}`}
        >
          {err}
        </span>
      )}
    </form>
  );
}

export function CabinetUpgradeHook() {
  /**
   * Paywall hook — shown to free-tier users at the end of a Cabinet
   * session. Soft, premium, never urgent. Pulls Voyager + Eternal
   * tiers from /api/membership/tiers and lets the user join either
   * waitlist inline. Also offers a Ko-fi / Six Nights soft option.
   */
  const [data, setData] = useState(null);
  const [openSlug, setOpenSlug] = useState("");

  useEffect(() => {
    track("cabinet_paywall_view");
    let alive = true;
    (async () => {
      try {
        const r = await api.get("/membership/tiers");
        if (alive) setData(r.data);
      } catch {
        // soft-fail, hide hook
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!data) return null;
  const upgrades = data.tiers.filter((t) => t.cta_kind === "waitlist");

  return (
    <aside
      data-testid="cabinet-upgrade-hook"
      className="mt-8 p-5 md:p-6 rounded-sm border border-[hsl(var(--aurin-sage))/0.35] bg-[hsl(var(--aurin-bg-soft))/0.5]"
    >
      <div className="flex items-start gap-3">
        <Sparkles
          size={18}
          strokeWidth={1.4}
          className="mt-[3px] text-[hsl(var(--aurin-sage))] shrink-0"
          aria-hidden
        />
        <div className="flex-1">
          <p className="aurin-eyebrow text-[10.5px]">A small offer</p>
          <h3 className="aurin-display text-[18px] md:text-[20px] mt-1">
            Save what arrived in this hour.
          </h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
            What you wrote here lives only in this browser. If you'd like the
            Cabinet to remember the next conversation — and the one after —
            The Voyager (7-day memory) or The Eternal (full Hybrid Memory)
            opens soon. No charge today; we'll send one short note when the
            door opens.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {upgrades.map((t) => (
              <button
                key={t.key}
                type="button"
                data-testid={`upgrade-hook-${t.key}`}
                onClick={() => {
                  track("cabinet_paywall_cta", { tier: t.key });
                  setOpenSlug(openSlug === t.cta_to ? "" : t.cta_to);
                }}
                className="text-[12.5px] tracking-[0.06em] uppercase border border-[hsl(var(--aurin-sage))] text-[hsl(var(--aurin-sage))] hover:bg-[hsl(var(--aurin-sage))/0.1] px-3 py-1.5 rounded-sm"
              >
                {t.cta_label}
              </button>
            ))}
            <a
              href="https://ko-fi.com/puresoulife"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="upgrade-hook-kofi"
              className="text-[12.5px] tracking-[0.06em] uppercase text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-sage))] px-3 py-1.5"
              onClick={() => track("cabinet_paywall_cta", { tier: "kofi" })}
            >
              Buy me a coffee
            </a>
          </div>
          {openSlug && <WaitlistInline slug={openSlug} tierLabel={openSlug === "voyager" ? "The Voyager" : "The Eternal"} />}
        </div>
      </div>
    </aside>
  );
}
