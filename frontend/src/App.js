import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Library from "@/pages/Library";
import LibraryEntry from "@/pages/LibraryEntry";
import Learning from "@/pages/Learning";
import Bookstore from "@/pages/Bookstore";
import BookDetail from "@/pages/BookDetail";
import ReachOut from "@/pages/ReachOut";
import KidsUniverse from "@/pages/KidsUniverse";
import MeditationCorner from "@/pages/MeditationCorner";
import UserPortal from "@/pages/UserPortal";
import AdminContent from "@/pages/AdminContent";

function App() {
  return (
    <div className="App" data-testid="app-root">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/bookstore" element={<Bookstore />} />
            <Route path="/bookstore/:slug" element={<BookDetail />} />
            <Route path="/library" element={<Library />} />
            <Route path="/library/:slug" element={<LibraryEntry />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/kids-universe" element={<KidsUniverse />} />
            <Route path="/meditation-corner" element={<MeditationCorner />} />
            <Route path="/reach-out" element={<ReachOut />} />
            <Route path="/portal" element={<UserPortal />} />
            <Route path="/admin/content" element={<AdminContent />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
