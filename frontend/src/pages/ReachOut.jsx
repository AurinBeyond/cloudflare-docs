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
  { value: "other", label: "Something else" },
];

export default function ReachOut() {
  const [form, setForm] = useState({ name: "", email: "", topic: "general", message: "" });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [destinationConfigured, setDestinationConfigured] = useState(null);
  const [error, setError] = useState(null);

  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post("/reach-out", form);
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
        eyebrow="Reach Out · A Direct Line"
        title="A short message,"
        italicWord="and we'll write back."
        description="No long forms, no tickets. Just a quiet way to say something — a question, a thought, or a problem with the system."
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
                <p className="aurin-display text-2xl mt-2">For navigation help</p>
                <p className="mt-2 text-[13.5px] text-[hsl(var(--aurin-text-muted))] max-w-sm">
                  When the AI companion is active, it can guide you through the
                  Library, suggest the next protocol, or summarise an entry.
                  For now it is prepared, not on.
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
                <Field label="Message">
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={handle("message")}
                    className="reach-input"
                    data-testid="reach-out-message"
                    placeholder="Say what you came to say. Plain words are best."
                  />
                </Field>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[12px] text-[hsl(var(--aurin-text-muted))] max-w-[36ch]">
                    Messages are stored. Email forwarding turns on once
                    REACH_OUT_EMAIL is configured.
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
                  Your message has been received. {destinationConfigured
                    ? "It will be forwarded shortly."
                    : "Email forwarding is not yet configured — once REACH_OUT_EMAIL is set, messages route automatically. Until then, please use the email above for anything urgent."}
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", topic: "general", message: "" });
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
