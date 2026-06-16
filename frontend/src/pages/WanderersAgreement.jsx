import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { Shield, Phone, LifeBuoy, Sparkles } from "lucide-react";

/**
 * Wanderer's Agreement — the brand-voiced disclaimer & safety layer.
 *
 * Visible at /wanderers-agreement. Linked from:
 *   1. the footer (short entry point)
 *   2. the Honesty Gate on the Body Room questionnaire
 *   3. the Guardian's first message in a new Clarity Release session
 *
 * Complements /legal (which carries the formal terms + refund policy).
 * This page's job is different: it holds the *ethical* contract between
 * the wanderer and the room, in the room's own voice. Juridically firm,
 * tonally warm.
 */
export default function WanderersAgreement() {
  return (
    <div data-testid="page-wanderers-agreement">
      <PageHeader
        tone="default"
        eyebrow="A quiet contract"
        title="The Wanderer's"
        italicWord="Agreement."
        description="Before you walk further in — one soft, clear paragraph about what this room is, and what it is not. Read it once. It will make the rest of the journey easier."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container max-w-[760px] space-y-10">
          {/* 1. A guide, not a clinician */}
          <article
            data-testid="agreement-clause-guide"
            className="aurin-card p-7 md:p-9 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[hsl(var(--aurin-sage))]" />
              <h2 className="aurin-display text-2xl leading-snug">
                A guide, not a clinician
              </h2>
            </div>
            <p className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9]">
              Matrix Aurin is an inner-work companion and a quiet reflection
              space. The rooms you enter here — Body World, Clarity
              Release, the Course Room — are designed to support your own
              listening. They offer new angles, soft somatic rhythms, and a
              trained AI companion tuned to the brand's voice.
            </p>
            <p className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9]">
              Matrix Aurin is <strong>not</strong> a medical service,{" "}
              <strong>not</strong> a licensed therapy platform, and{" "}
              <strong>not</strong> a psychiatric provider. Nothing you read or
              hear here diagnoses, treats, cures, or prevents any clinical
              condition.
            </p>
          </article>

          {/* 2. Personal responsibility */}
          <article
            data-testid="agreement-clause-responsibility"
            className="aurin-card p-7 md:p-9 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[hsl(var(--aurin-sage))]" />
              <h2 className="aurin-display text-2xl leading-snug">
                Your freedom, your responsibility
              </h2>
            </div>
            <p className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9]">
              Every step in this portal is yours to take or not take. By using
              these tools, you accept that you are responsible for your own
              emotional and physical wellbeing, including the choice to pause,
              leave, or seek outside help at any time.
            </p>
            <p className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9]">
              You agree that nothing here is a substitute for medication, a
              care plan, or the judgement of a qualified professional who
              knows you personally.
            </p>
            <p
              data-testid="agreement-psychiatric-exclusion"
              className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.95] pt-1"
            >
              <strong>Who this is not for.</strong> Matrix Aurin is not
              designed for people currently under psychiatric care or
              carrying a psychiatric diagnosis. If that is your situation
              right now, please use a licensed practitioner instead — this
              room cannot hold what you deserve. By entering further, you
              confirm this does not describe you tonight.
            </p>
          </article>

          {/* 3. AI companion — honest about the tool */}
          <article
            data-testid="agreement-clause-ai"
            className="aurin-card p-7 md:p-9 space-y-3"
          >
            <h2 className="aurin-display text-2xl leading-snug">
              About the companion
            </h2>
            <p className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9]">
              The Guardian — the presence you meet in Clarity Release — is
              built on advanced AI, shaped by Matrix Aurin's voice and ethics.
              It has been trained to be gentle, unhurried, and to pause rather
              than push.
            </p>
            <p className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9]">
              It is still a technology. It can be wrong. It cannot replace a
              human who knows you. Matrix Aurin does not accept liability for
              how you interpret or apply any single reply from the Guardian.
              Take what resonates; leave what does not.
            </p>
            <p className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9]">
              Your messages inside Clarity Release are encrypted at rest. They
              are never sold, never used to train external models, and never
              read by anyone — unless a formal dispute is raised, in which
              case an audit trail is written and kept.
            </p>
            <p
              className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9]"
              data-testid="agreement-memory-clause"
            >
              <strong>Memory has two depths.</strong> By default the
              Cabinet runs on <em>Transient memory</em> — the mentor
              remembers what you say within one hour, and a few short
              fragments are stored quietly on this device only, so the
              next visit on this same browser does not start from absolute
              silence. These fragments are never sent anywhere except
              back to your own next session. Clearing this browser's
              storage erases them.
            </p>
            <p className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9]">
              <strong>Eternal Thread</strong> is the second depth, and
              it is opt-in. When activated, the Guardian writes a short
              private note for itself at the close of every quiet hour
              — encrypted, yours alone, never shown to anyone else —
              and reads the last few when you return on any device.
              Eternal Thread is a paid feature designed to fund the
              Guardian's ongoing presence. You may switch it off at any
              time and request the notes erased.
            </p>
          </article>

          {/* 4. When the wave is bigger — real safety */}
          <article
            data-testid="agreement-clause-safety"
            className="aurin-card p-7 md:p-9 space-y-3 border-[hsl(var(--aurin-sage))]/40"
          >
            <div className="flex items-center gap-2">
              <LifeBuoy size={16} className="text-[hsl(var(--aurin-sage))]" />
              <h2 className="aurin-display text-2xl leading-snug">
                When the wave is bigger than this room
              </h2>
            </div>
            <p className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.9]">
              If tonight is heavy — thoughts of ending your life, plans to
              harm yourself or someone else, an active crisis — this room is
              not the first place to go. It is not equipped to hold that. A
              real human voice can.
            </p>
            <ul
              data-testid="agreement-hotlines"
              className="space-y-2 pt-2 text-[13.5px] leading-relaxed"
            >
              <li className="flex items-start gap-2">
                <Phone size={13} strokeWidth={1.6} className="text-[hsl(var(--aurin-sage))] mt-0.5 shrink-0" />
                <span>
                  Your local emergency number (e.g.{" "}
                  <strong>112</strong> in Europe,{" "}
                  <strong>911</strong> in North America) — if you or
                  someone near you is in immediate physical danger.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={13} strokeWidth={1.6} className="text-[hsl(var(--aurin-sage))] mt-0.5 shrink-0" />
                <span>
                  A free, confidential crisis line in your country:{" "}
                  <a
                    href="https://findahelpline.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[hsl(var(--aurin-sage))] hover:underline"
                  >
                    findahelpline.com
                  </a>
                  .
                </span>
              </li>
            </ul>
            <p className="text-[13px] leading-relaxed text-[hsl(var(--aurin-text-muted))] aurin-serif-italic pt-2">
              The room will be here when you come back. Make the call first.
            </p>
          </article>

          {/* 5. The small shape of the agreement */}
          <article
            data-testid="agreement-clause-summary"
            className="aurin-card p-7 md:p-9 space-y-3 bg-[hsl(var(--aurin-bg))]/40"
          >
            <h2 className="aurin-display text-2xl leading-snug">
              In one breath
            </h2>
            <p className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text))/0.95] aurin-serif-italic">
              "I understand that Matrix Aurin is a companion for inner work,
              not medical care. I am responsible for my own steps. If the
              weight becomes too much, I will reach for a real person first.
              The room is mine to enter — and mine to pause."
            </p>
            <p className="text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] pt-2">
              By continuing into Clarity Release, the Body World questionnaire,
              or a paid pass, you accept this Agreement. Formal terms and the
              refund policy live on{" "}
              <Link
                to="/legal"
                data-testid="agreement-legal-link"
                className="text-[hsl(var(--aurin-sage))] hover:underline"
              >
                the Legal page
              </Link>
              .
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
