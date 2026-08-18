# Northstar overlay for MCSManager 10.18+

MCSManager 10 uses a Vue 3/Vite frontend under `web/public/assets`. Do not
replace its `index-*.js`, `mount-*.js`, Ant Design assets, or native
`index.html` with the legacy theme bundle.

Deploy the V10 overlay as follows:

1. Start from the unmodified MCSManager 10 `web/public` directory.
2. Copy `northstar-v10.css` and `northstar-v10.js` beside the native
   `index.html`.
3. Add the stylesheet after the native Ant Design stylesheet:

   ```html
   <link rel="stylesheet" href="./northstar-v10.css?v=20260819-15">
   ```

4. Add the script before `</body>`:

   ```html
   <script src="./northstar-v10.js?v=20260819-15"></script>
   ```

The native `BuildOutlined` action remains responsible for entering design
mode. Northstar must not replace or proxy that click handler.
