import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuario: any = { name: '', email: '', password: '', role: '' };
  roles: string[] = ['admin', 'gestor', 'editor', 'ghost'];

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit() {
    this.getUsuarios();
  }

  getUsuarios() {
    this.usuariosService.getUsuarios().subscribe(data => {
      this.usuarios = data;
    });
  }

  onSubmit() {
    if (this.usuario.id) {
      const data = { ...this.usuario };
      if (!data.password) delete data.password;
      this.usuariosService.updateUsuario(this.usuario.id, data).subscribe(() => {
        this.getUsuarios();
        this.resetForm();
      });
    } else {
      this.usuariosService.createUsuario(this.usuario).subscribe(() => {
        this.getUsuarios();
        this.resetForm();
      });
    }
  }

  editUsuario(u: any) {
    this.usuario = { ...u, password: '' };
  }

  deleteUsuario(id: number) {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      this.usuariosService.deleteUsuario(id).subscribe(() => {
        this.getUsuarios();
      });
    }
  }

  resetForm() {
    this.usuario = { name: '', email: '', password: '', role: '' };
  }
}
