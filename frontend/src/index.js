import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// §STABILIZATION 2026-05-19 — Build version marker. Lets the founder
// instantly confirm whether the browser is running the latest deployed
// bundle or a stale cached one (the only known remaining vector for
// the "Grace hears nothing" symptom). Look for this line in DevTools
// Console; if you see an older date there, do Cmd+Shift+R / Ctrl+F5
// to bust the cache.
// eslint-disable-next-line no-console
console.log(
  "%c Matrix Aurin · build 2026-05-19-sunrise ",
  "background:#c4a46b;color:#0b0a08;padding:4px 8px;border-radius:2px;letter-spacing:0.18em;font-weight:300;",
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
