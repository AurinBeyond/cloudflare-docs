import { useState } from "react";
import { Mail, Check } from "lucide-react";
import { subscribeNewsletter } from "@/lib/api";

/**
 * Quiet email capture. Stores the address in MongoDB with explicit
 * consent. Used at the bottom of blog posts and other free-side pages.
 *
 * Props:
 *  - source: short string describing where the signup came from
 *            (e.g., "blog:mirror-of-our-souls")
 *  - eyebrow: optional eyebrow line
 *  - title: optional title (we keep one default that suits the brand)
 */
export default function NewsletterSignup({
  source = "free-side",
  eyebrow = "Stay close",
  title = "Join the prulesoul community for more insights.",
  testidPrefix = "newsletter",
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError("Please confirm you'd like us to write to you.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    setBusy(true);
    try {
      await subscribeNewsletter(email.trim(), source);
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.detail || "Something didn't land. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div
        className="aurin-card p-7 flex items-center gap-3"
        data-testid={`${testidPrefix}-thanks`}
      >
        <Check size={16} className="text-[hsl(var(--aurin-sage))]" />
        <p className="text-[14px] text-[hsl(var(--aurin-text))/0.92]">
          You're in. We'll write only when something is worth your quiet.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      data-testid={`${testidPrefix}-form`}
      className="aurin-card p-7 md:p-8 space-y-5"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full border border-[hsl(var(--aurin-border))] flex items-center justify-center text-[hsl(var(--aurin-sage))] shrink-0">
          <Mail size={16} strokeWidth={1.4} />
        </div>
        <div>
          <div className="aurin-eyebrow !mb-1">{eyebrow}</div>
          <h3 className="aurin-display text-xl md:text-2xl leading-tight">{title}</h3>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          data-testid={`${testidPrefix}-email`}
          className="flex-1 bg-[hsl(var(--aurin-bg))] border border-[hsl(var(--aurin-border-soft))] rounded-xl px-4 py-3 text-[14.5px] focus:border-[hsl(var(--aurin-sage))] outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={busy}
          data-testid={`${testidPrefix}-submit`}
          className="aurin-btn aurin-btn-primary disabled:opacity-60"
        >
          {busy ? "A moment…" : "Subscribe"}
        </button>
      </div>

      <label
        className="flex items-start gap-2.5 text-[12px] text-[hsl(var(--aurin-text-muted))] leading-relaxed select-none cursor-pointer"
        data-testid={`${testidPrefix}-consent`}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 accent-[hsl(var(--aurin-sage))]"
        />
        <span>
          By subscribing you agree we may send occasional updates. You can opt out
          at any time. Your address is stored securely using industry-standard
          protection.
        </span>
      </label>

      {error && (
        <div data-testid={`${testidPrefix}-error`} className="text-[13px] text-red-300/90">
          {error}
        </div>
      )}
    </form>
  );
}
