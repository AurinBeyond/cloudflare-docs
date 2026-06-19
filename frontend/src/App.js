import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useParams } from "react-router-dom";
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
import Grace from "@/pages/Grace";
import GraceSpeak from "@/pages/grace/Speak";
import GraceWrite from "@/pages/grace/Write";
import GraceEvening from "@/pages/grace/Evening";
import GraceMessages from "@/pages/grace/Messages";
import GraceLibrary from "@/pages/grace/Library";
import GraceLibraryArticle from "@/pages/grace/LibraryArticle";
import ClarityThreshold from "@/pages/ClarityThreshold";
import Presence from "@/pages/Presence";
import BodyRoom from "@/pages/BodyRoom";
import BodyWorld from "@/pages/BodyWorld";
import BodyWorldStone from "@/pages/BodyWorldStone";
import BodyWorldTopic from "@/pages/BodyWorldTopic";
import BodyWorldStub from "@/pages/BodyWorldStub";
import BodyTemple from "@/pages/BodyTemple";
import ParentsRoom from "@/pages/ParentsRoom";
import SaraHub from "@/pages/SaraHub";
import SaraCategoryStub from "@/pages/SaraCategoryStub";
import SaraMyChild from "@/pages/SaraMyChild";
import SaraEmotionsSafety from "@/pages/SaraEmotionsSafety";
import SaraOurFamily from "@/pages/SaraOurFamily";
import SaraBoundariesResponsibility from "@/pages/SaraBoundariesResponsibility";
import SaraGrowthDevelopment from "@/pages/SaraGrowthDevelopment";
import SaraRelationshipsCooperation from "@/pages/SaraRelationshipsCooperation";
import SaraChallengingSituations from "@/pages/SaraChallengingSituations";
import SaraWisdomGarden from "@/pages/SaraWisdomGarden";
import SaraWeeklyDigest from "@/pages/SaraWeeklyDigest";
import SaraStoriesRealLife from "@/pages/SaraStoriesRealLife";
import SaraToolsExercises from "@/pages/SaraToolsExercises";
import SaraParentingJourney from "@/pages/SaraParentingJourney";
import SaraGenerationsHeritage from "@/pages/SaraGenerationsHeritage";
import SubsystemWing from "@/pages/SubsystemWing";
import AurinsRoom from "@/pages/AurinsRoom";
import AurinsRoomChat from "@/pages/AurinsRoomChat";
import AurinStoryWorld from "@/pages/AurinStoryWorld";
import AurinStoryRead from "@/pages/AurinStoryRead";
import BetaTestGroup from "@/pages/BetaTestGroup";
import CourseRoom from "@/pages/CourseRoom";
import Alistair from "@/pages/Alistair";
import AlistairExplore from "@/pages/alistair/Explore";
import AlistairRead from "@/pages/alistair/Read";
import AlistairExperiments from "@/pages/alistair/Experiments";
import AlistairNotes from "@/pages/alistair/Notes";
import AlistairLibrary from "@/pages/alistair/Library";
import AlistairLibraryArticle from "@/pages/alistair/LibraryArticle";
import AlistairLaboratories from "@/pages/alistair/Laboratories";
import AlistairLab from "@/pages/alistair/Lab";
import AlistairLabDashboard from "@/pages/alistair/LabDashboard";
import AlistairLabArticle from "@/pages/alistair/LabArticle";
import AlistairTopicDetail from "@/pages/alistair/TopicDetail";
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
import ListenSockOnStairs from "@/pages/ListenSockOnStairs";
import ListenLightInHallway from "@/pages/ListenLightInHallway";
import ListenCoatOnChair from "@/pages/ListenCoatOnChair";
import ListenWindowLeftOpen from "@/pages/ListenWindowLeftOpen";
import ListenGardenInNovember from "@/pages/ListenGardenInNovember";
import ListenHearthIndex from "@/pages/ListenHearthIndex";
import AlistairBundle from "@/pages/AlistairBundle";
import SevenQuietNights from "@/pages/SevenQuietNights";
import TheHearthProtocol from "@/pages/TheHearthProtocol";
import FamilyBundle from "@/pages/FamilyBundle";
import StartHere from "@/pages/StartHere";
import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

