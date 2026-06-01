/**
 * Điều hướng 3 tab qua thanh nav (layout HCM202).
 */
export function initTabs() {
  const buttons = document.querySelectorAll(".tab-bar__btn");
  const panels = document.querySelectorAll(".tab-panel");

  function activate(tabId) {
    buttons.forEach((btn) => {
      const isActive = btn.dataset.tab === tabId;
      btn.setAttribute("aria-selected", String(isActive));
      btn.classList.toggle("is-active", isActive);
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.panel === tabId;
      panel.setAttribute("aria-hidden", String(!isActive));
      panel.classList.toggle("is-active", isActive);
    });

    document.querySelector(".main-layout")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => activate(btn.dataset.tab));
  });

  activate("main");
}
