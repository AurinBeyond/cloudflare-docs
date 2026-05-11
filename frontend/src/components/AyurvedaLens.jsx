/**
 * AyurvedaLens.jsx — Body Room v2 Ancient-Wisdom lens.
 *
 * Two surfaces, one shared map:
 *   <AyurvedaThreeWinds />      → soft "three winds" intro card
 *                                 (Vāta · Pitta · Kapha), no diagnosis,
 *                                 no quiz, just calm orientation.
 *   <AyurvedaForRegion region/> → single-region lens rendered inside the
 *                                 HotspotModal — one breath note, one
 *                                 permission, no clinical claim.
 *
 * Strict wellness-language lock: no "treats", "cures", "heals",
 * "diagnoses". The lens offers a possibility and a small breath — that
 * is the entire promise. Sanskrit terms are always followed by a plain
 * meaning so the wanderer is never left puzzled.
 */
import { Wind, Flame, Mountain, Sparkles } from "lucide-react";

/**
 * The eight-region → doṣa lens. Each entry is a single, calm
 * possibility, never a diagnosis. Sanskrit terms are paired with their
 * plain meaning. The `permission` line is the heart of each entry —
 * the wanderer is allowed to do nothing with it.
 */
const REGION_LENS = {
  crown: {
    dosha: "vāta",
    element: "ether · space",
    breath:
      "anuloma-viloma — a slow alternate-nostril breath, like settling sand in a glass",
    permission: "you do not have to hold the whole sky tonight.",
  },
  throat: {
    dosha: "vāta",
    element: "ether · space",
    breath:
      "brāhmarī — a soft humming exhale, letting the throat vibrate without strain",
    permission: "what you have not said is allowed to wait.",
  },
  heart: {
    dosha: "kapha",
    element: "water · earth",
    breath:
      "ujjāyī — an even ocean-breath through the nose, very slow on the exhale",
    permission: "the heart is allowed to be soft here.",
  },
  solar_plexus: {
    dosha: "pitta",
    element: "fire · heat",
    breath:
      "sītalī — a cooling breath drawn through pursed lips, like sipping cool air",
    permission: "you do not have to defend yourself tonight.",
  },
  belly: {
    dosha: "pitta",
    element: "fire · water",
    breath:
      "sītalī — three rounds of cooling breath, unhurried, mouth slightly open",
    permission: "the belly does not have to fix anything.",
  },
  hips: {
    dosha: "kapha",
    element: "earth · water",
    breath:
      "a slow diaphragmatic breath — letting the lower back rest into the chair, the floor, the bed",
    permission:
      "what you carry below the waist is allowed to settle, in its own time.",
  },
  hands: {
    dosha: "vāta",
    element: "air · movement",
    breath:
      "soften the palms — three breaths where the exhale is longer than the inhale",
    permission: "the hands do not have to hold or fix anyone tonight.",
  },
  feet: {
    dosha: "kapha",
    element: "earth",
    breath:
      "feel the floor — three slow breaths down into the soles, as if rooting",
    permission: "the ground is here. you can lean on it.",
  },
};

/**
 * Three quiet introductions to the dosha map. No quiz, no "type"
 * lock-in. The wanderer reads what recognises itself and leaves the
 * rest. Each card carries ONE small steadying note.
 */
const WINDS = [
  {
    id: "vata",
    name: "Vāta",
    plain: "the wind of movement",
    element: "ether · air",
    feels:
      "When the body is wind-like — quick thoughts, cold hands, a restless sleep, skin that goes dry, a heart that races without a reason — the old maps called it Vāta. Nothing wrong. The room has simply asked you to slow.",
    note:
      "A long warm exhale, slower than the inhale. Warmth on the feet. Less screen, more silence.",
    Icon: Wind,
    accent: "from-slate-300/30 to-slate-100/0",
  },
  {
    id: "pitta",
    name: "Pitta",
    plain: "the wind of fire",
    element: "fire · water",
    feels:
      "When the body is bright and sharp — a hot belly, a tight jaw, a faster pulse in the chest, irritation that arrives before the thought does — the old maps called it Pitta. Not a flaw. A signal that something is being defended too long.",
    note:
      "A cooling breath through pursed lips (sītalī). Less heat in the food. One slow walk in the evening air.",
    Icon: Flame,
    accent: "from-amber-300/25 to-rose-200/0",
  },
  {
    id: "kapha",
    name: "Kapha",
    plain: "the wind of earth",
    element: "earth · water",
    feels:
      "When the body is heavy and slow — a chest that won't quite lift, a sleep that does not refresh, a softness in the limbs that asks to be held — the old maps called it Kapha. Not weakness. A season the body is moving through.",
    note:
      "Gentle warmth. A short walk before sitting. One small movement, then another.",
    Icon: Mountain,
    accent: "from-emerald-300/25 to-emerald-100/0",
  },
];

