(() => {
  "use strict";

  const svg = (paths) => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
  const navigationIcons = {
    "el-icon-pie-chart": svg('<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><path d="M14 20.5v-4.2a2.3 2.3 0 0 1 4.6 0v4.2"/>'),
    "el-icon-coin": svg('<rect x="4" y="4" width="16" height="5" rx="1.2"/><rect x="4" y="15" width="16" height="5" rx="1.2"/><path d="M7 6.5h.01M7 17.5h.01M11 6.5h6M11 17.5h6"/>'),
    "el-icon-folder-opened": svg('<path d="M3.5 7.5h6l1.7 2H20a1 1 0 0 1 1 1v8.2a1.3 1.3 0 0 1-1.3 1.3H4.3A1.3 1.3 0 0 1 3 18.7V8.8a1.3 1.3 0 0 1 .5-1.3Z"/><path d="M3.5 10h17"/>'),
    "el-icon-postcard": svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>'),
    "el-icon-circle-plus-outline": svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>'),
    "el-icon-user": svg('<circle cx="9" cy="8" r="3"/><path d="M3.8 20v-1.2A4.8 4.8 0 0 1 8.6 14h.8a4.8 4.8 0 0 1 4.8 4.8V20M16 5.5a3 3 0 0 1 0 5.7M18.4 14.5a4.5 4.5 0 0 1 2 3.8V20"/>'),
    "el-icon-connection": svg('<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="m7.7 7.1 2.9 8M16.3 7.1l-2.9 8M8 6h8"/>'),
    "el-icon-takeaway-box": svg('<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.4 7.7 7.6 4.4 7.6-4.4M12 12v9"/>'),
    "el-icon-setting": svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.2 2.2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-3.2v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2.2-2.2.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4.8v-3.2H5a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.2-2.2.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h3.2v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.2 2.2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2V14H21a1.7 1.7 0 0 0-1.6 1Z"/>')
  };
  const fallbackIcon = svg('<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>');

  const tagRuntime = () => {
    const app = document.getElementById("app");
    const menu = document.getElementById("app-menu");
    if (app && menu) {
      document.body.dataset.nsLayout = "northstar";
      menu.setAttribute("aria-label", "MCSManager 主导航");
      menu.querySelectorAll(".el-menu-item").forEach((item, index) => {
        item.dataset.nsNavIndex = String(index);
        const icon = item.querySelector("i");
        if (!icon) return;
        const iconClass = [...icon.classList].find((name) => name.startsWith("el-icon-")) || "";
        icon.classList.add("northstar-nav-icon");
        icon.setAttribute("aria-hidden", "true");
        if (icon.dataset.nsIcon !== iconClass) {
          icon.innerHTML = navigationIcons[iconClass] || fallbackIcon;
          icon.dataset.nsIcon = iconClass;
        }
      });
      menu.querySelectorAll(".el-menu-item-group__title").forEach((title) => {
        if (title.textContent.includes("Theme by")) title.dataset.nsCredit = "true";
      });

      let scrim = document.querySelector(".northstar-nav-scrim");
      if (!scrim) {
        scrim = document.createElement("button");
        scrim.className = "northstar-nav-scrim";
        scrim.type = "button";
        scrim.setAttribute("aria-label", "关闭主导航");
        document.body.appendChild(scrim);
        scrim.addEventListener("click", () => document.body.classList.remove("ns-nav-open"));
      }

      const menuToggle = document.getElementById("ShowMenu");
      if (menuToggle && menuToggle.dataset.nsBound !== "true") {
        menuToggle.dataset.nsBound = "true";
        menuToggle.setAttribute("aria-label", "打开主导航");
        menuToggle.addEventListener("click", () => {
          const open = document.body.classList.toggle("ns-nav-open");
          menuToggle.setAttribute("aria-label", open ? "关闭主导航" : "打开主导航");
        });
      }

      menu.querySelectorAll(".el-menu-item, .el-submenu__title").forEach((item) => {
        if (item.dataset.nsCloseBound === "true") return;
        item.dataset.nsCloseBound = "true";
        item.addEventListener("click", () => document.body.classList.remove("ns-nav-open"));
      });
    }

    const tools = document.querySelector(".northstar-tools");
    const actionColumn = document.querySelector("#app .el-main > div > .el-row:first-child .el-card__body > .el-row > .el-col:last-child");
    let actionBar = actionColumn?.querySelector(":scope > .northstar-actions-bar");
    if (actionColumn) {
      actionColumn.querySelectorAll(".el-dropdown-link").forEach((control) => {
        const nativeIcon = control.querySelector("i");
        const classes = nativeIcon ? [...nativeIcon.classList] : [];
        const keepNativeControl = classes.includes("el-icon-user")
          || classes.includes("el-icon-switch-button");
        control.classList.toggle("northstar-native-control", keepNativeControl);
        control.classList.toggle("northstar-native-control--hidden", !keepNativeControl);
      });

      if (!actionBar) {
        actionBar = document.createElement("div");
        actionBar.className = "northstar-actions-bar";
        actionColumn.appendChild(actionBar);
      }

      if (tools && tools.parentElement !== actionBar) actionBar.appendChild(tools);
      actionColumn.querySelectorAll(".el-dropdown-link.northstar-native-control").forEach((control) => {
        if (control.parentElement !== actionBar) actionBar.appendChild(control);
      });
    }
    if (tools && actionBar) {
      tools.classList.add("northstar-tools--header");
    }
  };

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      tagRuntime();
    });
  };

  const observer = new MutationObserver(schedule);
  const start = () => {
    tagRuntime();
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("hashchange", schedule);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
