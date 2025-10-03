var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, decimal, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, tickets, subscriptions, products, whatsappSettings, sentMessages, receivedMessages, aiTokenSettings, internalChats, userSubscriptions, categories, carts, cartItems, addresses, orders, orderItems, transactions, faqs, insertUserSchema, insertSubUserSchema, insertTicketSchema, insertSubscriptionSchema, insertProductSchema, insertWhatsappSettingsSchema, insertSentMessageSchema, insertReceivedMessageSchema, insertAiTokenSettingsSchema, insertInternalChatSchema, insertUserSubscriptionSchema, insertCategorySchema, insertCartSchema, insertCartItemSchema, insertAddressSchema, updateAddressSchema, insertOrderSchema, insertOrderItemSchema, insertTransactionSchema, insertFaqSchema, updateFaqSchema, updateCategoryOrderSchema, ticketReplySchema, resetPasswordSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      username: text("username").notNull().unique(),
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      email: text("email").unique(),
      phone: text("phone").notNull(),
      whatsappNumber: text("whatsapp_number"),
      // WhatsApp number for automatic registration
      whatsappToken: text("whatsapp_token"),
      // Individual WhatsApp token for level 1 users
      password: text("password"),
      googleId: text("google_id"),
      role: text("role").notNull().default("user_level_1"),
      // admin, user_level_1, user_level_2
      parentUserId: varchar("parent_user_id"),
      // For hierarchical user management - will add reference later
      profilePicture: text("profile_picture"),
      isWhatsappRegistered: boolean("is_whatsapp_registered").notNull().default(false),
      // Track if user was auto-registered via WhatsApp
      welcomeMessage: text("welcome_message"),
      // Custom welcome message for WhatsApp auto-registration
      createdAt: timestamp("created_at").defaultNow()
    });
    tickets = pgTable("tickets", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      subject: text("subject").notNull(),
      category: text("category").notNull(),
      priority: text("priority").notNull().default("medium"),
      message: text("message").notNull(),
      status: text("status").notNull().default("unread"),
      // unread, read, closed
      attachments: text("attachments").array(),
      adminReply: text("admin_reply"),
      adminReplyAt: timestamp("admin_reply_at"),
      lastResponseAt: timestamp("last_response_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow()
    });
    subscriptions = pgTable("subscriptions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      description: text("description"),
      image: text("image"),
      userLevel: text("user_level").notNull(),
      // user_level_1, user_level_2
      priceBeforeDiscount: decimal("price_before_discount", { precision: 15, scale: 2 }),
      priceAfterDiscount: decimal("price_after_discount", { precision: 15, scale: 2 }),
      duration: text("duration").notNull().default("monthly"),
      // monthly, yearly
      features: text("features").array().default([]),
      isActive: boolean("is_active").notNull().default(true),
      isDefault: boolean("is_default").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    products = pgTable("products", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      name: text("name").notNull(),
      description: text("description"),
      categoryId: varchar("category_id").references(() => categories.id),
      image: text("image"),
      quantity: integer("quantity").notNull().default(0),
      priceBeforeDiscount: decimal("price_before_discount", { precision: 15, scale: 2 }).notNull(),
      priceAfterDiscount: decimal("price_after_discount", { precision: 15, scale: 2 }),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    whatsappSettings = pgTable("whatsapp_settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      token: text("token"),
      isEnabled: boolean("is_enabled").notNull().default(true),
      notifications: text("notifications").array().default([]),
      aiName: text("ai_name").notNull().default("\u0645\u0646 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u0647\u0633\u062A\u0645"),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    sentMessages = pgTable("sent_messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      recipient: text("recipient").notNull(),
      message: text("message").notNull(),
      status: text("status").notNull().default("sent"),
      // sent, delivered, failed
      timestamp: timestamp("timestamp").defaultNow()
    });
    receivedMessages = pgTable("received_messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      whatsiPlusId: text("whatsiplus_id").notNull(),
      // شناسه اصلی از WhatsiPlus
      sender: text("sender").notNull(),
      message: text("message").notNull(),
      status: text("status").notNull().default("\u062E\u0648\u0627\u0646\u062F\u0647 \u0646\u0634\u062F\u0647"),
      // خوانده نشده, خوانده شده
      originalDate: text("original_date"),
      // تاریخ اصلی از WhatsiPlus
      timestamp: timestamp("timestamp").defaultNow()
    }, (table) => ({
      // Composite unique constraint on whatsiplus_id and user_id
      whatsiUserUnique: unique("received_messages_whatsi_user_unique").on(table.whatsiPlusId, table.userId)
    }));
    aiTokenSettings = pgTable("ai_token_settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      token: text("token").notNull(),
      provider: text("provider").notNull().default("openai"),
      // openai, claude, etc
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    internalChats = pgTable("internal_chats", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      senderId: varchar("sender_id").notNull().references(() => users.id),
      receiverId: varchar("receiver_id").notNull().references(() => users.id),
      message: text("message").notNull(),
      isRead: boolean("is_read").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    userSubscriptions = pgTable("user_subscriptions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id),
      status: text("status").notNull().default("active"),
      // active, inactive, expired
      startDate: timestamp("start_date").defaultNow(),
      endDate: timestamp("end_date").notNull(),
      remainingDays: integer("remaining_days").notNull().default(0),
      isTrialPeriod: boolean("is_trial_period").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    categories = pgTable("categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      description: text("description"),
      parentId: varchar("parent_id"),
      createdBy: varchar("created_by").notNull().references(() => users.id),
      order: integer("order").notNull().default(0),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    carts = pgTable("carts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull().default("0"),
      itemCount: integer("item_count").notNull().default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    cartItems = pgTable("cart_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      cartId: varchar("cart_id").notNull().references(() => carts.id),
      productId: varchar("product_id").notNull().references(() => products.id),
      quantity: integer("quantity").notNull().default(1),
      unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
      totalPrice: decimal("total_price", { precision: 15, scale: 2 }).notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    addresses = pgTable("addresses", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      title: text("title").notNull(),
      // عنوان آدرس مثل "منزل" یا "محل کار"
      fullAddress: text("full_address").notNull(),
      // آدرس کامل متنی
      latitude: decimal("latitude", { precision: 10, scale: 7 }),
      // عرض جغرافیایی
      longitude: decimal("longitude", { precision: 10, scale: 7 }),
      // طول جغرافیایی
      postalCode: text("postal_code"),
      isDefault: boolean("is_default").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    orders = pgTable("orders", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      // کاربر سطح 2 که سفارش داده
      sellerId: varchar("seller_id").notNull().references(() => users.id),
      // کاربر سطح 1 که فروشنده است
      addressId: varchar("address_id").references(() => addresses.id),
      // آدرس تحویل
      totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
      status: text("status").notNull().default("awaiting_payment"),
      // awaiting_payment, pending, confirmed, preparing, shipped, delivered, cancelled
      statusHistory: text("status_history").array().default([]),
      // تاریخچه تغییر وضعیت
      orderNumber: text("order_number").notNull().unique(),
      // شماره سفارش منحصر به فرد
      notes: text("notes"),
      // یادداشت‌های کاربر
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    orderItems = pgTable("order_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderId: varchar("order_id").notNull().references(() => orders.id),
      productId: varchar("product_id").notNull().references(() => products.id),
      quantity: integer("quantity").notNull(),
      unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
      totalPrice: decimal("total_price", { precision: 15, scale: 2 }).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    transactions = pgTable("transactions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      orderId: varchar("order_id").references(() => orders.id),
      // اختیاری - ممکن است واریز مستقل باشد
      type: text("type").notNull(),
      // deposit, withdraw, order_payment, commission
      amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
      status: text("status").notNull().default("pending"),
      // pending, completed, failed
      transactionDate: text("transaction_date"),
      // تاریخ انجام تراکنش
      transactionTime: text("transaction_time"),
      // ساعت انجام تراکنش
      accountSource: text("account_source"),
      // از حساب
      paymentMethod: text("payment_method"),
      // cash, card, bank_transfer, etc.
      referenceId: text("reference_id"),
      // شماره پیگیری
      // Parent-child deposit approval fields
      initiatorUserId: varchar("initiator_user_id").references(() => users.id),
      // کاربر فرزند که تراکنش را ایجاد کرده
      parentUserId: varchar("parent_user_id").references(() => users.id),
      // کاربر والد که باید تایید کند
      approvedByUserId: varchar("approved_by_user_id").references(() => users.id),
      // کاربر والد که تایید کرده
      approvedAt: timestamp("approved_at"),
      // زمان تایید
      createdAt: timestamp("created_at").defaultNow()
    });
    faqs = pgTable("faqs", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      question: text("question").notNull(),
      answer: text("answer").notNull(),
      order: integer("order").notNull().default(0),
      isActive: boolean("is_active").notNull().default(true),
      createdBy: varchar("created_by").notNull().references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true
    });
    insertSubUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      email: true,
      // Remove email from required fields
      username: true
      // Remove username from required fields - auto-generated from phone
    }).extend({
      email: z.string().email("\u0627\u06CC\u0645\u06CC\u0644 \u0645\u0639\u062A\u0628\u0631 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F").optional()
      // Make email optional
    });
    insertTicketSchema = createInsertSchema(tickets).omit({
      id: true,
      createdAt: true,
      lastResponseAt: true,
      adminReply: true,
      adminReplyAt: true
    });
    insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
      id: true,
      createdAt: true,
      isDefault: true
      // Prevent clients from setting isDefault
    });
    insertProductSchema = createInsertSchema(products).omit({
      id: true,
      createdAt: true
    }).extend({
      priceBeforeDiscount: z.union([z.string(), z.number()]).transform((val) => String(val)),
      priceAfterDiscount: z.union([z.string(), z.number(), z.null()]).transform((val) => val === null ? null : String(val))
    });
    insertWhatsappSettingsSchema = createInsertSchema(whatsappSettings).omit({
      id: true,
      updatedAt: true
    });
    insertSentMessageSchema = createInsertSchema(sentMessages).omit({
      id: true,
      timestamp: true
    });
    insertReceivedMessageSchema = createInsertSchema(receivedMessages).omit({
      id: true,
      timestamp: true
    });
    insertAiTokenSettingsSchema = createInsertSchema(aiTokenSettings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertInternalChatSchema = createInsertSchema(internalChats).omit({
      id: true,
      createdAt: true
    });
    insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCategorySchema = createInsertSchema(categories).omit({
      id: true,
      createdBy: true,
      // Server controls this field
      createdAt: true,
      updatedAt: true
    });
    insertCartSchema = createInsertSchema(carts).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCartItemSchema = createInsertSchema(cartItems).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      unitPrice: z.union([z.string(), z.number()]).transform((val) => String(val)),
      totalPrice: z.union([z.string(), z.number()]).transform((val) => String(val))
    });
    insertAddressSchema = createInsertSchema(addresses).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    updateAddressSchema = createInsertSchema(addresses).omit({
      id: true,
      userId: true,
      // منع تغییر مالکیت
      createdAt: true,
      updatedAt: true
    }).partial();
    insertOrderSchema = createInsertSchema(orders).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      orderNumber: true
      // Server generates this
    }).extend({
      totalAmount: z.union([z.string(), z.number()]).transform((val) => String(val))
    });
    insertOrderItemSchema = createInsertSchema(orderItems).omit({
      id: true,
      createdAt: true
    }).extend({
      unitPrice: z.union([z.string(), z.number()]).transform((val) => String(val)),
      totalPrice: z.union([z.string(), z.number()]).transform((val) => String(val))
    });
    insertTransactionSchema = createInsertSchema(transactions).omit({
      id: true,
      createdAt: true
    }).extend({
      amount: z.union([z.string(), z.number()]).transform((val) => String(val))
    });
    insertFaqSchema = createInsertSchema(faqs).omit({
      id: true,
      createdBy: true,
      // Server controls this field
      createdAt: true,
      updatedAt: true
    });
    updateFaqSchema = createInsertSchema(faqs).omit({
      id: true,
      createdBy: true,
      // Cannot change creator
      createdAt: true,
      updatedAt: true
    }).partial();
    updateCategoryOrderSchema = z.object({
      categoryId: z.string().uuid(),
      newOrder: z.number().int().min(0),
      newParentId: z.string().uuid().nullable().optional()
    });
    ticketReplySchema = z.object({
      message: z.string().min(1, "\u067E\u06CC\u0627\u0645 \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u062E\u0627\u0644\u06CC \u0628\u0627\u0634\u062F").max(1e3, "\u067E\u06CC\u0627\u0645 \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0628\u06CC\u0634 \u0627\u0632 1000 \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u0628\u0627\u0634\u062F")
    });
    resetPasswordSchema = z.object({
      password: z.string().min(6, "\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u0642\u0644 \u06F6 \u06A9\u0627\u0631\u0627\u06A9\u062A\u0631 \u0628\u0627\u0634\u062F")
    });
  }
});

