import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonText, Platform } from '@ionic/angular/standalone';
import { QRCodeComponent } from 'angularx-qrcode';
import { CouponService } from '../../services/coupon.service';
import { Coupon } from '../../models/coupon.model';
import { ScreenBrightness, GetBrightnessReturnValue } from '@capacitor-community/screen-brightness';
import { App } from '@capacitor/app'; 

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonGrid, IonRow, IonCol, IonText,
    QRCodeComponent
  ]
})
export class Tab2Page {
  
  private couponService: CouponService = inject(CouponService);
  private platform: Platform = inject(Platform);
  
  QRCode!: string;
  private currentBrightness!: GetBrightnessReturnValue;

  constructor() {}

  async ionViewWillEnter() {
    // 1. QR
    const coupons: Coupon[] = await this.couponService.getCoupons();
    const couponsActive: Coupon[] = coupons.filter((coupon: Coupon) => coupon.active);
    this.QRCode = couponsActive.length > 0 ? JSON.stringify(couponsActive) : '';

    // 2. BRILLO AL MÁXIMO
    this.setMaxBrightness();

    // 3. DETECTAR SI MINIMIZAN LA APP
    if (!this.platform.is('desktop')) {
      App.addListener('appStateChange', (state) => {
        if (state.isActive) {
          // Volvió al frente -> Brillo máximo
          this.setMaxBrightness();
        } else {
          // Se minimizó -> Restaurar brillo
          this.restoreBrightness();
        }
      });
    }
  }

  ionViewDidLeave() {
    this.restoreBrightness();
    // Limpiar listeners al salir
    if (!this.platform.is('desktop')) {
      App.removeAllListeners();
    }
  }

  //  Funciones auxiliares 

  async setMaxBrightness() {
    if (!this.platform.is('desktop')) {
      try {
        if (!this.currentBrightness) {
            this.currentBrightness = await ScreenBrightness.getBrightness();
        }
        await ScreenBrightness.setBrightness({ brightness: 1 });
      } catch (error) {
        console.error('Error al subir brillo:', error);
      }
    }
  }

  async restoreBrightness() {
    if (!this.platform.is('desktop') && this.currentBrightness) {
      try {
        await ScreenBrightness.setBrightness({ brightness: this.currentBrightness.brightness });
      } catch (error) {
        console.error('Error al restaurar brillo:', error);
      }
    }
  }
}