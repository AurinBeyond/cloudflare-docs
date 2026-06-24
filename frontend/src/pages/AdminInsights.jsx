/**
 * AdminInsights.jsx — /admin/insights
 *
 * A quiet, read-only dashboard for the Substack soft-launch window.
 * Shows:
 *   · how many unique sessions arrived
 *   · which paths were viewed most
 *   · per-host-intro: how many opened it, how many filled the
 *     intake (i.e. completed the threshold)
 *   · the distribution of "What brought you here today?" answers
 *   · the most recent 50 free-text notes — the qualitative gold
 *
 * No filters, no charts, no nonsense. Reading this once per morning
 * is the entire job. Brand-aligned aesthetic (brass + cream),
 * matches the rest of the Aurin admin pages.
 */
import React, { useEffect, useState } from "react";
import { useAdmin } from "../hooks/useAdmin";

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const BRASS = "#c4a46b";
const CREAM = "#f0eadd";
const SOFT = "#bcb4a3";
const MUTED = "#a59f93";
const GREY = "#7a7468";
const BG = "#0b0a08";
const EDGE = "rgba(196,164,107,0.22)";

const ANSWER_LABELS = {
  i_need_a_quieter_evening: "I need a quieter evening.",
  family_life_feels_complicated: "Family life feels complicated.",
  i_need_clarity_about_something: "I need clarity about something.",
  i_feel_disconnected_from_myself: "I feel disconnected from myself.",
  looking_for_something_for_my_child: "I am looking for something for my child.",
  just_curious: "I am just curious.",
};

