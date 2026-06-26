/**
 * ParentsRoom.jsx — `/parents-room` page (Stage 3.2).
 *
 * Mirror of Body Room's Multi-Lens architecture, but the "regions"
 * are everyday parenting situations (bedtime, mealtime, big emotions,
 * screen time, siblings, separation, school stress, connection).
 *
 * The page renders:
 *   1. A calm header / mission statement
 *   2. The lens selector (4 cards · Intuitive default · Shitsuke ·
 *      Montessori · Positive Coding) — opt-in, persists in
 *      localStorage as `aurin_parents_lens_v1`.
 *   3. A grid of 8 situation chips. Tapping one opens a modal with
 *      the active lens's view of that situation.
 *
 * IMPORTANT: this page does NOT yet wire to a parents-room chat
 * endpoint — that is queued for a follow-up iteration once the
 * founder validates the static content + lens UX. The scaffolding
 * stands ready: the same lens id can be passed to a future chat
 * endpoint exactly like Body Room's `/api/body-room/chat`.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, Compass, Wind, Sprout, Heart,
  Moon, UtensilsCrossed, Flame, Smartphone, Users,
  PlaneTakeoff, GraduationCap, HandHeart, Check, X, ArrowRight,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import KidsJourneyPath from "@/components/KidsJourneyPath";
import { api } from "@/lib/api";
import useFreeAccess from "@/hooks/useFreeAccess";
import FreeAccessBadge from "@/components/FreeAccessBadge";
import { useAuth } from "@/contexts/AuthProvider";
// §GHOST-FIX 2026-05-23 — Old <ParentsRoomChat> import removed.
// Sara now runs solely through ConvaiPresenceTracker (ConvAI WebSocket).
// The file ParentsRoomChat.jsx is preserved in the repo for rollback.
import RoomConvaiChat from "@/components/RoomConvaiChat"; // eslint-disable-line no-unused-vars
import AurinsPromise from "@/components/house/AurinsPromise";
// §AUDIT-SCALE 2026-05-20 — Parents' Room joins Clarity in tracking
// presence_seconds so Sara's voice sessions decrement credits.
import ConvaiPresenceTracker from "@/components/ConvaiPresenceTracker";
import CuratorIntroCard, { CURATOR_PALETTES } from "@/components/CuratorIntroCard";
import SaraCrisisSearch from "@/components/SaraCrisisSearch";
// §SPRINT-4 — 3-minute first step that sits under the hero.
import FirstActionBlock from "@/components/FirstActionBlock";
import RoomIntroCard from "@/components/RoomIntroCard";

const STORE_KEY = "aurin_parents_lens_v1";
const DEFAULT_LENS = "intuitive";

const LENS_ICONS = {
  intuitive: Compass,
  shitsuke: Wind,
  montessori: Sprout,
  positive_coding: Heart,
};

const LENS_ACCENT = {
  intuitive: "from-amber-300/15 to-sage-100/0",
  shitsuke: "from-rose-300/15 to-rose-100/0",
  montessori: "from-emerald-300/15 to-emerald-100/0",
  positive_coding: "from-sky-300/15 to-sky-100/0",
};

const SITUATION_META = {
  bedtime:       { label: "Bedtime",        sub: "the slow descent",          Icon: Moon },
  mealtime:      { label: "Mealtime",       sub: "the table as company",      Icon: UtensilsCrossed },
  big_emotions:  { label: "Big emotions",   sub: "the storm and the room",    Icon: Flame },
  screen_time:   { label: "Screen time",    sub: "the bridge, not the cliff", Icon: Smartphone },
  sibling:       { label: "Siblings",       sub: "the neutral object between", Icon: Users },
  separation:    { label: "Separation",     sub: "the small ambassador",      Icon: PlaneTakeoff },
  school_stress: { label: "Learning stress",  sub: "noticing, not evaluating",  Icon: GraduationCap },
  connection:    { label: "Connection",     sub: "the seams of the day",      Icon: HandHeart },
};

const SITUATION_ORDER = [
  "bedtime", "mealtime", "big_emotions", "screen_time",
  "sibling", "separation", "school_stress", "connection",
];


export default function ParentsRoom() {
  const { user } = useAuth();
  const [lenses, setLenses] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [activeLens, setActiveLens] = useState(() => {
    try {
      return typeof window !== "undefined"
        ? window.localStorage.getItem(STORE_KEY) || DEFAULT_LENS
        : DEFAULT_LENS;
    } catch {
      return DEFAULT_LENS;
    }
  });
  const [openSituation, setOpenSituation] = useState(null);
  const freeAccess = useFreeAccess();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await api.get("/parents-room/lenses");
        if (alive) setLenses(r?.data?.lenses || []);
      } catch {
        /* hide gracefully */
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  const pick = (id) => {
    try {
      if (id && id !== DEFAULT_LENS) {
        window.localStorage.setItem(STORE_KEY, id);
      } else {
        window.localStorage.removeItem(STORE_KEY);
      }
    } catch { /* noop */ }
    setActiveLens(id || DEFAULT_LENS);
  };

  if (!loaded) {
    return (
      <div className="aurin-section">
        <div className="aurin-container max-w-[860px] aurin-card p-7 md:p-9">
          <p className="text-[13.5px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic">
            preparing the room…
          </p>
        </div>
      </div>
    );
  }

  // Order so Intuitive sits leftmost
  const ordered = [...lenses].sort((a, b) => {
    if (a.id === DEFAULT_LENS) return -1;
    if (b.id === DEFAULT_LENS) return 1;
    return 0;
  });

  const activeLensObj = lenses.find((l) => l.id === activeLens) || lenses.find((l) => l.id === DEFAULT_LENS);

  return (
    <div data-testid="page-parents-room" className="house-room relative">
      <PageHeader
        eyebrow="Parents' Room · The Quiet Weaver"
        title="Three lenses, one calm room for parents."
        subtitle="Not a course. Not advice. A handful of tiny sentences and small rituals — drawn from Japanese rhythm, Maria Montessori, and positive-language work — that you can carry into tonight."
      />

      {/* §ROOM-INTRO 2026-02 — five-line "selguse kaart" for Sara. */}
      <RoomIntroCard roomId="sara" />

      {/* §SPRINT-4 2026-02 — Sara's 3-minute first step. Sits directly
          under the hero. One shared component, content in
          /src/data/firstActions.js. */}
      <div id="first-action">
        <FirstActionBlock id="sara" />
      </div>

      {/* §CURATOR-INTRO 2026-05-28 — Sara's pre-recorded 15s hello. */}
      <section className="aurin-section-sm" data-testid="parents-room-sara-intro">
        <div className="aurin-container max-w-[760px]">
          <CuratorIntroCard slug="sara" eyebrow="✦ Meet your curator" {...CURATOR_PALETTES.sara} />
        </div>
      </section>

      {/* §SARA-CRISIS-SEARCH 2026-05-28 — Static (LLM-free) keyword
          search across the 3 lenses × 8 situations registry. Founder
          directive: when a parent is in acute crisis they should not
          need a voice call. They type two words; Sara surfaces the
          situation viewed through every wisdom lens in parallel. */}
      <section className="aurin-section-sm" data-testid="parents-room-crisis-search">
        <div className="aurin-container max-w-[820px]">
          <SaraCrisisSearch />
        </div>
      </section>

      {/* §Phase B (2026-02-15) — Sara ConvAI is mounted at the top of
          Parents' Room. Sara is the dedicated parental-support voice
          agent configured by founder in the ElevenLabs UI; she is
          strictly isolated from Grace / Kaelan / Alistair. */}
      <section className="aurin-section-sm" data-testid="parents-room-sara">
        <div className="aurin-container max-w-[760px]">
          {/* §AUDIT-SCALE 2026-05-20 — Tracker wraps RoomConvaiChat
              internally so we do not double-mount the SDK. */}
          <ConvaiPresenceTracker room="parents" />
        </div>
      </section>

      {/* §PARENTS-PATH 2026-02-10 — Anna's own idea: parents need their
          own 28-day quiet path too. "One step closer to understanding
          yourself and your child." Same stein-på-stein language as
          Kids and Body Temple, with river-worn pebbles in a warm tan
          palette to signal "adult, weighed, gentle". Each stone opens
          a soft popup with Aurin's tiny invitation; the popup CTA
          routes to the existing Parents Room ritual area. */}
      <section className="aurin-section-sm" data-testid="parents-room-path">
        <div className="aurin-container max-w-[820px]">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[hsl(var(--aurin-sage))] mb-3 text-center">
            A 28-day quiet path
          </p>
          <KidsJourneyPath
            ageSlug="parents-room"
            childSlug="parents-room"
            onStoneClick={(day) => {
              // Scroll the wanderer down to the ritual / lens area —
              // that is the "today's invitation" surface for parents.
              const target = document.querySelector('[data-testid="parents-calm-code"]')
                          || document.querySelector('[data-testid="parents-situations"]');
              if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            showFooter={false}
          />
        </div>
      </section>

      {/* §SUBSYSTEM 2026-02-11 — Inline link to the Subsystem wing
          (adolescent neuro-architecture). Visible only as a small
          high-status sub-entry; the compass remains 4-cardinal. */}
      <section className="aurin-section-sm" data-testid="parents-room-subsystem-link">
        <div className="aurin-container max-w-[760px]">
          <Link
            to="/parents-room/subsystem"
            data-testid="parents-room-subsystem-cta"
            className="block aurin-card p-6 md:p-7 hover:border-[hsl(var(--aurin-sage))/0.55] transition-colors"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[10.5px] tracking-[0.36em] uppercase text-[hsl(var(--aurin-sage))] mb-2">
                  [ Sub-cluster ]
                </p>
                <h3 className="aurin-serif text-[22px] sm:text-[24px] font-light text-[hsl(var(--aurin-text))]">
                  The Subsystem
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.8] text-[hsl(var(--aurin-text-muted))] max-w-[520px]">
                  For the parent of an adolescent between roughly age eleven
                  and seventeen — the most aggressive neurological renovation
                  a human ever undertakes. Seven diagnostics in our register.
                  No therapy. No pedagogy. Adult-only.
                </p>
              </div>
              <span className="text-[12px] tracking-[0.32em] uppercase text-[hsl(var(--aurin-sage))] whitespace-nowrap">
                Enter →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* §Stage 3.2 — Featured ritual: The Calm Parent's Code.
          A seven-day soft anchor that introduces the room without
          asking for anything. No CTA pressure, no signup gate. */}
      <section className="aurin-section-sm" data-testid="parents-calm-code">
        <div className="aurin-container max-w-[860px]">
          <div
            className="aurin-card relative overflow-hidden p-7 md:p-9 border-[hsl(var(--aurin-sage))/0.3]"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--aurin-bg-soft)/0.7) 0%, hsl(var(--aurin-bg)/0.4) 100%)",
            }}
          >
            <div className="aurin-eyebrow !mb-2 inline-flex items-center gap-1.5">
              <Sparkles size={11} strokeWidth={1.4} className="text-[hsl(var(--aurin-sage))]" />
              Featured · the door-stone ritual
            </div>
            <h2
              className="aurin-display text-2xl md:text-[28px] leading-snug max-w-[24ch]"
              data-testid="parents-calm-code-title"
            >
              The Calm Parent's Code{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                · seven evenings.
              </span>
            </h2>
            <p className="text-[13.5px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9] mt-3 max-w-[60ch]">
              One quiet practice for tonight — and for the six nights
              after. The same three small acts, in the same order,
              done with whatever softness you have left in the day.
              That is the whole code.
            </p>

            <ol className="mt-5 space-y-3.5 max-w-[62ch]">
              <li
                data-testid="parents-calm-code-step-1"
                className="flex items-start gap-3 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.94]"
              >
                <span className="mt-[2px] inline-flex w-6 h-6 items-center justify-center rounded-full bg-[hsl(var(--aurin-sage))/0.18] text-[11px] text-[hsl(var(--aurin-sage))] shrink-0">
                  1
                </span>
                <span>
                  <strong className="font-medium">A small ritual.</strong>{" "}
                  Choose ONE tiny act each evening — a warm cloth on the
                  face, a candle blown out together, three slow breaths
                  at the door. The act matters less than the repetition.
                </span>
              </li>
              <li
                data-testid="parents-calm-code-step-2"
                className="flex items-start gap-3 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.94]"
              >
                <span className="mt-[2px] inline-flex w-6 h-6 items-center justify-center rounded-full bg-[hsl(var(--aurin-sage))/0.18] text-[11px] text-[hsl(var(--aurin-sage))] shrink-0">
                  2
                </span>
                <span>
                  <strong className="font-medium">One sentence to swap.</strong>{" "}
                  Pick ONE heavy sentence you noticed yourself saying
                  this week ("stop crying", "you have to finish your
                  plate"). Choose a lighter version below in the
                  Positive Coding lens. Say only the new one for seven
                  days.
                </span>
              </li>
              <li
                data-testid="parents-calm-code-step-3"
                className="flex items-start gap-3 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.94]"
              >
                <span className="mt-[2px] inline-flex w-6 h-6 items-center justify-center rounded-full bg-[hsl(var(--aurin-sage))/0.18] text-[11px] text-[hsl(var(--aurin-sage))] shrink-0">
                  3
                </span>
                <span>
                  <strong className="font-medium">Ten seconds of full face.</strong>{" "}
                  Once a day, give the child your whole face for ten
                  seconds — no phone, no question, no fixing. Just the
                  face. Notice what changes over the seven evenings.
                </span>
              </li>
            </ol>

            <p
              className="mt-5 text-[12.5px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))] max-w-[58ch] pt-4 border-t border-[hsl(var(--aurin-border-soft))]"
              data-testid="parents-calm-code-permission"
            >
              No tracker. No streak. No screen pressure. The code lives
              in your home, not in this page.
            </p>
          </div>
        </div>
      </section>

      {freeAccess.active && (
        <section className="aurin-section-sm">
          <div className="aurin-container max-w-[860px]">
            <FreeAccessBadge variant="block" testidSuffix="parents-room" />
          </div>
        </section>
      )}

      {/* §SPRINT-3 2026-05-31 — Hearth Protocol announcement.
          For the parent ALONE (NOT parent+child). Quiet, no urgency. */}
      <section className="aurin-section-sm" data-testid="parents-hearth-announcement">
        <div className="aurin-container max-w-[860px]">
          <div
            className="aurin-card p-7 md:p-9"
            style={{
              background: "rgba(214, 165, 96, 0.06)",
              borderColor: "rgba(214, 165, 96, 0.25)",
            }}
          >
            <div className="aurin-eyebrow !mb-2" style={{ color: "#d6a560" }}>
              In the slow making · for the parent alone
            </div>
            <h2 className="aurin-display text-2xl md:text-3xl leading-snug mt-1 mb-3">
              The Hearth —{" "}
              <span className="aurin-serif-italic" style={{ color: "#d6a560" }}>
                a quiet evening return to yourself.
              </span>
            </h2>
            <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text))/0.9] max-w-[64ch] mb-4">
              20 minutes after the house has gone quiet. One short PDF,
              one worksheet, two audios. Not therapy. Not advice. A return.
            </p>
            <Link
              to="/the-hearth"
              data-testid="parents-hearth-link"
              className="inline-flex items-center gap-2 text-sm tracking-wider uppercase"
              style={{
                color: "#d6a560",
                textDecoration: "underline",
                textUnderlineOffset: "4px",
                fontWeight: 500,
              }}
            >
              Read what it is
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Lens selector */}
      <section className="aurin-section-sm" data-testid="parents-lens-selector">
        <div className="aurin-container max-w-[1020px]">
          <div className="aurin-card p-7 md:p-9 space-y-5">
            <div>
              <div className="aurin-eyebrow !mb-1 inline-flex items-center gap-1.5">
                <Sparkles size={11} strokeWidth={1.4} className="text-[hsl(var(--aurin-sage))]" />
                Choose a lens · entirely optional
              </div>
              <h2 className="aurin-display text-2xl md:text-3xl leading-snug max-w-[28ch]">
                Four quiet perspectives,{" "}
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                  one of them invisible.
                </span>
              </h2>
              <p className="text-[13.5px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9] mt-3 max-w-[60ch]">
                Intuitive Flow is the default — the room reads what you
                describe and adapts silently. If you would rather choose
                one tonight, the other three are here.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="parents-lens-cards">
              {ordered.map((lens) => {
                const Icon = LENS_ICONS[lens.id] || Compass;
                const active = activeLens === lens.id;
                const isDefault = lens.id === DEFAULT_LENS;
                return (
                  <button
                    type="button"
                    key={lens.id}
                    onClick={() => pick(lens.id)}
                    data-testid={`parents-lens-card-${lens.id}`}
                    data-active={active ? "true" : "false"}
                    data-default={isDefault ? "true" : "false"}
                    aria-pressed={active}
                    className={`group text-left relative p-5 rounded-xl border bg-gradient-to-b ${LENS_ACCENT[lens.id] || ""} bg-[hsl(var(--aurin-bg))]/40 space-y-3 transition-all duration-300 overflow-hidden ${
                      active
                        ? "border-[hsl(var(--aurin-sage))]/70 ring-1 ring-[hsl(var(--aurin-sage))]/40 lens-breathing"
                        : "border-[hsl(var(--aurin-border-soft))] hover:border-[hsl(var(--aurin-sage))]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon size={15} strokeWidth={1.5} className="text-[hsl(var(--aurin-sage))]" />
                        <div>
                          <h3 className="aurin-display text-[17px] leading-snug">{lens.name}</h3>
                          <p className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]">
                            {lens.subtitle}
                          </p>
                        </div>
                      </div>
                      {active ? (
                        <span
                          className="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-sage))] shrink-0"
                          data-testid={`parents-lens-active-badge-${lens.id}`}
                        >
                          <Check size={11} strokeWidth={1.8} />
                          active
                        </span>
                      ) : isDefault ? (
                        <span className="text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]/70 aurin-serif-italic shrink-0">
                          default
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[13px] leading-relaxed text-[hsl(var(--aurin-text))/0.92]">
                      {lens.scope}
                    </p>
                    <p className="text-[11.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] aurin-serif-italic pt-2 border-t border-[hsl(var(--aurin-border-soft))]">
                      {lens.attribution}
                    </p>
                  </button>
                );
              })}
            </div>

            {activeLens && activeLens !== DEFAULT_LENS && (
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[hsl(var(--aurin-border-soft))]">
                <p className="text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] aurin-serif-italic">
                  The room will speak through this lens tonight.
                </p>
                <button
                  type="button"
                  onClick={() => pick(DEFAULT_LENS)}
                  data-testid="parents-lens-clear"
                  className="aurin-btn aurin-btn-ghost !py-1.5 !px-3 !text-[12px] shrink-0"
                >
                  Return to Intuitive
                </button>
              </div>
            )}

            <p
              className="text-[11.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]/85 aurin-serif-italic pt-2 border-t border-[hsl(var(--aurin-border-soft))]"
              data-testid="parents-lens-disclaimer"
            >
              None of these lenses are professional advice. They are old
              and modern parenting traditions — used here only as soft
              companions. If a child seems unwell, please listen to that
              voice first and consult a doctor.
            </p>
          </div>
        </div>
      </section>

      {/* Situation grid */}
      <section className="aurin-section" data-testid="parents-situations">
        <div className="aurin-container max-w-[1020px]">
          <div className="aurin-eyebrow">Eight everyday rooms</div>
          <h2 className="aurin-display text-2xl md:text-3xl leading-snug mt-2 mb-4">
            Choose what tonight is{" "}
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
              quietly asking for.
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SITUATION_ORDER.map((sid) => {
              const meta = SITUATION_META[sid];
              const Icon = meta.Icon;
              return (
                <button
                  type="button"
                  key={sid}
                  onClick={() => setOpenSituation(sid)}
                  data-testid={`parents-situation-${sid}`}
                  className="aurin-card !p-5 text-left flex flex-col gap-2 hover:border-[hsl(var(--aurin-sage))/0.6] transition-colors"
                >
                  <Icon size={16} strokeWidth={1.4} className="text-[hsl(var(--aurin-sage))]" />
                  <h3 className="aurin-display text-[17px] leading-snug">{meta.label}</h3>
                  <p className="text-[12px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))]">
                    {meta.sub}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-[hsl(var(--aurin-sage))]">
                    Open <ArrowRight size={11} />
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-8 text-[12.5px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic max-w-[64ch]">
            Below, a small live companion. Type — or speak — about
            tonight, and the room will answer in a sentence or two,
            shaped by the lens you have chosen above.
          </p>

          <div className="mt-6 flex gap-3 flex-wrap">
            <Link to="/body-world" className="aurin-btn aurin-btn-ghost !py-2 !px-4 text-[12.5px]">
              Enter Body World
            </Link>
            <Link to="/clarity-release" className="aurin-btn aurin-btn-ghost !py-2 !px-4 text-[12.5px]">
              Visit Clarity Release
            </Link>
          </div>
        </div>
      </section>

      {/* §GHOST-FIX 2026-05-23 — Old <ParentsRoomChat> mount removed.
          Reason: it ran a parallel `useVoiceIO` loop with autoVoice:true
          + an auto-speak useEffect, producing the "second/third female
          voice" the founder heard. Sara (ConvaiPresenceTracker, see
          above, line ~153) is now the sole voice for this room. The
          ParentsRoomChat.jsx file stays in the repo as a rollback option
          but is no longer rendered anywhere. */}

      {/* Situation modal */}
      {openSituation && activeLensObj && (
        <SituationModal
          situation={openSituation}
          lens={activeLensObj}
          onClose={() => setOpenSituation(null)}
        />
      )}

      <style>{`
        @keyframes lens-halo {
          0%, 100% { box-shadow: 0 0 0 0 hsl(var(--aurin-sage) / 0.0); }
          50%      { box-shadow: 0 0 22px 4px hsl(var(--aurin-sage) / 0.18); }
        }
        .lens-breathing { animation: lens-halo 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}


function SituationModal({ situation, lens, onClose }) {
  const meta = SITUATION_META[situation];
  const Icon = meta?.Icon || Sparkles;
  const isIntuitive = lens.id === DEFAULT_LENS;
  const entry = lens.situations?.[situation];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 md:p-6 bg-black/55 backdrop-blur-sm"
      onClick={onClose}
      data-testid={`parents-situation-modal-${situation}`}
    >
      <div
        className="aurin-card relative max-w-[640px] w-full p-7 md:p-9 space-y-5 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          data-testid="parents-situation-modal-close"
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-[hsl(var(--aurin-border-soft))] transition-colors"
          aria-label="Close"
        >
          <X size={14} strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-3">
          <Icon size={18} strokeWidth={1.4} className="text-[hsl(var(--aurin-sage))]" />
          <div>
            <div className="aurin-eyebrow !mb-1">{meta?.sub}</div>
            <h2 className="aurin-display text-2xl leading-snug">{meta?.label}</h2>
          </div>
        </div>

        <div className="pt-2 border-t border-[hsl(var(--aurin-border-soft))]">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))] mb-2">
            Through the {lens.name}
          </div>

          {isIntuitive ? (
            <p
              data-testid={`parents-modal-intuitive-${situation}`}
              className="text-[13.5px] leading-relaxed aurin-serif-italic text-[hsl(var(--aurin-text))/0.92]"
            >
              The room will read your words and choose the quietest
              fitting offering — sometimes a small ritual, sometimes a
              single sentence to swap in. Nothing is named aloud.
            </p>
          ) : entry ? (
            <div className="space-y-3">
              <p
                data-testid={`parents-modal-insight-${situation}`}
                className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.92]"
              >
                {entry.insight}
              </p>
              <p
                data-testid={`parents-modal-practice-${situation}`}
                className="text-[13px] leading-relaxed text-[hsl(var(--aurin-text))/0.9]"
              >
                <span className="text-[hsl(var(--aurin-text-muted))]">A small practice:</span>{" "}
                {entry.practice}
              </p>
              <p
                data-testid={`parents-modal-permission-${situation}`}
                className="text-[13px] leading-relaxed aurin-serif-italic text-[hsl(var(--aurin-text))/0.95]"
              >
                {entry.permission}
              </p>
            </div>
          ) : (
            <p className="text-[13px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))]">
              No entry for this situation yet.
            </p>
          )}
        </div>
      </div>
      {/* §BRAND-CLARITY 2026-02-11 — Trust anchor for parents. */}
      <AurinsPromise tone="cream" showEarlyAccess={true} />
    </div>
  );
}
