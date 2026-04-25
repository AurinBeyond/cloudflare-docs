import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import InstagramCTA from "@/components/InstagramCTA";
import { fetchBlogPosts } from "@/lib/api";
import { ArrowRight } from "lucide-react";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await fetchBlogPosts();
        if (alive) setPosts(list || []);
      } catch (e) {
        if (alive) setError("Could not load posts.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div data-testid="page-blog">
      <PageHeader
        tone="default"
        eyebrow="Insights · Blog"
        title="Long-form letters"
        italicWord="from prulesoul."
        description="Quiet, direct writing on the patterns that shape us — and the conscious work of rewriting them."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container">
          {loading && (
            <div data-testid="blog-loading" className="text-[hsl(var(--aurin-text-muted))]">
              Loading…
            </div>
          )}
          {error && (
            <div data-testid="blog-error" className="text-red-300/90">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7" data-testid="blog-grid">
            <div className="lg:col-span-8 space-y-7">
              {posts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  data-testid={`blog-card-${p.slug}`}
                  className="block aurin-card overflow-hidden group hover:border-[hsl(var(--aurin-sage))] transition-colors"
                >
                  {p.cover_image_url && (
                    <div className="aspect-[16/9] overflow-hidden bg-black/20">
                      <img
                        src={p.cover_image_url}
                        alt={p.cover_image_alt || p.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-7 md:p-9">
                    <div className="aurin-eyebrow !mb-2">{p.author || "Prulesoul"}</div>
                    <h3 className="aurin-display text-2xl md:text-3xl leading-tight">
                      {p.title}
                    </h3>
                    {p.subtitle && (
                      <p className="mt-2 aurin-serif-italic text-[hsl(var(--aurin-sage))/0.95] text-lg">
                        {p.subtitle}
                      </p>
                    )}
                    {p.excerpt && (
                      <p className="mt-4 text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[60ch]">
                        {p.excerpt}
                      </p>
                    )}
                    <div className="mt-6 inline-flex items-center gap-1.5 text-[12.5px] text-[hsl(var(--aurin-sage))] group-hover:underline">
                      Read the post <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              ))}
              {!loading && posts.length === 0 && (
                <div
                  data-testid="blog-empty"
                  className="text-center py-20 text-[hsl(var(--aurin-text-muted))]"
                >
                  Letters arrive slowly. The first one is on its way.
                </div>
              )}
            </div>

            <aside className="lg:col-span-4">
              <InstagramCTA testidPrefix="blog-ig-cta" />
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
