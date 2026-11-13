@echo off
setlocal
cd /d "%~dp0"

if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo Arquivo .env criado a partir do exemplo. Para usar o RDS, edite DB_URL, DB_USERNAME e DB_PASSWORD.
)

where mvn >nul 2>nul
if errorlevel 1 (
  echo Maven nao foi encontrado. Instale o Apache Maven e confirme que o comando mvn funciona no PowerShell.
  echo O Java 21 tambem precisa estar instalado. Confira com: java -version
  pause
  exit /b 1
)

mvn spring-boot:run
pause
