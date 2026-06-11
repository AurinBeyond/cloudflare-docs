/**
 * moneyTreeContent.js — § ALISTAIR · MONEY TREE WITHIN 2026-02-10
 *
 * Authored content for every painted topic inside the Money Tree lab.
 * Voice: Alistair. Screen-down, ears-open. Anti-wellness. Contemplative.
 * Questions over answers. No prescriptions, no toxic positivity, no
 * "five steps to abundance". We come here to remember, not to be sold.
 *
 * Shape per topic:
 *   eyebrow       — small caps tag, indicates the painted group
 *   coreQuestion  — single italic line of inquiry
 *   body          — array of short reflective paragraphs (~80–120 words total)
 *   reflection    — 2 journal-style prompts
 *   related       — 2–3 sibling topic IDs in the same lab
 */

const G = {
  GARDENER: "Money Tree Within · Gardener",
  NOURISHED: "Money Tree Within · Nourished Branch",
  TRUNK: "Money Tree Within · Internal Belief",
  NEGLECTED: "Money Tree Within · Neglected Branch",
  ROOTS: "Money Tree Within · Deeper Roots",
  OLD: "Money Tree Within · Old Story",
  CORE: "Money Tree Within · Core Belief",
  FRUIT: "Money Tree Within · Life Result",
};

