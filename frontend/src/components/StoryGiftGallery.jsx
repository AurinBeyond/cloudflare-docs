/**
 * StoryGiftGallery.jsx — §SYNERGY-ANNELI 2026-02-10
 *
 * "Aurin's first ten stories" — a small gallery of curated excerpts
 * shown on the /aurins-room/gift form. Reduces blank-page hesitation
 * by letting the parent SEE the quality of voice before they decide
 * to make one.
 *
 * Each card shows: title, the feeling-anchor, archetype family,
 * and the first ~30 words. Click → expand the full excerpt inline.
 *
 * NOTE: these are hand-curated reference samples that show the
 * tonal range. The parent's actual story is generated fresh by
 * Claude when they fill the form. These are NOT in the DB — they
 * live as static reference so they always render instantly.
 */

import { useState } from "react";
import { BookOpen } from "lucide-react";

const SAMPLE_STORIES = [
    {
        slug: "luca-quiet-night",
        archetype: "Night Guardian",
        feeling: "scared",
        age_band: "6-8",
        title: "Luca and the Quiet Night",
        opening:
            "Luca sat up in bed, where the dark felt like it was watching. His mother had left a small candle burning in a glass jar on the windowsill — a plain jar with a bit of wax inside, the kind used for jam in summer.",
        snippet:
            "The flame stayed steady, even when the curtain moved. Luca pulled his knees up and looked at it. The candle didn't do anything special — it just stayed there, golden and small, turning the edge of his pillow warm. He thought about how the flame knew how to be itself without trying.",
    },
    {
        slug: "mira-steady-light",
        archetype: "Protector",
        feeling: "lonely",
        age_band: "6-8",
        title: "Mira and the Steady Light",
        opening:
            "Mira sat on the edge of her bed, listening to where the other voices had gone somewhere else — downstairs, outside, into another room. The house felt wide and empty.",
        snippet:
            "She looked at the chair by the window. Her mother's coat hung over it, soft and dark blue. Mira hadn't noticed it there before dinner. She pressed her cheek against the sleeve. It smelled like wool and rain and the smallest bit of her mother's wrist.",
    },
    {
        slug: "eero-soft-answer",
        archetype: "Peace Keeper",
        feeling: "angry",
        age_band: "6-8",
        title: "Eero and the Soft Answer",
        opening:
            "Eero sat in the garden where the chest had become a small fire. The grass was warm. He pulled at it with both hands and it didn't make the fire any smaller.",
        snippet:
            "A small grey fox stopped at the edge of the apple tree. It didn't come close. It just sat. After a while Eero noticed his hands had let go of the grass, and the grass had not minded.",
    },
    {
        slug: "noa-window-moth",
        archetype: "Night Guardian",
        feeling: "tired",
        age_band: "3-5",
        title: "Noa and the Window Moth",
        opening:
            "Noa was sleepy. The bones had asked to be put down. She climbed into bed without saying so.",
        snippet:
            "A pale grey moth was resting on the glass. Its wings opened and closed, slowly, like breathing. Noa watched. Her breath slowed to match. The moth stayed. Noa stayed. The room stayed.",
    },
    {
        slug: "iris-careful-question",
        archetype: "Peace Keeper",
        feeling: "curious",
        age_band: "9-12",
        title: "Iris and the Careful Question",
        opening:
            "Iris sat by the kitchen window, where one small light kept asking questions she couldn't quite hear yet. The radiator was making its evening sound.",
        snippet:
            "A sparrow had landed on the sill, three feet from her elbow. It tilted its head once, then twice. \"What did you want to ask?\" Iris whispered. The sparrow tilted again, as if the question itself was the answer. They stayed like that until the light moved.",
    },
    {
        slug: "amos-folded-coat",
        archetype: "Protector",
        feeling: "sad",
        age_band: "6-8",
        title: "Amos and the Folded Coat",
        opening:
            "Amos sat at the kitchen table, where the day had folded itself a bit too tightly. The wooden chair was cool against the backs of his knees.",
        snippet:
            "His father's coat was folded over the next chair. Amos hadn't put it there. The pocket still held the shape of something — keys, or a stone, or a hand. The fabric smelled faintly of cold air and the bakery on Pine Street. He didn't move. The coat didn't either.",
    },
    {
        slug: "stella-still-room",
        archetype: "Peace Keeper",
        feeling: "proud",
        age_band: "6-8",
        title: "Stella and the Still Room",
        opening:
            "Stella sat on the floor of her room, where something quiet had stood up that day. She didn't tell anyone yet. She wanted to keep it for a minute.",
        snippet:
            "An old garden bee was bumping softly against the window. It had been there since lunch. It wasn't trying to get out anymore — it was just resting. Stella watched it rest. The afternoon was warm. She felt the same warm settle into her shoulders.",
    },
    {
        slug: "kai-warm-spot",
        archetype: "Protector",
        feeling: "lonely",
        age_band: "3-5",
        title: "Kai and the Warm Spot",
        opening:
            "Kai was small. The other voices were far away. He sat on the rug. The rug was old.",
        snippet:
            "The cat got up and left her warm spot. Kai put his hand on it. It was very warm. He kept his hand there. The warm did not go away for a long time.",
    },
    {
        slug: "lina-open-door",
        archetype: "Protector",
        feeling: "scared",
        age_band: "9-12",
        title: "Lina and the Open Door",
        opening:
            "Lina lay in bed, where the dark felt like it was watching. The hallway door, which her mother always closed, had been left an inch open.",
        snippet:
            "A thin line of light reached across her floor and touched the foot of her bed. Lina watched it. The line of light did not move, did not flicker, did not promise anything. It was simply there. \"You can leave it like that,\" the house seemed to say. So she did.",
    },
    {
        slug: "tobi-blanket-corner",
        archetype: "Night Guardian",
        feeling: "happy",
        age_band: "3-5",
        title: "Tobi and the Blanket Corner",
        opening:
            "Tobi was warm. The day had not yet been spent. He wrapped a corner of the blanket around his hand. His hand looked like a small soft mountain.",
        snippet:
            "Outside, a dog barked once, then stopped. The radiator ticked. Tobi listened. He liked the ticking. He liked the small mountain. He liked the bit of moon at the edge of the window. There was no hurry to sleep, and so he didn't.",
    },
];

