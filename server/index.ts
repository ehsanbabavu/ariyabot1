import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { whatsAppMessageService } from "./whatsapp-service";
import { aiService } from "./ai-service";
import { cleanupService } from "./cleanup-service";
import path from "path";

const app = express();

// Trust proxy - برای دریافت صحیح IP واقعی کاربر از طریق پروکسی Replit
app.set('trust proxy', true);

// JSON parsing middleware - با بررسی content-type و افزایش محدودیت سایز برای فاکتورها
app.use((req, res, next) => {
  if (req.headers['content-type']?.startsWith('multipart/form-data')) {
    // برای multipart requests، JSON parsing را نادیده می‌گیریم
    return next();
  }
  express.json({ limit: '50mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Static serving for uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Static serving for stamp images (مهر و امضا)
app.use('/stamppic', express.static(path.join(process.cwd(), 'stamppic')));

// Static serving for public files (invoices, etc.)
app.use('/invoices', express.static(path.join(process.cwd(), 'public', 'invoices')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    // اول AI Service رو initialize کن
    log("[AI] شروع initialize سرویس AI...");
    await aiService.initialize();
    log(`[AI] AI Service initialized با provider: ${aiService.getCurrentProvider() || 'هیچکدام'}`);
    // بعد سرویس پیام‌های واتس‌اپ رو شروع کن
    whatsAppMessageService.start();
    // سرویس پاکسازی فایل‌های موقت رو شروع کن
    cleanupService.start();
  });
})();
