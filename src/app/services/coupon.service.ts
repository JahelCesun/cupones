import { Injectable } from '@angular/core';
import { Coupon, ICouponData } from '../models/coupon.model';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  // Clave para guardar en el dispositivo
  private readonly COUPON_KEY = 'my_coupons';

  constructor() { }

  async getCoupons() {
    // 1. Preguntamos si hay datos guardados en el celular
    const { value } = await Preferences.get({ key: this.COUPON_KEY });

    if (value) {
      // Convertimos el texto guardado de vuelta a objetos (Interface)
      const rawData: ICouponData[] = JSON.parse(value);
      
      // Convertimos esos datos en instancias de la Clase Coupon
      const coupons = rawData.map(data => new Coupon(data));
      
      console.log('Datos cargados desde MEMORIA (Preferences)');
      return coupons;

    } else {
      // CASO B: NO HAY DATOS (Es la primera vez que se abre la app)
      try {
        const res = await fetch('./assets/data/coupons.json');
        const data: ICouponData[] = await res.json();
        
        // Procesamos los datos usando tu función auxiliar
        const coupons = this.processCoupon(data);
        
        // Inicializamos todos desactivados
        coupons.forEach(c => c.active = false); 
        
        console.log('Datos cargados desde JSON (Inicial)');
        return coupons;
      } catch (error) {
        console.error('Error al leer los cupones', error);
        return [];
      }
    }
  }

  processCoupon(couponsData: ICouponData[]): Coupon[] {
    const coupons: Coupon[] = [];
    for (const couponData of couponsData) {
      const coupon = new Coupon(couponData);
      coupons.push(coupon);
    }
    return coupons;
  }

  async saveCoupons(coupons: Coupon[]) {
    // Convertimos la clase a JSON plano antes de guardar
    const couponsData = coupons.map(coupon => coupon.toCouponData());
    
    await Preferences.set({
      key: this.COUPON_KEY,
      value: JSON.stringify(couponsData)
    });
  }
}