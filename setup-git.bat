@echo off
echo Setting up Git repository for Pixel Knight Adventure...

REM Initialize Git repository
git init

REM Add all files to the repository
git add .

REM Create initial commit
git commit -m "Initial commit"

echo.
echo Git repository initialized successfully!
echo.
echo Next steps:
echo 1. Create a new repository on GitHub (https://github.com/new)
echo 2. Run the following commands to push your code to GitHub:
echo.
echo    git remote add origin https://github.com/YOUR-USERNAME/pixel-knight-adventure.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo Replace YOUR-USERNAME with your GitHub username.
echo.
pause 