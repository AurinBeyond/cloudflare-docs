import { Sparkles, Star, Heart, Music, BookOpen, Palette, ArrowRight } from "lucide-react";

interface KidsUniverseProps {
  onNavigate: (wing: "luxury" | "library" | "kids" | "store" | "voice") => void;
}

const ageGroups = [
  { label: "Toddlers", range: "2–4 years", color: "bg-[#fde8d8]", textColor: "text-[#c4621a]" },
  { label: "Kids", range: "5–8 years", color: "bg-[#d5f0e8]", textColor: "text-[#1a6b4a]" },
  { label: "Tweens", range: "9–12 years", color: "bg-[#e8d5f5]", textColor: "text-[#6b1a8a]" },
];

const activities = [
  { title: "Starlight Breathing", age: "Toddlers", type: "Guided Audio", duration: "3 min", icon: Star, color: "bg-[#fde8d8]" },
  { title: "Imagination Journey", age: "Kids", type: "Story + Activity", duration: "10 min", icon: BookOpen, color: "bg-[#d5f0e8]" },
  { title: "Feelings Color Wheel", age: "Kids", type: "Interactive", duration: "15 min", icon: Palette, color: "bg-[#d5e8f5]" },
  { title: "Calm Down Cloud", age: "Toddlers", type: "Animation", duration: "5 min", icon: Heart, color: "bg-[#fde8d8]" },
  { title: "Mindful Music Making", age: "Tweens", type: "Creative", duration: "20 min", icon: Music, color: "bg-[#e8d5f5]" },
  { title: "The Gratitude Garden", age: "Kids", type: "Journal", duration: "8 min", icon: Sparkles, color: "bg-[#d5f0e8]" },
];

const packages = [
  { name: "Little Explorer", age: "2–4", price: "$9.99/mo", features: ["Gentle audio stories", "Breathing animations", "Lullaby collection", "Parent dashboard"] },
  { name: "Curious Adventurer", age: "5–8", price: "$14.99/mo", features: ["Interactive activities", "Story journeys", "Creative challenges", "Progress tracking", "Printable worksheets"] },
  { name: "Wise Wanderer", age: "9–12", price: "$14.99/mo", features: ["Guided meditations", "Music creation tools", "Journaling prompts", "Emotional intelligence", "Community challenges"] },
];

export default function KidsUniverse({ onNavigate }: KidsUniverseProps) {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a2e]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://mgx-backend-cdn.metadl.com/generate/images/1238580/2026-05-18/oyygh3qaagqq/kids-universe-playful-wonder.png"
            alt="Kids Universe"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f5]/70 to-[#faf8f5]" />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e8d5f5] mb-6">
            <Sparkles className="w-4 h-4 text-[#6b1a8a]" />
            <span className="text-[#6b1a8a] text-sm font-medium">Kids Universe · Imagination & Light</span>
          </div>
          
          <h1 className="font-luxury text-3xl md:text-5xl font-bold mb-4">
            A World of <span className="text-[#6b1a8a]">Wonder</span>
          </h1>
          <p className="text-[#1a1a2e]/60 text-lg max-w-xl mx-auto">
            Gentle, playful experiences designed to nurture young minds with creativity, calm, and curiosity.
          </p>
        </div>
      </section>

      {/* Age Group Filters */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          {ageGroups.map((group) => (
            <button
              key={group.label}
              className={`px-6 py-3 rounded-xl ${group.color} ${group.textColor} font-medium text-sm hover:scale-105 transition-transform`}
            >
              <span className="font-semibold">{group.label}</span>
              <span className="ml-2 opacity-70">{group.range}</span>
            </button>
          ))}
        </div>

        {/* Activity Cards */}
        <h2 className="font-luxury text-2xl font-bold mb-6">Featured Activities</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {activities.map((activity, i) => {
            const Icon = activity.icon;
            return (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-white border border-[#f0e6d3] hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl ${activity.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-[#1a1a2e]/70" />
                </div>
                <h3 className="font-semibold mb-1">{activity.title}</h3>
                <div className="flex items-center gap-2 text-sm text-[#1a1a2e]/50 mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-[#f0e6d3]/60 text-xs">{activity.age}</span>
                  <span>{activity.type}</span>
                  <span>·</span>
                  <span>{activity.duration}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Packages */}
        <h2 className="font-luxury text-2xl font-bold mb-2 text-center">Choose Their Adventure</h2>
        <p className="text-[#1a1a2e]/50 text-center mb-8">Flexible packages designed for every stage of childhood</p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {packages.map((pkg, i) => (
            <div
              key={i}
              className={`p-7 rounded-2xl border transition-all hover:shadow-lg ${
                i === 1 ? "border-[#2d5016] bg-white ring-2 ring-[#2d5016]/10" : "border-[#f0e6d3] bg-white"
              }`}
            >
              {i === 1 && (
                <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#2d5016] text-white font-medium mb-3">
                  Most Popular
                </span>
              )}
              <h3 className="font-luxury text-lg font-bold mb-1">{pkg.name}</h3>
              <p className="text-sm text-[#1a1a2e]/50 mb-3">Ages {pkg.age}</p>
              <p className="text-2xl font-bold mb-5">{pkg.price}</p>
              <ul className="space-y-2 mb-6">
                {pkg.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-[#1a1a2e]/70">
                    <Star className="w-3 h-3 text-[#d4af37]" /> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-lg font-medium text-sm transition-all ${
                i === 1
                  ? "bg-[#2d5016] text-white hover:bg-[#3a6b1e]"
                  : "bg-[#f0e6d3] text-[#1a1a2e] hover:bg-[#e8dbc5]"
              }`}>
                Start Free Trial
              </button>
            </div>
          ))}
        </div>

        {/* Cross-nav */}
        <div className="text-center">
          <button 
            onClick={() => onNavigate("library")}
            className="text-[#2d5016] text-sm font-medium hover:underline inline-flex items-center gap-1"
          >
            Explore free resources for all ages <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </section>
    </div>
  );
}