export function AyurvedaThreeWinds() {
  return (
    <section className="aurin-section-sm" data-testid="ayurveda-three-winds">
      <div className="aurin-container max-w-[860px]">
        <div className="aurin-card p-7 md:p-9 space-y-6">
          <div>
            <div className="aurin-eyebrow !mb-1 inline-flex items-center gap-1.5">
              <Sparkles
                size={11}
                strokeWidth={1.4}
                className="text-[hsl(var(--aurin-sage))]"
              />
              An ancient lens · the three winds
            </div>
            <h2 className="aurin-display text-2xl md:text-3xl leading-snug max-w-[28ch]">
              Three quiet weathers,{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                already inside you.
              </span>
            </h2>
            <p className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9] mt-3">
              Long before psychology, the body-and-breath traditions
              described three quiet weathers that move through every life —
              the wind of movement, the wind of fire, the wind of earth.
              Not types. Not labels. Just weather. Read what recognises
              itself tonight, and leave the rest at the door.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {WINDS.map((w) => {
              const Icon = w.Icon;
              return (
                <article
                  key={w.id}
                  data-testid={`ayurveda-wind-${w.id}`}
                  className={`relative p-5 rounded-xl border border-[hsl(var(--aurin-border-soft))] bg-gradient-to-b ${w.accent} bg-[hsl(var(--aurin-bg))]/40 space-y-3 overflow-hidden`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      size={14}
                      strokeWidth={1.5}
                      className="text-[hsl(var(--aurin-sage))]"
                    />
                    <div>
                      <h3
                        className="aurin-display text-[18px] leading-snug"
                        data-testid={`ayurveda-wind-name-${w.id}`}
                      >
                        {w.name}
                      </h3>
                      <p className="text-[11.5px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]">
                        {w.plain}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]/80">
                    {w.element}
                  </p>
                  <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.92]">
                    {w.feels}
                  </p>
                  <div className="pt-2 border-t border-[hsl(var(--aurin-border-soft))]">
                    <div className="aurin-eyebrow !mb-1 text-[10px] text-[hsl(var(--aurin-sage))]">
                      A small steadying
                    </div>
                    <p className="text-[13px] leading-relaxed aurin-serif-italic text-[hsl(var(--aurin-text))/0.95]">
                      {w.note}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          <p
            data-testid="ayurveda-winds-disclaimer"
            className="text-[12px] leading-relaxed text-[hsl(var(--aurin-text-muted))]/90 aurin-serif-italic pt-2 border-t border-[hsl(var(--aurin-border-soft))]"
          >
            These are not diagnoses. They are old, soft observations about
            how the body changes with the seasons of a life. If the body
            asks for a doctor, please listen to that voice first.
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * One-region lens shown inside the HotspotModal. Compact, single
 * paragraph. Never appears unless the region is known to the map.
 */
export function AyurvedaForRegion({ region }) {
  const entry = REGION_LENS[region];
  if (!entry) return null;
  return (
    <div
      data-testid={`ayurveda-region-${region}`}
      className="space-y-1.5 pt-2 border-t border-[hsl(var(--aurin-border-soft))]"
    >
      <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.28em] text-[hsl(var(--aurin-text-muted))]">
        <Sparkles
          size={11}
          strokeWidth={1.4}
          className="text-[hsl(var(--aurin-sage))]"
        />
        <span>An ancient lens</span>
      </div>
      <p className="text-[12.5px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))]/85">
        <span
          className="text-[hsl(var(--aurin-sage))]"
          data-testid={`ayurveda-region-dosha-${region}`}
        >
          {entry.dosha}
        </span>
        <span className="opacity-60"> · {entry.element}</span>
      </p>
      <p
        className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.92]"
        data-testid={`ayurveda-region-breath-${region}`}
      >
        <span className="text-[hsl(var(--aurin-text-muted))]">A breath:</span>{" "}
        {entry.breath}.
      </p>
      <p
        className="text-[13px] leading-relaxed aurin-serif-italic text-[hsl(var(--aurin-text))/0.95]"
        data-testid={`ayurveda-region-permission-${region}`}
      >
        {entry.permission}
      </p>
    </div>
  );
}

export default AyurvedaThreeWinds;
