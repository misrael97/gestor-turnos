import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NegociosService } from '../../services/negocios.service';

@Component({
  selector: 'app-negocios',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './negocios.html',
  styleUrls: ['./negocios.css']
})
export class NegociosComponent implements OnInit {
  negocios: any[] = [];
  negocio: any = { nombre: '' };

  constructor(private negociosService: NegociosService) {}

  ngOnInit() {
    this.getNegocios();
  }

  getNegocios() {
    this.negociosService.getNegocios().subscribe(data => {
      this.negocios = data;
    });
  }

  onSubmit() {
    if (this.negocio.id) {
      this.negociosService.updateNegocio(this.negocio.id, this.negocio).subscribe(() => {
        this.getNegocios();
        this.resetForm();
      });
    } else {
      this.negociosService.createNegocio(this.negocio).subscribe(() => {
        this.getNegocios();
        this.resetForm();
      });
    }
  }

  editNegocio(n: any) {
    this.negocio = { ...n };
  }

  deleteNegocio(id: number) {
    if (confirm('¿Seguro que deseas eliminar este negocio?')) {
      this.negociosService.deleteNegocio(id).subscribe(() => {
        this.getNegocios();
      });
    }
  }

  resetForm() {
    this.negocio = { nombre: '' };
  }
}
