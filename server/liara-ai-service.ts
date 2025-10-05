import OpenAI from "openai";
import { storage } from "./storage";

const LIARA_BASE_URL = "https://ai.liara.ir/api/68e204eb1008fc6ccd20c83d/v1";
const LIARA_MODEL = "openai/gpt-5-nano";

export class LiaraAIService {
  private openai: OpenAI | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      const tokenSettings = await storage.getAiTokenSettings();
      if (tokenSettings?.token && tokenSettings.isActive) {
        this.openai = new OpenAI({
          baseURL: LIARA_BASE_URL,
          apiKey: tokenSettings.token,
        });
        console.log("🤖 سرویس Liara AI با موفقیت راه‌اندازی شد");
      } else {
        console.log("⚠️ توکن Liara AI تنظیم نشده یا غیرفعال است");
      }
    } catch (error) {
      console.error("❌ خطا در راه‌اندازی Liara AI:", error);
    }
  }

  async reinitialize() {
    await this.initialize();
  }

  async generateResponse(message: string, userId?: string): Promise<string> {
    if (!this.openai) {
      throw new Error("Liara AI فعال نیست. لطفاً توکن API را تنظیم کنید.");
    }

    try {
      let aiName = "من هوش مصنوعی هستم";
      
      try {
        const whatsappSettings = await storage.getWhatsappSettings();
        if (whatsappSettings?.aiName) {
          aiName = whatsappSettings.aiName;
        }
      } catch (settingsError) {
        console.error("خطا در دریافت نام هوش مصنوعی:", settingsError);
      }

      const normalizeText = (text: string): string => {
        return text
          .normalize('NFKC')
          .replace(/\u200C|\u200F|\u200E/g, '')
          .replace(/[\u064A]/g, '\u06CC')
          .replace(/[\u0643]/g, '\u06A9')
          .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '')
          .replace(/[؟?!.،,]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase();
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
      
      const isNameQuestion = nameQuestionPatterns.some(pattern => 
        pattern.test(normalizedMessage)
      );

      if (isNameQuestion) {
        return aiName;
      }
      
      const prompt = `${aiName} و به زبان فارسی پاسخ می‌دهم. لطفاً به این پیام پاسخ دهید:

${message}

پاسخ من باید:
- به زبان فارسی باشد
- حداکثر 20 کلمه باشد
- مؤدبانه و مستقیم باشد
- بدون توضیحات اضافی باشد`;

      const completion = await this.openai.chat.completions.create({
        model: LIARA_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const text = completion.choices[0].message.content?.trim() || "متأسفانه نتوانستم پاسخ مناسبی تولید کنم.";
      
      if (text.length > 200) {
        return text.substring(0, 200) + '...';
      }
      
      return text;
    } catch (error) {
      console.error("❌ خطا در تولید پاسخ Liara AI:", error);
      throw new Error("خطا در تولید پاسخ هوش مصنوعی");
    }
  }

  isActive(): boolean {
    return this.openai !== null;
  }

  async extractDepositInfo(message: string): Promise<{
    amount: string | null;
    transactionDate: string | null;
    transactionTime: string | null;
    accountSource: string | null;
    paymentMethod: string | null;
    referenceId: string | null;
  }> {
    if (!this.openai) {
      throw new Error("Liara AI فعال نیست. لطفاً توکن API را تنظیم کنید.");
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

      const completion = await this.openai.chat.completions.create({
        model: LIARA_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const text = completion.choices[0].message.content?.trim() || '{}';
      
      let jsonText = text;
      
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0].trim();
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1].split('```')[0].trim();
      }
      
      const extractedData = JSON.parse(jsonText);
      
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

  async isDepositMessage(message: string): Promise<boolean> {
    if (!this.openai) {
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
      
      const keywordCount = depositKeywords.filter(keyword => 
        normalizedMessage.includes(keyword)
      ).length;
      
      if (keywordCount < 5) {
        return false;
      }
      
      const prompt = `آیا متن زیر یک رسید واریزی بانکی، اطلاع واریز، یا اطلاعات پرداخت کامل است؟
      
${message}

توجه: فقط اگر مطمئن هستی که این یک رسید واریزی واقعی با اطلاعات کامل است، "بله" بگو. در غیر این صورت "خیر" بگو.

فقط با "بله" یا "خیر" پاسخ بده.`;

      const completion = await this.openai.chat.completions.create({
        model: LIARA_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const text = completion.choices[0].message.content?.trim().toLowerCase() || '';
      
      return text.includes('بله') || text.includes('yes');
    } catch (error) {
      console.error("❌ خطا در تشخیص پیام واریزی:", error);
      return false;
    }
  }

  extractImageUrl(message: string): string | null {
    try {
      const urlPattern = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|bmp|webp))/gi;
      const match = message.match(urlPattern);
      
      if (match && match.length > 0) {
        return match[0];
      }

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

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
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

  async extractDepositInfoFromImage(imageUrl: string): Promise<{
    amount: string | null;
    transactionDate: string | null;
    transactionTime: string | null;
    accountSource: string | null;
    paymentMethod: string | null;
    referenceId: string | null;
  }> {
    if (!this.openai) {
      throw new Error("Liara AI فعال نیست. لطفاً توکن API را تنظیم کنید.");
    }

    try {
      console.log(`🖼️ در حال استخراج اطلاعات از عکس رسید...`);

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

      const completion = await this.openai.chat.completions.create({
        model: LIARA_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      });

      const text = completion.choices[0].message.content?.trim() || '{}';
      
      console.log(`📊 Liara AI Vision Response:`, text);

      let jsonText = text;
      
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0].trim();
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1].split('```')[0].trim();
      }
      
      const extractedData = JSON.parse(jsonText);
      
      console.log(`✅ اطلاعات از عکس استخراج شد:`, extractedData);

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

  async isProductOrderRequest(message: string): Promise<boolean> {
    if (!this.openai) return false;

    try {
      const prompt = `آیا این پیام یک درخواست سفارش محصول است؟ فقط "بله" یا "خیر" جواب بده.

پیام: "${message}"

نکته: اگر کاربر نام یک محصول را گفته، می‌خواهد بخرد، درخواست قیمت کرده، یا هر کلمه‌ای مثل "میخوام"، "بده"، "سفارش"، "خرید" و... به همراه نام محصول است، جواب "بله" است.`;

      const completion = await this.openai.chat.completions.create({
        model: LIARA_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const text = completion.choices[0].message.content?.trim() || '';
      
      return text.includes('بله') || text.toLowerCase().includes('yes');
    } catch (error) {
      console.error("❌ خطا در تشخیص درخواست محصول:", error);
      return false;
    }
  }

  async extractProductName(message: string): Promise<string | null> {
    if (!this.openai) return null;

    try {
      const prompt = `از این پیام، نام محصولی که کاربر می‌خواهد را استخراج کن. فقط نام محصول را بنویس، بدون توضیح اضافی.

پیام: "${message}"

اگر نام محصولی پیدا نکردی، فقط کلمه "نامشخص" بنویس.`;

      const completion = await this.openai.chat.completions.create({
        model: LIARA_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const text = completion.choices[0].message.content?.trim() || '';
      
      if (text === 'نامشخص' || text.toLowerCase() === 'unknown') {
        return null;
      }
      
      return text;
    } catch (error) {
      console.error("❌ خطا در استخراج نام محصول:", error);
      return null;
    }
  }

  async extractQuantity(message: string): Promise<number | null> {
    if (!this.openai) return null;

    try {
      const prompt = `از این پیام، تعداد یا عدد را استخراج کن. فقط یک عدد بنویس.

پیام: "${message}"

اگر عددی پیدا نکردی یا تعداد مشخص نبود، فقط عدد 0 بنویس.`;

      const completion = await this.openai.chat.completions.create({
        model: LIARA_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const text = completion.choices[0].message.content?.trim() || '0';
      
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

  async isPositiveResponse(message: string): Promise<boolean> {
    if (!this.openai) return false;

    try {
      const prompt = `آیا این پیام یک پاسخ مثبت (بله، آره، میخوام، دارم و...) است؟ فقط "بله" یا "خیر" جواب بده.

پیام: "${message}"`;

      const completion = await this.openai.chat.completions.create({
        model: LIARA_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const text = completion.choices[0].message.content?.trim() || '';
      
      return text.includes('بله') || text.toLowerCase().includes('yes');
    } catch (error) {
      console.error("❌ خطا در تشخیص پاسخ:", error);
      return false;
    }
  }

  async findMatchingFaq(message: string, faqs: Array<{id: string, question: string, answer: string}>): Promise<{id: string, question: string, answer: string} | null> {
    if (!this.openai || !faqs || faqs.length === 0) {
      return null;
    }

    try {
      const maxFaqs = 20;
      const limitedFaqs = faqs.slice(0, maxFaqs);
      
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

      const completion = await this.openai.chat.completions.create({
        model: LIARA_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const text = completion.choices[0].message.content?.trim() || '';
      
      console.log(`🔍 نتیجه مطابقت FAQ: "${text}"`);
      
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

export const liaraAIService = new LiaraAIService();
