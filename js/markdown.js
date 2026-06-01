/**
 * Render Markdown an toàn cho tin chat (phản hồi AI từ Ollama thường là Markdown).
 */

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Gộp xuống dòng giữa câu (tránh tách chữ kiểu "anh" / "em**") */
function normalizeSoftBreaks(text) {
  const lines = text.split("\n");
  const out = [];

  const isBlockStart = (line) => {
    const t = line.trim();
    return (
      !t ||
      /^#{1,6}\s/.test(t) ||
      /^[-*]\s+/.test(t) ||
      /^\d+\.\s+/.test(t) ||
      /^---+$/.test(t)
    );
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    while (i + 1 < lines.length && line.trim() && !isBlockStart(lines[i + 1])) {
      const cur = line.trimEnd();
      const next = lines[i + 1].trimStart();
      if (/^---+$/.test(cur) || /^---+$/.test(next)) break;
      if (/[.!?:…]\s*$/.test(cur) || /^#{1,6}\s/.test(next)) break;
      line = `${cur} ${next}`;
      i += 1;
    }
    out.push(line);
  }

  return out.join("\n");
}

function inlineMarkdown(text) {
  let html = escapeHtml(text);

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*([^*\n]+)\*([^*]|$)/g, "$1<em>$2</em>$3");

  return html;
}

/**
 * @param {string} md
 * @returns {string} HTML (chỉ thẻ an toàn: p, ul, ol, li, strong, em, code, hr, h4)
 */
export function markdownToHtml(md) {
  if (!md || !String(md).trim()) return "";

  const text = normalizeSoftBreaks(md.normalize("NFC").replace(/\r\n/g, "\n").trim());
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      blocks.push('<hr class="md-hr" />');
      i += 1;
      continue;
    }

    const h4 = trimmed.match(/^####\s+(.+)$/);
    if (h4) {
      blocks.push(`<h4 class="md-h4">${inlineMarkdown(h4[1])}</h4>`);
      i += 1;
      continue;
    }

    const h3 = trimmed.match(/^###\s+(.+)$/);
    if (h3) {
      blocks.push(`<h4 class="md-h4">${inlineMarkdown(h3[1])}</h4>`);
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^[-*]\s+/, "");
        items.push(`<li>${inlineMarkdown(item)}</li>`);
        i += 1;
      }
      blocks.push(`<ul class="md-ul">${items.join("")}</ul>`);
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^\d+\.\s+/, "");
        items.push(`<li>${inlineMarkdown(item)}</li>`);
        i += 1;
      }
      blocks.push(`<ol class="md-ol">${items.join("")}</ol>`);
      continue;
    }

    const paraLines = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || /^---+$/.test(t) || /^#{1,6}\s/.test(t) || /^[-*]\s+/.test(t) || /^\d+\.\s+/.test(t)) {
        break;
      }
      paraLines.push(t);
      i += 1;
    }
    if (paraLines.length) {
      blocks.push(`<p class="md-p">${inlineMarkdown(paraLines.join(" "))}</p>`);
    }
  }

  return blocks.join("");
}

/** Tin người dùng: chỉ escape, không parse Markdown */
export function plainTextToHtml(text) {
  return escapeHtml(text).replace(/\n/g, "<br />");
}

/**
 * @param {string} text
 * @param {'user' | 'assistant'} role
 */
export function formatChatMessageHtml(text, role) {
  if (role === "user") return plainTextToHtml(text);
  return markdownToHtml(text);
}
