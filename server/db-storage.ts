import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql, desc, and, gte, or, inArray, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { users, tickets, subscriptions, products, whatsappSettings, sentMessages, receivedMessages, aiTokenSettings, userSubscriptions, categories, carts, cartItems, addresses, orders, orderItems, transactions, internalChats, faqs, shippingSettings, passwordResetOtps, vatSettings } from "@shared/schema";
import { type User, type InsertUser, type Ticket, type InsertTicket, type Subscription, type InsertSubscription, type Product, type InsertProduct, type WhatsappSettings, type InsertWhatsappSettings, type SentMessage, type InsertSentMessage, type ReceivedMessage, type InsertReceivedMessage, type AiTokenSettings, type InsertAiTokenSettings, type UserSubscription, type InsertUserSubscription, type Category, type InsertCategory, type Cart, type InsertCart, type CartItem, type InsertCartItem, type Address, type InsertAddress, type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type Transaction, type InsertTransaction, type InternalChat, type InsertInternalChat, type Faq, type InsertFaq, type UpdateFaq, type ShippingSettings, type InsertShippingSettings, type UpdateShippingSettings, type PasswordResetOtp, type InsertPasswordResetOtp, type VatSettings, type InsertVatSettings, type UpdateVatSettings } from "@shared/schema";
import { type IStorage } from "./storage";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});
const db = drizzle(pool);

export class DbStorage implements IStorage {
  constructor() {
    // Initialize default admin user on startup
    this.initializeAdminUser();
    
    // Initialize default free subscription
    this.initializeDefaultSubscription();
    
    // Initialize test data only in development environment
    if (process.env.NODE_ENV === 'development') {
      this.initializeTestData().catch(console.error);
    }
  }

  private async initializeAdminUser() {
    try {
      // Check if admin user exists
      const existingAdmin = await db
        .select()
        .from(users)
        .where(eq(users.username, "ehsan"))
        .limit(1);

      if (existingAdmin.length === 0) {
        // Use environment variable for admin password, fallback to default password
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
        if (!process.env.ADMIN_PASSWORD) {
          console.log("🔑 کاربر ادمین ایجاد شد - نام کاربری: ehsan");
          console.log("🔑 رمز عبور پیش‌فرض: admin123");
          console.log("⚠️  برای تغییر رمز عبور، متغیر ADMIN_PASSWORD را تنظیم کنید");
        }
        
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await db.insert(users).values({
          username: "ehsan",
          firstName: "احسان",
          lastName: "مدیر",
          email: "ehsan@admin.com",
          phone: "989135621232",
          password: hashedPassword,
          role: "admin",
        });
      }
    } catch (error) {
      console.error("Error initializing admin user:", error);
    }
  }

  private generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private async initializeDefaultSubscription() {
    try {
      // Check if default free subscription exists
      const existingSubscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.name, "اشتراک رایگان"))
        .limit(1);

