interface QueuedMessage {
  id: string;
  type: 'text' | 'image';
  recipient: string;
  message: string;
  imageUrl?: string;
  userId: string;
  token: string;
  retryCount: number;
  timestamp: number;
}

interface TokenQueue {
  messages: QueuedMessage[];
  isProcessing: boolean;
  lastSentTime: number;
}

export class WhatsAppQueue {
  private queues: Map<string, TokenQueue> = new Map();
  private readonly MESSAGES_PER_SECOND = 3;
  private readonly INTERVAL_MS = 1000 / this.MESSAGES_PER_SECOND; // ~333ms between messages
  private readonly MAX_RETRIES = 3;

  async addMessage(
    type: 'text' | 'image',
    recipient: string,
    message: string,
    userId: string,
    token: string,
    imageUrl?: string
  ): Promise<string> {
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedMessage: QueuedMessage = {
      id: messageId,
      type,
      recipient,
      message,
      imageUrl,
      userId,
      token,
      retryCount: 0,
      timestamp: Date.now()
    };

    if (!this.queues.has(token)) {
      this.queues.set(token, {
        messages: [],
        isProcessing: false,
        lastSentTime: 0
      });
    }

    const queue = this.queues.get(token)!;
    queue.messages.push(queuedMessage);

    console.log(`📥 پیام به صف اضافه شد - توکن: ${token.substring(0, 8)}..., تعداد در صف: ${queue.messages.length}, نوع: ${type}`);

    if (!queue.isProcessing) {
      this.processQueue(token);
    }

    return messageId;
  }

  private async processQueue(token: string): Promise<void> {
    const queue = this.queues.get(token);
    if (!queue || queue.isProcessing) {
      return;
    }

    queue.isProcessing = true;

    while (queue.messages.length > 0) {
      const now = Date.now();
      const timeSinceLastSent = now - queue.lastSentTime;

      if (timeSinceLastSent < this.INTERVAL_MS) {
        const waitTime = this.INTERVAL_MS - timeSinceLastSent;
        await this.sleep(waitTime);
      }

      const message = queue.messages.shift();
      if (!message) {
        break;
      }

      try {
        const success = await this.sendMessageDirect(message);
        
        if (success) {
          queue.lastSentTime = Date.now();
          console.log(`✅ پیام ارسال شد - صف: ${queue.messages.length} باقی مانده`);
        } else {
          if (message.retryCount < this.MAX_RETRIES) {
            message.retryCount++;
            queue.messages.push(message);
            console.log(`🔄 پیام به صف برگشت برای تلاش مجدد (${message.retryCount}/${this.MAX_RETRIES})`);
          } else {
            console.error(`❌ پیام بعد از ${this.MAX_RETRIES} تلاش حذف شد: ${message.id}`);
          }
        }
      } catch (error) {
        console.error(`❌ خطا در پردازش پیام ${message.id}:`, error);
        
        if (message.retryCount < this.MAX_RETRIES) {
          message.retryCount++;
          queue.messages.push(message);
        }
      }
    }

    queue.isProcessing = false;

    if (queue.messages.length === 0) {
      console.log(`🧹 صف برای توکن ${token.substring(0, 8)}... خالی شد`);
    }
  }

  private async sendMessageDirect(message: QueuedMessage): Promise<boolean> {
    try {
      if (message.type === 'text') {
        return await this.sendTextMessage(message);
      } else if (message.type === 'image') {
        return await this.sendImageMessage(message);
      }
      return false;
    } catch (error) {
      console.error("❌ خطا در ارسال مستقیم پیام:", error);
      return false;
    }
  }

  private async sendTextMessage(message: QueuedMessage): Promise<boolean> {
    try {
      const sendUrl = `https://api.whatsiplus.com/sendMsg/${message.token}?phonenumber=${message.recipient}&message=${encodeURIComponent(message.message)}`;
      
      const response = await fetch(sendUrl, { method: 'GET' });

      if (!response.ok) {
        console.error("❌ خطا در ارسال پیام متنی:", response.status, response.statusText);
        return false;
      }

      console.log(`📤 پیام متنی ارسال شد به ${message.recipient}`);
      return true;
    } catch (error) {
      console.error("❌ خطا در sendTextMessage:", error);
      return false;
    }
  }

  private async sendImageMessage(message: QueuedMessage): Promise<boolean> {
    try {
      if (!message.imageUrl) {
        console.error("❌ URL عکس موجود نیست");
        return false;
      }

      const formData = new FormData();
      formData.append('phonenumber', message.recipient);
      formData.append('message', message.message);
      formData.append('link', message.imageUrl);

      const sendUrl = `https://api.whatsiplus.com/sendMsg/${message.token}`;
      const response = await fetch(sendUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ خطا در ارسال عکس:`, errorText);
        return false;
      }

      console.log(`📤 عکس ارسال شد به ${message.recipient}`);
      return true;
    } catch (error) {
      console.error("❌ خطا در sendImageMessage:", error);
      return false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getQueueStatus(token?: string): any {
    if (token) {
      const queue = this.queues.get(token);
      if (!queue) {
        return { exists: false };
      }
      return {
        exists: true,
        messageCount: queue.messages.length,
        isProcessing: queue.isProcessing,
        lastSentTime: queue.lastSentTime
      };
    }

    const allQueues: any = {};
    this.queues.forEach((queue, token) => {
      allQueues[token.substring(0, 8) + '...'] = {
        messageCount: queue.messages.length,
        isProcessing: queue.isProcessing
      };
    });
    return allQueues;
  }

  clearQueue(token: string): boolean {
    const queue = this.queues.get(token);
    if (queue) {
      queue.messages = [];
      console.log(`🧹 صف برای توکن ${token.substring(0, 8)}... پاک شد`);
      return true;
    }
    return false;
  }
}

export const whatsAppQueue = new WhatsAppQueue();
