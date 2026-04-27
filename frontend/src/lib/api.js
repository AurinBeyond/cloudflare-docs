import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const API_BASE = `${BACKEND_URL}/api`;

const TOKEN_KEY = "aurin_session_token";

export function setSessionToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getSessionToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((cfg) => {
  const t = getSessionToken();
  if (t) cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${t}` };
  return cfg;
});

/* ----------------------- Content ----------------------- */
export async function fetchCategories(surface) {
  const res = await api.get("/content/categories", {
    params: surface ? { surface } : {},
  });
  return res.data;
}

export async function fetchEntries({ surface, category, audience, access, q } = {}) {
  const res = await api.get("/content/entries", {
    params: { surface, category, audience, access, q },
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

/* ----------------------- GitHub sync ----------------------- */
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

/* ----------------------- The Beginning (experience) ----------------------- */
export async function fetchBeginningStatus() {
  const res = await api.get("/experience/the-beginning/me");
  return res.data;
}

export async function startBeginning() {
  const res = await api.post("/experience/the-beginning/start");
  return res.data;
}

export async function submitBeginningReflection(text, presence) {
  const res = await api.post("/experience/the-beginning/reflect", {
    text,
    presence: presence ?? null,
  });
  return res.data;
}

export async function resetBeginning() {
  const res = await api.post("/experience/the-beginning/reset");
  return res.data;
}

/* ----------------------- Blog ----------------------- */
export async function fetchBlogPosts() {
  const res = await api.get("/blog");
  return res.data;
}

export async function fetchBlogPost(slug) {
  const res = await api.get(`/blog/${slug}`);
  return res.data;
}

export async function subscribeNewsletter(email, source) {
  const res = await api.post("/newsletter", {
    email,
    consent: true,
    source: source || null,
  });
  return res.data;
}

/* ----------------------- Private Cabinet ----------------------- */
export async function fetchCabinet() {
  const res = await api.get("/cabinet/me");
  return res.data;
}
export async function startCabinet() {
  const res = await api.post("/cabinet/start");
  return res.data;
}
export async function sendCabinetMessage(text, keepThread = false) {
  const res = await api.post("/cabinet/message", { text, keep_thread: keepThread });
  return res.data;
}
export async function clearCabinet() {
  const res = await api.post("/cabinet/clear");
  return res.data;
}
