/**
 * StoryGiftRead.jsx — /aurins-room/gift/:slug
 *
 * §SYNERGY-ANNELI 2026-02-10 — Reader view + share strip.
 * Includes Telegram (Anna's explicit request 2026-02-10).
 *
 * Receiving parents see:
 *   • A "Make one for your own child" CTA below the story
 *     (this is the growth loop — converts viewers to creators)
 *   • Three soft links: Body Temple 28 · Kids Universe · Stories
 */

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Send, Mail, Copy, CheckCheck, Sparkles, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

// Inline Telegram + WhatsApp icons (lucide doesn't ship branded icons)
const TelegramIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.21-3.1-2.04 1.95c-.23.23-.43.43-.84.43z" />
  </svg>
);

const WhatsAppIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.298-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
  </svg>
);

const GIFT_MESSAGE = (title, url) =>
  `I found something quiet for you and your child. A 200-word bedtime story called "${title}" — read it together tonight if you'd like. ${url}`;

export default function StoryGiftRead() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/story-gift/${slug}`)
      .then((r) => setData(r.data))
      .catch(() => setError("This story has drifted away. Make a fresh one below."));
  }, [slug]);

  const shareUrl = (() => {
    if (typeof window === "undefined") return "";
    const u = new URL(window.location.href);
    if (!u.searchParams.has("ref")) u.searchParams.set("ref", "story_gift");
    if (!u.searchParams.has("utm_source")) u.searchParams.set("utm_source", "anneli");
    return u.toString();
  })();

  const title = data?.title || "A quiet story";
  const giftLine = GIFT_MESSAGE(title, shareUrl);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6"
           style={{ background: "linear-gradient(180deg, #fdf8ee 0%, #f3e3c5 100%)", color: "#3d2a14" }}>
        <div className="text-center max-w-md">
          <p className="text-[14px] italic mb-6" style={{ color: "#7a5e2e" }}>{error}</p>
          <Link to="/aurins-room/gift" data-testid="story-gift-make-new"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-[14px]"
                style={{ background: "#a65a2f", color: "#fff" }}>
            Write a new one <Sparkles size={13} />
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: "linear-gradient(180deg, #fdf8ee 0%, #f3e3c5 100%)", color: "#7a5e2e" }}>
        <p className="italic">Opening the page…</p>
      </div>
    );
  }

  return (
    <div data-testid="story-gift-read"
         className="min-h-screen"
         style={{ background: "linear-gradient(180deg, #fdf8ee 0%, #f3e3c5 100%)", color: "#3d2a14" }}>
      <div className="mx-auto max-w-2xl px-5 sm:px-8 py-12 sm:py-16">
        <p className="text-[11px] uppercase tracking-[0.28em] mb-3" style={{ color: "#8a6428" }}>
          A small gift from Aurin
        </p>
        <h1 className="text-[44px] sm:text-[54px] leading-[0.95] mb-7"
            style={{ fontFamily: "Caveat, Fraunces, serif", fontWeight: 600, color: "#a65a2f" }}
            data-testid="story-gift-title">
          {data.title}
        </h1>

        {/* Story body — large readable serif on a soft paper card */}
        <article className="rounded-2xl p-7 sm:p-9 relative overflow-hidden"
                 data-testid="story-gift-body"
                 style={{
                   background: "linear-gradient(160deg, #fffaf0 0%, #faecca 100%)",
                   border: "1.5px solid #e8d2a8",
                   boxShadow: "0 14px 30px -16px rgba(166,90,47,0.4), inset 0 1px 0 rgba(255,255,255,0.65)",
                 }}>
          <span aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 right-0 rounded-t-2xl"
                style={{
                  height: "30%",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
                }} />
          <div className="relative text-[17.5px] leading-[1.75] whitespace-pre-wrap"
               style={{ fontFamily: "Fraunces, Georgia, serif", color: "#3d2a14" }}>
            {data.story}
          </div>
        </article>

        {/* Share strip */}
        <section className="mt-9" data-testid="story-gift-share-strip">
          <p className="text-[11px] uppercase tracking-[0.22em] mb-3" style={{ color: "#8a6428" }}>
            Send this to one tired parent
          </p>
          <div className="flex flex-wrap gap-2.5">
            <a href={`https://wa.me/?text=${encodeURIComponent(giftLine)}`}
               target="_blank" rel="noopener noreferrer"
               data-testid="story-gift-share-whatsapp"
               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium transition hover:-translate-y-0.5"
               style={{ background: "#25D366", color: "#fff",
                        boxShadow: "0 8px 18px -10px rgba(37,211,102,0.6)" }}>
              <WhatsAppIcon size={14} /> WhatsApp
            </a>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`A quiet bedtime story I thought you'd like — "${title}".`)}`}
               target="_blank" rel="noopener noreferrer"
               data-testid="story-gift-share-telegram"
               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium transition hover:-translate-y-0.5"
               style={{ background: "#0088cc", color: "#fff",
                        boxShadow: "0 8px 18px -10px rgba(0,136,204,0.6)" }}>
              <TelegramIcon size={14} /> Telegram
            </a>
            <a href={`mailto:?subject=${encodeURIComponent(`A quiet story for you and your child`)}&body=${encodeURIComponent(giftLine)}`}
               data-testid="story-gift-share-email"
               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium transition hover:-translate-y-0.5"
               style={{ background: "#fffaf0", color: "#3d2a14", border: "1.5px solid #e8d2a8" }}>
              <Mail size={13} /> Email
            </a>
            <button type="button" onClick={handleCopy}
                    data-testid="story-gift-share-copy"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium transition"
                    style={{ background: "#fffaf0", color: "#3d2a14", border: "1.5px solid #e8d2a8" }}>
              {copied ? <><CheckCheck size={13} /> Copied</> : <><Copy size={13} /> Copy link</>}
            </button>
            <a href={`/api/marketing/ref-hit`} onClick={(e) => e.preventDefault()}
               data-testid="story-gift-share-ref-link"
               className="hidden"></a>
          </div>
        </section>

        {/* Growth-loop CTA — "make one for your own child" */}
        <section className="mt-12 rounded-2xl p-7 relative overflow-hidden"
                 data-testid="story-gift-make-cta"
                 style={{
                   background: "linear-gradient(160deg, #fffaf0 0%, #f3e3c5 100%)",
                   border: "1.5px dashed #c97a3f",
                 }}>
          <p className="text-[11px] uppercase tracking-[0.22em] mb-2" style={{ color: "#8a6428" }}>
            For the parent reading this
          </p>
          <p className="text-[24px] leading-snug max-w-[36ch] mb-4"
             style={{ fontFamily: "Caveat, cursive", color: "#3d2a14", fontWeight: 500 }}>
            Would you like one for your own child tonight?
          </p>
          <Link to="/aurins-room/gift?ref=gift_inception"
                data-testid="story-gift-make-own-cta"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-[14px] font-medium"
                style={{ background: "#a65a2f", color: "#fff",
                         boxShadow: "0 10px 24px -12px rgba(166,90,47,0.7)" }}>
            Make a quiet story <ArrowRight size={13} />
          </Link>
        </section>

        {/* Three soft doorways */}
        <section className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3"
                 data-testid="story-gift-doorways">
          <Link to="/aurins-room/stories?ref=story_gift"
                className="rounded-xl p-4 text-center transition hover:-translate-y-0.5"
                style={{ background: "#fffaf0", border: "1px solid #e8d2a8", color: "#3d2a14" }}>
            <Send size={14} className="mx-auto mb-1.5" style={{ color: "#a65a2f" }} />
            <p className="text-[12.5px]">More bedtime stories</p>
          </Link>
          <Link to="/body-temple?utm_source=story_gift"
                className="rounded-xl p-4 text-center transition hover:-translate-y-0.5"
                style={{ background: "#fffaf0", border: "1px solid #e8d2a8", color: "#3d2a14" }}>
            <Sparkles size={14} className="mx-auto mb-1.5" style={{ color: "#a65a2f" }} />
            <p className="text-[12.5px]">A quiet room for you</p>
          </Link>
          <Link to="/kids-universe?ref=story_gift"
                className="rounded-xl p-4 text-center transition hover:-translate-y-0.5"
                style={{ background: "#fffaf0", border: "1px solid #e8d2a8", color: "#3d2a14" }}>
            <ArrowRight size={14} className="mx-auto mb-1.5" style={{ color: "#a65a2f" }} />
            <p className="text-[12.5px]">Visit Aurin's Universe</p>
          </Link>
        </section>
      </div>
    </div>
  );
}
