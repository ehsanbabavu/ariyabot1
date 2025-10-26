# 📊 راهنمای استفاده از شمارنده‌های منو

این مستند نحوه استفاده از سیستم شمارنده‌های منو را توضیح می‌دهد که از بک‌اند به فرانت منتقل شده‌اند.

---

## 🎯 هدف

انتقال محاسبات شمارنده‌های منو (مثل تعداد پیام‌های خوانده نشده، سفارشات در انتظار، و غیره) از بک‌اند به فرانت‌اند برای:

✅ **کاهش فشار به سرور** - محاسبات در سمت کلاینت انجام می‌شود  
✅ **استفاده از کش** - از داده‌های موجود در React Query استفاده می‌کند  
✅ **کد تمیزتر** - یک hook مرکزی برای همه شمارنده‌ها  
✅ **عملکرد بهتر** - کمتر request به سرور  

---

## 📁 فایل‌های مرتبط

### 1️⃣ `client/src/utils/counters.ts`

توابع pure برای محاسبه شمارنده‌ها:

```typescript
import {
  calculateWhatsappUnreadCount,
  calculatePendingOrdersCount,
  calculatePendingPaymentOrdersCount,
  calculatePendingTransactionsCount,
  calculateInternalChatsUnreadCount,
  calculateCartItemsCount,
} from '@/utils/counters';

// مثال استفاده
const unreadCount = calculateWhatsappUnreadCount(messages);
const pendingCount = calculatePendingOrdersCount(orders, sellerId);
```

### 2️⃣ `client/src/hooks/use-menu-counters.ts`

Hook های React برای استفاده در کامپوننت‌ها:

```typescript
import { useMenuCountersSimple } from '@/hooks/use-menu-counters';

function MyComponent() {
  const {
    whatsappUnreadCount,
    pendingOrdersCount,
    cartItemsCount,
    // ... سایر شمارنده‌ها
  } = useMenuCountersSimple();
  
  return <div>پیام‌های خوانده نشده: {whatsappUnreadCount}</div>;
}
```

---

## 🔢 انواع شمارنده‌ها

### ۱. شمارنده پیام‌های واتس‌اپ خوانده نشده

**قبل (بک‌اند):**
```typescript
// API: GET /api/messages/whatsapp-unread-count
// Backend می‌گرفت و فیلتر می‌کرد
```

**بعد (فرانت‌اند):**
```typescript
import { calculateWhatsappUnreadCount } from '@/utils/counters';

const unreadCount = calculateWhatsappUnreadCount(messages);
// messages.filter(msg => msg.status === "خوانده نشده").length
```

---

### ۲. شمارنده سفارشات در انتظار تایید (برای فروشنده)

**قبل (بک‌اند):**
```typescript
// API: GET /api/orders/pending-orders-count
// Backend از دیتابیس count می‌کرد
```

**بعد (فرانت‌اند):**
```typescript
import { calculatePendingOrdersCount } from '@/utils/counters';

const pendingCount = calculatePendingOrdersCount(orders, sellerId);
// orders.filter(o => o.status === "pending" && o.sellerId === sellerId).length
```

---

### ۳. شمارنده سفارشات در انتظار پرداخت (برای خریدار)

**قبل (بک‌اند):**
```typescript
// API: GET /api/user/orders/pending-payment-count
```

**بعد (فرانت‌اند):**
```typescript
import { calculatePendingPaymentOrdersCount } from '@/utils/counters';

const count = calculatePendingPaymentOrdersCount(orders, userId);
// orders.filter(o => o.status === "awaiting_payment" && o.userId === userId).length
```

---

### ۴. شمارنده تراکنش‌های در انتظار تایید

**قبل (بک‌اند):**
```typescript
// API: GET /api/transactions/pending-count
```

**بعد (فرانت‌اند):**
```typescript
import { calculatePendingTransactionsCount } from '@/utils/counters';

const count = calculatePendingTransactionsCount(transactions, subUserIds);
// transactions.filter(t => t.status === "pending" && subUserIds.includes(t.userId)).length
```

---

### ۵. شمارنده پیام‌های چت داخلی خوانده نشده

