import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createAuthenticatedRequest } from "@/lib/auth";
import type { SentMessage, ReceivedMessage } from "@shared/schema";

interface PaginatedMessages {
  messages: ReceivedMessage[];
  total: number;
  totalPages: number;
}

export default function Reports() {
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<ReceivedMessage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();

  const messagesPerPage = 7; // 7 پیام در هر صفحه

  // Fetch sent messages from local database
  const fetchSentMessages = async () => {
    try {
      const response = await createAuthenticatedRequest("/api/messages/sent");
      if (response.ok) {
        const data = await response.json();
        // Sort messages by timestamp descending (newest first) to ensure consistency
        const sortedMessages = data.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setSentMessages(sortedMessages);
      }
    } catch (error) {
      console.error("خطا در دریافت پیام‌های ارسالی:", error);
    }
  };

  // Fetch received messages with pagination
  const fetchReceivedMessages = async (page: number = currentPage) => {
    try {
      const response = await createAuthenticatedRequest(
        `/api/messages/received?page=${page}&limit=${messagesPerPage}`
      );
      if (response.ok) {
        const data: PaginatedMessages = await response.json();
        // Sort messages by timestamp descending (newest first) to ensure consistency
        const sortedMessages = data.messages.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setReceivedMessages(sortedMessages);
        setTotalPages(data.totalPages);
        setTotalMessages(data.total);
        setCurrentPage(page);
        setLastUpdateTime(new Date().toLocaleTimeString('fa-IR'));
      }
    } catch (error) {
      console.error("خطا در دریافت پیام‌های دریافتی:", error);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchReceivedMessages(newPage);
    }
  };

  // Handle clicking on a received message to mark as read
  const handleMessageClick = async (messageId: string) => {
    try {
      const response = await createAuthenticatedRequest(`/api/messages/received/${messageId}/read`, {
        method: "PUT",
      });

      if (response.ok) {
        // Update local state
        setReceivedMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: "خوانده شده" }
              : msg
          )
        );
        
        toast({
          title: "موفقیت",
          description: "پیام به عنوان خوانده شده علامت‌گذاری شد",
        });
      }
    } catch (error) {
      console.error("خطا در بروزرسانی وضعیت پیام:", error);
      toast({
        title: "خطا",
        description: "خطا در بروزرسانی وضعیت پیام",
        variant: "destructive",
      });
    }
  };

  // Mark all unread messages on current page as read
  const markAllAsRead = async () => {
    setIsMarkingAllRead(true);
    
    try {
      const unreadMessages = receivedMessages.filter(msg => msg.status === "خوانده نشده");
      
      if (unreadMessages.length === 0) {
        toast({
          title: "اطلاع",
          description: "همه پیام‌های این صفحه قبلاً خوانده شده‌اند",
        });
        return;
      }

      let successCount = 0;

      for (const message of unreadMessages) {
        try {
          const response = await createAuthenticatedRequest(`/api/messages/received/${message.id}/read`, {
            method: "PUT",
          });

          if (response.ok) {
            successCount++;
            // Update local state
            setReceivedMessages(prev => 
              prev.map(msg => 
                msg.id === message.id 
                  ? { ...msg, status: "خوانده شده" }
                  : msg
              )
            );
          }
        } catch (error) {
          console.error(`خطا در بروزرسانی پیام ${message.id}:`, error);
        }
      }

      if (successCount > 0) {
        toast({
          title: "موفقیت",
          description: `${successCount} پیام به عنوان خوانده شده علامت‌گذاری شد`,
        });
      }
    } catch (error) {
      console.error("خطا در علامت‌گذاری پیام‌ها:", error);
      toast({
        title: "خطا",
        description: "خطا در علامت‌گذاری پیام‌ها",
        variant: "destructive",
      });
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchSentMessages(),
        fetchReceivedMessages(1)
      ]);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchReceivedMessages(currentPage);
      fetchSentMessages(); // اضافه کردن بروزرسانی پیام‌های ارسالی
    }, 5000);

    return () => clearInterval(interval);
  }, [currentPage]);

  const formatTimestamp = (timestamp: Date | string | null, originalDate?: string | null) => {
    // استفاده از تاریخ اصلی از WhatsiPlus اگر موجود است
    if (originalDate) {
      try {
        // فرمت WhatsiPlus: "2024/05/01 13:43:53"
        const parsedDate = new Date(originalDate.replace(/\//g, '-'));
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleString('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
        }
      } catch (error) {
        console.error("خطا در پارس تاریخ اصلی:", error);
      }
    }

    // استفاده از تاریخ پایگاه داده
    if (!timestamp) return 'تاریخ نامشخص';
    return new Date(timestamp).toLocaleString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "sent":
      case "خوانده شده":
        return "default";
      case "delivered":
        return "secondary";
      case "failed":
        return "destructive";
      case "خوانده نشده":
        return "secondary";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="گزارشات واتس‌اپ">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg">در حال بارگذاری...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const unreadCount = receivedMessages.filter(msg => msg.status === "خوانده نشده").length;

  return (
    <DashboardLayout title="گزارشات واتس‌اپ">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="page-reports">
        
        {/* Right Column - Sent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="w-5 h-5 ml-2" />
              پیام‌های ارسالی
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {sentMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>هیچ پیام ارسالی یافت نشد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentMessages.slice(0, 7).map((message) => (
                    <div 
                      key={message.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-right"
                      dir="rtl"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm">گیرنده: {message.recipient}</div>
                        <Badge variant={getStatusBadgeVariant(message.status)}>
                          {message.status}
                        </Badge>
                      </div>
                      <div className="text-gray-700 mb-2 text-sm">
                        {message.message}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Left Column - Received Messages */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Inbox className="w-5 h-5 ml-2" />
                پیام‌های دریافتی
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="mr-2">
                    {unreadCount} خوانده نشده
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={isMarkingAllRead}
                    className="text-sm"
                  >
                    {isMarkingAllRead ? "در حال بروزرسانی..." : "علامت‌گذاری همه در این صفحه"}
                  </Button>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {lastUpdateTime && `آخرین بروزرسانی: ${lastUpdateTime}`}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[550px]">
              {receivedMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>هیچ پیام دریافتی یافت نشد</p>
                  <p className="text-xs mt-1">
                    پیام‌ها هر ۵ ثانیه از واتس‌اپ دریافت می‌شوند
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {receivedMessages.map((message) => (
                    <div 
                      key={message.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors text-right ${
                        message.status === "خوانده نشده" 
                          ? "bg-blue-50 hover:bg-blue-100 border-blue-200" 
                          : "hover:bg-gray-50"
                      }`}
                      dir="rtl"
                      onClick={() => handleMessageClick(message.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm">فرستنده: {message.sender}</div>
                        <Badge variant={getStatusBadgeVariant(message.status)}>
                          {message.status}
                        </Badge>
                      </div>
                      <div className="text-gray-700 mb-2 text-sm">
                        {message.message}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp, message.originalDate)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {totalMessages} پیام کل - صفحه {currentPage} از {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                    قبلی
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    بعدی
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}