import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      const tokenSettings = await storage.getAiTokenSettings();
      if (tokenSettings?.token && tokenSettings.isActive) {
        this.genAI = new GoogleGenerativeAI(tokenSettings.token);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        console.log("🤖 سرویس Gemini AI با موفقیت راه‌اندازی شد");
      } else {
        console.log("⚠️ توکن Gemini AI تنظیم نشده یا غیرفعال است");
      }
    } catch (error) {
      console.error("❌ خطا در راه‌اندازی Gemini AI:", error);
    }
  }

  async reinitialize() {
    await this.initialize();
  }

  async generateResponse(message: string, userId?: string): Promise<string> {
    if (!this.model) {
      throw new Error("Gemini AI فعال نیست. لطفاً توکن API را تنظیم کنید.");
    }

    try {
      // دریافت نام هوش مصنوعی از تنظیمات
      let aiName = "من هوش مصنوعی هستم"; // پیش‌فرض
      
      try {
        // همیشه از تنظیمات واتس‌اپ برای دریافت نام استفاده کن (برای همه کاربران)
        const whatsappSettings = await storage.getWhatsappSettings();
        if (whatsappSettings?.aiName) {
          aiName = whatsappSettings.aiName;
        }
      } catch (settingsError) {
        console.error("خطا در دریافت نام هوش مصنوعی:", settingsError);
        // ادامه با نام پیش‌فرض
      }

      // normalize کردن متن برای تشخیص بهتر سوالات فارسی
      const normalizeText = (text: string): string => {
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
      };

      const normalizedMessage = normalizeText(message);
      
      // الگوهای مختلف سوالات نام (فارسی و انگلیسی)
      const nameQuestionPatterns = [
        /(اسم(ت| شما)?\s*(چیه|چیست|چی\s*هست))/,
        /(نام(ت| شما)?\s*(چیه|چیست))/,
        /(تو\s*کی(ی|\s*هستی)?)/,
        /(چه\s*اسمی\s*داری)/,
        /(خودت\s*رو\s*معرفی\s*کن)/,
        /(who\s*are\s*you)/,
        /(what'?s\s*your\s*name)/
      ];
      
      const isNameQuestion = nameQuestionPatterns.some(pattern => 
        pattern.test(normalizedMessage)
      );

      // اگر سوال در مورد نام بود، مستقیماً نام را برگردان
      if (isNameQuestion) {
        return aiName;
      }
      
      // اضافه کردن context فارسی برای پاسخ‌های بهتر
      const prompt = `${aiName} و به زبان فارسی پاسخ می‌دهم. لطفاً به این پیام پاسخ دهید:

${message}

پاسخ من باید:
- به زبان فارسی باشد
- حداکثر 20 کلمه باشد
- مؤدبانه و مستقیم باشد
- بدون توضیحات اضافی باشد`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const finalText = text.trim() || "متأسفانه نتوانستم پاسخ مناسبی تولید کنم.";
      
      // محدود کردن طول پاسخ برای ارسال بهتر
      if (finalText.length > 200) {
        return finalText.substring(0, 200) + '...';
      }
      
      return finalText;
    } catch (error) {
      console.error("❌ خطا در تولید پاسخ Gemini:", error);
      throw new Error("خطا در تولید پاسخ هوش مصنوعی");
    }
  }

  isActive(): boolean {
    return this.model !== null;
  }

  /**
   * استخراج اطلاعات مالی از متن پیام واریزی واتساپ
   * @param message متن پیام واریزی
   * @returns اطلاعات مالی استخراج شده
   */
  async extractDepositInfo(message: string): Promise<{
    amount: string | null;
    transactionDate: string | null;
    transactionTime: string | null;
    accountSource: string | null;
    paymentMethod: string | null;
    referenceId: string | null;
  }> {
    if (!this.model) {
      throw new Error("Gemini AI فعال نیست. لطفاً توکن API را تنظیم کنید.");
    }

    try {
      const prompt = `از متن زیر که یک رسید واریزی بانکی است، اطلاعات مالی را استخراج کن و به صورت JSON برگردان:

${message}

فرمت JSON خروجی:
{
  "amount": "مبلغ به ریال (فقط عدد)",
  "transactionDate": "تاریخ (شمسی یا میلادی)",
  "transactionTime": "ساعت",
  "accountSource": "نام بانک یا از حساب",
  "paymentMethod": "روش پرداخت (مثلا انتقال وجه، کارت به کارت)",
  "referenceId": "شماره پیگیری یا شماره مرجع"
}

مهم:
- اگر هر فیلدی در متن نبود، مقدار null بده
- amount رو فقط به صورت عدد بدون ممیز و واحد برگردان
- تمام فیلدها باید string یا null باشند
- فقط JSON برگردان، بدون توضیح اضافی`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // پاکسازی خروجی برای استخراج JSON
      let jsonText = text;
      
      // حذف markdown code blocks اگر وجود داشته باشد
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0].trim();
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1].split('```')[0].trim();
      }
      
      const extractedData = JSON.parse(jsonText);
      
      // اطمینان از اینکه همه فیلدها موجود باشند
      return {
        amount: extractedData.amount || null,
        transactionDate: extractedData.transactionDate || null,
        transactionTime: extractedData.transactionTime || null,
        accountSource: extractedData.accountSource || null,
        paymentMethod: extractedData.paymentMethod || null,
        referenceId: extractedData.referenceId || null,
      };
    } catch (error) {
      console.error("❌ خطا در استخراج اطلاعات واریزی:", error);
      // در صورت خطا، مقادیر پیش‌فرض برمی‌گردانیم
      return {
        amount: null,
        transactionDate: null,
        transactionTime: null,
        accountSource: null,
        paymentMethod: null,
        referenceId: null,
      };
    }
  }

  /**
   * تشخیص اینکه آیا پیام یک رسید واریزی است یا نه
   * @param message متن پیام
   * @returns true اگر پیام رسید واریزی باشد
   */
  async isDepositMessage(message: string): Promise<boolean> {
    if (!this.model) {
      return false;
    }

    try {
      const normalizeText = (text: string): string => {
        return text
          .normalize('NFKC')
          .replace(/\u200C|\u200F|\u200E/g, '')
          .toLowerCase();
      };

      const normalizedMessage = normalizeText(message);
      
      // کلمات کلیدی رسید واریزی
      const depositKeywords = [
        'واریز',
        'رسید',
        'پرداخت',
        'انتقال',
        'کارت به کارت',
        'شماره پیگیری',
        'مبلغ',
        'بانک',
        'حساب',
        'تراکنش',
        'مرجع',
        'ریال',
        'تومان'
      ];
      
      // بررسی اینکه حداقل 5 کلمه کلیدی در متن باشد (سخت‌تر شد)
      const keywordCount = depositKeywords.filter(keyword => 
        normalizedMessage.includes(keyword)
      ).length;
      
      // فقط اگر حداقل 5 کلمه کلیدی داشت، با AI بررسی کن
      if (keywordCount < 5) {
        return false;
      }
      
      // بررسی با هوش مصنوعی برای دقت بیشتر
      const prompt = `آیا متن زیر یک رسید واریزی بانکی، اطلاع واریز، یا اطلاعات پرداخت کامل است؟
      
${message}

توجه: فقط اگر مطمئن هستی که این یک رسید واریزی واقعی با اطلاعات کامل است، "بله" بگو. در غیر این صورت "خیر" بگو.

فقط با "بله" یا "خیر" پاسخ بده.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim().toLowerCase();
      
      return text.includes('بله') || text.includes('yes');
    } catch (error) {
      console.error("❌ خطا در تشخیص پیام واریزی:", error);
      return false;
    }
  }

  /**
   * بررسی اینکه آیا پیام حاوی لینک عکس است یا نه
   * @param message متن پیام
   * @returns لینک عکس یا null اگر عکس نباشد
   */
  extractImageUrl(message: string): string | null {
    try {
      // الگوی URL برای لینک‌های عکس
      const urlPattern = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|bmp|webp))/gi;
      const match = message.match(urlPattern);
      
      if (match && match.length > 0) {
        return match[0];
      }

      // بررسی لینک‌های WhatsiPlus که ممکن است extension نداشته باشند
      const whatsiPlusPattern = /(https?:\/\/api\.whatsiplus\.com\/[^\s]+)/gi;
      const whatsiMatch = message.match(whatsiPlusPattern);
      
      if (whatsiMatch && whatsiMatch.length > 0) {
        return whatsiMatch[0];
      }

      return null;
    } catch (error) {
      console.error("❌ خطا در استخراج لینک عکس:", error);
      return null;
    }
  }

  /**
   * دانلود عکس از URL
   * @param imageUrl آدرس عکس
   * @returns Base64 encoded image data
   */
  private async downloadImage(imageUrl: string): Promise<{ mimeType: string; data: string } | null> {
    try {
      console.log(`📥 در حال دانلود عکس از: ${imageUrl}`);
      
      const response = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'WhatsApp-Service/1.0',
        }
      });

      if (!response.ok) {
        console.error(`❌ خطا در دانلود عکس: ${response.status} ${response.statusText}`);
        return null;
      }

      // دریافت content type
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      // تبدیل به buffer و سپس base64
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString('base64');

      console.log(`✅ عکس با موفقیت دانلود شد (${contentType})`);
      
      return {
        mimeType: contentType,
        data: base64Data
      };
    } catch (error) {
      console.error("❌ خطا در دانلود عکس:", error);
      return null;
    }
  }

  /**
   * استخراج اطلاعات مالی از عکس رسید واریزی با استفاده از Gemini Vision
   * @param imageUrl آدرس عکس رسید
   * @returns اطلاعات مالی استخراج شده
   */
  async extractDepositInfoFromImage(imageUrl: string): Promise<{
    amount: string | null;
    transactionDate: string | null;
    transactionTime: string | null;
    accountSource: string | null;
    paymentMethod: string | null;
    referenceId: string | null;
  }> {
    if (!this.model) {
      throw new Error("Gemini AI فعال نیست. لطفاً توکن API را تنظیم کنید.");
    }

    try {
      console.log(`🖼️ در حال استخراج اطلاعات از عکس رسید...`);

      // دانلود عکس
      const imageData = await this.downloadImage(imageUrl);
      
      if (!imageData) {
        console.error("❌ نتوانستیم عکس را دانلود کنیم");
        return {
          amount: null,
          transactionDate: null,
          transactionTime: null,
          accountSource: null,
          paymentMethod: null,
          referenceId: null,
        };
      }

      // ارسال عکس به Gemini Vision API
      const prompt = `این تصویر یک رسید واریزی بانکی است. لطفاً اطلاعات مالی را از آن استخراج کن و به صورت JSON برگردان:

فرمت JSON خروجی:
{
  "amount": "مبلغ به ریال (فقط عدد)",
  "transactionDate": "تاریخ (شمسی یا میلادی)",
  "transactionTime": "ساعت",
  "accountSource": "شماره کارت مبدا (از کارت / مبدا) - فقط 16 رقم کارت",
  "paymentMethod": "روش پرداخت (مثلا انتقال وجه، کارت به کارت)",
  "referenceId": "شماره پیگیری یا شماره مرجع"
}

مهم:
- اگر هر فیلدی در تصویر نبود، مقدار null بده
- amount رو فقط به صورت عدد بدون ممیز و واحد برگردان
- accountSource باید شماره کارت 16 رقمی مبدا باشه (از قسمت "از کارت" یا "مبدا" یا نزدیک مبلغ)
- شماره کارت رو کامل بنویس، حتی اگر بعضی ارقام ستاره (*) هستند
- تمام فیلدها باید string یا null باشند
- فقط JSON برگردان، بدون توضیح اضافی
- دقت کن که اعداد فارسی را به انگلیسی تبدیل کنی`;

      const imagePart = {
        inlineData: {
          data: imageData.data,
          mimeType: imageData.mimeType
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text().trim();
      
      console.log(`📊 Gemini Vision Response:`, text);

      // پاکسازی خروجی برای استخراج JSON
      let jsonText = text;
      
      // حذف markdown code blocks اگر وجود داشته باشد
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0].trim();
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1].split('```')[0].trim();
      }
      
      const extractedData = JSON.parse(jsonText);
      
      console.log(`✅ اطلاعات از عکس استخراج شد:`, extractedData);

      // اطمینان از اینکه همه فیلدها موجود باشند
      return {
        amount: extractedData.amount || null,
        transactionDate: extractedData.transactionDate || null,
        transactionTime: extractedData.transactionTime || null,
        accountSource: extractedData.accountSource || null,
        paymentMethod: extractedData.paymentMethod || null,
        referenceId: extractedData.referenceId || null,
      };
    } catch (error) {
      console.error("❌ خطا در استخراج اطلاعات از عکس:", error);
      // در صورت خطا، مقادیر پیش‌فرض برمی‌گردانیم
      return {
        amount: null,
        transactionDate: null,
        transactionTime: null,
        accountSource: null,
        paymentMethod: null,
        referenceId: null,
      };
    }
  }

  /**
   * تشخیص اینکه آیا پیام درخواست سفارش محصول است
   */
  async isProductOrderRequest(message: string): Promise<boolean> {
    if (!this.model) return false;

    try {
      const prompt = `آیا این پیام یک درخواست سفارش محصول است؟ فقط "بله" یا "خیر" جواب بده.

پیام: "${message}"

نکته: اگر کاربر نام یک محصول را گفته، می‌خواهد بخرد، درخواست قیمت کرده، یا هر کلمه‌ای مثل "میخوام"، "بده"، "سفارش"، "خرید" و... به همراه نام محصول است، جواب "بله" است.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      return text.includes('بله') || text.toLowerCase().includes('yes');
    } catch (error) {
      console.error("❌ خطا در تشخیص درخواست محصول:", error);
      return false;
    }
  }

  /**
   * استخراج نام محصول از پیام
   */
  async extractProductName(message: string): Promise<string | null> {
    if (!this.model) return null;

    try {
      const prompt = `از این پیام، نام محصولی که کاربر می‌خواهد را استخراج کن. فقط نام محصول را بنویس، بدون توضیح اضافی.

پیام: "${message}"

اگر نام محصولی پیدا نکردی، فقط کلمه "نامشخص" بنویس.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      if (text === 'نامشخص' || text.toLowerCase() === 'unknown') {
        return null;
      }
      
      return text;
    } catch (error) {
      console.error("❌ خطا در استخراج نام محصول:", error);
      return null;
    }
  }

  /**
   * استخراج تعداد از پیام
   */
  async extractQuantity(message: string): Promise<number | null> {
    if (!this.model) return null;

    try {
      const prompt = `از این پیام، تعداد یا عدد را استخراج کن. فقط یک عدد بنویس.

پیام: "${message}"

اگر عددی پیدا نکردی یا تعداد مشخص نبود، فقط عدد 0 بنویس.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // تبدیل اعداد فارسی به انگلیسی
      const persianToEnglish = (str: string): string => {
        return str
          .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
          .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
      };
      
      const numberText = persianToEnglish(text.replace(/[^0-9۰-۹٠-٩]/g, ''));
      const quantity = parseInt(numberText);
      
      if (isNaN(quantity) || quantity <= 0) {
        return null;
      }
      
      return quantity;
    } catch (error) {
      console.error("❌ خطا در استخراج تعداد:", error);
      return null;
    }
  }

  /**
   * تشخیص پاسخ مثبت یا منفی کاربر (برای سوال "محصول دیگه‌ای میخوای؟")
   */
  async isPositiveResponse(message: string): Promise<boolean> {
    if (!this.model) return false;

    try {
      const prompt = `آیا این پیام یک پاسخ مثبت (بله، آره، میخوام، دارم و...) است؟ فقط "بله" یا "خیر" جواب بده.

پیام: "${message}"`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      return text.includes('بله') || text.toLowerCase().includes('yes');
    } catch (error) {
      console.error("❌ خطا در تشخیص پاسخ:", error);
      return false;
    }
  }

  /**
   * یافتن FAQ منطبق با سوال کاربر از بین لیست سوالات متداول
   * @param message پیام کاربر
   * @param faqs لیست سوالات متداول والد کاربر
   * @returns FAQ منطبق یا null
   */
  async findMatchingFaq(message: string, faqs: Array<{id: string, question: string, answer: string}>): Promise<{id: string, question: string, answer: string} | null> {
    if (!this.model || !faqs || faqs.length === 0) {
      return null;
    }

    try {
      // محدود کردن تعداد FAQs برای جلوگیری از بزرگ شدن prompt
      const maxFaqs = 20;
      const limitedFaqs = faqs.slice(0, maxFaqs);
      
      // ساخت لیست سوالات برای prompt
      const faqList = limitedFaqs.map((faq, index) => 
        `${index + 1}. سوال: ${faq.question}\n   پاسخ: ${faq.answer}`
      ).join('\n\n');

      const prompt = `تو یک دستیار هوشمند هستی که باید مشخص کنی آیا پیام کاربر با یکی از سوالات متداول زیر مطابقت دارد یا نه.

سوالات متداول:
${faqList}

پیام کاربر: "${message}"

اگر پیام کاربر با یکی از سوالات بالا مطابقت دارد (حتی اگر با کلمات متفاوت بیان شده باشد)، فقط شماره آن سوال را بنویس (مثلاً "1" یا "5").
اگر پیام کاربر با هیچکدام از سوالات بالا مطابقت ندارد، فقط کلمه "هیچکدام" را بنویس.

جواب:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      console.log(`🔍 نتیجه مطابقت FAQ: "${text}"`);
      
      // بررسی اینکه آیا جواب یک عدد است
      const numberMatch = text.match(/^(\d+)/);
      if (numberMatch) {
        const index = parseInt(numberMatch[1]) - 1;
        if (index >= 0 && index < limitedFaqs.length) {
          console.log(`✅ FAQ منطبق پیدا شد: "${limitedFaqs[index].question}"`);
          return limitedFaqs[index];
        }
      }
      
      console.log(`ℹ️ هیچ FAQ منطبقی پیدا نشد`);
      return null;
    } catch (error) {
      console.error("❌ خطا در یافتن FAQ منطبق:", error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();