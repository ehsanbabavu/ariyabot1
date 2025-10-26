import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PersianDatePicker } from "@/components/persian-date-picker";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  Plus,
  Minus
} from "lucide-react";
import moment from "moment-jalaali";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertTransactionSchema, type Transaction } from "@shared/schema";
import { z } from "zod";

const transactionColors = {
  deposit: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  withdraw: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  order_payment: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  commission: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
};

const transactionLabels = {
  deposit: "واریز",
  withdraw: "برداشت",
  order_payment: "پرداخت سفارش",
  commission: "کمیسیون"
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
};

const statusLabels = {
  pending: "در انتظار",
  completed: "تکمیل شده",
  failed: "ناموفق"
};

const depositWithdrawSchema = z.object({
  type: z.literal("deposit"),
  amount: z.coerce.number().positive("مبلغ باید مثبت باشد"),
  status: z.literal("pending"),
  transactionDate: z.string().min(1, "تاریخ انجام تراکنش الزامی است"),
  transactionTime: z.string().min(1, "ساعت انجام تراکنش الزامی است"),
  accountSource: z.string().min(1, "از حساب الزامی است"),
  paymentMethod: z.string().default("card"),
  referenceId: z.string().optional(),
  userId: z.string().optional(), // Server sets this
  orderId: z.string().optional(),
});

