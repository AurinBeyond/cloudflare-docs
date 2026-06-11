/**
 * alistairLabContent.js — § ALISTAIR · LAB HERO TOPICS v1 2026-02-10
 *
 * Strategy: laboratories grow. Each lab opens with 2–3 hero topics
 * written fully in Alistair's voice (screen-down, ears-open,
 * anti-wellness, inquiry over prescription). Every other painted
 * topic remains a "Field Study In Progress" — a working laboratory
 * card, not a dead end.
 *
 * Shape mirrors moneyTreeContent.js so TopicDetail's AuthoredTopic
 * renderer can use the same component contract.
 */

const E = {
  OLD:      "Old Stories · Laboratory of Life",
  BODY1:    "The Body Knows First · Laboratory of Life",
  COMPASS:  "Compass of Meaning · Laboratory of Life",
  SAB:      "Self-Sabotage · Laboratory of Life",
  CODE:     "The Code · Laboratory of Life",
  STRINGS:  "Invisible Strings · Laboratory of Life",
  MASKS:    "Masks · Laboratory of Life",
  BODY:     "Body Language · Laboratory of Life",
  CHILD:    "Child & Parent · Laboratory of Life",
  BODY2:    "Body Language V2 · Laboratory of Life",
};

export const OLD_STORIES_CONTENT = {
  "im-not-enough": {
    eyebrow: E.OLD + " · Story Scrap",
    coreQuestion: "Whose voice taught me I was not enough — and how old was I when I believed it?",
    body: [
      "\"I'm not enough\" is rarely a thought we choose. It is a translation of an early room — a face that looked away, a comparison we overheard, a love that had conditions we couldn't name.",
      "We carry it as if it were a fact. It is not a fact. It is a sentence that survived because no one ever sat with us long enough to question it.",
      "The work is not to argue with the story. It is to recognise it as a story.",
    ],
    reflection: [
      "When did this story arrive in me, and what was happening in the room when it did?",
      "If I removed the words \"not enough\" from my inner vocabulary for one day, what would I do differently?",
    ],
    related: ["recognize", "reflect-100-true", "must-prove-myself"],
  },
  "recognize": {
    eyebrow: E.OLD + " · Practice",
    coreQuestion: "Can I notice the story the moment it is speaking, before I obey it?",
    body: [
      "Recognition is the first honest move. Not analysis. Not fixing. Just the pause where you say: \"oh — that is the story again.\"",
      "Most of what runs our lives is unrecognised. Recognition is what turns automatic into chosen.",
      "We are not trying to silence the story. We are learning to hear it as a voice in the room, not as the room itself.",
    ],
    reflection: [
      "What story did I just notice myself believing without checking?",
      "Where in my body did I feel it land?",
    ],
    related: ["im-not-enough", "reflect-100-true", "question"],
  },
  "reflect-100-true": {
    eyebrow: E.OLD + " · Reflection",
    coreQuestion: "Is this story 100% true — or only loud?",
    body: [
      "An old story does not need to be true to be powerful. It only needs to be familiar.",
      "When we ask honestly whether the story is true, we usually discover that it is at best a fragment, written long ago, by a younger version of us trying to keep us safe.",
      "This is not a debate. It is a softening of the grip.",
    ],
    reflection: [
      "If only 10% of this story were true, what would change in how I respond to it?",
      "What evidence am I quietly ignoring that contradicts the story?",
    ],
    related: ["recognize", "im-not-enough", "release"],
  },
};

