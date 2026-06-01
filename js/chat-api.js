import { getApiBase } from "./config.js";

const CHAT_TIMEOUT_MS = 120_000;

function buildHeaders() {
  const base = getApiBase();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (base.includes("ngrok")) {
    headers["ngrok-skip-browser-warning"] = "true";
  }
  return headers;
}

async function fetchJson(path, options = {}) {
  const base = getApiBase();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

  try {
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers: { ...buildHeaders(), ...options.headers },
      signal: controller.signal,
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = { success: false, message: `Phản hồi không hợp lệ (HTTP ${res.status})` };
    }

    if (!res.ok || data?.success === false) {
      const err = new Error(data?.message ?? `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      const err = new Error("Hết thời gian chờ (quá 2 phút). Vui lòng thử lại.");
      err.status = 408;
      throw err;
    }
    if (error instanceof TypeError) {
      const err = new Error(
        `Không kết nối được API tại ${base}. Kiểm tra backend đang chạy và địa chỉ trong cấu hình.`
      );
      err.status = 0;
      throw err;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkHealth() {
  return fetchJson("/health", { method: "GET" });
}

/**
 * @param {string} message
 * @param {string} [sessionId]
 * @returns {Promise<{ sessionId: string, answer: string, history: Array<{ role: string, content: string, createdAt: string }> }>}
 */
export async function sendChat(message, sessionId) {
  const body = { message };
  if (sessionId) body.sessionId = sessionId;
  return fetchJson("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * @param {string} sessionId
 */
export async function getHistory(sessionId) {
  return fetchJson(`/api/ai/history/${encodeURIComponent(sessionId)}`, {
    method: "GET",
  });
}

/**
 * @param {string} sessionId
 */
export async function deleteHistory(sessionId) {
  try {
    return await fetchJson(`/api/ai/history/${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (error.status === 404) return { success: true };
    throw error;
  }
}

export function getErrorMessage(error) {
  if (error.status === 503) {
    return "Hệ thống AI chưa sẵn sàng. Liên hệ người vận hành hoặc thử lại sau.";
  }
  if (error.status === 400) {
    return error.message || "Vui lòng nhập câu hỏi.";
  }
  if (error.status === 404) {
    return "Phiên chat không còn trên server. Bắt đầu cuộc trò chuyện mới.";
  }
  if (error.status === 408 || error.status === 0) {
    return error.message;
  }
  return error.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
}
