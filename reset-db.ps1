# Script PowerShell para resetear la base de datos de usuarios

Write-Host "🗑️  Limpiando base de datos..." -ForegroundColor Yellow

# Vaciar users.json
Set-Content -Path "data/users.json" -Value "[]"

# Vaciar otp.json
Set-Content -Path "data/otp.json" -Value "[]"

Write-Host "✅ Base de datos limpia. Puedes registrarte de nuevo." -ForegroundColor Green
