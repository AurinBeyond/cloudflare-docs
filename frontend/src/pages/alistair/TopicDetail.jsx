/**
 * TopicDetail.jsx — § ALISTAIR LAB TOPIC v1 2026-02-10
 *
 * Stable internal route for every painted hotspot inside a lab page.
 * Path: /course-room/lab/:labSlug/topic/:topicId
 *
 * Content per topic will be authored later. For now this page is a
 * structured placeholder: it shows which lab the topic belongs to,
 * the topic ID, and a "back to laboratory" CTA. This keeps the link
 * graph stable so founders can verify all hotspot routes from
 * ?debug=1 mode without dead-ending the user.
 */
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LABS } from "@/data/alistairLabs";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

/* §TOPIC-TITLES 2026-02-10 — display titles for every authored topic
 * ID. New topic IDs added to LabDashboard zones should be mirrored
 * here so the placeholder page reads as intentional, not as a 404. */
const TOPIC_TITLES = {
  // Gardener Actions
  "prune": "Prune",
  "water": "Water",
  "plant": "Plant",
  // Nourished Branches
  "opportunity": "Opportunity",
  "relationships": "Relationships",
  "work-impact": "Work & Impact",
  "creativity": "Creativity",
  "leadership": "Leadership",
  // Neglected Branches
  "fear": "Fear",
  "guilt": "Guilt",
  "scarcity": "Scarcity",
  "overworking": "Overworking",
  "self-sabotage": "Self-Sabotage",
  // Roots
  "family": "Family",
  "childhood": "Childhood",
  "safety": "Safety",
  "belonging": "Belonging",
  "love": "Love",
  // Old Stories — coded-belief quotes
  "money-doesnt-grow": "Money Doesn't Grow on Trees",
  "be-realistic":      "Be Realistic",
  "dont-disappoint":   "Don't Disappoint Us",
  "work-harder":       "Work Harder",
  "who-do-you-think":  "Who Do You Think You Are?",
  // Trunk / Core Beliefs
  "worth": "Worth",
  "trust": "Trust",
  "identity": "Identity",
  "value": "Value",
  "approval": "Approval",
  "control": "Control",
  "receiving": "Receiving",
  // Fruits
  "abundance": "Abundance",
  "freedom": "Freedom",
  "contribution": "Contribution",
  "financial-flow": "Financial Flow",
  "inner-peace": "Inner Peace",
  "meaning": "Meaning",
};

export default function TopicDetail() {
  const { labSlug, topicId } = useParams();
  const lab = LABS[labSlug];
  const topicTitle =
    TOPIC_TITLES[topicId] ||
    topicId?.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
    "Topic";
  const labName = lab?.name || labSlug;

  return (
    <div
      data-testid={`topic-detail-${labSlug}-${topicId}`}
      className="min-h-screen w-full flex items-center justify-center px-6"
      style={{ background: "#0c0f17", color: "#f0eadd", fontFamily: SERIF }}
    >
      <div className="max-w-xl w-full text-center">
        <p
          className="text-[11px] tracking-[0.34em] uppercase mb-3"
          style={{ color: "#c4a46b" }}
          data-testid="topic-lab-label"
        >
          {labName} · Laboratory of Life
        </p>
        <h1
          className="font-light leading-[1.05] mb-5"
          style={{
            fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
            letterSpacing: "-0.01em",
            color: "#f0eadd",
          }}
          data-testid="topic-title"
        >
          {topicTitle}
        </h1>
        <p
          className="text-[15px] italic leading-[1.7] mb-9"
          style={{ color: "#a89e8b" }}
          data-testid="topic-placeholder-copy"
        >
          A deeper inquiry into <em>{topicTitle.toLowerCase()}</em> is being
          prepared in this laboratory. The page exists so this hotspot
          routes correctly; the content will be authored next.
        </p>
        <Link
          to={`/course-room/lab/${labSlug}`}
          data-testid="topic-back-to-lab"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] tracking-[0.28em] uppercase no-underline transition-colors"
          style={{
            color: "#d4b67d",
            border: "1px solid rgba(196,164,107,0.42)",
            background: "rgba(196,164,107,0.06)",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={12} />
          Back to {labName}
        </Link>
      </div>
    </div>
  );
}
