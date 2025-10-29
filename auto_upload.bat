@echo off
REM === Task Management System Auto Git Upload Script ===

echo ===============================
echo  🚀 Starting Git Upload Script
echo ===============================
echo.

REM --- Step 1: Check if git is installed ---
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first from https://git-scm.com/downloads
    pause
    exit /b
)

REM --- Step 2: Go to project directory ---
echo 🔍 Checking project structure...
cd /d "%~dp0"
if not exist "my-react-app" (
    echo ❌ Folder 'my-react-app' not found in this directory.
    pause
    exit /b
)

REM --- Step 3: Initialize git if not already ---
if not exist ".git" (
    echo 🆕 Initializing Git repository...
    git init
)

REM --- Step 4: Set GitHub remote URL ---
echo 🌐 Setting GitHub remote...
git remote remove origin 2>nul
git remote add origin https://github.com/ravibhai10/task-management-system.git

REM --- Step 5: Add all files ---
echo 📦 Adding all files to Git...
git add .

REM --- Step 6: Commit changes ---
echo 💬 Committing changes...
git commit -m "Auto Upload - Working Task Management System"

REM --- Step 7: Push to GitHub ---
echo 🚀 Pushing to GitHub main branch...
git branch -M main
git push -u origin main

echo.
echo ✅ All files successfully uploaded to GitHub!
echo 🔗 Repository: https://github.com/ravibhai10/task-management-system
pause
