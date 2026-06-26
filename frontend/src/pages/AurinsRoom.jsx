/**
 * AurinsRoom — the gateway page where a parent or child chooses the
 * age track before entering a conversation with Aurin.
 *
 * §AURIN 2026-05-20 — Built deliberately MINIMAL. Re-uses the same
 * page chrome (`PageHeader`, Aurin design tokens) as the other four
 * rooms — no new visual language, no parallel design system. The
 * founder directive is "same house, another room", not a new aesthetic.
 *
 * The page is gated by `WandererGate scope="private"` in App.js
 * exactly like /clarity-release, /body-room, /parents-room.
 */

import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import RoomIntroCard from "@/components/RoomIntroCard";
import { Sprout, BookHeart, Stars, ArrowRight, BookOpen } from "lucide-react";
import { AURIN_AGE_GROUPS } from "@/lib/aurinPrompts";
import KidsDayPassRow from "@/components/house/KidsDayPassRow";

const GROUP_ICON = {
  "little-dreamers": Sprout,
  "explorers": BookHeart,
  "dreamweavers": Stars,
};

export default function AurinsRoom() {
  return (
    <div className="min-h-screen bg-[hsl(var(--aurin-bg))] text-[hsl(var(--aurin-text))]">
      <PageHeader
        eyebrow="A room for children"
        title="Aurin's Room"
        subtitle="A gentle companion who listens, plays, and remembers that childhood deserves to feel safe. Choose the path that fits the child."
      />

      {/* §ROOM-INTRO 2026-02 — five-line "selguse kaart" for Aurin. */}
      <RoomIntroCard roomId="aurin" />

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <ol
          className="mt-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="aurin-age-groups"
        >
          {AURIN_AGE_GROUPS.map((group) => {
            const Icon = GROUP_ICON[group.slug] || Sprout;
            return (
              <li key={group.slug}>
                <Link
                  to={`/aurins-room/${group.slug}`}
                  data-testid={`aurin-age-card-${group.slug}`}
                  className="group block h-full rounded-2xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg-elev))/0.55] p-6 backdrop-blur transition hover:border-[hsl(var(--aurin-amber))/0.6] hover:bg-[hsl(var(--aurin-bg-elev))/0.75]"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--aurin-amber))/0.4] bg-[hsl(var(--aurin-bg))/0.55]">
                      <Icon className="h-5 w-5 text-[hsl(var(--aurin-amber))]" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--aurin-text))/0.55]">
                        {group.age}
                      </p>
                      <h3 className="aurin-serif text-lg text-[hsl(var(--aurin-text))]">
                        {group.label}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[hsl(var(--aurin-text))/0.7]">
                    {group.description}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-1 text-sm text-[hsl(var(--aurin-amber))/0.9] transition group-hover:gap-2">
                    Enter this path
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        <p
          className="mt-10 text-xs leading-relaxed text-[hsl(var(--aurin-text))/0.5]"
          data-testid="aurin-room-disclaimer"
        >
          Aurin is a companion, not a parent, doctor, or therapist. If a
          child shares something heavy, Aurin will gently invite them to
          talk to a trusted grown-up. Voice sessions are recorded for
          seven days and then automatically deleted.
        </p>

        {/* §AURIN STORY WORLD 2026-05-22 — Founder directive: a quiet
            shelf of static bedtime stories, organised by the same age
            taxonomy as the conversation rooms. Browseable without
            a session — gentle entry point for parents. */}
        <Link
          to="/aurins-room/stories"
          data-testid="aurin-story-world-cta"
          className="group mt-10 block rounded-2xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg-elev))/0.55] p-6 backdrop-blur transition hover:border-[hsl(var(--aurin-amber))/0.6] hover:bg-[hsl(var(--aurin-bg-elev))/0.75]"
        >
          <div className="flex items-start gap-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--aurin-amber))/0.4] bg-[hsl(var(--aurin-bg))/0.55] shrink-0">
              <BookOpen className="h-5 w-5 text-[hsl(var(--aurin-amber))]" />
            </span>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--aurin-text))/0.55]">
                A quieter shelf
              </p>
              <h3 className="aurin-serif text-lg text-[hsl(var(--aurin-text))] mt-0.5">
                Aurin's Story World
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--aurin-text))/0.7]">
                Short, gentle bedtime stories to read or listen to — no
                conversation, no pressure. Sorted by age, added slowly.
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm text-[hsl(var(--aurin-amber))/0.9] transition group-hover:gap-2">
                Open the story shelf
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* §SPRINT-C 2026-02-12 — Kids Day Pass €25 row (single public price). */}
      <KidsDayPassRow />
    </div>
  );
}
