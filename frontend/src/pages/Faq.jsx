import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { useEffect } from "react";
import { track } from "@/lib/telemetry";

/**
 * FAQ — short, static, $0 page.
 *
 * No LLM calls. No KB lookup. No "live AI support" promise. The page
 * answers the most-asked operational questions and points the wanderer
 * to a real human (Reach Out) when something is missing.
 *
 * Iter 64 build under stabilization rules. No new backend.
 */

const SECTIONS = [
  {
    id: "access",
    title: "Access · sign-in",
    questions: [
      {
        q: "How do I sign in?",
        a: "Open /portal, enter your email, and we will send a magic link. Click the link from the same device. The link is single-use and expires after a short window — request a fresh one if it has gone cold.",
      },
      {
        q: "I bought a book or course but I don't see it yet.",
        a: "Most purchases unlock automatically within a minute via the LemonSqueezy webhook. If yours has not appeared after five minutes, sign in, then write to us with the order email — we open the door by hand.",
      },
      {
        q: "Can I use the same account on multiple devices?",
        a: "Yes. Sign in with the same email on each device. If you have turned on Eternal Thread, your reflection continuity follows you across devices.",
      },
    ],
  },
  {
    id: "memory",
    title: "Memory · Transient & Eternal Thread",
    questions: [
      {
        q: "Does the mentor remember what I said last time?",
        a: "Two depths exist. Transient Echo (free) keeps the last few sentences in your browser only — nothing about you is stored on the server. Eternal Thread (opt-in) lets the mentor leave a short, encrypted private note at the close of each hour, so a return visit on any device picks up the threadline. We do not claim full recall — only continuity-aware, not omniscient.",
      },
      {
        q: "How can I turn Eternal Thread off?",
        a: "Inside Clarity Release, on the confirmation panel before you enter the room, choose Transient Echo. The note from your most recent session is no longer used, and no new notes are created. You can switch back at any time.",
      },
      {
        q: "What gets stored, and where?",
        a: "User messages are encrypted with AES-256-GCM at rest. Transient browser memory lives only in your device's localStorage. Server-side notes (Eternal Thread) are short summaries only — never the full transcript.",
      },
    ],
  },
  {
    id: "rooms",
    title: "Rooms · what each one is for",
    questions: [
      {
        q: "What is Clarity Release?",
        a: "A reflective hour with a quiet companion. It is not therapy and not counselling. It helps you hear yourself more clearly. The first three replies are free; deeper hours are unlocked by a Clarity pass.",
      },
      {
        q: "What is the Body Room?",
        a: "Eight quiet hotspots on a vertical body map. You hover where something is held — back, chest, jaw — and the room offers a pattern reading and an optional somatic companion line. Free. Capped at 12 messages per day shared with the Cabinet.",
      },
      {
        q: "What is the Course Room?",
        a: "Series of slow letters delivered one per day. Letter one is always a free preview; letters two through seven unlock with enrollment. Each course has an audio companion.",
      },
    ],
  },
  {
    id: "payment",
    title: "Payments · refunds",
    questions: [
      {
        q: "How is payment processed?",
        a: "Through LemonSqueezy. We never see your card. The receipt comes from LemonSqueezy; access is granted to the email you used at checkout.",
      },
      {
        q: "Refund policy?",
        a: "Read the full policy on the Legal · Responsibility page. In short: digital downloads are non-refundable once accessed; sessions and passes have a defined cancellation window. If something genuinely went wrong on our side, write to us — we read every message.",
      },
      {
        q: "Why are some courses still flagged 'beta'?",
        a: "Because we are still calibrating the quiet rhythm of how letters land. Beta means a discounted entry rate. Your access does not expire when beta ends.",
      },
    ],
  },
  {
    id: "support",
    title: "Support · how to reach a human",
    questions: [
      {
        q: "Is there a 24/7 AI support helper?",
        a: "No. We do not run a live AI helper, and we do not claim to. Use this FAQ first; if something here does not answer your question, write to us — we reply within a few days, by hand.",
      },
      {
        q: "How do I reach a human?",
        a: "Open the Reach Out page from the navigation. Tell us, briefly, what you ran into. Real responses come from real people, slowly but reliably.",
      },
      {
        q: "If I am in crisis right now?",
        a: "Please do not start a conversation with a digital companion in that moment. In Estonia: Eluliin 116 123 (free, confidential, 24/7). Emergency: 112. Outside Estonia: findahelpline.com — every country has a free line. We will be here when you return.",
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy · your work stays yours",
    questions: [
      {
        q: "Do you track me?",
        a: "No social-media pixels. No tracking cookies. No public feed. We do measure room engagement at an aggregate level so we can keep the rhythm calm — never per-person, never sold.",
      },
      {
        q: "How do I remove my stored reflections?",
        a: "Two layers. (1) Transient Echo lives only in your browser — clear your browser data for prulesoul.site and it is gone, instantly, on your side. (2) Eternal Thread (the short server-side notes) is removed when you turn off the toggle inside Clarity Release; future hours stop writing notes, and you can request the existing notes be deleted by writing to us through Reach Out. We confirm when it is done.",
      },
      {
        q: "How do I leave a room mid-session?",
        a: "Every room has an emergency exit corner — a small Leave link in the upper area of Clarity Release and Body Room. You can also simply close the tab. Nothing locks you in. The session closes itself after a brief idle period.",
      },
      {
        q: "How do I request full account deletion?",
        a: "Write to us through Reach Out with the subject line 'Delete my account.' We delete sessions, summaries, purchases history, and account, and reply with a written confirmation. This is manual on purpose — we want a real person to read your request, not an automated form.",
      },
      {
        q: "Can I delete my data?",
        a: "Yes. See the deletion question above. Everything is removable. Nothing is held against your will.",
      },
    ],
  },
];

export default function Faq() {
  useEffect(() => {
    track("faq_open");
  }, []);
  return (
    <div data-testid="page-faq">
      <PageHeader
        eyebrow="Frequently asked"
        title="A short, honest FAQ."
        description="The most common questions, answered slowly. If your question is not here, the Reach Out page sends a real message to a real person."
      />

      <section className="aurin-section">
        <div className="aurin-container max-w-[820px] space-y-10">
          {SECTIONS.map((s) => (
            <FaqSection key={s.id} section={s} />
          ))}

          <div className="aurin-card p-6 md:p-7" data-testid="faq-contact">
            <div className="aurin-eyebrow !mb-1">Still need a human?</div>
            <h3 className="text-[19px] font-medium text-[hsl(var(--aurin-text))]">
              Write to us through Reach Out.
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
              We do not auto-reply. We do not run a 24/7 AI helper. A real
              person reads what you send and answers within a few days.
            </p>
            <Link
              to="/reach-out"
              data-testid="faq-contact-cta"
              className="mt-4 inline-flex items-center gap-1.5 aurin-btn aurin-btn-primary"
            >
              Reach Out
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FaqSection({ section }) {
  return (
    <section data-testid={`faq-section-${section.id}`}>
      <div className="aurin-eyebrow !mb-2">{section.title}</div>
      <ul className="space-y-2">
        {section.questions.map((qa, i) => (
          <FaqItem key={i} testid={`faq-${section.id}-${i}`} qa={qa} />
        ))}
      </ul>
    </section>
  );
}

function FaqItem({ testid, qa }) {
  const [open, setOpen] = useState(false);
  return (
    <li
      data-testid={testid}
      data-open={open ? "true" : "false"}
      className="aurin-card !p-0 overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-testid={`${testid}-toggle`}
        className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-[hsl(var(--aurin-surface))/0.4] transition-colors"
      >
        <span className="text-[14.5px] font-medium text-[hsl(var(--aurin-text))]">
          {qa.q}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.6}
          className={`shrink-0 text-[hsl(var(--aurin-text-muted))] transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>
      {open && (
        <div
          className="px-4 md:px-5 pb-5 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]"
          data-testid={`${testid}-answer`}
        >
          {qa.a}
        </div>
      )}
    </li>
  );
}
