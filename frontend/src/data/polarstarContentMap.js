/**
 * polarstarContentMap.js — §POLARSTAR-CONTENT iter 86 2026-02-29
 *
 * SINGLE SOURCE OF TRUTH for every button that opens a themed content
 * page inside the painted Polarstar world. Replaces the previous
 * "every button is a waitlist" model.
 *
 * SHAPE of each ROOM:
 *   {
 *     id:        "discovery" | "exploration" | "creation"
 *     ageLabel:  "Ages 4–6"  (display string)
 *     ageBucket: "little-dreamers" | "explorers" | "dreamweavers"
 *     palette:   { tint, accent, glow }  (per-room hue overlay)
 *     subtitle:  the line under the title cloud
 *     activities: [{ id, slug, title, blurb, lucideIcon, type,
 *                    route, status, ... type-specific fields }]
 *   }
 *
 * activity.type:
 *   - "story"     → opens a story-deck page with cards from aurinStories.js
 *   - "challenge" → opens a "Today's challenge" card with steps + parent tip
 *   - "breathe"   → opens a 3-breath / mindful-minute calm page
 *   - "moves"     → opens a body-movement playlist
 *   - "draw"      → opens a Drawing Palette page (HTML5 canvas Coming Soon)
 *   - "kindness"  → opens a kindness mission card
 *   - "reflect"   → opens a quiet journal/reflection prompt
 *   - "project"   → opens a multi-step creation project
 *   - "soon"      → themed Coming Soon card inside the painted world
 *                   (NOT a waitlist modal — stays in the world)
 *
 * status:
 *   - "live"      content is real and renders immediately
 *   - "soon"      themed preview page; parent can drop name on Explorer List
 *
 * Editing rules for the founder:
 *   - To add a new activity, append to the room's activities array.
 *   - Always link to existing story slugs from aurinStories.js when
 *     activity.type === "story".
 *   - Never break the painted-world feel — content pages MUST use
 *     PolarstarThemePage as the shell.
 */

import {
  BookOpen, Heart, Sun, Palette, Compass, Sparkles, Footprints,
  Pencil, Mic, Hand, Wind, Leaf, Globe, Rocket, PawPrint, Beaker,
  PenLine, Hammer, Code2, Film, Share2, Moon,
} from "lucide-react";

import { getStoriesByGroup } from "@/data/aurinStories";

/* ── Palette per room (used by PolarstarThemePage hue tint) ───── */
const PAL = {
  discovery:   { tint: "rgba(252, 230, 200, 0.18)", accent: "#b97a3a", glow: "rgba(244,180,90,0.35)" },
  exploration: { tint: "rgba(214, 232, 196, 0.18)", accent: "#5d8a4f", glow: "rgba(155,200,120,0.35)" },
  creation:    { tint: "rgba(214, 220, 244, 0.18)", accent: "#5b6cb2", glow: "rgba(135,158,224,0.35)" },
};