export const BODY_KNOWS_FIRST_CONTENT = {
  "feel": {
    eyebrow: E.BODY1 + " · Practice",
    coreQuestion: "What am I refusing to feel right now?",
    body: [
      "To feel is to be available to what is here, in the body, before it gets explained.",
      "Most of us were trained to bypass feeling: to think, to fix, to function. The body learned to be quiet so the mind could be efficient.",
      "Feeling is not a performance. It is a return.",
    ],
    reflection: [
      "If I drop into my chest right now, what is there?",
      "What am I waiting to feel after — after the deadline, after the trip, after the rest?",
    ],
    related: ["sensations", "reflect-trying-to-tell", "breathe"],
  },
  "sensations": {
    eyebrow: E.BODY1 + " · Sub-Card",
    coreQuestion: "What sensation am I treating as background noise?",
    body: [
      "Sensation is the language the body speaks before words arrive.",
      "Tight chest. Warm cheeks. Cool palms. Low hum in the gut. These are not problems. They are messages.",
      "When we stay with a sensation without rushing to interpret it, the body begins to tell us what the mind has been avoiding.",
    ],
    reflection: [
      "What sensation is asking for my attention right now?",
      "If I stayed with it for one more minute instead of moving on, what would it have to tell me?",
    ],
    related: ["feel", "triggers", "regulation"],
  },
  "reflect-trying-to-tell": {
    eyebrow: E.BODY1 + " · Reflection",
    coreQuestion: "What is my body trying to tell me — that my mind keeps overriding?",
    body: [
      "The body does not lie. It also does not shout. It signals — through tightness, fatigue, restlessness, sudden hunger, the urge to leave the room.",
      "We are taught to dismiss these signals as inconvenience.",
      "The body is patient. It will say the same thing for years, in quieter and louder ways, until it is heard.",
    ],
    reflection: [
      "What has my body been saying for months that I keep filing under \"not now\"?",
      "What would change if I listened to it as if it were a wise friend?",
    ],
    related: ["feel", "sensations", "reflect-tension"],
  },
};

export const COMPASS_CONTENT = {
  "purpose": {
    eyebrow: E.COMPASS + " · Compass Topic",
    coreQuestion: "What is mine to do — even when no one is watching, and no one is paying?",
    body: [
      "Purpose is often confused with productivity. They are not the same.",
      "Productivity is what we do because we are watched. Purpose is what we do because we cannot do otherwise.",
      "It is rarely a thunderclap. It is more often a small, repeated pull toward a kind of work, a kind of conversation, a kind of attention.",
    ],
    reflection: [
      "What do I find myself doing even when no one notices?",
      "If I knew it would not make me money, would I still do it?",
    ],
    related: ["soul-path", "calling", "meaning"],
  },
  "soul-path": {
    eyebrow: E.COMPASS + " · Path",
    coreQuestion: "What would my life look like if I followed the quiet pull and not the loud advice?",
    body: [
      "The soul path is not a destination. It is a kind of listening.",
      "It rarely matches the path our parents imagined for us, or the one our anxious mind keeps trying to reroute us onto.",
      "Walking it usually means disappointing some part of the world that wanted us in a different shape.",
    ],
    reflection: [
      "Where is my life rhyming with my deepest knowing — and where is it not?",
      "What would the next step look like if I trusted myself a little more this week?",
    ],
    related: ["purpose", "calling", "growth"],
  },
  "sign-drained": {
    eyebrow: E.COMPASS + " · Sign You're Off Path",
    coreQuestion: "What is draining me — and what am I refusing to admit about it?",
    body: [
      "Being drained is not always about workload. It is often about misalignment — doing the right kind of work in the wrong kind of room, or the wrong kind of work for the right kind of reason.",
      "The body keeps the receipts. It will withdraw energy from a life it does not believe in.",
      "Tiredness is information. It is not a failure of willpower.",
    ],
    reflection: [
      "What in my week consistently leaves me emptier than it found me?",
      "What would my energy look like if I removed even one of those things?",
    ],
    related: ["sign-stuck", "sign-people-please", "checkin-alignment"],
  },
};

export const SELF_SABOTAGE_CONTENT = {
  "hidden-patterns": {
    eyebrow: E.SAB + " · Pattern Map",
    coreQuestion: "What pattern keeps repeating in my life that I keep blaming on bad luck?",
    body: [
      "Patterns are loyal. They show up exactly when we are about to outgrow them.",
      "Self-sabotage is rarely random. It runs on the schedule of our nervous system, not our calendar.",
      "When we begin to see the pattern, we discover it was never the enemy. It was a strategy that once worked.",
    ],
    reflection: [
      "What pattern keeps showing up in my work, my love, my money?",
      "If this pattern were trying to protect me, what would it be protecting me from?",
    ],
    related: ["root-beliefs", "emotional-triggers", "notice"],
  },
  "root-beliefs": {
    eyebrow: E.SAB + " · Pattern Source",
    coreQuestion: "What did I decide was true about me, very early, that I am still living out today?",
    body: [
      "Beneath every pattern is a belief. Beneath every belief is a moment when believing it kept us safe.",
      "Root beliefs were rarely chosen. They were absorbed.",
      "The work is to find the belief without judging the child who installed it.",
    ],
    reflection: [
      "What do I believe about myself that I would never say out loud?",
      "Who taught me to believe it?",
    ],
    related: ["hidden-patterns", "new-choices", "notice"],
  },
  "notice": {
    eyebrow: E.SAB + " · Step 1",
    coreQuestion: "Can I catch the moment of sabotage as it is happening — without shame?",
    body: [
      "Notice is the first verb. Not fix. Not stop. Notice.",
      "The pattern only changes once it has been seen with kindness.",
      "If we meet self-sabotage with judgment, it goes underground and gets cleverer. If we meet it with attention, it begins to soften.",
    ],
    reflection: [
      "What is one moment this week when I noticed myself about to do the old thing?",
      "What did I do with that noticing?",
    ],
    related: ["inquire", "hidden-patterns", "self-trust"],
  },
};

