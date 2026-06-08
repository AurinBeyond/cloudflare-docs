/**
 * KidsRooms.jsx — §KIDS-UNIVERSE-PHASE-2-3-4 2026-02-27
 *
 * Four Mode B "Room" components for the Kids Universe Journey, plus
 * the Family Album floating action button. Each room is rendered
 * INSIDE KidsUniverseJourney as a state-swap (NOT a route change).
 *
 * - StorytellingSanctumRoom — free demo text + premium voice CTA
 * - ReflectionSpaceRoom     — premium emotion check-in
 * - StarChamberRoom         — premium 6-card screen-free promise
 * - SecretAlbumRoom         — premium photo upload with parental affirmation
 * - FamilyAlbumFAB          — floating drawer with all uploaded photos
 *
 * 100% English UI.
 */

import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, X, Check, Upload, Mic, Image as ImageIcon, Heart } from "lucide-react";
import { api } from "@/lib/api";

const SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, serif';
const AURIN_PORTRAIT = "/avatars/aurin-inner-guide.png";

// Zone → Aurin's Room age slug for the existing voice route.
const ZONE_TO_AGE_SLUG = {
  discovery: "little-dreamers",
  exploration: "explorers",
  creation: "dreamweavers",
};

const SCREEN_FREE_PROMISES = [
  { id: "hike", icon: "⛺", label: "Go on a hike together" },
  { id: "fishing", icon: "🎣", label: "Go fishing with mom or dad" },
  { id: "cabin", icon: "🪵", label: "Build a forest cabin" },
  { id: "book", icon: "📖", label: "Read a book aloud at bedtime" },
  { id: "foraging", icon: "🌲", label: "Pick mushrooms or berries" },
  { id: "painting", icon: "🎨", label: "Paint outdoors together" },
];

// §PHASE-5-ADVENTURE-VAULT — Per-age "Adventure Sparks": real-world,
// screen-free DIY ideas Aurin whispers AFTER the tale. The child does
// these OFFLINE; the photo lands in the Secret Album. This closes the
// loop without adding a digital game.
const ADVENTURE_SPARKS = {
  discovery: [
    { icon: "🍂", title: "Leaf Collage", desc: "Collect five leaves of five colors. Arrange them into a small forest face." },
    { icon: "🪨", title: "Stone Friends", desc: "Find three river stones. Paint a tiny face on each — they become your quiet companions." },
    { icon: "🖐️", title: "Finger Painting Sky", desc: "Use only fingers — no brushes. Paint the sky you saw today." },
    { icon: "🌲", title: "Pinecone Family", desc: "Gather three pinecones. Wrap them in wool or yarn. Give each one a name." },
  ],
  exploration: [
    { icon: "🗺️", title: "Secret Forest Map", desc: "Draw a map of the woods near you — with one hidden treasure marked only you can find." },
    { icon: "💎", title: "Crystal Hideout", desc: "Build a small hideout under a tree. Hide one 'crystal' (a smooth stone) inside it. Bring a friend." },
    { icon: "🔍", title: "Nature's Five Riddle", desc: "Find five different leaves, five different stones, five different feathers. Arrange them as a riddle for a sibling." },
    { icon: "📔", title: "Field Notebook", desc: "Make a tiny notebook from folded paper. Write down three things only YOU noticed today." },
  ],
  creation: [
    { icon: "📐", title: "Dream Room Blueprint", desc: "Draw — by hand, no apps — the room you would build if everything were possible. Label the small details." },
    { icon: "📓", title: "Hand-bound Journal", desc: "Fold and stitch your own small journal. The first page is the only one that has rules: write what you actually believe." },
    { icon: "🏛️", title: "Build Something Real", desc: "Wood, cardboard, clay — choose one. Build something with your hands that holds shape and weight." },
    { icon: "📸", title: "Photo Essay: One Hour", desc: "Take exactly seven photos in one hour outside. No filters, no edits. Tell a quiet story with them." },
  ],
};

