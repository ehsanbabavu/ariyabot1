import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ShoppingCart, Plus, Minus, Trash2, Package, MapPin, CreditCard, Truck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CartItem, Product, Address, ShippingSettings } from "@shared/schema";

// Extended cart item with product details
interface CartItemWithProduct extends CartItem {
  productName: string;
  productDescription?: string;
  productImage?: string;
}

export default function Cart() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>("");
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: "",
    fullAddress: "",
    postalCode: "",
    isDefault: false
  });

  // Get user's cart items
  const { data: cartItems = [], isLoading: cartLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  // Get user's addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
    enabled: !!user,
  });

  // Get seller ID from user (parent user for level 2)
  const sellerId = user?.parentUserId;

  // Get seller's shipping settings
  const { data: shippingSettings, isLoading: shippingLoading } = useQuery<ShippingSettings>({
    queryKey: [`/api/shipping-settings/${sellerId}`],
    enabled: !!user && user.role === "user_level_2" && !!sellerId,
  });

  // Get user's balance
  const { data: balanceData } = useQuery<{ balance: number }>({
    queryKey: ["/api/balance"],
    enabled: !!user,
  });
  const userBalance = balanceData?.balance || 0;

  // Calculate total
  const totalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Check if user has sufficient balance
  const hasSufficientBalance = userBalance >= totalAmount;

  // Auto-select default address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses, selectedAddressId]);

  // Add new address mutation
  const addAddressMutation = useMutation({
    mutationFn: async (addressData: typeof newAddress) => {
      const response = await apiRequest("POST", "/api/addresses", addressData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "خطا در ثبت آدرس");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      setSelectedAddressId(data.id);
      setIsAddressDialogOpen(false);
      setNewAddress({
        title: "",
        fullAddress: "",
        postalCode: "",
        isDefault: false
      });
      toast({
        title: "موفقیت",
        description: "آدرس جدید با موفقیت اضافه شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update cart item quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity < 1) {
        throw new Error("تعداد باید بیشتر از صفر باشد");
      }
      const response = await apiRequest("PATCH", `/api/cart/items/${itemId}`, { quantity });
      if (!response.ok) {
        throw new Error("خطا در بروزرسانی تعداد");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "موفقیت",
        description: "تعداد محصول بروزرسانی شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove item from cart
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest("DELETE", `/api/cart/items/${itemId}`);
      if (!response.ok) {
        throw new Error("خطا در حذف محصول از سبد");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "موفقیت",
        description: "محصول از سبد خرید حذف شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Clear entire cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/cart/clear");
      if (!response.ok) {
        throw new Error("خطا در پاک کردن سبد");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "موفقیت", 
        description: "سبد خرید پاک شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const handleClearCart = () => {
    if (cartItems.length > 0) {
      clearCartMutation.mutate();
    }
  };

  // Proceed to checkout mutation (regular order)
  const proceedToCheckoutMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAddressId) {
        throw new Error("لطفاً آدرس تحویل را انتخاب کنید");
      }
      if (!selectedShippingMethod) {
        throw new Error("لطفاً روش ارسال را انتخاب کنید");
      }
      const response = await apiRequest("POST", "/api/orders", {
        addressId: selectedAddressId,
        shippingMethod: selectedShippingMethod
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "خطا در ثبت سفارش");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "موفقیت",
        description: "سفارش شما با موفقیت ثبت شد و در لیست سفارشات شما قرار گرفت",
      });
      // Redirect to orders page
      setLocation('/orders');
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Pay from balance mutation
  const payFromBalanceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAddressId) {
        throw new Error("لطفاً آدرس تحویل را انتخاب کنید");
      }
      if (!selectedShippingMethod) {
        throw new Error("لطفاً روش ارسال را انتخاب کنید");
      }
      const response = await apiRequest("POST", "/api/orders/pay-from-balance", {
        addressId: selectedAddressId,
        shippingMethod: selectedShippingMethod
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "خطا در پرداخت از اعتبار");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "موفقیت",
        description: "سفارش شما با موفقیت از اعتبار پرداخت شد و در لیست سفارشات شما قرار گرفت",
      });
      // Redirect to orders page
      setLocation('/orders');
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProceedToCheckout = () => {
    if (cartItems.length > 0) {
      if (hasSufficientBalance) {
        // پرداخت از اعتبار
        payFromBalanceMutation.mutate();
      } else {
        // ثبت سفارش عادی
        proceedToCheckoutMutation.mutate();
      }
    }
  };

  const handleAddNewAddress = () => {
    if (newAddress.title && newAddress.fullAddress) {
      addAddressMutation.mutate(newAddress);
    } else {
      toast({
        title: "خطا",
        description: "لطفاً عنوان و آدرس کامل را وارد کنید",
        variant: "destructive",
      });
    }
  };

  if (cartLoading) {
    return (
      <DashboardLayout title="سبد خرید">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">در حال بارگذاری...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="سبد خرید">
      <div className="space-y-4" data-testid="cart-content">
        {cartItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">سبد خرید شما خالی است</h3>
              <p className="text-muted-foreground mb-4">
                هنوز محصولی به سبد خرید خود اضافه نکرده‌اید
              </p>
              <Link href="/products">
                <Button variant="default" data-testid="button-start-shopping">
                  شروع خرید
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* ستون راست - جدول/کارت‌های محصولات (بزرگتر) */}
            <div className="lg:col-span-8">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      محصولات سبد خرید
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCart}
                      disabled={clearCartMutation.isPending}
                      className="hover:bg-destructive hover:text-destructive-foreground w-full sm:w-auto"
                      data-testid="button-clear-cart"
                    >
                      {clearCartMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current ml-2"></div>
                      ) : (
                        <Trash2 className="h-4 w-4 ml-2" />
                      )}
                      پاک کردن سبد
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* جدول محصولات - فقط برای دسکتاپ */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-right py-3 px-2 text-sm font-semibold">محصول</th>
                          <th className="text-center py-3 px-2 text-sm font-semibold">قیمت واحد</th>
                          <th className="text-center py-3 px-2 text-sm font-semibold">تعداد</th>
                          <th className="text-center py-3 px-2 text-sm font-semibold">قیمت کل</th>
                          <th className="text-center py-3 px-2 text-sm font-semibold">عملیات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-3">
                                {item.productImage ? (
                                  <img
                                    src={item.productImage}
                                    alt={item.productName}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                    <Package className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                                <span className="font-medium" data-testid={`text-product-name-${item.id}`}>
                                  {item.productName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className="text-sm">
                                {parseFloat(item.unitPrice).toLocaleString()} تومان
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  disabled={updateQuantityMutation.isPending || item.quantity <= 1}
                                  data-testid={`button-decrease-${item.id}`}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  key={`${item.id}-${item.quantity}`}
                                  defaultValue={item.quantity}
                                  onBlur={(e) => {
                                    const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                                    if (newQuantity !== item.quantity) {
                                      handleQuantityChange(item.id, newQuantity);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const newQuantity = Math.max(1, parseInt(e.currentTarget.value) || 1);
                                      if (newQuantity !== item.quantity) {
                                        handleQuantityChange(item.id, newQuantity);
                                      }
                                    }
                                  }}
                                  className="w-16 text-center text-sm h-8"
                                  min="1"
                                  data-testid={`input-quantity-${item.id}`}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  disabled={updateQuantityMutation.isPending}
                                  data-testid={`button-increase-${item.id}`}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className="font-bold text-primary" data-testid={`text-total-price-${item.id}`}>
                                {parseFloat(item.totalPrice).toLocaleString()} تومان
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={removeItemMutation.isPending}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                data-testid={`button-remove-${item.id}`}
                              >
                                <Trash2 className="h-4 w-4 ml-1" />
                                حذف
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* کارت‌های محصولات - فقط برای موبایل */}
                  <div className="lg:hidden space-y-3">
                    {cartItems.map((item) => (
                      <Card key={item.id} className="border-2">
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package className="h-10 w-10 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-1 truncate" data-testid={`text-product-name-${item.id}`}>
                                {item.productName}
                              </h4>
                              <div className="text-xs text-muted-foreground mb-2">
                                قیمت واحد: {parseFloat(item.unitPrice).toLocaleString()} تومان
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    disabled={updateQuantityMutation.isPending || item.quantity <= 1}
                                    data-testid={`button-decrease-${item.id}`}
                                    className="h-9 w-9 p-0"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <Input
                                    type="number"
                                    key={`${item.id}-${item.quantity}`}
                                    defaultValue={item.quantity}
                                    onBlur={(e) => {
                                      const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                                      if (newQuantity !== item.quantity) {
                                        handleQuantityChange(item.id, newQuantity);
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const newQuantity = Math.max(1, parseInt(e.currentTarget.value) || 1);
                                        if (newQuantity !== item.quantity) {
                                          handleQuantityChange(item.id, newQuantity);
                                        }
                                      }
                                    }}
                                    className="w-14 text-center text-sm h-9"
                                    min="1"
                                    data-testid={`input-quantity-${item.id}`}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    disabled={updateQuantityMutation.isPending}
                                    data-testid={`button-increase-${item.id}`}
                                    className="h-9 w-9 p-0"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.id)}
                                  disabled={removeItemMutation.isPending}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9"
                                  data-testid={`button-remove-${item.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="mt-2 text-left">
                                <span className="font-bold text-primary text-sm" data-testid={`text-total-price-${item.id}`}>
                                  جمع: {parseFloat(item.totalPrice).toLocaleString()} تومان
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ستون چپ - اطلاعات سفارش (کوچکتر) */}
            <div className="lg:col-span-4 space-y-4">
              {/* آدرس تحویل */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    آدرس تحویل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {addressesLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">در حال بارگذاری...</span>
                    </div>
                  ) : addresses.length > 0 ? (
                    <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                      <SelectTrigger data-testid="select-address" className="text-sm">
                        <SelectValue placeholder="آدرس تحویل را انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {addresses.map((address) => (
                          <SelectItem key={address.id} value={address.id} className="text-sm">
                            {address.title} - {address.fullAddress.substring(0, 30)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      هیچ آدرسی ثبت نشده است
                    </p>
                  )}
                  
                  <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full" data-testid="button-add-address">
                        <Plus className="h-4 w-4 ml-2" />
                        افزودن آدرس جدید
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          اضافه کردن آدرس جدید
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="title" className="text-sm font-medium">عنوان آدرس *</Label>
                            <Input
                              id="title"
                              placeholder="مثال: منزل، محل کار، آدرس والدین"
                              value={newAddress.title}
                              onChange={(e) => setNewAddress({...newAddress, title: e.target.value})}
                              className="mt-1"
                              data-testid="input-address-title"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="fullAddress" className="text-sm font-medium">آدرس کامل *</Label>
                            <Textarea
                              id="fullAddress"
                              placeholder="لطفاً آدرس کامل شامل استان، شهر، خیابان، کوچه، پلاک و واحد را وارد کنید..."
                              value={newAddress.fullAddress}
                              onChange={(e) => setNewAddress({...newAddress, fullAddress: e.target.value})}
                              className="mt-1 min-h-[80px]"
                              data-testid="textarea-full-address"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="postalCode" className="text-sm font-medium">کد پستی</Label>
                            <Input
                              id="postalCode"
                              placeholder="1234567890"
                              value={newAddress.postalCode || ""}
                              onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                              className="mt-1"
                              maxLength={10}
                              data-testid="input-postal-code"
                            />
                            <p className="text-xs text-muted-foreground mt-1">کد پستی 10 رقمی (اختیاری)</p>
                          </div>
                          
                          <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                            <Label htmlFor="isDefault" className="text-sm font-medium cursor-pointer">
                              تنظیم به عنوان آدرس پیش‌فرض
                            </Label>
                            <div className="flex items-center gap-2" dir="ltr">
                              <Switch
                                id="isDefault"
                                checked={newAddress.isDefault}
                                onCheckedChange={(checked) => setNewAddress({...newAddress, isDefault: checked})}
                                data-testid="switch-default-address"
                                className="data-[state=checked]:bg-primary [&>span]:data-[state=checked]:translate-x-5 [&>span]:data-[state=unchecked]:translate-x-0"
                              />
                              <span className="text-sm text-muted-foreground" dir="rtl">
                                {newAddress.isDefault ? "فعال" : "غیرفعال"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            onClick={() => setIsAddressDialogOpen(false)}
                            className="flex-1"
                          >
                            انصراف
                          </Button>
                          <Button 
                            onClick={handleAddNewAddress} 
                            disabled={addAddressMutation.isPending}
                            className="flex-1"
                            data-testid="button-save-address"
                          >
                            {addAddressMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                                در حال ذخیره...
                              </>
                            ) : (
                              <>
                                <MapPin className="h-4 w-4 ml-2" />
                                ذخیره آدرس
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* روش ارسال */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Truck className="h-4 w-4" />
                    روش ارسال
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {shippingLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">در حال بارگذاری...</span>
                    </div>
                  ) : shippingSettings ? (
                    <>
                      {(shippingSettings.postPishtazEnabled || shippingSettings.postNormalEnabled || shippingSettings.piykEnabled || shippingSettings.freeShippingEnabled) ? (
                        <div className="space-y-2">
                          {shippingSettings.postPishtazEnabled && (
                            <button
                              onClick={() => setSelectedShippingMethod('post_pishtaz')}
                              className={`w-full p-3 rounded-md border transition-all text-right ${
                                selectedShippingMethod === 'post_pishtaz' 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-gray-200 hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                <span className="font-medium text-sm">پست پیشتاز</span>
                              </div>
                            </button>
                          )}
                          {shippingSettings.postNormalEnabled && (
                            <button
                              onClick={() => setSelectedShippingMethod('post_normal')}
                              className={`w-full p-3 rounded-md border transition-all text-right ${
                                selectedShippingMethod === 'post_normal' 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-gray-200 hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                <span className="font-medium text-sm">پست معمولی</span>
                              </div>
                            </button>
                          )}
                          {shippingSettings.piykEnabled && (
                            <button
                              onClick={() => setSelectedShippingMethod('piyk')}
                              className={`w-full p-3 rounded-md border transition-all text-right ${
                                selectedShippingMethod === 'piyk' 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-gray-200 hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-primary" />
                                <span className="font-medium text-sm">ارسال با پیک</span>
                              </div>
                            </button>
                          )}
                          {shippingSettings.freeShippingEnabled && totalAmount >= parseFloat(shippingSettings.freeShippingMinAmount || '0') && (
                            <button
                              onClick={() => setSelectedShippingMethod('free')}
                              className={`w-full p-3 rounded-md border transition-all text-right ${
                                selectedShippingMethod === 'free' 
                                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                                  : 'border-green-200 hover:border-green-500/50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Truck className="h-4 w-4 text-green-600" />
                                  <span className="font-medium text-sm text-green-600">ارسال رایگان</span>
                                </div>
                                <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950/30 text-green-700">
                                  رایگان
                                </Badge>
                              </div>
                            </button>
                          )}
                          {shippingSettings.freeShippingEnabled && totalAmount < parseFloat(shippingSettings.freeShippingMinAmount || '0') && (
                            <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                حداقل {parseFloat(shippingSettings.freeShippingMinAmount || '0').toLocaleString()} تومان برای ارسال رایگان
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          روش ارسالی فعال نیست
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      تنظیمات ارسال در دسترس نیست
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* خلاصه سفارش */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShoppingCart className="h-4 w-4" />
                    خلاصه سفارش
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
                    <span className="font-medium text-sm">تعداد محصولات:</span>
                    <Badge variant="secondary" data-testid="text-total-items">
                      {totalItems} عدد
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-semibold">جمع کل:</span>
                    <div className="text-left">
                      <span className="text-lg font-bold text-primary" data-testid="text-total-amount">
                        {totalAmount.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground mr-1">تومان</span>
                    </div>
                  </div>

                  {shippingSettings?.freeShippingEnabled && 
                   shippingSettings?.freeShippingMinAmount && 
                   totalAmount >= parseFloat(shippingSettings.freeShippingMinAmount) && (
                    <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded text-center">
                      <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                        <Truck className="h-4 w-4" />
                        <span className="text-sm font-medium">ارسال رایگان</span>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    onClick={handleProceedToCheckout}
                    disabled={proceedToCheckoutMutation.isPending || payFromBalanceMutation.isPending || !selectedAddressId || !selectedShippingMethod}
                    data-testid="button-proceed-checkout"
                  >
                    {(proceedToCheckoutMutation.isPending || payFromBalanceMutation.isPending) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                        در حال پردازش...
                      </>
                    ) : hasSufficientBalance ? (
                      <>
                        <CreditCard className="h-4 w-4 ml-2" />
                        پرداخت از اعتبار
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 ml-2" />
                        تکمیل خرید
                      </>
                    )}
                  </Button>
                  
                  {!selectedAddressId && cartItems.length > 0 && (
                    <p className="text-xs text-orange-600 text-center bg-orange-50 dark:bg-orange-950/20 p-2 rounded">
                      لطفاً آدرس تحویل را انتخاب کنید
                    </p>
                  )}
                  {!selectedShippingMethod && cartItems.length > 0 && (
                    <p className="text-xs text-orange-600 text-center bg-orange-50 dark:bg-orange-950/20 p-2 rounded">
                      لطفاً روش ارسال را انتخاب کنید
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
