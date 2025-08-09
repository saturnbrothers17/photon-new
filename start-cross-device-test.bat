@echo off
echo ========================================
echo PHOTON Cross-Device Testing Setup
echo ========================================
echo.
echo Starting Teacher Dashboard on port 3001...
echo Starting Student Corner on port 3002...
echo.
echo Teacher Dashboard: http://localhost:3001/teacher-dashboard
echo Student Corner: http://localhost:3002/student-corner
echo.
echo Press Ctrl+C to stop both servers
echo ========================================
echo.

start "Teacher Server" cmd /k "npm run dev:teacher"
timeout /t 3 /nobreak >nul
start "Student Server" cmd /k "npm run dev:student"

echo Both servers are starting...
echo.
echo Open these URLs in different browsers/devices:
echo - Teacher: http://localhost:3001/teacher-dashboard
echo - Student: http://localhost:3002/student-corner
echo.
pause