import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  name = '';
  email = '';
  password = '';
  confirmEmail = '';
  errorMsg = '';
  successMsg = '';

  constructor(private router: Router, private auth: Auth) {}

  onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';
    if (this.email !== this.confirmEmail) {
      this.errorMsg = 'Los correos no coinciden';
      return;
    }
    this.auth.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.successMsg = 'Registro exitoso. Ahora puedes iniciar sesión.';
        this.router.navigate(['/login']); // Redirige inmediatamente
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Error en el registro';
      }
    });
  }
}
