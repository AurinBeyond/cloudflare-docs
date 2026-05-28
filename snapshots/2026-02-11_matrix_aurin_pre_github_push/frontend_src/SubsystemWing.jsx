/**
 * SubsystemWing.jsx — `/parents-room/subsystem`
 *
 * §SUBSYSTEM 2026-02-11 — Founder directive (Variant A).
 *   The adolescent neurological window (ages 11–17) reframed in
 *   Matrix Aurin's architectural register. Adult-facing only —
 *   the page diagnoses the *teenager's* operating system FOR the
 *   parent. We never ask the minor to register, sign in, or leave
 *   data. GDPR-clean, brand-clean, sovereign.
 *
 *   The word "puberty" is permanently banned from this codebase
 *   per founder directive. We say "The Subsystem".
 *
 *   Tone: no therapy, no wellness, no soft pedagogy. Pure system
 *   diagnostics with the same biomechanical register as Sara's
 *   core room. No new compass cardinal — this is an interior
 *   wing of the Parents' Room.
 */
import { useEffect } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthProvider";

const DIAGNOSTICS = [
  {
    code: "01",
    title: "The Subsystem",
    body:
      "Between roughly age eleven and seventeen, the human nervous system " +
      "executes the most aggressive architectural renovation it will ever " +
      "undertake. Synaptic pruning, prefrontal scaffolding, identity-runtime " +
      "boot. The adolescent is not malfunctioning. They are mid-build. " +
      "Treating them as a finished operator is the most common parental " +
      "design error in elite families.",
  },
  {
    code: "02",
    title: "The Privilege Isolation pattern",
    body:
      "Elite infrastructure — best school, best coach, best peer environment — " +
      "is not a substitute for direct parental bandwidth. The Subsystem reads " +
      "infrastructure as evidence of allocation, not as evidence of presence. " +
      "When the two are confused inside your home, the Subsystem files a " +
      "structural complaint that you may not see for years.",
  },
  {
    code: "03",
    title: "The White Fence Syndrome",
    body:
      "A teen behind a high-status fence (prestige, metrics, performance) " +
      "while the parent observes from behind glass — dry, busy, dispassionate — " +
      "experiences the fence as a velvet cage. Their rebellion is not a moral " +
      "failure. It is a sovereign response to architectural confinement. " +
      "Read it as data, not as defiance.",
  },
  {
    code: "04",
    title: "Cognitive Processor Overload",
    body:
      "The Subsystem cannot run two conflicting scripts simultaneously: " +
      "parental metric demands and its own emergent identity. When both " +
      "demand priority, the central nervous system short-circuits — anxiety, " +
      "withdrawal, substances, or the explosive system-crash you call " +
      "'rebellion'. The crash is a thermal protection, not a character defect.",
  },
  {
    code: "05",
    title: "The Voluntary System Crash",
    body:
      "When the mechanical determinism of the calendar — the scheduled life — " +
      "dominates beyond the Subsystem's tolerance, the teen will trigger a " +
      "hard reset. Substance use, academic sabotage, self-harm, total " +
      "withdrawal. From the outside it looks irrational. From inside the " +
      "Subsystem it is the last rational protocol available to recover " +
      "structural autonomy.",
  },
  {
    code: "06",
    title: "The Anchor OS — what the Subsystem actually needs",
    body:
      "Not more communication. Not more advice. Not a friend who happens to " +
      "be the parent. The Subsystem is engineered to calibrate itself against " +
      "an unshakeable, non-reactive architectural anchor — a stable operating " +
      "system that absorbs its chaotic discharge without crashing, retaliating, " +
      "or collapsing into mirror-emotion. Your job is to be the hardware, " +
      "not to fix the firmware.",
  },
  {
    code: "07",
    title: "The Sovereign Code, applied to the Subsystem",
    body:
      "Не верь — do not trust the teen's surface narrative; read their " +
      "actual signal. Не бойся — do not fear their emotional discharge; " +
      "your steadiness is the room they will eventually walk into. Не проси — " +
      "do not require them to perform for your attention. Attention is the " +
      "base infrastructure. They will not negotiate for what should be " +
      "ambient.",
  },
];

