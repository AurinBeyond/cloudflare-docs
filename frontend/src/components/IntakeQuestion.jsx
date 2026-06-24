/**
 * IntakeQuestion.jsx — "What brought you here today?"
 *
 * One question. Six options. Optional sentence. Built 2026-06-25 for
 * the Substack soft-launch test window — the goal is to learn the real
 * sentences people are carrying when they arrive, before we lock any
 * prices.
 *
 * Brand lock: no marketing punch, no "your answer matters!", no
 * progress bars. A calm card with the same brass/cream palette as
 * the rest of Aurin. If the visitor ignores it, it stays quiet.
 *
 * Usage:
 *   <IntakeQuestion path="/grace/intro" />
 *
 * Renders nothing once the visitor has already answered in this
 * browser session.
 */
import React, { useState, useEffect } from "react";
import { submitIntake } from "../lib/track";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const BRASS = "#c4a46b";
const CREAM = "#f0eadd";
const SOFT = "#bcb4a3";
const MUTED = "#a59f93";
const GREY = "#7a7468";
const EDGE = "rgba(196,164,107,0.28)";
const STORAGE_KEY = "aurin.intake.answered.v1";

const OPTIONS = [
  { key: "i_need_a_quieter_evening",          label: "I need a quieter evening." },
  { key: "family_life_feels_complicated",     label: "Family life feels complicated." },
  { key: "i_need_clarity_about_something",    label: "I need clarity about something." },
  { key: "i_feel_disconnected_from_myself",   label: "I feel disconnected from myself." },
  { key: "looking_for_something_for_my_child", label: "I am looking for something for my child." },
  { key: "just_curious",                       label: "I am just curious." },
];

export default function IntakeQuestion({ path }) {
  const [answered, setAnswered] = useState(() => {
    try { return Boolean(localStorage.getItem(STORAGE_KEY)); } catch { return false; }
  });
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) {
      try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* private mode */ }
    }
  }, [done]);

  if (answered) return null;

  async function onSubmit(option) {
    if (submitting) return;
    setSubmitting(true);
    setSelected(option.key);
    const r = await submitIntake({ answer: option.key, path, note });
    setSubmitting(false);
    if (r.ok) {
      setDone(true);
      // Hide after a short pause so the visitor can read the
      // closing line. Keep this gentle, no auto-redirect.
      setTimeout(() => setAnswered(true), 4000);
    } else {
      // Quiet failure — keep the form usable
      setSelected(null);
    }
  }

  if (done) {
    return (
      <section
        data-testid="intake-thanks"
        className="w-full py-16 px-6 sm:px-10"
        style={{ background: "transparent" }}
      >
        <div
          className="max-w-[640px] mx-auto text-center border p-10"
          style={{ borderColor: EDGE, background: "rgba(18,16,13,0.62)" }}
        >
          <p
            className="text-[11px] tracking-[0.42em] uppercase mb-6"
            style={{ color: BRASS }}
          >
            — Received, with care
          </p>
          <p
            className="text-[20px] sm:text-[22px] leading-[1.7] italic font-light"
            style={{ fontFamily: SERIF, color: CREAM }}
          >
            Thank you for telling us why you came.<br />
            We are listening, and we will write back when the doors open.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      data-testid="intake-question"
      className="w-full py-20 px-6 sm:px-10"
      style={{ background: "transparent" }}
    >
      <div
        className="max-w-[720px] mx-auto border p-9 sm:p-11"
        style={{ borderColor: EDGE, background: "rgba(18,16,13,0.62)" }}
      >
        <p
          className="text-[10.5px] tracking-[0.42em] uppercase mb-6 text-center"
          style={{ color: BRASS }}
        >
          — One quiet question
        </p>
        <h3
          className="text-[26px] sm:text-[32px] leading-[1.18] font-light text-center mb-3"
          style={{ fontFamily: SERIF, color: CREAM }}
          data-testid="intake-headline"
        >
          What brought you here today?
        </h3>
        <p
          className="text-[13px] italic text-center mb-9 leading-[1.7] font-light"
          style={{ fontFamily: SERIF, color: MUTED }}
        >
          Choose the sentence that feels closest. Nothing is required —
          this only helps us know what these rooms are for.
        </p>

        <ul className="space-y-3">
          {OPTIONS.map((opt) => {
            const isActive = selected === opt.key;
            return (
              <li key={opt.key}>
                <button
                  type="button"
                  data-testid={`intake-option-${opt.key}`}
                  disabled={submitting}
                  onClick={() => onSubmit(opt)}
                  className={`w-full text-left px-5 py-4 border transition-colors duration-500 ${
                    isActive
                      ? "bg-[rgba(196,164,107,0.16)] border-[#c4a46b]"
                      : "border-[rgba(196,164,107,0.22)] hover:border-[#c4a46b] hover:bg-[rgba(196,164,107,0.06)]"
                  } ${submitting ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
                  style={{
                    fontFamily: SERIF,
                    color: isActive ? CREAM : SOFT,
                    fontSize: "16px",
                    lineHeight: 1.55,
                    fontStyle: "italic",
                    background: "transparent",
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-7">
          <label
            htmlFor="intake-note"
            className="block text-[10.5px] tracking-[0.32em] uppercase mb-3"
            style={{ color: GREY }}
          >
            Or, in your own words (optional)
          </label>
          <textarea
            id="intake-note"
            data-testid="intake-note"
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 400))}
            placeholder="Write a sentence, if you would like to."
            rows={2}
            className="w-full border bg-transparent px-4 py-3 outline-none font-light"
            style={{
              fontFamily: SERIF,
              fontSize: "15px",
              lineHeight: 1.6,
              borderColor: "rgba(196,164,107,0.22)",
              color: CREAM,
            }}
          />
          <p
            className="mt-3 text-[10.5px] tracking-[0.28em] uppercase text-right"
            style={{ color: GREY }}
          >
            {note.length}/400
          </p>
        </div>

        <p
          className="mt-6 text-[11px] tracking-[0.28em] uppercase text-center"
          style={{ color: GREY }}
          data-testid="intake-privacy"
        >
          No name · no email · stored privately
        </p>
      </div>
    </section>
  );
}
