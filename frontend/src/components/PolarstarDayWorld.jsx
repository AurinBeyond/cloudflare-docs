/**
 * PolarstarDayWorld.jsx — /kids-universe/polarstar (DAY/MORNING mode)
 *
 * §POLARSTAR v10 2026-02-13 — Built from the founder's exact spec.
 * Absolute-positioned overlay panels sit on top of the painted
 * day-world background. The painting is the spine; UI overlays are
 * placed where the painting leaves calm space.
 *
 * No dashboard. No course module. No new functionality. Every panel
 * either navigates to an age room or fires `polarstar:openWaitlist`,
 * which the parent component catches and shows the Explorer List
 * modal. Strictly PSP-safe.
 */
import {
  Home, BookOpen, Leaf, Palette, Heart, Sun, Globe2, FlaskConical,
  Rocket, PawPrint, Mic, Music, Star, CalendarDays, MessageCircle,
  Users, Puzzle, Video, Box, Compass, CheckCircle2, Smile,
} from "lucide-react";
import "@/styles/PolarstarDayWorld.css";

/* §POLARSTAR v10 — Age-zone data is preview content. The label uses
 * line breaks; we keep them as separate strings so the CSS can break
 * the words naturally without depending on \n parsing. */

/* §POLARSTAR NAV-REPAIR iter 86k 2026-02-29 — A1+A2+A3 fix.
 *
 * Per /app/memory/POLARSTAR_CONTENT_COVERAGE_MATRIX_2026-02-29.md the
 * three structural defects were:
 *   A1 — Inner age-panel icons were dead (nested button-in-button).
 *   A2 — Explorer's Hub + Morning Boost opened a waitlist despite
 *        live content existing for 5 of those 6 surfaces.
 *   A3 — Night-world "Day 1-7" pillars all dumped to /exploration.
 *
 * This file fixes A1 + A2 here. A3 is fixed in Polarstar.jsx (the
 * pw8-day pillars are removed; the night Exploration zone alone
 * carries the navigation).
 *
 * NO new content is created. Every `route` below points to an
 * activity that already exists in polarstarContentMap.js.
 */
const AGE_ZONES = [
  {
    id: "discovery",
    label: "4–6 YEARS",
    title: "Discovery",
    route: "/kids-universe/polarstar/discovery",
    className: "ps-day-age-discovery",
    items: [
      { icon: Sun,      label: "Morning\nSlow\nStart", route: "/kids-universe/polarstar/discovery/morning-mindful-start" },
      { icon: BookOpen, label: "Story\nTime",             route: "/kids-universe/polarstar/discovery/story-time" },
      { icon: Leaf,     label: "Play &\nMove",            route: "/kids-universe/polarstar/discovery/play-move" },
      { icon: Palette,  label: "Create",                  route: "/kids-universe/polarstar/discovery/drawing-palette" },
      { icon: Heart,    label: "Kindness\nMission",       route: "/kids-universe/polarstar/discovery/kindness-mission" },
    ],
  },
  {
    /* A3 — Exploration items WERE labelled "Day 1 … Day 7" and all
       navigated to the same Exploration overview. Replaced with the
       7 actual LIVE activities authored in polarstarContentMap.js.
       The number "7" preserved (matches the painted 7 lanterns). */
    id: "exploration",
    label: "7–10 YEARS",
    title: "Exploration",
    route: "/kids-universe/polarstar/exploration",
    className: "ps-day-age-exploration",
    items: [
      { icon: BookOpen,     label: "Story\nTime",        route: "/kids-universe/polarstar/exploration/story-time" },
      { icon: Leaf,         label: "Nature\nQuest",      route: "/kids-universe/polarstar/exploration/nature-quest" },
      { icon: Globe2,       label: "World\nCultures",    route: "/kids-universe/polarstar/exploration/world-cultures" },
      { icon: Rocket,       label: "Space\nAdventures",  route: "/kids-universe/polarstar/exploration/space-adventures" },
      { icon: PawPrint,     label: "Amazing\nAnimals",   route: "/kids-universe/polarstar/exploration/amazing-animals" },
      { icon: FlaskConical, label: "Science\nLab",       route: "/kids-universe/polarstar/exploration/science-lab" },
      { icon: Star,         label: "Reflection\nTime",   route: "/kids-universe/polarstar/exploration/reflection-time" },
    ],
  },
  {
    id: "creation",
    label: "11–13 YEARS",
    title: "Creation",
    route: "/kids-universe/polarstar/creation",
    className: "ps-day-age-creation",
    items: [
      { icon: Palette,  label: "Design\nLab",        route: "/kids-universe/polarstar/creation/design-lab" },
      { icon: Home,     label: "Build\nSomething",   route: "/kids-universe/polarstar/creation/build-something" },
      { icon: BookOpen, label: "Code\nStudio",       route: "/kids-universe/polarstar/creation/code-studio" },
      { icon: Video,    label: "Media\nStudio",      route: "/kids-universe/polarstar/creation/media-studio" },
      { icon: Star,     label: "Share\nProject",     route: "/kids-universe/polarstar/creation/share-project" },
    ],
  },
];

