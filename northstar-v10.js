(() => {
  "use strict";

  const root = document.documentElement;
  const scriptUrl = new URL(document.currentScript?.src || "./northstar-v10.js", document.baseURI);
  const assetVersion = scriptUrl.searchParams.get("v") || "current";
  const repositoryUrl = "https://github.com/DavidBlackCN/MCSM-Northstar-Interface";
  const accents = ["cyan", "vermillion", "lotus", "gold"];
  const icons = {
    overview: '<path d="M4 19V10M10 19V5M16 19v-7M22 19H2"/>',
    instance: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    market: '<path d="M4 9h16l-1 11H5L4 9Z"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/>',
    user: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M14 15.5a5 5 0 0 1 7 4.5"/>',
    node: '<rect x="9" y="3" width="6" height="5" rx="1.5"/><rect x="3" y="16" width="6" height="5" rx="1.5"/><rect x="15" y="16" width="6" height="5" rx="1.5"/><path d="M12 8v4M6 16v-4h12v4"/>',
    file: '<path d="M3 7h7l2 2h9v10H3z"/><path d="M3 7V5h7l2 2"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
    quickstart: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    image: '<path d="M4 5h16v5H4zM5 10h14v9H5z"/><path d="M9 14h6"/>',
    setting: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"/>',
    default: '<path d="M4 6h16M4 12h16M4 18h10"/>'
  };
  const metricIcons = {
    nodes: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    instances: '<path d="M5 8h14v11H5z"/><path d="M8 8V5h8v3M9 12h6M9 15h4"/>',
    logins: '<path d="M4 6h16v12H4z"/><path d="M8 10h8M8 14h5"/>',
    resources: '<path d="M5 6h10v10H5z"/><path d="M15 9h4v9h-9v-2"/><path d="M8 9h4M8 12h3"/>'
  };
  const instanceNodeIcon = '<rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/>';
  let syncToolState = () => {};
  let loginObserved = /#\/login(?:$|[?&])/.test(location.hash);
  let redirectedAfterLogin = false;

  const currentPalette = () => {
    const style = getComputedStyle(root);
    const accent = style.getPropertyValue("--ns-accent").trim() || "#5086a1";
    const border = style.getPropertyValue("--ns-border").trim() || "rgba(48,49,54,.12)";
    const muted = style.getPropertyValue("--ns-text-faint").trim() || "#858991";
    return { accent, border, muted };
  };

  const withAlpha = (color, alpha) => {
    if (!color.startsWith("#")) return color;
    const value = color.slice(1);
    const full = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
    const number = Number.parseInt(full, 16);
    return `rgba(${number >> 16}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
  };

  const mapChartColor = (value) => {
    if (typeof value !== "string") return value;
    const normalized = value.replace(/\s+/g, "").toLowerCase();
    const { accent, border, muted } = currentPalette();
    const direct = new Map([
      ["rgba(67,145,250,0.95)", accent],
      ["rgba(67,145,250,0.5)", withAlpha(accent, .5)],
      ["rgba(67,145,250,0.3)", withAlpha(accent, .3)],
      ["rgba(67,145,250,0.55)", withAlpha(accent, .34)],
      ["rgba(40,100,210,0.15)", withAlpha(accent, .12)],
      ["rgba(17,60,150,0)", withAlpha(accent, 0)],
      ["rgba(100,130,180,0.2)", border],
      ["rgba(100,130,180,0.12)", border],
      ["rgba(160,180,210,0.7)", muted],
      ["#94b8e0", muted]
    ]);
    return direct.get(normalized) || value;
  };

  const installChartColorBridge = () => {
    if (window.__northstarChartBridge) return;
    window.__northstarChartBridge = true;
    const prototype = window.CanvasRenderingContext2D?.prototype;
    if (!prototype) return;
    ["strokeStyle", "fillStyle", "shadowColor"].forEach((property) => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
      if (!descriptor?.set || !descriptor.get) return;
      Object.defineProperty(prototype, property, {
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
        get: descriptor.get,
        set(value) { descriptor.set.call(this, mapChartColor(value)); }
      });
    });
    const createLinearGradient = prototype.createLinearGradient;
    prototype.createLinearGradient = function (...args) {
      const gradient = createLinearGradient.apply(this, args);
      const addColorStop = gradient.addColorStop;
      gradient.addColorStop = function (offset, color) {
        return addColorStop.call(this, offset, mapChartColor(color));
      };
      return gradient;
    };
  };

  const installTerminalFontBridge = () => {
    if (window.__northstarTerminalFontBridge) return;
    window.__northstarTerminalFontBridge = true;
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      // MCSM's terminal selects WebGL when available, but that renderer owns
      // its font atlas and ignores CSS. Keep ordinary 2D charts untouched and
      // make the terminal use xterm's Canvas renderer instead.
      if (type === "webgl2" && /\/(?:terminal|console)(?:[/?]|$)/i.test(location.hash)) return null;
      return originalGetContext.call(this, type, ...args);
    };
    const prototype = window.CanvasRenderingContext2D?.prototype;
    const descriptor = prototype && Object.getOwnPropertyDescriptor(prototype, "font");
    if (!descriptor?.get || !descriptor.set) return;
    Object.defineProperty(prototype, "font", {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      get: descriptor.get,
      set(value) {
        const canvas = this.canvas;
        const isTerminalRoute = /\/(?:terminal|console)(?:[/?]|$)/i.test(location.hash);
        const isTerminal = isTerminalRoute || (canvas instanceof Element && Boolean(canvas.closest(".xterm, .terminal-container")));
        const font = isTerminal && typeof value === "string"
          ? value.replace(/(\d+(?:\.\d+)?px(?:\/\S+)?\s+).+$/i, '$1"Maple Mono", monospace')
          : value;
        descriptor.set.call(this, font);
      }
    });
  };

  const installThemeTooltip = (trigger) => {
    if (trigger.dataset.northstarTooltipReady === "true") return;
    trigger.dataset.northstarTooltipReady = "true";
    let tooltip;
    let hideTimer;
    const hide = () => {
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        tooltip?.remove();
        tooltip = undefined;
      }, 80);
    };
    const show = () => {
      window.clearTimeout(hideTimer);
      if (!tooltip) {
        tooltip = document.createElement("div");
        const styleHash = [...document.querySelectorAll("[class]")]
          .flatMap((element) => [...element.classList])
          .find((className) => /^css-[a-z0-9]+$/i.test(className));
        tooltip.className = ["ant-tooltip", styleHash, "ant-tooltip-placement-bottom", "northstar-v10-tooltip"].filter(Boolean).join(" ");
        tooltip.setAttribute("role", "tooltip");
        tooltip.innerHTML = '<div class="ant-tooltip-content"><div class="ant-tooltip-arrow"><span class="ant-tooltip-arrow-content"></span></div><div class="ant-tooltip-inner" role="tooltip"><span>主题色</span></div></div>';
        document.body.appendChild(tooltip);
      }
      const rect = trigger.getBoundingClientRect();
      tooltip.style.left = `${window.scrollX + rect.left + rect.width / 2}px`;
      tooltip.style.top = `${window.scrollY + rect.bottom + 5}px`;
      requestAnimationFrame(() => tooltip?.classList.add("northstar-v10-tooltip--visible"));
    };
    trigger.addEventListener("pointerenter", show);
    trigger.addEventListener("pointerleave", hide);
    trigger.addEventListener("focus", show);
    trigger.addEventListener("blur", hide);
    trigger.addEventListener("click", hide);
  };

  const installBackgroundConfigBridge = () => {
    if (window.__northstarBackgroundConfigBridge) return;
    window.__northstarBackgroundConfigBridge = true;

    let pendingBackgroundValue;
    let pendingBackgroundAt = 0;
    const backgroundFormItem = () => [...document.querySelectorAll(".ant-form-item")].find((item) =>
      /界面背景图片|interface background image/i.test(item.textContent || "")
    );

    document.addEventListener("click", (event) => {
      const button = event.target.closest?.("button");
      const formItem = button?.closest?.(".ant-form-item");
      if (!button || formItem !== backgroundFormItem()) return;
      const buttons = [...formItem.querySelectorAll("button")];
      const actionIndex = buttons.indexOf(button);
      if (actionIndex < 1) return;
      pendingBackgroundValue = actionIndex === buttons.length - 1
        ? ""
        : (formItem.querySelector("input")?.value || "").trim();
      pendingBackgroundAt = Date.now();
    }, true);

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url, ...args) {
      this.__northstarRequest = {
        method: String(method || "GET").toUpperCase(),
        url: String(url || "")
      };
      return originalOpen.call(this, method, url, ...args);
    };
    XMLHttpRequest.prototype.send = function (body) {
      const request = this.__northstarRequest;
      const isLayoutSave = request?.method === "POST" && /\/api\/overview\/layout(?:\?|$)/.test(request.url);
      const hasPendingValue = pendingBackgroundValue !== undefined && Date.now() - pendingBackgroundAt < 120000;
      if (isLayoutSave && hasPendingValue && typeof body === "string") {
        try {
          const layout = JSON.parse(body);
          const settings = Array.isArray(layout)
            ? layout.find((entry) => entry?.page === "__settings__")
            : null;
          if (settings) {
            settings.theme ||= {};
            settings.theme.backgroundImage = pendingBackgroundValue;
            body = JSON.stringify(layout);
            pendingBackgroundValue = undefined;
            pendingBackgroundAt = 0;
          }
        } catch {}
      }
      return originalSend.call(this, body);
    };

    const originalFetch = window.fetch;
    window.fetch = function (input, init = {}) {
      const requestUrl = typeof input === "string" ? input : input?.url || "";
      const requestMethod = String(init.method || (typeof input !== "string" ? input?.method : "GET") || "GET").toUpperCase();
      const hasPendingValue = pendingBackgroundValue !== undefined && Date.now() - pendingBackgroundAt < 120000;
      if (requestMethod === "POST" && /\/api\/overview\/layout(?:\?|$)/.test(requestUrl) && hasPendingValue && typeof init.body === "string") {
        try {
          const layout = JSON.parse(init.body);
          const settings = Array.isArray(layout)
            ? layout.find((entry) => entry?.page === "__settings__")
            : null;
          if (settings) {
            settings.theme ||= {};
            settings.theme.backgroundImage = pendingBackgroundValue;
            init = { ...init, body: JSON.stringify(layout) };
            pendingBackgroundValue = undefined;
            pendingBackgroundAt = 0;
          }
        } catch {}
      }
      return originalFetch.call(this, input, init);
    };
  };

  const refreshCharts = () => {
    window.dispatchEvent(new Event("resize"));
    document.querySelectorAll("canvas").forEach((canvas) => {
      canvas.style.opacity = ".999";
      requestAnimationFrame(() => { canvas.style.opacity = ""; });
    });
  };

  const svg = (paths, className = "") => `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
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
    syncToolState();
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
    syncToolState = sync;
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

  const iconForLabel = (label) => {
    if (/概览|overview|仪表/i.test(label)) return icons.overview;
    if (/实例|instance/i.test(label)) return icons.instance;
    if (/文件|file/i.test(label)) return icons.file;
    if (/终端|terminal|console/i.test(label)) return icons.terminal;
    if (/快速|quick/i.test(label)) return icons.quickstart;
    if (/镜像|image|docker/i.test(label)) return icons.image;
    if (/市场|market|应用商店/i.test(label)) return icons.market;
    if (/用户|user|成员/i.test(label)) return icons.user;
    if (/节点|node|守护/i.test(label)) return icons.node;
    if (/设置|setting|配置/i.test(label)) return icons.setting;
    if (/页面|page|链接/i.test(label)) return icons.link;
    return icons.default;
  };

  const currentRoute = () => location.hash.replace(/^#/, "").split("?")[0] || "/";
  const routeMatches = (path, route) => {
    if (!path) return false;
    if (path === "/settings") return route === path || route.startsWith(`${path}/`);
    return route === path;
  };
  const selectedDaemonId = () => {
    try {
      const selected = JSON.parse(localStorage.getItem("pageSelectedRemote") || "null");
      if (selected?.uuid && selected.uuid !== "ALL_DAEMON_MODE") return selected.uuid;
    } catch {}
    const nodeMenuItem = [...document.querySelectorAll(".app-header-content .ant-dropdown-menu-item")]
      .find((item) => item.getAttribute("data-menu-id")?.includes("node") || item.getAttribute("data-uuid"));
    return nodeMenuItem?.getAttribute("data-uuid") || "";
  };
  const openImageManager = () => {
    const daemonId = selectedDaemonId();
    if (!daemonId) {
      location.hash = "/node";
      return;
    }
    location.hash = `/node/image?${new URLSearchParams({ daemonId }).toString()}`;
  };

  const buildSidebar = () => {
    const nativeNav = document.querySelector(".app-header-content > .btns:first-child");
    if (!nativeNav) return;
    const nativeItems = [...nativeNav.querySelectorAll(":scope > .nav-button")];
    const findNative = (pattern) => nativeItems.find((item) => pattern.test(item.textContent.trim()));
    const usedNativeItems = new Set();
    const nativeEntry = (pattern, path) => {
      const item = findNative(pattern);
      if (!item) return null;
      usedNativeItems.add(item);
      return { label: item.textContent.trim(), path, nativeItem: item };
    };
    const compact = (items) => items.filter(Boolean);
    const sections = [
      {
        label: "WORKSPACE",
        items: compact([
          nativeEntry(/数据监控|overview|monitor/i, "/overview"),
          nativeEntry(/应用实例|实例|instance/i, "/instances"),
          { label: "快速开始", path: "/quickstart", action: () => { location.hash = "/quickstart"; } }
        ])
      },
      {
        label: "MANAGE",
        items: compact([
          nativeEntry(/用户管理|用户|user/i, "/users"),
          nativeEntry(/节点管理|节点|node/i, "/node"),
          { label: "容器镜像", path: "/node/image", action: openImageManager },
          nativeEntry(/设置|setting|配置/i, "/settings"),
          ...nativeItems.filter((item) => !usedNativeItems.has(item)).map((item) => ({ label: item.textContent.trim(), nativeItem: item }))
        ])
      }
    ].filter((section) => section.items.length);
    let sidebar = document.querySelector(".northstar-sidebar");
    if (nativeItems.length === 0) {
      sidebar?.remove();
      document.body.classList.remove("northstar-shell-ready");
      return;
    }
    if (!sidebar) {
      sidebar = document.createElement("aside");
      sidebar.className = "northstar-sidebar";
      sidebar.setAttribute("aria-label", "主导航");
      sidebar.innerHTML = `<a class="northstar-sidebar__brand" href="."><span>MCSManager</span></a><nav class="northstar-sidebar__nav"></nav><div class="northstar-sidebar__footer"><a href="${repositoryUrl}" target="_blank" rel="noreferrer"><span class="northstar-sidebar__footer-brand"><span class="northstar-sidebar__footer-icon" aria-hidden="true"><i></i><i></i><i></i></span><span>Northstar Interface</span></span>${svg(icons.link)}</a></div>`;
      document.body.appendChild(sidebar);
    }
    const brand = sidebar.querySelector(".northstar-sidebar__brand");
    const logoPath = new URL(`./img/logo.png?v=${encodeURIComponent(assetVersion)}`, document.baseURI).href;
    const brandLogo = brand.querySelector("img");
    if (!brandLogo || brandLogo.src !== logoPath) {
      brand.innerHTML = `<img src="${logoPath}" width="142" height="22" alt="MCSManager">`;
    }
    const nav = sidebar.querySelector(".northstar-sidebar__nav");
    const signature = `${assetVersion}|${sections.map((section) => `${section.label}:${section.items.map((item) => item.label).join(",")}`).join("|")}`;
    if (nav.dataset.signature !== signature) {
      nav.dataset.signature = signature;
      const nodes = [];
      sections.forEach((section) => {
        const heading = document.createElement("div");
        heading.className = "northstar-sidebar__label";
        heading.textContent = section.label;
        nodes.push(heading);
        section.items.forEach((entry) => {
          const label = entry.label;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "northstar-sidebar__item";
          button.dataset.path = entry.path || "";
        button.innerHTML = `${svg(iconForLabel(label))}<span></span>`;
        button.querySelector("span").textContent = label;
          button.addEventListener("click", entry.action || (() => entry.nativeItem.click()));
          nodes.push(button);
        });
      });
      nav.replaceChildren(...nodes);
    }
    const route = currentRoute();
    [...nav.querySelectorAll(".northstar-sidebar__item")].forEach((item) => {
      const path = item.dataset.path;
      const entryLabel = item.textContent.trim();
      const nativeItem = findNative(new RegExp(entryLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
      const active = path
        ? routeMatches(path, route)
        : nativeItem?.classList.contains("nav-button-active");
      item.setAttribute("aria-current", active ? "page" : "false");
    });
    const footer = sidebar.querySelector(".northstar-sidebar__footer");
    if (footer && !footer.querySelector("a")) {
      footer.innerHTML = `<a href="${repositoryUrl}" target="_blank" rel="noreferrer"><span class="northstar-sidebar__footer-brand"><span class="northstar-sidebar__footer-icon" aria-hidden="true"><i></i><i></i><i></i></span><span>Northstar Interface</span></span>${svg(icons.link)}</a>`;
    }
    if (!document.body.classList.contains("northstar-shell-ready")) {
      document.body.classList.add("northstar-shell-ready");
    }
  };

  const redirectAfterLogin = () => {
    if (/#\/login(?:$|[?&])/.test(location.hash)) {
      loginObserved = true;
      redirectedAfterLogin = false;
      return;
    }
    if (!loginObserved || redirectedAfterLogin) return;
    const monitor = [...document.querySelectorAll(".app-header-content > .btns:first-child > .nav-button")]
      .find((item) => /数据监控|overview|monitor/i.test(item.textContent.trim()));
    if (!monitor) return;
    redirectedAfterLogin = true;
    loginObserved = false;
    monitor.click();
  };

  const decorateInstanceControls = () => {
    const instanceSelector = [...document.querySelectorAll(".between-menus-container button.ant-dropdown-trigger")]
      .find((button) => /localhost|节点|node/i.test(button.textContent.trim()));
    if (instanceSelector && !instanceSelector.querySelector(".northstar-instance-node-icon")) {
      const icon = document.createElement("span");
      icon.className = "northstar-instance-node-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = svg(instanceNodeIcon);
      instanceSelector.insertBefore(icon, instanceSelector.firstChild);
    }

    if (/\/instances\/terminal(?:[/?]|$)/i.test(currentRoute())) {
      document.querySelectorAll("#app-mount-point button.ant-btn").forEach((button) => {
        const label = button.textContent.trim();
        button.classList.toggle("northstar-terminal-action--restart", /重启|restart/i.test(label));
        button.classList.toggle("northstar-terminal-action--terminate", /终止|中止|terminate|kill/i.test(label));
      });
    }
  };

  const decorateMetricCards = () => {
    const convertStatusResourceRings = (card) => {
      const items = [...card.querySelectorAll(".status-bars > .status-bar-item")].slice(0, 2);
      if (items.length < 2) return false;
      card.classList.add("northstar-status-rings");
      items.forEach((item) => {
        const percentText = item.querySelector(".status-bar-value__percent")?.textContent || "";
        const value = Math.max(0, Math.min(100, Number.parseFloat(percentText) || 0));
        item.style.setProperty("--northstar-ring-value", `${value}%`);
        item.classList.add("northstar-resource-ring-item");
        let ring = item.querySelector(".northstar-resource-ring");
        if (!ring) {
          ring = document.createElement("span");
          ring.className = "northstar-resource-ring";
          ring.setAttribute("aria-hidden", "true");
          item.appendChild(ring);
        }
        ring.innerHTML = `<span>${Math.round(value)}%</span>`;
        item.querySelectorAll(".ant-progress").forEach((element) => {
          element.classList.add("northstar-resource-native-hidden");
        });
      });
      return true;
    };

    const convertResourceRings = (scope) => {
      const items = [...scope.querySelectorAll(".panel-overview .overview-item--progress")].slice(0, 2);
      if (items.length < 2) return false;
      const resourceCard = scope.closest(".card-panel, .ant-card") || scope.querySelector(".panel-overview")?.closest(".card-panel, .ant-card");
      resourceCard?.classList.add("northstar-metric-card", "northstar-metric-card--resources");
      items.forEach((item) => {
        const percentText = item.querySelector(".overview-item__percent")?.textContent || "";
        const value = Math.max(0, Math.min(100, Number.parseFloat(percentText) || 0));
        item.classList.add("northstar-resource-ring-item");
        item.style.setProperty("--northstar-ring-value", `${value}%`);
        let ring = item.querySelector(".northstar-resource-ring");
        if (!ring) {
          ring = document.createElement("span");
          ring.className = "northstar-resource-ring";
          ring.setAttribute("aria-hidden", "true");
          item.appendChild(ring);
        }
        ring.innerHTML = `<span>${Math.round(value)}%</span>`;
        item.querySelectorAll(".ant-progress, .overview-item__value").forEach((element) => {
          element.classList.add("northstar-resource-native-hidden");
        });
      });
      return true;
    };

    const definitions = [
      { label: "节点在线数", key: "nodes" },
      { label: "实例运行状态", key: "instances" },
      { label: "面板登录次数", key: "logins" },
      { label: "系统资源信息", key: "resources" }
    ];
    definitions.forEach(({ label, key }) => {
      const titleText = [...document.querySelectorAll(".card-panel-title, .ant-card-head-title")]
        .find((element) => element.textContent.trim().includes(label));
      if (!titleText) return;
      const card = titleText.closest(".card-panel, .ant-card");
      if (!card) return;
      card.classList.add("northstar-metric-card", `northstar-metric-card--${key}`);
      if (key === "resources") convertStatusResourceRings(card);
      let icon = card.querySelector(":scope > .northstar-metric-icon");
      if (!icon) {
        icon = document.createElement("span");
        icon.className = "northstar-metric-icon";
        icon.setAttribute("aria-hidden", "true");
        card.prepend(icon);
      }
      icon.innerHTML = svg(metricIcons[key]);
      card.querySelectorAll(".card-panel-content > svg, .card-panel-content .anticon, .ant-card-body > svg, .ant-card-body .anticon")
        .forEach((element) => element.classList.add("northstar-metric-icon-hidden"));

      if (key === "resources") {
        convertResourceRings(card);
      }
    });

    // PanelOverview is also rendered inside user-created layout cards, so the
    // component itself is the stable anchor rather than the editable title.
    document.querySelectorAll(".panel-overview").forEach(convertResourceRings);
  };

  const mountTools = () => {
    const tools = buildTools();
    const groups = document.querySelectorAll(".app-header-content > .btns");
    const actions = groups.length > 1 ? groups[groups.length - 1] : null;
    if (!actions) return;
    if (tools.parentElement !== actions) {
      actions.insertBefore(tools, actions.firstChild);
      tools.classList.add("northstar-v10-tools--header");
    }
    [...actions.children].filter((item) => item !== tools).forEach((wrapper) => {
      const iconName = getIconName(wrapper);
      wrapper.classList.toggle("northstar-v10-native-hidden", !iconName || iconName === "github");
      wrapper.classList.toggle("northstar-v10-native-theme", iconName === "bg-colors");
    });
  };

  let scheduled = false;
  const reconcile = () => {
    if (scheduled) return;
    scheduled = true;
    window.setTimeout(() => {
      scheduled = false;
      try {
        window.__northstarSidebarDebug = "theme";
        applyTheme();
        window.__northstarSidebarDebug = "tools";
        mountTools();
        window.__northstarSidebarDebug = "sidebar";
        buildSidebar();
        window.__northstarSidebarDebug = "redirect";
        redirectAfterLogin();
        decorateInstanceControls();
        decorateMetricCards();
        window.__northstarSidebarDebug = "ready";
      } catch (error) {
        window.__northstarSidebarDebug = `error: ${error?.stack || error}`;
        console.error("Northstar reconcile failed", error);
      }
    }, 0);
  };

  installChartColorBridge();
  installTerminalFontBridge();
  installBackgroundConfigBridge();
  applyTheme();
  const start = () => {
    reconcile();
    const mountPoint = document.getElementById("app-mount-point") || document.body;
    new MutationObserver(reconcile).observe(mountPoint, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    new MutationObserver(reconcile).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (Number(localStorage.getItem("THEME_KEY")) === 0) reconcile();
    });
    window.addEventListener("hashchange", reconcile);
  };
  start();
})();
