import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, Save, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function WelcomeMessage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [welcomeMessage, setWelcomeMessage] = useState("");

  // بارگذاری پیام خوش آمدگویی فعلی با react-query
  const { data, isLoading } = useQuery<{ message: string }>({
    queryKey: ["/api/welcome-message"],
    enabled: !!user
  });

  // به‌روزرسانی state محلی هنگام بارگذاری داده‌ها
  useEffect(() => {
    if (data) {
      setWelcomeMessage(data.message || "");
    }
  }, [data]);

  // mutation برای ذخیره پیام
  const saveMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/welcome-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ message })
      });
      if (!response.ok) throw new Error("خطا در ذخیره پیام");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "موفقیت",
        description: "پیام خوش آمدگویی با موفقیت ذخیره شد",
      });
      // invalidate query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/welcome-message"] });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در ذخیره پیام خوش آمدگویی",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    saveMutation.mutate(welcomeMessage);
  };

  const resetToDefault = () => {
    const defaultMessage = `سلام {firstName}! 🌟

به سیستم ما خوش آمدید. شما با موفقیت ثبت نام شدید.

🎁 اشتراک رایگان 7 روزه به حساب شما اضافه شد.

برای کمک و راهنمایی، می‌توانید هر زمان پیام بدهید.`;
    
    setWelcomeMessage(defaultMessage);
  };

  return (
    <DashboardLayout title="پیام خوش آمدگویی واتس‌اپ">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* فرم ویرایش */}
        <Card>
          <CardHeader>
            <CardTitle>ویرایش پیام خوش آمدگویی</CardTitle>
            <CardDescription>
              این پیام بعد از ثبت نام خودکار کاربران جدید از طریق واتس‌اپ ارسال می‌شود
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="welcome-message" className="text-sm font-medium">
                متن پیام
              </Label>
              <Textarea
                id="welcome-message"
                placeholder="پیام خوش آمدگویی خود را وارد کنید..."
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={8}
                className="resize-none"
                data-testid="textarea-welcome-message"
              />
            </div>

            <Alert>
              <MessageCircle className="h-4 w-4" />
              <AlertDescription>
                برای نمایش نام کاربر در پیام از <code>{"{firstName}"}</code> استفاده کنید.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending || isLoading || !welcomeMessage.trim()}
                className="flex-1"
                data-testid="button-save-welcome-message"
              >
                {saveMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 ml-2" />
                )}
                ذخیره
              </Button>
              
              <Button
                variant="outline"
                onClick={resetToDefault}
                data-testid="button-reset-default"
              >
                پیام پیش‌فرض
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* پیش‌نمایش */}
        <Card>
          <CardHeader>
            <CardTitle>پیش‌نمایش پیام</CardTitle>
            <CardDescription>
              نمونه‌ای از پیامی که کاربران دریافت خواهند کرد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg min-h-[200px]">
              <div className="text-sm text-muted-foreground mb-2">
                پیام ارسالی از طریق واتس‌اپ:
              </div>
              <div className="whitespace-pre-wrap text-sm bg-white dark:bg-slate-800 p-3 rounded border">
                {welcomeMessage ? 
                  welcomeMessage.replace("{firstName}", "احمد") : 
                  "هیچ پیامی تنظیم نشده..."
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}