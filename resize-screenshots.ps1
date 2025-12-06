# Script para redimensionar screenshots de PWA
Add-Type -AssemblyName System.Drawing

$desktopSource = "C:\Users\silva\.gemini\antigravity\brain\7ecf8a36-ea9c-4fef-8075-38694bf42b01\turnos_desktop_screenshot_1765030318011.png"
$mobileSource = "C:\Users\silva\.gemini\antigravity\brain\7ecf8a36-ea9c-4fef-8075-38694bf42b01\turnos_mobile_screenshot_1765030334492.png"
$targetDir = "src\assets\screenshots"

Write-Host "📸 Redimensionando screenshots..." -ForegroundColor Cyan
Write-Host ""

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
        
        # Calcular dimensiones para mantener aspecto
        $srcWidth = $img.Width
        $srcHeight = $img.Height
        $srcRatio = $srcWidth / $srcHeight
        $dstRatio = $Width / $Height
        
        $drawWidth = $Width
        $drawHeight = $Height
        $drawX = 0
        $drawY = 0
        
        if ($srcRatio -gt $dstRatio) {
            # Imagen más ancha, ajustar altura
            $drawHeight = [int]($Width / $srcRatio)
            $drawY = [int](($Height - $drawHeight) / 2)
        }
        else {
            # Imagen más alta, ajustar ancho
            $drawWidth = [int]($Height * $srcRatio)
            $drawX = [int](($Width - $drawWidth) / 2)
        }
        
        # Fondo blanco
        $graphics.Clear([System.Drawing.Color]::White)
        
        # Dibujar imagen centrada
        $graphics.DrawImage($img, $drawX, $drawY, $drawWidth, $drawHeight)
        
        # Guardar
        $newImg.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Limpiar recursos
        $graphics.Dispose()
        $newImg.Dispose()
        $img.Dispose()
        
        return $true
    }
    catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        return $false
    }
}

# Redimensionar screenshot desktop (1280x720)
Write-Host "⏳ Procesando: desktop.png (1280x720)..." -ForegroundColor Yellow
$desktopOutput = Join-Path $targetDir "desktop.png"
if (Test-Path $desktopSource) {
    if (Resize-Image -InputPath $desktopSource -OutputPath $desktopOutput -Width 1280 -Height 720) {
        $fileInfo = Get-Item $desktopOutput
        Write-Host "✅ Generado: desktop.png ($([math]::Round($fileInfo.Length/1KB, 2)) KB)" -ForegroundColor Green
    }
}
else {
    Write-Host "⚠️  Archivo fuente no encontrado: $desktopSource" -ForegroundColor Yellow
}

# Redimensionar screenshot mobile (540x720)
Write-Host "⏳ Procesando: mobile.png (540x720)..." -ForegroundColor Yellow
$mobileOutput = Join-Path $targetDir "mobile.png"
if (Test-Path $mobileSource) {
    if (Resize-Image -InputPath $mobileSource -OutputPath $mobileOutput -Width 540 -Height 720) {
        $fileInfo = Get-Item $mobileOutput
        Write-Host "✅ Generado: mobile.png ($([math]::Round($fileInfo.Length/1KB, 2)) KB)" -ForegroundColor Green
    }
}
else {
    Write-Host "⚠️  Archivo fuente no encontrado: $mobileSource" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ ¡Screenshots redimensionados correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Ejecuta: npm run build" -ForegroundColor White
Write-Host "   2. Recarga la página en el navegador (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "   3. Verifica en DevTools → Application → Manifest" -ForegroundColor White