/* §POLARSTAR NAV-REPAIR iter 86k — Explorer's Hub now points at the
 * LIVE Exploration activities (matches the 4-7 actions already shipped
 * in iter 86i). Nature Explorers maps to the closest live route,
 * `nature-quest`. */
const EXPLORER_HUB = [
  { icon: FlaskConical, label: "Science\nLab",       route: "/kids-universe/polarstar/exploration/science-lab" },
  { icon: Leaf,         label: "Nature\nExplorers",  route: "/kids-universe/polarstar/exploration/nature-quest" },
  { icon: Globe2,       label: "World\nCultures",    route: "/kids-universe/polarstar/exploration/world-cultures" },
  { icon: Rocket,       label: "Space\nAdventures",  route: "/kids-universe/polarstar/exploration/space-adventures" },
  { icon: PawPrint,     label: "Amazing\nAnimals",   route: "/kids-universe/polarstar/exploration/amazing-animals" },
];

const MY_SPACE = [
  { icon: BookOpen, label: "My\nJournal" },
  { icon: Palette,  label: "My\nDrawings" },
  { icon: Mic,      label: "My\nVoice" },
  { icon: Box,      label: "My\nTreasures" },
];

const CHALLENGES = [
  "Drink water & take care",
  "Do something kind",
  "Learn something new",
  "Move your body",
];

const MOODS = ["Happy", "Calm", "Excited", "Tired", "Other"];

function openWaitlist(interest) {
  window.dispatchEvent(
    new CustomEvent("polarstar:openWaitlist", { detail: { interest } }),
  );
}

function setMode(mode) {
  window.dispatchEvent(new CustomEvent("polarstar:setMode", { detail: { mode } }));
}

