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
  // §AUTH-DEFENSE 2026-05-20 — Allow same-site / cross-origin cookies
  // to ride along on every request. Required for Google /auth/session
  // recovery: if the Emergent OAuth proxy ever returns an empty
  // session_token in the JSON body (so Bearer fails to mount), the
  // httpOnly cookie set by the backend still grants identity. Magic-
  // link path remains unchanged.
  withCredentials: true,
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
export async function fetchAdminReminders() {
  const res = await api.get("/admin/reminders");
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

export async function fetchBeginningStep(n) {
  const res = await api.get(`/experience/the-beginning/step/${n}`);
  return res.data;
}

/* ----------------------- Cabinet — Your Materials ----------------------- */
export async function fetchCabinetLibrary() {
  const res = await api.get("/cabinet/library");
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
import { getBrowserMemory, appendBrowserFragment, markBrowserVisit, clearBrowserMemory } from "@/lib/browserMemory";

export async function fetchCabinet() {
  const res = await api.get("/cabinet/me");
  return res.data;
}
export async function startCabinet() {
  // §HYBRID MEMORY: replay last-turn fragments from this device so the
  // mentor's first reply has soft context at $0 cost.
  const mem = getBrowserMemory();
  const payload = {};
  if (mem.fragments && mem.fragments.length) {
    payload.transient_context = mem.fragments;
  }
  const res = await api.post("/cabinet/start", payload);
  markBrowserVisit();
  return res.data;
}
export async function sendCabinetMessage(text, keepThread = false) {
  // Save the wanderer's own line locally before the round-trip; if the
  // network fails the fragment still survives for next time.
  appendBrowserFragment(text);
  const res = await api.post("/cabinet/message", { text, keep_thread: keepThread });
  return res.data;
}
export async function clearCabinet() {
  clearBrowserMemory();
  const res = await api.post("/cabinet/clear");
  return res.data;
}
export async function fetchCabinetThreads() {
  const res = await api.get("/cabinet/threads");
  return res.data;
}
export async function resumeCabinetThread({ thread_key, session_id }) {
  const res = await api.post("/cabinet/resume", {
    thread_key: thread_key || null,
    session_id: session_id || null,
  });
  return res.data;
}

/* ----------------------- Clarity Release (paid timed sessions) -------- */
export async function fetchClarityPasses() {
  // Public endpoint — lists 3 tiers + beta note. No auth required.
  const res = await api.get("/clarity/passes");
  return res.data;
}
export async function fetchClarityAccess() {
  // Auth required — returns user's active pass + seconds remaining.
  const res = await api.get("/clarity/access");
  return res.data;
}
export async function startClaritySession() {
  const res = await api.post("/clarity/start");
  return res.data;
}

/* ----------------------- Clarity beta window --------------------- */
export async function fetchClarityBetaWindow() {
  // Public — {active, start, end}
  const res = await api.get("/clarity/beta-window");
  return res.data;
}
export async function grantBetaPass(tier) {
  // Auth required — grants a free pass during the beta window.
  const res = await api.post(`/clarity/passes/${tier}/grant-beta`);
  return res.data;
}

/* ----------------------- Clarity prefs / threshold ---------------- */
export async function fetchClarityPrefs() {
  const res = await api.get("/clarity/prefs");
  return res.data;
}
export async function fetchChatUsage() {
  // §W-3 (iter 62) — daily chat cap usage. Returns
  //   {date, used, ceiling, remaining, tier}
  // ceiling=null & remaining=null mean unlimited (admin).
  try {
    const res = await api.get("/chat/usage");
    return res.data;
  } catch {
    return null;
  }
}
export async function updateClarityPrefs({
  guide_gender,
  display_mode,
  consent_v2,
  save_threads,
} = {}) {
  const payload = {};
  if (guide_gender !== undefined) payload.guide_gender = guide_gender;
  if (display_mode !== undefined) payload.display_mode = display_mode;
  if (consent_v2) payload.consent_v2 = true;
  if (typeof save_threads === "boolean") payload.save_threads = save_threads;
  const res = await api.post("/clarity/prefs", payload);
  return res.data;
}
export async function clarityEmergencyExit() {
  const res = await api.post("/clarity/emergency-exit");
  return res.data;
}

/* ----------------------- Body Room ------------------------------- */
export async function fetchBodyHotspots() {
  const res = await api.get("/body-room/hotspots");
  return res.data;
}
export async function recordBodyInsight({ region, self_report, intensity }) {
  const res = await api.post("/body-room/insight", {
    region,
    self_report: self_report ?? null,
    intensity: intensity ?? null,
  });
  return res.data;
}
export async function fetchBodyInsights(limit = 5) {
  const res = await api.get(`/body-room/insights?limit=${limit}`);
  return res.data;
}
export async function fetchBodyChildrenPatterns() {
  const res = await api.get("/body-room/children-patterns");
  return res.data;
}
export async function fetchBodyFurtherReading() {
  const res = await api.get("/body-room/further-reading");
  return res.data;
}
export async function fetchBodyPatterns() {
  const res = await api.get("/body-room/patterns");
  return res.data;
}
export async function fetchBodyQuestionnaire() {
  const res = await api.get("/body-room/questionnaire");
  return res.data;
}

/* ----------------------- Beta test group ----------------------- */
export async function fetchBetaStatus() {
  const res = await api.get("/beta/status");
  return res.data;
}
export async function fetchBetaMe() {
  const res = await api.get("/beta/me");
  return res.data;
}
export async function enrollBeta() {
  const res = await api.post("/beta/enroll");
  return res.data;
}


/* ----------------------- Course Room — Quiet Letters ----------------------- */
export async function fetchCourses() {
  const res = await api.get("/courses");
  return res.data;
}
export async function fetchCourse(slug) {
  const res = await api.get(`/courses/${slug}`);
  return res.data;
}
export async function enrollCourse(slug) {
  const res = await api.post(`/courses/${slug}/enroll`);
  return res.data;
}

/* ---- First Letter funnel (lead magnet) ---- */
export async function sendFirstLetter(email, courseSlug) {
  const res = await api.post("/first-letter", {
    email,
    course_slug: courseSlug,
    consent: true,
  });
  return res.data;
}

