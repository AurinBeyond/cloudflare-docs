import { ArrowRight, Star, Shield, Heart, Gem, Feather, Moon } from "lucide-react";

interface LuxuryLandingProps {
  onNavigate: (wing: "luxury" | "library" | "kids" | "store" | "voice") => void;
}

const curatedCollections = [
  {
    title: "The Stillness Collection",
    description: "Curated meditations and ambient soundscapes for deep inner peace. Each piece is a doorway to presence.",
    items: 24,
    tier: "Premium",
    icon: Shield,
  },
  {
    title: "Golden Hour Rituals",
    description: "Morning and evening practices designed for intentional living. Honor the transitions of your day.",
    items: 18,
    tier: "Premium",
    icon: Star,
  },
  {
    title: "The Depth Series",
    description: "Long-form guided journeys into self-awareness and presence. For those ready to go deeper.",
    items: 12,
    tier: "Premium",
    icon: Heart,
  },
  {
    title: "House Essentials",
    description: "Foundation practices for building your personal house space. Begin here, return often.",
    items: 32,
    tier: "Premium",
    icon: Gem,
  },
];

const testimonials = [
  {
    text: "This house has become my daily anchor. The quality and intentionality behind every piece is extraordinary.",
    author: "A grateful member",
    role: "Practicing for 8 months",
  },
  {
    text: "I've never felt so held by a digital space. It's like coming home to a place I didn't know existed.",
    author: "A quiet seeker",
    role: "Practicing for 3 months",
  },
];

