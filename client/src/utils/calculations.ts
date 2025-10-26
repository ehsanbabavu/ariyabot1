/**
 * توابع محاسبات مالی
 * شامل: محاسبه VAT، مجموع سبد خرید، تخفیف
 */

/**
 * تنظیمات VAT برای فروشنده
 */
export interface VatSettings {
  isEnabled: boolean;
  vatPercentage: string | number;
}

/**
 * آیتم سبد خرید
 */
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  sellerId?: string;
}

/**
 * نتیجه محاسبه VAT
 */
export interface VatCalculation {
  subtotal: number;
  vatAmount: number;
  vatPercentage: number;
  totalWithVat: number;
}

/**
 * محاسبه VAT (مالیات بر ارزش افزوده)
 * @param subtotal - مبلغ قبل از VAT
 * @param vatSettings - تنظیمات VAT
 * @returns اطلاعات محاسبه شده VAT
 * @example calculateVat(100000, { isEnabled: true, vatPercentage: "9" })
 */
export function calculateVat(
  subtotal: number,
  vatSettings?: VatSettings
): VatCalculation {
  const vatPercentage = vatSettings?.isEnabled 
    ? parseFloat(String(vatSettings.vatPercentage)) 
    : 0;
  
  const vatAmount = Math.round(subtotal * (vatPercentage / 100));
  const totalWithVat = subtotal + vatAmount;
  
  return {
    subtotal,
    vatAmount,
    vatPercentage,
    totalWithVat
  };
}

/**
 * محاسبه مجموع سبد خرید
 * @param items - آیتم‌های سبد خرید
 * @returns مجموع قیمت
 */
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + parseFloat(item.totalPrice);
  }, 0);
}

/**
 * گروه‌بندی آیتم‌های سبد خرید بر اساس فروشنده
 * @param items - آیتم‌های سبد خرید
 * @returns آیتم‌ها گروه‌بندی شده بر اساس فروشنده
 */
export function groupCartItemsBySeller(
  items: CartItem[]
): Map<string, { items: CartItem[]; totalAmount: number }> {
  const ordersBySeller = new Map<string, { items: CartItem[]; totalAmount: number }>();
  
  for (const item of items) {
    const sellerId = item.sellerId || 'unknown';
    
    if (!ordersBySeller.has(sellerId)) {
      ordersBySeller.set(sellerId, {
        items: [],
        totalAmount: 0
      });
    }
    
    const sellerOrder = ordersBySeller.get(sellerId)!;
    sellerOrder.items.push(item);
    sellerOrder.totalAmount += parseFloat(item.totalPrice);
  }
  
  return ordersBySeller;
}

/**
 * محاسبه درصد تخفیف
 * @param originalPrice - قیمت اصلی
 * @param discountPrice - قیمت با تخفیف
 * @returns درصد تخفیف
 * @example calculateDiscountPercentage(100000, 80000) // 20
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  discountPrice: number
): number {
  if (originalPrice <= 0 || discountPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}

/**
 * محاسبه قیمت نهایی با تخفیف
 * @param price - قیمت اصلی
 * @param discountPercentage - درصد تخفیف
 * @returns قیمت نهایی
 * @example calculatePriceAfterDiscount(100000, 20) // 80000
 */
export function calculatePriceAfterDiscount(
  price: number,
  discountPercentage: number
): number {
  if (discountPercentage <= 0 || discountPercentage >= 100) return price;
  return Math.round(price * (1 - discountPercentage / 100));
}

/**
 * محاسبه مبلغ تخفیف
 * @param originalPrice - قیمت اصلی
 * @param discountPrice - قیمت با تخفیف
 * @returns مبلغ تخفیف
 */
export function calculateDiscountAmount(
  originalPrice: number,
  discountPrice: number
): number {
  if (discountPrice >= originalPrice) return 0;
  return originalPrice - discountPrice;
}

/**
 * محاسبه مجموع سبد خرید با VAT برای چند فروشنده
 * @param items - آیتم‌های سبد خرید
 * @param vatSettingsBySeller - تنظیمات VAT به تفکیک فروشنده
 * @returns مجموع کل با VAT
 */
export function calculateCartTotalWithVat(
  items: CartItem[],
  vatSettingsBySeller: Map<string, VatSettings>
): number {
  const ordersBySeller = groupCartItemsBySeller(items);
  let totalAmount = 0;
  
  for (const [sellerId, orderData] of ordersBySeller.entries()) {
    const vatSettings = vatSettingsBySeller.get(sellerId);
    const { totalWithVat } = calculateVat(orderData.totalAmount, vatSettings);
    totalAmount += totalWithVat;
  }
  
  return totalAmount;
}
