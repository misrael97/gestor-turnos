# Script para verificar configuración de colas y correos en Laravel
# Ejecutar desde la raíz del proyecto Laravel

Write-Host "🔍 Verificando configuración de Laravel..." -ForegroundColor Cyan

# 1. Verificar driver de colas
Write-Host "`n📦 Driver de Colas Actual:" -ForegroundColor Yellow
php artisan config:show queue.default

# 2. Verificar configuración de correo
Write-Host "`n📧 Configuración de Correo:" -ForegroundColor Yellow
php artisan config:show mail.default
php artisan config:show mail.from.address

# 3. Verificar jobs pendientes
Write-Host "`n📋 Jobs Pendientes en Cola:" -ForegroundColor Yellow
php artisan queue:failed

# 4. Verificar si hay workers corriendo
Write-Host "`n🔄 Workers de Cola Corriendo:" -ForegroundColor Yellow
$workers = Get-Process | Where-Object { $_.ProcessName -like "*php*" -and $_.CommandLine -like "*queue:work*" }
if ($workers) {
    Write-Host "✅ Hay $($workers.Count) worker(s) corriendo" -ForegroundColor Green
    $workers | Format-Table ProcessName, Id, StartTime
}
else {
    Write-Host "❌ No hay workers corriendo" -ForegroundColor Red
    Write-Host "   Necesitas ejecutar: php artisan queue:work" -ForegroundColor Yellow
}

# 5. Mostrar últimas líneas del log
Write-Host "`n📝 Últimas líneas del log:" -ForegroundColor Yellow
if (Test-Path "storage/logs/laravel.log") {
    Get-Content "storage/logs/laravel.log" -Tail 10
}
else {
    Write-Host "❌ No se encontró el archivo de log" -ForegroundColor Red
}

Write-Host "`n✅ Verificación completada" -ForegroundColor Green
Write-Host "`n💡 Recomendaciones:" -ForegroundColor Cyan
Write-Host "1. Si QUEUE_CONNECTION=database o redis, necesitas configurar un worker automático" -ForegroundColor White
Write-Host "2. Si QUEUE_CONNECTION=sync, los correos se envían inmediatamente" -ForegroundColor White
Write-Host "3. Ver SOLUCION_CORREOS_2FA.md para más detalles" -ForegroundColor White
