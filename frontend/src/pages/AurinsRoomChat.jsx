/**
 * AurinsRoomChat — single age-group conversation surface for Aurin.
 *
 * §AURIN 2026-05-20 — Parallel to RoomConvaiChat but kept SEPARATE on
 * purpose: the other four rooms run with a strict ZERO-OVERRIDE
 * policy (Dashboard is the single source of truth). Aurin DOES use
 * overrides because the same agent serves three age groups; mixing
 * the two policies in one component would risk leaking overrides to
 * the wrong agent later. Smaller blast radius, easier to reason about.
 *
 * The component still uses the same hard-lock (`/api/presence/start`
 * 402 detection), the same atomic credit ledger, the same
 * ConvaiPresenceTracker — so billing, audit, and ghost-session
 * cleanup all work identically to the other rooms.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import PageHeader from "@/components/layout/PageHeader";
import { ArrowLeft } from "lucide-react";
import { getSessionToken } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/backendUrl";
import { getAgeGroup, buildAurinPrompt } from "@/lib/aurinPrompts";

const MODES = [
  { key: "voice",  label: "Voice",  hint: "Speak — Aurin speaks back." },
  { key: "text",   label: "Text",   hint: "Type — Aurin writes back." },
  { key: "hybrid", label: "Hybrid", hint: "Type — Aurin speaks back." },
];

async function fetchSignedUrl(mode) {
  const token = getSessionToken();
  if (!token) throw new Error("Not signed in");
  if (!BACKEND_URL) throw new Error("Backend URL not configured");
  const res = await fetch(`${BACKEND_URL}/api/clarity/convai/signed-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ room: "aurin", mode: mode || "voice" }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`signed-url failed (${res.status}): ${detail.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export default function AurinsRoomChat() {
  // §AURIN 2026-05-22 — `useConversation` hook from the ElevenLabs
  // SDK requires a surrounding <ConversationProvider> at runtime
  // (the SDK changed this in a recent version → resulted in the
  // "A quiet ripple" crashes the founder kept hitting). Wrapping
  // here mirrors the exact pattern used by the working
  // RoomConvaiChat.jsx (4 adult rooms). PURE ADDITIVE.
  return (
    <ConversationProvider>
      <AurinsRoomChatInner />
    </ConversationProvider>
  );
}

function AurinsRoomChatInner() {
  const { ageGroup: slug } = useParams();
  const group = useMemo(() => getAgeGroup(slug), [slug]);
  const promptText = useMemo(() => buildAurinPrompt(group.slug), [group.slug]);
  const knownSlug = slug && group.slug === slug;

  const [mode, setMode] = useState("voice");
  const [status, setStatus] = useState("idle"); // idle | connecting | live | error
  const [errorMsg, setErrorMsg] = useState("");
  const [blocked, setBlocked] = useState(false);
  const modeRef = useRef("voice");
  const sessionIdRef = useRef(null);
  // §AURIN 2026-02-09 — Defensive retry counter. If startSession fails
  // with overrides (Dashboard security rejection or transient network
  // glitch), we transparently retry ONCE without overrides so the
  // child never sees a crash. The retry uses the Dashboard's own
  // first_message + prompt + tts settings as fallback.
  const retryWithoutOverridesRef = useRef(false);

  const conversation = useConversation({
    onConnect: () => {
      // eslint-disable-next-line no-console
      console.log("[Aurin]", group.slug, "onConnect — session live");
      setStatus("live");
      setErrorMsg("");
    },
    onDisconnect: (details) => {
      // eslint-disable-next-line no-console
      console.log("[Aurin]", group.slug, "onDisconnect", details);
      setStatus("idle");
    },
    onError: (e) => {
      // eslint-disable-next-line no-console
      console.warn("[Aurin]", group.slug, "onError", e);
      setStatus("error");
      setErrorMsg(String(e?.message || e || "Connection error").slice(0, 240));
    },
  });

  const start = useCallback(async () => {
    if (status === "connecting" || status === "live") return;
    setStatus("connecting");
    setErrorMsg("");
    setBlocked(false);
    try {
      // §AURIN 2026-02-09 — Mic pre-warm (matches RoomConvaiChat
      // adult-room pattern). Gives the OS time to fully open the
      // CoreAudio device before the SDK applies voiceIsolation
      // constraints. Skipped in TEXT mode (no mic needed). Without
      // this on macOS + Chrome, the SDK can land in a connected
      // state but receive only silence frames.
      if (mode !== "text") {
        try {
          const warmup = await navigator.mediaDevices.getUserMedia({ audio: true });
          warmup.getTracks().forEach((t) => t.stop());
        } catch (warmupErr) {
          throw warmupErr;
        }
      }
      const { signed_url: signedUrl } = await fetchSignedUrl(mode);
      modeRef.current = mode;
      const isTextMode = mode === "text";
      // §AURIN 2026-05-20 — Apply age-specific overrides. The Aurin
      // Dashboard has been authorised to accept these (other four
      // agents have NOT — never mix the policies).
      // §AURIN 2026-02-09 — `retryWithoutOverridesRef` makes the
      // SECOND attempt strip overrides entirely so the child still
      // reaches the room even if Dashboard temporarily rejects a
      // field (transient ElevenLabs config change, etc.).
      const skipOverrides = retryWithoutOverridesRef.current;
      const sessionConfig = {
        signedUrl,
        connectionType: "websocket",
        ...(isTextMode ? { textOnly: true } : {}),
      };
      if (!skipOverrides) {
        sessionConfig.overrides = {
          agent: {
            prompt: { prompt: promptText },
            firstMessage: group.firstMessage,
            language: "en",
          },
          ...(!isTextMode
            ? {
                tts: {
                  speed: group.ttsSpeed,
                  stability: group.ttsStability,
                },
              }
            : {}),
          ...(isTextMode ? { conversation: { textOnly: true } } : {}),
        };
      }
      // eslint-disable-next-line no-console
      console.log("[Aurin]", group.slug, "startSession", {
        mode, skipOverrides, promptLen: promptText.length,
      });
      conversation.startSession(sessionConfig);
      // Reset retry flag after a successful start dispatch — onError
      // will set it again if needed for the next attempt.
      retryWithoutOverridesRef.current = false;
    } catch (err) {
      if (err?.status === 402 || /\b402\b/.test(err?.message || "")) {
        modeRef.current = "text";
        setMode("text");
        setStatus("idle");
        setBlocked(true);
        setErrorMsg("");
        return;
      }
      setStatus("error");
      setErrorMsg(err?.message || "Could not connect to Aurin's room.");
    }
  }, [conversation, mode, status, promptText, group]);

  // §AURIN 2026-02-09 — Auto-retry once without overrides when the
  // first attempt errors out. This salvages sessions when the
  // Dashboard rejects a single override field (or any transient
  // upstream rejection) without the child seeing a crash.
  useEffect(() => {
    if (status !== "error") return;
    if (retryWithoutOverridesRef.current) return; // already retried
    // Only retry for the override-related class of errors. Mic
    // permission errors must remain visible so the user can fix them.
    const lower = (errorMsg || "").toLowerCase();
    const isMicIssue =
      lower.includes("permission") ||
      lower.includes("notallowed") ||
      lower.includes("not allowed") ||
      lower.includes("notfound") ||
      lower.includes("device");
    if (isMicIssue) return;
    retryWithoutOverridesRef.current = true;
    // eslint-disable-next-line no-console
    console.warn("[Aurin]", group.slug, "auto-retry without overrides");
    setErrorMsg("");
    setStatus("idle");
    const t = setTimeout(() => { start(); }, 250);
    return () => clearTimeout(t);
  }, [status, errorMsg, group.slug, start]);

  const stop = useCallback(async () => {
    try { await conversation.endSession(); } catch { /* swallow */ }
    setStatus("idle");
  }, [conversation]);

  // End any live session if the page is unmounted (route change).
  useEffect(() => () => { stop(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Guard: if someone hits an unknown slug, redirect to the gateway.
  // Placed AFTER hooks so we never violate the rules-of-hooks order.
  if (!knownSlug) {
    return <Navigate to="/aurins-room" replace />;
  }

  return (
    <div
      className="min-h-screen bg-[hsl(var(--aurin-bg))] text-[hsl(var(--aurin-text))]"
      data-testid={`aurin-page-${group.slug}`}
      style={group.theme?.accent ? { "--aurin-age-accent": group.theme.accent } : undefined}
    >
      <PageHeader
        eyebrow={group.age}
        title={`${group.label} · with Aurin`}
        subtitle={group.description}
      />

      {/* §AURIN 2026-02-09 — Founder directive: per-age character
          portrait sits BESIDE the chat (LEFT on desktop, ABOVE on
          mobile) — matching the adult rooms' layout. Replaces the
          earlier hero-on-top banner so the child sees Aurin and the
          conversation surface together, the way they see Grace,
          Kaelan, Sara, Alistair next to their chats. Existing chat
          logic, billing, signed-URL flow are 100% untouched.
          If the hero image fails to load the figure hides quietly —
          no crash, no layout shift visible to the child. */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Link
          to="/aurins-room"
          data-testid="aurin-back-to-gateway"
          className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-[hsl(var(--aurin-text))/0.55] transition hover:text-[hsl(var(--aurin-amber))]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Choose a different path
        </Link>

        <div className="mt-6 flex flex-col md:flex-row md:items-start gap-6 lg:gap-8">
          {/* Aurin character portrait — LEFT on desktop, top on mobile. */}
          {group.theme?.hero && (
            <aside
              data-testid={`aurin-portrait-panel-${group.slug}`}
              className="shrink-0 md:sticky md:top-24 self-start"
            >
              <figure
                className="relative w-full md:w-[340px] lg:w-[380px] overflow-hidden rounded-3xl border backdrop-blur"
                style={{
                  borderColor: `${group.theme.accent}55`,
                  background: group.theme.bg || "transparent",
                }}
              >
                <div className="relative aurin-breathe h-[360px] md:h-[440px] w-full overflow-hidden">
                  <div
                    role="img"
                    aria-label={`Aurin · ${group.label}`}
                    data-testid={`aurin-hero-${group.slug}`}
                    className="h-full w-full"
                    style={{
                      backgroundImage: `url(${group.theme.hero})`,
                      backgroundSize: "180% auto",
                      backgroundPosition: "0% 20%",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                </div>
                <figcaption className="px-5 py-5 text-center border-t border-[hsl(var(--aurin-border-soft))/0.5]">
                  <p
                    className="aurin-serif text-[24px] md:text-[28px] leading-none text-[hsl(var(--aurin-text))]"
                    data-testid={`aurin-name-${group.slug}`}
                  >
                    Aurin
                  </p>
                  <p
                    className="mt-2 text-[10.5px] tracking-[0.34em] uppercase"
                    style={{ color: group.theme.accent }}
                  >
                    {group.label} · {group.age}
                  </p>
                  {group.theme.tagline && (
                    <p
                      data-testid={`aurin-tagline-${group.slug}`}
                      className="mt-3 text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.78] aurin-serif-italic"
                    >
                      {group.theme.tagline}
                    </p>
                  )}
                </figcaption>
              </figure>
            </aside>
          )}

          {/* Chat surface — RIGHT on desktop, below portrait on mobile. */}
          <div className="flex-1 min-w-0">
            {blocked ? (
          <div
            data-testid="aurin-blocked-card"
            className="mt-6 rounded-2xl border border-amber-400/40 bg-amber-50/[0.04] p-5"
          >
            <p className="aurin-serif text-[15px] text-[hsl(var(--aurin-text))/0.92]">
              Presence Time is empty — voice is paused.
            </p>
            <p className="mt-1 text-[12.5px] text-[hsl(var(--aurin-text))/0.65] leading-relaxed">
              Writing stays free. Top up to open voice again whenever you are ready.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href="/pricing"
                data-testid="aurin-blocked-topup"
                className="aurin-btn-primary text-[12.5px]"
              >
                Add Presence Time
              </a>
              <button
                type="button"
                data-testid="aurin-blocked-dismiss"
                onClick={() => setBlocked(false)}
                className="aurin-btn-ghost text-[12.5px]"
              >
                Continue in text
              </button>
            </div>
          </div>
        ) : null}

        <div
          data-testid="aurin-panel"
          data-status={status}
          className="mt-6 rounded-2xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg-elev))/0.55] p-6 backdrop-blur"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                data-testid="aurin-status-dot"
                className={
                  "inline-block h-2.5 w-2.5 rounded-full " +
                  (status === "live" ? "bg-emerald-400" :
                   status === "connecting" ? "bg-amber-400 animate-pulse" :
                   status === "error" ? "bg-rose-400" : "bg-[hsl(var(--aurin-text))/0.25]")
                }
                aria-hidden
              />
              <p className="text-sm text-[hsl(var(--aurin-text))/0.75]">
                {status === "live" ? "Aurin is here" :
                 status === "connecting" ? "Opening the room…" :
                 status === "error" ? "Something paused" : "Ready when you are"}
              </p>
            </div>

            <div className="flex items-center gap-2" role="tablist" aria-label="Conversation mode">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  role="tab"
                  aria-selected={mode === m.key}
                  data-testid={`aurin-mode-${m.key}`}
                  disabled={status === "live" || status === "connecting"}
                  onClick={() => setMode(m.key)}
                  className={
                    "rounded-full px-3 py-1.5 text-xs transition " +
                    (mode === m.key
                      ? "bg-[hsl(var(--aurin-amber))/0.18] text-[hsl(var(--aurin-amber))] border border-[hsl(var(--aurin-amber))/0.4]"
                      : "text-[hsl(var(--aurin-text))/0.7] border border-[hsl(var(--aurin-border-soft))] hover:border-[hsl(var(--aurin-amber))/0.4]")
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs text-[hsl(var(--aurin-text))/0.55]">
            {MODES.find((m) => m.key === mode)?.hint}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {status === "live" ? (
              <button
                type="button"
                data-testid="aurin-end-btn"
                onClick={stop}
                className="aurin-btn-ghost"
              >
                End the visit
              </button>
            ) : (
              <button
                type="button"
                data-testid="aurin-start-btn"
                onClick={start}
                disabled={status === "connecting"}
                className="aurin-btn-primary"
              >
                {status === "connecting" ? "Opening…" : "Open the room"}
              </button>
            )}
          </div>

          {errorMsg && status === "error" ? (
            <p
              data-testid="aurin-error"
              className="mt-4 text-sm text-rose-300/90"
            >
              {errorMsg}
            </p>
          ) : null}
        </div>

        <p
          className="mt-8 text-xs leading-relaxed text-[hsl(var(--aurin-text))/0.5]"
          data-testid="aurin-chat-disclaimer"
        >
          Aurin is a companion, not a parent, doctor, or therapist. If
          something heavy comes up, Aurin will gently invite the child
          to talk to a trusted grown-up. Sessions are recorded for
          seven days, then automatically deleted.
        </p>
          </div>
        </div>
      </section>
    </div>
  );
}
