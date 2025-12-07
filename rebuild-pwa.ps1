# Script para limpiar cache y reconstruir la PWA
# Ejecutar con: .\rebuild-pwa.ps1

Write-Host "🧹 Limpiando cache y reconstruyendo PWA..." -ForegroundColor Cyan

# 1. Limpiar cache de Angular
Write-Host "`n📦 Limpiando cache de Angular..." -ForegroundColor Yellow
if (Test-Path ".angular") {
    Remove-Item -Recurse -Force ".angular"
    Write-Host "✅ Cache de Angular limpiado" -ForegroundColor Green
}

# 2. Limpiar directorio www
Write-Host "`n🗑️ Limpiando directorio www..." -ForegroundColor Yellow
if (Test-Path "www") {
    Remove-Item -Recurse -Force "www"
    Write-Host "✅ Directorio www limpiado" -ForegroundColor Green
}

# 3. Construir para producción
Write-Host "`n🔨 Construyendo para producción..." -ForegroundColor Yellow
npm run build --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completado exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}

# 4. Sincronizar con Capacitor
Write-Host "`n📱 Sincronizando con Capacitor..." -ForegroundColor Yellow
npx cap sync

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Sincronización completada" -ForegroundColor Green
} else {
    Write-Host "❌ Error en la sincronización" -ForegroundColor Red
    exit 1
}

Write-Host "`n✨ ¡PWA reconstruida exitosamente!" -ForegroundColor Green
Write-Host "`n📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Desinstala la PWA del celular" -ForegroundColor White
Write-Host "2. Limpia el cache del navegador en el celular" -ForegroundColor White
Write-Host "3. Vuelve a instalar la PWA desde el navegador" -ForegroundColor White
Write-Host "4. Verifica que el backend tenga CORS configurado (ver SOLUCION_CORS_BACKEND.md)" -ForegroundColor White
