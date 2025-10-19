import { type Product } from "@shared/schema";

// Session state for managing user's ordering process via WhatsApp
export interface OrderSession {
  userId: string;
  whatsappNumber: string;
  state: 'idle' | 'searching_product' | 'asking_quantity' | 'asking_more_products' | 'asking_address_title' | 'asking_address_full' | 'asking_address_postal_code' | 'selecting_address' | 'asking_shipping_method' | 'confirming_order';
  currentProduct?: Product;
  selectedShippingMethod?: string;
  availableShippingMethods?: Array<{num: number, name: string, value: string}>;
  addressData?: {
    title?: string;
    fullAddress?: string;
    postalCode?: string;
  };
  lastInteraction: Date;
}

class OrderSessionService {
  private sessions: Map<string, OrderSession> = new Map();
  private readonly SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  /**
   * دریافت session کاربر یا ایجاد session جدید
   */
  getSession(userId: string, whatsappNumber: string): OrderSession {
    const existing = this.sessions.get(userId);
    
    // اگر session وجود دارد و هنوز منقضی نشده
    if (existing && Date.now() - existing.lastInteraction.getTime() < this.SESSION_TIMEOUT) {
      existing.lastInteraction = new Date();
      return existing;
    }
    
    // ایجاد session جدید
    const newSession: OrderSession = {
      userId,
      whatsappNumber,
      state: 'idle',
      lastInteraction: new Date(),
    };
    
    this.sessions.set(userId, newSession);
    return newSession;
  }

  /**
   * بروزرسانی session کاربر
   */
  updateSession(userId: string, updates: Partial<OrderSession>): OrderSession | undefined {
    const session = this.sessions.get(userId);
    if (!session) return undefined;
    
    const updated = {
      ...session,
      ...updates,
      lastInteraction: new Date(),
    };
    
    this.sessions.set(userId, updated);
    return updated;
  }

  /**
   * پاک کردن session کاربر
   */
  clearSession(userId: string): void {
    this.sessions.delete(userId);
  }

  /**
   * پاک کردن session های منقضی شده
   */
  cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [userId, session] of Array.from(this.sessions.entries())) {
      if (now - session.lastInteraction.getTime() > this.SESSION_TIMEOUT) {
        this.sessions.delete(userId);
      }
    }
  }
}

export const orderSessionService = new OrderSessionService();

// پاک‌سازی session های منقضی شده هر 5 دقیقه
setInterval(() => {
  orderSessionService.cleanupExpiredSessions();
}, 5 * 60 * 1000);
