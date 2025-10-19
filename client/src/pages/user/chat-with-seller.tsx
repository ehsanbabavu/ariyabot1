import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Clock, User, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createAuthenticatedRequest } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InternalChat, User as UserType } from "@shared/schema";

// Extended chat type with sender info
type ChatWithSender = InternalChat & {
  senderName?: string;
  senderRole?: string;
};

export default function ChatWithSeller() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get parent (seller) information
  const { data: parentUser } = useQuery<UserType | null>({
    queryKey: ["/api/users/parent"],
    enabled: !!user && user.role === "user_level_2",
    queryFn: async () => {
      if (!user?.parentUserId) return null;
      const response = await createAuthenticatedRequest(`/api/users/${user.parentUserId}`);
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Get chat messages between current user and parent
  const { data: chats = [], isLoading, refetch } = useQuery<ChatWithSender[]>({
    queryKey: ["/api/internal-chats"],
    enabled: !!user && user.role === "user_level_2" && !!user.parentUserId,
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/internal-chats");
      if (!response.ok) {
        throw new Error("خطا در دریافت پیام‌ها");
      }
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Mark all messages as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await createAuthenticatedRequest("/api/internal-chats/mark-all-read", {
        method: "PATCH",
      });
      if (!response.ok) {
        throw new Error("خطا در علامت‌گذاری پیام‌ها");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal-chats"] });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await createAuthenticatedRequest("/api/internal-chats", {
        method: "POST",
        body: JSON.stringify({
          receiverId: user?.parentUserId,
          message: messageText,
        }),
      });
      if (!response.ok) {
        throw new Error("خطا در ارسال پیام");
      }
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/internal-chats"] });
      toast({
        title: "موفقیت",
        description: "پیام شما ارسال شد",
      });
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در ارسال پیام",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mark all messages as read when user enters the chat
  useEffect(() => {
    if (user && user.role === "user_level_2" && user.parentUserId && chats.length > 0) {
      // Check if there are any unread messages from parent
      const hasUnreadFromParent = chats.some(chat => 
        chat.senderId === user.parentUserId && 
        chat.receiverId === user.id && 
        !chat.isRead
      );
      
      if (hasUnreadFromParent) {
        markAllAsReadMutation.mutate();
      }
    }
  }, [user, chats]); // Run when user or chats change

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  if (!user || user.role !== "user_level_2") {
    return (
      <DashboardLayout title="چت با فروشنده">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">دسترسی غیر مجاز</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user.parentUserId) {
    return (
      <DashboardLayout title="چت با فروشنده">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">فروشنده‌ای برای شما تعین نشده است</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="چت با فروشنده">
      <div className="h-[calc(100vh-8rem)]" data-testid="chat-with-seller-content">

        {/* Chat Messages */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={parentUser?.profilePicture || ""} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">
                  {parentUser ? `${parentUser.firstName} ${parentUser.lastName}` : "فروشنده"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs h-5">
                    فروشنده
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    آنلاین
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="messages-container">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <div className="text-sm">در حال بارگذاری پیام‌ها...</div>
                    </div>
                  </div>
                ) : chats.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm mb-1">هنوز پیامی ارسال نشده</p>
                      <p className="text-xs opacity-75">اولین پیام خود را ارسال کنید</p>
                    </div>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex ${
                        chat.senderId === user.id ? "justify-end" : "justify-start"
                      }`}
                      data-testid={`message-${chat.id}`}
                    >
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-lg ${
                          chat.senderId === user.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 opacity-70" />
                          <span className="text-xs opacity-70">
                            {chat.createdAt ? new Date(chat.createdAt).toLocaleString('fa-IR', {
                              hour: "2-digit",
                              minute: "2-digit"
                            }) : 'نامشخص'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-3">
                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="پیام خود را بنویسید..."
                    className="flex-1 min-h-[40px] max-h-[100px] resize-none"
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    size="sm"
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Enter برای ارسال، Shift+Enter برای خط جدید
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}