export default function PolarstarDayWorld({ navigate }) {
  return (
    <div className="ps-day-world" data-testid="polarstar-day-world">
      {/* §POLARSTAR v10 iter 85h — DayWorld supplies its own painted
       * background so the % hitbox coordinates below map exactly to
       * the painted pixels. PolarstarAtmosphere intentionally
       * skips rendering its painting layer for day/morning modes. */}
      <div
        className="ps-day-bg"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06), rgba(255,255,255,0.04)), url("/polarstar/day-world-v2.png")',
        }}
      />

      <header className="ps-day-title" data-testid="polarstar-day-title">
        <div className="ps-preview-badge" data-testid="polarstar-day-badge">
          PREVIEW WORLD · The First Lanterns Are Lit
        </div>
        <h1>POLARSTAR KIDS</h1>
        <p>Polarstar protects wonder. <em>Adventures that matter — lived together</em>. Screen-down, ears-open.</p>
        <p
          data-testid="polarstar-audio-companion-banner-day"
          style={{
            fontStyle: "italic",
            fontSize: "0.95rem",
            color: "rgba(255, 243, 217, 0.82)",
            marginTop: "0.85rem",
            maxWidth: 540,
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.55,
          }}
        >
          Free audio companion:{" "}
          <a
            href="/listen/little-star"
            style={{ color: "#f5c97a", textDecoration: "underline", textUnderlineOffset: "3px", fontWeight: 600 }}
            data-testid="polarstar-audio-companion-link-day"
          >
            Little Star
          </a>{" "}
          is live now. More stories follow as I record them with care.
        </p>
      </header>

      {/* §POLARSTAR NAV-CONTRACT v1 2026-02-13 (iter 85i) — Per the
       * founder's reference image: the avatar / Welcome / level card
       * is DECORATIVE INFO. Not a button. No cursor:pointer, no
       * hover, no click handler. */}
      <section className="ps-child-card ps-decorative" data-testid="polarstar-day-child-card" aria-hidden="true">
        <div className="ps-avatar" aria-hidden="true" />
        <div className="ps-child-card-text">
          <strong>Welcome, Explorer!</strong>
          <span>Explorer Level · Preview</span>
          <div className="ps-progress" aria-hidden="true"><i style={{ width: "62%" }} /></div>
        </div>
      </section>

      <section className="ps-top-icons" data-testid="polarstar-day-top-icons">
        <button type="button" onClick={() => setMode("night")} data-testid="polarstar-day-mode-night" aria-label="Switch to night mode">
          <CalendarDays />
          <span>Night</span>
        </button>
        <button type="button" onClick={() => openWaitlist("Messages")} data-testid="polarstar-day-messages">
          <MessageCircle />
          <b>3</b>
          <span>Messages</span>
        </button>
        <button type="button" onClick={() => openWaitlist("Parents")} data-testid="polarstar-day-parents">
          <Users />
          <span>Parents</span>
        </button>
      </section>

      <button
        type="button"
        className="ps-world-map-shortcut"
        onClick={() => navigate("/kids-universe/polarstar")}
        data-testid="polarstar-day-world-shortcut"
      >
        <Globe2 />
        <span>Our World<br />Map</span>
      </button>

      {AGE_ZONES.map((zone) => (
        <AgeZone key={zone.id} zone={zone} navigate={navigate} />
      ))}

      <Panel className="ps-explorer-hub" title="Explorer's Hub" testid="polarstar-day-explorer-hub">
        <IconRow items={EXPLORER_HUB} navigate={navigate} ariaPrefix="explorer" />
      </Panel>

      <button
        type="button"
        className="ps-panel ps-morning-boost"
        onClick={() => navigate("/kids-universe/polarstar/discovery/morning-mindful-start")}
        data-testid="polarstar-day-morning-boost"
      >
        <h2>Morning Boost</h2>
        <p>Start your day with calm and focus.</p>
        <Sun className="ps-big-sun" />
      </button>

      <Panel className="ps-my-space" title="My Space" testid="polarstar-day-my-space">
        <IconRow items={MY_SPACE} onClick={(label) => openWaitlist(label)} ariaPrefix="myspace" />
      </Panel>

      {/* §POLARSTAR NAV-CONTRACT — Discovery Stars chest is the
       * "Visual focus point. Not a button." per the founder's spec.
       * Decorative only: no click handler, no cursor:pointer. */}
      <div
        className="ps-discovery-stars ps-decorative"
        data-testid="polarstar-day-discovery-stars"
        aria-hidden="true"
      >
        <span>Collect</span>
        <strong>Discovery Stars</strong>
        <Star />
      </div>

      <Panel className="ps-daily-challenges" title="Daily Challenges" testid="polarstar-day-challenges">
        <div className="ps-challenge-list">
          {CHALLENGES.map((item, index) => (
            <button
              type="button"
              key={item}
              onClick={() => openWaitlist(item)}
              data-testid={`polarstar-day-challenge-${index}`}
            >
              <span>{item}</span>
              {index < 3 ? <CheckCircle2 /> : <i />}
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="ps-today-feel" title="Today I Feel" testid="polarstar-day-mood">
        <div className="ps-moods">
          {MOODS.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => openWaitlist(`Mood: ${item}`)}
              data-testid={`polarstar-day-mood-${item.toLowerCase()}`}
            >
              <Smile />
              <span>{item}</span>
            </button>
          ))}
        </div>
      </Panel>

      <button
        type="button"
        className="ps-family-zone"
        onClick={() => openWaitlist("Family Connection Zone")}
        data-testid="polarstar-day-family"
      >
        <div className="ps-family-photo" aria-hidden="true" />
        <strong>Family Connection Zone</strong>
        <p>Share moments, celebrate wins and create memories. ♥</p>
      </button>

      {/* §POLARSTAR NAV-CONTRACT — Guide bubble ("You can do great
       * things!") is a decorative speech bubble from the fairy.
       * Not a button. */}
      <section
        className="ps-guide-bubble ps-decorative"
        data-testid="polarstar-day-guide"
        aria-hidden="true"
      >
        <div className="ps-guide-face" aria-hidden="true" />
        <p>You can do great things!</p>
      </section>

      <button
        type="button"
        className="ps-bottom-question"
        onClick={() => openWaitlist("Daily Compass")}
        data-testid="polarstar-day-compass"
      >
        <Compass />
        <span>What will we discover today?</span>
      </button>

      <nav className="ps-bottom-nav" data-testid="polarstar-day-bottom-nav">
        <button type="button" className="active" onClick={() => navigate("/kids-universe/polarstar")} data-testid="polarstar-day-nav-home">
          <Home /><span>Home</span>
        </button>
        <button type="button" onClick={() => openWaitlist("Stories")} data-testid="polarstar-day-nav-stories">
          <BookOpen /><span>Stories</span>
        </button>
        <button type="button" onClick={() => openWaitlist("Activities")} data-testid="polarstar-day-nav-activities">
          <Rocket /><span>Activities</span>
        </button>
        <button type="button" onClick={() => openWaitlist("Games")} data-testid="polarstar-day-nav-games">
          <Puzzle /><span>Games</span>
        </button>
        <button type="button" onClick={() => openWaitlist("Music")} data-testid="polarstar-day-nav-music">
          <Music /><span>Music</span>
        </button>
        <button type="button" onClick={() => openWaitlist("Videos")} data-testid="polarstar-day-nav-videos">
          <Video /><span>Videos</span>
        </button>
        <button type="button" onClick={() => openWaitlist("Resources")} data-testid="polarstar-day-nav-resources">
          <Box /><span>Resources</span>
        </button>
      </nav>

      {/* §POLARSTAR v10 iter 85h — Always-visible Explorer-List CTA.
       * Founder live-test feedback: users could not tell the painted
       * world was interactive. We keep the CTA bottom-right (only
       * visible affordance) and now add a small "Explore the world"
       * hint pill bottom-left so the first-time visitor knows the
       * painting is clickable. The hint auto-fades after 8s so it
       * doesn't crowd the painting forever. */}
      <button
        type="button"
        className="ps-day-explorer-cta"
        onClick={() => openWaitlist("Explorer List")}
        data-testid="polarstar-day-explorer-cta"
      >
        <Star size={15} aria-hidden="true" />
        <span>Join the Explorer List</span>
      </button>

      <div className="ps-day-explore-hint" data-testid="polarstar-day-explore-hint" aria-hidden="true">
        <span className="ps-day-explore-hint-dot" />
        <span>Hover any painted area · everything is alive</span>
      </div>
    </div>
  );
}

