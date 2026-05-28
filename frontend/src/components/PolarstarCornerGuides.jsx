/**
 * PolarstarCornerGuides.jsx — two decorative fairy guides anchored
 * in the bottom corners of every Polarstar screen. They do nothing
 * functional; they just *live there* and whisper a mode-aware line
 * via a comic-style speech bubble.
 *
 * §POLARSTAR 2026-02-13 — moves the page from "UI" → "world".
 */
const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';

const CORNER_SPEECH = {
  morning: {
    left:  { name: "discovery",   line: "Did the sun wake you too?" },
    right: { name: "creation",    line: "Today is a fresh page." },
  },
  day: {
    left:  { name: "exploration", line: "I found a secret path." },
    right: { name: "creation",    line: "Let's make something beautiful." },
  },
  evening: {
    left:  { name: "discovery",   line: "The lanterns are warming up." },
    right: { name: "exploration", line: "One more wonder before rest." },
  },
  night: {
    left:  { name: "discovery",   line: "Shall we look at the stars?" },
    right: { name: "creation",    line: "Let's make something beautiful." },
  },
};

function CornerFairy({ corner, name, line }) {
  return (
    <div
      className={`ps-corner ps-corner--${corner}`}
      data-testid={`polarstar-corner-${corner}`}
      aria-hidden="true"
    >
      <img
        src={`${process.env.PUBLIC_URL || ""}/polarstar/guide-${name}.png`}
        alt=""
        className="ps-corner-img"
        loading="lazy"
      />
      <div className="ps-corner-speech">
        <p style={{ fontFamily: SERIF }}>{line}</p>
      </div>
    </div>
  );
}

export default function PolarstarCornerGuides({ mode = "night" }) {
  const config = CORNER_SPEECH[mode] || CORNER_SPEECH.night;
  return (
    <>
      <CornerFairy corner="left"  name={config.left.name}  line={config.left.line}  />
      <CornerFairy corner="right" name={config.right.name} line={config.right.line} />
    </>
  );
}