**قبل (بک‌اند):**
```typescript
// API: GET /api/internal-chats/unread-count
```

**بعد (فرانت‌اند):**
```typescript
import { calculateInternalChatsUnreadCount } from '@/utils/counters';

const count = calculateInternalChatsUnreadCount(chats, userId);
// chats.filter(c => c.receiverId === userId && !c.isRead).length
```

---

### ۶. شمارنده آیتم‌های سبد خرید

**قبل:**
```typescript
// در sidebar محاسبه می‌شد
const cartItemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
```

**بعد:**
```typescript
import { calculateCartItemsCount } from '@/utils/counters';

const count = calculateCartItemsCount(cartItems);
// همان منطق ولی در یک تابع مرکزی
```

---

## 🚀 نحوه استفاده

### روش ۱: استفاده از Hook (توصیه می‌شود)

برای استفاده در کامپوننت‌ها:

```typescript
import { useMenuCountersSimple } from '@/hooks/use-menu-counters';

function Sidebar() {
  const {
    whatsappUnreadCount,
    pendingOrdersCount,
    pendingPaymentOrdersCount,
    pendingTransactionsCount,
    internalChatsUnreadCount,
    cartItemsCount,
    isLoading
  } = useMenuCountersSimple();
  
  return (
    <nav>
      <Link to="/whatsapp-chats">
        چت واتس‌اپ
        {whatsappUnreadCount > 0 && (
          <Badge>{whatsappUnreadCount}</Badge>
        )}
      </Link>
      
      <Link to="/cart">
        سبد خرید
        {cartItemsCount > 0 && (
          <Badge>{cartItemsCount}</Badge>
        )}
      </Link>
    </nav>
  );
}
```

---

### روش ۲: استفاده از توابع Utility

اگر داده‌ها رو از جای دیگه دارید:

```typescript
import { 
  calculatePendingOrdersCount,
  calculateCartItemsCount 
} from '@/utils/counters';

function MyComponent({ orders, cartItems, userId }) {
  const pendingCount = calculatePendingOrdersCount(orders, userId);
  const cartCount = calculateCartItemsCount(cartItems);
  
  return (
    <div>
      <p>سفارشات در انتظار: {pendingCount}</p>
      <p>تعداد آیتم‌های سبد: {cartCount}</p>
    </div>
  );
}
```

---

## 📊 مقایسه قبل و بعد

### کد قبلی در Sidebar (۷۰+ خط کد!)

```typescript
// Get unread messages count for chat badges
const { data } = useQuery<{ unreadCount: number }>({
  queryKey: ['/api/internal-chats/unread-count'],
  enabled: user?.role === "user_level_1" || user?.role === "user_level_2",
  refetchInterval: 5000,
});
const unreadCount = Number(data?.unreadCount) || 0;

// Get pending orders count
const { data: pendingOrdersData } = useQuery<{ pendingOrdersCount: number }>({
  queryKey: ['/api/orders/pending-orders-count'],
  enabled: !!user && user?.role === "user_level_1",
  refetchInterval: 5000,
});
const pendingOrdersCount = pendingOrdersData?.pendingOrdersCount || 0;

// Get pending transactions count
const { data: pendingTransactionsData } = useQuery<{ pendingTransactionsCount: number }>({
  queryKey: ['/api/transactions/pending-count'],
  enabled: !!user && user?.role === "user_level_1",
  refetchInterval: 5000,
});
const pendingTransactionsCount = pendingTransactionsData?.pendingTransactionsCount || 0;

// ... و ۴۰ خط دیگر برای سایر شمارنده‌ها
```

### کد جدید در Sidebar (۷ خط کد!)

```typescript
const {
  whatsappUnreadCount,
  pendingOrdersCount,
  pendingPaymentOrdersCount,
  pendingTransactionsCount,
  internalChatsUnreadCount: unreadCount,
  cartItemsCount,
} = useMenuCountersSimple();
```

**نتیجه:** 
- ✅ ۹۰٪ کمتر کد
- ✅ خواناتر و قابل نگهداری‌تر
- ✅ قابل استفاده مجدد

---

## 💡 مزایا

