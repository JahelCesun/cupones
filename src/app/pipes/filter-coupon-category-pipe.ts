import { Pipe, PipeTransform } from '@angular/core';
import { Coupon } from '../models/coupon.model';

@Pipe({
  name: 'filterCouponCategory',
  standalone: true
})
export class FilterCouponCategoryPipe implements PipeTransform {

  transform(coupons: Coupon[], category: string): Coupon[] {
    // Retorna un arreglo filtrado por categoría
    if (!coupons || !category) {
      return coupons;
    }
    return coupons.filter(coupon => coupon.category === category);
  }

}