# Northstar for MCSManager

Northstar 是一套面向 MCSManager 的暖中性色主题。它以内容和服务器状态为中心，使用轻边界、低饱和强调色、克制圆角与少量必要动效，提供完整浅色、深色与跟随系统模式。

## 特性

- 暖象牙白浅色界面与多层深灰暗色界面，不使用纯白或纯黑大面积铺底。
- 霁青、陶朱、藕荷、麦金四套强调色。
- 固定使用 Maple Mono 作为正文与界面字体，技术信息保持等宽、清晰对齐。
- 兼容 MCSManager 自带的 `auto`、`light`、`dark` 设置与 `localStorage.theme`。
- 面板、表格、表单、菜单、文件管理、终端和登录页的统一覆盖样式。
- 顶部工具栏中的独立颜色选择器与深浅模式开关，以及可见焦点和 `prefers-reduced-motion` 支持。
- 附带可在 MCSManager 设计模式上传的 Northstar 状态卡片和节点健康卡片示例。
- 无外部主题脚本、统计脚本或 CDN 依赖。

## 安装

### MCSManager 10.18.0 注意事项

MCSManager 10.18.0 使用 Vue 3/Vite 前端，原生业务文件位于 `web/public/assets`。不要把本目录中的旧版 `js/app.js`、`js/vendor.js`、`css/app.css` 或整个主题目录复制覆盖到 10.18.0 的 `web/public`，否则会丢失原生卡片设计模式和“自定义布局”入口。10.18.0 应使用 `v10/northstar-v10.css` 与 `v10/northstar-v10.js` 作为独立覆盖层，具体步骤见 `v10/README.md`。

对于 MCSManager 10.18.0，安装步骤以 `v10/README.md` 为准：保留官方 `index.html` 和 `assets/`，只把 `v10/northstar-v10.css`、`v10/northstar-v10.js` 复制到 `web/public`，并在官方入口中追加两个资源引用。不要把本目录的旧版 `js/`、`css/` 或完整目录覆盖到 10.18.0。

安装前请先备份现有 `web/public`，停止 MCSManager Web 服务后修改静态目录；启动服务后使用 `Ctrl+F5` 或带新的查询版本号强制刷新浏览器缓存。旧版 MCSManager（非 Vue 3/Vite 版本）才使用下方 `css/` 与 `js/` 的兼容覆盖文件。

`Vivid_v1.6.2` 仅用于对齐可部署的静态资源目录与文件命名；Northstar 的预览布局已独立重制。若你的 MCSManager 版本不同，建议只把下面三个文件合并到对应版本的静态目录：

- `css/northstar.css`
- `css/northstar-layout.css`
- `js/northstar.js`
- `js/northstar-layout.js`
- `fonts/MapleMono-*.woff2`

然后在现有 `index.html` 的应用 CSS 之后加载 `/css/northstar.css`，在应用脚本之后加载 `/js/northstar.js`。

## 使用

页面顶部工具栏右侧有独立的主题色选择器和太阳/月亮模式开关。选择会保存在浏览器本地：

- 明暗模式：浅色、深色（初次加载可跟随系统）
- 强调色：霁青、陶朱、藕荷、麦金
- 字体：固定 Maple Mono

主题会隐藏旧版顶部的外观下拉按钮，并将主题色选择器、深浅模式开关、MCSManager 原生用户信息和退出登录分别作为独立控件放在右上角。日/月、云星仅在模式开关内部显示，不会在页面顶部渲染全屏装饰动效；按钮、选项组和选中态均保留键盘操作、ARIA 状态和清晰焦点。

### 设计模式卡片

MCSManager 10 的设计模式支持在页面上拖拽、调整卡片，并可上传 HTML 卡片。

