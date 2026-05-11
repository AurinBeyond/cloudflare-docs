import { useEffect, useState, useCallback } from "react";
import { fetchChatUsage } from "@/lib/api";

/**
 * ChatUsageHint — a quiet, calm "X of N today" indicator.
 *
 * Reads /api/chat/usage. Renders nothing when:
 *   - the user is unauthenticated
 *   - the tier is admin (unlimited)
 *   - the API returns null (network down — never break the room)
 *
 * `refreshKey` can be incremented by the parent after each accepted
 * chat turn so the hint updates without polling.
 */
export default function ChatUsageHint({ refreshKey = 0, className = "" }) {
  const [usage, setUsage] = useState(null);

  const load = useCallback(async () => {
    const data = await fetchChatUsage();
    setUsage(data);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (!usage) return null;
  if (usage.ceiling === null || usage.ceiling === undefined) return null;

  const used = Number(usage.used) || 0;
  const ceiling = Number(usage.ceiling) || 0;
  const remaining = Math.max(0, ceiling - used);
  const tone =
    remaining === 0
      ? "rest"
      : remaining <= Math.max(2, Math.floor(ceiling * 0.2))
      ? "soft"
      : "calm";

  let label;
  if (remaining === 0) {
    label = "The room is resting today.";
  } else if (tone === "soft") {
    label = `${remaining} quiet ${remaining === 1 ? "reply" : "replies"} remaining today.`;
  } else {
    label = `${used} of ${ceiling} today.`;
  }

  return (
    <span
      data-testid="chat-usage-hint"
      data-tone={tone}
      data-tier={usage.tier || "free"}
      className={`text-[11.5px] tracking-[0.04em] text-[hsl(var(--aurin-text-muted))/0.85] ${className}`}
      title={`Daily quiet limit: ${ceiling}. Resets at UTC midnight.`}
    >
      {label}
    </span>
  );
}
