import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { fetchBlogPost } from "@/lib/api";
import ShareStrip from "@/components/ShareStrip";
import NewsletterSignup from "@/components/NewsletterSignup";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const p = await fetchBlogPost(slug);
        if (alive) setPost(p);
      } catch {
        if (alive) setError("This letter is not available.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div data-testid="page-blog-post-loading" className="aurin-section-sm">
        <div className="aurin-container text-[hsl(var(--aurin-text-muted))]">A small breath…</div>
      </div>
    );
  }
  if (error || !post) {
    return (
      <div data-testid="page-blog-post-error" className="aurin-section-sm">
        <div className="aurin-container">
          <p className="text-[hsl(var(--aurin-text-muted))]">{error || "Not found."}</p>
          <Link to="/blog" className="aurin-btn aurin-btn-ghost mt-6">
            <ArrowLeft size={13} /> Back to letters
          </Link>
        </div>
      </div>
    );
  }

  const url =
    typeof window !== "undefined"
      ? window.location.origin + `/blog/${post.slug}`
      : `/blog/${post.slug}`;

  return (
    <article data-testid="page-blog-post">
      {/* Hero with cover image */}
      <header className="aurin-section-sm">
        <div className="aurin-container max-w-[860px]">
          <Link
            to="/blog"
            data-testid="blog-post-back"
            className="inline-flex items-center gap-1.5 text-[12.5px] text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-sage))] transition-colors mb-6"
          >
            <ArrowLeft size={13} /> All letters
          </Link>
          <div className="aurin-eyebrow mb-4">{post.author || "Prulesoul"}</div>
          <h1
            data-testid="blog-post-title"
            className="aurin-display text-4xl md:text-5xl lg:text-6xl leading-[1.05]"
          >
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="mt-5 aurin-serif-italic text-[hsl(var(--aurin-sage))/0.95] text-xl md:text-2xl leading-snug">
              {post.subtitle}
            </p>
          )}
        </div>
      </header>

      {post.cover_image_url && (
        <div className="aurin-container max-w-[1100px]" data-testid="blog-post-cover">
          <div className="aurin-card overflow-hidden">
            <img
              src={post.cover_image_url}
              alt={post.cover_image_alt || post.title}
              className="w-full h-auto block"
            />
          </div>
        </div>
      )}

      <div className="aurin-section-sm">
        <div className="aurin-container max-w-[760px]">
          {post.excerpt && (
            <p
              data-testid="blog-post-excerpt"
              className="text-[18px] md:text-[20px] leading-[1.7] text-[hsl(var(--aurin-text))/0.94] mb-10 aurin-serif-italic"
            >
              {post.excerpt}
            </p>
          )}

          <div className="mb-8">
            <ShareStrip url={url} title={post.title} testidPrefix="blog-post-share-top" />
          </div>

          {/* Body — rendered HTML from server-side markdown parser */}
          <div
            data-testid="blog-post-body"
            className="aurin-prose serif-body"
            dangerouslySetInnerHTML={{ __html: post.html || "" }}
          />

          {/* Strategic CTA bridge into The Beginning */}
          <div
            data-testid="blog-post-cta"
            className="aurin-card mt-12 p-7 md:p-9 flex flex-col md:flex-row md:items-center gap-5 hover:border-[hsl(var(--aurin-sage))] transition-colors"
          >
            <div className="w-12 h-12 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
              <Compass size={18} strokeWidth={1.4} />
            </div>
            <div className="flex-1">
              <div className="aurin-eyebrow !mb-1">A quiet next step</div>
              <p className="text-[15px] leading-relaxed text-[hsl(var(--aurin-text))/0.94]">
                If this letter resonated, the work of rewriting old code can begin
                anytime. <strong>The Beginning</strong> is a 7-step experience
                designed for exactly this — free, calm, on your own pace.
              </p>
            </div>
            <Link
              to="/the-beginning"
              data-testid="blog-post-cta-begin"
              className="aurin-btn aurin-btn-primary shrink-0"
            >
              Begin
            </Link>
          </div>

          <div className="mt-12">
            <ShareStrip url={url} title={post.title} testidPrefix="blog-post-share-bottom" />
          </div>

          <div className="mt-12">
            <NewsletterSignup
              source={`blog:${post.slug}`}
              eyebrow="Stay close"
              title="Join the prulesoul community for more insights."
            />
          </div>
        </div>
      </div>
    </article>
  );
}
