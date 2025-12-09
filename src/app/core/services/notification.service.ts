import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messaging: any;
  private currentToken: string | null = null;

  constructor(private http: HttpClient) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const app = initializeApp(environment.firebase);
      this.messaging = getMessaging(app);
      this.listenToMessages();
    } catch (error) {
      console.error('Error inicializando Firebase:', error);
    }
  }

  async requestPermission(): Promise<string | null> {
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Registrar el Service Worker de Firebase
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log(' Service Worker de Firebase registrado:', registration.scope);

        const token = await getToken(this.messaging, {
          vapidKey: environment.firebase.vapidKey,
          serviceWorkerRegistration: registration
        });

        this.currentToken = token;
        console.log(' Token FCM obtenido:', token);
        return token;
      } else {
        console.warn('Permiso de notificaciones denegado');
        return null;
      }
    } catch (error) {
      console.error('Error obteniendo token FCM:', error);
      return null;
    }
  }

  async sendTokenToServer(userId: number): Promise<void> {
    if (!this.currentToken) {
      await this.requestPermission();
    }

    if (this.currentToken) {
      try {
        await this.http.post(`${environment.apiUrl}/fcm-tokens`, {
          user_id: userId,
          token: this.currentToken,
          device_info: this.getDeviceInfo(),
          platform: 'web'
        }).toPromise();
      } catch (error) {
        console.error('Error enviando token al servidor:', error);
      }
    }
  }

  private listenToMessages() {
    if (this.messaging) {
      onMessage(this.messaging, (payload) => {
        console.log('Mensaje recibido en foreground:', payload);

        // Mostrar notificación local
        if (payload.notification) {
          this.showNotification(
            payload.notification.title || 'Nueva notificación',
            payload.notification.body || '',
            payload.data
          );
        }
      });
    }
  }

  private async showNotification(title: string, body: string, data?: any) {
    try {
      if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification(title, {
          body,
          icon: '/assets/icon/icon-192x192.png',
          badge: '/assets/icon/icon-192x192.png',
          data,
          requireInteraction: true,
          tag: data?.turnoId || 'notification'
        });
      }
    } catch (error) {
      console.error('Error mostrando notificación:', error);
    }
  }

  private getDeviceInfo(): string {
    return `${navigator.userAgent} - ${navigator.platform}`;
  }

  async deleteToken(): Promise<void> {
    if (this.currentToken) {
      try {
        await this.http.delete(`${environment.apiUrl}/fcm-tokens/${this.currentToken}`).toPromise();
        this.currentToken = null;
      } catch (error) {
        console.error('Error eliminando token:', error);
      }
    }
  }

  getToken(): string | null {
    return this.currentToken;
  }
}
