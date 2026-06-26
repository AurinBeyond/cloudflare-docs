/**
 * RoomIntroCard.jsx — § ROOM INTRO 2026-02
 *
 * Inbound-style "selguse kaart" mounted directly under every room
 * hero. NOT a sales card, NOT a checkout. Five plain answers:
 *  - For whom?
 *  - What this room is
 *  - What you will actually find
 *  - What this room is NOT
 *  - One free thing to try right now
 *
 * Plus a single reflection question and three further-reading paths.
 *
 * Founder mandate (2026-02, Estonian): the visitor must understand
 * within ten seconds where they are, what they get, and what they
 * are NOT being sold. No "house / holy / sacred" vocabulary.
 *
 * Usage:
 *   import { getRoomIntro } from "@/data/roomIntros";
 *   import RoomIntroCard from "@/components/RoomIntroCard";
 *   <RoomIntroCard roomId="grace" />
 */
import { getRoomIntro } from "@/data/roomIntros";
import { ArrowRight, BookOpen, X, Check } from "lucide-react";

export default function RoomIntroCard({ roomId }) {
  const intro = getRoomIntro(roomId);
  if (!intro) return null;

  const testidRoot = `room-intro-${roomId}`;

  return (
    <section
      data-testid={testidRoot}
      className="w-full py-12 md:py-16 relative"
      style={{
        background: "#f5ebd5",
        borderTop: "1px solid rgba(196, 156, 80, 0.18)",
        borderBottom: "1px solid rgba(196, 156, 80, 0.18)",
      }}
    >
      <div className="max-w-[1080px] mx-auto px-5 md:px-8">
        {/* Eyebrow + headline */}
        <header className="mb-9 md:mb-12">
          <p
            className="text-[11px] tracking-[0.28em] uppercase mb-3"
            style={{ color: "#a08a5e", letterSpacing: "0.28em" }}
            data-testid={`${testidRoot}-eyebrow`}
          >
            {intro.eyebrow}
          </p>
          <h2
            className="text-2xl md:text-3xl leading-snug"
            style={{
              fontFamily: '"Cormorant Garamond", "EB Garamond", Georgia, serif',
              color: "#3d2e15",
              fontWeight: 400,
            }}
            data-testid={`${testidRoot}-headline`}
          >
            {intro.headline}
          </h2>
        </header>

        {/* Asymmetric two-column body */}
        <div className="grid md:grid-cols-[1.15fr_1fr] gap-10 md:gap-14">
          {/* Left column — For whom + What it is + What you'll find */}
          <div className="space-y-9">
            {/* For whom */}
            <div data-testid={`${testidRoot}-for-whom`}>
              <h3
                className="text-[12px] tracking-[0.2em] uppercase mb-4"
                style={{ color: "#7a6a48" }}
              >
                · Who walks in here
              </h3>
              <ul className="space-y-2.5">
                {intro.forWhom.map((line, i) => (
                  <li
                    key={i}
                    className="text-[15px] leading-relaxed flex items-start gap-3"
                    style={{ color: "#4a3a1c" }}
                  >
                    <span
                      className="block mt-[10px] w-[16px] h-px flex-shrink-0"
                      style={{ background: "#c4a050" }}
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What it is */}
            <div data-testid={`${testidRoot}-what-it-is`}>
              <h3
                className="text-[12px] tracking-[0.2em] uppercase mb-4"
                style={{ color: "#7a6a48" }}
              >
                · What this room is
              </h3>
              <p
                className="text-[16px] leading-[1.75]"
                style={{
                  color: "#3d2e15",
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                {intro.whatItIs}
              </p>
            </div>

            {/* What you will find */}
            <div data-testid={`${testidRoot}-what-youll-find`}>
              <h3
                className="text-[12px] tracking-[0.2em] uppercase mb-4"
                style={{ color: "#7a6a48" }}
              >
                · What you will actually find
              </h3>
              <ul className="space-y-2">
                {intro.whatYoullFind.map((line, i) => (
                  <li
                    key={i}
                    className="text-[15px] leading-relaxed flex items-start gap-2.5"
                    style={{ color: "#4a3a1c" }}
                  >
                    <Check
                      size={14}
                      strokeWidth={1.6}
                      className="mt-[5px] flex-shrink-0"
                      style={{ color: "#7ba888" }}
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What it is NOT */}
            <div
              data-testid={`${testidRoot}-what-it-is-not`}
              className="rounded-xl px-5 py-5 md:px-6"
              style={{
                background: "rgba(80, 70, 50, 0.06)",
                border: "1px solid rgba(120, 100, 70, 0.18)",
              }}
            >
              <h3
                className="text-[12px] tracking-[0.2em] uppercase mb-3"
                style={{ color: "#8a7a5a" }}
              >
                · What this room is not
              </h3>
              <ul className="space-y-1.5">
                {intro.whatItIsNot.map((line, i) => (
                  <li
                    key={i}
                    className="text-[14px] leading-relaxed flex items-start gap-2.5"
                    style={{ color: "#6e5e3e" }}
                  >
                    <X
                      size={13}
                      strokeWidth={1.6}
                      className="mt-[4px] flex-shrink-0"
                      style={{ color: "#a08a5e", opacity: 0.7 }}
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column — Free thing + reflection + further reading */}
          <aside className="space-y-9">
            {/* Free thing — the only call to action on this card */}
            <div
              data-testid={`${testidRoot}-free-thing`}
              className="rounded-xl px-6 py-7"
              style={{
                background: "rgba(255, 246, 220, 0.7)",
                border: "1px solid rgba(196, 156, 80, 0.32)",
                boxShadow: "0 8px 28px -22px rgba(74, 58, 28, 0.55)",
              }}
            >
              <p
                className="text-[11px] tracking-[0.24em] uppercase mb-3"
                style={{ color: "#a08a5e" }}
              >
                · One free thing right now
              </p>
              <p
                className="text-[16px] leading-relaxed mb-5"
                style={{
                  color: "#3d2e15",
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontStyle: "italic",
                }}
              >
                You don't need to buy anything to leave this room with something
                real in your hands.
              </p>
              <a
                href={intro.freeThing.href}
                data-testid={intro.freeThing.testid}
                className="inline-flex items-center gap-2 text-[14px] underline decoration-dotted underline-offset-[6px]"
                style={{
                  color: "#7a4a18",
                  fontWeight: 500,
                  textDecorationColor: "rgba(196, 156, 80, 0.55)",
                }}
              >
                {intro.freeThing.label}
                <ArrowRight size={14} strokeWidth={1.7} />
              </a>
            </div>

            {/* Reflection prompt */}
            <div
              data-testid={`${testidRoot}-reflection`}
              className="px-1"
            >
              <p
                className="text-[11px] tracking-[0.24em] uppercase mb-4"
                style={{ color: "#7a6a48" }}
              >
                · A small question, if you wish
              </p>
              <blockquote
                className="text-[19px] md:text-[20px] leading-[1.55] pl-5"
                style={{
                  color: "#4a3a1c",
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontStyle: "italic",
                  fontWeight: 400,
                  borderLeft: "2px solid rgba(196, 156, 80, 0.5)",
                }}
              >
                {intro.reflectionPrompt}
              </blockquote>
            </div>

            {/* Further reading — free paths */}
            <div data-testid={`${testidRoot}-further-reading`}>
              <p
                className="text-[11px] tracking-[0.24em] uppercase mb-4"
                style={{ color: "#7a6a48" }}
              >
                · A few more free corners
              </p>
              <ul className="space-y-2.5">
                {intro.furtherReading.map((r, i) => (
                  <li key={i}>
                    <a
                      href={r.href}
                      data-testid={`${testidRoot}-further-${i}`}
                      className="inline-flex items-center gap-2 text-[14px] hover:underline"
                      style={{ color: "#5a4a26" }}
                    >
                      <BookOpen size={12} strokeWidth={1.4} />
                      {r.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Footer line — no buy, no portal, just a quiet promise */}
        <p
          className="mt-12 text-[12.5px] italic text-center"
          style={{ color: "#8a7a5a" }}
          data-testid={`${testidRoot}-footer-note`}
        >
          Nothing here asks you to buy anything to be welcome.
        </p>
      </div>
    </section>
  );
}
