import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import KidsColoringStudio from "@/pages/KidsColoringStudio";
import MeditationCorner from "@/pages/MeditationCorner";
import UserPortal from "@/pages/UserPortal";
import PortalMagicVerify from "@/pages/PortalMagicVerify";
import Guest from "@/pages/Guest";
import AdminContent from "@/pages/AdminContent";
import About from "@/pages/About";
import Legal from "@/pages/Legal";
import WanderersAgreement from "@/pages/WanderersAgreement";
import AuthCallback from "@/pages/AuthCallback";
import TheBeginning from "@/pages/TheBeginning";
import TheBeginningStep from "@/pages/TheBeginningStep";
import LuxurySanctuaryLanding from "@/pages/LuxurySanctuaryLanding";
import SanctuaryPreview from "@/pages/SanctuaryPreview";
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
import ParentsRoom from "@/pages/ParentsRoom";
import BetaTestGroup from "@/pages/BetaTestGroup";
import CourseRoom from "@/pages/CourseRoom";
import CourseDetail from "@/pages/CourseDetail";
import Catalogue from "@/pages/Catalogue";
import Faq from "@/pages/Faq";
import AdminObservation from "@/pages/AdminObservation";
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
import { Navigate } from "react-router-dom";

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
        <Route path="/kids-universe" element={<KidsUniverse />} />
        <Route path="/kids-universe/coloring" element={<KidsColoringStudio />} />
        <Route path="/meditation-corner" element={<MeditationCorner />} />
        <Route path="/the-beginning" element={<TheBeginning />} />
        <Route path="/the-beginning/step" element={<TheBeginningStep />} />
        <Route path="/six-nights" element={<SixNights />} />
        <Route path="/six-nights/:nightId" element={<SixNights />} />
        <Route path="/aurin-philosophy" element={<AurinPhilosophy />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/private-room" element={<Navigate to="/clarity-release" replace />} />
        <Route path="/guest" element={<Guest />} />
        <Route path="/portal/guest" element={<Guest />} />
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
        <Route
          path="/parents-room"
          element={
            <WandererGate scope="private">
              <ParentsRoom />
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
        <Route path="/reach-out" element={<ReachOut />} />
        <Route path="/portal" element={<UserPortal />} />
        <Route path="/portal/magic" element={<PortalMagicVerify />} />
        <Route path="/whispers-portal" element={<WhispersPortal />} />
        <Route path="/admin/preview-assets" element={<AdminPreviewAssets />} />
        <Route path="/admin/scheduler" element={<AdminScheduler />} />
        <Route path="/admin/outbound" element={<AdminOutbound />} />
        <Route path="/admin/content" element={<AdminContent />} />
      </Route>
      {/* §2026-05-17 — /luxury preview route lives OUTSIDE the
          standard Layout wrapper. It is a full-bleed sanctuary
          landing experience with its own navigation and footer.
          Founder Q1=b: do NOT replace the current `/` route. */}
      <Route path="/luxury" element={<LuxurySanctuaryLanding />} />
      {/* §2026-05-18 — /sanctuary-preview is a founder-review-only
          route. Full-bleed polished landing, Atoms audit applied,
          locked pricing structure visible as atmospheric "Thresholds".
          Production / Home.jsx remains untouched. */}
      <Route path="/sanctuary-preview" element={<SanctuaryPreview />} />
      {/* §2026-05-19 — Production Sanctuary landing. The /sanctuary-preview
          component is mounted with `production` so the preview ribbon
          is hidden, the nav docks to the very top, and visitors arrive
          on the polished V6 / Mike experience the moment they land on
          the domain. Rollback path: change `<SanctuaryPreview production />`
          to `<Home />` (still imported above) — instant revert.       */}
      <Route path="/" element={<SanctuaryPreview production />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App" data-testid="app-root">
      <BrowserRouter>
        <AuthProvider>
          <WhispersTracker />
          <AdminBadge />
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
