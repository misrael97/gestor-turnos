import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard  {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];
    const user = this.auth.user;

    // Si no hay usuario, redirigir a login
    if (!user) {
      console.log('🛡️ RoleGuard - Sin usuario, redirigiendo a login');
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Obtener el nombre del rol (backend usa "nombre" en lugar de "name")
    const userRole = user?.role?.nombre || user?.role?.name;
    const roleId = user?.role?.id || user?.role_id;
    
    console.log('🛡️ RoleGuard - Ruta:', route.routeConfig?.path);
    console.log('🛡️ RoleGuard - Rol esperado:', expectedRole);
    console.log('🛡️ RoleGuard - Rol del usuario:', userRole);
    console.log('🛡️ RoleGuard - Rol ID:', roleId);

    // Verificar si el rol coincide (por nombre o ID)
    // role_id 1 = Administrador, 2 = Agente, 3 = Cliente
    let roleMatches = false;
    
    if (expectedRole === 'Administrador') {
      roleMatches = userRole === 'Administrador' || roleId === 1;
    } else if (expectedRole === 'Agente') {
      roleMatches = userRole === 'Agente' || roleId === 2;
    } else if (expectedRole === 'Cliente') {
      roleMatches = userRole === 'Cliente' || roleId === 3;
    } else {
      roleMatches = userRole === expectedRole;
    }
    
    console.log('🛡️ RoleGuard - ¿Rol coincide?:', roleMatches);

    // Si el rol coincide, permitir acceso
    if (roleMatches) {
      console.log('🛡️ RoleGuard - ✅ Acceso permitido');
      return true;
    }

    // Si el rol NO coincide, redirigir a su dashboard correcto
    console.log('🛡️ RoleGuard - ❌ Acceso denegado, redirigiendo a dashboard correcto');
    
    // role_id 1 = Administrador (Jefe máximo - Gestión), 2 = Agente (Admin de Sucursal - Operaciones), 3 = Cliente
    if (userRole === 'Administrador' || roleId === 1) {
      console.log('🛡️ Redirigiendo a Administrador (Gestión de Sucursales)');
      this.router.navigate(['/admin/negocios']);
    } else if (userRole === 'Agente' || roleId === 2) {
      console.log('🛡️ Redirigiendo a Agente (Mi Sucursal)');
      this.router.navigate(['/super/dashboard']);
    } else if (userRole === 'Cliente' || roleId === 3) {
      console.log('🛡️ Redirigiendo a Cliente home');
      this.router.navigate(['/cliente/home']);
    } else {
      console.log('🛡️ Rol desconocido, redirigiendo a login');
      this.router.navigate(['/auth/login']);
    }
    
    return false;
  }
}
