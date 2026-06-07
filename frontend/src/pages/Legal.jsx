/**
 * Legal.jsx — `/legal`
 *
 * §LEGAL 2026-02-13 — Self-contained legal / refund / privacy page.
 * Replaces the previous placeholder that fetched from a non-existent
 * GitHub /legal folder.
 *
 * Strict scope: enough so a buyer feels safe + a regulator can read
 * the basics. Not 20 pages. Not lawyer-perfect. Quiet, plain English,
 * same brand voice as the rest of the site.
 *
 * The three founder-confirmable defaults (operator name, country,
 * contact email) live in the OPERATOR const below — change them in
 * one place and the whole page updates.
 */
import PageHeader from "@/components/layout/PageHeader";

const OPERATOR = {
  // Trading name displayed everywhere a buyer might read it.
  brand: "Matrix Aurin · Prulesoul",
  // Legal person behind the trading name. Anna can refine.
  trader: "Anna, operating as Matrix Aurin / Prulesoul (sole trader)",
  // Country governs which consumer law and which GDPR supervisory
  // authority applies. Anna lives and operates from Norway.
  country: "Norway",
  // Working contact email for refunds, privacy requests, support.
  email: "info@prulesoul.site",
  // What a buyer can realistically expect.
  responseWindow: "within 5 working days",
  // Last reviewed — bump this whenever the page is edited.
  lastUpdated: "2026-02-13",
};

function Section({ id, eyebrow, title, children }) {
  return (
    <article
      id={id}
      data-testid={`legal-section-${id}`}
      className="scroll-mt-24"
    >
      <div className="aurin-eyebrow mb-3">{eyebrow}</div>
      <h2 className="aurin-display text-2xl md:text-3xl mb-6">{title}</h2>
      <div className="aurin-prose text-[15px] leading-[1.85] text-[hsl(var(--aurin-text))/0.92] space-y-5">
        {children}
      </div>
    </article>
  );
}

