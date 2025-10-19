import fs from "fs";
import path from "path";

class CleanupService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // هر 1 ساعت
  private readonly FILE_MAX_AGE = 60 * 60 * 1000; // 1 ساعت

  start() {
    console.log("🧹 سرویس پاکسازی فایل‌های موقت شروع شد");
    
    // اجرای اولیه
    this.cleanup();
    
    // اجرای دوره‌ای
    this.intervalId = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("🛑 سرویس پاکسازی متوقف شد");
    }
  }

  private cleanup() {
    const uploadDirs = [
      path.join(process.cwd(), "uploads"),
      path.join(process.cwd(), "UploadsPicClienet")
    ];
    
    uploadDirs.forEach((uploadsDir) => {
      if (!fs.existsSync(uploadsDir)) {
        return;
      }

      try {
        const files = fs.readdirSync(uploadsDir);
        const now = Date.now();
        let deletedCount = 0;

        files.forEach((file) => {
          const filePath = path.join(uploadsDir, file);
          
          try {
            const stats = fs.statSync(filePath);
            const fileAge = now - stats.mtimeMs; // زمان از آخرین تغییر فایل

            if (fileAge > this.FILE_MAX_AGE) {
              fs.unlinkSync(filePath);
              deletedCount++;
              console.log(`🗑️  فایل قدیمی حذف شد: ${file} از ${path.basename(uploadsDir)}`);
            }
          } catch (error) {
            console.error(`خطا در بررسی فایل ${file}:`, error);
          }
        });

        if (deletedCount > 0) {
          console.log(`✅ ${deletedCount} فایل قدیمی از ${path.basename(uploadsDir)} حذف شد`);
        }
      } catch (error) {
        console.error(`خطا در پاکسازی فایل‌ها از ${path.basename(uploadsDir)}:`, error);
      }
    });
  }
}

export const cleanupService = new CleanupService();
