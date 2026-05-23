import { useState } from "react";
import { Facebook, Link2, Twitter } from "lucide-react";

/**
 * StoryShareStrip — secondary public-share row, sits below GiftStoryCard.
 *
 * §AURIN 2026-02-08 — Founder directive split:
 *   - Intimate channels (WhatsApp / Telegram / Email) live in
 *     `GiftStoryCard.jsx` with a gift-coded message.
 *   - This component only carries the broader public channels:
 *     Facebook, X, and Copy link. Avoids channel duplication and
 *     keeps the emotional hierarchy clean: gift first, share second.
 *
 * Works in preview and in production. URL auto-resolves via
 * `window.location.href`.
 */
export default function StoryShareStrip({
  url,
  title = "A quiet story from Aurin",
  testidPrefix = "story-share",
}) {
  const [copied, setCopied] = useState(false);

  const enc = encodeURIComponent;

  const targets = [
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
      className="rounded-2xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg-elev))/0.4] p-5"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[12.5px] text-[hsl(var(--aurin-text))/0.65]">
          Or share more widely:
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
    </div>
  );
}
