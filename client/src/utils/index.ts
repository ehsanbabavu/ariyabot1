/**
 * فایل اصلی utils برای export همه توابع
 */

// Formatters
export {
  formatPriceRial,
  formatAmount,
  formatPersianDate,
  formatPersianDateTime
} from './formatters';

// Persian utilities
export {
  numberToPersianWords,
  normalizeText,
  persianToEnglish,
  englishToPersian,
  extractNumbers
} from './persian';

// Validators
export {
  validatePhoneNumber,
  validatePostalCode,
  validatePrice,
  validateEmail,
  validatePassword,
  validateRange,
  generateUsernameFromPhone,
  generateUsernameFromEmail
} from './validators';

// Calculations
export {
  calculateVat,
  calculateCartTotal,
  groupCartItemsBySeller,
  calculateDiscountPercentage,
  calculatePriceAfterDiscount,
  calculateDiscountAmount,
  calculateCartTotalWithVat,
  type VatSettings,
  type CartItem,
  type VatCalculation
} from './calculations';

// Counters (برای شمارنده‌های منو)
export {
  calculateWhatsappUnreadCount,
  calculatePendingOrdersCount,
  calculatePendingPaymentOrdersCount,
  calculatePendingTransactionsCount,
  calculateInternalChatsUnreadCount,
  calculateCartItemsCount,
  calculateLevel1Counters,
  calculateLevel2Counters,
  type ReceivedMessage
} from './counters';
