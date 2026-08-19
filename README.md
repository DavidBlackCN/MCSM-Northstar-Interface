# MCSM Northstar Interface

适用于 MCSManager 10.18.0 的界面主题。主题只包含样式、脚本、字体和 Logo，不包含 MCSM 官方 `assets`。

## 安装

1. 从 [Releases](https://github.com/DavidBlackCN/MCSM-Northstar-Interface/releases) 下载最新 ZIP。
2. 备份 MCSM 的 `web/public` 目录。
3. 将 ZIP 内容解压到 `web/public`。
4. 在 `web/public/index.html` 的 `</head>` 前加入：

   ```html
   <link rel="stylesheet" href="./northstar-v10.css">
   ```

5. 在 `</body>` 前加入：

   ```html
   <script src="./northstar-v10.js"></script>
   ```

6. 重启 MCSManager Web 服务，并使用 `Ctrl+F5` 刷新页面。

更新 MCSManager 后需要重新执行第 3 至第 5 步。不要删除或覆盖新版本自带的 `assets`。

## 自定义卡片

`cards` 目录中的 HTML 文件可在“自定义布局”中作为扩展页面卡片上传。

## 文件

- `northstar-v10.css`：主题样式
- `northstar-v10.js`：主题交互
- `fonts`：Maple Mono 字体
- `img/logo.png`：侧边栏 Logo
- `cards`：可选自定义卡片
