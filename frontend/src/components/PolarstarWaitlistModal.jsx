/**
 * PolarstarWaitlistModal.jsx — Quiet, PSP-safe interest form.
 *
 * §POLARSTAR 2026-02-13 — Preview-mode only. Submits to
 * `/api/waitlist/polarstar` which stores the entry in MongoDB.
 * NO purchase, NO checkout, NO mention of AI. We collect only what
 * the parent willingly offers.
 */
import { useEffect, useState } from "react";
import { X, Sparkles, Check } from "lucide-react";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

const AGE_GROUP_OPTIONS = [
  { value: "",            label: "All paths · I'll choose later" },
  { value: "discovery",   label: "Discovery · 4–6 years" },
  { value: "exploration", label: "Exploration · 7–10 years" },
  { value: "creation",    label: "Creation · 11–13 years" },
];

const ZONE_TO_AGE = {
  discovery: "discovery",
  exploration: "exploration",
  creation: "creation",
};

export default function PolarstarWaitlistModal({ isOpen, onClose, context, mode = "night" }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // If the user clicked a Coming-Soon zone we can pre-fill a friendly note.
  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setDone(false);
    if (context?.zone && ZONE_TO_AGE[context.zone]) {
      setAgeGroup(ZONE_TO_AGE[context.zone]);
    }
    if (context?.label) {
      setNote((prev) => prev || `Interested in: ${context.label}`);
    }
  }, [isOpen, context]);

  // Esc to close
  useEffect(() => {
    if (!isOpen) return undefined;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.split("@")[1]?.includes(".")) {
      setError("Please share a valid email so we can let you know.");
      return;
    }
    if (!consent) {
      setError("We need your consent to keep your email.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/waitlist/polarstar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          name: name.trim() || null,
          age_group: ageGroup || null,
          note: note.trim() || null,
          consent: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Could not save — please try again.");
      }
      setDone(true);
    } catch (err) {
      setError(err.message || "Something went quiet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isDay = mode === "day" || mode === "morning";
  const toneClass = isDay ? "ps9-modal--light" : "ps9-modal--dark";

  return (
    <div
      className="ps9-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="polarstar-waitlist-title"
      data-testid="polarstar-waitlist-modal"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`ps9-modal ${toneClass}`}>
        <button
          type="button"
          className="ps9-modal-close"
          onClick={onClose}
          aria-label="Close"
          data-testid="polarstar-waitlist-close"
        >
          <X size={18} />
        </button>

        {done ? (
          <div className="ps9-modal-done" data-testid="polarstar-waitlist-done">
            <span className="ps9-modal-done-icon" aria-hidden="true">
              <Check size={22} />
            </span>
            <h2 id="polarstar-waitlist-title" className="ps9-modal-title" style={{ fontFamily: SERIF }}>
              Your name is <span className="ps9-italic">in the world</span>.
            </h2>
            <p className="ps9-modal-body" style={{ fontFamily: SERIF }}>
              When the first lantern is fully lit, we&apos;ll send you a quiet note.
              No urgency. No ladder. Just one calm letter.
            </p>
            <button
              type="button"
              className="ps9-modal-primary"
              onClick={onClose}
              data-testid="polarstar-waitlist-done-close"
              style={{ fontFamily: SERIF }}
            >
              Return to the world
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="ps9-modal-form" data-testid="polarstar-waitlist-form">
            <span className="ps9-modal-eyebrow">
              <Sparkles size={12} aria-hidden="true" />
              <span>POLARSTAR · EXPLORER LIST</span>
            </span>
            <h2 id="polarstar-waitlist-title" className="ps9-modal-title" style={{ fontFamily: SERIF }}>
              Be the first to <span className="ps9-italic">walk this world</span>.
            </h2>
            <p className="ps9-modal-body" style={{ fontFamily: SERIF }}>
              Polarstar Kids is still a preview. Leave your name and we&apos;ll
              tell you — quietly — when each path opens for your family.
            </p>

            <label className="ps9-modal-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                required
                data-testid="polarstar-waitlist-email"
              />
            </label>

            <label className="ps9-modal-field">
              <span>Name <em>(optional)</em></span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What may we call you?"
                autoComplete="name"
                data-testid="polarstar-waitlist-name"
              />
            </label>

            <label className="ps9-modal-field">
              <span>Which path matters most?</span>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                data-testid="polarstar-waitlist-age"
              >
                {AGE_GROUP_OPTIONS.map((opt) => (
                  <option key={opt.value || "any"} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>

            <label className="ps9-modal-field">
              <span>Anything to share? <em>(optional)</em></span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={400}
                placeholder="Tell us what you&apos;re hoping for…"
                data-testid="polarstar-waitlist-note"
              />
            </label>

            <label className="ps9-modal-consent" data-testid="polarstar-waitlist-consent-label">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                data-testid="polarstar-waitlist-consent"
              />
              <span>
                I&apos;m happy for you to keep this email safely, only for sending one quiet note when Polarstar opens.
              </span>
            </label>

            {error && (
              <p className="ps9-modal-error" role="alert" data-testid="polarstar-waitlist-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="ps9-modal-primary"
              disabled={submitting}
              data-testid="polarstar-waitlist-submit"
              style={{ fontFamily: SERIF }}
            >
              {submitting ? "Saving…" : "Add me to the Explorer List"}
            </button>

            <p className="ps9-modal-fine" data-testid="polarstar-waitlist-fine">
              No payment. No subscription. We will not share your email.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
