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
import AdminContent from "@/pages/AdminContent";
import About from "@/pages/About";
import Legal from "@/pages/Legal";
import AuthCallback from "@/pages/AuthCallback";

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
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/bookstore" element={<Bookstore />} />
        <Route path="/bookstore/:slug" element={<BookDetail />} />
        <Route path="/library" element={<Library />} />
        <Route path="/library/:slug" element={<LibraryEntry />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/kids-universe" element={<KidsUniverse />} />
        <Route path="/kids-universe/coloring" element={<KidsColoringStudio />} />
        <Route path="/meditation-corner" element={<MeditationCorner />} />
        <Route path="/reach-out" element={<ReachOut />} />
        <Route path="/portal" element={<UserPortal />} />
        <Route path="/admin/content" element={<AdminContent />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <div className="App" data-testid="app-root">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
