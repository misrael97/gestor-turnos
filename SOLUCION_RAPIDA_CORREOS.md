# ⚡ Solución Rápida: Correos 2FA No Se Envían

## 🎯 Solución Más Simple (5 minutos)

### 1️⃣ Edita el archivo `.env` en tu proyecto Laravel

Busca esta línea:
```env
QUEUE_CONNECTION=database
```
o
```env
QUEUE_CONNECTION=redis
```

**Cámbiala a:**
```env
QUEUE_CONNECTION=sync
```

### 2️⃣ Limpia la caché de Laravel

```bash
php artisan config:clear
php artisan cache:clear
```

### 3️⃣ ¡Listo! Prueba el login

Ahora los correos se enviarán **inmediatamente** sin necesidad de ejecutar `php artisan queue:work`.

---

## 📋 Explicación

- **Antes:** Laravel enviaba correos a una cola y necesitabas `php artisan queue:work` para procesarlos
- **Ahora:** Laravel envía correos **inmediatamente** (de forma síncrona)

---

## ⚠️ Nota para Producción

Esta solución es perfecta para **desarrollo y sitios pequeños**.

Para **producción con muchos usuarios**, es mejor usar colas con Supervisor. Ver `SOLUCION_CORREOS_2FA.md` para más detalles.

---

## 🧪 Verificar que Funciona

1. Abre la PWA en el celular
2. Intenta iniciar sesión
3. El correo con el código 2FA debería llegar **inmediatamente**
4. Ya no necesitas ejecutar `php artisan queue:work`

---

## 🆘 Si No Funciona

Verifica la configuración de correo en `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-contraseña-de-aplicacion
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=tu-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

**Importante:** Si usas Gmail, necesitas crear una [contraseña de aplicación](https://support.google.com/accounts/answer/185833).

---

**¡Eso es todo! 🚀**
