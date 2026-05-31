/**
 * HearthFunnelOptIn.jsx — quiet email opt-in for the 3-letter
 * Hearth sequence. Used on /listen/hearth/* pages, below the audio
 * player and above the "keep the lantern lit" line.
 *
 * §HEARTH-FUNNEL 2026-05-31 — anti-marketing UX rules:
 *   - NO modal popup
 *   - NO countdown / urgency / "limited spots"
 *   - NO required marketing checkbox
 *   - One field, one button, one promise.
 *   - Success state replaces form silently (no toast, no confetti).
 */
import { useState } from "react";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function HearthFunnelOptIn({ source = "listen/hearth" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMsg("That doesn't look like an email.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(`${BACKEND}/api/hearth-funnel/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), source }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.ok) throw new Error("server said no");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg("The door didn't open — try again in a moment.");
    }
  };

  if (status === "sent") {
    return (
      <div
        className="text-center mt-12 mb-4"
        data-testid="hearth-funnel-success"
      >
        <p
          className="text-sm italic"
          style={{
            color: "#d6a560",
            maxWidth: 440,
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.7,
          }}
        >
          The first story is on its way to your inbox.
          <br />
          The second arrives quietly tomorrow.
        </p>
      </div>
    );
  }

  return (
    <div
      className="mt-12 mb-2 px-2 md:px-4"
      data-testid="hearth-funnel-form"
    >
      <p
        className="text-center italic text-sm mb-4"
        style={{ color: "#9c8a64", maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}
      >
        If you'd like the next story sent quietly tomorrow,
        <br />
        leave one email. No newsletter. No app. Three letters total, then I stop.
      </p>
      <form
        onSubmit={submit}
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      >
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "sending"}
          placeholder="your email"
          data-testid="hearth-funnel-email-input"
          className="flex-1 px-5 py-3 rounded-full text-sm"
          style={{
            background: "rgba(20, 26, 32, 0.7)",
            color: "#e8dcc0",
            border: "1px solid rgba(214, 165, 96, 0.32)",
            outline: "none",
            fontFamily: "inherit",
            letterSpacing: "0.02em",
          }}
        />
        <button
          type="submit"
          disabled={status === "sending"}
          data-testid="hearth-funnel-submit-button"
          className="px-7 py-3 rounded-full text-sm transition-opacity hover:opacity-90"
          style={{
            background: "#d6a560",
            color: "#0f1418",
            fontWeight: 600,
            letterSpacing: "0.04em",
            border: "none",
            cursor: status === "sending" ? "wait" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {status === "sending" ? "opening..." : "open the door"}
        </button>
      </form>
      {status === "error" && (
        <p
          className="text-center text-xs italic mt-3"
          style={{ color: "#a07050" }}
          data-testid="hearth-funnel-error"
        >
          {errorMsg}
        </p>
      )}
    </div>
  );
}
