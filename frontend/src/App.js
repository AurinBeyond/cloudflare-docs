import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Library from "@/pages/Library";
import KidsUniverse from "@/pages/KidsUniverse";
import MeditationCorner from "@/pages/MeditationCorner";
import UserPortal from "@/pages/UserPortal";

function App() {
  return (
    <div className="App" data-testid="app-root">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/kids-universe" element={<KidsUniverse />} />
            <Route path="/meditation-corner" element={<MeditationCorner />} />
            <Route path="/portal" element={<UserPortal />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
