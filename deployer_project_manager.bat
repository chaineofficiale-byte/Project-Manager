@echo off
setlocal EnableExtensions EnableDelayedExpansion

title Project Manager - Deploy to GitHub / Vercel

echo.
echo ================================================
echo   PROJECT MANAGER - MISE EN LIGNE
echo ================================================
echo.

REM Vérifier qu'on est dans un dépôt Git
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Ce dossier n'est pas un depot Git.
    echo Ouvre ce fichier .bat depuis le dossier racine du projet.
    echo.
    pause
    exit /b 1
)

REM Vérifier l'état
echo [1/5] Verification du projet...
echo.

if not exist package.json (
    echo [AVERTISSEMENT] package.json introuvable.
    echo Le script continue quand meme pour Git.
    echo.
)

echo [2/5] Verification des modifications Git...
git status
echo.

REM Build avant envoi
if exist package.json (
    echo [3/5] Build du projet...
    call npm run build
    if errorlevel 1 (
        echo.
        echo [ERREUR] Le build a echoue.
        echo Rien n'a ete envoye sur GitHub.
        echo Corrige les erreurs puis relance le .bat.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Build OK.
) else (
    echo [3/5] Build ignore : package.json introuvable.
)

echo.
echo [4/5] Preparation de Git...
git add .

git diff --cached --quiet
if not errorlevel 1 (
    echo.
    echo [INFO] Aucune modification a envoyer.
    echo Le site en ligne est deja a jour.
    echo.
    pause
    exit /b 0
)

echo.
set "COMMIT_MSG="
set /p "COMMIT_MSG=Message du commit (ex: Modification dashboard) : "

if "%COMMIT_MSG%"=="" set "COMMIT_MSG=Mise a jour du projet"

git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo.
    echo [ERREUR] Le commit Git a echoue.
    echo.
    pause
    exit /b 1
)

echo.
echo [5/5] Envoi vers GitHub...
git push
if errorlevel 1 (
    echo.
    echo [ERREUR] Le push vers GitHub a echoue.
    echo Verifie ton compte GitHub et le remote "origin".
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo   DEPLOIEMENT ENVOYE AVEC SUCCES
echo ================================================
echo.
echo GitHub est a jour.
echo Vercel devrait maintenant lancer automatiquement
echo le nouveau deploiement.
echo.
echo Attends quelques instants puis ouvre ton site Vercel.
echo.
pause
endlocal
