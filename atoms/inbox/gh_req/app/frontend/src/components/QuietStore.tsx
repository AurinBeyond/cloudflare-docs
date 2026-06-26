import { ShoppingBag, Star, Heart, ArrowRight, Check } from "lucide-react";

interface QuietStoreProps {
  onNavigate: (wing: "luxury" | "library" | "kids" | "store" | "voice") => void;
}

const products = [
  {
    title: "The Complete Stillness Bundle",
    description: "All meditation collections, guided journeys, and ambient soundscapes in one premium package",
    price: "$149",
    originalPrice: "$220",
    tag: "Best Value",
    features: ["120+ guided sessions", "Lifetime access", "Exclusive ambient library", "Priority new releases"],
  },
  {
    title: "Golden Hour Annual Pass",
    description: "Full access to morning and evening ritual collections, updated monthly",
    price: "$89/year",
    originalPrice: "",
    tag: "Annual",
    features: ["All ritual collections", "Monthly new content", "Seasonal specials", "Community access"],
  },
  {
    title: "Voice House Membership",
    description: "Unlimited access to all voice-guided deep presence sessions",
    price: "$12.99/mo",
    originalPrice: "",
    tag: "Monthly",
    features: ["Unlimited voice sessions", "New weekly releases", "Offline downloads", "Personal progress"],
  },
  {
    title: "The Depth Series — Complete",
    description: "12 long-form guided journeys into self-awareness, presence, and transformation",
    price: "$79",
    originalPrice: "$120",
    tag: "One-time",
    features: ["12 deep journeys", "Companion journal PDF", "Lifetime access", "Bonus Q&A recordings"],
  },
];

const giftCards = [
  { amount: "$25", label: "A Gentle Gift" },
  { amount: "$50", label: "A Thoughtful Offering" },
  { amount: "$100", label: "A House Experience" },
];

export default function QuietStore({ onNavigate }: QuietStoreProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f0e8]">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 mb-6">
          <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
          <span className="text-[#d4af37] text-sm font-medium">Quiet Store · Curated Value</span>
        </div>
        
        <h1 className="font-luxury text-3xl md:text-5xl font-bold mb-4">
          Invest in Your <span className="text-[#d4af37]">Inner World</span>
        </h1>
        <p className="text-[#f5f0e8]/60 text-lg max-w-xl mx-auto">
          No rush. No pressure. Just carefully curated offerings that honor your journey.
        </p>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 gap-6">
          {products.map((product, i) => (
            <div
              key={i}
              className="group p-8 rounded-2xl border border-[#d4af37]/10 bg-[#1a1a2e]/40 hover:border-[#d4af37]/25 transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#d4af37]/15 text-[#d4af37] font-medium">
                  {product.tag}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-[#f5f0e8]/30 line-through">{product.originalPrice}</span>
                )}
              </div>
              
              <h3 className="font-luxury text-xl font-semibold mb-2">{product.title}</h3>
              <p className="text-[#f5f0e8]/50 text-sm mb-5 leading-relaxed">{product.description}</p>
              
              <ul className="space-y-2 mb-6">
                {product.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-[#f5f0e8]/70">
                    <Check className="w-3.5 h-3.5 text-[#d4af37]" /> {f}
                  </li>
                ))}
              </ul>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#d4af37]">{product.price}</span>
                <button className="px-5 py-2.5 bg-[#d4af37]/15 text-[#d4af37] rounded-lg text-sm font-medium hover:bg-[#d4af37]/25 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gift Cards */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="font-luxury text-2xl font-bold text-center mb-2">Gift the House</h2>
        <p className="text-[#f5f0e8]/50 text-center mb-8 text-sm">Share the gift of stillness with someone you love</p>
        
        <div className="grid grid-cols-3 gap-4">
          {giftCards.map((card, i) => (
            <button
              key={i}
              className="p-6 rounded-xl border border-[#d4af37]/15 bg-[#1a1a2e]/30 hover:border-[#d4af37]/40 transition-all text-center group"
            >
              <Heart className="w-5 h-5 text-[#d4af37] mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-xl font-bold text-[#d4af37] mb-1">{card.amount}</p>
              <p className="text-xs text-[#f5f0e8]/40">{card.label}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Trust Banner */}
      <section className="max-w-4xl mx-auto px-6 py-10 pb-20">
        <div className="p-8 rounded-2xl bg-[#1a1a2e]/60 border border-[#d4af37]/10 text-center">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-[#d4af37] fill-[#d4af37]" />
            ))}
          </div>
          <p className="text-[#f5f0e8]/70 text-sm italic mb-4 max-w-md mx-auto">
            "This house has transformed my daily practice. The quality and care in every piece is extraordinary."
          </p>
          <p className="text-[#f5f0e8]/40 text-xs">— A grateful member</p>
          
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-[#f5f0e8]/30">
            <span>30-day guarantee</span>
            <span>·</span>
            <span>Secure checkout</span>
            <span>·</span>
            <span>Instant access</span>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <button 
            onClick={() => onNavigate("library")}
            className="text-[#d4af37] text-sm font-medium hover:underline inline-flex items-center gap-1"
          >
            Try free resources first <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </section>
    </div>
  );
}