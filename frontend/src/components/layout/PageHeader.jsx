/**
 * Shared page header — gives every inner page a consistent opening
 * while allowing a subtle thematic accent via `tone` prop.
 *
 * tone: "default" | "library" | "kids" | "meditation" | "portal"
 */
export default function PageHeader({
  eyebrow,
  title,
  italicWord,
  description,
  tone = "default",
  children,
  testid = "page-header",
}) {
  const accent = {
    default: "hsl(var(--aurin-sage))",
    library: "hsl(var(--aurin-sand))",
    kids: "#E3B48C",
    meditation: "hsl(var(--aurin-sage))",
    portal: "hsl(var(--aurin-text))",
  }[tone];

  return (
    <section
      data-testid={testid}
      className="relative overflow-hidden border-b border-[hsl(var(--aurin-border-soft))]"
    >
      <div className="absolute inset-0 aurin-grid-bg opacity-[0.22]" />
      <div className="absolute inset-0 aurin-glow" />
      <div className="aurin-container relative pt-20 md:pt-28 pb-16 md:pb-20">
        <div className="aurin-eyebrow aurin-fade-up" data-testid="page-eyebrow">
          {eyebrow}
        </div>
        <h1
          className="aurin-display mt-6 text-[44px] sm:text-5xl lg:text-[68px] max-w-[18ch] aurin-fade-up aurin-delay-1"
          data-testid="page-title"
        >
          {title}{" "}
          {italicWord && (
            <span
              className="aurin-serif-italic"
              style={{ color: accent }}
            >
              {italicWord}
            </span>
          )}
        </h1>
        {description && (
          <p
            className="mt-7 max-w-[58ch] text-[15.5px] md:text-base leading-[1.75] text-[hsl(var(--aurin-text-muted))] aurin-fade-up aurin-delay-2"
            data-testid="page-description"
          >
            {description}
          </p>
        )}
        {children && (
          <div className="mt-10 aurin-fade-up aurin-delay-3">{children}</div>
        )}
      </div>
    </section>
  );
}
