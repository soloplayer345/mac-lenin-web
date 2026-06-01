import { SESSION_STORAGE_KEY, getApiBase } from "./config.js";
import {
  checkHealth,
  deleteHistory,
  getErrorMessage,
  getHistory,
  sendChat,
} from "./chat-api.js";
import { escapeHtml, formatChatMessageHtml } from "./markdown.js";

/** @typedef {{ role: 'user' | 'assistant', text: string, time: string }} ChatMessage */

function loadSessionId() {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

function saveSessionId(sessionId) {
  if (sessionId) {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  } else {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

/** @param {Array<{ role: string, content: string, createdAt: string }>} apiMessages */
function fromApiMessages(apiMessages) {
  return apiMessages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    text: m.content,
    time: m.createdAt,
  }));
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString("vi-VN");
  } catch {
    return iso;
  }
}

function formatTimeShort(iso) {
  try {
    return new Date(iso).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function createMessageRow(msg) {
  const isUser = msg.role === "user";
  const li = document.createElement("li");
  li.className = `chat-row ${isUser ? "chat-row--user" : "chat-row--assistant"}`;

  const avatar = document.createElement("div");
  avatar.className = "chat-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = isUser ? "B" : "AI";

  const wrap = document.createElement("div");
  wrap.className = "chat-bubble-wrap";

  const meta = document.createElement("div");
  meta.className = "chat-bubble-meta";

  const name = document.createElement("span");
  name.className = "chat-bubble-name";
  name.textContent = isUser ? "Bạn" : "Trợ lý AI";

  const timeEl = document.createElement("time");
  timeEl.className = "chat-bubble-time";
  timeEl.dateTime = msg.time;
  timeEl.textContent = formatTimeShort(msg.time);
  timeEl.title = formatTime(msg.time);

  meta.append(name, timeEl);

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${isUser ? "chat-bubble--user" : "chat-bubble--assistant"} md-content`;
  bubble.innerHTML = formatChatMessageHtml(msg.text, isUser ? "user" : "assistant");

  wrap.append(meta, bubble);
  li.append(avatar, wrap);
  return li;
}

function createLoadingRow() {
  const li = document.createElement("li");
  li.className = "chat-row chat-row--assistant chat-row--loading";
  li.setAttribute("aria-busy", "true");

  const avatar = document.createElement("div");
  avatar.className = "chat-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = "AI";

  const wrap = document.createElement("div");
  wrap.className = "chat-bubble-wrap";

  const meta = document.createElement("div");
  meta.className = "chat-bubble-meta";
  meta.innerHTML = '<span class="chat-bubble-name">Trợ lý AI</span><span class="chat-bubble-time">đang trả lời…</span>';

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble chat-bubble--assistant chat-bubble--typing";
  bubble.innerHTML =
    '<span class="chat-spinner" aria-hidden="true"></span><span>Đang suy nghĩ… (có thể mất 15–60 giây)</span>';

  wrap.append(meta, bubble);
  li.append(avatar, wrap);
  return li;
}

function renderMessages(listEl, messages, { loading = false } = {}) {
  listEl.innerHTML = "";

  if (messages.length === 0 && !loading) {
    const empty = document.createElement("li");
    empty.className = "chat-empty";
    empty.innerHTML = `
      <div class="chat-empty__icon" aria-hidden="true">💬</div>
      <p class="chat-empty__title">Bắt đầu hội thoại</p>
      <p class="chat-empty__hint">Hỏi về Chương 6 — vấn đề dân tộc và tôn giáo ở Việt Nam.</p>
    `;
    listEl.appendChild(empty);
    return;
  }

  messages.forEach((msg) => listEl.appendChild(createMessageRow(msg)));

  if (loading) {
    listEl.appendChild(createLoadingRow());
  }

  listEl.scrollTop = listEl.scrollHeight;
}

function setFormBusy(form, input, submitBtn, busy) {
  input.disabled = busy;
  if (submitBtn) {
    submitBtn.disabled = busy;
    submitBtn.textContent = busy ? "Đang gửi…" : "Gửi";
  }
  form.classList.toggle("chat-form--busy", busy);
}

function setStatus(el, state, text) {
  if (!el) return;
  el.className = `chat-status chat-status--${state}`;
  el.textContent = text;
}

export function exportChatMarkdown(messages) {
  const lines = [
    "# Nhật ký Chat — Mác Lênin Web",
    "",
    `**Xuất lúc:** ${new Date().toLocaleString("vi-VN")}`,
    `**API:** ${getApiBase()}`,
    "",
    "---",
    "",
  ];

  messages.forEach((m) => {
    const label = m.role === "user" ? "Người dùng" : "Trợ lý AI";
    lines.push(`### ${label} — ${formatTime(m.time)}`, "", m.text, "", "---", "");
  });

  return lines.join("\n");
}

