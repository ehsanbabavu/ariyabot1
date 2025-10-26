import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PersianDatePicker } from "@/components/persian-date-picker";
import { createAuthenticatedRequest } from "@/lib/auth";
import moment from "moment-jalaali";

interface LoginLog {
  id: string;
  userId: string;
  username: string;
  ipAddress: string | null;
  userAgent: string | null;
  loginAt: string;
  role: string | null;
}

interface LoginLogsResponse {
  logs: LoginLog[];
  total: number;
  totalPages: number;
}

export default function LoginLogs() {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery<LoginLogsResponse>({
    queryKey: ["/api/admin/login-logs", page, limit],
    queryFn: async () => {
      const response = await createAuthenticatedRequest(
        `/api/admin/login-logs?page=${page}&limit=${limit}`
      );
      if (!response.ok) throw new Error("خطا در دریافت لاگ‌های ورود");
      return response.json();
    },
  });

  const filteredLogs = data?.logs?.filter(log => {
    const matchesSearch = log.username.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress?.includes(search) ||
      log.userAgent?.toLowerCase().includes(search.toLowerCase());
    
    if (!selectedDate) return matchesSearch;
    
    const logDate = moment(log.loginAt).format('jYYYY/jMM/jDD');
    const selectedDateFormatted = moment(selectedDate).format('jYYYY/jMM/jDD');
    return matchesSearch && logDate === selectedDateFormatted;
  }) || [];

  const formatDateTime = (dateString: string) => {
    const date = moment(dateString);
    return {
      date: date.format('jYYYY/jMM/jDD'),
      time: date.format('HH:mm:ss')
    };
  };

  const getBrowserInfo = (userAgent: string | null) => {
    if (!userAgent) return "نامشخص";
    
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Opera")) return "Opera";
    
    return "مرورگر دیگر";
  };

  const getRoleName = (role: string | null) => {
    if (!role) return "نامشخص";
    
    switch (role) {
      case "admin":
        return "مدیر";
      case "user_level_1":
        return "کاربر سطح 1";
      case "user_level_2":
        return "کاربر سطح 2";
      default:
        return role;
    }
  };

  const totalPages = data?.totalPages || 1;
  const totalRecords = data?.total || 0;

  return (
    <DashboardLayout title="لاگ‌های ورود کاربران">
      <div className="space-y-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="جستجو بر اساس نام کاربری، IP یا مرورگر..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
          <div className="w-64">
            <PersianDatePicker
              value={selectedDate}
              onChange={(value) => {
                setSelectedDate(value);
                setPage(1);
              }}
              placeholder="انتخاب تاریخ..."
              className="text-right"
            />
          </div>
          {selectedDate && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedDate("");
                setPage(1);
              }}
            >
              پاک کردن فیلتر
            </Button>
          )}
        </div>

        {selectedDate && (
          <div className="text-sm text-muted-foreground">
            نمایش لاگ‌های تاریخ: {moment(selectedDate).format('jYYYY/jMM/jDD')}
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">نام کاربری</TableHead>
                <TableHead className="text-right">آدرس IP</TableHead>
                <TableHead className="text-right">نقش کاربر</TableHead>
                <TableHead className="text-right">مرورگر</TableHead>
                <TableHead className="text-right">تاریخ</TableHead>
                <TableHead className="text-right">ساعت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    در حال بارگذاری...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    هیچ لاگ ورودی یافت نشد
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const { date, time } = formatDateTime(log.loginAt);
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.username}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ipAddress || "نامشخص"}
                      </TableCell>
                      <TableCell className="font-medium">{getRoleName(log.role)}</TableCell>
                      <TableCell>{getBrowserInfo(log.userAgent)}</TableCell>
                      <TableCell className="font-medium">{date}</TableCell>
                      <TableCell className="font-mono">{time}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {data && totalPages > 1 && !selectedDate && !search && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              صفحه {page} از {totalPages} ({totalRecords} رکورد)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronRight className="h-4 w-4 ml-1" />
                قبلی
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                بعدی
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
