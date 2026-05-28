/**
 * polarstarAgeGroups.js — single source of truth for the three age
 * paths inside Polarstar. Used by the gateway on the homepage AND
 * by the per-age room page. See /app/memory/POLARSTAR_NORTHSTAR.md.
 */
import {
  BookOpen, Leaf, Palette, Mic, Sparkles, Moon,
  Heart, Pencil, Wind, Compass, Hand, Star,
} from "lucide-react";

export const POLARSTAR_AGE_GROUPS = [
  {
    id: "discovery",
    age: "4–6 years",
    title: "Discovery Path",
    subtitle: "For the youngest explorers.",
    description:
      "Simple stories, gentle play, drawing, calm moments and parent-child rituals.",
    route: "/kids-universe/polarstar/discovery",
    Icon: BookOpen,
    guideImage: "/polarstar/guide-discovery.png",
    guideSpeech: "Is it time for a bedtime story?",
    activities: [
      { id: "bedtime",  label: "Bedtime Stories",  Icon: Moon,    blurb: "A quiet tale before sleep." },
      { id: "calm",     label: "Calm Moments",     Icon: Wind,    blurb: "One slow breath together." },
      { id: "myworld",  label: "My World",         Icon: Compass, blurb: "Tell me what you saw today." },
      { id: "learn",    label: "Gentle Learning",  Icon: Leaf,    blurb: "Soft questions, soft answers." },
      { id: "creative", label: "Creative Time",    Icon: Palette, blurb: "Colour, shape, song." },
      { id: "draw",     label: "Draw Together",    Icon: Pencil,  blurb: "Make something with a grown-up." },
    ],
  },
  {
    id: "exploration",
    age: "7–10 years",
    title: "Exploration Path",
    subtitle: "For curious hearts and growing imagination.",
    description:
      "Stories, nature quests, kindness missions, drawing, imagination and family adventures.",
    route: "/kids-universe/polarstar/exploration",
    Icon: Leaf,
    guideImage: "/polarstar/guide-exploration.png",
    guideSpeech: "Shall we go on an adventure?",
    activities: [
      { id: "story",      label: "Story Journey",   Icon: BookOpen, blurb: "Begin a new chapter." },
      { id: "imagine",    label: "Imagine Together",Icon: Sparkles, blurb: "Build a world in your mind." },
      { id: "draw",       label: "Draw & Create",   Icon: Pencil,   blurb: "Sketch what the story gave you." },
      { id: "nature",     label: "Nature Quest",    Icon: Leaf,     blurb: "Find one small wonder outside." },
      { id: "kindness",   label: "Kindness Mission",Icon: Heart,    blurb: "Do one small kind thing." },
      { id: "reflection", label: "Reflection Time", Icon: Moon,     blurb: "How did today feel?" },
      { id: "evening",    label: "Evening Room",    Icon: Star,     blurb: "Close the day gently." },
    ],
  },
  {
    id: "creation",
    age: "11–13 years",
    title: "Creation Path",
    subtitle: "For older children who want to create and express.",
    description:
      "Story studio, art studio, voice creation, dream projects and reflective family memories.",
    route: "/kids-universe/polarstar/creation",
    Icon: Palette,
    guideImage: "/polarstar/guide-creation.png",
    guideSpeech: "What will you create tonight?",
    activities: [
      { id: "story-studio", label: "Story Studio",   Icon: BookOpen, blurb: "Write your own short tale." },
      { id: "art-studio",   label: "Art Studio",     Icon: Palette,  blurb: "Paint what cannot be said." },
      { id: "voice-studio", label: "Voice Studio",   Icon: Mic,      blurb: "Record a thought, soft and slow." },
      { id: "build",        label: "Build Something",Icon: Hand,     blurb: "Make a small thing with your hands." },
      { id: "dream",        label: "Dream Project",  Icon: Sparkles, blurb: "An idea you carry for a season." },
      { id: "share",        label: "Share Your Story",Icon: Heart,   blurb: "Read it to someone you love." },
    ],
  },
];

export function findAgeGroup(id) {
  return POLARSTAR_AGE_GROUPS.find((g) => g.id === id) || null;
}
