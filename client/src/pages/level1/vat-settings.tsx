import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createAuthenticatedRequest } from "@/lib/auth";
import type { VatSettings } from "@shared/schema";
import { Building2, FileText, Image as ImageIcon, MessageSquare, Settings2 } from "lucide-react";

export default function VatSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [vatPercentage, setVatPercentage] = useState<string>("9");
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [nationalId, setNationalId] = useState<string>("");
  const [economicCode, setEconomicCode] = useState<string>("");
  const [stampImage, setStampImage] = useState<string>("");
  const [thankYouMessage, setThankYouMessage] = useState<string>("از خرید شما متشکریم");
  const [uploadingStamp, setUploadingStamp] = useState<boolean>(false);

  const { data: vatSettings, isLoading } = useQuery<VatSettings>({
    queryKey: ["/api/vat-settings"],
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/vat-settings");
      if (!response.ok) throw new Error("خطا در دریافت تنظیمات ارزش افزوده");
      const data = await response.json();
      if (data) {
        setVatPercentage(data.vatPercentage);
        setIsEnabled(data.isEnabled);
        setCompanyName(data.companyName || "");
        setAddress(data.address || "");
        setPhoneNumber(data.phoneNumber || "");
        setNationalId(data.nationalId || "");
        setEconomicCode(data.economicCode || "");
        setStampImage(data.stampImage || "");
        setThankYouMessage(data.thankYouMessage || "از خرید شما متشکریم");
      }
      return data;
    },
  });

  const updateVatMutation = useMutation({
    mutationFn: async (data: { 
      vatPercentage: string; 
      isEnabled: boolean;
      companyName?: string;
      address?: string;
      phoneNumber?: string;
      nationalId?: string;
      economicCode?: string;
      stampImage?: string;
      thankYouMessage?: string;
    }) => {
      const response = await createAuthenticatedRequest("/api/vat-settings", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "خطا در بروزرسانی تنظیمات ارزش افزوده");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vat-settings"] });
      toast({
        title: "موفقیت",
        description: "تنظیمات ارزش افزوده با موفقیت ذخیره شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message || "خطا در ذخیره تنظیمات ارزش افزوده",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const percentage = parseFloat(vatPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast({
        title: "خطا",
        description: "درصد ارزش افزوده باید بین ۰ تا ۱۰۰ باشد",
        variant: "destructive",
      });
      return;
    }

    if (isEnabled) {
      if (!companyName || !address || !phoneNumber || !nationalId || !economicCode) {
        toast({
          title: "خطا",
          description: "هنگام فعال‌سازی ارزش افزوده، تمام فیلدهای اطلاعات شرکت باید پر شوند",
          variant: "destructive",
        });
        return;
      }
    }

    updateVatMutation.mutate({
      vatPercentage: vatPercentage,
      isEnabled: isEnabled,
      companyName: companyName,
      address: address,
      phoneNumber: phoneNumber,
      nationalId: nationalId,
      economicCode: economicCode,
      stampImage: stampImage,
      thankYouMessage: thankYouMessage,
    });
  };

  const handleStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/png')) {
      toast({
        title: "خطا",
        description: "فقط فایل‌های PNG مجاز هستند",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "خطا",
        description: "حجم فایل نباید بیشتر از 2 مگابایت باشد",
        variant: "destructive",
      });
      return;
    }

    setUploadingStamp(true);
    
    try {
      const formData = new FormData();
      formData.append('stampImage', file);

      const response = await createAuthenticatedRequest('/api/vat-settings/upload-stamp', {
        method: 'POST',
        body: formData,
        headers: {},
      });

      if (!response.ok) {
        throw new Error('خطا در آپلود عکس مهر و امضا');
      }

      const data = await response.json();
      setStampImage(data.stampImagePath);
      
      toast({
        title: "موفقیت",
        description: "عکس مهر و امضا با موفقیت آپلود شد",
      });
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در آپلود عکس مهر و امضا",
        variant: "destructive",
      });
    } finally {
      setUploadingStamp(false);
    }
  };

  return (
    <DashboardLayout title="تنظیمات ارزش افزوده">
      <div className="space-y-6">
        <Card className="border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  تنظیمات ارزش افزوده (VAT)
                </CardTitle>
                <CardDescription>
                  مدیریت تنظیمات مالیات بر ارزش افزوده و اطلاعات شرکت
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-lg">
                <Label htmlFor="vat-enabled" className="text-sm font-medium cursor-pointer">
                  {isEnabled ? "فعال" : "غیرفعال"}
                </Label>
                <Switch
                  id="vat-enabled"
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2 text-muted-foreground">در حال بارگذاری...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  تنظیمات عمومی
                </TabsTrigger>
                <TabsTrigger value="company" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  اطلاعات شرکت
                </TabsTrigger>
                <TabsTrigger value="invoice" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  پیام فاکتور
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="text-right">
                    <CardTitle className="text-lg text-right">درصد ارزش افزوده</CardTitle>
                    <CardDescription className="text-right">
                      درصد مالیات بر ارزش افزوده که به فاکتورها اضافه می‌شود
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <span className="text-2xl font-bold text-muted-foreground">٪</span>
                      <div className="flex-1 max-w-xs">
                        <Input
                          id="vat-percentage"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={vatPercentage}
                          onChange={(e) => setVatPercentage(e.target.value)}
                          disabled={!isEnabled}
                          className="text-lg text-center"
                          dir="rtl"
                        />
                      </div>
                      {!isEnabled && (
                        <p className="text-sm text-amber-600">ابتدا ارزش افزوده را فعال کنید</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="company" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">اطلاعات شرکت</CardTitle>
                    <CardDescription>
                      {isEnabled 
                        ? "تمام فیلدهای زیر اجباری هستند" 
                        : "ابتدا ارزش افزوده را فعال کنید تا بتوانید اطلاعات شرکت را وارد کنید"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-name" className="text-right block">نام شرکت *</Label>
                        <Input
                          id="company-name"
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="نام شرکت یا فروشگاه"
                          disabled={!isEnabled}
                          className="text-right"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone-number" className="text-right block">شماره تلفن ثابت *</Label>
                        <Input
                          id="phone-number"
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="02112345678"
                          disabled={!isEnabled}
                          className="text-right"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="national-id" className="text-right block">شناسه ملی *</Label>
                        <Input
                          id="national-id"
                          type="text"
                          value={nationalId}
                          onChange={(e) => setNationalId(e.target.value)}
                          placeholder="شناسه ملی"
                          disabled={!isEnabled}
                          className="text-right"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="economic-code" className="text-right block">کد اقتصادی *</Label>
                        <Input
                          id="economic-code"
                          type="text"
                          value={economicCode}
                          onChange={(e) => setEconomicCode(e.target.value)}
                          placeholder="کد اقتصادی"
                          disabled={!isEnabled}
                          className="text-right"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address" className="text-right block">آدرس کامل *</Label>
                        <Textarea
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="آدرس کامل شرکت"
                          disabled={!isEnabled}
                          rows={3}
                          className="text-right"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="stamp-image" className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        عکس مهر و امضا شرکت (PNG)
                      </Label>
                      <div className="flex items-center gap-4">
                        <input
                          id="stamp-image-input"
                          type="file"
                          accept="image/png"
                          onChange={handleStampUpload}
                          disabled={uploadingStamp || !isEnabled}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('stamp-image-input')?.click()}
                          disabled={uploadingStamp || !isEnabled}
                          className="flex-1"
                        >
                          <ImageIcon className="h-4 w-4 ml-2" />
                          انتخاب فایل
                        </Button>
                        {stampImage && (
                          <div className="flex-shrink-0">
                            <img 
                              src={stampImage} 
                              alt="مهر و امضا" 
                              className="h-20 w-20 border-2 border-gray-300 rounded-lg object-contain bg-white p-1"
                            />
                          </div>
                        )}
                      </div>
                      {uploadingStamp && (
                        <p className="text-sm text-blue-600">در حال آپلود...</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        فقط فایل PNG با حداکثر حجم 2 مگابایت مجاز است
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invoice" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">پیام تشکر در فاکتور</CardTitle>
                    <CardDescription>
                      این متن در انتهای فاکتورهای صادر شده نمایش داده می‌شود
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="thank-you-message">متن تشکر</Label>
                      <Textarea
                        id="thank-you-message"
                        value={thankYouMessage}
                        onChange={(e) => setThankYouMessage(e.target.value)}
                        placeholder="از خرید شما متشکریم"
                        rows={3}
                        className="text-center text-lg"
                      />
                      <p className="text-xs text-muted-foreground">
                        می‌توانید این متن را شخصی‌سازی کنید
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="submit"
                disabled={updateVatMutation.isPending}
                size="lg"
                className="min-w-[150px]"
              >
                {updateVatMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent ml-2"></div>
                    در حال ذخیره...
                  </>
                ) : (
                  "ذخیره تنظیمات"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