/* ── DISCOVERY (Ages 4–6) ────────────────────────────────────── */
const DISCOVERY_ACTIVITIES = [
  {
    id: "story-time",
    slug: "story-time",
    title: "Story Time",
    blurb: "Magical stories to read and listen.",
    lucideIcon: BookOpen,
    type: "story",
    status: "live",
    route: "/kids-universe/polarstar/discovery/story-time",
    parentTip:
      "Reading together builds connection and confidence. Afterwards, ask your child: \"What was your favourite part?\"",
    storyAgeBucket: "little-dreamers",
  },
  {
    id: "play-move",
    slug: "play-move",
    title: "Play & Move",
    blurb: "Fun movement and play activities.",
    lucideIcon: Footprints,
    type: "moves",
    status: "live",
    route: "/kids-universe/polarstar/discovery/play-move",
    parentTip: "Movement before bedtime can feel silly — that's the point. Laughter is part of the recipe.",
    moves: [
      { title: "Tall tree, small seed",   body: "Stand tall like a tree. Then curl up tiny like a seed. Five times. Slowly." },
      { title: "Bunny hops",              body: "Hop softly across the room — five hops there, five hops back." },
      { title: "Bear walk",               body: "Walk on hands and feet like a sleepy bear. Make it as slow as you can." },
      { title: "Wiggle and freeze",       body: "Wiggle everything for ten seconds. Then freeze. Then wiggle again." },
    ],
    journey: {
      character: "Little Star",
      intro: "The Little Star feels heavy tonight. It needs to wake its body up before it can fly. Will you help? Each move you do sends light into the Star's wings.",
      outroEyebrow: "The star is glowing",
      outro: "You moved your body. The Little Star is ready to fly. Well done — and goodnight, if it's time.",
      sessionCapMinutes: 10,
      softWarningAtMinutes: 9,
      coolDownHours: 18,
      restingMessage: "The Star is resting. See you tomorrow.",
    },
  },
  {
    id: "drawing-palette",
    slug: "drawing-palette",
    title: "Drawing Palette",
    blurb: "Color, draw and create your world.",
    lucideIcon: Palette,
    type: "draw",
    status: "soon",
    route: "/kids-universe/polarstar/discovery/drawing-palette",
    parentTip: "Encourage creativity, not perfection. Praise effort and imagination — not the result.",
    prompts: [
      "Draw the house where you live, with one room you wish was bigger.",
      "Draw your favourite animal sitting in a quiet forest.",
      "Draw what 'happy' looks like — give it a colour.",
      "Draw a tiny world that fits inside a teacup.",
    ],
  },
  {
    id: "kindness-mission",
    slug: "kindness-mission",
    title: "Kindness Mission",
    blurb: "Small acts of kindness make a big world.",
    lucideIcon: Heart,
    type: "kindness",
    status: "live",
    route: "/kids-universe/polarstar/discovery/kindness-mission",
    parentTip: "Talk about how kindness feels in the heart. It doesn't need to be seen to be real.",
    challenge: "Today's Kind Challenge — pick one and try it.",
    actions: [
      "Say something kind to someone you live with.",
      "Help with one small thing nobody asked you to.",
      "Share a toy or a snack with someone.",
      "Make someone smile — a real, warm smile.",
    ],
  },
  {
    id: "morning-mindful-start",
    slug: "morning-mindful-start",
    title: "Morning Slow Start",
    blurb: "Breathe, smile, and get ready.",
    lucideIcon: Sun,
    type: "breathe",
    status: "live",
    route: "/kids-universe/polarstar/discovery/morning-mindful-start",
    parentTip: "Do this WITH your child the first few mornings. After that, they will do it on their own.",
    steps: [
      "Sit up tall. Place both hands on your tummy.",
      "Breathe in slowly, like smelling a flower. (1… 2… 3…)",
      "Breathe out slowly, like blowing out a candle. (1… 2… 3…)",
      "Repeat three times. Then smile — even a little. Today has begun.",
    ],
  },
];

