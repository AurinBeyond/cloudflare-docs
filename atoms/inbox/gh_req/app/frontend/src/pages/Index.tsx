import { useState, useCallback } from "react";
import { Crown, BookOpen, Sparkles, ShoppingBag, Mic } from "lucide-react";
import LuxuryLanding from "@/components/LuxuryLanding";
import OpenLibrary from "@/components/OpenLibrary";
import KidsUniverse from "@/components/KidsUniverse";
import QuietStore from "@/components/QuietStore";
import VoiceHouse from "@/components/VoiceHouse";

type Wing = "luxury" | "library" | "kids" | "store" | "voice";

const wings = [
  { id: "luxury" as Wing, label: "Luxury Landing", icon: Crown, premium: true },
  { id: "library" as Wing, label: "Open Library", icon: BookOpen, premium: false },
  { id: "kids" as Wing, label: "Kids Universe", icon: Sparkles, premium: false },
  { id: "store" as Wing, label: "Quiet Store", icon: ShoppingBag, premium: true },
  { id: "voice" as Wing, label: "Voice House", icon: Mic, premium: true },
];

export default function Index() {
  const [activeWing, setActiveWing] = useState<Wing>("luxury");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateToWing = useCallback((wing: Wing) => {
    if (wing === activeWing) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveWing(wing);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  }, [activeWing]);

  const renderWing = () => {
    switch (activeWing) {
      case "luxury":
        return <LuxuryLanding onNavigate={navigateToWing} />;
      case "library":
        return <OpenLibrary onNavigate={navigateToWing} />;
      case "kids":
        return <KidsUniverse onNavigate={navigateToWing} />;
      case "store":
        return <QuietStore onNavigate={navigateToWing} />;
      case "voice":
        return <VoiceHouse onNavigate={navigateToWing} />;
      default:
        return <LuxuryLanding onNavigate={navigateToWing} />;
    }
  };

  const isPremiumWing = activeWing === "luxury" || activeWing === "store" || activeWing === "voice";

  return (
    <div className={`min-h-screen flex flex-col wing-transition ${isPremiumWing ? "bg-[#0a0a0a]" : "bg-[#faf8f5]"}`}>
      {/* Global Navigation — Persistent, Elegant */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl wing-transition ${
        isPremiumWing 
          ? "bg-[#0a0a0a]/95 border-[#d4af37]/15" 
          : "bg-[#faf8f5]/95 border-[#f0e6d3]/80"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">
            {/* Brand Mark */}
            <button 
              onClick={() => navigateToWing("luxury")}
              className="flex items-center gap-3 group"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                isPremiumWing 
                  ? "bg-[#d4af37]/15 group-hover:bg-[#d4af37]/25" 
                  : "bg-[#2d5016]/8 group-hover:bg-[#2d5016]/15"
              }`}>
                <Crown className={`w-4 h-4 transition-colors duration-500 ${
                  isPremiumWing ? "text-[#d4af37]" : "text-[#2d5016]"
                }`} />
              </div>
              <span className={`font-luxury text-lg font-semibold tracking-wide transition-colors duration-500 ${
                isPremiumWing ? "text-[#f5f0e8]" : "text-[#1a1a2e]"
              }`}>
                Matrix Aurin
              </span>
            </button>

            {/* Wing Navigation — Room-to-Room */}
            <div className="flex items-center gap-0.5">
              {wings.map((wing) => {
                const Icon = wing.icon;
                const isActive = activeWing === wing.id;
                return (
                  <button
                    key={wing.id}
                    onClick={() => navigateToWing(wing.id)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-500 house-btn ${
                      isActive
                        ? isPremiumWing
                          ? "bg-[#d4af37]/12 text-[#d4af37]"
                          : "bg-[#2d5016]/8 text-[#2d5016]"
                        : isPremiumWing
                          ? "text-[#f5f0e8]/50 hover:text-[#f5f0e8]/90 hover:bg-white/[0.03]"
                          : "text-[#1a1a2e]/50 hover:text-[#1a1a2e]/90 hover:bg-black/[0.03]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{wing.label}</span>
                    {wing.premium && (
                      <span className={`hidden lg:inline text-[10px] px-1.5 py-0.5 rounded-full transition-colors duration-500 ${
                        isPremiumWing 
                          ? "bg-[#d4af37]/15 text-[#d4af37]" 
                          : "bg-[#8b6914]/8 text-[#8b6914]"
                      }`}>
                        Premium
                      </span>
                    )}
                    {/* Active indicator line */}
                    {isActive && (
                      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full transition-all duration-500 ${
                        isPremiumWing ? "bg-[#d4af37]/60" : "bg-[#2d5016]/40"
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Wing Content — House Room Transition */}
      <main className="flex-1">
        <div 
          key={activeWing} 
          className={`transition-all duration-500 ${
            isTransitioning 
              ? "opacity-0 translate-y-2 scale-[0.998]" 
              : "opacity-100 translate-y-0 scale-100"
          }`}
          style={{ animationFillMode: "forwards" }}
        >
          {renderWing()}
        </div>
      </main>

      {/* Footer — Grounded, Dignified */}
      <footer className={`border-t py-10 px-6 wing-transition ${
        isPremiumWing 
          ? "bg-[#0a0a0a] border-[#d4af37]/8 text-[#f5f0e8]/35" 
          : "bg-[#faf8f5] border-[#f0e6d3]/60 text-[#1a1a2e]/35"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="font-luxury text-sm">© 2026 Matrix Aurin House</p>
            <p className="text-xs opacity-60">A space for depth, dignity, and calm presence.</p>
          </div>
          <div className="flex gap-8 text-sm">
            <button onClick={() => navigateToWing("library")} className="hover:opacity-80 transition-opacity duration-300">Free Resources</button>
            <button onClick={() => navigateToWing("store")} className="hover:opacity-80 transition-opacity duration-300">Store</button>
            <button onClick={() => navigateToWing("voice")} className="hover:opacity-80 transition-opacity duration-300">Voice</button>
          </div>
        </div>
      </footer>
    </div>
  );
}