const fs = require("fs");
const path = require("path");

// Este script crea un SVG simple que puede ser usado como icono
// Luego necesitarás convertirlo a PNG en diferentes tamaños

const iconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Fondo con gradiente -->
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3880ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Círculo de fondo -->
  <circle cx="256" cy="256" r="240" fill="url(#grad1)"/>
  
  <!-- Borde blanco -->
  <circle cx="256" cy="256" r="240" fill="none" stroke="#ffffff" stroke-width="8"/>
  
  <!-- Texto "GT" -->
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="200" font-weight="bold" 
        fill="#ffffff" text-anchor="middle">GT</text>
  
  <!-- Subtítulo pequeño -->
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="40" 
        fill="#ffffff" text-anchor="middle" opacity="0.9">Turnos</text>
</svg>`;

// Guardar el SVG
const iconPath = path.join(__dirname, "src", "assets", "icon", "app-icon.svg");
fs.writeFileSync(iconPath, iconSVG, "utf8");

console.log("✓ Icono SVG creado en:", iconPath);
console.log("\nPróximos pasos:");
console.log("1. Abre app-icon.svg en un navegador para verificar");
console.log("2. Usa una herramienta online para convertir SVG a PNG:");
console.log("   - https://cloudconvert.com/svg-to-png");
console.log("   - https://www.pwabuilder.com/");
console.log("3. Genera los siguientes tamaños:");
console.log("   - 192x192px → icon-192x192.png");
console.log("   - 512x512px → icon-512x512.png");
console.log("4. Reemplaza los archivos en src/assets/icon/");