export function initChat() {
  const listEl = document.getElementById("chat-messages");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const submitBtn = form?.querySelector('button[type="submit"]');
  const exportBtn = document.getElementById("chat-export");
  const clearBtn = document.getElementById("chat-clear");
  const newChatBtn = document.getElementById("chat-new");
  const statusEl = document.getElementById("chat-status");
  const errorEl = document.getElementById("chat-error");

  if (!listEl || !form || !input) return;

  /** @type {ChatMessage[]} */
  let messages = [];
  let sessionId = loadSessionId();
  let apiOnline = false;

  function showError(text) {
    if (!errorEl) return;
    if (!text) {
      errorEl.hidden = true;
      errorEl.textContent = "";
      return;
    }
    errorEl.hidden = false;
    errorEl.textContent = text;
  }

  async function refreshHealth() {
    setStatus(statusEl, "checking", "Đang kiểm tra kết nối API…");
    try {
      await checkHealth();
      apiOnline = true;
      setStatus(
        statusEl,
        "online",
        `Đã kết nối · ${getApiBase()} · Phiên: ${sessionId ? "đang dùng" : "mới"}`
      );
    } catch {
      apiOnline = false;
      setStatus(
        statusEl,
        "offline",
        `Chưa kết nối API · ${getApiBase()} — chạy backend hoặc đổi ?api=URL`
      );
    }
  }

  async function loadSessionFromServer() {
    if (!sessionId || !apiOnline) {
      renderMessages(listEl, messages);
      return;
    }

    try {
      const data = await getHistory(sessionId);
      messages = fromApiMessages(data.messages || []);
      renderMessages(listEl, messages);
    } catch (error) {
      if (error.status === 404) {
        sessionId = null;
        saveSessionId(null);
        messages = [];
        renderMessages(listEl, messages);
        return;
      }
      showError(getErrorMessage(error));
      renderMessages(listEl, messages);
    }
  }

  async function startNewChat() {
    if (sessionId && apiOnline) {
      try {
        await deleteHistory(sessionId);
      } catch {
        /* bỏ qua lỗi xóa server */
      }
    }
    sessionId = null;
    saveSessionId(null);
    messages = [];
    showError("");
    renderMessages(listEl, messages);
    input.focus();
    await refreshHealth();
  }

  refreshHealth().then(() => loadSessionFromServer());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) {
      showError("Vui lòng nhập câu hỏi.");
      input.focus();
      return;
    }

    if (!apiOnline) {
      showError("API chưa sẵn sàng. Kiểm tra backend (GET /health) rồi thử lại.");
      return;
    }

    showError("");
    setFormBusy(form, input, submitBtn, true);
    renderMessages(listEl, messages, { loading: true });

    try {
      const data = await sendChat(text, sessionId ?? undefined);
      sessionId = data.sessionId;
      saveSessionId(sessionId);
      messages = fromApiMessages(data.history || []);
      input.value = "";
      renderMessages(listEl, messages);
      await refreshHealth();
    } catch (error) {
      renderMessages(listEl, messages);
      showError(getErrorMessage(error));
      if (error.status === 404) {
        sessionId = null;
        saveSessionId(null);
      }
    } finally {
      setFormBusy(form, input, submitBtn, false);
      input.focus();
    }
  });

  exportBtn?.addEventListener("click", () => {
    const md = exportChatMarkdown(messages);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `chat-log-${stamp}.md`;
    a.click();
    URL.revokeObjectURL(url);
  });

  clearBtn?.addEventListener("click", async () => {
    if (!confirm("Xóa phiên chat trên server và bắt đầu lại?")) return;
    await startNewChat();
  });

  newChatBtn?.addEventListener("click", async () => {
    if (messages.length && !confirm("Bắt đầu cuộc trò chuyện mới?")) return;
    await startNewChat();
  });
}
