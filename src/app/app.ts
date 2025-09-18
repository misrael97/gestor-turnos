import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NegociosComponent } from './components/negocios/negocios';
import { SucursalesComponent } from './components/sucursales/sucursales';
import { GestoresComponent } from './components/gestores/gestores';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NegociosComponent, SucursalesComponent, GestoresComponent],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('gestor-turnos');
}
