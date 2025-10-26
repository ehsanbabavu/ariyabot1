import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Truck, Package, Gift, Bike } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ShippingSettings } from "@shared/schema";

export default function ShippingSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [postPishtazEnabled, setPostPishtazEnabled] = useState(false);
  const [postNormalEnabled, setPostNormalEnabled] = useState(true);
  const [piykEnabled, setPiykEnabled] = useState(true);
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
  const [freeShippingMinAmount, setFreeShippingMinAmount] = useState("");

  const { data: settings, isLoading } = useQuery<ShippingSettings>({
    queryKey: ["/api/shipping-settings"],
    enabled: !!user,
  });

  useEffect(() => {
    if (settings) {
      setPostPishtazEnabled(settings.postPishtazEnabled);
      setPostNormalEnabled(settings.postNormalEnabled);
      setPiykEnabled(settings.piykEnabled);
      setFreeShippingEnabled(settings.freeShippingEnabled);
      setFreeShippingMinAmount(settings.freeShippingMinAmount || "");
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<ShippingSettings>) => {
      const response = await apiRequest("PUT", "/api/shipping-settings", data);
      if (!response.ok) {
        throw new Error("خطا در بروزرسانی تنظیمات");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipping-settings"] });
      toast({
        title: "موفقیت",
        description: "تنظیمات ترابری با موفقیت ذخیره شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در ذخیره تنظیمات",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate({
      postPishtazEnabled,
      postNormalEnabled,
      piykEnabled,
      freeShippingEnabled,
      freeShippingMinAmount: freeShippingMinAmount ? freeShippingMinAmount : null,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="تنظیمات ترابری">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="تنظیمات ترابری">
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Shipping Methods Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Post Pishtaz */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="pishtaz" className="text-base font-semibold cursor-pointer">
                      پست پیشتاز
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      ارسال سریع با پست
                    </p>
                  </div>
                </div>
                <Switch
                  id="pishtaz"
                  checked={postPishtazEnabled}
                  onCheckedChange={setPostPishtazEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Post Normal */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="normal" className="text-base font-semibold cursor-pointer">
                      پست معمولی
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      ارسال عادی با پست
                    </p>
                  </div>
                </div>
                <Switch
                  id="normal"
                  checked={postNormalEnabled}
                  onCheckedChange={setPostNormalEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Piyk */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Bike className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="piyk" className="text-base font-semibold cursor-pointer">
                      ارسال با پیک
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      تحویل با پیک موتوری
                    </p>
                  </div>
                </div>
                <Switch
                  id="piyk"
                  checked={piykEnabled}
                  onCheckedChange={setPiykEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Free Shipping */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="free" className="text-base font-semibold cursor-pointer">
                      ارسال رایگان
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      برای خریدهای بالای مبلغ مشخص
                    </p>
                  </div>
                </div>
                <Switch
                  id="free"
                  checked={freeShippingEnabled}
                  onCheckedChange={setFreeShippingEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Free Shipping Min Amount */}
        {freeShippingEnabled && (
          <Card className="mb-6 border-2 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                تنظیمات ارسال رایگان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="min-amount" className="text-sm font-medium">
                  حداقل مبلغ خرید برای ارسال رایگان (تومان)
                </Label>
                <Input
                  id="min-amount"
                  type="number"
                  placeholder="مثال: 500000"
                  value={freeShippingMinAmount}
                  onChange={(e) => setFreeShippingMinAmount(e.target.value)}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  سفارشاتی که مبلغ آن‌ها از این عدد بیشتر باشد، ارسال رایگان خواهند داشت
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            size="lg"
            className="min-w-[150px]"
          >
            {updateSettingsMutation.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
