/**
 * FreeAccessBadge.jsx — universal "no payment today" badge.
 *
 * Drop-in replacement for any price tag while the global free-access
 * window is active. Wherever a paid flow used to render its price
 * (Catalogue, CourseDetail, MembershipTiers, Cabinet booking, etc.),
 * import and render <FreeAccessBadge /> instead.
 *
 * Two visual variants:
 *   - compact (default): a single sage-tinted line, fits inline.
 *   - block: a small card-style block with the date.
 *
 * Returns null when the free-access window is NOT active, so callers
 * can render their normal price next to it without conditionals:
 *
 *     {!freeAccess.active && <Price /> }
 *     {freeAccess.active && <FreeAccessBadge variant="compact" /> }
 */
import { Sparkles, Gift } from "lucide-react";
import useFreeAccess from "@/hooks/useFreeAccess";

export default function FreeAccessBadge({ variant = "compact", testidSuffix = "" }) {
  const fa = useFreeAccess();
  if (!fa.loaded || !fa.active) return null;

  const dataTestid = `free-access-badge${testidSuffix ? `-${testidSuffix}` : ""}`;

  if (variant === "block") {
    return (
      <div
        data-testid={dataTestid}
        className="aurin-card !p-4 flex items-center gap-3 border-[hsl(var(--aurin-sage))]/30"
      >
        <Gift
          size={16}
          strokeWidth={1.5}
          className="text-[hsl(var(--aurin-sage))] shrink-0"
        />
        <div className="space-y-0.5">
          <p className="text-[12.5px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-sage))]">
            Free during launch
          </p>
          {fa.formattedUntil && (
            <p className="text-[12px] text-[hsl(var(--aurin-text-muted))]">
              No payment until {fa.formattedUntil}
            </p>
          )}
        </div>
      </div>
    );
  }

  // compact
  return (
    <span
      data-testid={dataTestid}
      className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.18em] text-[hsl(var(--aurin-sage))]"
    >
      <Sparkles size={11} strokeWidth={1.5} />
      Free during launch
      {fa.formattedUntil && (
        <span className="text-[hsl(var(--aurin-text-muted))]/80 normal-case tracking-normal aurin-serif-italic">
          · until {fa.formattedUntil}
        </span>
      )}
    </span>
  );
}
