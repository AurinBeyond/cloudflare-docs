/**
 * ListenHearthIndex.jsx — `/listen/hearth/` gateway redirect
 *
 * §HEARTH-GATEWAY 2026-05-31 — single short URL that always
 * routes the visitor to the most recent Hearth story. This is
 * the canonical link to use in outreach, Substack essays, Show HN
 * posts, LinkedIn micro-posts, etc.
 *
 * Why: brand promise is "screen-down, ears-open" — a tired parent
 * at 11pm should not have to read or click through a slug. They
 * paste `prulesoul.site/listen/hearth/` and tonight's story plays.
 *
 * Mechanism: a single source-of-truth array (HEARTH_STORIES, ordered
 * newest first). The latest story slug becomes the redirect target.
 * Adding a new story requires only prepending one entry to the array.
 *
 * Future-proof: if for any reason the array is empty, fall back to
 * the inaugural story so the link never 404s.
 */
import { Navigate } from "react-router-dom";

// Ordered NEWEST FIRST. Prepend each new story when its audio ships.
export const HEARTH_STORIES = [
  {
    slug: "the-garden-in-november",
    title: "The Garden in November",
    publishedAt: "2026-06-01",
  },
  {
    slug: "the-window-left-open",
    title: "The Window Left Open",
    publishedAt: "2026-06-01",
  },
  {
    slug: "the-coat-on-the-chair",
    title: "The Coat on the Chair",
    publishedAt: "2026-05-31",
  },
  {
    slug: "the-light-in-the-hallway",
    title: "The Light in the Hallway",
    publishedAt: "2026-05-31",
  },
  {
    slug: "the-sock-on-the-stairs",
    title: "The Sock on the Stairs",
    publishedAt: "2026-05-31",
  },
];

const LATEST = HEARTH_STORIES[0]?.slug || "the-sock-on-the-stairs";

export default function ListenHearthIndex() {
  return <Navigate to={`/listen/hearth/${LATEST}`} replace />;
}
