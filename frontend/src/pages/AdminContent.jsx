import { useEffect, useState } from "react";
import { ShieldAlert, Plus, RefreshCcw, CheckCircle2, AlertTriangle, FileSearch, Eye } from "lucide-react";
import { fetchCategories, createEntry, githubSync, validateMarkdown, fetchAdminEntries } from "@/lib/api";

/**
 * Admin (light). Minimal, intentional form to add a content entry.
 * No auth — clearly labelled as internal. Kept extremely small.
 */
export default function AdminContent() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    description: "",
    category_slug: "",
    surface: "library",
    kind: "article",
    access: "free",
    tags: "",
    markdown: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Markdown validate dry-run
  const [validateText, setValidateText] = useState("");
  const [validateResult, setValidateResult] = useState(null);
  const [validating, setValidating] = useState(false);

  // Synced files / content health overview
  const [adminEntries, setAdminEntries] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFilter, setAdminFilter] = useState("all"); // "all" | "warnings"

  useEffect(() => {
    (async () => {
      const cats = await fetchCategories();
      setCategories(cats);
      if (cats.length && !form.category_slug) {
        setForm((f) => ({ ...f, category_slug: cats[0].slug, surface: cats[0].surface }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (k) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const next = { ...f, [k]: value };
      if (k === "category_slug") {
        const cat = categories.find((c) => c.slug === value);
        if (cat) next.surface = cat.surface;
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setSaved(false);
    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      await createEntry(payload);
      setSaved(true);
      setForm((f) => ({ ...f, slug: "", title: "", description: "", markdown: "", tags: "" }));
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Could not save the entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await githubSync();
      setSyncResult(res);
    } finally {
      setSyncing(false);
    }
  };

  const handleValidate = async (e) => {
    e.preventDefault();
    setValidating(true);
    setValidateResult(null);
    try {
      const res = await validateMarkdown(validateText);
      setValidateResult(res);
    } finally {
      setValidating(false);
    }
  };

  const loadAdminEntries = async (onlyWarnings = false) => {
    setAdminLoading(true);
    try {
      const rows = await fetchAdminEntries(onlyWarnings);
      setAdminEntries(rows);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    loadAdminEntries(false);
  }, []);

  return (
    <div data-testid="page-admin">
      <section className="relative border-b border-[hsl(var(--aurin-border-soft))]">
        <div className="absolute inset-0 aurin-grid-bg opacity-[0.18]" />
        <div className="aurin-container relative pt-16 pb-10">
          <div className="aurin-eyebrow mb-4">Admin · Content (Light)</div>
          <h1 className="aurin-display text-4xl md:text-5xl max-w-[20ch]">
            Add and organise{" "}
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">
              content.
            </span>
          </h1>
          <p className="mt-5 max-w-[60ch] text-[14.5px] leading-relaxed text-[hsl(var(--aurin-text-muted))]">
            This is the minimal authoring surface. It exists so new entries
            can be added while the GitHub sync is being finalised. No auth
            is enforced yet — treat this page as internal.
          </p>
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-[hsl(var(--aurin-sand))/0.35] bg-[hsl(var(--aurin-surface))] p-4 text-[13.5px] text-[hsl(var(--aurin-text))/0.9] max-w-[720px]">
            <ShieldAlert size={16} className="mt-0.5 text-[hsl(var(--aurin-sand))]" />
            <div>
              Internal use only. Role-based access and authentication will be
              wired before this surface is exposed publicly.
            </div>
          </div>
        </div>
      </section>

      <section className="aurin-section-sm">
        <div className="aurin-container grid grid-cols-1 lg:grid-cols-12 gap-12">
          <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-5" data-testid="admin-entry-form">
            <Row label="Title">
              <input
                required
                data-testid="admin-field-title"
                className="admin-input"
                value={form.title}
                onChange={handleChange("title")}
                placeholder="Morning Orientation Protocol"
              />
            </Row>
            <Row label="Slug (URL)">
              <input
                required
                pattern="[a-z0-9\-]+"
                data-testid="admin-field-slug"
                className="admin-input"
                value={form.slug}
                onChange={handleChange("slug")}
                placeholder="morning-orientation-protocol"
              />
            </Row>
            <Row label="Description">
              <textarea
                rows={2}
                data-testid="admin-field-description"
                className="admin-input"
                value={form.description}
                onChange={handleChange("description")}
                placeholder="A short, structured text-based guide."
              />
            </Row>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Row label="Category">
                <select
                  required
                  data-testid="admin-field-category"
                  className="admin-input"
                  value={form.category_slug}
                  onChange={handleChange("category_slug")}
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} ({c.surface})
                    </option>
                  ))}
                </select>
              </Row>
              <Row label="Kind">
                <select
                  data-testid="admin-field-kind"
                  className="admin-input"
                  value={form.kind}
                  onChange={handleChange("kind")}
                >
                  <option value="article">Article</option>
                  <option value="book">Book</option>
                  <option value="protocol">Protocol</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                </select>
              </Row>
              <Row label="Access">
                <select
                  data-testid="admin-field-access"
                  className="admin-input"
                  value={form.access}
                  onChange={handleChange("access")}
                >
                  <option value="free">Free</option>
                  <option value="member">Member</option>
                </select>
              </Row>
            </div>
            <Row label="Tags (comma-separated)">
              <input
                data-testid="admin-field-tags"
                className="admin-input"
                value={form.tags}
                onChange={handleChange("tags")}
                placeholder="daily, orientation"
              />
            </Row>
            <Row label="Markdown content">
              <textarea
                rows={14}
                data-testid="admin-field-markdown"
                className="admin-input font-mono text-[13px]"
                value={form.markdown}
                onChange={handleChange("markdown")}
                placeholder={"## Section\n\nText goes here.\n\n### Sub-section\n\nMore text."}
              />
              <p className="mt-2 text-[12px] text-[hsl(var(--aurin-text-muted))]">
                Headings (##) become sections on the entry page.
              </p>
            </Row>

            {err && (
              <div data-testid="admin-error" className="text-[13px] text-red-300/90">
                {err}
              </div>
            )}
            {saved && (
              <div data-testid="admin-success" className="inline-flex items-center gap-2 text-[13px] text-[hsl(var(--aurin-sage))]">
                <CheckCircle2 size={14} /> Entry saved.
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              data-testid="admin-submit"
              className="aurin-btn aurin-btn-primary disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save entry"} <Plus size={14} />
            </button>
          </form>

          <aside className="lg:col-span-4 space-y-6">
            <div className="aurin-card p-6">
              <div className="aurin-eyebrow mb-3">GitHub · Sync</div>
              <h3 className="aurin-display text-xl">Pull from repository</h3>
              <p className="mt-3 text-[13.5px] text-[hsl(var(--aurin-text-muted))] leading-relaxed">
                The sync endpoint is prepared. It currently returns a
                non-connected status — the integration point is ready to
                receive a repo, branch, and path.
              </p>
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                data-testid="admin-github-sync"
                className="aurin-btn aurin-btn-ghost mt-5 w-full"
              >
                {syncing ? "Checking…" : "Check sync status"}
                <RefreshCcw size={13} />
              </button>
              {syncResult && (
                <pre
                  data-testid="admin-github-sync-result"
                  className="mt-4 rounded-lg bg-[hsl(var(--aurin-bg))] border border-[hsl(var(--aurin-border-soft))] p-3 text-[11.5px] leading-relaxed overflow-auto max-h-56 text-[hsl(var(--aurin-text))/0.85]"
                >
{JSON.stringify(syncResult, null, 2)}
                </pre>
              )}
            </div>

            <div className="aurin-card p-6">
              <div className="aurin-eyebrow mb-3">Roles · Future</div>
              <p className="text-[13.5px] text-[hsl(var(--aurin-text-muted))] leading-relaxed">
                Planned roles: <span className="text-[hsl(var(--aurin-text))]">guest</span>,{" "}
                <span className="text-[hsl(var(--aurin-text))]">member</span>,{" "}
                <span className="text-[hsl(var(--aurin-text))]">admin</span>. Access is already
                modelled on each entry ("free" vs "member") and will be enforced once
                authentication is wired.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <style>{`
        .admin-input {
          width: 100%;
          background: hsl(var(--aurin-bg));
          border: 1px solid hsl(var(--aurin-border-soft));
          color: hsl(var(--aurin-text));
          border-radius: 10px;
          padding: 0.7rem 0.9rem;
          font-size: 14px;
          outline: none;
          transition: border-color 200ms ease;
        }
        .admin-input:focus {
          border-color: hsl(var(--aurin-sage));
        }
      `}</style>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--aurin-text-muted))] mb-2">
        {label}
      </div>
      {children}
    </label>
  );
}
