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
  const svg = (paths, className = "") => `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;

  const modules = window.__northstarV10Modules;
  if (!modules?.createRuntimeBridges || !modules?.createShellControls || !modules?.createNavigationSurfaces) {
    console.error("Northstar v10 modules failed to load.");
    return;
  }
  const { decorateStartupLoader, refreshCharts, installChartColorBridge, installTerminalFontBridge, installBackgroundConfigBridge, installThemeTooltip } = modules.createRuntimeBridges({ root });
  const { applyTheme, buildTools, getIconName } = modules.createShellControls({ root, accents, refreshCharts, installThemeTooltip, svg });
  const { buildSidebar, redirectAfterLogin, decorateInstanceControls, decorateImageManagerControls, decorateManagementSurfaces, decorateRunningBadges, decorateMetricCards } = modules.createNavigationSurfaces({ assetVersion, icons, instanceNodeIcon, metricIcons, repositoryUrl, svg });

  decorateStartupLoader();

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
        decorateImageManagerControls();
        decorateManagementSurfaces();
        decorateRunningBadges();
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
    new MutationObserver(reconcile).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (Number(localStorage.getItem("THEME_KEY")) === 0) reconcile();
    });
    window.addEventListener("hashchange", reconcile);
  };
  start();
})();
