import { Mic, Play, Pause, Clock, Lock, ArrowRight, Volume2 } from "lucide-react";
import { useState } from "react";

interface VoiceHouseProps {
  onNavigate: (wing: "luxury" | "library" | "kids" | "store" | "voice") => void;
}

const voiceSessions = [
  { title: "The Deep Anchor", duration: "25 min", guide: "Elena Marsh", premium: true, category: "Grounding" },
  { title: "Ocean of Stillness", duration: "30 min", guide: "James Holloway", premium: true, category: "Deep Rest" },
  { title: "Breath of Gold", duration: "15 min", guide: "Elena Marsh", premium: false, category: "Breathing" },
  { title: "The Inner Lighthouse", duration: "20 min", guide: "Sophia Crane", premium: true, category: "Visualization" },
  { title: "Roots and Wings", duration: "18 min", guide: "James Holloway", premium: true, category: "Grounding" },
  { title: "Gentle Arrival", duration: "10 min", guide: "Sophia Crane", premium: false, category: "Introduction" },
  { title: "The Midnight Garden", duration: "35 min", guide: "Elena Marsh", premium: true, category: "Deep Rest" },
  { title: "Presence Practice", duration: "12 min", guide: "James Holloway", premium: true, category: "Awareness" },
];

export default function VoiceHouse({ onNavigate }: VoiceHouseProps) {
  const [playing, setPlaying] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f0e8]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://mgx-backend-cdn.metadl.com/generate/images/1238580/2026-05-18/oyygfgiaagqa/voice-house-deep-presence.png"
            alt="Voice House"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 to-[#0a0a0a]" />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 mb-6">
            <Mic className="w-4 h-4 text-[#d4af37]" />
            <span className="text-[#d4af37] text-sm font-medium">Voice House · Deep Presence</span>
          </div>
          
          <h1 className="font-luxury text-3xl md:text-5xl font-bold mb-4">
            Listen Into <span className="text-[#d4af37]">Stillness</span>
          </h1>
          <p className="text-[#f5f0e8]/60 text-lg max-w-xl mx-auto mb-8">
            Immersive voice-guided sessions crafted by world-class practitioners. 
            Close your eyes and arrive.
          </p>

          {/* Waveform Visual */}
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-[#d4af37]/60 rounded-full waveform-bar"
                style={{
                  height: `${Math.random() * 20 + 4}px`,
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Sessions */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-luxury text-2xl font-bold">Voice Sessions</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] text-xs font-medium">All</button>
            <button className="px-3 py-1.5 rounded-full text-[#f5f0e8]/40 text-xs hover:bg-white/5">Grounding</button>
            <button className="px-3 py-1.5 rounded-full text-[#f5f0e8]/40 text-xs hover:bg-white/5">Deep Rest</button>
            <button className="px-3 py-1.5 rounded-full text-[#f5f0e8]/40 text-xs hover:bg-white/5">Breathing</button>
          </div>
        </div>

        <div className="space-y-3">
          {voiceSessions.map((session, i) => (
            <div
              key={i}
              className={`group flex items-center gap-4 p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                playing === i
                  ? "border-[#d4af37]/40 bg-[#d4af37]/5"
                  : "border-[#d4af37]/10 bg-[#1a1a2e]/30 hover:border-[#d4af37]/20 hover:bg-[#1a1a2e]/50"
              }`}
              onClick={() => setPlaying(playing === i ? null : i)}
            >
              {/* Play Button */}
              <button className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                playing === i ? "bg-[#d4af37] text-[#0a0a0a]" : "bg-[#d4af37]/15 text-[#d4af37]"
              }`}>
                {playing === i ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate">{session.title}</h3>
                  {session.premium ? (
                    <Lock className="w-3 h-3 text-[#d4af37] flex-shrink-0" />
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#7a9e6b]/20 text-[#7a9e6b] flex-shrink-0">
                      Free
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#f5f0e8]/40 mt-0.5">
                  {session.guide} · {session.category}
                </p>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-1.5 text-xs text-[#f5f0e8]/40 flex-shrink-0">
                <Clock className="w-3 h-3" />
                {session.duration}
              </div>

              {/* Volume indicator */}
              {playing === i && (
                <Volume2 className="w-4 h-4 text-[#d4af37] animate-pulse-gold flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-12 pb-20 text-center">
        <div className="p-8 rounded-2xl border border-[#d4af37]/15 bg-[#1a1a2e]/40">
          <h3 className="font-luxury text-xl font-semibold mb-2">Unlock All Voice Sessions</h3>
          <p className="text-[#f5f0e8]/50 text-sm mb-5">
            Get unlimited access to our full library of guided voice experiences.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button 
              onClick={() => onNavigate("store")}
              className="px-6 py-3 bg-[#d4af37] text-[#0a0a0a] rounded-lg font-semibold hover:bg-[#e8c547] transition-all inline-flex items-center gap-2"
            >
              View Membership <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNavigate("library")}
              className="px-6 py-3 border border-[#f5f0e8]/20 text-[#f5f0e8] rounded-lg text-sm hover:bg-white/5 transition-all"
            >
              Browse Free Content
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}