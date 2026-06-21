/**
 * Guest — public one-click entry into the mentor room.
 *
 * Purpose: a first-time visitor (or the founder presenting a screenshot
 * tour) can land here, pick their guide, and be inside Clarity Release
 * in under 60 seconds — no email, no consent fan-out, no manual gate.
 *
 * It is a thin reuse of existing primitives:
 *   - POST /api/auth/guest creates a transient user + session and
 *     pre-acks both consent_v2 and the WandererGate.
 *   - The session token is written to localStorage exactly the way
 *     PortalMagicVerify does it.
 *   - We also set the WandererGate localStorage flag so the front-door
 *     never re-prompts.
 *
 * No new architecture. No new ecosystem layer.
 */
import { useState } from "react";
// §AUDIT-P2 2026-05-20 — Centralised token storage.
import { setSessionToken } from "@/lib/auth";
import axios from "axios";
import { BACKEND_URL as __BACKEND_URL__ } from "@/lib/backendUrl";

const BACKEND = __BACKEND_URL__;
// §AUDIT-P2 2026-05-20 — Centralised token storage.
const WANDERER_KEY = "wanderer_accepted_1.0-2026-02-07_private";

const GUIDES = [
  {
    gender: "female",
    name: "Grace",
    line: "A warm, unhurried voice. Listens longer than she speaks.",
    portrait: "/assets/illustrations/guide-female.jpg",
  },
];

export default function Guest() {
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);

  async function enterAs(gender) {
    if (pending) return;
    setPending(gender);
    setError(null);
    try {
      const { data } = await axios.post(`${BACKEND}/api/auth/guest`, {
        guide_gender: gender,
      });
      if (data?.session_token) {
        try {
          localStorage.setItem(TOKEN_KEY, data.session_token);
          localStorage.setItem(WANDERER_KEY, "1");
        } catch {
          /* private-mode storage blocked — backend still has the session */
        }
        // Full reload so AuthProvider picks up the new token from
        // localStorage on its first mount. A SPA `navigate()` would
        // skip the refresh and the room would see no user.
        window.location.href = data.redirect_to || "/clarity-release";
        return;
      }
      throw new Error("No session token in response");
    } catch (err) {
      setPending(null);
      setError(
        "This space is still being prepared quietly. Please try again in a moment.",
      );
    }
  }

  return (
    <section
      className="min-h-[80vh] flex items-center justify-center px-6 py-16 bg-[hsl(var(--aurin-bg))]"
      data-testid="page-guest"
    >
      <div className="w-full max-w-3xl mx-auto">
        <div className="aurin-eyebrow !mb-3">— A quiet place to speak</div>
        <h1
          className="aurin-display text-4xl sm:text-5xl leading-tight"
          data-testid="guest-title"
        >
          When the mind feels heavy,{" "}
          <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
            someone here will listen.
          </span>
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-2xl">
          A quiet companion for the things you haven't been able to say to
          anyone else. No appointment, no judgment, no advice you didn't
          ask for. Choose who you'd like to speak with — the room opens
          on the next tap.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {GUIDES.map((g) => (
            <button
              key={g.gender}
              type="button"
              onClick={() => enterAs(g.gender)}
              disabled={pending !== null}
              data-testid={`guest-pick-${g.gender}`}
              className="text-left aurin-card p-6 md:p-7 transition-transform duration-200 hover:translate-y-[-2px] hover:border-[hsl(var(--aurin-sage))/0.55] disabled:opacity-60 disabled:cursor-wait flex gap-5 items-start"
            >
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shrink-0 border border-[hsl(var(--aurin-border-soft))]"
                style={{
                  background: "hsl(var(--aurin-bg-soft))",
                }}
              >
                <img
                  src={g.portrait}
                  alt={`Companion — ${g.name}`}
                  data-testid={`guest-portrait-${g.gender}`}
                  className="w-full h-full object-cover guide-portrait-breathe"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="aurin-eyebrow !mb-1">
                  — A listening presence
                </div>
                <div className="aurin-display text-2xl">
                  Speak with{" "}
                  <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
                    {g.name}
                  </span>
                </div>
                <p className="mt-2 text-[13.5px] text-[hsl(var(--aurin-text-muted))]">
                  {g.line}
                </p>
                <p className="mt-3 text-[12px] text-[hsl(var(--aurin-text-muted))]/80">
                  {pending === g.gender
                    ? "Opening the room…"
                    : "One tap. Speak naturally. No email."}
                </p>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <p
            data-testid="guest-error"
            className="mt-6 text-[13px] text-[hsl(var(--aurin-text-muted))] aurin-serif-italic"
          >
            {error}
          </p>
        )}

        <p className="mt-12 text-[12px] text-[hsl(var(--aurin-text-muted))]/80 max-w-2xl leading-relaxed">
          A reflection companion — not a medical service, not a coach, not
          a spiritual teacher. The room mirrors what you say back in plain
          sentences and waits. You decide what to do with your own words.
          Nothing you say is recorded.
        </p>
      </div>
    </section>
  );
}
