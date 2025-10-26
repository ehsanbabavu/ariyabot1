import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Clock, CheckCircle, AlertCircle, MessageSquare, Package, TrendingUp, Grid3X3, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createAuthenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UserSubscription, Ticket, Product, SentMessage, Order } from "@shared/schema";

// Extended Order type with customer and address info (same as in received-orders)
type OrderWithDetails = Order & {
  addressTitle?: string;
  fullAddress?: string;
  postalCode?: string;
  buyerFirstName?: string;
  buyerLastName?: string;
  buyerPhone?: string;
};

// Extended subscription type with subscription details
interface UserSubscriptionWithDetails extends UserSubscription {
  subscriptionName?: string | null;
  subscriptionDescription?: string | null;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Get user's subscription info
  const { data: userSubscription, isLoading: subscriptionLoading } = useQuery<UserSubscriptionWithDetails | null>({
    queryKey: ["/api/user-subscriptions/me"],
    enabled: !!user && user.role !== "user_level_2",
    queryFn: async () => {
      if (!user) return null;
      
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      const response = await fetch("/api/user-subscriptions/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error(`Failed to fetch subscription: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  // Get user's tickets
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
    enabled: !!user && user.role !== "user_level_2",
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/tickets");
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error("خطا در دریافت تیکت‌ها");
      }
      return response.json();
    },
  });

