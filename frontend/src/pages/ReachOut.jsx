import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Mail, MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import SocialLinks from "@/components/SocialLinks";

const TOPICS = [
  { value: "general", label: "General" },
  { value: "library", label: "About a library entry" },
  { value: "bookstore", label: "About a book / order" },
  { value: "kids", label: "Kids Universe" },
  { value: "billing", label: "Billing or refund" },
  { value: "technical", label: "Something technical" },
  { value: "other", label: "Something else" },
];

// §SUPPORT-V2 2026-02-09 — Standard problem checklist. Lets a wanderer
// flag the exact situation they're in WITHOUT having to compose a
// long message. Each value maps to a short canned summary that we
// prepend to their free-text message. Anna sees them as structured
// tags in the email subject + body, so triage is fast.
const KNOWN_ISSUES = [
  { value: "voice_no_hear",     label: "The guide doesn't hear my voice" },
  { value: "voice_no_speak",    label: "I can hear them, but my voice doesn't go through" },
  { value: "voice_drops",       label: "The voice session disconnects unexpectedly" },
  { value: "payment_failed",    label: "Payment went through but my access doesn't show" },
  { value: "refund_request",    label: "I would like a refund" },
  { value: "kids_question",     label: "A question about Aurin's room for my child" },
  { value: "delete_data",       label: "I want my account or data deleted" },
  { value: "feature_request",   label: "I have an idea or suggestion" },
];