function AgeZone({ zone, navigate }) {
  /* §POLARSTAR NAV-REPAIR iter 86k — A1 fix.
   * Previously the ps-zone-panel was a `<button>` wrapping inner
   * `<button>` icons (HTML-invalid nested buttons; inner clicks
   * were swallowed). Now the panel is a plain `<div>` and each inner
   * icon is its own real button that navigates to a per-activity
   * route. The ps-age-tab above stays a button → room overview. */
  return (
    <section
      className={`ps-age-zone ${zone.className}`}
      data-testid={`polarstar-day-age-${zone.id}`}
    >
      <button
        type="button"
        className="ps-age-tab"
        onClick={() => navigate(zone.route)}
        data-testid={`polarstar-day-age-tab-${zone.id}`}
      >
        <span>{zone.label}</span>
        <strong>{zone.title}</strong>
      </button>

      <div
        className="ps-zone-panel"
        data-testid={`polarstar-day-age-panel-${zone.id}`}
      >
        <IconRow
          items={zone.items}
          navigate={navigate}
          fallbackRoute={zone.route}
          ariaPrefix={zone.id}
        />
      </div>
    </section>
  );
}

function Panel({ className, title, children, testid }) {
  return (
    <section className={`ps-panel ${className}`} data-testid={testid}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function IconRow({ items, navigate, fallbackRoute, onClick, ariaPrefix }) {
  /* §POLARSTAR NAV-REPAIR iter 86k —
   * Priority:  item.route → onClick(label) → fallbackRoute.
   * No more silent no-ops. If an item has neither route nor onClick
   * nor a fallback, the button is rendered disabled so it can't
   * pretend to be interactive. */
  return (
    <div className="ps-icon-row">
      {items.map((item) => {
        const Icon = item.icon;
        const safe = item.label.replace(/\n/g, " ").trim();
        const itemRoute = item.route || null;
        const hasAction = Boolean(itemRoute || onClick || fallbackRoute);
        const handler = (e) => {
          e.stopPropagation();
          if (itemRoute && navigate) {
            navigate(itemRoute);
            return;
          }
          if (onClick) {
            onClick(safe);
            return;
          }
          if (fallbackRoute && navigate) {
            navigate(fallbackRoute);
          }
        };
        return (
          <button
            type="button"
            key={item.label}
            onClick={handler}
            disabled={!hasAction}
            data-testid={`polarstar-day-${ariaPrefix}-${safe.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <Icon />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
