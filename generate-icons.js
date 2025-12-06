const fs = require('fs');
const path = require('path');

// Ruta del icono generado
const sourceIcon = 'C:/Users/silva/.gemini/antigravity/brain/7ecf8a36-ea9c-4fef-8075-38694bf42b01/turnos_app_icon_1765030053458.png';
const targetDir = path.join(__dirname, 'src', 'assets', 'icon');

// Tamaños requeridos para PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('🎨 Generando iconos para PWA...\n');

// Verificar si sharp está disponible
let sharp;
try {
    sharp = require('sharp');
} catch (error) {
    console.error('❌ Error: sharp no está instalado.');
    console.log('📦 Instalando sharp...\n');
    const { execSync } = require('child_process');
    execSync('npm install sharp --save-dev', { stdio: 'inherit' });
    sharp = require('sharp');
}

// Verificar que el archivo fuente existe
if (!fs.existsSync(sourceIcon)) {
    console.error(`❌ Error: No se encontró el archivo fuente: ${sourceIcon}`);
    process.exit(1);
}

// Crear directorio si no existe
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Generar cada tamaño
async function generateIcons() {
    for (const size of sizes) {
        const outputPath = path.join(targetDir, `icon-${size}x${size}.png`);

        try {
            await sharp(sourceIcon)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .png()
                .toFile(outputPath);

            console.log(`✅ Generado: icon-${size}x${size}.png`);
        } catch (error) {
            console.error(`❌ Error generando icon-${size}x${size}.png:`, error.message);
        }
    }

    // Copiar el icono de 192x192 como favicon
    const faviconPath = path.join(targetDir, 'favicon.png');
    try {
        await sharp(sourceIcon)
            .resize(192, 192, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png()
            .toFile(faviconPath);

        console.log(`✅ Generado: favicon.png`);
    } catch (error) {
        console.error(`❌ Error generando favicon.png:`, error.message);
    }

    console.log('\n✨ ¡Todos los iconos han sido generados exitosamente!');
}

generateIcons().catch(error => {
    console.error('❌ Error general:', error);
    process.exit(1);
});
