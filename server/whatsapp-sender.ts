import { storage } from "./storage";

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

      // ارسال پیام از طریق WhatsiPlus API (مانند whatsapp-service)
      const sendUrl = `https://api.whatsiplus.com/sendMsg/${whatsappToken}?phonenumber=${recipient}&message=${encodeURIComponent(message)}`;
      
      console.log(`📤 درحال ارسال پیام به ${recipient} از طریق توکن...`);
      const response = await fetch(sendUrl, { method: 'GET' });

      if (!response.ok) {
        console.error("❌ خطا در ارسال پیام واتس‌اپ:", response.status, response.statusText);
        return false;
      }

      // ذخیره پیام ارسالی در دیتابیس
      await storage.createSentMessage({
        userId: userId,
        recipient: recipient,
        message: message,
        status: "sent"
      });

      console.log(`📤 پیام به ${recipient} ارسال شد: ${message.substring(0, 50)}...`);
      return true;

    } catch (error) {
      console.error("❌ خطا در ارسال پیام واتس‌اپ:", error);
      return false;
    }
  }
}

export const whatsAppSender = new WhatsAppSender();