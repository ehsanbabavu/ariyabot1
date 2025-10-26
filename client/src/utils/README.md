# 📚 راهنمای استفاده از Utils

این فولدر شامل توابع کاربردی است که از بک‌اند به فرانت منتقل شده‌اند تا عملکرد بهتر و سریع‌تری داشته باشیم.

## 📁 ساختار فایل‌ها

### 1️⃣ `formatters.ts` - فرمت کردن و نمایش

توابع مربوط به فرمت کردن اعداد، قیمت‌ها و تاریخ‌ها

```typescript
import { formatPriceRial, formatAmount, formatPersianDate } from '@/utils/formatters';

// فرمت کردن قیمت با جداکننده فارسی
const price = formatPriceRial(1234567);
// نتیجه: "۱,۲۳۴,۵۶۷"

// فرمت کردن مبلغ با کاما
const amount = formatAmount("1234567.89");
// نتیجه: "1,234,567"

// فرمت کردن تاریخ
const date = formatPersianDate(new Date());
// نتیجه: "۲۴ مهر ۱۴۰۴"
```

---

### 2️⃣ `persian.ts` - توابع فارسی

توابع مربوط به تبدیل عدد به حروف، نرمالیزاسیون و تبدیل اعداد

```typescript
import { 
  numberToPersianWords, 
  normalizeText, 
  persianToEnglish,
  extractNumbers 
} from '@/utils/persian';

// تبدیل عدد به حروف فارسی
const words = numberToPersianWords(1234);
// نتیجه: "یک هزار و دویست و سی و چهار"

// نرمالیزاسیون متن فارسی
const normalized = normalizeText("كتاب");
// نتیجه: "کتاب" (ک عربی به فارسی تبدیل شد)

// تبدیل اعداد فارسی به انگلیسی
const english = persianToEnglish("۰۹۱۲۳۴۵۶۷۸۹");
// نتیجه: "09123456789"

// استخراج فقط اعداد
const nums = extractNumbers("قیمت ۱۲۳۴ تومان");
// نتیجه: "1234"
```

---

### 3️⃣ `validators.ts` - اعتبارسنجی

توابع اعتبارسنجی ورودی‌ها

```typescript
import { 
  validatePhoneNumber, 
  validatePostalCode,
  validatePrice,
  generateUsernameFromPhone 
} from '@/utils/validators';

// اعتبارسنجی شماره تلفن
const isValid = validatePhoneNumber("۰۹۱۲۳۴۵۶۷۸۹");
// نتیجه: true

// اعتبارسنجی کد پستی
const isPostalValid = validatePostalCode("1234567890");
// نتیجه: true

// اعتبارسنجی قیمت
const isPriceValid = validatePrice(100000, 80000);
// نتیجه: true (قیمت با تخفیف کمتر از قیمت اصلی است)

// تولید یوزرنیم از شماره تلفن
const username = generateUsernameFromPhone("989123456789");
// نتیجه: "09123456789"
```

---

### 4️⃣ `calculations.ts` - محاسبات مالی

توابع محاسبه VAT، تخفیف و مجموع سبد خرید

```typescript
import { 
  calculateVat, 
  calculateCartTotal,
  calculateDiscountPercentage 
} from '@/utils/calculations';

// محاسبه VAT
const vatResult = calculateVat(100000, { 
  isEnabled: true, 
  vatPercentage: "9" 
});
// نتیجه: { subtotal: 100000, vatAmount: 9000, totalWithVat: 109000, vatPercentage: 9 }

// محاسبه مجموع سبد خرید
const total = calculateCartTotal(cartItems);

// محاسبه درصد تخفیف
const discount = calculateDiscountPercentage(100000, 80000);
// نتیجه: 20 (درصد)
```

---

## 🎯 نحوه استفاده در کامپوننت‌ها

### مثال ۱: نمایش قیمت محصول

```typescript
import { formatPriceRial, calculateDiscountPercentage } from '@/utils';

function ProductCard({ product }) {
  const discountPercent = product.priceAfterDiscount 
    ? calculateDiscountPercentage(
        parseFloat(product.priceBeforeDiscount),
        parseFloat(product.priceAfterDiscount)
      )
    : 0;

  return (
    <div>
      <p>قیمت: {formatPriceRial(product.priceBeforeDiscount)} تومان</p>
      {discountPercent > 0 && (
        <p className="text-red-500">{discountPercent}% تخفیف</p>
      )}
    </div>
  );
}
```

---

### مثال ۲: فرم ثبت‌نام با اعتبارسنجی

```typescript
import { validatePhoneNumber, generateUsernameFromPhone, persianToEnglish } from '@/utils';

function RegisterForm() {
  const handleSubmit = (data) => {
    // نرمالیزاسیون شماره تلفن
    const normalizedPhone = persianToEnglish(data.phone);
    
    // اعتبارسنجی
    if (!validatePhoneNumber(normalizedPhone)) {
      alert("شماره تلفن نامعتبر است");
      return;
    }
    
    // تولید یوزرنیم پیشنهادی
    const suggestedUsername = generateUsernameFromPhone(normalizedPhone);
    
    // ارسال به سرور
    submitData({ ...data, username: suggestedUsername });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

### مثال ۳: محاسبه سبد خرید با VAT

```typescript
import { calculateCartTotal, calculateVat, formatPriceRial } from '@/utils';

function CartSummary({ items, vatSettings }) {
  const subtotal = calculateCartTotal(items);
  const { vatAmount, totalWithVat } = calculateVat(subtotal, vatSettings);
  
  return (
    <div>
      <p>جمع کل: {formatPriceRial(subtotal)} تومان</p>
      <p>مالیات: {formatPriceRial(vatAmount)} تومان</p>
      <p>مبلغ نهایی: {formatPriceRial(totalWithVat)} تومان</p>
    </div>
  );
}
```

---

### مثال ۴: نمایش مبلغ به حروف در فاکتور

```typescript
import { numberToPersianWords, formatPriceRial } from '@/utils';

function Invoice({ totalAmount }) {
  const amountInWords = numberToPersianWords(Math.floor(totalAmount));
  
  return (
    <div>
      <p>مبلغ: {formatPriceRial(totalAmount)} ریال</p>
      <p>به حروف: {amountInWords} ریال</p>
    </div>
  );
}
```

---

## ✨ مزایا

✅ **عملکرد بهتر**: محاسبات سمت کلاینت انجام می‌شود، فشار کمتری به سرور  
✅ **تجربه کاربری بهتر**: بازخورد فوری بدون نیاز به ارسال به سرور  
✅ **کد تمیزتر**: توابع قابل استفاده مجدد در سراسر پروژه  
✅ **Type-safe**: تمام توابع با TypeScript نوشته شده‌اند  
✅ **مستندات کامل**: هر تابع شامل JSDoc و مثال است  

---

## 🔄 Import مرکزی

می‌توانید از فایل `index.ts` برای import راحت‌تر استفاده کنید:

```typescript
// به جای این:
import { formatPriceRial } from '@/utils/formatters';
import { numberToPersianWords } from '@/utils/persian';

// می‌توانید این‌طور بنویسید:
import { formatPriceRial, numberToPersianWords } from '@/utils';
```
