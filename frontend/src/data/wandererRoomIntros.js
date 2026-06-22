/**
 * wandererRoomIntros.js — § WANDERER ROOM INTROS 2026-06-22
 *
 * Single source of truth for the expanded Wanderer Gate intro
 * shown ABOVE the 5 legal-checkbox lines. Honours:
 *
 *   §SARA-NO-SOLUTION-LOCK     positive recognition, never selling
 *   §VOICE-LIVING-PLACE-LOCK   "for the spaces between people"
 *
 * Tone: every line is a positive recognition. No negations.
 * No "transform / abundance / journey / thrive / mindful".
 *
 * Three rooms are deep-gated and therefore receive an intro here:
 *   - sara   → Sara's harbour
 *   - kaelen → Body World
 *   - grace  → Grace's room (only the inner /grace/room is gated)
 *
 * Each intro has the same shape:
 *   threshold:   "You are about to enter [name]."
 *   inhabitant:  who lives here / what they do (one sentence)
 *   arrivalLine: "People often arrive here ___:"
 *   recognitions: three quiet visitor-voice questions/lines
 *
 * Founder may edit these freely. The component reads them as data.
 */

export const WANDERER_ROOM_INTROS = {
  sara: {
    threshold: "You are about to enter Sara's harbour.",
    inhabitant:
      "Sara notices what happens between people who love each other and still keep missing each other.",
    arrivalLine: "People often arrive here carrying things like:",
    recognitions: [
      "How did we get here again?",
      "We say the same things in the same fight.",
      "Something between us is asking to be noticed.",
    ],
  },

  kaelen: {
    threshold: "You are about to enter Body World.",
    inhabitant:
      "Kaelen listens to what the body has been saying quietly — long before the mind agreed to hear it.",
    arrivalLine: "People often arrive here noticing:",
    recognitions: [
      "My body knows something before I do.",
      "I have stopped listening to it for a while.",
      "What have I stopped noticing?",
    ],
  },

  grace: {
    threshold: "You are about to enter Grace's room.",
    inhabitant:
      "Grace is where you meet yourself again — without anyone asking anything of you.",
    arrivalLine: "People often arrive here when they:",
    recognitions: [
      "Have spent the day being needed.",
      "Are tired of performing.",
      "Want to hear themselves again.",
    ],
  },

  alistair: {
    threshold: "You are about to enter Alistair's laboratory.",
    inhabitant:
      "Alistair stays with the questions that keep returning — long after the day is done.",
    arrivalLine: "People often arrive here when they notice:",
    recognitions: [
      "This keeps coming back to me.",
      "I keep walking around something.",
      "What question have I been avoiding?",
    ],
  },
};

export function getRoomIntro(room) {
  if (!room) return null;
  return WANDERER_ROOM_INTROS[room] || null;
}
