# 🔧 Solución: Correos 2FA No Se Envían Automáticamente

## 📋 Problema

Los correos de 2FA no se envían automáticamente. Necesitas ejecutar manualmente `php artisan queue:work` para que los correos salgan.

**Causa:** Laravel está configurado para enviar correos usando **colas (queues)**, pero el worker de colas no está corriendo automáticamente en el servidor.

---

## ✅ Solución A: Envío Síncrono (Más Simple)

Esta solución hace que los correos se envíen **inmediatamente** sin usar colas.

### Paso 1: Cambiar el Driver de Colas a `sync`

Edita el archivo `.env` en tu proyecto Laravel:

```env
# Antes (con colas)
QUEUE_CONNECTION=database
# o
QUEUE_CONNECTION=redis

# Después (sin colas - envío inmediato)
QUEUE_CONNECTION=sync
```

### Paso 2: Limpiar Caché de Laravel

```bash
php artisan config:clear
php artisan cache:clear
```

### Paso 3: Probar

Ahora los correos deberían enviarse **inmediatamente** cuando el usuario intenta iniciar sesión, sin necesidad de ejecutar `php artisan queue:work`.

**✅ Ventajas:**
- Simple y directo
- No requiere configuración adicional
- Funciona inmediatamente

**⚠️ Desventajas:**
- El usuario debe esperar a que el correo se envíe antes de recibir la respuesta
- Si el servidor de correo es lento, la petición HTTP tardará más
- No es escalable para muchos usuarios simultáneos

---

## ✅ Solución B: Configurar Colas Automáticas (Recomendado para Producción)

Esta solución mantiene las colas pero las configura para que corran automáticamente en el servidor.

### Opción B1: Usar Supervisor (Linux)

#### 1. Instalar Supervisor

```bash
sudo apt-get install supervisor
```

#### 2. Crear Configuración de Supervisor

Crea el archivo `/etc/supervisor/conf.d/laravel-worker.conf`:

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /ruta/completa/a/tu/proyecto/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/ruta/completa/a/tu/proyecto/storage/logs/worker.log
stopwaitsecs=3600
```

**Importante:** Reemplaza `/ruta/completa/a/tu/proyecto` con la ruta real de tu proyecto Laravel.

#### 3. Recargar Supervisor

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

#### 4. Verificar que Esté Corriendo

```bash
sudo supervisorctl status
```

Deberías ver algo como:
```
laravel-worker:laravel-worker_00   RUNNING   pid 12345, uptime 0:00:10
laravel-worker:laravel-worker_01   RUNNING   pid 12346, uptime 0:00:10
```

---

### Opción B2: Usar Cron Job (Linux)

Si no puedes usar Supervisor, puedes usar un cron job que ejecute el worker cada minuto.

#### 1. Editar Crontab

```bash
crontab -e
```

#### 2. Agregar Esta Línea

```cron
* * * * * cd /ruta/completa/a/tu/proyecto && php artisan schedule:run >> /dev/null 2>&1
```

#### 3. Configurar el Scheduler en Laravel

Edita `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Ejecutar el worker de colas cada minuto
    $schedule->command('queue:work --stop-when-empty')
             ->everyMinute()
             ->withoutOverlapping();
}
```

---

### Opción B3: Usar Systemd (Linux)

#### 1. Crear Servicio de Systemd

Crea el archivo `/etc/systemd/system/laravel-queue.service`:

```ini
[Unit]
Description=Laravel Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /ruta/completa/a/tu/proyecto/artisan queue:work --sleep=3 --tries=3 --max-time=3600

[Install]
WantedBy=multi-user.target
```

#### 2. Habilitar y Arrancar el Servicio

```bash
sudo systemctl daemon-reload
sudo systemctl enable laravel-queue
sudo systemctl start laravel-queue
```

#### 3. Verificar Estado

```bash
sudo systemctl status laravel-queue
```

---

### Opción B4: Usar Horizon (Si usas Redis)

Si estás usando Redis como driver de colas, puedes usar **Laravel Horizon**.

#### 1. Instalar Horizon

```bash
composer require laravel/horizon
```

#### 2. Publicar Configuración

```bash
php artisan horizon:install
```

#### 3. Configurar Supervisor para Horizon

Crea `/etc/supervisor/conf.d/horizon.conf`:

```ini
[program:horizon]
process_name=%(program_name)s
command=php /ruta/completa/a/tu/proyecto/artisan horizon
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/ruta/completa/a/tu/proyecto/storage/logs/horizon.log
stopwaitsecs=3600
```

#### 4. Recargar Supervisor

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start horizon
```

