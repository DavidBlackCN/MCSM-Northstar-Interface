# MCSManager Northstar public

这是已经整理好的 MCSManager 10.18.0 Web `public` 目录，包含官方前端资源和 Northstar 主题覆盖层。

## 直接部署

1. 停止 MCSManager Web 服务并备份原来的 `web/public`。
2. 将本目录中的全部内容复制到 MCSManager 的 `web/public` 目录，覆盖同名文件。
3. 启动服务后使用 `Ctrl+F5` 强制刷新浏览器缓存。

本目录的 `index.html` 已经加载：

```html
./northstar-v10.css?v=20260819-15
./northstar-v10.js?v=20260819-15
```

不需要额外安装 Node.js、npm、插件或 CDN 依赖。主题不替换 MCSM 官方 `assets/`、Vue、Ant Design 或业务 bundle，因此 10.18.0 的自定义布局入口和内置卡片仍由官方前端负责。

## 主题功能

- 暖象牙浅色和深灰深色模式。
- 霁青、陶朱、藕荷、麦金四套主题色。
- 右上角主题色、深浅模式、用户和退出控件统一布局。
- 左侧 Northstar 导航和 MCSM 业务页面布局覆盖。
- Overview KPI 卡片、资源环图、时间线、节点表格和应用实例卡片重样式。
- 主题色同步到文字、图标、图表、进度条、弹窗、抽屉、表单和分页控件。
- 启动等待页使用三条不同高度的主题色竖线浮动动画，并显示中文启动阶段提示。
- 官方时钟卡片修复数字滚轮裁切问题。
- 支持 `prefers-reduced-motion`。

主题设置保存在浏览器的 `localStorage` 中：

- `THEME_KEY`：MCSM 深浅模式。
- `northstarAccent`：Northstar 主题色。

## 自定义布局卡片

`cards/` 下提供可上传到 MCSM 设计模式的 HTML 卡片：

- `cards/northstar-status-card.html`：显示当前时间、主题和路由。
- `cards/northstar-node-health-card.html`：读取当前会话可访问的 `/api/overview`，显示节点、实例、CPU 和内存概览。

使用方式：进入右上角“自定义布局”，确认进入设计模式，选择“扩展页面卡片”，上传对应 HTML 并保存布局。仅把文件放在 `cards/` 目录不会自动注册卡片。更新卡片后，需要在设计模式中删除旧卡片并重新上传。

节点健康卡片复用当前页面会话，不在 HTML 中写入 API Key。没有相应权限时会显示读取失败。

## 目录说明

这是发布目录，不是独立构建项目。根目录中的 `index.html`、`assets/`、`static/`、`fonts/` 和其他官方资源都是 MCSM 10.18.0 运行所需内容；`northstar-v10.css` 和 `northstar-v10.js` 是主题覆盖层。

不要删除或替换 `assets/` 中的官方文件，也不要把旧版 MCSM 主题的 `app.js`、`vendor.js` 或 `app.css` 覆盖到本目录。
