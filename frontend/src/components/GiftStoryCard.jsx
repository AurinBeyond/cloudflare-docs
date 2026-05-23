import { useState } from "react";
import { Gift, MessageCircle, Send, Mail } from "lucide-react";

/**
 * GiftStoryCard — "Gift this story to another family" CTA.
 *
 * §AURIN 2026-02-08 — Founder directive ("the gift-framing turns
 * sharing into an emotional act, not an advertisement"). This sits
 * ABOVE the public ShareStrip and uses ONLY the warmer, more intimate
 * channels — WhatsApp, Telegram, Email. Each pre-fills a gentle,
 * gift-coded message so the recipient feels invited, not advertised to.
 *
 * The plain social channels (Facebook / X / Copy link) stay in the
 * ShareStrip below — for parents who want to broadcast more publicly.
 */
export default function GiftStoryCard({ url, title }) {
  const [opened, setOpened] = useState(false);

  const enc = encodeURIComponent;
  const giftMessage =
    `Hello — I wanted to send you something quiet.\n\n` +
    `It's a calm bedtime story called "${title}" from Aurin's Story World ` +
    `— a soft place we found that feels different from everything else online. ` +
    `Maybe you and your little one will enjoy reading it together one evening.\n\n` +
    `With warmth,\n${url}`;

  const channels = [
    {
      key: "whatsapp",
      label: "Send via WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${enc(giftMessage)}`,
    },
    {
      key: "telegram",
      label: "Send via Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(giftMessage)}`,
    },
    {
      key: "email",
      label: "Send by Email",
      icon: Mail,
      href: `mailto:?subject=${enc(`A quiet bedtime story for you and your little one`)}&body=${enc(giftMessage)}`,
    },
  ];

  return (
    <div
      data-testid="gift-story-card"
      className="rounded-2xl border border-[hsl(var(--aurin-amber))/0.35] bg-[hsl(var(--aurin-bg-elev))/0.6] p-6 md:p-7 relative overflow-hidden"
    >
      {/* soft warm glow */}
      <div
        aria-hidden
        className="absolute -top-20 -right-20 w-[280px] h-[280px] rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--aurin-amber) / 0.35), transparent 65%)",
        }}
      />

      <div className="relative flex items-start gap-4">
        <div className="w-12 h-12 rounded-full border border-[hsl(var(--aurin-amber))/0.5] bg-[hsl(var(--aurin-bg))/0.65] flex items-center justify-center text-[hsl(var(--aurin-amber))] shrink-0">
          <Gift size={20} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-amber))/0.9] mb-1">
            A small kindness
          </p>
          <h3 className="aurin-serif text-xl md:text-2xl text-[hsl(var(--aurin-text))] leading-snug">
            Gift this story to another family
          </h3>
          <p className="mt-2 text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.78]">
            If someone you know is raising children in this noisy world,
            quietly send them this story. Not as a link — as a small,
            unhurried gift for a calmer evening.
          </p>

          {!opened ? (
            <button
              type="button"
              onClick={() => setOpened(true)}
              data-testid="gift-story-open"
              className="mt-5 inline-flex items-center gap-2 px-4 h-10 rounded-full border border-[hsl(var(--aurin-amber))/0.5] bg-[hsl(var(--aurin-amber))/0.08] text-[13px] text-[hsl(var(--aurin-amber))] hover:bg-[hsl(var(--aurin-amber))/0.16] transition-colors"
            >
              <Gift size={14} strokeWidth={1.5} />
              <span>Choose how to send it</span>
            </button>
          ) : (
            <div
              data-testid="gift-story-channels"
              className="mt-5 flex flex-col sm:flex-row gap-2.5"
            >
              {channels.map((c) => {
                const Icon = c.icon;
                return (
                  <a
                    key={c.key}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`gift-story-${c.key}`}
                    className="inline-flex items-center justify-center gap-2 px-4 h-11 rounded-full border border-[hsl(var(--aurin-amber))/0.5] bg-[hsl(var(--aurin-amber))/0.08] text-[13px] text-[hsl(var(--aurin-amber))] hover:bg-[hsl(var(--aurin-amber))/0.18] transition-colors"
                  >
                    <Icon size={14} strokeWidth={1.5} />
                    <span>{c.label}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