export default function ReachOut() {
  const [form, setForm] = useState({ name: "", email: "", topic: "general", message: "" });
  const [issues, setIssues] = useState([]); // §SUPPORT-V2 — selected known-issue tags
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [destinationConfigured, setDestinationConfigured] = useState(null);
  const [error, setError] = useState(null);

  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleIssue = (value) => {
    setIssues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // §SUPPORT-V2 — Compose the final message: structured tag list
      // first (so Anna's eye triages instantly), then the wanderer's
      // free-text below. Frontend never assumes Anna's reading order.
      const tagLines = issues
        .map((v) => KNOWN_ISSUES.find((i) => i.value === v)?.label)
        .filter(Boolean)
        .map((l) => `• ${l}`)
        .join("\n");
      const composed = tagLines
        ? `[Reported issues]\n${tagLines}\n\n[Their words]\n${form.message || "(no additional message)"}`
        : form.message;
      const payload = {
        ...form,
        message: composed,
        issue_tags: issues, // backend will store these as a structured array
      };
      const res = await api.post("/reach-out", payload);
      setDestinationConfigured(!!res.data?.destination_configured);
      setSent(true);
    } catch (err) {
      setError("Could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="page-reach-out">
      <PageHeader
        tone="default"
        eyebrow="Reach Out"
        title="A short message,"
        italicWord="and we'll write back."
        description="No long forms. No tickets. Just a quiet way to say something — a question, a thought, or something that didn't work."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="aurin-eyebrow mb-5">Other ways</div>
            <div className="space-y-7">
              <div>
                <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--aurin-text-muted))]">
                  <Mail size={14} /> Email
                </div>
                <a
                  href="mailto:hello@matrix-aurin.test"
                  data-testid="reach-out-email"
                  className="aurin-display text-2xl mt-2 inline-block hover:text-[hsl(var(--aurin-sage))] transition-colors"
                >
                  hello@matrix-aurin.test
                </a>
                <p className="mt-2 text-[13.5px] text-[hsl(var(--aurin-text-muted))]">
                  We answer within two working days. Often sooner.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--aurin-text-muted))]">
                  <MessageCircle size={14} /> The Guardian
                </div>
                <p className="aurin-display text-2xl mt-2">A quiet companion</p>
                <p className="mt-2 text-[13.5px] text-[hsl(var(--aurin-text-muted))] max-w-sm">
                  When it wakes, it will help you find your way through the
                  reading and the steps — and quietly suggest what might come
                  next. For now it is waiting.
                </p>
              </div>

              <div data-testid="reach-out-social">
                <div className="flex items-center gap-2 text-[13px] text-[hsl(var(--aurin-text-muted))] mb-2">
                  Find us elsewhere
                </div>
                <p className="aurin-display text-2xl mt-1 mb-4">@pruesoul.life</p>
                <SocialLinks testidPrefix="reach-out-social" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {!sent ? (
              <form
                onSubmit={handleSubmit}
                className="aurin-card p-8 md:p-10 space-y-5"
                data-testid="reach-out-form"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Your name">
                    <input
                      required
                      value={form.name}
                      onChange={handle("name")}
                      className="reach-input"
                      data-testid="reach-out-name"
                      placeholder="—"
                    />
                  </Field>
                  <Field label="Your email">
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={handle("email")}
                      className="reach-input"
                      data-testid="reach-out-email-field"
                      placeholder="—"
                    />
                  </Field>
                </div>
                <Field label="Topic">
                  <select
                    value={form.topic}
                    onChange={handle("topic")}
                    className="reach-input"
                    data-testid="reach-out-topic"
                  >
                    {TOPICS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </Field>

                {/* §SUPPORT-V2 2026-02-09 — Known-issue checklist.
                    Optional. Lets the wanderer pick one or more
                    common situations without composing a message.
                    Selected items get prepended to the email body
                    as a structured list so Anna triages fast. */}
                <div data-testid="reach-out-known-issues">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))] mb-2">
                    What happened? <span className="normal-case tracking-normal text-[10.5px] opacity-70">(optional, pick any that apply)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {KNOWN_ISSUES.map((issue) => {
                      const checked = issues.includes(issue.value);
                      return (
                        <label
                          key={issue.value}
                          data-testid={`reach-out-issue-${issue.value}`}
                          className={`flex items-start gap-2.5 cursor-pointer select-none text-[13px] leading-snug px-3 py-2 rounded-lg border transition-colors ${
                            checked
                              ? "border-[hsl(var(--aurin-sage))/0.55] bg-[hsl(var(--aurin-sage))/0.07]"
                              : "border-[hsl(var(--aurin-border-soft))] hover:border-[hsl(var(--aurin-sage))/0.35]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleIssue(issue.value)}
                            className="mt-[3px] h-3.5 w-3.5 accent-[hsl(var(--aurin-sage))]"
                          />
                          <span className="text-[hsl(var(--aurin-text))/0.88]">
                            {issue.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <Field label="Message">
                  <textarea
                    required={issues.length === 0}
                    rows={6}
                    value={form.message}
                    onChange={handle("message")}
                    className="reach-input"
                    data-testid="reach-out-message"
                    placeholder={
                      issues.length > 0
                        ? "Add anything else you'd like us to know (optional)…"
                        : "Say what you came to say. Plain words are best."
                    }
                  />
                </Field>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[12px] text-[hsl(var(--aurin-text-muted))] max-w-[36ch]">
                    A real person reads every message. Reply within 24-72h.
                  </p>
                  <button type="submit" data-testid="reach-out-submit" disabled={submitting} className="aurin-btn aurin-btn-primary disabled:opacity-60">
                    {submitting ? "Sending…" : "Send"} <ArrowRight size={14} />
                  </button>
                </div>
                {error && (
                  <div data-testid="reach-out-error" className="text-[13px] text-red-300/90 mt-2">{error}</div>
                )}
              </form>
            ) : (
              <div
                data-testid="reach-out-sent"
                className="aurin-card p-10 flex flex-col items-start gap-4"
              >
                <CheckCircle2 className="text-[hsl(var(--aurin-sage))]" size={22} />
                <h3 className="aurin-display text-3xl">Received, in spirit.</h3>
                <p className="text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))] max-w-[52ch]">
                  Your message has been received. A real person will read it and reply within 24-72 hours. {destinationConfigured
                    ? "If it was something urgent, please also write to the email above."
                    : ""}
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", topic: "general", message: "" });
                    setIssues([]);
                  }}
                  className="aurin-btn aurin-btn-ghost mt-2"
                  data-testid="reach-out-reset"
                >
                  Send another
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .reach-input {
          width: 100%;
          background: hsl(var(--aurin-bg));
          border: 1px solid hsl(var(--aurin-border-soft));
          color: hsl(var(--aurin-text));
          border-radius: 10px;
          padding: 0.7rem 0.9rem;
          font-size: 14px;
          outline: none;
          transition: border-color 200ms ease;
        }
        .reach-input:focus { border-color: hsl(var(--aurin-sage)); }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))] mb-2">
        {label}
      </div>
      {children}
    </label>
  );
}
