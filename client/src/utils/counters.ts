/**
 * توابع محاسبه شمارنده‌های منو
 * این توابع برای محاسبه تعداد آیتم‌های در انتظار، خوانده نشده و غیره استفاده می‌شوند
 */

import type { Order, Transaction, InternalChat } from "@shared/schema";

/**
 * پیام دریافتی واتس‌اپ
 */
export interface ReceivedMessage {
  id: string;
  status: string;
  userId: string;
  [key: string]: any;
}

/**
 * آیتم سبد خرید
 */
export interface CartItem {
  id: string;
  quantity: number;
  [key: string]: any;
}

/**
 * محاسبه تعداد پیام‌های خوانده نشده واتس‌اپ
 * @param messages - لیست پیام‌های دریافتی
 * @returns تعداد پیام‌های خوانده نشده
 */
export function calculateWhatsappUnreadCount(messages: ReceivedMessage[]): number {
  return messages.filter(msg => msg.status === "خوانده نشده").length;
}

/**
 * محاسبه تعداد سفارشات در انتظار تایید
 * @param orders - لیست سفارشات
 * @param sellerId - شناسه فروشنده
 * @returns تعداد سفارشات pending
 */
export function calculatePendingOrdersCount(
  orders: Order[],
  sellerId?: string
): number {
  return orders.filter(order => {
    const isPending = order.status === "pending";
    const belongsToSeller = !sellerId || order.sellerId === sellerId;
    return isPending && belongsToSeller;
  }).length;
}

/**
 * محاسبه تعداد سفارشات در انتظار پرداخت
 * @param orders - لیست سفارشات
 * @param userId - شناسه کاربر
 * @returns تعداد سفارشات awaiting_payment
 */
export function calculatePendingPaymentOrdersCount(
  orders: Order[],
  userId?: string
): number {
  return orders.filter(order => {
    const isAwaitingPayment = order.status === "awaiting_payment";
    const belongsToUser = !userId || order.userId === userId;
    return isAwaitingPayment && belongsToUser;
  }).length;
}

/**
 * محاسبه تعداد تراکنش‌های در انتظار تایید
 * @param transactions - لیست تراکنش‌ها
 * @param subUserIds - لیست شناسه‌های زیرمجموعه کاربران (برای فروشنده)
 * @returns تعداد تراکنش‌های pending
 */
export function calculatePendingTransactionsCount(
  transactions: Transaction[],
  subUserIds?: string[]
): number {
  return transactions.filter(transaction => {
    const isPending = transaction.status === "pending";
    const belongsToSubUsers = !subUserIds || 
      subUserIds.includes(transaction.userId);
    return isPending && belongsToSubUsers;
  }).length;
}

/**
 * محاسبه تعداد پیام‌های خوانده نشده چت داخلی
 * @param chats - لیست چت‌های داخلی
 * @param userId - شناسه کاربر فعلی
 * @returns تعداد پیام‌های خوانده نشده
 */
export function calculateInternalChatsUnreadCount(
  chats: InternalChat[],
  userId: string
): number {
  return chats.filter(chat => {
    // فقط پیام‌هایی که این کاربر گیرنده است
    const isReceiver = chat.receiverId === userId;
    // و هنوز خوانده نشده
    const isUnread = !chat.isRead;
    return isReceiver && isUnread;
  }).length;
}

/**
 * محاسبه تعداد کل آیتم‌های سبد خرید
 * @param cartItems - لیست آیتم‌های سبد خرید
 * @returns تعداد کل آیتم‌ها (با احتساب quantity)
 */
export function calculateCartItemsCount(cartItems: CartItem[]): number {
  return cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

/**
 * محاسبه همه شمارنده‌ها برای یک کاربر سطح 1 (فروشنده)
 * @param data - داده‌های مورد نیاز
 * @returns شمارنده‌های محاسبه شده
 */
export function calculateLevel1Counters(data: {
  whatsappMessages?: ReceivedMessage[];
  orders?: Order[];
  transactions?: Transaction[];
  internalChats?: InternalChat[];
  userId: string;
  subUserIds?: string[];
}) {
  return {
    whatsappUnreadCount: data.whatsappMessages 
      ? calculateWhatsappUnreadCount(data.whatsappMessages) 
      : 0,
    pendingOrdersCount: data.orders 
      ? calculatePendingOrdersCount(data.orders, data.userId) 
      : 0,
    pendingTransactionsCount: data.transactions 
      ? calculatePendingTransactionsCount(data.transactions, data.subUserIds) 
      : 0,
    internalChatsUnreadCount: data.internalChats 
      ? calculateInternalChatsUnreadCount(data.internalChats, data.userId) 
      : 0,
  };
}

/**
 * محاسبه همه شمارنده‌ها برای یک کاربر سطح 2 (خریدار)
 * @param data - داده‌های مورد نیاز
 * @returns شمارنده‌های محاسبه شده
 */
export function calculateLevel2Counters(data: {
  cartItems?: CartItem[];
  orders?: Order[];
  internalChats?: InternalChat[];
  userId: string;
}) {
  return {
    cartItemsCount: data.cartItems 
      ? calculateCartItemsCount(data.cartItems) 
      : 0,
    pendingPaymentOrdersCount: data.orders 
      ? calculatePendingPaymentOrdersCount(data.orders, data.userId) 
      : 0,
    internalChatsUnreadCount: data.internalChats 
      ? calculateInternalChatsUnreadCount(data.internalChats, data.userId) 
      : 0,
  };
}