export default function Legal() {
  return (
    <div data-testid="page-legal">
      <PageHeader
        tone="default"
        eyebrow="Legal · Refunds · Privacy"
        title="The small print,"
        italicWord="in plain English."
        description={`The legal foundation of prulesoul.site. Refunds, privacy, and what you can expect before and after any purchase. Last reviewed ${OPERATOR.lastUpdated}.`}
      />

      <section className="aurin-section-sm">
        <div className="aurin-container max-w-[760px]">
          {/* Quiet table of contents — five anchored sections */}
          <nav
            className="aurin-card p-6 mb-14"
            data-testid="legal-toc"
            aria-label="On this page"
          >
            <p className="aurin-eyebrow mb-4">On this page</p>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 list-decimal list-inside text-[14px] text-[hsl(var(--aurin-text))/0.85]">
              <li><a href="#who-we-are" className="hover:text-[hsl(var(--aurin-sage))]">Who we are</a></li>
              <li><a href="#what-you-buy" className="hover:text-[hsl(var(--aurin-sage))]">What you are buying</a></li>
              <li><a href="#refunds" className="hover:text-[hsl(var(--aurin-sage))]">Refunds</a></li>
              <li><a href="#privacy" className="hover:text-[hsl(var(--aurin-sage))]">Privacy & your data</a></li>
              <li><a href="#responsibility" className="hover:text-[hsl(var(--aurin-sage))]">What this is not</a></li>
            </ol>
          </nav>

          <div className="space-y-16">
            {/* ─────────── 1. Who we are ─────────── */}
            <Section
              id="who-we-are"
              eyebrow="01 · Operator"
              title="Who we are"
            >
              <p>
                <strong>{OPERATOR.brand}</strong> is operated by{" "}
                {OPERATOR.trader}, based in {OPERATOR.country}.
              </p>
              <p>
                If you need to reach a real person — about a refund,
                a download problem, a privacy request, or anything you
                read on this site — write to{" "}
                <a
                  href={`mailto:${OPERATOR.email}`}
                  className="text-[hsl(var(--aurin-sage))] underline-offset-4 hover:underline"
                  data-testid="legal-contact-email"
                >
                  {OPERATOR.email}
                </a>
                . We answer {OPERATOR.responseWindow}. Most things, much
                sooner.
              </p>
            </Section>

            {/* ─────────── 2. What you are buying ─────────── */}
            <Section
              id="what-you-buy"
              eyebrow="02 · The products"
              title="What you are buying"
            >
              <p>
                Every paid item on this site is a one-off purchase of a
                digital good — an audio file, a PDF, or a bundle of
                both. There is no subscription. No automatic billing.
                No “free trial that quietly becomes a charge”.
              </p>
              <p>
                Payments are handled by <strong>Gumroad</strong>, who
                process your card and send the download link. Gumroad’s
                own terms apply to the transaction itself. You can read
                them at{" "}
                <a
                  href="https://gumroad.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(var(--aurin-sage))] underline-offset-4 hover:underline"
                >
                  gumroad.com/terms
                </a>
                .
              </p>
              <p>
                After your purchase, the file is yours. You may keep it,
                listen to it on any device you own, and return to it as
                often as you like. We do not track who opens what.
              </p>
            </Section>

            {/* ─────────── 3. Refunds ─────────── */}
            <Section
              id="refunds"
              eyebrow="03 · Refunds"
              title="14-day no-questions refund"
            >
              <p>
                Every paid item on this site comes with a{" "}
                <strong>14-day no-questions refund</strong>. If you buy
                something and decide within 14 days that it is not for
                you, you get a full refund. You do not have to explain
                why. You do not have to send the file back.
              </p>
              <p>
                There are two ways to ask for a refund:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>Through Gumroad</strong> — open the original
                  receipt email, click <em>“Request refund”</em>, and
                  it is handled in their system.
                </li>
                <li>
                  <strong>Directly to us</strong> — write to{" "}
                  <a
                    href={`mailto:${OPERATOR.email}`}
                    className="text-[hsl(var(--aurin-sage))] underline-offset-4 hover:underline"
                  >
                    {OPERATOR.email}
                  </a>{" "}
                  from the same email you used to buy. We will refund
                  through Gumroad and reply when it is done.
                </li>
              </ul>
              <p>
                Refunds typically appear on your card within 5–10
                working days, depending on your bank. If something
                stalls, write to us — we follow up with Gumroad on
                your behalf.
              </p>
            </Section>

            {/* ─────────── 4. Privacy ─────────── */}
            <Section
              id="privacy"
              eyebrow="04 · Privacy"
              title="Privacy & your data"
            >
              <p>
                We were careful when we built this site to ask for as
                little as possible. Here is the full list of every
                situation in which we collect or store anything about you.
              </p>

              <h3 className="aurin-display text-xl mt-6 mb-2">
                When you just visit
              </h3>
              <p>
                We use <strong>Plausible</strong>, a privacy-first
                analytics tool that does not use cookies and does not
                track you across sites. It tells us anonymous things
                like “how many people read this page today” — never who
                you are. There is no Google Analytics, no Meta pixel,
                no advertising tracker anywhere on this site.
              </p>

              <h3 className="aurin-display text-xl mt-6 mb-2">
                When you leave your email (Hearth letters)
              </h3>
              <p>
                If you sign up to receive the Hearth letters, we store
                your email and a timestamp in our own database. We send
                three letters by email through Resend, and then we stop.
                Every email has a one-click unsubscribe link.
              </p>
              <p>
                We never sell, share, or rent your email. We do not use
                it for retargeting. If you unsubscribe, the row is
                marked inactive and never used again.
              </p>

              <h3 className="aurin-display text-xl mt-6 mb-2">
                When you buy something
              </h3>
              <p>
                Your card details never touch this site. Gumroad
                processes the payment directly and stores the
                transaction record. The only thing we learn is that a
                purchase happened — usually just an email and the
                product name. Gumroad’s own privacy policy applies to
                the rest. You can read it at{" "}
                <a
                  href="https://gumroad.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(var(--aurin-sage))] underline-offset-4 hover:underline"
                >
                  gumroad.com/privacy
                </a>
                .
              </p>

              <h3 className="aurin-display text-xl mt-6 mb-2">
                Your rights
              </h3>
              <p>
                Under the EU GDPR (which applies in Norway via the EEA
                Agreement) and the Norwegian Personal Data Act
                (personopplysningsloven), you have the right to ask us:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>what data we hold about you</li>
                <li>to correct it, if anything is wrong</li>
                <li>to delete it (the “right to be forgotten”)</li>
                <li>to receive it as a file you can take elsewhere</li>
              </ul>
              <p>
                Write to{" "}
                <a
                  href={`mailto:${OPERATOR.email}`}
                  className="text-[hsl(var(--aurin-sage))] underline-offset-4 hover:underline"
                >
                  {OPERATOR.email}
                </a>{" "}
                from the address the data is tied to, and we will reply
                {" "}{OPERATOR.responseWindow}. There is no form to fill
                in, no ticketing system, no “please wait three weeks”.
              </p>
            </Section>

            {/* ─────────── 5. Responsibility ─────────── */}
            <Section
              id="responsibility"
              eyebrow="05 · Responsibility"
              title="What this is not"
            >
              <p>
                Matrix Aurin is a quiet place to read, listen and
                reflect. It is built with care, but it is not a
                substitute for any of the following, and we want this
                to be plainly said:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>It is <strong>not therapy</strong> and not a replacement for a therapist or counsellor.</li>
                <li>It is <strong>not medical advice</strong> and not a replacement for a doctor.</li>
                <li>It is <strong>not crisis support</strong>. If you or someone near you is in danger, please contact your local emergency services or a recognised crisis line.</li>
                <li>It is <strong>not financial or legal advice</strong>.</li>
              </ul>
              <p>
                The stories, audio, and reading rooms are written by
                people, for people, in plain language. Use your own
                judgement. Stop reading or listening if something does
                not feel right for you.
              </p>
            </Section>

            {/* ─────────── Footer note ─────────── */}
            <div
              className="border-t border-[hsl(var(--aurin-border-soft))] pt-8 text-[13px] text-[hsl(var(--aurin-text-muted))] italic"
              data-testid="legal-last-reviewed"
            >
              Last reviewed {OPERATOR.lastUpdated}. We update this page
              whenever something material changes and we say so on the
              homepage when it does. If you spot anything unclear or
              wrong, write to{" "}
              <a
                href={`mailto:${OPERATOR.email}`}
                className="text-[hsl(var(--aurin-sage))] underline-offset-4 hover:underline"
              >
                {OPERATOR.email}
              </a>
              . We will fix it.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
