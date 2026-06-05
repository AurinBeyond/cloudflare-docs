/**
 * firstActions.js — Sprint 4 config
 *
 * §SPRINT-4 2026-02 — Three quiet "3-minute First Action" blocks that
 * sit just under each room's hero. One shared component, three configs.
 *
 * Strict tone rules (locked at /app/memory/FIRST_ACTIONS_v1.md):
 *  - 100% English UI.
 *  - Forbidden in this config: wellness, healing, therapy, therapist,
 *    tools, platform, users, fitness, exercise, medicine, treatment,
 *    technique, workout, app, signup, subscribe, course, program.
 *  - Allowed: room, page, step, evening, breath, chair, floor, thought,
 *    small thing, listen, sit, notice, return.
 *  - Quiet library voice. No moralising. No congratulating.
 *
 * Each entry shape:
 *  - id          → matches the room's slug (grace / kaelan / sara)
 *  - room        → display name used in the soft "Read on" CTA
 *  - title       → italic short phrase (the song of the room)
 *  - intro       → one short sentence
 *  - steps[]     → exactly four steps, each {time, action, body}
 *  - closing     → one short sentence, no applause
 *  - ctaLabel    → "Read on in X's room →"
 */
export const FIRST_ACTIONS = {
  grace: {
    id: "grace",
    room: "Grace's room",
    title: "One thought, set down.",
    intro:
      "When the day's thinking has piled up, you do not need to solve it tonight. You just need a place to put one piece of it down.",
    steps: [
      {
        time: "First 30 seconds",
        action: "Sit.",
        body:
          "Find a chair or a step. Not the bed, not the floor. Somewhere your back can be straight without effort.",
      },
      {
        time: "30 sec – 1 min",
        action: "Name the loudest thought.",
        body:
          "Not the most important one. The loudest one. The one that keeps stepping in front of the others. Say it under your breath, or just in your head. One sentence.",
      },
      {
        time: "1 min – 2 min",
        action: "Write it down, somewhere small.",
        body:
          "The back of an envelope. A phone note titled tonight. The first blank page of a book. It does not need to be tidy. The point is that it is now somewhere outside your head.",
      },
      {
        time: "2 min – 3 min",
        action: "Close the page.",
        body:
          "Close the note. Close the envelope. Close the book. The thought is no longer your job for the rest of the evening. It will be there tomorrow if it still matters.",
      },
    ],
    closing: "That was the work. You do not need to do more tonight.",
    ctaLabel: "Read on in Grace's room",
  },

  kaelan: {
    id: "kaelan",
    room: "Kaelan's room",
    title: "Returning to the body.",
    intro:
      "You have been away from your body today. Not on purpose — most days take you out of it. This is one quiet way back in.",
    steps: [
      {
        time: "First 30 seconds",
        action: "Stand or sit.",
        body:
          "Whichever you can do without effort. Feet flat. Hands resting where they want to rest. No special posture.",
      },
      {
        time: "30 sec – 1 min",
        action: "Feel where the floor is.",
        body:
          "Just the feet. Not posture. Not breathing yet. Only where the floor is meeting your soles. Heels. Inside arch. Toes. That is it.",
      },
      {
        time: "1 min – 2 min",
        action: "Find one place the body is holding something.",
        body:
          "Jaw. Shoulders. Lower back. The strip across your forehead. Whichever one answers first. Do not try to fix it. Just notice that it is there, and that you found it.",
      },
      {
        time: "2 min – 3 min",
        action: "One slower breath into that place.",
        body:
          "Not a deep breath. A slow one. Let the breath end on its own. No counting. No second one required.",
      },
    ],
    closing: "Nothing more needed. You are back in the room with yourself.",
    ctaLabel: "Read on in Kaelan's room",
  },

  sara: {
    id: "sara",
    room: "Sara's room",
    title: "One small thing that already worked.",
    intro:
      "You are tired. Some of today did not go the way you wanted. That is not the whole story. Here is one quiet way to remember the rest.",
    steps: [
      {
        time: "First 30 seconds",
        action: "Put the phone face-down.",
        body:
          "Not away. Just face-down. So the screen is not running you for the next few minutes.",
      },
      {
        time: "30 sec – 1 min",
        action: "Sit somewhere you were not just working.",
        body:
          "A different chair. The bottom step of the stairs. The end of a bed. A small change in geography is enough.",
      },
      {
        time: "1 min – 2 min",
        action: "Name one small thing that already worked today.",
        body:
          "Not a milestone. A small one. The lunch box that got packed. The shoe that got tied. The two minutes you listened, even though you were tired. The moment you did not say the thing you almost said.",
      },
      {
        time: "2 min – 3 min",
        action: "Sit with it for one full breath.",
        body:
          "Do not move on yet. Do not start planning tomorrow. Just let the small thing be the thing this minute is built around.",
      },
    ],
    closing:
      "Tonight you did not need to be a better parent. You needed one quieter minute. You just gave yourself one.",
    ctaLabel: "Read on in Sara's room",
  },
};