export const THE_CODE_CONTENT = {
  "code-conditioning": {
    eyebrow: E.CODE + " · The Code Chain",
    coreQuestion: "Whose programming am I running on?",
    body: [
      "Conditioning is the operating system we did not install but use every day.",
      "Some of it is useful — how to cross a road, how to be kind. Some of it is the residue of fear, expectation and inherited shame.",
      "Recognising the code is not blaming anyone. It is reading the source.",
    ],
    reflection: [
      "What rule do I obey without remembering when I agreed to it?",
      "If this rule disappeared tomorrow, what would I do differently?",
    ],
    related: ["code-repetition", "thought-make-proud", "your-freedom"],
  },
  "thought-make-proud": {
    eyebrow: E.CODE + " · Code Thought",
    coreQuestion: "Whose pride am I still trying to earn — and what has it cost me?",
    body: [
      "Many of our biggest life decisions were not made for our life. They were made for the imagined face of someone who needed to be proud.",
      "Sometimes that face has been gone for years. The decision still stands.",
      "There is a difference between honouring someone and obeying their imagined approval forever.",
    ],
    reflection: [
      "Whose pride do I rehearse before I decide?",
      "What would I choose if their pride was already on the table — secure, irrelevant, or gone?",
    ],
    related: ["thought-disappoint", "ext-parents", "your-freedom"],
  },
  "your-freedom": {
    eyebrow: E.CODE + " · Beyond the Code",
    coreQuestion: "Freedom from what — and freedom for what?",
    body: [
      "Freedom is not the absence of obligations. It is the conscious choosing of which obligations to keep.",
      "Most of us mistake escape for freedom. Escape gets us out of the room. Freedom decides which room to walk into.",
      "It begins, quietly, with noticing the lines of code we never chose.",
    ],
    reflection: [
      "What part of my life still runs on rules I would not choose today?",
      "What would I do this week if I were one degree freer?",
    ],
    related: ["code-conditioning", "thought-make-proud", "step-freedom"],
  },
};

export const INVISIBLE_STRINGS_CONTENT = {
  "string-need-approval": {
    eyebrow: E.STRINGS + " · String Thought",
    coreQuestion: "Whose nod am I still walking around to find?",
    body: [
      "The need for approval is the oldest string we know. As children, approval was a synonym for safety.",
      "As adults, the string is still tied to the same place — except now we call it networking, ambition, professionalism.",
      "Approval is not the enemy. The string is.",
    ],
    reflection: [
      "Whose approval do I quietly arrange my life around?",
      "What would I write, say, build, refuse — if I knew their approval was off the table?",
    ],
    related: ["string-cant-disappoint", "string-cant-say-no", "step-truth"],
  },
  "string-cant-say-no": {
    eyebrow: E.STRINGS + " · String Thought",
    coreQuestion: "What am I afraid would happen if I said no — and meant it?",
    body: [
      "\"I can't say no\" is rarely about capacity. It is about cost.",
      "We learned, early, that yes kept us in the room. The bill arrives later, in exhaustion, resentment, or quiet collapse.",
      "Saying no is not rude. It is honest pricing.",
    ],
    reflection: [
      "What did I say yes to this week that I knew I should refuse?",
      "What would saying no cost me — and what would it return?",
    ],
    related: ["string-need-approval", "string-cant-disappoint", "step-awareness"],
  },
  "step-truth": {
    eyebrow: E.STRINGS + " · Step 1",
    coreQuestion: "What is the truth I am quietly working around?",
    body: [
      "Truth is the first cut of the string. Not the loud kind. The kind we admit only to ourselves.",
      "Most of our strings stay tied because we will not say, even inwardly, what we already know.",
      "Truth-telling is rarely public. It begins, almost always, in a quiet room with our own attention.",
    ],
    reflection: [
      "What do I already know about my life that I keep dressing up?",
      "What sentence have I refused to write down because writing it would change everything?",
    ],
    related: ["step-awareness", "step-freedom", "string-need-approval"],
  },
};

