/**
 * mediaConfig — single source of truth for external media URLs.
 *
 * Each field starts empty (null). Fill in via env vars at build time:
 *   REACT_APP_FIRST_LIGHT_AUDIO_URL   — guided meditation audio (mp3/m4a)
 *   REACT_APP_AMBIENT_VIDEO_URL       — silent ambient loop (YouTube/Vimeo/mp4)
 *   REACT_APP_COURSE_VIDEO_URL        — first course intro video
 *
 * No file uploads. No streaming infrastructure. Just URLs.
 * If a field is null, the consuming component must render a quiet
 * placeholder (audio) or nothing at all (video).
 */

const env = (k) => {
  const v = process.env[k];
  return v && v.trim() ? v.trim() : null;
};

export const mediaConfig = {
  firstLightAudioUrl: env("REACT_APP_FIRST_LIGHT_AUDIO_URL"),
  ambientVideoUrl: env("REACT_APP_AMBIENT_VIDEO_URL"),
  courseVideoUrl: env("REACT_APP_COURSE_VIDEO_URL"),
};

export default mediaConfig;
