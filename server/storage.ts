import { type User, type InsertUser, type Ticket, type InsertTicket, type Subscription, type InsertSubscription, type Product, type InsertProduct, type WhatsappSettings, type InsertWhatsappSettings, type SentMessage, type InsertSentMessage, type ReceivedMessage, type InsertReceivedMessage, type AiTokenSettings, type InsertAiTokenSettings, type UserSubscription, type InsertUserSubscription, type Category, type InsertCategory, type Cart, type InsertCart, type CartItem, type InsertCartItem, type Address, type InsertAddress, type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type Transaction, type InsertTransaction, type InternalChat, type InsertInternalChat, type Faq, type InsertFaq, type UpdateFaq, type ShippingSettings, type InsertShippingSettings, type UpdateShippingSettings, type PasswordResetOtp, type InsertPasswordResetOtp, type VatSettings, type InsertVatSettings, type UpdateVatSettings, type LoginLog, type InsertLoginLog } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmailOrUsername(emailOrUsername: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByWhatsappNumber(whatsappNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getSubUsers(parentUserId: string): Promise<User[]>;
  getUsersVisibleToUser(userId: string, userRole: string): Promise<User[]>;
  
  // Tickets
  getTicket(id: string): Promise<Ticket | undefined>;
  getTicketsByUser(userId: string): Promise<Ticket[]>;
  getAllTickets(): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, ticket: Partial<Ticket>): Promise<Ticket | undefined>;
  deleteTicket(id: string): Promise<boolean>;
  
  // Subscriptions
  getSubscription(id: string): Promise<Subscription | undefined>;
  getAllSubscriptions(): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, subscription: Partial<Subscription>): Promise<Subscription | undefined>;
  deleteSubscription(id: string): Promise<boolean>;
  
  // Products
  getProduct(id: string, currentUserId: string, userRole: string): Promise<Product | undefined>;
  getProductsByUser(userId: string): Promise<Product[]>;
  getAllProducts(currentUserId?: string, userRole?: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>, currentUserId: string, userRole: string): Promise<Product | undefined>;
  deleteProduct(id: string, currentUserId: string, userRole: string): Promise<boolean>;
  
  // WhatsApp Settings
  getWhatsappSettings(): Promise<WhatsappSettings | undefined>;
  updateWhatsappSettings(settings: InsertWhatsappSettings): Promise<WhatsappSettings>;
  
  // Messages
  getSentMessagesByUser(userId: string): Promise<SentMessage[]>;
  createSentMessage(message: InsertSentMessage): Promise<SentMessage>;
  getReceivedMessagesByUser(userId: string): Promise<ReceivedMessage[]>;
  getReceivedMessagesByUserPaginated(userId: string, page: number, limit: number): Promise<{ messages: ReceivedMessage[], total: number, totalPages: number }>;
  getReceivedMessageByWhatsiPlusId(whatsiPlusId: string): Promise<ReceivedMessage | undefined>;
  getReceivedMessageByWhatsiPlusIdAndUser(whatsiPlusId: string, userId: string): Promise<ReceivedMessage | undefined>;
  createReceivedMessage(message: InsertReceivedMessage): Promise<ReceivedMessage>;
  updateReceivedMessageStatus(id: string, status: string): Promise<ReceivedMessage | undefined>;

  // AI Token Settings
  getAiTokenSettings(provider?: string): Promise<AiTokenSettings | undefined>;
  getAllAiTokenSettings(): Promise<AiTokenSettings[]>;
  updateAiTokenSettings(settings: InsertAiTokenSettings): Promise<AiTokenSettings>;
  
  // User Subscriptions
  getUserSubscription(userId: string): Promise<UserSubscription & { subscriptionName?: string | null; subscriptionDescription?: string | null } | undefined>;
  getUserSubscriptionById(id: string): Promise<UserSubscription | undefined>;
  getUserSubscriptionsByUserId(userId: string): Promise<UserSubscription[]>;
  getAllUserSubscriptions(): Promise<UserSubscription[]>;
  createUserSubscription(userSubscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: string, updates: Partial<UserSubscription>): Promise<UserSubscription | undefined>;
  deleteUserSubscription(id: string): Promise<boolean>;
  updateRemainingDays(id: string, remainingDays: number): Promise<UserSubscription | undefined>;
  getActiveUserSubscriptions(): Promise<UserSubscription[]>;
  getExpiredUserSubscriptions(): Promise<UserSubscription[]>;
  
  // Categories  
  getCategory(id: string, currentUserId: string, userRole: string): Promise<Category | undefined>;
  getAllCategories(currentUserId: string, userRole: string): Promise<Category[]>;
  getCategoriesByParent(parentId: string | null, currentUserId: string, userRole: string): Promise<Category[]>;
  getCategoryTree(currentUserId: string, userRole: string): Promise<Category[]>;
  createCategory(category: InsertCategory, createdBy: string): Promise<Category>;
  updateCategory(id: string, category: Partial<Category>, currentUserId: string, userRole: string): Promise<Category | undefined>;
  deleteCategory(id: string, currentUserId: string, userRole: string): Promise<boolean>;
  reorderCategories(updates: { id: string; order: number; parentId?: string | null }[]): Promise<boolean>;
  
  // Cart
  getCart(userId: string): Promise<Cart | undefined>;
  getCartItems(userId: string): Promise<CartItem[]>;
  getCartItemsWithProducts(userId: string): Promise<(CartItem & { productName: string; productDescription?: string; productImage?: string })[]>;
  addToCart(userId: string, productId: string, quantity: number): Promise<CartItem>;
  updateCartItemQuantity(itemId: string, quantity: number, userId: string): Promise<CartItem | undefined>;
  removeFromCart(itemId: string, userId: string): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;
  
  // Addresses
  getAddress(id: string): Promise<Address | undefined>;
  getAddressesByUser(userId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: string, address: Partial<Address>, userId: string): Promise<Address | undefined>;
  deleteAddress(id: string, userId: string): Promise<boolean>;
  setDefaultAddress(addressId: string, userId: string): Promise<boolean>;
  
  // Orders
  getOrder(id: string): Promise<(Order & { addressTitle?: string; fullAddress?: string; postalCode?: string; buyerFirstName?: string; buyerLastName?: string; buyerPhone?: string; sellerFirstName?: string; sellerLastName?: string }) | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getOrdersBySeller(sellerId: string): Promise<(Order & { addressTitle?: string; fullAddress?: string; postalCode?: string; buyerFirstName?: string; buyerLastName?: string; buyerPhone?: string })[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string, sellerId: string): Promise<Order | undefined>;
  generateOrderNumber(): string;
  getNewOrdersCount(sellerId: string): Promise<number>;
  getUnshippedOrdersCount(sellerId: string): Promise<number>;
  getPaidOrdersCount(sellerId: string): Promise<number>;
  getPendingOrdersCount(sellerId: string): Promise<number>;
  getPendingPaymentOrdersCount(userId: string): Promise<number>;
  getAwaitingPaymentOrdersByUser(userId: string): Promise<Order[]>;
  
  // Order Items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  getOrderItemsWithProducts(orderId: string): Promise<(OrderItem & { productName: string; productDescription?: string; productImage?: string })[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Transactions
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  getTransactionsByUserAndType(userId: string, type: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined>;
  getUserBalance(userId: string): Promise<number>;
  getPendingTransactionsCount(sellerId: string): Promise<number>;
  getSuccessfulTransactionsBySellers(sellerIds: string[]): Promise<Transaction[]>;
  // Deposit approval methods
  getDepositsByParent(parentUserId: string): Promise<Transaction[]>;
  approveDeposit(transactionId: string, approvedByUserId: string): Promise<Transaction | undefined>;
  getApprovedDepositsTotalByParent(parentUserId: string): Promise<number>;
  // Duplicate detection
  getTransactionByReferenceId(referenceId: string, userId: string): Promise<Transaction | undefined>;
  
  // Internal Chats
  getInternalChatById(id: string): Promise<InternalChat | undefined>;
  getInternalChatsBetweenUsers(user1Id: string, user2Id: string): Promise<InternalChat[]>;
  getInternalChatsForSeller(sellerId: string): Promise<(InternalChat & { senderName?: string; receiverName?: string })[]>;
  createInternalChat(chat: InsertInternalChat): Promise<InternalChat>;
  markInternalChatAsRead(id: string): Promise<InternalChat | undefined>;
  getUnreadMessagesCountForUser(userId: string, userRole: string): Promise<number>;
  markAllMessagesAsReadForUser(userId: string, userRole: string): Promise<boolean>;
  
  // FAQs
  getFaq(id: string): Promise<Faq | undefined>;
  getAllFaqs(includeInactive?: boolean): Promise<Faq[]>;
  getActiveFaqs(): Promise<Faq[]>;
  getFaqsByCreator(creatorId: string): Promise<Faq[]>;
  createFaq(faq: InsertFaq, createdBy: string): Promise<Faq>;
  updateFaq(id: string, faq: UpdateFaq): Promise<Faq | undefined>;
  deleteFaq(id: string): Promise<boolean>;
  updateFaqOrder(id: string, newOrder: number): Promise<Faq | undefined>;
  
  // Shipping Settings
  getShippingSettings(userId: string): Promise<ShippingSettings | undefined>;
  updateShippingSettings(userId: string, settings: UpdateShippingSettings): Promise<ShippingSettings>;
  
  // VAT Settings
  getVatSettings(userId: string): Promise<VatSettings | undefined>;
  updateVatSettings(userId: string, settings: UpdateVatSettings): Promise<VatSettings>;
  
  // Password Reset OTP
  createPasswordResetOtp(userId: string, otp: string, expiresAt: Date): Promise<PasswordResetOtp>;
  getValidPasswordResetOtp(userId: string, otp: string): Promise<PasswordResetOtp | undefined>;
  markOtpAsUsed(id: string): Promise<boolean>;
  deleteExpiredOtps(): Promise<void>;
  
  // Login Logs
  createLoginLog(log: InsertLoginLog): Promise<LoginLog>;
  getLoginLogs(page?: number, limit?: number): Promise<{ logs: LoginLog[], total: number, totalPages: number }>;
  getLoginLogsByUser(userId: string): Promise<LoginLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tickets: Map<string, Ticket>;
  private subscriptions: Map<string, Subscription>;
  private products: Map<string, Product>;
  private whatsappSettings: WhatsappSettings | undefined;
  private sentMessages: Map<string, SentMessage>;
  private receivedMessages: Map<string, ReceivedMessage>;
  private aiTokenSettings: Map<string, AiTokenSettings>;
  private userSubscriptions: Map<string, UserSubscription>;
  private categories: Map<string, Category>;
  private carts: Map<string, Cart>;
  private cartItems: Map<string, CartItem>;
  private addresses: Map<string, Address>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private transactions: Map<string, Transaction>;
  private internalChats: Map<string, InternalChat>;
  private faqs: Map<string, Faq>;
  private shippingSettings: Map<string, ShippingSettings>;
  private passwordResetOtps: Map<string, PasswordResetOtp>;
  private vatSettings: Map<string, VatSettings>;
  private loginLogs: Map<string, LoginLog>;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.subscriptions = new Map();
    this.products = new Map();
    this.whatsappSettings = undefined;
    this.sentMessages = new Map();
    this.receivedMessages = new Map();
    this.aiTokenSettings = new Map();
    this.userSubscriptions = new Map();
    this.categories = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    this.addresses = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.transactions = new Map();
    this.internalChats = new Map();
    this.faqs = new Map();
    this.shippingSettings = new Map();
    this.passwordResetOtps = new Map();
    this.vatSettings = new Map();
    this.loginLogs = new Map();
    
    // Create default admin user
    this.initializeAdminUser();
    
    // Create default free subscription
    this.initializeDefaultSubscription();
    
    // Create test data (user, categories, products)
    this.initializeTestData().catch(console.error);
  }

  private async initializeAdminUser() {
    // Use environment variable for admin password, fallback to random password
    const adminPassword = process.env.ADMIN_PASSWORD || this.generateRandomPassword();
    if (!process.env.ADMIN_PASSWORD) {
      console.log("🔑 Admin password auto-generated. Username: ehsan");
      console.log("⚠️  Set ADMIN_PASSWORD environment variable for custom password");
      console.log("💡 For development: set NODE_ENV=development to see generated password");
    }
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser: User = {
      id: randomUUID(),
      username: "ehsan",
      firstName: "احسان",
      lastName: "مدیر",
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
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);
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
    const defaultSubscription: Subscription = {
      id: randomUUID(),
      name: "اشتراک رایگان",
      description: "اشتراک پیش‌فرض رایگان 7 روزه",
      image: null,
      userLevel: "user_level_1",
      priceBeforeDiscount: "0",
      priceAfterDiscount: null,
      duration: "monthly",
      features: [
        "دسترسی پایه به سیستم",
        "پشتیبانی محدود",
        "7 روز استفاده رایگان"
      ],
      isActive: true,
      isDefault: true,
      createdAt: new Date(),
    };
    this.subscriptions.set(defaultSubscription.id, defaultSubscription);
  }

  private async initializeTestData() {
    // ایجاد کاربر سطح 1 تستی
    const testUserPassword = await bcrypt.hash("test123", 10);
    const testUser: User = {
      id: randomUUID(),
      username: "test_seller",
      firstName: "علی",
      lastName: "فروشنده تستی",
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
      createdAt: new Date(),
    };
    this.users.set(testUser.id, testUser);
    console.log("🔑 کاربر سطح 1 تستی ایجاد شد - نام کاربری: test_seller، رمز عبور: test123");

    // ایجاد 3 دسته‌بندی موبایل
    const mobileCategories = [
      {
        name: "گوشی‌های هوشمند",
        description: "انواع گوشی‌های هوشمند اندروید و آیفون"
      },
      {
        name: "لوازم جانبی موبایل",
        description: "کیف، کاور، محافظ صفحه و سایر لوازم جانبی"
      },
      {
        name: "تبلت و آیپد",
        description: "انواع تبلت‌های اندروید و آیپد اپل"
      }
    ];

    const createdCategories: Category[] = [];
    
    for (const categoryData of mobileCategories) {
      const category: Category = {
        id: randomUUID(),
        name: categoryData.name,
        description: categoryData.description,
        parentId: null,
        createdBy: testUser.id,
        order: createdCategories.length,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.categories.set(category.id, category);
      createdCategories.push(category);
    }
    console.log("📱 3 دسته‌بندی موبایل تستی ایجاد شد");

    // ایجاد 6 محصول تستی
    const testProducts = [
      {
        name: "آیفون 15 پرو مکس",
        description: "گوشی آیفون 15 پرو مکس با ظرفیت 256 گیگابایت، رنگ طلایی",
        categoryId: createdCategories[0].id,
        priceBeforeDiscount: "45000000",
        priceAfterDiscount: "43000000",
        quantity: 5,
        image: "/uploads/iphone15-pro-max.png"
      },
      {
        name: "سامسونگ گلکسی S24 اولترا",
        description: "گوشی سامسونگ گلکسی S24 اولترا با ظرفیت 512 گیگابایت",
        categoryId: createdCategories[0].id,
        priceBeforeDiscount: "35000000",
        priceAfterDiscount: "33500000",
        quantity: 8,
        image: "/uploads/samsung-s24-ultra.png"
      },
      {
        name: "کاور چرمی آیفون",
        description: "کاور چرمی اصل برای آیفون 15 سری، رنگ قهوه‌ای",
        categoryId: createdCategories[1].id,
        priceBeforeDiscount: "350000",
        priceAfterDiscount: "299000",
        quantity: 20,
        image: "/uploads/iphone-case.png"
      },
      {
        name: "محافظ صفحه شیشه‌ای",
        description: "محافظ صفحه شیشه‌ای ضد ضربه برای انواع گوشی",
        categoryId: createdCategories[1].id,
        priceBeforeDiscount: "120000",
        priceAfterDiscount: "95000",
        quantity: 50,
        image: "/uploads/screen-protector.png"
      },
      {
        name: "آیپد پرو 12.9 اینچ",
        description: "تبلت آیپد پرو 12.9 اینچ نسل پنجم با چیپ M2",
        categoryId: createdCategories[2].id,
        priceBeforeDiscount: "28000000",
        priceAfterDiscount: "26500000",
        quantity: 3,
        image: "/uploads/ipad-pro.png"
      },
      {
        name: "تبلت سامسونگ گلکسی Tab S9",
        description: "تبلت سامسونگ گلکسی Tab S9 با صفحه 11 اینچ",
        categoryId: createdCategories[2].id,
        priceBeforeDiscount: "18000000",
        priceAfterDiscount: "17200000",
        quantity: 6,
        image: "/uploads/samsung-tab-s9.png"
      }
    ];

    for (const productData of testProducts) {
      const product: Product = {
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
        createdAt: new Date(),
      };
      this.products.set(product.id, product);
    }
    console.log("🛍️ 6 محصول تستی ایجاد شد");
    console.log("✅ تمام داده‌های تستی با موفقیت ایجاد شدند");
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
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
    return Array.from(this.users.values()).find(user => user.googleId === googleId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email || null,
      role: insertUser.role || 'user_level_1',
      password: insertUser.password || null,
      googleId: insertUser.googleId || null,
      profilePicture: insertUser.profilePicture || null,
      whatsappNumber: insertUser.whatsappNumber || null,
      whatsappToken: insertUser.whatsappToken || null,
      parentUserId: insertUser.parentUserId || null,
      isWhatsappRegistered: insertUser.isWhatsappRegistered || false,
      welcomeMessage: insertUser.welcomeMessage || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, password: hashedPassword };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserByWhatsappNumber(whatsappNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.whatsappNumber === whatsappNumber);
  }

  async getSubUsers(parentUserId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.parentUserId === parentUserId);
  }

  async getUsersVisibleToUser(userId: string, userRole: string): Promise<User[]> {
    const allUsers = Array.from(this.users.values());
    
    if (userRole === 'admin') {
      // Admin can see all users
      return allUsers;
    } else if (userRole === 'user_level_1') {
      // Level 1 users can see their sub-users (level 2) only
      return allUsers.filter(user => user.parentUserId === userId);
    } else if (userRole === 'user_level_2') {
      // Level 2 users can only see themselves
      return allUsers.filter(user => user.id === userId);
    }
    
    return [];
  }

  // Tickets
  async getTicket(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async getTicketsByUser(userId: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(ticket => ticket.userId === userId);
  }

  async getAllTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values());
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = randomUUID();
    const ticket: Ticket = {
      ...insertTicket,
      id,
      priority: insertTicket.priority || 'medium',
      attachments: insertTicket.attachments || null,
      status: "unread",
      adminReply: null,
      adminReplyAt: null,
      lastResponseAt: new Date(),
      createdAt: new Date(),
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket = { ...ticket, ...updates };
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async deleteTicket(id: string): Promise<boolean> {
    return this.tickets.delete(id);
  }

  // Subscriptions
  async getSubscription(id: string): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values());
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = {
      ...insertSubscription,
      id,
      description: insertSubscription.description || null,
      image: insertSubscription.image || null,
      duration: insertSubscription.duration || 'monthly',
      priceBeforeDiscount: insertSubscription.priceBeforeDiscount || null,
      priceAfterDiscount: insertSubscription.priceAfterDiscount || null,
      features: insertSubscription.features || null,
      isActive: insertSubscription.isActive !== undefined ? insertSubscription.isActive : true,
      isDefault: false,
      createdAt: new Date(),
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;
    
    const updatedSubscription = { ...subscription, ...updates };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async deleteSubscription(id: string): Promise<boolean> {
    return this.subscriptions.delete(id);
  }

  // Products
  async getProduct(id: string, currentUserId: string, userRole: string): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    // Apply role-based access control
    if (userRole === 'admin' || userRole === 'user_level_1') {
      // Admin and level 1 can only access their own products
      return product.userId === currentUserId ? product : undefined;
    } else if (userRole === 'user_level_2') {
      // Level 2 can only access products from level 1 users
      const productOwner = this.users.get(product.userId);
      return (productOwner && productOwner.role === 'user_level_1') ? product : undefined;
    }
    return undefined;
  }

  async getProductsByUser(userId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.userId === userId);
  }

  async getAllProducts(currentUserId: string, userRole: string): Promise<Product[]> {
    if (!currentUserId || !userRole) {
      throw new Error('User context required for getAllProducts');
    }

    const allProducts = Array.from(this.products.values());
    
    // Filter based on user role
    if (userRole === 'admin') {
      // Admin sees only their own products
      return allProducts.filter(product => product.userId === currentUserId);
    } else if (userRole === 'user_level_1') {
      // Level 1 sees only their own products  
      return allProducts.filter(product => product.userId === currentUserId);
    } else if (userRole === 'user_level_2') {
      // Level 2 sees products from their parent user
      const currentUser = this.users.get(currentUserId);
      if (!currentUser || !currentUser.parentUserId) {
        // If no parent user found, return empty array
        return [];
      }
      
      // Return products from parent user
      return allProducts.filter(product => product.userId === currentUser.parentUserId);
    }
    
    return [];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      description: insertProduct.description || null,
      image: insertProduct.image || null,
      categoryId: insertProduct.categoryId || null,
      quantity: insertProduct.quantity || 0,
      priceAfterDiscount: insertProduct.priceAfterDiscount || null,
      isActive: insertProduct.isActive !== undefined ? insertProduct.isActive : true,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>, currentUserId: string, userRole: string): Promise<Product | undefined> {
    // user_level_2 cannot modify products, only view them
    if (userRole === 'user_level_2') {
      return undefined;
    }
    
    const product = await this.getProduct(id, currentUserId, userRole);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string, currentUserId: string, userRole: string): Promise<boolean> {
    // user_level_2 cannot modify products, only view them
    if (userRole === 'user_level_2') {
      return false;
    }
    
    const product = await this.getProduct(id, currentUserId, userRole);
    if (!product) return false;
    
    return this.products.delete(id);
  }

  // WhatsApp Settings
  async getWhatsappSettings(): Promise<WhatsappSettings | undefined> {
    return this.whatsappSettings;
  }

  async updateWhatsappSettings(settings: InsertWhatsappSettings): Promise<WhatsappSettings> {
    const whatsappSettings: WhatsappSettings = {
      ...settings,
      id: this.whatsappSettings?.id || randomUUID(),
      token: settings.token || null,
      isEnabled: settings.isEnabled || false,
      notifications: settings.notifications || null,
      aiName: settings.aiName || "من هوش مصنوعی هستم",
      updatedAt: new Date(),
    };
    this.whatsappSettings = whatsappSettings;
    return whatsappSettings;
  }

  // Messages
  async getSentMessagesByUser(userId: string): Promise<SentMessage[]> {
    return Array.from(this.sentMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async createSentMessage(insertMessage: InsertSentMessage): Promise<SentMessage> {
    const id = randomUUID();
    const message: SentMessage = {
      ...insertMessage,
      id,
      status: insertMessage.status || "sent",
      timestamp: new Date(),
    };
    this.sentMessages.set(id, message);
    return message;
  }

  async getReceivedMessagesByUser(userId: string): Promise<ReceivedMessage[]> {
    return Array.from(this.receivedMessages.values()).filter(message => message.userId === userId);
  }

  async getReceivedMessagesByUserPaginated(userId: string, page: number, limit: number): Promise<{ messages: ReceivedMessage[], total: number, totalPages: number }> {
    const allMessages = Array.from(this.receivedMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
    
    const total = allMessages.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const messages = allMessages.slice(offset, offset + limit);
    
    return { messages, total, totalPages };
  }

  async getReceivedMessageByWhatsiPlusId(whatsiPlusId: string): Promise<ReceivedMessage | undefined> {
    return Array.from(this.receivedMessages.values()).find(message => message.whatsiPlusId === whatsiPlusId);
  }

  async getReceivedMessageByWhatsiPlusIdAndUser(whatsiPlusId: string, userId: string): Promise<ReceivedMessage | undefined> {
    return Array.from(this.receivedMessages.values()).find(message => 
      message.whatsiPlusId === whatsiPlusId && message.userId === userId
    );
  }

  async createReceivedMessage(insertMessage: InsertReceivedMessage): Promise<ReceivedMessage> {
    const id = randomUUID();
    const message: ReceivedMessage = {
      ...insertMessage,
      id,
      status: insertMessage.status || "خوانده نشده",
      originalDate: insertMessage.originalDate || null,
      imageUrl: insertMessage.imageUrl || null,
      timestamp: new Date(),
    };
    this.receivedMessages.set(id, message);
    return message;
  }

  async updateReceivedMessageStatus(id: string, status: string): Promise<ReceivedMessage | undefined> {
    const message = this.receivedMessages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, status };
    this.receivedMessages.set(id, updatedMessage);
    return updatedMessage;
  }

  // AI Token Settings
  async getAiTokenSettings(provider?: string): Promise<AiTokenSettings | undefined> {
    if (provider) {
      return Array.from(this.aiTokenSettings.values()).find(s => s.provider === provider);
    }
    return Array.from(this.aiTokenSettings.values()).find(s => s.isActive);
  }

  async getAllAiTokenSettings(): Promise<AiTokenSettings[]> {
    return Array.from(this.aiTokenSettings.values());
  }

  async updateAiTokenSettings(settings: InsertAiTokenSettings): Promise<AiTokenSettings> {
    const existing = Array.from(this.aiTokenSettings.values()).find(s => s.provider === settings.provider);
    
    if (settings.isActive) {
      for (const [id, tokenSetting] of this.aiTokenSettings.entries()) {
        if (tokenSetting.provider !== settings.provider && tokenSetting.isActive) {
          this.aiTokenSettings.set(id, {
            ...tokenSetting,
            isActive: false,
            updatedAt: new Date(),
          });
        }
      }
    }
    
    const aiTokenSettings: AiTokenSettings = {
      ...settings,
      id: existing?.id || randomUUID(),
      provider: settings.provider,
      isActive: settings.isActive !== undefined ? settings.isActive : false,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.aiTokenSettings.set(aiTokenSettings.id, aiTokenSettings);
    return aiTokenSettings;
  }

  // User Subscriptions
  async getUserSubscription(userId: string): Promise<UserSubscription & { subscriptionName?: string | null; subscriptionDescription?: string | null } | undefined> {
    const userSub = Array.from(this.userSubscriptions.values()).find(sub => sub.userId === userId && sub.status === 'active');
    if (!userSub) return undefined;
    
    const subscription = this.subscriptions.get(userSub.subscriptionId);
    return {
      ...userSub,
      subscriptionName: subscription?.name,
      subscriptionDescription: subscription?.description,
    };
  }

  async getUserSubscriptionsByUserId(userId: string): Promise<UserSubscription[]> {
    return Array.from(this.userSubscriptions.values()).filter(sub => sub.userId === userId);
  }

  async getUserSubscriptionById(id: string): Promise<UserSubscription | undefined> {
    return this.userSubscriptions.get(id);
  }

  async getAllUserSubscriptions(): Promise<UserSubscription[]> {
    return Array.from(this.userSubscriptions.values());
  }

  async createUserSubscription(insertUserSubscription: InsertUserSubscription): Promise<UserSubscription> {
    const id = randomUUID();
    const userSubscription: UserSubscription = {
      ...insertUserSubscription,
      id,
      status: insertUserSubscription.status || 'active',
      startDate: insertUserSubscription.startDate || new Date(),
      remainingDays: insertUserSubscription.remainingDays || 0,
      isTrialPeriod: insertUserSubscription.isTrialPeriod || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userSubscriptions.set(id, userSubscription);
    return userSubscription;
  }

  async updateUserSubscription(id: string, updates: Partial<UserSubscription>): Promise<UserSubscription | undefined> {
    const userSubscription = this.userSubscriptions.get(id);
    if (!userSubscription) return undefined;
    
    const updatedUserSubscription = { 
      ...userSubscription, 
      ...updates,
      updatedAt: new Date()
    };
    this.userSubscriptions.set(id, updatedUserSubscription);
    return updatedUserSubscription;
  }

  async deleteUserSubscription(id: string): Promise<boolean> {
    return this.userSubscriptions.delete(id);
  }

  async updateRemainingDays(id: string, remainingDays: number): Promise<UserSubscription | undefined> {
    const userSubscription = this.userSubscriptions.get(id);
    if (!userSubscription) return undefined;
    
    const status = remainingDays <= 0 ? 'expired' : 'active';
    const updatedUserSubscription = { 
      ...userSubscription, 
      remainingDays,
      status,
      updatedAt: new Date()
    };
    this.userSubscriptions.set(id, updatedUserSubscription);
    return updatedUserSubscription;
  }

  async getActiveUserSubscriptions(): Promise<UserSubscription[]> {
    return Array.from(this.userSubscriptions.values()).filter(sub => sub.status === 'active');
  }

  async getExpiredUserSubscriptions(): Promise<UserSubscription[]> {
    return Array.from(this.userSubscriptions.values()).filter(sub => sub.status === 'expired');
  }

  // Categories
  async getCategory(id: string, currentUserId: string, userRole: string): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    // Check ownership based on user role
    if (userRole === 'admin' || userRole === 'user_level_1') {
      // Admin and level 1 can only access their own categories
      if (category.createdBy !== currentUserId) {
        return undefined;
      }
    } else if (userRole === 'user_level_2') {
      // Level 2 can only access categories from level 1 users
      const level1Users = Array.from(this.users.values()).filter(user => user.role === 'user_level_1');
      const level1UserIds = level1Users.map(user => user.id);
      if (!level1UserIds.includes(category.createdBy)) {
        return undefined;
      }
    } else {
      return undefined;
    }
    
    return category;
  }

  async getAllCategories(currentUserId: string, userRole: string): Promise<Category[]> {
    if (!currentUserId || !userRole) {
      throw new Error('User context required for getAllCategories');
    }

    const allCategories = Array.from(this.categories.values());
    let filteredCategories: Category[] = [];
    
    // Filter based on user role
    if (userRole === 'admin') {
      // Admin sees only their own categories
      filteredCategories = allCategories.filter(category => category.createdBy === currentUserId);
    } else if (userRole === 'user_level_1') {
      // Level 1 sees only their own categories  
      filteredCategories = allCategories.filter(category => category.createdBy === currentUserId);
    } else if (userRole === 'user_level_2') {
      // Level 2 sees only categories from level 1 users
      const level1Users = Array.from(this.users.values()).filter(user => user.role === 'user_level_1');
      const level1UserIds = level1Users.map(user => user.id);
      filteredCategories = allCategories.filter(category => level1UserIds.includes(category.createdBy));
    }
    
    return filteredCategories.sort((a, b) => a.order - b.order);
  }

  async getCategoriesByParent(parentId: string | null, currentUserId: string, userRole: string): Promise<Category[]> {
    const allCategories = await this.getAllCategories(currentUserId, userRole);
    return allCategories.filter(category => category.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  }

  async getCategoryTree(currentUserId: string, userRole: string): Promise<Category[]> {
    const allCategories = await this.getAllCategories(currentUserId, userRole);
    
    // Build tree structure (this is a simplified version, full tree building would be more complex)
    return allCategories.filter(cat => cat.parentId === null);
  }

  async createCategory(insertCategory: InsertCategory, createdBy: string): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      description: insertCategory.description || null,
      parentId: insertCategory.parentId || null,
      order: insertCategory.order || 0,
      isActive: insertCategory.isActive !== undefined ? insertCategory.isActive : true,
      createdBy: createdBy, // Server provides this field
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updates: Partial<Category>, currentUserId: string, userRole: string): Promise<Category | undefined> {
    const category = await this.getCategory(id, currentUserId, userRole);
    if (!category) return undefined;
    
    const updatedCategory = { 
      ...category, 
      ...updates,
      updatedAt: new Date()
    };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: string, currentUserId: string, userRole: string): Promise<boolean> {
    const category = await this.getCategory(id, currentUserId, userRole);
    if (!category) return false;
    
    return this.categories.delete(id);
  }

  async reorderCategories(updates: { id: string; order: number; parentId?: string | null }[]): Promise<boolean> {
    try {
      for (const update of updates) {
        const category = this.categories.get(update.id);
        if (category) {
          const updatedCategory = {
            ...category,
            order: update.order,
            parentId: update.parentId !== undefined ? update.parentId : category.parentId,
            updatedAt: new Date()
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
  async getCart(userId: string): Promise<Cart | undefined> {
    return Array.from(this.carts.values()).find(cart => cart.userId === userId);
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    const cart = await this.getCart(userId);
    if (!cart) return [];
    
    return Array.from(this.cartItems.values()).filter(item => item.cartId === cart.id);
  }

  async getCartItemsWithProducts(userId: string): Promise<(CartItem & { productName: string; productDescription?: string; productImage?: string })[]> {
    const cartItems = await this.getCartItems(userId);
    
    return cartItems.map(item => {
      const product = this.products.get(item.productId);
      return {
        ...item,
        productName: product?.name || 'محصول حذف شده',
        productDescription: product?.description || undefined,
        productImage: product?.image || undefined,
      };
    });
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error('محصول یافت نشد');
    }

    // Get or create cart for user
    let cart = await this.getCart(userId);
    if (!cart) {
      const cartId = randomUUID();
      cart = {
        id: cartId,
        userId,
        totalAmount: "0",
        itemCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.carts.set(cartId, cart);
    }

    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.cartId === cart!.id && item.productId === productId
    );

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      return await this.updateCartItemQuantity(existingItem.id, newQuantity, userId) || existingItem;
    } else {
      // Add new item
      const unitPrice = product.priceAfterDiscount || product.priceBeforeDiscount;
      const totalPrice = parseFloat(unitPrice) * quantity;
      
      const cartItemId = randomUUID();
      const cartItem: CartItem = {
        id: cartItemId,
        cartId: cart.id,
        productId,
        quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.cartItems.set(cartItemId, cartItem);
      await this.updateCartTotals(cart.id);
      return cartItem;
    }
  }

  async updateCartItemQuantity(itemId: string, quantity: number, userId: string): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(itemId);
    if (!cartItem) return undefined;

    // Verify item belongs to user's cart
    const cart = this.carts.get(cartItem.cartId);
    if (!cart || cart.userId !== userId) return undefined;

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await this.removeFromCart(itemId, userId);
      return undefined;
    }

    const product = this.products.get(cartItem.productId);
    if (!product) return undefined;

    const unitPrice = parseFloat(cartItem.unitPrice);
    const totalPrice = unitPrice * quantity;

    const updatedItem: CartItem = {
      ...cartItem,
      quantity,
      totalPrice: totalPrice.toString(),
      updatedAt: new Date(),
    };

    this.cartItems.set(itemId, updatedItem);
    await this.updateCartTotals(cart.id);
    return updatedItem;
  }

  async removeFromCart(itemId: string, userId: string): Promise<boolean> {
    const cartItem = this.cartItems.get(itemId);
    if (!cartItem) return false;

    // Verify item belongs to user's cart
    const cart = this.carts.get(cartItem.cartId);
    if (!cart || cart.userId !== userId) return false;

    const removed = this.cartItems.delete(itemId);
    if (removed) {
      await this.updateCartTotals(cart.id);
    }
    return removed;
  }

  async clearCart(userId: string): Promise<boolean> {
    const cart = await this.getCart(userId);
    if (!cart) return false;

    // Remove all cart items
    const cartItems = Array.from(this.cartItems.values()).filter(item => item.cartId === cart.id);
    cartItems.forEach(item => this.cartItems.delete(item.id));

    // Update cart totals
    await this.updateCartTotals(cart.id);
    return true;
  }

  private async updateCartTotals(cartId: string): Promise<void> {
    const cart = this.carts.get(cartId);
    if (!cart) return;

    const cartItems = Array.from(this.cartItems.values()).filter(item => item.cartId === cartId);
    const totalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const updatedCart: Cart = {
      ...cart,
      totalAmount: totalAmount.toString(),
      itemCount,
      updatedAt: new Date(),
    };

    this.carts.set(cartId, updatedCart);
  }

  // Addresses
  async getAddress(id: string): Promise<Address | undefined> {
    return this.addresses.get(id);
  }

  async getAddressesByUser(userId: string): Promise<Address[]> {
    return Array.from(this.addresses.values()).filter(address => address.userId === userId);
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const id = randomUUID();
    
    // If this is the user's first address, set it as default
    const userAddresses = await this.getAddressesByUser(insertAddress.userId);
    const isFirstAddress = userAddresses.length === 0;
    
    const address: Address = {
      ...insertAddress,
      id,
      latitude: insertAddress.latitude || null,
      longitude: insertAddress.longitude || null,
      postalCode: insertAddress.postalCode || null,
      isDefault: insertAddress.isDefault || isFirstAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.addresses.set(id, address);
    return address;
  }

  async updateAddress(id: string, updates: Partial<Address>, userId: string): Promise<Address | undefined> {
    const address = this.addresses.get(id);
    if (!address || address.userId !== userId) return undefined;
    
    const updatedAddress: Address = {
      ...address,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.addresses.set(id, updatedAddress);
    return updatedAddress;
  }

  async deleteAddress(id: string, userId: string): Promise<boolean> {
    const address = this.addresses.get(id);
    if (!address || address.userId !== userId) return false;
    
    return this.addresses.delete(id);
  }

  async setDefaultAddress(addressId: string, userId: string): Promise<boolean> {
    const address = this.addresses.get(addressId);
    if (!address || address.userId !== userId) return false;
    
    // Remove default from all user addresses
    const userAddresses = await this.getAddressesByUser(userId);
    userAddresses.forEach(addr => {
      if (addr.isDefault) {
        const updatedAddr = { ...addr, isDefault: false, updatedAt: new Date() };
        this.addresses.set(addr.id, updatedAddr);
      }
    });
    
    // Set new default address
    const updatedAddress = { ...address, isDefault: true, updatedAt: new Date() };
    this.addresses.set(addressId, updatedAddress);
    return true;
  }

  // Orders
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getOrdersBySeller(sellerId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.sellerId === sellerId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const orderNumber = this.generateOrderNumber();
    
    const order: Order = {
      ...insertOrder,
      id,
      orderNumber,
      addressId: insertOrder.addressId || null,
      shippingMethod: insertOrder.shippingMethod || null,
      status: "pending",
      statusHistory: ["pending"],
      notes: insertOrder.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string, sellerId: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order || order.sellerId !== sellerId) return undefined;
    
    const statusHistory = [...(order.statusHistory || []), status];
    
    const updatedOrder: Order = {
      ...order,
      status,
      statusHistory,
      updatedAt: new Date(),
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  async getNewOrdersCount(sellerId: string): Promise<number> {
    const sellerOrders = Array.from(this.orders.values())
      .filter(order => order.sellerId === sellerId && order.status === 'awaiting_payment');
    return sellerOrders.length;
  }

  async getUnshippedOrdersCount(sellerId: string): Promise<number> {
    const unpaidAndPendingStatuses = ['awaiting_payment', 'pending'];
    const sellerUnpaidAndPendingOrders = Array.from(this.orders.values())
      .filter(order => order.sellerId === sellerId && unpaidAndPendingStatuses.includes(order.status));
    return sellerUnpaidAndPendingOrders.length;
  }

  async getPaidOrdersCount(sellerId: string): Promise<number> {
    const paidOrders = Array.from(this.orders.values())
      .filter(order => order.sellerId === sellerId && order.status !== 'awaiting_payment');
    return paidOrders.length;
  }

  async getPendingOrdersCount(sellerId: string): Promise<number> {
    const pendingOrders = Array.from(this.orders.values())
      .filter(order => order.sellerId === sellerId && order.status === 'pending');
    return pendingOrders.length;
  }

  async getPendingPaymentOrdersCount(userId: string): Promise<number> {
    const userPendingPaymentOrders = Array.from(this.orders.values())
      .filter(order => order.userId === userId && order.status === 'awaiting_payment');
    return userPendingPaymentOrders.length;
  }

  async getAwaitingPaymentOrdersByUser(userId: string): Promise<Order[]> {
    // Get orders that are awaiting payment for user, sorted by creation date (oldest first)
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId && order.status === 'awaiting_payment')
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB; // oldest first
      });
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async getOrderItemsWithProducts(orderId: string): Promise<(OrderItem & { productName: string; productDescription?: string; productImage?: string })[]> {
    const orderItems = await this.getOrderItems(orderId);
    return orderItems.map(item => {
      const product = this.products.get(item.productId);
      return {
        ...item,
        productName: product?.name || 'محصول حذف شده',
        productDescription: product?.description || undefined,
        productImage: product?.image || undefined,
      };
    });
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    
    const orderItem: OrderItem = {
      ...insertOrderItem,
      id,
      createdAt: new Date(),
    };
    
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Transactions
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getTransactionsByUserAndType(userId: string, type: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId && transaction.type === type)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    
    const transaction: Transaction = {
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
      createdAt: new Date(),
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction: Transaction = {
      ...transaction,
      status,
    };
    
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async getUserBalance(userId: string): Promise<number> {
    const transactions = await this.getTransactionsByUser(userId);
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    
    let balance = 0;
    completedTransactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      if (transaction.type === 'deposit') {
        balance += amount;
      } else if (transaction.type === 'withdraw' || transaction.type === 'order_payment') {
        balance -= amount;
      }
    });
    
    return Math.max(balance, 0);
  }

  async getPendingTransactionsCount(sellerId: string): Promise<number> {
    // Count transactions that are pending and belong to sub-users of this seller
    const subUsers = await this.getSubUsers(sellerId);
    const subUserIds = subUsers.map(user => user.id);
    
    return Array.from(this.transactions.values())
      .filter(transaction => 
        transaction.status === 'pending' && 
        subUserIds.includes(transaction.userId)
      ).length;
  }

  async getSuccessfulTransactionsBySellers(sellerIds: string[]): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => 
        transaction.status === 'completed' && 
        transaction.type === 'order_payment' &&
        transaction.orderId
      )
      .filter(transaction => {
        const order = this.orders.get(transaction.orderId!);
        return order && sellerIds.includes(order.sellerId);
      })
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  // Deposit approval methods
  async getDepositsByParent(parentUserId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => 
        transaction.type === 'deposit' && 
        transaction.parentUserId === parentUserId
      )
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async approveDeposit(transactionId: string, approvedByUserId: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return undefined;
    
    const updatedTransaction: Transaction = {
      ...transaction,
      status: 'completed',
      approvedByUserId,
      approvedAt: new Date(),
    };
    
    this.transactions.set(transactionId, updatedTransaction);
    return updatedTransaction;
  }

  async getApprovedDepositsTotalByParent(parentUserId: string): Promise<number> {
    const approvedDeposits = Array.from(this.transactions.values())
      .filter(transaction => 
        transaction.type === 'deposit' && 
        transaction.parentUserId === parentUserId &&
        transaction.status === 'completed' &&
        transaction.approvedByUserId
      );
    
    return approvedDeposits.reduce((total, transaction) => {
      return total + parseFloat(transaction.amount);
    }, 0);
  }

  async getTransactionByReferenceId(referenceId: string, userId: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values())
      .find(transaction => 
        transaction.referenceId === referenceId && 
        transaction.userId === userId
      );
  }

  // Internal Chat methods
  async getInternalChatById(id: string): Promise<InternalChat | undefined> {
    return this.internalChats.get(id);
  }

  async getInternalChatsBetweenUsers(user1Id: string, user2Id: string): Promise<InternalChat[]> {
    return Array.from(this.internalChats.values())
      .filter(chat => 
        (chat.senderId === user1Id && chat.receiverId === user2Id) ||
        (chat.senderId === user2Id && chat.receiverId === user1Id)
      )
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async getInternalChatsForSeller(sellerId: string): Promise<(InternalChat & { senderName?: string; receiverName?: string })[]> {
    const chats = Array.from(this.internalChats.values())
      .filter(chat => chat.senderId === sellerId || chat.receiverId === sellerId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

    return chats.map(chat => {
      const sender = this.users.get(chat.senderId);
      const receiver = this.users.get(chat.receiverId);
      return {
        ...chat,
        senderName: sender ? `${sender.firstName} ${sender.lastName}` : undefined,
        receiverName: receiver ? `${receiver.firstName} ${receiver.lastName}` : undefined,
      };
    });
  }

  async createInternalChat(chat: InsertInternalChat): Promise<InternalChat> {
    const id = randomUUID();
    const newChat: InternalChat = {
      ...chat,
      id,
      isRead: false,
      createdAt: new Date()
    };
    
    this.internalChats.set(id, newChat);
    return newChat;
  }

  async markInternalChatAsRead(id: string): Promise<InternalChat | undefined> {
    const chat = this.internalChats.get(id);
    if (!chat) return undefined;

    const updatedChat = { ...chat, isRead: true };
    this.internalChats.set(id, updatedChat);
    return updatedChat;
  }

  async getUnreadMessagesCountForUser(userId: string, userRole: string): Promise<number> {
    if (userRole === "user_level_2") {
      // کاربران سطح 2: پیام‌های خوانده نشده از والد (فروشنده)
      const user = this.users.get(userId);
      if (!user || !user.parentUserId) return 0;
      
      return Array.from(this.internalChats.values())
        .filter(chat => 
          chat.senderId === user.parentUserId && 
          chat.receiverId === userId && 
          !chat.isRead
        ).length;
    } else if (userRole === "user_level_1") {
      // کاربران سطح 1: تمام پیام‌های خوانده نشده از زیرمجموعه‌ها
      const subUsers = Array.from(this.users.values()).filter(user => user.parentUserId === userId);
      const subUserIds = subUsers.map(user => user.id);
      
      return Array.from(this.internalChats.values())
        .filter(chat => 
          subUserIds.includes(chat.senderId) && 
          chat.receiverId === userId && 
          !chat.isRead
        ).length;
    }
    
    return 0;
  }

  async markAllMessagesAsReadForUser(userId: string, userRole: string): Promise<boolean> {
    try {
      if (userRole === "user_level_2") {
        // کاربران سطح 2: علامت‌گذاری پیام‌های دریافتی از والد
        const user = this.users.get(userId);
        if (!user || !user.parentUserId) return true; // No parent means no messages to mark, which is success
        
        Array.from(this.internalChats.entries()).forEach(([id, chat]) => {
          if (chat.senderId === user.parentUserId && chat.receiverId === userId && !chat.isRead) {
            this.internalChats.set(id, { ...chat, isRead: true });
          }
        });
      } else if (userRole === "user_level_1") {
        // کاربران سطح 1: علامت‌گذاری پیام‌های دریافتی از زیرمجموعه‌ها
        const subUsers = Array.from(this.users.values()).filter(user => user.parentUserId === userId);
        const subUserIds = subUsers.map(user => user.id);
        
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
  async getFaq(id: string): Promise<Faq | undefined> {
    return this.faqs.get(id);
  }

  async getAllFaqs(includeInactive: boolean = false): Promise<Faq[]> {
    return Array.from(this.faqs.values())
      .filter(faq => includeInactive || faq.isActive)
      .sort((a, b) => a.order - b.order);
  }

  async getActiveFaqs(): Promise<Faq[]> {
    return Array.from(this.faqs.values())
      .filter(faq => faq.isActive)
      .sort((a, b) => a.order - b.order);
  }

  async getFaqsByCreator(creatorId: string): Promise<Faq[]> {
    return Array.from(this.faqs.values())
      .filter(faq => faq.isActive && faq.createdBy === creatorId)
      .sort((a, b) => a.order - b.order);
  }

  async createFaq(faq: InsertFaq, createdBy: string): Promise<Faq> {
    const id = randomUUID();
    const newFaq: Faq = {
      ...faq,
      id,
      createdBy,
      isActive: faq.isActive ?? true,
      order: faq.order ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.faqs.set(id, newFaq);
    return newFaq;
  }

  async updateFaq(id: string, faq: UpdateFaq): Promise<Faq | undefined> {
    const existingFaq = this.faqs.get(id);
    if (!existingFaq) return undefined;

    const updatedFaq: Faq = {
      ...existingFaq,
      ...faq,
      updatedAt: new Date(),
    };

    this.faqs.set(id, updatedFaq);
    return updatedFaq;
  }

  async deleteFaq(id: string): Promise<boolean> {
    return this.faqs.delete(id);
  }

  async updateFaqOrder(id: string, newOrder: number): Promise<Faq | undefined> {
    const faq = this.faqs.get(id);
    if (!faq) return undefined;

    const updatedFaq: Faq = {
      ...faq,
      order: newOrder,
      updatedAt: new Date(),
    };

    this.faqs.set(id, updatedFaq);
    return updatedFaq;
  }

  // Shipping Settings
  async getShippingSettings(userId: string): Promise<ShippingSettings | undefined> {
    return Array.from(this.shippingSettings.values()).find(s => s.userId === userId);
  }

  async updateShippingSettings(userId: string, settings: UpdateShippingSettings): Promise<ShippingSettings> {
    const existing = await this.getShippingSettings(userId);
    
    if (existing) {
      const updated: ShippingSettings = {
        ...existing,
        ...settings,
        updatedAt: new Date(),
      };
      this.shippingSettings.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newSettings: ShippingSettings = {
        id,
        userId,
        postPishtazEnabled: settings.postPishtazEnabled ?? false,
        postNormalEnabled: settings.postNormalEnabled ?? false,
        piykEnabled: settings.piykEnabled ?? false,
        freeShippingEnabled: settings.freeShippingEnabled ?? false,
        freeShippingMinAmount: settings.freeShippingMinAmount ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.shippingSettings.set(id, newSettings);
      return newSettings;
    }
  }

  // VAT Settings
  async getVatSettings(userId: string): Promise<VatSettings | undefined> {
    return Array.from(this.vatSettings.values()).find(s => s.userId === userId);
  }

  async updateVatSettings(userId: string, settings: UpdateVatSettings): Promise<VatSettings> {
    const existing = await this.getVatSettings(userId);
    
    if (existing) {
      const updated: VatSettings = {
        ...existing,
        ...settings,
        updatedAt: new Date(),
      };
      this.vatSettings.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newSettings: VatSettings = {
        id,
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
      };
      this.vatSettings.set(id, newSettings);
      return newSettings;
    }
  }

  // Password Reset OTP
  async createPasswordResetOtp(userId: string, otp: string, expiresAt: Date): Promise<PasswordResetOtp> {
    const id = randomUUID();
    const newOtp: PasswordResetOtp = {
      id,
      userId,
      otp,
      isUsed: false,
      expiresAt,
      createdAt: new Date(),
    };
    this.passwordResetOtps.set(id, newOtp);
    return newOtp;
  }

  async getValidPasswordResetOtp(userId: string, otp: string): Promise<PasswordResetOtp | undefined> {
    const now = new Date();
    return Array.from(this.passwordResetOtps.values()).find(
      otpRecord => 
        otpRecord.userId === userId && 
        otpRecord.otp === otp && 
        !otpRecord.isUsed && 
        otpRecord.expiresAt > now
    );
  }

  async markOtpAsUsed(id: string): Promise<boolean> {
    const otp = this.passwordResetOtps.get(id);
    if (otp) {
      otp.isUsed = true;
      this.passwordResetOtps.set(id, otp);
      return true;
    }
    return false;
  }

  async deleteExpiredOtps(): Promise<void> {
    const now = new Date();
    for (const [id, otp] of this.passwordResetOtps.entries()) {
      if (otp.isUsed || otp.expiresAt < now) {
        this.passwordResetOtps.delete(id);
      }
    }
  }

  // Login Logs
  async createLoginLog(log: InsertLoginLog): Promise<LoginLog> {
    const id = randomUUID();
    const newLog: LoginLog = {
      id,
      userId: log.userId,
      username: log.username,
      ipAddress: log.ipAddress || null,
      userAgent: log.userAgent || null,
      loginAt: new Date(),
    };
    this.loginLogs.set(id, newLog);
    return newLog;
  }

  async getLoginLogs(page: number = 1, limit: number = 50): Promise<{ logs: LoginLog[], total: number, totalPages: number }> {
    const allLogs = Array.from(this.loginLogs.values()).sort((a, b) => 
      (b.loginAt?.getTime() || 0) - (a.loginAt?.getTime() || 0)
    );
    const total = allLogs.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const logs = allLogs.slice(startIndex, startIndex + limit);
    return { logs, total, totalPages };
  }

  async getLoginLogsByUser(userId: string): Promise<LoginLog[]> {
    return Array.from(this.loginLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => (b.loginAt?.getTime() || 0) - (a.loginAt?.getTime() || 0));
  }
}

import { DbStorage } from "./db-storage";

export const storage = process.env.NODE_ENV === "test" ? new MemStorage() : new DbStorage();
