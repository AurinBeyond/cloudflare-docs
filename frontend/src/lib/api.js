import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const API_BASE = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

/* ----------------------- Content ----------------------- */
export async function fetchCategories(surface) {
  const res = await api.get("/content/categories", {
    params: surface ? { surface } : {},
  });
  return res.data;
}

export async function fetchEntries({ surface, category, access, q } = {}) {
  const res = await api.get("/content/entries", {
    params: { surface, category, access, q },
  });
  return res.data;
}

export async function fetchEntry(slug) {
  const res = await api.get(`/content/entries/${slug}`);
  return res.data;
}

export async function createEntry(payload) {
  const res = await api.post("/content/entries", payload);
  return res.data;
}

export async function createCategory(payload) {
  const res = await api.post("/content/categories", payload);
  return res.data;
}

/* ----------------------- GitHub sync (stub) ----------------------- */
export async function githubSync(payload = {}) {
  const res = await api.post("/content/sync/github", {
    repo: "owner/repo",
    branch: "main",
    path: "content",
    ...payload,
  });
  return res.data;
}

/* ----------------------- AI (stub) ----------------------- */
export async function aiChat(message, entrySlug) {
  const res = await api.post("/ai/chat", {
    message,
    entry_slug: entrySlug || null,
  });
  return res.data;
}

/* ----------------------- Validation (admin/internal) ----------------------- */
export async function validateMarkdown(markdown, sourcePath) {
  const res = await api.post("/content/validate", {
    markdown,
    source_path: sourcePath || null,
  });
  return res.data;
}

/* ----------------------- Admin overview ----------------------- */
export async function fetchAdminEntries(onlyWithWarnings = false) {
  const res = await api.get("/content/admin/entries", {
    params: { only_with_warnings: onlyWithWarnings },
  });
  return res.data;
}

/* ----------------------- Bookstore ----------------------- */
export async function fetchBooks(query) {
  const res = await api.get("/books", { params: query ? { q: query } : {} });
  return res.data;
}

export async function fetchBook(slug) {
  const res = await api.get(`/books/${slug}`);
  return res.data;
}
