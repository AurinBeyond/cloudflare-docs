/**
 * PolarstarStoryRead.jsx — /kids-universe/polarstar/:roomId/story-time/:storySlug
 *
 * §POLARSTAR-CONTENT iter 86 2026-02-29
 *
 * Renders one full bedtime story from the canonical aurinStories.js
 * catalogue inside the painted Polarstar world. No streaming, no
 * realtime AI. Just text + soft cream parchment + a "next story"
 * card at the bottom.
 */

import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PolarstarThemePage from "@/components/PolarstarThemePage";
import { getStoryBySlug, getStoriesByGroup } from "@/data/aurinStories";
import { getRoom } from "@/data/polarstarContentMap";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

export default function PolarstarStoryRead() {
  const { roomId, storySlug } = useParams();
  const room = getRoom(roomId);
  const story = getStoryBySlug(storySlug);

  if (!room || !story) {
    return <Navigate to={`/kids-universe/polarstar/${roomId || ""}/story-time`} replace />;
  }

  /* Suggest the next story in the same age-bucket. */
  const siblings = getStoriesByGroup(story.ageGroup);
  const idx = siblings.findIndex((s) => s.slug === story.slug);
  const next = idx >= 0 && idx + 1 < siblings.length ? siblings[idx + 1] : null;

  return (
    <PolarstarThemePage
      roomTitle={story.title}
      ageLabel={`${room.title} · ${room.ageLabel}`}
      subtitle={story.intro}
      palette={room.palette}
      backTo={`/kids-universe/polarstar/${room.id}/story-time`}
      backLabel="Back to Story Time"
      parentTip="Read slowly. Pause between paragraphs. Let the silence carry the story."
      testid={`polarstar-story-read-${story.slug}`}
    >
      <article
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "32px 36px",
          borderRadius: 24,
          background: "rgba(255,252,244,0.97)",
          border: `1.5px solid ${room.palette.accent}55`,
          boxShadow: "0 14px 32px rgba(58,42,24,0.20)",
          fontFamily: SERIF,
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: room.palette.accent,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          {story.minutes ? `${story.minutes} min reading` : "Reading"}
        </div>
        {story.body.map((para, i) => (
          <p
            key={i}
            data-testid={`polarstar-story-para-${i}`}
            style={{
              margin: "0 0 18px",
              fontSize: 18.5,
              lineHeight: 1.65,
              color: "#2f2415",
            }}
          >
            {para}
          </p>
        ))}
      </article>

      {next && (
        <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
          <Link
            to={`/kids-universe/polarstar/${room.id}/story-time/${next.slug}`}
            data-testid="polarstar-story-next"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 26px",
              borderRadius: 999,
              textDecoration: "none",
              background: room.palette.accent,
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.06em",
              boxShadow: "0 12px 24px rgba(58,42,24,0.20)",
              fontFamily: SERIF,
            }}
          >
            <span>Next story · {next.title}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </PolarstarThemePage>
  );
}
