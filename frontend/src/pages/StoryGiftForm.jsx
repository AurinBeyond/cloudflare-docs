/**
 * StoryGiftForm.jsx — /aurins-room/gift
 *
 * §SYNERGY-ANNELI 2026-02-10 — A parent fills in:
 *   • Child's first name
 *   • One feeling (8 options)
 *   • Age band (3-5 / 6-8 / 9-12)
 * → Claude generates a 200-word bedtime story in Anna's quiet voice.
 * → Parent gets a share screen with WhatsApp / Telegram / Email / Copy.
 *
 * Zero-CAC growth loop: each shared story carries ?ref=story_gift,
 * so we can measure exactly how many new parents enter via gifts.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Heart } from "lucide-react";
import { api } from "@/lib/api";
import StoryGiftGallery from "@/components/StoryGiftGallery";

const FALLBACK_FEELINGS = [
  { slug: "scared",   label: "Scared of something" },
  { slug: "curious",  label: "Curious" },
  { slug: "sad",      label: "A little sad" },
  { slug: "proud",    label: "Proud of themselves" },
  { slug: "lonely",   label: "Lonely" },
  { slug: "angry",    label: "Angry" },
  { slug: "tired",    label: "Very tired" },
  { slug: "happy",    label: "Happy" },
];

const FALLBACK_AGE_BANDS = [
  { slug: "3-5",  label: "3 to 5" },
  { slug: "6-8",  label: "6 to 8" },
  { slug: "9-12", label: "9 to 12" },
];

export default function StoryGiftForm() {
  const navigate = useNavigate();
  const [feelings, setFeelings] = useState(FALLBACK_FEELINGS);
  const [ageBands, setAgeBands] = useState(FALLBACK_AGE_BANDS);
  const [childName, setChildName] = useState("");
  const [feeling, setFeeling] = useState("");
  const [ageBand, setAgeBand] = useState("6-8");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/story-gift/feelings").then((r) => {
      if (r.data?.feelings?.length) setFeelings(r.data.feelings);
      if (r.data?.age_bands?.length) setAgeBands(r.data.age_bands);
    }).catch(() => {});
  }, []);

  const submit = async () => {
    setError("");
    if (!childName.trim()) { setError("Please add a first name."); return; }
    if (!feeling) { setError("Pick one feeling that fits today."); return; }
    setSubmitting(true);
    try {
      const r = await api.post("/story-gift/create", {
        child_name: childName.trim(),
        feeling,
        age_band: ageBand,
      });
      if (r.data?.slug) navigate(`/aurins-room/gift/${r.data.slug}`);
    } catch (e) {
      setError(e?.response?.data?.detail || "A small gust closed the door. Please try once more.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="story-gift-form"
         className="min-h-screen"
         style={{ background: "linear-gradient(180deg, #fdf8ee 0%, #f3e3c5 100%)", color: "#3d2a14" }}>
      <div className="mx-auto max-w-2xl px-5 sm:px-8 py-12 sm:py-16">
        <p className="text-[11px] uppercase tracking-[0.28em] mb-3" style={{ color: "#8a6428" }}>
          A small gift from Aurin
        </p>
        <h1 className="text-[44px] sm:text-[56px] leading-[0.95] mb-4"
            style={{ fontFamily: "Caveat, Fraunces, serif", fontWeight: 600, color: "#a65a2f" }}>
          One quiet story, made just for them.
        </h1>
        <p className="text-[15.5px] leading-relaxed max-w-[52ch]" style={{ color: "#5a4628" }}>
          Tell us their first name and one feeling that's hanging around today.
          Aurin will write a 200-word bedtime story you can read aloud tonight —
          or send to another tired parent who'd love a quiet moment.
        </p>

        <div className="mt-9 space-y-7">
          {/* Name */}
          <div>
            <label className="text-[11px] uppercase tracking-[0.22em] block mb-2"
                   style={{ color: "#8a6428" }}>
              Their first name
            </label>
            <input type="text" value={childName} maxLength={32}
                   onChange={(e) => setChildName(e.target.value)}
                   placeholder="e.g. Mia"
                   data-testid="story-gift-name"
                   className="w-full px-4 py-3.5 rounded-xl text-[18px] outline-none"
                   style={{
                     background: "#fffaf0",
                     border: "1.5px solid #e8d2a8",
                     fontFamily: "Caveat, cursive",
                     color: "#3d2a14",
                   }} />
          </div>

          {/* Feeling */}
          <div>
            <label className="text-[11px] uppercase tracking-[0.22em] block mb-2"
                   style={{ color: "#8a6428" }}>
              One feeling, today
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
                 data-testid="story-gift-feelings">
              {feelings.map((f) => {
                const selected = feeling === f.slug;
                return (
                  <button key={f.slug} type="button"
                          onClick={() => setFeeling(f.slug)}
                          data-testid={`story-gift-feeling-${f.slug}`}
                          className="rounded-xl px-3 py-2.5 text-[13px] text-left transition relative overflow-hidden hover:-translate-y-0.5"
                          style={{
                            background: selected
                              ? "linear-gradient(160deg, #a65a2f 0%, #c97a3f 100%)"
                              : "linear-gradient(160deg, #fffaf0 0%, #f7e8c8 100%)",
                            border: `1.5px solid ${selected ? "#a65a2f" : "#e8d2a8"}`,
                            color: selected ? "#fff" : "#3d2a14",
                            boxShadow: selected
                              ? "0 8px 20px -10px rgba(166,90,47,0.5), inset 0 1px 0 rgba(255,255,255,0.3)"
                              : "0 4px 12px -8px rgba(166,90,47,0.3), inset 0 1px 0 rgba(255,255,255,0.7)",
                          }}>
                    <span aria-hidden="true"
                          className="pointer-events-none absolute top-0 left-0 right-0 rounded-t-xl"
                          style={{
                            height: "36%",
                            background: selected
                              ? "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%)"
                              : "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
                          }} />
                    <span className="relative">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age band */}
          <div>
            <label className="text-[11px] uppercase tracking-[0.22em] block mb-2"
                   style={{ color: "#8a6428" }}>
              How old are they?
            </label>
            <div className="flex flex-wrap gap-2" data-testid="story-gift-age">
              {ageBands.map((a) => {
                const selected = ageBand === a.slug;
                return (
                  <button key={a.slug} type="button"
                          onClick={() => setAgeBand(a.slug)}
                          data-testid={`story-gift-age-${a.slug}`}
                          className="text-[12.5px] uppercase tracking-[0.18em] px-4 py-2 rounded-full transition"
                          style={{
                            background: selected ? "#a65a2f" : "transparent",
                            color: selected ? "#fff" : "#5a4628",
                            border: `1px solid ${selected ? "#a65a2f" : "#e8d2a8"}`,
                          }}>
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[13.5px] italic" style={{ color: "#a65a2f" }}
               data-testid="story-gift-error">{error}</p>
          )}

          {/* Submit */}
          <button type="button" onClick={submit}
                  disabled={submitting}
                  data-testid="story-gift-submit"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[15px] font-medium transition disabled:opacity-60"
                  style={{
                    background: "#a65a2f",
                    color: "#fff",
                    boxShadow: "0 12px 28px -14px rgba(166,90,47,0.7)",
                  }}>
            {submitting ? "Aurin is writing…" : <>Write our story <Sparkles size={14} /></>}
            {!submitting && <ArrowRight size={14} />}
          </button>

          <p className="text-[12.5px] italic max-w-[48ch] leading-relaxed"
             style={{ color: "#7a5e2e" }}>
            <Heart size={12} className="inline mr-1" style={{ color: "#c97a3f" }} />
            Free. One story takes about 20 seconds. Nothing is saved
            about your child beyond the story itself — you can share
            the link, or close the tab and let it go.
          </p>
        </div>

        {/* §SYNERGY-ANNELI 2026-02-10 — Gallery of 10 example stories
            shown BELOW the form to reduce blank-page hesitation. */}
        <StoryGiftGallery />
      </div>
    </div>
  );
}
