/**
 * SaraCrisisSearch.jsx — §SARA-CRISIS-SEARCH 2026-05-28
 *
 * A static, LLM-free crisis search bar for the Parents' Room. The
 * founder's directive (Blueprint v3.1): when a parent is in acute
 * crisis they should not wait for a live voice round-trip. They
 * type two words ("can't sleep", "tantrum at dinner") and Sara
 * surfaces the matching situation card viewed through every
 * available wisdom lens in parallel.
 *
 * Zero LLM cost. Zero token burn. Pure search over
 * `parents_lenses.py` registry.
 *
 * 100% English UI.
 */

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const SERIF = '"Cormorant Garamond", Georgia, serif';

const SITUATION_TITLES = {
  bedtime: "Bedtime",
  mealtime: "Mealtime",
  big_emotions: "Big emotions",
  screen_time: "Screen time",
  sibling: "Sibling friction",
  separation: "Separation",
  school_stress: "School stress",
  connection: "Connection",
};

export default function SaraCrisisSearch() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = async (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setSearching(true);
    try {
      const res = await api.get(
        `/parents-room/crisis-search?q=${encodeURIComponent(q)}`
      );
      setMatches(res?.data?.matches || []);
    } catch (_) {
      setMatches([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  return (
    <div
      data-testid="sara-crisis-search"
      className="rounded-[1.25rem] p-7 md:p-8"
      style={{
        background: "linear-gradient(160deg, rgba(255,253,249,0.04) 0%, rgba(255,253,249,0.02) 100%)",
        border: "1px solid rgba(214,143,163,0.20)",
        fontFamily: SERIF,
      }}
    >
      <p
        className="text-[10.5px] tracking-[0.36em] uppercase mb-3"
        style={{ color: "#d68fa3" }}
      >
        ✦ When you cannot wait
      </p>
      <h3
        className="text-[26px] md:text-[30px] leading-[1.2] font-light italic mb-3"
        style={{ color: "#e8e1d5" }}
      >
        Sara's Knowledge Search
      </h3>
      <p
        className="text-[14px] leading-[1.75] italic mb-6"
        style={{ color: "#a59f93" }}
      >
        Type two or three words from your day —
        <em> "won't sleep", "tantrum at dinner", "missing me", "homework battle".</em>
        The room will offer the situation viewed through every lens at once,
        without waiting for a voice call.
      </p>

      <form onSubmit={runSearch} className="flex items-center gap-3 mb-2">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#a59f93" }}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. won't go to sleep, big emotions at dinner…"
            data-testid="sara-crisis-search-input"
            maxLength={120}
            className="w-full bg-transparent rounded-full pl-11 pr-4 py-3 text-[14px] italic focus:outline-none transition-colors"
            style={{
              color: "#e8e1d5",
              border: "1px solid rgba(214,143,163,0.22)",
              fontFamily: SERIF,
            }}
          />
        </div>
        <button
          type="submit"
          disabled={searching || query.trim().length < 2}
          data-testid="sara-crisis-search-submit"
          className="px-7 py-3 rounded-full text-[12px] tracking-[0.22em] uppercase font-medium transition-all disabled:opacity-40"
          style={{
            background: "#d68fa3",
            color: "#0b0a08",
            fontFamily: SERIF,
            boxShadow: "0 0 22px rgba(214,143,163,0.30)",
          }}
        >
          {searching ? (
            <span className="inline-flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Searching</span>
          ) : "Find the lenses"}
        </button>
      </form>

      {searched && !searching && matches.length === 0 && (
        <p
          className="mt-6 text-[13.5px] italic"
          data-testid="sara-crisis-search-empty"
          style={{ color: "#7a7468" }}
        >
          The room did not recognise those words yet. Try
          <em> "sleep", "meltdown", "screen", "sibling", "separation",
          "school", "connection", "mealtime"</em>.
        </p>
      )}

      {!searching && matches.length > 0 && (
        <div className="mt-8 space-y-7" data-testid="sara-crisis-search-results">
          {matches.map((m) => (
            <article
              key={m.situation_id}
              data-testid={`sara-result-${m.situation_id}`}
              className="rounded-[1rem] p-6"
              style={{
                background: "rgba(11,10,8,0.55)",
                border: "1px solid rgba(214,143,163,0.18)",
              }}
            >
              <p
                className="text-[10.5px] tracking-[0.32em] uppercase mb-2"
                style={{ color: "#d68fa3" }}
              >
                ✦ {SITUATION_TITLES[m.situation_id] || m.situation_id}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                {m.lens_views.map((lv) => (
                  <div
                    key={lv.lens_id}
                    className="rounded-[0.85rem] p-5"
                    style={{
                      background: "rgba(255,253,249,0.02)",
                      border: "1px solid rgba(232,225,213,0.08)",
                    }}
                  >
                    <p
                      className="text-[10px] tracking-[0.30em] uppercase mb-1"
                      style={{ color: "#bcb4a3" }}
                    >
                      The lens of
                    </p>
                    <p
                      className="text-[18px] italic font-light mb-3"
                      style={{ color: "#e8e1d5" }}
                    >
                      {lv.lens_name}
                    </p>
                    <p
                      className="text-[13px] leading-[1.7] mb-3"
                      style={{ color: "#bcb4a3" }}
                    >
                      {lv.insight}
                    </p>
                    {lv.practice && (
                      <p
                        className="text-[12.5px] italic leading-[1.7] mb-2"
                        style={{ color: "#a59f93" }}
                      >
                        <span style={{ color: "#d68fa3" }}>Tonight: </span>
                        {lv.practice}
                      </p>
                    )}
                    {lv.permission && (
                      <p
                        className="text-[12px] italic leading-[1.7]"
                        style={{ color: "#7a7468" }}
                      >
                        — {lv.permission}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
