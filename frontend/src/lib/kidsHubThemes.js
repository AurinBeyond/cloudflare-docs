/**
 * kidsHubThemes.js — Single source of truth for the per-age visual
 * vocabulary of the Kids Hubs (`/kids-universe/:ageGroup/hub`).
 *
 * §KIDS-HUBS 2026-02-09 — Founder directive: the Hub must FEEL warm
 * and bright (the public Kids Universe page is the doorway; the Hub
 * is where the child lives once inside). Three age-tuned themes:
 *
 *   3–5  Little Dreamers  →  peach / cream — softest, gentlest
 *   6–8  Explorers        →  sage / cream  — warm but a touch braver
 *   9–12 Dreamweavers     →  mint / cream  — calm, slightly older,
 *                                            room to think
 *
 * Each theme intentionally stays in a CREAM background family so the
 * "void to light" promise is fulfilled regardless of age. Accent
 * colours shift, the cream stays.
 *
 * The legacy `/aurins-room/:ageGroup` voice route accepts the same
 * slugs (little-dreamers, explorers, dreamweavers), so the Hub can
 * link directly into Aurin's voice room without any slug remapping.
 */

export const KIDS_HUB_THEMES = {
  "little-dreamers": {
    slug: "little-dreamers",
    ageRange: "3–5",
    title: "Little Dreamers",
    tagline: "A soft place to be little.",
    aurinHero: "/assets/aurin/little-dreamers-hero.png",
    palette: {
      bg: "#FFF7EE",          // cream
      bgGradient: "linear-gradient(180deg, #FFF7EE 0%, #FCE9D5 100%)",
      cardBg: "#FFFFFF",
      cardBorder: "#F2D8BD",
      accent: "#E8A87C",       // soft peach-gold
      accent2: "#F4C28B",      // honey
      text: "#3D2A1E",         // warm dark-cocoa (kind, never harsh)
      textMuted: "#7A5E4A",
      handwritten: "#A65A2F",  // for the gratitude line
    },
    aurinFirstHello: "Hello, little one. I'm so happy you are here.",
    cards: {
      talk:  { title: "Talk with Aurin",   body: "A quiet hello, a small story, a soft moment together." },
      story: { title: "A bedtime story",   body: "Pick a tiny tale. Listen, or read along with a grown-up." },
      color: { title: "Color a picture",   body: "Find a quiet page, choose your colours, take your time." },
      stars: { title: "My Angel Stars",    body: "See the little stars you've earned for kind things." },
    },
    // Gratitude micro-prompt — shown only on 3–5 hub. Inspired by
    // Anna's reference image (Creative Fabrica gratitude journal).
    gratitudePrompt: "Today, one little thing that made me smile was…",
  },

  "explorers": {
    slug: "explorers",
    ageRange: "6–8",
    title: "Explorers",
    tagline: "A warm room for small adventures.",
    aurinHero: "/assets/aurin/explorers-hero.png",
    palette: {
      bg: "#FBF6EC",
      bgGradient: "linear-gradient(180deg, #FBF6EC 0%, #E8E6D2 100%)",
      cardBg: "#FFFFFF",
      cardBorder: "#D9D4BA",
      accent: "#7BA888",        // calm sage
      accent2: "#C19A6B",       // warm bronze
      text: "#2D3A2E",
      textMuted: "#5F6F5D",
      handwritten: "#5B7A56",
    },
    aurinFirstHello: "Hello, explorer. What did you discover today?",
    cards: {
      talk:  { title: "Talk with Aurin",   body: "Tell me about your day — the bright bits and the tricky bits." },
      story: { title: "Adventure stories", body: "Short stories about small heroes and quiet courage." },
      color: { title: "Color & create",    body: "Forest paths, winding maps, friendly faces — colour at your own pace." },
      stars: { title: "My Angel Stars",    body: "Brave things, kind things, helping things — count them here." },
    },
  },

  "dreamweavers": {
    slug: "dreamweavers",
    ageRange: "9–12",
    title: "Dreamweavers",
    tagline: "A calm room to think and wonder.",
    aurinHero: "/assets/aurin/dreamweavers-hero.png",
    palette: {
      bg: "#F4F8F2",
      bgGradient: "linear-gradient(180deg, #F4F8F2 0%, #DDE9DA 100%)",
      cardBg: "#FFFFFF",
      cardBorder: "#CADCC4",
      accent: "#6E8F6A",         // deeper mint
      accent2: "#B89B6E",        // muted gold
      text: "#23332A",
      textMuted: "#54665A",
      handwritten: "#3F5C46",
    },
    aurinFirstHello: "Hello. Take your time — I'm here to listen.",
    cards: {
      talk:  { title: "Talk with Aurin",   body: "Big thoughts, small ones, anything you'd like to say out loud." },
      story: { title: "Reflective stories", body: "Quiet tales for older minds. Inner-compass, dreamweaver stories." },
      color: { title: "Color & reflect",   body: "Intricate pages and gentle mandalas — slow, screen-free." },
      stars: { title: "My Angel Stars",    body: "Honesty, kindness, growth — small acts that matter." },
    },
  },
};

// Accept both modern slugs and legacy "3-5" / "6-8" / "9-12" numeric slugs.
const SLUG_ALIASES = {
  "3-5": "little-dreamers",
  "6-8": "explorers",
  "9-12": "dreamweavers",
};

export function resolveHubTheme(slug) {
  const canonical = SLUG_ALIASES[slug] || slug;
  return KIDS_HUB_THEMES[canonical] || KIDS_HUB_THEMES["explorers"];
}

export const ALL_HUB_THEMES = Object.values(KIDS_HUB_THEMES);
