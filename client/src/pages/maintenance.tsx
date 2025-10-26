import { Construction, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MaintenancePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Construction className="w-24 h-24 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse"></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-foreground">
              سیستم در حال بروزرسانی است
            </h1>
            <p className="text-lg text-muted-foreground">
              ما در حال بهبود و ارتقاء سیستم هستیم
            </p>
          </div>

          <div className="space-y-2 text-muted-foreground">
            <p className="text-base">
              لطفاً چند دقیقه صبر کنید و سپس دوباره تلاش کنید
            </p>
            <p className="text-sm">
              به زودی با قابلیت‌های جدید به خدمت شما خواهیم رسید
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleRefresh}
              size="lg"
              className="gap-2"
            >
              <RefreshCcw className="w-5 h-5" />
              تلاش مجدد
            </Button>
          </div>

          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              در صورت طولانی شدن زمان بروزرسانی، لطفاً با پشتیبانی تماس بگیرید
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
