/**
 * WhatThisIs.jsx — §BRAND-CLARITY 2026-02-11
 *
 * The technical-but-quiet "About / What this is" page. Lives at
 * `/what-this-is`. Footer-linked, not hero-promoted. Designed for:
 *
 *   - payment partner reviewers (Polar / Stripe onboarding)
 *   - skeptical parents
 *   - press / B2B partners
 *   - the curious customer who reads the small print
 *
 * Uses the existing dark house palette. No new visual system.
 * No images. Pure typography on the brand backdrop.
 */

import React from "react";
import { Link } from "react-router-dom";
import AurinsPromise from "@/components/house/AurinsPromise";
import KidsDayPassRow from "@/components/house/KidsDayPassRow";

const SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, serif';
const SCRIPT = '"Caveat", "Caveat Brush", cursive';

function Section({ eyebrow, title, children }) {
  return (
    <section className="max-w-[760px] mx-auto px-6 sm:px-10 py-16 sm:py-20">
      <p
        className="text-[11px] tracking-[0.36em] uppercase text-[#c4a46b] mb-6"
        style={{ fontFamily: SERIF }}
      >
        {eyebrow}
      </p>
      <h2
        className="text-[28px] sm:text-[34px] font-light italic text-[#e8e1d5] mb-8 leading-[1.25]"
        style={{ fontFamily: SERIF }}
      >
        {title}
      </h2>
      <div
        className="text-[16px] sm:text-[17px] leading-[1.85] text-[#bcb4a3] font-light space-y-5"
        style={{ fontFamily: SERIF }}
      >
        {children}
      </div>
    </section>
  );
}

