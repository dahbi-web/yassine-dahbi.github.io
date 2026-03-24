@echo off
if [%1]==[] (
    echo Please provide a commit message.
    echo Usage: publish.bat "Your commit message"
    exit /b 1
)
git add .
git commit -m "%~1"
git push origin main
