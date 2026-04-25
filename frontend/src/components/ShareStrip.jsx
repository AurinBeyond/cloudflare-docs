import { Facebook, Instagram, Link2 } from "lucide-react";
import { SOCIAL } from "@/components/SocialLinks";
import { useState } from "react";

/**
 * Tiny share strip used at the top/bottom of blog posts.
 *
 * Instagram has no public web-share intent, so we link to the brand's
 * IG handle (with a short note in the title attribute) and offer a
 * "Copy link" fallback for the actual post URL.
 */
export default function ShareStrip({
  url,
  title = "From prulesoul",
  testidPrefix = "share",
}) {
  const [copied, setCopied] = useState(false);
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    url
  )}&quote=${encodeURIComponent(title)}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — leave silent */
    }
  };

  return (
    <div
      data-testid={`${testidPrefix}-strip`}
      className="flex items-center gap-2 flex-wrap"
    >
      <span className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))] mr-1">
        Share
      </span>
      <a
        href={fbHref}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={`${testidPrefix}-strip-facebook`}
        aria-label="Share on Facebook"
        className="w-9 h-9 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-text))/0.85] hover:text-[hsl(var(--aurin-sage))] hover:border-[hsl(var(--aurin-sage))] transition-colors"
      >
        <Facebook size={14} strokeWidth={1.5} />
      </a>
      <a
        href={SOCIAL.instagram}
        target="_blank"
        rel="noopener noreferrer"
        title="Open Instagram (paste this link in your story)"
        data-testid={`${testidPrefix}-strip-instagram`}
        aria-label="Share on Instagram"
        className="w-9 h-9 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-text))/0.85] hover:text-[hsl(var(--aurin-sage))] hover:border-[hsl(var(--aurin-sage))] transition-colors"
      >
        <Instagram size={14} strokeWidth={1.5} />
      </a>
      <button
        type="button"
        onClick={onCopy}
        data-testid={`${testidPrefix}-strip-copy`}
        className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full border border-[hsl(var(--aurin-border))] text-[12px] text-[hsl(var(--aurin-text))/0.85] hover:text-[hsl(var(--aurin-sage))] hover:border-[hsl(var(--aurin-sage))] transition-colors"
      >
        <Link2 size={12} /> {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