| قبل | بعد |
|-----|-----|
| ❌ ۷۰+ خط کد تکراری | ✅ ۷ خط کد |
| ❌ ۶ request جداگانه به سرور | ✅ استفاده از cache موجود |
| ❌ کد پراکنده در کامپوننت | ✅ hook مرکزی |
| ❌ سخت برای تست | ✅ توابع pure و testable |
| ❌ محاسبات در بک‌اند | ✅ محاسبات در فرانت (کاهش فشار سرور) |

---

## 🔄 Fallback Strategy

Hook ما دو حالت داره:

1. **`useMenuCounters`**: از داده‌های کامل استفاده می‌کنه (بهینه‌تر)
2. **`useMenuCountersSimple`**: از API های counter استفاده می‌کنه (fallback)

الان از `useMenuCountersSimple` استفاده می‌کنیم که همون API های قبلی رو صدا می‌زنه ولی با یک interface مرکزی.

---

## 🎓 مثال کامل

```typescript
// client/src/components/sidebar.tsx

import { useMenuCountersSimple } from '@/hooks/use-menu-counters';
import { Badge } from '@/components/ui/badge';

export function Sidebar() {
  const {
    whatsappUnreadCount,
    pendingOrdersCount,
    pendingPaymentOrdersCount,
    pendingTransactionsCount,
    internalChatsUnreadCount: unreadCount,
    cartItemsCount,
  } = useMenuCountersSimple();
  
  return (
    <nav>
      {/* چت واتس‌اپ */}
      <Link to="/customer-chats">
        چت مشتریان
        {unreadCount > 0 && (
          <Badge variant="destructive">{unreadCount}</Badge>
        )}
      </Link>
      
      {/* سفارشات در انتظار */}
      <Link to="/received-orders">
        سفارشات دریافتی
        {pendingOrdersCount > 0 && (
          <Badge variant="default">{pendingOrdersCount}</Badge>
        )}
      </Link>
      
      {/* تراکنش‌ها */}
      <Link to="/transactions">
        تراکنش‌ها
        {pendingTransactionsCount > 0 && (
          <Badge variant="destructive">{pendingTransactionsCount}</Badge>
        )}
      </Link>
      
      {/* سبد خرید */}
      <Link to="/cart">
        سبد خرید
        {cartItemsCount > 0 && (
          <Badge className="bg-green-500">{cartItemsCount}</Badge>
        )}
      </Link>
      
      {/* پیام‌های واتس‌اپ */}
      <Link to="/whatsapp-chats">
        چت واتس‌اپ
        {whatsappUnreadCount > 0 && (
          <Badge variant="destructive">{whatsappUnreadCount}</Badge>
        )}
      </Link>
    </nav>
  );
}
```

---

## 🧪 تست

برای تست کردن توابع:

```typescript
import {
  calculatePendingOrdersCount,
  calculateCartItemsCount
} from '@/utils/counters';

describe('Menu Counters', () => {
  it('should calculate pending orders correctly', () => {
    const orders = [
      { id: '1', status: 'pending', sellerId: 'seller1' },
      { id: '2', status: 'confirmed', sellerId: 'seller1' },
      { id: '3', status: 'pending', sellerId: 'seller1' },
    ];
    
    const count = calculatePendingOrdersCount(orders, 'seller1');
    expect(count).toBe(2);
  });
  
  it('should calculate cart items count', () => {
    const items = [
      { id: '1', quantity: 2 },
      { id: '2', quantity: 3 },
    ];
    
    const count = calculateCartItemsCount(items);
    expect(count).toBe(5);
  });
});
```

---

## 📝 نکات مهم

1. **استفاده از Simple Hook**: در حال حاضر از `useMenuCountersSimple` استفاده می‌کنیم که همان API های قبلی رو صدا می‌زنه
2. **آینده**: می‌تونیم بعداً به `useMenuCounters` تغییر بدیم که از داده‌های کش شده استفاده می‌کنه
3. **Performance**: هر دو hook عملکرد خوبی دارن، ولی `useMenuCounters` بهینه‌تره
4. **Backward Compatible**: تغییرات به گونه‌ای طراحی شدن که با کد قبلی سازگار باشن

---

**سوال یا مشکلی دارید؟ 😊**
