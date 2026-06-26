/**
 * ParentStars.jsx — /parent-portal/stars
 *
 * §KIDS-HUBS 2026-02-09 — Adult-facing companion to KidsStarsView.
 * Lives in the Aurin house (dark/sage) palette — NOT the bright
 * cream of the child hubs. The parent gets a calm, quiet list of
 * pending star requests across all their child profiles, approves
 * or rejects them, and sees a small summary per child.
 */

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { CheckCircle2, XCircle, ArrowRight, Sparkles, Clock, Camera, Heart, Ear, Eye, Award } from "lucide-react";
import { api } from "@/lib/api";

const STAMP_ICONS = { listener: Ear, patient: Heart, playful: Sparkles, present: Eye, champion: Award };

export default function ParentStars() {
  const [data, setData] = useState({ children: [], pending: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [stamps, setStamps] = useState({ stamps: [], total: 0 });
  const [photoFor, setPhotoFor] = useState(null); // request_id of star pending photo
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoBase64, setPhotoBase64] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [r, s] = await Promise.all([
        api.get("/angel-stars/parent-portal"),
        api.get("/parent-stamps/me").catch(() => ({ data: { stamps: [], total: 0 } })),
      ]);
      setData(r.data);
      setStamps(s.data);
      setAuthError(false);
    } catch (e) {
      if (e?.response?.status === 401) setAuthError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const decide = async (req, approve) => {
    setBusy(req.id);
    try {
      if (approve) {
        // Use approve-with-photo path (handles both regular + reciprocal).
        await api.post("/angel-stars/approve-with-photo", { request_id: req.id });
      } else {
        await api.post("/angel-stars/reject", { request_id: req.id });
      }
      await refresh();
    } catch {}
    setBusy(null);
  };

  const handlePhotoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Photo too large (max 2MB). Pick a smaller one.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const approveWithPhoto = async () => {
    if (!photoFor) return;
    setBusy(photoFor);
    try {
      const r = await api.post("/angel-stars/approve-with-photo", {
        request_id: photoFor,
        photo_base64: photoBase64,
        photo_content_type: "image/jpeg",
        caption: photoCaption,
      });
      if (r?.data?.photo_warning) {
        alert("Your approval was saved, but the photo could not be kept. Try a different image.");
      }
      setPhotoFor(null);
      setPhotoCaption("");
      setPhotoBase64(null);
      await refresh();
    } catch {}
    setBusy(null);
  };

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-[hsl(var(--aurin-text))]">
        <div className="text-center max-w-md">
          <h2 className="aurin-display text-2xl mb-3">A quiet sign-in first.</h2>
          <p className="text-[14.5px] text-[hsl(var(--aurin-text-muted))] mb-6">
            The Angel Stars portal is reserved for parents who have signed in.
            Sign in with your Google account and we'll bring you back here.
          </p>
          <Link
            to="/portal"
            data-testid="parent-stars-signin"
            className="aurin-btn aurin-btn-primary inline-flex items-center gap-2"
          >
            Sign in <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="parent-portal-stars">
      <PageHeader
        tone="kids"
        eyebrow="Angel Stars · Parent Portal"
        title="The small things your child"
        italicWord="quietly does well."
        description="A calm record of the kind, brave, helpful moments your child has tapped into Aurin's Room. Approve what's true, gently ignore what isn't. There is no pressure — just attention."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container">
          {/* Per-child summary */}
          {data.children && data.children.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10" data-testid="parent-stars-children">
              {data.children.map((c) => (
                <Link
                  to={`/kids-universe/${c.child_slug}/stars`}
                  key={c.child_slug}
                  data-testid={`parent-stars-child-${c.child_slug}`}
                  className="aurin-card p-5 block hover:border-[hsl(var(--aurin-sage))/0.5]"
                >
                  <p className="aurin-eyebrow mb-2">{c.age_range}</p>
                  <h3 className="aurin-display text-lg leading-snug">{c.title}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span
                      className="text-[28px] font-serif text-[hsl(var(--aurin-amber))]"
                      data-testid={`parent-stars-child-${c.child_slug}-balance`}
                    >
                      {c.balance}
                    </span>
                    <span className="text-[14px] text-[hsl(var(--aurin-text-muted))]">★ stars</span>
                  </div>
                  <p className="mt-1 text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
                    {c.total_earned} earned · {c.pending_count} waiting
                  </p>
                </Link>
              ))}
            </div>
          )}

          {/* §STARS-PHASE-2 2026-02-09 — Parent Stamps collection.
              Quiet recognition the parent earns from being involved
              (reciprocal stars approved, weekly check-in counts, etc). */}
          {stamps.stamps && stamps.stamps.length > 0 && (
            <div className="mb-10" data-testid="parent-stamps-section">
              <div className="aurin-eyebrow mb-3">Your stamps</div>
              <p className="text-[13.5px] text-[hsl(var(--aurin-text-muted))] mb-5 max-w-[52ch] leading-relaxed">
                Small recognition for being there. Earned softly as you listen,
                play, and stay close.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3" data-testid="parent-stamps-grid">
                {stamps.stamps.map((s) => {
                  const Icon = STAMP_ICONS[s.slug] || Sparkles;
                  const earned = s.count > 0;
                  return (
                    <div key={s.slug}
                         data-testid={`parent-stamp-${s.slug}`}
                         className="aurin-card p-4 text-center"
                         style={{ opacity: earned ? 1 : 0.5 }}>
                      <Icon size={20} className={`mx-auto mb-2 ${earned ? "text-[hsl(var(--aurin-amber))]" : "text-[hsl(var(--aurin-text-muted))]"}`} />
                      <p className="text-[13px] font-medium text-[hsl(var(--aurin-text))]">{s.title}</p>
                      <p className="text-[11px] text-[hsl(var(--aurin-text-muted))] mt-1">{s.count > 0 ? `×${s.count}` : "—"}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pending queue */}
          <div className="aurin-eyebrow mb-3 flex items-center gap-2">
            <Clock size={11} /> Pending · {data.pending?.length || 0}
          </div>
          <h2 className="aurin-display text-2xl md:text-3xl max-w-[26ch] mb-7">
            What your child says they did.
          </h2>
          {loading ? (
            <p className="text-[14px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))]">
              One quiet breath…
            </p>
          ) : data.pending && data.pending.length > 0 ? (
            <ul className="space-y-3" data-testid="parent-stars-pending">
              {data.pending.map((req) => (
                <li
                  key={req.id}
                  data-testid={`parent-stars-pending-${req.id}`}
                  className="aurin-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1">
                    <p className="aurin-eyebrow mb-1.5">
                      {req.child_title || req.child_slug} · {new Date(req.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-[15px] leading-snug text-[hsl(var(--aurin-text))]">
                      {req.action_label}
                    </p>
                    <p className="text-[12.5px] text-[hsl(var(--aurin-sage))] mt-1.5 flex items-center gap-1">
                      <Sparkles size={11} /> +{req.stars} ★ if approved
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => decide(req, false)}
                      disabled={busy === req.id}
                      data-testid={`parent-stars-reject-${req.id}`}
                      className="aurin-btn aurin-btn-ghost text-[13px] inline-flex items-center gap-1.5"
                    >
                      <XCircle size={13} /> Not yet
                    </button>
                    {/* §STARS-PHASE-2 — optional photo attach button.
                        Skipped for reciprocal (child-to-parent) rows
                        because the photo flow is for child memories. */}
                    {req.direction !== "child_to_parent" && (
                      <button
                        type="button"
                        onClick={() => { setPhotoFor(req.id); setPhotoCaption(""); setPhotoBase64(null); }}
                        disabled={busy === req.id}
                        data-testid={`parent-stars-photo-${req.id}`}
                        title="Approve and add a photo memory"
                        className="aurin-btn aurin-btn-ghost text-[13px] inline-flex items-center gap-1.5"
                      >
                        <Camera size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => decide(req, true)}
                      disabled={busy === req.id}
                      data-testid={`parent-stars-approve-${req.id}`}
                      className="aurin-btn aurin-btn-primary text-[13px] inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p
              className="text-[14px] aurin-serif-italic text-[hsl(var(--aurin-text-muted))]"
              data-testid="parent-stars-empty"
            >
              Nothing waiting just now. Your child will tap a star when one feels true.
            </p>
          )}

          {/* Recent history */}
          {data.history && data.history.length > 0 && (
            <div className="mt-12">
              <div className="aurin-eyebrow mb-3">Recently approved</div>
              <ul className="space-y-2" data-testid="parent-stars-history">
                {data.history.slice(0, 12).map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center gap-3 text-[13.5px] text-[hsl(var(--aurin-text-muted))] border-b border-[hsl(var(--aurin-border-soft))] pb-2"
                  >
                    <CheckCircle2 size={13} className="text-[hsl(var(--aurin-sage))]" />
                    <span className="flex-1">
                      {h.child_title || h.child_slug} · {h.action_label}
                    </span>
                    <span className="text-[hsl(var(--aurin-amber))]">+{h.stars} ★</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* §STARS-PHASE-2 — Memory Album discovery link */}
          <div className="mt-10 text-center">
            <Link to="/parent-portal/album"
                  data-testid="parent-stars-album-link"
                  className="aurin-link inline-flex items-center gap-1.5 text-[13px]">
              Open the memory album <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </section>

      {/* Photo upload modal */}
      {photoFor && (
        <div data-testid="parent-stars-photo-modal"
             className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm"
             onClick={() => setPhotoFor(null)}>
          <div className="aurin-card max-w-md w-full p-6"
               onClick={(e) => e.stopPropagation()}>
            <h3 className="aurin-display text-xl mb-2">A memory to keep</h3>
            <p className="text-[13px] text-[hsl(var(--aurin-text-muted))] mb-5">
              Attach a photo to mark this small moment. Lives only in your
              private album. JPG/PNG, up to 2MB.
            </p>
            <input type="file" accept="image/*" onChange={handlePhotoFile}
                   data-testid="parent-stars-photo-file"
                   className="block w-full text-[13px] mb-4 text-[hsl(var(--aurin-text-muted))]
                              file:mr-3 file:px-3 file:py-2 file:rounded-lg
                              file:border-0 file:bg-[hsl(var(--aurin-sage)/0.18)]
                              file:text-[hsl(var(--aurin-sage))] file:text-[12px] file:cursor-pointer" />
            {photoBase64 && (
              <img src={photoBase64} alt="preview" className="rounded-lg mb-4 max-h-48 mx-auto" />
            )}
            <input type="text" value={photoCaption}
                   onChange={(e) => setPhotoCaption(e.target.value)}
                   placeholder="A short note (optional)"
                   data-testid="parent-stars-photo-caption"
                   className="w-full px-3.5 py-2.5 rounded-xl text-[14px] bg-[hsl(var(--aurin-bg-soft))]
                              border border-[hsl(var(--aurin-border-soft))] outline-none mb-5
                              text-[hsl(var(--aurin-text))]" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setPhotoFor(null)}
                      data-testid="parent-stars-photo-cancel"
                      className="aurin-btn aurin-btn-ghost text-[13px]">
                Cancel
              </button>
              <button type="button" onClick={approveWithPhoto}
                      disabled={busy === photoFor}
                      data-testid="parent-stars-photo-save"
                      className="aurin-btn aurin-btn-primary text-[13px]">
                Approve & keep
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
