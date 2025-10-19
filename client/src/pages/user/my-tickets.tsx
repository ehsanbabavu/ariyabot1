import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Calendar,
  Reply,
  Eye,
  EyeOff
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Ticket } from "@shared/schema";

interface TicketWithResponses extends Ticket {
  responses?: {
    id: string;
    message: string;
    createdAt: string;
    isAdmin: boolean;
    userName?: string;
  }[];
}

export default function MyTickets() {
  const [selectedTicket, setSelectedTicket] = useState<TicketWithResponses | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery<TicketWithResponses[]>({
    queryKey: ["/api/my-tickets"],
    queryFn: async () => {
      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {};
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization;
      }
      
      const response = await fetch("/api/my-tickets", {
        headers,
      });
      if (!response.ok) throw new Error("خطا در دریافت تیکت‌ها");
      return response.json();
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization;
      }
      
      const response = await fetch(`/api/tickets/${ticketId}/reply`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error("خطا در ارسال پاسخ");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-tickets"] });
      setReplyMessage("");
      toast({
        title: "موفقیت",
        description: "پاسخ شما ارسال شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در ارسال پاسخ",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "unread":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "read":
        return <Eye className="w-4 h-4 text-blue-500" />;
      case "closed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      unread: "خوانده نشده",
      read: "پاسخ داده شده",
      closed: "بسته شده",
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      urgent: "فوری",
      high: "بالا",
      medium: "متوسط",
      low: "کم",
    };
    return labels[priority] || priority;
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    
    sendReplyMutation.mutate({
      ticketId: selectedTicket.id,
      message: replyMessage.trim(),
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="تیکت‌های من">
        <div className="text-center py-8">در حال بارگذاری...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="تیکت‌های من">
      <div className="space-y-6" data-testid="page-my-tickets">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">تیکت‌های من</h2>
            <p className="text-muted-foreground">مشاهده و پیگیری تیکت‌های ارسالی</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {tickets.length} تیکت
          </Badge>
        </div>

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">هنوز تیکتی ارسال نکرده‌اید</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(ticket.status)}
                        <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                        <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                          {getPriorityLabel(ticket.priority)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {ticket.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('fa-IR') : 'نامشخص'}
                        </div>
                        <Badge variant={
                          ticket.status === "unread" ? "destructive" : 
                          ticket.status === "closed" ? "default" : "secondary"
                        }>
                          {getStatusLabel(ticket.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <Dialog open={isDialogOpen && selectedTicket?.id === ticket.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) setSelectedTicket(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedTicket(ticket)}
                          data-testid={`button-view-ticket-${ticket.id}`}
                        >
                          <Eye className="w-4 h-4 ml-1" />
                          مشاهده
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getStatusIcon(ticket.status)}
                            {ticket.subject}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {/* Ticket Info */}
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                            <div>
                              <span className="text-sm font-medium">وضعیت:</span>
                              <Badge className="mr-2" variant={
                                ticket.status === "unread" ? "destructive" : 
                                ticket.status === "closed" ? "default" : "secondary"
                              }>
                                {getStatusLabel(ticket.status)}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-sm font-medium">اولویت:</span>
                              <Badge className={`mr-2 ${getPriorityColor(ticket.priority)}`}>
                                {getPriorityLabel(ticket.priority)}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Original Message */}
                          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">شما</span>
                              <span className="text-xs text-muted-foreground">
                                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('fa-IR') : 'نامشخص'}
                              </span>
                            </div>
                            <p className="text-sm">{ticket.message}</p>
                          </div>
                          
                          {/* Responses */}
                          {ticket.responses && ticket.responses.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-medium flex items-center gap-2">
                                <Reply className="w-4 h-4" />
                                پاسخ‌ها
                              </h4>
                              {ticket.responses.map((response) => (
                                <div
                                  key={response.id}
                                  className={`p-4 rounded-lg border-l-4 ${
                                    response.isAdmin
                                      ? "bg-green-50 dark:bg-green-950/30 border-green-400"
                                      : "bg-gray-50 dark:bg-gray-950/30 border-gray-400"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4" />
                                    <span className="font-medium">
                                      {response.isAdmin ? "پشتیبانی" : response.userName || "شما"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(response.createdAt).toLocaleDateString('fa-IR')}
                                    </span>
                                  </div>
                                  <p className="text-sm">{response.message}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Reply Form */}
                          {ticket.status !== "closed" && (
                            <form onSubmit={handleReplySubmit} className="space-y-3">
                              <Label htmlFor="reply">ارسال پاسخ</Label>
                              <Textarea
                                id="reply"
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="پاسخ خود را بنویسید..."
                                className="min-h-20"
                                data-testid="textarea-reply"
                              />
                              <Button 
                                type="submit" 
                                disabled={!replyMessage.trim() || sendReplyMutation.isPending}
                                data-testid="button-send-reply"
                              >
                                <Send className="w-4 h-4 ml-1" />
                                {sendReplyMutation.isPending ? "در حال ارسال..." : "ارسال پاسخ"}
                              </Button>
                            </form>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}