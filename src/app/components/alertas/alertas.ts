import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alertas.html',
  styleUrls: ['./alertas.css']
})
export class AlertasComponent implements OnInit {
  alertas: any[] = [];

  ngOnInit() {
    // TODO: Lógica para cargar alertas
  }

  atenderAlerta(id: number) {
    // TODO: Lógica para atender alerta
  }
}
