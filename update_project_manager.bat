@echo off
title Mise a jour Project Manager
echo.
echo === Mise a jour du site ===
echo.

git add .
git commit -m "Mise a jour"
git push

echo.
if errorlevel 1 (
    echo ERREUR : la mise a jour a echoue.
) else (
    echo OK : GitHub est a jour.
    echo Vercel va deployer automatiquement.
)
echo.
pause