/* ── EXPLORATION (Ages 7–10) ─────────────────────────────────── */
const EXPLORATION_ACTIVITIES = [
  {
    id: "story-time",
    slug: "story-time",
    title: "Story Time",
    blurb: "Longer stories, brave little heroes.",
    lucideIcon: BookOpen,
    type: "story",
    status: "live",
    route: "/kids-universe/polarstar/exploration/story-time",
    parentTip: "Older children love being read TO — they're not too old. Try it tonight.",
    storyAgeBucket: "explorers",
  },
  {
    id: "nature-quest",
    slug: "nature-quest",
    title: "Nature Quest",
    blurb: "Find one small wonder outside.",
    lucideIcon: Leaf,
    type: "challenge",
    status: "live",
    route: "/kids-universe/polarstar/exploration/nature-quest",
    parentTip: "The goal is noticing, not collecting. A glance can be a quest.",
    challenge: "Find one tiny thing in nature you have never noticed before.",
    actions: [
      "Touch the bark of three different trees. Which feels softest?",
      "Find a leaf with a hole in it — what could have made it?",
      "Count five different bird sounds without naming them.",
      "Pick up one small stone and look at it for one whole minute.",
    ],
  },
  {
    id: "world-cultures",
    slug: "world-cultures",
    title: "World Cultures",
    blurb: "Learn one small thing about a faraway place.",
    lucideIcon: Globe,
    type: "challenge",
    status: "live",
    route: "/kids-universe/polarstar/exploration/world-cultures",
    parentTip: "Pull out an atlas or a map. Let your child point to a country you've never been to. Wonder out loud together.",
    challenge: "Today's Cultures Quest — pick one and follow it for ten minutes.",
    actions: [
      "Pick a country you've never been to. Find it on a map together.",
      "Learn how to say \"hello\" and \"thank you\" in one new language.",
      "Find one folk tale from another country and read it together.",
      "Cook a small snack from a recipe you've never tried before.",
    ],
  },
  {
    id: "space-adventures",
    slug: "space-adventures",
    title: "Space Adventures",
    blurb: "Wonder above the night.",
    lucideIcon: Rocket,
    type: "challenge",
    status: "live",
    route: "/kids-universe/polarstar/exploration/space-adventures",
    parentTip: "Stargazing apps are wonderful, but a blanket and bare eyes work better.",
    challenge: "Tonight's Sky Quest — pick one and look up.",
    actions: [
      "Step outside after dark. Find the brightest star. Watch it for one whole minute.",
      "Draw the night sky exactly as you see it tonight — no internet help.",
      "Find out which planets are visible tonight. Try to spot one.",
      "Pick one constellation and learn its story. Tell it to someone tomorrow.",
    ],
  },
  {
    id: "amazing-animals",
    slug: "amazing-animals",
    title: "Amazing Animals",
    blurb: "Quiet creatures and how they live.",
    lucideIcon: PawPrint,
    type: "challenge",
    status: "live",
    route: "/kids-universe/polarstar/exploration/amazing-animals",
    parentTip: "Children love animal facts. Pick ONE animal a week and become small experts together.",
    challenge: "This Week's Animal — pick one and learn three things about it.",
    actions: [
      "Choose an animal you've never read about before. Look up three small facts.",
      "Watch a real animal for five minutes — a bird at a window, a pet, an insect outside.",
      "Draw an animal exactly as it really looks, not as cartoons show it.",
      "Find out how this animal sleeps. Most do it very differently than we do.",
    ],
  },
  {
    id: "science-lab",
    slug: "science-lab",
    title: "Science Lab",
    blurb: "Simple at-home experiments.",
    lucideIcon: Beaker,
    type: "challenge",
    status: "live",
    route: "/kids-universe/polarstar/exploration/science-lab",
    parentTip: "Curiosity counts more than results. Wrong answers are wonderful starts.",
    challenge: "Today's Small Experiment — pick one and try it carefully.",
    actions: [
      "Drop different small objects from the same height. Which lands first? Why?",
      "Mix one spoon of oil and one spoon of water. Watch what happens. Wait. Watch again.",
      "Put a piece of paper near a sunny window. Trace its shadow at three different times of day.",
      "Listen for the quietest sound in your home right now. Where does it come from?",
    ],
  },
  {
    id: "reflection-time",
    slug: "reflection-time",
    title: "Reflection Time",
    blurb: "How did today feel?",
    lucideIcon: Moon,
    type: "reflect",
    status: "live",
    route: "/kids-universe/polarstar/exploration/reflection-time",
    parentTip: "Ask once. Don't push. If the answer is 'fine', say 'that's allowed' and wait.",
    prompts: [
      "What is one thing that made you smile today?",
      "What is one thing you wish had gone differently?",
      "If today were a colour, what colour would it be?",
      "Who was kind to you today? Who were you kind to?",
    ],
  },
];

