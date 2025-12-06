# Script para copiar el icono personalizado a todos los tamaños
# Nota: Este es un script temporal. Idealmente deberías redimensionar cada icono al tamaño correcto.

$sourceIcon = "C:\Users\silva\.gemini\antigravity\brain\7ecf8a36-ea9c-4fef-8075-38694bf42b01\turnos_app_icon_1765030053458.png"
$targetDir = "src\assets\icon"

# Tamaños requeridos
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

Write-Host "🎨 Copiando icono personalizado..." -ForegroundColor Cyan
Write-Host ""

# Verificar que el archivo fuente existe
if (-not (Test-Path $sourceIcon)) {
    Write-Host "❌ Error: No se encontró el archivo fuente" -ForegroundColor Red
    exit 1
}

# Crear directorio si no existe
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
}

# Copiar el icono a cada tamaño
foreach ($size in $sizes) {
    $targetFile = Join-Path $targetDir "icon-${size}x${size}.png"
    Copy-Item $sourceIcon $targetFile -Force
    Write-Host "✅ Copiado: icon-${size}x${size}.png" -ForegroundColor Green
}

# Copiar como favicon
$faviconPath = Join-Path $targetDir "favicon.png"
Copy-Item $sourceIcon $faviconPath -Force
Write-Host "✅ Copiado: favicon.png" -ForegroundColor Green

Write-Host ""
Write-Host "✨ ¡Iconos copiados exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  NOTA: Los iconos tienen el mismo tamaño base." -ForegroundColor Yellow
Write-Host "   Para producción, deberías redimensionar cada uno al tamaño correcto." -ForegroundColor Yellow
Write-Host "   Puedes usar herramientas online como:" -ForegroundColor Yellow
Write-Host "   - https://www.pwabuilder.com/imageGenerator" -ForegroundColor Cyan
Write-Host "   - https://realfavicongenerator.net/" -ForegroundColor Cyan
