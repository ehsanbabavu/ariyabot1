import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Reply, 
  Trash2, 
  User, 
  Paperclip, 
  Search,
  Filter,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  Eye,
  ArrowUpDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAuthenticatedRequest } from "@/lib/auth";
import type { Ticket, User as UserType } from "@shared/schema";

interface TicketStats {
  total: number;
  unread: number;
  pending: number;
  resolved: number;
}

export default function TicketManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [adminReply, setAdminReply] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "priority" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tickets
  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/tickets");
      if (!response.ok) throw new Error("خطا در دریافت تیکت‌ها");
      return response.json();
    },
  });

  // Fetch users
  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/users");
      if (!response.ok) throw new Error("خطا در دریافت کاربران");
      return response.json();
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, reply }: { ticketId: string; reply: string }) => {
      const response = await createAuthenticatedRequest(`/api/tickets/${ticketId}/reply`, {
        method: "PUT",
        body: JSON.stringify({ adminReply: reply }),
      });
      if (!response.ok) throw new Error("خطا در پاسخ به تیکت");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      setIsReplyDialogOpen(false);
      setSelectedTicket(null);
      setAdminReply("");
      toast({
        title: "✅ موفقیت",
        description: "پاسخ با موفقیت ارسال شد",
      });
    },
    onError: () => {
      toast({
        title: "❌ خطا",
        description: "خطا در ارسال پاسخ",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await createAuthenticatedRequest(`/api/tickets/${ticketId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("خطا در حذف تیکت");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({
        title: "✅ موفقیت",
        description: "تیکت با موفقیت حذف شد",
      });
    },
    onError: () => {
      toast({
        title: "❌ خطا",
        description: "خطا در حذف تیکت",
        variant: "destructive",
      });
    },
  });

  // Memoized calculations
  const ticketStats: TicketStats = useMemo(() => {
    return {
      total: tickets.length,
      unread: tickets.filter(t => t.status === "unread").length,
      pending: tickets.filter(t => t.status === "read").length,
      resolved: tickets.filter(t => t.status === "closed").length,
    };
  }, [tickets]);

  const filteredAndSortedTickets = useMemo(() => {
    let filtered = tickets.filter(ticket => {
      // Filter by search query
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.message.toLowerCase().includes(searchLower) ||
        getUserForTicket(ticket.userId)?.email?.toLowerCase().includes(searchLower);

      // Filter by tab
      const matchesTab = activeTab === "all" || ticket.status === activeTab;

      return matchesSearch && matchesTab;
    });

    // Sort tickets
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                     (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
          break;
        case "status":
          const statusOrder = { unread: 3, read: 2, closed: 1 };
          comparison = (statusOrder[a.status as keyof typeof statusOrder] || 0) - 
                     (statusOrder[b.status as keyof typeof statusOrder] || 0);
          break;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [tickets, searchQuery, activeTab, sortBy, sortOrder]);

  const getUserForTicket = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "unread": return <AlertCircle className="h-4 w-4" />;
      case "read": return <Eye className="h-4 w-4" />;
      case "closed": return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          خوانده نشده
        </Badge>;
      case "read":
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          در حال بررسی
        </Badge>;
      case "closed":
        return <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          حل شده
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive" className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-current" />
          فوری
        </Badge>;
      case "high":
        return <Badge variant="destructive">بالا</Badge>;
      case "medium":
        return <Badge variant="secondary">متوسط</Badge>;
      case "low":
        return <Badge variant="outline">کم</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const handleReply = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsReplyDialogOpen(true);
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReply.trim()) return;

    replyMutation.mutate({
      ticketId: selectedTicket.id,
      reply: adminReply,
    });
  };

  const handleDelete = (ticketId: string) => {
    if (confirm("آیا از حذف این تیکت اطمینان دارید؟")) {
      deleteMutation.mutate(ticketId);
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  if (isLoading) {
    return (
      <DashboardLayout title="مدیریت تیکت‌ها">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="مدیریت تیکت‌ها">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">کل تیکت‌ها</p>
                  <p className="text-2xl font-bold">{ticketStats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">خوانده نشده</p>
                  <p className="text-2xl font-bold text-red-600">{ticketStats.unread}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">در حال بررسی</p>
                  <p className="text-2xl font-bold text-yellow-600">{ticketStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">حل شده</p>
                  <p className="text-2xl font-bold text-green-600">{ticketStats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="جستجو در تیکت‌ها..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSort}
                  className="flex items-center gap-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  مرتب‌سازی: {sortOrder === "desc" ? "نزولی" : "صعودی"}
                </Button>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "date" | "priority" | "status")}
                  className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                >
                  <option value="date">تاریخ</option>
                  <option value="priority">اولویت</option>
                  <option value="status">وضعیت</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              همه ({ticketStats.total})
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              خوانده نشده ({ticketStats.unread})
            </TabsTrigger>
            <TabsTrigger value="read" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              در بررسی ({ticketStats.pending})
            </TabsTrigger>
            <TabsTrigger value="closed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              حل شده ({ticketStats.resolved})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredAndSortedTickets.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      {searchQuery ? "تیکتی با این جستجو یافت نشد" : "تیکتی موجود نیست"}
                    </h3>
                    {searchQuery && (
                      <Button variant="outline" onClick={() => setSearchQuery("")}>
                        پاک کردن جستجو
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredAndSortedTickets.map((ticket) => {
                  const user = getUserForTicket(ticket.userId);
                  return (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user?.profilePicture || undefined} />
                              <AvatarFallback>
                                <User className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-foreground">
                                {user ? `${user.firstName} ${user.lastName}` : 'کاربر ناشناس'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {user?.email || 'ایمیل نامشخص'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('fa-IR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : '-'}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {ticket.subject}
                            </h3>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(ticket.status)}
                              {getPriorityBadge(ticket.priority)}
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground mb-3 line-clamp-2">
                            {ticket.message}
                          </p>

                          {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <Paperclip className="h-4 w-4" />
                              <span>{ticket.attachments.length} فایل ضمیمه</span>
                            </div>
                          )}
                        </div>

                        {ticket.adminReply && (
                          <div className="bg-muted/50 p-4 rounded-lg mb-4 border-r-4 border-primary">
                            <div className="flex items-center gap-2 mb-2">
                              <Reply className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-foreground">پاسخ مدیر:</span>
                              {ticket.adminReplyAt && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(ticket.adminReplyAt).toLocaleDateString('fa-IR')}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {ticket.adminReply}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleReply(ticket)}
                              className="flex items-center gap-2"
                              size="sm"
                            >
                              <Reply className="h-4 w-4" />
                              پاسخ
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ticket.id)}
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Reply Dialog */}
        <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Reply className="h-5 w-5" />
                پاسخ به تیکت
              </DialogTitle>
            </DialogHeader>
            
            {selectedTicket && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">موضوع تیکت:</h4>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedTicket.status)}
                      {getPriorityBadge(selectedTicket.priority)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedTicket.subject}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {selectedTicket.createdAt && 
                      `ارسال شده در ${new Date(selectedTicket.createdAt).toLocaleDateString('fa-IR')}`
                    }
                  </div>
                </div>

                <form onSubmit={handleSubmitReply} className="space-y-4">
                  <div>
                    <Label htmlFor="adminReply" className="text-base font-medium">
                      پاسخ شما:
                    </Label>
                    <Textarea
                      id="adminReply"
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      placeholder="پاسخ خود را اینجا بنویسید..."
                      rows={6}
                      required
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsReplyDialogOpen(false)}
                    >
                      لغو
                    </Button>
                    <Button
                      type="submit"
                      disabled={replyMutation.isPending || !adminReply.trim()}
                      className="flex items-center gap-2"
                    >
                      {replyMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          در حال ارسال...
                        </>
                      ) : (
                        <>
                          <Reply className="h-4 w-4" />
                          ارسال پاسخ
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}