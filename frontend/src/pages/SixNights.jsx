import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

const API = process.env.REACT_APP_BACKEND_URL;

function NightCard({ n, onOpen }) {
  return (
    <button
      type="button"
      data-testid={`six-nights-card-${n.night_number}`}
      onClick={() => onOpen(n.night_number)}
      className="group text-left aurin-card p-7 md:p-9 border border-[hsl(var(--aurin-border-soft))] hover:border-[hsl(var(--aurin-sage))/0.5] transition-all duration-500 bg-transparent"
    >
      <div className="aurin-eyebrow text-[hsl(var(--aurin-sage))/0.85] mb-4">
        Night {String(n.night_number).padStart(2, "0")}
      </div>
      <h3 className="aurin-display text-2xl md:text-3xl text-[hsl(var(--aurin-text))] leading-tight mb-4">
        {n.title}
      </h3>
      <p className="text-[15px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
        {n.intro}
      </p>
      <div className="mt-6 inline-flex items-center gap-2 text-[13px] tracking-wide text-[hsl(var(--aurin-sage))] opacity-0 group-hover:opacity-100 transition-opacity">
        Step inside <ArrowRight size={14} />
      </div>
    </button>
  );
}

function NightReader({ night, onBack, onNav }) {
  if (!night) return null;
  // body_markdown uses *italic* + paragraph breaks; render minimally without external libs.
  const paragraphs = (night.body_markdown || "").split(/\n\n+/);
  return (
    <article
      data-testid="six-nights-reader"
      className="max-w-2xl mx-auto"
    >
      <button
        type="button"
        data-testid="six-nights-back"
        onClick={onBack}
        className="aurin-link text-[13px] inline-flex items-center gap-2 mb-10"
      >
        <ArrowLeft size={14} /> All six nights
      </button>

      <div className="aurin-eyebrow text-[hsl(var(--aurin-sage))/0.85] mb-4">
        Night {String(night.night_number).padStart(2, "0")} · of six
      </div>

      <h1
        data-testid="six-nights-title"
        className="aurin-display text-3xl md:text-5xl leading-tight mb-6 text-[hsl(var(--aurin-text))]"
      >
        {night.title}
      </h1>

      <p className="aurin-serif-italic text-lg md:text-xl text-[hsl(var(--aurin-sage))] mb-12 leading-relaxed">
        {night.intro}
      </p>

      <div
        data-testid="six-nights-body"
        className="space-y-6 text-[17px] md:text-[18px] leading-[1.85] text-[hsl(var(--aurin-text))/0.92]"
      >
        {paragraphs.map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: renderInline(p) }} />
        ))}
      </div>

      <div className="my-16 border-t border-[hsl(var(--aurin-border-soft))]" />

      <div className="aurin-eyebrow text-[hsl(var(--aurin-sage))/0.85] mb-4">
        One quiet question
      </div>
      <p
        data-testid="six-nights-question"
        className="aurin-display text-2xl md:text-3xl leading-snug text-[hsl(var(--aurin-text))] mb-12"
      >
        {night.question}
      </p>

      <p
        data-testid="six-nights-closing"
        className="text-[15px] leading-relaxed text-[hsl(var(--aurin-text-muted))] aurin-serif-italic"
      >
        {night.closing_note}
      </p>

      <div className="mt-12 text-[13px] uppercase tracking-[0.32em] text-[hsl(var(--aurin-sage))/0.7]">
        — {night.signature}
      </div>

      <div className="mt-20 flex items-center justify-between text-[13px] tracking-wide">
        <button
          type="button"
          data-testid="six-nights-prev"
          disabled={!night.has_previous}
          onClick={() => onNav(night.night_number - 1)}
          className="inline-flex items-center gap-2 text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-sage))] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft size={14} /> Previous night
        </button>
        <button
          type="button"
          data-testid="six-nights-next"
          disabled={!night.has_next}
          onClick={() => onNav(night.night_number + 1)}
          className="inline-flex items-center gap-2 text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-sage))] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next night <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}

// Minimal inline markdown: *italic* + **bold** only.
function renderInline(text) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[hsl(var(--aurin-text))]">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="aurin-serif-italic text-[hsl(var(--aurin-sage))]">$1</em>');
}

