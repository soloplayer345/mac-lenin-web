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
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function topicCardsFromBlock(block) {
  const lines = block.trim().split("\n");
  const cards = [];
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
      cards.push(
        `<article class="topic-card card-hover">
          <h4 class="topic-card__title">${inlineMarkdown(title)}</h4>
          <p class="topic-card__text">${inlineMarkdown(bodyLines.join(" "))}</p>
        </article>`
      );
      continue;
    }
    i += 1;
  }

  if (!cards.length) return "";
  return `<div class="card-grid">${cards.join("")}</div>`;
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
    const bullet = line.match(/^- (.+)$/);
    if (bullet) {
      flushParagraph();
      listItems.push(bullet[1]);
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