/* ── CREATION (Ages 11–13) ───────────────────────────────────── */
const CREATION_ACTIVITIES = [
  {
    id: "story-time",
    slug: "story-time",
    title: "Story Time",
    blurb: "Slower, deeper stories that leave room for imagination.",
    lucideIcon: BookOpen,
    type: "story",
    status: "live",
    route: "/kids-universe/polarstar/creation/story-time",
    parentTip: "Older children still love being read TO. Try it once — they will be surprised they liked it.",
    storyAgeBucket: "dreamweavers",
  },
  {
    id: "design-lab",
    slug: "design-lab",
    title: "Design Lab",
    blurb: "Plan something small and beautiful.",
    lucideIcon: PenLine,
    type: "project",
    status: "live",
    route: "/kids-universe/polarstar/creation/design-lab",
    parentTip: "Older children rarely need help — they need an audience. Be a calm one.",
    steps: [
      "Pick a small object you'd like to redesign — a chair, a lamp, a book cover.",
      "Sketch the version that exists today.",
      "Sketch the version you would prefer.",
      "Write three sentences about WHY your version is better.",
    ],
  },
  {
    id: "build-something",
    slug: "build-something",
    title: "Build Something",
    blurb: "Make a small thing with your hands.",
    lucideIcon: Hammer,
    type: "project",
    status: "live",
    route: "/kids-universe/polarstar/creation/build-something",
    parentTip: "The mess is part of the work. Set the time, not the outcome.",
    steps: [
      "Choose ONE material — paper, cardboard, clay, wood scraps.",
      "Set a 45-minute timer.",
      "Build anything. Don't stop to plan.",
      "When the timer ends, sit with it. Don't fix anything.",
    ],
  },
  {
    id: "code-studio",
    slug: "code-studio",
    title: "Code Studio",
    blurb: "Curiosity about how things work.",
    lucideIcon: Code2,
    type: "soon",
    status: "soon",
    route: "/kids-universe/polarstar/creation/code-studio",
    parentTip: "We will eventually link external safe tutorials here — until then, encourage paper-and-pencil 'thinking like a computer'.",
  },
  {
    id: "media-studio",
    slug: "media-studio",
    title: "Media Studio",
    blurb: "Quiet videos, calm storytelling.",
    lucideIcon: Film,
    type: "soon",
    status: "soon",
    route: "/kids-universe/polarstar/creation/media-studio",
    parentTip: "Older children making videos is normal. Watching them WITH them is the gift.",
  },
  {
    id: "share-project",
    slug: "share-project",
    title: "Share Project",
    blurb: "Read it to someone you love.",
    lucideIcon: Share2,
    type: "challenge",
    status: "live",
    route: "/kids-universe/polarstar/creation/share-project",
    parentTip: "Receiving a child's work is sacred. Don't critique. Just receive it.",
    challenge: "Today, share one finished thing with one person.",
    actions: [
      "Read one paragraph of your story to a sibling.",
      "Show one drawing to a parent — without explaining it.",
      "Send a photo of something you built to someone who loves you.",
      "Sit in the same room as someone while you finish one quiet thing.",
    ],
  },
];

/* ── PUBLIC API ─────────────────────────────────────────────── */
export const POLARSTAR_ROOMS = [
  {
    id: "discovery",
    ageLabel: "Ages 4–6",
    ageBucket: "little-dreamers",
    title: "Discovery World",
    subtitle: "For the youngest explorers.",
    description: "Simple stories, gentle play, drawing, calm moments and parent-child rituals.",
    palette: PAL.discovery,
    activities: DISCOVERY_ACTIVITIES,
  },
  {
    id: "exploration",
    ageLabel: "Ages 7–10",
    ageBucket: "explorers",
    title: "Exploration World",
    subtitle: "For curious hearts and growing imagination.",
    description: "Stories, nature quests, world wonders, gentle science and reflection.",
    palette: PAL.exploration,
    activities: EXPLORATION_ACTIVITIES,
  },
  {
    id: "creation",
    ageLabel: "Ages 11–13",
    ageBucket: "dreamweavers",
    title: "Creation Studio",
    subtitle: "For older children who want to create and express.",
    description: "Design, build, code, film, share — slow projects that mean something.",
    palette: PAL.creation,
    activities: CREATION_ACTIVITIES,
  },
];

export function getRoom(roomId) {
  return POLARSTAR_ROOMS.find((r) => r.id === roomId) || null;
}

export function getActivity(roomId, activitySlug) {
  const room = getRoom(roomId);
  if (!room) return null;
  const act = room.activities.find((a) => a.slug === activitySlug);
  if (!act) return null;
  /* For story activities, hydrate stories from the canonical source. */
  if (act.type === "story" && act.storyAgeBucket) {
    return { ...act, _stories: getStoriesByGroup(act.storyAgeBucket) };
  }
  return act;
}
