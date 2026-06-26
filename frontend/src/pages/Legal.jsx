/**
 * Legal.jsx — `/legal`  (EU-COMPLIANT REWRITE 2026-02-29)
 *
 * §LEGAL-V2 2026-02-29 — Comprehensive legal page covering:
 *   01 · Who we are (operator + contact)
 *   02 · What you are buying (subscriptions + day pass + top-ups)
 *   03 · Terms of Service
 *   04 · Refund Policy (14-day EU withdrawal + house promise)
 *   05 · Privacy & GDPR (legal bases, processors, retention, rights)
 *   06 · Cookies (essential only — no consent banner needed)
 *   07 · Accessibility Statement
 *   08 · Kids (Polarstar) — parent-oriented protection
 *   09 · What this is not (AI / therapy / medical disclaimer)
 *   10 · Disputes & supervisory authority
 *
 * Design lock: paper-on-dark aesthetic preserved. No emoji. Same
 * brand voice. Plain English. One page so a regulator can read it
 * straight through; deep links per section.
 */
import PageHeader from "@/components/layout/PageHeader";

const OPERATOR = {
  brand: "Matrix Aurin · Prulesoul",
  trader: "Anna — sole trader, operating as Matrix Aurin / Prulesoul",
  jurisdiction: "European Union (Republic of Estonia)",
  email: "info@prulesoul.site",
  privacyEmail: "info@prulesoul.site",
  responseWindow: "within 5 working days",
  lastUpdated: "2026-02-29",
  supervisoryAuthority: {
    name: "Estonian Data Protection Inspectorate (Andmekaitse Inspektsioon)",
    url: "https://www.aki.ee/en",
  },
};

const PROCESSORS = [
  {
    name: "Polar Software Inc. (Polar.sh)",
    role: "Merchant of Record · subscription & one-shot payments",
    region: "United States · GDPR DPA in place",
    link: "https://polar.sh/legal/privacy",
  },
  {
    name: "ElevenLabs Inc.",
    role: "Real-time voice synthesis (Conversational AI keepers)",
    region: "United States · GDPR DPA in place",
    link: "https://elevenlabs.io/privacy-policy",
  },
  {
    name: "Resend, Inc.",
    role: "Transactional email (refund notes, magic links, replies)",
    region: "United States · GDPR DPA in place",
    link: "https://resend.com/legal/privacy-policy",
  },
  {
    name: "MongoDB Atlas (MongoDB, Inc.)",
    role: "Database — your account, intakes, voice-minute ledger",
    region: "European Union (Frankfurt region)",
    link: "https://www.mongodb.com/legal/privacy/privacy-policy",
  },
  {
    name: "Emergent (hosting + AI text inference)",
    role: "Application hosting and LLM relay for the written keepers",
    region: "European Union",
    link: "https://emergent.sh/privacy",
  },
  {
    name: "Plausible Analytics (Plausible Insights OÜ)",
    role: "Privacy-first, cookieless visitor counts",
    region: "European Union (Estonia)",
    link: "https://plausible.io/privacy",
  },
];

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

function MailLink() {
  return (
    <a
      href={`mailto:${OPERATOR.email}`}
      className="text-[hsl(var(--aurin-sage))] underline-offset-4 hover:underline"
      data-testid="legal-contact-email"
    >
      {OPERATOR.email}
    </a>
  );
}

