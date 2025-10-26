import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Calendar, MapPin, User, Phone, Edit, Printer, Truck } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Order } from "@shared/schema";

// Extended Order type with customer and address info
type OrderWithDetails = Order & {
  addressTitle?: string;
  fullAddress?: string;
  postalCode?: string;
  buyerFirstName?: string;
  buyerLastName?: string;
  buyerPhone?: string;
};

// Payment status based colors - زرد برای پرداخت نشده، سبز برای پرداخت شده، قرمز برای لغو شده
const getPaymentStatusColor = (status: string) => {
  if (status === 'awaiting_payment') {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 border-yellow-200";
  } else if (status === 'cancelled') {
    return "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-100 border-red-200";
  }
  // سایر وضعیت‌ها (پرداخت شده)
  return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-200";
};

const statusColors = {
  awaiting_payment: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  pending: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100", 
  preparing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  shipped: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
};

const statusLabels = {
  awaiting_payment: "در انتظار پرداخت",
  pending: "در انتظار تایید",
  confirmed: "تایید شده",
  preparing: "در حال آماده‌سازی",
  shipped: "ارسال شده", 
  delivered: "تحویل داده شده",
  cancelled: "لغو شده"
};

const shippingMethodLabels = {
  post_pishtaz: "پست پیشتاز",
  post_normal: "پست معمولی",
  piyk: "پیک",
  free: "ارسال رایگان"
};

const statusOptions = [
  { value: "awaiting_payment", label: "در انتظار پرداخت" },
  { value: "pending", label: "در انتظار تایید" },
  { value: "confirmed", label: "تایید شده" },
  { value: "preparing", label: "در حال آماده‌سازی" },
  { value: "shipped", label: "ارسال شده" },
  { value: "delivered", label: "تحویل داده شده" },
  { value: "cancelled", label: "لغو شده" }
];