export default function FinancialPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions']
  });

  const { user } = useAuth();
  const currentUserId = user?.id;

  // Calculate balance and stats - فقط برای کاربر اصلی، نه فرزندان
  const userOwnTransactions = transactions.filter(t => t.userId === currentUserId);

  // Pagination calculations
  const totalPages = Math.ceil(userOwnTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = userOwnTransactions.slice(startIndex, endIndex);
  
  // محاسبه کل واریزی‌ها
  const totalDeposits = userOwnTransactions
    .filter(t => t.type === 'deposit' && t.status === 'completed')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  // محاسبه کل برداشت‌ها (استفاده از مقدار مطلق چون مبالغ ممکن است منفی ذخیره شده باشند)
  const totalWithdraws = userOwnTransactions
    .filter(t => (t.type === 'withdraw' || t.type === 'order_payment') && t.status === 'completed')
    .reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0);

  // موجودی کل = کل واریزی‌ها - کل برداشت‌ها
  const balance = totalDeposits - totalWithdraws;

  // Request form
  const form = useForm({
    resolver: zodResolver(depositWithdrawSchema),
    defaultValues: {
      type: "deposit" as const,
      amount: 0,
      status: "pending" as const,
      transactionDate: moment().format('YYYY-MM-DD'), // تاریخ امروز
      transactionTime: moment().format('HH:mm'), // زمان فعلی
      accountSource: "",
      paymentMethod: "card",
      referenceId: ""
    }
  });

  // Create transaction request mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/transactions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "موفق",
        description: "درخواست واریز ثبت شد"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: "خطا در ثبت درخواست",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: any) => {
    console.log('✅ Form submitted successfully with data:', data);
    console.log('✅ Form errors:', form.formState.errors);
    
    // Force amount to be string for API
    const payload = {
      ...data,
      amount: String(data.amount)
    };
    
    console.log('✅ Final payload being sent to server:', payload);
    createTransactionMutation.mutate(payload);
  };

  const onError = (errors: any) => {
    console.log('❌ Form validation failed:', errors);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex justify-end items-center">
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (open) {
              // Reset form with current date/time when dialog opens
              form.reset({
                type: "deposit" as const,
                amount: 0,
                status: "pending" as const,
                transactionDate: moment().format('YYYY-MM-DD'),
                transactionTime: moment().format('HH:mm'),
                accountSource: "",
                paymentMethod: "card",
                referenceId: ""
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto h-11" data-testid="button-new-transaction">
                <Plus className="w-4 h-4" />
                درخواست جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  درخواست واریز
                </DialogTitle>
                <DialogDescription className="text-sm">
                  اطلاعات مورد نیاز را تکمیل کنید
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مبلغ (تومان)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1000"
                            step="1000"
                            {...field}
                            placeholder="۰"
                            data-testid="input-amount"
                            className="text-right"
                            dir="rtl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transactionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاریخ انجام تراکنش</FormLabel>
                        <FormControl>
                          <PersianDatePicker 
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="انتخاب تاریخ"
                            data-testid="input-transaction-date"
                            className="text-right"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transactionTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ساعت انجام تراکنش</FormLabel>
                        <FormControl>
                          <Input 
                            type="time"
                            {...field}
                            data-testid="input-transaction-time"
                            className="text-right"
                            dir="rtl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>از حساب</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="نام بانک یا منبع حساب..."
                            {...field}
                            data-testid="input-account-source"
                            className="text-right"
                            dir="rtl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name="referenceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>شماره پیگیری (اختیاری)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            value={field.value ?? ""}
                            placeholder="شماره پیگیری تراکنش"
                            data-testid="input-reference-id"
                            className="text-right"
                            dir="rtl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={createTransactionMutation.isPending}
                      data-testid="button-submit-transaction"
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {createTransactionMutation.isPending ? "در حال ثبت..." : "ثبت درخواست"}
                    </Button>

                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                      data-testid="button-cancel-transaction"
                    >
                      لغو
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Financial Stats - All in one row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                <div className="w-full">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    موجودی کل
                  </p>
                  <div className="flex items-center justify-between sm:block">
                    <p className="text-sm sm:text-xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-balance">
                      {formatPrice(balance)}
                    </p>
                    <div className="p-1.5 sm:hidden bg-blue-100 dark:bg-blue-900 rounded-full">
                      <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                <div className="w-full">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    کل واریزی‌ها
                  </p>
                  <div className="flex items-center justify-between sm:block">
                    <p className="text-sm sm:text-xl font-bold text-green-600 dark:text-green-400" data-testid="text-deposits">
                      {formatPrice(totalDeposits)}
                    </p>
                    <div className="p-1.5 sm:hidden bg-green-100 dark:bg-green-900 rounded-full">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                <div className="w-full">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    کل برداشت‌ها
                  </p>
                  <div className="flex items-center justify-between sm:block">
                    <p className="text-sm sm:text-xl font-bold text-red-600 dark:text-red-400" data-testid="text-withdrawals">
                      {formatPrice(totalWithdraws)}
                    </p>
                    <div className="p-1.5 sm:hidden bg-red-100 dark:bg-red-900 rounded-full">
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block p-2 bg-red-100 dark:bg-red-900 rounded-full">
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                <div className="w-full">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    تعداد تراکنش‌ها
                  </p>
                  <div className="flex items-center justify-between sm:block">
                    <p className="text-sm sm:text-xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-transaction-count">
                      {userOwnTransactions.length}
                    </p>
                    <div className="p-1.5 sm:hidden bg-gray-100 dark:bg-gray-800 rounded-full">
                      <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions History */}
        <Card>
          <CardContent className="p-3 sm:p-6">
            {userOwnTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Wallet className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  هنوز تراکنشی انجام نداده‌اید
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                  اولین درخواست مالی خود را ثبت کنید
                </p>
                <Button onClick={() => setDialogOpen(true)} data-testid="button-first-transaction" className="w-full sm:w-auto h-11">
                  <Plus className="w-4 h-4 mr-2" />
                  درخواست جدید
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right text-xs sm:text-sm">نوع</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">مبلغ</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">وضعیت</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">تاریخ انجام</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">از حساب</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">تاریخ ثبت</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">شماره پیگیری</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTransactions.map((transaction) => (
                        <TableRow key={transaction.id} data-testid={`transaction-${transaction.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className={`p-1 sm:p-2 rounded-full ${transactionColors[transaction.type as keyof typeof transactionColors]}`}>
                                {transaction.type === 'deposit' && <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />}
                                {transaction.type === 'withdraw' && <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                                {transaction.type === 'order_payment' && <Minus className="w-3 h-3 sm:w-4 sm:h-4" />}
                                {transaction.type === 'commission' && <Plus className="w-3 h-3 sm:w-4 sm:h-4" />}
                              </div>
                              <span className="font-medium text-xs sm:text-sm whitespace-nowrap">
                                {transactionLabels[transaction.type as keyof typeof transactionLabels]}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span 
                              className={`font-bold text-xs sm:text-sm ${
                                transaction.type === 'deposit' || transaction.type === 'commission' 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                              data-testid={`amount-${transaction.id}`}
                            >
                              {transaction.type === 'deposit' || transaction.type === 'commission' ? '+' : '-'}
                              {formatPrice(Number(transaction.amount))}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusColors[transaction.status as keyof typeof statusColors]} text-xs`}>
                              {statusLabels[transaction.status as keyof typeof statusLabels]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs sm:text-sm">
                              {transaction.transactionDate && (
                                <div className="whitespace-nowrap">{transaction.transactionDate}</div>
                              )}
                              {transaction.transactionTime && (
                                <div className="text-gray-500 whitespace-nowrap">{transaction.transactionTime}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs sm:text-sm">{transaction.accountSource || '—'}</span>
                          </TableCell>
                          <TableCell>
                            {transaction.createdAt && (
                              <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                                {moment(transaction.createdAt).format('jYYYY/jMM/jDD')}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs sm:text-sm">{transaction.referenceId || '—'}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {paginatedTransactions.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="bg-card rounded-lg border border-border p-4 space-y-3"
                      data-testid={`transaction-${transaction.id}`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-full ${transactionColors[transaction.type as keyof typeof transactionColors]}`}>
                            {transaction.type === 'deposit' && <TrendingUp className="w-4 h-4" />}
                            {transaction.type === 'withdraw' && <TrendingDown className="w-4 h-4" />}
                            {transaction.type === 'order_payment' && <Minus className="w-4 h-4" />}
                            {transaction.type === 'commission' && <Plus className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {transactionLabels[transaction.type as keyof typeof transactionLabels]}
                            </p>
                            <Badge className={`${statusColors[transaction.status as keyof typeof statusColors]} text-xs mt-1`}>
                              {statusLabels[transaction.status as keyof typeof statusLabels]}
                            </Badge>
                          </div>
                        </div>
                        <span 
                          className={`font-bold text-base ${
                            transaction.type === 'deposit' || transaction.type === 'commission' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}
                          data-testid={`amount-${transaction.id}`}
                        >
                          {transaction.type === 'deposit' || transaction.type === 'commission' ? '+' : '-'}
                          {formatPrice(Number(transaction.amount))}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">تاریخ انجام:</span>
                          <div className="text-left">
                            {transaction.transactionDate && (
                              <div>{transaction.transactionDate}</div>
                            )}
                            {transaction.transactionTime && (
                              <div className="text-xs text-muted-foreground">{transaction.transactionTime}</div>
                            )}
                          </div>
                        </div>

                        {transaction.accountSource && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">از حساب:</span>
                            <span>{transaction.accountSource}</span>
                          </div>
                        )}

                        {transaction.createdAt && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">تاریخ ثبت:</span>
                            <span className="text-muted-foreground text-xs">
                              {moment(transaction.createdAt).format('jYYYY/jMM/jDD')}
                            </span>
                          </div>
                        )}

                        {transaction.referenceId && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">شماره پیگیری:</span>
                            <span className="font-mono text-xs">{transaction.referenceId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-3 sm:px-0">
                    <div className="text-xs sm:text-sm text-gray-500">
                      نمایش {startIndex + 1} تا {Math.min(endIndex, userOwnTransactions.length)} از {userOwnTransactions.length} تراکنش
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        data-testid="button-prev-page"
                        className="h-9 text-xs sm:text-sm"
                      >
                        قبلی
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            data-testid={`button-page-${page}`}
                            className="min-w-[2rem] h-9 text-xs sm:text-sm"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        data-testid="button-next-page"
                        className="h-9 text-xs sm:text-sm"
                      >
                        بعدی
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}