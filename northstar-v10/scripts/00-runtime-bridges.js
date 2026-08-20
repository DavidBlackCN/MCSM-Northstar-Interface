/* Runtime bridges: loader, charts, terminal font, tooltips, and saved backgrounds. */
(() => {
  window.__northstarV10Modules ||= {};
  window.__northstarV10Modules.createRuntimeBridges = (context) => {
    const { root } = context;
  const decorateStartupLoader = () => {
    const loader = document.querySelector("#before-app-mounted .loading");
    if (!loader || loader.classList.contains("loading-bars")) return;
    loader.classList.add("loading-bars");
    loader.replaceChildren(...Array.from({ length: 3 }, () => document.createElement("span")));
  };

  decorateStartupLoader();

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

    return { decorateStartupLoader, refreshCharts, installChartColorBridge, installTerminalFontBridge, installBackgroundConfigBridge, installThemeTooltip };
  };
})();
