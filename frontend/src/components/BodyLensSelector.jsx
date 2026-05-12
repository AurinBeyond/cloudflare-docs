/**
 * BodyLensSelector.jsx — Body Room v2 opt-in wisdom lens picker.
 *
 * Three calm cards at the top of the Body Room. The wanderer may
 * choose ONE perspective for tonight's session:
 *   - eastern         · Ayurveda + classical Chinese medicine
 *   - psychosomatic   · Luule Viilma + Louise Hay (mirror register)
 *   - somatic_science · Stephen Porges + Peter Levine (regulation)
 *
 * Choice persists in localStorage as `aurin_body_lens_v1`. Active
 * lens softly breathes (CSS halo). "Step away from the lens" returns
 * the mentor to its universal register.
 *
 * Data is fetched from `GET /api/body-room/lenses` on mount. If the
 * request fails the selector hides gracefully; the rest of the room
 * continues unaffected.
 */
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Wind, Sparkles, Activity, Check, Compass } from "lucide-react";

export const LENS_STORE_KEY = "aurin_body_lens_v1";
export const LENS_EVENT = "aurin-body-lens-changed";
export const DEFAULT_LENS = "intuitive";

const ICONS = {
  intuitive: Compass,
  eastern: Wind,
  psychosomatic: Sparkles,
  somatic_science: Activity,
};

const ACCENT = {
  intuitive: "from-amber-300/15 to-sage-100/0",
  eastern: "from-emerald-300/15 to-emerald-100/0",
  psychosomatic: "from-rose-300/15 to-rose-100/0",
  somatic_science: "from-sky-300/15 to-sky-100/0",
};

/**
 * The active lens id. If nothing is stored, the intuitive (default)
 * lens is returned so the chat always sends a known id. Components
 * that want to distinguish "explicitly picked" vs "default" should
 * read `localStorage` directly.
 */
export function readActiveLens() {
  try {
    if (typeof window === "undefined") return DEFAULT_LENS;
    return window.localStorage.getItem(LENS_STORE_KEY) || DEFAULT_LENS;
  } catch {
    return DEFAULT_LENS;
  }
}

function writeActiveLens(id) {
  try {
    if (typeof window === "undefined") return;
    if (id && id !== DEFAULT_LENS) {
      window.localStorage.setItem(LENS_STORE_KEY, id);
    } else {
      // Default (intuitive) means "no override" — clear the storage.
      window.localStorage.removeItem(LENS_STORE_KEY);
    }
    window.dispatchEvent(
      new CustomEvent(LENS_EVENT, { detail: { id: id || DEFAULT_LENS } })
    );
  } catch {
    /* noop */
  }
}

export default function BodyLensSelector() {
  const [lenses, setLenses] = useState([]);
  const [activeId, setActiveId] = useState(() => readActiveLens());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await api.get("/body-room/lenses");
        if (alive) setLenses(r?.data?.lenses || []);
      } catch {
        /* hide gracefully */
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // External changes (other tab / chat clear) → keep in sync.
  useEffect(() => {
    const onChange = (e) => setActiveId(e?.detail?.id || DEFAULT_LENS);
    window.addEventListener(LENS_EVENT, onChange);
    return () => window.removeEventListener(LENS_EVENT, onChange);
  }, []);

  if (!loaded || lenses.length === 0) return null;

  // Render intuitive first so it always sits in the leftmost slot — the
  // "home base" the wanderer returns to.
  const ordered = [...lenses].sort((a, b) => {
    if (a.id === DEFAULT_LENS) return -1;
    if (b.id === DEFAULT_LENS) return 1;
    return 0;
  });

  const pick = (id) => {
    writeActiveLens(id);
    setActiveId(id || DEFAULT_LENS);
  };

  return (
    <section className="aurin-section-sm" data-testid="body-lens-selector">
      <div className="aurin-container max-w-[860px]">
        <div className="aurin-card p-7 md:p-9 space-y-5">
          <div>
            <div className="aurin-eyebrow !mb-1 inline-flex items-center gap-1.5">
              <Sparkles
                size={11}
                strokeWidth={1.4}
                className="text-[hsl(var(--aurin-sage))]"
              />
              Choose a lens · entirely optional
            </div>
            <h2 className="aurin-display text-2xl md:text-3xl leading-snug max-w-[28ch]">
              Four quiet perspectives,{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                one of them invisible.
              </span>
            </h2>
            <p className="text-[13.5px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9] mt-3 max-w-[60ch]">
              Intuitive Flow is the default — the mentor reads your
              words and adapts silently. If you would rather choose a
              single lens for tonight, the other three are here. You
              can return to Intuitive Flow at any moment.
            </p>
          </div>

          <div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
            data-testid="body-lens-cards"
          >
            {ordered.map((lens) => {
              const Icon = ICONS[lens.id] || Wind;
              const active = activeId === lens.id;
              const isDefault = lens.id === DEFAULT_LENS;
              return (
                <button
                  type="button"
                  key={lens.id}
                  onClick={() => pick(lens.id)}
                  data-testid={`body-lens-card-${lens.id}`}
                  data-active={active ? "true" : "false"}
                  data-default={isDefault ? "true" : "false"}
                  aria-pressed={active}
                  className={`group text-left relative p-5 rounded-xl border bg-gradient-to-b ${
                    ACCENT[lens.id] || ""
                  } bg-[hsl(var(--aurin-bg))]/40 space-y-3 transition-all duration-300 overflow-hidden ${
                    active
                      ? "border-[hsl(var(--aurin-sage))]/70 ring-1 ring-[hsl(var(--aurin-sage))]/40 lens-breathing"
                      : "border-[hsl(var(--aurin-border-soft))] hover:border-[hsl(var(--aurin-sage))]/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon
                        size={15}
                        strokeWidth={1.5}
                        className="text-[hsl(var(--aurin-sage))]"
                      />
                      <div>
                        <h3 className="aurin-display text-[17px] leading-snug">
                          {lens.name}
                        </h3>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]">
                          {lens.subtitle}
                        </p>
                      </div>
                    </div>
                    {active ? (
                      <span
                        className="inline-flex items-center gap-1 text-[10.5px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-sage))] shrink-0"
                        data-testid={`body-lens-active-badge-${lens.id}`}
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

          {activeId && activeId !== DEFAULT_LENS && (
            <div
              className="flex items-center justify-between gap-3 pt-2 border-t border-[hsl(var(--aurin-border-soft))]"
              data-testid="body-lens-active-row"
            >
              <p className="text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] aurin-serif-italic">
                The mentor will speak through this lens tonight. You can
                return to Intuitive Flow at any moment.
              </p>
              <button
                type="button"
                onClick={() => pick(DEFAULT_LENS)}
                data-testid="body-lens-clear"
                className="aurin-btn aurin-btn-ghost !py-1.5 !px-3 !text-[12px] shrink-0"
              >
                Return to Intuitive
              </button>
            </div>
          )}

          <p
            className="text-[11.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]/85 aurin-serif-italic pt-2 border-t border-[hsl(var(--aurin-border-soft))]"
            data-testid="body-lens-disclaimer"
          >
            None of these lenses are diagnoses. They are old, modern, and
            scientific maps — used here only as soft companions, never as
            medical care. If the body asks for a doctor, please listen to
            that voice first.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes lens-halo {
          0%, 100% { box-shadow: 0 0 0 0 hsl(var(--aurin-sage) / 0.0); }
          50%      { box-shadow: 0 0 22px 4px hsl(var(--aurin-sage) / 0.18); }
        }
        .lens-breathing {
          animation: lens-halo 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