// §BODY-ROOM-LEGACY-REDIRECT 2026-02-13 — Old `/body-room/world/:slug`
// URLs (created during the 2026-02-13 V2 skeleton sprint, before the
// V1 LOCK rename to `/body-world`) are preserved by 301-style redirect.
function RedirectStone() {
  const { stoneSlug } = useParams();
  return <Navigate to={`/body-world/world/${stoneSlug}`} replace />;
}

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
        {/* §HEARTH-AUDIO 2026-05-31 — first Hearth evening story (Anna's clone voice) */}
        <Route path="/listen/hearth/the-sock-on-the-stairs" element={<ListenSockOnStairs />} />
        {/* §HEARTH-AUDIO 2026-05-31 — second Hearth evening story */}
        <Route path="/listen/hearth/the-light-in-the-hallway" element={<ListenLightInHallway />} />
        {/* §HEARTH-AUDIO 2026-05-31 — third Hearth evening story */}
        <Route path="/listen/hearth/the-coat-on-the-chair" element={<ListenCoatOnChair />} />
        {/* §HEARTH-AUDIO 2026-06-01 — fourth Hearth evening story */}
        <Route path="/listen/hearth/the-window-left-open" element={<ListenWindowLeftOpen />} />
        {/* §HEARTH-AUDIO 2026-06-01 — fifth (final) Hearth evening story, shelf complete */}
        <Route path="/listen/hearth/the-garden-in-november" element={<ListenGardenInNovember />} />
        {/* §HEARTH-GATEWAY 2026-05-31 — short URL → latest story (outreach + Substack) */}
        <Route path="/listen/hearth" element={<ListenHearthIndex />} />
        <Route path="/listen/hearth/" element={<ListenHearthIndex />} />
        {/* §POLARSTAR-CHALLENGE 2026-05-31 — Seven Quiet Nights, family challenge funnel */}
        <Route path="/seven-quiet-nights" element={<SevenQuietNights />} />
        {/* §SPRINT-3 2026-05-31 — The Hearth (Parents' Room product, €19) */}
        <Route path="/the-hearth" element={<TheHearthProtocol />} />
        {/* §FAMILY-BUNDLE 2026-06-01 — €25 combo (Polarstar + Hearth) */}
        <Route path="/family-bundle" element={<FamilyBundle />} />
        {/* §SPRINT-4 2026-05-31 — Alistair Bundle (Course Room product, €39) */}
        <Route path="/alistair-bundle" element={<AlistairBundle />} />
        {/* Legacy redirect for any pre-rename inbound links */}
        <Route path="/the-hearth-protocol" element={<Navigate to="/the-hearth" replace />} />
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
        <Route path="/private-room" element={<Navigate to="/grace/room" replace />} />
        {/* §AUDIT 2026-05-21 — `/pricing` was referenced from 3 places
            (RoomConvaiChat blocked-card, ConvaiPresenceTracker, AurinsRoomChat)
            but the route was NEVER registered → users hit a blank black
            page when topping up credits. Redirect to /grace/room
            where the real Wanderer Passes + LemonSqueezy checkout live. */}
        <Route path="/pricing" element={<Navigate to="/grace/room" replace />} />
        {/* §GRACE-CLEANUP 2026-02 — `/aurin` is NOT a Grace surface.
            Founder directive: any old /aurin link belongs to the
            kids universe, never to the adult Grace room. */}
        <Route path="/aurin" element={<Navigate to="/kids-universe/polarstar" replace />} />
        <Route path="/guest" element={<Guest />} />
        <Route path="/portal/guest" element={<Guest />} />
        <Route path="/portal/referral" element={<Referral />} />
        <Route path="/refer-a-friend" element={<Navigate to="/portal/referral" replace />} />
        {/* §GRACE-LIGHT-HOMEPAGE 2026-02 — Public warm-light Grace
            landing page (founder spec, Estonian session). No
            WandererGate here — the gate fires at /grace/room where
            the actual chat / voice / passes live. */}
        <Route path="/grace" element={<Grace />} />
        {/* §GRACE-SUB-SURFACES 2026-02 — Public warm Grace sub-pages:
            Speak / Write / Evening Reflection / My Messages. Each is
            an Intuvio-style "soft door" — informational, not a chat.
            Clicking a CTA on any of them routes to /grace/room
            (the real Wanderer-gated chat surface). */}
        <Route path="/grace/speak" element={<GraceSpeak />} />
        <Route path="/grace/write" element={<GraceWrite />} />
        <Route path="/grace/evening" element={<GraceEvening />} />
        <Route path="/grace/messages" element={<GraceMessages />} />
        {/* §GRACE-LIBRARY v1 2026-02 — five-article reading room.
            Landing lists three sections (Understanding Yourself /
            Relationships / Moving Forward); each article renders in
            the founder 7-block shape with native browser PDF export. */}
        <Route path="/grace/library" element={<GraceLibrary />} />
        <Route path="/grace/library/:slug" element={<GraceLibraryArticle />} />
        {/* §GRACE-ROOM 2026-02 — The real Grace room (Wanderer's
            Gate, ConvAI voice, text chat, reflections, passes,
            encryption). Same component that used to live at
            /clarity-release; the URL changes, the functionality is
            preserved untouched. */}
        <Route
          path="/grace/room"
          element={
            <WandererGate scope="private">
              <ClarityRelease />
            </WandererGate>
          }
        />
        {/* Legacy redirects — keep old inbound links alive. */}
        <Route path="/clarity-release" element={<Navigate to="/grace/room" replace />} />
        <Route path="/clarity-release/threshold" element={<ClarityThreshold />} />
        {/* §Phase 1 — public Grace-only demo route (no auth, no
            consent gate). Founder-shareable link for bank / demo. */}
        <Route path="/presence" element={<Presence />} />
        {/* §BODY-WORLD-V1-LOCKED 2026-02-13 — Canonical URL is
            /body-world (per founder's BODY WORLD V1 IMPLEMENTATION
            LOCK). The Polarstar painted hub (traveller + lake + 14
            stones) is the hub. Each stone routes to a world page —
            painted Polarstar view when an image exists, Field Study
            skeleton otherwise. /body-room is preserved as a backward-
            compatible redirect so existing inbound links still work.
            Legacy BodyRoom.jsx (silhouette, Honesty Quiz, Body
            Architecture audio shelf, BodyRoomChat, BodyLensSelector,
            Body Temple entry) remains untouched at /body-world/v1
            (and /body-room/v1 for legacy URLs). */}
        <Route
          path="/body-world"
          element={
            <WandererGate scope="private">
              <BodyWorld />
            </WandererGate>
          }
        />
        <Route
          path="/body-world/v1"
          element={
            <WandererGate scope="private">
              <BodyRoom />
            </WandererGate>
          }
        />
        <Route
          path="/body-world/world/:stoneSlug"
          element={
            <WandererGate scope="private">
              <BodyWorldStone />
            </WandererGate>
          }
        />
        <Route
          path="/body-world/world/:stoneSlug/topic/:topicSlug"
          element={
            <WandererGate scope="private">
              <BodyWorldTopic />
            </WandererGate>
          }
        />
        {/* §SIDEBAR-STUBS 2026-02-13 — Painted into every world page
            but not yet a real surface. Replaces hard 404 with a quiet
            "This area is being prepared" placeholder so trust is not
            broken. Swap for the real page at each route when built. */}
        {["journey","tools","insights","favourites","journals"].map((s) => (
          <Route
            key={`stub-${s}`}
            path={`/body-world/${s}`}
            element={
              <WandererGate scope="private">
                <BodyWorldStub />
              </WandererGate>
            }
          />
        ))}
        {/* §BODY-ROOM-REDIRECTS — preserve legacy URLs */}
        <Route path="/body-room" element={<Navigate to="/body-world" replace />} />
        <Route
          path="/body-room/v1"
          element={
            <WandererGate scope="private">
              <BodyRoom />
            </WandererGate>
          }
        />
        <Route
          path="/body-room/world/:stoneSlug"
          element={<RedirectStone />}
        />
        {/* §BODY-TEMPLE 2026-02-09 — Public route so the course page
            is visible to non-signed-in visitors as a marketing surface;
            Day 1 is free preview, days 2-28 gate via the existing
            premium logic (clarity_passes + presence_seconds_left). */}
        <Route path="/body-temple" element={<BodyTemple />} />
        {/* §SARA-HUB-LOCK 2026-06-17 — Founder-approved painted hub
            (qted5bys_image.png) is now the canonical entry for
            /parents-room. The legacy interior (chat, 8 situations,
            ConvAI Sara) is preserved at /parents-room/v1, mirroring
            the BodyWorld → /body-world (hub) + /body-world/v1
            (interior) split. Each of the 15 painted stone-leaves
            routes to /parents-room/category/<slug> (currently a
            quiet stub until founder visuals arrive). */}
        <Route
          path="/parents-room"
          element={
            <WandererGate scope="private">
              <SaraHub />
            </WandererGate>
          }
        />
        <Route
          path="/parents-room/v1"
          element={
            <WandererGate scope="private">
              <ParentsRoom />
            </WandererGate>
          }
        />
        {/* §SARA-WORLD-1 · MY CHILD — painted interior. MUST be
            declared BEFORE the generic /category/:slug stub route
            so React Router matches "my-child" to the painted world
            instead of falling through to the placeholder. */}
        <Route
          path="/parents-room/category/my-child"
          element={
            <WandererGate scope="private">
              <SaraMyChild />
            </WandererGate>
          }
        />
        {/* §SARA-WORLD-2 · EMOTIONS & SAFETY — painted interior.
            Same routing pattern as Sara World 1. */}
        <Route
          path="/parents-room/category/emotions-safety"
          element={
            <WandererGate scope="private">
              <SaraEmotionsSafety />
            </WandererGate>
          }
        />
        {/* §SARA-WORLD-3 · OUR FAMILY — painted interior. The
            structural heart of Sara — where the compass question
            "What's going on between us?" finds its deepest mirror. */}
        <Route
          path="/parents-room/category/our-family"
          element={
            <WandererGate scope="private">
              <SaraOurFamily />
            </WandererGate>
          }
        />
        {/* §SARA-WORLD-4 · BOUNDARIES & RESPONSIBILITY — painted
            interior. A boundary is not a wall — it is a path that
            helps us walk together. Guidance, not control. */}
        <Route
          path="/parents-room/category/boundaries-responsibility"
          element={
            <WandererGate scope="private">
              <SaraBoundariesResponsibility />
            </WandererGate>
          }
        />
        {/* §SARA-WORLD-5 · GROWTH & DEVELOPMENT — painted interior.
            Growth is not a race. It is a journey of becoming.
            Becoming, not racing. */}
        <Route
          path="/parents-room/category/growth-development"
          element={
            <WandererGate scope="private">
              <SaraGrowthDevelopment />
            </WandererGate>
          }
        />
        {/* §SARA-WORLD-6 · RELATIONSHIPS & COOPERATION — painted
            interior. We grow through connection, understanding, and
            learning to walk beside one another. Nobody leads —
            everyone participates. */}
        <Route
          path="/parents-room/category/relationships-cooperation"
          element={
            <WandererGate scope="private">
              <SaraRelationshipsCooperation />
            </WandererGate>
          }
        />
        {/* §SARA-WORLD-7 · CHALLENGING SITUATIONS — painted interior.
            Even in difficult seasons, relationships can find a way
            forward. Light after rain, not storm at midnight. */}
        <Route
          path="/parents-room/category/challenging-situations"
          element={
            <WandererGate scope="private">
              <SaraChallengingSituations />
            </WandererGate>
          }
        />
        {/* §SARA-WORLD-8 · WISDOM GARDEN — painted interior.
            Some answers are found in books. Others are found in
            quiet moments of reflection. */}
        <Route
          path="/parents-room/category/wisdom-garden"
          element={
            <WandererGate scope="private">
              <SaraWisdomGarden />
            </WandererGate>
          }
        />
        {/* §SARA-WORLD-9 · WEEKLY DIGEST — painted interior.
            Sometimes the smallest moments tell us the most about
            where we are going. Father + daughter at the journal. */}
        <Route
          path="/parents-room/category/weekly-digest"
          element={
            <WandererGate scope="private">
              <SaraWeeklyDigest />
            </WandererGate>
          }
        />
        {/* §SARA-WORLD-10 · STORIES FROM REAL LIFE — painted interior.
            Sometimes the most powerful lessons come from ordinary
            lives. Bridge between Wisdom Garden and lived experience. */}
        <Route
          path="/parents-room/category/stories-real-life"
          element={
            <WandererGate scope="private">
              <SaraStoriesRealLife />
            </WandererGate>
          }
        />
        {/* §SARA-WORLD-11 · TOOLS & EXERCISES — painted interior.
            Small practices can open big conversations. Grandmother +
            two grandchildren at the conversation-card table. */}
        <Route
          path="/parents-room/category/tools-exercises"
          element={
            <WandererGate scope="private">
              <SaraToolsExercises />
            </WandererGate>
          }
        />
        {/* §SARA-WORLD-13 · PARENTING JOURNEY — painted interior.
            As children grow, parents grow too. Multi-stage cast
            walking the same woodland road simultaneously. */}
        <Route
          path="/parents-room/category/parenting-journey"
          element={
            <WandererGate scope="private">
              <SaraParentingJourney />
            </WandererGate>
          }
        />
        {/* §SARA-WORLD-14 · GENERATIONS & HERITAGE — painted interior.
            Every family carries stories, wisdom and gifts across
            generations. Three-generation household, curious not
            judgemental. */}
        <Route
          path="/parents-room/category/generations-heritage"
          element={
            <WandererGate scope="private">
              <SaraGenerationsHeritage />
            </WandererGate>
          }
        />
        <Route
          path="/parents-room/category/:slug/:sub"
          element={
            <WandererGate scope="private">
              <SaraCategoryStub />
            </WandererGate>
          }
        />
        <Route
          path="/parents-room/category/:slug"
          element={
            <WandererGate scope="private">
              <SaraCategoryStub />
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
        {/* §ALISTAIR-LIGHT-HOMEPAGE 2026-02 — Grace architecture
            mirrored for Alistair. `/course-room` is now the public
            "Laboratory of Life" landing; `/course-room/room` is the
            real Wanderer-gated voice/chat surface (preserves the old
            CourseRoom.jsx untouched). All five sub-pages mirror the
            Grace ones (Explore / Read / Experiments / Notes /
            Library). Order matters: every concrete sub-route must
            appear BEFORE the legacy `:slug` catch-all below. */}
        <Route path="/course-room" element={<Alistair />} />
        <Route path="/course-room/explore" element={<AlistairExplore />} />
        <Route path="/course-room/read" element={<AlistairRead />} />
        <Route path="/course-room/experiments" element={<AlistairExperiments />} />
        <Route path="/course-room/notes" element={<AlistairNotes />} />
        <Route path="/course-room/library" element={<AlistairLibrary />} />
        <Route path="/course-room/library/:slug" element={<AlistairLibraryArticle />} />
        {/* §LABS-OF-LIFE 2026-02 — Founder spec: five core laboratories.
            Money Tree ships fully; the other four are catalogue-only
            previews ("Soon") until their content is written. */}
        <Route path="/course-room/laboratories" element={<AlistairLaboratories />} />
        {/* §LAB-DASHBOARD 2026-02-08 — Generic Polarstar-pattern dashboard
            for all 11 Alistair laboratories. Each lab renders its
            supplied painted mockup full-bleed with invisible hotspots
            over the painted nav. */}
        <Route path="/course-room/lab/:labSlug" element={<AlistairLabDashboard />} />
        <Route path="/course-room/lab/:labSlug/topic/:topicId" element={<AlistairTopicDetail />} />
        <Route path="/course-room/lab/:labSlug/library/:slug" element={<AlistairLabArticle />} />
        <Route
          path="/course-room/room"
          element={
            <WandererGate scope="private">
              <CourseRoom />
            </WandererGate>
          }
        />
        <Route path="/course-room/:slug" element={<CourseDetail />} />
        {/* §ALISTAIR-CANONICAL 2026-02-13 — Founder UX directive: one name,
            one URL, one brand. /alistair is now the canonical URL; the
            legacy /course-room routes above are kept for backward
            compatibility (sub-rooms, old links). All entry points should
            prefer /alistair going forward. */}
        <Route path="/alistair" element={<Alistair />} />
        <Route path="/alistair/explore" element={<AlistairExplore />} />
        <Route path="/alistair/read" element={<AlistairRead />} />
        <Route path="/alistair/experiments" element={<AlistairExperiments />} />
        <Route path="/alistair/notes" element={<AlistairNotes />} />
        <Route path="/alistair/library" element={<AlistairLibrary />} />
        <Route path="/alistair/library/:slug" element={<AlistairLibraryArticle />} />
        <Route path="/alistair/laboratories" element={<AlistairLaboratories />} />
        <Route path="/alistair/lab/:labSlug" element={<AlistairLabDashboard />} />
        <Route path="/alistair/lab/:labSlug/topic/:topicId" element={<AlistairTopicDetail />} />
        <Route path="/alistair/lab/:labSlug/library/:slug" element={<AlistairLabArticle />} />
        <Route
          path="/alistair/room"
          element={
            <WandererGate scope="private">
              <CourseRoom />
            </WandererGate>
          }
        />
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
      {/* §SPRINT-1+2 2026-02 — `/start-here` is the single quiet door
          new visitors land in after clicking the Sprint-0 primary CTA.
          Three paths (For Yourself / As a Parent / Together), each
          opening a 3-minute audio + a secondary "enter room" link.
          Self-contained nav + footer so the page feels like its own
          quiet room. Lives OUTSIDE Layout so the global nav does not
          double up. */}
      <Route path="/start-here" element={<StartHere />} />
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
