/**
 * توابع مربوط به زبان فارسی
 * شامل: تبدیل عدد به حروف فارسی، نرمالیزاسیون متن، تبدیل اعداد فارسی/عربی
 */

/**
 * تبدیل عدد به حروف فارسی
 * @param num - عدد برای تبدیل
 * @returns معادل فارسی عدد
 * @example numberToPersianWords(1234) // "یک هزار و دویست و سی و چهار"
 */
export function numberToPersianWords(num: number): string {
  if (num === 0) return 'صفر';
  
  const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const hundreds = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const thousands = ['', 'هزار', 'میلیون', 'میلیارد'];
  
  if (num < 10) return ones[num];
  if (num < 20) {
    const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
    return teens[num - 10];
  }
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one ? ' و ' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    return hundreds[hundred] + (rest ? ' و ' + numberToPersianWords(rest) : '');
  }
  
  // برای اعداد بزرگتر
  let result = '';
  let level = 0;
  while (num > 0) {
    const part = num % 1000;
    if (part > 0) {
      const partWords = numberToPersianWords(part);
      result = partWords + (thousands[level] ? ' ' + thousands[level] : '') + (result ? ' و ' + result : '');
    }
    num = Math.floor(num / 1000);
    level++;
  }
  
  return result || 'صفر';
}

/**
 * نرمالیزاسیون متن فارسی
 * حذف کاراکترهای مخفی، تبدیل حروف عربی به فارسی، حذف اعراب
 * @param text - متن برای نرمالیزاسیون
 * @returns متن نرمال شده
 * @example normalizeText("كتاب") // "کتاب"
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFKC') // Unicode normalization
    .replace(/\u200C|\u200F|\u200E/g, '') // حذف ZWNJ و سایر کاراکترهای مخفی
    .replace(/[\u064A]/g, '\u06CC') // تبدیل ي عربی به ی فارسی
    .replace(/[\u0643]/g, '\u06A9') // تبدیل ك عربی به ک فارسی
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '') // حذف اعراب
    .replace(/[؟?!.،,]/g, ' ') // تبدیل علائم نگارشی به فاصله
    .replace(/\s+/g, ' ') // کاهش فاصله‌های چندگانه
    .trim()
    .toLowerCase();
}

/**
 * تبدیل اعداد فارسی و عربی به انگلیسی
 * @param str - رشته شامل اعداد فارسی/عربی
 * @returns رشته با اعداد انگلیسی
 * @example persianToEnglish("۱۲۳۴") // "1234"
 */
export function persianToEnglish(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
}

/**
 * تبدیل اعداد انگلیسی به فارسی
 * @param str - رشته شامل اعداد انگلیسی
 * @returns رشته با اعداد فارسی
 * @example englishToPersian("1234") // "۱۲۳۴"
 */
export function englishToPersian(str: string): string {
  return str.replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
}

/**
 * استخراج فقط اعداد از متن و تبدیل به انگلیسی
 * @param text - متن ورودی
 * @returns فقط اعداد به صورت انگلیسی
 * @example extractNumbers("قیمت ۱۲۳۴ تومان") // "1234"
 */
export function extractNumbers(text: string): string {
  const normalized = persianToEnglish(text);
  return normalized.replace(/[^0-9]/g, '');
}
