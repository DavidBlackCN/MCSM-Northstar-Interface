/* Navigation and page-surface decorators. */
(() => {
  window.__northstarV10Modules ||= {};
  window.__northstarV10Modules.createNavigationSurfaces = (context) => {
    const { assetVersion, icons, instanceNodeIcon, metricIcons, repositoryUrl, svg } = context;
    let loginObserved = /#\/login(?:$|[?&])/.test(location.hash);
    let redirectedAfterLogin = false;
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
  const imageManagerCandidates = () => {
    const ids = [];
    const add = (value) => {
      if (typeof value === "string" && value && value !== "ALL_DAEMON_MODE" && !ids.includes(value)) ids.push(value);
    };
    try {
      const selected = JSON.parse(localStorage.getItem("pageSelectedRemote") || "null");
      add(selected?.uuid);
    } catch {}
    document.querySelectorAll(".app-header-content .ant-dropdown-menu-item[data-uuid]").forEach((item) => {
      add(item.getAttribute("data-uuid"));
    });
    return ids;
  };

  const imageManagerNodeOptions = async () => {
    const options = [];
    const add = (id, label) => {
      if (!id || id === "ALL_DAEMON_MODE") return;
      const resolvedLabel = String(label || id).trim();
      const existing = options.find((item) => item.id === id);
      if (existing) {
        if (existing.label === id && resolvedLabel !== id) existing.label = resolvedLabel;
        return;
      }
      options.push({ id, label: resolvedLabel });
    };
    const persistActiveLabel = () => {
      const routeDaemonId = new URLSearchParams(location.hash.split("?")[1] || "").get("daemonId");
      const activeId = routeDaemonId || selectedDaemonId();
      const activeOption = options.find((item) => item.id === activeId);
      if (!activeOption || activeOption.label === activeOption.id) return;
      try {
        const selected = JSON.parse(localStorage.getItem("pageSelectedRemote") || "null");
        if (selected?.uuid === activeId && selected.remarks === activeOption.label) return;
        localStorage.setItem("pageSelectedRemote", JSON.stringify({ ...(selected || {}), uuid: activeId, remarks: activeOption.label }));
      } catch {}
    };
    try {
      const selected = JSON.parse(localStorage.getItem("pageSelectedRemote") || "null");
      add(selected?.uuid, selected?.remarks || selected?.nickname || selected?.name || selected?.ip || selected?.uuid);
    } catch {}
    imageManagerCandidates().forEach((id) => add(id, id));
    try {
      const appEntry = [...document.scripts].find((script) => script.type === "module" && /\/assets\/index-[^/]+\.js(?:\?|$)/.test(script.src))?.src;
      if (appEntry) {
        const appApi = await import(appEntry);
        const remoteServices = appApi.d?.();
        if (remoteServices?.execute) {
          await remoteServices.execute();
          (remoteServices.state?.value || []).forEach((service) => {
            const id = service?.uuid || service?.daemonId || service?.id;
            const label = service?.remarks || service?.remark || service?.nickname || service?.name || service?.ip || id;
            add(id, label);
          });
        }
      }
    } catch {}
    document.querySelectorAll(".ant-dropdown-menu-item[data-uuid]").forEach((item) => {
      add(item.getAttribute("data-uuid"), item.textContent);
    });
    if (options.length) {
      persistActiveLabel();
      return options;
    }
    const trigger = [...document.querySelectorAll(".between-menus-container button.ant-dropdown-trigger, .app-header-content button.ant-dropdown-trigger")]
      .find((button) => !button.closest(".northstar-image-node-menu") && !/主题|theme|color/i.test(button.textContent || ""));
    if (!trigger) return options;
    trigger.click();
    for (let attempt = 0; attempt < 12 && !options.length; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 50));
      document.querySelectorAll(".ant-dropdown-menu-item[data-uuid]").forEach((item) => {
        add(item.getAttribute("data-uuid"), item.textContent);
      });
    }
    const expanded = trigger.getAttribute("aria-expanded");
    if (expanded === "true") trigger.click();
    persistActiveLabel();
    return options;
  };

  const showImageNodeMenu = async (switchButton) => {
    const existing = document.querySelector(".northstar-image-node-menu");
    if (existing) {
      existing.remove();
      switchButton.setAttribute("aria-expanded", "false");
      return;
    }
    const options = await imageManagerNodeOptions();
    if (!options.length) {
      switchButton.setAttribute("aria-busy", "true");
      window.setTimeout(() => switchButton.removeAttribute("aria-busy"), 700);
      return;
    }
    const menu = document.createElement("div");
    menu.className = "northstar-image-node-menu";
    const routeDaemonId = new URLSearchParams(location.hash.split("?")[1] || "").get("daemonId");
    const selectedId = routeDaemonId || selectedDaemonId();
    options.forEach(({ id, label }) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "northstar-image-node-menu__item";
      item.dataset.daemonId = id;
      item.textContent = label;
      item.setAttribute("role", "menuitemradio");
      item.setAttribute("aria-checked", String(id === selectedId));
      item.classList.toggle("is-selected", id === selectedId);
      item.addEventListener("click", () => {
        localStorage.setItem("pageSelectedRemote", JSON.stringify({ uuid: id, remarks: label }));
        location.hash = `/node/image?${new URLSearchParams({ daemonId: id }).toString()}`;
        menu.remove();
      });
      menu.appendChild(item);
    });
    document.body.appendChild(menu);
    switchButton.setAttribute("aria-expanded", "true");
    const buttonRect = switchButton.getBoundingClientRect();
    menu.style.left = `${Math.max(12, buttonRect.left)}px`;
    menu.style.top = `${buttonRect.bottom + 8}px`;
    const close = (event) => {
      if (!menu.contains(event.target) && event.target !== switchButton) {
        menu.remove();
        switchButton.setAttribute("aria-expanded", "false");
        document.removeEventListener("pointerdown", close, true);
      }
    };
    document.addEventListener("pointerdown", close, true);
  };

  const canReadImageManager = async (daemonId) => {
    try {
      const url = new URL("/api/environment/image", location.href);
      url.searchParams.set("daemonId", daemonId);
      const response = await fetch(url, { credentials: "include", headers: { Accept: "application/json" } });
      return response.ok;
    } catch {
      return false;
    }
  };

  const openImageManager = async () => {
    const options = await imageManagerNodeOptions();
    const candidates = options.length ? options.map((item) => item.id) : imageManagerCandidates();
    for (const daemonId of candidates) {
      if (await canReadImageManager(daemonId)) {
        location.hash = `/node/image?${new URLSearchParams({ daemonId }).toString()}`;
        return;
      }
    }
    if (candidates[0]) {
      location.hash = `/node/image?${new URLSearchParams({ daemonId: candidates[0] }).toString()}`;
      return;
    }
    location.hash = "/node";
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

  const decorateImageManagerControls = () => {
    if (!/\/node\/image(?:[/?]|$)/i.test(currentRoute())) return;
    const toolbar = document.querySelector(".between-menus-container");
    const mountPoint = document.getElementById("app-mount-point");
    mountPoint?.classList.add("northstar-image-page");
    mountPoint?.querySelectorAll(".ant-table-wrapper").forEach((table) => table.classList.add("northstar-image-table"));
    mountPoint?.querySelectorAll(".ant-pagination").forEach((pagination) => {
      const scope = pagination.closest(".ant-table-wrapper") || pagination.parentElement;
      scope?.classList.add("northstar-image-table");
    });
    if (!toolbar) return;
    const existingSwitch = toolbar.querySelector(".northstar-image-node-switch");
    if (existingSwitch) {
      existingSwitch.onclick = () => showImageNodeMenu(existingSwitch);
      return;
    }
    const title = [...toolbar.querySelectorAll("h1, h2, h3, h4, h5, .ant-typography")]
      .find((element) => /镜像|image/i.test(element.textContent || ""));
    const anchor = title?.parentElement || toolbar.querySelector(".menus-item-left") || toolbar;
    const switchButton = document.createElement("button");
    switchButton.type = "button";
    switchButton.className = "northstar-image-node-switch ant-btn ant-btn-default";
    switchButton.title = "切换节点";
    switchButton.innerHTML = `${svg(icons.node)}<span>切换节点</span>`;
    switchButton.onclick = () => showImageNodeMenu(switchButton);
    switchButton.setAttribute("aria-haspopup", "menu");
    switchButton.setAttribute("aria-expanded", "false");
    anchor.appendChild(switchButton);
  };

  const decorateRunningBadges = () => {
    document.querySelectorAll("#app-mount-point .ant-tag").forEach((tag) => {
      const label = tag.textContent.trim();
      const running = /^(?:运行中|running)$/i.test(label);
      const idle = /^(?:未运行|idle|not running)$/i.test(label);
      const stopped = /^(?:已停止|stopped)$/i.test(label);
      const enabled = /^(?:已启用|enabled)$/i.test(label);
      const disabled = /^(?:已禁用|disabled)$/i.test(label);
      tag.classList.toggle("northstar-running-badge", running);
      tag.classList.toggle("northstar-idle-badge", idle);
      tag.classList.toggle("northstar-stopped-badge", stopped);
      tag.classList.toggle("northstar-enabled-badge", enabled);
      tag.classList.toggle("northstar-disabled-badge", disabled);
      const state = running || enabled ? "success" : idle ? "idle" : stopped || disabled ? "stopped" : "";
      if (state) {
        tag.style.setProperty("color", `var(--ns-${state})`, "important");
        tag.style.setProperty("background", `var(--ns-${state}-soft)`, "important");
        tag.style.setProperty("opacity", "1", "important");
        tag.style.setProperty("transition", "none", "important");
        tag.style.setProperty("border-color", state === "success"
          ? "color-mix(in srgb, var(--ns-success) 42%, var(--ns-border))"
          : `var(--ns-${state}-border)`, "important");
      } else {
        tag.style.removeProperty("color");
        tag.style.removeProperty("background");
        tag.style.removeProperty("opacity");
        tag.style.removeProperty("transition");
        tag.style.removeProperty("border-color");
      }
    });
  };

  const decorateManagementSurfaces = () => {
    const route = currentRoute();
    const mountPoint = document.getElementById("app-mount-point");
    if (!mountPoint) return;

    const isFilePage = /\/instances\/terminal\/files(?:[/?]|$)/i.test(route);
    const isModPage = /\/instances\/terminal\/mods(?:[/?]|$)/i.test(route);
    const isSourceEditorPage = isFilePage || /\/serverConfig\/fileEdit(?:[/?]|$)/i.test(route);
    mountPoint.classList.toggle("northstar-file-page", isFilePage);
    mountPoint.classList.toggle("northstar-mod-page", isModPage);
    mountPoint.classList.toggle("northstar-source-editor-page", isSourceEditorPage);

    mountPoint.querySelectorAll(".ant-table-wrapper").forEach((table) => {
      table.classList.toggle("northstar-file-table", isFilePage);
      table.classList.toggle("northstar-mod-table", isModPage);
    });
    if (isFilePage || isModPage) {
      mountPoint.querySelectorAll(".ant-pagination").forEach((pagination) => {
        const scope = pagination.closest(".ant-table-wrapper") || pagination.parentElement;
        scope?.classList.add(isFilePage ? "northstar-file-table" : "northstar-mod-table");
      });
    }
    document.querySelectorAll(".cm-editor").forEach((editor) => {
      editor.classList.add("northstar-code-editor");
    });
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

    return { buildSidebar, redirectAfterLogin, decorateInstanceControls, decorateImageManagerControls, decorateManagementSurfaces, decorateRunningBadges, decorateMetricCards };
  };
})();
