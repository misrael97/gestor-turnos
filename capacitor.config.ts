import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.gturnos.app",
  appName: "Gestor de Turnos",
  bundledWebRuntime: false,
  webDir: "www",
  server: {
    // Permitir conexiones HTTP en desarrollo (solo para testing local)
    cleartext: true,
    // Configuración para permitir todas las conexiones
    androidScheme: 'https',
    iosScheme: 'https',
    // Permitir navegación externa
    allowNavigation: [
      'https://gturnos.tech',
      'https://*.gturnos.tech',
      'http://localhost:8000',
      'http://127.0.0.1:8000'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#3880ff",
      showSpinner: false
    }
  }
};

export default config;
