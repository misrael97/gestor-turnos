import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Usuario {
  imagen: string;
  correo: string;
  nombre: string;
  rol: string;
  auth: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  usuarios: Usuario[] = [
    { imagen: 'https://randomuser.me/api/portraits/men/1.jpg', correo: 'admin@email.com', nombre: 'admin', rol: 'admin', auth: 'Normal' },
    { imagen: 'https://randomuser.me/api/portraits/men/2.jpg', correo: 'user1@email.com', nombre: 'User1', rol: 'ghost', auth: 'Normal' },
    { imagen: 'https://randomuser.me/api/portraits/men/3.jpg', correo: 'user7@email.com', nombre: 'User7', rol: 'editor', auth: 'Normal' },
    { imagen: 'https://randomuser.me/api/portraits/men/4.jpg', correo: 'user8@email.com', nombre: 'User8', rol: 'admin', auth: 'Normal' },
    { imagen: 'https://randomuser.me/api/portraits/men/5.jpg', correo: 'user9@email.com', nombre: 'User9', rol: 'editor', auth: 'Normal' },
  ];
  roles: string[] = ['admin', 'ghost', 'editor'];
  pagina = 1;
  totalPaginas = 2;
  buscar = '';
}
