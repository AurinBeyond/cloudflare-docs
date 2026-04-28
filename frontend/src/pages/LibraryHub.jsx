import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import InstagramCTA from "@/components/InstagramCTA";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Compass, BookOpen, Sparkles } from "lucide-react";

/**
 * Library hub — splits into Adults and Kids.
 * Free reading. No login required.
 */
export default function LibraryHub() {
  return (
    <div data-testid="page-library-hub">
      <PageHeader
        tone="library"
        eyebrow="Library · Free reading"
        title="A quiet shelf,"
        italicWord="freely open."
        description="Take what you need. Leave what doesn't speak. Two doors — one for adults, one for children."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-testid="library-hub-grid">
            <Link
              to="/library/adults"
              data-testid="library-hub-adults"
              className="aurin-card p-8 md:p-10 group hover:border-[hsl(var(--aurin-sage))] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
                  <BookOpen size={18} strokeWidth={1.4} />
                </div>
                <div>
                  <div className="aurin-eyebrow !mb-1">For adults</div>
                  <h3 className="aurin-display text-2xl md:text-3xl leading-tight">
                    Sometimes one thought is enough{" "}
                    <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                      to set something moving.
                    </span>
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[58ch]">
                    Take what you need here. No obligation.
                  </p>
                  <div className="mt-5 text-[12.5px] text-[hsl(var(--aurin-sage))] group-hover:underline">
                    Open the adults' room →
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/library/kids"
              data-testid="library-hub-kids"
              className="aurin-card p-8 md:p-10 group hover:border-[hsl(var(--aurin-sage))] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
                  <Sparkles size={18} strokeWidth={1.4} />
                </div>
                <div>
                  <div className="aurin-eyebrow !mb-1">For children</div>
                  <h3 className="aurin-display text-2xl md:text-3xl leading-tight">
                    A child doesn't need more noise.{" "}
                    <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                      They need space.
                    </span>
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[58ch]">
                    A place where imagination can breathe freely.
                  </p>
                  <div className="mt-5 text-[12.5px] text-[hsl(var(--aurin-sage))] group-hover:underline">
                    Open the children's room →
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <Link
                to="/the-beginning"
                data-testid="library-hub-the-beginning"
                className="block aurin-card p-7 group hover:border-[hsl(var(--aurin-sage))] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
                    <Compass size={16} strokeWidth={1.4} />
                  </div>
                  <div>
                    <div className="aurin-eyebrow !mb-1">The Beginning · Free</div>
                    <h3 className="aurin-display text-xl md:text-2xl leading-tight">
                      A quiet shift starts when you{" "}
                      <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                        see clearly.
                      </span>
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
                      Seven small steps. Free for now. What you write stays
                      yours alone.
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="lg:col-span-5">
              <InstagramCTA testidPrefix="library-hub-ig-cta" />
            </div>
          </div>
        </div>
      </section>

      {/* Soft email capture — bottom of the library hub */}
      <section className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container max-w-[640px]">
          <NewsletterSignup
            source="library:hub"
            eyebrow="A quiet way to stay close"
            title="A note now and then. Nothing more."
            testidPrefix="library-newsletter"
          />
        </div>
      </section>
    </div>
  );
}
