import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastController = inject(ToastController);

  constructor() { }

  async showToast(message: string, position: 'top' | 'bottom' | 'middle' = 'bottom', duration: number = 3000) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: position,
      color: 'dark'
    });
    await toast.present();
  }
}