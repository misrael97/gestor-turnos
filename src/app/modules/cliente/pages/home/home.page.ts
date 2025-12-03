import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { TurnosService } from 'src/app/core/services/turnos.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  tiempoEstimado = 15;
  sucursales: any[] = [];
  sucursalSeleccionada: number | null = null;
  loading = false;
  
  // Propiedades para citas programadas
  fechaCita: string = '';
  horaCita: string = '';
  fechaMinima: string;
  fechaMaxima: string;

  constructor(
    private turnosService: TurnosService,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {
    // Configurar fechas mínima y máxima
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString();
    
    // Máximo 30 días adelante
    const maxFecha = new Date();
    maxFecha.setDate(maxFecha.getDate() + 30);
    this.fechaMaxima = maxFecha.toISOString();
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    console.log('Página Home cargada - Cargando sucursales desde backend...');
    console.log('URL de sucursales: /api/sucursales');
    
    this.turnosService.getSucursales().subscribe({
      next: (res: any) => {
        console.log('✅ Respuesta del backend (sucursales):', res);
        console.log('Tipo de respuesta:', typeof res);
        
        // Verificar si la respuesta es HTML (error)
        if (typeof res === 'string' && res.includes('<!DOCTYPE') || res.includes('<html')) {
          console.error('❌ El backend devolvió HTML en lugar de JSON');
          console.error('Esto indica que el endpoint /api/sucursales no existe o hay un error 500');
          this.loading = false;
          this.toastCtrl.create({
            message: 'Error: El endpoint /api/sucursales no está disponible',
            duration: 4000,
            color: 'danger'
          }).then(toast => toast.present());
          return;
        }
        
        // Manejar diferentes formatos de respuesta
        if (Array.isArray(res)) {
          this.sucursales = res;
        } else if (res.data && Array.isArray(res.data)) {
          this.sucursales = res.data;
        } else if (res.sucursales && Array.isArray(res.sucursales)) {
          this.sucursales = res.sucursales;
        } else {
          console.warn('⚠️ Formato de respuesta no reconocido:', res);
          this.sucursales = [];
        }
        
        console.log('📍 Sucursales procesadas:', this.sucursales.length, 'encontradas');
        console.log('Datos:', this.sucursales);
        this.loading = false;
        
        // Seleccionar la primera sucursal por defecto si existe
        if (this.sucursales.length > 0) {
          this.sucursalSeleccionada = this.sucursales[0].id;
          console.log('✅ Sucursal seleccionada por defecto:', this.sucursalSeleccionada, '-', this.sucursales[0].nombre);
        } else {
          console.warn('⚠️ No se encontraron sucursales disponibles');
          this.toastCtrl.create({
            message: 'No hay sucursales disponibles',
            duration: 3000,
            color: 'warning'
          }).then(toast => toast.present());
        }
      },
      error: (err) => {
        console.error('❌ Error HTTP al cargar sucursales');
        console.error('Status:', err.status);
        console.error('Status Text:', err.statusText);
        console.error('URL:', err.url);
        console.error('Error completo:', err);
        console.error('Error body:', err.error);
        
        // Verificar si es HTML
        if (typeof err.error === 'string' && (err.error.includes('<!DOCTYPE') || err.error.includes('<html'))) {
          console.error('❌ La respuesta de error es HTML - El endpoint probablemente no existe en Laravel');
        }
        
        this.loading = false;
        
        let mensaje = 'No se pudieron cargar las sucursales';
        if (err.status === 404) {
          mensaje = 'El endpoint /api/sucursales no existe en el backend';
        } else if (err.status === 401) {
          mensaje = 'No autorizado. Por favor, inicia sesión nuevamente';
        } else if (err.status === 500) {
          mensaje = 'Error del servidor. Verifica los logs de Laravel';
        }
        
        this.toastCtrl.create({
          message: mensaje,
          duration: 4000,
          color: 'danger'
        }).then(toast => toast.present());
      }
    });
  }

  async obtenerTurno() {
    console.log('Botón "Obtener Turno" clickeado - Enviando petición...');
    
    if (!this.sucursalSeleccionada) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor selecciona una sucursal',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }
    
    this.loading = true;
    
    const datos = {
      negocio_id: this.sucursalSeleccionada, // ✅ Usar la sucursal seleccionada
      cola_id: 1,
      tipo: 'presencial'
    };
    console.log('Datos enviados:', datos);
    
    this.turnosService.crearTurno(datos).subscribe({
      next: async (res) => {
        console.log('Turno creado exitosamente:', res);
        this.loading = false;
        const toast = await this.toastCtrl.create({
          message: 'Turno generado exitosamente',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.navCtrl.navigateForward('/cliente/mi-turno');
      },
      error: async (err) => {
        console.error('Error completo:', err);
        console.error('Detalles del error:', err.error);
        this.loading = false;
        
        let mensaje = 'Error al crear turno';
        
        // Verificar si ya tiene un turno activo
        if (err.status === 422 && (err.error?.error?.includes('turno activo') || err.error?.message?.includes('turno activo'))) {
          mensaje = err.error?.error || err.error?.message || 'Ya tienes un turno activo';
          
          const toast = await this.toastCtrl.create({
            message: mensaje + '. Ve a "Mi Turno" para verlo.',
            duration: 5000,
            color: 'warning',
            buttons: [
              {
                text: 'Ver Mi Turno',
                handler: () => {
                  this.navCtrl.navigateForward('/cliente/mi-turno');
                }
              },
              { text: 'Cerrar', role: 'cancel' }
            ]
          });
          await toast.present();
          return;
        }
        
        // Verificar si es un conflicto de horario
        if (err.status === 409 || err.error?.message?.includes('ocupado') || err.error?.message?.includes('disponible')) {
          mensaje = err.error?.message || 'Este horario ya está ocupado. Por favor, elige otro.';
        } else if (err.error?.message || err.error?.error) {
          mensaje = err.error?.message || err.error?.error;
        }
        
        const toast = await this.toastCtrl.create({
          message: mensaje,
          duration: 4000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async solicitarTurnoEnLinea() {
    console.log('Botón "Solicitar Turno en Línea" clickeado - Enviando petición...');
    
    if (!this.sucursalSeleccionada) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor selecciona una sucursal',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }
    
    if (!this.fechaCita || !this.horaCita) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor selecciona fecha y hora',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }
    
    this.loading = true;
    
    // Combinar fecha y hora
    const fechaHora = new Date(this.fechaCita);
    const horaSeleccionada = new Date(this.horaCita);
    fechaHora.setHours(horaSeleccionada.getHours());
    fechaHora.setMinutes(horaSeleccionada.getMinutes());
    
    const datos = {
      negocio_id: this.sucursalSeleccionada, // ✅ Usar la sucursal seleccionada
      cola_id: 1,
      tipo: 'online',
      programado: true,
      fecha_programada: fechaHora.toISOString().split('T')[0], // YYYY-MM-DD
      hora_programada: `${horaSeleccionada.getHours().toString().padStart(2, '0')}:${horaSeleccionada.getMinutes().toString().padStart(2, '0')}` // HH:mm
    };
    console.log('Datos enviados:', datos);
    
    this.turnosService.crearTurno(datos).subscribe({
      next: async (res) => {
        console.log('Turno programado exitosamente:', res);
        this.loading = false;
        // Limpiar los campos
        this.fechaCita = '';
        this.horaCita = '';
        const toast = await this.toastCtrl.create({
          message: 'Turno programado exitosamente',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.navCtrl.navigateForward('/cliente/mi-turno');
      },
      error: async (err) => {
        console.error('Error completo:', err);
        console.error('Detalles del error:', err.error);
        this.loading = false;
        
        let mensaje = 'Error al programar el turno';
        let color: 'danger' | 'warning' = 'danger';
        
        // Verificar si ya tiene un turno activo
        if (err.status === 422 && (err.error?.error?.includes('turno activo') || err.error?.message?.includes('turno activo'))) {
          mensaje = err.error?.error || err.error?.message || 'Ya tienes un turno activo';
          color = 'warning';
          
          // Mostrar el toast con opción de ver el turno existente
          const toast = await this.toastCtrl.create({
            message: mensaje + '. Ve a "Mi Turno" para verlo.',
            duration: 5000,
            color: color,
            buttons: [
              {
                text: 'Ver Mi Turno',
                handler: () => {
                  this.navCtrl.navigateForward('/cliente/mi-turno');
                }
              },
              {
                text: 'Cerrar',
                role: 'cancel'
              }
            ]
          });
          await toast.present();
          return;
        }
        
        // Verificar si es un conflicto de horario
        if (err.status === 409) {
          mensaje = err.error?.message || 'Este horario ya está ocupado en esta sucursal. Por favor, elige otra fecha/hora.';
          color = 'warning';
        } else if (err.error?.message?.includes('ocupado') || err.error?.message?.includes('disponible')) {
          mensaje = err.error.message;
          color = 'warning';
        } else if (err.error?.errors) {
          // Errores de validación
          const primerError = Object.values(err.error.errors)[0];
          mensaje = Array.isArray(primerError) ? primerError[0] : primerError;
        } else if (err.error?.message) {
          mensaje = err.error.message;
        } else if (err.error?.error) {
          mensaje = err.error.error;
        }
        
        console.warn('⚠️ Mensaje al usuario:', mensaje);
        
        const toast = await this.toastCtrl.create({
          message: mensaje,
          duration: 4000,
          color: color
        });
        await toast.present();
      }
    });
  }
}