export default function ReceivedOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  
  // Fetch received orders (orders where current user is seller)
  const { data: orders = [], isLoading } = useQuery<OrderWithDetails[]>({
    queryKey: ['/api/orders/seller']
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest('PUT', `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate cache for both seller orders and customer orders
      queryClient.invalidateQueries({ queryKey: ['/api/orders/seller'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus("");
      toast({
        title: "موفق",
        description: "وضعیت سفارش با موفقیت تغییر کرد"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: "خطا در تغییر وضعیت سفارش",
        variant: "destructive"
      });
    }
  });

  // پرینت مستقیم سفارش
  const printOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiRequest('GET', `/api/orders/${orderId}`);
      return response.json();
    },
    onSuccess: (data) => {
      // Create print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      
      const printContent = generatePrintHTML(data);
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: "خطا در پرینت سفارش",
        variant: "destructive"
      });
    }
  });

  const generatePrintHTML = (orderData: any) => {
    const order = orderData.order || orderData;
    const items = orderData.items || [];
    
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <title>فیش سفارش #${order.orderNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700&display=swap');
          
          @page {
            size: A5 portrait;
            margin: 5mm 8mm 8mm 8mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: #000;
            background: white;
          }
          
          .print-container {
            width: 100%;
            max-width: 148mm;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          
          .header h1 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .order-info {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
          }
          
          .section {
            margin-bottom: 15px;
          }
          
          .section h3 {
            font-size: 16px;
            font-weight: 700;
            border-bottom: 2px solid #ccc;
            padding-bottom: 5px;
            margin-bottom: 8px;
          }
          
          .info-box {
            background: #f8f9fa;
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 4px;
          }
          
          .info-row {
            margin-bottom: 5px;
          }
          
          .info-label {
            font-weight: 700;
            display: inline-block;
            min-width: 80px;
            margin-left: 10px;
          }
          
          .item-box {
            background: #f8f9fa;
            border: 1px solid #ccc;
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 8px;
          }
          
          .item-header {
            font-weight: 700;
            margin-bottom: 5px;
          }
          
          .footer {
            margin-top: 20px;
            border-top: 2px solid #000;
            padding-top: 10px;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <!-- Header -->
          <div class="header">
            <h1>فیش سفارش</h1>
            <div class="order-info">
              <div><strong>شماره سفارش:</strong> #${order.orderNumber}</div>
              <div><strong>تاریخ سفارش:</strong> ${order.createdAt ? 
                new Date(order.createdAt).toLocaleDateString('fa-IR', {
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric'
                }) : 'نامشخص'}</div>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="section">
            <h3>مشخصات خریدار</h3>
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">نام و نام خانوادگی:</span>
                <span>${order.buyerFirstName && order.buyerLastName 
                  ? `${order.buyerFirstName} ${order.buyerLastName}` 
                  : 'مشتری گرامی'}</span>
              </div>
              ${order.buyerPhone ? `
              <div class="info-row">
                <span class="info-label">شماره تماس:</span>
                <span>${order.buyerPhone}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Address -->
          <div class="section">
            <h3>آدرس تحویل</h3>
            <div class="info-box">
              ${order.addressTitle ? `
              <div class="info-row" style="font-weight: 700; font-size: 15px;">
                📍 ${order.addressTitle}
              </div>
              ` : ''}
              <div class="info-row" style="margin-top: 8px;">
                ${order.fullAddress || 'آدرس مشخص نشده'}
              </div>
              ${order.postalCode ? `
              <div class="info-row" style="margin-top: 5px;">
                <span class="info-label">کد پستی:</span>
                <span>${order.postalCode}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Order Items -->
          <div class="section">
            <h3>لیست کالاها</h3>
            ${items.map((item: any) => `
              <div class="item-box">
                <div class="item-header">🛒 ${item.productName || 'محصول'}</div>
                ${item.productDescription ? `
                  <div style="font-size: 12px; color: #666; margin-bottom: 5px;">
                    ${item.productDescription}
                  </div>
                ` : ''}
                <div style="text-align: left; font-weight: 700;">
                  تعداد: ${item.quantity}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Footer -->
          <div class="footer">
            <div>وضعیت سفارش: <strong>${statusLabels[order.status as keyof typeof statusLabels]}</strong></div>
            <div>مهر و امضای فروشنده: ________________</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrintOrder = (orderId: string) => {
    printOrderMutation.mutate(orderId);
  };

  const handleStatusUpdate = () => {
    if (!selectedOrder || !newStatus) return;
    updateStatusMutation.mutate({ orderId: selectedOrder.id, status: newStatus });
  };

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat('fa-IR').format(Number(price)) + ' تومان';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100" data-testid="heading-received-orders">
            سفارشات دریافتی
          </h1>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            مجموع: {orders.length} سفارش
          </div>
        </div>

        {/* Orders List - Compact List View */}
        <div className="space-y-3">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  هنوز سفارشی دریافت نکرده‌اید
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  سفارشات جدید اینجا نمایش داده خواهند شد
                </p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className={`overflow-hidden hover:shadow-md transition-shadow border-2 ${getPaymentStatusColor(order.status)}`} data-testid={`card-order-${order.id}`}>
                <CardContent className="p-3 md:p-4">
                  {/* Order Header - Responsive Layout */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base truncate">
                          سفارش #{order.orderNumber}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {order.createdAt && new Date(order.createdAt).toLocaleDateString('fa-IR')}
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                      <Badge 
                        className={`text-xs md:text-sm w-fit ${statusColors[order.status as keyof typeof statusColors]}`}
                        data-testid={`status-${order.id}`}
                      >
                        {statusLabels[order.status as keyof typeof statusLabels]}
                      </Badge>
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        {/* دکمه پرینت برای همه وضعیت‌ها به جز در انتظار پرداخت */}
                        {order.status !== 'awaiting_payment' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePrintOrder(order.id)}
                            data-testid={`button-print-${order.id}`}
                            className="text-xs md:text-sm h-8 md:h-9 flex-1 md:flex-initial"
                          >
                            <Printer className="w-4 h-4 md:mr-1" />
                            <span className="hidden md:inline">پرینت سفارش</span>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            setDialogOpen(true);
                          }}
                          data-testid={`button-edit-status-${order.id}`}
                          className="text-xs md:text-sm h-8 md:h-9 flex-1 md:flex-initial"
                        >
                          <Edit className="w-4 h-4 md:mr-1" />
                          <span className="hidden md:inline">تغییر وضعیت</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Order Details - Horizontal Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Customer Info */}
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0">
                        <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                          مشتری
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <div data-testid={`customer-${order.id}`} className="text-sm">
                            {order.buyerFirstName && order.buyerLastName 
                              ? `${order.buyerFirstName} ${order.buyerLastName}`
                              : 'مشتری گرامی'
                            }
                          </div>
                          {order.buyerPhone && (
                            <div className="flex items-center gap-1 text-sm" data-testid={`customer-phone-${order.id}`}>
                              <Phone className="w-3 h-3" />
                              {order.buyerPhone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0">
                        <div className="w-7 h-7 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                          آدرس تحویل
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          {order.addressTitle && (
                            <div className="font-medium text-blue-600 dark:text-blue-400 text-sm" data-testid={`address-title-${order.id}`}>
                              {order.addressTitle}
                            </div>
                          )}
                          <div data-testid={`address-${order.id}`} className="text-sm">
                            {order.fullAddress || 'آدرس تعیین نشده'}
                          </div>
                          {order.postalCode && (
                            <div className="text-xs text-gray-500 dark:text-gray-400" data-testid={`postal-code-${order.id}`}>
                              کد پستی: {order.postalCode}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Shipping Method */}
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0">
                        <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                          <Truck className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                          نوع ارسال
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300" data-testid={`shipping-method-${order.id}`}>
                          {order.shippingMethod 
                            ? shippingMethodLabels[order.shippingMethod as keyof typeof shippingMethodLabels] || 'نامشخص'
                            : 'تعیین نشده'
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm">
                        توضیحات مشتری
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded" data-testid={`notes-${order.id}`}>
                        {order.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Status Update Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>تغییر وضعیت سفارش</DialogTitle>
              <DialogDescription>
                وضعیت جدید سفارش #{selectedOrder?.orderNumber} را انتخاب کنید
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">وضعیت فعلی:</label>
                <div className="mt-1">
                  <Badge className={statusColors[selectedOrder?.status as keyof typeof statusColors]}>
                    {statusLabels[selectedOrder?.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">وضعیت جدید:</label>
                <Select value={newStatus} onValueChange={setNewStatus} defaultValue={selectedOrder?.status}>
                  <SelectTrigger className="mt-1" data-testid="select-new-status">
                    <SelectValue placeholder="انتخاب وضعیت جدید" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || newStatus === selectedOrder?.status || updateStatusMutation.isPending}
                  data-testid="button-update-status"
                >
                  {updateStatusMutation.isPending ? "در حال تغییر..." : "تغییر وضعیت"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setDialogOpen(false);
                    setSelectedOrder(null);
                    setNewStatus("");
                  }}
                  data-testid="button-cancel-status"
                >
                  لغو
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}