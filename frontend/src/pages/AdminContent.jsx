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

      {/* ---------- Validate (dry-run) ---------- */}
      <section className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container">
          <div className="aurin-eyebrow mb-4 flex items-center gap-2">
            <FileSearch size={12} /> Validate · Markdown dry-run
          </div>
          <h2 className="aurin-display text-3xl md:text-4xl max-w-[24ch] mb-4">
            Test before you{" "}
            <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">commit.</span>
          </h2>
          <p className="text-[14.5px] text-[hsl(var(--aurin-text-muted))] max-w-[60ch] mb-8">
            Paste raw markdown to see how the system will normalise it. The
            same resilient pipeline runs on every saved entry and on future
            GitHub-synced files. Warnings are internal — never shown to
            regular users.
          </p>

          <form onSubmit={handleValidate} className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="admin-validate-form">
            <div className="lg:col-span-7 space-y-4">
              <textarea
                rows={14}
                data-testid="admin-validate-input"
                value={validateText}
                onChange={(e) => setValidateText(e.target.value)}
                placeholder={"#### Orphan H4\n\nText.\n\n###### Even deeper\n\nMore text."}
                className="admin-input font-mono text-[13px]"
              />
              <button
                type="submit"
                disabled={validating}
                data-testid="admin-validate-run"
                className="aurin-btn aurin-btn-primary disabled:opacity-60"
              >
                {validating ? "Checking…" : "Run dry-run"}
                <Eye size={13} />
              </button>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="aurin-card p-5" data-testid="admin-validate-result">
                <div className="aurin-eyebrow mb-3">Result</div>
                {!validateResult ? (
                  <p className="text-[13px] text-[hsl(var(--aurin-text-muted))]">
                    Run a dry-run to see warnings, sections, and a sanitised
                    HTML preview.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--aurin-text-muted))] mb-2">
                        Warnings
                      </div>
                      {validateResult.warnings?.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {validateResult.warnings.map((w) => (
                            <span key={w} className="aurin-chip" data-testid={`admin-validate-warning-${w}`}>
                              {w.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[13px] text-[hsl(var(--aurin-sage))] inline-flex items-center gap-1.5">
                          <CheckCircle2 size={13} /> No warnings — clean.
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--aurin-text-muted))] mb-2">
                        Sections detected
                      </div>
                      {validateResult.sections?.length ? (
                        <ul className="space-y-1 text-[13px]">
                          {validateResult.sections.map((s) => (
                            <li
                              key={s.id}
                              className={s.level === 3 ? "pl-4 text-[hsl(var(--aurin-text-muted))]" : ""}
                            >
                              {s.title}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[13px] text-[hsl(var(--aurin-text-muted))]">none</p>
                      )}
                    </div>

                    <details>
                      <summary className="cursor-pointer text-[12px] text-[hsl(var(--aurin-text-muted))] hover:text-[hsl(var(--aurin-sage))]">
                        HTML preview
                      </summary>
                      <pre className="mt-3 rounded-lg bg-[hsl(var(--aurin-bg))] border border-[hsl(var(--aurin-border-soft))] p-3 text-[11.5px] leading-relaxed overflow-auto max-h-56">
{validateResult.html_preview}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ---------- Synced files / content health ---------- */}
      <section className="aurin-section-sm border-t border-[hsl(var(--aurin-border-soft))]">
        <div className="aurin-container">
          <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
            <div>
              <div className="aurin-eyebrow mb-3">Synced files · overview</div>
              <h2 className="aurin-display text-3xl md:text-4xl max-w-[24ch]">
                Content health,{" "}
                <span className="aurin-serif-italic text-[hsl(var(--aurin-sage))]">at a glance.</span>
              </h2>
              <p className="mt-3 text-[13.5px] text-[hsl(var(--aurin-text-muted))] max-w-[60ch]">
                Every entry currently in the system, with its source path and
                any internal validation warnings. When GitHub sync is enabled,
                this list will reflect the repo automatically.
              </p>
            </div>

            <div className="flex items-center gap-2" data-testid="admin-list-filters">
              <button
                onClick={() => {
                  setAdminFilter("all");
                  loadAdminEntries(false);
                }}
                data-testid="admin-list-filter-all"
                className={`text-[12.5px] px-3 py-1.5 rounded-full border transition-colors ${
                  adminFilter === "all"
                    ? "bg-[hsl(var(--aurin-text))] text-[hsl(var(--aurin-bg))] border-[hsl(var(--aurin-text))]"
                    : "border-[hsl(var(--aurin-border))] text-[hsl(var(--aurin-text))/0.85]"
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setAdminFilter("warnings");
                  loadAdminEntries(true);
                }}
                data-testid="admin-list-filter-warnings"
                className={`text-[12.5px] px-3 py-1.5 rounded-full border transition-colors ${
                  adminFilter === "warnings"
                    ? "bg-[hsl(var(--aurin-sand))] text-[hsl(var(--aurin-bg))] border-[hsl(var(--aurin-sand))]"
                    : "border-[hsl(var(--aurin-border))] text-[hsl(var(--aurin-text))/0.85]"
                }`}
              >
                With warnings
              </button>
            </div>
          </div>

          {adminLoading ? (
            <div className="text-[13px] text-[hsl(var(--aurin-text-muted))]" data-testid="admin-list-loading">
              Loading entries…
            </div>
          ) : adminEntries.length === 0 ? (
            <div data-testid="admin-list-empty" className="aurin-card p-8 text-[14px] text-[hsl(var(--aurin-text-muted))]">
              {adminFilter === "warnings"
                ? "No entries with validation warnings — everything is clean."
                : "No entries yet."}
            </div>
          ) : (
            <div className="aurin-card overflow-hidden" data-testid="admin-list">
              <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[hsl(var(--aurin-border-soft))] text-[10.5px] uppercase tracking-[0.2em] text-[hsl(var(--aurin-text-muted))]">
                <div className="col-span-4">Title</div>
                <div className="col-span-3">Source path</div>
                <div className="col-span-2">Surface</div>
                <div className="col-span-1">Source</div>
                <div className="col-span-2 text-right">Notes</div>
              </div>
              {adminEntries.map((e) => (
                <div
                  key={e.slug}
                  data-testid={`admin-list-row-${e.slug}`}
                  className="grid grid-cols-12 gap-3 px-5 py-4 border-b border-[hsl(var(--aurin-border-soft))] last:border-b-0 items-center text-[13px]"
                >
                  <div className="col-span-4">
                    <div className="aurin-display text-base leading-tight">{e.title}</div>
                    <div className="text-[11.5px] text-[hsl(var(--aurin-text-muted))] mt-1">{e.slug}</div>
                  </div>
                  <div className="col-span-3 font-mono text-[11.5px] text-[hsl(var(--aurin-text-muted))] truncate">
                    {e.source_path || "—"}
                  </div>
                  <div className="col-span-2 text-[hsl(var(--aurin-text-muted))]">
                    {e.surface}
                    {e.audience && (
                      <span className="text-[10.5px] block uppercase tracking-[0.18em] mt-0.5">
                        {e.audience.replace("-", " ")}
                      </span>
                    )}
                  </div>
                  <div className="col-span-1 text-[11.5px] uppercase tracking-[0.18em] text-[hsl(var(--aurin-text-muted))]">
                    {e.source}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    {e.validation_warnings?.length ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11.5px] px-2.5 py-1 rounded-full border border-[hsl(var(--aurin-sand))/0.4] text-[hsl(var(--aurin-sand))]"
                        data-testid={`admin-list-row-${e.slug}-warnings`}
                        title={e.validation_warnings.join(", ")}
                      >
                        <AlertTriangle size={11} />
                        {e.validation_warnings.length}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-[hsl(var(--aurin-sage))]">
                        <CheckCircle2 size={11} /> Clean
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
