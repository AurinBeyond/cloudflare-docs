/**
 * saraForestTeasers.js — § SARA FOREST · NEST TEASERS 2026-06-21
 *
 * Quiet preview-copy for every Sara Forest sub-nest. Until each
 * painted interior is finished, the visitor still walks somewhere
 * warm — not a 404, not a "coming soon" — a small Sara-voice teaser
 * that names what the nest will eventually hold.
 *
 * Honours:
 *   §SARA-NO-SOLUTION-LOCK         notice · question · space
 *   §SARA-ROOM-PHILOSOPHY-LOCK     Sara waits quietly in the harbour
 *   §SARA-VISUAL-SYSTEM-LOCK       warm parchment language
 *
 * Shape: TEASERS[worldSlug][nestSlug] = { title, line }
 *   - title: human label (mirrors the leaf in the painted world)
 *   - line:  2–4 Sara-voice sentences. Never instructs, never sells.
 *
 * Lookup helper at the bottom resolves a world+nest to one teaser,
 * or returns null when nothing is mapped yet.
 */

export const SARA_FOREST_TEASERS = {
  /* W1 — My Child */
  "my-child": {
    title: "My Child",
    nests: {
      temperament: {
        title: "Temperament",
        line: "Every child arrives with their own weather. Some are quick light, some are slow rivers. This nest holds the small art of noticing what is already there — before we try to shape it.",
      },
      "strengths-gifts": {
        title: "Strengths & Gifts",
        line: "A child's gifts often hide inside what we have learned to correct. This nest learns to see the shimmer in the everyday — the quiet kind, not the trophy kind.",
      },
      needs: {
        title: "Needs",
        line: "Behind every behaviour, a small need is asking to be named. This nest is a slow practice of hearing the need first, and the behaviour second.",
      },
      feelings: {
        title: "Feelings",
        line: "Feelings are not problems with a solution at the end. They are weather. This nest sits beside a child's feelings without trying to clear the sky.",
      },
      "learning-style": {
        title: "Learning Style",
        line: "Some children learn through their hands, some through their feet, some through the long silence at the kitchen table. This nest honours the path that is theirs.",
      },
      "development-stages": {
        title: "Development Stages",
        line: "Children grow in waves, not lines. This nest gathers the soft language for the season you are inside — without comparing it to anyone else's.",
      },
    },
  },

  /* W2 — Our Family */
  "our-family": {
    title: "Our Family",
    nests: {
      connection: {
        title: "Connection",
        line: "Connection is rarely made in the big moments. It lives in the seams of the day — the doorway, the last light, the small look across the room. This nest learns to find those seams.",
      },
      "daily-life": {
        title: "Daily Life",
        line: "The ordinary day is the real classroom. This nest gathers the small, repeated moments where a family actually becomes a family.",
      },
      communication: {
        title: "Communication",
        line: "Most of what passes between us is unspoken. This nest practises the slower kind of speaking — and the much slower kind of listening.",
      },
      "conflict-repair": {
        title: "Conflict & Repair",
        line: "What heals a family is rarely the absence of friction. It is the small, brave act of returning afterwards. This nest learns the art of return.",
      },
      "family-traditions": {
        title: "Family Traditions",
        line: "Traditions do not need to be old to belong. They begin the first time something small is done with care, and is repeated. This nest tends those beginnings.",
      },
      belonging: {
        title: "Belonging",
        line: "Belonging is the quiet inner sentence that says: I am part of this. This nest watches over how that sentence is written, line by line, inside a child.",
      },
    },
  },

  /* W3 — Emotions & Safety */
  "emotions-safety": {
    title: "Emotions & Safety",
    nests: {
      feelings: {
        title: "Feelings",
        line: "All feelings are welcome at this table. None are too loud, too quiet, or wrong. This nest learns to sit with the whole weather of a child's inner life.",
      },
      "safety-trust": {
        title: "Safety & Trust",
        line: "Safety is not the absence of difficulty. It is the steady, returning presence of one person who does not leave when feelings get loud. This nest holds that steadiness.",
      },
      fear: {
        title: "Fear",
        line: "Fear is one of the oldest voices in a small chest. It does not need to be defeated. This nest learns to keep fear company until it eases on its own.",
      },
      anger: {
        title: "Anger",
        line: "Anger is information, not misbehaviour. This nest reads what is underneath — the unmet need, the lost autonomy, the missed moment — without rushing to silence the signal.",
      },
      sadness: {
        title: "Sadness",
        line: "A sad child does not always need to be cheered up. Sometimes they need to be witnessed. This nest practises the harder kindness of staying.",
      },
      "regulation-recovery": {
        title: "Regulation & Recovery",
        line: "After the storm comes a slower shore. This nest holds the quiet work of coming back to oneself — for the child, and for the adult beside them.",
      },
    },
  },

  /* W4 — Boundaries & Responsibility */
  "boundaries-responsibility": {
    title: "Boundaries & Responsibility",
    nests: {
      boundaries: {
        title: "Boundaries",
        line: "A boundary is not a wall against a child. It is a small clearing where they can find their feet. This nest tends the difference between holding firm and pushing away.",
      },
      responsibility: {
        title: "Responsibility",
        line: "Responsibility grows when a child is trusted with something small that matters. This nest watches that growth — one task, one repair, one return at a time.",
      },
      "choices-consequences": {
        title: "Choices & Consequences",
        line: "Every choice carries a small weather. This nest is not about teaching lessons — it is about letting consequences arrive in their own time, and being there for the conversation afterwards.",
      },
      respect: {
        title: "Respect",
        line: "Respect is not extracted, it is modelled. This nest watches how the small daily registrations of dignity — eye contact, asking before taking, naming feelings — quietly build a respectful child.",
      },
      consistency: {
        title: "Consistency",
        line: "Children do not need perfect parents. They need predictable ones. This nest gathers the small rhythms that make a home feel safe to live inside.",
      },
      "freedom-within-structure": {
        title: "Freedom Within Structure",
        line: "Freedom and structure are not opposites. The strongest tree is the one whose roots are deep enough to let the branches reach wide. This nest holds both ends of the same rope.",
      },
    },
  },

  /* W5 — Growth & Development */
  "growth-development": {
    title: "Growth & Development",
    nests: {
      "development-stages": {
        title: "Development Stages",
        line: "A child is never \"behind\" — they are inside their own clock. This nest learns the rough shape of each season without making it a checklist.",
      },
      "learning-through-experience": {
        title: "Learning Through Experience",
        line: "Children learn with their whole body. This nest honours the dropped jug, the muddy boots, the half-finished drawing — and the wisdom that arrives only through the doing.",
      },
      "confidence-resilience": {
        title: "Confidence & Resilience",
        line: "Confidence is not a feeling. It is the slow accumulation of small recoveries. This nest learns to let a child fall gently, and to be there for the standing-up.",
      },
      "curiosity-discovery": {
        title: "Curiosity & Discovery",
        line: "A curious child asks too many questions. A curious child is doing exactly what they should. This nest protects the small flame of wondering, even when it is inconvenient.",
      },
      "mistakes-growth": {
        title: "Mistakes & Growth",
        line: "Mistakes are not the opposite of learning. They are the shape of it. This nest learns to meet a mistake with the same warmth as a success.",
      },
      "becoming-yourself": {
        title: "Becoming Yourself",
        line: "Every child is becoming someone they have not yet met. This nest watches that becoming — without rushing it, without rewriting it.",
      },
    },
  },

  /* W6 — Relationships & Cooperation */
  "relationships-cooperation": {
    title: "Relationships & Cooperation",
    nests: {
      communication: {
        title: "Communication",
        line: "Cooperation begins with words that fit. This nest learns the small sentences that open a door — instead of the ones that close it.",
      },
      cooperation: {
        title: "Cooperation",
        line: "A child does not cooperate because we ask. They cooperate because they feel themselves part of something shared. This nest tends that feeling.",
      },
      friendship: {
        title: "Friendship",
        line: "Friendship is one of the longest classrooms of a childhood. This nest holds space for the joy, the fallouts, and the slow art of choosing kind people.",
      },
      "understanding-differences": {
        title: "Understanding Differences",
        line: "Every other person is a small unknown country. This nest learns the patience to visit, rather than the urge to correct.",
      },
      "empathy-kindness": {
        title: "Empathy & Kindness",
        line: "Empathy is not a lesson. It is a quiet inheritance from the way they were treated when they were small. This nest watches over that inheritance.",
      },
      "solving-conflicts-together": {
        title: "Solving Conflicts Together",
        line: "Conflicts are not failures of love. They are the seams where two people meet. This nest learns the slow work of repair, said and unsaid.",
      },
    },
  },

  /* W7 — Challenging Situations */
  "challenging-situations": {
    title: "Challenging Situations",
    nests: {
      "change-transitions": {
        title: "Change & Transitions",
        line: "Change asks a child to leave one home and find another inside themselves. This nest walks beside the moving — gently, without rushing.",
      },
      "loss-grief": {
        title: "Loss & Grief",
        line: "A child's grief is not smaller than ours. It is differently shaped. This nest sits with the loss without trying to hand it back as a lesson.",
      },
      "conflict-crisis": {
        title: "Conflict & Crisis",
        line: "When a family is in crisis, words shrink. This nest gathers the small, steady acts that hold a child together when the room is full of weather.",
      },
      "fear-uncertainty": {
        title: "Fear & Uncertainty",
        line: "Not knowing is hard at any age. This nest learns to be honest about the fog — and to be the lantern, not the map.",
      },
      "resilience-recovery": {
        title: "Resilience & Recovery",
        line: "Recovery is not a straight line. This nest honours the small returns — the first laugh after the hard week, the night without crying, the slow shoreline coming back into view.",
      },
      "finding-hope": {
        title: "Finding Hope",
        line: "Hope is not denial. Hope is the practice of looking, again, for one warm thing. This nest tends the looking.",
      },
    },
  },

  /* W8 — Wisdom Garden */
  "wisdom-garden": {
    title: "Wisdom Garden",
    nests: {
      "different-ways-of-seeing": {
        title: "Different Ways of Seeing",
        line: "There is more than one way to read a moment. This nest gathers the small angles a parent might quietly try — without making them a method.",
      },
      "stories-that-teach": {
        title: "Stories That Teach",
        line: "A story arrives sideways when a lecture is refused. This nest holds the family stories, fables, and slow tales that have always carried wisdom around the long way.",
      },
      "family-wisdom": {
        title: "Family Wisdom",
        line: "Every family carries a kind of knowing that is not written anywhere. This nest learns to listen to grandparents, elders, and the unnamed weight of \"the way we do things\".",
      },
      "questions-worth-asking": {
        title: "Questions Worth Asking",
        line: "A good question outlasts most answers. This nest collects the slow questions — the ones a child returns to, ten or twenty years later.",
      },
      "reflection-awareness": {
        title: "Reflection & Awareness",
        line: "Awareness is the small pause where wisdom begins. This nest practises the noticing — not the changing, not yet.",
      },
      "everyday-philosophy": {
        title: "Everyday Philosophy",
        line: "Philosophy lives in the kitchen, not the library. This nest names the small questions hidden inside everyday family life.",
      },
    },
  },

  /* W9 — Weekly Digest */
  "weekly-digest": {
    title: "Weekly Digest",
    nests: {
      "this-weeks-reflection": {
        title: "This Week's Reflection",
        line: "One small thought to carry through the week. Not a goal. Not a target. A quiet companion.",
      },
      "small-moments-that-matter": {
        title: "Small Moments That Matter",
        line: "The week is built of moments most of us forget by Friday. This nest gathers the ones worth remembering.",
      },
      "family-conversations": {
        title: "Family Conversations",
        line: "A few quiet questions to bring to the dinner table this week — only if the table is ready.",
      },
      "challenges-lessons": {
        title: "Challenges & Lessons",
        line: "What did this week try to teach? This nest sits with the answer without rushing to record it.",
      },
      "gratitude-joy": {
        title: "Gratitude & Joy",
        line: "Gratitude is not the bright side. Gratitude is the brave practice of looking, again, for what is here.",
      },
      "looking-ahead": {
        title: "Looking Ahead",
        line: "Next week is not a plan to perfect. It is a small horizon to greet. This nest learns to look without bracing.",
      },
    },
  },

  /* W10 — Stories from Real Life */
  "stories-real-life": {
    title: "Stories from Real Life",
    nests: {
      "family-stories": {
        title: "Family Stories",
        line: "The true stories of real families — not edited for shine. This nest gathers them with the same warmth a family album holds in its quieter pages.",
      },
      "turning-points": {
        title: "Turning Points",
        line: "Most lives turn at a moment too small to photograph. This nest collects the unphotographed turning points other families have lived.",
      },
      "lessons-learned": {
        title: "Lessons Learned",
        line: "Lessons that arrived the long way — never as advice, always as story. This nest passes them along quietly.",
      },
      "voices-across-generations": {
        title: "Voices Across Generations",
        line: "Grandparents, parents, and children speaking to each other across the years. This nest is a small room where those voices meet.",
      },
      "courage-hope": {
        title: "Courage & Hope",
        line: "Ordinary courage usually wears slippers. This nest gathers the kind that nobody clapped for, but everybody felt.",
      },
      "small-moments-big-meaning": {
        title: "Small Moments, Big Meaning",
        line: "The smallest moments often carry the largest weight. This nest sits with the ones a family carries forever.",
      },
    },
  },

  /* W11 — Tools & Exercises */
  "tools-exercises": {
    title: "Tools & Exercises",
    nests: {
      "conversation-cards": {
        title: "Conversation Cards",
        line: "A small handful of questions to keep at the dinner table. Use one. Skip the others. Or just look at them in your pocket. Either is enough.",
      },
      "family-activities": {
        title: "Family Activities",
        line: "Quiet activities a family can do together without it becoming a project. This nest collects the small, repeatable kind — not the Pinterest kind.",
      },
      "reflection-prompts": {
        title: "Reflection Prompts",
        line: "A few quiet questions to ask yourself this week. Not all at once. Not even all of them.",
      },
      "weekly-practices": {
        title: "Weekly Practices",
        line: "Small repeating shapes that, over a year, change the texture of a home. This nest collects the gentlest of them.",
      },
      "play-discovery": {
        title: "Play & Discovery",
        line: "Play is the work of childhood. This nest gathers small invitations — the open-ended kind that need no instructions.",
      },
      "relationship-tools": {
        title: "Relationship Tools",
        line: "Small phrases, small rituals, small repairs. This nest holds the everyday tools that quietly keep a relationship warm.",
      },
    },
  },

  /* W13 — Parenting Journey */
  "parenting-journey": {
    title: "Parenting Journey",
    nests: {
      "becoming-a-parent": {
        title: "Becoming a Parent",
        line: "Nobody arrives at parenthood prepared. This nest sits beside the first season — the disorientation, the awe, the slow remaking of an identity.",
      },
      "growing-through-challenges": {
        title: "Growing Through Challenges",
        line: "Some of who you become as a parent only arrives through the hard chapters. This nest names the growing without glossing the hurt.",
      },
      "learning-about-yourself": {
        title: "Learning About Yourself",
        line: "Children hand parents a mirror most adults would not have chosen. This nest sits with what the mirror keeps showing.",
      },
      "letting-go-of-perfection": {
        title: "Letting Go of Perfection",
        line: "Perfect is the heaviest word in parenting. This nest practises the slow art of laying it down — one apology, one ordinary evening at a time.",
      },
      "balancing-family-and-self": {
        title: "Balancing Family and Self",
        line: "You cannot pour from an empty room. This nest holds the small permissions a parent gives themselves to remain a person.",
      },
      "looking-back-looking-forward": {
        title: "Looking Back, Looking Forward",
        line: "A long parenting journey carries both directions at once. This nest looks gently in both — without scoring either.",
      },
    },
  },

  /* W14 — Generations & Heritage */
  "generations-heritage": {
    title: "Generations & Heritage",
    nests: {
      "family-stories": {
        title: "Family Stories",
        line: "The stories told around our kitchen tables are also the story of who we are becoming. This nest gathers them with reverence and curiosity, never duty.",
      },
      "traditions-rituals": {
        title: "Traditions & Rituals",
        line: "Some rituals come from grandparents. Some begin tonight. This nest tends both kinds with equal warmth.",
      },
      "wisdom-passed-on": {
        title: "Wisdom Passed On",
        line: "Wisdom is mostly inherited sideways — through how someone made breakfast, how they answered the door, how they sat with their own grief. This nest watches that inheritance.",
      },
      "what-we-choose-to-carry-forward": {
        title: "What We Choose to Carry Forward",
        line: "Not every inherited shape is one we want to pass on. This nest practises the slow, kind work of choosing what stays.",
      },
      "patterns-across-generations": {
        title: "Patterns Across Generations",
        line: "Families repeat their patterns until someone notices them. This nest sits with the noticing — never the blaming.",
      },
      "roots-belonging": {
        title: "Roots & Belonging",
        line: "A child belongs first to a long line of people. This nest lets the roots be visible, without making them a destiny.",
      },
    },
  },

  /* W15 — Home, Memories & Roots */
  "home-memories-roots": {
    title: "Home, Memories & Roots",
    nests: {
      "places-we-remember": {
        title: "Places We Remember",
        line: "Some places live inside us for a lifetime — a grandparent's kitchen, a window-seat, a lake at evening. This nest honours the geography of the heart.",
      },
      "family-memories": {
        title: "Family Memories",
        line: "Memories are not what happened — they are what stayed. This nest tends what has stayed for your family.",
      },
      "traditions-of-home": {
        title: "Traditions of Home",
        line: "The small things a home repeats — a Sunday meal, a goodnight phrase, a way of welcoming people. This nest holds them carefully.",
      },
      "returning-home": {
        title: "Returning Home",
        line: "Returning is not always physical. Sometimes it is a softening at the doorway. This nest honours the kinds of returning a family makes.",
      },
      belonging: {
        title: "Belonging",
        line: "Belonging is the feeling that a place expects us — even when we have been away. This nest watches over that expecting.",
      },
      "creating-home": {
        title: "Creating Home",
        line: "Home is not a building. Home is the way the air feels when a particular person is there. This nest is for the small acts of making that air.",
      },
    },
  },
};