// server/db-storage.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql as sql2, desc, and, gte, or, inArray, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import bcrypt from "bcryptjs";
var pool, db, DbStorage;
var init_db_storage = __esm({
  "server/db-storage.ts"() {
    "use strict";
    init_schema();
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: false
    });
    db = drizzle(pool);
    DbStorage = class {
      constructor() {
        this.initializeAdminUser();
        this.initializeDefaultSubscription();
        if (process.env.NODE_ENV === "development") {
          this.initializeTestData().catch(console.error);
        }
      }
      async initializeAdminUser() {
        try {
          const existingAdmin = await db.select().from(users).where(eq(users.username, "ehsan")).limit(1);
          if (existingAdmin.length === 0) {
            const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
            if (!process.env.ADMIN_PASSWORD) {
              console.log("\u{1F511} \u06A9\u0627\u0631\u0628\u0631 \u0627\u062F\u0645\u06CC\u0646 \u0627\u06CC\u062C\u0627\u062F \u0634\u062F - \u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC: ehsan");
              console.log("\u{1F511} \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636: admin123");
              console.log("\u26A0\uFE0F  \u0628\u0631\u0627\u06CC \u062A\u063A\u06CC\u06CC\u0631 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631\u060C \u0645\u062A\u063A\u06CC\u0631 ADMIN_PASSWORD \u0631\u0627 \u062A\u0646\u0638\u06CC\u0645 \u06A9\u0646\u06CC\u062F");
            }
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await db.insert(users).values({
              username: "ehsan",
              firstName: "\u0627\u062D\u0633\u0627\u0646",
              lastName: "\u0645\u062F\u06CC\u0631",
              email: "ehsan@admin.com",
              phone: "09123456789",
              password: hashedPassword,
              role: "admin"
            });
          }
        } catch (error) {
          console.error("Error initializing admin user:", error);
        }
      }
      generateRandomPassword() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let password = "";
        for (let i = 0; i < 12; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
      }
      async initializeDefaultSubscription() {
        try {
          const existingSubscription = await db.select().from(subscriptions).where(eq(subscriptions.name, "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0631\u0627\u06CC\u06AF\u0627\u0646")).limit(1);
          if (existingSubscription.length === 0) {
            await db.insert(subscriptions).values({
              name: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0631\u0627\u06CC\u06AF\u0627\u0646",
              description: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u0631\u0627\u06CC\u06AF\u0627\u0646 7 \u0631\u0648\u0632\u0647",
              userLevel: "user_level_1",
              priceBeforeDiscount: "0",
              duration: "monthly",
              features: [
                "\u062F\u0633\u062A\u0631\u0633\u06CC \u067E\u0627\u06CC\u0647 \u0628\u0647 \u0633\u06CC\u0633\u062A\u0645",
                "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0645\u062D\u062F\u0648\u062F",
                "7 \u0631\u0648\u0632 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0631\u0627\u06CC\u06AF\u0627\u0646"
              ],
              isActive: true,
              isDefault: true
            });
          }
        } catch (error) {
          console.error("Error initializing default subscription:", error);
        }
      }
      async initializeTestData() {
        try {
          const existingTestUser = await db.select().from(users).where(eq(users.username, "test_seller")).limit(1);
          let testUser;
          if (existingTestUser.length === 0) {
            const testUserPassword = await bcrypt.hash("test123", 10);
            const [createdUser] = await db.insert(users).values({
              username: "test_seller",
              firstName: "\u0639\u0644\u06CC",
              lastName: "\u0641\u0631\u0648\u0634\u0646\u062F\u0647 \u062A\u0633\u062A\u06CC",
              email: "test@seller.com",
              phone: "09111234567",
              whatsappNumber: "09111234567",
              password: testUserPassword,
              role: "user_level_1"
            }).returning();
            testUser = createdUser;
            console.log("\u{1F511} \u06A9\u0627\u0631\u0628\u0631 \u0633\u0637\u062D 1 \u062A\u0633\u062A\u06CC \u0627\u06CC\u062C\u0627\u062F \u0634\u062F - \u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC: test_seller\u060C \u0631\u0645\u0632 \u0639\u0628\u0648\u0631: test123");
          } else {
            testUser = existingTestUser[0];
          }
          const existingCategories = await db.select().from(categories).where(eq(categories.createdBy, testUser.id));
          let categoryIds = null;
          if (existingCategories.length === 0) {
            const mobileCategories = [
              {
                name: "\u06AF\u0648\u0634\u06CC\u200C\u0647\u0627\u06CC \u0647\u0648\u0634\u0645\u0646\u062F",
                description: "\u0627\u0646\u0648\u0627\u0639 \u06AF\u0648\u0634\u06CC\u200C\u0647\u0627\u06CC \u0647\u0648\u0634\u0645\u0646\u062F \u0627\u0646\u062F\u0631\u0648\u06CC\u062F \u0648 \u0622\u06CC\u0641\u0648\u0646",
                createdBy: testUser.id,
                order: 0
              },
              {
                name: "\u0644\u0648\u0627\u0632\u0645 \u062C\u0627\u0646\u0628\u06CC \u0645\u0648\u0628\u0627\u06CC\u0644",
                description: "\u06A9\u06CC\u0641\u060C \u06A9\u0627\u0648\u0631\u060C \u0645\u062D\u0627\u0641\u0638 \u0635\u0641\u062D\u0647 \u0648 \u0633\u0627\u06CC\u0631 \u0644\u0648\u0627\u0632\u0645 \u062C\u0627\u0646\u0628\u06CC",
                createdBy: testUser.id,
                order: 1
              },
              {
                name: "\u062A\u0628\u0644\u062A \u0648 \u0622\u06CC\u067E\u062F",
                description: "\u0627\u0646\u0648\u0627\u0639 \u062A\u0628\u0644\u062A\u200C\u0647\u0627\u06CC \u0627\u0646\u062F\u0631\u0648\u06CC\u062F \u0648 \u0622\u06CC\u067E\u062F \u0627\u067E\u0644",
                createdBy: testUser.id,
                order: 2
              }
            ];
            const createdCategories = await db.insert(categories).values(mobileCategories).returning();
            console.log("\u{1F4F1} 3 \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u0645\u0648\u0628\u0627\u06CC\u0644 \u062A\u0633\u062A\u06CC \u0627\u06CC\u062C\u0627\u062F \u0634\u062F");
            categoryIds = {
              smartphones: createdCategories[0].id,
              accessories: createdCategories[1].id,
              tablets: createdCategories[2].id
            };
          } else {
            const smartphonesCategory = existingCategories.find((cat) => cat.name === "\u06AF\u0648\u0634\u06CC\u200C\u0647\u0627\u06CC \u0647\u0648\u0634\u0645\u0646\u062F");
            const accessoriesCategory = existingCategories.find((cat) => cat.name === "\u0644\u0648\u0627\u0632\u0645 \u062C\u0627\u0646\u0628\u06CC \u0645\u0648\u0628\u0627\u06CC\u0644");
            const tabletsCategory = existingCategories.find((cat) => cat.name === "\u062A\u0628\u0644\u062A \u0648 \u0622\u06CC\u067E\u062F");
            if (smartphonesCategory && accessoriesCategory && tabletsCategory) {
              categoryIds = {
                smartphones: smartphonesCategory.id,
                accessories: accessoriesCategory.id,
                tablets: tabletsCategory.id
              };
            }
          }
          if (categoryIds) {
            const existingProducts = await db.select().from(products).where(eq(products.userId, testUser.id));
            if (existingProducts.length === 0) {
              const testProducts = [
                {
                  userId: testUser.id,
                  name: "\u0622\u06CC\u0641\u0648\u0646 15 \u067E\u0631\u0648 \u0645\u06A9\u0633",
                  description: "\u06AF\u0648\u0634\u06CC \u0622\u06CC\u0641\u0648\u0646 15 \u067E\u0631\u0648 \u0645\u06A9\u0633 \u0628\u0627 \u0638\u0631\u0641\u06CC\u062A 256 \u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A\u060C \u0631\u0646\u06AF \u0637\u0644\u0627\u06CC\u06CC",
                  categoryId: categoryIds.smartphones,
                  priceBeforeDiscount: "45000000",
                  priceAfterDiscount: "43000000",
                  quantity: 5,
                  image: "/uploads/iphone15-pro-max.png"
                },
                {
                  userId: testUser.id,
                  name: "\u0633\u0627\u0645\u0633\u0648\u0646\u06AF \u06AF\u0644\u06A9\u0633\u06CC S24 \u0627\u0648\u0644\u062A\u0631\u0627",
                  description: "\u06AF\u0648\u0634\u06CC \u0633\u0627\u0645\u0633\u0648\u0646\u06AF \u06AF\u0644\u06A9\u0633\u06CC S24 \u0627\u0648\u0644\u062A\u0631\u0627 \u0628\u0627 \u0638\u0631\u0641\u06CC\u062A 512 \u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A",
                  categoryId: categoryIds.smartphones,
                  priceBeforeDiscount: "35000000",
                  priceAfterDiscount: "33500000",
                  quantity: 8,
                  image: "/uploads/samsung-s24-ultra.png"
                },
                {
                  userId: testUser.id,
                  name: "\u06A9\u0627\u0648\u0631 \u0686\u0631\u0645\u06CC \u0622\u06CC\u0641\u0648\u0646",
                  description: "\u06A9\u0627\u0648\u0631 \u0686\u0631\u0645\u06CC \u0627\u0635\u0644 \u0628\u0631\u0627\u06CC \u0622\u06CC\u0641\u0648\u0646 15 \u0633\u0631\u06CC\u060C \u0631\u0646\u06AF \u0642\u0647\u0648\u0647\u200C\u0627\u06CC",
                  categoryId: categoryIds.accessories,
                  priceBeforeDiscount: "350000",
                  priceAfterDiscount: "299000",
                  quantity: 20,
                  image: "/uploads/iphone-case.png"
                },
                {
                  userId: testUser.id,
                  name: "\u0645\u062D\u0627\u0641\u0638 \u0635\u0641\u062D\u0647 \u0634\u06CC\u0634\u0647\u200C\u0627\u06CC",
                  description: "\u0645\u062D\u0627\u0641\u0638 \u0635\u0641\u062D\u0647 \u0634\u06CC\u0634\u0647\u200C\u0627\u06CC \u0636\u062F \u0636\u0631\u0628\u0647 \u0628\u0631\u0627\u06CC \u0627\u0646\u0648\u0627\u0639 \u06AF\u0648\u0634\u06CC",
                  categoryId: categoryIds.accessories,
                  priceBeforeDiscount: "120000",
                  priceAfterDiscount: "95000",
                  quantity: 50,
                  image: "/uploads/screen-protector.png"
                },
                {
                  userId: testUser.id,
                  name: "\u0622\u06CC\u067E\u062F \u067E\u0631\u0648 12.9 \u0627\u06CC\u0646\u0686",
                  description: "\u062A\u0628\u0644\u062A \u0622\u06CC\u067E\u062F \u067E\u0631\u0648 12.9 \u0627\u06CC\u0646\u0686 \u0646\u0633\u0644 \u067E\u0646\u062C\u0645 \u0628\u0627 \u0686\u06CC\u067E M2",
                  categoryId: categoryIds.tablets,
                  priceBeforeDiscount: "28000000",
                  priceAfterDiscount: "26500000",
                  quantity: 3,
                  image: "/uploads/ipad-pro.png"
                },
                {
                  userId: testUser.id,
                  name: "\u062A\u0628\u0644\u062A \u0633\u0627\u0645\u0633\u0648\u0646\u06AF \u06AF\u0644\u06A9\u0633\u06CC Tab S9",
                  description: "\u062A\u0628\u0644\u062A \u0633\u0627\u0645\u0633\u0648\u0646\u06AF \u06AF\u0644\u06A9\u0633\u06CC Tab S9 \u0628\u0627 \u0635\u0641\u062D\u0647 11 \u0627\u06CC\u0646\u0686",
                  categoryId: categoryIds.tablets,
                  priceBeforeDiscount: "18000000",
                  priceAfterDiscount: "17200000",
                  quantity: 6,
                  image: "/uploads/samsung-tab-s9.png"
                }
              ];
              await db.insert(products).values(testProducts);
              console.log("\u{1F6CD}\uFE0F 6 \u0645\u062D\u0635\u0648\u0644 \u062A\u0633\u062A\u06CC \u0627\u06CC\u062C\u0627\u062F \u0634\u062F");
            }
          }
          console.log("\u2705 \u062A\u0645\u0627\u0645 \u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u062A\u0633\u062A\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0631\u0633\u06CC \u0648 \u0627\u06CC\u062C\u0627\u062F \u0634\u062F\u0646\u062F");
        } catch (error) {
          console.error("Error initializing test data:", error);
        }
      }
      // Users
      async getUser(id) {
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return result[0];
      }
      async getUserByEmail(email) {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return result[0];
      }
      async getUserByUsername(username) {
        const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
        return result[0];
      }
      async getUserByEmailOrUsername(emailOrUsername) {
        const userByEmail = await this.getUserByEmail(emailOrUsername);
        if (userByEmail) return userByEmail;
        const userByUsername = await this.getUserByUsername(emailOrUsername);
        return userByUsername;
      }
      async getUserByGoogleId(googleId) {
        const result = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
        return result[0];
      }
      async createUser(insertUser) {
        const result = await db.insert(users).values(insertUser).returning();
        return result[0];
      }
      async updateUser(id, updates) {
        const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
        return result[0];
      }
      async updateUserPassword(id, hashedPassword) {
        const result = await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id)).returning();
        return result[0];
      }
      async deleteUser(id) {
        const userCarts = await db.select().from(carts).where(eq(carts.userId, id));
        if (userCarts.length > 0) {
          const cartIds = userCarts.map((cart) => cart.id);
          await db.delete(cartItems).where(inArray(cartItems.cartId, cartIds));
        }
        await db.delete(carts).where(eq(carts.userId, id));
        const userOrders = await db.select().from(orders).where(
          or(eq(orders.userId, id), eq(orders.sellerId, id))
        );
        if (userOrders.length > 0) {
          const orderIds = userOrders.map((order) => order.id);
          await db.delete(orderItems).where(inArray(orderItems.orderId, orderIds));
        }
        await db.delete(transactions).where(
          or(
            eq(transactions.userId, id),
            eq(transactions.initiatorUserId, id),
            eq(transactions.parentUserId, id),
            eq(transactions.approvedByUserId, id)
          )
        );
        await db.delete(orders).where(
          or(eq(orders.userId, id), eq(orders.sellerId, id))
        );
        await db.delete(addresses).where(eq(addresses.userId, id));
        await db.delete(internalChats).where(
          or(eq(internalChats.senderId, id), eq(internalChats.receiverId, id))
        );
        await db.delete(sentMessages).where(eq(sentMessages.userId, id));
        await db.delete(receivedMessages).where(eq(receivedMessages.userId, id));
        await db.delete(userSubscriptions).where(eq(userSubscriptions.userId, id));
        await db.delete(tickets).where(eq(tickets.userId, id));
        await db.delete(products).where(eq(products.userId, id));
        await db.delete(categories).where(eq(categories.createdBy, id));
        const result = await db.delete(users).where(eq(users.id, id));
        return result.rowCount > 0;
      }
      async getAllUsers() {
        return await db.select().from(users);
      }
      // Tickets
      async getTicket(id) {
        const result = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
        return result[0];
      }
      async getTicketsByUser(userId) {
        return await db.select().from(tickets).where(eq(tickets.userId, userId));
      }
      async getAllTickets() {
        return await db.select().from(tickets);
      }
      async createTicket(insertTicket) {
        const result = await db.insert(tickets).values(insertTicket).returning();
        return result[0];
      }
      async updateTicket(id, updates) {
        const result = await db.update(tickets).set(updates).where(eq(tickets.id, id)).returning();
        return result[0];
      }
      async deleteTicket(id) {
        const result = await db.delete(tickets).where(eq(tickets.id, id));
        return result.rowCount > 0;
      }
      // Subscriptions
      async getSubscription(id) {
        const result = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
        return result[0];
      }
      async getAllSubscriptions() {
        return await db.select().from(subscriptions);
      }
      async createSubscription(insertSubscription) {
        const result = await db.insert(subscriptions).values(insertSubscription).returning();
        return result[0];
      }
      async updateSubscription(id, updates) {
        const result = await db.update(subscriptions).set(updates).where(eq(subscriptions.id, id)).returning();
        return result[0];
      }
      async deleteSubscription(id) {
        const result = await db.delete(subscriptions).where(eq(subscriptions.id, id));
        return result.rowCount > 0;
      }
      // Products
      async getProduct(id, currentUserId, userRole) {
        const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
        const product = result[0];
        if (!product) return void 0;
        if (userRole === "admin" || userRole === "user_level_1") {
          return product.userId === currentUserId ? product : void 0;
        } else if (userRole === "user_level_2") {
          const productOwner = await db.select().from(users).where(and(eq(users.id, product.userId), eq(users.role, "user_level_1"))).limit(1);
          return productOwner.length > 0 ? product : void 0;
        }
        return void 0;
      }
      async getProductsByUser(userId) {
        return await db.select().from(products).where(eq(products.userId, userId));
      }
      async getAllProducts(currentUserId, userRole) {
        if (!currentUserId || !userRole) {
          throw new Error("User context required for getAllProducts");
        }
        if (userRole === "admin") {
          return await db.select().from(products).where(eq(products.userId, currentUserId));
        } else if (userRole === "user_level_1") {
          return await db.select().from(products).where(eq(products.userId, currentUserId));
        } else if (userRole === "user_level_2") {
          const currentUser = await db.select({ parentUserId: users.parentUserId }).from(users).where(eq(users.id, currentUserId)).limit(1);
          if (currentUser.length === 0 || !currentUser[0].parentUserId) {
            return [];
          }
          return await db.select().from(products).where(eq(products.userId, currentUser[0].parentUserId));
        }
        return [];
      }
      async createProduct(insertProduct) {
        const result = await db.insert(products).values(insertProduct).returning();
        return result[0];
      }
      async updateProduct(id, updates, currentUserId, userRole) {
        if (userRole === "user_level_2") {
          return void 0;
        }
        const product = await this.getProduct(id, currentUserId, userRole);
        if (!product) return void 0;
        const result = await db.update(products).set(updates).where(eq(products.id, id)).returning();
        return result[0];
      }
      async deleteProduct(id, currentUserId, userRole) {
        if (userRole === "user_level_2") {
          return false;
        }
        const product = await this.getProduct(id, currentUserId, userRole);
        if (!product) return false;
        const result = await db.delete(products).where(eq(products.id, id));
        return result.rowCount > 0;
      }
      // WhatsApp Settings
      async getWhatsappSettings() {
        const result = await db.select().from(whatsappSettings).limit(1);
        return result[0];
      }
      async updateWhatsappSettings(settings) {
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
      async getSentMessagesByUser(userId) {
        return await db.select().from(sentMessages).where(eq(sentMessages.userId, userId)).orderBy(desc(sentMessages.timestamp), desc(sentMessages.id));
      }
      async createSentMessage(insertMessage) {
        const result = await db.insert(sentMessages).values(insertMessage).returning();
        return result[0];
      }
      async getReceivedMessagesByUser(userId) {
        return await db.select().from(receivedMessages).where(eq(receivedMessages.userId, userId)).orderBy(desc(receivedMessages.timestamp), desc(receivedMessages.id));
      }
      async getReceivedMessagesByUserPaginated(userId, page, limit) {
        const offset = (page - 1) * limit;
        const countResult = await db.select({ count: sql2`count(*)` }).from(receivedMessages).where(eq(receivedMessages.userId, userId));
        const total = countResult[0].count;
        const totalPages = Math.ceil(total / limit);
        const messages = await db.select().from(receivedMessages).where(eq(receivedMessages.userId, userId)).orderBy(desc(receivedMessages.timestamp), desc(receivedMessages.id)).limit(limit).offset(offset);
        return { messages, total, totalPages };
      }
      async getReceivedMessageByWhatsiPlusId(whatsiPlusId) {
        const result = await db.select().from(receivedMessages).where(eq(receivedMessages.whatsiPlusId, whatsiPlusId)).limit(1);
        return result[0];
      }
      async getReceivedMessageByWhatsiPlusIdAndUser(whatsiPlusId, userId) {
        const result = await db.select().from(receivedMessages).where(and(eq(receivedMessages.whatsiPlusId, whatsiPlusId), eq(receivedMessages.userId, userId))).limit(1);
        return result[0];
      }
      async createReceivedMessage(insertMessage) {
        const result = await db.insert(receivedMessages).values(insertMessage).returning();
        return result[0];
      }
      async updateReceivedMessageStatus(id, status) {
        const result = await db.update(receivedMessages).set({ status }).where(eq(receivedMessages.id, id)).returning();
        return result[0];
      }
      // AI Token Settings
      async getAiTokenSettings() {
        const result = await db.select().from(aiTokenSettings).limit(1);
        return result[0];
      }
      async updateAiTokenSettings(settings) {
        const existing = await this.getAiTokenSettings();
        if (existing) {
          const result = await db.update(aiTokenSettings).set(settings).where(eq(aiTokenSettings.id, existing.id)).returning();
          return result[0];
        } else {
          const result = await db.insert(aiTokenSettings).values(settings).returning();
          return result[0];
        }
      }
      // User Subscriptions
      async getUserSubscription(userId) {
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
          subscriptionDescription: subscriptions.description
        }).from(userSubscriptions).innerJoin(subscriptions, eq(userSubscriptions.subscriptionId, subscriptions.id)).where(and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, "active"),
          gte(userSubscriptions.endDate, /* @__PURE__ */ new Date())
        )).orderBy(desc(userSubscriptions.endDate)).limit(1);
        return result[0];
      }
      async getUserSubscriptionsByUserId(userId) {
        return await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, userId)).orderBy(desc(userSubscriptions.createdAt));
      }
      async getUserSubscriptionById(id) {
        const result = await db.select().from(userSubscriptions).where(eq(userSubscriptions.id, id)).limit(1);
        return result[0];
      }
      async getAllUserSubscriptions() {
        return await db.select().from(userSubscriptions).orderBy(desc(userSubscriptions.createdAt));
      }
      async createUserSubscription(insertUserSubscription) {
        const result = await db.insert(userSubscriptions).values(insertUserSubscription).returning();
        return result[0];
      }
      async updateUserSubscription(id, updates) {
        const result = await db.update(userSubscriptions).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userSubscriptions.id, id)).returning();
        return result[0];
      }
      async deleteUserSubscription(id) {
        const result = await db.delete(userSubscriptions).where(eq(userSubscriptions.id, id));
        return result.rowCount > 0;
      }
      async updateRemainingDays(id, remainingDays) {
        const status = remainingDays <= 0 ? "expired" : "active";
        const result = await db.update(userSubscriptions).set({
          remainingDays,
          status,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(userSubscriptions.id, id)).returning();
        return result[0];
      }
      async getActiveUserSubscriptions() {
        return await db.select().from(userSubscriptions).where(eq(userSubscriptions.status, "active")).orderBy(desc(userSubscriptions.createdAt));
      }
      async getExpiredUserSubscriptions() {
        return await db.select().from(userSubscriptions).where(eq(userSubscriptions.status, "expired")).orderBy(desc(userSubscriptions.createdAt));
      }
      // Categories
      async getCategory(id, currentUserId, userRole) {
        if (userRole === "admin" || userRole === "user_level_1") {
          const result = await db.select().from(categories).where(and(eq(categories.id, id), eq(categories.createdBy, currentUserId))).limit(1);
          return result[0];
        } else if (userRole === "user_level_2") {
          const result = await db.select().from(categories).innerJoin(users, eq(categories.createdBy, users.id)).where(and(eq(categories.id, id), eq(users.role, "user_level_1"))).limit(1);
          return result[0]?.categories;
        }
        return void 0;
      }
      async getAllCategories(currentUserId, userRole) {
        if (!currentUserId || !userRole) {
          throw new Error("User context required for getAllCategories");
        }
        if (userRole === "admin") {
          return await db.select().from(categories).where(eq(categories.createdBy, currentUserId)).orderBy(categories.order);
        } else if (userRole === "user_level_1") {
          return await db.select().from(categories).where(eq(categories.createdBy, currentUserId)).orderBy(categories.order);
        } else if (userRole === "user_level_2") {
          const level1Users = await db.select({ id: users.id }).from(users).where(eq(users.role, "user_level_1"));
          const level1UserIds = level1Users.map((user) => user.id);
          if (level1UserIds.length === 0) {
            return [];
          }
          return await db.select().from(categories).where(sql2`${categories.createdBy} = ANY(${level1UserIds})`).orderBy(categories.order);
        }
        return [];
      }
      async getCategoriesByParent(parentId, currentUserId, userRole) {
        const allCategories = await this.getAllCategories(currentUserId, userRole);
        return allCategories.filter((category) => category.parentId === parentId);
      }
      async getCategoryTree(currentUserId, userRole) {
        const allCategories = await this.getAllCategories(currentUserId, userRole);
        return allCategories.filter((cat) => cat.parentId === null);
      }
      async createCategory(insertCategory, createdBy) {
        const result = await db.insert(categories).values({ ...insertCategory, createdBy }).returning();
        return result[0];
      }
      async updateCategory(id, updates, currentUserId, userRole) {
        const category = await this.getCategory(id, currentUserId, userRole);
        if (!category) return void 0;
        const result = await db.update(categories).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(categories.id, id)).returning();
        return result[0];
      }
      async deleteCategory(id, currentUserId, userRole) {
        const category = await this.getCategory(id, currentUserId, userRole);
        if (!category) return false;
        const result = await db.delete(categories).where(eq(categories.id, id));
        return result.rowCount > 0;
      }
      async reorderCategories(updates) {
        try {
          for (const update of updates) {
            await db.update(categories).set({
              order: update.order,
              parentId: update.parentId !== void 0 ? update.parentId : void 0,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq(categories.id, update.id));
          }
          return true;
        } catch (error) {
          console.error("Error reordering categories:", error);
          return false;
        }
      }
      // Missing methods that were causing LSP errors
      async getUserByWhatsappNumber(whatsappNumber) {
        const result = await db.select().from(users).where(eq(users.whatsappNumber, whatsappNumber)).limit(1);
        return result[0];
      }
      async getSubUsers(parentUserId) {
        return await db.select().from(users).where(eq(users.parentUserId, parentUserId));
      }
      async getUsersVisibleToUser(userId, userRole) {
        if (userRole === "admin") {
          return await db.select().from(users).where(
            or(
              eq(users.role, "admin"),
              eq(users.role, "user_level_1")
            )
          );
        } else if (userRole === "user_level_1") {
          return await db.select().from(users).where(eq(users.parentUserId, userId));
        } else {
          return [];
        }
      }
      // Cart
      async getCart(userId) {
        const result = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
        return result[0];
      }
      async getCartItems(userId) {
        const cart = await this.getCart(userId);
        if (!cart) return [];
        return await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id));
      }
      async getCartItemsWithProducts(userId) {
        const cart = await this.getCart(userId);
        if (!cart) return [];
        const result = await db.select({
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
          productImage: products.image
        }).from(cartItems).innerJoin(products, eq(cartItems.productId, products.id)).where(eq(cartItems.cartId, cart.id));
        return result.map((row) => ({
          id: row.id,
          cartId: row.cartId,
          productId: row.productId,
          quantity: row.quantity,
          unitPrice: row.unitPrice,
          totalPrice: row.totalPrice,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          productName: row.productName,
          productDescription: row.productDescription || void 0,
          productImage: row.productImage || void 0
        }));
      }
      async addToCart(userId, productId, quantity) {
        const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
        if (product.length === 0) {
          throw new Error("\u0645\u062D\u0635\u0648\u0644 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F");
        }
        let cart = await this.getCart(userId);
        if (!cart) {
          const cartResult = await db.insert(carts).values({
            userId,
            totalAmount: "0",
            itemCount: 0
          }).returning();
          cart = cartResult[0];
        }
        const existingItem = await db.select().from(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId))).limit(1);
        const unitPrice = product[0].priceAfterDiscount || product[0].priceBeforeDiscount;
        const totalPrice = (parseFloat(unitPrice) * quantity).toString();
        if (existingItem.length > 0) {
          const newQuantity = existingItem[0].quantity + quantity;
          const newTotalPrice = (parseFloat(unitPrice) * newQuantity).toString();
          const result = await db.update(cartItems).set({
            quantity: newQuantity,
            totalPrice: newTotalPrice,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(cartItems.id, existingItem[0].id)).returning();
          return result[0];
        } else {
          const result = await db.insert(cartItems).values({
            cartId: cart.id,
            productId,
            quantity,
            unitPrice,
            totalPrice
          }).returning();
          return result[0];
        }
      }
      async updateCartItemQuantity(itemId, quantity, userId) {
        const cart = await this.getCart(userId);
        if (!cart) return void 0;
        const item = await db.select().from(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id))).limit(1);
        if (item.length === 0) return void 0;
        const newTotalPrice = (parseFloat(item[0].unitPrice) * quantity).toString();
        const result = await db.update(cartItems).set({
          quantity,
          totalPrice: newTotalPrice,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(cartItems.id, itemId)).returning();
        return result[0];
      }
      async removeFromCart(itemId, userId) {
        const cart = await this.getCart(userId);
        if (!cart) return false;
        const result = await db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));
        return result.rowCount > 0;
      }
      async clearCart(userId) {
        const cart = await this.getCart(userId);
        if (!cart) return false;
        const result = await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
        return result.rowCount >= 0;
      }
      // Addresses
      async getAddress(id) {
        const result = await db.select().from(addresses).where(eq(addresses.id, id)).limit(1);
        return result[0];
      }
      async getAddressesByUser(userId) {
        return await db.select().from(addresses).where(eq(addresses.userId, userId));
      }
      async createAddress(insertAddress) {
        const result = await db.insert(addresses).values(insertAddress).returning();
        return result[0];
      }
      async updateAddress(id, updates, userId) {
        const result = await db.update(addresses).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(addresses.id, id), eq(addresses.userId, userId))).returning();
        return result[0];
      }
      async deleteAddress(id, userId) {
        const result = await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
        return result.rowCount > 0;
      }
      async setDefaultAddress(addressId, userId) {
        await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
        const result = await db.update(addresses).set({ isDefault: true, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
        return result.rowCount > 0;
      }
      // Orders
      async getOrder(id) {
        const sellerUsers = alias(users, "seller_users");
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
          sellerLastName: sellerUsers.lastName
        }).from(orders).leftJoin(addresses, eq(orders.addressId, addresses.id)).leftJoin(users, eq(orders.userId, users.id)).leftJoin(sellerUsers, eq(orders.sellerId, sellerUsers.id)).where(eq(orders.id, id)).limit(1);
        return result[0];
      }
      async getOrdersByUser(userId) {
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
          postalCode: addresses.postalCode
        }).from(orders).leftJoin(addresses, eq(orders.addressId, addresses.id)).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
        return result;
      }
      async getOrdersBySeller(sellerId) {
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
          buyerPhone: users.phone
        }).from(orders).leftJoin(addresses, eq(orders.addressId, addresses.id)).leftJoin(users, eq(orders.userId, users.id)).where(eq(orders.sellerId, sellerId)).orderBy(desc(orders.createdAt));
        return result;
      }
      async createOrder(insertOrder) {
        const orderNumber = this.generateOrderNumber();
        const orderData = {
          ...insertOrder,
          orderNumber
        };
        const result = await db.insert(orders).values(orderData).returning();
        return result[0];
      }
      async updateOrderStatus(id, status, sellerId) {
        const result = await db.update(orders).set({
          status,
          updatedAt: /* @__PURE__ */ new Date(),
          statusHistory: sql2`array_append(status_history, ${status}::text)`
        }).where(and(eq(orders.id, id), eq(orders.sellerId, sellerId))).returning();
        return result[0];
      }
      generateOrderNumber() {
        const timestamp2 = Date.now();
        const random = Math.floor(Math.random() * 1e3).toString().padStart(3, "0");
        return `ORD-${timestamp2}-${random}`;
      }
      async getNewOrdersCount(sellerId) {
        const result = await db.select({ count: sql2`count(*)` }).from(orders).where(and(
          eq(orders.sellerId, sellerId),
          eq(orders.status, "pending")
        ));
        return result[0]?.count || 0;
      }
      async getUnshippedOrdersCount(sellerId) {
        const result = await db.select({ count: sql2`count(*)` }).from(orders).where(and(
          eq(orders.sellerId, sellerId),
          inArray(orders.status, ["pending", "confirmed", "preparing"])
        ));
        return result[0]?.count || 0;
      }
      async getPaidOrdersCount(sellerId) {
        const result = await db.select({ count: sql2`count(*)` }).from(orders).where(and(
          eq(orders.sellerId, sellerId),
          ne(orders.status, "awaiting_payment")
        ));
        return result[0]?.count || 0;
      }
      async getPendingOrdersCount(sellerId) {
        const result = await db.select({ count: sql2`count(*)` }).from(orders).where(and(
          eq(orders.sellerId, sellerId),
          eq(orders.status, "pending")
        ));
        return result[0]?.count || 0;
      }
      async getPendingPaymentOrdersCount(userId) {
        const result = await db.select({ count: sql2`count(*)` }).from(orders).where(and(
          eq(orders.userId, userId),
          eq(orders.status, "awaiting_payment")
        ));
        return result[0]?.count || 0;
      }
      // Order Items
      async getOrderItems(orderId) {
        return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      }
      async getOrderItemsWithProducts(orderId) {
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
          productImage: products.image
        }).from(orderItems).innerJoin(products, eq(orderItems.productId, products.id)).where(eq(orderItems.orderId, orderId));
        return result;
      }
      async createOrderItem(insertOrderItem) {
        const result = await db.insert(orderItems).values(insertOrderItem).returning();
        return result[0];
      }
      // Transactions
      async getTransaction(id) {
        const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
        return result[0];
      }
      async getTransactionsByUser(userId) {
        return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
      }
      async getTransactionsByUserAndType(userId, type) {
        return await db.select().from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.type, type))).orderBy(desc(transactions.createdAt));
      }
      async createTransaction(insertTransaction) {
        const result = await db.insert(transactions).values(insertTransaction).returning();
        return result[0];
      }
      async updateTransactionStatus(id, status) {
        const result = await db.update(transactions).set({ status }).where(eq(transactions.id, id)).returning();
        return result[0];
      }
      async getUserBalance(userId) {
        const result = await db.select({
          balance: sql2`COALESCE(SUM(CASE 
        WHEN type IN ('deposit', 'commission') THEN amount::numeric
        WHEN type IN ('withdraw', 'order_payment') THEN -amount::numeric
        ELSE 0
      END), 0)::numeric`
        }).from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.status, "completed")));
        return Number(result[0].balance);
      }
      async getPendingTransactionsCount(sellerId) {
        const subUsers = await db.select().from(users).where(eq(users.parentUserId, sellerId));
        const subUserIds = subUsers.map((user) => user.id);
        if (subUserIds.length === 0) {
          return 0;
        }
        const result = await db.select({ count: sql2`count(*)` }).from(transactions).where(and(
          eq(transactions.status, "pending"),
          inArray(transactions.userId, subUserIds)
        ));
        return result[0]?.count || 0;
      }
      async getSuccessfulTransactionsBySellers(sellerIds) {
        if (sellerIds.length === 0) return [];
        return await db.select().from(transactions).where(and(
          sql2`user_id = ANY(${sellerIds})`,
          eq(transactions.status, "completed"),
          eq(transactions.type, "commission")
        )).orderBy(desc(transactions.createdAt));
      }
      // Deposit approval methods
      async getDepositsByParent(parentUserId) {
        return await db.select().from(transactions).where(and(
          eq(transactions.type, "deposit"),
          eq(transactions.parentUserId, parentUserId)
        )).orderBy(desc(transactions.createdAt));
      }
      async approveDeposit(transactionId, approvedByUserId) {
        const result = await db.update(transactions).set({
          status: "completed",
          approvedByUserId,
          approvedAt: /* @__PURE__ */ new Date()
        }).where(eq(transactions.id, transactionId)).returning();
        return result[0];
      }
      async getApprovedDepositsTotalByParent(parentUserId) {
        const result = await db.select({
          total: sql2`COALESCE(SUM(amount::numeric), 0)::numeric`
        }).from(transactions).where(and(
          eq(transactions.type, "deposit"),
          eq(transactions.parentUserId, parentUserId),
          eq(transactions.status, "completed"),
          sql2`approved_by_user_id IS NOT NULL`
        ));
        return Number(result[0].total);
      }
      // Internal Chat methods
      async getInternalChatById(id) {
        const result = await db.select().from(internalChats).where(eq(internalChats.id, id)).limit(1);
        return result[0];
      }
      async getInternalChatsBetweenUsers(user1Id, user2Id) {
        return await db.select().from(internalChats).where(or(
          and(eq(internalChats.senderId, user1Id), eq(internalChats.receiverId, user2Id)),
          and(eq(internalChats.senderId, user2Id), eq(internalChats.receiverId, user1Id))
        )).orderBy(internalChats.createdAt);
      }
      async getInternalChatsForSeller(sellerId) {
        const senderAlias = alias(users, "sender");
        const receiverAlias = alias(users, "receiver");
        const result = await db.select({
          id: internalChats.id,
          senderId: internalChats.senderId,
          receiverId: internalChats.receiverId,
          message: internalChats.message,
          isRead: internalChats.isRead,
          createdAt: internalChats.createdAt,
          senderName: sql2`${senderAlias.firstName} || ' ' || ${senderAlias.lastName}`,
          receiverName: sql2`${receiverAlias.firstName} || ' ' || ${receiverAlias.lastName}`
        }).from(internalChats).leftJoin(senderAlias, eq(internalChats.senderId, senderAlias.id)).leftJoin(receiverAlias, eq(internalChats.receiverId, receiverAlias.id)).where(or(eq(internalChats.senderId, sellerId), eq(internalChats.receiverId, sellerId))).orderBy(desc(internalChats.createdAt));
        return result;
      }
      async createInternalChat(chat) {
        const result = await db.insert(internalChats).values(chat).returning();
        return result[0];
      }
      async markInternalChatAsRead(id) {
        const result = await db.update(internalChats).set({ isRead: true }).where(eq(internalChats.id, id)).returning();
        return result[0];
      }
      async getUnreadMessagesCountForUser(userId, userRole) {
        try {
          if (userRole === "user_level_2") {
            const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
            if (!user[0] || !user[0].parentUserId) return 0;
            const result = await db.select({ count: sql2`count(*)` }).from(internalChats).where(
              and(
                eq(internalChats.senderId, user[0].parentUserId),
                eq(internalChats.receiverId, userId),
                eq(internalChats.isRead, false)
              )
            );
            return result[0]?.count || 0;
          } else if (userRole === "user_level_1") {
            const subUsers = await db.select({ id: users.id }).from(users).where(eq(users.parentUserId, userId));
            if (subUsers.length === 0) return 0;
            const subUserIds = subUsers.map((user) => user.id);
            const result = await db.select({ count: sql2`count(*)` }).from(internalChats).where(
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
      async markAllMessagesAsReadForUser(userId, userRole) {
        try {
          if (userRole === "user_level_2") {
            const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
            if (!user[0] || !user[0].parentUserId) return true;
            await db.update(internalChats).set({ isRead: true }).where(
              and(
                eq(internalChats.senderId, user[0].parentUserId),
                eq(internalChats.receiverId, userId),
                eq(internalChats.isRead, false)
              )
            );
          } else if (userRole === "user_level_1") {
            const subUsers = await db.select({ id: users.id }).from(users).where(eq(users.parentUserId, userId));
            if (subUsers.length === 0) return true;
            const subUserIds = subUsers.map((user) => user.id);
            await db.update(internalChats).set({ isRead: true }).where(
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
      async getFaq(id) {
        try {
          const result = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
          return result[0];
        } catch (error) {
          console.error("Error getting FAQ:", error);
          return void 0;
        }
      }
      async getAllFaqs(includeInactive = false) {
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
      async getActiveFaqs() {
        try {
          const result = await db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(faqs.order);
          return result;
        } catch (error) {
          console.error("Error getting active FAQs:", error);
          return [];
        }
      }
      async createFaq(faq, createdBy) {
        try {
          const result = await db.insert(faqs).values({
            ...faq,
            createdBy,
            isActive: faq.isActive ?? true,
            order: faq.order ?? 0,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating FAQ:", error);
          throw error;
        }
      }
      async updateFaq(id, faq) {
        try {
          const result = await db.update(faqs).set({
            ...faq,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(faqs.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error("Error updating FAQ:", error);
          return void 0;
        }
      }
      async deleteFaq(id) {
        try {
          const result = await db.delete(faqs).where(eq(faqs.id, id));
          return (result.rowCount ?? 0) > 0;
        } catch (error) {
          console.error("Error deleting FAQ:", error);
          return false;
        }
      }
      async updateFaqOrder(id, newOrder) {
        try {
          const result = await db.update(faqs).set({
            order: newOrder,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(faqs.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error("Error updating FAQ order:", error);
          return void 0;
        }
      }
    };
  }
});

// server/storage.ts
import { randomUUID } from "crypto";
import bcrypt2 from "bcryptjs";
var MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_db_storage();
    MemStorage = class {
      users;
      tickets;
      subscriptions;
      products;
      whatsappSettings;
      sentMessages;
      receivedMessages;
      aiTokenSettings;
      userSubscriptions;
      categories;
      carts;
      cartItems;
      addresses;
      orders;
      orderItems;
      transactions;
      internalChats;
      faqs;
      constructor() {
        this.users = /* @__PURE__ */ new Map();
        this.tickets = /* @__PURE__ */ new Map();
        this.subscriptions = /* @__PURE__ */ new Map();
        this.products = /* @__PURE__ */ new Map();
        this.whatsappSettings = void 0;
        this.sentMessages = /* @__PURE__ */ new Map();
        this.receivedMessages = /* @__PURE__ */ new Map();
        this.aiTokenSettings = void 0;
        this.userSubscriptions = /* @__PURE__ */ new Map();
        this.categories = /* @__PURE__ */ new Map();
        this.carts = /* @__PURE__ */ new Map();
        this.cartItems = /* @__PURE__ */ new Map();
        this.addresses = /* @__PURE__ */ new Map();
        this.orders = /* @__PURE__ */ new Map();
        this.orderItems = /* @__PURE__ */ new Map();
        this.transactions = /* @__PURE__ */ new Map();
        this.internalChats = /* @__PURE__ */ new Map();
        this.faqs = /* @__PURE__ */ new Map();
        this.initializeAdminUser();
        this.initializeDefaultSubscription();
        this.initializeTestData().catch(console.error);
      }
      async initializeAdminUser() {
        const adminPassword = process.env.ADMIN_PASSWORD || this.generateRandomPassword();
        if (!process.env.ADMIN_PASSWORD) {
          console.log("\u{1F511} Admin password auto-generated. Username: ehsan");
          console.log("\u26A0\uFE0F  Set ADMIN_PASSWORD environment variable for custom password");
          console.log("\u{1F4A1} For development: set NODE_ENV=development to see generated password");
        }
        const hashedPassword = await bcrypt2.hash(adminPassword, 10);
        const adminUser = {
          id: randomUUID(),
          username: "ehsan",
          firstName: "\u0627\u062D\u0633\u0627\u0646",
          lastName: "\u0645\u062F\u06CC\u0631",
          email: "ehsan@admin.com",
          phone: "09123456789",
          whatsappNumber: null,
          whatsappToken: null,
          password: hashedPassword,
          googleId: null,
          role: "admin",
          parentUserId: null,
          profilePicture: null,
          isWhatsappRegistered: false,
          welcomeMessage: null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.users.set(adminUser.id, adminUser);
      }
      generateRandomPassword() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let password = "";
        for (let i = 0; i < 12; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
      }
      async initializeDefaultSubscription() {
        const defaultSubscription = {
          id: randomUUID(),
          name: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0631\u0627\u06CC\u06AF\u0627\u0646",
          description: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u0631\u0627\u06CC\u06AF\u0627\u0646 7 \u0631\u0648\u0632\u0647",
          image: null,
          userLevel: "user_level_1",
          priceBeforeDiscount: "0",
          priceAfterDiscount: null,
          duration: "monthly",
          features: [
            "\u062F\u0633\u062A\u0631\u0633\u06CC \u067E\u0627\u06CC\u0647 \u0628\u0647 \u0633\u06CC\u0633\u062A\u0645",
            "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC \u0645\u062D\u062F\u0648\u062F",
            "7 \u0631\u0648\u0632 \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0631\u0627\u06CC\u06AF\u0627\u0646"
          ],
          isActive: true,
          isDefault: true,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.subscriptions.set(defaultSubscription.id, defaultSubscription);
      }
      async initializeTestData() {
        const testUserPassword = await bcrypt2.hash("test123", 10);
        const testUser = {
          id: randomUUID(),
          username: "test_seller",
          firstName: "\u0639\u0644\u06CC",
          lastName: "\u0641\u0631\u0648\u0634\u0646\u062F\u0647 \u062A\u0633\u062A\u06CC",
          email: "test@seller.com",
          phone: "09111234567",
          whatsappNumber: "09111234567",
          whatsappToken: null,
          password: testUserPassword,
          googleId: null,
          role: "user_level_1",
          parentUserId: null,
          profilePicture: null,
          isWhatsappRegistered: false,
          welcomeMessage: null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.users.set(testUser.id, testUser);
        console.log("\u{1F511} \u06A9\u0627\u0631\u0628\u0631 \u0633\u0637\u062D 1 \u062A\u0633\u062A\u06CC \u0627\u06CC\u062C\u0627\u062F \u0634\u062F - \u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC: test_seller\u060C \u0631\u0645\u0632 \u0639\u0628\u0648\u0631: test123");
        const mobileCategories = [
          {
            name: "\u06AF\u0648\u0634\u06CC\u200C\u0647\u0627\u06CC \u0647\u0648\u0634\u0645\u0646\u062F",
            description: "\u0627\u0646\u0648\u0627\u0639 \u06AF\u0648\u0634\u06CC\u200C\u0647\u0627\u06CC \u0647\u0648\u0634\u0645\u0646\u062F \u0627\u0646\u062F\u0631\u0648\u06CC\u062F \u0648 \u0622\u06CC\u0641\u0648\u0646"
          },
          {
            name: "\u0644\u0648\u0627\u0632\u0645 \u062C\u0627\u0646\u0628\u06CC \u0645\u0648\u0628\u0627\u06CC\u0644",
            description: "\u06A9\u06CC\u0641\u060C \u06A9\u0627\u0648\u0631\u060C \u0645\u062D\u0627\u0641\u0638 \u0635\u0641\u062D\u0647 \u0648 \u0633\u0627\u06CC\u0631 \u0644\u0648\u0627\u0632\u0645 \u062C\u0627\u0646\u0628\u06CC"
          },
          {
            name: "\u062A\u0628\u0644\u062A \u0648 \u0622\u06CC\u067E\u062F",
            description: "\u0627\u0646\u0648\u0627\u0639 \u062A\u0628\u0644\u062A\u200C\u0647\u0627\u06CC \u0627\u0646\u062F\u0631\u0648\u06CC\u062F \u0648 \u0622\u06CC\u067E\u062F \u0627\u067E\u0644"
          }
        ];
        const createdCategories = [];
        for (const categoryData of mobileCategories) {
          const category = {
            id: randomUUID(),
            name: categoryData.name,
            description: categoryData.description,
            parentId: null,
            createdBy: testUser.id,
            order: createdCategories.length,
            isActive: true,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
          this.categories.set(category.id, category);
          createdCategories.push(category);
        }
        console.log("\u{1F4F1} 3 \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u0645\u0648\u0628\u0627\u06CC\u0644 \u062A\u0633\u062A\u06CC \u0627\u06CC\u062C\u0627\u062F \u0634\u062F");
        const testProducts = [
          {
            name: "\u0622\u06CC\u0641\u0648\u0646 15 \u067E\u0631\u0648 \u0645\u06A9\u0633",
            description: "\u06AF\u0648\u0634\u06CC \u0622\u06CC\u0641\u0648\u0646 15 \u067E\u0631\u0648 \u0645\u06A9\u0633 \u0628\u0627 \u0638\u0631\u0641\u06CC\u062A 256 \u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A\u060C \u0631\u0646\u06AF \u0637\u0644\u0627\u06CC\u06CC",
            categoryId: createdCategories[0].id,
            priceBeforeDiscount: "45000000",
            priceAfterDiscount: "43000000",
            quantity: 5,
            image: "/uploads/iphone15-pro-max.png"
          },
          {
            name: "\u0633\u0627\u0645\u0633\u0648\u0646\u06AF \u06AF\u0644\u06A9\u0633\u06CC S24 \u0627\u0648\u0644\u062A\u0631\u0627",
            description: "\u06AF\u0648\u0634\u06CC \u0633\u0627\u0645\u0633\u0648\u0646\u06AF \u06AF\u0644\u06A9\u0633\u06CC S24 \u0627\u0648\u0644\u062A\u0631\u0627 \u0628\u0627 \u0638\u0631\u0641\u06CC\u062A 512 \u06AF\u06CC\u06AF\u0627\u0628\u0627\u06CC\u062A",
            categoryId: createdCategories[0].id,
            priceBeforeDiscount: "35000000",
            priceAfterDiscount: "33500000",
            quantity: 8,
            image: "/uploads/samsung-s24-ultra.png"
          },
          {
            name: "\u06A9\u0627\u0648\u0631 \u0686\u0631\u0645\u06CC \u0622\u06CC\u0641\u0648\u0646",
            description: "\u06A9\u0627\u0648\u0631 \u0686\u0631\u0645\u06CC \u0627\u0635\u0644 \u0628\u0631\u0627\u06CC \u0622\u06CC\u0641\u0648\u0646 15 \u0633\u0631\u06CC\u060C \u0631\u0646\u06AF \u0642\u0647\u0648\u0647\u200C\u0627\u06CC",
            categoryId: createdCategories[1].id,
            priceBeforeDiscount: "350000",
            priceAfterDiscount: "299000",
            quantity: 20,
            image: "/uploads/iphone-case.png"
          },
          {
            name: "\u0645\u062D\u0627\u0641\u0638 \u0635\u0641\u062D\u0647 \u0634\u06CC\u0634\u0647\u200C\u0627\u06CC",
            description: "\u0645\u062D\u0627\u0641\u0638 \u0635\u0641\u062D\u0647 \u0634\u06CC\u0634\u0647\u200C\u0627\u06CC \u0636\u062F \u0636\u0631\u0628\u0647 \u0628\u0631\u0627\u06CC \u0627\u0646\u0648\u0627\u0639 \u06AF\u0648\u0634\u06CC",
            categoryId: createdCategories[1].id,
            priceBeforeDiscount: "120000",
            priceAfterDiscount: "95000",
            quantity: 50,
            image: "/uploads/screen-protector.png"
          },
          {
            name: "\u0622\u06CC\u067E\u062F \u067E\u0631\u0648 12.9 \u0627\u06CC\u0646\u0686",
            description: "\u062A\u0628\u0644\u062A \u0622\u06CC\u067E\u062F \u067E\u0631\u0648 12.9 \u0627\u06CC\u0646\u0686 \u0646\u0633\u0644 \u067E\u0646\u062C\u0645 \u0628\u0627 \u0686\u06CC\u067E M2",
            categoryId: createdCategories[2].id,
            priceBeforeDiscount: "28000000",
            priceAfterDiscount: "26500000",
            quantity: 3,
            image: "/uploads/ipad-pro.png"
          },
          {
            name: "\u062A\u0628\u0644\u062A \u0633\u0627\u0645\u0633\u0648\u0646\u06AF \u06AF\u0644\u06A9\u0633\u06CC Tab S9",
            description: "\u062A\u0628\u0644\u062A \u0633\u0627\u0645\u0633\u0648\u0646\u06AF \u06AF\u0644\u06A9\u0633\u06CC Tab S9 \u0628\u0627 \u0635\u0641\u062D\u0647 11 \u0627\u06CC\u0646\u0686",
            categoryId: createdCategories[2].id,
            priceBeforeDiscount: "18000000",
            priceAfterDiscount: "17200000",
            quantity: 6,
            image: "/uploads/samsung-tab-s9.png"
          }
        ];
        for (const productData of testProducts) {
          const product = {
            id: randomUUID(),
            userId: testUser.id,
            name: productData.name,
            description: productData.description,
            categoryId: productData.categoryId,
            image: productData.image,
            quantity: productData.quantity,
            priceBeforeDiscount: productData.priceBeforeDiscount,
            priceAfterDiscount: productData.priceAfterDiscount,
            isActive: true,
            createdAt: /* @__PURE__ */ new Date()
          };
          this.products.set(product.id, product);
        }
        console.log("\u{1F6CD}\uFE0F 6 \u0645\u062D\u0635\u0648\u0644 \u062A\u0633\u062A\u06CC \u0627\u06CC\u062C\u0627\u062F \u0634\u062F");
        console.log("\u2705 \u062A\u0645\u0627\u0645 \u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u062A\u0633\u062A\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u06CC\u062C\u0627\u062F \u0634\u062F\u0646\u062F");
      }
      // Users
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByEmail(email) {
        return Array.from(this.users.values()).find((user) => user.email === email);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find((user) => user.username === username);
      }
      async getUserByEmailOrUsername(emailOrUsername) {
        const userByEmail = await this.getUserByEmail(emailOrUsername);
        if (userByEmail) return userByEmail;
        const userByUsername = await this.getUserByUsername(emailOrUsername);
        return userByUsername;
      }
      async getUserByGoogleId(googleId) {
        return Array.from(this.users.values()).find((user) => user.googleId === googleId);
      }
      async createUser(insertUser) {
        const id = randomUUID();
        const user = {
          ...insertUser,
          id,
          email: insertUser.email || null,
          role: insertUser.role || "user_level_1",
          password: insertUser.password || null,
          googleId: insertUser.googleId || null,
          profilePicture: insertUser.profilePicture || null,
          whatsappNumber: insertUser.whatsappNumber || null,
          whatsappToken: insertUser.whatsappToken || null,
          parentUserId: insertUser.parentUserId || null,
          isWhatsappRegistered: insertUser.isWhatsappRegistered || false,
          welcomeMessage: insertUser.welcomeMessage || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.users.set(id, user);
        return user;
      }
      async updateUser(id, updates) {
        const user = this.users.get(id);
        if (!user) return void 0;
        const updatedUser = { ...user, ...updates };
        this.users.set(id, updatedUser);
        return updatedUser;
      }
      async updateUserPassword(id, hashedPassword) {
        const user = this.users.get(id);
        if (!user) return void 0;
        const updatedUser = { ...user, password: hashedPassword };
        this.users.set(id, updatedUser);
        return updatedUser;
      }
      async deleteUser(id) {
        return this.users.delete(id);
      }
      async getAllUsers() {
        return Array.from(this.users.values());
      }
      async getUserByWhatsappNumber(whatsappNumber) {
        return Array.from(this.users.values()).find((user) => user.whatsappNumber === whatsappNumber);
      }
      async getSubUsers(parentUserId) {
        return Array.from(this.users.values()).filter((user) => user.parentUserId === parentUserId);
      }
      async getUsersVisibleToUser(userId, userRole) {
        const allUsers = Array.from(this.users.values());
        if (userRole === "admin") {
          return allUsers;
        } else if (userRole === "user_level_1") {
          return allUsers.filter((user) => user.parentUserId === userId);
        } else if (userRole === "user_level_2") {
          return allUsers.filter((user) => user.id === userId);
        }
        return [];
      }
      // Tickets
      async getTicket(id) {
        return this.tickets.get(id);
      }
      async getTicketsByUser(userId) {
        return Array.from(this.tickets.values()).filter((ticket) => ticket.userId === userId);
      }
      async getAllTickets() {
        return Array.from(this.tickets.values());
      }
      async createTicket(insertTicket) {
        const id = randomUUID();
        const ticket = {
          ...insertTicket,
          id,
          priority: insertTicket.priority || "medium",
          attachments: insertTicket.attachments || null,
          status: "unread",
          adminReply: null,
          adminReplyAt: null,
          lastResponseAt: /* @__PURE__ */ new Date(),
          createdAt: /* @__PURE__ */ new Date()
        };
        this.tickets.set(id, ticket);
        return ticket;
      }
      async updateTicket(id, updates) {
        const ticket = this.tickets.get(id);
        if (!ticket) return void 0;
        const updatedTicket = { ...ticket, ...updates };
        this.tickets.set(id, updatedTicket);
        return updatedTicket;
      }
      async deleteTicket(id) {
        return this.tickets.delete(id);
      }
      // Subscriptions
      async getSubscription(id) {
        return this.subscriptions.get(id);
      }
      async getAllSubscriptions() {
        return Array.from(this.subscriptions.values());
      }
      async createSubscription(insertSubscription) {
        const id = randomUUID();
        const subscription = {
          ...insertSubscription,
          id,
          description: insertSubscription.description || null,
          image: insertSubscription.image || null,
          duration: insertSubscription.duration || "monthly",
          priceBeforeDiscount: insertSubscription.priceBeforeDiscount || null,
          priceAfterDiscount: insertSubscription.priceAfterDiscount || null,
          features: insertSubscription.features || null,
          isActive: insertSubscription.isActive !== void 0 ? insertSubscription.isActive : true,
          isDefault: false,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.subscriptions.set(id, subscription);
        return subscription;
      }
      async updateSubscription(id, updates) {
        const subscription = this.subscriptions.get(id);
        if (!subscription) return void 0;
        const updatedSubscription = { ...subscription, ...updates };
        this.subscriptions.set(id, updatedSubscription);
        return updatedSubscription;
      }
      async deleteSubscription(id) {
        return this.subscriptions.delete(id);
      }
      // Products
      async getProduct(id, currentUserId, userRole) {
        const product = this.products.get(id);
        if (!product) return void 0;
        if (userRole === "admin" || userRole === "user_level_1") {
          return product.userId === currentUserId ? product : void 0;
        } else if (userRole === "user_level_2") {
          const productOwner = this.users.get(product.userId);
          return productOwner && productOwner.role === "user_level_1" ? product : void 0;
        }
        return void 0;
      }
      async getProductsByUser(userId) {
        return Array.from(this.products.values()).filter((product) => product.userId === userId);
      }
      async getAllProducts(currentUserId, userRole) {
        if (!currentUserId || !userRole) {
          throw new Error("User context required for getAllProducts");
        }
        const allProducts = Array.from(this.products.values());
        if (userRole === "admin") {
          return allProducts.filter((product) => product.userId === currentUserId);
        } else if (userRole === "user_level_1") {
          return allProducts.filter((product) => product.userId === currentUserId);
        } else if (userRole === "user_level_2") {
          const currentUser = this.users.get(currentUserId);
          if (!currentUser || !currentUser.parentUserId) {
            return [];
          }
          return allProducts.filter((product) => product.userId === currentUser.parentUserId);
        }
        return [];
      }
      async createProduct(insertProduct) {
        const id = randomUUID();
        const product = {
          ...insertProduct,
          id,
          description: insertProduct.description || null,
          image: insertProduct.image || null,
          categoryId: insertProduct.categoryId || null,
          quantity: insertProduct.quantity || 0,
          priceAfterDiscount: insertProduct.priceAfterDiscount || null,
          isActive: insertProduct.isActive !== void 0 ? insertProduct.isActive : true,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.products.set(id, product);
        return product;
      }
      async updateProduct(id, updates, currentUserId, userRole) {
        if (userRole === "user_level_2") {
          return void 0;
        }
        const product = await this.getProduct(id, currentUserId, userRole);
        if (!product) return void 0;
        const updatedProduct = { ...product, ...updates };
        this.products.set(id, updatedProduct);
        return updatedProduct;
      }
      async deleteProduct(id, currentUserId, userRole) {
        if (userRole === "user_level_2") {
          return false;
        }
        const product = await this.getProduct(id, currentUserId, userRole);
        if (!product) return false;
        return this.products.delete(id);
      }
      // WhatsApp Settings
      async getWhatsappSettings() {
        return this.whatsappSettings;
      }
      async updateWhatsappSettings(settings) {
        const whatsappSettings2 = {
          ...settings,
          id: this.whatsappSettings?.id || randomUUID(),
          token: settings.token || null,
          isEnabled: settings.isEnabled || false,
          notifications: settings.notifications || null,
          aiName: settings.aiName || "\u0645\u0646 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u0647\u0633\u062A\u0645",
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.whatsappSettings = whatsappSettings2;
        return whatsappSettings2;
      }
      // Messages
      async getSentMessagesByUser(userId) {
        return Array.from(this.sentMessages.values()).filter((message) => message.userId === userId).sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
      }
      async createSentMessage(insertMessage) {
        const id = randomUUID();
        const message = {
          ...insertMessage,
          id,
          status: insertMessage.status || "sent",
          timestamp: /* @__PURE__ */ new Date()
        };
        this.sentMessages.set(id, message);
        return message;
      }
      async getReceivedMessagesByUser(userId) {
        return Array.from(this.receivedMessages.values()).filter((message) => message.userId === userId);
      }
      async getReceivedMessagesByUserPaginated(userId, page, limit) {
        const allMessages = Array.from(this.receivedMessages.values()).filter((message) => message.userId === userId).sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
        const total = allMessages.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const messages = allMessages.slice(offset, offset + limit);
        return { messages, total, totalPages };
      }
      async getReceivedMessageByWhatsiPlusId(whatsiPlusId) {
        return Array.from(this.receivedMessages.values()).find((message) => message.whatsiPlusId === whatsiPlusId);
      }
      async getReceivedMessageByWhatsiPlusIdAndUser(whatsiPlusId, userId) {
        return Array.from(this.receivedMessages.values()).find(
          (message) => message.whatsiPlusId === whatsiPlusId && message.userId === userId
        );
      }
      async createReceivedMessage(insertMessage) {
        const id = randomUUID();
        const message = {
          ...insertMessage,
          id,
          status: insertMessage.status || "\u062E\u0648\u0627\u0646\u062F\u0647 \u0646\u0634\u062F\u0647",
          originalDate: insertMessage.originalDate || null,
          timestamp: /* @__PURE__ */ new Date()
        };
        this.receivedMessages.set(id, message);
        return message;
      }
      async updateReceivedMessageStatus(id, status) {
        const message = this.receivedMessages.get(id);
        if (!message) return void 0;
        const updatedMessage = { ...message, status };
        this.receivedMessages.set(id, updatedMessage);
        return updatedMessage;
      }
      // AI Token Settings
      async getAiTokenSettings() {
        return this.aiTokenSettings;
      }
      async updateAiTokenSettings(settings) {
        const aiTokenSettings2 = {
          ...settings,
          id: this.aiTokenSettings?.id || randomUUID(),
          provider: settings.provider || "openai",
          isActive: settings.isActive !== void 0 ? settings.isActive : true,
          createdAt: this.aiTokenSettings?.createdAt || /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.aiTokenSettings = aiTokenSettings2;
        return aiTokenSettings2;
      }
      // User Subscriptions
      async getUserSubscription(userId) {
        const userSub = Array.from(this.userSubscriptions.values()).find((sub) => sub.userId === userId && sub.status === "active");
        if (!userSub) return void 0;
        const subscription = this.subscriptions.get(userSub.subscriptionId);
        return {
          ...userSub,
          subscriptionName: subscription?.name,
          subscriptionDescription: subscription?.description
        };
      }
      async getUserSubscriptionsByUserId(userId) {
        return Array.from(this.userSubscriptions.values()).filter((sub) => sub.userId === userId);
      }
      async getUserSubscriptionById(id) {
        return this.userSubscriptions.get(id);
      }
      async getAllUserSubscriptions() {
        return Array.from(this.userSubscriptions.values());
      }
      async createUserSubscription(insertUserSubscription) {
        const id = randomUUID();
        const userSubscription = {
          ...insertUserSubscription,
          id,
          status: insertUserSubscription.status || "active",
          startDate: insertUserSubscription.startDate || /* @__PURE__ */ new Date(),
          remainingDays: insertUserSubscription.remainingDays || 0,
          isTrialPeriod: insertUserSubscription.isTrialPeriod || false,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.userSubscriptions.set(id, userSubscription);
        return userSubscription;
      }
      async updateUserSubscription(id, updates) {
        const userSubscription = this.userSubscriptions.get(id);
        if (!userSubscription) return void 0;
        const updatedUserSubscription = {
          ...userSubscription,
          ...updates,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.userSubscriptions.set(id, updatedUserSubscription);
        return updatedUserSubscription;
      }
      async deleteUserSubscription(id) {
        return this.userSubscriptions.delete(id);
      }
      async updateRemainingDays(id, remainingDays) {
        const userSubscription = this.userSubscriptions.get(id);
        if (!userSubscription) return void 0;
        const status = remainingDays <= 0 ? "expired" : "active";
        const updatedUserSubscription = {
          ...userSubscription,
          remainingDays,
          status,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.userSubscriptions.set(id, updatedUserSubscription);
        return updatedUserSubscription;
      }
      async getActiveUserSubscriptions() {
        return Array.from(this.userSubscriptions.values()).filter((sub) => sub.status === "active");
      }
      async getExpiredUserSubscriptions() {
        return Array.from(this.userSubscriptions.values()).filter((sub) => sub.status === "expired");
      }
      // Categories
      async getCategory(id, currentUserId, userRole) {
        const category = this.categories.get(id);
        if (!category) return void 0;
        if (userRole === "admin" || userRole === "user_level_1") {
          if (category.createdBy !== currentUserId) {
            return void 0;
          }
        } else if (userRole === "user_level_2") {
          const level1Users = Array.from(this.users.values()).filter((user) => user.role === "user_level_1");
          const level1UserIds = level1Users.map((user) => user.id);
          if (!level1UserIds.includes(category.createdBy)) {
            return void 0;
          }
        } else {
          return void 0;
        }
        return category;
      }
      async getAllCategories(currentUserId, userRole) {
        if (!currentUserId || !userRole) {
          throw new Error("User context required for getAllCategories");
        }
        const allCategories = Array.from(this.categories.values());
        let filteredCategories = [];
        if (userRole === "admin") {
          filteredCategories = allCategories.filter((category) => category.createdBy === currentUserId);
        } else if (userRole === "user_level_1") {
          filteredCategories = allCategories.filter((category) => category.createdBy === currentUserId);
        } else if (userRole === "user_level_2") {
          const level1Users = Array.from(this.users.values()).filter((user) => user.role === "user_level_1");
          const level1UserIds = level1Users.map((user) => user.id);
          filteredCategories = allCategories.filter((category) => level1UserIds.includes(category.createdBy));
        }
        return filteredCategories.sort((a, b) => a.order - b.order);
      }
      async getCategoriesByParent(parentId, currentUserId, userRole) {
        const allCategories = await this.getAllCategories(currentUserId, userRole);
        return allCategories.filter((category) => category.parentId === parentId).sort((a, b) => a.order - b.order);
      }
      async getCategoryTree(currentUserId, userRole) {
        const allCategories = await this.getAllCategories(currentUserId, userRole);
        return allCategories.filter((cat) => cat.parentId === null);
      }
      async createCategory(insertCategory, createdBy) {
        const id = randomUUID();
        const category = {
          ...insertCategory,
          id,
          description: insertCategory.description || null,
          parentId: insertCategory.parentId || null,
          order: insertCategory.order || 0,
          isActive: insertCategory.isActive !== void 0 ? insertCategory.isActive : true,
          createdBy,
          // Server provides this field
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.categories.set(id, category);
        return category;
      }
      async updateCategory(id, updates, currentUserId, userRole) {
        const category = await this.getCategory(id, currentUserId, userRole);
        if (!category) return void 0;
        const updatedCategory = {
          ...category,
          ...updates,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.categories.set(id, updatedCategory);
        return updatedCategory;
      }
      async deleteCategory(id, currentUserId, userRole) {
        const category = await this.getCategory(id, currentUserId, userRole);
        if (!category) return false;
        return this.categories.delete(id);
      }
      async reorderCategories(updates) {
        try {
          for (const update of updates) {
            const category = this.categories.get(update.id);
            if (category) {
              const updatedCategory = {
                ...category,
                order: update.order,
                parentId: update.parentId !== void 0 ? update.parentId : category.parentId,
                updatedAt: /* @__PURE__ */ new Date()
              };
              this.categories.set(update.id, updatedCategory);
            }
          }
          return true;
        } catch (error) {
          return false;
        }
      }
      // Cart implementation
      async getCart(userId) {
        return Array.from(this.carts.values()).find((cart) => cart.userId === userId);
      }
      async getCartItems(userId) {
        const cart = await this.getCart(userId);
        if (!cart) return [];
        return Array.from(this.cartItems.values()).filter((item) => item.cartId === cart.id);
      }
      async getCartItemsWithProducts(userId) {
        const cartItems2 = await this.getCartItems(userId);
        return cartItems2.map((item) => {
          const product = this.products.get(item.productId);
          return {
            ...item,
            productName: product?.name || "\u0645\u062D\u0635\u0648\u0644 \u062D\u0630\u0641 \u0634\u062F\u0647",
            productDescription: product?.description || void 0,
            productImage: product?.image || void 0
          };
        });
      }
      async addToCart(userId, productId, quantity) {
        const product = this.products.get(productId);
        if (!product) {
          throw new Error("\u0645\u062D\u0635\u0648\u0644 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F");
        }
        let cart = await this.getCart(userId);
        if (!cart) {
          const cartId = randomUUID();
          cart = {
            id: cartId,
            userId,
            totalAmount: "0",
            itemCount: 0,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
          this.carts.set(cartId, cart);
        }
        const existingItem = Array.from(this.cartItems.values()).find(
          (item) => item.cartId === cart.id && item.productId === productId
        );
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          return await this.updateCartItemQuantity(existingItem.id, newQuantity, userId) || existingItem;
        } else {
          const unitPrice = product.priceAfterDiscount || product.priceBeforeDiscount;
          const totalPrice = parseFloat(unitPrice) * quantity;
          const cartItemId = randomUUID();
          const cartItem = {
            id: cartItemId,
            cartId: cart.id,
            productId,
            quantity,
            unitPrice,
            totalPrice: totalPrice.toString(),
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
          this.cartItems.set(cartItemId, cartItem);
          await this.updateCartTotals(cart.id);
          return cartItem;
        }
      }
      async updateCartItemQuantity(itemId, quantity, userId) {
        const cartItem = this.cartItems.get(itemId);
        if (!cartItem) return void 0;
        const cart = this.carts.get(cartItem.cartId);
        if (!cart || cart.userId !== userId) return void 0;
        if (quantity <= 0) {
          await this.removeFromCart(itemId, userId);
          return void 0;
        }
        const product = this.products.get(cartItem.productId);
        if (!product) return void 0;
        const unitPrice = parseFloat(cartItem.unitPrice);
        const totalPrice = unitPrice * quantity;
        const updatedItem = {
          ...cartItem,
          quantity,
          totalPrice: totalPrice.toString(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.cartItems.set(itemId, updatedItem);
        await this.updateCartTotals(cart.id);
        return updatedItem;
      }
      async removeFromCart(itemId, userId) {
        const cartItem = this.cartItems.get(itemId);
        if (!cartItem) return false;
        const cart = this.carts.get(cartItem.cartId);
        if (!cart || cart.userId !== userId) return false;
        const removed = this.cartItems.delete(itemId);
        if (removed) {
          await this.updateCartTotals(cart.id);
        }
        return removed;
      }
      async clearCart(userId) {
        const cart = await this.getCart(userId);
        if (!cart) return false;
        const cartItems2 = Array.from(this.cartItems.values()).filter((item) => item.cartId === cart.id);
        cartItems2.forEach((item) => this.cartItems.delete(item.id));
        await this.updateCartTotals(cart.id);
        return true;
      }
      async updateCartTotals(cartId) {
        const cart = this.carts.get(cartId);
        if (!cart) return;
        const cartItems2 = Array.from(this.cartItems.values()).filter((item) => item.cartId === cartId);
        const totalAmount = cartItems2.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
        const itemCount = cartItems2.reduce((sum, item) => sum + item.quantity, 0);
        const updatedCart = {
          ...cart,
          totalAmount: totalAmount.toString(),
          itemCount,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.carts.set(cartId, updatedCart);
      }
      // Addresses
      async getAddress(id) {
        return this.addresses.get(id);
      }
      async getAddressesByUser(userId) {
        return Array.from(this.addresses.values()).filter((address) => address.userId === userId);
      }
      async createAddress(insertAddress) {
        const id = randomUUID();
        const userAddresses = await this.getAddressesByUser(insertAddress.userId);
        const isFirstAddress = userAddresses.length === 0;
        const address = {
          ...insertAddress,
          id,
          latitude: insertAddress.latitude || null,
          longitude: insertAddress.longitude || null,
          postalCode: insertAddress.postalCode || null,
          isDefault: insertAddress.isDefault || isFirstAddress,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.addresses.set(id, address);
        return address;
      }
      async updateAddress(id, updates, userId) {
        const address = this.addresses.get(id);
        if (!address || address.userId !== userId) return void 0;
        const updatedAddress = {
          ...address,
          ...updates,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.addresses.set(id, updatedAddress);
        return updatedAddress;
      }
      async deleteAddress(id, userId) {
        const address = this.addresses.get(id);
        if (!address || address.userId !== userId) return false;
        return this.addresses.delete(id);
      }
      async setDefaultAddress(addressId, userId) {
        const address = this.addresses.get(addressId);
        if (!address || address.userId !== userId) return false;
        const userAddresses = await this.getAddressesByUser(userId);
        userAddresses.forEach((addr) => {
          if (addr.isDefault) {
            const updatedAddr = { ...addr, isDefault: false, updatedAt: /* @__PURE__ */ new Date() };
            this.addresses.set(addr.id, updatedAddr);
          }
        });
        const updatedAddress = { ...address, isDefault: true, updatedAt: /* @__PURE__ */ new Date() };
        this.addresses.set(addressId, updatedAddress);
        return true;
      }
      // Orders
      async getOrder(id) {
        return this.orders.get(id);
      }
      async getOrdersByUser(userId) {
        return Array.from(this.orders.values()).filter((order) => order.userId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async getOrdersBySeller(sellerId) {
        return Array.from(this.orders.values()).filter((order) => order.sellerId === sellerId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async createOrder(insertOrder) {
        const id = randomUUID();
        const orderNumber = this.generateOrderNumber();
        const order = {
          ...insertOrder,
          id,
          orderNumber,
          addressId: insertOrder.addressId || null,
          status: "pending",
          statusHistory: ["pending"],
          notes: insertOrder.notes || null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.orders.set(id, order);
        return order;
      }
      async updateOrderStatus(id, status, sellerId) {
        const order = this.orders.get(id);
        if (!order || order.sellerId !== sellerId) return void 0;
        const statusHistory = [...order.statusHistory || [], status];
        const updatedOrder = {
          ...order,
          status,
          statusHistory,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.orders.set(id, updatedOrder);
        return updatedOrder;
      }
      generateOrderNumber() {
        const timestamp2 = Date.now();
        const random = Math.floor(Math.random() * 1e3).toString().padStart(3, "0");
        return `ORD-${timestamp2}-${random}`;
      }
      async getNewOrdersCount(sellerId) {
        const sellerOrders = Array.from(this.orders.values()).filter((order) => order.sellerId === sellerId && order.status === "awaiting_payment");
        return sellerOrders.length;
      }
      async getUnshippedOrdersCount(sellerId) {
        const unpaidAndPendingStatuses = ["awaiting_payment", "pending"];
        const sellerUnpaidAndPendingOrders = Array.from(this.orders.values()).filter((order) => order.sellerId === sellerId && unpaidAndPendingStatuses.includes(order.status));
        return sellerUnpaidAndPendingOrders.length;
      }
      async getPaidOrdersCount(sellerId) {
        const paidOrders = Array.from(this.orders.values()).filter((order) => order.sellerId === sellerId && order.status !== "awaiting_payment");
        return paidOrders.length;
      }
      async getPendingOrdersCount(sellerId) {
        const pendingOrders = Array.from(this.orders.values()).filter((order) => order.sellerId === sellerId && order.status === "pending");
        return pendingOrders.length;
      }
      async getPendingPaymentOrdersCount(userId) {
        const userPendingPaymentOrders = Array.from(this.orders.values()).filter((order) => order.userId === userId && order.status === "awaiting_payment");
        return userPendingPaymentOrders.length;
      }
      // Order Items
      async getOrderItems(orderId) {
        return Array.from(this.orderItems.values()).filter((item) => item.orderId === orderId);
      }
      async getOrderItemsWithProducts(orderId) {
        const orderItems2 = await this.getOrderItems(orderId);
        return orderItems2.map((item) => {
          const product = this.products.get(item.productId);
          return {
            ...item,
            productName: product?.name || "\u0645\u062D\u0635\u0648\u0644 \u062D\u0630\u0641 \u0634\u062F\u0647",
            productDescription: product?.description || void 0,
            productImage: product?.image || void 0
          };
        });
      }
      async createOrderItem(insertOrderItem) {
        const id = randomUUID();
        const orderItem = {
          ...insertOrderItem,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.orderItems.set(id, orderItem);
        return orderItem;
      }
      // Transactions
      async getTransaction(id) {
        return this.transactions.get(id);
      }
      async getTransactionsByUser(userId) {
        return Array.from(this.transactions.values()).filter((transaction) => transaction.userId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async getTransactionsByUserAndType(userId, type) {
        return Array.from(this.transactions.values()).filter((transaction) => transaction.userId === userId && transaction.type === type).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async createTransaction(insertTransaction) {
        const id = randomUUID();
        const transaction = {
          ...insertTransaction,
          id,
          orderId: insertTransaction.orderId || null,
          status: insertTransaction.status || "pending",
          transactionDate: insertTransaction.transactionDate || null,
          transactionTime: insertTransaction.transactionTime || null,
          accountSource: insertTransaction.accountSource || null,
          paymentMethod: insertTransaction.paymentMethod || null,
          referenceId: insertTransaction.referenceId || null,
          // Parent-child deposit approval fields
          initiatorUserId: insertTransaction.initiatorUserId || null,
          parentUserId: insertTransaction.parentUserId || null,
          approvedByUserId: insertTransaction.approvedByUserId || null,
          approvedAt: insertTransaction.approvedAt || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.transactions.set(id, transaction);
        return transaction;
      }
      async updateTransactionStatus(id, status) {
        const transaction = this.transactions.get(id);
        if (!transaction) return void 0;
        const updatedTransaction = {
          ...transaction,
          status
        };
        this.transactions.set(id, updatedTransaction);
        return updatedTransaction;
      }
      async getUserBalance(userId) {
        const transactions2 = await this.getTransactionsByUser(userId);
        const completedTransactions = transactions2.filter((t) => t.status === "completed");
        let balance = 0;
        completedTransactions.forEach((transaction) => {
          const amount = parseFloat(transaction.amount);
          if (transaction.type === "deposit") {
            balance += amount;
          } else if (transaction.type === "withdraw" || transaction.type === "order_payment") {
            balance -= amount;
          }
        });
        return Math.max(balance, 0);
      }
      async getPendingTransactionsCount(sellerId) {
        const subUsers = await this.getSubUsers(sellerId);
        const subUserIds = subUsers.map((user) => user.id);
        return Array.from(this.transactions.values()).filter(
          (transaction) => transaction.status === "pending" && subUserIds.includes(transaction.userId)
        ).length;
      }
      async getSuccessfulTransactionsBySellers(sellerIds) {
        return Array.from(this.transactions.values()).filter(
          (transaction) => transaction.status === "completed" && transaction.type === "order_payment" && transaction.orderId
        ).filter((transaction) => {
          const order = this.orders.get(transaction.orderId);
          return order && sellerIds.includes(order.sellerId);
        }).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      // Deposit approval methods
      async getDepositsByParent(parentUserId) {
        return Array.from(this.transactions.values()).filter(
          (transaction) => transaction.type === "deposit" && transaction.parentUserId === parentUserId
        ).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async approveDeposit(transactionId, approvedByUserId) {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) return void 0;
        const updatedTransaction = {
          ...transaction,
          status: "completed",
          approvedByUserId,
          approvedAt: /* @__PURE__ */ new Date()
        };
        this.transactions.set(transactionId, updatedTransaction);
        return updatedTransaction;
      }
      async getApprovedDepositsTotalByParent(parentUserId) {
        const approvedDeposits = Array.from(this.transactions.values()).filter(
          (transaction) => transaction.type === "deposit" && transaction.parentUserId === parentUserId && transaction.status === "completed" && transaction.approvedByUserId
        );
        return approvedDeposits.reduce((total, transaction) => {
          return total + parseFloat(transaction.amount);
        }, 0);
      }
      // Internal Chat methods
      async getInternalChatById(id) {
        return this.internalChats.get(id);
      }
      async getInternalChatsBetweenUsers(user1Id, user2Id) {
        return Array.from(this.internalChats.values()).filter(
          (chat) => chat.senderId === user1Id && chat.receiverId === user2Id || chat.senderId === user2Id && chat.receiverId === user1Id
        ).sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
      }
      async getInternalChatsForSeller(sellerId) {
        const chats = Array.from(this.internalChats.values()).filter((chat) => chat.senderId === sellerId || chat.receiverId === sellerId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        return chats.map((chat) => {
          const sender = this.users.get(chat.senderId);
          const receiver = this.users.get(chat.receiverId);
          return {
            ...chat,
            senderName: sender ? `${sender.firstName} ${sender.lastName}` : void 0,
            receiverName: receiver ? `${receiver.firstName} ${receiver.lastName}` : void 0
          };
        });
      }
      async createInternalChat(chat) {
        const id = randomUUID();
        const newChat = {
          ...chat,
          id,
          isRead: false,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.internalChats.set(id, newChat);
        return newChat;
      }
      async markInternalChatAsRead(id) {
        const chat = this.internalChats.get(id);
        if (!chat) return void 0;
        const updatedChat = { ...chat, isRead: true };
        this.internalChats.set(id, updatedChat);
        return updatedChat;
      }
      async getUnreadMessagesCountForUser(userId, userRole) {
        if (userRole === "user_level_2") {
          const user = this.users.get(userId);
          if (!user || !user.parentUserId) return 0;
          return Array.from(this.internalChats.values()).filter(
            (chat) => chat.senderId === user.parentUserId && chat.receiverId === userId && !chat.isRead
          ).length;
        } else if (userRole === "user_level_1") {
          const subUsers = Array.from(this.users.values()).filter((user) => user.parentUserId === userId);
          const subUserIds = subUsers.map((user) => user.id);
          return Array.from(this.internalChats.values()).filter(
            (chat) => subUserIds.includes(chat.senderId) && chat.receiverId === userId && !chat.isRead
          ).length;
        }
        return 0;
      }
      async markAllMessagesAsReadForUser(userId, userRole) {
        try {
          if (userRole === "user_level_2") {
            const user = this.users.get(userId);
            if (!user || !user.parentUserId) return true;
            Array.from(this.internalChats.entries()).forEach(([id, chat]) => {
              if (chat.senderId === user.parentUserId && chat.receiverId === userId && !chat.isRead) {
                this.internalChats.set(id, { ...chat, isRead: true });
              }
            });
          } else if (userRole === "user_level_1") {
            const subUsers = Array.from(this.users.values()).filter((user) => user.parentUserId === userId);
            const subUserIds = subUsers.map((user) => user.id);
            Array.from(this.internalChats.entries()).forEach(([id, chat]) => {
              if (subUserIds.includes(chat.senderId) && chat.receiverId === userId && !chat.isRead) {
                this.internalChats.set(id, { ...chat, isRead: true });
              }
            });
          }
          return true;
        } catch (error) {
          console.error("Error marking messages as read:", error);
          return false;
        }
      }
      // FAQ methods
      async getFaq(id) {
        return this.faqs.get(id);
      }
      async getAllFaqs(includeInactive = false) {
        return Array.from(this.faqs.values()).filter((faq) => includeInactive || faq.isActive).sort((a, b) => a.order - b.order);
      }
      async getActiveFaqs() {
        return Array.from(this.faqs.values()).filter((faq) => faq.isActive).sort((a, b) => a.order - b.order);
      }
      async createFaq(faq, createdBy) {
        const id = randomUUID();
        const newFaq = {
          ...faq,
          id,
          createdBy,
          isActive: faq.isActive ?? true,
          order: faq.order ?? 0,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.faqs.set(id, newFaq);
        return newFaq;
      }
      async updateFaq(id, faq) {
        const existingFaq = this.faqs.get(id);
        if (!existingFaq) return void 0;
        const updatedFaq = {
          ...existingFaq,
          ...faq,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.faqs.set(id, updatedFaq);
        return updatedFaq;
      }
      async deleteFaq(id) {
        return this.faqs.delete(id);
      }
      async updateFaqOrder(id, newOrder) {
        const faq = this.faqs.get(id);
        if (!faq) return void 0;
        const updatedFaq = {
          ...faq,
          order: newOrder,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.faqs.set(id, updatedFaq);
        return updatedFaq;
      }
    };
    storage = process.env.NODE_ENV === "test" ? new MemStorage() : new DbStorage();
  }
});

// server/whatsapp-sender.ts
var whatsapp_sender_exports = {};
__export(whatsapp_sender_exports, {
  WhatsAppSender: () => WhatsAppSender,
  whatsAppSender: () => whatsAppSender
});
var WhatsAppSender, whatsAppSender;
var init_whatsapp_sender = __esm({
  "server/whatsapp-sender.ts"() {
    "use strict";
    init_storage();
    WhatsAppSender = class {
      async sendMessage(recipient, message, userId) {
        try {
          const senderUser = await storage.getUser(userId);
          let whatsappToken;
          if (senderUser && senderUser.role === "user_level_1" && senderUser.whatsappToken && senderUser.whatsappToken.trim() !== "") {
            whatsappToken = senderUser.whatsappToken;
            console.log("\u{1F50D} \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u062A\u0648\u06A9\u0646 \u0634\u062E\u0635\u06CC \u06A9\u0627\u0631\u0628\u0631 \u0628\u0631\u0627\u06CC \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645");
          } else {
            const settings = await storage.getWhatsappSettings();
            console.log("\u{1F50D} Debug: \u0628\u0631\u0631\u0633\u06CC \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u0639\u0645\u0648\u0645\u06CC:", {
              hasSettings: !!settings,
              hasToken: !!settings?.token,
              isEnabled: settings?.isEnabled,
              tokenLength: settings?.token?.length || 0
            });
            if (!settings || !settings.token || !settings.isEnabled) {
              if (!settings) {
                console.log("\u26A0\uFE0F \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u0639\u0645\u0648\u0645\u06CC \u0645\u0648\u062C\u0648\u062F \u0646\u06CC\u0633\u062A");
              } else if (!settings.token) {
                console.log("\u26A0\uFE0F \u062A\u0648\u06A9\u0646 \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u0639\u0645\u0648\u0645\u06CC \u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647");
              } else if (!settings.isEnabled) {
                console.log("\u26A0\uFE0F \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u0639\u0645\u0648\u0645\u06CC \u063A\u06CC\u0631\u0641\u0639\u0627\u0644 \u0627\u0633\u062A - isEnabled:", settings.isEnabled);
              }
              console.log("\u26A0\uFE0F \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u0628\u0631\u0627\u06CC \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645 \u0641\u0639\u0627\u0644 \u0646\u06CC\u0633\u062A");
              return false;
            }
            whatsappToken = settings.token;
          }
          if (!whatsappToken) {
            console.log("\u26A0\uFE0F \u0647\u06CC\u0686 \u062A\u0648\u06A9\u0646 \u0645\u0639\u062A\u0628\u0631\u06CC \u0628\u0631\u0627\u06CC \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F");
            return false;
          }
          const sendUrl = `https://api.whatsiplus.com/sendMsg/${whatsappToken}?phonenumber=${recipient}&message=${encodeURIComponent(message)}`;
          console.log(`\u{1F4E4} \u062F\u0631\u062D\u0627\u0644 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645 \u0628\u0647 ${recipient} \u0627\u0632 \u0637\u0631\u06CC\u0642 \u062A\u0648\u06A9\u0646...`);
          const response = await fetch(sendUrl, { method: "GET" });
          if (!response.ok) {
            console.error("\u274C \u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645 \u0648\u0627\u062A\u0633\u200C\u0627\u067E:", response.status, response.statusText);
            return false;
          }
          await storage.createSentMessage({
            userId,
            recipient,
            message,
            status: "sent"
          });
          console.log(`\u{1F4E4} \u067E\u06CC\u0627\u0645 \u0628\u0647 ${recipient} \u0627\u0631\u0633\u0627\u0644 \u0634\u062F: ${message.substring(0, 50)}...`);
          return true;
        } catch (error) {
          console.error("\u274C \u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645 \u0648\u0627\u062A\u0633\u200C\u0627\u067E:", error);
          return false;
        }
      }
    };
    whatsAppSender = new WhatsAppSender();
  }
});

// server/gemini-service.ts
var gemini_service_exports = {};
__export(gemini_service_exports, {
  GeminiService: () => GeminiService,
  geminiService: () => geminiService
});
import { GoogleGenerativeAI } from "@google/generative-ai";
var GeminiService, geminiService;
var init_gemini_service = __esm({
  "server/gemini-service.ts"() {
    "use strict";
    init_storage();
    GeminiService = class {
      genAI = null;
      model = null;
      constructor() {
        this.initialize();
      }
      async initialize() {
        try {
          const tokenSettings = await storage.getAiTokenSettings();
          if (tokenSettings?.token && tokenSettings.isActive) {
            this.genAI = new GoogleGenerativeAI(tokenSettings.token);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            console.log("\u{1F916} \u0633\u0631\u0648\u06CC\u0633 Gemini AI \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC \u0634\u062F");
          } else {
            console.log("\u26A0\uFE0F \u062A\u0648\u06A9\u0646 Gemini AI \u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 \u06CC\u0627 \u063A\u06CC\u0631\u0641\u0639\u0627\u0644 \u0627\u0633\u062A");
          }
        } catch (error) {
          console.error("\u274C \u062E\u0637\u0627 \u062F\u0631 \u0631\u0627\u0647\u200C\u0627\u0646\u062F\u0627\u0632\u06CC Gemini AI:", error);
        }
      }
      async reinitialize() {
        await this.initialize();
      }
      async generateResponse(message, userId) {
        if (!this.model) {
          throw new Error("Gemini AI \u0641\u0639\u0627\u0644 \u0646\u06CC\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u062A\u0648\u06A9\u0646 API \u0631\u0627 \u062A\u0646\u0638\u06CC\u0645 \u06A9\u0646\u06CC\u062F.");
        }
        try {
          let aiName = "\u0645\u0646 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u0647\u0633\u062A\u0645";
          try {
            const whatsappSettings2 = await storage.getWhatsappSettings();
            if (whatsappSettings2?.aiName) {
              aiName = whatsappSettings2.aiName;
            }
          } catch (settingsError) {
            console.error("\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0646\u0627\u0645 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC:", settingsError);
          }
          const normalizeText = (text3) => {
            return text3.normalize("NFKC").replace(/\u200C|\u200F|\u200E/g, "").replace(/[\u064A]/g, "\u06CC").replace(/[\u0643]/g, "\u06A9").replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, "").replace(/[؟?!.،,]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
          };
          const normalizedMessage = normalizeText(message);
          const nameQuestionPatterns = [
            /(اسم(ت| شما)?\s*(چیه|چیست|چی\s*هست))/,
            /(نام(ت| شما)?\s*(چیه|چیست))/,
            /(تو\s*کی(ی|\s*هستی)?)/,
            /(چه\s*اسمی\s*داری)/,
            /(خودت\s*رو\s*معرفی\s*کن)/,
            /(who\s*are\s*you)/,
            /(what'?s\s*your\s*name)/
          ];
          const isNameQuestion = nameQuestionPatterns.some(
            (pattern) => pattern.test(normalizedMessage)
          );
          if (isNameQuestion) {
            return aiName;
          }
          const prompt = `${aiName} \u0648 \u0628\u0647 \u0632\u0628\u0627\u0646 \u0641\u0627\u0631\u0633\u06CC \u067E\u0627\u0633\u062E \u0645\u06CC\u200C\u062F\u0647\u0645. \u0644\u0637\u0641\u0627\u064B \u0628\u0647 \u0627\u06CC\u0646 \u067E\u06CC\u0627\u0645 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F:

${message}

\u067E\u0627\u0633\u062E \u0645\u0646 \u0628\u0627\u06CC\u062F:
- \u0628\u0647 \u0632\u0628\u0627\u0646 \u0641\u0627\u0631\u0633\u06CC \u0628\u0627\u0634\u062F
- \u062D\u062F\u0627\u06A9\u062B\u0631 20 \u06A9\u0644\u0645\u0647 \u0628\u0627\u0634\u062F
- \u0645\u0624\u062F\u0628\u0627\u0646\u0647 \u0648 \u0645\u0633\u062A\u0642\u06CC\u0645 \u0628\u0627\u0634\u062F
- \u0628\u062F\u0648\u0646 \u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u0627\u0636\u0627\u0641\u06CC \u0628\u0627\u0634\u062F`;
          const result = await this.model.generateContent(prompt);
          const response = await result.response;
          const text2 = response.text();
          const finalText = text2.trim() || "\u0645\u062A\u0623\u0633\u0641\u0627\u0646\u0647 \u0646\u062A\u0648\u0627\u0646\u0633\u062A\u0645 \u067E\u0627\u0633\u062E \u0645\u0646\u0627\u0633\u0628\u06CC \u062A\u0648\u0644\u06CC\u062F \u06A9\u0646\u0645.";
          if (finalText.length > 200) {
            return finalText.substring(0, 200) + "...";
          }
          return finalText;
        } catch (error) {
          console.error("\u274C \u062E\u0637\u0627 \u062F\u0631 \u062A\u0648\u0644\u06CC\u062F \u067E\u0627\u0633\u062E Gemini:", error);
          throw new Error("\u062E\u0637\u0627 \u062F\u0631 \u062A\u0648\u0644\u06CC\u062F \u067E\u0627\u0633\u062E \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC");
        }
      }
      isActive() {
        return this.model !== null;
      }
    };
    geminiService = new GeminiService();
  }
});

// server/index.ts
import express3 from "express";

// server/routes.ts
init_storage();
init_schema();
import express from "express";
import { createServer } from "http";
import bcrypt3 from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { z as z2 } from "zod";
import fs from "fs";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var jwtSecret;
if (process.env.JWT_SECRET) {
  jwtSecret = process.env.JWT_SECRET;
} else {
  if (process.env.NODE_ENV === "production") {
    console.error("\u{1F6D1} JWT_SECRET environment variable is required in production!");
    console.error("\u{1F4A1} Set JWT_SECRET to a random 32+ character string");
    process.exit(1);
  } else {
    console.warn("\u{1F527} DEV MODE: Using fixed JWT secret for development - set JWT_SECRET env var for production");
    jwtSecret = "dev_jwt_secret_key_replit_persian_ecommerce_2024_fixed_for_development";
  }
}
var storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});
var upload = multer({
  storage: storage_config,
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("\u0646\u0648\u0639 \u0641\u0627\u06CC\u0644 \u0645\u062C\u0627\u0632 \u0646\u06CC\u0633\u062A"));
    }
  }
});
var authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "\u062A\u0648\u06A9\u0646 \u0627\u062D\u0631\u0627\u0632 \u0647\u0648\u06CC\u062A \u0645\u0648\u0631\u062F \u0646\u06CC\u0627\u0632 \u0627\u0633\u062A" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "\u062A\u0648\u06A9\u0646 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A" });
  }
};
var requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0645\u062F\u06CC\u0631 \u0645\u0648\u0631\u062F \u0646\u06CC\u0627\u0632 \u0627\u0633\u062A" });
  }
  next();
};
var requireAdminOrUserLevel1 = (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "user_level_1") {
    return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0645\u062F\u06CC\u0631 \u06CC\u0627 \u06A9\u0627\u0631\u0628\u0631 \u0633\u0637\u062D \u06F1 \u0645\u0648\u0631\u062F \u0646\u06CC\u0627\u0632 \u0627\u0633\u062A" });
  }
  next();
};
var requireAdminOrLevel1 = (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "user_level_1") {
    return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0645\u062F\u06CC\u0631 \u06CC\u0627 \u06A9\u0627\u0631\u0628\u0631 \u0633\u0637\u062D \u06F1 \u0645\u0648\u0631\u062F \u0646\u06CC\u0627\u0632 \u0627\u0633\u062A" });
  }
  next();
};
var parseConversationThread = (adminReply) => {
  if (!adminReply) return [];
  try {
    const parsed = JSON.parse(adminReply);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [{
      id: `legacy_${Date.now()}`,
      message: adminReply,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      isAdmin: true,
      userName: "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC"
    }];
  } catch {
    return [{
      id: `legacy_${Date.now()}`,
      message: adminReply,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      isAdmin: true,
      userName: "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC"
    }];
  }
};
var addMessageToThread = (existingThread, message, isAdmin, userName) => {
  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message: message.trim(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    isAdmin,
    userName
  };
  return [...existingThread, newMessage];
};
var serializeConversationThread = (thread) => {
  return JSON.stringify(thread);
};
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = {
        ...req.body,
        username: req.body.username || req.body.email.split("@")[0] + Math.random().toString(36).substr(2, 4)
      };
      const validatedData = insertUserSchema.parse(userData);
      if (validatedData.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser) {
          return res.status(400).json({ message: "\u06A9\u0627\u0631\u0628\u0631\u06CC \u0628\u0627 \u0627\u06CC\u0646 \u0627\u06CC\u0645\u06CC\u0644 \u0642\u0628\u0644\u0627\u064B \u062B\u0628\u062A \u0646\u0627\u0645 \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A" });
        }
      }
      const hashedPassword = await bcrypt3.hash(validatedData.password, 10);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
      try {
        let trialSubscription = (await storage.getAllSubscriptions()).find(
          (sub) => sub.isDefault === true
        );
        if (!trialSubscription) {
          console.warn("\u26A0\uFE0F Default subscription not found - this should not happen");
          console.warn("Continuing without creating subscription for user:", user.id);
        } else {
          await storage.createUserSubscription({
            userId: user.id,
            subscriptionId: trialSubscription.id,
            remainingDays: 7,
            startDate: /* @__PURE__ */ new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
            // 7 days from now
            status: "active",
            isTrialPeriod: true
          });
          console.log("\u2705 Created 7-day trial subscription for registered user:", user.id);
        }
      } catch (trialError) {
        console.error("\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u0627\u0634\u062A\u0631\u0627\u06A9 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC:", trialError);
      }
      const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });
      res.json({
        user: { ...user, password: void 0 },
        token
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647 \u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062B\u0628\u062A \u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631" });
    }
  });
  const normalizeDigits = (text2) => {
    return text2.replace(/[۰-۹]/g, (d) => "\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9".indexOf(d).toString()).replace(/[٠-٩]/g, (d) => "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669".indexOf(d).toString()).trim();
  };
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const normalizedIdentifier = normalizeDigits(email || "");
      const normalizedPassword = normalizeDigits(password || "");
      const user = await storage.getUserByEmailOrUsername(normalizedIdentifier);
      if (!user || !user.password) {
        return res.status(401).json({ message: "\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC/\u0627\u06CC\u0645\u06CC\u0644 \u06CC\u0627 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0634\u062A\u0628\u0627\u0647 \u0627\u0633\u062A" });
      }
      const isValidPassword = await bcrypt3.compare(normalizedPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "\u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC/\u0627\u06CC\u0645\u06CC\u0644 \u06CC\u0627 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0634\u062A\u0628\u0627\u0647 \u0627\u0633\u062A" });
      }
      const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });
      res.json({
        user: { ...user, password: void 0 },
        token
      });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0648\u0631\u0648\u062F \u06A9\u0627\u0631\u0628\u0631" });
    }
  });
  app2.get("/api/auth/me", authenticateToken, async (req, res) => {
    res.json({ user: { ...req.user, password: void 0 } });
  });
  app2.get("/api/users", authenticateToken, async (req, res) => {
    try {
      const users2 = await storage.getUsersVisibleToUser(req.user.id, req.user.role);
      const usersWithSubscriptions = await Promise.all(
        users2.map(async (user) => {
          try {
            const userSubscription = await storage.getUserSubscription(user.id);
            let subscriptionInfo = null;
            if (userSubscription) {
              const subscription = await storage.getSubscription(userSubscription.subscriptionId);
              subscriptionInfo = {
                name: subscription?.name || "\u0646\u0627\u0645\u0634\u062E\u0635",
                remainingDays: userSubscription.remainingDays,
                status: userSubscription.status,
                isTrialPeriod: userSubscription.isTrialPeriod
              };
            }
            return {
              ...user,
              password: void 0,
              subscription: subscriptionInfo
            };
          } catch (error) {
            return {
              ...user,
              password: void 0,
              subscription: null
            };
          }
        })
      );
      res.json(usersWithSubscriptions);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u06A9\u0627\u0631\u0628\u0631\u0627\u0646" });
    }
  });
  app2.post("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      if (validatedData.email) {
        const existingEmailUser = await storage.getUserByEmail(validatedData.email);
        if (existingEmailUser) {
          return res.status(400).json({ message: "\u06A9\u0627\u0631\u0628\u0631\u06CC \u0628\u0627 \u0627\u06CC\u0646 \u0627\u06CC\u0645\u06CC\u0644 \u0642\u0628\u0644\u0627\u064B \u062B\u0628\u062A \u0646\u0627\u0645 \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A" });
        }
      }
      const existingUsernameUser = await storage.getUserByUsername(validatedData.username);
      if (existingUsernameUser) {
        return res.status(400).json({ message: "\u06A9\u0627\u0631\u0628\u0631\u06CC \u0628\u0627 \u0627\u06CC\u0646 \u0646\u0627\u0645 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0642\u0628\u0644\u0627\u064B \u062B\u0628\u062A \u0646\u0627\u0645 \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A" });
      }
      const hashedPassword = await bcrypt3.hash(validatedData.password, 10);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
      try {
        let trialSubscription = (await storage.getAllSubscriptions()).find(
          (sub) => sub.isDefault === true
        );
        if (!trialSubscription) {
          console.warn("\u26A0\uFE0F Default subscription not found - this should not happen");
          console.warn("Continuing without creating subscription for user:", user.id);
        } else {
          await storage.createUserSubscription({
            userId: user.id,
            subscriptionId: trialSubscription.id,
            remainingDays: 7,
            startDate: /* @__PURE__ */ new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
            // 7 days from now
            status: "active",
            isTrialPeriod: true
          });
          console.log("\u2705 Created 7-day trial subscription for admin-created user:", user.id);
        }
      } catch (trialError) {
        console.error("\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u0627\u0634\u062A\u0631\u0627\u06A9 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC:", trialError);
      }
      res.json({ ...user, password: void 0 });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647 \u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u06A9\u0627\u0631\u0628\u0631" });
    }
  });
  app2.put("/api/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json({ ...user, password: void 0 });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u06A9\u0627\u0631\u0628\u0631" });
    }
  });
  app2.delete("/api/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      const userSubscriptions2 = await storage.getUserSubscriptionsByUserId(id);
      for (const subscription of userSubscriptions2) {
        await storage.deleteUserSubscription(subscription.id);
      }
      const userTickets = await storage.getTicketsByUser(id);
      for (const ticket of userTickets) {
        await storage.deleteTicket(ticket.id);
      }
      const userProducts = await storage.getProductsByUser(id);
      for (const product of userProducts) {
        await storage.deleteProduct(product.id, id, user.role);
      }
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062D\u0630\u0641 \u06A9\u0627\u0631\u0628\u0631" });
      }
      res.json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u0648 \u062A\u0645\u0627\u0645 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0645\u0631\u0628\u0648\u0637\u0647 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u0634\u062F" });
    } catch (error) {
      console.error("\u062E\u0637\u0627 \u062F\u0631 \u062D\u0630\u0641 \u06A9\u0627\u0631\u0628\u0631:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062D\u0630\u0641 \u06A9\u0627\u0631\u0628\u0631" });
    }
  });
  app2.get("/api/sub-users", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "user_level_1") {
        return res.status(403).json({ message: "\u0641\u0642\u0637 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0633\u0637\u062D \u06F1 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u0646\u062F \u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647\u200C\u0647\u0627 \u0631\u0627 \u0645\u062F\u06CC\u0631\u06CC\u062A \u06A9\u0646\u0646\u062F" });
      }
      const subUsers = await storage.getSubUsers(req.user.id);
      const subUsersWithSubscriptions = await Promise.all(
        subUsers.map(async (user) => {
          try {
            const userSubscription = await storage.getUserSubscription(user.id);
            let subscriptionInfo = null;
            if (userSubscription) {
              const subscription = await storage.getSubscription(userSubscription.subscriptionId);
              subscriptionInfo = {
                name: subscription?.name || "\u0646\u0627\u0645\u0634\u062E\u0635",
                remainingDays: userSubscription.remainingDays,
                status: userSubscription.status,
                isTrialPeriod: userSubscription.isTrialPeriod
              };
            }
            return {
              ...user,
              password: void 0,
              subscription: subscriptionInfo
            };
          } catch (error) {
            return {
              ...user,
              password: void 0,
              subscription: null
            };
          }
        })
      );
      res.json(subUsersWithSubscriptions);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647\u200C\u0647\u0627" });
    }
  });
  app2.post("/api/sub-users", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "user_level_1") {
        return res.status(403).json({ message: "\u0641\u0642\u0637 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0633\u0637\u062D \u06F1 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u0646\u062F \u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647 \u0627\u06CC\u062C\u0627\u062F \u06A9\u0646\u0646\u062F" });
      }
      const validatedData = insertSubUserSchema.parse(req.body);
      const generateUsernameFromPhone = (phone) => {
        if (!phone) throw new Error("\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A");
        let cleanPhone = phone.replace(/\s+/g, "").replace(/[۰-۹]/g, (d) => "\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9".indexOf(d).toString()).replace(/[٠-٩]/g, (d) => "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669".indexOf(d).toString()).replace(/[^0-9]/g, "");
        if (cleanPhone.startsWith("+98")) {
          cleanPhone = cleanPhone.slice(3);
        } else if (cleanPhone.startsWith("0098")) {
          cleanPhone = cleanPhone.slice(4);
        } else if (cleanPhone.startsWith("98") && cleanPhone.length > 10) {
          cleanPhone = cleanPhone.slice(2);
        } else if (cleanPhone.startsWith("0")) {
          return cleanPhone;
        }
        return "0" + cleanPhone;
      };
      const generatedUsername = generateUsernameFromPhone(validatedData.phone);
      const subUserData = {
        ...validatedData,
        username: generatedUsername,
        // Use generated username instead of manual input
        role: "user_level_2",
        parentUserId: req.user.id
      };
      if (subUserData.email) {
        const existingEmailUser = await storage.getUserByEmail(subUserData.email);
        if (existingEmailUser) {
          return res.status(400).json({ message: "\u06A9\u0627\u0631\u0628\u0631\u06CC \u0628\u0627 \u0627\u06CC\u0646 \u0627\u06CC\u0645\u06CC\u0644 \u0642\u0628\u0644\u0627\u064B \u062B\u0628\u062A \u0646\u0627\u0645 \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A" });
        }
      }
      const existingUsernameUser = await storage.getUserByUsername(subUserData.username);
      if (existingUsernameUser) {
        return res.status(400).json({ message: "\u06A9\u0627\u0631\u0628\u0631\u06CC \u0628\u0627 \u0627\u06CC\u0646 \u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u0642\u0628\u0644\u0627\u064B \u062B\u0628\u062A \u0646\u0627\u0645 \u06A9\u0631\u062F\u0647 \u0627\u0633\u062A" });
      }
      const hashedPassword = await bcrypt3.hash(subUserData.password, 10);
      const finalSubUserData = {
        ...subUserData,
        email: subUserData.email || `temp_${Date.now()}@level2.local`,
        password: hashedPassword
      };
      const subUser = await storage.createUser(finalSubUserData);
      try {
        let trialSubscription = (await storage.getAllSubscriptions()).find(
          (sub) => sub.isDefault === true
        );
        if (trialSubscription) {
          await storage.createUserSubscription({
            userId: subUser.id,
            subscriptionId: trialSubscription.id,
            remainingDays: 7,
            startDate: /* @__PURE__ */ new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
            status: "active",
            isTrialPeriod: true
          });
        }
      } catch (trialError) {
        console.error("\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u0627\u0634\u062A\u0631\u0627\u06A9 \u0622\u0632\u0645\u0627\u06CC\u0634\u06CC \u0628\u0631\u0627\u06CC \u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647:", trialError);
      }
      res.json({ ...subUser, password: void 0 });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647 \u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647" });
    }
  });
  app2.put("/api/sub-users/:id", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "user_level_1") {
        return res.status(403).json({ message: "\u0641\u0642\u0637 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0633\u0637\u062D \u06F1 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u0646\u062F \u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647\u200C\u0647\u0627 \u0631\u0627 \u0648\u06CC\u0631\u0627\u06CC\u0634 \u06A9\u0646\u0646\u062F" });
      }
      const { id } = req.params;
      const updates = req.body;
      const existingSubUser = await storage.getUser(id);
      if (!existingSubUser || existingSubUser.parentUserId !== req.user.id) {
        return res.status(404).json({ message: "\u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F \u06CC\u0627 \u0645\u062A\u0639\u0644\u0642 \u0628\u0647 \u0634\u0645\u0627 \u0646\u06CC\u0633\u062A" });
      }
      const { role, parentUserId, ...allowedUpdates } = updates;
      const user = await storage.updateUser(id, allowedUpdates);
      if (!user) {
        return res.status(404).json({ message: "\u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json({ ...user, password: void 0 });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647" });
    }
  });
  app2.delete("/api/sub-users/:id", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "user_level_1") {
        return res.status(403).json({ message: "\u0641\u0642\u0637 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0633\u0637\u062D \u06F1 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u0646\u062F \u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647\u200C\u0647\u0627 \u0631\u0627 \u062D\u0630\u0641 \u06A9\u0646\u0646\u062F" });
      }
      const { id } = req.params;
      const existingSubUser = await storage.getUser(id);
      if (!existingSubUser || existingSubUser.parentUserId !== req.user.id) {
        return res.status(404).json({ message: "\u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F \u06CC\u0627 \u0645\u062A\u0639\u0644\u0642 \u0628\u0647 \u0634\u0645\u0627 \u0646\u06CC\u0633\u062A" });
      }
      const userSubscriptions2 = await storage.getUserSubscriptionsByUserId(id);
      for (const subscription of userSubscriptions2) {
        await storage.deleteUserSubscription(subscription.id);
      }
      const userTickets = await storage.getTicketsByUser(id);
      for (const ticket of userTickets) {
        await storage.deleteTicket(ticket.id);
      }
      const userProducts = await storage.getProductsByUser(id);
      for (const product of userProducts) {
        await storage.deleteProduct(product.id, req.user.id, req.user.role);
      }
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062D\u0630\u0641 \u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647" });
      }
      res.json({ message: "\u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647 \u0648 \u062A\u0645\u0627\u0645 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0645\u0631\u0628\u0648\u0637\u0647 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u0634\u062F" });
    } catch (error) {
      console.error("\u062E\u0637\u0627 \u062F\u0631 \u062D\u0630\u0641 \u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062D\u0630\u0641 \u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647" });
    }
  });
  app2.post("/api/sub-users/:id/reset-password", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "user_level_1") {
        return res.status(403).json({ message: "\u0641\u0642\u0637 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0633\u0637\u062D \u06F1 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u0646\u062F \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647\u200C\u0647\u0627 \u0631\u0627 \u0628\u0627\u0632\u0646\u0634\u0627\u0646\u06CC \u06A9\u0646\u0646\u062F" });
      }
      const { id } = req.params;
      const existingSubUser = await storage.getUser(id);
      if (!existingSubUser || existingSubUser.parentUserId !== req.user.id) {
        return res.status(404).json({ message: "\u0632\u06CC\u0631\u0645\u062C\u0645\u0648\u0639\u0647 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F \u06CC\u0627 \u0645\u062A\u0639\u0644\u0642 \u0628\u0647 \u0634\u0645\u0627 \u0646\u06CC\u0633\u062A" });
      }
      const generateRandomPassword = () => {
        let password = "";
        for (let i = 0; i < 7; i++) {
          password += Math.floor(Math.random() * 10).toString();
        }
        return password;
      };
      const newPassword = generateRandomPassword();
      const hashedPassword = await bcrypt3.hash(newPassword, 10);
      const updatedUser = await storage.updateUserPassword(id, hashedPassword);
      if (!updatedUser) {
        return res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0627\u0632\u0646\u0634\u0627\u0646\u06CC \u0631\u0645\u0632 \u0639\u0628\u0648\u0631" });
      }
      let sentViaWhatsApp = false;
      let whatsappMessage = "";
      try {
        const { whatsAppSender: whatsAppSender2 } = await Promise.resolve().then(() => (init_whatsapp_sender(), whatsapp_sender_exports));
        if (existingSubUser.phone) {
          const message = `\u{1F510} \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u062C\u062F\u06CC\u062F \u0634\u0645\u0627:

${newPassword}

\u0644\u0637\u0641\u0627\u064B \u0627\u06CC\u0646 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0631\u0627 \u062F\u0631 \u0645\u06A9\u0627\u0646 \u0627\u0645\u0646\u06CC \u0646\u06AF\u0647\u062F\u0627\u0631\u06CC \u06A9\u0646\u06CC\u062F \u0648 \u067E\u0633 \u0627\u0632 \u0648\u0631\u0648\u062F \u0627\u0648\u0644 \u0622\u0646 \u0631\u0627 \u062A\u063A\u06CC\u06CC\u0631 \u062F\u0647\u06CC\u062F.`;
          sentViaWhatsApp = await whatsAppSender2.sendMessage(existingSubUser.phone, message, req.user.id);
          whatsappMessage = sentViaWhatsApp ? "\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u0627\u0631\u0633\u0627\u0644 \u0634\u062F" : "\u0627\u0631\u0633\u0627\u0644 \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u0646\u0627\u0645\u0648\u0641\u0642 \u0628\u0648\u062F";
        } else {
          whatsappMessage = "\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u06A9\u0627\u0631\u0628\u0631 \u0645\u0648\u062C\u0648\u062F \u0646\u06CC\u0633\u062A";
        }
      } catch (whatsappError) {
        console.warn("\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0648\u0627\u062A\u0633\u200C\u0627\u067E:", whatsappError);
        whatsappMessage = "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u0648\u0627\u062A\u0633\u200C\u0627\u067E";
      }
      res.json({
        userId: id,
        username: existingSubUser.username,
        newPassword,
        message: sentViaWhatsApp ? "\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u062C\u062F\u06CC\u062F \u062A\u0648\u0644\u06CC\u062F \u0648 \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u0627\u0631\u0633\u0627\u0644 \u0634\u062F" : `\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u062C\u062F\u06CC\u062F \u062A\u0648\u0644\u06CC\u062F \u0634\u062F - ${whatsappMessage}`,
        sentViaWhatsApp,
        whatsappStatus: whatsappMessage
      });
    } catch (error) {
      console.error("\u062E\u0637\u0627 \u062F\u0631 \u0628\u0627\u0632\u0646\u0634\u0627\u0646\u06CC \u0631\u0645\u0632 \u0639\u0628\u0648\u0631:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0627\u0632\u0646\u0634\u0627\u0646\u06CC \u0631\u0645\u0632 \u0639\u0628\u0648\u0631" });
    }
  });
  app2.put("/api/profile", authenticateToken, async (req, res) => {
    try {
      const { firstName, lastName } = req.body;
      const user = await storage.updateUser(req.user.id, { firstName, lastName });
      res.json({ ...user, password: void 0 });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u067E\u0631\u0648\u0641\u0627\u06CC\u0644" });
    }
  });
  app2.post("/api/profile/picture", authenticateToken, upload.single("profilePicture"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "\u0641\u0627\u06CC\u0644 \u062A\u0635\u0648\u06CC\u0631 \u0645\u0648\u0631\u062F \u0646\u06CC\u0627\u0632 \u0627\u0633\u062A" });
      }
      const profilePicture = `/uploads/${req.file.filename}`;
      const user = await storage.updateUser(req.user.id, { profilePicture });
      res.json({ ...user, password: void 0 });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0622\u067E\u0644\u0648\u062F \u062A\u0635\u0648\u06CC\u0631 \u067E\u0631\u0648\u0641\u0627\u06CC\u0644" });
    }
  });
  app2.get("/api/tickets", authenticateToken, async (req, res) => {
    try {
      let tickets2;
      if (req.user.role === "admin") {
        tickets2 = await storage.getAllTickets();
      } else {
        tickets2 = await storage.getTicketsByUser(req.user.id);
      }
      res.json(tickets2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u06CC\u06A9\u062A \u0647\u0627" });
    }
  });
  app2.post("/api/tickets", authenticateToken, upload.array("attachments", 5), async (req, res) => {
    try {
      const validatedData = insertTicketSchema.parse({
        ...req.body,
        userId: req.user.id,
        attachments: req.files ? req.files.map((file) => `/uploads/${file.filename}`) : []
      });
      const ticket = await storage.createTicket(validatedData);
      res.json(ticket);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647 \u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u062A\u06CC\u06A9\u062A" });
    }
  });
  app2.put("/api/tickets/:id/reply", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = ticketReplySchema.parse({
        message: req.body.adminReply || req.body.message
      });
      const { message } = validatedData;
      const ticket = await storage.getTicket(id);
      if (!ticket) {
        return res.status(404).json({ message: "\u062A\u06CC\u06A9\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      const existingThread = parseConversationThread(ticket.adminReply);
      const updatedThread = addMessageToThread(existingThread, message, true, "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC");
      const serializedThread = serializeConversationThread(updatedThread);
      const updatedTicket = await storage.updateTicket(id, {
        adminReply: serializedThread,
        adminReplyAt: /* @__PURE__ */ new Date(),
        status: "read",
        lastResponseAt: /* @__PURE__ */ new Date()
      });
      if (!updatedTicket) {
        return res.status(404).json({ message: "\u062A\u06CC\u06A9\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json(updatedTicket);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647 \u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u067E\u0627\u0633\u062E \u0628\u0647 \u062A\u06CC\u06A9\u062A" });
    }
  });
  app2.delete("/api/tickets/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTicket(id);
      if (!success) {
        return res.status(404).json({ message: "\u062A\u06CC\u06A9\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json({ message: "\u062A\u06CC\u06A9\u062A \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u0634\u062F" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062D\u0630\u0641 \u062A\u06CC\u06A9\u062A" });
    }
  });
  app2.get("/api/my-tickets", authenticateToken, async (req, res) => {
    try {
      const tickets2 = await storage.getTicketsByUser(req.user.id);
      const ticketsWithResponses = tickets2.map((ticket) => ({
        ...ticket,
        responses: parseConversationThread(ticket.adminReply)
      }));
      res.json(ticketsWithResponses);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u06CC\u06A9\u062A\u200C\u0647\u0627" });
    }
  });
  app2.post("/api/tickets/:id/reply", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = ticketReplySchema.parse(req.body);
      const { message } = validatedData;
      const ticket = await storage.getTicket(id);
      if (!ticket) {
        return res.status(404).json({ message: "\u062A\u06CC\u06A9\u062A \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      if (req.user.role !== "admin" && ticket.userId !== req.user.id) {
        return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u0627\u06CC\u0646 \u062A\u06CC\u06A9\u062A \u0646\u062F\u0627\u0631\u06CC\u062F" });
      }
      const existingThread = parseConversationThread(ticket.adminReply);
      const isAdmin = req.user.role === "admin";
      const userName = isAdmin ? "\u067E\u0634\u062A\u06CC\u0628\u0627\u0646\u06CC" : `${req.user.firstName} ${req.user.lastName}`;
      const updatedThread = addMessageToThread(existingThread, message, isAdmin, userName);
      const serializedThread = serializeConversationThread(updatedThread);
      const updatedTicket = await storage.updateTicket(id, {
        adminReply: serializedThread,
        adminReplyAt: /* @__PURE__ */ new Date(),
        status: "read",
        lastResponseAt: /* @__PURE__ */ new Date()
      });
      res.json(updatedTicket);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647 \u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u0627\u0633\u062E" });
    }
  });
  app2.get("/api/subscriptions", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const subscriptions2 = await storage.getAllSubscriptions();
      res.json(subscriptions2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u0634\u062A\u0631\u0627\u06A9 \u0647\u0627" });
    }
  });
  app2.post("/api/subscriptions", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertSubscriptionSchema.parse(req.body);
      const safeData = { ...validatedData, isDefault: false };
      const subscription = await storage.createSubscription(safeData);
      res.json(subscription);
    } catch (error) {
      console.error("\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u0627\u0634\u062A\u0631\u0627\u06A9:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647 \u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u0627\u0634\u062A\u0631\u0627\u06A9" });
    }
  });
  app2.put("/api/subscriptions/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const currentSubscription = await storage.getSubscription(id);
      if (!currentSubscription) {
        return res.status(404).json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      if (currentSubscription.isDefault) {
        return res.status(400).json({
          message: "\u0627\u0645\u06A9\u0627\u0646 \u062A\u063A\u06CC\u06CC\u0631 \u0627\u0634\u062A\u0631\u0627\u06A9 \u067E\u06CC\u0634 \u0641\u0631\u0636 \u0631\u0627\u06CC\u06AF\u0627\u0646 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F"
        });
      } else {
        if (updates.isDefault === true) {
          return res.status(400).json({
            message: "\u062A\u0646\u0647\u0627 \u06CC\u06A9 \u0627\u0634\u062A\u0631\u0627\u06A9 \u067E\u06CC\u0634 \u0641\u0631\u0636 \u0645\u06CC \u062A\u0648\u0627\u0646\u062F \u0648\u062C\u0648\u062F \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F"
          });
        }
      }
      const subscription = await storage.updateSubscription(id, updates);
      if (!subscription) {
        return res.status(404).json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json(subscription);
    } catch (error) {
      console.error("\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0627\u0634\u062A\u0631\u0627\u06A9:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0627\u0634\u062A\u0631\u0627\u06A9" });
    }
  });
  app2.delete("/api/subscriptions/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      if (subscription.isDefault) {
        return res.status(400).json({
          message: "\u0627\u0645\u06A9\u0627\u0646 \u062D\u0630\u0641 \u0627\u0634\u062A\u0631\u0627\u06A9 \u067E\u06CC\u0634 \u0641\u0631\u0636 \u0631\u0627\u06CC\u06AF\u0627\u0646 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F"
        });
      }
      const success = await storage.deleteSubscription(id);
      if (!success) {
        return res.status(404).json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u0634\u062F" });
    } catch (error) {
      console.error("Error deleting subscription:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062D\u0630\u0641 \u0627\u0634\u062A\u0631\u0627\u06A9" });
    }
  });
  app2.get("/api/ai-token", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getAiTokenSettings();
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u0648\u06A9\u0646 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC" });
    }
  });
  app2.post("/api/ai-token", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertAiTokenSettingsSchema.parse(req.body);
      const settings = await storage.updateAiTokenSettings(validatedData);
      const { geminiService: geminiService2 } = await Promise.resolve().then(() => (init_gemini_service(), gemini_service_exports));
      await geminiService2.reinitialize();
      res.json(settings);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647 \u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0630\u062E\u06CC\u0631\u0647 \u062A\u0648\u06A9\u0646 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC" });
    }
  });
  app2.get("/api/products", authenticateToken, async (req, res) => {
    try {
      const products2 = await storage.getAllProducts(req.user.id, req.user.role);
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0645\u062D\u0635\u0648\u0644\u0627\u062A" });
    }
  });
  app2.get("/api/products/shop", authenticateToken, async (req, res) => {
    try {
      if (req.user?.role !== "user_level_2") {
        return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0645\u062D\u062F\u0648\u062F - \u0627\u06CC\u0646 \u0639\u0645\u0644\u06CC\u0627\u062A \u0645\u062E\u0635\u0648\u0635 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0633\u0637\u062D \u06F2 \u0627\u0633\u062A" });
      }
      const products2 = await storage.getAllProducts(req.user.id, req.user.role);
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0645\u062D\u0635\u0648\u0644\u0627\u062A \u0641\u0631\u0648\u0634\u06AF\u0627\u0647" });
    }
  });
  app2.post("/api/products", authenticateToken, upload.single("productImage"), async (req, res) => {
    try {
      let imageData = null;
      if (req.file) {
        imageData = `/uploads/${req.file.filename}`;
      }
      if (req.body.categoryId) {
        console.log(`\u{1F50D} DEBUG CREATE: Checking category ${req.body.categoryId} for user ${req.user.id} with role ${req.user.role}`);
        const category = await storage.getCategory(req.body.categoryId, req.user.id, req.user.role);
        console.log(`\u{1F50D} DEBUG CREATE: Found category:`, category);
        if (!category || !category.isActive) {
          console.log(`\u274C DEBUG CREATE: Category validation failed - category: ${!!category}, isActive: ${category?.isActive}`);
          return res.status(400).json({ message: "\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u0627\u0646\u062A\u062E\u0627\u0628 \u0634\u062F\u0647 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A" });
        }
        console.log(`\u2705 DEBUG CREATE: Category validation passed`);
      }
      const validatedData = insertProductSchema.parse({
        ...req.body,
        userId: req.user.id,
        image: imageData,
        categoryId: req.body.categoryId || null,
        priceBeforeDiscount: req.body.priceBeforeDiscount,
        priceAfterDiscount: req.body.priceAfterDiscount || null,
        quantity: parseInt(req.body.quantity)
      });
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u0645\u062D\u0635\u0648\u0644:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647 \u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u0645\u062D\u0635\u0648\u0644" });
    }
  });
  app2.put("/api/products/:id", authenticateToken, upload.single("productImage"), async (req, res) => {
    try {
      if (req.user.role === "user_level_2") {
        return res.status(403).json({ message: "\u0634\u0645\u0627 \u0627\u062C\u0627\u0632\u0647 \u062A\u063A\u06CC\u06CC\u0631 \u0645\u062D\u0635\u0648\u0644\u0627\u062A \u0631\u0627 \u0646\u062F\u0627\u0631\u06CC\u062F" });
      }
      const { id } = req.params;
      let updates = { ...req.body };
      if (req.body.categoryId) {
        const category = await storage.getCategory(req.body.categoryId, req.user.id, req.user.role);
        if (!category || !category.isActive) {
          return res.status(400).json({ message: "\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u0627\u0646\u062A\u062E\u0627\u0628 \u0634\u062F\u0647 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A" });
        }
      }
      if (req.file) {
        updates.image = `/uploads/${req.file.filename}`;
      }
      const updatedProduct = await storage.updateProduct(id, updates, req.user.id, req.user.role);
      if (!updatedProduct) {
        return res.status(404).json({ message: "\u0645\u062D\u0635\u0648\u0644 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json(updatedProduct);
    } catch (error) {
      console.error("\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0645\u062D\u0635\u0648\u0644:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0645\u062D\u0635\u0648\u0644" });
    }
  });
  app2.delete("/api/products/:id", authenticateToken, async (req, res) => {
    try {
      if (req.user.role === "user_level_2") {
        return res.status(403).json({ message: "\u0634\u0645\u0627 \u0627\u062C\u0627\u0632\u0647 \u062D\u0630\u0641 \u0645\u062D\u0635\u0648\u0644\u0627\u062A \u0631\u0627 \u0646\u062F\u0627\u0631\u06CC\u062F" });
      }
      const { id } = req.params;
      const success = await storage.deleteProduct(id, req.user.id, req.user.role);
      if (!success) {
        return res.status(404).json({ message: "\u0645\u062D\u0635\u0648\u0644 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json({ message: "\u0645\u062D\u0635\u0648\u0644 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u0634\u062F" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062D\u0630\u0641 \u0645\u062D\u0635\u0648\u0644" });
    }
  });
  app2.get("/api/whatsapp-settings", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const user = req.user;
      if (user.role === "user_level_1") {
        res.json({
          token: user.whatsappToken || "",
          isEnabled: !!user.whatsappToken,
          notifications: [],
          aiName: "\u0645\u0646 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u0647\u0633\u062A\u0645",
          isPersonal: true
        });
      } else {
        const settings = await storage.getWhatsappSettings();
        res.json({
          ...settings,
          aiName: settings?.aiName || "\u0645\u0646 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u0647\u0633\u062A\u0645",
          isPersonal: false
        });
      }
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0648\u0627\u062A\u0633 \u0627\u067E" });
    }
  });
  app2.put("/api/whatsapp-settings", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const user = req.user;
      if (user.role === "user_level_1") {
        const { token } = req.body;
        const updatedUser = await storage.updateUser(user.id, {
          whatsappToken: token || null
        });
        if (!updatedUser) {
          return res.status(404).json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
        }
        res.json({
          token: updatedUser.whatsappToken || "",
          isEnabled: !!updatedUser.whatsappToken,
          notifications: [],
          aiName: "\u0645\u0646 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u0647\u0633\u062A\u0645",
          isPersonal: true
        });
      } else {
        const validatedData = insertWhatsappSettingsSchema.parse(req.body);
        const settings = await storage.updateWhatsappSettings(validatedData);
        res.json({
          ...settings,
          isPersonal: false
        });
      }
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647 \u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0648\u0627\u062A\u0633 \u0627\u067E" });
    }
  });
  app2.get("/api/messages/sent", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const messages = await storage.getSentMessagesByUser(req.user.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u067E\u06CC\u0627\u0645\u200C\u0647\u0627\u06CC \u0627\u0631\u0633\u0627\u0644\u06CC" });
    }
  });
  app2.get("/api/messages/received", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 7;
      const result = await storage.getReceivedMessagesByUserPaginated(req.user.id, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u067E\u06CC\u0627\u0645\u200C\u0647\u0627\u06CC \u062F\u0631\u06CC\u0627\u0641\u062A\u06CC" });
    }
  });
  app2.post("/api/messages/sent", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const validatedData = insertSentMessageSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const message = await storage.createSentMessage(validatedData);
      res.json(message);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647 \u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062B\u0628\u062A \u067E\u06CC\u0627\u0645 \u0627\u0631\u0633\u0627\u0644\u06CC" });
    }
  });
  app2.post("/api/messages/received", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const validatedData = insertReceivedMessageSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const message = await storage.createReceivedMessage(validatedData);
      res.json(message);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647 \u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062B\u0628\u062A \u067E\u06CC\u0627\u0645 \u062F\u0631\u06CC\u0627\u0641\u062A\u06CC" });
    }
  });
  app2.put("/api/messages/received/:id/read", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const { id } = req.params;
      const message = await storage.updateReceivedMessageStatus(id, "\u062E\u0648\u0627\u0646\u062F\u0647 \u0634\u062F\u0647");
      if (!message) {
        return res.status(404).json({ message: "\u067E\u06CC\u0627\u0645 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0648\u0636\u0639\u06CC\u062A \u067E\u06CC\u0627\u0645" });
    }
  });
  app2.get("/api/user-subscriptions/me", authenticateToken, async (req, res) => {
    try {
      const userSubscription = await storage.getUserSubscription(req.user.id);
      res.json(userSubscription);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u0634\u062A\u0631\u0627\u06A9 \u06A9\u0627\u0631\u0628\u0631" });
    }
  });
  app2.get("/api/user-subscriptions", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userSubscriptions2 = await storage.getAllUserSubscriptions();
      res.json(userSubscriptions2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u0634\u062A\u0631\u0627\u06A9\u200C\u0647\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631\u0627\u0646" });
    }
  });
  app2.post("/api/user-subscriptions", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSubscriptionSchema.parse(req.body);
      const userSubscription = await storage.createUserSubscription(validatedData);
      res.json(userSubscription);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647 \u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u0627\u0634\u062A\u0631\u0627\u06A9 \u06A9\u0627\u0631\u0628\u0631" });
    }
  });
  app2.put("/api/user-subscriptions/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userSubscription = await storage.updateUserSubscription(id, updates);
      if (!userSubscription) {
        return res.status(404).json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json(userSubscription);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0627\u0634\u062A\u0631\u0627\u06A9 \u06A9\u0627\u0631\u0628\u0631" });
    }
  });
  app2.put("/api/user-subscriptions/:id/remaining-days", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { remainingDays } = req.body;
      if (typeof remainingDays !== "number") {
        return res.status(400).json({ message: "\u062A\u0639\u062F\u0627\u062F \u0631\u0648\u0632\u0647\u0627\u06CC \u0628\u0627\u0642\u06CC\u0645\u0627\u0646\u062F\u0647 \u0628\u0627\u06CC\u062F \u0639\u062F\u062F \u0628\u0627\u0634\u062F" });
      }
      const userSubscription = await storage.updateRemainingDays(id, remainingDays);
      if (!userSubscription) {
        return res.status(404).json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json(userSubscription);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0631\u0648\u0632\u0647\u0627\u06CC \u0628\u0627\u0642\u06CC\u0645\u0627\u0646\u062F\u0647" });
    }
  });
  app2.post("/api/user-subscriptions/daily-reduction", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const activeSubscriptions = await storage.getActiveUserSubscriptions();
      const updatedSubscriptions = [];
      for (const subscription of activeSubscriptions) {
        if (subscription.remainingDays > 0) {
          const newRemainingDays = subscription.remainingDays - 1;
          const updated = await storage.updateRemainingDays(subscription.id, newRemainingDays);
          if (updated) {
            updatedSubscriptions.push(updated);
          }
        }
      }
      res.json({
        message: `${updatedSubscriptions.length} \u0627\u0634\u062A\u0631\u0627\u06A9 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F`,
        updatedSubscriptions
      });
    } catch (error) {
      console.error("\u062E\u0637\u0627 \u062F\u0631 \u06A9\u0627\u0647\u0634 \u0631\u0648\u0632\u0627\u0646\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9\u200C\u0647\u0627:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u06A9\u0627\u0647\u0634 \u0631\u0648\u0632\u0627\u0646\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9\u200C\u0647\u0627" });
    }
  });
  app2.get("/api/user-subscriptions/active", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const activeSubscriptions = await storage.getActiveUserSubscriptions();
      res.json(activeSubscriptions);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u0634\u062A\u0631\u0627\u06A9\u200C\u0647\u0627\u06CC \u0641\u0639\u0627\u0644" });
    }
  });
  app2.get("/api/user-subscriptions/expired", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const expiredSubscriptions = await storage.getExpiredUserSubscriptions();
      res.json(expiredSubscriptions);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u0634\u062A\u0631\u0627\u06A9\u200C\u0647\u0627\u06CC \u0645\u0646\u0642\u0636\u06CC" });
    }
  });
  app2.post("/api/user-subscriptions/subscribe", authenticateToken, async (req, res) => {
    try {
      const { subscriptionId } = req.body;
      if (!subscriptionId) {
        return res.status(400).json({ message: "\u0634\u0646\u0627\u0633\u0647 \u0627\u0634\u062A\u0631\u0627\u06A9 \u0645\u0648\u0631\u062F \u0646\u06CC\u0627\u0632 \u0627\u0633\u062A" });
      }
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ message: "\u0627\u0634\u062A\u0631\u0627\u06A9 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      if (!subscription.isActive) {
        return res.status(400).json({ message: "\u0627\u06CC\u0646 \u0627\u0634\u062A\u0631\u0627\u06A9 \u0641\u0639\u0627\u0644 \u0646\u06CC\u0633\u062A" });
      }
      const existingSubscription = await storage.getUserSubscription(req.user.id);
      if (existingSubscription && existingSubscription.remainingDays > 0) {
        return res.status(400).json({ message: "\u0634\u0645\u0627 \u0627\u0634\u062A\u0631\u0627\u06A9 \u0641\u0639\u0627\u0644 \u062F\u0627\u0631\u06CC\u062F" });
      }
      const durationInDays = subscription.duration === "monthly" ? 30 : 365;
      const userSubscription = await storage.createUserSubscription({
        userId: req.user.id,
        subscriptionId,
        remainingDays: durationInDays,
        startDate: /* @__PURE__ */ new Date(),
        endDate: new Date(Date.now() + durationInDays * 24 * 60 * 60 * 1e3),
        status: "active"
      });
      res.json(userSubscription);
    } catch (error) {
      console.error("\u062E\u0637\u0627 \u062F\u0631 \u062B\u0628\u062A \u0627\u0634\u062A\u0631\u0627\u06A9:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062B\u0628\u062A \u0627\u0634\u062A\u0631\u0627\u06A9" });
    }
  });
  app2.get("/api/categories", authenticateToken, async (req, res) => {
    try {
      const categories2 = await storage.getAllCategories(req.user.id, req.user.role);
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC\u200C\u0647\u0627" });
    }
  });
  app2.get("/api/categories/tree", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const tree = await storage.getCategoryTree(req.user.id, req.user.role);
      res.json(tree);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0633\u0627\u062E\u062A\u0627\u0631 \u062F\u0631\u062E\u062A\u06CC \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC\u200C\u0647\u0627" });
    }
  });
  app2.get("/api/categories/by-parent/:parentId?", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const parentId = req.params.parentId === "null" ? null : req.params.parentId;
      const categories2 = await storage.getCategoriesByParent(parentId, req.user.id, req.user.role);
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0632\u06CC\u0631 \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC\u200C\u0647\u0627" });
    }
  });
  app2.post("/api/categories", authenticateToken, requireAdminOrUserLevel1, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData, req.user.id);
      res.json(category);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC" });
    }
  });
  app2.get("/api/categories/:id([0-9a-fA-F-]{36})", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id, req.user.id, req.user.role);
      if (!category) {
        return res.status(404).json({ message: "\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC" });
    }
  });
  app2.put("/api/categories/:id([0-9a-fA-F-]{36})", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const updates = req.body;
      delete updates.createdBy;
      const category = await storage.updateCategory(req.params.id, updates, req.user.id, req.user.role);
      if (!category) {
        return res.status(404).json({ message: "\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC" });
    }
  });
  app2.put("/api/categories/reorder", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const updates = z2.array(updateCategoryOrderSchema).parse(req.body);
      const mappedUpdates = updates.map((update) => ({
        id: update.categoryId,
        order: update.newOrder,
        parentId: update.newParentId || null
      }));
      const success = await storage.reorderCategories(mappedUpdates);
      if (!success) {
        return res.status(400).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u063A\u06CC\u06CC\u0631 \u062A\u0631\u062A\u06CC\u0628 \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC\u200C\u0647\u0627" });
      }
      res.json({ message: "\u062A\u0631\u062A\u06CC\u0628 \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC\u200C\u0647\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F" });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u063A\u06CC\u06CC\u0631 \u062A\u0631\u062A\u06CC\u0628 \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC\u200C\u0647\u0627" });
    }
  });
  app2.delete("/api/categories/:id([0-9a-fA-F-]{36})", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id, req.user.id, req.user.role);
      if (!success) {
        return res.status(404).json({ message: "\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json({ message: "\u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u0634\u062F" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062D\u0630\u0641 \u062F\u0633\u062A\u0647\u200C\u0628\u0646\u062F\u06CC" });
    }
  });
  app2.get("/api/welcome-message", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const user = req.user;
      const defaultMessage = `\u0633\u0644\u0627\u0645 {firstName}! \u{1F31F}

\u0628\u0647 \u0633\u06CC\u0633\u062A\u0645 \u0645\u0627 \u062E\u0648\u0634 \u0622\u0645\u062F\u06CC\u062F. \u0634\u0645\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062B\u0628\u062A \u0646\u0627\u0645 \u0634\u062F\u06CC\u062F.

\u{1F381} \u0627\u0634\u062A\u0631\u0627\u06A9 \u0631\u0627\u06CC\u06AF\u0627\u0646 7 \u0631\u0648\u0632\u0647 \u0628\u0647 \u062D\u0633\u0627\u0628 \u0634\u0645\u0627 \u0627\u0636\u0627\u0641\u0647 \u0634\u062F.

\u0628\u0631\u0627\u06CC \u06A9\u0645\u06A9 \u0648 \u0631\u0627\u0647\u0646\u0645\u0627\u06CC\u06CC\u060C \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0647\u0631 \u0632\u0645\u0627\u0646 \u067E\u06CC\u0627\u0645 \u0628\u062F\u0647\u06CC\u062F.`;
      res.json({ message: user.welcomeMessage || defaultMessage });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u067E\u06CC\u0627\u0645 \u062E\u0648\u0634 \u0622\u0645\u062F\u06AF\u0648\u06CC\u06CC" });
    }
  });
  app2.post("/api/welcome-message", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const { message } = req.body;
      if (typeof message !== "string") {
        return res.status(400).json({ message: "\u067E\u06CC\u0627\u0645 \u0628\u0627\u06CC\u062F \u0645\u062A\u0646\u06CC \u0628\u0627\u0634\u062F" });
      }
      const user = req.user;
      await storage.updateUser(user.id, { welcomeMessage: message });
      res.json({ message: "\u067E\u06CC\u0627\u0645 \u062E\u0648\u0634 \u0622\u0645\u062F\u06AF\u0648\u06CC\u06CC \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0630\u062E\u06CC\u0631\u0647 \u067E\u06CC\u0627\u0645 \u062E\u0648\u0634 \u0622\u0645\u062F\u06AF\u0648\u06CC\u06CC" });
    }
  });
  const requireLevel2 = (req, res, next) => {
    if (req.user?.role !== "user_level_2") {
      return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0645\u062D\u062F\u0648\u062F - \u0627\u06CC\u0646 \u0639\u0645\u0644\u06CC\u0627\u062A \u0645\u062E\u0635\u0648\u0635 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0633\u0637\u062D \u06F2 \u0627\u0633\u062A" });
    }
    next();
  };
  const addToCartSchema = z2.object({
    productId: z2.string().uuid("\u0634\u0646\u0627\u0633\u0647 \u0645\u062D\u0635\u0648\u0644 \u0628\u0627\u06CC\u062F UUID \u0645\u0639\u062A\u0628\u0631 \u0628\u0627\u0634\u062F"),
    quantity: z2.number().int().min(1, "\u062A\u0639\u062F\u0627\u062F \u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u0642\u0644 \u06F1 \u0628\u0627\u0634\u062F")
  });
  const updateQuantitySchema = z2.object({
    quantity: z2.number().int().min(1, "\u062A\u0639\u062F\u0627\u062F \u0628\u0627\u06CC\u062F \u062D\u062F\u0627\u0642\u0644 \u06F1 \u0628\u0627\u0634\u062F")
  });
  app2.get("/api/cart", authenticateToken, requireLevel2, async (req, res) => {
    try {
      const cartItems2 = await storage.getCartItemsWithProducts(req.user.id);
      res.json(cartItems2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0633\u0628\u062F \u062E\u0631\u06CC\u062F" });
    }
  });
  app2.post("/api/cart/add", authenticateToken, requireLevel2, async (req, res) => {
    try {
      const validatedData = addToCartSchema.parse(req.body);
      const { productId, quantity } = validatedData;
      const cartItem = await storage.addToCart(req.user.id, productId, quantity);
      res.json(cartItem);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "\u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631" });
      }
      res.status(500).json({ message: error.message || "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0636\u0627\u0641\u0647 \u06A9\u0631\u062F\u0646 \u0628\u0647 \u0633\u0628\u062F \u062E\u0631\u06CC\u062F" });
    }
  });
  app2.patch("/api/cart/items/:itemId", authenticateToken, requireLevel2, async (req, res) => {
    try {
      const validatedData = updateQuantitySchema.parse(req.body);
      const { quantity } = validatedData;
      const updatedItem = await storage.updateCartItemQuantity(req.params.itemId, quantity, req.user.id);
      if (!updatedItem) {
        return res.status(404).json({ message: "\u0622\u06CC\u062A\u0645 \u0633\u0628\u062F \u062E\u0631\u06CC\u062F \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json(updatedItem);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "\u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631" });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u062A\u0639\u062F\u0627\u062F" });
    }
  });
  app2.delete("/api/cart/items/:itemId", authenticateToken, requireLevel2, async (req, res) => {
    try {
      const success = await storage.removeFromCart(req.params.itemId, req.user.id);
      if (!success) {
        return res.status(404).json({ message: "\u0622\u06CC\u062A\u0645 \u0633\u0628\u062F \u062E\u0631\u06CC\u062F \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json({ message: "\u0622\u06CC\u062A\u0645 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0627\u0632 \u0633\u0628\u062F \u062D\u0630\u0641 \u0634\u062F" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062D\u0630\u0641 \u0622\u06CC\u062A\u0645 \u0627\u0632 \u0633\u0628\u062F" });
    }
  });
  app2.delete("/api/cart/clear", authenticateToken, requireLevel2, async (req, res) => {
    try {
      const success = await storage.clearCart(req.user.id);
      if (!success) {
        return res.status(404).json({ message: "\u0633\u0628\u062F \u062E\u0631\u06CC\u062F \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json({ message: "\u0633\u0628\u062F \u062E\u0631\u06CC\u062F \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u067E\u0627\u06A9 \u0634\u062F" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u067E\u0627\u06A9 \u06A9\u0631\u062F\u0646 \u0633\u0628\u062F \u062E\u0631\u06CC\u062F" });
    }
  });
  app2.get("/api/addresses", authenticateToken, requireLevel2, async (req, res) => {
    try {
      const addresses2 = await storage.getAddressesByUser(req.user.id);
      res.json(addresses2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0622\u062F\u0631\u0633\u200C\u0647\u0627" });
    }
  });
  app2.post("/api/addresses", authenticateToken, requireLevel2, async (req, res) => {
    try {
      const validatedData = insertAddressSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const address = await storage.createAddress(validatedData);
      res.status(201).json(address);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "\u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631" });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u0622\u062F\u0631\u0633" });
    }
  });
  app2.put("/api/addresses/:id", authenticateToken, requireLevel2, async (req, res) => {
    try {
      const validatedData = updateAddressSchema.parse(req.body);
      const updatedAddress = await storage.updateAddress(req.params.id, validatedData, req.user.id);
      if (!updatedAddress) {
        return res.status(404).json({ message: "\u0622\u062F\u0631\u0633 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json(updatedAddress);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "\u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631" });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0622\u062F\u0631\u0633" });
    }
  });
  app2.delete("/api/addresses/:id", authenticateToken, requireLevel2, async (req, res) => {
    try {
      const success = await storage.deleteAddress(req.params.id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: "\u0622\u062F\u0631\u0633 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json({ message: "\u0622\u062F\u0631\u0633 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u0634\u062F" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062D\u0630\u0641 \u0622\u062F\u0631\u0633" });
    }
  });
  app2.put("/api/addresses/:id/default", authenticateToken, requireLevel2, async (req, res) => {
    try {
      const success = await storage.setDefaultAddress(req.params.id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: "\u0622\u062F\u0631\u0633 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json({ message: "\u0622\u062F\u0631\u0633 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u062A\u0646\u0638\u06CC\u0645 \u0634\u062F" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u0646\u0638\u06CC\u0645 \u0622\u062F\u0631\u0633 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636" });
    }
  });
  app2.get("/api/orders", authenticateToken, requireLevel2, async (req, res) => {
    try {
      const orders2 = await storage.getOrdersByUser(req.user.id);
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0633\u0641\u0627\u0631\u0634\u0627\u062A" });
    }
  });
  app2.get("/api/orders/seller", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const orders2 = await storage.getOrdersBySeller(req.user.id);
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0633\u0641\u0627\u0631\u0634\u0627\u062A" });
    }
  });
  app2.get("/api/notifications/orders", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const count = await storage.getNewOrdersCount(req.user.id);
      res.json({ newOrdersCount: count });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0627\u0639\u0644\u0627\u0646\u200C\u0647\u0627" });
    }
  });
  app2.get("/api/dashboard/unshipped-orders", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const unshippedOrdersCount = await storage.getUnshippedOrdersCount(req.user.id);
      res.json({ unshippedOrdersCount });
    } catch (error) {
      console.error("Get unshipped orders count error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0622\u0645\u0627\u0631 \u067E\u06CC\u0634\u062E\u0648\u0627\u0646" });
    }
  });
  app2.get("/api/orders/paid-orders-count", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const paidOrdersCount = await storage.getPaidOrdersCount(req.user.id);
      res.json({ paidOrdersCount });
    } catch (error) {
      console.error("Get paid orders count error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u0639\u062F\u0627\u062F \u0633\u0641\u0627\u0631\u0634\u0627\u062A \u067E\u0631\u062F\u0627\u062E\u062A \u0634\u062F\u0647" });
    }
  });
  app2.get("/api/orders/pending-orders-count", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const pendingOrdersCount = await storage.getPendingOrdersCount(req.user.id);
      res.json({ pendingOrdersCount });
    } catch (error) {
      console.error("Get pending orders count error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u0639\u062F\u0627\u062F \u0633\u0641\u0627\u0631\u0634\u0627\u062A \u062F\u0631 \u062D\u0627\u0644 \u062A\u0627\u06CC\u06CC\u062F" });
    }
  });
  app2.get("/api/transactions/pending-count", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const pendingTransactionsCount = await storage.getPendingTransactionsCount(req.user.id);
      res.json({ pendingTransactionsCount });
    } catch (error) {
      console.error("Get pending transactions count error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u0639\u062F\u0627\u062F \u062A\u0631\u0627\u06A9\u0646\u0634\u200C\u0647\u0627\u06CC \u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u0628\u0631\u0631\u0633\u06CC" });
    }
  });
  app2.get("/api/user/orders/pending-payment-count", authenticateToken, requireLevel2, async (req, res) => {
    try {
      const pendingPaymentOrdersCount = await storage.getPendingPaymentOrdersCount(req.user.id);
      res.json({ pendingPaymentOrdersCount });
    } catch (error) {
      console.error("Get pending payment orders count error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u0639\u062F\u0627\u062F \u0633\u0641\u0627\u0631\u0634\u0627\u062A \u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631 \u067E\u0631\u062F\u0627\u062E\u062A" });
    }
  });
  app2.post("/api/orders", authenticateToken, requireLevel2, async (req, res) => {
    try {
      const cartItems2 = await storage.getCartItemsWithProducts(req.user.id);
      if (cartItems2.length === 0) {
        return res.status(400).json({ message: "\u0633\u0628\u062F \u062E\u0631\u06CC\u062F \u062E\u0627\u0644\u06CC \u0627\u0633\u062A" });
      }
      const ordersBySeller = /* @__PURE__ */ new Map();
      for (const item of cartItems2) {
        const product = await storage.getProduct(item.productId, req.user.id, req.user.role);
        if (!product) continue;
        const sellerId = product.userId;
        if (!ordersBySeller.has(sellerId)) {
          ordersBySeller.set(sellerId, {
            items: [],
            totalAmount: 0
          });
        }
        const sellerOrder = ordersBySeller.get(sellerId);
        sellerOrder.items.push(item);
        sellerOrder.totalAmount += parseFloat(item.totalPrice);
      }
      const createdOrders = [];
      for (const [sellerId, orderData] of Array.from(ordersBySeller.entries())) {
        const order = await storage.createOrder({
          userId: req.user.id,
          sellerId,
          totalAmount: orderData.totalAmount.toString(),
          addressId: req.body.addressId || null,
          notes: req.body.notes || null
        });
        for (const item of orderData.items) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          });
        }
        createdOrders.push(order);
      }
      await storage.clearCart(req.user.id);
      res.status(201).json({
        message: "\u0633\u0641\u0627\u0631\u0634 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062B\u0628\u062A \u0634\u062F",
        orders: createdOrders
      });
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062B\u0628\u062A \u0633\u0641\u0627\u0631\u0634" });
    }
  });
  app2.put("/api/orders/:id/status", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["awaiting_payment", "pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "\u0648\u0636\u0639\u06CC\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631" });
      }
      const updatedOrder = await storage.updateOrderStatus(req.params.id, status, req.user.id);
      if (!updatedOrder) {
        return res.status(404).json({ message: "\u0633\u0641\u0627\u0631\u0634 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F \u06CC\u0627 \u062F\u0633\u062A\u0631\u0633\u06CC \u0646\u062F\u0627\u0631\u06CC\u062F" });
      }
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0648\u0636\u0639\u06CC\u062A \u0633\u0641\u0627\u0631\u0634" });
    }
  });
  app2.get("/api/orders/:id", authenticateToken, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "\u0633\u0641\u0627\u0631\u0634 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      if (req.user.role === "user_level_2" && order.userId !== req.user.id) {
        return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u0633\u0641\u0627\u0631\u0634 \u0646\u062F\u0627\u0631\u06CC\u062F" });
      }
      if (req.user.role === "user_level_1" && order.sellerId !== req.user.id) {
        return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u0633\u0641\u0627\u0631\u0634 \u0646\u062F\u0627\u0631\u06CC\u062F" });
      }
      const orderItems2 = await storage.getOrderItemsWithProducts(order.id);
      res.json({
        ...order,
        items: orderItems2
      });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062C\u0632\u0626\u06CC\u0627\u062A \u0633\u0641\u0627\u0631\u0634" });
    }
  });
  app2.get("/api/transactions", authenticateToken, async (req, res) => {
    try {
      const { type } = req.query;
      let transactions2;
      let currentUserId = req.user.id;
      if (req.user.role === "user_level_1") {
        const subUsers = await storage.getSubUsers(req.user.id);
        const allUserIds = [req.user.id, ...subUsers.map((user) => user.id)];
        const allTransactions = [];
        for (const userId of allUserIds) {
          if (type && typeof type === "string") {
            const userTransactions = await storage.getTransactionsByUserAndType(userId, type);
            allTransactions.push(...userTransactions);
          } else {
            const userTransactions = await storage.getTransactionsByUser(userId);
            allTransactions.push(...userTransactions);
          }
        }
        transactions2 = allTransactions.sort(
          (a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
        );
      } else {
        if (type && typeof type === "string") {
          transactions2 = await storage.getTransactionsByUserAndType(req.user.id, type);
        } else {
          transactions2 = await storage.getTransactionsByUser(req.user.id);
        }
      }
      res.json(transactions2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u0631\u0627\u06A9\u0646\u0634\u200C\u0647\u0627" });
    }
  });
  app2.post("/api/transactions", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "\u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631" });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u062A\u0631\u0627\u06A9\u0646\u0634" });
    }
  });
  app2.get("/api/balance", authenticateToken, async (req, res) => {
    try {
      const balance = await storage.getUserBalance(req.user.id);
      res.json({ balance });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0645\u0648\u062C\u0648\u062F\u06CC" });
    }
  });
  app2.get("/api/transactions/successful", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const subUsers = await storage.getSubUsers(req.user.id);
      const subUserIds = subUsers.map((user) => user.id);
      const transactions2 = await storage.getSuccessfulTransactionsBySellers([req.user.id]);
      res.json(transactions2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u0631\u0627\u06A9\u0646\u0634\u200C\u0647\u0627\u06CC \u0645\u0648\u0641\u0642" });
    }
  });
  app2.put("/api/transactions/:id/status", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status || !["pending", "completed", "failed"].includes(status)) {
        return res.status(400).json({ message: "\u0648\u0636\u0639\u06CC\u062A \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A" });
      }
      const transaction = await storage.getTransaction(id);
      if (!transaction) {
        return res.status(404).json({ message: "\u062A\u0631\u0627\u06A9\u0646\u0634 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      if (req.user.role === "user_level_1") {
        const subUsers = await storage.getSubUsers(req.user.id);
        const allowedUserIds = [req.user.id, ...subUsers.map((user) => user.id)];
        if (!allowedUserIds.includes(transaction.userId)) {
          return res.status(403).json({ message: "\u0634\u0645\u0627 \u0645\u062C\u0627\u0632 \u0628\u0647 \u062A\u063A\u06CC\u06CC\u0631 \u0627\u06CC\u0646 \u062A\u0631\u0627\u06A9\u0646\u0634 \u0646\u06CC\u0633\u062A\u06CC\u062F" });
        }
      }
      const updatedTransaction = await storage.updateTransactionStatus(id, status);
      if (!updatedTransaction) {
        return res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u062A\u0631\u0627\u06A9\u0646\u0634" });
      }
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error updating transaction status:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0648\u0636\u0639\u06CC\u062A" });
    }
  });
  app2.get("/api/deposits/summary", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const parentUserId = req.user.id;
      const total = await storage.getApprovedDepositsTotalByParent(parentUserId);
      res.json({
        totalAmount: total,
        parentUserId
      });
    } catch (error) {
      console.error("Error getting approved deposits summary:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062E\u0644\u0627\u0635\u0647 \u0648\u0627\u0631\u06CC\u0632\u06CC\u200C\u0647\u0627" });
    }
  });
  app2.get("/api/deposits", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const parentUserId = req.user.id;
      const deposits = await storage.getDepositsByParent(parentUserId);
      res.json(deposits);
    } catch (error) {
      console.error("Error getting deposits:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062F\u0631\u062E\u0648\u0627\u0633\u062A\u200C\u0647\u0627\u06CC \u0648\u0627\u0631\u06CC\u0632" });
    }
  });
  app2.put("/api/deposits/:id/approve", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const { id } = req.params;
      const approvedByUserId = req.user.id;
      const transaction = await storage.getTransaction(id);
      if (!transaction) {
        return res.status(404).json({ message: "\u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0648\u0627\u0631\u06CC\u0632 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      if (transaction.type !== "deposit" || transaction.parentUserId !== approvedByUserId) {
        return res.status(403).json({ message: "\u0634\u0645\u0627 \u0645\u062C\u0627\u0632 \u0628\u0647 \u062A\u0627\u06CC\u06CC\u062F \u0627\u06CC\u0646 \u0648\u0627\u0631\u06CC\u0632 \u0646\u06CC\u0633\u062A\u06CC\u062F" });
      }
      if (transaction.status === "completed" && transaction.approvedByUserId) {
        return res.status(400).json({ message: "\u0627\u06CC\u0646 \u0648\u0627\u0631\u06CC\u0632 \u0642\u0628\u0644\u0627\u064B \u062A\u0627\u06CC\u06CC\u062F \u0634\u062F\u0647 \u0627\u0633\u062A" });
      }
      const approvedDeposit = await storage.approveDeposit(id, approvedByUserId);
      if (!approvedDeposit) {
        return res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u0627\u06CC\u06CC\u062F \u0648\u0627\u0631\u06CC\u0632" });
      }
      res.json(approvedDeposit);
    } catch (error) {
      console.error("Error approving deposit:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u0627\u06CC\u06CC\u062F \u0648\u0627\u0631\u06CC\u0632" });
    }
  });
  app2.get("/api/internal-chats", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      let chats;
      if (user.role === "user_level_2") {
        if (!user.parentUserId) {
          return res.status(400).json({ message: "\u0641\u0631\u0648\u0634\u0646\u062F\u0647\u200C\u0627\u06CC \u0628\u0631\u0627\u06CC \u0634\u0645\u0627 \u062A\u0639\u06CC\u0646 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A" });
        }
        chats = await storage.getInternalChatsBetweenUsers(user.id, user.parentUserId);
      } else if (user.role === "user_level_1") {
        chats = await storage.getInternalChatsForSeller(user.id);
      } else {
        return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0645\u062C\u0627\u0632 \u0646\u06CC\u0633\u062A" });
      }
      res.json(chats);
    } catch (error) {
      console.error("Error getting internal chats:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u067E\u06CC\u0627\u0645\u200C\u0647\u0627" });
    }
  });
  app2.post("/api/internal-chats", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "user_level_1" && user.role !== "user_level_2") {
        return res.status(403).json({ message: "\u0641\u0642\u0637 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0633\u0637\u062D \u06F1 \u0648 \u06F2 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u0646\u062F \u067E\u06CC\u0627\u0645 \u0627\u0631\u0633\u0627\u0644 \u06A9\u0646\u0646\u062F" });
      }
      const validatedData = insertInternalChatSchema.parse({
        ...req.body,
        senderId: user.id
      });
      if (user.role === "user_level_2") {
        if (!user.parentUserId || validatedData.receiverId !== user.parentUserId) {
          return res.status(400).json({ message: "\u0634\u0645\u0627 \u0641\u0642\u0637 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0628\u0627 \u0641\u0631\u0648\u0634\u0646\u062F\u0647 \u062E\u0648\u062F \u0686\u062A \u06A9\u0646\u06CC\u062F" });
        }
      } else if (user.role === "user_level_1") {
        const receiver = await storage.getUser(validatedData.receiverId);
        if (!receiver || receiver.parentUserId !== user.id) {
          return res.status(400).json({ message: "\u0634\u0645\u0627 \u0641\u0642\u0637 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0628\u0627 \u0645\u0634\u062A\u0631\u06CC\u0627\u0646 \u062E\u0648\u062F \u0686\u062A \u06A9\u0646\u06CC\u062F" });
        }
      }
      const chat = await storage.createInternalChat(validatedData);
      res.status(201).json(chat);
    } catch (error) {
      console.error("Error creating internal chat:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: error.errors[0]?.message || "\u062F\u0627\u062F\u0647\u200C\u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631" });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645" });
    }
  });
  app2.patch("/api/internal-chats/:chatId/read", authenticateToken, async (req, res) => {
    try {
      const { chatId } = req.params;
      const user = req.user;
      const chat = await storage.getInternalChatById(chatId);
      if (!chat) {
        return res.status(404).json({ message: "\u067E\u06CC\u0627\u0645 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      if (chat.senderId !== user.id && chat.receiverId !== user.id) {
        return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0628\u0647 \u0627\u06CC\u0646 \u067E\u06CC\u0627\u0645 \u0645\u062C\u0627\u0632 \u0646\u06CC\u0633\u062A" });
      }
      if (chat.receiverId !== user.id) {
        return res.status(400).json({ message: "\u0641\u0642\u0637 \u06AF\u06CC\u0631\u0646\u062F\u0647 \u067E\u06CC\u0627\u0645 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0622\u0646 \u0631\u0627 \u062E\u0648\u0627\u0646\u062F\u0647 \u0634\u062F\u0647 \u0639\u0644\u0627\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC \u06A9\u0646\u062F" });
      }
      await storage.markInternalChatAsRead(chatId);
      res.json({ message: "\u067E\u06CC\u0627\u0645 \u062E\u0648\u0627\u0646\u062F\u0647 \u0634\u062F\u0647 \u0639\u0644\u0627\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC \u0634\u062F" });
    } catch (error) {
      console.error("Error marking chat as read:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0639\u0644\u0627\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC \u067E\u06CC\u0627\u0645" });
    }
  });
  app2.get("/api/internal-chats/unread-count", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "user_level_1" && user.role !== "user_level_2") {
        return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0645\u062D\u062F\u0648\u062F" });
      }
      const unreadCount = await storage.getUnreadMessagesCountForUser(user.id, user.role);
      res.json({ unreadCount });
    } catch (error) {
      console.error("Error getting unread messages count:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u062A\u0639\u062F\u0627\u062F \u067E\u06CC\u0627\u0645\u200C\u0647\u0627\u06CC \u062E\u0648\u0627\u0646\u062F\u0647 \u0646\u0634\u062F\u0647" });
    }
  });
  app2.patch("/api/internal-chats/mark-all-read", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.role !== "user_level_1" && user.role !== "user_level_2") {
        return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0645\u062D\u062F\u0648\u062F" });
      }
      const success = await storage.markAllMessagesAsReadForUser(user.id, user.role);
      if (success) {
        res.json({ message: "\u062A\u0645\u0627\u0645 \u067E\u06CC\u0627\u0645\u200C\u0647\u0627 \u062E\u0648\u0627\u0646\u062F\u0647 \u0634\u062F\u0647 \u0639\u0644\u0627\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC \u0634\u062F\u0646\u062F" });
      } else {
        res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0639\u0644\u0627\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC \u067E\u06CC\u0627\u0645\u200C\u0647\u0627" });
      }
    } catch (error) {
      console.error("Error marking all messages as read:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0639\u0644\u0627\u0645\u062A\u200C\u06AF\u0630\u0627\u0631\u06CC \u067E\u06CC\u0627\u0645\u200C\u0647\u0627" });
    }
  });
  app2.get("/api/users/:userId", authenticateToken, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.id !== userId) {
        if (user.parentUserId !== userId && user.role !== "user_level_1") {
          return res.status(403).json({ message: "\u062F\u0633\u062A\u0631\u0633\u06CC \u0645\u062C\u0627\u0632 \u0646\u06CC\u0633\u062A" });
        }
      }
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "\u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      const safeUser = {
        id: targetUser.id,
        username: targetUser.username,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        email: targetUser.email,
        phone: targetUser.phone,
        role: targetUser.role,
        profilePicture: targetUser.profilePicture
      };
      res.json(safeUser);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u06A9\u0627\u0631\u0628\u0631" });
    }
  });
  app2.get("/api/faqs", async (req, res) => {
    try {
      const { includeInactive } = req.query;
      const faqs2 = await storage.getAllFaqs(includeInactive === "true");
      res.json(faqs2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0633\u0648\u0627\u0644\u0627\u062A \u0645\u062A\u062F\u0627\u0648\u0644" });
    }
  });
  app2.get("/api/faqs/active", async (req, res) => {
    try {
      const faqs2 = await storage.getActiveFaqs();
      res.json(faqs2);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0633\u0648\u0627\u0644\u0627\u062A \u0645\u062A\u062F\u0627\u0648\u0644 \u0641\u0639\u0627\u0644" });
    }
  });
  app2.get("/api/faqs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const faq = await storage.getFaq(id);
      if (!faq) {
        return res.status(404).json({ message: "\u0633\u0648\u0627\u0644 \u0645\u062A\u062F\u0627\u0648\u0644 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json(faq);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u0633\u0648\u0627\u0644 \u0645\u062A\u062F\u0627\u0648\u0644" });
    }
  });
  app2.post("/api/faqs", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const validatedData = insertFaqSchema.parse(req.body);
      const faq = await storage.createFaq(validatedData, req.user.id);
      res.json(faq);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647 \u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u0633\u0648\u0627\u0644 \u0645\u062A\u062F\u0627\u0648\u0644" });
    }
  });
  app2.put("/api/faqs/:id", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateFaqSchema.parse(req.body);
      const updatedFaq = await storage.updateFaq(id, validatedData);
      if (!updatedFaq) {
        return res.status(404).json({ message: "\u0633\u0648\u0627\u0644 \u0645\u062A\u062F\u0627\u0648\u0644 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json(updatedFaq);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "\u062F\u0627\u062F\u0647 \u0647\u0627\u06CC \u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A", errors: error.errors });
      }
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0633\u0648\u0627\u0644 \u0645\u062A\u062F\u0627\u0648\u0644" });
    }
  });
  app2.delete("/api/faqs/:id", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteFaq(id);
      if (!deleted) {
        return res.status(404).json({ message: "\u0633\u0648\u0627\u0644 \u0645\u062A\u062F\u0627\u0648\u0644 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json({ message: "\u0633\u0648\u0627\u0644 \u0645\u062A\u062F\u0627\u0648\u0644 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062D\u0630\u0641 \u0634\u062F" });
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062D\u0630\u0641 \u0633\u0648\u0627\u0644 \u0645\u062A\u062F\u0627\u0648\u0644" });
    }
  });
  app2.put("/api/faqs/:id/order", authenticateToken, requireAdminOrLevel1, async (req, res) => {
    try {
      const { id } = req.params;
      const { order } = req.body;
      if (typeof order !== "number") {
        return res.status(400).json({ message: "\u062A\u0631\u062A\u06CC\u0628 \u0628\u0627\u06CC\u062F \u0639\u062F\u062F \u0628\u0627\u0634\u062F" });
      }
      const updatedFaq = await storage.updateFaqOrder(id, order);
      if (!updatedFaq) {
        return res.status(404).json({ message: "\u0633\u0648\u0627\u0644 \u0645\u062A\u062F\u0627\u0648\u0644 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" });
      }
      res.json(updatedFaq);
    } catch (error) {
      res.status(500).json({ message: "\u062E\u0637\u0627 \u062F\u0631 \u062A\u063A\u06CC\u06CC\u0631 \u062A\u0631\u062A\u06CC\u0628 \u0633\u0648\u0627\u0644 \u0645\u062A\u062F\u0627\u0648\u0644" });
    }
  });
  app2.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5e3,
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/whatsapp-service.ts
init_storage();
init_gemini_service();
var WhatsAppMessageService = class {
  intervalId = null;
  isRunning = false;
  isFetching = false;
  lastFetchTime = null;
  async start() {
    if (this.isRunning) {
      console.log("\u{1F504} \u0633\u0631\u0648\u06CC\u0633 \u067E\u06CC\u0627\u0645\u200C\u0647\u0627\u06CC \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u062F\u0631 \u062D\u0627\u0644 \u0627\u062C\u0631\u0627 \u0627\u0633\u062A");
      return;
    }
    console.log("\u{1F680} \u0634\u0631\u0648\u0639 \u0633\u0631\u0648\u06CC\u0633 \u067E\u06CC\u0627\u0645\u200C\u0647\u0627\u06CC \u0648\u0627\u062A\u0633\u200C\u0627\u067E...");
    this.isRunning = true;
    await this.fetchMessages();
    this.intervalId = setInterval(async () => {
      await this.fetchMessages();
    }, 5e3);
  }
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("\u{1F6D1} \u0633\u0631\u0648\u06CC\u0633 \u067E\u06CC\u0627\u0645\u200C\u0647\u0627\u06CC \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u0645\u062A\u0648\u0642\u0641 \u0634\u062F");
  }
  async fetchMessages() {
    if (this.isFetching) {
      return;
    }
    this.isFetching = true;
    try {
      console.log(`\u{1F504} \u0686\u06A9 \u06A9\u0631\u062F\u0646 \u067E\u06CC\u0627\u0645\u200C\u0647\u0627\u06CC \u062C\u062F\u06CC\u062F...`);
      const allUsers = await storage.getAllUsers();
      const usersWithTokens = allUsers.filter(
        (user) => user.role === "user_level_1" && user.whatsappToken && user.whatsappToken.trim() !== ""
      );
      if (usersWithTokens.length === 0) {
        await this.fetchMessagesForGlobalToken();
        return;
      }
      for (const user of usersWithTokens) {
        await this.fetchMessagesForUser(user);
      }
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u067E\u06CC\u0627\u0645\u200C\u0647\u0627\u06CC \u0648\u0627\u062A\u0633\u200C\u0627\u067E:", error.message || error);
    } finally {
      this.isFetching = false;
    }
  }
  /**
   * دریافت پیام‌ها برای یک کاربر خاص با استفاده از توکن شخصی
   */
  async fetchMessagesForUser(user) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1e4);
      const response = await fetch(`https://api.whatsiplus.com/receivedMessages/${user.whatsappToken}?page=1`, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "WhatsApp-Service/1.0",
          "Accept": "application/json",
          "Cache-Control": "no-cache"
        }
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        console.error(`\u274C \u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u067E\u06CC\u0627\u0645\u200C\u0647\u0627 \u0628\u0631\u0627\u06CC ${user.username}:`, response.status, response.statusText);
        return;
      }
      const data = await response.json();
      if (!data.data || data.data.length === 0) {
        return;
      }
      let newMessagesCount = 0;
      for (const message of data.data) {
        try {
          if (!message.message || message.message.trim() === "") {
            continue;
          }
          const existingMessage = await storage.getReceivedMessageByWhatsiPlusIdAndUser(message.id, user.id);
          if (!existingMessage) {
            const isUserInRegistrationProcess = await this.handleAutoRegistration(message.from, message.message, user.id);
            const savedMessage = await storage.createReceivedMessage({
              userId: user.id,
              whatsiPlusId: message.id,
              sender: message.from,
              message: message.message,
              status: "\u062E\u0648\u0627\u0646\u062F\u0647 \u0646\u0634\u062F\u0647",
              originalDate: message.date
            });
            if (geminiService.isActive() && !isUserInRegistrationProcess) {
              await this.handleAutoResponse(message.from, message.message, message.id, user.id);
            }
            newMessagesCount++;
          }
        } catch (error) {
          console.error("\u274C \u062E\u0637\u0627 \u062F\u0631 \u0630\u062E\u06CC\u0631\u0647 \u067E\u06CC\u0627\u0645:", error);
        }
      }
      if (newMessagesCount > 0) {
        console.log(`\u{1F4E8} ${newMessagesCount} \u067E\u06CC\u0627\u0645 \u062C\u062F\u06CC\u062F \u0628\u0631\u0627\u06CC ${user.username} \u062F\u0631\u06CC\u0627\u0641\u062A \u0648 \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F`);
        this.lastFetchTime = /* @__PURE__ */ new Date();
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.error(`\u23F1\uFE0F Timeout: \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u067E\u06CC\u0627\u0645\u200C\u0647\u0627 \u0628\u0631\u0627\u06CC ${user.username} \u0628\u06CC\u0634 \u0627\u0632 \u062D\u062F \u0627\u0646\u062A\u0638\u0627\u0631 \u0637\u0648\u0644 \u06A9\u0634\u06CC\u062F`);
      } else {
        console.error(`\u274C \u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u067E\u06CC\u0627\u0645\u200C\u0647\u0627\u06CC \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u0628\u0631\u0627\u06CC ${user.username}:`, error.message || error);
      }
    }
  }
  /**
   * دریافت پیام‌ها با استفاده از توکن عمومی (برای ادمین)
   */
  async fetchMessagesForGlobalToken() {
    try {
      const settings = await storage.getWhatsappSettings();
      if (!settings || !settings.token || !settings.isEnabled) {
        console.log("\u26A0\uFE0F \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u0641\u0639\u0627\u0644 \u0646\u06CC\u0633\u062A \u06CC\u0627 \u062A\u0648\u06A9\u0646 \u0645\u0648\u062C\u0648\u062F \u0646\u06CC\u0633\u062A");
        return;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1e4);
      const response = await fetch(`https://api.whatsiplus.com/receivedMessages/${settings.token}?page=1`, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "WhatsApp-Service/1.0",
          "Accept": "application/json",
          "Cache-Control": "no-cache"
        }
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        console.error("\u274C \u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u067E\u06CC\u0627\u0645\u200C\u0647\u0627 \u0627\u0632 \u062A\u0648\u06A9\u0646 \u0639\u0645\u0648\u0645\u06CC:", response.status, response.statusText);
        return;
      }
      const data = await response.json();
      if (!data.data || data.data.length === 0) {
        return;
      }
      let newMessagesCount = 0;
      const adminUsers = await storage.getAllUsers();
      const admin = adminUsers.find((user) => user.role === "admin");
      if (!admin) {
        console.error("\u274C \u0647\u06CC\u0686 \u06A9\u0627\u0631\u0628\u0631 \u0627\u062F\u0645\u06CC\u0646 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F");
        return;
      }
      for (const message of data.data) {
        try {
          if (!message.message || message.message.trim() === "") {
            continue;
          }
          const existingMessage = await storage.getReceivedMessageByWhatsiPlusIdAndUser(message.id, admin.id);
          if (!existingMessage) {
            const isUserInRegistrationProcess = await this.handleAutoRegistration(message.from, message.message, admin.id);
            await storage.createReceivedMessage({
              userId: admin.id,
              whatsiPlusId: message.id,
              sender: message.from,
              message: message.message,
              status: "\u062E\u0648\u0627\u0646\u062F\u0647 \u0646\u0634\u062F\u0647",
              originalDate: message.date
            });
            if (geminiService.isActive() && !isUserInRegistrationProcess) {
              await this.handleAutoResponse(message.from, message.message, message.id, admin.id);
            }
            newMessagesCount++;
          }
        } catch (error) {
          console.error("\u274C \u062E\u0637\u0627 \u062F\u0631 \u0630\u062E\u06CC\u0631\u0647 \u067E\u06CC\u0627\u0645:", error);
        }
      }
      if (newMessagesCount > 0) {
        console.log(`\u{1F4E8} ${newMessagesCount} \u067E\u06CC\u0627\u0645 \u062C\u062F\u06CC\u062F \u0627\u0632 \u062A\u0648\u06A9\u0646 \u0639\u0645\u0648\u0645\u06CC \u062F\u0631\u06CC\u0627\u0641\u062A \u0648 \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F`);
        this.lastFetchTime = /* @__PURE__ */ new Date();
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("\u23F1\uFE0F Timeout: \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u067E\u06CC\u0627\u0645\u200C\u0647\u0627 \u0628\u06CC\u0634 \u0627\u0632 \u062D\u062F \u0627\u0646\u062A\u0638\u0627\u0631 \u0637\u0648\u0644 \u06A9\u0634\u06CC\u062F");
      } else {
        console.error("\u274C \u062E\u0637\u0627 \u062F\u0631 \u062F\u0631\u06CC\u0627\u0641\u062A \u067E\u06CC\u0627\u0645\u200C\u0647\u0627\u06CC \u0648\u0627\u062A\u0633\u200C\u0627\u067E:", error.message || error);
      }
    }
  }
  /**
   * تجزیه نام و نام خانوادگی از پیام کاربر
   * @param message پیام کاربر
   * @returns object شامل firstName و lastName یا null
   */
  parseNameFromMessage(message) {
    const words = message.trim().split(/\s+/).filter((word) => word.length > 0);
    if (words.length >= 2) {
      return {
        firstName: words[0],
        lastName: words.slice(1).join(" ")
        // اگر نام خانوادگی چند کلمه باشد
      };
    }
    return null;
  }
  /**
   * ارسال پیام درخواست نام و نام خانوادگی
   * @param whatsappNumber شماره واتس‌اپ
   * @param fromUser کاربر ارسال‌کننده 
   */
  async sendNameRequestMessage(whatsappNumber, fromUser) {
    try {
      let whatsappToken;
      if (fromUser && fromUser.role === "user_level_1" && fromUser.whatsappToken && fromUser.whatsappToken.trim() !== "") {
        whatsappToken = fromUser.whatsappToken;
      } else {
        const whatsappSettings2 = await storage.getWhatsappSettings();
        if (!whatsappSettings2?.token || !whatsappSettings2.isEnabled) {
          console.log("\u26A0\uFE0F \u062A\u0648\u06A9\u0646 \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u0628\u0631\u0627\u06CC \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0646\u0627\u0645 \u0645\u0648\u062C\u0648\u062F \u0646\u06CC\u0633\u062A");
          return false;
        }
        whatsappToken = whatsappSettings2.token;
      }
      const nameRequestMessage = `\u0633\u0644\u0627\u0645! \u{1F44B}
      
\u0628\u0631\u0627\u06CC \u062B\u0628\u062A\u200C\u0646\u0627\u0645 \u062F\u0631 \u0633\u06CC\u0633\u062A\u0645\u060C \u0644\u0637\u0641\u0627\u064B \u0646\u0627\u0645 \u0648 \u0646\u0627\u0645 \u062E\u0627\u0646\u0648\u0627\u062F\u06AF\u06CC \u062E\u0648\u062F \u0631\u0627 \u0628\u0646\u0648\u06CC\u0633\u06CC\u062F.

\u0645\u062B\u0627\u0644: \u0627\u062D\u0645\u062F \u0645\u062D\u0645\u062F\u06CC

\u0645\u0646\u062A\u0638\u0631 \u067E\u0627\u0633\u062E \u0634\u0645\u0627 \u0647\u0633\u062A\u06CC\u0645.`;
      const sendUrl = `https://api.whatsiplus.com/sendMsg/${whatsappToken}?phonenumber=${whatsappNumber}&message=${encodeURIComponent(nameRequestMessage)}`;
      const response = await fetch(sendUrl, { method: "GET" });
      if (response.ok) {
        console.log(`\u2705 \u067E\u06CC\u0627\u0645 \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0646\u0627\u0645 \u0628\u0647 ${whatsappNumber} \u0627\u0631\u0633\u0627\u0644 \u0634\u062F`);
        return true;
      } else {
        console.error(`\u274C \u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645 \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0646\u0627\u0645 \u0628\u0647 ${whatsappNumber}`);
        return false;
      }
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645 \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0646\u0627\u0645:", error);
      return false;
    }
  }
  /**
   * مدیریت ثبت نام خودکار کاربران جدید از طریق واتس‌اپ
   * حالا اول نام و نام خانوادگی را می‌پرسد
   * @param whatsappNumber شماره واتس‌اپ فرستنده
   * @param message پیام دریافت شده
   * @param fromUserId شناسه کاربری که پیام را دریافت کرده (کاربر سطح 1)
   * @returns boolean - true اگر کاربر در حال ثبت‌نام است، false اگر ثبت‌نام کامل شده یا وجود دارد
   */
  async handleAutoRegistration(whatsappNumber, message, fromUserId) {
    try {
      const existingUser = await storage.getUserByWhatsappNumber(whatsappNumber);
      if (existingUser) {
        console.log(`\u{1F464} \u06A9\u0627\u0631\u0628\u0631 \u0628\u0627 \u0634\u0645\u0627\u0631\u0647 ${whatsappNumber} \u0627\u0632 \u0642\u0628\u0644 \u0648\u062C\u0648\u062F \u062F\u0627\u0631\u062F: ${existingUser.username}`);
        return false;
      } else {
        console.log(`\u{1F195} \u06A9\u0627\u0631\u0628\u0631 \u0628\u0627 \u0634\u0645\u0627\u0631\u0647 ${whatsappNumber} \u062C\u062F\u06CC\u062F \u0627\u0633\u062A - \u0628\u0631\u0631\u0633\u06CC \u062B\u0628\u062A \u0646\u0627\u0645...`);
      }
      const allUsers = await storage.getAllUsers();
      const userWithPhone = allUsers.find((user) => user.phone === whatsappNumber);
      if (userWithPhone && !userWithPhone.whatsappNumber) {
        await storage.updateUser(userWithPhone.id, {
          whatsappNumber,
          isWhatsappRegistered: true
        });
        console.log(`\u2705 \u0634\u0645\u0627\u0631\u0647 \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631 \u0645\u0648\u062C\u0648\u062F ${userWithPhone.username} \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F`);
        return false;
      }
      const fromUser = fromUserId ? await storage.getUser(fromUserId) : allUsers.find((user) => user.role === "user_level_1");
      if (!fromUser) {
        console.error("\u274C \u0647\u06CC\u0686 \u06A9\u0627\u0631\u0628\u0631 \u0633\u0637\u062D \u06F1 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F - \u06A9\u0627\u0631\u0628\u0631 \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u0627\u06CC\u062C\u0627\u062F \u0646\u0645\u06CC\u200C\u0634\u0648\u062F");
        return false;
      }
      const parsedName = this.parseNameFromMessage(message);
      if (!parsedName) {
        console.log(`\u{1F4DD} \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u0646\u0627\u0645 \u0648 \u0646\u0627\u0645 \u062E\u0627\u0646\u0648\u0627\u062F\u06AF\u06CC \u0627\u0632 ${whatsappNumber}`);
        await this.sendNameRequestMessage(whatsappNumber, fromUser);
        return true;
      }
      console.log(`\u{1F504} \u062B\u0628\u062A \u0646\u0627\u0645 \u062E\u0648\u062F\u06A9\u0627\u0631 \u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F \u0627\u0632 \u0648\u0627\u062A\u0633\u200C\u0627\u067E: ${whatsappNumber}`);
      const generateUsernameFromPhone = (phone) => {
        if (!phone) return phone;
        let cleanPhone = phone.replace(/\s+/g, "").replace(/[۰-۹]/g, (d) => "\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9".indexOf(d).toString()).replace(/[٠-٩]/g, (d) => "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669".indexOf(d).toString()).replace(/[^0-9]/g, "");
        if (cleanPhone.startsWith("0098")) {
          cleanPhone = cleanPhone.slice(4);
        } else if (cleanPhone.startsWith("98") && cleanPhone.length > 10) {
          cleanPhone = cleanPhone.slice(2);
        } else if (cleanPhone.startsWith("0")) {
          return cleanPhone;
        }
        return "0" + cleanPhone;
      };
      const username = generateUsernameFromPhone(whatsappNumber);
      const newUser = await storage.createUser({
        username,
        firstName: parsedName.firstName,
        lastName: parsedName.lastName,
        email: null,
        // ایمیل برای کاربران واتس‌اپ اختیاری است
        phone: whatsappNumber,
        whatsappNumber,
        password: null,
        // کاربران واتس‌اپ بدون رمز عبور
        role: "user_level_2",
        // کاربران واتس‌اپ به صورت پیش‌فرض سطح ۲
        parentUserId: fromUser.id,
        // تخصیص به کاربر سطح ۱ که پیام را دریافت کرده
        isWhatsappRegistered: true
      });
      try {
        const subscriptions2 = await storage.getAllSubscriptions();
        const trialSubscription = subscriptions2.find((sub) => sub.isDefault === true);
        if (trialSubscription) {
          await storage.createUserSubscription({
            userId: newUser.id,
            subscriptionId: trialSubscription.id,
            remainingDays: 7,
            startDate: /* @__PURE__ */ new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
            status: "active",
            isTrialPeriod: true
          });
        }
      } catch (subscriptionError) {
        console.error("\u062E\u0637\u0627 \u062F\u0631 \u0627\u06CC\u062C\u0627\u062F \u0627\u0634\u062A\u0631\u0627\u06A9 \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631 \u0648\u0627\u062A\u0633\u200C\u0627\u067E:", subscriptionError);
      }
      console.log(`\u2705 \u06A9\u0627\u0631\u0628\u0631 \u062C\u062F\u06CC\u062F \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u062B\u0628\u062A \u0646\u0627\u0645 \u0634\u062F: ${newUser.username} (${parsedName.firstName} ${parsedName.lastName})`);
      await this.sendWelcomeMessage(whatsappNumber, parsedName.firstName, fromUser);
      return false;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0627 \u062F\u0631 \u062B\u0628\u062A \u0646\u0627\u0645 \u062E\u0648\u062F\u06A9\u0627\u0631 \u06A9\u0627\u0631\u0628\u0631 \u0648\u0627\u062A\u0633\u200C\u0627\u067E:", error);
      return false;
    }
  }
  /**
   * ارسال پیام خوشامدگویی به کاربر جدید
   * @param whatsappNumber شماره واتس‌اپ
   * @param firstName نام کاربر
   * @param fromUser کاربر ارسال‌کننده 
   */
  async sendWelcomeMessage(whatsappNumber, firstName, fromUser) {
    try {
      let whatsappToken;
      if (fromUser && fromUser.role === "user_level_1" && fromUser.whatsappToken && fromUser.whatsappToken.trim() !== "") {
        whatsappToken = fromUser.whatsappToken;
      } else {
        const whatsappSettings2 = await storage.getWhatsappSettings();
        if (!whatsappSettings2?.token || !whatsappSettings2.isEnabled) {
          return;
        }
        whatsappToken = whatsappSettings2.token;
      }
      let welcomeMessage = fromUser?.welcomeMessage;
      if (!welcomeMessage || welcomeMessage.trim() === "") {
        welcomeMessage = `\u0633\u0644\u0627\u0645 ${firstName}! \u{1F31F}

\u0628\u0647 \u0633\u06CC\u0633\u062A\u0645 \u0645\u0627 \u062E\u0648\u0634 \u0622\u0645\u062F\u06CC\u062F. \u0634\u0645\u0627 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062B\u0628\u062A \u0646\u0627\u0645 \u0634\u062F\u06CC\u062F.

\u{1F381} \u0627\u0634\u062A\u0631\u0627\u06A9 \u0631\u0627\u06CC\u06AF\u0627\u0646 7 \u0631\u0648\u0632\u0647 \u0628\u0647 \u062D\u0633\u0627\u0628 \u0634\u0645\u0627 \u0627\u0636\u0627\u0641\u0647 \u0634\u062F.

\u0628\u0631\u0627\u06CC \u06A9\u0645\u06A9 \u0648 \u0631\u0627\u0647\u0646\u0645\u0627\u06CC\u06CC\u060C \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0647\u0631 \u0632\u0645\u0627\u0646 \u067E\u06CC\u0627\u0645 \u0628\u062F\u0647\u06CC\u062F.`;
      } else {
        welcomeMessage = welcomeMessage.replace("{firstName}", firstName);
      }
      const sendUrl = `https://api.whatsiplus.com/sendMsg/${whatsappToken}?phonenumber=${whatsappNumber}&message=${encodeURIComponent(welcomeMessage)}`;
      const response = await fetch(sendUrl, { method: "GET" });
      if (response.ok) {
        console.log(`\u2705 \u067E\u06CC\u0627\u0645 \u062E\u0648\u0634\u0627\u0645\u062F\u06AF\u0648\u06CC\u06CC \u0628\u0647 ${whatsappNumber} \u0627\u0631\u0633\u0627\u0644 \u0634\u062F`);
      } else {
        console.error(`\u274C \u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645 \u062E\u0648\u0634\u0627\u0645\u062F\u06AF\u0648\u06CC\u06CC \u0628\u0647 ${whatsappNumber}`);
      }
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u06CC\u0627\u0645 \u062E\u0648\u0634\u0627\u0645\u062F\u06AF\u0648\u06CC\u06CC:", error);
    }
  }
  /**
   * یک پاسخ هوشمند برای پیام ورودی ایجاد کرده و آن را از طریق واتس‌اپ ارسال می‌کند.
   * هر کاربر سطح 1 با توکن اختصاصی خود پاسخ می‌دهد
   * @param sender شماره موبایل فرستنده پیام
   * @param incomingMessage پیام دریافت شده از کاربر
   * @param whatsiPlusId شناسه پیام از WhatsiPlus API
   * @param userId شناسه کاربر
   */
  async handleAutoResponse(sender, incomingMessage, whatsiPlusId, userId) {
    try {
      console.log(`\u{1F916} \u062F\u0631 \u062D\u0627\u0644 \u062A\u0648\u0644\u06CC\u062F \u067E\u0627\u0633\u062E \u0628\u0631\u0627\u06CC \u067E\u06CC\u0627\u0645 \u0627\u0632 ${sender}...`);
      const user = await storage.getUser(userId);
      if (!user) {
        console.log("\u274C \u06A9\u0627\u0631\u0628\u0631 \u06CC\u0627\u0641\u062A \u0646\u0634\u062F");
        return;
      }
      let whatsappToken;
      if (user.role === "user_level_1" && user.whatsappToken && user.whatsappToken.trim() !== "") {
        whatsappToken = user.whatsappToken;
        console.log(`\u{1F4F1} \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u062A\u0648\u06A9\u0646 \u0627\u062E\u062A\u0635\u0627\u0635\u06CC \u06A9\u0627\u0631\u0628\u0631 ${user.username}`);
      } else {
        const whatsappSettings2 = await storage.getWhatsappSettings();
        if (!whatsappSettings2?.token || !whatsappSettings2.isEnabled) {
          console.log("\u26A0\uFE0F \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0648\u0627\u062A\u0633\u200C\u0627\u067E \u0628\u0631\u0627\u06CC \u0627\u0631\u0633\u0627\u0644 \u067E\u0627\u0633\u062E \u062E\u0648\u062F\u06A9\u0627\u0631 \u0641\u0639\u0627\u0644 \u0646\u06CC\u0633\u062A");
          return;
        }
        whatsappToken = whatsappSettings2.token;
        console.log("\u{1F4F1} \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u062A\u0648\u06A9\u0646 \u0639\u0645\u0648\u0645\u06CC");
      }
      const aiTokenSettings2 = await storage.getAiTokenSettings();
      if (!aiTokenSettings2?.token || !aiTokenSettings2.isActive) {
        console.log("\u26A0\uFE0F \u062A\u0648\u06A9\u0646 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 \u06CC\u0627 \u063A\u06CC\u0631\u0641\u0639\u0627\u0644 \u0627\u0633\u062A");
        return;
      }
      const aiResponse = await geminiService.generateResponse(incomingMessage, userId);
      const maxLength = 200;
      const finalResponse = aiResponse.length > maxLength ? aiResponse.substring(0, maxLength) + "..." : aiResponse;
      const sendUrl = `https://api.whatsiplus.com/sendMsg/${whatsappToken}?phonenumber=${sender}&message=${encodeURIComponent(finalResponse)}`;
      console.log(`\u{1F504} \u062F\u0631 \u062D\u0627\u0644 \u0627\u0631\u0633\u0627\u0644 \u067E\u0627\u0633\u062E \u062E\u0648\u062F\u06A9\u0627\u0631 \u0628\u0647 ${sender} \u0627\u0632 \u0637\u0631\u0641 ${user.username}...`);
      const sendResponse = await fetch(sendUrl, { method: "GET" });
      if (sendResponse.ok) {
        await storage.createSentMessage({
          userId,
          recipient: sender,
          message: aiResponse,
          status: "sent"
        });
        const userMessage = await storage.getReceivedMessageByWhatsiPlusIdAndUser(whatsiPlusId, userId);
        if (userMessage) {
          await storage.updateReceivedMessageStatus(userMessage.id, "\u062E\u0648\u0627\u0646\u062F\u0647 \u0634\u062F\u0647");
          console.log(`\u{1F4D6} \u0648\u0636\u0639\u06CC\u062A \u067E\u06CC\u0627\u0645 ${whatsiPlusId} \u0628\u0631\u0627\u06CC \u06A9\u0627\u0631\u0628\u0631 ${user.username} \u0628\u0647 "\u062E\u0648\u0627\u0646\u062F\u0647 \u0634\u062F\u0647" \u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0631\u062F`);
        }
        console.log(`\u2705 \u067E\u0627\u0633\u062E \u062E\u0648\u062F\u06A9\u0627\u0631 \u0628\u0647 ${sender} \u0627\u0632 \u0637\u0631\u0641 ${user.username} \u0627\u0631\u0633\u0627\u0644 \u0634\u062F: "${aiResponse.substring(0, 50)}..."`);
      } else {
        const errorText = await sendResponse.text();
        console.error(`\u274C \u062E\u0637\u0627 \u062F\u0631 \u0627\u0631\u0633\u0627\u0644 \u067E\u0627\u0633\u062E \u062E\u0648\u062F\u06A9\u0627\u0631 \u0628\u0647 ${sender}:`, errorText);
      }
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0627 \u062F\u0631 \u0641\u0631\u0622\u06CC\u0646\u062F \u067E\u0627\u0633\u062E \u062E\u0648\u062F\u06A9\u0627\u0631:", error);
    }
  }
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastFetchTime: this.lastFetchTime,
      geminiActive: geminiService.isActive()
    };
  }
};
var whatsAppMessageService = new WhatsAppMessageService();

// server/index.ts
import path4 from "path";
var app = express3();
app.use((req, res, next) => {
  if (req.headers["content-type"]?.startsWith("multipart/form-data")) {
    return next();
  }
  express3.json()(req, res, next);
});
app.use(express3.urlencoded({ extended: false }));
app.use("/uploads", express3.static(path4.join(process.cwd(), "uploads")));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
    whatsAppMessageService.start();
  });
})();
