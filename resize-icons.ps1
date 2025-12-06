# Script para redimensionar iconos usando .NET System.Drawing
# Este script funciona en Windows sin necesidad de instalar software adicional

Add-Type -AssemblyName System.Drawing

$sourceIcon = "C:\Users\silva\.gemini\antigravity\brain\7ecf8a36-ea9c-4fef-8075-38694bf42b01\turnos_app_icon_1765030053458.png"
$targetDir = "src\assets\icon"

# Tamaños requeridos
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

Write-Host "🎨 Redimensionando iconos..." -ForegroundColor Cyan
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

# Función para redimensionar imagen
function Resize-Image {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Width,
        [int]$Height
    )
    
    try {
        $img = [System.Drawing.Image]::FromFile($InputPath)
        $newImg = New-Object System.Drawing.Bitmap($Width, $Height)
        $graphics = [System.Drawing.Graphics]::FromImage($newImg)
        
        # Configurar calidad alta
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Dibujar imagen redimensionada
        $graphics.DrawImage($img, 0, 0, $Width, $Height)
        
        # Guardar
        $newImg.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Limpiar recursos
        $graphics.Dispose()
        $newImg.Dispose()
        $img.Dispose()
        
        return $true
    }
    catch {
        Write-Host "❌ Error redimensionando: $_" -ForegroundColor Red
        return $false
    }
}

# Redimensionar cada tamaño
foreach ($size in $sizes) {
    $outputPath = Join-Path $targetDir "icon-${size}x${size}.png"
    
    Write-Host "⏳ Procesando: icon-${size}x${size}.png..." -ForegroundColor Yellow
    
    if (Resize-Image -InputPath $sourceIcon -OutputPath $outputPath -Width $size -Height $size) {
        # Verificar tamaño del archivo generado
        $fileInfo = Get-Item $outputPath
        Write-Host "✅ Generado: icon-${size}x${size}.png ($([math]::Round($fileInfo.Length/1KB, 2)) KB)" -ForegroundColor Green
    }
}

# Crear favicon (192x192 es un buen tamaño para favicon)
Write-Host "⏳ Procesando: favicon.png..." -ForegroundColor Yellow
$faviconPath = Join-Path $targetDir "favicon.png"
if (Resize-Image -InputPath $sourceIcon -OutputPath $faviconPath -Width 192 -Height 192) {
    $fileInfo = Get-Item $faviconPath
    Write-Host "✅ Generado: favicon.png ($([math]::Round($fileInfo.Length/1KB, 2)) KB)" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ ¡Todos los iconos han sido redimensionados correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Ejecuta: npm run build" -ForegroundColor White
Write-Host "   2. Sube los archivos al servidor" -ForegroundColor White
Write-Host "   3. Verifica en DevTools que no haya errores" -ForegroundColor White
