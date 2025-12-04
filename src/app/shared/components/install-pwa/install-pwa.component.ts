import { Component, OnInit } from '@angular/core';
import { PwaService } from '../../../core/services/pwa.service';

@Component({
  selector: 'app-install-pwa',
  template: `
    <ion-button 
      *ngIf="canInstall$ | async" 
      (click)="installPwa()"
      expand="block"
      color="primary"
      class="install-button">
      <ion-icon name="download-outline" slot="start"></ion-icon>
      Instalar Aplicación
    </ion-button>
  `,
  styles: [`
    .install-button {
      margin: 16px;
      --box-shadow: 0 4px 16px rgba(var(--ion-color-primary-rgb), 0.3);
    }
  `]
})
export class InstallPwaComponent implements OnInit {
  canInstall$ = this.pwaService.canInstall$;

  constructor(private pwaService: PwaService) {}

  ngOnInit() {}

  installPwa() {
    this.pwaService.installPwa();
  }
}
