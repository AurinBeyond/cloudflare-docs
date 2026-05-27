/**
 * KaelanRoom.jsx — §ADULT-V3-PHASE-2 2026-02-27
 *
 * The Unshakable Center. Granite gray sanctuary.
 *
 * 4-day stone cycle (locked in /app/memory/ADULT_V3_VISION.md):
 *   Day 1: Clear Seeing
 *   Day 2: The Filter
 *   Day 3: Actionable Stillness
 *   Day 4: Sovereignty Vault & Sparks
 *
 * 100% English UI.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { api } from "@/lib/api";

const SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, serif';

// Static portrait — Anna will replace with the curated Kaelan asset.
// Until then we render a stylized typographic placeholder.
const KAELAN_PORTRAIT = "/avatars/kaelan.png";

const STONES = [
  {
    id: "node-1",
    dayLabel: "Day 1",
    title: "Clear Seeing",
    eyebrow: "✦ The first practice",
    headline: "Strip the label.\nSee the structure.",
    body:
      "Most of what we react to is not the event itself. It is the label we placed on it — 'catastrophe', 'betrayal', 'failure'. Tonight, take one situation you returned to in your mind this week. Remove the label. Describe only the structure: who, what, when, what changed. The story below the story is always quieter than the story you told yourself.",
    reflectionPrompt:
      "Name one situation. Name the label you placed on it. Then write three sentences of structure — without the label.",
    sparks: [
      {
        id: "blank_label",
        label: "Write the same event twice today — once with the label, once without.",
      },
      {
        id: "walk_without_phone",
        label: "Take a 30-minute walk with no phone. Notice when you reach for it.",
      },
    ],
  },
  {
    id: "node-2",
    dayLabel: "Day 2",
    title: "The Filter",
    eyebrow: "✦ The second practice",
    headline: "Noise passes through.\nIt does not enter.",
    body:
      "The world will deliver opinions, headlines, group fears, social-media commentary — most of it not aimed at you, not relevant to you, not useful to you. The filter is not avoidance. It is sovereignty. Today, identify three input sources you allow into your sanctuary without permission. Decide which one closes its door.",
    reflectionPrompt:
      "Name three input sources (a person, a feed, a news channel, a group). Mark one for a one-week silence. Write the sentence you will say if asked why.",
    sparks: [
      {
        id: "mute_one_source",
        label: "Mute one source of input for seven days. Notice what changes inside.",
      },
      {
        id: "no_news_morning",
        label: "Spend the first hour of one full day with no news, no feed, no email.",
      },
    ],
  },
  {
    id: "node-3",
    dayLabel: "Day 3",
    title: "Actionable Stillness",
    eyebrow: "✦ The third practice",
    headline: "What you govern,\nand what you do not.",
    body:
      "Energy spent on what we do not control is not spent — it is leaked. The unshakable center is not paralysis. It is a precise choice of where the next step goes. Today, write two columns: what I cannot govern, what I can. Then take exactly one small, solid step on the right column. No more, no less.",
    reflectionPrompt:
      "Two columns. Three items each. Then circle the one solid step you will take in the next 24 hours.",
    sparks: [
      {
        id: "single_solid_step",
        label: "Take one small, solid step on something you actually govern.",
      },
      {
        id: "handwritten_strategy",
        label: "Map your next 90 days on a single sheet of paper. By hand. No app.",
      },
    ],
  },
  {
    id: "node-4",
    dayLabel: "Day 4",
    title: "Sovereignty Vault",
    eyebrow: "✦ The closing of the cycle",
    headline: "The room remembers,\nso you do not have to.",
    body:
      "Three days, three practices. Today is the archive. Write one short reflection — what is different in you now? What returned that you had forgotten? The Sovereignty Vault is private to you alone. Nothing is shared, nothing is trained on, nothing is read by anyone but you. When you finish, choose one final real-world practice and the cycle closes.",
    reflectionPrompt:
      "What is different in you after these three days? Write two or three honest sentences.",
    sparks: [
      {
        id: "one_hour_alone",
        label: "Spend one full hour alone with no input — no phone, no book, no music.",
      },
      {
        id: "real_conversation",
        label: "Have one real, in-person conversation with someone you trust.",
      },
    ],
  },
];

// Reusable shell
function Shell({ room, label, onBack, children }) {
  return (
    <div
      data-testid="kaelan-room-root"
      className="min-h-screen w-full"
      style={{
        background: `linear-gradient(180deg, ${room.bgFrom} 0%, ${room.bgTo} 100%)`,
        color: "#e8e1d5",
        fontFamily: SERIF,
      }}
    >
      <header className="max-w-[1180px] mx-auto px-6 sm:px-10 py-6 flex items-center justify-between border-b border-[rgba(196,164,107,0.08)]">
        <button
          type="button"
          onClick={onBack}
          data-testid="kaelan-back"
          className="flex items-center gap-2 text-[11px] tracking-[0.32em] uppercase text-[#bcb4a3] hover:text-[#e8e1d5] transition-colors"
        >
          <ArrowLeft size={14} /> {label}
        </button>
        <span
          className="text-[10.5px] tracking-[0.32em] uppercase italic"
          style={{ color: room.accent }}
        >
          Kaelan · The Unshakable Center
        </span>
      </header>
      <main className="max-w-[1180px] mx-auto px-6 sm:px-10 py-12">{children}</main>
    </div>
  );
}

// Granite portrait placeholder — quietly elegant if PNG is missing
function KaelanPortrait({ room }) {
  const [errored, setErrored] = useState(false);
  return (
    <div className="lg:col-span-5 flex justify-center relative lg:sticky lg:top-12">
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[2rem] blur-3xl opacity-50"
        style={{ background: room.accentGlow }}
      />
      {!errored ? (
        <img
          src={KAELAN_PORTRAIT}
          alt="Kaelan, the Unshakable Center"
          onError={() => setErrored(true)}
          data-testid="kaelan-portrait"
          className="relative z-10 w-full max-w-[360px] aspect-square object-cover rounded-[1.5rem]"
          style={{
            border: "1px solid rgba(232,225,213,0.12)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
          }}
        />
      ) : (
        <div
          data-testid="kaelan-portrait-placeholder"
          className="relative z-10 w-full max-w-[360px] aspect-square rounded-[1.5rem] flex flex-col items-center justify-center"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(139,132,120,0.22), rgba(11,11,10,0.95))",
            border: "1px solid rgba(232,225,213,0.10)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
          }}
        >
          <p
            className="text-[10px] tracking-[0.48em] uppercase mb-3"
            style={{ color: room.accent, fontFamily: SERIF }}
          >
            ✦ Mentor
          </p>
          <p
            className="text-[42px] font-light italic"
            style={{ color: "#e8e1d5", fontFamily: SERIF }}
          >
            Kaelan
          </p>
          <p
            className="text-[10.5px] tracking-[0.36em] uppercase mt-3 text-[#a59f93]"
            style={{ fontFamily: SERIF }}
          >
            The Unshakable Center
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Stone view (Day N) ──────────────────────────────────────────────
function StoneView({ room, stone, isPremium, onBack, onStoneUnlocked, onSparksCommitted }) {
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [committedSpark, setCommittedSpark] = useState(null);

  // Mark stone unlocked when premium user enters
  useEffect(() => {
    if (!isPremium) return;
    api
      .post("/adult-rooms/unlock-stone", { room: room.slug, node_id: stone.id })
      .then(() => onStoneUnlocked && onStoneUnlocked(stone.id))
      .catch(() => {
        /* 429 fine */
      });
  }, [isPremium, room.slug, stone.id, onStoneUnlocked]);

  const saveNote = async () => {
    if (!note.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await api.post("/adult-rooms/vault/save-note", {
        room: room.slug,
        node_id: stone.id,
        note_text: note.trim(),
        title: stone.title,
      });
      setSavedNote(true);
    } catch (e) {
      setErr(
        e?.response?.data?.detail ||
          "The vault stayed quiet. Please try once more."
      );
    } finally {
      setBusy(false);
    }
  };

  const commitSpark = async (spark) => {
    setBusy(true);
    setErr(null);
    try {
      const res = await api.post("/adult-rooms/sparks/commit", {
        room: room.slug,
        node_id: stone.id,
        practice_id: spark.id,
        practice_label: spark.label,
      });
      setCommittedSpark(spark);
      onSparksCommitted && onSparksCommitted(res.data);
    } catch (e) {
      setErr(
        e?.response?.data?.detail ||
          "The room did not receive your practice. Please try once more."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell room={room} label="Back to the cycle" onBack={onBack}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <KaelanPortrait room={room} />
        <div className="lg:col-span-7 space-y-7">
          <p
            className="text-[11px] tracking-[0.42em] uppercase"
            style={{ color: room.accent }}
          >
            {stone.eyebrow}
          </p>
          <h2
            className="text-[34px] sm:text-[42px] leading-[1.2] font-light italic whitespace-pre-line"
            style={{ color: "#e8e1d5" }}
          >
            {stone.headline}
          </h2>
          <p className="text-[16.5px] leading-[1.85] text-[#bcb4a3] font-light">
            {stone.body}
          </p>

          {/* Reflection prompt → Sovereignty Vault */}
          {isPremium ? (
            <div
              className="rounded-[1.25rem] p-7 mt-2"
              style={{
                background: "rgba(255,253,249,0.04)",
                border: "1px solid rgba(196,164,107,0.16)",
              }}
            >
              <p
                className="text-[11px] tracking-[0.32em] uppercase mb-3"
                style={{ color: room.accent }}
              >
                The Reflection
              </p>
              <p className="text-[14.5px] italic text-[#a59f93] leading-[1.85] mb-5">
                {stone.reflectionPrompt}
              </p>
              {savedNote ? (
                <p
                  className="text-[14px] italic text-[#e8e1d5] flex items-center gap-2"
                  data-testid="kaelan-vault-saved"
                >
                  <Check size={16} color={room.accent} /> Filed quietly in your
                  Sovereignty Vault.
                </p>
              ) : (
                <>
                  <textarea
                    data-testid="kaelan-vault-textarea"
                    rows={5}
                    maxLength={2000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write honestly. The vault is private to you alone."
                    className="w-full bg-transparent border rounded-xl px-4 py-3 text-[15px] italic text-[#e8e1d5] placeholder-[#5a554c] focus:outline-none focus:border-[#c4a46b] transition-colors"
                    style={{
                      fontFamily: SERIF,
                      borderColor: "rgba(196,164,107,0.18)",
                    }}
                  />
                  {err && (
                    <p className="mt-3 text-[12px] italic text-[#c4a46b]">{err}</p>
                  )}
                  <button
                    type="button"
                    disabled={!note.trim() || busy}
                    onClick={saveNote}
                    data-testid="kaelan-vault-save"
                    className="mt-5 inline-flex items-center gap-2 px-7 py-3 rounded-full text-[12px] tracking-[0.22em] uppercase font-medium transition-all disabled:opacity-40"
                    style={{
                      background: "#c4a46b",
                      color: "#0b0a08",
                      fontFamily: SERIF,
                      boxShadow: `0 0 22px ${room.accentGlow}`,
                    }}
                  >
                    {busy ? "Filing…" : "✦ File to the Vault"}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div
              className="rounded-[1.25rem] p-7 mt-2"
              style={{
                background: "rgba(255,253,249,0.03)",
                border: "1px solid rgba(196,164,107,0.14)",
              }}
            >
              <Lock size={18} color={room.accent} className="mb-3" strokeWidth={1.5} />
              <p className="text-[14px] italic text-[#a59f93] leading-[1.85] mb-4">
                The Sovereignty Vault opens with the Parent Sanctuary. Until
                then, this stone is a first whisper — read it twice, slowly,
                and the practice begins on its own.
              </p>
              <Link
                to="/pricing"
                data-testid="kaelan-pricing-cta"
                className="inline-flex items-center justify-center px-7 py-3 rounded-full text-[12px] tracking-[0.22em] uppercase font-medium transition-all"
                style={{
                  background: "#c4a46b",
                  color: "#0b0a08",
                  fontFamily: SERIF,
                }}
              >
                ✦ Open the Sanctuary
              </Link>
            </div>
          )}

          {/* Sovereignty Sparks */}
          {isPremium && (
            <section
              data-testid="kaelan-sparks"
              className="mt-10 pt-8 border-t"
              style={{ borderColor: "rgba(196,164,107,0.10)" }}
            >
              <p
                className="text-[11px] tracking-[0.42em] uppercase mb-4"
                style={{ color: room.accent }}
              >
                ✦ Sovereignty Sparks
              </p>
              <h3
                className="text-[22px] leading-[1.25] font-light italic mb-4"
                style={{ color: "#e8e1d5" }}
              >
                Practices for the real world.
              </h3>
              <p className="text-[14.5px] leading-[1.8] text-[#a59f93] font-light mb-6 max-w-[52ch]">
                Pick one. The room remembers — and in 48 hours, a quiet
                reminder will arrive.
              </p>
              {committedSpark ? (
                <p
                  className="text-[14px] italic text-[#e8e1d5] flex items-center gap-2"
                  data-testid="kaelan-spark-committed"
                >
                  <Check size={16} color={room.accent} />
                  <span>{committedSpark.label}</span>
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {stone.sparks.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => commitSpark(s)}
                      disabled={busy}
                      data-testid={`kaelan-spark-${s.id}`}
                      className="text-left p-4 rounded-2xl transition-all duration-300"
                      style={{
                        background: "rgba(255,253,249,0.03)",
                        border: "1px solid rgba(196,164,107,0.14)",
                      }}
                    >
                      <span
                        className="text-[14px] text-[#e8e1d5] font-light italic"
                        style={{ fontFamily: SERIF }}
                      >
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </Shell>
  );
}

// ─── Cycle view (map of 4 stones) ────────────────────────────────────
function CycleView({ room, isPremium, progress, onSelectStone }) {
  const unlocked = new Set(progress?.unlocked_nodes || ["node-1"]);
  const [portraitErrored, setPortraitErrored] = useState(false);
  return (
    <>
      <div className="text-center mb-14">
        <div className="flex justify-center mb-8">
          <div
            className="relative rounded-full overflow-hidden"
            style={{
              width: 132,
              height: 132,
              border: `1px solid ${room.accent}`,
              boxShadow: `0 0 38px ${room.accentGlow}, 0 12px 28px rgba(0,0,0,0.55)`,
            }}
          >
            {!portraitErrored ? (
              <img
                src={KAELAN_PORTRAIT}
                alt="Kaelan portrait"
                data-testid="kaelan-cycle-portrait"
                onError={() => setPortraitErrored(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-[28px] italic"
                style={{
                  background:
                    "radial-gradient(circle at 50% 35%, rgba(139,132,120,0.22), rgba(11,11,10,0.95))",
                  color: "#e8e1d5",
                  fontFamily: SERIF,
                }}
              >
                K
              </div>
            )}
          </div>
        </div>
        <p
          className="text-[12px] tracking-[0.42em] uppercase mb-7"
          style={{ color: room.accent }}
          data-testid="kaelan-cycle-eyebrow"
        >
          ✦ The Four-Day Stone Cycle
        </p>
        <h1
          className="text-[40px] sm:text-[54px] leading-[1.1] font-light italic text-[#e8e1d5] mb-5"
          data-testid="kaelan-cycle-title"
        >
          When the storm rises,<br />
          you govern the ship.
        </h1>
        <p className="text-[16px] leading-[1.85] text-[#bcb4a3] font-light max-w-[60ch] mx-auto">
          Four stones. One every twenty-four hours. Clear seeing, the filter,
          actionable stillness, and the closing of the cycle. Built for the
          life you actually run.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[840px] mx-auto">
        {STONES.map((s) => {
          const isUnlocked = unlocked.has(s.id);
          const locked = !isPremium && !isUnlocked;
          return (
            <button
              key={s.id}
              type="button"
              data-testid={`kaelan-stone-${s.id}`}
              onClick={() => onSelectStone(s, locked)}
              className="text-left p-7 rounded-[1.25rem] transition-all duration-500 group relative"
              style={{
                background: "rgba(255,253,249,0.03)",
                border: `1px solid ${
                  isUnlocked ? `${room.accent}55` : "rgba(196,164,107,0.14)"
                }`,
                boxShadow: isUnlocked
                  ? `0 0 26px ${room.accentGlow}`
                  : "none",
                opacity: locked ? 0.78 : 1,
              }}
            >
              <div className="flex items-baseline justify-between mb-3">
                <p
                  className="text-[10.5px] tracking-[0.36em] uppercase"
                  style={{ color: room.accent }}
                >
                  {s.dayLabel}
                </p>
                {locked && <Lock size={14} color="#7a7468" strokeWidth={1.5} />}
                {isUnlocked && (
                  <Check size={14} color={room.accent} strokeWidth={1.8} />
                )}
              </div>
              <h3
                className="text-[26px] leading-[1.15] font-light italic mb-3"
                style={{ color: "#e8e1d5" }}
              >
                {s.title}
              </h3>
              <p className="text-[13.5px] leading-[1.75] text-[#a59f93] font-light italic line-clamp-3">
                {s.body.slice(0, 140)}…
              </p>
            </button>
          );
        })}
      </div>
    </>
  );
}

export default function KaelanRoom({ room, onBack }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState({
    unlocked_nodes: ["node-1"],
    premium: false,
  });
  const [activeStone, setActiveStone] = useState(null);
  const [unlockNoticeOpen, setUnlockNoticeOpen] = useState(false);

  const isPremium = !!progress.premium;

  useEffect(() => {
    let alive = true;
    api
      .get("/adult-rooms/progress/kaelan")
      .then((r) => alive && setProgress(r.data || progress))
      .catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const handleSelectStone = (stone, locked) => {
    if (locked) {
      setUnlockNoticeOpen(true);
      return;
    }
    setActiveStone(stone);
  };

  const handleStoneUnlocked = (nodeId) => {
    setProgress((p) => {
      const cur = p.unlocked_nodes || [];
      if (cur.includes(nodeId)) return p;
      return { ...p, unlocked_nodes: [...cur, nodeId] };
    });
  };

  if (activeStone) {
    return (
      <StoneView
        room={room}
        stone={activeStone}
        isPremium={isPremium}
        onBack={() => setActiveStone(null)}
        onStoneUnlocked={handleStoneUnlocked}
      />
    );
  }

  return (
    <>
      <div onClick={() => unlockNoticeOpen && null}>
        <Shell room={room} label="Back to the four rooms" onBack={onBack}>
          <CycleView
            room={room}
            isPremium={isPremium}
            progress={progress}
            onSelectStone={handleSelectStone}
          />
        </Shell>
      </div>

      {unlockNoticeOpen && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="kaelan-unlock-modal"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{
            background: "rgba(11,10,8,0.78)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setUnlockNoticeOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-[460px] w-full rounded-[1.5rem] p-10"
            style={{
              background: "rgba(18,16,13,0.95)",
              border: "1px solid rgba(196,164,107,0.28)",
              fontFamily: SERIF,
            }}
          >
            <p
              className="text-[11px] tracking-[0.42em] uppercase text-[#c4a46b] mb-5 text-center"
            >
              ✦ The stone waits
            </p>
            <h3 className="text-[26px] italic font-light text-[#e8e1d5] text-center leading-[1.25] mb-6">
              This practice opens<br />with the Sanctuary.
            </h3>
            <p className="text-[14.5px] leading-[1.85] text-[#bcb4a3] font-light text-center mb-7">
              One stone a day, no streaks, no pressure. The full cycle unfolds
              quietly when you choose to enter.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/pricing"
                data-testid="kaelan-unlock-pricing"
                className="w-full py-3 text-center rounded-full text-[12px] tracking-[0.22em] uppercase font-medium"
                style={{
                  background: "#c4a46b",
                  color: "#0b0a08",
                  fontFamily: SERIF,
                }}
              >
                Open the Sanctuary →
              </Link>
              <button
                type="button"
                onClick={() => setUnlockNoticeOpen(false)}
                data-testid="kaelan-unlock-close"
                className="text-[11px] tracking-[0.32em] uppercase text-[#7a7468] hover:text-[#e8e1d5] transition-colors"
              >
                Return to the cycle
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