// §PHASE-5 — per-zone tonal copy. Storytelling, Reflection, Star and
// Album rooms all read these. The three age groups speak with
// distinctly different vocabularies even though the structure is the
// same.
const ZONE_COPY = {
  discovery: {
    // 3-6 — sensory wonder, simplest words
    storytellingEyebrow: "✦ A first whisper from Aurin",
    storytellingHeadline: "Welcome, little star.\nI am Aurin.",
    storytellingBody:
      "I will walk with you through small wonders today. Close your eyes if you like — and listen, when the tale begins.",
    storytellingPremium:
      "Today's tale is gentle and short. Tap below to open the voice chamber — Aurin will tell you a small, soft story.",
    storytellingLocked:
      "The voice of Aurin sleeps until your grown-up opens the path. Every stone holds its own tale, told slowly, without a screen.",
    reflectionEyebrow: "✦ A tiny mirror",
    reflectionHeadline: "How do you feel\nright now?",
    reflectionBody:
      "Only one word, said softly. Aurin will hear it and hold it gently.",
    reflectionPlaceholder: "sleepy · happy · sad · brave…",
    reflectionConfirm:
      "Aurin hears you. Take a slow breath. The air outside knows this word too.",
    starEyebrow: "✦ A small promise",
    starHeadlinePick: "Choose one little adventure.",
    starHeadlineConfirmed: "The little star is on its way!",
    starBody:
      "Pick something you can do with a grown-up this week. No screens, just real fun.",
    starConfirmBody:
      "Your grown-up gets a soft reminder in two days. When you finish the adventure together, return and the new star will shine.",
    albumEyebrow: "✦ One special picture",
    albumHeadlinePick: "Save one picture\nfrom the adventure.",
    albumHeadlineSaved: "The picture is safe now.",
    albumBody:
      "Pick just one photo of your trip — by the river, in the woods, anywhere. Only your family will see it.",
    albumSavedBody:
      "This picture now glows on your path. Tomorrow another small moment may join it.",
  },
  exploration: {
    // 7-10 — mid-stage strategic intuition, friendly riddle-tone
    storytellingEyebrow: "✦ A whisper from Aurin",
    storytellingHeadline: "Hello, explorer.\nI am Aurin.",
    storytellingBody:
      "Some stories are riddles, hidden in plain sound. Today's tale carries a small clue — keep your ears open, your eyes closed.",
    storytellingPremium:
      "Today's tale waits in the crystal cave. Tap below — Aurin will tell you a story with a small puzzle inside.",
    storytellingLocked:
      "The voice of Aurin sleeps until a grown-up opens the Sanctuary. Every stone holds its own riddle-tale, told without a screen.",
    reflectionEyebrow: "✦ A signal from inside",
    reflectionHeadline: "What is the\nweather of you today?",
    reflectionBody:
      "One word is enough. Bright? Cloudy? Restless? Aurin will reflect it back without judgement.",
    reflectionPlaceholder: "curious · cloudy · restless · steady…",
    reflectionConfirm:
      "Aurin hears you. Naming it is half the work. Step outside for a moment if you can.",
    starEyebrow: "✦ A real-world quest",
    starHeadlinePick: "Pick the next outdoor quest.",
    starHeadlineConfirmed: "The star is set in motion.",
    starBody:
      "Each one is a small adventure with someone you trust — screen-free, real-world, and the star unlocks when you return and mark it done.",
    starConfirmBody:
      "Your parent receives a gentle reminder in 48 hours. When the quest is done together, come back and mark the moment — a new star will appear.",
    albumEyebrow: "✦ A field-note memory",
    albumHeadlinePick: "One picture from\nthe quest.",
    albumHeadlineSaved: "The memory is filed.",
    albumBody:
      "Like an explorer's field-note: choose one photo from the real-world adventure. Caption it if you want. Private to your family.",
    albumSavedBody:
      "This memory now glows on the Path. Tomorrow another quiet adventure may join it.",
  },
  creation: {
    // 11-13 — peak agency, designing & building, near-adult tone
    storytellingEyebrow: "✦ A signal from Aurin",
    storytellingHeadline: "Welcome.\nI am Aurin.",
    storytellingBody:
      "Some tales are not told to you — they are built with you. Today's story is a quiet blueprint. Listen, and notice what part of it is yours.",
    storytellingPremium:
      "Today's tale waits in the canopy. Open the voice chamber — Aurin will tell you a story that asks something of you in return.",
    storytellingLocked:
      "Aurin's voice stays still until your account opens the Sanctuary. Every stone holds its own architecture — a tale, a reflection, a star, a memory.",
    reflectionEyebrow: "✦ A quiet calibration",
    reflectionHeadline: "What is the\nshape of today?",
    reflectionBody:
      "One word, honest. Aurin won't judge it — and neither should you. Naming the shape is how it loses its grip.",
    reflectionPlaceholder: "sharp · quiet · uncertain · clear…",
    reflectionConfirm:
      "Aurin hears you. The shape has been named. Step away from any screen for a few minutes if you can — the day will rearrange itself.",
    starEyebrow: "✦ A real-world build",
    starHeadlinePick: "Choose your next real build.",
    starHeadlineConfirmed: "The blueprint is filed.",
    starBody:
      "Real things are built with real hours. Pick one screen-free build you can complete with someone who matters — and tell Aurin when it's done.",
    starConfirmBody:
      "A gentle reminder will arrive in 48 hours. When the build is complete, return here and mark it done — the next stone reveals itself.",
    albumEyebrow: "✦ A single, undeniable proof",
    albumHeadlinePick: "One photograph,\nfor the archive.",
    albumHeadlineSaved: "Filed in your private archive.",
    albumBody:
      "Choose one image. The real one. It belongs to your family alone — never trained into any public model, never resold, never displayed.",
    albumSavedBody:
      "Archived. The path now carries a small, private proof that the moment was real.",
  },
};

