import { useState } from "react";
import { Sparkles, Infinity as InfinityIcon, Check } from "lucide-react";

/**
 * MemoryPackageSelect — Premium Memory Selection (Step 2, $0 stab, iter 61).
 *
 * Two side-by-side depth cards. Free = Transient Echo (device-bound).
 * Premium = Eternal Thread (cross-device, encrypted server notes).
 * Wires only into the existing hybrid-memory toggle: `onChange(boolean)`
 * = save_threads via /api/clarity/prefs. No new backend, no new
 * architecture. Calm Aurin tone. English-uniform UI (iter 62 W-4).
 *
 * Visual reference: Gemini_Generated_Image_iko3joiko3joiko3.png
 *  - cyan (#42A5F5 / #007FFF) for the free side
 *  - amber/gold (#FFC107 / #FFAB00) for the premium side
 *  - dark base, soft glow, no marketing fluff
 */
export default function MemoryPackageSelect({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const select = async (next) => {
    if (busy || next === value) return;
    setBusy(true);
    try {
      await Promise.resolve(onChange(next));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="memory-package-select" className="space-y-4">
      <div>
        <div className="aurin-eyebrow !mb-1">Choose your connection depth</div>
        <p className="text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[64ch]">
          The mentor remembers what you said within this hour either way. The
          difference is what carries between hours, and between devices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ---- FREE: Transient / Hetke Kaja --------------------------- */}
        <DepthCard
          testid="memory-package-transient"
          tone="cyan"
          selected={value === false}
          badge="FREE"
          titleEt="Hetke Kaja"
          titleEn="Transient Echo"
          icon={<Sparkles size={18} className="opacity-80" aria-hidden />}
          bullets={[
            "Memory lives on this device, in your browser",
            "Last few sentences come back at the next visit",
            "Nothing about you is stored on the server",
            "Free, always",
          ]}
          ctaLabel={value === false ? "Selected" : "Continue free"}
          onClick={() => select(false)}
          disabled={busy}
        />

        {/* ---- PREMIUM: Eternal Thread -------------------------------- */}
        <DepthCard
          testid="memory-package-eternal"
          tone="amber"
          selected={value === true}
          badge="PREMIUM"
          title="Eternal Thread"
          subtitle="Cross-device continuity"
          icon={<InfinityIcon size={18} className="opacity-80" aria-hidden />}
          bullets={[
            "Mentor leaves a short private note at the close of each hour",
            "Returns with you on every device you sign in from",
            "Encrypted at rest · only the mentor reads it",
            "Erasable any time by switching this off",
          ]}
          ctaLabel={value === true ? "Active" : "Activate Eternal Thread"}
          onClick={() => select(true)}
          disabled={busy}
        />
      </div>

      <p className="text-[11.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[64ch]">
        You can switch at any time. Eternal Thread carries no analytics, no
        third-party processing. The notes are short, written in the
        mentor's voice, and meant only to keep your threadline coherent.
      </p>
    </div>
  );
}

function DepthCard({
  testid,
  tone,
  selected,
  badge,
  title,
  subtitle,
  icon,
  bullets,
  ctaLabel,
  onClick,
  disabled,
}) {
  // Tone palette pulled from the artifact reference. Kept inline to avoid
  // bleeding new tokens into the global stylesheet.
  const palette =
    tone === "amber"
      ? {
          ring: selected ? "ring-1 ring-[#E0B45A]/70" : "ring-0",
          glow: selected
            ? "shadow-[0_0_0_1px_rgba(224,180,90,0.45),0_0_28px_-8px_rgba(255,193,7,0.55)]"
            : "shadow-[0_0_0_1px_rgba(224,180,90,0.18)]",
          accent: "#E0B45A",
          accentSoft: "rgba(224,180,90,0.10)",
          dot: "bg-[#E0B45A]",
          badgeBg: "bg-[#E0B45A]/15 text-[#E0B45A] border-[#E0B45A]/40",
          buttonBg: selected
            ? "bg-[#E0B45A] text-[#1a1208] hover:bg-[#E5BE6F]"
            : "bg-transparent text-[#E0B45A] border border-[#E0B45A]/60 hover:bg-[#E0B45A]/10",
        }
      : {
          ring: selected ? "ring-1 ring-[#5BA7C4]/70" : "ring-0",
          glow: selected
            ? "shadow-[0_0_0_1px_rgba(91,167,196,0.45),0_0_28px_-8px_rgba(91,167,196,0.45)]"
            : "shadow-[0_0_0_1px_rgba(91,167,196,0.16)]",
          accent: "#5BA7C4",
          accentSoft: "rgba(91,167,196,0.08)",
          dot: "bg-[#5BA7C4]",
          badgeBg: "bg-[#5BA7C4]/15 text-[#5BA7C4] border-[#5BA7C4]/40",
          buttonBg: selected
            ? "bg-[#5BA7C4] text-[#0a1218] hover:bg-[#76B9D3]"
            : "bg-transparent text-[#5BA7C4] border border-[#5BA7C4]/60 hover:bg-[#5BA7C4]/10",
        };

  return (
    <button
      type="button"
      data-testid={testid}
      data-selected={selected ? "true" : "false"}
      onClick={onClick}
      disabled={disabled}
      className={`text-left aurin-card !p-5 rounded-xl transition-all duration-300 ${palette.ring} ${palette.glow} disabled:opacity-60 disabled:cursor-wait hover:translate-y-[-1px]`}
      style={{ background: `linear-gradient(180deg, ${palette.accentSoft}, transparent 65%), hsl(var(--aurin-card))` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2" style={{ color: palette.accent }}>
          {icon}
          <span className="text-[11px] tracking-[0.18em] uppercase opacity-90">
            Depth
          </span>
        </div>
        <span
          className={`text-[10px] font-semibold tracking-[0.16em] px-2 py-[3px] rounded-full border ${palette.badgeBg}`}
          data-testid={`${testid}-badge`}
        >
          {badge}
        </span>
      </div>

      <div className="mb-1">
        <h3 className="text-[18px] font-medium text-[hsl(var(--aurin-text))]">
          {title}
        </h3>
        <p
          className="text-[12px] tracking-[0.04em] mt-[2px]"
          style={{ color: palette.accent }}
        >
          {subtitle}
        </p>
      </div>

      <ul className="mt-3 space-y-1.5" data-testid={`${testid}-bullets`}>
        {bullets.map((b, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]"
          >
            <span
              className={`mt-[7px] inline-block w-[5px] h-[5px] rounded-full ${palette.dot} shrink-0`}
              aria-hidden
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] tracking-[0.10em] uppercase ${
            selected ? "" : "opacity-60"
          }`}
          style={{ color: palette.accent }}
          data-testid={`${testid}-state`}
        >
          {selected ? <Check size={13} aria-hidden /> : null}
          {selected ? "Selected" : "Choose this depth"}
        </span>
        <span
          className={`inline-flex items-center text-[11.5px] font-medium tracking-[0.04em] rounded-full px-3 py-1 transition-colors ${palette.buttonBg}`}
          data-testid={`${testid}-cta`}
        >
          {ctaLabel}
        </span>
      </div>
    </button>
  );
}
