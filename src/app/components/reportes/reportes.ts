import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class ReportesComponent implements OnInit {
  reportes: any[] = [];
  filtroFecha: string = '';

  ngOnInit() {
    // TODO: Lógica para cargar reportes
  }

  filtrar() {
    // TODO: Lógica para filtrar reportes por fecha
  }
}
