import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColasService } from '../../services/colas.service';

@Component({
  selector: 'app-colas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './colas.html',
  styleUrls: ['./colas.css']
})
export class ColasComponent implements OnInit {
  colas: any[] = [];
  cola: any = { nombre: '', descripcion: '' };

  constructor(private colasService: ColasService) {}

  ngOnInit() {
    this.getColas();
  }

  getColas() {
    this.colasService.getColas().subscribe(data => {
      this.colas = data;
    });
  }

  onSubmit() {
    if (this.cola.id) {
      this.colasService.updateCola(this.cola.id, this.cola).subscribe(() => {
        this.getColas();
        this.resetForm();
      });
    } else {
      this.colasService.createCola(this.cola).subscribe(() => {
        this.getColas();
        this.resetForm();
      });
    }
  }

  editCola(c: any) {
    this.cola = { ...c };
  }

  deleteCola(id: number) {
    if (confirm('¿Seguro que deseas eliminar esta cola?')) {
      this.colasService.deleteCola(id).subscribe(() => {
        this.getColas();
      });
    }
  }

  resetForm() {
    this.cola = { nombre: '', descripcion: '' };
  }
}