export function getForestTeaser(worldSlug, nestSlug) {
  const world = SARA_FOREST_TEASERS[worldSlug];
  if (!world) return null;
  const nest = world.nests[nestSlug];
  if (!nest) return null;
  return { worldTitle: world.title, ...nest };
}

/**
 * Flat search index: returns every world + nest pair with searchable text.
 * Used by the Spy-glass search overlay on Sara Hub.
 */
export function getForestSearchIndex() {
  const index = [];
  Object.entries(SARA_FOREST_TEASERS).forEach(([worldSlug, world]) => {
    /* World-level entry — clicking lands on the painted world hub. */
    index.push({
      kind: "world",
      worldSlug,
      worldTitle: world.title,
      title: world.title,
      line: "",
      route: `/parents-room/category/${worldSlug}`,
      searchText: world.title.toLowerCase(),
    });
    /* Nest-level entries — clicking lands on the painted-world sub-route. */
    Object.entries(world.nests).forEach(([nestSlug, nest]) => {
      index.push({
        kind: "nest",
        worldSlug,
        worldTitle: world.title,
        nestSlug,
        title: nest.title,
        line: nest.line,
        route: `/parents-room/category/${worldSlug}/${nestSlug}`,
        searchText: `${nest.title} ${nest.line} ${world.title}`.toLowerCase(),
      });
    });
  });
  return index;
}
