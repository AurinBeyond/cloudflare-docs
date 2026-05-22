/**
 * Aurin Story World — single source of truth for short, calm
 * bedtime stories. Founder directive (2026-05-22):
 *
 *  - Lightweight. No realtime AI. No streaming infra.
 *  - Static MP3 audio when available. "Audio coming soon" otherwise.
 *  - Optional PDF download per story.
 *  - Organised by the existing age-group taxonomy:
 *      little-dreamers (3–5)
 *      explorers       (6–8)
 *      dreamweavers    (9–12)
 *  - Mobile-friendly story cards: cover, intro line, read, listen, PDF.
 *  - Easy to expand: just append a new object to the array.
 *
 * Editing rules for Anna:
 *  - To add a new story → append to STORIES.
 *  - To unlock audio    → set `audio` to a path like "/assets/audio/stories/<slug>.mp3".
 *  - To unlock PDF      → set `pdf`   to "/assets/pdfs/stories/<slug>.pdf".
 *  - Imagery falls back to the age-group hero if `cover` is omitted.
 */

export const STORY_AGE_GROUPS = [
  {
    slug: "little-dreamers",
    label: "Little Dreamers",
    age: "Ages 3–5",
    accent: "#F4D9C2",
    description: "Soft pictures and gentle moments for the smallest dreamers.",
  },
  {
    slug: "explorers",
    label: "Explorers",
    age: "Ages 6–8",
    accent: "#7BA888",
    description: "Small adventures, friendly heroes, and playful wisdom.",
  },
  {
    slug: "dreamweavers",
    label: "Dreamweavers",
    age: "Ages 9–12",
    accent: "#9A8FB8",
    description: "Quieter, deeper stories that leave room for imagination.",
  },
];

