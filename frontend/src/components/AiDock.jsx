import { useState } from "react";
import { Sparkles, X, Send, Info } from "lucide-react";
import { aiChat } from "@/lib/api";

/**
 * AiDock — a calm, on-brand placeholder for the future AI companion.
 * It is intentionally non-functional: the button sends to an /api/ai/chat
 * stub that returns an honest "not yet active" message.
 */
export default function AiDock() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await aiChat(message.trim());
      setReply(res.reply || "");
    } catch {
      setReply("The companion could not be reached. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed bottom-6 left-6 z-[60] pointer-events-none"
      data-testid="ai-dock"
    >
      {!open && (
        <button
          data-testid="ai-dock-open"
          onClick={() => setOpen(true)}
          className="pointer-events-auto group flex items-center gap-2.5 rounded-full pl-3 pr-4 py-2.5 border border-[hsl(var(--aurin-border))] bg-[hsl(var(--aurin-surface))/0.85] backdrop-blur-xl text-[13px] text-[hsl(var(--aurin-text))] hover:border-[hsl(var(--aurin-sage))] hover:text-[hsl(var(--aurin-sage))] transition-colors"
          style={{ backgroundColor: "hsla(140, 10%, 8%, 0.8)" }}
        >
          <span className="relative inline-flex items-center justify-center w-6 h-6 rounded-full border border-[hsl(var(--aurin-border))]">
            <Sparkles size={12} strokeWidth={1.5} />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--aurin-sage))]" />
          </span>
          <span>The Guardian</span>
          <span className="text-[10.5px] italic text-[hsl(var(--aurin-text-muted))]/70 group-hover:text-[hsl(var(--aurin-sage))]/60">
            · coming later
          </span>
        </button>
      )}

      {open && (
        <div
          data-testid="ai-dock-panel"
          className="pointer-events-auto w-[360px] max-w-[92vw] rounded-2xl border border-[hsl(var(--aurin-border))] shadow-2xl overflow-hidden"
          style={{ backgroundColor: "hsla(140, 10%, 8%, 0.96)" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--aurin-border-soft))]">
            <div className="flex items-center gap-2.5">
              <span className="relative inline-flex items-center justify-center w-6 h-6 rounded-full border border-[hsl(var(--aurin-border))]">
                <Sparkles size={12} strokeWidth={1.5} />
              </span>
              <div>
                <div className="text-[13.5px] aurin-display">The Guardian</div>
                <div className="text-[10.5px] uppercase tracking-[0.2em] text-[hsl(var(--aurin-text-muted))]">
                  Prepared · Not yet active
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-text))]"
              aria-label="Close companion"
              data-testid="ai-dock-close"
            >
              <X size={15} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex gap-3 text-[13px] text-[hsl(var(--aurin-text-muted))] leading-relaxed">
              <Info size={14} className="mt-0.5 shrink-0 text-[hsl(var(--aurin-sage))]" />
              <p>
                When this opens, the companion will reply only from the
                writings here, in the same quiet voice. Nothing is sent
                anywhere yet.
              </p>
            </div>

            <form onSubmit={handleSend} className="space-y-3">
              <textarea
                data-testid="ai-dock-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask something quiet…"
                rows={3}
                className="w-full resize-none rounded-xl bg-[hsl(var(--aurin-bg))] border border-[hsl(var(--aurin-border-soft))] px-4 py-3 text-[13.5px] outline-none focus:border-[hsl(var(--aurin-sage))] transition-colors placeholder:text-[hsl(var(--aurin-text-muted))]"
              />
              <button
                type="submit"
                data-testid="ai-dock-send"
                disabled={sending}
                className="aurin-btn aurin-btn-ghost w-full disabled:opacity-60"
              >
                {sending ? "Sending…" : "Send"}
                <Send size={13} />
              </button>
            </form>

            {reply && (
              <div
                data-testid="ai-dock-reply"
                className="rounded-xl border border-[hsl(var(--aurin-border-soft))] bg-[hsl(var(--aurin-bg))] p-4 text-[13.5px] leading-relaxed text-[hsl(var(--aurin-text))/0.92]"
              >
                {reply}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
