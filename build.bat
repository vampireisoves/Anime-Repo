@echo off
cd /d %~dp0
echo ============================================
echo   Anip Web Build (Obfuscate Only)
echo ============================================
echo.

rem ---- 1. Obfuscate index.src.html -> index.html ----
echo [1/1] Obfuscating index.src.html...
if not exist build\node_modules (
  echo       installing javascript-obfuscator...
  cd build
  call npm install --no-audit --no-fund
  cd ..
)
node build\obfuscate.js
if errorlevel 1 (
  echo [FAILED] obfuscation error.
  exit /b 1
)
echo.
echo ============================================
echo   ALL DONE - index.html ready for deploy
echo ============================================