export default function Legal() {
  return (
    <div data-testid="page-legal">
      <PageHeader
        tone="default"
        eyebrow="Legal · Privacy · Refunds"
        title="The small print,"
        italicWord="in plain English."
        description={`The full legal foundation of prulesoul.site — terms, privacy, refunds, cookies, accessibility, and the rights you have under EU law. Last reviewed ${OPERATOR.lastUpdated}.`}
      />

      <section className="aurin-section-sm">
        <div className="aurin-container max-w-[800px]">
          {/* Table of contents */}
          <nav
            className="aurin-card p-6 mb-14"
            data-testid="legal-toc"
            aria-label="On this page"
          >
            <p className="aurin-eyebrow mb-4">On this page</p>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 list-decimal list-inside text-[14px] text-[hsl(var(--aurin-text))/0.85]">
              <li><a href="#who-we-are" className="hover:text-[hsl(var(--aurin-sage))]">Who we are</a></li>
              <li><a href="#what-you-buy" className="hover:text-[hsl(var(--aurin-sage))]">What you are buying</a></li>
              <li><a href="#terms" className="hover:text-[hsl(var(--aurin-sage))]">Terms of service</a></li>
              <li><a href="#refunds" className="hover:text-[hsl(var(--aurin-sage))]">Refunds & withdrawal</a></li>
              <li><a href="#privacy" className="hover:text-[hsl(var(--aurin-sage))]">Privacy & GDPR</a></li>
              <li><a href="#cookies" className="hover:text-[hsl(var(--aurin-sage))]">Cookies</a></li>
              <li><a href="#accessibility" className="hover:text-[hsl(var(--aurin-sage))]">Accessibility</a></li>
              <li><a href="#kids" className="hover:text-[hsl(var(--aurin-sage))]">Polarstar Kids</a></li>
              <li><a href="#responsibility" className="hover:text-[hsl(var(--aurin-sage))]">What this is not</a></li>
              <li><a href="#disputes" className="hover:text-[hsl(var(--aurin-sage))]">Disputes</a></li>
            </ol>
          </nav>

          <div className="space-y-16">
            {/* ─────────── 01 · Who we are ─────────── */}
            <Section id="who-we-are" eyebrow="01 · Operator" title="Who we are">
              <p>
                <strong>{OPERATOR.brand}</strong> is operated by{" "}
                {OPERATOR.trader}, in the {OPERATOR.jurisdiction}.
              </p>
              <p>
                The single working contact for refunds, support,
                privacy requests, complaints, and anything you read on
                this site is <MailLink />. We answer{" "}
                {OPERATOR.responseWindow} — most things much sooner.
              </p>
              <p>
                There is no ticketing system. There is no phone tree.
                A real person reads the inbox and replies.
              </p>
            </Section>

            {/* ─────────── 02 · What you are buying ─────────── */}
            <Section id="what-you-buy" eyebrow="02 · The products" title="What you are buying">
              <p>
                Three kinds of access are sold on this site, each a
                digital product:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>Day Pass · 24h (€19)</strong> — one-off
                  purchase. Twenty-four hours of one room. Nothing
                  renews; the door closes at sunrise.
                </li>
                <li>
                  <strong>Journey / Companion / Lantern</strong> —
                  recurring monthly subscriptions (€29 / €49 / €69).
                  You can cancel at any time from your account; the
                  current paid month always finishes naturally.
                </li>
                <li>
                  <strong>Voice top-ups</strong> — one-off prepaid
                  minute packages (€11 / €24 / €49 / €109). They add
                  to your existing minute balance and never replace it.
                </li>
              </ul>
              <p>
                Payments are processed by <strong>Polar Software Inc.</strong>,
                our Merchant of Record. Your card details never touch
                this site. Polar issues the invoice and handles
                applicable VAT for your country. You can read Polar&apos;s
                terms at{" "}
                <a
                  href="https://polar.sh/legal/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(var(--aurin-sage))] underline-offset-4 hover:underline"
                >
                  polar.sh/legal/terms
                </a>
                .
              </p>
              <p>
                Access activates within seconds of a successful payment
                via a signed webhook from Polar. If activation ever
                stalls, write to <MailLink /> and we will resolve it
                manually within hours.
              </p>
            </Section>

            {/* ─────────── 03 · Terms of service ─────────── */}
            <Section id="terms" eyebrow="03 · Terms" title="Terms of service">
              <p>
                By using this site you agree to a short set of common-
                sense terms.
              </p>
              <h3 className="aurin-display text-xl mt-6 mb-2">Acceptable use</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>One account per person. You are responsible for keeping your sign-in private.</li>
                <li>Do not attempt to extract, scrape, resell, or republish the keeper conversations, voice recordings, letters, or audio without written permission.</li>
                <li>Do not use the keepers to generate hateful, sexual, violent, or illegal content. Polarstar Kids is strictly off-limits for adult content under any framing.</li>
                <li>If you spot a security issue, write to <MailLink /> — we treat responsible disclosure with respect, not lawyers.</li>
              </ul>
              <h3 className="aurin-display text-xl mt-6 mb-2">Suspension</h3>
              <p>
                We reserve the right to suspend an account that breaks
                the rules above or that we reasonably believe is
                automated abuse. Suspension comes with a written
                explanation and a refund of any unused subscription
                period.
              </p>
              <h3 className="aurin-display text-xl mt-6 mb-2">Changes</h3>
              <p>
                These terms can change as the house grows. Any change
                that affects an existing subscriber will be announced
                by email at least 30 days before it takes effect, and
                you can cancel before then with a full refund of the
                upcoming cycle.
              </p>
              <h3 className="aurin-display text-xl mt-6 mb-2">Governing law</h3>
              <p>
                These terms are governed by the law of the Republic of
                Estonia and the EU consumer-rights framework. Nothing
                in these terms limits a right you have as an EU consumer.
              </p>
            </Section>

            {/* ─────────── 04 · Refunds ─────────── */}
            <Section id="refunds" eyebrow="04 · Refunds & withdrawal" title="14-day withdrawal + our house promise">
              <h3 className="aurin-display text-xl mt-2 mb-2">Your EU withdrawal right (Directive 2011/83/EU)</h3>
              <p>
                As an EU consumer you have a <strong>14-day right of
                withdrawal</strong> from any digital-content purchase
                made on this site. You do not need to give a reason.
              </p>
              <p>
                Because digital content is delivered immediately, the
                checkout asks you to acknowledge that delivery starts
                at once. This is a legal pre-condition for selling
                digital goods inside the EU — it does <em>not</em>{" "}
                remove your refund right described below.
              </p>
              <h3 className="aurin-display text-xl mt-6 mb-2">Our house promise (broader than the law requires)</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>Day Pass</strong> — full refund within 24
                  hours if you have not actively used the room.
                </li>
                <li>
                  <strong>Subscriptions</strong> — cancel anytime from
                  your account. The current paid month finishes
                  naturally; we do not pro-rate, and we do not charge
                  the next month. If a charge happened and you did not
                  intend it, we refund it on request.
                </li>
                <li>
                  <strong>Voice top-ups</strong> — full refund of any
                  unused minutes within 14 days of purchase. After 14
                  days, refunds are at our discretion but we are
                  generous.
                </li>
              </ul>
              <p>
                Two ways to ask for a refund:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>Through Polar</strong> — your receipt email
                  has a refund link. It is handled in Polar&apos;s system.
                </li>
                <li>
                  <strong>Directly to us</strong> — write to <MailLink />{" "}
                  from the email you used to buy. We refund through
                  Polar and reply when it is done.
                </li>
              </ul>
              <p>
                Refunds appear on your card within 5–10 working days
                depending on your bank. If something stalls, write to
                us — we chase Polar on your behalf.
              </p>
            </Section>

            {/* ─────────── 05 · Privacy & GDPR ─────────── */}
            <Section id="privacy" eyebrow="05 · Privacy" title="Privacy & your data (GDPR)">
              <p>
                We were careful when we built this site to ask for as
                little as possible. This section is the complete picture.
              </p>

              <h3 className="aurin-display text-xl mt-6 mb-2">Data controller</h3>
              <p>
                The data controller for everything on this site is{" "}
                {OPERATOR.trader}. Contact: <MailLink />.
              </p>

              <h3 className="aurin-display text-xl mt-6 mb-2">What we collect, why, and the legal basis</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>Account (email, name if given)</strong> — to
                  let you sign in and to deliver what you bought.{" "}
                  <em>Legal basis: contract (GDPR Art. 6(1)(b)).</em>
                </li>
                <li>
                  <strong>Voice-minute ledger + conversation memory</strong>{" "}
                  — to keep your room continuous from one session to
                  the next.{" "}
                  <em>Legal basis: contract (Art. 6(1)(b)).</em>
                </li>
                <li>
                  <strong>Payment record (transaction ID, amount, SKU)</strong>{" "}
                  — to fulfil the order and to keep VAT records.{" "}
                  <em>Legal basis: legal obligation (Art. 6(1)(c))
                  and contract.</em>
                </li>
                <li>
                  <strong>Hearth letters list (email)</strong> — to
                  send the three opening letters and any future
                  invitations.{" "}
                  <em>Legal basis: consent (Art. 6(1)(a)), withdrawable
                  any time via the unsubscribe link.</em>
                </li>
                <li>
                  <strong>Support inbox (Reach Out form)</strong> — to
                  reply to your question.{" "}
                  <em>Legal basis: legitimate interest in answering
                  support requests (Art. 6(1)(f)).</em>
                </li>
                <li>
                  <strong>Anonymous visit counts (Plausible)</strong>{" "}
                  — to know which pages help. No cookies, no
                  cross-site tracking, no profiling.{" "}
                  <em>Legal basis: legitimate interest (Art. 6(1)(f)).</em>
                </li>
              </ul>

              <h3 className="aurin-display text-xl mt-6 mb-2">Processors</h3>
              <p>
                We use a small number of carefully chosen processors.
                Each has a signed Data Processing Agreement (DPA) on
                file:
              </p>
              <ul
                className="space-y-3 mt-2"
                data-testid="legal-processors-list"
              >
                {PROCESSORS.map((p) => (
                  <li
                    key={p.name}
                    className="border-l-2 pl-4 py-1"
                    style={{ borderColor: "rgba(196,164,107,0.45)" }}
                  >
                    <p className="text-[14.5px]">
                      <strong>{p.name}</strong>
                    </p>
                    <p className="text-[13px] text-[hsl(var(--aurin-text))/0.72]">
                      {p.role} · {p.region}
                    </p>
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12.5px] text-[hsl(var(--aurin-sage))] underline-offset-4 hover:underline"
                      >
                        Their privacy policy →
                      </a>
                    )}
                  </li>
                ))}
              </ul>

              <h3 className="aurin-display text-xl mt-6 mb-2">International transfers</h3>
              <p>
                Some processors (Polar, ElevenLabs, Resend) are
                established in the United States. Transfers to those
                providers are covered by Standard Contractual Clauses
                under GDPR Art. 46 and, where applicable, the
                EU–US Data Privacy Framework.
              </p>

              <h3 className="aurin-display text-xl mt-6 mb-2">Retention</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>Account + room memory</strong> — kept while
                  your account is active; deleted within 30 days of
                  account deletion.
                </li>
                <li>
                  <strong>Payment record</strong> — kept for 7 years
                  as required by EU/EE accounting law.
                </li>
                <li>
                  <strong>Email list</strong> — kept until you
                  unsubscribe; then marked inactive and removed at
                  the next quarterly clean-up.
                </li>
                <li>
                  <strong>Support messages</strong> — kept for 24
                  months so we can answer follow-up questions.
                </li>
                <li>
                  <strong>Plausible analytics</strong> — anonymous,
                  aggregated, no individual record.
                </li>
              </ul>

              <h3 className="aurin-display text-xl mt-6 mb-2">Your rights</h3>
              <p>
                Under EU GDPR you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>access the data we hold about you (Art. 15)</li>
                <li>have it corrected (Art. 16)</li>
                <li>have it deleted — the right to be forgotten (Art. 17)</li>
                <li>receive it as a portable file (Art. 20)</li>
                <li>object to processing based on legitimate interest (Art. 21)</li>
                <li>lodge a complaint with a supervisory authority (Art. 77)</li>
              </ul>
              <p>
                You can exercise the export and deletion rights
                directly from your{" "}
                <a
                  href="/account"
                  className="text-[hsl(var(--aurin-sage))] underline-offset-4 hover:underline"
                  data-testid="legal-account-link"
                >
                  account page
                </a>
                . Or write to <MailLink /> from the address tied to
                the account. We reply {OPERATOR.responseWindow}.
              </p>
            </Section>

            {/* ─────────── 06 · Cookies ─────────── */}
            <Section id="cookies" eyebrow="06 · Cookies" title="Cookies (essential only)">
              <p>
                This site uses <strong>strictly necessary cookies
                only</strong>, so we do not show a consent banner —
                the EU ePrivacy Directive allows essential cookies
                without consent.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>session_token</strong> — first-party, HttpOnly.
                  Keeps you signed in for 30 days. Removed on sign-out
                  or account deletion.
                </li>
                <li>
                  <strong>aurin:kids:adult-confirmed:v1</strong> —
                  localStorage only, not a cookie. Records that an
                  adult confirmed they are 18+ before opening Polarstar
                  Kids. Cleared by clearing browser storage.
                </li>
              </ul>
              <p>
                We do <strong>not</strong> use Google Analytics, the
                Meta pixel, advertising trackers, cross-site identifiers,
                or any third-party fingerprinting library. Visit counts
                come from Plausible, which is cookieless by design.
              </p>
            </Section>

            {/* ─────────── 07 · Accessibility ─────────── */}
            <Section id="accessibility" eyebrow="07 · Accessibility" title="Accessibility statement">
              <p>
                We aim to meet <strong>WCAG 2.1 Level AA</strong>{" "}
                across every public page. Where we fall short, we
                want to know — write to <MailLink />.
              </p>
              <h3 className="aurin-display text-xl mt-6 mb-2">What we have done</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Semantic HTML throughout (one h1 per page, sections labelled, lists marked up).</li>
                <li>Brass-on-cream contrast is tested at WCAG AA on every interactive element.</li>
                <li>Every keeper room offers three communication modes — voice, hybrid, and writing-only — so hearing or speech needs never block a conversation.</li>
                <li>aria-labels on every checkout button, status indicator, and modal.</li>
                <li>Keyboard navigation works on every CTA, age-gate, and voice control.</li>
              </ul>
              <h3 className="aurin-display text-xl mt-6 mb-2">Known limitations</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>A few decorative painted images carry alt=&quot;&quot; on purpose because they are background atmosphere. The interactive zones on top of them have descriptive labels.</li>
                <li>Live voice transcripts are not yet captioned in real time — for accessibility we currently recommend hybrid mode (writing with the keeper&apos;s voice reply).</li>
              </ul>
              <p>
                If something on this site blocks you, write to <MailLink />.
                We treat accessibility bugs as bugs, not as nice-to-haves.
              </p>
            </Section>

            {/* ─────────── 08 · Polarstar Kids ─────────── */}
            <Section id="kids" eyebrow="08 · Polarstar Kids" title="Polarstar Kids — parent-led access">
              <p>
                Polarstar Kids and the Aurin Storyteller are designed to
                be opened by an adult for a child. We are not a child-
                directed service in the legal sense (we do not advertise
                to children, we do not collect a child&apos;s identity).
                We still take this seriously:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Every entry to Polarstar Kids asks a short, brand-consistent question to confirm an adult is present.</li>
                <li>We never ask a child for their name, address, school, or photo. The reading and listening experiences are anonymous to the child.</li>
                <li>Subscriptions are bought, owned, and cancelled by the parent. The child never sees a payment screen.</li>
                <li>No advertising is shown to anyone, anywhere on the site.</li>
                <li>No third-party analytics or tracker runs inside the kids surface.</li>
              </ul>
              <p>
                Children&apos;s online safety in the EU is shaped by GDPR
                Art. 8 and the national age limits for information-society
                services. Where we are unsure, we choose the stricter
                interpretation.
              </p>
            </Section>

            {/* ─────────── 09 · What this is not ─────────── */}
            <Section id="responsibility" eyebrow="09 · Responsibility" title="What this is not">
              <p>
                Matrix Aurin is a quiet place to read, listen and
                reflect. It is built with care, but it is not a
                substitute for any of the following, and we want this
                to be plainly said:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>The keepers are <strong>AI</strong> — every conversation surface clearly says so.</li>
                <li>It is <strong>not therapy</strong> and not a replacement for a therapist or counsellor.</li>
                <li>It is <strong>not medical advice</strong> and not a replacement for a doctor.</li>
                <li>It is <strong>not crisis support</strong>. If you or someone near you is in danger, please contact your local emergency services or a recognised crisis line.</li>
                <li>It is <strong>not financial or legal advice</strong>.</li>
              </ul>
              <p>
                The stories, audio, and reading rooms are written by
                people, augmented by AI keepers under human direction.
                Use your own judgement. Stop reading or listening if
                something does not feel right for you.
              </p>
            </Section>

            {/* ─────────── 10 · Disputes ─────────── */}
            <Section id="disputes" eyebrow="10 · Disputes" title="Disputes & supervisory authority">
              <p>
                If you have a complaint we cannot resolve, you can:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  Use the <strong>EU Online Dispute Resolution platform</strong>:{" "}
                  <a
                    href="https://ec.europa.eu/consumers/odr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[hsl(var(--aurin-sage))] underline-offset-4 hover:underline"
                  >
                    ec.europa.eu/consumers/odr
                  </a>.
                </li>
                <li>
                  Contact our supervisory authority for data protection
                  — the <strong>{OPERATOR.supervisoryAuthority.name}</strong>:{" "}
                  <a
                    href={OPERATOR.supervisoryAuthority.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[hsl(var(--aurin-sage))] underline-offset-4 hover:underline"
                  >
                    {OPERATOR.supervisoryAuthority.url}
                  </a>.
                </li>
              </ul>
              <p>
                We would rather resolve it directly. <MailLink /> is the
                first stop.
              </p>
            </Section>

            {/* Footer */}
            <div
              className="border-t border-[hsl(var(--aurin-border-soft))] pt-8 text-[13px] text-[hsl(var(--aurin-text-muted))] italic"
              data-testid="legal-last-reviewed"
            >
              Last reviewed {OPERATOR.lastUpdated}. We update this page
              whenever something material changes and we say so on the
              homepage when it does. If you spot anything unclear or
              wrong, write to <MailLink />. We will fix it.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
