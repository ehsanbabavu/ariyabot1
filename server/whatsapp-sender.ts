import { storage } from "./storage";
import { whatsAppQueue } from "./whatsapp-queue";

export class WhatsAppSender {
  async sendMessage(recipient: string, message: string, userId: string): Promise<boolean> {
    try {
      // دریافت اطلاعات کاربر فرستنده برای بررسی توکن شخصی
      const senderUser = await storage.getUser(userId);
      let whatsappToken: string | undefined;
      
      // انتخاب توکن مناسب برای ارسال (مانند whatsapp-service)
      if (senderUser && senderUser.role === 'user_level_1' && senderUser.whatsappToken && senderUser.whatsappToken.trim() !== '') {
        whatsappToken = senderUser.whatsappToken;
        console.log("🔍 استفاده از توکن شخصی کاربر برای ارسال پیام");
      } else {
        // اگر کاربر توکن شخصی ندارد، از تنظیمات عمومی استفاده کن
        const settings = await storage.getWhatsappSettings();
        
        console.log("🔍 Debug: بررسی تنظیمات واتس‌اپ عمومی:", {
          hasSettings: !!settings,
          hasToken: !!(settings?.token),
          isEnabled: settings?.isEnabled,
          tokenLength: settings?.token?.length || 0
        });
        
        if (!settings || !settings.token || !settings.isEnabled) {
          if (!settings) {
            console.log("⚠️ تنظیمات واتس‌اپ عمومی موجود نیست");
          } else if (!settings.token) {
            console.log("⚠️ توکن واتس‌اپ عمومی تنظیم نشده");
          } else if (!settings.isEnabled) {
            console.log("⚠️ واتس‌اپ عمومی غیرفعال است - isEnabled:", settings.isEnabled);
          }
          console.log("⚠️ تنظیمات واتس‌اپ برای ارسال پیام فعال نیست");
          return false;
        }
        whatsappToken = settings.token;
      }
      
      if (!whatsappToken) {
        console.log("⚠️ هیچ توکن معتبری برای ارسال پیام یافت نشد");
        return false;
      }

      // اضافه کردن پیام به صف برای ارسال تدریجی (3 پیام در ثانیه)
      const messageId = await whatsAppQueue.addMessage(
        'text',
        recipient,
        message,
        userId,
        whatsappToken
      );

      // ذخیره پیام ارسالی در دیتابیس
      await storage.createSentMessage({
        userId: userId,
        recipient: recipient,
        message: message,
        status: "queued"
      });

      console.log(`📤 پیام به صف اضافه شد (ID: ${messageId}): ${message.substring(0, 50)}...`);
      return true;

    } catch (error) {
      console.error("❌ خطا در اضافه کردن پیام به صف:", error);
      return false;
    }
  }

  async sendWhatsAppImage(token: string, phoneNumber: string, message: string, imageUrl: string, userId?: string): Promise<boolean> {
    try {
      // اضافه کردن عکس به صف برای ارسال تدریجی (3 پیام در ثانیه)
      const messageId = await whatsAppQueue.addMessage(
        'image',
        phoneNumber,
        message,
        userId || 'system',
        token,
        imageUrl
      );

      console.log(`✅ عکس به صف اضافه شد (ID: ${messageId}) برای ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error("❌ خطا در اضافه کردن عکس به صف:", error);
      return false;
    }
  }

  async sendImage(recipient: string, message: string, imageUrl: string, userId: string): Promise<boolean> {
    try {
      const senderUser = await storage.getUser(userId);
      let whatsappToken: string | undefined;
      
      if (senderUser && senderUser.role === 'user_level_1' && senderUser.whatsappToken && senderUser.whatsappToken.trim() !== '') {
        whatsappToken = senderUser.whatsappToken;
        console.log("🔍 استفاده از توکن شخصی کاربر برای ارسال عکس");
      } else {
        const settings = await storage.getWhatsappSettings();
        
        if (!settings || !settings.token || !settings.isEnabled) {
          console.log("⚠️ تنظیمات واتس‌اپ برای ارسال عکس فعال نیست");
          return false;
        }
        whatsappToken = settings.token;
      }
      
      if (!whatsappToken) {
        console.log("⚠️ هیچ توکن معتبری برای ارسال عکس یافت نشد");
        return false;
      }

      // اضافه کردن عکس به صف برای ارسال تدریجی (3 پیام در ثانیه)
      const messageId = await whatsAppQueue.addMessage(
        'image',
        recipient,
        message,
        userId,
        whatsappToken,
        imageUrl
      );

      await storage.createSentMessage({
        userId: userId,
        recipient: recipient,
        message: `${message} (عکس: ${imageUrl})`,
        status: "queued"
      });

      console.log(`✅ عکس به صف اضافه شد (ID: ${messageId}): ${imageUrl}`);
      return true;

    } catch (error) {
      console.error("❌ خطا در اضافه کردن عکس به صف:", error);
      return false;
    }
  }
}

export const whatsAppSender = new WhatsAppSender();