/**
 * AlistairModeSelector.jsx — three-button focus selector for the
 * Course Room (Alistair). Mirrors GraceModeSelector exactly so
 * the cognitive load is zero across rooms.
 *
 * §ALISTAIR-PERSONA 2026-02-09 — Founder directive: high-performers
 * / burnout persona MVP. Renders inside CourseRoom.jsx above the
 * existing course catalog.
 */

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Target, Feather, Compass, Check, X } from "lucide-react";

const ICONS = {
    focus: Target,
    decompression: Feather,
    decision: Compass,
};

export default function AlistairModeSelector() {
    const [modes, setModes] = useState([]);
    const [active, setActive] = useState("");
    const [activeFrame, setActiveFrame] = useState(null);
    const [busy, setBusy] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        api.get("/alistair/modes")
            .then((r) => setModes(r.data?.modes || []))
            .catch(() => {});
        api.get("/alistair/mode")
            .then((r) => {
                setActive(r.data?.mode || "");
                setActiveFrame(r.data?.frame || null);
            })
            .catch(() => {});
    }, []);

    const pick = async (key) => {
        if (busy) return;
        const next = active === key ? "" : key;
        setBusy(true);
        try {
            const r = await api.post("/alistair/mode", { mode: next });
            setActive(r.data?.mode || "");
            setActiveFrame(r.data?.frame || null);
            if (next) setExpanded(true);
        } catch {
            /* silent */
        } finally {
            setBusy(false);
        }
    };

    if (!modes.length) return null;

    return (
        <div data-testid="alistair-mode-selector" className="aurin-card p-5 md:p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                    <div className="aurin-eyebrow !mb-1">Today&apos;s focus</div>
                    <p className="text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.9] max-w-[55ch]">
                        Optional. Pick one weight Alistair should hold with you
                        today. Skip it any time — the room works without it.
                    </p>
                </div>
                {active && (
                    <button type="button" onClick={() => pick(active)}
                            data-testid="alistair-mode-clear"
                            className="text-[11.5px] uppercase tracking-[0.16em] house-muted hover:text-[hsl(var(--aurin-text))] inline-flex items-center gap-1.5">
                        <X size={11} /> Clear
                    </button>
                )}
            </div>

            <div className="grid sm:grid-cols-3 gap-2.5">
                {modes.map((m) => {
                    const Icon = ICONS[m.key] || Target;
                    const isActive = active === m.key;
                    return (
                        <button key={m.key} type="button"
                                onClick={() => pick(m.key)}
                                disabled={busy}
                                data-testid={`alistair-mode-${m.key}`}
                                aria-pressed={isActive}
                                className="text-left p-3.5 rounded-lg border transition disabled:opacity-60"
                                style={{
                                    background: isActive
                                        ? "hsl(var(--aurin-amber) / 0.14)"
                                        : "hsl(var(--aurin-surface-2))",
                                    borderColor: isActive
                                        ? "hsl(var(--aurin-amber))"
                                        : "hsl(var(--aurin-border-soft))",
                                }}>
                            <div className="flex items-start gap-2.5">
                                <Icon size={16}
                                      className={isActive ? "text-[hsl(var(--aurin-amber))]" : "text-[hsl(var(--aurin-sage))]"} />
                                <div className="flex-1">
                                    <p className="text-[13.5px] font-medium"
                                       style={{color: isActive ? "hsl(var(--aurin-amber))" : "hsl(var(--aurin-text))"}}>
                                        {m.title}
                                    </p>
                                    <p className="text-[11.5px] mt-0.5 house-muted">
                                        {m.subtitle}
                                    </p>
                                </div>
                                {isActive && <Check size={13} className="text-[hsl(var(--aurin-amber))] mt-0.5" />}
                            </div>
                        </button>
                    );
                })}
            </div>

            {activeFrame && expanded && (
                <div data-testid="alistair-mode-frame"
                     className="mt-4 p-4 rounded-lg border border-[hsl(var(--aurin-amber))/0.35] bg-[hsl(var(--aurin-amber))/0.07]">
                    <p className="text-[12px] uppercase tracking-[0.16em] text-[hsl(var(--aurin-amber))] mb-1.5">
                        Alistair will open with
                    </p>
                    <p className="aurin-serif-italic text-[14px] leading-relaxed text-[hsl(var(--aurin-text))/0.92]">
                        &ldquo;{activeFrame.first_message}&rdquo;
                    </p>
                    <p className="text-[12px] mt-2.5 house-muted">
                        {activeFrame.blurb}
                    </p>
                </div>
            )}
        </div>
    );
}
