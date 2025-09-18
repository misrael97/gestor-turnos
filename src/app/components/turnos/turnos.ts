import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  ngOnInit() {
    // TODO: Lógica para cargar turnos y colas
  }

  getColaNombre(id: number) {
    const c = this.colas.find(c => c.id === id);
    return c ? c.nombre : id;
  }

  onSubmit() {
    // TODO: Lógica para crear/actualizar turno
  }

  editTurno(t: any) {
    this.turno = { ...t };
  }

  deleteTurno(id: number) {
    // TODO: Lógica para eliminar turno
  }

  resetForm() {
    this.turno = { numero: '', estado: '', cliente: '', cola_id: '', fecha: '' };
  }
}