export const MASKS_CONTENT = {
  "pleaser": {
    eyebrow: E.MASKS + " · The Mask",
    coreQuestion: "What does my pleaser keep arranging, and what is the bill she never sends?",
    body: [
      "The Pleaser learned that love arrived more reliably when she made it easy for everyone else.",
      "She is not weak. She is exquisitely attuned — she has been reading rooms since she was three.",
      "The work is not to fire her. It is to thank her, and to stop sending her into rooms where her gift becomes a tax.",
    ],
    reflection: [
      "Where does my pleaser still volunteer for jobs my adult self would refuse?",
      "What kind of love would I have to receive to let her rest?",
    ],
    related: ["reflect-masks-most-often", "ex-pleaser", "good-one"],
  },
  "reflect-masks-most-often": {
    eyebrow: E.MASKS + " · Reflection",
    coreQuestion: "What masks do I wear most often — and which ones do I wear without noticing?",
    body: [
      "We rarely choose our masks. We inherited them, then forgot to take them off.",
      "Each mask once kept us safe in a specific room — at home, at school, online, at work.",
      "Noticing the mask is not betraying it. It is choosing whether to keep wearing it.",
    ],
    reflection: [
      "Which mask did I wear today without remembering I had put it on?",
      "Who would I be in this room without it?",
    ],
    related: ["pleaser", "recognize", "reflect-who-without"],
  },
  "recognize": {
    eyebrow: E.MASKS + " · Practice",
    coreQuestion: "Can I see the mask as a mask — and still be kind to the one who wears it?",
    body: [
      "Recognition here is not exposure. It is gentleness.",
      "The mask was a survival shape. We do not shame survival.",
      "We see the mask, we thank it, and we slowly let it become optional rather than automatic.",
    ],
    reflection: [
      "When I see my mask clearly, what does my face do?",
      "Where am I ready to let it become optional?",
    ],
    related: ["pleaser", "reflect-masks-most-often", "release"],
  },
};

export const BODY_LANGUAGE_CONTENT = {
  "body-shoulders": {
    eyebrow: E.BODY + " · Body Part",
    coreQuestion: "What weight am I carrying in my shoulders that was never assigned to me?",
    body: [
      "The shoulders are the body's filing cabinet. They store responsibilities we accepted long before we had any choice in the matter.",
      "Some of the weight is ours. Most of it is inherited — a family's anxiety, a partner's mood, a culture's expectation.",
      "The work begins not with stretching. It begins with naming what is up there.",
    ],
    reflection: [
      "What am I carrying in my shoulders right now that does not belong to me?",
      "If I set it down for one day, who would be uncomfortable?",
    ],
    related: ["tight-shoulders", "practice-body-scan", "body-back"],
  },
  "tight-jaw": {
    eyebrow: E.BODY + " · Body Signal",
    coreQuestion: "What am I holding back that the jaw is keeping in?",
    body: [
      "A tight jaw is rarely about teeth. It is the muscle of the unsaid.",
      "We learned, very early, that some things could not be spoken. The jaw remembered, even when the mind did not.",
      "Softening the jaw is sometimes the first honest movement of the day.",
    ],
    reflection: [
      "What words have I been chewing instead of speaking?",
      "What would soften if I unclenched, even for one breath?",
    ],
    related: ["body-jaw", "shallow-breath", "practice-tension-release"],
  },
  "practice-body-scan": {
    eyebrow: E.BODY + " · Practice",
    coreQuestion: "What does my body have to say if I move through it slowly enough to hear?",
    body: [
      "A body scan is not a wellness exercise. It is a return visit.",
      "We move attention, slowly, from the crown to the feet — not looking for problems. Looking for what is here.",
      "Most of the time, we discover the body has been writing us letters we never opened.",
    ],
    reflection: [
      "Where did my body ask for attention I have not yet given?",
      "What was the first place I wanted to skip past?",
    ],
    related: ["body-shoulders", "tight-jaw", "practice-breath-awareness"],
  },
};

