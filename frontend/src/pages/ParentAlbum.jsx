/**
 * ParentAlbum.jsx — /parent-portal/album
 *
 * §STARS-PHASE-2 2026-02-09 — Quiet memory gallery. Each photo
 * was attached when the parent approved a child's Angel Star.
 * Caption + the action that triggered the star are shown beside.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { ArrowRight, Camera, Heart } from "lucide-react";
import { api } from "@/lib/api";
import { BACKEND_URL } from "@/lib/backendUrl";

export default function ParentAlbum() {
  const [album, setAlbum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    api.get("/memory-album/me")
      .then((r) => setAlbum(r.data.album || []))
      .catch((e) => { if (e?.response?.status === 401) setAuthError(true); })
      .finally(() => setLoading(false));
  }, []);

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-[hsl(var(--aurin-text))]">
        <div className="text-center max-w-md">
          <h2 className="aurin-display text-2xl mb-3">Sign in to see your album.</h2>
          <Link to="/portal" data-testid="parent-album-signin"
                className="aurin-btn aurin-btn-primary inline-flex items-center gap-2">
            Sign in <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="parent-portal-album">
      <PageHeader tone="kids"
        eyebrow="Memory Album · Parent Portal"
        title="Small moments you"
        italicWord="quietly kept."
        description="Photos you attached when approving your child's Angel Stars. A private, soft gallery — no feed, no algorithm."
      />

      <section className="aurin-section-sm">
        <div className="aurin-container">
          {loading ? (
            <p className="text-[14px] italic text-[hsl(var(--aurin-text-muted))]">Opening the album…</p>
          ) : album.length === 0 ? (
            <div className="aurin-card p-8 text-center" data-testid="parent-album-empty">
              <Camera size={28} className="mx-auto mb-3 text-[hsl(var(--aurin-text-muted))]" />
              <h3 className="aurin-display text-xl mb-2">No photos yet.</h3>
              <p className="text-[14px] text-[hsl(var(--aurin-text-muted))] mb-5 max-w-md mx-auto leading-relaxed">
                Next time you approve a star in
                <Link to="/parent-portal/stars" className="aurin-link mx-1">the Stars portal</Link>,
                tap the camera icon to keep a photo here.
              </p>
              <Link to="/parent-portal/stars"
                    data-testid="parent-album-go-stars"
                    className="aurin-btn aurin-btn-primary inline-flex items-center gap-2">
                Go to Stars <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="parent-album-grid">
              {album.map((m) => (
                <figure key={m.id}
                        data-testid={`parent-album-item-${m.id}`}
                        className="aurin-card overflow-hidden">
                  <img src={`${BACKEND_URL}/api/memory-album/photo/${m.photo_key}`}
                       alt={m.tied_to_label || "Memory"}
                       className="w-full h-56 object-cover bg-[hsl(var(--aurin-bg-soft))]" />
                  <figcaption className="p-4">
                    <p className="aurin-eyebrow mb-1 flex items-center gap-1.5">
                      <Heart size={10} /> {new Date(m.created_at).toLocaleDateString()}
                    </p>
                    {m.caption && (
                      <p className="text-[14px] italic text-[hsl(var(--aurin-text))] mb-2 leading-relaxed">
                        "{m.caption}"
                      </p>
                    )}
                    {m.tied_to_label && (
                      <p className="text-[12.5px] text-[hsl(var(--aurin-text-muted))]">
                        {m.tied_to_label}
                      </p>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