export default function LuxuryLanding({ onNavigate }: LuxuryLandingProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f0e8]">
      {/* Hero Section — The First Breath */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://mgx-backend-cdn.metadl.com/generate/images/1238580/2026-05-18/oyygceiaagnq/hero-house-entrance-luxury.png"
            alt="House Entrance"
            className="w-full h-full object-cover opacity-35 animate-house-breathe"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-[#0a0a0a]/30 to-[#0a0a0a]" />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-36 text-center">
          <div className="animate-house-enter">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#d4af37]/8 border border-[#d4af37]/15 mb-10">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse-gold" />
              <span className="text-[#d4af37] text-sm font-medium tracking-wider uppercase">Curated Luxury House</span>
            </div>
          </div>
          
          <h1 className="font-luxury text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 animate-house-slide" style={{ animationDelay: "0.15s", opacity: 0 }}>
            Where Stillness
            <span className="block text-[#d4af37] mt-2">Becomes Strength</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#f5f0e8]/60 max-w-2xl mx-auto mb-12 leading-relaxed animate-house-slide" style={{ animationDelay: "0.3s", opacity: 0 }}>
            Enter a house built for depth, dignity, and calm presence. 
            Every collection is hand-curated to honor your journey inward.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-house-slide" style={{ animationDelay: "0.45s", opacity: 0 }}>
            <button 
              onClick={() => onNavigate("store")}
              className="px-9 py-4 bg-[#d4af37] text-[#0a0a0a] rounded-xl font-semibold hover:bg-[#e8c547] transition-all duration-500 flex items-center gap-2 house-btn animate-glow-pulse"
            >
              Explore Collections <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNavigate("library")}
              className="px-9 py-4 border border-[#f5f0e8]/15 text-[#f5f0e8] rounded-xl font-medium hover:bg-[#f5f0e8]/[0.03] hover:border-[#f5f0e8]/25 transition-all duration-500 house-btn"
            >
              Free Discovery →
            </button>
          </div>
        </div>

        {/* Decorative house divider */}
        <div className="house-divider max-w-xs mx-auto" />
      </section>

      {/* Philosophy Strip */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center stagger-children">
          <div className="space-y-3">
            <Feather className="w-6 h-6 text-[#d4af37]/70 mx-auto" />
            <h3 className="font-luxury text-base font-semibold text-[#f5f0e8]/90">Intentional Curation</h3>
            <p className="text-sm text-[#f5f0e8]/40 leading-relaxed">Every piece is chosen with care, not algorithms. Quality over quantity, always.</p>
          </div>
          <div className="space-y-3">
            <Moon className="w-6 h-6 text-[#d4af37]/70 mx-auto" />
            <h3 className="font-luxury text-base font-semibold text-[#f5f0e8]/90">Depth Over Speed</h3>
            <p className="text-sm text-[#f5f0e8]/40 leading-relaxed">This is not a productivity tool. It's a space to slow down and arrive fully.</p>
          </div>
          <div className="space-y-3">
            <Heart className="w-6 h-6 text-[#d4af37]/70 mx-auto" />
            <h3 className="font-luxury text-base font-semibold text-[#f5f0e8]/90">Human Presence</h3>
            <p className="text-sm text-[#f5f0e8]/40 leading-relaxed">Created by practitioners who understand the sacred nature of inner work.</p>
          </div>
        </div>
      </section>

      <div className="house-divider max-w-md mx-auto" />

      {/* Curated Collections */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-14">
          <div>
            <h2 className="font-luxury text-3xl md:text-4xl font-bold mb-3">Curated Collections</h2>
            <p className="text-[#f5f0e8]/45 text-base">Hand-selected experiences for the discerning soul</p>
          </div>
          <button 
            onClick={() => onNavigate("store")}
            className="text-[#d4af37] text-sm font-medium hover:underline flex items-center gap-1.5 transition-all duration-300 house-btn"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-7 stagger-children">
          {curatedCollections.map((collection, i) => {
            const Icon = collection.icon;
            return (
              <div
                key={i}
                className="group relative p-9 rounded-2xl border border-[#d4af37]/8 bg-[#1a1a2e]/30 hover:border-[#d4af37]/20 hover:bg-[#1a1a2e]/50 premium-card cursor-pointer"
              >
                <div className="absolute top-5 right-5">
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#d4af37]/10 text-[#d4af37]/80 font-medium tracking-wide">
                    {collection.tier}
                  </span>
                </div>
                
                <div className="w-13 h-13 rounded-xl bg-[#d4af37]/8 flex items-center justify-center mb-6 group-hover:bg-[#d4af37]/15 transition-all duration-500">
                  <Icon className="w-6 h-6 text-[#d4af37]/80" />
                </div>
                
                <h3 className="font-luxury text-xl font-semibold mb-3 group-hover:text-[#d4af37]/90 transition-colors duration-500">{collection.title}</h3>
                <p className="text-[#f5f0e8]/50 text-sm leading-relaxed mb-5">{collection.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-[#f5f0e8]/30 text-sm">{collection.items} pieces</span>
                  <ArrowRight className="w-4 h-4 text-[#d4af37]/50 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonial — Social Proof with Dignity */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="p-10 rounded-2xl bg-[#1a1a2e]/20 border border-[#d4af37]/8">
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-[#d4af37]/70 fill-[#d4af37]/70" />
            ))}
          </div>
          <blockquote className="text-center">
            <p className="text-[#f5f0e8]/70 text-base md:text-lg italic leading-relaxed max-w-lg mx-auto mb-5 font-luxury">
              "{testimonials[0].text}"
            </p>
            <footer className="text-[#f5f0e8]/35 text-sm">
              — {testimonials[0].author} · <span className="text-[#d4af37]/50">{testimonials[0].role}</span>
            </footer>
          </blockquote>
        </div>
      </section>

      <div className="house-divider max-w-md mx-auto" />

      {/* Wing Discovery — Interconnected Rooms */}
      <section className="max-w-6xl mx-auto px-6 py-20 pb-28">
        <h2 className="font-luxury text-2xl md:text-3xl font-bold text-center mb-4">Discover the House</h2>
        <p className="text-[#f5f0e8]/40 text-center mb-14 max-w-md mx-auto">Each wing offers a unique experience within the same living ecosystem</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 stagger-children">
          {[
            { label: "Open Library", desc: "Free Discovery", wing: "library" as const, free: true },
            { label: "Kids Universe", desc: "Imagination & Light", wing: "kids" as const, free: false },
            { label: "Quiet Store", desc: "Curated Value", wing: "store" as const, free: false },
            { label: "Voice House", desc: "Deep Presence", wing: "voice" as const, free: false },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => onNavigate(item.wing)}
              className="p-7 rounded-xl border border-[#d4af37]/8 hover:border-[#d4af37]/20 bg-[#1a1a2e]/20 hover:bg-[#1a1a2e]/40 transition-all duration-500 text-left group premium-card"
            >
              <p className="font-luxury text-sm font-semibold mb-1.5 group-hover:text-[#d4af37]/80 transition-colors duration-500">{item.label}</p>
              <p className="text-[#f5f0e8]/35 text-xs leading-relaxed">{item.desc}</p>
              {item.free && (
                <span className="inline-block mt-3 text-[10px] px-2.5 py-1 rounded-full bg-[#7a9e6b]/15 text-[#7a9e6b]/80">
                  Free Access
                </span>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}