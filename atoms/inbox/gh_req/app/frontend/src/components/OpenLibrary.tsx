import { BookOpen, Search, Filter, ArrowRight, Download, Eye, Leaf, Sun } from "lucide-react";

interface OpenLibraryProps {
  onNavigate: (wing: "luxury" | "library" | "kids" | "store" | "voice") => void;
}

const freeResources = [
  { title: "Introduction to Mindful Breathing", category: "Meditation", duration: "8 min", type: "Audio", downloads: 2340 },
  { title: "The Art of Slowing Down", category: "Article", duration: "5 min read", type: "Text", downloads: 1890 },
  { title: "Morning Gratitude Practice", category: "Ritual", duration: "12 min", type: "Audio", downloads: 3120 },
  { title: "Understanding Emotional Presence", category: "Guide", duration: "10 min read", type: "Text", downloads: 1560 },
  { title: "Gentle Body Scan for Beginners", category: "Meditation", duration: "15 min", type: "Audio", downloads: 4200 },
  { title: "Creating Your Sacred Space", category: "Guide", duration: "7 min read", type: "Text", downloads: 2780 },
  { title: "Evening Wind-Down Sequence", category: "Ritual", duration: "10 min", type: "Audio", downloads: 1920 },
  { title: "The Power of Quiet Observation", category: "Article", duration: "4 min read", type: "Text", downloads: 1340 },
];

const categories = ["All", "Meditation", "Article", "Ritual", "Guide"];

export default function OpenLibrary({ onNavigate }: OpenLibraryProps) {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a2e]">
      {/* Hero — Warm Welcome */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://mgx-backend-cdn.metadl.com/generate/images/1238580/2026-05-18/oyyggnyaagoq/open-library-warm-discovery.png"
            alt="Open Library"
            className="w-full h-full object-cover opacity-15 animate-house-breathe"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f5]/70 to-[#faf8f5]" />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="animate-house-enter">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2d5016]/6 border border-[#2d5016]/15 mb-8">
              <Leaf className="w-4 h-4 text-[#2d5016]" />
              <span className="text-[#2d5016] text-sm font-medium tracking-wide">Open Discovery · Free Access</span>
            </div>
          </div>
          
          <h1 className="font-luxury text-3xl md:text-5xl lg:text-6xl font-bold mb-5 animate-house-slide" style={{ animationDelay: "0.15s", opacity: 0 }}>
            Breathe. Discover. Grow.
          </h1>
          <p className="text-[#1a1a2e]/55 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed animate-house-slide" style={{ animationDelay: "0.3s", opacity: 0 }}>
            A curated library of free resources to begin your journey. 
            No barriers, no pressure — just warmth and wisdom.
          </p>

          {/* Search — Gentle, Inviting */}
          <div className="max-w-lg mx-auto relative animate-house-slide" style={{ animationDelay: "0.45s", opacity: 0 }}>
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a2e]/25" />
            <input
              type="text"
              placeholder="Search free resources..."
              className="w-full pl-13 pr-5 py-4 rounded-xl bg-white border border-[#f0e6d3] focus:border-[#2d5016]/30 focus:outline-none focus:ring-2 focus:ring-[#2d5016]/8 text-sm shadow-sm transition-all duration-500"
            />
          </div>
        </div>
      </section>

      {/* Philosophy Strip */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center stagger-children">
          <div className="space-y-2">
            <Sun className="w-5 h-5 text-[#8b6914]/60 mx-auto" />
            <p className="text-sm text-[#1a1a2e]/50 leading-relaxed">Always free. No hidden gates.</p>
          </div>
          <div className="space-y-2">
            <BookOpen className="w-5 h-5 text-[#8b6914]/60 mx-auto" />
            <p className="text-sm text-[#1a1a2e]/50 leading-relaxed">Curated with the same care as premium.</p>
          </div>
          <div className="space-y-2">
            <Leaf className="w-5 h-5 text-[#8b6914]/60 mx-auto" />
            <p className="text-sm text-[#1a1a2e]/50 leading-relaxed">Grow at your own pace, always.</p>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        {/* Category Filters */}
        <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-[#1a1a2e]/30 flex-shrink-0" />
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-400 house-btn ${
                i === 0
                  ? "bg-[#2d5016] text-white shadow-sm"
                  : "bg-[#f0e6d3]/40 text-[#1a1a2e]/60 hover:bg-[#f0e6d3]/80 hover:text-[#1a1a2e]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Resource Grid — Breathing Cards */}
        <div className="grid md:grid-cols-2 gap-5 stagger-children">
          {freeResources.map((resource, i) => (
            <div
              key={i}
              className="group p-7 rounded-xl bg-white border border-[#f0e6d3]/80 hover:border-[#2d5016]/20 house-card cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs px-3 py-1.5 rounded-full bg-[#2d5016]/6 text-[#2d5016] font-medium">
                  {resource.category}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#7a9e6b]/10 text-[#2d5016]/80">
                  <Leaf className="w-3 h-3" /> Free
                </span>
              </div>
              
              <h3 className="font-semibold text-base mb-3 group-hover:text-[#2d5016] transition-colors duration-500">
                {resource.title}
              </h3>
              
              <div className="flex items-center justify-between text-sm text-[#1a1a2e]/40">
                <div className="flex items-center gap-3">
                  <span>{resource.duration}</span>
                  <span className="w-1 h-1 rounded-full bg-[#1a1a2e]/20" />
                  <span>{resource.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" /> {(resource.downloads / 1000).toFixed(1)}k
                  </span>
                  <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-500 text-[#2d5016]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gentle Upgrade Prompt — Not Pushy */}
        <div className="mt-16 p-10 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#2a2a3e] text-[#f5f0e8] text-center">
          <h3 className="font-luxury text-xl md:text-2xl font-semibold mb-3">Ready for Deeper Exploration?</h3>
          <p className="text-[#f5f0e8]/50 text-sm mb-7 max-w-md mx-auto leading-relaxed">
            When you feel called to go further, the Curated Luxury collections offer hand-selected experiences for profound transformation.
          </p>
          <button 
            onClick={() => onNavigate("luxury")}
            className="px-7 py-3.5 bg-[#d4af37] text-[#0a0a0a] rounded-xl font-semibold hover:bg-[#e8c547] transition-all duration-500 inline-flex items-center gap-2 house-btn"
          >
            Explore Premium <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}