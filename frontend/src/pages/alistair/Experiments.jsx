/**
 * alistair/Experiments.jsx — § ALISTAIR / EXPERIMENTS 2026-02
 * Founder spec: five small life experiments — equivalent of Grace's
 * Evening Reflection. Each experiment routes into /course-room/room
 * with a seed so the actual chat surface can pick it up.
 */
import AlistairSubPage, { AlistairCard, AlistairSection } from "@/components/alistair/AlistairSubPage";
import { FlaskConical } from "lucide-react";

const EXPERIMENTS = [
  { id: "no-autopilot", title: "One Day Without Autopilot",
    text: "Pick a single ordinary day. Notice every choice you usually make without choosing." },
  { id: "five-minute-pause", title: "The Five Minute Pause",
    text: "Before every important answer for one day, take five minutes. See how the answer changes." },
  { id: "listen-before-react", title: "Listening Before Reacting",
    text: "For one full conversation, only ask follow-up questions. Notice what surfaces in you." },
  { id: "week-of-noticing", title: "A Week Of Noticing",
    text: "One small observation per day, written down. Patterns emerge by Wednesday." },
  { id: "what-happens-slow", title: "What Happens When You Slow Down",
    text: "Reduce your usual pace by a third for one weekend. Honest report only." },
];

const METHOD = [
  { id: "design",  label: "Design",   text: "Define the one small variable you will change." },
  { id: "observe", label: "Observe",  text: "Watch yourself without judgment. You are the subject." },
  { id: "record",  label: "Record",   text: "Write what happened. Plain words." },
  { id: "reflect", label: "Reflect",  text: "What did you not expect? That is the data." },
  { id: "iterate", label: "Iterate",  text: "Run it again, slightly differently. Or move on." },
];

export default function Experiments() {
  const startExperiment = (seed) => {
    window.location.href = `/course-room/room?experiment=${encodeURIComponent(seed)}`;
  };
  return (
    <AlistairSubPage
      testid="page-alistair-experiments"
      bgImage="/assets/alistair/alistair-light-bg.png"
      eyebrow="Life Experiments"
      title="Test something small. Trust the report, not the theory."
      intro="An experiment is a polite way of disagreeing with your own assumptions. None of these will change your life on their own. All of them will tell you something useful."
      quote="Information beats opinion. Especially your own opinion about yourself."
    >
      <AlistairSection label="Five Experiments to Try">
        {EXPERIMENTS.map((e) => (
          <AlistairCard key={e.id} testid={`alistair-exp-${e.id}`}
            title={e.title} lines={[e.text]} onClick={() => startExperiment(e.id)} />
        ))}
      </AlistairSection>
      <AlistairSection label="The Method · five steps">
        {METHOD.map((m, i) => (
          <AlistairCard key={m.id} testid={`alistair-method-${m.id}`}
            title={`${i + 1}. ${m.label}`} lines={[m.text]} />
        ))}
      </AlistairSection>
      <div className="mt-10 flex justify-center">
        <button type="button" onClick={() => startExperiment("design")}
          data-testid="alistair-exp-start-cta"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-[15px] transition-all hover:scale-[1.03] hover:shadow-xl"
          style={{ background: "#b07a3f", color: "#fdf6e6",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 500, letterSpacing: "0.02em",
            boxShadow: "0 10px 32px -10px rgba(176, 122, 63, 0.7)" }}>
          Design my own experiment
          <FlaskConical size={16} strokeWidth={1.8} />
        </button>
      </div>
    </AlistairSubPage>
  );
}
