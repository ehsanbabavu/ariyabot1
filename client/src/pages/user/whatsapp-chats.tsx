import { useState, useEffect, useMemo, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Send, 
  Search, 
  Phone,
  ArrowRight,
  Clock,
  CheckCheck,
  Image as ImageIcon,
  User as UserIcon,
  Paperclip,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAuthenticatedRequest } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import type { SentMessage, ReceivedMessage, User } from "@shared/schema";

interface Contact {
  phoneNumber: string;
  userName?: string;
  userProfilePicture?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: CombinedMessage[];
}

interface CombinedMessage {
  id: string;
  phoneNumber: string;
  message: string;
  timestamp: Date;
  isSent: boolean;
  status?: string;
  imageUrl?: string;
  originalDate?: string | null;
}

export default function WhatsAppChats() {
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<ReceivedMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const response = await createAuthenticatedRequest("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("خطا در دریافت کاربران:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        createAuthenticatedRequest("/api/messages/sent"),
        createAuthenticatedRequest("/api/messages/received?page=1&limit=1000")
      ]);

      if (sentResponse.ok) {
        const data = await sentResponse.json();
        setSentMessages(data);
      }

      if (receivedResponse.ok) {
        const data = await receivedResponse.json();
        setReceivedMessages(data.messages || []);
      }
    } catch (error) {
      console.error("خطا در دریافت پیام‌ها:", error);
      toast({
        title: "خطا",
        description: "خطا در دریافت پیام‌ها",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const getUserNameByPhone = (phone: string): string | undefined => {
    const user = users.find(u => u.phone === phone || u.whatsappNumber === phone);
    if (user && user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return undefined;
  };

  const getUserByPhone = (phone: string): User | undefined => {
    return users.find(u => u.phone === phone || u.whatsappNumber === phone);
  };

  const contacts = useMemo(() => {
    const contactMap = new Map<string, Contact>();

    sentMessages.forEach((msg) => {
      const phone = msg.recipient;
      if (!contactMap.has(phone)) {
        const user = getUserByPhone(phone);
        contactMap.set(phone, {
          phoneNumber: phone,
          userName: getUserNameByPhone(phone),
          userProfilePicture: user?.profilePicture || undefined,
          lastMessage: msg.message,
          lastMessageTime: new Date(msg.timestamp),
          unreadCount: 0,
          messages: []
        });
      }
      
      const contact = contactMap.get(phone)!;
      contact.messages.push({
        id: msg.id,
        phoneNumber: phone,
        message: msg.message,
        timestamp: new Date(msg.timestamp),
        isSent: true,
        status: msg.status
      });

      if (new Date(msg.timestamp) > contact.lastMessageTime) {
        contact.lastMessage = msg.message;
        contact.lastMessageTime = new Date(msg.timestamp);
      }
    });

    receivedMessages.forEach((msg) => {
      const phone = msg.sender;
      if (!contactMap.has(phone)) {
        const user = getUserByPhone(phone);
        contactMap.set(phone, {
          phoneNumber: phone,
          userName: getUserNameByPhone(phone),
          userProfilePicture: user?.profilePicture || undefined,
          lastMessage: msg.message,
          lastMessageTime: new Date(msg.timestamp),
          unreadCount: 0,
          messages: []
        });
      }
      
      const contact = contactMap.get(phone)!;
      contact.messages.push({
        id: msg.id,
        phoneNumber: phone,
        message: msg.message,
        timestamp: new Date(msg.timestamp),
        isSent: false,
        status: msg.status,
        imageUrl: msg.imageUrl || undefined,
        originalDate: msg.originalDate
      });

      if (msg.status === "خوانده نشده") {
        contact.unreadCount++;
      }

      if (new Date(msg.timestamp) > contact.lastMessageTime) {
        contact.lastMessage = msg.message;
        contact.lastMessageTime = new Date(msg.timestamp);
      }
    });

    contactMap.forEach(contact => {
      contact.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });

    return Array.from(contactMap.values()).sort(
      (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
    );
  }, [sentMessages, receivedMessages, users]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    return contacts.filter(contact => 
      contact.phoneNumber.includes(searchQuery) ||
      contact.userName?.includes(searchQuery) ||
      contact.lastMessage.includes(searchQuery)
    );
  }, [contacts, searchQuery]);

  const totalUnreadCount = useMemo(() => {
    return contacts.reduce((sum, contact) => sum + contact.unreadCount, 0);
  }, [contacts]);

  const selectedContactData = useMemo(() => {
    return contacts.find(c => c.phoneNumber === selectedContact);
  }, [contacts, selectedContact]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await createAuthenticatedRequest(`/api/messages/received/${messageId}/read`, {
        method: "PUT",
      });
      fetchMessages();
    } catch (error) {
      console.error("خطا در علامت‌گذاری پیام:", error);
    }
  };

  useEffect(() => {
    if (selectedContactData && selectedContactData.unreadCount > 0) {
      selectedContactData.messages
        .filter(msg => !msg.isSent && msg.status === "خوانده نشده")
        .forEach(msg => handleMarkAsRead(msg.id));
    }
  }, [selectedContactData]);

  const formatTimestamp = (timestamp: Date, originalDate?: string | null) => {
    if (originalDate) {
      try {
        const parsedDate = new Date(originalDate.replace(/\//g, '-'));
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleString('fa-IR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        }
      } catch (error) {
        console.error("خطا در پارس تاریخ:", error);
      }
    }

    return timestamp.toLocaleString('fa-IR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLastMessageTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return timestamp.toLocaleTimeString('fa-IR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (days === 1) {
      return 'دیروز';
    } else if (days < 7) {
      return `${days} روز پیش`;
    } else {
      return timestamp.toLocaleDateString('fa-IR', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    setIsSending(true);
    try {
      const settingsResponse = await createAuthenticatedRequest("/api/whatsapp-settings");
      if (!settingsResponse.ok) {
        throw new Error("خطا در دریافت تنظیمات واتس‌اپ");
      }
      
      const settings = await settingsResponse.json();
      const apiToken = settings.token;

      if (!apiToken) {
        toast({
          title: "خطا",
          description: "توکن API تنظیم نشده. ابتدا تنظیمات را کامل کنید",
          variant: "destructive",
        });
        setIsSending(false);
        return;
      }

      const formData = new FormData();
      formData.append('phonenumber', selectedContact.replace('+', ''));
      formData.append('message', newMessage.trim());

      const apiUrl = `https://api.whatsiplus.com/sendMsg/${apiToken}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        try {
          const dbResponse = await createAuthenticatedRequest("/api/messages/sent", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipient: selectedContact,
              message: newMessage.trim(),
              status: "sent"
            }),
          });

          if (!dbResponse.ok) {
            console.error("خطا در ذخیره پیام");
          }
        } catch (dbError) {
          console.error("خطا در ذخیره پیام:", dbError);
        }

        setNewMessage("");
        toast({
          title: "موفق",
          description: "پیام با موفقیت ارسال شد",
        });
        fetchMessages();
      } else {
        throw new Error("خطا در ارسال پیام");
      }
    } catch (error) {
      console.error("خطا در ارسال پیام:", error);
      const errorMessage = error instanceof Error ? error.message : "خطا در ارسال";
      toast({
        title: "خطا",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedContact) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطا",
        description: "فقط فایل‌های تصویری پشتیبانی می‌شوند",
        variant: "destructive",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setIsSending(true);
    let uploadedFilename: string | null = null;

    try {
      const settingsResponse = await createAuthenticatedRequest("/api/whatsapp-settings");
      if (!settingsResponse.ok) {
        throw new Error("خطا در دریافت تنظیمات واتس‌اپ");
      }
      
      const settings = await settingsResponse.json();
      const apiToken = settings.token;

      if (!apiToken) {
        toast({
          title: "خطا",
          description: "توکن API تنظیم نشده. ابتدا تنظیمات را کامل کنید",
          variant: "destructive",
        });
        setIsSending(false);
        return;
      }

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadResponse = await createAuthenticatedRequest("/api/upload-temp", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error("خطا در آپلود فایل");
      }

      const uploadData = await uploadResponse.json();
      uploadedFilename = uploadData.filename;
      const fileUrl = uploadData.fullUrl;

      const formData = new FormData();
      formData.append('phonenumber', selectedContact.replace('+', ''));
      formData.append('message', newMessage.trim() || 'تصویر ارسالی');
      formData.append('link', fileUrl);

      const apiUrl = `https://api.whatsiplus.com/sendMsg/${apiToken}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        try {
          const dbResponse = await createAuthenticatedRequest("/api/messages/sent", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipient: selectedContact,
              message: `${newMessage.trim() || 'تصویر ارسالی'}`,
              status: "sent"
            }),
          });

          if (!dbResponse.ok) {
            console.error("خطا در ذخیره پیام");
          }
        } catch (dbError) {
          console.error("خطا در ذخیره پیام:", dbError);
        }

        // فایل بعد از 5 دقیقه توسط سرویس cleanup حذف می‌شود

        setNewMessage("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        toast({
          title: "موفق",
          description: "تصویر با موفقیت ارسال شد",
        });
        fetchMessages();
      } else {
        throw new Error("خطا در ارسال تصویر");
      }
    } catch (error) {
      console.error("خطا در ارسال فایل:", error);
      const errorMessage = error instanceof Error ? error.message : "خطا در ارسال فایل";
      
      // در صورت خطا، فایل بعد از 5 دقیقه توسط سرویس cleanup حذف می‌شود
      
      toast({
        title: "خطا",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="چت واتس‌اپ">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg">در حال بارگذاری...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="چت واتس‌اپ">
      <div className="h-[calc(100vh-12rem)]" data-testid="page-whatsapp-chats">
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            <div className="grid grid-cols-12 h-full">
              
              {/* Contacts Sidebar */}
              <div className="col-span-12 md:col-span-4 border-l h-full flex flex-col">
                {/* Search */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="جستجوی مخاطب یا پیام..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10 h-9"
                    />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    {filteredContacts.length} مخاطب
                  </div>
                </div>

                {/* Contacts List */}
                <ScrollArea className="flex-1">
                  {filteredContacts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">هیچ مخاطبی یافت نشد</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredContacts.map((contact) => (
                        <div
                          key={contact.phoneNumber}
                          className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                            selectedContact === contact.phoneNumber ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                          }`}
                          onClick={() => setSelectedContact(contact.phoneNumber)}
                        >
                          <div className="flex items-center justify-between" dir="rtl">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {contact.userProfilePicture ? (
                                <img 
                                  src={contact.userProfilePicture} 
                                  alt={contact.userName || contact.phoneNumber}
                                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  {contact.userName ? (
                                    <UserIcon className="w-6 h-6 text-white" />
                                  ) : (
                                    <Phone className="w-6 h-6 text-white" />
                                  )}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {contact.userName || contact.phoneNumber}
                                </div>
                                <div className="text-xs text-muted-foreground truncate" dir="ltr">
                                  {contact.phoneNumber}
                                </div>
                              </div>
                            </div>
                            {contact.unreadCount > 0 && (
                              <Badge className="bg-green-500 hover:bg-green-600 text-white h-6 min-w-[24px] flex items-center justify-center">
                                {contact.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Chat Area */}
              <div className="col-span-12 md:col-span-8 h-full flex flex-col">
                {selectedContactData ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b bg-gradient-to-l from-blue-50 to-purple-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden"
                            onClick={() => setSelectedContact(null)}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                          {selectedContactData.userProfilePicture ? (
                            <img 
                              src={selectedContactData.userProfilePicture} 
                              alt={selectedContactData.userName || selectedContactData.phoneNumber}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              {selectedContactData.userName ? (
                                <UserIcon className="w-5 h-5 text-white" />
                              ) : (
                                <Phone className="w-5 h-5 text-white" />
                              )}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold" dir="rtl">
                              {selectedContactData.userName || selectedContactData.phoneNumber}
                            </div>
                            {selectedContactData.userName && (
                              <div className="text-xs text-muted-foreground" dir="ltr">
                                {selectedContactData.phoneNumber}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {selectedContactData.messages.length} پیام
                            </div>
                          </div>
                        </div>
                        {selectedContactData.unreadCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {selectedContactData.unreadCount} خوانده نشده
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
                      <div className="space-y-3 flex flex-col-reverse">
                        {[...selectedContactData.messages].reverse().map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-2 ${message.isSent ? 'justify-start' : 'justify-end'}`}
                            dir="rtl"
                          >
                            {message.isSent && (
                              currentUser?.profilePicture ? (
                                <img 
                                  src={currentUser.profilePicture} 
                                  alt={`${currentUser.firstName} ${currentUser.lastName}`}
                                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <UserIcon className="w-4 h-4 text-white" />
                                </div>
                              )
                            )}
                            <div className="flex flex-col max-w-[70%]">
                              <div
                                className={`rounded-lg p-2.5 ${
                                  message.isSent
                                    ? 'bg-blue-500 text-white rounded-tr-none'
                                    : 'bg-white text-gray-900 rounded-tl-none shadow-sm'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.message}
                                </p>
                                {message.imageUrl && (
                                  <div className="mt-2 pt-2 border-t border-white/20">
                                    <div className="flex items-center space-x-1 space-x-reverse text-xs">
                                      <ImageIcon className="w-3 h-3" />
                                      <span>تصویر پیوست</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 space-x-reverse mt-1 px-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(message.timestamp, message.originalDate)}
                                </span>
                                {message.isSent && message.status === 'sent' && (
                                  <CheckCheck className="w-3 h-3 text-blue-500" />
                                )}
                              </div>
                            </div>
                            {!message.isSent && (
                              selectedContactData.userProfilePicture ? (
                                <img 
                                  src={selectedContactData.userProfilePicture} 
                                  alt={selectedContactData.userName || selectedContactData.phoneNumber}
                                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  {selectedContactData.userName ? (
                                    <UserIcon className="w-4 h-4 text-white" />
                                  ) : (
                                    <Phone className="w-4 h-4 text-white" />
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Message Input Area */}
                    <div className="p-4 border-t bg-white">
                      <div className="flex items-end gap-2" dir="rtl">
                        <Button
                          variant="outline"
                          size="icon"
                          className="flex-shrink-0"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSending}
                        >
                          <Paperclip className="w-4 h-4" />
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                        <Textarea
                          placeholder="پیام خود را بنویسید..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                          disabled={isSending}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || isSending}
                          className="flex-shrink-0"
                        >
                          {isSending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        برای ارسال پیام Enter و برای خط جدید Shift+Enter را فشار دهید
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">یک مخاطب را انتخاب کنید</p>
                      <p className="text-sm mt-2">برای مشاهده گفتگو، روی یک شماره کلیک کنید</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