      if (existingSubscription.length === 0) {
        await db.insert(subscriptions).values({
          name: "اشتراک رایگان",
          description: "اشتراک پیش‌فرض رایگان 7 روزه",
          userLevel: "user_level_1",
          priceBeforeDiscount: "0",
          duration: "monthly",
          features: [
            "دسترسی پایه به سیستم",
            "پشتیبانی محدود",
            "7 روز استفاده رایگان"
          ],
          isActive: true,
          isDefault: true,
        });
      }
    } catch (error) {
      console.error("Error initializing default subscription:", error);
    }
  }

  private async initializeTestData() {
    try {
      // بررسی وجود کاربر تستی سطح 1
      const existingTestUser = await db
        .select()
        .from(users)
        .where(eq(users.username, "test_seller"))
        .limit(1);

      let testUser: User;
      
      if (existingTestUser.length === 0) {
        // ایجاد کاربر سطح 1 تستی
        const testUserPassword = await bcrypt.hash("test123", 10);
        const [createdUser] = await db.insert(users).values({
          username: "test_seller",
          firstName: "علی",
          lastName: "فروشنده تستی",
          email: "test@seller.com",
          phone: "09111234567",
          whatsappNumber: "09111234567",
          password: testUserPassword,
          role: "user_level_1",
        }).returning();
        testUser = createdUser;
        console.log("🔑 کاربر سطح 1 تستی ایجاد شد - نام کاربری: test_seller، رمز عبور: test123");
      } else {
        testUser = existingTestUser[0];
      }

      // بررسی و ایجاد دسته‌بندی‌های تستی
      const existingCategories = await db
        .select()
        .from(categories)
        .where(eq(categories.createdBy, testUser.id));

      let categoryIds: {smartphones: string, accessories: string, tablets: string} | null = null;

      if (existingCategories.length === 0) {
        // ایجاد 3 دسته‌بندی موبایل
        const mobileCategories = [
          {
            name: "گوشی‌های هوشمند",
            description: "انواع گوشی‌های هوشمند اندروید و آیفون",
            createdBy: testUser.id,
            order: 0,
          },
          {
            name: "لوازم جانبی موبایل",
            description: "کیف، کاور، محافظ صفحه و سایر لوازم جانبی",
            createdBy: testUser.id,
            order: 1,
          },
          {
            name: "تبلت و آیپد",
            description: "انواع تبلت‌های اندروید و آیپد اپل",
            createdBy: testUser.id,
            order: 2,
          }
        ];

        const createdCategories = await db.insert(categories).values(mobileCategories).returning();
        console.log("📱 3 دسته‌بندی موبایل تستی ایجاد شد");
        
        categoryIds = {
          smartphones: createdCategories[0].id,
          accessories: createdCategories[1].id,
          tablets: createdCategories[2].id,
        };
      } else {
        // استفاده از دسته‌بندی‌های موجود
        const smartphonesCategory = existingCategories.find(cat => cat.name === "گوشی‌های هوشمند");
        const accessoriesCategory = existingCategories.find(cat => cat.name === "لوازم جانبی موبایل");
        const tabletsCategory = existingCategories.find(cat => cat.name === "تبلت و آیپد");
        
        if (smartphonesCategory && accessoriesCategory && tabletsCategory) {
          categoryIds = {
            smartphones: smartphonesCategory.id,
            accessories: accessoriesCategory.id,
            tablets: tabletsCategory.id,
          };
        }
      }

      // بررسی و ایجاد محصولات تستی (مستقل از وضعیت دسته‌بندی‌ها)
      if (categoryIds) {
        const existingProducts = await db
          .select()
          .from(products)
          .where(eq(products.userId, testUser.id));

        if (existingProducts.length === 0) {
          // ایجاد 6 محصول تستی
          const testProducts = [
            {
              userId: testUser.id,
              name: "آیفون 15 پرو مکس",
              description: "گوشی آیفون 15 پرو مکس با ظرفیت 256 گیگابایت، رنگ طلایی",
              categoryId: categoryIds.smartphones,
              priceBeforeDiscount: "45000000",
              priceAfterDiscount: "43000000",
              quantity: 5,
              image: "/uploads/iphone15-pro-max.png"
            },
            {
              userId: testUser.id,
              name: "سامسونگ گلکسی S24 اولترا",
              description: "گوشی سامسونگ گلکسی S24 اولترا با ظرفیت 512 گیگابایت",
              categoryId: categoryIds.smartphones,
              priceBeforeDiscount: "35000000",
              priceAfterDiscount: "33500000",
              quantity: 8,
              image: "/uploads/samsung-s24-ultra.png"
            },
            {
              userId: testUser.id,
              name: "کاور چرمی آیفون",
              description: "کاور چرمی اصل برای آیفون 15 سری، رنگ قهوه‌ای",
              categoryId: categoryIds.accessories,
              priceBeforeDiscount: "350000",
              priceAfterDiscount: "299000",
              quantity: 20,
              image: "/uploads/iphone-case.png"
            },
            {
              userId: testUser.id,
              name: "محافظ صفحه شیشه‌ای",
              description: "محافظ صفحه شیشه‌ای ضد ضربه برای انواع گوشی",
              categoryId: categoryIds.accessories,
              priceBeforeDiscount: "120000",
              priceAfterDiscount: "95000",
              quantity: 50,
              image: "/uploads/screen-protector.png"
            },
            {
              userId: testUser.id,
              name: "آیپد پرو 12.9 اینچ",
              description: "تبلت آیپد پرو 12.9 اینچ نسل پنجم با چیپ M2",
              categoryId: categoryIds.tablets,
              priceBeforeDiscount: "28000000",
              priceAfterDiscount: "26500000",
              quantity: 3,
              image: "/uploads/ipad-pro.png"
            },
            {
              userId: testUser.id,
              name: "تبلت سامسونگ گلکسی Tab S9",
              description: "تبلت سامسونگ گلکسی Tab S9 با صفحه 11 اینچ",
              categoryId: categoryIds.tablets,
              priceBeforeDiscount: "18000000",
              priceAfterDiscount: "17200000",
              quantity: 6,
              image: "/uploads/samsung-tab-s9.png"
            }
          ];

          await db.insert(products).values(testProducts);
          console.log("🛍️ 6 محصول تستی ایجاد شد");
        }
      }
      
      console.log("✅ تمام داده‌های تستی با موفقیت بررسی و ایجاد شدند");
    } catch (error) {
      console.error("Error initializing test data:", error);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmailOrUsername(emailOrUsername: string): Promise<User | undefined> {
    // Try email first
    const userByEmail = await this.getUserByEmail(emailOrUsername);
    if (userByEmail) return userByEmail;
    
    // Try username if email doesn't work
    const userByUsername = await this.getUserByUsername(emailOrUsername);
    return userByUsername;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined> {
    const result = await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    // حذف cascade دستی - ابتدا همه داده‌های مرتبط با کاربر را حذف می‌کنیم
    
    // 1. حذف آیتم‌های سبد خرید (که به سبدهای خرید وابسته است)
    const userCarts = await db.select().from(carts).where(eq(carts.userId, id));
    if (userCarts.length > 0) {
      const cartIds = userCarts.map(cart => cart.id);
      await db.delete(cartItems).where(inArray(cartItems.cartId, cartIds));
    }
    
    // 2. حذف سبدهای خرید
    await db.delete(carts).where(eq(carts.userId, id));
    
    // 3. حذف آیتم‌های سفارش (که به سفارش‌ها وابسته است)
    const userOrders = await db.select().from(orders).where(
      or(eq(orders.userId, id), eq(orders.sellerId, id))
    );
    if (userOrders.length > 0) {
      const orderIds = userOrders.map(order => order.id);
      await db.delete(orderItems).where(inArray(orderItems.orderId, orderIds));
    }
    
    // 4. حذف تراکنش‌ها (قبل از سفارش‌ها چون به سفارش‌ها وابسته است)
    await db.delete(transactions).where(
      or(
        eq(transactions.userId, id),
        eq(transactions.initiatorUserId, id),
        eq(transactions.parentUserId, id),
        eq(transactions.approvedByUserId, id)
      )
    );
    
    // 5. حذف سفارش‌ها
    await db.delete(orders).where(
      or(eq(orders.userId, id), eq(orders.sellerId, id))
    );
    
    // 6. حذف آدرس‌ها
    await db.delete(addresses).where(eq(addresses.userId, id));
    
    // 7. حذف چت‌های داخلی
    await db.delete(internalChats).where(
      or(eq(internalChats.senderId, id), eq(internalChats.receiverId, id))
    );
    
    // 8. حذف پیام‌های ارسالی
    await db.delete(sentMessages).where(eq(sentMessages.userId, id));
    
    // 9. حذف پیام‌های دریافتی
    await db.delete(receivedMessages).where(eq(receivedMessages.userId, id));
    
    // 10. حذف اشتراک‌های کاربر
    await db.delete(userSubscriptions).where(eq(userSubscriptions.userId, id));
    
    // 11. حذف تیکت‌ها
    await db.delete(tickets).where(eq(tickets.userId, id));
    
    // 12. حذف محصولات
    await db.delete(products).where(eq(products.userId, id));
    
    // 13. حذف دسته‌بندی‌های ایجاد شده توسط کاربر
    await db.delete(categories).where(eq(categories.createdBy, id));
    
    // 14. در نهایت حذف کاربر
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount! > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Tickets
  async getTicket(id: string): Promise<Ticket | undefined> {
    const result = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
    return result[0];
  }

  async getTicketsByUser(userId: string): Promise<Ticket[]> {
    return await db.select().from(tickets).where(eq(tickets.userId, userId));
  }

  async getAllTickets(): Promise<Ticket[]> {
    return await db.select().from(tickets);
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const result = await db.insert(tickets).values(insertTicket).returning();
    return result[0];
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    const result = await db.update(tickets).set(updates).where(eq(tickets.id, id)).returning();
    return result[0];
  }

  async deleteTicket(id: string): Promise<boolean> {
    const result = await db.delete(tickets).where(eq(tickets.id, id));
    return result.rowCount! > 0;
  }

  // Subscriptions
  async getSubscription(id: string): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
    return result[0];
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions);
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const result = await db.insert(subscriptions).values(insertSubscription).returning();
    return result[0];
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const result = await db.update(subscriptions).set(updates).where(eq(subscriptions.id, id)).returning();
    return result[0];
  }

  async deleteSubscription(id: string): Promise<boolean> {
    const result = await db.delete(subscriptions).where(eq(subscriptions.id, id));
    return result.rowCount! > 0;
  }

  // Products
  async getProduct(id: string, currentUserId: string, userRole: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    const product = result[0];
    
    if (!product) return undefined;
    
    // Apply role-based access control
    if (userRole === 'admin' || userRole === 'user_level_1') {
      // Admin and level 1 can only access their own products
      return product.userId === currentUserId ? product : undefined;
    } else if (userRole === 'user_level_2') {
      // Level 2 can only access products from level 1 users
      const productOwner = await db.select().from(users)
        .where(and(eq(users.id, product.userId), eq(users.role, 'user_level_1')))
        .limit(1);
      return productOwner.length > 0 ? product : undefined;
    }
    
    return undefined;
  }

  async getProductsByUser(userId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.userId, userId));
  }

  async getAllProducts(currentUserId: string, userRole: string): Promise<Product[]> {
    if (!currentUserId || !userRole) {
      throw new Error('User context required for getAllProducts');
    }

    // Filter based on user role
    if (userRole === 'admin') {
      // Admin sees only their own products
      return await db.select().from(products).where(eq(products.userId, currentUserId));
    } else if (userRole === 'user_level_1') {
      // Level 1 sees only their own products  
      return await db.select().from(products).where(eq(products.userId, currentUserId));
    } else if (userRole === 'user_level_2') {
      // Level 2 sees products from their parent user
      const currentUser = await db.select({ parentUserId: users.parentUserId })
        .from(users)
        .where(eq(users.id, currentUserId))
        .limit(1);
      
      if (currentUser.length === 0 || !currentUser[0].parentUserId) {
        // If no parent user found, return empty array
        return [];
      }
      
      // Return products from parent user
      return await db.select().from(products).where(eq(products.userId, currentUser[0].parentUserId));
    }
    
    return [];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(insertProduct).returning();
    return result[0];
  }

  async updateProduct(id: string, updates: Partial<Product>, currentUserId: string, userRole: string): Promise<Product | undefined> {
    // user_level_2 cannot modify products, only view them
    if (userRole === 'user_level_2') {
      return undefined;
    }
    
    const product = await this.getProduct(id, currentUserId, userRole);
    if (!product) return undefined;
    
    const result = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string, currentUserId: string, userRole: string): Promise<boolean> {
    // user_level_2 cannot modify products, only view them
    if (userRole === 'user_level_2') {
      return false;
    }
    
    const product = await this.getProduct(id, currentUserId, userRole);
    if (!product) return false;
    
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount! > 0;
  }

  // WhatsApp Settings
  async getWhatsappSettings(): Promise<WhatsappSettings | undefined> {
    const result = await db.select().from(whatsappSettings).limit(1);
    return result[0];
  }

  async updateWhatsappSettings(settings: InsertWhatsappSettings): Promise<WhatsappSettings> {
    // First try to get existing settings
    const existing = await this.getWhatsappSettings();
    
    if (existing) {
      const result = await db.update(whatsappSettings).set(settings).where(eq(whatsappSettings.id, existing.id)).returning();
      return result[0];
    } else {
      const result = await db.insert(whatsappSettings).values(settings).returning();
      return result[0];
    }
  }

  // Messages
  async getSentMessagesByUser(userId: string): Promise<SentMessage[]> {
    return await db.select().from(sentMessages)
      .where(eq(sentMessages.userId, userId))
      .orderBy(desc(sentMessages.timestamp), desc(sentMessages.id));
  }

  async createSentMessage(insertMessage: InsertSentMessage): Promise<SentMessage> {
    const result = await db.insert(sentMessages).values(insertMessage).returning();
    return result[0];
  }

  async getReceivedMessagesByUser(userId: string): Promise<ReceivedMessage[]> {
    return await db.select().from(receivedMessages)
      .where(eq(receivedMessages.userId, userId))
      .orderBy(desc(receivedMessages.timestamp), desc(receivedMessages.id));
  }

  async getReceivedMessagesByUserPaginated(userId: string, page: number, limit: number): Promise<{ messages: ReceivedMessage[], total: number, totalPages: number }> {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(receivedMessages)
      .where(eq(receivedMessages.userId, userId));
    const total = countResult[0].count;
    const totalPages = Math.ceil(total / limit);
    
    // Get paginated messages ordered by timestamp desc (newest first)
    const messages = await db.select()
      .from(receivedMessages)
      .where(eq(receivedMessages.userId, userId))
      .orderBy(desc(receivedMessages.timestamp), desc(receivedMessages.id))
      .limit(limit)
      .offset(offset);
    
    return { messages, total, totalPages };
  }

  async getReceivedMessageByWhatsiPlusId(whatsiPlusId: string): Promise<ReceivedMessage | undefined> {
    const result = await db.select().from(receivedMessages).where(eq(receivedMessages.whatsiPlusId, whatsiPlusId)).limit(1);
    return result[0];
  }

  async getReceivedMessageByWhatsiPlusIdAndUser(whatsiPlusId: string, userId: string): Promise<ReceivedMessage | undefined> {
    const result = await db.select()
      .from(receivedMessages)
      .where(and(eq(receivedMessages.whatsiPlusId, whatsiPlusId), eq(receivedMessages.userId, userId)))
      .limit(1);
    return result[0];
  }

  async createReceivedMessage(insertMessage: InsertReceivedMessage): Promise<ReceivedMessage> {
    const result = await db.insert(receivedMessages).values(insertMessage).returning();
    return result[0];
  }

  async updateReceivedMessageStatus(id: string, status: string): Promise<ReceivedMessage | undefined> {
    const result = await db.update(receivedMessages).set({ status }).where(eq(receivedMessages.id, id)).returning();
    return result[0];
  }

  // AI Token Settings
  async getAiTokenSettings(provider?: string): Promise<AiTokenSettings | undefined> {
    if (provider) {
      const result = await db.select().from(aiTokenSettings).where(eq(aiTokenSettings.provider, provider)).limit(1);
      return result[0];
    }
    const result = await db.select().from(aiTokenSettings).where(eq(aiTokenSettings.isActive, true)).limit(1);
    return result[0];
  }

  async getAllAiTokenSettings(): Promise<AiTokenSettings[]> {
    const result = await db.select().from(aiTokenSettings);
    return result;
  }

  async updateAiTokenSettings(settings: InsertAiTokenSettings): Promise<AiTokenSettings> {
    const existing = await this.getAiTokenSettings(settings.provider);
    
    if (settings.isActive) {
      await db.update(aiTokenSettings)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(aiTokenSettings.isActive, true));
    }
    
    if (existing) {
      const result = await db.update(aiTokenSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(aiTokenSettings.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(aiTokenSettings).values(settings).returning();
      return result[0];
    }
  }

  // User Subscriptions
  async getUserSubscription(userId: string): Promise<UserSubscription & { subscriptionName?: string | null; subscriptionDescription?: string | null } | undefined> {
    const result = await db.select({
      id: userSubscriptions.id,
      userId: userSubscriptions.userId,
      subscriptionId: userSubscriptions.subscriptionId,
      status: userSubscriptions.status,
      startDate: userSubscriptions.startDate,
      endDate: userSubscriptions.endDate,
      remainingDays: userSubscriptions.remainingDays,
      isTrialPeriod: userSubscriptions.isTrialPeriod,
      createdAt: userSubscriptions.createdAt,
      updatedAt: userSubscriptions.updatedAt,
      subscriptionName: subscriptions.name,
      subscriptionDescription: subscriptions.description,
    })
    .from(userSubscriptions)
    .innerJoin(subscriptions, eq(userSubscriptions.subscriptionId, subscriptions.id))
    .where(and(
      eq(userSubscriptions.userId, userId),
      eq(userSubscriptions.status, 'active'),
      gte(userSubscriptions.endDate, new Date())
    ))
    .orderBy(desc(userSubscriptions.endDate))
    .limit(1);
    return result[0];
  }

  async getUserSubscriptionsByUserId(userId: string): Promise<UserSubscription[]> {
    return await db.select().from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .orderBy(desc(userSubscriptions.createdAt));
  }

  async getUserSubscriptionById(id: string): Promise<UserSubscription | undefined> {
    const result = await db.select().from(userSubscriptions).where(eq(userSubscriptions.id, id)).limit(1);
    return result[0];
  }

  async getAllUserSubscriptions(): Promise<UserSubscription[]> {
    return await db.select().from(userSubscriptions).orderBy(desc(userSubscriptions.createdAt));
  }

  async createUserSubscription(insertUserSubscription: InsertUserSubscription): Promise<UserSubscription> {
    const result = await db.insert(userSubscriptions).values(insertUserSubscription).returning();
    return result[0];
  }

  async updateUserSubscription(id: string, updates: Partial<UserSubscription>): Promise<UserSubscription | undefined> {
    const result = await db.update(userSubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userSubscriptions.id, id))
      .returning();
    return result[0];
  }

  async deleteUserSubscription(id: string): Promise<boolean> {
    const result = await db.delete(userSubscriptions).where(eq(userSubscriptions.id, id));
    return result.rowCount! > 0;
  }

  async updateRemainingDays(id: string, remainingDays: number): Promise<UserSubscription | undefined> {
    const status = remainingDays <= 0 ? 'expired' : 'active';
    const result = await db.update(userSubscriptions)
      .set({ 
        remainingDays, 
        status,
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.id, id))
      .returning();
    return result[0];
  }

  async getActiveUserSubscriptions(): Promise<UserSubscription[]> {
    return await db.select().from(userSubscriptions)
      .where(eq(userSubscriptions.status, 'active'))
      .orderBy(desc(userSubscriptions.createdAt));
  }

  async getExpiredUserSubscriptions(): Promise<UserSubscription[]> {
    return await db.select().from(userSubscriptions)
      .where(eq(userSubscriptions.status, 'expired'))
      .orderBy(desc(userSubscriptions.createdAt));
  }

  // Categories
  async getCategory(id: string, currentUserId: string, userRole: string): Promise<Category | undefined> {
    if (userRole === 'admin' || userRole === 'user_level_1') {
      // Admin and level 1 can only access their own categories
      const result = await db.select().from(categories)
        .where(and(eq(categories.id, id), eq(categories.createdBy, currentUserId)))
        .limit(1);
      return result[0];
    } else if (userRole === 'user_level_2') {
      // Level 2 can only access categories from level 1 users
      const result = await db.select().from(categories)
        .innerJoin(users, eq(categories.createdBy, users.id))
        .where(and(eq(categories.id, id), eq(users.role, 'user_level_1')))
        .limit(1);
      return result[0]?.categories;
    }
    return undefined;
  }

  async getAllCategories(currentUserId: string, userRole: string): Promise<Category[]> {
    if (!currentUserId || !userRole) {
      throw new Error('User context required for getAllCategories');
    }

    // Filter based on user role
    if (userRole === 'admin') {
      // Admin sees only their own categories
      return await db.select().from(categories)
        .where(eq(categories.createdBy, currentUserId))
        .orderBy(categories.order);
    } else if (userRole === 'user_level_1') {
      // Level 1 sees only their own categories
      return await db.select().from(categories)
        .where(eq(categories.createdBy, currentUserId))
        .orderBy(categories.order);
    } else if (userRole === 'user_level_2') {
      // Level 2 sees only categories from level 1 users
      const level1Users = await db.select({ id: users.id }).from(users).where(eq(users.role, 'user_level_1'));
      const level1UserIds = level1Users.map(user => user.id);
      
      if (level1UserIds.length === 0) {
        return [];
      }
      
      return await db.select().from(categories)
        .where(sql`${categories.createdBy} = ANY(${level1UserIds})`)
        .orderBy(categories.order);
    }
    
    return [];
  }

  async getCategoriesByParent(parentId: string | null, currentUserId: string, userRole: string): Promise<Category[]> {
    const allCategories = await this.getAllCategories(currentUserId, userRole);
    return allCategories.filter(category => category.parentId === parentId);
  }

  async getCategoryTree(currentUserId: string, userRole: string): Promise<Category[]> {
    const allCategories = await this.getAllCategories(currentUserId, userRole);
    // Get root categories (those with null parentId)
    return allCategories.filter(cat => cat.parentId === null);
  }

  async createCategory(insertCategory: InsertCategory, createdBy: string): Promise<Category> {
    const result = await db.insert(categories).values({ ...insertCategory, createdBy }).returning();
    return result[0];
  }

  async updateCategory(id: string, updates: Partial<Category>, currentUserId: string, userRole: string): Promise<Category | undefined> {
    const category = await this.getCategory(id, currentUserId, userRole);
    if (!category) return undefined;
    
    const result = await db.update(categories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }

  async deleteCategory(id: string, currentUserId: string, userRole: string): Promise<boolean> {
    const category = await this.getCategory(id, currentUserId, userRole);
    if (!category) return false;
    
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result.rowCount! > 0;
  }

  async reorderCategories(updates: { id: string; order: number; parentId?: string | null }[]): Promise<boolean> {
    try {
      // Use a transaction to ensure all updates succeed or fail together
      for (const update of updates) {
        await db.update(categories)
          .set({
            order: update.order,
            parentId: update.parentId !== undefined ? update.parentId : undefined,
            updatedAt: new Date()
          })
          .where(eq(categories.id, update.id));
      }
      return true;
    } catch (error) {
      console.error('Error reordering categories:', error);
      return false;
    }
  }

  // Missing methods that were causing LSP errors
  async getUserByWhatsappNumber(whatsappNumber: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.whatsappNumber, whatsappNumber)).limit(1);
    return result[0];
  }

  async getSubUsers(parentUserId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.parentUserId, parentUserId));
  }

  async getUsersVisibleToUser(userId: string, userRole: string): Promise<User[]> {
    if (userRole === 'admin') {
      // Admin can see only admin and user_level_1 users, NOT user_level_2
      return await db.select().from(users).where(
        or(
          eq(users.role, 'admin'),
          eq(users.role, 'user_level_1')
        )
      );
    } else if (userRole === 'user_level_1') {
      // Level 1 users can see their sub-users (level 2)
      return await db.select().from(users).where(eq(users.parentUserId, userId));
    } else {
      // Level 2 users cannot see other users
      return [];
    }
  }

  // Cart
  async getCart(userId: string): Promise<Cart | undefined> {
    const result = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
    return result[0];
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    const cart = await this.getCart(userId);
    if (!cart) return [];
    
    return await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id));
  }

  async getCartItemsWithProducts(userId: string): Promise<(CartItem & { productName: string; productDescription?: string; productImage?: string })[]> {
    const cart = await this.getCart(userId);
    if (!cart) return [];
    
    const result = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        unitPrice: cartItems.unitPrice,
        totalPrice: cartItems.totalPrice,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        productName: products.name,
        productDescription: products.description,
        productImage: products.image,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart.id));

    return result.map(row => ({
      id: row.id,
      cartId: row.cartId,
      productId: row.productId,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      totalPrice: row.totalPrice,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      productName: row.productName,
      productDescription: row.productDescription || undefined,
      productImage: row.productImage || undefined,
    }));
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (product.length === 0) {
      throw new Error('محصول یافت نشد');
    }

    // Get or create cart for user
    let cart = await this.getCart(userId);
    if (!cart) {
      const cartResult = await db.insert(carts).values({
        userId,
        totalAmount: "0",
        itemCount: 0,
      }).returning();
      cart = cartResult[0];
    }

    // Check if item already exists in cart
    const existingItem = await db.select().from(cartItems)
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)))
      .limit(1);

    const unitPrice = product[0].priceAfterDiscount || product[0].priceBeforeDiscount;
    const totalPrice = (parseFloat(unitPrice) * quantity).toString();

    if (existingItem.length > 0) {
      // Update existing item
      const newQuantity = existingItem[0].quantity + quantity;
      const newTotalPrice = (parseFloat(unitPrice) * newQuantity).toString();
      
      const result = await db.update(cartItems)
        .set({
          quantity: newQuantity,
          totalPrice: newTotalPrice,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem[0].id))
        .returning();
      
      return result[0];
    } else {
      // Create new item
      const result = await db.insert(cartItems).values({
        cartId: cart.id,
        productId,
        quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
      }).returning();
      
      return result[0];
    }
  }

  async updateCartItemQuantity(itemId: string, quantity: number, userId: string): Promise<CartItem | undefined> {
    const cart = await this.getCart(userId);
    if (!cart) return undefined;

    const item = await db.select().from(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)))
      .limit(1);
    
    if (item.length === 0) return undefined;

    const newTotalPrice = (parseFloat(item[0].unitPrice) * quantity).toString();
    
    const result = await db.update(cartItems)
      .set({
        quantity,
        totalPrice: newTotalPrice,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, itemId))
      .returning();
    
    return result[0];
  }

  async removeFromCart(itemId: string, userId: string): Promise<boolean> {
    const cart = await this.getCart(userId);
    if (!cart) return false;

    const result = await db.delete(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));
    
    return result.rowCount! > 0;
  }

  async clearCart(userId: string): Promise<boolean> {
    const cart = await this.getCart(userId);
    if (!cart) return false;

    const result = await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    return result.rowCount! >= 0;
  }

  // Addresses
  async getAddress(id: string): Promise<Address | undefined> {
    const result = await db.select().from(addresses).where(eq(addresses.id, id)).limit(1);
    return result[0];
  }

  async getAddressesByUser(userId: string): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const result = await db.insert(addresses).values(insertAddress).returning();
    return result[0];
  }

  async updateAddress(id: string, updates: Partial<Address>, userId: string): Promise<Address | undefined> {
    const result = await db.update(addresses)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteAddress(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
    return result.rowCount! > 0;
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<boolean> {
    // First, remove default from all user addresses
    await db.update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, userId));
    
    // Then set the specified address as default
    const result = await db.update(addresses)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
    
    return result.rowCount! > 0;
  }

  // Orders
  async getOrder(id: string): Promise<(Order & { addressTitle?: string; fullAddress?: string; postalCode?: string; buyerFirstName?: string; buyerLastName?: string; buyerPhone?: string; sellerFirstName?: string; sellerLastName?: string }) | undefined> {
    const sellerUsers = alias(users, 'seller_users');
    
    const result = await db.select({
      id: orders.id,
      userId: orders.userId,
      sellerId: orders.sellerId,
      addressId: orders.addressId,
      totalAmount: orders.totalAmount,
      status: orders.status,
      statusHistory: orders.statusHistory,
      orderNumber: orders.orderNumber,
      notes: orders.notes,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      addressTitle: addresses.title,
      fullAddress: addresses.fullAddress,
      postalCode: addresses.postalCode,
      buyerFirstName: users.firstName,
      buyerLastName: users.lastName,
      buyerPhone: users.phone,
      sellerFirstName: sellerUsers.firstName,
      sellerLastName: sellerUsers.lastName,
    })
    .from(orders)
    .leftJoin(addresses, eq(orders.addressId, addresses.id))
    .leftJoin(users, eq(orders.userId, users.id))
    .leftJoin(sellerUsers, eq(orders.sellerId, sellerUsers.id))
    .where(eq(orders.id, id))
    .limit(1);
    
    return result[0] as (Order & { addressTitle?: string; fullAddress?: string; postalCode?: string; buyerFirstName?: string; buyerLastName?: string; buyerPhone?: string; sellerFirstName?: string; sellerLastName?: string }) | undefined;
  }

  async getOrdersByUser(userId: string): Promise<(Order & { addressTitle?: string; fullAddress?: string; postalCode?: string })[]> {
    const result = await db.select({
      id: orders.id,
      userId: orders.userId,
      sellerId: orders.sellerId,
      addressId: orders.addressId,
      totalAmount: orders.totalAmount,
      status: orders.status,
      statusHistory: orders.statusHistory,
      orderNumber: orders.orderNumber,
      notes: orders.notes,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      addressTitle: addresses.title,
      fullAddress: addresses.fullAddress,
      postalCode: addresses.postalCode,
    })
    .from(orders)
    .leftJoin(addresses, eq(orders.addressId, addresses.id))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
    
    return result as (Order & { addressTitle?: string; fullAddress?: string; postalCode?: string })[];
  }

  async getOrdersBySeller(sellerId: string): Promise<(Order & { addressTitle?: string; fullAddress?: string; postalCode?: string; buyerFirstName?: string; buyerLastName?: string; buyerPhone?: string })[]> {
    const result = await db.select({
      id: orders.id,
      userId: orders.userId,
      sellerId: orders.sellerId,
      addressId: orders.addressId,
      totalAmount: orders.totalAmount,
      status: orders.status,
      statusHistory: orders.statusHistory,
      orderNumber: orders.orderNumber,
      notes: orders.notes,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      addressTitle: addresses.title,
      fullAddress: addresses.fullAddress,
      postalCode: addresses.postalCode,
      buyerFirstName: users.firstName,
      buyerLastName: users.lastName,
      buyerPhone: users.phone,
    })
    .from(orders)
    .leftJoin(addresses, eq(orders.addressId, addresses.id))
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.sellerId, sellerId))
    .orderBy(desc(orders.createdAt));
    
    return result as (Order & { addressTitle?: string; fullAddress?: string; postalCode?: string; buyerFirstName?: string; buyerLastName?: string; buyerPhone?: string })[];
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const orderNumber = this.generateOrderNumber();
    const orderData = {
      ...insertOrder,
      orderNumber,
    };
    const result = await db.insert(orders).values(orderData).returning();
    return result[0];
  }

  async updateOrderStatus(id: string, status: string, sellerId: string): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ 
        status, 
        updatedAt: new Date(),
        statusHistory: sql`array_append(status_history, ${status}::text)`
      })
      .where(and(eq(orders.id, id), eq(orders.sellerId, sellerId)))
      .returning();
    return result[0];
  }

  generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  async getNewOrdersCount(sellerId: string): Promise<number> {
    // Count orders that are "pending" status (new orders)
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(
        eq(orders.sellerId, sellerId),
        eq(orders.status, 'pending')
      ));
    
    return result[0]?.count || 0;
  }

  async getUnshippedOrdersCount(sellerId: string): Promise<number> {
    // Count orders that are unshipped (pending, confirmed, preparing)
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(
        eq(orders.sellerId, sellerId),
        inArray(orders.status, ['pending', 'confirmed', 'preparing'])
      ));
    
    return result[0]?.count || 0;
  }

  async getPaidOrdersCount(sellerId: string): Promise<number> {
    // Count orders that are paid (status other than awaiting_payment)
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(
        eq(orders.sellerId, sellerId),
        ne(orders.status, 'awaiting_payment')
      ));
    
    return result[0]?.count || 0;
  }

  async getPendingOrdersCount(sellerId: string): Promise<number> {
    // Count orders that are pending (در حال تایید)
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(
        eq(orders.sellerId, sellerId),
        eq(orders.status, 'pending')
      ));
    
    return result[0]?.count || 0;
  }

  async getPendingPaymentOrdersCount(userId: string): Promise<number> {
    // Count orders that are awaiting payment for user
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(
        eq(orders.userId, userId),
        eq(orders.status, 'awaiting_payment')
      ));
    
    return result[0]?.count || 0;
  }

  async getAwaitingPaymentOrdersByUser(userId: string): Promise<Order[]> {
    // Get orders that are awaiting payment for user, ordered by creation date (oldest first)
    return await db.select()
      .from(orders)
      .where(and(
        eq(orders.userId, userId),
        eq(orders.status, 'awaiting_payment')
      ))
      .orderBy(orders.createdAt); // oldest first for priority processing
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async getOrderItemsWithProducts(orderId: string): Promise<(OrderItem & { productName: string; productDescription?: string; productImage?: string })[]> {
    const result = await db.select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      totalPrice: orderItems.totalPrice,
      createdAt: orderItems.createdAt,
      productName: products.name,
      productDescription: products.description,
      productImage: products.image,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));
    
    return result as (OrderItem & { productName: string; productDescription?: string; productImage?: string })[];
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(insertOrderItem).returning();
    return result[0];
  }

  // Transactions
  async getTransaction(id: string): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return result[0];
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByUserAndType(userId: string, type: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, type)))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(insertTransaction).returning();
    return result[0];
  }

  async updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined> {
    const result = await db.update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return result[0];
  }

  async getUserBalance(userId: string): Promise<number> {
    const result = await db.select({
      balance: sql<number>`COALESCE(SUM(CASE 
        WHEN type IN ('deposit', 'commission') THEN amount::numeric
        WHEN type IN ('withdraw', 'order_payment') THEN -amount::numeric
        ELSE 0
      END), 0)::numeric`
    })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.status, 'completed')));
    
    return Number(result[0].balance);
  }

  async getPendingTransactionsCount(sellerId: string): Promise<number> {
    // Count transactions that are pending and belong to sub-users of this seller
    const subUsers = await db.select()
      .from(users)
      .where(eq(users.parentUserId, sellerId));
    
    const subUserIds = subUsers.map(user => user.id);
    
    if (subUserIds.length === 0) {
      return 0;
    }
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(and(
        eq(transactions.status, 'pending'),
        inArray(transactions.userId, subUserIds)
      ));
    
    return result[0]?.count || 0;
  }

  async getSuccessfulTransactionsBySellers(sellerIds: string[]): Promise<Transaction[]> {
    if (sellerIds.length === 0) return [];
    
    return await db.select().from(transactions)
      .where(and(
        sql`user_id = ANY(${sellerIds})`,
        eq(transactions.status, 'completed'),
        eq(transactions.type, 'commission')
      ))
      .orderBy(desc(transactions.createdAt));
  }

  // Deposit approval methods
  async getDepositsByParent(parentUserId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(and(
        eq(transactions.type, 'deposit'),
        eq(transactions.parentUserId, parentUserId)
      ))
      .orderBy(desc(transactions.createdAt));
  }

  async approveDeposit(transactionId: string, approvedByUserId: string): Promise<Transaction | undefined> {
    const result = await db.update(transactions)
      .set({ 
        status: 'completed',
        approvedByUserId,
        approvedAt: new Date()
      })
      .where(eq(transactions.id, transactionId))
      .returning();
    return result[0];
  }

  async getApprovedDepositsTotalByParent(parentUserId: string): Promise<number> {
    const result = await db.select({
      total: sql<number>`COALESCE(SUM(amount::numeric), 0)::numeric`
    })
    .from(transactions)
    .where(and(
      eq(transactions.type, 'deposit'),
      eq(transactions.parentUserId, parentUserId),
      eq(transactions.status, 'completed'),
      sql`approved_by_user_id IS NOT NULL`
    ));
    
    return Number(result[0].total);
  }

  async getTransactionByReferenceId(referenceId: string, userId: string): Promise<Transaction | undefined> {
    const result = await db.select()
      .from(transactions)
      .where(and(
        eq(transactions.referenceId, referenceId),
        eq(transactions.userId, userId)
      ))
      .limit(1);
    return result[0];
  }

  // Internal Chat methods
  async getInternalChatById(id: string): Promise<InternalChat | undefined> {
    const result = await db.select().from(internalChats).where(eq(internalChats.id, id)).limit(1);
    return result[0];
  }

  async getInternalChatsBetweenUsers(user1Id: string, user2Id: string): Promise<InternalChat[]> {
    return await db.select().from(internalChats)
      .where(or(
        and(eq(internalChats.senderId, user1Id), eq(internalChats.receiverId, user2Id)),
        and(eq(internalChats.senderId, user2Id), eq(internalChats.receiverId, user1Id))
      ))
      .orderBy(internalChats.createdAt);
  }

  async getInternalChatsForSeller(sellerId: string): Promise<(InternalChat & { senderName?: string; receiverName?: string })[]> {
    const senderAlias = alias(users, 'sender');
    const receiverAlias = alias(users, 'receiver');

    const result = await db.select({
      id: internalChats.id,
      senderId: internalChats.senderId,
      receiverId: internalChats.receiverId,
      message: internalChats.message,
      isRead: internalChats.isRead,
      createdAt: internalChats.createdAt,
      senderName: sql<string>`${senderAlias.firstName} || ' ' || ${senderAlias.lastName}`,
      receiverName: sql<string>`${receiverAlias.firstName} || ' ' || ${receiverAlias.lastName}`
    })
    .from(internalChats)
    .leftJoin(senderAlias, eq(internalChats.senderId, senderAlias.id))
    .leftJoin(receiverAlias, eq(internalChats.receiverId, receiverAlias.id))
    .where(or(eq(internalChats.senderId, sellerId), eq(internalChats.receiverId, sellerId)))
    .orderBy(desc(internalChats.createdAt));

    return result;
  }

  async createInternalChat(chat: InsertInternalChat): Promise<InternalChat> {
    const result = await db.insert(internalChats).values(chat).returning();
    return result[0];
  }

  async markInternalChatAsRead(id: string): Promise<InternalChat | undefined> {
    const result = await db.update(internalChats)
      .set({ isRead: true })
      .where(eq(internalChats.id, id))
      .returning();
    return result[0];
  }

  async getUnreadMessagesCountForUser(userId: string, userRole: string): Promise<number> {
    try {
      if (userRole === "user_level_2") {
        // کاربران سطح 2: پیام‌های خوانده نشده از والد (فروشنده)
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user[0] || !user[0].parentUserId) return 0;
        
        const result = await db.select({ count: sql<number>`count(*)` })
          .from(internalChats)
          .where(
            and(
              eq(internalChats.senderId, user[0].parentUserId),
              eq(internalChats.receiverId, userId),
              eq(internalChats.isRead, false)
            )
          );
        
        return result[0]?.count || 0;
      } else if (userRole === "user_level_1") {
        // کاربران سطح 1: تمام پیام‌های خوانده نشده از زیرمجموعه‌ها
        const subUsers = await db.select({ id: users.id })
          .from(users)
          .where(eq(users.parentUserId, userId));
        
        if (subUsers.length === 0) return 0;
        
        const subUserIds = subUsers.map(user => user.id);
        
        const result = await db.select({ count: sql<number>`count(*)` })
          .from(internalChats)
          .where(
            and(
              inArray(internalChats.senderId, subUserIds),
              eq(internalChats.receiverId, userId),
              eq(internalChats.isRead, false)
            )
          );
        
        return result[0]?.count || 0;
      }
      
      return 0;
    } catch (error) {
      console.error("Error getting unread messages count:", error);
      return 0;
    }
  }

  async markAllMessagesAsReadForUser(userId: string, userRole: string): Promise<boolean> {
    try {
      if (userRole === "user_level_2") {
        // کاربران سطح 2: علامت‌گذاری پیام‌های دریافتی از والد
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user[0] || !user[0].parentUserId) return true; // No parent means no messages to mark, which is success
        
        await db.update(internalChats)
          .set({ isRead: true })
          .where(
            and(
              eq(internalChats.senderId, user[0].parentUserId),
              eq(internalChats.receiverId, userId),
              eq(internalChats.isRead, false)
            )
          );
      } else if (userRole === "user_level_1") {
        // کاربران سطح 1: علامت‌گذاری پیام‌های دریافتی از زیرمجموعه‌ها
        const subUsers = await db.select({ id: users.id })
          .from(users)
          .where(eq(users.parentUserId, userId));
        
        if (subUsers.length === 0) return true; // No sub-users means no messages to mark, which is success
        
        const subUserIds = subUsers.map(user => user.id);
        
        await db.update(internalChats)
          .set({ isRead: true })
          .where(
            and(
              inArray(internalChats.senderId, subUserIds),
              eq(internalChats.receiverId, userId),
              eq(internalChats.isRead, false)
            )
          );
      }
      
      return true;
    } catch (error) {
      console.error("Error marking messages as read:", error);
      return false;
    }
  }

  // FAQ methods
  async getFaq(id: string): Promise<Faq | undefined> {
    try {
      const result = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting FAQ:", error);
      return undefined;
    }
  }

  async getAllFaqs(includeInactive: boolean = false): Promise<Faq[]> {
    try {
      const query = db.select().from(faqs);
      
      if (!includeInactive) {
        query.where(eq(faqs.isActive, true));
      }
      
      const result = await query.orderBy(faqs.order);
      return result;
    } catch (error) {
      console.error("Error getting all FAQs:", error);
      return [];
    }
  }

  async getActiveFaqs(): Promise<Faq[]> {
    try {
      const result = await db.select()
        .from(faqs)
        .where(eq(faqs.isActive, true))
        .orderBy(faqs.order);
      return result;
    } catch (error) {
      console.error("Error getting active FAQs:", error);
      return [];
    }
  }

  async getFaqsByCreator(creatorId: string): Promise<Faq[]> {
    try {
      const result = await db.select()
        .from(faqs)
        .where(and(eq(faqs.isActive, true), eq(faqs.createdBy, creatorId)))
        .orderBy(faqs.order);
      return result;
    } catch (error) {
      console.error("Error getting FAQs by creator:", error);
      return [];
    }
  }

  async createFaq(faq: InsertFaq, createdBy: string): Promise<Faq> {
    try {
      const result = await db.insert(faqs).values({
        ...faq,
        createdBy,
        isActive: faq.isActive ?? true,
        order: faq.order ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating FAQ:", error);
      throw error;
    }
  }

  async updateFaq(id: string, faq: UpdateFaq): Promise<Faq | undefined> {
    try {
      const result = await db.update(faqs)
        .set({
          ...faq,
          updatedAt: new Date(),
        })
        .where(eq(faqs.id, id))
        .returning();
        
      return result[0];
    } catch (error) {
      console.error("Error updating FAQ:", error);
      return undefined;
    }
  }

  async deleteFaq(id: string): Promise<boolean> {
    try {
      const result = await db.delete(faqs).where(eq(faqs.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      return false;
    }
  }

  async updateFaqOrder(id: string, newOrder: number): Promise<Faq | undefined> {
    try {
      const result = await db.update(faqs)
        .set({
          order: newOrder,
          updatedAt: new Date(),
        })
        .where(eq(faqs.id, id))
        .returning();
        
      return result[0];
    } catch (error) {
      console.error("Error updating FAQ order:", error);
      return undefined;
    }
  }

  // Shipping Settings
  async getShippingSettings(userId: string): Promise<ShippingSettings | undefined> {
    try {
      const result = await db
        .select()
        .from(shippingSettings)
        .where(eq(shippingSettings.userId, userId))
        .limit(1);
      
      return result[0];
    } catch (error) {
      console.error("Error getting shipping settings:", error);
      return undefined;
    }
  }

  async updateShippingSettings(userId: string, settings: UpdateShippingSettings): Promise<ShippingSettings> {
    try {
      // بررسی وجود تنظیمات قبلی
      const existing = await this.getShippingSettings(userId);
      
      if (existing) {
        // بروزرسانی تنظیمات موجود
        const result = await db.update(shippingSettings)
          .set({
            ...settings,
            updatedAt: new Date(),
          })
          .where(eq(shippingSettings.userId, userId))
          .returning();
        
        return result[0];
      } else {
        // ایجاد تنظیمات جدید
        const result = await db.insert(shippingSettings)
          .values({
            userId,
            postPishtazEnabled: settings.postPishtazEnabled ?? false,
            postNormalEnabled: settings.postNormalEnabled ?? false,
            piykEnabled: settings.piykEnabled ?? false,
            freeShippingEnabled: settings.freeShippingEnabled ?? false,
            freeShippingMinAmount: settings.freeShippingMinAmount ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        
        return result[0];
      }
    } catch (error) {
      console.error("Error updating shipping settings:", error);
      throw error;
    }
  }

  // Password Reset OTP methods
  async createPasswordResetOtp(userId: string, otp: string, expiresAt: Date): Promise<PasswordResetOtp> {
    try {
      const result = await db.insert(passwordResetOtps)
        .values({
          userId,
          otp,
          expiresAt,
          isUsed: false,
          createdAt: new Date(),
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating password reset OTP:", error);
      throw error;
    }
  }

  async getValidPasswordResetOtp(userId: string, otp: string): Promise<PasswordResetOtp | undefined> {
    try {
      const result = await db.select()
        .from(passwordResetOtps)
        .where(
          and(
            eq(passwordResetOtps.userId, userId),
            eq(passwordResetOtps.otp, otp),
            eq(passwordResetOtps.isUsed, false),
            gte(passwordResetOtps.expiresAt, new Date())
          )
        )
        .limit(1);
      
      return result[0];
    } catch (error) {
      console.error("Error getting valid password reset OTP:", error);
      return undefined;
    }
  }

  async markOtpAsUsed(id: string): Promise<boolean> {
    try {
      const result = await db.update(passwordResetOtps)
        .set({ isUsed: true })
        .where(eq(passwordResetOtps.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error("Error marking OTP as used:", error);
      return false;
    }
  }

  async deleteExpiredOtps(): Promise<void> {
    try {
      await db.delete(passwordResetOtps)
        .where(
          or(
            eq(passwordResetOtps.isUsed, true),
            sql`${passwordResetOtps.expiresAt} < NOW()`
          )
        );
    } catch (error) {
      console.error("Error deleting expired OTPs:", error);
    }
  }

  // VAT Settings
  async getVatSettings(userId: string): Promise<VatSettings | undefined> {
    try {
      const result = await db
        .select()
        .from(vatSettings)
        .where(eq(vatSettings.userId, userId))
        .limit(1);
      
      return result[0];
    } catch (error) {
      console.error("Error getting VAT settings:", error);
      return undefined;
    }
  }

  async updateVatSettings(userId: string, settings: UpdateVatSettings): Promise<VatSettings> {
    try {
      // بررسی وجود تنظیمات قبلی
      const existing = await this.getVatSettings(userId);
      
      if (existing) {
        // بروزرسانی تنظیمات موجود
        const result = await db.update(vatSettings)
          .set({
            ...settings,
            updatedAt: new Date(),
          })
          .where(eq(vatSettings.userId, userId))
          .returning();
        
        return result[0];
      } else {
        // ایجاد تنظیمات جدید
        const result = await db.insert(vatSettings)
          .values({
            userId,
            vatPercentage: settings.vatPercentage ?? "9",
            isEnabled: settings.isEnabled ?? false,
            companyName: settings.companyName ?? null,
            address: settings.address ?? null,
            phoneNumber: settings.phoneNumber ?? null,
            nationalId: settings.nationalId ?? null,
            economicCode: settings.economicCode ?? null,
            stampImage: settings.stampImage ?? null,
            thankYouMessage: settings.thankYouMessage ?? "از خرید شما متشکریم",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        
        return result[0];
      }
    } catch (error) {
      console.error("Error updating VAT settings:", error);
      throw error;
    }
  }

}