export default function WhatThisIs() {
  return (
    <div
      data-testid="what-this-is-root"
      className="min-h-screen w-full bg-[#0b0a08] text-[#e8e1d5] antialiased"
      style={{ fontFamily: SERIF }}
    >
      {/* Quiet header — no big nav, just a way back. */}
      <header className="w-full border-b border-[rgba(196,164,107,0.08)] py-5">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-10 flex items-center justify-between">
          <Link
            to="/"
            className="text-[11px] tracking-[0.32em] uppercase text-[#a59f93] hover:text-[#bcb4a3] transition-colors"
            data-testid="what-this-is-back-link"
          >
            ← Pure Soul Life · Matrix Aurin
          </Link>
          <span className="text-[10.5px] tracking-[0.28em] uppercase text-[#5a554c] italic">
            What this is
          </span>
        </div>
      </header>

      {/* Hero — one sentence. The brand DNA. */}
      <section className="max-w-[820px] mx-auto px-6 sm:px-10 pt-28 sm:pt-36 pb-12 text-center">
        <p
          className="text-[12px] tracking-[0.42em] uppercase text-[#c4a46b] mb-8"
          style={{ fontFamily: SERIF }}
        >
          ✦ A quiet introduction
        </p>
        <h1
          className="text-[36px] sm:text-[52px] font-light italic text-[#e8e1d5] leading-[1.15] mb-6"
          style={{ fontFamily: SERIF }}
          data-testid="what-this-is-title"
        >
          The room is the vessel.
          <br />
          Presence is the product.
        </h1>
        <p
          className="text-[15.5px] sm:text-[17.5px] tracking-[0.02em] text-[#d4b67d] font-light leading-[1.7] mb-10 max-w-[58ch] mx-auto"
          style={{ fontFamily: SERIF }}
          data-testid="what-this-is-compass-line"
        >
          A quiet room for noticing what is already shaping your life.
        </p>
        <p
          className="text-[17px] sm:text-[19px] leading-[1.8] text-[#bcb4a3] font-light italic max-w-[58ch] mx-auto"
          style={{ fontFamily: SERIF }}
        >
          Matrix Aurin is a quiet digital room for people, families and
          children who want softer, more deliberate moments inside a world
          that keeps getting louder.
        </p>
      </section>

      <Section eyebrow="Why this exists" title="The world keeps getting louder.">
        <p>
          Performance fatigue. Notification overload. The slow erosion of
          quiet hours. Most digital products are designed to take more — more
          attention, more scrolling, more of you.
        </p>
        <p>
          Matrix Aurin moves in the opposite direction. It is a small,
          deliberate room where presence is the product, and where the
          technology stays in the background so you do not have to.
        </p>
      </Section>

      <Section
        eyebrow="✦ Made for the ear"
        title="Made to be heard, not watched."
      >
        <p>
          Matrix Aurin is built for the ear, not the eye. The room is
          made for the ear — a space where you can close the screen,
          lower your shoulders, and simply listen. Reading is optional;
          presence is not.
        </p>
        <p>
          The interface gets out of the way. There are no streaks, no
          notifications, no infinite feeds. Just a quiet, warm voice that
          meets you where you are, and steps back when you are ready to
          return to your day.
        </p>
        <p className="pt-4">
          <span className="text-[#c4a46b] tracking-[0.18em] text-[12px] uppercase block mb-2">
            ✦ For Individuals
          </span>
          A confidential evening room to lay down your armor. A space where
          you do not have to perform, explain, or be anything other than
          your true self. Your words belong to you; they are protected
          and never used to train public models.
        </p>
        <p className="pt-2">
          <span className="text-[#c4a46b] tracking-[0.18em] text-[12px] uppercase block mb-2">
            ✦ For Families &amp; Children
          </span>
          Screen-down technology. The kind that allows a parent to place
          the device upside down on the table, turning a digital moment
          into a warm, auditory presence. It sparks a child's imagination
          and calms the nervous system, free from the hypnotic pull of a
          glowing display.
        </p>
      </Section>

      <Section eyebrow="Who it's for" title="Three kinds of guests.">
        <p>
          <strong className="text-[#e8e1d5] font-normal">Adults</strong>{" "}
          who are tired of performing — who want a calm, attentive space to
          think, breathe and put words on what is already inside.
        </p>
        <p>
          <strong className="text-[#e8e1d5] font-normal">Families</strong>{" "}
          who want softer evenings together — a Parents' Room for adults and
          a separate, gentle world for children.
        </p>
        <p>
          <strong className="text-[#e8e1d5] font-normal">Children</strong>{" "}
          who deserve imagination, not addiction — a small storytelling
          world built around curiosity, kindness and inner courage.
        </p>
      </Section>

      <Section
        eyebrow="What it is not"
        title="A few things we are very clear about."
      >
        <p>
          This is not therapy. It is not medical advice. It is not a
          diagnostic tool. We do not promise outcomes for your body, mind
          or relationships.
        </p>
        <p>
          It is not a 24/7 companion, not a replacement for human
          connection, and not a spiritual teaching. The angels and
          light-bearing characters in our stories are{" "}
          <em>imaginative symbols</em> — language for kindness, courage and
          inner growth — never religious instruction or claims about the
          unseen.
        </p>
        <p>
          And it is not designed for engagement. There is no streak, no
          dopamine loop, no infinite feed. You arrive, you stay as long as
          it serves you, and you leave.
        </p>
      </Section>

      <Section
        eyebrow="How we hold this"
        title="Controlled by design, not by accident."
      >
        <p>
          Matrix Aurin runs on a deliberate technical foundation — what we
          call our governance layer. Every voice session has a runtime
          budget, an upper bound, and a vendor-health watcher that pauses
          new sessions if anything looks wrong. Your spend is bounded by
          design. Ours is too.
        </p>
        <p>
          We do not use your conversations to train any model. We do not
          surface emergency-shopping prompts during difficult moments. We
          do not let costs run away into the night.
        </p>
        <p>
          In plain language: this is quiet-room technology built with the
          same seriousness we ask of our guests.
        </p>
      </Section>

      <AurinsPromise tone="dark" showEarlyAccess={true} />

      {/* §SPRINT-C 2026-02-12 — Sole pre-gate public price disclosure
          per Strategy v2.3.1 §6. The €25 Kids Day Pass is the only
          numeric anchor visitors see before the qualification gate. */}
      <KidsDayPassRow />

      <footer className="w-full border-t border-[rgba(196,164,107,0.08)] py-12">
        <div className="max-w-[820px] mx-auto px-6 sm:px-10 text-center">
          <p
            className="text-[26px] mb-3"
            style={{ color: "#d9c79b", fontFamily: SCRIPT }}
          >
            Thank you for reading slowly.
          </p>
          <p className="text-[11px] tracking-[0.32em] uppercase text-[#7a7468]">
            <Link to="/" className="hover:text-[#bcb4a3] transition-colors">
              ← Back to the doorway
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