function SubscribeCard() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState("idle"); // idle|sending|done|error|already
  const [message, setMessage] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    if (!consent || !email) return;
    setState("sending");
    setMessage(null);
    try {
      const r = await fetch(`${API}/api/six-nights/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), consent: true }),
      });
      const d = await r.json();
      if (!r.ok) {
        setState("error");
        setMessage(d?.detail || "Something is quiet on our side. Try again in a breath.");
        return;
      }
      if (d.status === "already_subscribed") {
        setState("already");
        setMessage("You are already on this path. The next night arrives in its time.");
      } else {
        setState("done");
        setMessage(d.preamble || "Six nights, one per day, on their way.");
      }
    } catch {
      setState("error");
      setMessage("The line is quiet just now. Try again in a breath.");
    }
  }

  if (state === "done" || state === "already") {
    return (
      <div
        data-testid="six-nights-subscribe-success"
        className="mt-16 max-w-md mx-auto aurin-card p-8 text-center border border-[hsl(var(--aurin-sage))/0.4]"
      >
        <p className="aurin-serif-italic text-[hsl(var(--aurin-sage))] text-[15px] leading-relaxed">
          {message}
        </p>
      </div>
    );
  }

  return (
    <form
      data-testid="six-nights-subscribe-form"
      onSubmit={onSubmit}
      className="mt-20 max-w-md mx-auto aurin-card p-8 border border-[hsl(var(--aurin-border-soft))]"
    >
      <div className="aurin-eyebrow text-[hsl(var(--aurin-sage))/0.85] mb-3">
        If reading one a day suits you
      </div>
      <h3 className="aurin-display text-2xl leading-tight mb-3 text-[hsl(var(--aurin-text))]">
        Receive the six nights, one per evening.
      </h3>
      <p className="text-[14px] leading-relaxed text-[hsl(var(--aurin-text-muted))] mb-5">
        Six quiet emails, one per day. Reply at any time to stop. Nothing is
        sold inside the messages.
      </p>
      <input
        type="email"
        required
        placeholder="your email"
        data-testid="six-nights-subscribe-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-md bg-transparent border border-[hsl(var(--aurin-border))] text-[hsl(var(--aurin-text))] focus:border-[hsl(var(--aurin-sage))] focus:outline-none mb-4 text-[14px]"
      />
      <label className="flex items-start gap-3 mb-5 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          data-testid="six-nights-subscribe-consent"
          className="mt-1 w-4 h-4 accent-[hsl(var(--aurin-sage))]"
        />
        <span className="text-[13px] leading-relaxed text-[hsl(var(--aurin-text))/0.85]">
          I'd like to receive these six nights by email and understand I can
          reply to stop at any time.
        </span>
      </label>
      <button
        type="submit"
        data-testid="six-nights-subscribe-submit"
        disabled={!consent || !email || state === "sending"}
        className="aurin-btn aurin-btn-ghost disabled:opacity-30 disabled:cursor-not-allowed w-full"
      >
        {state === "sending" ? "One breath…" : "Begin the six nights by email"}
      </button>
      {state === "error" && message && (
        <p
          data-testid="six-nights-subscribe-error"
          className="mt-4 text-[13px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))]"
        >
          {message}
        </p>
      )}
    </form>
  );
}

export default function SixNights() {
  const { nightId } = useParams();
  const navigate = useNavigate();
  const [index, setIndex] = useState(null);
  const [night, setNight] = useState(null);
  const [error, setError] = useState(null);

  const wantNumber = nightId ? parseInt(nightId, 10) : null;

  useEffect(() => {
    let cancelled = false;
    async function loadIndex() {
      try {
        const r = await fetch(`${API}/api/six-nights`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        if (!cancelled) setIndex(d);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    }
    loadIndex();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!wantNumber) {
      setNight(null);
      return;
    }
    async function loadOne() {
      try {
        const r = await fetch(`${API}/api/six-nights/${wantNumber}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        if (!cancelled) {
          setNight(d);
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    }
    loadOne();
    return () => {
      cancelled = true;
    };
  }, [wantNumber]);

  return (
    <main data-testid="six-nights-page" className="min-h-screen">
      {!wantNumber && (
        <>
          <PageHeader
            eyebrow="Six Nights"
            title="A small, quiet path home."
            intro="Six evenings. One question each. Read one, sit with it, leave the rest for tomorrow. Nothing here is timed, nothing here is graded, and no one is watching."
          />
          <section
            data-testid="six-nights-grid"
            className="aurin-container pb-24 md:pb-32"
          >
            {!index && !error && (
              <p className="text-[hsl(var(--aurin-text-muted))]">Quiet. Loading.</p>
            )}
            {error && (
              <p className="text-[hsl(var(--aurin-text-muted))]">
                The nights are not reachable just now. Try again in a breath.
              </p>
            )}
            {index?.nights?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {index.nights.map((n) => (
                  <NightCard
                    key={n.night_number}
                    n={n}
                    onOpen={(num) => navigate(`/six-nights/${num}`)}
                  />
                ))}
              </div>
            )}
            <p className="mt-16 text-center text-[14px] aurin-serif-italic text-[hsl(var(--aurin-sage))]">
              {index?.preamble}
            </p>

            {/* Six-night email drip — voluntary opt-in */}
            <SubscribeCard />
          </section>
        </>
      )}

      {wantNumber && (
        <section className="aurin-container py-20 md:py-28">
          {error && (
            <p className="text-[hsl(var(--aurin-text-muted))]">
              That night is not present. <Link to="/six-nights">Return to all six.</Link>
            </p>
          )}
          {night && (
            <NightReader
              night={night}
              onBack={() => navigate("/six-nights")}
              onNav={(num) => navigate(`/six-nights/${num}`)}
            />
          )}
        </section>
      )}
    </main>
  );
}
