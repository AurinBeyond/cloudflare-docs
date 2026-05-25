/**
 * CycleBanner.jsx — "Cycle 01 · the first quiet wave"
 *
 * §INFLUENCER-SWARM 2026-02-09 — Marketing-agent ask: surface a
 * calm, authentic scarcity signal on /portal. Renders the current
 * cycle label + remaining-spots count from /api/marketing/cycle.
 *
 * If a ?key= MUSE code is present on the URL:
 *   • Validate it (public endpoint, no auth needed)
 *   • Show a personalised welcome ("Welcomed by @quietparent")
 *   • Stash the code in sessionStorage so the redeemer flow can
 *     auto-apply it the moment the user signs in
 *
 * If a ?ref= code is present (MUSE… or AURIN…):
 *   • Log a single hit via /api/marketing/ref-hit (best-effort)
 *
 * Pure additive. Renders nothing if the cycle endpoint fails.
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Sparkles, Check } from "lucide-react";

const STASH_KEY = "prulesoul_guest_key";

export default function CycleBanner() {
    const [cycle, setCycle] = useState(null);
    const [key, setKey] = useState(null);
    const [params] = useSearchParams();

    // Read URL params once.
    useEffect(() => {
        const keyParam = (params.get("key") || "").trim().toUpperCase();
        const refParam = (params.get("ref") || "").trim().toUpperCase();
        const utmSource = (params.get("utm_source") || "").trim();
        const utmMedium = (params.get("utm_medium") || "").trim();
        const utmCampaign = (params.get("utm_campaign") || "").trim();

        // Log the ref-hit (fire-and-forget). Includes UTM so email
        // clicks ?utm_source=email also land in analytics.
        if (refParam || utmSource || utmCampaign) {
            api.post("/marketing/ref-hit", {
                code: refParam,
                path: window.location.pathname,
                referer: document.referrer || null,
                utm_source: utmSource || null,
                utm_medium: utmMedium || null,
                utm_campaign: utmCampaign || null,
            }).catch(() => {});
        }
        // Also count a key= visit as a hit.
        if (keyParam && keyParam.startsWith("MUSE")) {
            api.post("/marketing/ref-hit", {
                code: keyParam,
                path: window.location.pathname,
                referer: document.referrer || null,
                utm_source: utmSource || null,
                utm_medium: utmMedium || null,
                utm_campaign: utmCampaign || null,
            }).catch(() => {});
            try { sessionStorage.setItem(STASH_KEY, keyParam); } catch {}
            api.get(`/guest-keys/validate?code=${encodeURIComponent(keyParam)}`)
               .then((r) => setKey(r.data || null))
               .catch(() => setKey(null));
        }

        // Cycle status (always).
        api.get("/marketing/cycle")
           .then((r) => setCycle(r.data || null))
           .catch(() => setCycle(null));
    }, [params]);

    if (!cycle) return null;

    const showKey = key && key.valid;

    return (
        <section
            data-testid="cycle-banner"
            className="aurin-section-sm"
            aria-label="Current cycle"
        >
            <div className="aurin-container max-w-[820px]">
                <div className="aurin-card relative overflow-hidden p-5 md:p-6"
                     style={{
                         background: "linear-gradient(160deg, hsl(var(--aurin-amber) / 0.10) 0%, hsl(var(--aurin-surface-2)) 60%)",
                         borderColor: "hsl(var(--aurin-amber) / 0.35)",
                     }}>
                    <div className="flex items-start gap-3">
                        <Sparkles size={18} className="text-[hsl(var(--aurin-amber))] mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <p className="text-[12px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-amber))] mb-1.5">
                                {cycle.label || "Cycle 01"} · {cycle.subtitle || "The first quiet wave."}
                            </p>
                            <p className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.92] max-w-[58ch]">
                                {cycle.tone_line ||
                                    "A small first wave is now open. We open future cycles slowly, so the rooms stay calm."}
                            </p>
                            <p className="mt-2.5 text-[13px] text-[hsl(var(--aurin-text-muted))]"
                               data-testid="cycle-remaining-line">
                                {cycle.remaining_spots} of {cycle.total_spots} spots remain in this cycle.
                            </p>

                            {showKey && (
                                <div className="mt-4 p-3 rounded-lg border"
                                     data-testid="guest-key-welcome"
                                     style={{
                                         background: "hsl(var(--aurin-sage) / 0.10)",
                                         borderColor: "hsl(var(--aurin-sage) / 0.35)",
                                     }}>
                                    <div className="flex items-start gap-2">
                                        <Check size={14} className="text-[hsl(var(--aurin-sage))] mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[13.5px] text-[hsl(var(--aurin-text))]">
                                                Welcomed by{" "}
                                                <span className="font-medium">
                                                    {key.handle || key.name || "a quiet friend"}
                                                </span>.
                                            </p>
                                            <p className="text-[12px] text-[hsl(var(--aurin-text-muted))] mt-0.5">
                                                Your gift will apply automatically once you sign in.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {key && !key.valid && (
                                <p className="mt-3 text-[12.5px] text-[hsl(var(--aurin-text-muted))] italic"
                                   data-testid="guest-key-invalid">
                                    The gift key on this link is no longer active — but the cycle is still open to you.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/**
 * GuestKeyRedeemer — exported as a SEPARATE function so the portal
 * can mount it once a user is signed in. It looks for a stashed
 * MUSE… code in sessionStorage and silently redeems it.
 *
 * Returns null (renders nothing) — pure side effect.
 */
export function GuestKeyRedeemer({ user }) {
    const [done, setDone] = useState(false);
    const [granted, setGranted] = useState(null);

    useEffect(() => {
        if (!user || done) return;
        let stashed = null;
        try { stashed = sessionStorage.getItem(STASH_KEY); } catch {}
        if (!stashed || !stashed.startsWith("MUSE")) return;

        api.post("/guest-keys/redeem", { code: stashed })
           .then((r) => {
               setGranted(r.data?.perks_granted || []);
               try { sessionStorage.removeItem(STASH_KEY); } catch {}
           })
           .catch(() => {
               try { sessionStorage.removeItem(STASH_KEY); } catch {}
           })
           .finally(() => setDone(true));
    }, [user, done]);

    if (!granted || granted.length === 0) return null;

    return (
        <section className="aurin-section-sm" data-testid="guest-key-redeemed">
            <div className="aurin-container max-w-[820px]">
                <div className="aurin-card p-4 md:p-5 flex items-start gap-3"
                     style={{
                         background: "hsl(var(--aurin-sage) / 0.10)",
                         borderColor: "hsl(var(--aurin-sage) / 0.40)",
                     }}>
                    <Sparkles size={16} className="text-[hsl(var(--aurin-sage))] mt-1 shrink-0" />
                    <div>
                        <p className="text-[13px] uppercase tracking-[0.18em] text-[hsl(var(--aurin-sage))] mb-1">
                            Your gift has arrived
                        </p>
                        <p className="text-[14px] text-[hsl(var(--aurin-text))]">
                            {granted.includes("body_temple_unlock") && "Body Temple 28 is now yours. "}
                            {granted.find((g) => g.startsWith("presence_minutes:")) &&
                                (() => {
                                    const m = granted.find((g) => g.startsWith("presence_minutes:"));
                                    const mins = m.split(":")[1];
                                    return `${mins} minutes of voice time have been added to your account.`;
                                })()}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
