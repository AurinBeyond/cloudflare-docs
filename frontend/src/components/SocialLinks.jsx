import { Instagram, Facebook } from "lucide-react";

/**
 * Single source of truth for the brand's social handles.
 * Used in the Footer, Reach Out page, and anywhere else a quiet
 * "follow us" cluster needs to appear.
 */
export const SOCIAL = {
  instagram: "https://www.instagram.com/pruesoul.life/",
  facebook: "https://www.facebook.com/groups/4059152880969336/",
};

const ICONS = [
  { key: "instagram", href: SOCIAL.instagram, label: "Instagram", Icon: Instagram },
  { key: "facebook", href: SOCIAL.facebook, label: "Facebook group", Icon: Facebook },
];

export default function SocialLinks({ size = 14, variant = "row", testidPrefix = "social" }) {
  const cls =
    variant === "row"
      ? "flex items-center gap-3"
      : "flex flex-col gap-3";

  return (
    <div className={cls} data-testid={`${testidPrefix}-links`}>
      {ICONS.map(({ key, href, label, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          data-testid={`${testidPrefix}-${key}`}
          className="inline-flex items-center gap-2 text-[12.5px] uppercase tracking-[0.18em] text-[hsl(var(--aurin-text))/0.78] hover:text-[hsl(var(--aurin-sage))] transition-colors"
        >
          <span className="w-9 h-9 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center group-hover:border-[hsl(var(--aurin-sage))] transition-colors">
            <Icon size={size} strokeWidth={1.5} />
          </span>
          {variant === "row+labels" && <span>{label}</span>}
        </a>
      ))}
    </div>
  );
}
