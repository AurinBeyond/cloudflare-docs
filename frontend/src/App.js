import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthProvider";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Library from "@/pages/Library";
import LibraryEntry from "@/pages/LibraryEntry";
import Learning from "@/pages/Learning";
import Bookstore from "@/pages/Bookstore";
import BookDetail from "@/pages/BookDetail";
import ReachOut from "@/pages/ReachOut";
import KidsUniverse from "@/pages/KidsUniverse";
import KidsUniverseJourney from "@/pages/KidsUniverseJourney";
import KidsColoringStudio from "@/pages/KidsColoringStudio";
import KidsHub from "@/pages/KidsHub";
import StoryGiftForm from "@/pages/StoryGiftForm";
import StoryGiftRead from "@/pages/StoryGiftRead";
import HighPerformers from "@/pages/HighPerformers";
import KidsStarsView from "@/pages/KidsStarsView";
import KidsDaily from "@/pages/KidsDaily";
import KidsActivities from "@/pages/KidsActivities";
import ParentStars from "@/pages/ParentStars";
import ParentDigest from "@/pages/ParentDigest";
import ParentAlbum from "@/pages/ParentAlbum";
import Referral from "@/pages/Referral";
import NotFound from "@/pages/NotFound";
import MeditationCorner from "@/pages/MeditationCorner";
import UserPortal from "@/pages/UserPortal";
import PortalMagicVerify from "@/pages/PortalMagicVerify";
import Guest from "@/pages/Guest";
import AdminContent from "@/pages/AdminContent";
import AdminParentsCompass from "@/pages/AdminParentsCompass";
import About from "@/pages/About";
import Legal from "@/pages/Legal";
import WanderersAgreement from "@/pages/WanderersAgreement";
import AuthCallback from "@/pages/AuthCallback";
import TheBeginning from "@/pages/TheBeginning";
import TheBeginningStep from "@/pages/TheBeginningStep";
import LuxurySanctuaryLanding from "@/pages/LuxurySanctuaryLanding";
import SanctuaryPreview from "@/pages/SanctuaryPreview";
import WhatThisIs from "@/pages/WhatThisIs";
import BundleDisclosure from "@/pages/BundleDisclosure";
import TestMic from "@/pages/TestMic";
import AurinPhilosophy from "@/pages/AurinPhilosophy";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import LibraryHub from "@/pages/LibraryHub";
import LibraryKids from "@/pages/LibraryKids";
import LibraryKidsRead from "@/pages/LibraryKidsRead";
import ClarityRelease from "@/pages/ClarityRelease";
import ClarityThreshold from "@/pages/ClarityThreshold";
import Presence from "@/pages/Presence";
import BodyRoom from "@/pages/BodyRoom";
import BodyTemple from "@/pages/BodyTemple";
import ParentsRoom from "@/pages/ParentsRoom";
import SubsystemWing from "@/pages/SubsystemWing";
import AurinsRoom from "@/pages/AurinsRoom";
import AurinsRoomChat from "@/pages/AurinsRoomChat";
import AurinStoryWorld from "@/pages/AurinStoryWorld";
import AurinStoryRead from "@/pages/AurinStoryRead";
import BetaTestGroup from "@/pages/BetaTestGroup";
import CourseRoom from "@/pages/CourseRoom";
import CourseDetail from "@/pages/CourseDetail";
import Catalogue from "@/pages/Catalogue";
import Faq from "@/pages/Faq";
import AdminObservation from "@/pages/AdminObservation";
import AdminEmailHealth from "@/pages/AdminEmailHealth";
import AdminFinance from "@/pages/AdminFinance";
import Start from "@/pages/Start";
import SixNights from "@/pages/SixNights";
import Cabinet from "@/pages/Cabinet";
import WhispersPortal from "@/pages/WhispersPortal";
import WhispersTracker from "@/components/WhispersTracker";
import AdminPreviewAssets from "@/pages/AdminPreviewAssets";
import AdminScheduler from "@/pages/AdminScheduler";
import AdminOutbound from "@/pages/AdminOutbound";
import AdminBadge from "@/components/AdminBadge";
import WandererGate from "@/components/WandererGate";
import ErrorBoundary from "@/components/ErrorBoundary";
// §POLARSTAR 2026-02-13 — preview-only Kids north-star route.
// Lives parallel to /kids-universe and /kids-universe/journey; does
// NOT touch billing, Polar SKUs, or production. See
// /app/memory/POLARSTAR_NORTHSTAR.md for the locked design law.
import Polarstar from "@/pages/Polarstar";
import PolarstarRoom from "@/pages/PolarstarRoom";
import PolarstarActivity from "@/pages/PolarstarActivity";
import PolarstarStoryRead from "@/pages/PolarstarStoryRead";
import ListenLittleStar from "@/pages/ListenLittleStar";
import SevenQuietNights from "@/pages/SevenQuietNights";
import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

