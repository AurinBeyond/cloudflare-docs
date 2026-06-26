/**
 * roomConfigs.js — § ROOM SHELL 2026-02
 *
 * Verbatim founder spec for Grace + Alistair rooms (2026-02).
 * Used by <RoomShell /> to render the mockup layout: left sidebar +
 * centre hero + right panel + curator card.
 *
 * Vocabulary rule: no "house, holy, sacred, therapy, course,
 * module, lesson, certificate". Stay in plain English, founder's voice.
 */

export const GRACE_ROOM = {
  id: "grace",
  curator: "Grace",
  roomName: "The Hearth",
  purpose:
    "Grace is the quiet room of Matrix Aurin. This room is for emotional rest, presence, and being heard without pressure. Grace does not diagnose, fix, coach, or teach. Grace listens.",
  symbol: "Fireplace",
  symbolGlyph: "🜂",
  question: "Would you like to stay awhile?",

  /* Hero image — Nano Banana generated, no embedded UI text.
     Prompt source: /app/memory/NANO_BANANA_PROMPTS.md (founder spec).
     Generation script: /app/scripts/generate_grace_hero.py */
  heroImage: "/assets/rooms/grace-hearth.png",
  heroImageAlt:
    "The Hearth — a warm, intimate evening room with a fireplace, rain on the window, soft candlelight, an armchair, deep navy and amber tones.",

  /* Atomsi-spec palette: deep navy + warm amber + fireplace gold + cream. */
  mood: {
    time: "Late evening",
    bg: "#0f0f23",
    bgGradient:
      "radial-gradient(ellipse 90% 70% at 50% 60%, rgba(212, 165, 116, 0.18) 0%, rgba(15, 15, 35, 0.85) 50%, #0f0f23 90%)",
    accent: "#e8a838",
    accent2: "#d4a574",
    text: "#f5f0e8",
    textMute: "#a09080",
    panelBg: "rgba(10, 10, 26, 0.62)",
    panelBorder: "rgba(212, 165, 116, 0.22)",
    panelText: "#f5f0e8",
    panelTextMute: "#a09080",
    sidebarBg: "rgba(10, 10, 26, 0.92)",
  },

  hero: {
    title: "Welcome",
    subtitle: "The fire is still warm. Take a seat. Stay as long as you need.",
    primary: { label: "Start a Conversation", href: "/aurin?mode=grace" },
    quote:
      "You don't have to solve anything today. You can simply be.",
    quoteBy: "Grace",
  },

  /* §GRACE-UX-UNIFY 2026-02-13 — Sidebar vocabulary unified with the
   * /grace home page so a visitor sees the same six rooms whether
   * they land on /grace or /grace/room. Previous Hearth-themed labels
   * (Enter / Speak With Grace / Leave a Thought / Sit By The Fire /
   * Reflections) are retired. Each sidebar item now navigates to its
   * dedicated sub-room route instead of in-page hash anchors. */
  sidebar: [
    { id: "home",        label: "Home",     icon: "home",     href: "/grace" },
    { id: "speak",       label: "Speak",    icon: "mic",      href: "/grace/speak" },
    { id: "write",       label: "Write",    icon: "pen",      href: "/grace/write" },
    { id: "evening",     label: "Evening",  icon: "moon",     href: "/grace/evening" },
    { id: "messages",    label: "Messages", icon: "messages", href: "/grace/messages" },
    { id: "library",     label: "Library",  icon: "book",     href: "/grace/library" },
  ],

  rightPanel: {
    title: "How the Hearth works",
    steps: [
      {
        n: 1,
        label: "Enter",
        icon: "home",
        text: "Take a moment. Breathe in. This is your time and your room. There is no hurry here.",
      },
      {
        n: 2,
        label: "Speak",
        icon: "mic",
        text: "Tell Grace what is on your heart tonight. She listens without judgement and without interrupting.",
      },
      {
        n: 3,
        label: "Write",
        icon: "pen",
        text: "Writing helps thoughts settle. Write freely — nothing has to be said the right way.",
      },
      {
        n: 4,
        label: "Sit in silence",
        icon: "moon",
        text: "Sometimes the best thing is not to speak or write. Just sit, breathe, and be.",
      },
      {
        n: 5,
        label: "Reflections",
        icon: "messages",
        text: "Here you find your earlier conversations and notes. You can always come back to the thoughts you left.",
      },
    ],
    footnote: {
      title: "A quiet note",
      body: "Grace does not give advice unless you ask for it. Her role is to be present and to listen.",
    },
  },

  principle: {
    title: "The Hearth Principle",
    body: "Not everything needs a solution. Not everything needs an explanation. Some things simply need a place to be held.",
  },

  curatorCard: {
    name: "Grace",
    initial: "G",
    role: "Keeper of the Hearth · Listener · Witness · Companion",
    line: "The fire is here. The chair is waiting. Whenever you are ready.",
  },

  /* Notes Left By The Fire — Atomsi-spec'd reflection cards rendered
     directly below the hero band by RoomShell when present. */
  notes: {
    title: "Notes Left By The Fire",
    cards: [
      { id: 1, text: "Like letters never sent.",                                                  meta: "Left by the fire" },
      { id: 2, text: "Like thoughts that needed a place to rest.",                                meta: "A quiet evening" },
      { id: 3, text: "Some things are not problems to solve. They are truths to sit with.",       meta: "Before the rain stopped" },
    ],
  },
};

