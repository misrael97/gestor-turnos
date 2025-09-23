import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnosService } from '../../services/turnos.service';
import { ColasService } from '../../services/colas.service';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turnos.html',
  styleUrls: ['./turnos.css']
})
export class TurnosComponent implements OnInit {
  turnos: any[] = [];
  turno: any = { numero: '', estado: '', cliente: '', cola_id: '', fecha: '' };
  colas: any[] = [];

  constructor(private turnosService: TurnosService, private colasService: ColasService) {}

  ngOnInit() {
    this.getTurnos();
    this.getColas();
  }

  getTurnos() {
    this.turnosService.getTurnos().subscribe(data => {
      this.turnos = data;
    });
  }

  getColas() {
    this.colasService.getColas().subscribe(data => {
      this.colas = data;
    });
  }

  getColaNombre(id: number) {
    const c = this.colas.find(c => c.id === id);
    return c ? c.nombre : id;
  }

  onSubmit() {
    if (this.turno.id) {
      this.turnosService.updateTurno(this.turno.id, this.turno).subscribe(() => {
        this.getTurnos();
        this.resetForm();
      });
    } else {
      this.turnosService.createTurno(this.turno).subscribe(() => {
        this.getTurnos();
        this.resetForm();
      });
    }
  }

  editTurno(t: any) {
    this.turno = { ...t };
  }

  deleteTurno(id: number) {
    if (confirm('¿Seguro que deseas eliminar este turno?')) {
      this.turnosService.deleteTurno(id).subscribe(() => {
        this.getTurnos();
      });
    }
  }

  resetForm() {
    this.turno = { numero: '', estado: '', cliente: '', cola_id: '', fecha: '' };
  }
}


