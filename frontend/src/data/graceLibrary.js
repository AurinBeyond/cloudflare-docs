/**
 * graceLibrary.js — § GRACE LIBRARY DATA 2026-02
 *
 * Founder spec (Anna, Estonian session): 5 strong PDFs, 3 sections,
 * Intuvio-style ("understand the pattern → small next step", never
 * coach / therapy / guru tone). Every article follows the same
 * 7-block shape so the reader knows what to expect.
 *
 * Blocks: Opening Reflection / Understanding The Pattern /
 * A Different Perspective / Questions To Sit With / Small Next Step /
 * Speak With Grace / Write About This.
 *
 * The articles live as structured data here so the same content can
 * later be rendered as a downloadable PDF, a printable layout, or
 * remixed for related-reads, without re-writing the copy.
 */

export const LIBRARY_SECTIONS = [
  {
    id: "understanding",
    title: "Understanding Yourself",
    slugs: ["the-weight-of-constant-responsibility", "why-rest-feels-uncomfortable", "when-everything-feels-like-too-much"],
  },
  {
    id: "relationships",
    title: "Relationships",
    slugs: ["the-art-of-healthy-boundaries"],
  },
  {
    id: "moving-forward",
    title: "Moving Forward",
    slugs: ["starting-again"],
  },
];

