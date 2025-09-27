import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citas.html',
  styleUrls: ['./citas.css']
})
export class CitasComponent implements OnInit {
  citas: any[] = [];
  cita: any = { cliente: '', fecha: '', hora: '', sucursal_id: '' };
  sucursales: any[] = [];

  ngOnInit() {
    // TODO: Lógica para cargar citas y sucursales
  }

  getSucursalNombre(id: number) {
    const s = this.sucursales.find(s => s.id === id);
    return s ? s.nombre : id;
  }

  onSubmit() {
    // TODO: Lógica para crear/actualizar cita
  }

  editCita(c: any) {
    this.cita = { ...c };
  }

  deleteCita(id: number) {
    // TODO: Lógica para eliminar cita
  }

  resetForm() {
    this.cita = { cliente: '', fecha: '', hora: '', sucursal_id: '' };
  }
}





