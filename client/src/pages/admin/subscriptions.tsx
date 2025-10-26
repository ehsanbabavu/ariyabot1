import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, X, Power, PowerOff, Calendar, DollarSign, Crown, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAuthenticatedRequest } from "@/lib/auth";
import type { Subscription } from "@shared/schema";

export default function Subscriptions() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    userLevel: "user_level_1",
    imageUrl: "",
    priceBeforeDiscount: "",
    priceAfterDiscount: "",
    duration: "monthly",
    features: [""],
    isActive: true,
  });
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/subscriptions");
      if (!response.ok) throw new Error("خطا در دریافت اشتراک‌ها");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await createAuthenticatedRequest("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          userLevel: data.userLevel,
          image: data.imageUrl || null,
          priceBeforeDiscount: data.priceBeforeDiscount || null,
          priceAfterDiscount: data.priceAfterDiscount || null,
          duration: data.duration,
          features: data.features.filter(f => f.trim() !== ""),
          isActive: data.isActive,
        }),
      });
      if (!response.ok) throw new Error("خطا در ایجاد اشتراک");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      setFormData({ 
        name: "", 
        description: "", 
        userLevel: "user_level_1", 
        imageUrl: "",
        priceBeforeDiscount: "",
        priceAfterDiscount: "",
        duration: "monthly",
        features: [""],
        isActive: true,
      });
      toast({
        title: "✅ موفقیت",
        description: "اشتراک با موفقیت ایجاد شد",
      });
    },
    onError: () => {
      toast({
        title: "❌ خطا",
        description: "خطا در ایجاد اشتراک",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await createAuthenticatedRequest(`/api/subscriptions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          userLevel: data.userLevel,
          image: data.imageUrl || null,
          priceBeforeDiscount: data.priceBeforeDiscount || null,
          priceAfterDiscount: data.priceAfterDiscount || null,
          duration: data.duration,
          features: data.features,
          isActive: data.isActive,
        }),
      });
      if (!response.ok) throw new Error("خطا در بروزرسانی اشتراک");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      setIsEditDialogOpen(false);
      setEditingSubscription(null);
      toast({
        title: "✅ موفقیت",
        description: "اشتراک با موفقیت بروزرسانی شد",
      });
    },
    onError: () => {
      toast({
        title: "❌ خطا",
        description: "خطا در بروزرسانی اشتراک",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await createAuthenticatedRequest(`/api/subscriptions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("خطا در حذف اشتراک");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "✅ موفقیت",
        description: "اشتراک با موفقیت حذف شد",
      });
    },
    onError: () => {
      toast({
        title: "❌ خطا",
        description: "خطا در حذف اشتراک",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await createAuthenticatedRequest(`/api/subscriptions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("خطا در تغییر وضعیت اشتراک");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "✅ موفقیت",
        description: "وضعیت اشتراک با موفقیت تغییر کرد",
      });
    },
    onError: () => {
      toast({
        title: "❌ خطا",
        description: "خطا در تغییر وضعیت اشتراک",
        variant: "destructive",
      });
    },
  });



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "❌ خطا",
        description: "نام اشتراک الزامی است",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubscription) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const featuresValue = formData.get("features") as string;
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      userLevel: formData.get("userLevel") as string,
      imageUrl: formData.get("imageUrl") as string,
      priceBeforeDiscount: formData.get("priceBeforeDiscount") as string,
      priceAfterDiscount: formData.get("priceAfterDiscount") as string,
      duration: formData.get("duration") as string,
      features: featuresValue ? featuresValue.split(',').map(f => f.trim()).filter(f => f) : [],
      isActive: formData.get("isActive") === 'on',
    };

    updateMutation.mutate({ id: editingSubscription.id, data });
  };

  const handleDelete = (id: string) => {
    if (confirm("آیا از حذف این اشتراک اطمینان دارید؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ id, isActive: !currentStatus });
  };

  const getUserLevelBadge = (userLevel: string) => {
    switch (userLevel) {
      case "user_level_1":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">کاربر سطح ۱</Badge>;
      case "user_level_2":
        return <Badge variant="outline" className="border-green-300 text-green-700">کاربر سطح ۲</Badge>;
      default:
        return <Badge variant="secondary">{userLevel}</Badge>;
    }
  };

  return (
    <DashboardLayout title="اشتراک‌ها">
      <div className="space-y-6">
        {/* Add Subscription Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Plus className="w-5 h-5 ml-2 text-primary" />
              افزودن اشتراک جدید
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="subscriptionName" className="text-sm font-medium">
                    نام اشتراک *
                  </Label>
                  <Input
                    id="subscriptionName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="نام اشتراک"
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="userLevel" className="text-sm font-medium">
                    سطح کاربری
                  </Label>
                  <Select
                    value={formData.userLevel}
                    onValueChange={(value) => setFormData({ ...formData, userLevel: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user_level_1">کاربر سطح ۱</SelectItem>
                      <SelectItem value="user_level_2">کاربر سطح ۲</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration" className="text-sm font-medium">
                    مدت زمان
                  </Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => setFormData({ ...formData, duration: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">ماهانه</SelectItem>
                      <SelectItem value="yearly">سالانه</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    توضیحات
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="توضیحات اشتراک"
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="imageUrl" className="text-sm font-medium">
                    لینک تصویر
                  </Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priceBeforeDiscount" className="text-sm font-medium">
                    قیمت قبل تخفیف (تومان)
                  </Label>
                  <Input
                    id="priceBeforeDiscount"
                    type="number"
                    value={formData.priceBeforeDiscount}
                    onChange={(e) => setFormData({ ...formData, priceBeforeDiscount: e.target.value })}
                    placeholder="100000"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="priceAfterDiscount" className="text-sm font-medium">
                    قیمت بعد تخفیف (تومان)
                  </Label>
                  <Input
                    id="priceAfterDiscount"
                    type="number"
                    value={formData.priceAfterDiscount}
                    onChange={(e) => setFormData({ ...formData, priceAfterDiscount: e.target.value })}
                    placeholder="80000"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium flex items-center justify-between">
                    وضعیت فعال
                    <div className="flex items-center gap-2" dir="ltr">
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                        className="data-[state=checked]:bg-primary [&>span]:data-[state=checked]:translate-x-5 [&>span]:data-[state=unchecked]:translate-x-0"
                      />
                      <span className="text-sm text-muted-foreground" dir="rtl">
                        {formData.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </div>
                  </Label>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  ویژگی‌ها و امکانات
                </Label>
                <div className="mt-2 space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...formData.features];
                          newFeatures[index] = e.target.value;
                          setFormData({ ...formData, features: newFeatures });
                        }}
                        placeholder={`ویژگی ${index + 1}`}
                        className="text-sm"
                      />
                      {formData.features.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const newFeatures = formData.features.filter((_, i) => i !== index);
                            setFormData({ ...formData, features: newFeatures });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, features: [...formData.features, ""] })}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    اضافه ویژگی
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      در حال افزودن...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      افزودن اشتراک
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Subscriptions Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {subscriptions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    هیچ اشتراکی موجود نیست
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    اولین اشتراک خود را ایجاد کنید
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {subscriptions.map((subscription) => {
                  const isTrialSubscription = subscription.isDefault;
                  return (
                  <Card key={subscription.id} className="group hover:shadow-lg transition-all duration-300 border hover:border-primary/30 bg-gradient-to-br from-background to-muted/10">
                    <CardContent className="p-0">
                      {/* Header with Image and Status Toggle */}
                      <div className="relative">
                        {subscription.image ? (
                          <div className="relative">
                            <img
                              src={subscription.image}
                              alt={subscription.name}
                              className="w-full h-24 object-cover rounded-t-lg"
                            />
                            <div className="absolute inset-0 bg-black/10 rounded-t-lg" />
                          </div>
                        ) : (
                          <div className="w-full h-24 bg-gradient-to-br from-primary/10 to-primary/20 rounded-t-lg flex items-center justify-center">
                            <Crown className="h-8 w-8 text-primary/60" />
                          </div>
                        )}
                        
                        {/* Status Toggle */}
                        <div className="absolute top-2 left-2">
                          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 border shadow-sm">
                            <div className="flex items-center gap-1.5" dir="ltr">
                              {subscription.isActive ? (
                                <Power className="h-3 w-3 text-green-600" />
                              ) : (
                                <PowerOff className="h-3 w-3 text-gray-400" />
                              )}
                              <Switch
                                checked={subscription.isActive}
                                onCheckedChange={() => handleToggleStatus(subscription.id, subscription.isActive)}
                                disabled={toggleStatusMutation.isPending || isTrialSubscription}
                                data-testid={`switch-subscription-${subscription.id}`}
                                className="scale-75 data-[state=checked]:bg-primary [&>span]:data-[state=checked]:translate-x-5 [&>span]:data-[state=unchecked]:translate-x-0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* User Level Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge variant={subscription.userLevel === "user_level_1" ? "secondary" : "outline"} className="text-xs">
                            {subscription.userLevel === "user_level_1" ? "سطح ۱" : "سطح ۲"}
                          </Badge>
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEdit(subscription)}
                              className="bg-white/95 backdrop-blur-sm hover:bg-white border shadow-sm h-7 w-7 p-0"
                              data-testid={`button-edit-${subscription.id}`}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {!isTrialSubscription && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(subscription.id)}
                                className="bg-white/95 backdrop-blur-sm hover:bg-red-50 text-red-600 border shadow-sm h-7 w-7 p-0"
                                data-testid={`button-delete-${subscription.id}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Trial Badge */}
                        {isTrialSubscription && (
                          <div className="absolute bottom-2 left-2">
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                              <Clock className="h-3 w-3 ml-1" />
                              رایگان
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="p-3">
                        {/* Title and Status */}
                        <div className="mb-3">
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-1 leading-tight" data-testid={`text-subscription-name-${subscription.id}`}>
                            {subscription.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={subscription.isActive ? "default" : "secondary"}
                              className="text-xs"
                              data-testid={`badge-status-${subscription.id}`}
                            >
                              <div className="flex items-center gap-1">
                                {subscription.isActive ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <Clock className="h-3 w-3" />
                                )}
                                {subscription.isActive ? "فعال" : "غیرفعال"}
                              </div>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 ml-1" />
                              {subscription.duration === "monthly" ? "ماهانه" : "سالانه"}
                            </Badge>
                          </div>
                        </div>

                        {/* Description */}
                        {subscription.description && (
                          <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2" data-testid={`text-description-${subscription.id}`}>
                            {subscription.description}
                          </p>
                        )}

                        {/* Pricing */}
                        <div className="mb-3">
                          <div className="text-center">
                            {subscription.priceAfterDiscount && subscription.priceBeforeDiscount ? (
                              <div className="space-y-1">
                                <div className="flex items-center justify-center gap-2">
                                  <span className="text-lg font-bold text-primary" data-testid={`text-price-after-${subscription.id}`}>
                                    {parseFloat(subscription.priceAfterDiscount).toLocaleString()}
                                  </span>
                                  <span className="text-xs text-muted-foreground">تومان</span>
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-xs line-through text-muted-foreground" data-testid={`text-price-before-${subscription.id}`}>
                                    {parseFloat(subscription.priceBeforeDiscount).toLocaleString()}
                                  </span>
                                  <span className="text-xs text-muted-foreground">تومان</span>
                                </div>
                              </div>
                            ) : subscription.priceBeforeDiscount ? (
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-lg font-bold text-primary" data-testid={`text-price-single-${subscription.id}`}>
                                  {parseFloat(subscription.priceBeforeDiscount).toLocaleString()}
                                </span>
                                <span className="text-xs text-muted-foreground">تومان</span>
                              </div>
                            ) : (
                              <span className="text-sm text-green-600 font-medium">رایگان</span>
                            )}
                          </div>
                        </div>

                        {/* Features */}
                        {subscription.features && subscription.features.length > 0 && (
                          <div className="border-t pt-2">
                            <div className="text-xs font-medium text-foreground mb-2">ویژگی‌ها:</div>
                            <div className="space-y-1">
                              {subscription.features.slice(0, 2).map((feature, index) => (
                                <div key={index} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="leading-4 line-clamp-1">{feature}</span>
                                </div>
                              ))}
                              {subscription.features.length > 2 && (
                                <div className="text-xs text-primary font-medium">
                                  + {subscription.features.length - 2} ویژگی دیگر
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Edit Subscription Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                ویرایش اشتراک
              </DialogTitle>
            </DialogHeader>
            
            {editingSubscription && (
              <form onSubmit={handleUpdateSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="editName" className="text-sm font-medium">
                        نام اشتراک *
                      </Label>
                      <Input
                        id="editName"
                        name="name"
                        defaultValue={editingSubscription.name}
                        required
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="editUserLevel" className="text-sm font-medium">
                        سطح کاربری
                      </Label>
                      <Select name="userLevel" defaultValue={editingSubscription.userLevel}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user_level_1">کاربر سطح ۱</SelectItem>
                          <SelectItem value="user_level_2">کاربر سطح ۲</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="editDescription" className="text-sm font-medium">
                        توضیحات
                      </Label>
                      <Textarea
                        id="editDescription"
                        name="description"
                        defaultValue={editingSubscription.description || ""}
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="editPriceBeforeDiscount" className="text-sm font-medium">
                          قیمت قبل تخفیف (تومان)
                        </Label>
                        <Input
                          id="editPriceBeforeDiscount"
                          name="priceBeforeDiscount"
                          type="number"
                          defaultValue={editingSubscription.priceBeforeDiscount || ""}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="editPriceAfterDiscount" className="text-sm font-medium">
                          قیمت بعد تخفیف (تومان)
                        </Label>
                        <Input
                          id="editPriceAfterDiscount"
                          name="priceAfterDiscount"
                          type="number"
                          defaultValue={editingSubscription.priceAfterDiscount || ""}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="editDuration" className="text-sm font-medium">
                          مدت زمان اشتراک
                        </Label>
                        <Select name="duration" defaultValue={editingSubscription.duration || "monthly"}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">ماهانه</SelectItem>
                            <SelectItem value="yearly">سالانه</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium flex items-center gap-2">
                          وضعیت فعال
                          <input
                            type="checkbox"
                            name="isActive"
                            defaultChecked={editingSubscription.isActive !== false}
                            className="rounded"
                          />
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="editImageUrl" className="text-sm font-medium">
                        لینک تصویر اشتراک
                      </Label>
                      <Input
                        id="editImageUrl"
                        name="imageUrl"
                        type="url"
                        defaultValue={editingSubscription.image || ""}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="editFeatures" className="text-sm font-medium">
                        ویژگی‌ها (با کاما جدا کنید)
                      </Label>
                      <Textarea
                        id="editFeatures"
                        name="features"
                        defaultValue={editingSubscription.features ? editingSubscription.features.join(', ') : ""}
                        rows={4}
                        placeholder="ویژگی اول, ویژگی دوم, ویژگی سوم"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    لغو
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        در حال ذخیره...
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        ذخیره تغییرات
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}