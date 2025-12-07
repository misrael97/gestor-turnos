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
        const token = await getToken(this.messaging, {
          vapidKey: environment.firebase.vapidKey
        });
        
        this.currentToken = token;
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

  private showNotification(title: string, body: string, data?: any) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/assets/icon/favicon.png',
        badge: '/assets/icon/favicon.png',
        data
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navegar según el tipo de notificación
        if (data?.turnoId) {
          // Aquí puedes navegar a la página del turno
          console.log('Navegar a turno:', data.turnoId);
        }
      };
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
