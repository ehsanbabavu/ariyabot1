/**
 * Custom hook برای محاسبه شمارنده‌های منو
 * این hook به صورت هوشمند از داده‌های کش شده استفاده می‌کنه
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  calculateWhatsappUnreadCount,
  calculatePendingOrdersCount,
  calculatePendingPaymentOrdersCount,
  calculatePendingTransactionsCount,
  calculateInternalChatsUnreadCount,
  calculateCartItemsCount,
  type ReceivedMessage,
  type CartItem,
} from "@/utils/counters";
import type { Order, Transaction, InternalChat } from "@shared/schema";

/**
 * نتیجه شمارنده‌های منو
 */
export interface MenuCounters {
  whatsappUnreadCount: number;
  pendingOrdersCount: number;
  pendingPaymentOrdersCount: number;
  pendingTransactionsCount: number;
  internalChatsUnreadCount: number;
  cartItemsCount: number;
  isLoading: boolean;
}

/**
 * Hook برای محاسبه همه شمارنده‌های منو
 * این hook به صورت هوشمند از داده‌های موجود در React Query cache استفاده می‌کنه
 */
export function useMenuCounters(): MenuCounters {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. WhatsApp Unread Count (فقط برای admin و level 1)
  const { data: whatsappMessages } = useQuery<ReceivedMessage[]>({
    queryKey: ['/api/messages/received'],
    enabled: !!user && (user.role === "admin" || user.role === "user_level_1"),
    staleTime: 5000,
    refetchInterval: 5000,
  });

  // 2. Pending Orders Count (فقط برای level 1)
  const { data: orders } = useQuery<Order[]>({
    queryKey: ['/api/received-orders'],
    enabled: !!user && user.role === "user_level_1",
    staleTime: 5000,
    refetchInterval: 5000,
  });

  // 3. User Orders (فقط برای level 2) - برای pending payment count
  const { data: userOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: !!user && user.role === "user_level_2",
    staleTime: 3000,
    refetchInterval: 3000,
  });

  // 4. Pending Transactions Count (فقط برای level 1)
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    enabled: !!user && user.role === "user_level_1",
    staleTime: 5000,
    refetchInterval: 5000,
  });

  // 5. Internal Chats Unread Count (برای level 1 و level 2)
  const { data: internalChats } = useQuery<InternalChat[]>({
    queryKey: ['/api/internal-chats'],
    enabled: !!user && (user.role === "user_level_1" || user.role === "user_level_2"),
    staleTime: 5000,
    refetchInterval: 5000,
  });

  // 6. Cart Items Count (فقط برای level 2)
  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user && user.role === "user_level_2",
    queryFn: async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return [];
        
        const response = await fetch("/api/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) return [];
        return response.json();
      } catch {
        return [];
      }
    },
    staleTime: 3000,
    refetchInterval: 3000,
  });

  // محاسبه شمارنده‌ها
  const whatsappUnreadCount = whatsappMessages 
    ? calculateWhatsappUnreadCount(whatsappMessages) 
    : 0;

  const pendingOrdersCount = orders && user
    ? calculatePendingOrdersCount(orders, user.id) 
    : 0;

  const pendingPaymentOrdersCount = userOrders && user
    ? calculatePendingPaymentOrdersCount(userOrders, user.id)
    : 0;

  // برای محاسبه pending transactions، نیاز به لیست sub-users هم داریم
  const { data: subUsers } = useQuery<{ id: string }[]>({
    queryKey: ['/api/sub-users'],
    enabled: !!user && user.role === "user_level_1",
    staleTime: 60000, // این داده کمتر تغییر می‌کنه
  });

  const subUserIds = subUsers?.map(u => u.id) || [];
  const pendingTransactionsCount = transactions && user?.role === "user_level_1"
    ? calculatePendingTransactionsCount(transactions, subUserIds)
    : 0;

  const internalChatsUnreadCount = internalChats && user
    ? calculateInternalChatsUnreadCount(internalChats, user.id)
    : 0;

  const cartItemsCount = calculateCartItemsCount(cartItems);

  // بررسی وضعیت loading
  const isLoading = !user;

  return {
    whatsappUnreadCount,
    pendingOrdersCount,
    pendingPaymentOrdersCount,
    pendingTransactionsCount,
    internalChatsUnreadCount,
    cartItemsCount,
    isLoading,
  };
}

/**
 * Hook ساده‌تر که فقط از API های counter استفاده می‌کنه (fallback)
 * این hook زمانی استفاده می‌شه که داده‌های کامل موجود نیستند
 */
export function useMenuCountersSimple(): MenuCounters {
  const { user } = useAuth();

  // 1. WhatsApp Unread Count
  const { data: whatsappData } = useQuery<{ unreadCount: number }>({
    queryKey: ['/api/messages/whatsapp-unread-count'],
    enabled: !!user && (user.role === "admin" || user.role === "user_level_1"),
    refetchInterval: 5000,
  });

  // 2. Pending Orders Count
  const { data: pendingOrdersData } = useQuery<{ pendingOrdersCount: number }>({
    queryKey: ['/api/orders/pending-orders-count'],
    enabled: !!user && user.role === "user_level_1",
    refetchInterval: 5000,
  });

  // 3. Pending Payment Orders Count
  const { data: pendingPaymentData } = useQuery<{ pendingPaymentOrdersCount: number }>({
    queryKey: ['/api/user/orders/pending-payment-count'],
    enabled: !!user && user.role === "user_level_2",
    refetchInterval: 3000,
  });

  // 4. Pending Transactions Count
  const { data: pendingTransactionsData } = useQuery<{ pendingTransactionsCount: number }>({
    queryKey: ['/api/transactions/pending-count'],
    enabled: !!user && user.role === "user_level_1",
    refetchInterval: 5000,
  });

  // 5. Internal Chats Unread Count
  const { data: internalChatsData } = useQuery<{ unreadCount: number }>({
    queryKey: ['/api/internal-chats/unread-count'],
    enabled: !!user && (user.role === "user_level_1" || user.role === "user_level_2"),
    refetchInterval: 5000,
  });

  // 6. Cart Items
  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user && user.role === "user_level_2",
    queryFn: async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return [];
        
        const response = await fetch("/api/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) return [];
        return response.json();
      } catch {
        return [];
      }
    },
    refetchInterval: 3000,
  });

  return {
    whatsappUnreadCount: whatsappData?.unreadCount || 0,
    pendingOrdersCount: pendingOrdersData?.pendingOrdersCount || 0,
    pendingPaymentOrdersCount: pendingPaymentData?.pendingPaymentOrdersCount || 0,
    pendingTransactionsCount: pendingTransactionsData?.pendingTransactionsCount || 0,
    internalChatsUnreadCount: internalChatsData?.unreadCount || 0,
    cartItemsCount: calculateCartItemsCount(cartItems),
    isLoading: !user,
  };
}
