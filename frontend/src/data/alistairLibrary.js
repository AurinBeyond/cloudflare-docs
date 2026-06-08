/**
 * alistairLibrary.js — § ALISTAIR LIBRARY DATA 2026-02
 *
 * Founder spec: 5 PDFs, same 7-block shape as Grace Library, but
 * Alistair's voice (intellectual / curious / honest, never coach /
 * guru / therapy). Three sections:
 *   - Understanding Patterns
 *   - Attention & Reaction
 *   - Meaning & Method
 */

export const LIBRARY_SECTIONS = [
  {
    id: "patterns",
    title: "Understanding Patterns",
    slugs: ["the-stories-we-keep-telling-ourselves", "why-we-miss-what-is-right-in-front-of-us"],
  },
  {
    id: "attention",
    title: "Attention & Reaction",
    slugs: ["the-habit-of-constant-reacting", "the-art-of-paying-attention"],
  },
  {
    id: "meaning",
    title: "Meaning & Method",
    slugs: ["meaning-before-motivation"],
  },
];

export const LIBRARY_ARTICLES = {
  "the-stories-we-keep-telling-ourselves": {
    slug: "the-stories-we-keep-telling-ourselves",
    title: "The Stories We Keep Telling Ourselves",
    subtitle: "Why the most repeated story is rarely the most accurate one.",
    readingTime: "9 min read",
    section: "patterns",
    opening:
      "Every life carries a few sentences it keeps repeating. Some are true. Some were true once. Some were never true at all, only useful at the moment they were first said. The trouble is that we rarely audit our sentences. They run quietly in the background of every decision, and we mistake them for the world.",
    pattern: [
      "A story becomes invisible the moment you stop questioning it. That is how stories work — they earn their keep by disappearing into the furniture of your mind.",
      "Most repeated stories are not lies. They are simplifications. They flattened something complicated into something portable. The flattening was a kindness, once. It can also become a cage.",
      "Notice which story you reach for in stress. It is not the story you most believe — it is the story you most rehearsed. Rehearsal and truth are different things.",
      "The sentences we keep telling ourselves often started as somebody else's. A parent's. A teacher's. A first heartbreak's. They survived because they sounded like wisdom and asked nothing of us.",
    ],
    perspective:
      "A story is not the same as a truth. A useful question is not “Is this story true?” — it is “Is this story still useful?” Stories age. Some grow with you. Some need to be retired with respect. You are allowed to outgrow the sentences that once kept you safe.",
    questions: [
      "Which sentence do I repeat about myself most often?",
      "When did I first start saying it?",
      "If it disappeared tomorrow, what would I have to admit?",
      "Whose voice does that sentence really sound like?",
    ],
    nextStep:
      "For one week, write down the same sentence every time you hear it in your head. By Sunday, look at the list. The list itself will tell you whether the story is still serving you, or whether it has quietly become your tour guide.",
  },

  "why-we-miss-what-is-right-in-front-of-us": {
    slug: "why-we-miss-what-is-right-in-front-of-us",
    title: "Why We Miss What Is Right In Front Of Us",
    subtitle: "Attention is a finite resource. The default settings are not in your favour.",
    readingTime: "8 min read",
    section: "patterns",
    opening:
      "The most surprising thing about attention is how little of it we actually own. Most of what we look at, we are not really seeing. Most of what we hear, we are filtering for usefulness, not for truth. The world is far more available than we are.",
    pattern: [
      "Familiarity is a kind of blindness. We stop seeing what we expect to see. The kitchen we walk through every morning becomes a corridor.",
      "The mind prefers prediction to perception. Predicting is cheap. Perceiving is expensive. The brain reaches for the prediction every time, unless something forces it to look again.",
      "Emotion narrows attention. When the body is anxious or excited, the field of vision shrinks. You see the threat or the prize and nothing else. Useful for ancestors. Limiting for modern life.",
      "Devices have moved the most valuable currency you own — your attention — into someone else's economy. Recovering it is not a productivity hack. It is a quiet political act.",
    ],
    perspective:
      "Attention is not free. It costs nothing in money and everything in life. The simplest practice — looking at one ordinary thing for thirty seconds longer than usual — restores more than it sounds like. The world has been waiting.",
    questions: [
      "What did I genuinely see today that I had not seen before?",
      "Who in my life have I stopped looking at because I assume I already know them?",
      "What am I most afraid I would notice if I slowed down?",
      "Where is my attention being spent without my consent?",
    ],
    nextStep:
      "Tomorrow, pick one familiar object — a face, a room, a route. Look at it as if you have never seen it. Take thirty seconds. Write down one thing you did not know was there. Do this for seven days. The notebook will start to write back.",
  },

  "the-habit-of-constant-reacting": {
    slug: "the-habit-of-constant-reacting",
    title: "The Habit Of Constant Reacting",
    subtitle: "The difference between living and being chased by your inbox.",
    readingTime: "9 min read",
    section: "attention",
    opening:
      "Reaction is fast, satisfying, and almost always shallower than the situation deserves. A life lived in constant reaction looks like activity, but it is often just velocity without direction.",
    pattern: [
      "The reactive mind feels productive because it is busy. Busy and productive are not synonyms — they have never been — but they wear similar clothes.",
      "Notifications are not requests. They are interruptions dressed as requests. The polite thing to do is not to answer immediately. The polite thing is to answer well.",
      "Each fast reaction trains the next one. Reaction is a skill, sharpened by practice. So is its opposite.",
      "The cost of constant reacting is not measured in time. It is measured in attention residue — the part of your mind that never fully arrived at the next thing.",
    ],
    perspective:
      "Pausing is not slowness. Pausing is precision. The space between stimulus and response is where actual choice lives. Without it, you are not choosing — you are completing a reflex.",
    questions: [
      "What is the average gap between someone messaging me and my reply?",
      "How many of today's decisions did I actually make? How many did I just complete?",
      "Where in my day could a deliberate pause change the outcome?",
      "If reacting fast were taken away from me, what would slow down — and what would improve?",
    ],
    nextStep:
      "Choose one input — email, one chat thread, one type of message — and set a rule for the next three days: a minimum twenty-minute pause before responding. Note what happens. The world will continue. The replies will likely be better. You will be more here.",
  },

  "the-art-of-paying-attention": {
    slug: "the-art-of-paying-attention",
    title: "The Art Of Paying Attention",
    subtitle: "A practice, not a personality trait.",
    readingTime: "7 min read",
    section: "attention",
    opening:
      "People who are described as attentive are not born that way. They have practised. Paying attention is a craft, and like any craft, it improves precisely as much as you give it.",
    pattern: [
      "Attention has a posture before it has a method. Sit slightly forward. Soften the jaw. Slow the eyes. The body teaches the mind where to be.",
      "Single-tasking is not nostalgia for an older world. It is the basic prerequisite for noticing anything that takes longer than a glance.",
      "Curiosity is the engine of attention. You cannot will yourself to be attentive. You can ask yourself a better question, and let the question pull the attention behind it.",
      "Attention multiplies — given to one person, one task, one page, it becomes contagious. The room shifts.",
    ],
    perspective:
      "Paying attention is the most generous thing one person can do for another. It is also the most generous thing one person can do for themselves. The cost is small. The dividend is everything.",
    questions: [
      "When was the last time someone gave me their full attention? What did it feel like?",
      "Whom in my life would my full attention surprise?",
      "What question would make me genuinely curious for the next hour?",
      "What am I willing to look at long enough to actually see?",
    ],
    nextStep:
      "Once today, give one person — or one task — your undivided attention for ten minutes. No phone in sight. No second window open. Notice what changes for them. Notice what changes for you. Repeat tomorrow.",
  },

  "meaning-before-motivation": {
    slug: "meaning-before-motivation",
    title: "Meaning Before Motivation",
    subtitle: "Motivation is a passenger. Meaning is the engine.",
    readingTime: "8 min read",
    section: "meaning",
    opening:
      "Motivation has been oversold. It is the bright wrapper on a quieter package called meaning. Without meaning underneath, motivation flickers — bright one morning, gone by Wednesday.",
    pattern: [
      "Motivation is mostly mood. It depends on sleep, light, weather, conversation, blood sugar. None of that makes it bad — it makes it weather, not climate.",
      "Meaning is the climate. It does not require enthusiasm to function. People keep showing up to things that matter to them long after the motivation has expired.",
      "Confusing the two is expensive. We blame ourselves for lacking motivation when what is actually missing is a reason worth the effort.",
      "Meaning is rarely discovered all at once. It is assembled, slowly, from many small commitments to the same direction.",
    ],
    perspective:
      "If a thing matters, do it on the days you do not feel like doing it. Those are the days that prove it matters. The other days are easy. The other days do not teach you anything about yourself.",
    questions: [
      "What have I kept doing even when motivation disappeared?",
      "Where am I trying to motivate myself into something that has no meaning yet?",
      "What is the smallest meaningful direction I can commit to for the next month?",
      "What do I want to be slowly assembling, one quiet day at a time?",
    ],
    nextStep:
      "Write a single sentence: “If I had no motivation at all, I would still do _____ because _____.” Put it where you can see it. Read it on the bad days. The sentence is the engine. Motivation is just the weather.",
  },
};
