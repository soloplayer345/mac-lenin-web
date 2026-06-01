const API_BASE_STORAGE_KEY = "mac-lenin-api-base";

/**
 * Base URL backend (không có slash cuối).
 * Ưu tiên: ?api=... trên URL → localStorage → window.__MAC_LENIN_API_BASE__ → localhost:5000
 */
export function getApiBase() {
  if (typeof window !== "undefined") {
    const fromQuery = new URLSearchParams(window.location.search).get("api");
    if (fromQuery) {
      localStorage.setItem(API_BASE_STORAGE_KEY, fromQuery.replace(/\/$/, ""));
    }
  }

  const stored = typeof localStorage !== "undefined" ? localStorage.getItem(API_BASE_STORAGE_KEY) : null;
  if (stored) return stored.replace(/\/$/, "");

  if (typeof window !== "undefined" && window.__MAC_LENIN_API_BASE__) {
    return String(window.__MAC_LENIN_API_BASE__).replace(/\/$/, "");
  }

  return "http://localhost:5000";
}

export function setApiBase(url) {
  localStorage.setItem(API_BASE_STORAGE_KEY, url.replace(/\/$/, ""));
}

export const SESSION_STORAGE_KEY = "mac-lenin-chat-session-id";
