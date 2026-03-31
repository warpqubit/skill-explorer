@echo off
echo.
echo  Skills Explorer - Iniciando...
echo.

set "APP=%~dp0index.html"

:: Intentar abrir con el navegador predeterminado
start "" "%APP%"

if %errorlevel% neq 0 (
    echo  No se pudo abrir el navegador automaticamente.
    echo  Abri manualmente: %APP%
    pause
)