---

## 🔍 Verificar Configuración Actual

### 1. Verificar Driver de Colas

```bash
php artisan config:show queue.default
```

### 2. Verificar Jobs Pendientes

```bash
php artisan queue:failed
```

### 3. Ver Logs

```bash
tail -f storage/logs/laravel.log
```

---

## 🧪 Probar el Envío de Correos

### 1. Probar Envío Manual

```bash
php artisan tinker
```

Luego ejecuta:

```php
Mail::raw('Test email', function ($message) {
    $message->to('tu-email@example.com')
            ->subject('Test');
});
```

### 2. Verificar Configuración de Correo

Edita `.env`:

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

**Nota:** Si usas Gmail, necesitas crear una [contraseña de aplicación](https://support.google.com/accounts/answer/185833).

---

## 📊 Comparación de Soluciones

| Solución | Complejidad | Rendimiento | Escalabilidad | Recomendado Para |
|----------|-------------|-------------|---------------|------------------|
| **Sync** | ⭐ Muy Fácil | ⚠️ Medio | ❌ Baja | Desarrollo, sitios pequeños |
| **Supervisor** | ⭐⭐⭐ Medio | ✅ Alto | ✅ Alta | **Producción (Recomendado)** |
| **Cron Job** | ⭐⭐ Fácil | ⚠️ Medio | ⚠️ Media | Sitios medianos |
| **Systemd** | ⭐⭐⭐ Medio | ✅ Alto | ✅ Alta | Producción (alternativa) |
| **Horizon** | ⭐⭐⭐⭐ Difícil | ✅ Muy Alto | ✅ Muy Alta | Proyectos grandes con Redis |

---

## 🎯 Recomendación

### Para Desarrollo/Testing:
```env
QUEUE_CONNECTION=sync
```

### Para Producción:
1. Mantén `QUEUE_CONNECTION=database` (o `redis`)
2. Configura **Supervisor** (Opción B1)
3. Monitorea los logs regularmente

---

## 🆘 Troubleshooting

### Problema: Los correos aún no se envían

1. **Verifica la configuración de correo:**
   ```bash
   php artisan config:show mail
   ```

2. **Verifica que el worker esté corriendo:**
   ```bash
   ps aux | grep "queue:work"
   ```

3. **Revisa los logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

4. **Verifica jobs fallidos:**
   ```bash
   php artisan queue:failed
   ```

### Problema: Supervisor no arranca

```bash
# Ver logs de supervisor
sudo tail -f /var/log/supervisor/supervisord.log

# Reiniciar supervisor
sudo systemctl restart supervisor
```

### Problema: Correos van a spam

1. Configura **SPF, DKIM y DMARC** en tu dominio
2. Usa un servicio de correo confiable (SendGrid, Mailgun, Amazon SES)
3. Verifica que tu servidor no esté en listas negras

---

## 📝 Checklist

- [ ] Decidir qué solución usar (A o B)
- [ ] Cambiar `QUEUE_CONNECTION` en `.env`
- [ ] Limpiar caché de Laravel
- [ ] Configurar Supervisor/Cron (si usas Solución B)
- [ ] Verificar configuración de correo en `.env`
- [ ] Probar envío de correo
- [ ] Verificar que llegue al inbox (no spam)
- [ ] Monitorear logs

---

## 🚀 Próximos Pasos

1. **Elige una solución** (recomiendo Sync para desarrollo, Supervisor para producción)
2. **Aplica los cambios** según la solución elegida
3. **Prueba el login** en la PWA
4. **Verifica que el correo llegue**

---

**¿Necesitas ayuda con algún paso específico?** 🤔