function AppRouter() {
  const location = useLocation();
  // CRITICAL: Detect Emergent Auth callback BEFORE any other routing.
  // useEffect would run too late.
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* §2026-05-19 — Home was moved OUT of Layout (below) so the
            new Sanctuary landing can own its full-bleed nav + footer
            without doubling. The previous classic Home now lives at
            /home-legacy for instant rollback safety. */}
        <Route path="/home-legacy" element={<Home />} />
        <Route path="/start" element={<Start />} />
        <Route path="/about" element={<About />} />
        <Route path="/wanderers-agreement" element={<WanderersAgreement />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/bookstore" element={<Bookstore />} />
        <Route path="/bookstore/:slug" element={<BookDetail />} />
        <Route path="/library" element={<LibraryHub />} />
        <Route path="/library/adults" element={<Library />} />
        <Route path="/library/kids" element={<LibraryKids />} />
        <Route path="/library/kids/read" element={<LibraryKidsRead />} />
        <Route path="/library/kids/draw" element={<KidsColoringStudio />} />
        <Route path="/library/:slug" element={<LibraryEntry />} />
        <Route path="/learning" element={<Learning />} />
        {/* §POLARSTAR HIERARCHY LOCK 2026-02-13 (iter 85f) —
           Variant A FULL CLEANUP. POLARSTAR KIDS is the only public
           kids surface. Every legacy /kids-universe/* route — and
           the public /aurins-room/stories route — redirects to the
           PSP-safe Polarstar world. The legacy components remain in
           the bundle (untouched) so internal QA can still reach them
           on /__legacy/* sandbox paths if needed, but no public URL
           exposes Aurin-AI-for-kids language any more. */}
        <Route path="/kids-universe" element={<Navigate to="/kids-universe/polarstar" replace />} />
        <Route path="/kids-universe/polarstar" element={<Polarstar />} />
        <Route path="/kids-universe/polarstar/:ageGroup" element={<PolarstarRoom />} />
        {/* §POLARSTAR-CONTENT iter 86 — themed content layer */}
        <Route path="/kids-universe/polarstar/:roomId/story-time/:storySlug" element={<PolarstarStoryRead />} />
        <Route path="/kids-universe/polarstar/:roomId/:activitySlug" element={<PolarstarActivity />} />
        {/* §POLARSTAR-AUDIO-PHASE-1.1 iter 86o — public free audio preview */}
        <Route path="/listen/little-star" element={<ListenLittleStar />} />
        {/* §POLARSTAR-CHALLENGE 2026-05-31 — Seven Quiet Nights, family challenge funnel */}
        <Route path="/seven-quiet-nights" element={<SevenQuietNights />} />
        {/* Legacy kids-universe surface — all redirect to Polarstar */}
        <Route path="/kids-universe/legacy" element={<Navigate to="/kids-universe/polarstar" replace />} />
        <Route path="/kids-universe/coloring" element={<Navigate to="/kids-universe/polarstar" replace />} />
        <Route path="/kids-universe/journey" element={<Navigate to="/kids-universe/polarstar" replace />} />
        <Route path="/kids-universe/journey/:zone" element={<Navigate to="/kids-universe/polarstar" replace />} />
        <Route path="/kids-universe/:ageGroup/hub" element={<Navigate to="/kids-universe/polarstar" replace />} />
        <Route path="/kids-universe/:ageGroup/stars" element={<Navigate to="/kids-universe/polarstar" replace />} />
        <Route path="/kids-universe/:ageGroup/daily" element={<Navigate to="/kids-universe/polarstar" replace />} />
        <Route path="/kids-universe/:ageGroup/activities" element={<Navigate to="/kids-universe/polarstar" replace />} />
        <Route path="/kids-universe/:ageGroup/activities/:slug" element={<Navigate to="/kids-universe/polarstar" replace />} />
        {/* §AURIN — public story surfaces also redirect; the auth-gated
           /aurins-room/:ageGroup chat stays private and untouched. */}
        <Route path="/aurins-room/stories" element={<Navigate to="/kids-universe/polarstar" replace />} />
        <Route path="/aurins-room/stories/:storySlug" element={<Navigate to="/kids-universe/polarstar" replace />} />
        <Route path="/aurins-room/gift" element={<Navigate to="/kids-universe/polarstar" replace />} />
        <Route path="/aurins-room/gift/:slug" element={<Navigate to="/kids-universe/polarstar" replace />} />
        {/* §HIGH-PERFORMERS 2026-02-10 — LinkedIn-targeted B2B landing */}
        <Route path="/high-performers" element={<HighPerformers />} />
        <Route path="/parent-portal/stars" element={<ParentStars />} />
        <Route path="/parent-portal/digest" element={<ParentDigest />} />
        {/* §URL-RENAME 2026-02-12 — legacy /parent-portal/wellness
            redirected client-side. Drop the "wellness" classifier from
            Google's index without losing inbound links. */}
        <Route
          path="/parent-portal/wellness"
          element={<Navigate to="/parent-portal/digest" replace />}
        />
        <Route path="/parent-portal/album" element={<ParentAlbum />} />
        <Route path="/meditation-corner" element={<MeditationCorner />} />
        <Route path="/the-beginning" element={<TheBeginning />} />
        <Route path="/the-beginning/step" element={<TheBeginningStep />} />
        <Route path="/six-nights" element={<SixNights />} />
        <Route path="/six-nights/:nightId" element={<SixNights />} />
        <Route path="/aurin-philosophy" element={<AurinPhilosophy />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/private-room" element={<Navigate to="/clarity-release" replace />} />
        {/* §AUDIT 2026-05-21 — `/pricing` was referenced from 3 places
            (RoomConvaiChat blocked-card, ConvaiPresenceTracker, AurinsRoomChat)
            but the route was NEVER registered → users hit a blank black
            page when topping up credits. Redirect to /clarity-release
            where the real Wanderer Passes + LemonSqueezy checkout live. */}
        <Route path="/pricing" element={<Navigate to="/clarity-release" replace />} />
        <Route path="/guest" element={<Guest />} />
        <Route path="/portal/guest" element={<Guest />} />
        <Route path="/portal/referral" element={<Referral />} />
        <Route path="/refer-a-friend" element={<Navigate to="/portal/referral" replace />} />
        <Route
          path="/clarity-release"
          element={
            <WandererGate scope="private">
              <ClarityRelease />
            </WandererGate>
          }
        />
        <Route path="/clarity-release/threshold" element={<ClarityThreshold />} />
        {/* §Phase 1 — public Grace-only demo route (no auth, no
            consent gate). Founder-shareable link for bank / demo. */}
        <Route path="/presence" element={<Presence />} />
        <Route
          path="/body-room"
          element={
            <WandererGate scope="private">
              <BodyRoom />
            </WandererGate>
          }
        />
        {/* §BODY-TEMPLE 2026-02-09 — Public route so the course page
            is visible to non-signed-in visitors as a marketing surface;
            Day 1 is free preview, days 2-28 gate via the existing
            premium logic (clarity_passes + presence_seconds_left). */}
        <Route path="/body-temple" element={<BodyTemple />} />
        <Route
          path="/parents-room"
          element={
            <WandererGate scope="private">
              <ParentsRoom />
            </WandererGate>
          }
        />
        {/* §SUBSYSTEM 2026-02-11 — adult-only interior wing of
            Parents' Room. Same WandererGate. No minor data. */}
        <Route
          path="/parents-room/subsystem"
          element={
            <WandererGate scope="private">
              <SubsystemWing />
            </WandererGate>
          }
        />
        <Route
          path="/aurins-room"
          element={
            <WandererGate scope="private">
              <AurinsRoom />
            </WandererGate>
          }
        />
        {/* §AURIN STORY WORLD 2026-05-22 — Founder directive: a
            lightweight, low-cost subpage for static bedtime stories.
            Public (no WandererGate) so parents can browse before
            committing. Individual story pages are also public. */}
        <Route path="/aurins-room/stories" element={<AurinStoryWorld />} />
        <Route path="/aurins-room/stories/:storySlug" element={<AurinStoryRead />} />
        <Route
          path="/aurins-room/:ageGroup"
          element={
            <WandererGate scope="private">
              <AurinsRoomChat />
            </WandererGate>
          }
        />
        <Route
          path="/cabinet/booking"
          element={
            <WandererGate scope="private">
              <Cabinet />
            </WandererGate>
          }
        />
        <Route path="/test-group" element={<BetaTestGroup />} />
        <Route
          path="/course-room"
          element={
            <WandererGate scope="private">
              <CourseRoom />
            </WandererGate>
          }
        />
        <Route path="/course-room/:slug" element={<CourseDetail />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/admin/observation" element={<AdminObservation />} />
        <Route path="/admin/email-health" element={<AdminEmailHealth />} />
        <Route path="/admin/finance" element={<AdminFinance />} />
        <Route path="/reach-out" element={<ReachOut />} />
        <Route path="/portal" element={<UserPortal />} />
        <Route path="/portal/magic" element={<PortalMagicVerify />} />
        <Route path="/whispers-portal" element={<WhispersPortal />} />
        <Route path="/admin/preview-assets" element={<AdminPreviewAssets />} />
        <Route path="/admin/scheduler" element={<AdminScheduler />} />
        <Route path="/admin/outbound" element={<AdminOutbound />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="/admin/parents-compass" element={<AdminParentsCompass />} />
      </Route>
      {/* §2026-05-17 — /luxury preview route lives OUTSIDE the
          standard Layout wrapper. It is a full-bleed sanctuary
          landing experience with its own navigation and footer.
          Founder Q1=b: do NOT replace the current `/` route. */}
      {/* §2026-02-12 — /luxury legacy route retired. The v1 pricing
          table (€45 / €120 / €380) is inconsistent with the locked
          MEMBERSHIP_ARCHITECTURE_v2.3.1 hierarchy. Redirect preserves
          any inbound links during deploy; the LuxurySanctuaryLanding
          component is kept in the codebase for reference and may be
          archived in a future cleanup sprint. */}
      <Route path="/luxury" element={<Navigate to="/" replace />} />
      {/* §2026-05-18 — /sanctuary-preview is a founder-review-only
          route. Full-bleed polished landing, Atoms audit applied,
          locked pricing structure visible as atmospheric "Thresholds".
          Production / Home.jsx remains untouched. */}
      <Route path="/sanctuary-preview" element={<SanctuaryPreview />} />
      <Route path="/what-this-is" element={<WhatThisIs />} />
      {/* §SPRINT-C 2026-02-12 — Post-gate bundle disclosure page.
          Surfaces the full v2.3.1 membership architecture with
          one-click Polar checkout for every SKU. Public route by
          design; the qualification gate lives upstream. */}
      <Route path="/membership" element={<BundleDisclosure />} />
      {/* §2026-05-20 — /test-mic is a brutal isolation test page for
          the voice-to-voice deafness bug. No custom CSS, no overlays,
          no focus-stealing elements. If voice works here but fails on
          /clarity-release, the bug lives in our overlay stack. If it
          fails here too, the bug is in the browser profile or
          upstream WebSocket. Login required (uses signed-url like
          the production rooms). */}
      <Route path="/test-mic" element={<TestMic />} />
      {/* §2026-05-19 — Production Sanctuary landing. The /sanctuary-preview
          component is mounted with `production` so the preview ribbon
          is hidden, the nav docks to the very top, and visitors arrive
          on the polished V6 / Mike experience the moment they land on
          the domain. Rollback path: change `<SanctuaryPreview production />`
          to `<Home />` (still imported above) — instant revert.       */}
      <Route path="/" element={<SanctuaryPreview production />} />
      {/* §AUDIT-77 2026-02-09 — Soft 404 catch-all + /origin redirect
          (nav label "Origin" historically points to /about; bare URL
          /origin would silently return blank without this). */}
      <Route path="/origin" element={<Navigate to="/about" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  // §GA4 2026-02-11 — initialise GA4 once on app mount. Idempotent;
  // safe to re-mount under React StrictMode.
  useEffect(() => {
    initAnalytics();
  }, []);
  return (
    <div className="App" data-testid="app-root">
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <WhispersTracker />
            <AdminBadge />
            <AppRouter />
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}

export default App;
