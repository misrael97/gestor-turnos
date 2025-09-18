import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestoresService } from '../../services/gestores.service';
import { SucursalesService } from '../../services/sucursales.service';

@Component({
  selector: 'app-gestores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestores.html',
  styleUrls: ['./gestores.css']
})
export class GestoresComponent implements OnInit {
  gestores: any[] = [];
  gestor: any = { name: '', email: '', password: '', sucursal_id: '' };
  sucursales: any[] = [];

  constructor(
    private gestoresService: GestoresService,
    private sucursalesService: SucursalesService
  ) {}

  ngOnInit() {
    this.getGestores();
    this.getSucursales();
  }

  getGestores() {
    this.gestoresService.getGestores().subscribe(data => {
      this.gestores = data;
    });
  }

  getSucursales() {
    this.sucursalesService.getSucursales(1).subscribe(data => {
      this.sucursales = data;
    });
  }

  getSucursalNombre(id: number) {
    const s = this.sucursales.find(s => s.id === id);
    return s ? s.nombre : id;
  }

  onSubmit() {
    if (this.gestor.id) {
      const data = { ...this.gestor };
      if (!data.password) delete data.password;
      this.gestoresService.updateGestor(this.gestor.id, data).subscribe(() => {
        this.getGestores();
        this.resetForm();
      });
    } else {
      this.gestoresService.createGestor(this.gestor).subscribe(() => {
        this.getGestores();
        this.resetForm();
      });
    }
  }

  editGestor(g: any) {
    this.gestor = { ...g, password: '' };
  }

  deleteGestor(id: number) {
    if (confirm('¿Seguro que deseas eliminar este gestor?')) {
      this.gestoresService.deleteGestor(id).subscribe(() => {
        this.getGestores();
      });
    }
  }

  resetForm() {
    this.gestor = { name: '', email: '', password: '', sucursal_id: '' };
  }
}
