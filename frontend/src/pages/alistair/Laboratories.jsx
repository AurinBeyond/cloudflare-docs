/**
 * alistair/Laboratories.jsx — § LAB SELECTION 2026-02
 *
 * Founder spec: choose a laboratory. Five cards. Money Tree active,
 * the other four "coming later" with a soft preview.
 */
import { Link } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import AlistairSubPage from "@/components/alistair/AlistairSubPage";
import { LABS, LAB_ORDER } from "@/data/alistairLabs";

export default function Laboratories() {
  return (
    <AlistairSubPage
      testid="page-alistair-laboratories"
      bgImage="/assets/alistair/alistair-light-bg.png"
      eyebrow="Laboratory of Life"
      title="Choose a laboratory."
      intro="Each laboratory is a self-contained inquiry. Inside one, you can explore the theme, read short pieces, run small experiments, take notes, and — when you are ready — speak with Alistair about what you found."
      quote="Pick the one that pulls on a thread inside you. Curiosity is a reliable guide."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {LAB_ORDER.map((slug) => {
          const lab = LABS[slug];
          const isOpen = lab.status === "open";
          const Wrapper = isOpen ? Link : "div";
          const wrapperProps = isOpen
            ? { to: `/course-room/lab/${slug}` }
            : {};
          return (
            <Wrapper
              key={slug}
              {...wrapperProps}
              data-testid={`lab-card-${slug}`}
              className={`block rounded-2xl p-6 md:p-7 transition-all no-underline ${
                isOpen ? "hover:scale-[1.02] hover:shadow-lg cursor-pointer" : "cursor-default opacity-80"
              }`}
              style={{
                background: isOpen
                  ? "rgba(252, 246, 232, 0.92)"
                  : "rgba(252, 246, 232, 0.55)",
                border: `1px solid ${isOpen ? lab.accent : "rgba(176, 122, 63, 0.22)"}`,
                boxShadow: isOpen
                  ? "0 8px 26px -12px rgba(105, 72, 38, 0.25)"
                  : "0 4px 14px -8px rgba(105, 72, 38, 0.15)",
                textDecoration: "none",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-[26px]"
                  style={{
                    background: lab.accentSoft,
                    border: `1px solid ${lab.accent}55`,
                  }}
                  aria-hidden="true"
                >
                  {lab.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p
                      className="text-[20px] leading-tight"
                      style={{
                        color: "#2b1f0f",
                        fontFamily: '"Cormorant Garamond", Georgia, serif',
                        fontWeight: 500,
                      }}
                    >
                      {lab.name}
                    </p>
                    {!isOpen && (
                      <span
                        className="inline-flex items-center gap-1 text-[10.5px] tracking-[0.16em] uppercase px-2 py-1 rounded-full flex-shrink-0"
                        style={{
                          color: "#7a5a26",
                          background: "rgba(176, 122, 63, 0.12)",
                          border: "1px solid rgba(176, 122, 63, 0.3)",
                        }}
                      >
                        <Lock size={10} strokeWidth={2} /> Coming Soon
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[14px] leading-[1.55] italic mb-3"
                    style={{
                      color: "#5b4226",
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                    }}
                  >
                    {lab.subtitle}
                  </p>
                  <p
                    className="text-[13.5px] leading-[1.65] mb-3"
                    style={{
                      color: "#3d2c14",
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                    }}
                  >
                    {lab.short}
                  </p>
                  <p
                    className="text-[12px] tracking-[0.14em] uppercase mb-3"
                    style={{ color: lab.accent }}
                  >
                    Core question · <span className="normal-case tracking-normal italic" style={{ color: "#5b4226" }}>{lab.coreQuestion}</span>
                  </p>
                  {isOpen && (
                    <span
                      className="inline-flex items-center gap-1.5 text-[13px]"
                      style={{
                        color: lab.accent,
                        fontFamily: '"Cormorant Garamond", Georgia, serif',
                        fontStyle: "italic",
                      }}
                    >
                      Enter the laboratory <ArrowRight size={13} />
                    </span>
                  )}
                </div>
              </div>
            </Wrapper>
          );
        })}
      </div>
      <p
        className="mt-10 text-center text-[13px] italic"
        style={{ color: "#7a5a26", fontFamily: '"Cormorant Garamond", Georgia, serif' }}
        data-testid="lab-footer-note"
      >
        Four more laboratories will open as they are ready. Each one is built by hand, in the same quiet way.
      </p>
    </AlistairSubPage>
  );
}
