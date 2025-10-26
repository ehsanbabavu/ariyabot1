/**
 * توابع فرمت کردن و نمایش
 * شامل: فرمت کردن قیمت به ریال و فرمت کردن مبلغ با کاما
 */

/**
 * فرمت کردن قیمت به ریال با جداکننده هزارگان فارسی
 * @param price - قیمت به صورت عدد یا رشته
 * @returns قیمت فرمت شده با جداکننده فارسی
 * @example formatPriceRial(1234567) // "۱,۲۳۴,۵۶۷"
 */
export function formatPriceRial(price: string | number): string {
  const num = typeof price === 'string' ? parseInt(price) : price;
  return new Intl.NumberFormat('fa-IR').format(num);
}

/**
 * فرمت کردن مبلغ با کاما (جداکننده انگلیسی)
 * اعشار حذف می‌شود و فقط عدد صحیح نمایش داده می‌شود
 * @param amount - مبلغ به صورت رشته یا عدد
 * @returns مبلغ فرمت شده با کاما
 * @example formatAmount("1234567.89") // "1,234,567"
 */
export function formatAmount(amount: string | number): string {
  let numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // تبدیل به عدد صحیح (حذف اعشار)
  numericAmount = Math.floor(numericAmount);
  
  // جداسازی سه رقم سه رقم با کاما
  return numericAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * فرمت کردن تاریخ به فارسی
 * @param date - تاریخ به فرمت Date یا string
 * @returns تاریخ فرمت شده به فارسی
 */
export function formatPersianDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
}

/**
 * فرمت کردن تاریخ و زمان به فارسی
 * @param date - تاریخ به فرمت Date یا string
 * @returns تاریخ و زمان فرمت شده به فارسی
 */
export function formatPersianDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}
