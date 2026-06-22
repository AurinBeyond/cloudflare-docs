/**
 * SaraSpyglassSearch.jsx — § SARA FOREST · SPYGLASS SEARCH 2026-06-21
 *
 * A small spyglass icon that lives in the top-right of Sara's painted
 * hub. When the visitor clicks it, a soft parchment overlay opens with
 * a single search field. As they type, every world + sub-nest of the
 * Sara Forest is filtered in real time. Selecting a result navigates
 * to that nest.
 *
 * Tone (locked to §SARA-ROOM-PHILOSOPHY-LOCK):
 *   - Sara waits quietly in the harbour. The spyglass is for the
 *     wanderer who already wants to find something — never to push.
 *   - No "type a question" prompts. The placeholder is a single quiet
 *     line. No search analytics. No suggestions.
 *
 * No external dependencies. Pure React + Tailwind utility classes.
 */
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getForestSearchIndex } from "@/data/saraForestTeasers";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

export default function SaraSpyglassSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const index = useMemo(() => getForestSearchIndex(), []);

  /* Filter on substring match across title + teaser line + world. */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index
      .filter((entry) => entry.searchText.includes(q))
      .slice(0, 18);
  }, [query, index]);

  /* Focus input when overlay opens · close on Escape. */
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open]);

  const handleSelect = (route) => {
    setOpen(false);
    setQuery("");
    navigate(route);
  };

  return (
    <>
      {/* Spyglass trigger — small, painted-feel pill in the top-right
          of the hub container. Anchored absolutely so it sits on top
          of the painting without affecting layout. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="sara-spyglass-trigger"
        aria-label="Search Sara's forest"
        title="Search Sara's forest"
        className="absolute z-30 inline-flex items-center gap-2 px-3 py-2 transition-all duration-300"
        style={{
          top: "1.25rem",
          right: "1.25rem",
          background: "rgba(28, 22, 14, 0.78)",
          color: "#e8d9b8",
          border: "1px solid rgba(196, 164, 107, 0.45)",
          borderRadius: "999px",
          fontFamily: SERIF,
          fontSize: "0.8rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          backdropFilter: "blur(6px)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(56, 39, 22, 0.92)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(28, 22, 14, 0.78)";
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.5" y2="16.5" />
        </svg>
        <span>Search</span>
      </button>

      {open && (
        <div
          data-testid="sara-spyglass-overlay"
          className="fixed inset-0 z-50 flex items-start justify-center px-6 pt-20"
          style={{
            background: "rgba(8, 6, 4, 0.88)",
            backdropFilter: "blur(8px)",
            fontFamily: SERIF,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quiet kicker — Sara waits, not Sara sells. */}
            <p
              className="uppercase tracking-[0.4em] text-[10px] text-center mb-4"
              style={{ color: "#c4a46b" }}
            >
              A spyglass through the forest
            </p>

            <div
              className="relative"
              style={{
                background: "linear-gradient(180deg, #1c1610 0%, #14100a 100%)",
                border: "1px solid rgba(196, 164, 107, 0.35)",
                borderRadius: "12px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.65)",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you walking toward today?"
                data-testid="sara-spyglass-input"
                className="w-full bg-transparent outline-none px-6 py-5 text-lg md:text-xl"
                style={{
                  color: "#f0eadd",
                  fontFamily: SERIF,
                  letterSpacing: "0.01em",
                }}
              />

              {/* Close affordance — small, never bossy. */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                data-testid="sara-spyglass-close"
                aria-label="Close search"
                className="absolute top-1/2 right-4 -translate-y-1/2 text-xs uppercase tracking-[0.25em] px-3 py-1 transition-colors"
                style={{ color: "#a09584" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#e8d9b8")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#a09584")}
              >
                Esc
              </button>
            </div>

            {/* Results — quiet rows, parchment hover. */}
            <div
              className="mt-3 max-h-[60vh] overflow-y-auto"
              data-testid="sara-spyglass-results"
              style={{
                borderRadius: "10px",
              }}
            >
              {query.trim() && results.length === 0 && (
                <p
                  className="text-center text-sm italic py-6"
                  style={{ color: "#8a7c66" }}
                  data-testid="sara-spyglass-empty"
                >
                  Nothing matches that word in Sara&apos;s forest yet. Try a softer
                  one.
                </p>
              )}

              {results.map((r) => (
                <button
                  key={`${r.kind}-${r.worldSlug}-${r.nestSlug || "world"}`}
                  type="button"
                  onClick={() => handleSelect(r.route)}
                  data-testid={`sara-spyglass-result-${r.worldSlug}${r.nestSlug ? `-${r.nestSlug}` : ""}`}
                  className="w-full text-left px-5 py-4 transition-colors border-b last:border-b-0"
                  style={{
                    background: "transparent",
                    color: "#e8d9b8",
                    borderColor: "rgba(196, 164, 107, 0.12)",
                    fontFamily: SERIF,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(196, 164, 107, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-lg" style={{ color: "#f0eadd" }}>
                      {r.title}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-[0.25em]"
                      style={{ color: "#c4a46b" }}
                    >
                      {r.kind === "world" ? "world" : r.worldTitle}
                    </span>
                  </div>
                  {r.line && (
                    <p
                      className="mt-1 text-sm italic line-clamp-2"
                      style={{ color: "#a09584" }}
                    >
                      {r.line}
                    </p>
                  )}
                </button>
              ))}
            </div>

            {!query.trim() && (
              <p
                className="text-center text-xs italic mt-4"
                style={{ color: "#7a6f5e" }}
                data-testid="sara-spyglass-hint"
              >
                Type a word — feelings, listening, home, fear, traditions,
                wisdom, belonging…
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