// ──────────────────────────────────────────────────────────────────
// Shared layout shell for every room
// ──────────────────────────────────────────────────────────────────
function RoomShell({ zone, label, onBack, children, testid }) {
  return (
    <div
      data-testid={testid}
      className="min-h-screen w-full"
      style={{
        background: `linear-gradient(180deg, ${zone.bgFrom} 0%, ${zone.bgTo} 100%)`,
        color: "#e8e1d5",
        fontFamily: SERIF,
      }}
    >
      <header className="max-w-[1180px] mx-auto px-6 sm:px-10 py-6 flex items-center justify-between border-b border-[rgba(196,164,107,0.08)]">
        <button
          type="button"
          onClick={onBack}
          data-testid="kids-room-back"
          className="flex items-center gap-2 text-[11px] tracking-[0.32em] uppercase text-[#bcb4a3] hover:text-[#e8e1d5] transition-colors"
        >
          <ArrowLeft size={14} /> Back to the Path
        </button>
        <span
          className="text-[10.5px] tracking-[0.28em] uppercase italic"
          style={{ color: zone.accent }}
        >
          {label}
        </span>
      </header>
      <main className="max-w-[1180px] mx-auto px-6 sm:px-10 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Aurin portrait — always on the left */}
        <div className="lg:col-span-5 flex justify-center relative lg:sticky lg:top-12">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[2rem] blur-3xl opacity-50"
            style={{ background: zone.accentGlow }}
          />
          <img
            src={AURIN_PORTRAIT}
            alt="Aurin, your guide"
            data-testid="kids-room-aurin-portrait"
            className="relative z-10 w-full max-w-[360px] aspect-square object-cover rounded-[1.5rem]"
            style={{
              border: "1px solid rgba(232,225,213,0.12)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
            }}
          />
        </div>
        <div className="lg:col-span-7 space-y-7">{children}</div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// 1. Storytelling Sanctum — text demo for free, voice CTA for premium
// ──────────────────────────────────────────────────────────────────
export function StorytellingSanctumRoom({ zone, isPremium, onBack, onStoneUnlocked, onOpenAlbum }) {
  const ageSlug = ZONE_TO_AGE_SLUG[zone.slug] || "little-dreamers";
  const copy = ZONE_COPY[zone.slug] || ZONE_COPY.discovery;
  const sparks = ADVENTURE_SPARKS[zone.slug] || ADVENTURE_SPARKS.discovery;

  // Mark stone unlocked on first open (premium users)
  useEffect(() => {
    if (!isPremium) return;
    api
      .post("/kids-journey/unlock-stone", { zone: zone.slug, node_id: "node-1" })
      .then(() => onStoneUnlocked && onStoneUnlocked("node-1"))
      .catch(() => {
        /* 429 = already unlocked today, ignore */
      });
  }, [isPremium, zone.slug, onStoneUnlocked]);

  return (
    <RoomShell
      zone={zone}
      label="Storytelling Sanctum"
      onBack={onBack}
      testid="kids-room-storytelling"
    >
      <p
        className="text-[11px] tracking-[0.42em] uppercase"
        style={{ color: zone.accent }}
      >
        {copy.storytellingEyebrow}
      </p>
      <h2
        className="text-[34px] sm:text-[42px] leading-[1.2] font-light italic whitespace-pre-line"
        style={{ color: "#e8e1d5" }}
      >
        {copy.storytellingHeadline}
      </h2>
      <p className="text-[17px] leading-[1.85] text-[#bcb4a3] font-light">
        {copy.storytellingBody}
      </p>

      <div
        className="rounded-[1.25rem] p-7 mt-4"
        style={{
          background: "rgba(255,253,249,0.04)",
          border: "1px solid rgba(196,164,107,0.16)",
        }}
      >
        {isPremium ? (
          <>
            <p
              className="text-[13px] italic text-[#a59f93] leading-[1.85] mb-5"
              style={{ fontFamily: SERIF }}
            >
              {copy.storytellingPremium}
            </p>
            <Link
              to={`/aurins-room/${ageSlug}`}
              data-testid="kids-room-storytelling-voice-cta"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-[12px] tracking-[0.22em] uppercase font-medium transition-all"
              style={{
                background: "#c4a46b",
                color: "#0b0a08",
                fontFamily: SERIF,
                boxShadow: `0 0 24px ${zone.accentGlow}`,
              }}
            >
              🎙️ Begin Today's Tale
            </Link>
          </>
        ) : (
          <>
            <p
              className="text-[13px] italic text-[#a59f93] leading-[1.85] mb-5"
              style={{ fontFamily: SERIF }}
            >
              {copy.storytellingLocked}
            </p>
            <Link
              to="/pricing"
              data-testid="kids-room-storytelling-pricing-cta"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full text-[12px] tracking-[0.22em] uppercase font-medium transition-all"
              style={{
                background: "#c4a46b",
                color: "#0b0a08",
                fontFamily: SERIF,
                boxShadow: "0 0 24px rgba(196,164,107,0.32)",
              }}
            >
              ✦ Open Aurin's Voice
            </Link>
          </>
        )}
      </div>

      {/* §PHASE-5-ADVENTURE-VAULT — Adventure Sparks panel.
          Real-world, screen-free DIY ideas Aurin whispers AFTER the tale.
          The child does these offline; the resulting photo lands in the
          Secret Album. Always visible — invites everyone to step away
          from the screen. */}
      <section
        className="mt-12 pt-10 border-t"
        style={{ borderColor: "rgba(196,164,107,0.10)" }}
        data-testid="kids-room-adventure-sparks"
      >
        <p
          className="text-[11px] tracking-[0.42em] uppercase mb-4"
          style={{ color: zone.accent, fontFamily: SERIF }}
        >
          ✦ Adventure Sparks
        </p>
        <h3
          className="text-[24px] sm:text-[28px] leading-[1.25] font-light italic mb-4"
          style={{ color: "#e8e1d5", fontFamily: SERIF }}
        >
          When the tale ends, the world begins.
        </h3>
        <p className="text-[15px] leading-[1.85] text-[#bcb4a3] font-light mb-7 max-w-[52ch]">
          A few quiet ideas to take with you into the real day. No screens —
          just hands, paper, leaves, light. Bring back one photo of what you
          made, and it will join the Secret Album.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sparks.map((s, i) => (
            <div
              key={i}
              data-testid={`kids-room-spark-${i}`}
              className="flex items-start gap-3 p-4 rounded-2xl transition-all duration-300"
              style={{
                background: "rgba(255,253,249,0.03)",
                border: "1px solid rgba(196,164,107,0.14)",
              }}
            >
              <span className="text-[22px] leading-none mt-0.5">{s.icon}</span>
              <div>
                <p
                  className="text-[13.5px] tracking-[0.06em] mb-1"
                  style={{ color: "#e8e1d5", fontFamily: SERIF }}
                >
                  {s.title}
                </p>
                <p className="text-[12.5px] leading-[1.7] text-[#a59f93] font-light italic">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {isPremium && onOpenAlbum && (
          <button
            type="button"
            onClick={onOpenAlbum}
            data-testid="kids-room-sparks-to-album"
            className="mt-7 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[11px] tracking-[0.28em] uppercase font-medium transition-all"
            style={{
              background: "transparent",
              color: zone.accent,
              border: `1px solid ${zone.accentSoft}`,
              fontFamily: SERIF,
            }}
          >
            Save your creation to the Secret Album →
          </button>
        )}
      </section>
    </RoomShell>
  );
}

// ──────────────────────────────────────────────────────────────────
// 2. Reflection Space — text-based emotion check-in (V1)
// ──────────────────────────────────────────────────────────────────
export function ReflectionSpaceRoom({ zone, onBack, onStoneUnlocked }) {
  const copy = ZONE_COPY[zone.slug] || ZONE_COPY.discovery;
  const [word, setWord] = useState("");
  const [logged, setLogged] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async () => {
    if (!word.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await api.post("/kids-journey/emotion-checkin", {
        zone: zone.slug,
        node_id: "node-2",
        emotion_word: word.trim(),
      });
      setLogged(word.trim());
      try {
        await api.post("/kids-journey/unlock-stone", {
          zone: zone.slug,
          node_id: "node-2",
        });
        onStoneUnlocked && onStoneUnlocked("node-2");
      } catch {
        /* ignore 429 */
      }
    } catch (e) {
      setErr(
        e?.response?.data?.detail ||
          "Something stayed quiet. Please try once more."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <RoomShell
      zone={zone}
      label="Reflection Space"
      onBack={onBack}
      testid="kids-room-reflection"
    >
      <p
        className="text-[11px] tracking-[0.42em] uppercase"
        style={{ color: zone.accent }}
      >
        {copy.reflectionEyebrow}
      </p>
      <h2
        className="text-[34px] sm:text-[42px] leading-[1.2] font-light italic whitespace-pre-line"
        style={{ color: "#e8e1d5" }}
      >
        {copy.reflectionHeadline}
      </h2>
      <p className="text-[17px] leading-[1.85] text-[#bcb4a3] font-light">
        {copy.reflectionBody}
      </p>

      {logged ? (
        <div
          className="rounded-[1.25rem] p-7 mt-4 text-center"
          style={{
            background: "rgba(255,253,249,0.04)",
            border: `1px solid ${zone.accentSoft}`,
          }}
          data-testid="kids-room-reflection-logged"
        >
          <Heart
            size={22}
            color={zone.accent}
            className="mx-auto mb-4"
            strokeWidth={1.5}
          />
          <p
            className="text-[18px] italic font-light"
            style={{ color: "#e8e1d5", fontFamily: SERIF }}
          >
            "{logged}"
          </p>
          <p className="text-[13px] italic text-[#a59f93] mt-4 leading-[1.85]">
            {copy.reflectionConfirm}
          </p>
        </div>
      ) : (
        <div
          className="rounded-[1.25rem] p-7 mt-4"
          style={{
            background: "rgba(255,253,249,0.04)",
            border: "1px solid rgba(196,164,107,0.16)",
          }}
        >
          <label
            htmlFor="emotion-input"
            className="block text-[11px] tracking-[0.32em] uppercase text-[#c4a46b] mb-4"
            style={{ fontFamily: SERIF }}
          >
            One word, gently
          </label>
          <input
            id="emotion-input"
            data-testid="kids-room-reflection-input"
            type="text"
            maxLength={64}
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder={copy.reflectionPlaceholder}
            className="w-full bg-transparent border-b py-3 text-[20px] italic text-[#e8e1d5] placeholder-[#5a554c] focus:outline-none focus:border-[#c4a46b] transition-colors"
            style={{
              fontFamily: SERIF,
              borderColor: "rgba(196,164,107,0.32)",
            }}
          />
          {err && (
            <p
              className="mt-4 text-[12px] italic text-[#c4a46b]"
              data-testid="kids-room-reflection-error"
            >
              {err}
            </p>
          )}
          <button
            type="button"
            disabled={!word.trim() || busy}
            onClick={submit}
            data-testid="kids-room-reflection-submit"
            className="mt-6 inline-flex items-center gap-2 px-7 py-3 rounded-full text-[12px] tracking-[0.22em] uppercase font-medium transition-all disabled:opacity-40"
            style={{
              background: "#c4a46b",
              color: "#0b0a08",
              fontFamily: SERIF,
              boxShadow: `0 0 22px ${zone.accentGlow}`,
            }}
          >
            <Mic size={14} /> {busy ? "Holding…" : "Share with Aurin"}
          </button>
        </div>
      )}
    </RoomShell>
  );
}

// ──────────────────────────────────────────────────────────────────
// 3. Aurin's Star Chamber — 6 screen-free promise cards
// ──────────────────────────────────────────────────────────────────
export function StarChamberRoom({ zone, onBack, onStoneUnlocked }) {
  const [picked, setPicked] = useState(null);
  const [committed, setCommitted] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const commit = async () => {
    if (!picked) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await api.post("/kids-journey/star/commit", {
        zone: zone.slug,
        node_id: "node-3",
        promise: picked,
      });
      setCommitted(res.data);
      try {
        await api.post("/kids-journey/unlock-stone", {
          zone: zone.slug,
          node_id: "node-3",
        });
        onStoneUnlocked && onStoneUnlocked("node-3");
      } catch {
        /* ignore */
      }
    } catch (e) {
      setErr(
        e?.response?.data?.detail ||
          "The chamber stayed quiet. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <RoomShell
      zone={zone}
      label="Aurin's Star Chamber"
      onBack={onBack}
      testid="kids-room-star"
    >
      <p
        className="text-[11px] tracking-[0.42em] uppercase"
        style={{ color: zone.accent }}
      >
        {(ZONE_COPY[zone.slug] || ZONE_COPY.discovery).starEyebrow}
      </p>
      <h2
        className="text-[34px] sm:text-[42px] leading-[1.2] font-light italic"
        style={{ color: "#e8e1d5" }}
      >
        {committed
          ? (ZONE_COPY[zone.slug] || ZONE_COPY.discovery).starHeadlineConfirmed
          : (ZONE_COPY[zone.slug] || ZONE_COPY.discovery).starHeadlinePick}
      </h2>

      {committed ? (
        <div
          className="rounded-[1.25rem] p-7"
          style={{
            background: "rgba(255,253,249,0.04)",
            border: `1px solid ${zone.accentSoft}`,
          }}
          data-testid="kids-room-star-confirmed"
        >
          <div
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-5"
            style={{
              border: `1px solid ${zone.accentSoft}`,
              color: zone.accent,
            }}
          >
            <span style={{ fontSize: "18px" }}>
              {SCREEN_FREE_PROMISES.find((p) => p.id === committed.promise)?.icon ||
                "✦"}
            </span>
            <span className="text-[12px] tracking-[0.18em] uppercase">
              {committed.promise_label}
            </span>
          </div>
          <p className="text-[16px] leading-[1.85] text-[#bcb4a3] font-light mb-4">
            {(ZONE_COPY[zone.slug] || ZONE_COPY.discovery).starConfirmBody}
          </p>
          <Link
            to="/parent-portal/stars"
            data-testid="kids-room-star-portal-link"
            className="text-[11px] tracking-[0.32em] uppercase"
            style={{ color: "#c4a46b" }}
          >
            View all promises →
          </Link>
        </div>
      ) : (
        <>
          <p className="text-[16px] leading-[1.85] text-[#bcb4a3] font-light">
            {(ZONE_COPY[zone.slug] || ZONE_COPY.discovery).starBody}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {SCREEN_FREE_PROMISES.map((p) => (
              <button
                key={p.id}
                type="button"
                data-testid={`kids-room-star-card-${p.id}`}
                onClick={() => setPicked(p.id)}
                className="text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-3"
                style={{
                  background:
                    picked === p.id
                      ? "rgba(196,164,107,0.10)"
                      : "rgba(255,253,249,0.03)",
                  border: `1px solid ${
                    picked === p.id ? zone.accentSoft : "rgba(196,164,107,0.14)"
                  }`,
                  boxShadow:
                    picked === p.id
                      ? `0 0 20px ${zone.accentGlow}`
                      : "none",
                }}
              >
                <span className="text-[22px]">{p.icon}</span>
                <span className="text-[14px] text-[#e8e1d5] font-light">
                  {p.label}
                </span>
                {picked === p.id && (
                  <Check size={16} color={zone.accent} className="ml-auto" />
                )}
              </button>
            ))}
          </div>

          {err && (
            <p className="text-[12px] italic text-[#c4a46b]" data-testid="kids-room-star-error">
              {err}
            </p>
          )}

          <button
            type="button"
            disabled={!picked || busy}
            onClick={commit}
            data-testid="kids-room-star-commit"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-[12px] tracking-[0.22em] uppercase font-medium transition-all disabled:opacity-40"
            style={{
              background: "#c4a46b",
              color: "#0b0a08",
              fontFamily: SERIF,
              boxShadow: `0 0 22px ${zone.accentGlow}`,
            }}
          >
            ✦ Give Aurin My Promise
          </button>
        </>
      )}
    </RoomShell>
  );
}

// ──────────────────────────────────────────────────────────────────
// 4. Secret Album — photo upload with parental affirmation
// ──────────────────────────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function SecretAlbumRoom({ zone, onBack, onStoneUnlocked }) {
  const [photoData, setPhotoData] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [affirmed, setAffirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState(null);
  const fileRef = useRef(null);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErr("Please choose an image (jpg or png).");
      return;
    }
    if (f.size > 6 * 1024 * 1024) {
      setErr("Image too large. Max 6 MB.");
      return;
    }
    setErr(null);
    const data = await fileToBase64(f);
    setPhotoData(data);
    setPreview(data);
  };

  const submit = async () => {
    if (!photoData || !affirmed) return;
    setBusy(true);
    setErr(null);
    try {
      await api.post("/kids-journey/album/upload", {
        zone: zone.slug,
        node_id: "node-4",
        photo_base64: photoData,
        caption: caption.trim(),
        parental_affirmation: true,
      });
      setSaved(true);
      try {
        await api.post("/kids-journey/unlock-stone", {
          zone: zone.slug,
          node_id: "node-4",
        });
        onStoneUnlocked && onStoneUnlocked("node-4");
      } catch {
        /* ignore */
      }
    } catch (e) {
      setErr(
        e?.response?.data?.detail ||
          "The vault stayed closed. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <RoomShell
      zone={zone}
      label="The Secret Album"
      onBack={onBack}
      testid="kids-room-album"
    >
      <p
        className="text-[11px] tracking-[0.42em] uppercase"
        style={{ color: zone.accent }}
      >
        {(ZONE_COPY[zone.slug] || ZONE_COPY.discovery).albumEyebrow}
      </p>
      <h2
        className="text-[34px] sm:text-[42px] leading-[1.2] font-light italic whitespace-pre-line"
        style={{ color: "#e8e1d5" }}
      >
        {saved
          ? (ZONE_COPY[zone.slug] || ZONE_COPY.discovery).albumHeadlineSaved
          : (ZONE_COPY[zone.slug] || ZONE_COPY.discovery).albumHeadlinePick}
      </h2>

      {saved ? (
        <div
          className="rounded-[1.25rem] p-7"
          style={{
            background: "rgba(255,253,249,0.04)",
            border: `1px solid ${zone.accentSoft}`,
          }}
          data-testid="kids-room-album-saved"
        >
          {preview && (
            <img
              src={preview}
              alt="Saved memory"
              className="w-full max-w-[280px] mx-auto rounded-[1rem] mb-4"
              style={{
                border: `1px solid ${zone.accentSoft}`,
                boxShadow: `0 0 24px ${zone.accentGlow}`,
              }}
            />
          )}
          <p className="text-[15px] leading-[1.85] text-[#bcb4a3] font-light text-center italic">
            {(ZONE_COPY[zone.slug] || ZONE_COPY.discovery).albumSavedBody}
          </p>
        </div>
      ) : (
        <>
          <p className="text-[16px] leading-[1.85] text-[#bcb4a3] font-light">
            {(ZONE_COPY[zone.slug] || ZONE_COPY.discovery).albumBody}
          </p>

          <div
            className="rounded-[1.25rem] p-7 mt-2"
            style={{
              background: "rgba(255,253,249,0.04)",
              border: "1px solid rgba(196,164,107,0.16)",
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full max-w-[280px] mx-auto rounded-[1rem] mb-4"
                style={{
                  border: `1px solid ${zone.accentSoft}`,
                  boxShadow: `0 0 18px ${zone.accentGlow}`,
                }}
              />
            ) : (
              <div
                className="w-full h-[180px] rounded-[1rem] mb-4 flex items-center justify-center"
                style={{
                  background: "rgba(196,164,107,0.04)",
                  border: "1px dashed rgba(196,164,107,0.32)",
                }}
              >
                <ImageIcon size={32} color="#7a7468" strokeWidth={1.2} />
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFile}
              className="hidden"
              data-testid="kids-room-album-file-input"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              data-testid="kids-room-album-choose"
              className="w-full px-5 py-3 rounded-full text-[12px] tracking-[0.22em] uppercase font-medium transition-all flex items-center justify-center gap-2"
              style={{
                background: "rgba(196,164,107,0.10)",
                color: "#c4a46b",
                border: "1px solid rgba(196,164,107,0.32)",
                fontFamily: SERIF,
              }}
            >
              <Upload size={14} />
              {photoData ? "Choose another photo" : "Choose Adventure Photo"}
            </button>

            <textarea
              value={caption}
              maxLength={200}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a short memory (optional)"
              rows={2}
              data-testid="kids-room-album-caption"
              className="mt-5 w-full bg-transparent border rounded-xl px-4 py-3 text-[14px] italic text-[#e8e1d5] placeholder-[#5a554c] focus:outline-none focus:border-[#c4a46b] transition-colors"
              style={{
                fontFamily: SERIF,
                borderColor: "rgba(196,164,107,0.18)",
              }}
            />

            <label
              className="mt-5 flex items-start gap-3 cursor-pointer text-[12.5px] leading-[1.7] text-[#bcb4a3]"
              data-testid="kids-room-album-affirm-label"
            >
              <input
                type="checkbox"
                checked={affirmed}
                onChange={(e) => setAffirmed(e.target.checked)}
                data-testid="kids-room-album-affirm-checkbox"
                className="mt-1 accent-[#c4a46b]"
              />
              <span>
                I am the parent. I took this photo, and I consent to keep it
                in our private family vault.
              </span>
            </label>

            {err && (
              <p
                className="mt-4 text-[12px] italic text-[#c4a46b]"
                data-testid="kids-room-album-error"
              >
                {err}
              </p>
            )}

            <button
              type="button"
              disabled={!photoData || !affirmed || busy}
              onClick={submit}
              data-testid="kids-room-album-save"
              className="mt-5 w-full inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-[12px] tracking-[0.22em] uppercase font-medium transition-all disabled:opacity-40"
              style={{
                background: "#c4a46b",
                color: "#0b0a08",
                fontFamily: SERIF,
                boxShadow: `0 0 22px ${zone.accentGlow}`,
              }}
            >
              ✦ {busy ? "Saving…" : "Save to Our Family Vault"}
            </button>
          </div>
        </>
      )}
    </RoomShell>
  );
}

// ──────────────────────────────────────────────────────────────────
// 5. Family Album Floating Action Button (FAB) — drawer with all photos
// ──────────────────────────────────────────────────────────────────
export function FamilyAlbumFAB({ isPremium }) {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/kids-journey/album/list");
      setPhotos(res.data?.photos || []);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  }, [open]);

  const byZone = useMemo(() => {
    const groups = { discovery: [], exploration: [], creation: [] };
    photos.forEach((p) => {
      if (groups[p.zone]) groups[p.zone].push(p);
    });
    return groups;
  }, [photos]);

  if (!isPremium) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="kids-family-album-fab"
        aria-label="Open Family Album"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105"
        style={{
          background: "#c4a46b",
          color: "#0b0a08",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.5), 0 0 32px rgba(196,164,107,0.45)",
        }}
      >
        <ImageIcon size={22} strokeWidth={1.5} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="kids-family-album-drawer"
          className="fixed inset-0 z-50 flex items-stretch justify-end"
          style={{
            background: "rgba(11,10,8,0.78)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={() => setOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-[460px] overflow-y-auto"
            style={{
              background: "rgba(18,16,13,0.98)",
              borderLeft: "1px solid rgba(196,164,107,0.18)",
              fontFamily: SERIF,
              color: "#e8e1d5",
            }}
          >
            <header className="sticky top-0 px-7 py-6 flex items-center justify-between border-b border-[rgba(196,164,107,0.12)] bg-[rgba(18,16,13,0.98)]">
              <div>
                <p
                  className="text-[11px] tracking-[0.42em] uppercase"
                  style={{ color: "#c4a46b" }}
                >
                  ✦ Family Album
                </p>
                <h3
                  className="text-[24px] italic font-light mt-1"
                  style={{ color: "#e8e1d5" }}
                >
                  Quiet memories, held safely.
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                data-testid="kids-family-album-close"
                className="text-[#7a7468] hover:text-[#e8e1d5] transition-colors"
              >
                <X size={20} />
              </button>
            </header>

            <div className="px-7 py-6 space-y-8">
              {loading && (
                <p
                  className="text-[13px] italic text-[#7a7468]"
                  data-testid="kids-family-album-loading"
                >
                  Opening the vault…
                </p>
              )}
              {!loading && photos.length === 0 && (
                <p
                  className="text-[13px] italic text-[#7a7468]"
                  data-testid="kids-family-album-empty"
                >
                  The vault is quiet. Memories will arrive as you walk the
                  paths together.
                </p>
              )}
              {[
                { key: "discovery", label: "Discovery Vault", color: "#10b981" },
                { key: "exploration", label: "Exploration Vault", color: "#3b82f6" },
                { key: "creation", label: "Creation Vault", color: "#a855f7" },
              ].map((v) => {
                const items = byZone[v.key] || [];
                if (items.length === 0) return null;
                return (
                  <section key={v.key} data-testid={`kids-family-album-vault-${v.key}`}>
                    <p
                      className="text-[11px] tracking-[0.36em] uppercase mb-4"
                      style={{ color: v.color }}
                    >
                      {v.label} · {items.length}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {items.map((p) => (
                        <figure
                          key={p.id}
                          className="rounded-[0.8rem] overflow-hidden"
                          style={{
                            border: `1px solid ${v.color}33`,
                            boxShadow: `0 0 18px ${v.color}22`,
                          }}
                        >
                          <img
                            src={`data:image/jpeg;base64,${p.photo_base64}`}
                            alt={p.caption || "Family memory"}
                            className="w-full h-[120px] object-cover"
                          />
                          {p.caption && (
                            <figcaption
                              className="px-3 py-2 text-[11px] italic text-[#bcb4a3] leading-[1.5]"
                              style={{ background: "rgba(11,10,8,0.65)" }}
                            >
                              {p.caption}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