- `cards/northstar-status-card.html`：显示当前时间、面板主题和当前路由，不依赖外网。
- `cards/northstar-node-health-card.html`：调用当前已登录页面提供的 `$axios` 请求 `/api/overview`，显示节点数量、运行实例、CPU 和内存概览，包含加载、错误和空数据状态，每 30 秒刷新一次；兼容 10.18.0 的 `data.remote` 和 `data.data.remote` 返回结构。

卡片文件放在主题目录的 `cards/` 仅供取用，不会自动出现在面板中。使用时进入右上角的“自定义布局”，确认进入设计模式后，新建“扩展页面卡片”，上传对应 HTML 并保存布局；退出设计模式后卡片才会进入正常页面。节点健康卡片不把 API Key 写入 HTML，而是复用当前 MCSManager 页面会话；如果页面会话没有权限，卡片会显示读取失败。官方 API Key 适合后端外接程序，不应直接写入浏览器卡片。

上传后的卡片由 MCSM 保存到自己的布局配置中，因此更新 HTML 文件不会自动更新已经上传的卡片。修改卡片后请在设计模式中删除旧卡片并重新上传，或按 MCSM 当前版本提供的编辑入口替换它。

### 本地预览

预览页完全独立于 MCSManager 后端，使用与正式主题相同的 CSS、字体和交互脚本。它展示重制后的控制台信息架构：固定侧栏、顶部检索/操作、运行指标、节点趋势、活动流与实例表；用于确认布局和主题状态，不依赖后端数据。

在主题目录中选择一种方式启动：

```powershell
# PowerShell
.\preview.ps1

# 或 npm
npm run preview

# 或 Windows 命令提示符
preview.cmd
```

然后访问 `http://127.0.0.1:8765/`。服务默认只监听本机地址，不会暴露到局域网；按 `Ctrl+C` 停止。若端口被占用，可临时指定其他端口：

```powershell
$env:PORT = 9000
npm run preview
```

没有 Node.js 时也可在主题目录运行 `python -m http.server 8765`，再访问 `http://127.0.0.1:8765/preview.html`。

主题模式使用 MCSManager 原有的 `theme` 键；强调色使用 `northstarAccent`。

## 文件说明

```text
db-mcsm-theme/
├─ index.html                  # 无第三方远程脚本的主题入口
├─ preview.html                # 不依赖后端的交互式主题预览
├─ preview.cmd / preview.ps1   # Windows 本地预览入口
├─ package.json                # npm run preview
├─ tools/preview-server.mjs    # 零依赖 Node.js 静态服务器
├─ css/app.css                 # MCSManager 应用样式
├─ css/vendor.css              # 第三方组件样式
├─ css/async-components.css    # 异步页面样式
├─ css/northstar.css           # Northstar 变量与组件覆盖
├─ css/northstar-layout.css    # 编译后 MCSManager 运行时壳层与页面布局重写
├─ js/app.js                   # MCSManager 应用入口
├─ js/vendor.js                # 第三方运行时
├─ js/async-components.js      # 异步页面模块
├─ js/northstar.js             # 主题色、深浅模式与可访问交互
├─ js/northstar-layout.js      # 运行时导航标注与布局挂载
├─ cards/northstar-status-card.html # 设计模式可上传的状态卡片示例
├─ cards/northstar-node-health-card.html # 设计模式可上传的节点健康卡片
├─ fonts/MapleMono-*.woff2     # Maple Mono 400/600/700
├─ css/ js/ static/ img/       # MCSManager 兼容运行时资源
└─ favicon.ico
```

## 自定义

颜色集中在 `css/northstar.css` 顶部的 CSS 自定义属性中。请同时修改 Light 与 Dark 的对应变量，避免在组件选择器内增加散落色值。主题控件使用 `data-theme` 与 `data-accent` 驱动；新增配色时也应保持这个结构。

## 验证目标

- Chrome、Firefox、Safari、Edge 等现代浏览器。
- 360px 移动端到宽屏全宽工作区（保留响应式边距）。
- 四套强调色 × 浅色/深色模式。
- 键盘导航、减少动态效果与系统主题实时切换。