export default function SubsystemWing() {
  const { user } = useAuth();
  useEffect(() => {
    document.title = "The Subsystem · Parents' Room · Matrix Aurin";
  }, []);

  return (
    <div className="aurin-page" data-testid="subsystem-wing-page">
      <PageHeader
        eyebrow="E · 90° · Sara · Sub-cluster"
        title="The"
        italicWord="Subsystem"
        description={(
          "A wing inside the Parents' Room for the parent of an adolescent " +
          "between roughly age eleven and seventeen. The most aggressive " +
          "neurological renovation a human ever undertakes. Read once. Sit " +
          "with one diagnostic at a time. No therapy. No advice. Pure " +
          "architectural read."
        )}
        testid="subsystem-wing-header"
      />

      <section
        className="aurin-section-sm"
        data-testid="subsystem-wing-preamble"
      >
        <div className="aurin-container max-w-[760px]">
          <div className="aurin-card p-6 md:p-8">
            <p className="aurin-eyebrow text-[10.5px] tracking-[0.36em] uppercase text-[hsl(var(--aurin-sage))] mb-3">
              Founder note
            </p>
            <p className="text-[14.5px] leading-[1.85] text-[hsl(var(--aurin-text-muted))]">
              The word{" "}
              <span className="line-through opacity-50">puberty</span>{" "}
              has been retired from this wing. It carries pedagogical and
              clinical baggage that softens the precision of what is
              actually happening. Inside Matrix Aurin we use{" "}
              <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                The Subsystem
              </span>{" "}
              — a name that describes the operation, not the body.
            </p>
            <p className="mt-4 text-[14.5px] leading-[1.85] text-[hsl(var(--aurin-text-muted))]">
              This page never asks your teenager to sign in, register, or
              leave data. The Subsystem belongs to them — the diagnostic
              belongs to you. We address the parent, with the same
              architectural register Sara uses in the main room.
            </p>
          </div>
        </div>
      </section>

      <section
        className="aurin-section-sm"
        data-testid="subsystem-wing-diagnostics"
      >
        <div className="aurin-container max-w-[820px]">
          <ul className="space-y-5">
            {DIAGNOSTICS.map((d) => (
              <li
                key={d.code}
                className="aurin-card p-6 md:p-7"
                data-testid={`subsystem-diagnostic-${d.code}`}
              >
                <div className="flex items-baseline gap-4 mb-2 flex-wrap">
                  <span className="text-[10px] tracking-[0.32em] uppercase text-[hsl(var(--aurin-sage))]">
                    [ {d.code} · diagnostic ]
                  </span>
                  <h3
                    className="aurin-serif text-[20px] sm:text-[22px] text-[hsl(var(--aurin-text))] font-light leading-[1.22]"
                  >
                    {d.title}
                  </h3>
                </div>
                <p className="text-[14px] leading-[1.85] text-[hsl(var(--aurin-text-muted))]">
                  {d.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="aurin-section-sm"
        data-testid="subsystem-wing-teen-frequency-note"
      >
        <div className="aurin-container max-w-[680px]">
          <div className="aurin-card p-6 md:p-7 text-center">
            <p className="text-[10.5px] tracking-[0.36em] uppercase text-[hsl(var(--aurin-sage))] mb-3">
              [ Season 2 · forthcoming ]
            </p>
            <p className="aurin-serif-italic text-[15px] text-[hsl(var(--aurin-text))] mb-3">
              Teen Frequency
            </p>
            <p className="text-[13.5px] leading-[1.85] text-[hsl(var(--aurin-text-muted))]">
              A separate adolescent-facing channel is scheduled for Season 2,
              with appropriate parental consent flows, age-gating, and a
              dedicated voice curator. Until then, the Subsystem belongs to
              the parent. We do not collect data from minors.
            </p>
          </div>
        </div>
      </section>

      <section
        className="aurin-section-sm"
        data-testid="subsystem-wing-back"
      >
        <div className="aurin-container max-w-[680px] text-center">
          <Link
            to="/parents-room"
            className="aurin-link inline-flex items-center gap-2 text-[12px] tracking-[0.32em] uppercase text-[hsl(var(--aurin-sage))]"
            data-testid="subsystem-wing-back-link"
          >
            ← Return to E · 90° · Parents' Room
          </Link>
          {!user ? (
            <p className="mt-4 text-[12px] tracking-[0.22em] uppercase text-[hsl(var(--aurin-text-muted))/0.7]">
              Sign in to mark this read.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
