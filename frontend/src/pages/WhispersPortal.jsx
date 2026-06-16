import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { ArrowLeft, Copy, Check, ExternalLink } from "lucide-react";

/**
 * Whispers Portal — a private, link-only landing page for the
 * micro-influencers ("Whispers") who have agreed to share Matrix
 * Aurin in their own quiet voice. Not linked from the main nav.
 *
 * What it offers:
 *   - Their personal tracking link (?w=<slug>)
 *   - Three pre-written DM scripts (kept in the same voice)
 *   - Direct download links for the three "share-ready" assets
 *   - A reminder of how the attribution works
 *
 * The slug is read from the URL (`?w=<slug>`) so a single page
 * dynamically becomes "your" page. No login required — the link is
 * the credential. Founder shares the link 1:1.
 */

const SCRIPTS = [
  {
    key: "first-letter",
    label: "First letter — for someone who has been quiet lately",
    text:
`Hey — sending this gently.

I've been reading from a small place online called Matrix Aurin.
It's the calmest writing I've found in a long while. There is a
free bedtime book for children, and a few short books for adults
about boundaries and the body.

If any of it lands at the right time, it lands. If not, no need.

{LINK}`,
  },
  {
    key: "story-share",
    label: "Story share — when reposting one of our images",
    text:
`Found this earlier — quiet, slow, real. The whole site reads
like a long bedtime letter rather than a course.

{LINK}`,
  },
  {
    key: "dm-warm",
    label: "Warm DM — to someone who already knows you",
    text:
`Hi {name},

A friend wrote a small platform that I think you'd like — it's
called Matrix Aurin. The bedtime book is free, and the rest of
it is the most non-shouty thing I've found.

{LINK}

No rush, no follow-up. Sleep well.`,
  },
];

const ASSETS = [
  {
    label: "Body World — Throat (the unspoken)",
    href: "/api/body-room/image/throat-unspoken",
    description: "1:1 sage-on-black silhouette · ideal for IG square",
  },
  {
    label: "Body World — Hips (the archive)",
    href: "/api/body-room/image/hips-archive",
    description: "1:1 sage-on-black · works well as a Pin",
  },
  {
    label: "Body Room — Heart (the compass)",
    href: "/api/body-room/image/heart-compass",
    description: "1:1 sage-on-black · evergreen aesthetic post",
  },
  {
    label: "Night Angel — book cover",
    href: "/api/books/cover/the-night-angels-embrace.jpg",
    description: "3:4 portrait · pairs well with the free PDF link",
  },
];

export default function WhispersPortal() {
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setSlug((p.get("w") || "").trim().toLowerCase());
  }, []);

  const link = slug
    ? `https://prulesoul.site/?w=${encodeURIComponent(slug)}`
    : "https://prulesoul.site/?w=YOUR-NAME";

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text.replaceAll("{LINK}", link));
      setCopied(key);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      /* graceful no-op */
    }
  };

  return (
    <div data-testid="page-whispers-portal">
      <PageHeader
        eyebrow="Whispers · Quiet partners"
        title="Your link,"
        italicWord="and three quiet scripts."
        description="A private page for those who've agreed to share Matrix Aurin in their own voice. Take what fits. Skip what doesn't."
      >
        <Link to="/" className="aurin-btn aurin-btn-ghost" data-testid="whispers-back">
          <ArrowLeft size={13} /> Home
        </Link>
      </PageHeader>

      <section className="aurin-section-sm">
        <div className="aurin-container max-w-[820px]">
          {!slug && (
            <div
              className="aurin-card p-5 mb-8 text-[13.5px] text-[hsl(var(--aurin-text-muted))]"
              data-testid="whispers-no-slug"
            >
              <strong className="text-[hsl(var(--aurin-text))]">
                No personal slug detected.
              </strong>{" "}
              Add <code className="aurin-serif-italic">?w=YOUR-NAME</code> to
              this page&apos;s URL — for example{" "}
              <code>/whispers-portal?w=anna</code> — and your link will
              appear below.
            </div>
          )}

          <div className="aurin-card p-7" data-testid="whispers-link-card">
            <div className="aurin-eyebrow mb-2">your link</div>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <code
                className="flex-1 text-[14px] font-mono px-4 py-3 rounded-lg bg-[hsl(var(--aurin-bg))]/50 border border-[hsl(var(--aurin-border-soft))] break-all"
                data-testid="whispers-link"
              >
                {link}
              </code>
              <button
                onClick={() => handleCopy(link, "link")}
                data-testid="whispers-link-copy"
                className="aurin-btn aurin-btn-primary md:shrink-0"
              >
                {copied === "link" ? (
                  <>
                    <Check size={13} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Copy link
                  </>
                )}
              </button>
            </div>
            <p className="mt-5 text-[13px] text-[hsl(var(--aurin-text-muted))] leading-relaxed">
              When someone clicks this link, the site quietly remembers your
              slug for 30 days. If they later read a book or visit the
              Cabinet, the founder sees that you were the door they walked
              through — and reaches out to thank you.
            </p>
          </div>
        </div>
      </section>

      <section className="aurin-section-sm">
        <div className="aurin-container max-w-[820px]">
          <h2 className="aurin-display text-3xl md:text-[40px] leading-[1.1] mb-2">
            Three short{" "}
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">scripts.</span>
          </h2>
          <p className="text-[14px] text-[hsl(var(--aurin-text-muted))] mb-8 max-w-[60ch]">
            Edit any line. The voice is calm, the link is already replaced
            with yours when you press &quot;copy&quot;.
          </p>

          <div className="space-y-5" data-testid="whispers-scripts">
            {SCRIPTS.map((s) => (
              <div
                key={s.key}
                className="aurin-card p-6"
                data-testid={`whispers-script-${s.key}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="aurin-eyebrow">{s.label}</div>
                  <button
                    onClick={() => handleCopy(s.text, s.key)}
                    data-testid={`whispers-script-${s.key}-copy`}
                    className="aurin-btn aurin-btn-ghost !py-1.5 !px-3 !text-[12px]"
                  >
                    {copied === s.key ? (
                      <>
                        <Check size={12} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy script
                      </>
                    )}
                  </button>
                </div>
                <pre className="font-sans text-[13.5px] leading-[1.75] whitespace-pre-wrap text-[hsl(var(--aurin-text))/0.92]">
                  {s.text.replaceAll("{LINK}", link)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="aurin-section-sm">
        <div className="aurin-container max-w-[820px]">
          <h2 className="aurin-display text-3xl md:text-[40px] leading-[1.1] mb-2">
            Share-ready{" "}
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">images.</span>
          </h2>
          <p className="text-[14px] text-[hsl(var(--aurin-text-muted))] mb-8 max-w-[60ch]">
            Download, post, attribute as you like — or don&apos;t attribute,
            we don&apos;t mind. Each pairs naturally with one of the scripts above.
          </p>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            data-testid="whispers-assets"
          >
            {ASSETS.map((a) => (
              <a
                key={a.href}
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                className="aurin-card p-5 hover:border-[hsl(var(--aurin-sage)_/_0.55)] transition-colors flex items-center gap-4"
                data-testid={`whispers-asset-${a.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              >
                <ExternalLink size={16} className="text-[hsl(var(--aurin-sage))] shrink-0" />
                <div>
                  <div className="text-[14px] font-medium">{a.label}</div>
                  <div className="text-[12.5px] text-[hsl(var(--aurin-text-muted))] mt-1">
                    {a.description}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
