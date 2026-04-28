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
import TheBeginning from "@/pages/TheBeginning";
import TheBeginningStep from "@/pages/TheBeginningStep";
import AurinPhilosophy from "@/pages/AurinPhilosophy";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import LibraryHub from "@/pages/LibraryHub";
import LibraryKids from "@/pages/LibraryKids";
import LibraryKidsRead from "@/pages/LibraryKidsRead";
import PrivateRoom from "@/pages/PrivateRoom";
import Start from "@/pages/Start";

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
        <Route path="/start" element={<Start />} />
        <Route path="/about" element={<About />} />
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
        <Route path="/aurin-philosophy" element={<AurinPhilosophy />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/private-room" element={<PrivateRoom />} />
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
