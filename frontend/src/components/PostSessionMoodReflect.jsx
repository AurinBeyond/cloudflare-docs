/**
 * PostSessionMoodReflect.jsx — gentle 1-textarea reflection prompt
 * that fires AFTER a voice session and uses Claude to extract a
 * mood signal. The user's words are NEVER stored — only the
 * extracted mood label + confidence. This is the founder's
 * privacy guarantee.
 *
 * §VOICE-MOOD-NLP 2026-02-09 — Phase 2 of mood detection.
 *
 * Usage: render this inline at the end of a Grace/Body/Course
 * session detail. Stays collapsed until the user opens it. Soft-
 * fail on any error (renders nothing if the LLM key isn't set).
 */

import { useState } from "react";
import { api } from "@/lib/api";
import { Send, Sparkles, Check } from "lucide-react";

export default function PostSessionMoodReflect({ room = "", sessionId = "" }) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const submit = async () => {
        if (!text.trim() || busy) return;
        setBusy(true);
        setError(null);
        try {
            const r = await api.post("/voice-mood/extract", {
                text: text.trim(),
                room,
                session_id: sessionId,
            });
            setResult(r.data);
            // Clear text immediately — privacy promise.
            setText("");
        } catch (e) {
            setError(e?.response?.data?.detail || "Couldn't read that one — try again in a moment.");
        } finally {
            setBusy(false);
        }
    };

    if (result) {
        return (
            <div data-testid="post-session-mood-result"
                 className="aurin-card p-5 flex items-start gap-3">
                <Check size={18} className="text-[hsl(var(--aurin-sage))] mt-0.5 shrink-0" />
                <div className="flex-1">
                    <p className="text-[12px] uppercase tracking-[0.18em] text-[hsl(var(--aurin-sage))] mb-1">
                        Held quietly
                    </p>
                    <p className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text))]">
                        {result.aurin_line}
                    </p>
                    <p className="text-[11.5px] mt-2 house-muted italic">
                        Your words have been forgotten — only a single soft
                        mood-signal stays, so Aurin can meet you better next time.
                    </p>
                </div>
            </div>
        );
    }

    if (!open) {
        return (
            <button type="button"
                    onClick={() => setOpen(true)}
                    data-testid="post-session-mood-open"
                    className="aurin-card w-full p-5 flex items-center gap-3 text-left hover:bg-[hsl(var(--aurin-surface-2))] transition">
                <Sparkles size={18} className="text-[hsl(var(--aurin-amber))] shrink-0" />
                <div className="flex-1">
                    <p className="text-[14px] text-[hsl(var(--aurin-text))]">
                        How did that feel, in one or two sentences?
                    </p>
                    <p className="text-[11.5px] house-muted mt-0.5 italic">
                        Optional. Only a mood-signal is kept; your words are forgotten.
                    </p>
                </div>
            </button>
        );
    }

    return (
        <div data-testid="post-session-mood-form" className="aurin-card p-5">
            <p className="text-[12px] uppercase tracking-[0.18em] text-[hsl(var(--aurin-amber))] mb-2">
                A small reflection
            </p>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="One or two sentences — anything that surfaced."
                rows={3}
                data-testid="post-session-mood-textarea"
                maxLength={1200}
                className="w-full p-3 rounded-lg bg-[hsl(var(--aurin-surface-2))] border border-[hsl(var(--aurin-border-soft))] text-[14px] text-[hsl(var(--aurin-text))] focus:outline-none focus:border-[hsl(var(--aurin-amber))] transition"
                style={{ fontFamily: "Fraunces, serif" }}
            />
            <div className="flex items-center justify-between mt-3 gap-2">
                <p className="text-[11.5px] house-muted italic">
                    Your text is forgotten the moment we read it.
                </p>
                <div className="flex items-center gap-2">
                    <button type="button"
                            onClick={() => { setOpen(false); setText(""); }}
                            data-testid="post-session-mood-cancel"
                            className="text-[12.5px] uppercase tracking-[0.16em] house-muted hover:text-[hsl(var(--aurin-text))]">
                        Skip
                    </button>
                    <button type="button"
                            onClick={submit}
                            disabled={busy || !text.trim()}
                            data-testid="post-session-mood-submit"
                            className="inline-flex items-center gap-1.5 text-[12.5px] uppercase tracking-[0.16em] px-3.5 py-2 rounded-full border transition disabled:opacity-50"
                            style={{
                                background: "hsl(var(--aurin-amber) / 0.18)",
                                borderColor: "hsl(var(--aurin-amber))",
                                color: "hsl(var(--aurin-amber))",
                            }}>
                        <Send size={11} />
                        {busy ? "Reading…" : "Hold it gently"}
                    </button>
                </div>
            </div>
            {error && (
                <p className="mt-2 text-[12px] text-[hsl(var(--aurin-rose))]"
                   data-testid="post-session-mood-error">{error}</p>
            )}
        </div>
    );
}
