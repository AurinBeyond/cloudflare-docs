import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { Sparkles, ArrowLeft, Wand2, Download } from "lucide-react";

/**
 * Kids Coloring Studio — placeholder experience. A child enters a short
 * description; the system shows a structured line-art SVG with the prompt
 * as a calm caption. No real image generation. Designed to feel real and
 * stay extremely safe.
 */
export default function KidsColoringStudio() {
  const [prompt, setPrompt] = useState("");
  const [submitted, setSubmitted] = useState("");

  const handleGenerate = (e) => {
    e.preventDefault();
    const cleaned = prompt.trim().slice(0, 80);
    setSubmitted(cleaned);
  };

  return (
    <div data-testid="page-kids-coloring">
      <PageHeader
        tone="kids"
        eyebrow="Kids Universe · Coloring Studio"
        title="Tell us a story idea —"
        italicWord="we'll draw the lines."
        description="Type something gentle. The studio will prepare a calm line drawing for you to colour. (We are still teaching the studio. For now it shows a quiet placeholder design.)"
      >
        <Link to="/kids-universe" className="aurin-btn aurin-btn-ghost" data-testid="kids-coloring-back">
          <ArrowLeft size={13} /> Back to Kids Universe
        </Link>
      </PageHeader>

      <section className="aurin-section-sm">
        <div className="aurin-container grid grid-cols-1 lg:grid-cols-12 gap-12">
          <form onSubmit={handleGenerate} className="lg:col-span-5 space-y-5" data-testid="kids-coloring-form">
            <label className="block">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))] mb-2">
                Your idea
              </div>
              <textarea
                rows={5}
                maxLength={80}
                data-testid="kids-coloring-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A small fox listening to the wind"
                className="w-full bg-[hsl(var(--aurin-bg))] border border-[hsl(var(--aurin-border-soft))] rounded-xl px-4 py-3 text-sm focus:border-[hsl(var(--aurin-sage))] outline-none transition-colors"
              />
            </label>
            <button type="submit" data-testid="kids-coloring-generate" className="aurin-btn aurin-btn-primary">
              <Wand2 size={14} /> Make a coloring page
            </button>

            <div className="aurin-card p-5 mt-4">
              <div className="flex items-start gap-3">
                <Sparkles size={14} className="text-[hsl(var(--aurin-sage))] mt-0.5" />
                <p className="text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                  The studio is in placeholder mode. Real line-art generation
                  arrives in a later phase, after the AI layer is wired safely
                  for children's content.
                </p>
              </div>
            </div>
          </form>

          <div className="lg:col-span-7">
            <div className="aurin-card overflow-hidden" data-testid="kids-coloring-canvas">
              <div className="aspect-[4/3] bg-white flex items-center justify-center relative">
                <PlaceholderLineArt prompt={submitted} />
              </div>
              <div className="p-5 flex items-center justify-between">
                <div className="text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
                  {submitted ? `“${submitted}”` : "Your idea will appear here."}
                </div>
                <button
                  disabled
                  data-testid="kids-coloring-download"
                  className="aurin-btn aurin-btn-ghost !py-2 !px-4 !text-[12px] opacity-60 cursor-not-allowed"
                  title="Download arrives with the real generator"
                >
                  <Download size={12} /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PlaceholderLineArt({ prompt }) {
  return (
    <svg
      viewBox="0 0 480 360"
      className="w-full h-full p-8"
      role="img"
      aria-label={prompt ? `Placeholder line art for ${prompt}` : "Placeholder line art"}
    >
      <defs>
        <pattern id="dots" patternUnits="userSpaceOnUse" width="14" height="14">
          <circle cx="1" cy="1" r="1" fill="#cfcfcf" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="480" height="360" fill="url(#dots)" />
      <g fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="240" cy="200" r="80" />
        <circle cx="220" cy="190" r="6" />
        <circle cx="260" cy="190" r="6" />
        <path d="M210 220 Q240 240 270 220" />
        <path d="M180 130 Q200 100 240 110 Q280 100 300 130" />
        <path d="M120 280 Q240 320 360 280" />
        <path d="M60 320 L420 320" />
      </g>
      <text
        x="240"
        y="345"
        textAnchor="middle"
        fontFamily="Fraunces, serif"
        fontStyle="italic"
        fontSize="14"
        fill="#444"
      >
        {prompt ? `“${prompt}”` : "a quiet placeholder for your idea"}
      </text>
    </svg>
  );
}