  // Get user's products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!user && user.role !== "user_level_2",
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/products");
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error("خطا در دریافت محصولات");
      }
      return response.json();
    },
  });

  // Get user's sent messages (for level 1 users)
  const { data: sentMessages = [], isLoading: messagesLoading } = useQuery<SentMessage[]>({
    queryKey: ["/api/sent-messages"],
    enabled: !!user && user.role !== "user_level_2",
    queryFn: async () => {
      try {
        const response = await createAuthenticatedRequest("/api/sent-messages");
        if (!response.ok) return [];
        return response.json();
      } catch {
        return [];
      }
    },
  });


  // Get pending orders (پرداخت شده و در انتظار تایید) list for dashboard (for level 1 users)
  const { data: unpaidPendingOrders = [] } = useQuery<OrderWithDetails[]>({
    queryKey: ["/api/orders/seller"],
    enabled: !!user && user.role === "user_level_1",
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/orders/seller");
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error("خطا در دریافت سفارشات");
      }
      return response.json();
    },
    select: (data) => data.filter(order => order.status === 'pending'), // فقط سفارشات پرداخت شده و در انتظار تایید
  });

  // Get available products for level 2 users (shopping)
  const { data: availableProducts = [], isLoading: shoppingProductsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/shop"],
    enabled: !!user && user.role === "user_level_2",
    queryFn: async () => {
      try {
        const response = await createAuthenticatedRequest("/api/products/shop");
        if (!response.ok) return [];
        return response.json();
      } catch {
        return [];
      }
    },
  });


  const { toast } = useToast();

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      const response = await createAuthenticatedRequest("/api/cart/add", {
        method: "POST",
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });
      if (!response.ok) {
        throw new Error("خطا در افزودن به سبد خرید");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "موفقیت",
        description: "محصول به سبد خرید اضافه شد",
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

  // Calculate stats
  const openTickets = tickets.filter(ticket => ticket.status !== "closed").length;
  const activeProducts = products.filter(product => product.isActive).length;
  const totalSentMessages = sentMessages.length;

  // Categorize products for shopping view
  const bestSellingProducts = useMemo(() => 
    availableProducts
      .filter(product => product.quantity && product.quantity > 0) // Use quantity as proxy for sales
      .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
      .slice(0, 8),
    [availableProducts]
  );
  const allProducts = availableProducts.slice(0, 16); // Show 16 total products

  const handleAddToCart = (productId: string) => {
    addToCartMutation.mutate({ productId, quantity: 1 });
  };

  // Auto-scroll effect for best selling products
  useEffect(() => {
    if (user?.role === "user_level_2" && bestSellingProducts.length > 1) {
      const slider = sliderRef.current;
      if (!slider) return;

      // Guard: Only start autoplay when the slider actually overflows
      const hasOverflow = slider.scrollWidth > slider.clientWidth;
      if (!hasOverflow) return;

      // Calculate step dynamically from real card spacing
      const getStep = () => {
        const children = slider.children;
        if (children.length < 2) return 300; // Fallback
        
        const firstCard = (children[0] as HTMLElement).getBoundingClientRect();
        const secondCard = (children[1] as HTMLElement).getBoundingClientRect();
        return Math.round(secondCard.left - firstCard.left);
      };

      let step = getStep();

      // ResizeObserver to recompute step on viewport changes
      const resizeObserver = new ResizeObserver(() => {
        step = getStep();
      });
      resizeObserver.observe(slider);

      const interval = setInterval(() => {
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        const nextPosition = slider.scrollLeft + step;

        if (nextPosition >= maxScroll - 2) {
          // Reset to beginning
          slider.scrollTo({ left: 0, behavior: 'smooth' });
          setCurrentSlide(0);
        } else {
          // Move to next slide
          slider.scrollTo({ left: nextPosition, behavior: 'smooth' });
          setCurrentSlide(prev => (prev + 1) % bestSellingProducts.length);
        }
      }, 3000); // Auto slide every 3 seconds

      return () => {
        clearInterval(interval);
        resizeObserver.disconnect();
      };
    }
  }, [user?.role, bestSellingProducts]);

  // Shopping view for user_level_2
  if (user?.role === "user_level_2") {
    return (
      <DashboardLayout title="فروشگاه">
        <div className="space-y-6" data-testid="shopping-dashboard-content">
          {/* Best Selling Products - Horizontal Slider */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-bold">پرفروش‌ترین محصولات</h2>
            </div>
            <div className="relative">
              <div 
                ref={sliderRef}
                className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide" 
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  direction: 'ltr' // Force LTR for proper horizontal scrolling
                }}
              >
                {bestSellingProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-all min-w-[280px] flex-shrink-0">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-sm line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {product.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Badge variant="secondary" className="text-xs">
                              {parseFloat(product.priceAfterDiscount || product.priceBeforeDiscount).toLocaleString()} تومان
                            </Badge>
                            <Badge variant="outline" className="text-xs block">
                              موجودی: {product.quantity || 0}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product.id)}
                            disabled={addToCartMutation.isPending}
                            data-testid={`button-add-to-cart-bestseller-${product.id}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* All Products */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-bold">تمامی محصولات</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {allProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {parseFloat(product.priceAfterDiscount || product.priceBeforeDiscount).toLocaleString()} تومان
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product.id)}
                          disabled={addToCartMutation.isPending}
                          data-testid={`button-add-to-cart-all-${product.id}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Admin/Level1 dashboard view
  return (
    <DashboardLayout title="پیشخوان">
      <div className="space-y-4" data-testid="dashboard-content">

        {/* Subscription Information - Hidden for user_level_2 */}
        {user?.role !== "user_level_2" && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2 text-sm text-blue-900 dark:text-blue-300">
                <Crown className="h-4 w-4" />
                اطلاعات اشتراک
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {subscriptionLoading ? (
                <div className="text-center py-2">
                  <div className="text-xs text-muted-foreground">در حال بارگذاری...</div>
                </div>
              ) : userSubscription ? (
                <div className="space-y-2">
                  {/* Subscription Status */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {userSubscription.status === 'active' && userSubscription.remainingDays > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                    <Badge 
                      variant={userSubscription.status === 'active' && userSubscription.remainingDays > 0 ? "default" : "destructive"}
                      data-testid="badge-subscription-status"
                      className="text-xs"
                    >
                      {userSubscription.status === 'active' && userSubscription.remainingDays > 0 ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </div>

                  {/* Subscription Details */}
                  <div className="flex items-center justify-between p-2 bg-white dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Crown className="h-3 w-3 text-green-600 dark:text-green-400" />
                        <span className="text-xs text-green-700 dark:text-green-300" data-testid="text-subscription-name">
                          {userSubscription.subscriptionName || 'نامشخص'}
                        </span>
                        {userSubscription.isTrialPeriod && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-1">آزمایشی</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300" data-testid="text-remaining-days">
                          {userSubscription.remainingDays || 0} روز باقیمانده
                        </span>
                      </div>
                    </div>
                    
                    {userSubscription.remainingDays <= 7 && userSubscription.remainingDays > 0 && (
                      <Badge variant="destructive" className="text-[10px]">
                        نزدیک به انقضا
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <AlertCircle className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">اطلاعات اشتراک یافت نشد</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats - Hidden for user_level_2 */}
        {user?.role !== "user_level_2" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Card className="text-center hover:shadow-md transition-shadow border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-center mb-1">
                  <MessageSquare className="w-4 h-4 text-blue-600 ml-1" />
                  <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">تیکت‌های باز</span>
                </div>
                <div className="text-xl font-bold text-blue-600 mb-1" data-testid="stat-open-tickets">
                  {ticketsLoading ? "..." : openTickets}
                </div>
                {openTickets > 0 && (
                  <Badge variant="secondary" className="text-xs bg-blue-200 text-blue-800">
                    {openTickets === 1 ? "نیاز به بررسی" : `${openTickets} فعال`}
                  </Badge>
                )}
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-md transition-shadow border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-center mb-1">
                  <Package className="w-4 h-4 text-green-600 ml-1" />
                  <span className="text-xs text-green-700 dark:text-green-300 font-medium">محصولات فعال</span>
                </div>
                <div className="text-xl font-bold text-green-600 mb-1" data-testid="stat-active-products">
                  {productsLoading ? "..." : activeProducts}
                </div>
                {activeProducts > 0 && (
                  <Badge variant="secondary" className="text-xs bg-green-200 text-green-800">
                    از {products.length} محصول
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Pending Orders Card (پرداخت شده و در انتظار تایید) - Only for user_level_1 */}
            {user?.role === "user_level_1" && (
              <Card className="text-center hover:shadow-md transition-shadow border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20">
                <CardContent className="p-3">
                  <div className="flex items-center justify-center mb-1">
                    <AlertCircle className="w-4 h-4 text-orange-600 ml-1" />
                    <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">سفارشات در انتظار تایید</span>
                  </div>
                  <div className="text-xl font-bold text-orange-600 mb-1" data-testid="stat-pending-approval-orders">
                    {unpaidPendingOrders.length}
                  </div>
                  {unpaidPendingOrders.length > 0 && (
                    <Badge variant="secondary" className="text-xs bg-orange-200 text-orange-800">
                      نیاز به بررسی
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Pending Orders List (پرداخت شده و در انتظار تایید) - Only for user_level_1 */}
        {user?.role === "user_level_1" && unpaidPendingOrders.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                سفارشات در انتظار تایید
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {unpaidPendingOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-r-4 border-orange-400 bg-orange-50/30 dark:bg-orange-900/10"
                    data-testid={`dashboard-order-${order.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Package className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              سفارش #{order.orderNumber}
                            </h4>
                            <div className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                              در انتظار تایید
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <span className="flex items-center gap-1">
                              📅 {order.createdAt && new Date(order.createdAt).toLocaleDateString('fa-IR')}
                            </span>
                            {order.buyerFirstName && order.buyerLastName && (
                              <span className="flex items-center gap-1">
                                👤 {order.buyerFirstName} {order.buyerLastName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="font-semibold text-base text-green-600 dark:text-green-400">
                          {new Intl.NumberFormat('fa-IR').format(Number(order.totalAmount))} تومان
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}