function Card({ title, kicker, children, testid }) {
  return (
    <section
      data-testid={testid}
      className="border p-7 sm:p-9"
      style={{ borderColor: EDGE, background: "rgba(18,16,13,0.62)" }}
    >
      <p
        className="text-[10.5px] tracking-[0.4em] uppercase mb-3"
        style={{ color: BRASS }}
      >
        {kicker}
      </p>
      <h2
        className="text-[22px] sm:text-[26px] leading-[1.15] font-light mb-7"
        style={{ fontFamily: SERIF, color: CREAM }}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function Bar({ label, count, max, testid }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="mb-4" data-testid={testid}>
      <div className="flex items-baseline justify-between mb-1.5">
        <span
          className="text-[14px] font-light"
          style={{ fontFamily: SERIF, color: SOFT }}
        >
          {label}
        </span>
        <span
          className="text-[12px] tracking-[0.18em] uppercase"
          style={{ color: GREY }}
        >
          {count}
        </span>
      </div>
      <div
        className="h-[3px] w-full"
        style={{ background: "rgba(196,164,107,0.12)" }}
      >
        <div
          className="h-full transition-all duration-700"
          style={{ background: BRASS, width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminInsights() {
  const { isAdmin, token } = useAdmin();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/api/insights/summary`;
      const res = await fetch(url, {
        headers: { "X-Admin-Token": token },
      });
      if (res.status === 401) throw new Error("Admin token rejected");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setErr(String(e));
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!isAdmin) {
    return (
      <div
        data-testid="admin-insights-locked"
        className="min-h-screen w-full flex items-center justify-center p-10"
        style={{ background: BG, color: SOFT, fontFamily: SERIF }}
      >
        <div className="max-w-[520px] text-center">
          <p
            className="text-[11px] tracking-[0.42em] uppercase mb-6"
            style={{ color: BRASS }}
          >
            — Private
          </p>
          <p
            className="text-[22px] italic leading-[1.6]"
            style={{ color: CREAM }}
          >
            This dashboard is held for Anna only.
          </p>
          <p
            className="mt-6 text-[13px]"
            style={{ color: GREY }}
          >
            Append <code style={{ color: BRASS }}>?token=YOUR_ADMIN_TOKEN</code> to
            the URL once. After that, this browser remembers.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        data-testid="admin-insights-loading"
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: BG, color: SOFT, fontFamily: SERIF }}
      >
        <p className="italic">Listening…</p>
      </div>
    );
  }

  if (err || !data) {
    return (
      <div
        data-testid="admin-insights-error"
        className="min-h-screen w-full flex items-center justify-center p-10"
        style={{ background: BG, color: SOFT, fontFamily: SERIF }}
      >
        <p className="italic">Could not reach the insights surface. {err}</p>
      </div>
    );
  }

  const maxPath = Math.max(...(data.top_paths || []).map((p) => p.count), 1);
  const maxIntro = Math.max(...(data.intro_engagement || []).map((p) => p.views), 1);
  const maxAnswer = Math.max(...(data.intake_distribution || []).map((a) => a.count), 1);

  return (
    <div
      data-testid="admin-insights-page"
      className="min-h-screen w-full antialiased"
      style={{
        background: BG,
        color: CREAM,
        fontFamily: 'system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-20">
        <header className="mb-14">
          <p
            className="text-[11px] tracking-[0.42em] uppercase mb-5"
            style={{ color: BRASS }}
          >
            — Soft-launch insights
          </p>
          <h1
            className="text-[40px] sm:text-[52px] leading-[1.05] font-light tracking-[-0.012em]"
            style={{ fontFamily: SERIF, color: CREAM }}
            data-testid="admin-insights-title"
          >
            What the first visitors are telling us.
          </h1>
          <p
            className="mt-6 text-[14px] tracking-[0.18em] uppercase"
            style={{ color: GREY }}
          >
            generated {new Date(data.generated_at).toLocaleString()}
            <button
              type="button"
              onClick={load}
              data-testid="admin-insights-refresh"
              className="ml-6 underline decoration-dotted underline-offset-4 hover:text-[#c4a46b] transition-colors"
              style={{ color: GREY }}
            >
              refresh
            </button>
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <Card
            kicker="i · Unique sessions"
            title="People who walked in"
            testid="admin-insights-sessions"
          >
            <p
              className="text-[64px] leading-none font-light"
              style={{ fontFamily: SERIF, color: BRASS }}
              data-testid="admin-insights-sessions-count"
            >
              {data.unique_sessions || 0}
            </p>
            <p
              className="mt-4 text-[13px] italic"
              style={{ fontFamily: SERIF, color: MUTED }}
            >
              In the current 12-hour session window.
            </p>
          </Card>
          <Card
            kicker="ii · Intake responses"
            title="Sentences received"
            testid="admin-insights-intake-total"
          >
            <p
              className="text-[64px] leading-none font-light"
              style={{ fontFamily: SERIF, color: BRASS }}
            >
              {data.total_intake_responses || 0}
            </p>
            <p
              className="mt-4 text-[13px] italic"
              style={{ fontFamily: SERIF, color: MUTED }}
            >
              Answers to &quot;What brought you here today?&quot;
            </p>
          </Card>
          <Card
            kicker="iii · Conversion gauge"
            title="Of those who walked in"
            testid="admin-insights-conversion"
          >
            <p
              className="text-[64px] leading-none font-light"
              style={{ fontFamily: SERIF, color: BRASS }}
            >
              {data.unique_sessions
                ? Math.round(
                    ((data.total_intake_responses || 0) /
                      data.unique_sessions) *
                      100
                  )
                : 0}
              %
            </p>
            <p
              className="mt-4 text-[13px] italic"
              style={{ fontFamily: SERIF, color: MUTED }}
            >
              wrote a sentence about what they were looking for.
            </p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card
            kicker="iv · The first question"
            title="What brought them here?"
            testid="admin-insights-answers"
          >
            {(data.intake_distribution || []).length === 0 ? (
              <p
                className="text-[14px] italic"
                style={{ fontFamily: SERIF, color: MUTED }}
              >
                No sentences yet. The first one will mean a lot.
              </p>
            ) : (
              (data.intake_distribution || []).map((a) => (
                <Bar
                  key={a.answer}
                  label={ANSWER_LABELS[a.answer] || a.answer}
                  count={a.count}
                  max={maxAnswer}
                  testid={`admin-insights-answer-${a.answer}`}
                />
              ))
            )}
          </Card>

          <Card
            kicker="v · Host intros"
            title="Which keeper drew them in?"
            testid="admin-insights-intros"
          >
            {(data.intro_engagement || []).map((p) => (
              <Bar
                key={p.path}
                label={p.path.replace("/intro", "").replace("/", "")}
                count={p.views}
                max={maxIntro}
                testid={`admin-insights-intro-${p.path.replace(/\//g, "_")}`}
              />
            ))}
          </Card>

          <Card
            kicker="vi · Top paths"
            title="Where they went"
            testid="admin-insights-paths"
          >
            {(data.top_paths || []).length === 0 ? (
              <p
                className="text-[14px] italic"
                style={{ fontFamily: SERIF, color: MUTED }}
              >
                No traffic yet.
              </p>
            ) : (
              (data.top_paths || []).slice(0, 10).map((p) => (
                <Bar
                  key={p.path}
                  label={p.path}
                  count={p.count}
                  max={maxPath}
                  testid={`admin-insights-path-${p.path.replace(/[^a-z0-9]/gi, "_")}`}
                />
              ))
            )}
          </Card>

          <Card
            kicker="vii · In their own words"
            title="Recent free-text notes"
            testid="admin-insights-notes"
          >
            {(data.recent_intake_notes || []).length === 0 ? (
              <p
                className="text-[14px] italic"
                style={{ fontFamily: SERIF, color: MUTED }}
              >
                Notes will appear here as visitors choose to write.
              </p>
            ) : (
              <ul className="space-y-5 max-h-[520px] overflow-y-auto pr-2">
                {data.recent_intake_notes.map((n, i) => (
                  <li
                    key={i}
                    className="border-l-2 pl-4"
                    style={{ borderColor: BRASS }}
                  >
                    <p
                      className="text-[14.5px] italic leading-[1.6] font-light"
                      style={{ fontFamily: SERIF, color: CREAM }}
                    >
                      “{n.note}”
                    </p>
                    <p
                      className="mt-2 text-[10.5px] tracking-[0.28em] uppercase"
                      style={{ color: GREY }}
                    >
                      {ANSWER_LABELS[n.answer] || n.answer}
                      {n.path ? ` · ${n.path}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
