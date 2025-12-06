import { Component, inject } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonSegment, IonSegmentButton, IonLabel, 
  IonSegmentView, IonSegmentContent, 
  IonGrid, IonRow, IonCol, 
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
  IonItem, IonIcon 
} from '@ionic/angular/standalone';
import { JsonPipe, NgFor, NgTemplateOutlet } from '@angular/common'; 
import { FilterCouponCategoryPipe } from '../../pipes/filter-coupon-category-pipe';
import { Coupon, ICouponData } from '../../models/coupon.model';
import { CouponService } from '../../services/coupon.service';
import { ToastService } from '../../services/toast.service'; 
import { addIcons } from 'ionicons';
import { cameraOutline } from 'ionicons/icons';

import { 
  CapacitorBarcodeScanner, 
  CapacitorBarcodeScannerTypeHint, 
  CapacitorBarcodeScannerScanResult 
} from '@capacitor/barcode-scanner';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonSegment, IonSegmentButton, IonLabel,
    IonSegmentView, IonSegmentContent,
    IonGrid, IonRow, IonCol, 
    IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
    IonItem, IonIcon,
    FilterCouponCategoryPipe,
    JsonPipe,
    NgFor,
    NgTemplateOutlet
  ],
})
export class Tab1Page {
  private couponService: CouponService = inject(CouponService);
  private toastService: ToastService = inject(ToastService); 
  
  coupons: Coupon[] = [];

  constructor() {
    addIcons({ cameraOutline });
  }

  async ionViewWillEnter() {
    this.coupons = await this.couponService.getCoupons();
    console.log('Cupones cargados:', this.coupons);
  }

  async changeActive(coupon: Coupon) {
    coupon.active = !coupon.active;
    await this.couponService.saveCoupons(this.coupons);
  }

  // FUNCIÓN DE CÁMARA CON TOASTS 
  startCamera() {
    CapacitorBarcodeScanner.scanBarcode({
      hint: CapacitorBarcodeScannerTypeHint.QR_CODE
    })
    .then(async (resultBarcode: CapacitorBarcodeScannerScanResult) => {
      console.log('Resultado escaneo:', resultBarcode);
      
      if (resultBarcode.ScanResult) {
        try {
          // 1. Convertir texto a objeto
          const couponData: ICouponData = JSON.parse(resultBarcode.ScanResult);
          const newCoupon = new Coupon(couponData);

          // 2. Validar integridad del cupón
          if (newCoupon.isValid()) {
            
            // 3. Validar duplicidad
            const couponExist = this.coupons.some(c => c.isEqual(newCoupon));

            if (!couponExist) {
              // AGREGAR: Lo agregamos a la lista
              this.coupons = [...this.coupons, newCoupon];
              
              // GUARDAR: Persistimos en memoria
              await this.couponService.saveCoupons(this.coupons);
              
              // TOAST: Mensaje de éxito
              this.toastService.showToast('Cupón agregado');
            } else {
              // TOAST: Mensaje de duplicado
              this.toastService.showToast('El cupón ya existe');
            }

          } else {
            // TOAST: Mensaje de invalidez
            this.toastService.showToast('El cupón es inválido');
          }

        } catch (error) {
          console.error('Error al procesar el QR:', error);
          this.toastService.showToast('QR error');
        }
      }
    })
    .catch((err: any) => {
      console.error('Error al abrir cámara:', err);
      this.toastService.showToast('Error al abrir la cámara');
    });
  }
}