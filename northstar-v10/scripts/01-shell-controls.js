/* Header tools: native mode bridge, accent picker, and mode switch. */
(() => {
  window.__northstarV10Modules ||= {};
  window.__northstarV10Modules.createShellControls = (context) => {
    const { root, accents, refreshCharts, installThemeTooltip } = context;
    const state = { syncToolState: () => {} };
  const readNativeMode = () => {
    const value = Number(localStorage.getItem("THEME_KEY"));
    if (value === 2) return "dark";
    if (value === 1) return "light";
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  const applyTheme = () => {
    const accent = localStorage.getItem("northstarAccent");
    root.dataset.nsAccent = accents.includes(accent) ? accent : "cyan";
    root.dataset.nsTheme = readNativeMode();
    root.dataset.nsThemeMotion = root.dataset.nsTheme;
    state.syncToolState();
    requestAnimationFrame(refreshCharts);
  };

  const getIconName = (wrapper) => {
    const icon = wrapper.querySelector("[data-icon]");
    if (icon) return (icon.getAttribute("data-icon") || "").toLowerCase().replace(/-outlined$|-filled$|-two-tone$/g, "");
    const labelled = wrapper.querySelector("[aria-label]");
    if (labelled) return (labelled.getAttribute("aria-label") || "").toLowerCase();
    const iconElement = wrapper.querySelector('[class*="anticon-"]');
    const className = iconElement?.getAttribute("class") || iconElement?.className || "";
    return String(className).match(/anticon-([a-z-]+)/)?.[1]?.replace(/-outlined$|-filled$|-two-tone$/g, "") || "";
  };

  const nativeThemeTrigger = () => {
    const actions = document.querySelector(".app-header-content > .btns:last-child");
    if (!actions) return null;
    const wrapper = [...actions.children].find((item) => getIconName(item) === "bg-colors");
    return wrapper?.querySelector(".right-nav-button") || null;
  };

  const isVisible = (element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
  };

  const clickNativeThemeItem = (mode) => {
    const value = mode === "dark" ? "2" : "1";
    const items = [...document.querySelectorAll(".ant-dropdown-menu-item")].filter(isVisible);
    if (!items.length) return false;
    const labels = mode === "dark"
      ? /深色|暗色|dark/i
      : /浅色|亮色|light/i;
    let target = items.find((item) => labels.test(item.textContent.trim()));
    if (!target) {
      target = items.find((item) => {
        const key = item.getAttribute("data-menu-id") || item.getAttribute("data-menu-key") || "";
        return new RegExp(`(?:^|[_-])${value}$`).test(key);
      });
    }
    if (!target && items.length >= 3) target = items[mode === "dark" ? 2 : 1];
    if (!target) return false;
    target.click();
    return true;
  };

  const setNativeMode = (mode) => {
    const safeMode = mode === "dark" ? "dark" : "light";
    localStorage.setItem("THEME_KEY", safeMode === "dark" ? "2" : "1");
    root.dataset.nsThemeMotion = safeMode;
    root.dataset.nsTheme = safeMode;
    document.body.classList.toggle("app-dark-theme", safeMode === "dark");
    document.body.classList.toggle("app-light-theme", safeMode !== "dark");
    const trigger = nativeThemeTrigger();
    if (!trigger) return;
    trigger.click();
    let attempts = 0;
    const choose = () => {
      if (clickNativeThemeItem(safeMode) || attempts++ >= 20) return;
      window.setTimeout(choose, 16);
    };
    window.setTimeout(choose, 0);
  };

  const buildTools = () => {
    let tools = document.querySelector(".northstar-v10-tools");
    if (tools) return tools;
    tools = document.createElement("div");
    tools.className = "northstar-v10-tools";
    tools.setAttribute("aria-label", "Northstar 界面工具");
    tools.innerHTML = `
      <button class="northstar-v10-button northstar-v10-mode" type="button" aria-label="切换深浅模式">
        <span class="northstar-v10-mode__decor northstar-v10-mode__stars" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="northstar-v10-mode__decor northstar-v10-mode__clouds" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="northstar-v10-mode__thumb" aria-hidden="true"></span>
        ${svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', "northstar-v10-mode__icon northstar-v10-mode__sun")}
        ${svg('<path d="M20.4 15.4A8.5 8.5 0 0 1 8.6 3.6 8.5 8.5 0 1 0 20.4 15.4Z"/>', "northstar-v10-mode__icon northstar-v10-mode__moon")}
      </button>
      <div class="northstar-v10-picker">
        <button class="northstar-v10-button" type="button" aria-label="选择主题色" aria-expanded="false">${svg('<path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a5 5 0 0 0 0-10h-4Z"/><circle cx="7.5" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="9.5" cy="6.5" r="1" fill="currentColor" stroke="none"/><circle cx="14" cy="6.5" r="1" fill="currentColor" stroke="none"/>')}</button>
        <div class="northstar-v10-menu" hidden role="radiogroup" aria-label="主题色">
          <button class="northstar-v10-choice" type="button" role="radio" data-accent="cyan" style="--swatch:#5086a1"><i></i>霁青</button>
          <button class="northstar-v10-choice" type="button" role="radio" data-accent="vermillion" style="--swatch:#ad4506"><i></i>陶朱</button>
          <button class="northstar-v10-choice" type="button" role="radio" data-accent="lotus" style="--swatch:#b06d88"><i></i>藕荷</button>
          <button class="northstar-v10-choice" type="button" role="radio" data-accent="gold" style="--swatch:#b59a2a"><i></i>麦金</button>
        </div>
      </div>`;
    document.body.appendChild(tools);

    const picker = tools.querySelector(".northstar-v10-picker");
    const trigger = picker.querySelector(":scope > button");
    const menu = picker.querySelector(".northstar-v10-menu");
    const mode = tools.querySelector(".northstar-v10-mode");
    installThemeTooltip(trigger);
    const sync = () => {
      mode.setAttribute("aria-pressed", String(root.dataset.nsTheme === "dark"));
      picker.querySelectorAll("[data-accent]").forEach((button) => button.setAttribute("aria-checked", String(button.dataset.accent === root.dataset.nsAccent)));
    };
    state.syncToolState = sync;
    mode.addEventListener("click", () => {
      setNativeMode(root.dataset.nsTheme === "dark" ? "light" : "dark");
      sync();
    });
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      menu.hidden = !menu.hidden;
      trigger.setAttribute("aria-expanded", String(!menu.hidden));
    });
    menu.addEventListener("click", (event) => {
      const button = event.target.closest("[data-accent]");
      if (!button) return;
      localStorage.setItem("northstarAccent", button.dataset.accent);
      applyTheme();
      sync();
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("pointerdown", (event) => {
      if (!picker.contains(event.target)) {
        menu.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
      }
    });
    sync();
    return tools;
  };
    return { applyTheme, buildTools };
  };
})();
