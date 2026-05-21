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
import { useConversation } from "@elevenlabs/react";
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

  const conversation = useConversation({
    onConnect: () => setStatus("live"),
    onDisconnect: () => setStatus("idle"),
    onError: (e) => {
      setStatus("error");
      setErrorMsg(String(e?.message || e || "Connection error").slice(0, 200));
    },
  });

  const start = useCallback(async () => {
    if (status === "connecting" || status === "live") return;
    setStatus("connecting");
    setErrorMsg("");
    setBlocked(false);
    try {
      const { signed_url: signedUrl } = await fetchSignedUrl(mode);
      modeRef.current = mode;
      const isTextMode = mode === "text";
      // §AURIN 2026-05-20 — Apply age-specific overrides. The Aurin
      // Dashboard has been authorised to accept these (other four
      // agents have NOT — never mix the policies).
      conversation.startSession({
        signedUrl,
        connectionType: "websocket",
        ...(isTextMode ? { textOnly: true } : {}),
        overrides: {
          agent: {
            prompt: { prompt: promptText },
            firstMessage: group.firstMessage,
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
        },
      });
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
    <div className="min-h-screen bg-[hsl(var(--aurin-bg))] text-[hsl(var(--aurin-text))]">
      <PageHeader
        eyebrow={group.age}
        title={`${group.label} · with Aurin`}
        subtitle={group.description}
      />

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <Link
          to="/aurins-room"
          data-testid="aurin-back-to-gateway"
          className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-[hsl(var(--aurin-text))/0.55] transition hover:text-[hsl(var(--aurin-amber))]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Choose a different path
        </Link>

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
      </section>
    </div>
  );
}
