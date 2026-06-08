/**
 * grace/Messages.jsx — § GRACE / MY MESSAGES 2026-02
 *
 * Founder spec: Conversation History (Voice / Written / Saved
 * Reflections / Favorite Moments) + Personal Library. The actual
 * encrypted persistence lives behind the Wanderer's Gate at
 * /grace/room — this surface is the warm "front door" listing.
 *
 * If the visitor is not signed in, the cards still render (as a
 * preview) and clicking any of them sends them into the gated
 * surface where their real saved items live.
 */
import GraceSubPage, {
  GraceCard,
  GraceSection,
} from "@/components/grace/GraceSubPage";
import { MessageSquare } from "lucide-react";

const HISTORY = [
  {
    id: "voice",
    title: "Voice Conversations",
    lines: ["Spoken sessions with Grace, gently kept."],
  },
  {
    id: "written",
    title: "Written Conversations",
    lines: ["Text exchanges, in your own words."],
  },
  {
    id: "reflections",
    title: "Saved Reflections",
    lines: ["Evening reviews and journal pages you chose to keep."],
  },
  {
    id: "favorites",
    title: "Favorite Moments",
    lines: ["Lines and answers that mattered most to you."],
  },
];

const LIBRARY = [
  "Notes",
  "Journal entries",
  "Reflections",
  "Favorite quotes",
  "Personal insights",
];

export default function Messages() {
  const open = (section) => {
    window.location.href = `/grace/room?view=${encodeURIComponent(section)}`;
  };

  return (
    <GraceSubPage
      testid="page-grace-messages"
      bgImage="/assets/grace/messages-bg.png"
      eyebrow="Conversation History"
      title="Everything you chose to keep."
      intro={
        "Nothing is shared. Nothing is sold. Nothing is shown to anyone else. Your conversations, journal pages, and saved lines live here, quietly, for you to return to."
      }
      quote="You can always continue where you left off."
    >
      <GraceSection label="Conversation History">
        {HISTORY.map((h) => (
          <GraceCard
            key={h.id}
            testid={`grace-messages-${h.id}`}
            title={h.title}
            lines={h.lines}
            onClick={() => open(h.id)}
          />
        ))}
      </GraceSection>

      <GraceSection label="Personal Library">
        <GraceCard
          testid="grace-messages-library"
          title="Your saved collection"
          lines={LIBRARY}
          onClick={() => open("library")}
        />
      </GraceSection>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={() => open("all")}
          data-testid="grace-messages-open-cta"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-[15px] transition-all hover:scale-[1.03] hover:shadow-xl"
          style={{
            background: "#c89a5a",
            color: "#fdf8ef",
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 500,
            letterSpacing: "0.02em",
            boxShadow: "0 10px 32px -10px rgba(200, 154, 90, 0.7)",
          }}
        >
          Open everything I have kept
          <MessageSquare size={16} strokeWidth={1.8} />
        </button>
      </div>
    </GraceSubPage>
  );
}