export const LIBRARY_ARTICLES = {
  "the-weight-of-constant-responsibility": {
    slug: "the-weight-of-constant-responsibility",
    title: "The Weight of Constant Responsibility",
    subtitle: "Why carrying everything eventually becomes too much.",
    readingTime: "8 min read",
    section: "understanding",
    opening:
      "If you are reading this, the day has probably already asked something of you. Maybe many things. Maybe everything. There is a quiet question underneath the busyness: who is carrying me, while I am carrying everyone else?",
    pattern: [
      "Responsible people rarely notice the moment they crossed from helping into holding everything up. There is no alarm. There is only a slow, daily kind of tiredness that does not go away with sleep.",
      "“If I don't do it, who will?” starts as a fair question and becomes, over time, a rule. The rule says: my rest is conditional on everyone else's well-being. The rule is not true, but it feels true, and so it runs the day.",
      "The mental load is invisible. Remembering the appointments, anticipating the next emotional weather, holding the calendar in your head, knowing where the keys are — none of it shows in a photograph, and most of it is never named out loud.",
      "Then comes the guilt of rest. Sitting down feels like cheating. Saying no feels like failure. And so the cycle continues until the body insists on stopping, usually in a way no one asked for.",
    ],
    perspective:
      "Responsibility is not the same as carrying. Responsibility is choosing what is yours. Carrying is taking on what was never yours to begin with. The difference is small in words and enormous in life. You can be deeply responsible and still set things down.",
    questions: [
      "What am I holding right now that nobody asked me to hold?",
      "Who taught me that rest must be earned?",
      "If one task disappeared from my list this week, which one would I quietly hope it would be?",
      "What would I be free to feel if I were not in charge of everyone's mood?",
    ],
    nextStep:
      "For the next 24 hours, notice one thing you usually carry without thinking — and put it down for a single hour. Not forever. One hour. See what happens. Often, nothing falls apart. That information is allowed to change you.",
  },

  "why-rest-feels-uncomfortable": {
    slug: "why-rest-feels-uncomfortable",
    title: "Why Rest Feels Uncomfortable",
    subtitle: "Learning to stop without feeling guilty.",
    readingTime: "7 min read",
    section: "understanding",
    opening:
      "Many people discover that the harder thing is not the work — it is the moment after the work, when the body is finally still and the mind keeps running. Stillness, for the very tired, can feel louder than effort.",
    pattern: [
      "Productivity can become an identity. When that happens, slowing down does not feel like rest. It feels like disappearing. The inner critic gets sharper, not quieter, because it has lost its usual task.",
      "There is a quiet misunderstanding here: rest gets confused with stopping. They are not the same. Stopping is empty. Rest is full — full of what was being crowded out by the doing.",
      "The discomfort of rest is often the discomfort of meeting yourself. Without the next task in the way, what has been waiting underneath has room to arrive. That is not a failure of rest. That is rest beginning to work.",
    ],
    perspective:
      "Rest is not the reward for finishing. Rest is the ground that lets you finish. A field that is never left fallow stops growing. Bodies are no different. Your unease around rest is not weakness — it is a sign that the resting muscle simply has not been used very much yet.",
    questions: [
      "What was the most genuinely restful hour I had this month? What made it different?",
      "When I picture myself doing nothing, what comes up first — peace, or alarm?",
      "Whose voice tells me rest is lazy?",
      "If rest were allowed to be productive, what might it produce?",
    ],
    nextStep:
      "Choose one short window this week — twenty minutes is enough — and protect it as if it were a meeting. Do nothing measurable in it. If the discomfort arrives, do not solve it. Sit with it. The first few times, that is the whole exercise.",
  },

  "when-everything-feels-like-too-much": {
    slug: "when-everything-feels-like-too-much",
    title: "When Everything Feels Like Too Much",
    subtitle: "Finding your footing when life feels overwhelming.",
    readingTime: "9 min read",
    section: "understanding",
    opening:
      "Sometimes the problem is not any one thing. The problem is the all-at-onceness of it. The mental noise. The seven tabs open in your head before breakfast. The sense that no single task is impossible, yet the whole pile is.",
    pattern: [
      "Overwhelm has signs the body knows before the mind does — a tightness behind the eyes, shallow breath, a low fuse, a strange flatness. These are not character flaws. They are reports.",
      "Decision fatigue is real. The brain that has been asked to choose all day will eventually refuse to choose at all. That refusal can look like procrastination, but it is usually self-protection.",
      "The instinct in overwhelm is to try harder. That rarely helps, because the engine is already running hot. What helps is narrowing — making the next thing smaller, not bigger.",
    ],
    perspective:
      "You do not need to find your footing on the whole landscape. You only need to find it on the next single step. When the view is too wide, look at your feet. The horizon waits well.",
    questions: [
      "What is the smallest version of the next step I am avoiding?",
      "Which item on my list is actually somebody else's?",
      "What is one thing I could move to next week without anything bad happening?",
      "Where in my body is the overwhelm sitting right now?",
    ],
    nextStep:
      "Take a single sheet of paper. Write down every open loop in your head. Then circle exactly one — the one that, if handled, would soften everything else. Do that one. The list will still be there afterwards, and it will be quieter.",
  },

  "the-art-of-healthy-boundaries": {
    slug: "the-art-of-healthy-boundaries",
    title: "The Art of Healthy Boundaries",
    subtitle: "Protecting your energy without building walls.",
    readingTime: "8 min read",
    section: "relationships",
    opening:
      "A boundary is not a wall. A wall keeps everyone out. A boundary tells people, gently and clearly, where the door is and when it is open. Many of the people who most need boundaries grew up being praised for not having any.",
    pattern: [
      "Saying yes too often does not come from weakness. It usually comes from care, or from an old fear of what happens when you do not. Both deserve compassion.",
      "Control wears boundaries' clothes sometimes. Control is about what other people do. A boundary is about what you do in response. The distinction is small and the practical difference is enormous.",
      "Guilt almost always shows up the first time you set a real boundary. That is not a sign you are wrong. It is a sign that something is changing.",
    ],
    perspective:
      "Healthy boundaries do not push people away. They make it safe to come closer. People can love you better when they know where you actually are. Vagueness is not kindness — it is exhaustion in disguise.",
    questions: [
      "Where have I said yes this week when I meant no?",
      "What am I afraid will happen if I name what I need?",
      "Which relationship in my life feels lighter when I am honest? Which gets heavier?",
      "What would change if I trusted that I could disappoint someone and survive?",
    ],
    nextStep:
      "Pick one small, specific “no” for the coming week. Not a confrontation. A sentence. Practise it once out loud before it is needed. Notice afterwards: the world did not end, and a small piece of you came home.",
  },

  "starting-again": {
    slug: "starting-again",
    title: "Starting Again",
    subtitle: "How to begin again after disappointment, loss, or exhaustion.",
    readingTime: "8 min read",
    section: "moving-forward",
    opening:
      "Starting again is rarely loud. It does not always look like a fresh planner or a new gym membership. Sometimes it looks like getting dressed. Sometimes it looks like one honest conversation. Sometimes it looks like deciding to stop pretending.",
    pattern: [
      "When plans do not work, the first feeling is rarely sadness. It is usually self-blame. The mind wants a culprit, and you are the most convenient one. That instinct is human, and it is not the truth.",
      "Failure is not a verdict. It is information. Useful, painful, often unfair information, but information nonetheless.",
      "Being gentler with yourself is not the same as letting yourself off the hook. It is what makes another attempt possible at all.",
    ],
    perspective:
      "Small starts hold more weight than they look like they do. A single honest sentence. A single morning walk. A single page written. These are not minor. These are how a life turns, quietly, over time. Hope is not a feeling you wait for. It is a practice you return to.",
    questions: [
      "What would the smallest possible first step look like — so small it almost embarrasses me?",
      "What story have I been telling about why I cannot begin yet?",
      "Who would I be if I let myself try one more time?",
      "What would I write in a letter to the version of me who is still afraid?",
    ],
    nextStep:
      "Write one letter to yourself, dated tomorrow. Speak to the person who will wake up and need to begin. Tell them only what is true and kind. Seal it. Open it in the morning. Begin.",
  },
};
