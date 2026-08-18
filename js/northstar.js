(() => {
  "use strict";

  const root = document.documentElement;
  const media = matchMedia("(prefers-color-scheme: dark)");
  const modes = ["auto", "light", "dark"];
  const accents = ["cyan", "vermillion", "lotus", "gold"];
  let transitionTimer = 0;

  const getStored = (key, allowed, fallback) => {
    const value = localStorage.getItem(key);
    return allowed.includes(value) ? value : fallback;
  };
  const resolvedTheme = (mode) => mode === "auto" ? (media.matches ? "dark" : "light") : mode;
  const icon = (paths) => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;

  const updateThemeColor = (theme) => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#1b1c1f" : "#fffcf5";
  };

  const updateControls = () => {
    document.querySelectorAll("[data-ns-accent]").forEach((button) => {
      button.setAttribute("aria-checked", String(button.dataset.nsAccent === root.dataset.accent));
    });
    document.querySelectorAll(".northstar-theme-toggle").forEach((button) => {
      const dark = root.dataset.theme === "dark";
      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute("aria-label", dark ? "切换至浅色模式" : "切换至深色模式");
    });
  };

  const markTransition = (from, to) => {
    if (from === to || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    clearTimeout(transitionTimer);
    root.classList.remove("ns-to-light", "ns-to-dark");
    root.classList.add(to === "dark" ? "ns-to-dark" : "ns-to-light");
    root.dataset.themeMotion = to;
    transitionTimer = window.setTimeout(() => root.classList.remove("ns-to-light", "ns-to-dark"), 700);
  };

  const applyTheme = (mode, persist = true) => {
    const safeMode = modes.includes(mode) ? mode : "auto";
    const previous = root.dataset.theme;
    const resolved = resolvedTheme(safeMode);
    root.dataset.themeMode = safeMode;
    root.dataset.theme = resolved;
    markTransition(previous, resolved);
    updateThemeColor(resolved);
    if (persist) localStorage.setItem("theme", safeMode);
    if (document.body) {
      document.body.classList.remove("auto", "light", "dark");
      document.body.classList.add(safeMode);
    }
    updateControls();
  };

  const applyAccent = (accent) => {
    const safeAccent = accents.includes(accent) ? accent : "cyan";
    root.dataset.accent = safeAccent;
    localStorage.setItem("northstarAccent", safeAccent);
    updateControls();
  };

  const buildTools = () => {
    if (document.querySelector(".northstar-tools")) return;
    const tools = document.createElement("div");
    tools.className = "northstar-tools";
    tools.setAttribute("aria-label", "界面工具");
    tools.innerHTML = `
      <div class="northstar-color-picker">
        <button class="northstar-icon-button northstar-accent-trigger" type="button" aria-label="选择主题色" aria-haspopup="true" aria-expanded="false">
          ${icon('<path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="9.5" cy="6.5" r="1" fill="currentColor" stroke="none"/><circle cx="14" cy="6.5" r="1" fill="currentColor" stroke="none"/>')}
        </button>
        <div class="northstar-color-menu" role="radiogroup" aria-label="主题色">
          <button class="northstar-color-choice" type="button" role="radio" data-ns-accent="cyan" style="--swatch:#5086a1"><span></span>霁青${icon('<path d="m5 12 4 4L19 6"/>')}</button>
          <button class="northstar-color-choice" type="button" role="radio" data-ns-accent="vermillion" style="--swatch:#ad4506"><span></span>陶朱${icon('<path d="m5 12 4 4L19 6"/>')}</button>
          <button class="northstar-color-choice" type="button" role="radio" data-ns-accent="lotus" style="--swatch:#b06d88"><span></span>藕荷${icon('<path d="m5 12 4 4L19 6"/>')}</button>
          <button class="northstar-color-choice" type="button" role="radio" data-ns-accent="gold" style="--swatch:#b59a2a"><span></span>麦金${icon('<path d="m5 12 4 4L19 6"/>')}</button>
        </div>
      </div>
      <button class="northstar-theme-toggle northstar-theme-switch" type="button" aria-pressed="false" aria-label="切换至深色模式">
        <span class="northstar-theme-decor northstar-theme-stars" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="northstar-theme-decor northstar-theme-clouds" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="northstar-theme-thumb" aria-hidden="true"></span>
        ${icon('<circle class="northstar-theme-sun" cx="12" cy="12" r="4"/><path class="northstar-theme-sun" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>')}
        ${icon('<path class="northstar-theme-moon" d="M20.4 15.4A8.5 8.5 0 0 1 8.6 3.6 8.5 8.5 0 1 0 20.4 15.4Z"/>')}
      </button>`;
    document.body.appendChild(tools);

    const picker = tools.querySelector(".northstar-color-picker");
    const trigger = tools.querySelector(".northstar-accent-trigger");
    const themeToggle = tools.querySelector(".northstar-theme-toggle");
    tools.insertBefore(themeToggle, picker);
    const setPicker = (open) => {
      picker.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
    };

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      setPicker(!picker.classList.contains("is-open"));
    });
    themeToggle.addEventListener("click", () => applyTheme(root.dataset.theme === "dark" ? "light" : "dark"));
    tools.addEventListener("click", (event) => {
      const accent = event.target.closest("[data-ns-accent]");
      if (!accent) return;
      applyAccent(accent.dataset.nsAccent);
      setPicker(false);
    });
    document.addEventListener("pointerdown", (event) => {
      if (!tools.contains(event.target)) setPicker(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setPicker(false);
        trigger.focus();
      }
    });
    updateControls();
  };

  const init = () => {
    root.dataset.typography = "heavy";
    applyAccent(getStored("northstarAccent", accents, "cyan"));
    applyTheme(getStored("theme", modes, "auto"), false);
    buildTools();
  };

  media.addEventListener?.("change", () => {
    if (root.dataset.themeMode === "auto") applyTheme("auto", false);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