export default function StoryGiftGallery() {
    const [expanded, setExpanded] = useState(null);

    return (
        <section
            className="mt-14 pt-10 border-t"
            style={{ borderColor: "#e8d2a8" }}
            data-testid="story-gift-gallery"
        >
            <p
                className="text-[11px] uppercase tracking-[0.24em] mb-3"
                style={{ color: "#8a6428" }}
            >
                Aurin's first ten stories
            </p>
            <h2
                className="text-[34px] sm:text-[40px] leading-tight mb-4 max-w-[28ch]"
                style={{
                    fontFamily: "Caveat, cursive",
                    color: "#3d2a14",
                    fontWeight: 600,
                }}
            >
                A small shelf to read first.
            </h2>
            <p
                className="text-[14.5px] leading-relaxed max-w-[58ch] mb-8"
                style={{ color: "#5a4628" }}
            >
                If you'd rather see the voice before you ask for your own,
                here are ten short examples — different children, different
                feelings, different rooms. Tap one to read more of it.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="story-gift-gallery-grid">
                {SAMPLE_STORIES.map((s) => {
                    const isOpen = expanded === s.slug;
                    return (
                        <button
                            key={s.slug}
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : s.slug)}
                            data-testid={`story-gift-sample-${s.slug}`}
                            className="text-left rounded-2xl p-5 transition relative overflow-hidden hover:-translate-y-0.5"
                            style={{
                                background: isOpen
                                    ? "linear-gradient(160deg, #fffaf0 0%, #f6e3bf 100%)"
                                    : "linear-gradient(160deg, #fffaf0 0%, #f7e8c8 100%)",
                                border: `1.5px solid ${isOpen ? "#a65a2f" : "#e8d2a8"}`,
                                boxShadow: isOpen
                                    ? "0 12px 26px -14px rgba(166,90,47,0.5), inset 0 1px 0 rgba(255,255,255,0.7)"
                                    : "0 4px 14px -10px rgba(166,90,47,0.3), inset 0 1px 0 rgba(255,255,255,0.65)",
                            }}
                        >
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute top-0 left-0 right-0 rounded-t-2xl"
                                style={{
                                    height: "30%",
                                    background:
                                        "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
                                }}
                            />
                            <div className="relative flex items-start gap-3 mb-2">
                                <BookOpen size={14} style={{ color: "#a65a2f" }} className="mt-1 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h3
                                        className="text-[22px] leading-tight"
                                        style={{
                                            fontFamily: "Caveat, cursive",
                                            color: "#2c2418",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {s.title}
                                    </h3>
                                    <p
                                        className="text-[10.5px] uppercase tracking-[0.18em] mt-1"
                                        style={{ color: "#8a6428" }}
                                    >
                                        {s.feeling} · age {s.age_band} · {s.archetype}
                                    </p>
                                </div>
                            </div>
                            <p
                                className="relative text-[14px] leading-[1.65]"
                                style={{
                                    fontFamily: "Fraunces, Georgia, serif",
                                    color: "#3d2a14",
                                }}
                            >
                                {s.opening}
                                {isOpen && (
                                    <span className="block mt-3" style={{ color: "#3d2a14" }}>
                                        {s.snippet}
                                    </span>
                                )}
                            </p>
                            {!isOpen && (
                                <p
                                    className="relative mt-3 text-[12.5px] tracking-wide"
                                    style={{ color: "#a65a2f" }}
                                >
                                    Read more →
                                </p>
                            )}
                        </button>
                    );
                })}
            </div>

            <p
                className="text-[12.5px] italic mt-7 max-w-[52ch] leading-relaxed"
                style={{ color: "#7a5e2e" }}
            >
                These are examples. Your child's story will be written fresh —
                with their name, their feeling, and their own quiet creature.
            </p>
        </section>
    );
}
