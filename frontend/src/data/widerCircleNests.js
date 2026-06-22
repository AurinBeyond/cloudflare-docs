/**
 * widerCircleNests.js — § WIDER CIRCLE · 24 NEST BRIEFS 2026-06-21
 *
 * Single source of truth for the 24 painted-nest interiors of the
 * Sara Wider Circle. Mirrors /app/memory/WIDER_CIRCLE_NEST_BRIEFS.md.
 *
 * Each entry honours:
 *   §SARA-FOUNDATIONAL-PHILOSOPHY-LOCK   relationship is the centre
 *   §SARA-NEST-TRUTH-LOCK                title · completion · truth
 *   §SARA-NO-SOLUTION-LOCK               notice · question · space
 *   §SARA-CONTENT-VISUAL-ALIGNMENT-LOCK  visual supports completion
 *   §SARA-VISUAL-SYSTEM-LOCK             warm parchment palette
 *
 * Image paths point at /test_nest_images/wX_Y_<slug>.png — served
 * from the frontend public folder. (Founder review images.)
 *
 * Status: 24 / 24 drafts ready · awaiting founder lock per world.
 */

const IMG = "/test_nest_images";

export const WIDER_CIRCLE_NESTS = {
  /* ----------------------------------------------------------------
   * WORLD 1 — What Cannot Be Replaced   🌳 LAND
   * Subtitle: "Some things only presence can give."
   * Core pattern: "I am using ___ instead of being here."
   * --------------------------------------------------------------- */
  "what-cannot-be-replaced": {
    worldLabel: "What Cannot Be Replaced",
    worldRoute: "/parents-room/wider-circle/what-cannot-be-replaced",
    domain: "LAND",
    nests: {
      time: {
        title: "Time",
        completion: "speed",
        coreTruth: "slowness",
        symbol: "nest — slowness held safe",
        image: `${IMG}/w1_1_time.png`,
        intro: [
          "Time is the only thing nobody can hand back to you.",
          "Yet most days, we try to outrun it. We finish the bedtime story faster. We answer \"in a minute.\" We say \"later, little one,\" and somehow later never comes.",
          "It is not that we love less. It is that we have learned to live in a hurry.",
          "But a child does not measure love in efficiency.",
          "A child measures it in unhurried minutes.",
          "This nest is not about doing more. It is about noticing the moments when speed has quietly replaced presence.",
        ],
        prompts: [
          "When did I last move at my child's pace, instead of asking them to move at mine?",
          "What part of today felt rushed that did not need to be?",
          "If this evening had ten more unhurried minutes, where would I want to spend them?",
        ],
      },
      listening: {
        title: "Listening",
        completion: "advice",
        coreTruth: "silence",
        symbol: "nest — the listening kept warm",
        image: `${IMG}/w1_2_listening.png`,
        intro: [
          "A child rarely asks for a solution.",
          "A child asks to be heard.",
          "But we have been taught to be useful. To fix. To improve. To offer the better way. So when a small voice begins a sentence, something in us already prepares the response.",
          "The advice is not wrong. It is simply early.",
          "Most of what a child needs to know, they will find by themselves — if someone has first listened long enough for the question to fully arrive.",
          "Listening is the one gift no one else can give in your place.",
        ],
        prompts: [
          "When did my child last finish a sentence without me interrupting with help?",
          "What advice did I offer today that was not asked for?",
          "What might I hear if I let the next ten seconds be quiet?",
        ],
      },
      attention: {
        title: "Attention",
        completion: "divided attention",
        coreTruth: "undivided gaze",
        symbol: "lantern — single warm light",
        image: `${IMG}/w1_3_attention.png`,
        intro: [
          "You can love someone with your whole heart and still not look at them.",
          "That is the strange part.",
          "We sit in the same room. We answer their question. We even laugh at the right moment. And yet the eyes never quite arrive.",
          "Attention is the most honest currency a child measures love by.",
          "Not the words. Not the gifts. The eyes.",
          "A screen can wait. A message can wait. The dinner can wait three more minutes. A child remembers who looked up.",
        ],
        prompts: [
          "When did my child last have my full attention, with nothing else in my hands?",
          "What did I half-look at today while someone was speaking to me?",
          "If I closed every screen for the next twenty minutes, what would I notice?",
        ],
      },
      presence: {
        title: "Presence",
        completion: "performance",
        coreTruth: "honesty",
        symbol: "nest — the seat that asks to be filled truthfully",
        image: `${IMG}/w1_4_presence.png`,
        intro: [
          "There is a quiet kind of acting that happens in homes.",
          "We smile when we are tired. We answer cheerfully when something inside us is closing. We perform \"good parent\" for the small person watching.",
          "A child sees through this faster than we think.",
          "They do not need the bright version of us.",
          "They need the real one.",
          "If you are sad, they can sit beside sadness. If you are tired, they can rest with you. If you are unsure, they can learn that unsure is allowed.",
          "Presence is not a mood. It is honesty in the body.",
        ],
        prompts: [
          "When did I last let my child see how I actually felt today?",
          "What emotion did I perform this week that was not quite true?",
          "What would it cost me to simply say, \"I am tired, but I am here\"?",
        ],
      },
      trust: {
        title: "Trust",
        completion: "control",
        coreTruth: "patience",
        symbol: "tree — roots growing in time, unforced",
        image: `${IMG}/w1_5_trust.png`,
        intro: [
          "Trust grows the same way a plant grows.",
          "Slowly. In its own time. And almost always without an audience.",
          "We cannot demand it. We cannot rush it. We cannot trade it for good behaviour or earn it back with apologies.",
          "What we can do is be the same person tomorrow that we are today.",
          "That is harder than it sounds.",
          "When a child tests us, the temptation is to tighten — more rules, more checking, more questions. But trust does not grow under pressure. It grows under patience.",
          "A child who is trusted, slowly, begins to trust themselves.",
        ],
        prompts: [
          "Where did I tighten my grip today when I could have stayed still?",
          "What did I check on, ask about, or \"just remind\" — that my child could have handled?",
          "What would change if I trusted them five percent more for one week?",
        ],
      },
      connection: {
        title: "Connection",
        completion: "providing",
        coreTruth: "being",
        symbol: "lantern — warm light passed from chest to chest",
        image: `${IMG}/w1_6_connection.png`,
        intro: [
          "We give our children many things.",
          "Clean clothes. Warm meals. A safe room. Lessons. Toys. Opportunities. Plans for the future.",
          "These are good gifts. They matter.",
          "But not one of them is the gift.",
          "The gift is the feeling, somewhere inside the child, that says: there is one person in the world for whom I do not have to explain myself.",
          "That feeling is not built by what we provide.",
          "It is built by who we are when we are in the room.",
        ],
        prompts: [
          "What did I provide today that I could have offered instead?",
          "When does my child seem most connected to me — and what am I usually doing then?",
          "If providing were paused for one afternoon, what would remain between us?",
        ],
      },
    },
  },

  /* ----------------------------------------------------------------
   * WORLD 2 — When One Heart Holds the House   🌳 LAND
   * Subtitle: "The sea remembers what every family eventually
   *            learns: one heart cannot carry everything forever."
   * Core pattern: "I am using ___ instead of being here."
   *               (from the angle of the parent carrying everyone)
   * --------------------------------------------------------------- */
  "when-one-heart-holds-the-house": {
    worldLabel: "When One Heart Holds the House",
    worldRoute: "/parents-room/wider-circle/when-one-heart-holds-the-house",
    domain: "LAND",
    nests: {
      time: {
        title: "Time",
        completion: "speed",
        coreTruth: "stillness",
        symbol: "nest — the quiet centre that holds when everything moves",
        image: `${IMG}/w2_1_time.png`,
        intro: [
          "A house that one heart carries often moves at one speed: faster.",
          "Faster mornings. Faster meals. Faster bedtimes. Faster apologies because there is no time for the slow kind.",
          "The faster we move, the more invisible our care becomes.",
          "Even to ourselves.",
          "There is a stillness underneath the speed — a place where one breath holds the whole house for a moment. That stillness is not laziness. It is the only place from which the house can actually be loved instead of merely run.",
        ],
        prompts: [
          "When did I last stop moving long enough to feel the house around me?",
          "What did I rush through today that I could have simply lived?",
          "If the next hour had no urgency, what would I notice in the people I love?",
        ],
      },
      listening: {
        title: "Listening",
        completion: "advice",
        coreTruth: "receiving",
        symbol: "nest — the open palm of the home",
        image: `${IMG}/w2_2_listening.png`,
        intro: [
          "When one person carries the house, advice becomes their reflex.",
          "Someone walks in tired — they receive a suggestion. Someone names a worry — they receive a plan. Someone simply needs to be heard — they receive a five-point response before they finish their sentence.",
          "It is not unkindness. It is the long habit of being needed.",
          "But the people in our house do not always need our solutions.",
          "Sometimes they only need our reception.",
          "To be received is different from being helped. To be received is to be allowed to arrive — exactly as one is, without instructions for becoming something else.",
        ],
        prompts: [
          "When did someone in my house last finish a sentence and feel received, not improved?",
          "What advice did I offer today that was not asked for?",
          "What would happen if \"I hear you\" replaced \"you should\" for one whole evening?",
        ],
      },
      attention: {
        title: "Attention",
        completion: "checking",
        coreTruth: "ease",
        symbol: "lantern — the lit window that does not also need to count the windows",
        image: `${IMG}/w2_3_attention.png`,
        intro: [
          "The heart that holds the house often does not stop.",
          "Did the door lock. Did the schoolbag get packed. Did the message get answered. Did the dog get fed. Did the partner seem alright. Did the child eat enough. Did anyone notice the new shoes.",
          "It looks like care.",
          "And much of it is care.",
          "But beneath it, sometimes, is a quieter exhaustion: the inability to set the list down.",
          "A house held in checking has many lit windows but no rest inside them.",
          "Ease is not the absence of caring. Ease is the moment we trust that we have done enough for now.",
        ],
        prompts: [
          "What did I check on today that did not need checking?",
          "Where in my body do I notice the habit of checking, even when nothing is wrong?",
          "What would change if I let one small thing go uncounted tonight?",
        ],
      },
      presence: {
        title: "Presence",
        completion: "being nearby",
        coreTruth: "arriving",
        symbol: "nest — the seat that holds the one who finally stops",
        image: `${IMG}/w2_4_presence.png`,
        intro: [
          "There is a difference between being in the house and being in the room.",
          "You can be in the kitchen and not in the meal. You can be on the couch and not in the conversation. You can be at the bedside and somewhere else entirely.",
          "The body shows up. The attention does not.",
          "This is what happens to the heart that holds the house: presence gets traded for proximity. Nearby becomes the closest thing to here.",
          "Arriving is the quieter art. It costs a breath, sometimes a sigh, sometimes the willingness to put down the half of us that is still running. But the people in our house feel the difference instantly.",
          "They feel it before we have spoken a word.",
        ],
        prompts: [
          "When today did I notice the gap between being nearby and being here?",
          "What helps me arrive — really arrive — into a room?",
          "If I crossed one threshold tonight slowly enough to feel it, which one would it be?",
        ],
      },
      trust: {
        title: "Trust",
        completion: "control",
        coreTruth: "release",
        symbol: "tree — the branch that lets the bird fly without explanation",
        image: `${IMG}/w2_5_trust.png`,
        intro: [
          "When one heart holds the house, control becomes a love-shape.",
          "If I plan it, no one gets hurt. If I anticipate it, no one is disappointed. If I prepare it, no one is alone in it.",
          "It is a beautiful kind of vigilance.",
          "And it is exhausting.",
          "There is a moment — usually quiet, usually unannounced — when the person carrying everything realises that some of the people in the house can carry themselves. That they were always going to. That they have been waiting, gently, to be trusted with their own weight.",
          "Release is not abandonment. Release is the slow, almost reluctant act of believing the others.",
        ],
        prompts: [
          "What did I hold tightly today that someone else was ready to carry?",
          "Where does control feel like love in my body, even when it is heavy?",
          "What would I have to feel, if I let go of one thing this week?",
        ],
      },
      connection: {
        title: "Connection",
        completion: "fixing",
        coreTruth: "witnessing",
        symbol: "lantern — the light that does not also need to mend the dark",
        image: `${IMG}/w2_6_connection.png`,
        intro: [
          "The heart that holds the house often confuses connection with repair.",
          "Someone is sad — we look for the cause. Someone is tired — we offer a plan. Someone is silent — we wonder what we have done. Every difficult feeling becomes a problem to disassemble and solve.",
          "But the people we love do not always need to be fixed.",
          "Sometimes they need to be witnessed.",
          "Witnessing is harder than fixing. It asks us to sit with the unfinished, the unclear, the not-yet-solved, and not reach for the toolbox. To let the sadness be sadness. To let the tiredness be tiredness. To trust that being seen is, very often, the medicine itself.",
          "The lantern does not repair the dark. It simply remains lit.",
        ],
        prompts: [
          "What did I try to fix today that wanted only to be seen?",
          "Where in my body do I feel the urge to repair, before the other person has finished speaking?",
          "What would it cost me to witness instead of solve, for one conversation this week?",
        ],
      },
    },
  },

  /* ----------------------------------------------------------------
   * WORLD 3 — Every Child Is Our Child   🌊 SEA
   * Subtitle: "It takes a whole shore to raise a steady boat."
   * Core pattern: "I am using ___ instead of ___."
   * --------------------------------------------------------------- */
  "every-child-is-our-child": {
    worldLabel: "Every Child Is Our Child",
    worldRoute: "/parents-room/wider-circle/every-child-is-our-child",
    domain: "SEA",
    nests: {
      seeing: {
        title: "Seeing",
        completion: "judgement",
        coreTruth: "curiosity",
        symbol: "compass — the inner needle that turns toward, not against",
        image: `${IMG}/w3_1_seeing.png`,
        intro: [
          "A child crosses a stranger's path many times in a single day.",
          "A neighbour. A shopkeeper. A passing parent at the playground. A teacher in the hallway. A driver at a crosswalk.",
          "Each of these adults carries a small, almost invisible instrument: the way they look at the child.",
          "Judgement looks for what is wrong. Curiosity looks for what is real.",
          "Same child. Same hallway. Same minute.",
          "Two completely different worlds.",
          "A child who is seen with curiosity learns, eventually, to see themselves the same way. Not as a problem to manage, but as a person to discover.",
        ],
        prompts: [
          "When did I last look at a child — mine or someone else's — with curiosity instead of evaluation?",
          "What did I notice today that judgement would have missed?",
          "What might shift if my first thought about a child became \"I wonder,\" instead of \"they should\"?",
        ],
      },
      speaking: {
        title: "Speaking",
        completion: "criticism",
        coreTruth: "encouragement",
        symbol: "lighthouse — the steady voice across the water",
        image: `${IMG}/w3_2_speaking.png`,
        intro: [
          "A child can carry a single sentence for a lifetime.",
          "\"You are slow.\" \"You are too loud.\" \"You should know better by now.\"",
          "These do not arrive as cruelty. They arrive, most often, as efficiency. As the quickest way an adult could name what they saw.",
          "But the child does not hear efficiency.",
          "The child hears who they are.",
          "Encouragement is not flattery. Encouragement is the brave choice to name what is true and what is becoming. To say \"you tried\" before \"you missed.\" To say \"you are still learning\" before \"you are wrong.\"",
          "A child grows in the direction of the voice they hear most often.",
        ],
        prompts: [
          "What single sentence have I said this week that a child may carry far?",
          "What did I notice in a child today that I did not name?",
          "If my voice were a lighthouse for the children near me, what would it be steady about?",
        ],
      },
      belonging: {
        title: "Belonging",
        completion: "comparison",
        coreTruth: "acceptance",
        symbol: "boat — each one shaped differently, all on the same water",
        image: `${IMG}/w3_3_belonging.png`,
        intro: [
          "A child learns very early to look sideways.",
          "Who is faster. Who is taller. Who is favoured. Who is invited. Who is praised. Who is overlooked.",
          "Comparison is the air much of childhood is breathed in.",
          "Adults sometimes think they are protecting children from it. But comparison is not stopped by hiding it; comparison is softened by something stronger: the felt sense of acceptance, exactly as one is.",
          "Acceptance is not approval of every behaviour. Acceptance is the deeper message: you belong here, even before you change anything.",
          "A child who feels this stops measuring. Or measures less. Or measures more kindly. Belonging is the thing that quietly closes the space comparison was trying to fill.",
        ],
        prompts: [
          "When did I last say, in some way, \"you belong here exactly as you are\" to a child near me?",
          "What comparison did I make today — even silently — between two children, or two parents?",
          "What would a child carry differently if they never had to earn their place at the table?",
        ],
      },
      including: {
        title: "Including",
        completion: "exclusion",
        coreTruth: "welcome",
        symbol: "harbour — the door that does not check who you are",
        image: `${IMG}/w3_4_including.png`,
        intro: [
          "There is a moment in every gathering where a child either steps in or stays at the edge.",
          "Usually the difference is not the child.",
          "The difference is whether an adult turned, made eye contact, and quietly moved their body to make a space.",
          "Exclusion is often unintentional. We are busy. We are tired. We do not notice the small figure at the periphery. But the child notices their own absence from the centre — and they will remember the shape of that day.",
          "Welcome is a posture, not a speech. It is the half-step sideways. The pulled-out chair. The look across the room that says: I see you. Come closer.",
          "A child who has been welcomed in many small ways learns to welcome others. That is how a shore widens.",
        ],
        prompts: [
          "Who at the edge of today's room did I not turn toward?",
          "What small physical movement of welcome could I make tomorrow, before words?",
          "Who first welcomed me — and how can I pass that forward to someone smaller?",
        ],
      },
      trusting: {
        title: "Trusting",
        completion: "suspicion",
        coreTruth: "belief",
        symbol: "compass — the needle that begins by assuming north exists",
        image: `${IMG}/w3_5_trusting.png`,
        intro: [
          "A child often arrives at adults already half-defended.",
          "They have learned: explain yourself, justify yourself, prove you mean well, prove you did not break it, prove you tried.",
          "When an adult meets them with suspicion, the defence thickens.",
          "When an adult meets them with belief, something else happens — the defence loosens, the truth comes closer, and the child discovers they have a self worth trusting.",
          "Belief is not naïveté. Belief is the choice to begin from the assumption that the child is doing the best they can with what they know. From there, the harder conversations are possible. Without that beginning, no conversation goes anywhere true.",
        ],
        prompts: [
          "What did I assume about a child today, before I asked them?",
          "When did belief — held by an adult I needed — change something in me as a child?",
          "What might a child tell me, if they were certain I believed they meant well?",
        ],
      },
      guiding: {
        title: "Guiding",
        completion: "control",
        coreTruth: "partnership",
        symbol: "compass + boat — two hands on the same wheel",
        image: `${IMG}/w3_6_guiding.png`,
        intro: [
          "Adults often think guiding means deciding.",
          "Where the child goes. What the child becomes. Which choices are right. Which dreams are realistic. Which paths are worth their time.",
          "Control wears the mask of wisdom for a long time before a child quietly stops asking.",
          "Partnership is the patient art of staying in the boat without steering it alone. It looks like questions instead of instructions. It looks like making room for a child's wrong-feeling-but-real choice. It looks like trusting the small navigator beside you to learn the wind in their own way.",
          "A child guided as a partner grows into an adult who consults themselves. A child guided through control often forgets that consultation was ever possible.",
        ],
        prompts: [
          "Where in today did I take a wheel that was not mine?",
          "When did a partner-style adult most change my life — and what did they do that I could pass on?",
          "What decision is a child near me ready to share, that I have been making alone?",
        ],
      },
    },
  },

  /* ----------------------------------------------------------------
   * WORLD 4 — Voices Around the Child   🌊 SEA
   * Subtitle: "Not every voice deserves to become a compass."
   * Pattern pivot: voice-recognition (not "instead of being here").
   * --------------------------------------------------------------- */
  "voices-around-the-child": {
    worldLabel: "Voices Around the Child",
    worldRoute: "/parents-room/wider-circle/voices-around-the-child",
    domain: "SEA",
    nests: {
      pressure: {
        title: "Pressure",
        completion: "the voice that pushes hard, leaves little room to breathe",
        coreTruth: "permission to breathe",
        symbol: "sea — the wind that wants the boat to go faster than it can",
        image: `${IMG}/w4_1_pressure.png`,
        intro: [
          "A child can hear pressure long before they can name it.",
          "In the rush of an adult's morning. In the silent disappointment after a test. In the praise that arrives only with achievement. In the love that seems quieter on quiet days.",
          "Pressure does not arrive as a voice saying be more.",
          "It arrives as a feeling: whatever I am right now is not yet enough.",
          "Some pressure is the wind itself — the natural call of growth. Most pressure, though, is borrowed: passed down through generations of adults who were also pushed faster than they could breathe.",
          "The lesson is not to remove all pressure. The lesson is to teach a child that they have permission to slow down without becoming someone smaller in our eyes.",
        ],
        prompts: [
          "What pressure did I pass to a child today — in tone, in pace, in expectation?",
          "When did I first feel the message that breathing slowly was a kind of failing?",
          "What permission could I give a child this week that no one gave me?",
        ],
      },
      fear: {
        title: "Fear",
        completion: "the voice that wants to protect, can also keep you stuck",
        coreTruth: "courage to step",
        symbol: "harbour — the safe arms that, held too tight, become walls",
        image: `${IMG}/w4_2_fear.png`,
        intro: [
          "Fear is one of the oldest voices in a parent's house.",
          "It speaks in warnings. It speaks in worst-case rehearsals. It speaks in the small \"be careful\" that follows a child everywhere.",
          "Fear is not wrong. Fear is what once kept the family alive.",
          "But a child raised inside another person's fear learns to fear for themselves before they have ever tested their own legs. The world becomes a list of dangers before it becomes a place of wonder.",
          "The Core Truth is not the absence of fear. It is the courage to step with fear present — to let the child try, to let the foot land, to let the small fall happen and the small standing-up follow.",
          "A child who has been allowed to step learns that fear can ride along in the boat without taking the wheel.",
        ],
        prompts: [
          "What did I warn about today that I could have allowed?",
          "Which of my fears was actually inherited from someone who came before me?",
          "What step is a child near me ready to take, that only my fear is delaying?",
        ],
      },
      belonging: {
        title: "Belonging",
        completion: "the trustworthy voice that welcomes you exactly as you are",
        coreTruth: "trustworthy compass",
        symbol: "lighthouse — the steady light a child can navigate by",
        image: `${IMG}/w4_3_belonging.png`,
        intro: [
          "Among the thousand voices around a child, a small number deserve to be trusted.",
          "Belonging is the voice of those few.",
          "It does not flatter. It does not pretend a child is perfect. It does not insist on the child becoming someone they are not.",
          "It simply remains.",
          "In the same tone tomorrow as today. In the same warmth on hard days as on easy ones. In the same patience after the mistake as before it.",
          "A child raised within at least one such voice carries it forever — as an inner lighthouse. In storm, in confusion, in foreign waters, they can find themselves again because that voice still hums quietly in their chest.",
          "This is the voice we are invited to become, in whatever small way we can. Not louder. Not bigger. Just steady.",
        ],
        prompts: [
          "Who in my own childhood was a steady, belonging voice? What did they actually do?",
          "For which child near me am I — or could I be — that lighthouse?",
          "What would it take to be the same person tomorrow that I was today?",
        ],
      },
      comparison: {
        title: "Comparison",
        completion: "the voice that looks outward, steals the joy of your own path",
        coreTruth: "your own path",
        symbol: "compass — the needle that points to your north, not someone else's",
        image: `${IMG}/w4_4_comparison.png`,
        intro: [
          "Comparison is the most reasonable-sounding voice in a child's day.",
          "It speaks through siblings, classmates, screens, neighbours, sports leagues, photographs, gentle remarks at family gatherings. Look how she... Look how he... Why don't you...",
          "Comparison promises growth. What it delivers most often is theft.",
          "It quietly takes the small private satisfaction of a child's own progress and replaces it with the question am I enough yet?",
          "The Core Truth is not that comparison can be erased. It cannot. The Core Truth is that a child can learn to notice it, set it down, and pick up their own compass again. Their own north. Their own path that no one else can walk for them.",
          "This is one of the kindest skills an adult can offer a child: the gentle, repeated reminder that someone else's wind is not theirs to chase.",
        ],
        prompts: [
          "What did I compare a child to today — even softly, even with affection?",
          "Where in my own life is comparison stealing the joy I had thirty minutes ago?",
          "What would a child carry differently if they heard \"yours looks like yours\" more often than \"look how theirs looks\"?",
        ],
      },
      "good-voices": {
        title: "Good Voices",
        completion: "a quiet checklist of what a steady voice looks like",
        coreTruth: "recognition",
        symbol: "parchment — the small notebook a child keeps in their inner pocket",
        image: `${IMG}/w4_5_good_voices.png`,
        intro: [
          "How does a child learn to tell a steady voice from a loud one?",
          "Not by being told. By noticing, over time, the shape that the steady ones share.",
          "A steady voice stays when the going is hard.",
          "A steady voice speaks truth without taking away hope.",
          "A steady voice makes room for a mistake without making the mistake the whole story.",
          "A steady voice believes in the becoming, not only in the now.",
          "This nest is not a lesson. It is a folded note in a child's pocket — something they can pull out, decades from now, to remember which voices belong on their inner crew.",
          "Adults can quietly point to these shapes. Not in a list. In example. In how we ourselves speak — to them, and to others, and to ourselves.",
        ],
        prompts: [
          "Whose voice from my own childhood passes this checklist? What did they do that I now do (or wish I did)?",
          "Which one of these qualities would I most like to be remembered for, by a child near me?",
          "What does my own inner voice sound like, when I speak to myself after I have made a mistake?",
        ],
      },
      "ask-yourself": {
        title: "Ask Yourself",
        completion: "daily questions to recognise the inner crew",
        coreTruth: "inner crew",
        symbol: "parchment — the daily log every sailor keeps",
        image: `${IMG}/w4_6_ask_yourself.png`,
        intro: [
          "Every child eventually sails beyond their parents' harbour.",
          "When they do, they carry something invisible with them — an inner crew. The voices they learned to trust have become part of who they are.",
          "The Core Truth is that the crew is not fully chosen by the world. It can also be named, quietly, by the child themselves — and by the adults who help them notice.",
          "Four questions form the quiet daily log of this naming:",
          "Which voices am I listening to?",
          "Which voices do I repeat to others?",
          "Which voices do I want my child to carry within them?",
          "Are my words helping them find their way home?",
          "These are not for asking children directly. These are for adults to ask, slowly, of themselves — and to model, by living the answer.",
        ],
        prompts: [
          "If I asked the four questions of this nest right now, what would the most honest answer be?",
          "What would change in my home if I asked one of these questions every evening for a week?",
          "Which voice — one I carry, one I speak, one I pass on — would I most like to refine?",
        ],
      },
    },
  },
};

export function getNest(worldSlug, nestSlug) {
  const world = WIDER_CIRCLE_NESTS[worldSlug];
  if (!world) return null;
  const nest = world.nests[nestSlug];
  if (!nest) return null;
  return { world, nest };
}