export const MONEY_TREE_CONTENT = {
  // ── Gardener Actions ─────────────────────────────────
  "prune": {
    eyebrow: G.GARDENER,
    coreQuestion: "What is finished, even if I am still feeding it?",
    body: [
      "To prune is not to punish the tree. It is to honour the difference between what is alive and what is only loud.",
      "We tend to keep watering branches that broke years ago — old commitments, old loyalties, old versions of ourselves. The tree grows tired carrying them.",
      "Pruning is an act of attention, not violence. You look. You touch. You decide what is still bearing fruit.",
    ],
    reflection: [
      "What is still on my plate only because I once said yes and never said no again?",
      "If I removed it, what would have room to grow?",
    ],
    related: ["self-sabotage", "control", "be-realistic"],
  },
  "water": {
    eyebrow: G.GARDENER,
    coreQuestion: "What is asking for my attention before it asks for my money?",
    body: [
      "Water is not heroic. It is steady. The tree does not grow because we noticed it once; it grows because we returned.",
      "Most of what we starve is not exotic. It is a friendship we postpone, a draft we never reopen, a body we keep ignoring until it raises its voice.",
      "Watering is a question of return, not effort.",
    ],
    reflection: [
      "What in my life is quietly thirsty?",
      "What is one place I would return to this week if no one was counting?",
    ],
    related: ["relationships", "creativity", "love"],
  },
  "plant": {
    eyebrow: G.GARDENER,
    coreQuestion: "What seed do I keep in my pocket and never put in the ground?",
    body: [
      "Planting is the smallest act and the most exposed. The seed is committed the moment it touches soil. There is no taking it back.",
      "We carry many seeds — ideas, apologies, asks, beginnings — and we polish them in the dark because the dark feels safer than the field.",
      "To plant is to accept that the ground may not be ready, and to do it anyway.",
    ],
    reflection: [
      "What have I been preparing for so long that the preparing has become the project?",
      "What would change if I planted today instead of researched?",
    ],
    related: ["leadership", "opportunity", "freedom"],
  },

  // ── Nourished Branches ───────────────────────────────
  "opportunity": {
    eyebrow: G.NOURISHED,
    coreQuestion: "What is opening for me that I keep refusing to see?",
    body: [
      "Opportunity rarely arrives wearing the word \"opportunity\". It looks like inconvenience, like a name you forgot, like a quiet email you almost archived.",
      "When we are hungry at the root, we cannot see the field. We mistake every offering for a trick.",
      "An opportunity is a door that someone left ajar for you. It does not insist. It waits.",
    ],
    reflection: [
      "What did I dismiss this week because it didn't look like \"the right kind\" of opportunity?",
      "Where am I waiting for permission that has already been given?",
    ],
    related: ["leadership", "creativity", "abundance"],
  },
  "relationships": {
    eyebrow: G.NOURISHED,
    coreQuestion: "Who am I when I am not performing for the people I love?",
    body: [
      "A nourished relationship is not constant agreement. It is the quiet permission to be a real person — uneven, hungry, contradictory — without losing the room.",
      "We learn early that connection is conditional. We trade pieces of ourselves for safety and call it intimacy.",
      "The branch of relationships grows when we let people see the parts we usually hide, and trust them to stay.",
    ],
    reflection: [
      "Where am I performing intimacy instead of practising it?",
      "Who in my life would I miss the most if I stopped pretending?",
    ],
    related: ["belonging", "love", "trust"],
  },
  "work-impact": {
    eyebrow: G.NOURISHED,
    coreQuestion: "What does my work cost me, and what does it return?",
    body: [
      "Impact is not output. A great deal of busy work leaves no trace, and a single sentence said at the right moment can outlive a career.",
      "We confuse motion with meaning because motion is easier to measure. The tree does not grade itself by hours.",
      "The branch of work grows when we let our labour rhyme with our life, instead of competing with it.",
    ],
    reflection: [
      "If no one ever applauded me again, would I still do this work?",
      "What in my work is alive, and what is only a habit?",
    ],
    related: ["contribution", "meaning", "overworking"],
  },
  "creativity": {
    eyebrow: G.NOURISHED,
    coreQuestion: "What wants to be made through me — not by me?",
    body: [
      "Creativity is not a personality trait. It is a relationship with the unfinished.",
      "Most of us were trained to fear the blank page because the blank page reveals what we actually believe is allowed.",
      "The branch of creativity grows when we stop demanding the work be brilliant before it is born.",
    ],
    reflection: [
      "What have I almost made, and then talked myself out of?",
      "What would I create if no one would ever see it?",
    ],
    related: ["plant", "freedom", "meaning"],
  },
  "leadership": {
    eyebrow: G.NOURISHED,
    coreQuestion: "Where am I willing to be the first one to be wrong out loud?",
    body: [
      "Leadership is not certainty. It is the courage to move while still uncertain, and to take the responsibility for the move.",
      "We confuse leading with controlling because both look the same from far away.",
      "The branch of leadership grows when we agree to be visible without needing to be right.",
    ],
    reflection: [
      "What conversation am I avoiding because I would have to lead it?",
      "Where would my life change if I stopped waiting for someone braver to go first?",
    ],
    related: ["opportunity", "plant", "freedom"],
  },

  // ── Trunk · Internal Beliefs ─────────────────────────
  "worth": {
    eyebrow: G.TRUNK,
    coreQuestion: "What did I decide I was worth, and how old was I when I decided?",
    body: [
      "Worth is rarely a thought. It is the temperature of the room when we ask for something.",
      "Most of what we believe about our worth was written by people who never had us in mind. We inherited their accounting.",
      "Worth is not earned by being useful. It is recognised — first by us, then by the rooms we walk into.",
    ],
    reflection: [
      "When did I last feel worthy without doing anything to earn it?",
      "Whose voice tells me I am too much, or not enough?",
    ],
    related: ["value", "receiving", "fear"],
  },
  "trust": {
    eyebrow: G.TRUNK,
    coreQuestion: "Where does trust live in me — and where is it bruised?",
    body: [
      "Trust is not naïve. It is the muscle that decides whether to soften or to brace.",
      "We are not careless because we are foolish — we are careful because we were hurt. The branch of trust grows slowly, on purpose.",
      "To trust again is not to forget. It is to know the wound and choose, this time, to listen for difference.",
    ],
    reflection: [
      "Whom do I trust without needing them to prove it?",
      "Where am I bracing now, even though no one is hurting me today?",
    ],
    related: ["safety", "love", "control"],
  },
  "identity": {
    eyebrow: G.TRUNK,
    coreQuestion: "Who am I beneath the descriptions other people use for me?",
    body: [
      "Identity is the story we keep telling because it is the one we have learned. It is not the only true one.",
      "We grow attached to our descriptions — the strong one, the easy one, the smart one — because they explain us. They also confine us.",
      "Identity is allowed to be in motion. The trunk is not a statue.",
    ],
    reflection: [
      "Which of my labels do I keep wearing out of loyalty to who I used to be?",
      "What would change if I removed one description today?",
    ],
    related: ["masks", "worth", "value"],
  },
  "value": {
    eyebrow: G.TRUNK,
    coreQuestion: "What do I value, and where does my calendar disagree?",
    body: [
      "Value is not a list. It is what survives when our attention is pulled.",
      "We claim many values and live by a few. The rest are ornaments.",
      "To know your value is to notice what you protect when you are tired.",
    ],
    reflection: [
      "What did I protect this week without thinking about it?",
      "What value would I like to live by that my calendar currently denies?",
    ],
    related: ["worth", "meaning", "identity"],
  },
  "receiving": {
    eyebrow: G.TRUNK,
    coreQuestion: "What do I refuse to receive that the world keeps offering?",
    body: [
      "Giving is easier than receiving for many of us, because receiving costs us our defences.",
      "We deflect kindness with humour, deflect help with capability, deflect attention with shrugs. The branch of receiving grows starved.",
      "Receiving is not greed. It is permission for the field to feed us back.",
    ],
    reflection: [
      "When did I last let someone help me without making it small?",
      "What am I withholding from myself that I would freely give to a friend?",
    ],
    related: ["abundance", "love", "trust"],
  },

  // ── Neglected Branches ───────────────────────────────
  "fear": {
    eyebrow: G.NEGLECTED,
    coreQuestion: "What is my fear actually trying to protect?",
    body: [
      "Fear is not the enemy. It is the part of us that was once correct, asking whether the threat is still here.",
      "We have been taught to manage fear, override it, dismiss it. The branch grows neglected, and the fear gets louder.",
      "To listen to fear is to stop arguing with it and ask what it remembers.",
    ],
    reflection: [
      "When my fear arrives, what is the age of the voice speaking?",
      "What would my fear say if I sat down beside it instead of fighting it?",
    ],
    related: ["safety", "control", "self-sabotage"],
  },
  "guilt": {
    eyebrow: G.NEGLECTED,
    coreQuestion: "Whose guilt am I carrying that was never mine?",
    body: [
      "Some guilt is a teacher. Most is a hand-me-down.",
      "We learn very young that to feel guilty is to be \"a good person\". We start collecting it like proof.",
      "The branch of guilt grows neglected when we cannot tell the difference between accountability and self-punishment.",
    ],
    reflection: [
      "Which guilt belongs to me, and which one am I storing for someone else?",
      "If I forgave myself for it tonight, what would I do tomorrow?",
    ],
    related: ["shame", "approval", "be-realistic"],
  },
  "scarcity": {
    eyebrow: G.NEGLECTED,
    coreQuestion: "Where do I act poor in places where I am not?",
    body: [
      "Scarcity is not always about money. It is the inner posture of \"there is not enough\" — of time, of love, of safety, of room.",
      "We can earn a great deal and still live inside a tightness we inherited.",
      "The branch of scarcity grows when we mistake an old wound for a present fact.",
    ],
    reflection: [
      "Where am I rationing something that is not actually scarce?",
      "What would change if I behaved, for a day, as if there were enough?",
    ],
    related: ["abundance", "fear", "receiving"],
  },
  "overworking": {
    eyebrow: G.NEGLECTED,
    coreQuestion: "What am I trying not to feel by being so productive?",
    body: [
      "Overworking is rarely about work. It is about avoidance dressed up as virtue.",
      "We have been rewarded for it since school. The tree is praised for being exhausted.",
      "The branch of overworking grows neglected because the work covers the neglect.",
    ],
    reflection: [
      "What feeling shows up when I am still?",
      "What would I have to face if I worked one hour less per day?",
    ],
    related: ["work-impact", "self-sabotage", "control"],
  },
  "self-sabotage": {
    eyebrow: G.NEGLECTED,
    coreQuestion: "What is the part of me that breaks the door trying to protect?",
    body: [
      "Self-sabotage is not a flaw. It is a protective pattern that once kept us safe.",
      "The branch breaks the branch because, at some point, having the thing felt more dangerous than wanting it.",
      "To meet self-sabotage with curiosity instead of shame is the first honest move.",
    ],
    reflection: [
      "When I am close to what I want, what do I do to make sure I don't get it?",
      "What was the cost, long ago, of being seen wanting?",
    ],
    related: ["fear", "worth", "overworking"],
  },

  // ── Deeper Roots ─────────────────────────────────────
  "family": {
    eyebrow: G.ROOTS,
    coreQuestion: "What did my family teach me about money, value and being seen?",
    body: [
      "The family is the first weather. We learn how to stand by watching how the people around us stood.",
      "We inherit not only their beliefs but their unfinished work.",
      "The root of family is not blame. It is recognition — what we received, what we did not, and what we now carry.",
    ],
    reflection: [
      "What did the people who raised me tell me, with words or without, about deserving?",
      "What am I still trying to prove to a room that no longer exists?",
    ],
    related: ["childhood", "belonging", "approval"],
  },
  "childhood": {
    eyebrow: G.ROOTS,
    coreQuestion: "What did the child I was need that the child I was rarely got?",
    body: [
      "The child is not gone. They are simply quieter now, watching to see whether it is safe to want anything.",
      "Most of our adult logic is the child's old solution, still running.",
      "The root of childhood grows when we stop trying to fix the child and start listening to them.",
    ],
    reflection: [
      "What did I learn to do, very young, to keep the peace?",
      "What would the child in me say if I sat down with them today?",
    ],
    related: ["family", "safety", "love"],
  },
  "safety": {
    eyebrow: G.ROOTS,
    coreQuestion: "Where in my body does safety actually live?",
    body: [
      "Safety is not the absence of risk. It is the felt sense that my system trusts me to handle what comes.",
      "Many of us live our adult lives bracing for a threat that has already passed.",
      "The root of safety grows when we let the nervous system finish the sentence the body started years ago.",
    ],
    reflection: [
      "When did I last feel actually safe — not just unbothered?",
      "What does my body need in order to soften?",
    ],
    related: ["fear", "trust", "control"],
  },
  "belonging": {
    eyebrow: G.ROOTS,
    coreQuestion: "Where do I belong when I am not earning my place?",
    body: [
      "Belonging is not the same as fitting in. Fitting in costs you yourself. Belonging does not.",
      "We learn early that love is conditional, and we spend a lifetime auditioning.",
      "The root of belonging grows when we agree to be inconveniently ourselves in the rooms we want to stay in.",
    ],
    reflection: [
      "Where do I belong without needing to perform?",
      "What part of me have I exiled in order to keep my seat at a table?",
    ],
    related: ["love", "family", "approval"],
  },
  "love": {
    eyebrow: G.ROOTS,
    coreQuestion: "What did I decide love was, and was I right?",
    body: [
      "Love, like worth, gets its first definitions written without our consent.",
      "Many of us call \"love\" what was actually performance, anxiety, or fear of abandonment.",
      "The root of love grows when we let ourselves be loved without doing anything to deserve it today.",
    ],
    reflection: [
      "What is the love I would never accept if I saw it written down?",
      "What kind of love do I want — and have I ever asked for it directly?",
    ],
    related: ["belonging", "trust", "receiving"],
  },

  // ── Old Stories · Coded-Belief Quotes ────────────────
  "money-doesnt-grow": {
    eyebrow: G.OLD,
    coreQuestion: "Whose mouth said this to me — and is it still true?",
    body: [
      "\"Money doesn't grow on trees\" was rarely about money. It was about scarcity, about not asking, about being grateful for too little.",
      "We were given the sentence as a shield, and we wore it as a definition.",
      "The story grows old only when we let it be old.",
    ],
    reflection: [
      "Which of my money beliefs is actually a sentence I overheard before I was ten?",
      "What does my own grown self believe now?",
    ],
    related: ["scarcity", "receiving", "family"],
  },
  "be-realistic": {
    eyebrow: G.OLD,
    coreQuestion: "Whose realism was that, and was it ever realistic for me?",
    body: [
      "\"Be realistic\" is often a translation of \"do not make me uncomfortable with your hope\".",
      "Realism is useful when it is honest. It is corrosive when it is fear in a tidy coat.",
      "There is a real difference between feet on the ground and feet in cement.",
    ],
    reflection: [
      "Whose definition of \"realistic\" am I still carrying?",
      "What dream did I trim, and what would I un-trim today?",
    ],
    related: ["scarcity", "fear", "leadership"],
  },
  "dont-disappoint": {
    eyebrow: G.OLD,
    coreQuestion: "Whose disappointment am I still working not to cause?",
    body: [
      "The fear of disappointing is the fear of being seen wanting differently from the people who held our safety.",
      "We learn to read faces, to anticipate, to pre-shrink our wanting.",
      "There is no life worth living that does not, somewhere, disappoint someone.",
    ],
    reflection: [
      "Whose face do I rehearse in my head before I make decisions?",
      "What would I choose if their disappointment was already on the table?",
    ],
    related: ["approval", "guilt", "belonging"],
  },
  "work-harder": {
    eyebrow: G.OLD,
    coreQuestion: "What if working harder is not the answer this time?",
    body: [
      "\"Work harder\" is the most rewarded sentence of our childhood. It is also the one most often substituted for love.",
      "When effort becomes proof, exhaustion becomes identity.",
      "There are seasons for effort. There are also seasons for honesty about the effort.",
    ],
    reflection: [
      "Where am I working harder because I am afraid of what stillness would reveal?",
      "What problem am I trying to outwork instead of look at?",
    ],
    related: ["overworking", "approval", "worth"],
  },
  "who-do-you-think": {
    eyebrow: G.OLD,
    coreQuestion: "Who do I think I am — and who told me not to?",
    body: [
      "\"Who do you think you are?\" was usually a sentence delivered to stop us. It worked.",
      "We learned to keep ourselves smaller than the room.",
      "The question is worth asking again, without the cruelty in the voice.",
    ],
    reflection: [
      "Who do I think I am, when no one is looking?",
      "What would change if I stopped apologising for being it?",
    ],
    related: ["worth", "identity", "leadership"],
  },

  // ── Core Beliefs · Internal Programs ─────────────────
  // worth, fear, trust, receiving already authored in TRUNK section above.
  "approval": {
    eyebrow: G.CORE,
    coreQuestion: "Whose approval am I still arranging my life around?",
    body: [
      "Approval is a fine reward and a terrible compass. When we steer by it, we drift.",
      "We were taught that being approved of is the same as being safe. As children, often it was.",
      "As adults, that bargain costs us our own voice.",
    ],
    reflection: [
      "Whose nod am I waiting for that I would never wait for from myself?",
      "What would I do today if no one would ever clap?",
    ],
    related: ["dont-disappoint", "guilt", "belonging"],
  },
  "control": {
    eyebrow: G.CORE,
    coreQuestion: "What am I afraid would happen if I let go of the wheel for a moment?",
    body: [
      "Control is not a personality. It is a response to a moment when we needed safety and only had grip.",
      "We confuse holding tight with being responsible.",
      "Some things grow only in the unmanaged spaces.",
    ],
    reflection: [
      "Where am I gripping out of habit, not out of need?",
      "What part of my life have I refused to let breathe?",
    ],
    related: ["fear", "safety", "self-sabotage"],
  },

  // ── Fruits · Life Results ────────────────────────────
  "abundance": {
    eyebrow: G.FRUIT,
    coreQuestion: "Where in my life is enough already enough?",
    body: [
      "Abundance is not luxury. It is the felt sense that there is room.",
      "We measure abundance externally and starve internally because the inside ledger is never balanced.",
      "The fruit grows when we let the field be generous and stop accounting in fear.",
    ],
    reflection: [
      "Where do I have more than I admit?",
      "What is one place I could declare enough — today?",
    ],
    related: ["receiving", "scarcity", "inner-peace"],
  },
  "freedom": {
    eyebrow: G.FRUIT,
    coreQuestion: "What would I stop doing tomorrow if I were free?",
    body: [
      "Freedom is rarely escape. It is the slow uncoupling of our choices from our fears.",
      "We mistake exhaustion for adulthood and obligation for love.",
      "The fruit of freedom grows where we agree to disappoint the parts of ourselves that need our smallness.",
    ],
    reflection: [
      "What am I doing every week that I would not do if I were truly free?",
      "What part of my life have I outgrown but not yet released?",
    ],
    related: ["prune", "control", "leadership"],
  },
  "contribution": {
    eyebrow: G.FRUIT,
    coreQuestion: "Where does my contribution leave me, when I leave the room?",
    body: [
      "Real contribution is not transactional. It does not require an audience.",
      "We mistake visibility for impact, and noise for value.",
      "The fruit of contribution grows when we give what only we can give, without bargaining for the return.",
    ],
    reflection: [
      "What do I give that costs me nothing and matters most?",
      "Where would my contribution be different if no one were watching?",
    ],
    related: ["work-impact", "meaning", "creativity"],
  },
  "financial-flow": {
    eyebrow: G.FRUIT,
    coreQuestion: "Where is my money rhyming with my life — and where is it not?",
    body: [
      "Financial flow is not the size of the account. It is the alignment between what we earn, what we spend, and what we believe we are worth.",
      "Money is honest. It will reveal our beliefs faster than our affirmations can.",
      "The fruit of financial flow grows when our inner accounting and outer accounting begin to agree.",
    ],
    reflection: [
      "Where does my spending tell a different story than my words?",
      "What relationship with money am I ready to grow into?",
    ],
    related: ["worth", "receiving", "abundance"],
  },
  "inner-peace": {
    eyebrow: G.FRUIT,
    coreQuestion: "What kind of quiet have I been refusing to allow myself?",
    body: [
      "Inner peace is not the absence of life. It is the willingness to be undefended for a moment.",
      "Many of us were trained to mistake calm for danger.",
      "The fruit of inner peace grows when the nervous system finally trusts that it can stand down.",
    ],
    reflection: [
      "When did I last feel peaceful — not numb, not zoned out, peaceful?",
      "What would I have to stop carrying to feel it again?",
    ],
    related: ["safety", "trust", "receiving"],
  },
  "meaning": {
    eyebrow: G.FRUIT,
    coreQuestion: "What is mine to live for, even when no one calls it ambitious?",
    body: [
      "Meaning is not given. It is built — quietly, over decades, often without applause.",
      "We confuse meaning with success because success is louder.",
      "The fruit of meaning grows on the branches we kept watering when no one was watching.",
    ],
    reflection: [
      "What do I do that, even alone, feels like mine?",
      "What in my life would I keep, even if it was never seen?",
    ],
    related: ["contribution", "value", "freedom"],
  },
};

export default MONEY_TREE_CONTENT;
