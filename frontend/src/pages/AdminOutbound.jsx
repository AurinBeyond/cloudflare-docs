/**
 * AdminOutbound.jsx — §Iter 67 Outbound Distribution Panel.
 *
 * Founder-only manual publishing surface. Composes ONE approved
 * campaign at a time. Manual send-email button, no automation,
 * no scheduling, no auto-retry. Per Controlled Outbound Policy:
 * max 1 marketing dispatch per 24h (enforced server-side).
 *
 * Channels other than email are advisory only — the panel renders
 * a copy-ready preview that the founder pastes into Telegram /
 * X / FB / IG / LinkedIn / Discord / blog manually.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { BACKEND_URL as __BACKEND_URL__ } from "@/lib/backendUrl";

const API = __BACKEND_URL__;

const CHANNELS = [
  { key: "email", label: "Email", auto: true },
  { key: "telegram", label: "Telegram", auto: false },
  { key: "x", label: "X / Twitter", auto: false },
  { key: "facebook", label: "Facebook", auto: false },
  { key: "instagram", label: "Instagram", auto: false },
  { key: "linkedin", label: "LinkedIn", auto: false },
  { key: "discord", label: "Discord", auto: false },
  { key: "blog", label: "Blog", auto: false },
];

const SEGMENTS = [
  { key: "newsletter", label: "Newsletter (consented)" },
  { key: "waitlist", label: "Waitlist members" },
  { key: "six_nights", label: "Six Nights subscribers" },
  { key: "all", label: "All quiet-list emails" },
];

export default function AdminOutbound() {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("aurin_admin_token") || "";
    } catch {
      return "";
    }
  });
  const [authed, setAuthed] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Compose state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [channels, setChannels] = useState(["email"]);
  const [segment, setSegment] = useState("newsletter");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(null);
  const [sendResult, setSendResult] = useState(null);

  const headers = useCallback(
    () => ({ "X-Admin-Token": token, "Content-Type": "application/json" }),
    [token]
  );

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API}/api/admin/outbound/list`, {
        headers: headers(),
      });
      if (r.status === 401) {
        setAuthed(false);
        setError("Invalid admin token.");
      } else if (!r.ok) {
        setError(`Could not load (${r.status})`);
      } else {
        const j = await r.json();
        setList(j.campaigns || []);
        setAuthed(true);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  function toggleChannel(k) {
    setChannels((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  }

  async function saveAuth() {
    try {
      localStorage.setItem("aurin_admin_token", token);
    } catch {}
    load();
  }

  async function createDraft(e) {
    e?.preventDefault?.();
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const r = await fetch(`${API}/api/admin/outbound/draft`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          image_url: imageUrl.trim() || undefined,
          channels,
          audience_segment: segment,
          notes: notes.trim() || undefined,
        }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setError(j.detail || `Draft failed (${r.status})`);
      } else {
        setTitle("");
        setBody("");
        setImageUrl("");
        setNotes("");
        setSendResult(null);
        await load();
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setCreating(false);
    }
  }

  async function dispatchEmail(id, dryRun) {
    setSending(id);
    setSendResult(null);
    setError(null);
    try {
      const r = await fetch(
        `${API}/api/admin/outbound/${id}/send-email${
          dryRun ? "?dry_run=true" : ""
        }`,
        { method: "POST", headers: headers() }
      );
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(j.detail || `Send failed (${r.status})`);
      } else {
        setSendResult({ id, dry: dryRun, ...j });
        await load();
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setSending(null);
    }
  }

  async function deleteDraft(id) {
    if (!window.confirm("Delete this draft?")) return;
    try {
      const r = await fetch(`${API}/api/admin/outbound/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setError(j.detail || `Delete failed (${r.status})`);
      } else {
        await load();
      }
    } catch (e) {
      setError(String(e));
    }
  }

  const previewPlain = useMemo(() => `${title}\n\n${body}`.trim(), [title, body]);

  if (!authed) {
    return (
      <div
        data-testid="admin-outbound-auth"
        style={{
          maxWidth: 480,
          margin: "80px auto",
          padding: "32px 24px",
          fontFamily: "Georgia, serif",
        }}
      >
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            opacity: 0.6,
          }}
        >
          Matrix Aurin · Outbound
        </p>
        <h1 style={{ fontWeight: 400, fontSize: 24, margin: "12px 0 18px" }}>
          A quiet workshop for one announcement.
        </h1>
        <p style={{ opacity: 0.75, lineHeight: 1.6 }}>
          Enter your admin token to compose and publish a single campaign.
        </p>
        <input
          data-testid="admin-outbound-token-input"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Admin token"
          style={{
            width: "100%",
            padding: "10px 14px",
            border: "1px solid #2a2a2a",
            background: "transparent",
            color: "inherit",
            margin: "12px 0",
            fontFamily: "inherit",
          }}
        />
        <button
          data-testid="admin-outbound-token-save"
          onClick={saveAuth}
          disabled={!token}
          style={{
            padding: "10px 22px",
            background: "#8aa291",
            color: "#0b0f0d",
            border: "none",
            cursor: "pointer",
            letterSpacing: "0.04em",
          }}
        >
          Enter
        </button>
        {error && (
          <p data-testid="admin-outbound-error" style={{ color: "#c97070", marginTop: 14 }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div data-testid="page-admin-outbound" style={{ maxWidth: 1080, margin: "40px auto", padding: "0 20px", fontFamily: "Georgia, serif" }}>
      <p style={{ fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.6 }}>
        Matrix Aurin · Outbound · Manual only
      </p>
      <h1 style={{ fontWeight: 400, fontSize: 28, margin: "8px 0 6px" }}>
        Outbound distribution panel
      </h1>
      <p style={{ opacity: 0.7, fontSize: 14, lineHeight: 1.7, maxWidth: 720 }}>
        Compose one approved campaign at a time. Email channel sends through
        Resend. All other channels are <em>copy-ready previews</em> — paste
        them into the network manually. <strong>Max 1 marketing dispatch per
        24h.</strong> No automation, no scheduling, no bot loops.
      </p>

      {error && (
        <p
          data-testid="admin-outbound-error"
          style={{ color: "#c97070", marginTop: 14 }}
        >
          {error}
        </p>
      )}

      {/* Compose */}
      <section
        data-testid="admin-outbound-compose"
        style={{
          marginTop: 28,
          padding: 22,
          border: "1px solid #1f2a25",
          borderRadius: 6,
        }}
      >
        <h2 style={{ fontWeight: 400, fontSize: 18, margin: "0 0 14px" }}>Compose</h2>
        <form onSubmit={createDraft}>
          <label style={{ display: "block", fontSize: 12, opacity: 0.7, marginTop: 8 }}>
            Title
          </label>
          <input
            data-testid="admin-outbound-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A quiet note"
            style={inputStyle}
          />

          <label style={{ display: "block", fontSize: 12, opacity: 0.7, marginTop: 12 }}>
            Body
          </label>
          <textarea
            data-testid="admin-outbound-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write the announcement here. Keep it calm, premium, trust-first."
            rows={8}
            style={{ ...inputStyle, fontFamily: "inherit", lineHeight: 1.6 }}
          />

          <label style={{ display: "block", fontSize: 12, opacity: 0.7, marginTop: 12 }}>
            Optional image URL
          </label>
          <input
            data-testid="admin-outbound-image"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            style={inputStyle}
          />

          <fieldset style={{ border: "none", padding: 0, marginTop: 14 }}>
            <legend style={{ fontSize: 12, opacity: 0.7 }}>Channels (advisory only — email is the only one that auto-sends)</legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
              {CHANNELS.map((c) => (
                <label
                  key={c.key}
                  data-testid={`admin-outbound-channel-${c.key}`}
                  style={{
                    border: "1px solid #2a3a32",
                    padding: "6px 12px",
                    borderRadius: 999,
                    cursor: "pointer",
                    fontSize: 13,
                    background: channels.includes(c.key) ? "rgba(138,162,145,0.18)" : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={channels.includes(c.key)}
                    onChange={() => toggleChannel(c.key)}
                    style={{ marginRight: 6 }}
                  />
                  {c.label} {c.auto ? "" : "(manual)"}
                </label>
              ))}
            </div>
          </fieldset>

          <label style={{ display: "block", fontSize: 12, opacity: 0.7, marginTop: 14 }}>
            Email audience segment
          </label>
          <select
            data-testid="admin-outbound-segment"
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            style={inputStyle}
          >
            {SEGMENTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>

          <label style={{ display: "block", fontSize: 12, opacity: 0.7, marginTop: 12 }}>
            Internal notes
          </label>
          <input
            data-testid="admin-outbound-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Just for the founder's records"
            style={inputStyle}
          />

          <div style={{ marginTop: 18 }}>
            <button
              data-testid="admin-outbound-save-draft"
              type="submit"
              disabled={creating || !title.trim() || !body.trim()}
              style={primaryBtn}
            >
              {creating ? "Saving…" : "Save as draft"}
            </button>
          </div>
        </form>

        {previewPlain && (
          <details style={{ marginTop: 18 }}>
            <summary style={{ cursor: "pointer", fontSize: 13, opacity: 0.8 }}>
              Copy-ready preview (Telegram / X / FB / IG / LinkedIn / Discord)
            </summary>
            <pre
              data-testid="admin-outbound-preview"
              style={{
                background: "#0e1411",
                padding: 14,
                marginTop: 8,
                whiteSpace: "pre-wrap",
                fontFamily: "ui-monospace, monospace",
                fontSize: 13,
                lineHeight: 1.6,
                borderRadius: 4,
              }}
            >
              {previewPlain}
            </pre>
            <button
              type="button"
              data-testid="admin-outbound-copy"
              onClick={() => {
                navigator.clipboard?.writeText(previewPlain);
              }}
              style={ghostBtn}
            >
              Copy to clipboard
            </button>
          </details>
        )}
      </section>

      {/* List */}
      <section
        data-testid="admin-outbound-list"
        style={{ marginTop: 36 }}
      >
        <h2 style={{ fontWeight: 400, fontSize: 18 }}>Campaigns</h2>
        {loading && <p style={{ opacity: 0.6 }}>Loading…</p>}
        {!loading && list.length === 0 && (
          <p style={{ opacity: 0.6 }}>No campaigns yet.</p>
        )}
        {sendResult && (
          <div
            data-testid="admin-outbound-send-result"
            style={{
              padding: 12,
              border: "1px solid #2a3a32",
              borderRadius: 4,
              marginBottom: 14,
              background: "rgba(138,162,145,0.08)",
              fontSize: 13,
            }}
          >
            <strong>{sendResult.dry ? "Dry run:" : "Dispatched:"}</strong>{" "}
            sent {sendResult.sent ?? sendResult.would_send_to ?? 0} ·
            failed {sendResult.failed ?? 0} · segment {sendResult.segment}
          </div>
        )}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {list.map((c) => (
            <li
              key={c.id}
              data-testid={`admin-outbound-item-${c.id}`}
              style={{
                border: "1px solid #1f2a25",
                borderRadius: 6,
                padding: 16,
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 16 }}>{c.title}</strong>
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                    {c.status} · {c.audience_segment} · {(c.channels || []).join(", ") || "no channels"}
                    {c.sent_at ? ` · sent ${c.sent_at.slice(0, 10)}` : ""}
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap", opacity: 0.85 }}>
                    {c.body.length > 220 ? c.body.slice(0, 220) + "…" : c.body}
                  </p>
                  {c.delivery_summary && (
                    <pre style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                      {JSON.stringify(c.delivery_summary, null, 2)}
                    </pre>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {c.status === "draft" && (c.channels || []).includes("email") && (
                    <>
                      <button
                        data-testid={`admin-outbound-dryrun-${c.id}`}
                        onClick={() => dispatchEmail(c.id, true)}
                        disabled={sending === c.id}
                        style={ghostBtn}
                      >
                        Dry-run count
                      </button>
                      <button
                        data-testid={`admin-outbound-send-${c.id}`}
                        onClick={() => {
                          if (window.confirm(`Send "${c.title}" to the email list now? This cannot be undone.`)) {
                            dispatchEmail(c.id, false);
                          }
                        }}
                        disabled={sending === c.id}
                        style={primaryBtn}
                      >
                        {sending === c.id ? "Sending…" : "Send email now"}
                      </button>
                    </>
                  )}
                  {c.status === "draft" && (
                    <button
                      data-testid={`admin-outbound-delete-${c.id}`}
                      onClick={() => deleteDraft(c.id)}
                      disabled={sending === c.id}
                      style={dangerBtn}
                    >
                      Delete draft
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p style={{ marginTop: 36, fontSize: 12, opacity: 0.5, lineHeight: 1.6 }}>
        Controlled outbound policy: max 1 marketing email per 24h. No bot
        engagement, no auto-video posting, no spam funnels. Domain reputation
        is protected first.
      </p>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #2a3a32",
  background: "transparent",
  color: "inherit",
  fontSize: 14,
  borderRadius: 4,
};

const primaryBtn = {
  padding: "10px 22px",
  background: "#8aa291",
  color: "#0b0f0d",
  border: "none",
  cursor: "pointer",
  letterSpacing: "0.04em",
  fontSize: 13,
};

const ghostBtn = {
  padding: "8px 18px",
  background: "transparent",
  color: "#8aa291",
  border: "1px solid #8aa291",
  cursor: "pointer",
  fontSize: 12.5,
};

const dangerBtn = {
  padding: "8px 18px",
  background: "transparent",
  color: "#c97070",
  border: "1px solid #5a3030",
  cursor: "pointer",
  fontSize: 12.5,
};
