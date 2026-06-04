const API_BASE_STORAGE_KEY = "mac-lenin-api-base";

function readBuiltInApiBase() {
  if (typeof window === "undefined" || !window.__MAC_LENIN_API_BASE__) return null;
  const value = String(window.__MAC_LENIN_API_BASE__).replace(/\/$/, "");
  if (!value || value.includes("%MAC_LENIN_API_BASE%")) return null;
  return value;
}

/**
 * Base URL backend (không có slash cuối).
 * Ưu tiên: ?api=... → env build (js/env.js) → localStorage → localhost:5000
 */
export function getApiBase() {
  if (typeof window !== "undefined") {
    const fromQuery = new URLSearchParams(window.location.search).get("api");
    if (fromQuery) {
      const url = fromQuery.replace(/\/$/, "");
      localStorage.setItem(API_BASE_STORAGE_KEY, url);
      return url;
    }
  }

  const builtIn = readBuiltInApiBase();
  if (builtIn) return builtIn;

  const stored = typeof localStorage !== "undefined" ? localStorage.getItem(API_BASE_STORAGE_KEY) : null;
  if (stored) return stored.replace(/\/$/, "");

  return "http://localhost:5000";
}

export function setApiBase(url) {
  localStorage.setItem(API_BASE_STORAGE_KEY, url.replace(/\/$/, ""));
}

export const SESSION_STORAGE_KEY = "mac-lenin-chat-session-id";
