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
import { ShoppingCart, Plus, Minus, Trash2, Package, MapPin, Star, CreditCard, Truck, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CartItem, Product, Address } from "@shared/schema";

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

  // Calculate total
  const totalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

  // Proceed to checkout mutation
  const proceedToCheckoutMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAddressId) {
        throw new Error("لطفاً آدرس تحویل را انتخاب کنید");
      }
      const response = await apiRequest("POST", "/api/orders", {
        addressId: selectedAddressId
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

  const handleProceedToCheckout = () => {
    if (cartItems.length > 0) {
      proceedToCheckoutMutation.mutate();
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
      <div className="space-y-6" data-testid="cart-content">
        {/* Modern Cart Header */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">سبد خرید شما</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-sm">
                      {totalItems} محصول
                    </Badge>
                    {totalAmount > 500000 && (
                      <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                        ارسال رایگان
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {cartItems.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  disabled={clearCartMutation.isPending}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                  data-testid="button-clear-cart"
                >
                  {clearCartMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current ml-2"></div>
                  ) : (
                    <Trash2 className="h-4 w-4 ml-2" />
                  )}
                  پاک کردن سبد
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

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
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3">
              {cartItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1" data-testid={`text-product-name-${item.id}`}>
                          {item.productName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            قیمت واحد: {parseFloat(item.unitPrice).toLocaleString()} تومان
                          </Badge>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
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
                          className="w-12 text-center text-sm h-8"
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

                      {/* Price and Remove */}
                      <div className="text-left flex flex-col gap-1">
                        <p className="font-bold text-base" data-testid={`text-total-price-${item.id}`}>
                          {parseFloat(item.totalPrice).toLocaleString()} تومان
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removeItemMutation.isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 text-xs"
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="h-3 w-3 ml-1" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Checkout Summary and Address - Full Width */}
            <div className="space-y-4">
              {/* Address Selection */}
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    آدرس تحویل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {addressesLoading ? (
                    <div className="space-y-2">
                      <Label className="text-sm">انتخاب آدرس:</Label>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                        <span className="text-xs text-muted-foreground">در حال بارگذاری آدرس‌ها...</span>
                      </div>
                    </div>
                  ) : addresses.length > 0 ? (
                    <div className="space-y-2">
                      <Label className="text-sm">انتخاب آدرس:</Label>
                      <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                        <SelectTrigger data-testid="select-address" className="text-sm h-9">
                          <SelectValue placeholder="آدرس تحویل را انتخاب کنید" />
                        </SelectTrigger>
                        <SelectContent>
                          {addresses.map((address) => (
                            <SelectItem key={address.id} value={address.id}>
                              {address.title} - {address.fullAddress.substring(0, 30)}...
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      هیچ آدرسی ثبت نشده است. لطفاً آدرس جدید اضافه کنید.
                    </p>
                  )}
                  
                  <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full text-xs h-8" data-testid="button-add-address">
                        <Plus className="h-3 w-3 ml-1" />
                        اضافه کردن آدرس جدید
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
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
                          
                          <div className="flex items-center space-x-2 bg-muted/50 p-2 rounded-lg">
                            <Input
                              type="checkbox"
                              id="isDefault"
                              checked={newAddress.isDefault}
                              onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                              className="w-4 h-4"
                              data-testid="checkbox-default-address"
                            />
                            <Label htmlFor="isDefault" className="text-sm cursor-pointer">
                              تنظیم به عنوان آدرس پیش‌فرض
                            </Label>
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
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white ml-1"></div>
                                در حال ذخیره...
                              </>
                            ) : (
                              <>
                                <MapPin className="h-3 w-3 ml-1" />
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

              {/* Order Summary */}
              <Card className="h-fit">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShoppingCart className="h-4 w-4" />
                    خلاصه سفارش
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-center justify-between py-1 px-2 bg-muted/30 rounded text-sm">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-primary" />
                      <span className="font-medium">تعداد محصولات</span>
                    </div>
                    <Badge variant="secondary" className="text-xs" data-testid="text-total-items">
                      {totalItems} عدد
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">جمع کل سبد خرید:</span>
                    <div className="text-left">
                      <span className="text-base font-bold text-primary" data-testid="text-total-amount">
                        {totalAmount.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground mr-1">تومان</span>
                    </div>
                  </div>

                  {totalAmount > 500000 && (
                    <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded text-center">
                      <div className="flex items-center justify-center gap-1 text-green-700 dark:text-green-400">
                        <Truck className="h-3 w-3" />
                        <span className="text-xs font-medium">ارسال رایگان</span>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={handleProceedToCheckout}
                    disabled={proceedToCheckoutMutation.isPending || !selectedAddressId}
                    data-testid="button-proceed-checkout"
                  >
                    {proceedToCheckoutMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white ml-1"></div>
                        در حال پردازش...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-3 w-3 ml-1" />
                        تکمیل خرید
                      </>
                    )}
                  </Button>
                  
                  {!selectedAddressId && cartItems.length > 0 && (
                    <p className="text-xs text-orange-500 text-center bg-orange-50 dark:bg-orange-950/20 p-2 rounded">
                      لطفاً ابتدا آدرس تحویل را انتخاب کنید
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