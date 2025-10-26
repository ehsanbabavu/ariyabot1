import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  Filter,
  Calendar,
  User,
  Hash,
  TrendingUp,
  TrendingDown,
  Search,
  Banknote
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Transaction } from "@shared/schema";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
};

const statusLabels = {
  pending: "در انتظار بررسی",
  completed: "تکمیل شده",
  failed: "رد شده"
};

const transactionColors = {
  deposit: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  withdraw: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  order_payment: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  commission: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
};

const transactionLabels = {
  deposit: "درخواست واریز",
  withdraw: "درخواست برداشت",
  order_payment: "پرداخت سفارش",
  commission: "کمیسیون"
};

export default function SuccessfulTransactionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Fetch all transactions for management
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions']
  });

  // Fetch deposits summary for level 1 users
  const { data: depositsSummary } = useQuery<{ totalAmount: number; parentUserId: string }>({
    queryKey: ['/api/deposits/summary'],
    enabled: true // Always enabled for level 1 users viewing this page
  });

  // Update transaction status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ transactionId, status }: { transactionId: string; status: string }) => {
      const response = await apiRequest('PUT', `/api/transactions/${transactionId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setDialogOpen(false);
      setSelectedTransaction(null);
      setNewStatus("");
      toast({
        title: "موفق",
        description: "وضعیت تراکنش به‌روزرسانی شد"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: "خطا در به‌روزرسانی وضعیت",
        variant: "destructive"
      });
    }
  });

  // Filter transactions - حذف تراکنش‌های order_payment از لیست
  const filteredTransactions = transactions.filter(transaction => {
    // حذف تراکنش‌های پرداخت سفارش از نمایش
    if (transaction.type === 'order_payment') {
      return false;
    }
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesSearch = !searchTerm || 
      transaction.transactionDate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.accountSource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.referenceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  // Statistics - فقط برای تراکنش‌های واریزی (deposit)
  const depositTransactions = transactions.filter(t => t.type === 'deposit');
  const stats = {
    total: depositTransactions.length,
    pending: depositTransactions.filter(t => t.status === 'pending').length,
    completed: depositTransactions.filter(t => t.status === 'completed').length,
    failed: depositTransactions.filter(t => t.status === 'failed').length,
    totalAmount: depositTransactions
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => acc + Number(t.amount), 0)
  };

  const handleStatusChange = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setNewStatus(transaction.status);
    setDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    if (selectedTransaction && newStatus && newStatus !== selectedTransaction.status) {
      updateStatusMutation.mutate({
        transactionId: selectedTransaction.id,
        status: newStatus
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="grid gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Compact Stats - First Row: Total Amount and Deposits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="bg-white dark:bg-gray-800 border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
                <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300">مجموع مبلغ کارت به کارت کاربران</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100" data-testid="stat-amount">
                  {formatPrice(stats.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-purple-100 dark:bg-purple-900 rounded">
                <Banknote className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300">واریزی‌های شما</p>
                <p className="text-sm font-bold text-purple-600 dark:text-purple-400" data-testid="stat-deposits">
                  {formatPrice(depositsSummary?.totalAmount || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Stats - Second Row: Other Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300">کل تراکنش‌ها</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100" data-testid="stat-total">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-yellow-100 dark:bg-yellow-900 rounded">
                <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300">در انتظار</p>
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400" data-testid="stat-pending">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300">تکمیل شده</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400" data-testid="stat-completed">
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-red-100 dark:bg-red-900 rounded">
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300">رد شده</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400" data-testid="stat-failed">
                  {stats.failed}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Filters */}
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Filter className="w-4 h-4" />
              فیلتر:
            </div>
            
            <div className="relative min-w-48">
              <Search className="absolute left-3 top-2.5 w-3 h-3 text-gray-400" />
              <Input
                placeholder="جستجو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
                className="pl-8 h-8 text-xs"
              />
            </div>

            <div className="hidden md:block">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28 h-8 text-xs" data-testid="select-status-filter">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="pending">در انتظار</SelectItem>
                  <SelectItem value="completed">تکمیل شده</SelectItem>
                  <SelectItem value="failed">رد شده</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="hidden md:block">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32 h-8 text-xs" data-testid="select-type-filter">
                  <SelectValue placeholder="نوع تراکنش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="deposit">واریز</SelectItem>
                  <SelectItem value="withdraw">برداشت</SelectItem>
                  <SelectItem value="order_payment">پرداخت سفارش</SelectItem>
                  <SelectItem value="commission">کمیسیون</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(statusFilter !== "all" || typeFilter !== "all" || searchTerm) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setSearchTerm("");
                }}
                data-testid="button-clear-filters"
                className="text-xs h-8 px-2"
              >
                ✕ پاک کردن
              </Button>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-800 border rounded-lg overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <DollarSign className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                تراکنشی یافت نشد
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                با فیلترهای انتخاب شده تراکنشی موجود نیست
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نوع تراکنش</TableHead>
                  <TableHead className="text-right">مبلغ</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">تاریخ انجام</TableHead>
                  <TableHead className="text-right">حساب</TableHead>
                  <TableHead className="text-right">کد پیگیری</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} data-testid={`transaction-${transaction.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-full ${transactionColors[transaction.type as keyof typeof transactionColors]}`}>
                          {transaction.type === 'deposit' && <TrendingUp className="w-3 h-3" />}
                          {transaction.type === 'withdraw' && <TrendingDown className="w-3 h-3" />}
                          {transaction.type === 'order_payment' && <DollarSign className="w-3 h-3" />}
                          {transaction.type === 'commission' && <DollarSign className="w-3 h-3" />}
                        </div>
                        <span className="text-sm font-medium">
                          {transactionLabels[transaction.type as keyof typeof transactionLabels]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold" data-testid={`amount-${transaction.id}`}>
                        {formatPrice(Number(transaction.amount))}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[transaction.status as keyof typeof statusColors]} text-xs`}>
                        {statusLabels[transaction.status as keyof typeof statusLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {transaction.transactionDate && (
                          <div>{transaction.transactionDate}</div>
                        )}
                        {transaction.transactionTime && (
                          <div className="text-gray-500 text-xs">{transaction.transactionTime}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {transaction.accountSource || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">
                        {transaction.referenceId || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 h-auto"
                        onClick={() => handleStatusChange(transaction)}
                        data-testid={`button-edit-${transaction.id}`}
                      >
                        تغییر
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Status Update Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>تغییر وضعیت تراکنش</DialogTitle>
              <DialogDescription>
                وضعیت جدید تراکنش را انتخاب کنید
              </DialogDescription>
            </DialogHeader>

            {selectedTransaction && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">
                      {transactionLabels[selectedTransaction.type as keyof typeof transactionLabels]}
                    </span>
                    <Badge className={transactionColors[selectedTransaction.type as keyof typeof transactionColors]}>
                      {formatPrice(Number(selectedTransaction.amount))}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {selectedTransaction.transactionDate && (
                      <p>تاریخ انجام: {selectedTransaction.transactionDate}</p>
                    )}
                    {selectedTransaction.transactionTime && (
                      <p>ساعت انجام: {selectedTransaction.transactionTime}</p>
                    )}
                    {selectedTransaction.accountSource && (
                      <p>از حساب: {selectedTransaction.accountSource}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>وضعیت جدید</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger data-testid="select-new-status">
                      <SelectValue placeholder="انتخاب وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">در انتظار بررسی</SelectItem>
                      <SelectItem value="completed">تکمیل شده</SelectItem>
                      <SelectItem value="failed">رد شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleStatusUpdate}
                    disabled={updateStatusMutation.isPending || !newStatus || newStatus === selectedTransaction.status}
                    data-testid="button-confirm-status"
                  >
                    {updateStatusMutation.isPending ? "در حال به‌روزرسانی..." : "تایید"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    data-testid="button-cancel-status"
                  >
                    لغو
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}