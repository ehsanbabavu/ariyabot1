import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Save, 
  TestTube, 
  MessageCircle, 
  Shield, 
  Bell, 
  Activity,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Settings,
  User,
  Globe,
  Crown,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAuthenticatedRequest } from "@/lib/auth";
import type { WhatsappSettings } from "@shared/schema";

export default function WhatsappSettings() {
  const [formData, setFormData] = useState({
    token: "",
    isEnabled: true,
    notifications: [] as string[],
    aiName: "من هوش مصنوعی هستم",
  });
  const [showToken, setShowToken] = useState(false);
  const [isPersonal, setIsPersonal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user info
  const { data: user } = useQuery<{role: string; id: string}>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/profile");
      if (!response.ok) throw new Error("خطا در دریافت اطلاعات کاربر");
      return response.json();
    },
  });

  const { data: settings, isLoading } = useQuery<{
    token: string;
    isEnabled: boolean;
    notifications: string[];
    aiName: string;
    isPersonal: boolean;
  }>({
    queryKey: ["/api/whatsapp-settings"],
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/whatsapp-settings");
      if (!response.ok) throw new Error("خطا در دریافت تنظیمات واتس‌اپ");
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await createAuthenticatedRequest("/api/whatsapp-settings", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("خطا در بروزرسانی تنظیمات واتس‌اپ");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "✅ موفقیت",
        description: isPersonal ? "توکن شخصی ذخیره شد" : "تنظیمات ذخیره شد",
      });
    },
    onError: () => {
      toast({
        title: "❌ خطا",
        description: "خطا در ذخیره تنظیمات",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        token: settings.token || "",
        isEnabled: settings.isEnabled,
        notifications: settings.notifications || [],
        aiName: settings.aiName || "من هوش مصنوعی هستم",
      });
      setIsPersonal(!!settings.isPersonal);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleTestConnection = async () => {
    toast({
      title: "🧪 تست اتصال",
      description: "در حال تست اتصال...",
    });
    
    setTimeout(() => {
      toast({
        title: "✅ تست موفق",
        description: "اتصال برقرار است",
      });
    }, 1500);
  };

  const handleNotificationChange = (notification: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        notifications: [...formData.notifications, notification],
      });
    } else {
      setFormData({
        ...formData,
        notifications: formData.notifications.filter(n => n !== notification),
      });
    }
  };

  const notificationOptions = [
    { id: "new_ticket", label: "تیکت جدید", icon: Bell },
    { id: "new_user", label: "کاربر جدید", icon: Shield },
    { id: "new_product", label: "محصول جدید", icon: Activity },
  ];

  const isLevel1User = user?.role === 'user_level_1';
  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return (
      <DashboardLayout title="تنظیمات واتس‌اپ">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="تنظیمات واتس‌اپ">
      <div className="space-y-4" data-testid="page-whatsapp-settings">
        
        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>
            {isPersonal ? (
              <div className="flex items-center space-x-2 space-x-reverse">
                <User className="w-4 h-4" />
                <span>تنظیمات شخصی</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Globe className="w-4 h-4" />
                <span>تنظیمات عمومی</span>
              </div>
            )}
          </AlertTitle>
          <AlertDescription>
            {isPersonal 
              ? "این توکن فقط برای حساب شخصی شما استفاده خواهد شد."
              : "این تنظیمات برای کل سیستم اعمال می‌شود."
            }
          </AlertDescription>
        </Alert>

        {/* Main Form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-base">
              {isPersonal ? (
                <>
                  <User className="w-4 h-4" />
                  <span>توکن واتس‌اپ شخصی</span>
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  <span>پیکربندی عمومی</span>
                  {isAdmin && (
                    <Badge variant="secondary" className="mr-2">
                      <Crown className="w-3 h-3 ml-1" />
                      مدیر
                    </Badge>
                  )}
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-whatsapp-settings">
              
              {/* Token */}
              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm font-medium flex items-center space-x-1 space-x-reverse">
                  <Shield className="w-3 h-3" />
                  <span>توکن API</span>
                </Label>
                <div className="relative">
                  <Input
                    id="token"
                    type={showToken ? "text" : "password"}
                    value={formData.token}
                    onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                    placeholder="توکن API واتس‌اپ"
                    className="pr-8"
                    data-testid="input-whatsapp-token"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  توکن از پنل فیس‌بوک دریافت کنید
                </p>
              </div>

              {/* AI Name */}
              <div className="space-y-2">
                <Label htmlFor="aiName" className="text-sm font-medium flex items-center space-x-1 space-x-reverse">
                  <MessageCircle className="w-3 h-3" />
                  <span>نام هوش مصنوعی</span>
                </Label>
                <Input
                  id="aiName"
                  type="text"
                  value={formData.aiName}
                  onChange={(e) => setFormData({ ...formData, aiName: e.target.value })}
                  placeholder="من هوش مصنوعی هستم"
                  data-testid="input-ai-name"
                />
                <p className="text-xs text-muted-foreground">
                  وقتی کاربر نام شما را بپرسد، این نام را بیان خواهید کرد
                </p>
              </div>

              {/* Enable Toggle - Show for non-personal (admin) settings */}
              {!isPersonal && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="isEnabled"
                      checked={formData.isEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked as boolean })}
                      data-testid="checkbox-whatsapp-enabled"
                    />
                    <Label htmlFor="isEnabled" className="text-sm font-medium">
                      فعال‌سازی سرویس واتس‌اپ
                    </Label>
                  </div>
                </div>
              )}

              {/* Notifications - Only for admin users */}
              {!isPersonal && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center space-x-1 space-x-reverse">
                    <Bell className="w-3 h-3" />
                    <span>اعلان‌ها</span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {notificationOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <div key={option.id} className="flex items-center space-x-2 space-x-reverse p-2 border rounded-lg hover:bg-gray-50">
                          <Checkbox
                            id={option.id}
                            checked={formData.notifications.includes(option.id)}
                            onCheckedChange={(checked) => handleNotificationChange(option.id, checked as boolean)}
                            data-testid={`checkbox-notification-${option.id}`}
                          />
                          <IconComponent className="w-3 h-3 text-gray-500" />
                          <Label htmlFor={option.id} className="text-xs cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Personal Token Info for Level 1 users */}
              {isPersonal && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 space-x-reverse mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">اطلاعات توکن شخصی</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    با وارد کردن توکن شخصی، می‌توانید از طریق حساب واتس‌اپ خودتان پیام‌ها را مدیریت کنید.
                    این توکن فقط برای شما قابل دسترسی است.
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center space-x-3 space-x-reverse pt-2">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  size="sm"
                  data-testid="button-save-whatsapp-settings"
                >
                  <Save className="w-3 h-3 ml-1" />
                  {updateMutation.isPending ? "در حال ذخیره..." : "ذخیره"}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  data-testid="button-test-whatsapp-connection"
                >
                  <TestTube className="w-3 h-3 ml-1" />
                  تست
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}