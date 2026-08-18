@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js or run: python -m http.server 8765
  exit /b 1
)
node tools\preview-server.mjs
