@echo off
echo Starting MicroPinouts Application...
echo.

echo Installing server dependencies...
call npm install

echo.
echo Installing client dependencies...
cd client
call npm install
cd ..

echo.
echo Starting the application...
echo Server will be available at: http://localhost:5000
echo Client will be available at: http://localhost:3000
echo.

start "MicroPinouts Server" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul
start "MicroPinouts Client" cmd /k "cd client & npm start"

echo.
echo Both servers are starting up...
echo Please wait for the applications to load.
pause
