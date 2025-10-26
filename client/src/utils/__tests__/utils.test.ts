/**
 * تست‌های واحد برای توابع utils
 * این فایل فقط برای نمایش است - برای اجرای واقعی نیاز به راه‌اندازی Jest دارید
 */

import {
  formatPriceRial,
  formatAmount,
  numberToPersianWords,
  normalizeText,
  persianToEnglish,
  validatePhoneNumber,
  validatePostalCode,
  validatePrice,
  calculateVat,
  calculateDiscountPercentage
} from '../index';

// Test formatPriceRial
console.log('Testing formatPriceRial...');
console.assert(formatPriceRial(1234567) === '۱,۲۳۴,۵۶۷', 'formatPriceRial failed');
console.log('✅ formatPriceRial passed');

// Test formatAmount
console.log('Testing formatAmount...');
console.assert(formatAmount("1234567.89") === '1,234,567', 'formatAmount failed');
console.log('✅ formatAmount passed');

// Test numberToPersianWords
console.log('Testing numberToPersianWords...');
console.assert(numberToPersianWords(0) === 'صفر', 'numberToPersianWords(0) failed');
console.assert(numberToPersianWords(1) === 'یک', 'numberToPersianWords(1) failed');
console.assert(numberToPersianWords(10) === 'ده', 'numberToPersianWords(10) failed');
console.assert(numberToPersianWords(11) === 'یازده', 'numberToPersianWords(11) failed');
console.assert(numberToPersianWords(20) === 'بیست', 'numberToPersianWords(20) failed');
console.assert(numberToPersianWords(100) === 'یکصد', 'numberToPersianWords(100) failed');
console.assert(numberToPersianWords(1000) === 'یک هزار', 'numberToPersianWords(1000) failed');
console.log('✅ numberToPersianWords passed');

// Test normalizeText
console.log('Testing normalizeText...');
console.assert(normalizeText("كتاب") === 'کتاب', 'normalizeText(ك) failed');
console.assert(normalizeText("يک") === 'یک', 'normalizeText(ي) failed');
console.log('✅ normalizeText passed');

// Test persianToEnglish
console.log('Testing persianToEnglish...');
console.assert(persianToEnglish("۱۲۳۴") === '1234', 'persianToEnglish failed');
console.assert(persianToEnglish("۰۹۱۲") === '0912', 'persianToEnglish failed');
console.log('✅ persianToEnglish passed');

// Test validatePhoneNumber
console.log('Testing validatePhoneNumber...');
console.assert(validatePhoneNumber("09123456789") === true, 'validatePhoneNumber(valid) failed');
console.assert(validatePhoneNumber("۰۹۱۲۳۴۵۶۷۸۹") === true, 'validatePhoneNumber(persian) failed');
console.assert(validatePhoneNumber("0812345678") === false, 'validatePhoneNumber(invalid) failed');
console.log('✅ validatePhoneNumber passed');

// Test validatePostalCode
console.log('Testing validatePostalCode...');
console.assert(validatePostalCode("1234567890") === true, 'validatePostalCode(valid) failed');
console.assert(validatePostalCode("۱۲۳۴۵۶۷۸۹۰") === true, 'validatePostalCode(persian) failed');
console.assert(validatePostalCode("123456789") === false, 'validatePostalCode(short) failed');
console.log('✅ validatePostalCode passed');

// Test validatePrice
console.log('Testing validatePrice...');
console.assert(validatePrice(100000, 80000) === true, 'validatePrice(valid) failed');
console.assert(validatePrice(100000, 100000) === false, 'validatePrice(equal) failed');
console.assert(validatePrice(100000, 120000) === false, 'validatePrice(higher discount) failed');
console.assert(validatePrice(0, 10000) === false, 'validatePrice(zero price) failed');
console.log('✅ validatePrice passed');

// Test calculateVat
console.log('Testing calculateVat...');
const vatResult = calculateVat(100000, { isEnabled: true, vatPercentage: "9" });
console.assert(vatResult.subtotal === 100000, 'calculateVat subtotal failed');
console.assert(vatResult.vatAmount === 9000, 'calculateVat vatAmount failed');
console.assert(vatResult.totalWithVat === 109000, 'calculateVat totalWithVat failed');
console.assert(vatResult.vatPercentage === 9, 'calculateVat vatPercentage failed');
console.log('✅ calculateVat passed');

// Test calculateDiscountPercentage
console.log('Testing calculateDiscountPercentage...');
console.assert(calculateDiscountPercentage(100000, 80000) === 20, 'calculateDiscountPercentage failed');
console.assert(calculateDiscountPercentage(100000, 50000) === 50, 'calculateDiscountPercentage(50%) failed');
console.assert(calculateDiscountPercentage(100000, 100000) === 0, 'calculateDiscountPercentage(no discount) failed');
console.log('✅ calculateDiscountPercentage passed');

console.log('\n🎉 همه تست‌ها با موفقیت انجام شد!');
