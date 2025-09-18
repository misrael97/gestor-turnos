import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  ngOnInit() {
    // TODO: Lógica para cargar colas
  }

  onSubmit() {
    // TODO: Lógica para crear/actualizar cola
  }

  editCola(c: any) {
    this.cola = { ...c };
  }

  deleteCola(id: number) {
    // TODO: Lógica para eliminar cola
  }

  resetForm() {
    this.cola = { nombre: '', descripcion: '' };
  }
}
