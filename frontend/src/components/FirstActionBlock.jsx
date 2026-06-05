/**
 * FirstActionBlock.jsx — Sprint 4
 *
 * §SPRINT-4 2026-02 — A single quiet block placed just under the hero
 * of three rooms (Grace, Kaelan, Sara). Same anatomy across all three;
 * the content comes from /src/data/firstActions.js so the rooms cannot
 * drift apart.
 *
 * Locked decisions from the founder (2026-02 chat):
 *  1. Block lives under each room's PageHeader, not at the very top.
 *  2. "Read on" CTA does a smooth scroll to the room's next content
 *     section on the same page.
 *  3. No localStorage / collapse logic. The block is always visible.
 *  4. One shared component, three configs.
 *
 * Visual lineage: uses the existing aurin-card + aurin-eyebrow +
 * aurin-display + aurin-serif-italic + hsl(var(--aurin-*)) tokens so
 * the block feels native inside every room.
 */
import { useRef } from "react";
import { FIRST_ACTIONS } from "@/data/firstActions";

export default function FirstActionBlock({ id }) {
  const config = FIRST_ACTIONS[id];
  const endRef = useRef(null);

  if (!config) return null;

  // Smooth-scroll into the next page section. The sentinel <span> sits
  // at the very bottom of this block, so `scrollIntoView` lands the
  // viewport precisely at the top of whatever section the room renders
  // right after us. No room-side anchors required.
  const handleReadOn = (e) => {
    e.preventDefault();
    const target = endRef.current;
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id={`first-action-${config.id}-block`}
      className="aurin-section-sm"
      data-testid={`first-action-${config.id}-block`}
      aria-label={`Three-minute first step for ${config.room}`}
    >
      <div className="aurin-container max-w-[760px]">
        <div
          className="aurin-card p-7 md:p-9 space-y-6"
          data-testid={`first-action-${config.id}-card`}
        >
          {/* Eyebrow */}
          <div
            className="aurin-eyebrow !mb-1"
            data-testid={`first-action-${config.id}-eyebrow`}
          >
            — Three minutes —
          </div>

          {/* Title */}
          <h2
            className="aurin-display text-2xl md:text-3xl leading-tight max-w-[24ch] aurin-serif-italic text-[hsl(var(--aurin-sage))]"
            data-testid={`first-action-${config.id}-title`}
          >
            {config.title}
          </h2>

          {/* Intro */}
          <p
            className="text-[14.5px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9] aurin-serif-italic"
            data-testid={`first-action-${config.id}-intro`}
          >
            {config.intro}
          </p>

          {/* Hairline */}
          <div
            className="h-px w-full"
            style={{ background: "hsl(var(--aurin-border-soft))" }}
            aria-hidden="true"
          />

          {/* Steps */}
          <ol
            className="space-y-6 list-none p-0 m-0"
            data-testid={`first-action-${config.id}-steps`}
          >
            {config.steps.map((step, i) => (
              <li
                key={i}
                data-testid={`first-action-${config.id}-step-${i + 1}`}
                className="grid grid-cols-[28px_1fr] gap-x-4 gap-y-2"
              >
                <span
                  className="aurin-eyebrow !mb-0 text-right pt-1"
                  style={{ color: "hsl(var(--aurin-sage))" }}
                  aria-hidden="true"
                >
                  {i + 1}.
                </span>
                <div>
                  <p className="text-[13px] tracking-[0.18em] uppercase mb-1 text-[hsl(var(--aurin-text-muted))]">
                    {step.time}
                  </p>
                  <p className="text-[15.5px] leading-[1.55] text-[hsl(var(--aurin-text))] mb-2">
                    {step.action}
                  </p>
                  <p className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.85]">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* Hairline */}
          <div
            className="h-px w-full"
            style={{ background: "hsl(var(--aurin-border-soft))" }}
            aria-hidden="true"
          />

          {/* Closing line */}
          <p
            className="text-[14.5px] leading-[1.85] aurin-serif-italic text-[hsl(var(--aurin-text))/0.9]"
            data-testid={`first-action-${config.id}-closing`}
          >
            {config.closing}
          </p>

          {/* Soft "Read on" CTA — smooth-scroll, no navigation */}
          <div className="pt-1">
            <a
              href={`#first-action-${config.id}-end`}
              onClick={handleReadOn}
              data-testid={`first-action-${config.id}-cta`}
              className="aurin-btn aurin-btn-ghost text-[12px] tracking-[0.28em] uppercase"
            >
              {config.ctaLabel} →
            </a>
          </div>
        </div>
      </div>

      {/*
        Sentinel — placed at the bottom of this section, with a small
        scroll-margin-top so the next content section lands cleanly
        under any sticky header without being clipped.
      */}
      <span
        ref={endRef}
        id={`first-action-${config.id}-end`}
        aria-hidden="true"
        className="block h-0 w-full"
        style={{ scrollMarginTop: "16px" }}
      />
    </section>
  );
}
