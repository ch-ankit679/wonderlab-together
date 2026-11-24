@echo off
setlocal
cd /d "%~dp0"
title WonderLab Together - Voice-Led Science Lab Edition 6.0

echo.
echo  WonderLab Together - Voice-Led Science Lab Edition 6.0
echo  Project folder: %CD%
echo.

if not exist "index.html" (
  echo ERROR: index.html was not found. Extract the complete ZIP first.
  pause
  exit /b 1
)
if not exist "data\learning-paths.js" (
  echo ERROR: data\learning-paths.js is missing. Please re-extract the complete ZIP.
  pause
  exit /b 1
)

where python >nul 2>nul
if not errorlevel 1 goto use_python
where py >nul 2>nul
if not errorlevel 1 goto use_py

echo Python was not found. Install Python 3, then run this launcher again.
pause
exit /b 1

:use_python
start "WonderLab Local Server" /D "%~dp0" cmd /k "python -m http.server 8010"
goto open_browser

:use_py
start "WonderLab Local Server" /D "%~dp0" cmd /k "py -3 -m http.server 8010"

:open_browser
timeout /t 2 /nobreak >nul
start "" "http://localhost:8010"
echo.
echo  WonderLab is opening at http://localhost:8010
echo The server is running in a separate command window.
echo  Close that server window when you finish.
echo.
pause
