import { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { Bell, User, LogOut, ShoppingCart, X, Package, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [cartOpen, setCartOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Get notifications count for level 1 users
  const { data: notificationsData } = useQuery<{ newOrdersCount: number }>({
    queryKey: ["/api/notifications/orders"],
    enabled: !!user && user.role === "user_level_1",
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Get user's cart for level 2 users
  const { data: cartItems = [], isLoading: cartLoading } = useQuery<any[]>({
    queryKey: ["/api/cart"],
    enabled: !!user && user.role === "user_level_2",
    queryFn: async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return [];
        
        const response = await fetch("/api/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) return [];
        return response.json();
      } catch {
        return [];
      }
    },
  });

  // Remove item from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest("DELETE", `/api/cart/items/${itemId}`);
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
        description: "خطا در حذف محصول از سبد خرید",
        variant: "destructive",
      });
    },
  });

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleRemoveFromCart = (itemId: string) => {
    removeFromCartMutation.mutate(itemId);
  };


  return (
    <div className="flex h-screen bg-background" data-testid="dashboard-layout">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar (Sheet/Drawer) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="p-0 w-64">
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border p-4 flex items-center justify-between" data-testid="header-topbar">
          {/* Mobile: Menu button on right */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Desktop: Page Title */}
          <div className="hidden md:block flex-1">
            <h1 className="text-xl font-semibold text-foreground" data-testid="text-page-title">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse flex-1 justify-end">
            {/* User Info - Next to logout */}
            <div className="flex items-center space-x-3 space-x-reverse" data-testid="section-user-info">
              <Avatar data-testid="img-user-avatar">
                <AvatarImage src={user?.profilePicture || undefined} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground whitespace-nowrap" data-testid="text-user-name">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
            
            {/* Shopping Cart - Only for level 2 users */}
            {user?.role === "user_level_2" && (
              <DropdownMenu open={cartOpen} onOpenChange={setCartOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative" data-testid="button-cart">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-1 -left-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center" data-testid="text-cart-count">
                        {cartItemsCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end" data-testid="dropdown-cart">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    سبد خرید شما ({cartItemsCount} محصول)
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {cartLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">در حال بارگذاری...</p>
                    </div>
                  ) : cartItems.length === 0 ? (
                    <div className="p-4 text-center">
                      <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">سبد خرید شما خالی است</p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-64 overflow-y-auto">
                        {cartItems.map((item) => (
                          <DropdownMenuItem key={item.id} className="p-3 cursor-default" data-testid={`cart-item-${item.id}`}>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3 flex-1">
                                {item.productImage && (
                                  <img 
                                    src={item.productImage} 
                                    alt={item.productName}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate" data-testid={`cart-item-name-${item.id}`}>
                                    {item.productName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    تعداد: {item.quantity} × {parseFloat(item.unitPrice).toLocaleString()} تومان
                                  </p>
                                  <p className="text-xs font-medium text-green-600">
                                    مجموع: {parseFloat(item.totalPrice).toLocaleString()} تومان
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFromCart(item.id);
                                }}
                                disabled={removeFromCartMutation.isPending}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                                data-testid={`button-remove-cart-${item.id}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                      <DropdownMenuSeparator />
                      <div className="p-3">
                        <Button
                          className="w-full"
                          onClick={() => {
                            setCartOpen(false);
                            setLocation('/cart');
                          }}
                          data-testid="button-view-full-cart"
                        >
                          مشاهده سبد خرید کامل
                        </Button>
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar" data-testid="main-content">
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
