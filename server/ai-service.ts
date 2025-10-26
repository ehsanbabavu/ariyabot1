import { geminiService } from "./gemini-service";
import { liaraService } from "./liara-service";
import { storage } from "./storage";

class AIService {
  private currentProvider: "gemini" | "liara" | null = null;

  async initialize() {
    try {
      const providers = await storage.getAllAiTokenSettings();
      
      const geminiProvider = providers.find((p: any) => p.provider === "gemini" && p.isActive);
      const liaraProvider = providers.find((p: any) => p.provider === "liara" && p.isActive);

      if (geminiProvider) {
        this.currentProvider = "gemini";
        await geminiService.reinitialize();
        console.log("🎯 استفاده از Gemini AI به عنوان ارائه‌دهنده فعال");
      } else if (liaraProvider) {
        this.currentProvider = "liara";
        await liaraService.reinitialize();
        console.log("🎯 استفاده از Liara AI به عنوان ارائه‌دهنده فعال");
      } else {
        this.currentProvider = null;
        console.log("⚠️ هیچ ارائه‌دهنده AI فعالی یافت نشد");
      }
    } catch (error) {
      console.error("❌ خطا در initialize کردن AI Service:", error);
      this.currentProvider = null;
    }
  }

  async reinitialize() {
    await this.initialize();
  }

  private getActiveService() {
    if (this.currentProvider === "gemini") {
      return geminiService;
    } else if (this.currentProvider === "liara") {
      return liaraService;
    }
    return null;
  }

  async generateResponse(message: string, userId?: string): Promise<string> {
    const service = this.getActiveService();
    if (!service) {
      throw new Error("هیچ سرویس AI فعالی وجود ندارد. لطفاً ابتدا یکی از سرویس‌ها را فعال کنید.");
    }

    try {
      return await service.generateResponse(message, userId);
    } catch (error) {
      if (this.currentProvider === "gemini" && liaraService.isActive()) {
        console.log("⚠️ خطا در Gemini، سوئیچ به Liara...");
        this.currentProvider = "liara";
        return await liaraService.generateResponse(message, userId);
      } else if (this.currentProvider === "liara" && geminiService.isActive()) {
        console.log("⚠️ خطا در Liara، سوئیچ به Gemini...");
        this.currentProvider = "gemini";
        return await geminiService.generateResponse(message, userId);
      }
      throw error;
    }
  }

  isActive(): boolean {
    const service = this.getActiveService();
    return service ? service.isActive() : false;
  }

  async extractDepositInfo(message: string): Promise<{
    amount: string | null;
    transactionDate: string | null;
    transactionTime: string | null;
    accountSource: string | null;
    paymentMethod: string | null;
    referenceId: string | null;
  }> {
    const service = this.getActiveService();
    if (!service) {
      throw new Error("هیچ سرویس AI فعالی وجود ندارد. لطفاً ابتدا یکی از سرویس‌ها را فعال کنید.");
    }

    try {
      return await service.extractDepositInfo(message);
    } catch (error) {
      if (this.currentProvider === "gemini" && liaraService.isActive()) {
        console.log("⚠️ خطا در Gemini، سوئیچ به Liara...");
        this.currentProvider = "liara";
        return await liaraService.extractDepositInfo(message);
      } else if (this.currentProvider === "liara" && geminiService.isActive()) {
        console.log("⚠️ خطا در Liara، سوئیچ به Gemini...");
        this.currentProvider = "gemini";
        return await geminiService.extractDepositInfo(message);
      }
      throw error;
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
    const service = this.getActiveService();
    if (!service) {
      throw new Error("هیچ سرویس AI فعالی وجود ندارد. لطفاً ابتدا یکی از سرویس‌ها را فعال کنید.");
    }

    try {
      return await service.extractDepositInfoFromImage(imageUrl);
    } catch (error) {
      if (this.currentProvider === "gemini" && liaraService.isActive()) {
        console.log("⚠️ خطا در Gemini، سوئیچ به Liara...");
        this.currentProvider = "liara";
        return await liaraService.extractDepositInfoFromImage(imageUrl);
      } else if (this.currentProvider === "liara" && geminiService.isActive()) {
        console.log("⚠️ خطا در Liara، سوئیچ به Gemini...");
        this.currentProvider = "gemini";
        return await geminiService.extractDepositInfoFromImage(imageUrl);
      }
      throw error;
    }
  }

  async isDepositMessage(message: string): Promise<boolean> {
    const service = this.getActiveService();
    if (!service) {
      return false;
    }
    return await service.isDepositMessage(message);
  }

  extractImageUrl(message: string): string | null {
    const service = this.getActiveService();
    if (!service) {
      return null;
    }
    return service.extractImageUrl(message);
  }

  async isProductOrderRequest(message: string): Promise<boolean> {
    const service = this.getActiveService();
    if (!service) {
      return false;
    }
    return await service.isProductOrderRequest(message);
  }

  async extractProductName(message: string): Promise<string | null> {
    const service = this.getActiveService();
    if (!service) {
      return null;
    }
    return await service.extractProductName(message);
  }

  async extractQuantity(message: string): Promise<number | null> {
    const service = this.getActiveService();
    if (!service) {
      return null;
    }
    return await service.extractQuantity(message);
  }

  async isPositiveResponse(message: string): Promise<boolean> {
    const service = this.getActiveService();
    if (!service) {
      return false;
    }
    return await service.isPositiveResponse(message);
  }

  async findMatchingFaq(userQuestion: string, faqs?: Array<{id?: string, question: string, answer: string}>): Promise<{id?: string, question: string; answer: string } | null> {
    const service = this.getActiveService();
    if (!service) {
      return null;
    }
    
    if (this.currentProvider === "gemini" && geminiService.isActive()) {
      const activeFaqs = faqs || await storage.getActiveFaqs();
      return await geminiService.findMatchingFaq(userQuestion, activeFaqs);
    } else if (this.currentProvider === "liara" && liaraService.isActive()) {
      return await liaraService.findMatchingFaq(userQuestion);
    }
    
    return null;
  }

  getCurrentProvider(): "gemini" | "liara" | null {
    return this.currentProvider;
  }
}

export const aiService = new AIService();
