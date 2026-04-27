import { Instagram } from "lucide-react";
import { SOCIAL } from "@/components/SocialLinks";

/**
 * Quiet, low-pressure call-to-action that appears in the Library and
 * Bookstore. Wording stays calm — no "DON'T MISS OUT" energy. Just an
 * open door for readers who want to hear when new Matrix Protocols arrive.
 */
export default function InstagramCTA({ testidPrefix = "ig-cta", className = "" }) {
  return (
    <a
      href={SOCIAL.instagram}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={`${testidPrefix}-link`}
      className={
        "block aurin-card p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-5 hover:border-[hsl(var(--aurin-sage))] transition-colors group " +
        className
      }
    >
      <div className="w-12 h-12 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0 group-hover:border-[hsl(var(--aurin-sage))] transition-colors">
        <Instagram size={18} strokeWidth={1.4} />
      </div>
      <div className="flex-1">
        <div className="aurin-eyebrow !mb-1">Instagram · @pruesoul.life</div>
        <h3 className="aurin-display text-xl md:text-2xl leading-tight">
          Follow us for{" "}
          <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
            quiet drops.
          </span>
        </h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[58ch]">
          Quiet drops between the books — short reflections, soft visuals,
          and announcements when something new opens here.
        </p>
      </div>
      <div className="text-[12.5px] text-[hsl(var(--aurin-sage))] group-hover:underline shrink-0">
        Open Instagram →
      </div>
    </a>
  );
}
