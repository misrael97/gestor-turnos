import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SucursalesService } from '../../services/sucursales.service';
import { NegociosService } from '../../services/negocios.service';

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sucursales.html',
  styleUrls: ['./sucursales.css']
})
export class SucursalesComponent implements OnInit {
  sucursales: any[] = [];
  sucursal: any = { negocio_id: '', nombre: '', direccion: '' };
  negocios: any[] = [];

  constructor(
    private sucursalesService: SucursalesService,
    private negociosService: NegociosService
  ) {}

  ngOnInit() {
    this.getNegocios();
  }

  getNegocios() {
    this.negociosService.getNegocios().subscribe(data => {
      this.negocios = data;
      if (this.negocios.length > 0) {
        this.sucursal.negocio_id = this.negocios[0].id;
        this.getSucursales();
      }
    });
  }

  getSucursales() {
    if (!this.sucursal.negocio_id) return;
    this.sucursalesService.getSucursales(this.sucursal.negocio_id).subscribe(data => {
      this.sucursales = data;
    });
  }

  getNegocioNombre(id: number) {
    const n = this.negocios.find(n => n.id === id);
    return n ? n.nombre : id;
  }

  onSubmit() {
    if (this.sucursal.id) {
      this.sucursalesService.updateSucursal(this.sucursal.id, this.sucursal).subscribe(() => {
        this.getSucursales();
        this.resetForm();
      });
    } else {
      this.sucursalesService.createSucursal(this.sucursal).subscribe(() => {
        this.getSucursales();
        this.resetForm();
      });
    }
  }

  editSucursal(s: any) {
    this.sucursal = { ...s };
  }

  deleteSucursal(id: number) {
    if (confirm('¿Seguro que deseas eliminar esta sucursal?')) {
      this.sucursalesService.deleteSucursal(id).subscribe(() => {
        this.getSucursales();
      });
    }
  }

  resetForm() {
    this.sucursal = { negocio_id: this.negocios.length > 0 ? this.negocios[0].id : '', nombre: '', direccion: '' };
  }
}
