import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { createAuthenticatedRequest } from "@/lib/auth";
import moment from "moment-jalaali";

interface LoginLog {
  id: string;
  userId: string;
  username: string;
  ipAddress: string | null;
  userAgent: string | null;
  loginAt: string;
}

interface LoginLogsResponse {
  logs: LoginLog[];
  total: number;
  totalPages: number;
}

export default function LoginLogs() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 50;

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

  const filteredLogs = data?.logs?.filter(log =>
    log.username.toLowerCase().includes(search.toLowerCase()) ||
    log.ipAddress?.includes(search) ||
    log.userAgent?.toLowerCase().includes(search.toLowerCase())
  ) || [];

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">لاگ‌های ورود کاربران</h1>
            <p className="text-muted-foreground">مشاهده تاریخچه ورود کاربران به سیستم</p>
          </div>
        </div>

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
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">نام کاربری</TableHead>
                <TableHead className="text-right">آدرس IP</TableHead>
                <TableHead className="text-right">مرورگر</TableHead>
                <TableHead className="text-right">تاریخ</TableHead>
                <TableHead className="text-right">ساعت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    در حال بارگذاری...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
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

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              صفحه {page} از {data.totalPages} ({data.total} رکورد)
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
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
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
