import { useState } from "react";
import { Facebook, Link2, Mail, MessageCircle, Send, Twitter } from "lucide-react";

/**
 * StoryShareStrip — share row used at the bottom of every Aurin story.
 *
 * §AURIN 2026-02-08 — Founder directive ("growth-hack: trust transfer
 * is more valuable than any ad"). Parents sharing a calm bedtime story
 * with friends is the single strongest organic acquisition channel for
 * the kids' side of the sanctuary.
 *
 * Six channels:
 *   - WhatsApp      (wa.me web intent)
 *   - Telegram      (t.me/share/url)
 *   - Facebook      (sharer.php)
 *   - X / Twitter   (intent/tweet)
 *   - Email         (mailto:)
 *   - Copy link     (navigator.clipboard fallback)
 *
 * Works in preview and in production. In preview the URL points to the
 * preview domain; once the live domain is deployed, share targets pick
 * up the new `window.location.href` automatically — no code change.
 *
 * Why not reuse `/app/frontend/src/components/ShareStrip.jsx`? That
 * component is used by the blog and only carries Facebook + Instagram.
 * Anna asked for WhatsApp / Telegram / Facebook explicitly — those are
 * where parents actually share children's content. Story-specific row,
 * blog row stays untouched.
 */
export default function StoryShareStrip({
  url,
  title = "A quiet story from Aurin",
  message = "I thought you might enjoy this — a calm bedtime story.",
  testidPrefix = "story-share",
}) {
  const [copied, setCopied] = useState(false);

  const enc = encodeURIComponent;
  const sharedText = `${message} ${url}`;

  const targets = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${enc(sharedText)}`,
    },
    {
      key: "telegram",
      label: "Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(message)}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(title)}`,
    },
    {
      key: "twitter",
      label: "X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`,
    },
    {
      key: "email",
      label: "Email",
      icon: Mail,
      href: `mailto:?subject=${enc(title)}&body=${enc(`${message}\n\n${url}`)}`,
    },
  ];

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — silent */
    }
  };

  return (
    <div
      data-testid={`${testidPrefix}-strip`}
      className="rounded-2xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg-elev))/0.45] p-5 md:p-6"
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text))/0.55] mb-1">
        Share this story
      </p>
      <p className="text-[13.5px] text-[hsl(var(--aurin-text))/0.75] mb-4 leading-relaxed">
        If this story brought a quiet moment to your evening, send it to a
        family who might need one too.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {targets.map((t) => {
          const Icon = t.icon;
          return (
            <a
              key={t.key}
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`${testidPrefix}-${t.key}`}
              aria-label={`Share on ${t.label}`}
              className="inline-flex items-center gap-2 px-3 h-9 rounded-full border border-[hsl(var(--aurin-border))] text-[12.5px] text-[hsl(var(--aurin-text))/0.85] hover:text-[hsl(var(--aurin-amber))] hover:border-[hsl(var(--aurin-amber))/0.6] transition-colors"
            >
              <Icon size={13} strokeWidth={1.5} />
              <span className="hidden sm:inline">{t.label}</span>
            </a>
          );
        })}
        <button
          type="button"
          onClick={onCopy}
          data-testid={`${testidPrefix}-copy`}
          className="inline-flex items-center gap-2 px-3 h-9 rounded-full border border-[hsl(var(--aurin-border))] text-[12.5px] text-[hsl(var(--aurin-text))/0.85] hover:text-[hsl(var(--aurin-amber))] hover:border-[hsl(var(--aurin-amber))/0.6] transition-colors"
        >
          <Link2 size={13} strokeWidth={1.5} />
          <span>{copied ? "Link copied" : "Copy link"}</span>
        </button>
      </div>
    </div>
  );
}
