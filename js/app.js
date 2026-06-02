import { initTabs } from "./tabs.js";
import { initContentPanels } from "./content-loader.js";
import { initChat } from "./chat.js";
function initHeroScroll() {
  const cta = document.querySelector("[data-scroll-target]");
  if (!cta) return;

  cta.addEventListener("click", () => {
    const targetId = cta.dataset.scrollTarget;
    const panel = document.getElementById(targetId);
    const mainBtn = document.querySelector('[data-tab="main"]');
    if (mainBtn) mainBtn.click();
    panel?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initContentPanels();
  initChat();
  initHeroScroll();
});
