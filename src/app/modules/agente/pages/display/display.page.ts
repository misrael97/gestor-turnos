import { Component, OnInit, OnDestroy } from "@angular/core";
import { TurnosService } from "src/app/core/services/turnos.service";
import { Subscription, interval } from "rxjs";
import { switchMap, startWith } from "rxjs/operators";

interface TurnoDisplay {
  numero: string;
  puesto: number | string;
}

@Component({
  selector: "app-display",
  templateUrl: "./display.page.html",
  styleUrls: ["./display.page.scss"],
})
export class DisplayPage implements OnInit, OnDestroy {
  currentTurn: TurnoDisplay = {
    numero: "--",
    puesto: "--",
  };

  calledNumbers: TurnoDisplay[] = [];
  private refreshSubscription: Subscription;

  constructor(private turnosService: TurnosService) {}

  ngOnInit() {
    // Actualizar cada 3 segundos
    this.refreshSubscription = interval(3000)
      .pipe(
        startWith(0), // Ejecutar inmediatamente
        switchMap(() => this.turnosService.obtenerTurnos())
      )
      .subscribe({
        next: (response: any) => {
          console.log("📺 Display - Turnos recibidos:", response);
          this.updateDisplay(response);
        },
        error: (err) => {
          console.error("❌ Error al cargar turnos para display:", err);
          this.clearDisplay();
        },
      });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  updateDisplay(response: any) {
    // El backend puede devolver { data: [...] } o directamente [...]
    const turnos = response?.data || response || [];

    if (!Array.isArray(turnos) || turnos.length === 0) {
      this.clearDisplay();
      return;
    }

    // ✅ Filtrar solo turnos con estados que EXISTEN en tu API
    const turnosActivos = turnos.filter(
      (t) => t.estado === "llamado" || t.estado === "espera"
    );

    if (turnosActivos.length === 0) {
      this.clearDisplay();
      return;
    }

    // Mapear a la estructura que espera la vista
    const turnosMapeados = turnosActivos.map((turno) => ({
      id: turno.id,
      numero: this.generarCodigo(turno.id), // Generar código visual
      puesto: this.obtenerPuesto(turno),
      updated_at: turno.updated_at || turno.created_at,
      estado: turno.estado,
    }));

    // Ordenar por fecha de actualización (más reciente primero)
    const sortedTurnos = turnosMapeados.sort((a, b) => {
      const dateA = new Date(a.updated_at || 0).getTime();
      const dateB = new Date(b.updated_at || 0).getTime();
      return dateB - dateA;
    });

    // El turno más reciente es el actual (SU TURNO)
    const latest = sortedTurnos[0];
    this.currentTurn = {
      numero: latest.numero,
      puesto: latest.puesto,
    };

    // Los siguientes 4 son los números llamados
    this.calledNumbers = sortedTurnos.slice(1, 5).map((t) => ({
      numero: t.numero,
      puesto: t.puesto,
    }));

    console.log("📺 Turno actual:", this.currentTurn);
    console.log("📺 Números llamados:", this.calledNumbers);
  }

  /**
   * Genera un código visual para el turno (ej: T001, T042)
   */
  generarCodigo(id: number): string {
    return `T${String(id).padStart(3, "0")}`;
  }

  /**
   * Obtiene el puesto/ventanilla del turno
   * Usa negocio_id o nombre del negocio
   */
  obtenerPuesto(turno: any): number | string {
    // Prioridad: negocio_id > nombre del negocio > 'N/A'
    if (turno.negocio_id) return turno.negocio_id;
    if (turno.negocio?.nombre) return turno.negocio.nombre;
    return "N/A";
  }

  clearDisplay() {
    this.currentTurn = {
      numero: "--",
      puesto: "--",
    };
    this.calledNumbers = [];
    console.log("📺 Display limpio - No hay turnos activos");
  }
}
