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
  // ── Money Tree ─────────────────────────────────────
  "prune": "Prune",
  "water": "Water",
  "plant": "Plant",
  "opportunity": "Opportunity",
  "relationships": "Relationships",
  "work-impact": "Work & Impact",
  "creativity": "Creativity",
  "leadership": "Leadership",
  "fear": "Fear",
  "guilt": "Guilt",
  "scarcity": "Scarcity",
  "overworking": "Overworking",
  "self-sabotage": "Self-Sabotage",
  "family": "Family",
  "childhood": "Childhood",
  "safety": "Safety",
  "belonging": "Belonging",
  "love": "Love",
  "money-doesnt-grow": "Money Doesn't Grow on Trees",
  "be-realistic": "Be Realistic",
  "dont-disappoint": "Don't Disappoint Us",
  "work-harder": "Work Harder",
  "who-do-you-think": "Who Do You Think You Are?",
  "worth": "Worth",
  "trust": "Trust",
  "identity": "Identity",
  "value": "Value",
  "approval": "Approval",
  "control": "Control",
  "receiving": "Receiving",
  "abundance": "Abundance",
  "freedom": "Freedom",
  "contribution": "Contribution",
  "financial-flow": "Financial Flow",
  "inner-peace": "Inner Peace",
  "meaning": "Meaning",
  // ── Old Stories ────────────────────────────────────
  "im-not-enough": "I'm Not Enough",
  "i-always-fail": "I Always Fail",
  "i-dont-belong": "I Don't Belong",
  "must-prove-myself": "I Have to Prove Myself",
  "not-safe": "It's Not Safe",
  "recognize": "Recognize",
  "question": "Question",
  "release": "Release",
  "rewrite": "Rewrite",
  "remember": "Remember",
  "reflect-learned-long-ago": "What story did I learn long ago?",
  "reflect-from-whom": "Who did I learn it from?",
  "reflect-100-true": "Is this story 100% true?",
  "reflect-help-limit": "How has this story helped and limited me?",
  // ── Body Knows First ───────────────────────────────
  "feel": "Feel",
  "breathe": "Breathe",
  "listen": "Listen",
  "integrate": "Integrate",
  "overview": "Overview",
  "body-signals": "Body Signals",
  "nervous-system": "Nervous System",
  "practices": "Practices",
  "insights": "Insights",
  "journal": "Journal",
  "sensations": "Sensations",
  "triggers": "Triggers",
  "patterns": "Patterns",
  "regulation": "Regulation",
  "integration": "Integration",
  "state-tense": "Tense",
  "state-tired": "Tired",
  "state-restless": "Restless",
  "state-calm": "Calm",
  "state-open": "Open",
  "state-energized": "Energized",
  "state-other": "Other",
  "reflect-trying-to-tell": "What is my body trying to tell me?",
  "reflect-tension": "Where do I hold tension or resistance?",
  "reflect-need-more": "What do I need more of?",
  "reflect-next-small-step": "What's my next small step?",
  // ── Compass ────────────────────────────────────────
  "purpose": "Purpose",
  "truth": "Truth",
  "calling": "Calling",
  "growth": "Growth",
  "joy": "Joy",
  "gifts": "Gifts",
  "old-path": "The Old Path",
  "healing-path": "The Healing Path",
  "expansion-path": "The Expansion Path",
  "soul-path": "The Soul Path",
  "sign-drained": "You feel drained",
  "sign-weekends": "You live for weekends",
  "sign-ignore-nudges": "You ignore your inner nudges",
  "sign-people-please": "You people-please",
  "sign-stuck": "You feel stuck",
  "sign-doubt-self": "You doubt your own decisions",
  "checkin-alignment": "Am I living in alignment?",
  "checkin-expand": "Does this expand or shrink me?",
  "checkin-closer": "Is this moving me closer to who I came here to be?",
  "checkin-future-self": "Would my future self be proud?",
  "next-right-step": "Your Next Right Step",
  // ── Self-Sabotage ──────────────────────────────────
  "notice": "Notice",
  "inquire": "Inquire",
  "experiment": "Experiment",
  "hidden-patterns": "Hidden Patterns",
  "root-beliefs": "Root Beliefs",
  "emotional-triggers": "Emotional Triggers",
  "new-choices": "New Choices",
  "self-trust": "Self-Trust",
  // ── The Code ───────────────────────────────────────
  "ext-parents": "Parents",
  "ext-society": "Society",
  "ext-culture": "Culture",
  "ext-partner": "Partner",
  "ext-systems": "Systems",
  "thought-make-proud": "I should make them proud",
  "thought-keep-peace": "I need to keep the peace",
  "thought-disappoint": "I don't want to disappoint",
  "thought-be-loved": "I need to be loved",
  "thought-someday": "I'll do it someday",
  "thought-rock-boat": "I can't rock the boat",
  "int-fear-not-enough": "Fear of not enough",
  "int-need-approval": "Need for approval",
  "int-old-stories": "Old stories",
  "int-self-doubt": "Self-doubt",
  "int-comfort-addiction": "Comfort addiction",
  "int-avoiding-pain": "Avoiding pain",
  "ext-judgment": "Judgment",
  "ext-comparison": "Comparison",
  "ext-social-media": "Social media",
  "ext-money-status": "Money & status",
  "ext-rules-authority": "Rules & authority",
  "ext-masks-roles": "Masks & roles",
  "life-at-work": "At Work",
  "life-relationships": "In Relationships",
  "life-online": "Online",
  "life-society": "In Society",
  "life-consumer": "As a Consumer",
  "code-conditioning": "Conditioning",
  "code-repetition": "Repetition",
  "code-loyalty": "Loyalty",
  "code-shame": "Shame",
  "your-freedom": "Your Freedom",
  // ── Invisible Strings ──────────────────────────────
  "panel-career-work": "Career & Work",
  "panel-finances": "Finances",
  "panel-social-image": "Social Image",
  "panel-habits-addictions": "Habits & Addictions",
  "panel-self-image": "Self Image",
  "string-need-approval": "I need approval",
  "string-cant-disappoint": "I can't disappoint",
  "string-must-be-busy": "I must be busy",
  "string-need-more": "I need more to be enough",
  "string-happy-when": "I'll be happy when…",
  "string-cant-say-no": "I can't say no",
  "string-no-conflict": "I don't want conflict",
  "step-truth": "The Truth",
  "step-awareness": "Awareness",
  "step-freedom": "Freedom",
  "step-your-turn": "Your Turn",
  // ── Masks ──────────────────────────────────────────
  "achiever": "The Achiever",
  "provider": "The Provider",
  "strong-one": "The Strong One",
  "pleaser": "The Pleaser",
  "good-one": "The Good One",
  "helper": "The Helper",
  "masks-tab": "Masks",
  "why-we-wear": "Why We Wear Them",
  "costs": "Costs",
  "discovery": "Discovery",
  "understand": "Understand",
  "express": "Express",
  "reflect-masks-most-often": "What masks do I wear most often?",
  "reflect-where-learn": "Where did I learn to wear them?",
  "reflect-afraid-took-off": "What am I afraid would happen if I took them off?",
  "reflect-who-without": "Who would I be without needing to perform?",
  "reflect-authenticity-change": "What would more authenticity change in my life?",
  "ex-achiever": "Example · The Achiever",
  "ex-pleaser": "Example · The Pleaser",
  "ex-strong-one": "Example · The Strong One",
  "ex-provider": "Example · The Provider",
  "ex-helper": "Example · The Helper",
  "ex-good-one": "Example · The Good One",
  "ex-control-freak": "Example · The Control Freak",
  "ex-independent-one": "Example · The Independent One",
  "ex-caregiver": "Example · The Caregiver",
  // ── Body Language ──────────────────────────────────
  "body-shoulders": "Shoulders — I carry",
  "body-jaw": "Jaw — I hold back",
  "body-back": "Back — I support",
  "body-heart": "Heart — I connect",
  "body-stomach": "Stomach — I feel",
  "body-hips": "Hips — I allow",
  "posture": "Posture",
  "tension": "Tension",
  "movement": "Movement",
  "gesture": "Gesture",
  "micro-expressions": "Micro-expressions",
  "energy": "Energy",
  "tight-shoulders": "Tight Shoulders",
  "tight-jaw": "Tight Jaw",
  "shallow-breath": "Shallow Breath",
  "crossed-arms": "Crossed Arms",
  "tight-stomach": "Tight Stomach",
  "fidgeting-hands": "Fidgeting Hands",
  "practice-body-scan": "Body Scan",
  "practice-posture-checkin": "Posture Check-In",
  "practice-breath-awareness": "Breath Awareness",
  "practice-tension-release": "Tension Release",
  "practice-mirror": "Mirror Practice",
  "practice-movement-awareness": "Movement Awareness",
  "practice-emotion-mapping": "Emotion Mapping",
  "reflect-body-tell-me": "What is my body trying to tell me right now?",
  "reflect-tension-most-often": "Where do I hold tension most often?",
  "reflect-emotion-behind": "What emotion might be behind this sensation?",
  "reflect-last-listened": "When did I last truly listen to my body?",
  // ── Child & Parent ─────────────────────────────────
  "imagine": "Imagine",
  "play": "Play",
  "discover": "Discover",
  "wonder": "Wonder",
  "awareness": "Awareness",
  "choice": "Choice",
  "transformation": "Transformation",
  "focus": "Focus",
  "learning": "Learning",
  "language": "Language",
  "questions": "Questions",
  "time": "Time",
  "world": "World",
  "guides": "Guides",
  "strength": "Strength",
  "child-explores": "Child · Explores",
  "child-plays": "Child · Plays",
  "child-imagines": "Child · Imagines",
  "child-feels": "Child · Feels",
  "child-asks-what-if": "Child · Asks \"What if?\"",
  "child-lives-moment": "Child · Lives in the moment",
  "child-adventures": "Child · Adventures",
  "child-characters": "Child · Connects with characters",
  "child-expresses": "Child · Expresses freely",
  "parent-reflects": "Parent · Reflects",
  "parent-guides": "Parent · Guides",
  "parent-understands": "Parent · Understands",
  "parent-communicates": "Parent · Communicates",
  "parent-asks-why": "Parent · Asks \"Why?\"",
  "parent-learns-time": "Parent · Learns from time",
  "parent-navigates": "Parent · Navigates life",
  "parent-mentors": "Parent · Mentors",
  "parent-responsibility": "Parent · Responsibility",
  // ── Body Language V2 ───────────────────────────────
  "jaw-holding-back": "Jaw — Holding back",
  "shoulders-carrying": "Shoulders — Carrying weight",
  "heart-connection": "Heart — Connection",
  "breath-safety-flow": "Breath — Safety & flow",
  "belly-intuition": "Belly — Intuition",
  "hands-expression": "Hands — Expression",
  "expressions": "Expressions",
  "gestures": "Gestures",
  "emotions": "Emotions",
  "awareness-card": "Awareness",
  "interpret": "Interpret",
  "align": "Align",
  "embody": "Embody",
  "map-head-mind": "Head & Mind",
  "map-face-expression": "Face & Expression",
  "map-shoulders-chest": "Shoulders & Chest",
  "map-heart-breath": "Heart & Breath",
  "map-belly-gut": "Belly & Gut",
  "map-hands-arms": "Hands & Arms",
  "map-legs-feet": "Legs & Feet",
  "reflect-body-most-often": "What does my body try to tell me most often?",
  "reflect-hold-tension": "Where do I hold tension or resistance?",
  "reflect-posture-feel": "What does my posture say about how I feel?",
  "reflect-when-safe": "How do I show up when I feel safe?",
  "reflect-love-to-express": "What would my body love to express more?",
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
