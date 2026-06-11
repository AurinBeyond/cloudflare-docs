import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Book, Mail, Sparkles, Headphones, ArrowRight } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import MembershipTiers, { WaitlistInline } from "@/components/MembershipTiers";
import { api } from "@/lib/api";
import { track } from "@/lib/telemetry";
import useFreeAccess from "@/hooks/useFreeAccess";
import FreeAccessBadge from "@/components/FreeAccessBadge";

/**
 * Catalogue — public structured archive of every public product.
 *
 * Reads /api/books, /api/courses, /api/clarity/passes. Hides
 * LemonSqueezy variant IDs and any internal flags. Shows pricing,
 * audience, and a soft "view" link to the relevant room.
 *
 * Iter 64 build under $0 stabilization. No new backend.
 */
export default function Catalogue() {
  const [books, setBooks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [passes, setPasses] = useState([]);
  const [availability, setAvailability] = useState({ coming_soon: {}, tiers_in_waitlist: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    track("catalogue_open");
    let alive = true;
    (async () => {
      try {
        const [bRes, cRes, pRes, aRes] = await Promise.allSettled([
          api.get("/books"),
          api.get("/courses"),
          api.get("/clarity/passes"),
          api.get("/catalogue/availability"),
        ]);
        if (!alive) return;
        if (bRes.status === "fulfilled")
          setBooks(Array.isArray(bRes.value.data) ? bRes.value.data : []);
        if (cRes.status === "fulfilled")
          setCourses(cRes.value.data?.courses || []);
        if (pRes.status === "fulfilled")
          setPasses(pRes.value.data?.passes || []);
        if (aRes.status === "fulfilled")
          setAvailability(aRes.value.data || { coming_soon: {}, tiers_in_waitlist: [] });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const adultBooks = books.filter((b) => b.audience !== "kids");
  const kidsBooks = books.filter((b) => b.audience === "kids");

  return (
    <div data-testid="page-catalogue">
      <PageHeader
        eyebrow="Curated archive"
        title="Catalogue"
        description="Every reading, course, and quiet hour available right now. No spreadsheet — only what is ready to be read, walked, or sat with."
      />

      {loading && (
        <section className="aurin-section">
          <div className="aurin-container">
            <p
              className="text-[14px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))]"
              data-testid="catalogue-loading"
            >
              A small breath…
            </p>
          </div>
        </section>
      )}

      {!loading && (
        <>
          {/* ---- 7 Days of Clarity — soft entry banner --------------- */}
          <SevenDaysEntry />

          {/* ---- Membership tiers ----------------------------------- */}
          <MembershipTiers />

          {/* ---- Courses --------------------------------------------- */}
          <Shelf
            testid="catalogue-courses"
            eyebrow="Quiet letters"
            title="Courses"
            intro="Each course arrives one letter at a time. Letter one is a free preview."
            items={courses.map((c) => {
              const cs = availability.coming_soon?.[`course-${c.slug}`];
              return {
                key: c.slug,
                icon: <Mail size={18} strokeWidth={1.4} aria-hidden />,
                title: c.title,
                meta:
                  c.audience === "parents" ? "For parents" : "For adults",
                detail: `${c.letter_count || c.duration_days} letters · ${
                  c.duration_days
                } evenings${c.audio_companion ? " · audio companion" : ""}`,
                blurb: c.blurb,
                price: c.price > 0 ? `$${c.price}` : "Free preview",
                to: `/course-room/${c.slug}`,
                cta: "Read",
                comingSoon: cs || null,
              };
            })}
          />

          {/* ---- Clarity passes -------------------------------------- */}
          <Shelf
            testid="catalogue-passes"
            eyebrow="Quiet hours"
            title="Clarity Release passes"
            intro="A reserved hour with the reflective companion. Beta pricing applies."
            items={passes.map((p) => ({
              key: p.tier,
              icon: <Sparkles size={18} strokeWidth={1.4} aria-hidden />,
              title: p.label,
              meta: p.is_subscription ? "30-day pass" : "Single hour",
              detail: `${
                p.is_subscription
                  ? "Open access for 30 days"
                  : `${p.duration_minutes} minutes`
              }`,
              blurb: p.blurb,
              price: `$${p.price}`,
              to: "/clarity-release",
              cta: "Reserve",
            }))}
          />

          {/* ---- Adult books ---------------------------------------- */}
          <Shelf
            testid="catalogue-books-adult"
            eyebrow="Library"
            title="Books for adults"
            intro="Short, direct readings. Each book is a digital download."
            items={adultBooks.map((b) => {
              const cs = availability.coming_soon?.[`book-${b.slug}`];
              return {
                key: b.slug,
                icon: <Book size={18} strokeWidth={1.4} aria-hidden />,
                title: b.title,
                meta: b.subtitle || "Adult reading",
                detail: (b.tags || []).join(" · ") || "—",
                blurb: b.description,
                price: b.price > 0 ? `$${b.price}` : "Free",
                to: `/library/${b.slug}`,
                cta: "Open",
                comingSoon: cs || null,
              };
            })}
          />

          {/* ---- Kids books ----------------------------------------- */}
          <Shelf
            testid="catalogue-books-kids"
            eyebrow="Kids Universe"
            title="Books for children"
            intro="Gentle bedtime stories. Read aloud, or read together."
            items={kidsBooks.map((b) => {
              const cs = availability.coming_soon?.[`book-${b.slug}`];
              return {
                key: b.slug,
                icon: <Headphones size={18} strokeWidth={1.4} aria-hidden />,
                title: b.title,
                meta: "For children",
                detail: (b.tags || []).join(" · ") || "—",
                blurb: b.description,
                price: b.price > 0 ? `$${b.price}` : "Free gift",
                to: `/library-kids/${b.slug}`,
                cta: "Open",
                comingSoon: cs || null,
              };
            })}
          />

          {/* ---- Free surfaces -------------------------------------- */}
          <section className="aurin-section">
            <div className="aurin-container max-w-[860px]">
              <div className="aurin-eyebrow">Always free</div>
              <h2 className="aurin-display text-2xl md:text-3xl leading-snug mt-2 mb-5">
                Surfaces that ask for nothing.
              </h2>
              <ul
                className="grid sm:grid-cols-2 gap-3 text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))]"
                data-testid="catalogue-free"
              >
                <li>· Body World — fifteen stones, Kaelen as guide</li>
                <li>· Six Nights — six gentle emails, a lead-magnet walk</li>
                <li>· Kids coloring page (daily) + free angel story</li>
                <li>· Aurin Philosophy &amp; The Beginning</li>
                <li>· Memory · Transient Echo (device-bound)</li>
                <li>· Wanderer's Agreement &amp; Legal pages</li>
              </ul>
              <p className="mt-6 text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
                Questions about access, refunds, or memory? Read the{" "}
                <Link
                  to="/faq"
                  className="aurin-link"
                  data-testid="catalogue-faq-link"
                >
                  short FAQ
                </Link>
                .
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Shelf({ testid, eyebrow, title, intro, items }) {
  const freeAccess = useFreeAccess();
  if (!items || items.length === 0) return null;
  return (
    <section className="aurin-section" data-testid={testid}>
      <div className="aurin-container max-w-[1080px]">
        <div className="aurin-eyebrow">{eyebrow}</div>
        <h2 className="aurin-display text-2xl md:text-3xl leading-snug mt-2 mb-2">
          {title}
        </h2>
        {intro && (
          <p className="text-[13.5px] text-[hsl(var(--aurin-text-muted))] max-w-[64ch] mb-6">
            {intro}
          </p>
        )}
        <div className="grid md:grid-cols-2 gap-5">
          {items.map((it) => (
            <article
              key={it.key}
              data-testid={`${testid}-item-${it.key}`}
              className="aurin-card p-5 md:p-6 flex flex-col"
            >
              <div className="flex items-start gap-3">
                <span className="text-[hsl(var(--aurin-sage))] mt-[2px]">
                  {it.icon}
                </span>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[16.5px] font-medium text-[hsl(var(--aurin-text))]">
                      {it.title}
                    </h3>
                    {freeAccess.active && !it.comingSoon ? (
                      <FreeAccessBadge testidSuffix={`${testid}-${it.key}`} />
                    ) : (
                      <span
                        className="text-[12.5px] tracking-[0.04em] text-[hsl(var(--aurin-sage))]"
                        data-testid={`${testid}-price-${it.key}`}
                      >
                        {it.comingSoon ? "Coming soon" : it.price}
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] uppercase tracking-[0.14em] text-[hsl(var(--aurin-text-muted))/0.85] mt-[2px]">
                    {it.meta} · {it.detail}
                  </div>
                </div>
              </div>
              {it.blurb && (
                <p className="mt-3 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] line-clamp-3">
                  {it.blurb}
                </p>
              )}
              {it.comingSoon?.note && (
                <p
                  className="mt-2 text-[12.5px] aurin-serif-italic text-[hsl(var(--aurin-sage))]"
                  data-testid={`${testid}-soon-note-${it.key}`}
                >
                  {it.comingSoon.note}
                </p>
              )}
              <div className="mt-4">
                {it.comingSoon ? (
                  <ComingSoonInline
                    testid={`${testid}-waitlist-${it.key}`}
                    slug={it.comingSoon.waitlist_slug || it.key}
                  />
                ) : (
                  <Link
                    to={it.to}
                    data-testid={`${testid}-cta-${it.key}`}
                    className="inline-flex items-center gap-1.5 text-[13px] aurin-link"
                  >
                    {it.cta} <ArrowRight size={13} strokeWidth={1.6} />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComingSoonInline({ testid, slug }) {
  const [open, setOpen] = useState(false);
  return (
    <div data-testid={testid}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-testid={`${testid}-open`}
          className="inline-flex items-center gap-1.5 text-[13px] aurin-link"
        >
          Join the waitlist <ArrowRight size={13} strokeWidth={1.6} />
        </button>
      ) : (
        <WaitlistInline slug={slug} tierLabel="this title" />
      )}
    </div>
  );
}

function SevenDaysEntry() {
  return (
    <section
      id="7-days-of-clarity"
      className="aurin-section"
      data-testid="catalogue-7days"
    >
      <div className="aurin-container max-w-[760px]">
        <div className="aurin-eyebrow">First door · Free</div>
        <h2 className="aurin-display text-2xl md:text-3xl leading-snug mt-2 mb-3">
          7 Days of Clarity
        </h2>
        <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[60ch] mb-5">
          Enter the Free Resonance Path — a quiet seven-day walk into the
          Transient layer of Matrix Aurin. No charge, no obligation. Leave
          your address and we'll send the first note when the gate opens.
        </p>
        <WaitlistInline slug="7-days-of-clarity" tierLabel="the 7 Days of Clarity" />
      </div>
    </section>
  );
}
