import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, RotateCcw, MessageCircle, Tag, AlertTriangle, FileText, Paperclip, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/auth";

export default function SendTicket() {
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    priority: "medium",
    message: "",
  });
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTicketMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const formDataToSend = new FormData();
      formDataToSend.append("subject", data.subject);
      formDataToSend.append("category", data.category);
      formDataToSend.append("priority", data.priority);
      formDataToSend.append("message", data.message);

      if (attachments) {
        Array.from(attachments).forEach((file) => {
          formDataToSend.append("attachments", file);
        });
      }

      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {};
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization;
      }
      
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers,
        body: formDataToSend,
      });

      if (!response.ok) throw new Error("خطا در ارسال تیکت");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      setFormData({ subject: "", category: "", priority: "medium", message: "" });
      setAttachments(null);
      // Reset file input
      const fileInput = document.getElementById("attachments") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      toast({
        title: "موفقیت",
        description: "تیکت با موفقیت ارسال شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در ارسال تیکت",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.category || !formData.message.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً تمام فیلدهای الزامی را پر کنید",
        variant: "destructive",
      });
      return;
    }

    createTicketMutation.mutate(formData);
  };

  const handleReset = () => {
    setFormData({ subject: "", category: "", priority: "medium", message: "" });
    setAttachments(null);
    // Reset file input
    const fileInput = document.getElementById("attachments") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Check file count
    if (files.length > 5) {
      toast({
        title: "خطا",
        description: "حداکثر ۵ فایل می‌توانید ضمیمه کنید",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    // Check file sizes
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "خطا",
          description: "حجم هر فایل نباید بیش از ۵ مگابایت باشد",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }
    }

    setAttachments(files);
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      technical: "مشکل فنی",
      account: "مسائل حساب کاربری",
      billing: "مسائل مالی",
      feature: "درخواست ویژگی جدید",
      other: "سایر",
    };
    return categories[category] || category;
  };

  const getPriorityLabel = (priority: string) => {
    const priorities: Record<string, string> = {
      low: "کم",
      medium: "متوسط",
      high: "بالا",
      urgent: "فوری",
    };
    return priorities[priority] || priority;
  };

  return (
    <DashboardLayout title="ارسال تیکت">
      <div className="space-y-6" data-testid="page-send-ticket">

        <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg py-3">
            <CardTitle className="flex items-center text-base">
              <Send className="w-4 h-4 ml-2" />
              فرم ارسال تیکت
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-send-ticket">
              
              {/* Subject Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <Label htmlFor="subject" className="text-sm font-semibold text-foreground">موضوع تیکت *</Label>
                </div>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="مثال: مشکل در ورود به حساب کاربری"
                  required
                  data-testid="input-ticket-subject"
                  className="h-9 border focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Category and Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <Label htmlFor="category" className="text-sm font-semibold text-foreground">دسته‌بندی *</Label>
                  </div>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger data-testid="select-ticket-category" className="h-9 border">
                      <SelectValue placeholder="انتخاب دسته‌بندی" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">🔧 مشکل فنی</SelectItem>
                      <SelectItem value="account">👤 مسائل حساب کاربری</SelectItem>
                      <SelectItem value="billing">💰 مسائل مالی</SelectItem>
                      <SelectItem value="feature">✨ درخواست ویژگی جدید</SelectItem>
                      <SelectItem value="other">📋 سایر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <Label htmlFor="priority" className="text-sm font-semibold text-foreground">اولویت</Label>
                  </div>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger data-testid="select-ticket-priority" className="h-9 border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          کم اولویت
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          متوسط
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          بالا
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          فوری
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                  <Label htmlFor="message" className="text-sm font-semibold text-foreground">پیام و توضیحات *</Label>
                </div>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="لطفاً توضیح کاملی از مشکل خود ارائه دهید..."
                  rows={4}
                  required
                  data-testid="textarea-ticket-message"
                  className="border focus:border-purple-500 resize-none transition-all duration-200"
                />
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-indigo-600" />
                  <Label htmlFor="attachments" className="text-sm font-semibold text-foreground">فایل‌های ضمیمه</Label>
                  <Badge variant="secondary" className="text-xs">اختیاری</Badge>
                </div>
                <div className="border border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg p-2 transition-colors hover:border-indigo-400 dark:hover:border-indigo-600">
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    data-testid="input-ticket-attachments"
                    className="cursor-pointer file:cursor-pointer file:rounded file:border-0 file:bg-indigo-600 file:text-white file:px-3 file:py-1 file:ml-2 hover:file:bg-indigo-700 file:text-sm"
                  />
                  <div className="mt-1 text-center">
                    <p className="text-[10px] text-muted-foreground">
                      📎 حداکثر ۵ فایل، هر کدام ۵ مگابایت
                    </p>
                  </div>
                </div>
                
                {attachments && attachments.length > 0 && (
                  <Card className="mt-3 border-green-200 bg-green-50 dark:bg-green-950/30">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-medium text-green-900 dark:text-green-300">فایل‌های انتخاب شده:</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Array.from(attachments).map((file, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-green-900/20 rounded border" data-testid={`text-attachment-${index}`}>
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                            <span className="text-sm text-green-700 dark:text-green-300 truncate">{file.name}</span>
                            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                              {Math.round(file.size / 1024)} کیلوبایت
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-muted">
                <Button
                  type="submit"
                  disabled={createTicketMutation.isPending}
                  data-testid="button-submit-ticket"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {createTicketMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-1"></div>
                      در حال ارسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 ml-1" />
                      ارسال تیکت
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  data-testid="button-reset-form"
                  className="border px-4 py-2 hover:bg-muted transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4 ml-1" />
                  پاک کردن
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
