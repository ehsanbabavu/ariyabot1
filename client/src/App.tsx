import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/dashboard-layout";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import UserDashboard from "@/pages/user/dashboard";
import UserManagement from "@/pages/admin/user-management";
import TicketManagement from "@/pages/admin/ticket-management";
import Subscriptions from "@/pages/admin/subscriptions";
import WhatsappSettings from "@/pages/admin/whatsapp-settings";
import AITokenSettings from "@/pages/admin/ai-token";
import Categories from "@/pages/admin/categories";
import Profile from "@/pages/user/profile";
import SendTicket from "@/pages/user/send-ticket";
import MyTickets from "@/pages/user/my-tickets";
import SendMessage from "@/pages/user/send-message";
import AddProduct from "@/pages/user/add-product";
import ProductList from "@/pages/user/product-list";
import Reports from "@/pages/user/reports";
import SubUsers from "@/pages/user/sub-users";
import WelcomeMessage from "@/pages/admin/welcome-message";
import Cart from "@/pages/cart";
import Addresses from "@/pages/user/addresses";
import Orders from "@/pages/user/orders";
import ReceivedOrders from "@/pages/user/received-orders";
import Financial from "@/pages/user/financial";
import SuccessfulTransactions from "@/pages/user/successful-transactions";
import ChatWithSeller from "@/pages/user/chat-with-seller";
import CustomerChats from "@/pages/level1/customer-chats";
import FaqsPage from "@/pages/faqs";
import AddFaqPage from "@/pages/user/add-faq";
import ManageFaqsPage from "@/pages/user/manage-faqs";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">در حال بارگذاری...</div>
    </div>;
  }
  
  if (!user) {
    return <Login />;
  }
  
  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">در حال بارگذاری...</div>
    </div>;
  }
  
  if (!user) {
    return <Login />;
  }
  
  if (user.role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-destructive">دسترسی محدود - این صفحه مخصوص مدیران است</div>
    </div>;
  }
  
  return <Component />;
}

function AdminOrLevel1Route({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">در حال بارگذاری...</div>
    </div>;
  }
  
  if (!user) {
    return <Login />;
  }
  
  if (user.role !== "admin" && user.role !== "user_level_1") {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-destructive">دسترسی محدود - این صفحه مخصوص مدیران و کاربران سطح ۱ است</div>
    </div>;
  }
  
  return <Component />;
}

function Level1Route({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">در حال بارگذاری...</div>
    </div>;
  }
  
  if (!user) {
    return <Login />;
  }
  
  if (user.role !== "user_level_1") {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-destructive">دسترسی محدود - این صفحه مخصوص کاربران سطح ۱ است</div>
    </div>;
  }
  
  return <Component />;
}

function Level2Route({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">در حال بارگذاری...</div>
    </div>;
  }
  
  if (!user) {
    return <Login />;
  }
  
  if (user.role !== "user_level_2") {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-destructive">دسترسی محدود - این صفحه مخصوص کاربران سطح ۲ است</div>
    </div>;
  }
  
  return <Component />;
}

// Helper function to wrap components with DashboardLayout
function WithLayout(Component: React.ComponentType, title: string) {
  return () => (
    <DashboardLayout title={title}>
      <Component />
    </DashboardLayout>
  );
}

function Router() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={() => user ? 
        user.role === "admin" 
          ? <ProtectedRoute component={Dashboard} /> 
          : <ProtectedRoute component={UserDashboard} />
        : <Login />} />
      <Route path="/users" component={() => <AdminRoute component={UserManagement} />} />
      <Route path="/tickets" component={() => <AdminRoute component={TicketManagement} />} />
      <Route path="/subscriptions" component={() => <AdminRoute component={Subscriptions} />} />
      <Route path="/categories" component={() => <AdminOrLevel1Route component={Categories} />} />
      <Route path="/ai-token" component={() => <AdminRoute component={AITokenSettings} />} />
      <Route path="/admin/welcome-message" component={() => <AdminOrLevel1Route component={WelcomeMessage} />} />
      <Route path="/whatsapp-settings" component={() => <AdminOrLevel1Route component={WhatsappSettings} />} />
      <Route path="/send-message" component={() => <AdminOrLevel1Route component={SendMessage} />} />
      <Route path="/reports" component={() => <AdminOrLevel1Route component={Reports} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/send-ticket" component={() => <ProtectedRoute component={SendTicket} />} />
      <Route path="/my-tickets" component={() => <ProtectedRoute component={MyTickets} />} />
      <Route path="/add-product" component={() => <ProtectedRoute component={AddProduct} />} />
      <Route path="/products" component={() => <ProtectedRoute component={ProductList} />} />
      <Route path="/sub-users" component={() => <Level1Route component={SubUsers} />} />
      <Route path="/cart" component={() => <Level2Route component={Cart} />} />
      <Route path="/addresses" component={() => <Level2Route component={Addresses} />} />
      <Route path="/orders" component={() => <Level2Route component={WithLayout(Orders, "سفارشات من")} />} />
      <Route path="/received-orders" component={() => <AdminOrLevel1Route component={WithLayout(ReceivedOrders, "سفارشات دریافتی")} />} />
      <Route path="/financial" component={() => <Level2Route component={WithLayout(Financial, "امور مالی")} />} />
      <Route path="/transactions" component={() => <AdminOrLevel1Route component={WithLayout(SuccessfulTransactions, "مدیریت تراکنش‌ها")} />} />
      <Route path="/customer-chats" component={() => <Level1Route component={WithLayout(CustomerChats, "مدیریت چت با مشتریان")} />} />
      <Route path="/chat-with-seller" component={() => <Level2Route component={ChatWithSeller} />} />
      <Route path="/faqs" component={() => <ProtectedRoute component={FaqsPage} />} />
      <Route path="/manage-faqs" component={() => <AdminOrLevel1Route component={ManageFaqsPage} />} />
      <Route path="/add-faq" component={() => <AdminOrLevel1Route component={AddFaqPage} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
