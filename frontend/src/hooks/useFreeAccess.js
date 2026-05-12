/**
 * useFreeAccess.js — global gift-window helper.
 *
 * Fetches `/api/aurin/free-access` once per browser session and caches
 * the result module-side. While `active === true`, every payment
 * surface on the site (tier cards, course buy buttons, cabinet
 * booking prices, bookstore prices, MembershipTiers, etc.) should
 * hide its price tag and either show "Free during launch — until
 * [date]" or "Coming soon" instead.
 *
 * The hook returns:
 *   {
 *     active: boolean,
 *     until: string | null,
 *     loaded: boolean,
 *     formattedUntil: string | null,
 *   }
 *
 * It NEVER throws. If the fetch fails the window is treated as
 * inactive so the existing paid flow continues unaffected.
 */
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

let _CACHE = null;
let _PROMISE = null;

async function fetchFreeAccess() {
  if (_CACHE) return _CACHE;
  if (!_PROMISE) {
    _PROMISE = api
      .get("/aurin/free-access")
      .then((r) => {
        _CACHE = {
          active: !!r?.data?.active,
          until: r?.data?.until || null,
        };
        return _CACHE;
      })
      .catch(() => {
        _CACHE = { active: false, until: null };
        return _CACHE;
      });
  }
  return _PROMISE;
}

function formatUntil(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function useFreeAccess() {
  const [state, setState] = useState({
    active: !!_CACHE?.active,
    until: _CACHE?.until || null,
    loaded: !!_CACHE,
    formattedUntil: _CACHE?.until ? formatUntil(_CACHE.until) : null,
  });

  useEffect(() => {
    let alive = true;
    fetchFreeAccess().then((data) => {
      if (!alive) return;
      setState({
        active: !!data.active,
        until: data.until,
        loaded: true,
        formattedUntil: formatUntil(data.until),
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