export const STORIES = [
  // ─────────── Little Dreamers (3–5) ───────────
  {
    slug: "little-star",
    title: "Little Star",
    ageGroup: "little-dreamers",
    minutes: 3,
    intro:
      "A tiny star learns that being small is not the same as being unseen.",
    cover: "/assets/aurin/little-dreamers-hero.png",
    audio: null,
    pdf: null,
    body: [
      "High in the quiet sky lived a very little star. The other stars sparkled and laughed, but Little Star was so small she thought no one could see her.",
      "One night, a child looked out of the window. The night was cold and the room felt dark. The child whispered, \"I wish I had one tiny light, just for me.\"",
      "Little Star heard the whisper. She held her breath and shone as softly as she could. Not bright. Not loud. Just a small, warm light, like a candle far away.",
      "The child smiled. \"There you are,\" they said. \"I see you.\"",
      "Little Star learned something that night: a small light, given gently, is enough. You do not have to be the biggest to be loved. You only have to be here.",
      "And every night after, when the room felt too dark, the child would look up and find her — small, calm, and exactly enough.",
    ],
  },
  {
    slug: "moon-boat",
    title: "The Moon Boat",
    ageGroup: "little-dreamers",
    minutes: 3,
    intro:
      "A sleepy boat made of moonlight carries quiet dreams across the night sea.",
    cover: "/assets/aurin/little-dreamers-hero.png",
    audio: null,
    pdf: null,
    body: [
      "When the sky turns dark and the world begins to slow, a little boat appears on the sea. It is made of moonlight — silver and soft and very, very quiet.",
      "The Moon Boat has no engine and no sail. It moves only when a child closes their eyes and breathes out, slow and warm.",
      "Tonight, a small dream climbs aboard. It is the dream of a warm hand, a soft blanket, and someone gentle in the next room.",
      "The Moon Boat rocks, just a little. The waves whisper, \"Hush.\" The stars lean down to look.",
      "And while the child sleeps, the Moon Boat carries the dream across the calm, dark water — all the way to morning.",
    ],
  },
  // ─────────── Explorers (6–8) ───────────
  {
    slug: "night-forest",
    title: "The Night Forest",
    ageGroup: "explorers",
    minutes: 4,
    intro:
      "A small explorer discovers that the forest at night is not scary — it is listening.",
    cover: "/assets/aurin/explorers-hero.png",
    audio: null,
    pdf: null,
    body: [
      "Mira had always loved the forest in the daytime. The leaves were green, the path was clear, and the birds sang loud songs. But at night, the forest looked different — taller, darker, full of shadows.",
      "One evening, Mira's grandmother said, \"Come. I want to show you something only the night forest knows.\"",
      "They walked together, slowly. A small lantern swung between them. The trees were quiet, but they were not empty.",
      "\"Listen,\" Grandmother said. \"The forest is not louder at night. It is just listening more carefully.\"",
      "Mira stopped walking. She closed her eyes. She heard a leaf turn. A tiny breeze. The far, soft hoot of an owl who knew her name.",
      "\"The dark is not against you,\" Grandmother whispered. \"The dark is paying attention.\"",
      "Mira opened her eyes. The forest was still tall. The shadows were still long. But now they felt like company.",
      "She walked home holding the lantern a little higher, no longer afraid.",
    ],
  },
  {
    slug: "quiet-dragon",
    title: "The Quiet Dragon",
    ageGroup: "explorers",
    minutes: 4,
    intro:
      "Most dragons roar. This one chose to listen — and changed a whole village.",
    cover: "/assets/aurin/explorers-hero.png",
    audio: null,
    pdf: null,
    body: [
      "In a village at the edge of a soft mountain lived a dragon who did not roar. He was tall and silver and a little bit shy. The villagers called him the Quiet Dragon.",
      "Other dragons stomped through the valleys and shouted at the sky. But the Quiet Dragon liked to sit on his rock and listen.",
      "He listened to the river. He listened to the wind. And, most of all, he listened to the children — because children, he said, often know what grown-ups have forgotten.",
      "One day, a small boy came to the rock. The boy was angry. His hands were tight and his face was hot.",
      "The Quiet Dragon did not ask anything. He just sat. And waited. And listened.",
      "After a while, the boy began to talk. Then he began to cry. Then he became quiet too.",
      "When the boy left, he was lighter. The Quiet Dragon had not said one word — but he had heard every single one.",
      "That is how the village learned: sometimes the bravest thing a dragon can do is simply pay attention.",
    ],
  },
  // ─────────── Dreamweavers (9–12) ───────────
  {
    slug: "aurin-and-the-lantern",
    title: "Aurin and the Lantern",
    ageGroup: "dreamweavers",
    minutes: 5,
    intro:
      "Aurin learns the difference between a light that shows the way and a light that pretends.",
    cover: "/assets/aurin/dreamweavers-hero.png",
    audio: null,
    pdf: null,
    body: [
      "Aurin had walked for a long time. The path was older than the trees, and the trees were older than the village. In Aurin's hand, a small lantern glowed — not bright, but steady.",
      "At a fork in the road, Aurin met a traveller. The traveller carried a beautiful lamp, much larger and louder than Aurin's. Coloured light spilled from it in every direction.",
      "\"Yours is so small,\" the traveller said. \"How can you see anything at all?\"",
      "Aurin smiled. \"I do not need to see everything,\" Aurin said. \"I only need to see the next step.\"",
      "They walked together for a while. The traveller's lamp was magnificent. It lit up trees, rocks, and distant hills. But it also threw long shadows that confused the path.",
      "Aurin's lantern lit only a small circle. But inside that circle, the ground was honest.",
      "After many hours, the traveller's lamp grew tired and went out. The traveller sat down, suddenly afraid.",
      "Aurin sat beside them, lifted the lantern, and said, \"You do not need a bigger light. You need a closer one. Stay near me. We will go slowly. One step is enough.\"",
      "And so they walked — not fast, not far, but together — and the small steady light was, in the end, more than enough.",
    ],
  },
];

export function getStoriesByGroup(groupSlug) {
  return STORIES.filter((s) => s.ageGroup === groupSlug);
}

export function getStoryBySlug(slug) {
  return STORIES.find((s) => s.slug === slug) || null;
}

export function getGroupBySlug(slug) {
  return STORY_AGE_GROUPS.find((g) => g.slug === slug) || null;
}