export const CHILD_PARENT_CONTENT = {
  "wonder": {
    eyebrow: E.CHILD + " · Child World",
    coreQuestion: "When was the last time I let something be interesting just because it was?",
    body: [
      "Wonder is the child's natural posture. It does not need a reason.",
      "Adulthood trained most of us to need a reason — a use, a return, an outcome. We call this maturity. It is also a kind of starvation.",
      "Wonder is not childish. It is the doorway back into being alive.",
    ],
    reflection: [
      "What did I find wondrous as a child that I have stopped letting myself find wondrous?",
      "What would change if I gave myself ten minutes of unproductive curiosity today?",
    ],
    related: ["imagine", "play", "discover"],
  },
  "imagine": {
    eyebrow: E.CHILD + " · Child World",
    coreQuestion: "What did I imagine for my life when no one had told me what was realistic?",
    body: [
      "Imagination is not escapism. It is rehearsal.",
      "The child imagines easily because the child has not yet been taught what is not allowed.",
      "When we recover imagination as adults, we recover the right to want things our practical mind has been quietly vetoing.",
    ],
    reflection: [
      "What did the child in me imagine for my life — and which of those imaginings am I still secretly carrying?",
      "What would I let myself imagine today if no realism was required?",
    ],
    related: ["wonder", "play", "transformation"],
  },
  "awareness": {
    eyebrow: E.CHILD + " · Parent World",
    coreQuestion: "Can I be aware of both — the child I was and the parent I have become?",
    body: [
      "Awareness here is not analysis. It is double vision — seeing the child and the parent in the same body at the same time.",
      "Most adult suffering is the parent overriding the child, or the child running the parent's calendar.",
      "Awareness is the room where they finally meet.",
    ],
    reflection: [
      "Which of my parts is louder today — the child or the parent?",
      "What would change if I let them speak to each other instead of through me?",
    ],
    related: ["choice", "growth", "transformation"],
  },
};

export const BODY_LANGUAGE_V2_CONTENT = {
  "heart-connection": {
    eyebrow: E.BODY2 + " · Body Area",
    coreQuestion: "Where in my chest do I allow connection — and where do I quietly close it off?",
    body: [
      "The heart is not a metaphor. It is a muscle that opens and closes in response to safety.",
      "Many of us learned to keep it half-closed by default, because half-open was once enough to keep us going.",
      "Connection grows where the chest agrees to stay open one breath longer than usual.",
    ],
    reflection: [
      "When did I last feel my chest soften in another person's presence?",
      "Where in my life is my heart half-closed because half-open is what kept me safe?",
    ],
    related: ["breath-safety-flow", "hands-expression", "shoulders-carrying"],
  },
  "breath-safety-flow": {
    eyebrow: E.BODY2 + " · Body Area",
    coreQuestion: "What does my breath know about my sense of safety right now?",
    body: [
      "Breath is the most honest report we have on the inner state.",
      "Shallow breath is the body's discreet way of saying: \"I am bracing.\" Long breath says: \"I am here.\"",
      "We do not fix the breath. We notice it, and let the noticing slow it.",
    ],
    reflection: [
      "Where in my body does the breath stop, just now?",
      "What would change if I let the next out-breath be one second longer?",
    ],
    related: ["heart-connection", "belly-intuition", "practice-breath-awareness"],
  },
  "awareness": {
    eyebrow: E.BODY2 + " · Practice",
    coreQuestion: "Can I be aware of my body as it is — without trying to correct it?",
    body: [
      "Awareness here is the first practice of the body. Not posture. Not performance. Attention.",
      "We have been trained to look at our bodies through criticism and mirrors. The body learned to flinch.",
      "Awareness is the kind of looking that does not flinch.",
    ],
    reflection: [
      "Where am I looking at my body through judgment rather than presence?",
      "What part of my body have I never really befriended?",
    ],
    related: ["heart-connection", "breath-safety-flow", "interpret"],
  },
};

export default {
  OLD_STORIES_CONTENT,
  BODY_KNOWS_FIRST_CONTENT,
  COMPASS_CONTENT,
  SELF_SABOTAGE_CONTENT,
  THE_CODE_CONTENT,
  INVISIBLE_STRINGS_CONTENT,
  MASKS_CONTENT,
  BODY_LANGUAGE_CONTENT,
  CHILD_PARENT_CONTENT,
  BODY_LANGUAGE_V2_CONTENT,
};
