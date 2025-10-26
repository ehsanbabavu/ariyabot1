/**
 * توابع اعتبارسنجی سمت کلاینت
 */

import { persianToEnglish } from './persian';

/**
 * اعتبارسنجی شماره تلفن همراه ایران
 * @param phone - شماره تلفن
 * @returns true اگر شماره معتبر باشد
 * @example validatePhoneNumber("09123456789") // true
 */
export function validatePhoneNumber(phone: string): boolean {
  const normalized = persianToEnglish(phone.trim());
  return /^09\d{9}$/.test(normalized);
}

/**
 * اعتبارسنجی کد پستی ایران (10 رقمی)
 * @param code - کد پستی
 * @returns true اگر کد پستی معتبر باشد
 * @example validatePostalCode("1234567890") // true
 */
export function validatePostalCode(code: string): boolean {
  const normalized = persianToEnglish(code.trim());
  return /^\d{10}$/.test(normalized);
}

/**
 * اعتبارسنجی قیمت
 * @param price - قیمت اصلی
 * @param discountPrice - قیمت تخفیف خورده (اختیاری)
 * @returns true اگر قیمت معتبر باشد
 */
export function validatePrice(price: number, discountPrice?: number): boolean {
  if (price <= 0) return false;
  if (discountPrice !== undefined && discountPrice !== null) {
    if (discountPrice < 0) return false;
    if (discountPrice >= price) return false;
  }
  return true;
}

/**
 * اعتبارسنجی ایمیل
 * @param email - آدرس ایمیل
 * @returns true اگر ایمیل معتبر باشد
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * اعتبارسنجی طول رمز عبور
 * @param password - رمز عبور
 * @param minLength - حداقل طول (پیش‌فرض: 6)
 * @returns true اگر رمز عبور معتبر باشد
 */
export function validatePassword(password: string, minLength: number = 6): boolean {
  return password.length >= minLength;
}

/**
 * اعتبارسنجی محدوده عددی
 * @param value - مقدار
 * @param min - حداقل مقدار
 * @param max - حداکثر مقدار
 * @returns true اگر مقدار در محدوده باشد
 */
export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * تولید یوزرنیم از شماره تلفن
 * @param phone - شماره تلفن
 * @returns یوزرنیم پیشنهادی
 * @example generateUsernameFromPhone("989123456789") // "09123456789"
 */
export function generateUsernameFromPhone(phone: string): string {
  const normalized = persianToEnglish(phone.trim());
  if (normalized.startsWith('98')) {
    return '0' + normalized.substring(2);
  }
  return normalized;
}

/**
 * تولید یوزرنیم از ایمیل
 * @param email - آدرس ایمیل
 * @returns یوزرنیم پیشنهادی
 * @example generateUsernameFromEmail("test@example.com") // "test_xxxx"
 */
export function generateUsernameFromEmail(email: string): string {
  const username = email.split('@')[0];
  const randomSuffix = Math.random().toString(36).substr(2, 4);
  return username + '_' + randomSuffix;
}
