/**
 * Tải nội dung từ content/*.md hoặc *.html (ưu tiên .md).
 */
async function fetchText(path) {
  const res = await fetch(path);
  if (!res.ok) return null;
  return res.text();
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inlineMarkdown(text) {
  let html = escapeHtml(text)
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a class="content-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Chỉ autolink URL đứng riêng — tránh bọc lại URL đã nằm trong href
  html = html.replace(
    /(^|[^"'>=])(https?:\/\/[^\s<")]+)/g,
    '$1<a class="content-link" href="$2" target="_blank" rel="noopener noreferrer">$2</a>'
  );

  return html;
}

function chunkTextFromBody(bodyLines) {
  const bullets = bodyLines
    .map((line) => line.match(/^- (.+)$/))
    .filter(Boolean)
    .map((match) => match[1].trim());

  if (bullets.length) return bullets;

  const text = bodyLines.join(" ").trim();
  if (!text) return [];

  const sentences = text.split(/(?<=[.!?…])\s+/).filter((part) => part.trim().length > 12);
  return sentences.length > 1 ? sentences : [text];
}

function miniCardHtml(text) {
  return `<article class="topic-card topic-card--mini card-hover">
    <p class="topic-card__text">${inlineMarkdown(text)}</p>
  </article>`;
}

function insightGroupHtml(label, chunks) {
  if (!chunks.length) return "";
  return `<div class="insight-group">
    <p class="insight-group__label">${inlineMarkdown(label)}</p>
    <div class="card-grid card-grid--mini">${chunks.map((chunk) => miniCardHtml(chunk)).join("")}</div>
  </div>`;
}

function topicCardsFromBlock(block) {
  const lines = block.trim().split("\n");
  const groups = [];
  let i = 0;

  while (i < lines.length) {
    const h4 = lines[i].match(/^#### (.+)$/);
    if (h4) {
      const title = h4[1];
      const bodyLines = [];
      i += 1;
      while (i < lines.length && !lines[i].match(/^#{2,4} /)) {
        if (lines[i].trim()) bodyLines.push(lines[i].trim());
        i += 1;
      }
      groups.push(insightGroupHtml(title, chunkTextFromBody(bodyLines)));
      continue;
    }
    i += 1;
  }

  if (!groups.length) return "";
  return `<div class="insight-groups">${groups.join("")}</div>`;
}

function renderSection(index, title, body) {
  const num = String(index).padStart(2, "0");
  const eyebrow = title.replace(/^\d+\.\s*/, "").toUpperCase();

  let inner = "";
  const h3Parts = body.split(/^### /m).filter(Boolean);

  if (h3Parts.length === 0) {
    inner = topicCardsFromBlock(body) || `<div class="prose-block">${formatPlainBlock(body)}</div>`;
  } else {
    inner = h3Parts
      .map((part) => {
        const [subTitle, ...rest] = part.split("\n");
        const subBody = rest.join("\n").trim();
        const cards = topicCardsFromBlock(subBody);
        const extra = !cards && subBody ? `<div class="prose-block">${formatPlainBlock(subBody)}</div>` : "";
        return `<div class="content-subsection">
          <h3 class="content-subsection__title">${inlineMarkdown(subTitle.trim())}</h3>
          ${cards}${extra}
        </div>`;
      })
      .join("");
  }

  return `<section class="content-section">
    <p class="section-eyebrow"><span>${num}</span> / ${escapeHtml(eyebrow)}</p>
    <h2 class="content-section__title">${inlineMarkdown(title)}</h2>
    ${inner}
  </section>`;
}

function formatPlainBlock(block) {
  const chunks = [];
  let paragraph = [];
  let listItems = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    chunks.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (!listItems.length) return;
    chunks.push(`<ul>${listItems.map((li) => `<li>${inlineMarkdown(li)}</li>`).join("")}</ul>`);
    listItems = [];
  }

  for (const line of block.split("\n")) {
    const bullet = line.match(/^(\s*)- (.+)$/);
    if (bullet && bullet[1].length === 0) {
      flushParagraph();
      listItems.push(bullet[2]);
      continue;
    }
    if (bullet && bullet[1].length > 0) {
      flushParagraph();
      flushList();
      chunks.push(`<ul class="content-sublist"><li>${inlineMarkdown(bullet[2])}</li></ul>`);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  return chunks.join("");
}

function simpleMarkdownToHtml(md) {
  let body = md.normalize("NFC").replace(/\r\n/g, "\n").trim();

  if (body.startsWith("# ")) {
    body = body.slice(body.indexOf("\n") + 1).trim();
  }

  let intro = "";
  const firstH2 = body.search(/^## /m);
  if (firstH2 > 0) {
    intro = body.slice(0, firstH2).trim();
    body = body.slice(firstH2);
  }

  const sections = body.split(/^## /m).filter(Boolean);
  const introHtml = intro ? `<div class="prose-block intro-block">${formatPlainBlock(intro)}</div>` : "";

  if (!sections.length) {
    return introHtml + formatPlainBlock(body);
  }

  const sectionsHtml = sections
    .map((section, index) => {
      const [titleLine, ...bodyLines] = section.split("\n");
      return renderSection(index + 1, titleLine.trim(), bodyLines.join("\n"));
    })
    .join("\n");

  return introHtml + sectionsHtml;
}

export async function loadContent(slug, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const base = `content/${slug}`;
  const md = await fetchText(`${base}.md`);
  if (md) {
    el.innerHTML = simpleMarkdownToHtml(md);
    return;
  }

  const html = await fetchText(`${base}.html`);
  if (html) {
    el.innerHTML = html;
    return;
  }

  el.innerHTML = `
    <p class="content-placeholder">
      Chưa có file <code>${base}.md</code> hoặc <code>${base}.html</code>.
      Tạo file trong thư mục <strong>content/</strong> để hiển thị nội dung tại đây.
    </p>`;
}

export function initContentPanels() {
  loadContent("noi-dung-chinh", "content-main");
  loadContent("phu-luc-ai", "content-appendix");
}
