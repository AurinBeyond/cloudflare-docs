/**
 * Build the admin preview download URL for a paid book.
 *
 * If the admin token is present in this browser (set once via
 * /admin/preview-assets?token=...), append it to the path so the
 * backend bypasses auth and streams the PDF directly. Otherwise
 * return the regular cabinet path (which will redirect to login).
 */
export function adminBookPreviewUrl(slug, token) {
  const base = `/api/cabinet/library/${slug}/download`;
  if (!token) return base;
  return `${base}?admin_token=${encodeURIComponent(token)}`;
}