export const ALISTAIR_ROOM = {
  id: "alistair",
  curator: "Alistair",
  roomName: "The Life Laboratory",
  purpose:
    "Alistair is the research room of Matrix Aurin. This room helps you explore life patterns, old stories, beliefs, money narratives, and inner structures through observation, reflection, and small experiments.",
  symbol: "Desk",
  symbolGlyph: "✷",
  question: "What are you discovering?",

  mood: {
    time: "Daylight",
    bg: "#221c10",
    bgGradient:
      "radial-gradient(ellipse 95% 75% at 50% 55%, rgba(228, 178, 96, 0.22) 0%, rgba(58, 42, 24, 0.6) 45%, #221c10 90%)",
    accent: "#d6a560",
    accent2: "#7b8b4a",
    text: "#f3e7cc",
    textMute: "#b0987a",
    panelBg: "rgba(245, 235, 213, 0.96)",
    panelBorder: "rgba(196, 156, 80, 0.32)",
    panelText: "#3d2e15",
    panelTextMute: "#7a6a48",
    sidebarBg: "rgba(28, 22, 14, 0.78)",
  },

  hero: {
    title: "The Life Laboratory",
    subtitle:
      "A place where you study your life the way a scientist studies a living phenomenon. We do not teach. We observe together.",
    primary: { label: "Choose an Inquiry", href: "#inquiries" },
    quote:
      "I will not give you answers. I will help you notice on your own.",
    quoteBy: "Alistair",
  },

  sidebar: [
    { id: "start",          label: "Start Here",              icon: "home",      href: "#alistair-intro" },
    { id: "money-tree",     label: "The Money Tree Within",   icon: "tree",      href: "#money-tree" },
    { id: "old-stories",    label: "Old Stories",             icon: "book",      href: "#old-stories" },
    { id: "body-knows",     label: "The Body Knows First",    icon: "user",      href: "#body-knows" },
    { id: "all-inquiries",  label: "All Inquiries",           icon: "grid",      href: "#inquiries" },
  ],

  rightPanel: {
    title: "How to begin",
    steps: [
      {
        n: 1,
        label: "Understanding",
        icon: "bulb",
        text:
          "A clear and simple overview of the topic. What it is, how it works, why people experience it.",
      },
      {
        n: 2,
        label: "Noticing",
        icon: "eye",
        text:
          "Look in the mirror of your own life. Where does this pattern appear? When does it activate? What do you see?",
      },
      {
        n: 3,
        label: "Experimenting",
        icon: "flask",
        text:
          "Try something differently. Make one small experiment. Attention, curiosity, and honesty are your only tools.",
      },
    ],
    footnote: {
      title: "Our principle",
      body: "We do not teach. We observe together. There are no right or wrong answers — only your experience and your discoveries.",
    },
  },

  /* The three opening inquiries — rendered as cards below the hero */
  inquiries: [
    {
      id: "money-tree",
      title: "The Money Tree Within",
      subtitle:
        "What stories about money do we carry inside us? Discover the beliefs that shaped your relationship with money.",
      cta: "Begin the inquiry",
      glyph: "tree",
    },
    {
      id: "old-stories",
      title: "Old Stories",
      subtitle:
        "Am I living my life today, or a story someone once told me? Notice and rewrite the lines you have inherited.",
      cta: "Begin the inquiry",
      glyph: "book",
    },
    {
      id: "body-knows",
      title: "The Body Knows First",
      subtitle:
        "The body notices change before the mind understands. Learn to hear the language of your own body.",
      cta: "Begin the inquiry",
      glyph: "user",
    },
  ],

  principle: {
    title: "The Laboratory Method",
    body:
      "We do not begin with conclusions. We begin with observation. First we understand. Then we notice. Then we test one small experiment in real life.",
  },

  curatorCard: {
    name: "Alistair",
    initial: "A",
    role: "Researcher · Pattern Finder · Companion",
    line: "Let us see what is really happening together.",
  },
};

export function getRoomConfig(id) {
  if (id === "grace") return GRACE_ROOM;
  if (id === "alistair") return ALISTAIR_ROOM;
  return null;
}
