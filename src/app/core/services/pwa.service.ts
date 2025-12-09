import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any;
  public canInstall$ = new BehaviorSubject<boolean>(false);
  public isInstalled$ = new BehaviorSubject<boolean>(false);

  constructor(private platform: Platform) {
    this.initPwaPrompt();
    this.checkIfInstalled();
  }

  private initPwaPrompt() {
    if (this.platform.is('desktop') || this.platform.is('mobileweb')) {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.promptEvent = event;
        this.canInstall$.next(true);
        console.log(' PWA - Evento de instalación capturado');
      });

      window.addEventListener('appinstalled', () => {
        this.canInstall$.next(false);
        this.isInstalled$.next(true);
        console.log(' PWA - Aplicación instalada exitosamente');
      });
    }
  }

  private checkIfInstalled() {
    // Verificar si está en modo standalone (instalada)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      this.isInstalled$.next(true);
      console.log(' PWA - Aplicación ya instalada');
    }
  }

  public async installPwa(): Promise<boolean> {
    if (!this.promptEvent) {
      console.log(' PWA - No se puede instalar en este momento');
      return false;
    }

    this.promptEvent.prompt();
    const result = await this.promptEvent.userChoice;
    
    if (result.outcome === 'accepted') {
      console.log(' PWA - Usuario aceptó la instalación');
      this.canInstall$.next(false);
      return true;
    } else {
      console.log(' PWA - Usuario rechazó la instalación');
      return false;
    }
  }
}
