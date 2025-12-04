import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-offline-indicator',
  template: `
    <div class="offline-banner" *ngIf="!isOnline">
      <ion-icon name="cloud-offline-outline"></ion-icon>
      <span>Sin conexión - Modo offline</span>
    </div>
  `,
  styles: [`
    .offline-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: var(--ion-color-warning);
      color: var(--ion-color-warning-contrast);
      padding: 8px 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-100%);
      }
      to {
        transform: translateY(0);
      }
    }

    ion-icon {
      font-size: 20px;
    }
  `]
})
export class OfflineIndicatorComponent implements OnInit {
  isOnline: boolean = true;

  ngOnInit() {
    this.updateOnlineStatus();

    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());
  }

  private updateOnlineStatus() {
    this.isOnline = navigator.onLine;
  }
}
