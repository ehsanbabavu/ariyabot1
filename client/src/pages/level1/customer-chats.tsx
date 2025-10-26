import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { createAuthenticatedRequest } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Send, MessageCircle, User, Clock, ArrowRight } from "lucide-react";
import { type InternalChat } from "@shared/schema";

interface ChatWithUser extends InternalChat {
  senderName?: string;
  receiverName?: string;
}

export default function CustomerChats() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all chats for this seller
  const { data: allChats, isLoading: chatsLoading } = useQuery<ChatWithUser[]>({
    queryKey: ["/api/internal-chats"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Get unique customers with their latest messages
  const customers = allChats && user ? 
    Object.values(
      allChats.reduce((acc, chat) => {
        const customerId = chat.senderId !== user.id ? chat.senderId : chat.receiverId;
        if (!acc[customerId] || (chat.createdAt && (!acc[customerId].latestMessage.createdAt || chat.createdAt > acc[customerId].latestMessage.createdAt))) {
          acc[customerId] = {
            customerId,
            customerName: chat.senderId !== user.id ? chat.senderName : chat.receiverName,
            latestMessage: chat,
            unreadCount: allChats.filter(c => 
              (c.senderId === customerId || c.receiverId === customerId) &&
              c.senderId !== user.id &&
              !c.isRead
            ).length
          };
        }
        return acc;
      }, {} as Record<string, any>)
    ).sort((a, b) => {
      const aTime = a.latestMessage.createdAt ? new Date(a.latestMessage.createdAt).getTime() : 0;
      const bTime = b.latestMessage.createdAt ? new Date(b.latestMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    : [];

  // Get messages for selected customer
  const selectedCustomerChats = allChats && selectedCustomerId
    ? allChats.filter(chat => 
        chat.senderId === selectedCustomerId || chat.receiverId === selectedCustomerId
      ).sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
      })
    : [];

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
    mutationFn: async (data: { receiverId: string; message: string }) => {
      const response = await createAuthenticatedRequest("/api/internal-chats", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("خطا در ارسال پیام");
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/internal-chats"] });
      toast({
        title: "موفقیت",
        description: "پیام شما ارسال شد",
      });
      // Auto scroll to bottom
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

  // Mark messages as read when user opens the chat page
  useEffect(() => {
    if (user && user.role === "user_level_1" && allChats && allChats.length > 0) {
      // Check if there are any unread messages from sub-users
      const hasUnreadFromSubUsers = allChats.some(chat => 
        chat.receiverId === user.id && 
        !chat.isRead
      );
      
      if (hasUnreadFromSubUsers) {
        markAllAsReadMutation.mutate();
      }
    }
  }, [user, allChats]); // Run when user or chats change

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedCustomerId || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      receiverId: selectedCustomerId,
      message: newMessage.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto scroll when new messages arrive
  useEffect(() => {
    if (selectedCustomerChats.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedCustomerChats]);

  if (chatsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-lg">در حال بارگذاری چت‌ها...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4" data-testid="customer-chats-content">
      {/* Customer List - Desktop: always visible, Mobile: hidden when chat is selected */}
      <div className={`w-full md:w-80 md:flex-shrink-0 ${selectedCustomerId ? 'hidden md:block' : 'block'}`}>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-4 w-4" />
              مشتریان ({customers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-5rem)]">
            <ScrollArea className="h-full">
              {customers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  هیچ چتی موجود نیست
                </div>
              ) : (
                customers.map((customer) => (
                  <div
                    key={customer.customerId}
                    className={`p-3 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors ${
                      selectedCustomerId === customer.customerId
                        ? "bg-primary/10 border-r-2 border-r-primary"
                        : ""
                    }`}
                    onClick={() => setSelectedCustomerId(customer.customerId)}
                    data-testid={`customer-chat-${customer.customerId}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm truncate">
                            {customer.customerName || "نام نامشخص"}
                          </h3>
                          {customer.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                              {customer.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {customer.latestMessage.message}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {customer.latestMessage.createdAt ? new Date(customer.latestMessage.createdAt).toLocaleDateString("fa-IR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }) : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area - Desktop: always visible, Mobile: shown when customer selected */}
      <div className={`w-full md:flex-1 ${selectedCustomerId ? 'block' : 'hidden md:block'}`}>
        {selectedCustomerId ? (
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden -mr-2"
                  onClick={() => setSelectedCustomerId(null)}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                چت با {customers.find(c => c.customerId === selectedCustomerId)?.customerName || "مشتری"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {selectedCustomerChats.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">هنوز پیامی موجود نیست</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomerChats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`flex ${chat.senderId === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 ${
                            chat.senderId === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                          data-testid={`message-${chat.id}`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 opacity-70" />
                            <span className="text-xs opacity-70">
                              {chat.createdAt ? new Date(chat.createdAt).toLocaleTimeString("fa-IR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              }) : ""}
                            </span>
                            {chat.senderId === user?.id && (
                              <span className="text-xs opacity-70 mr-1">
                                {chat.isRead ? "✓✓" : "✓"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-3">
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="پیام خود را بنویسید..."
                    className="flex-1 min-h-[40px] max-h-[100px] resize-none"
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    size="sm"
                    data-testid="button-send"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Enter برای ارسال، Shift+Enter برای خط جدید
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>یک مشتری را برای مشاهده چت انتخاب کنید</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}