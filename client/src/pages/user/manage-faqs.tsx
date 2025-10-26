import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  HelpCircle,
  Loader2
} from "lucide-react";
import type { Faq } from "@shared/schema";
import { insertFaqSchema } from "@shared/schema";
import { z } from "zod";

// Edit form schema
const editFaqSchema = insertFaqSchema.extend({
  question: z.string().min(1, "سوال نمی‌تواند خالی باشد").max(500, "سوال نمی‌تواند بیش از ۵۰۰ کاراکتر باشد"),
  answer: z.string().min(1, "پاسخ نمی‌تواند خالی باشد").max(2000, "پاسخ نمی‌تواند بیش از ۲۰۰۰ کاراکتر باشد"),
});

type EditFaqFormData = z.infer<typeof editFaqSchema>;

export default function ManageFaqsPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: faqs = [], isLoading } = useQuery<Faq[]>({
    queryKey: ["/api/faqs"],
    queryFn: async () => {
      const response = await fetch("/api/faqs?includeInactive=true");
      if (!response.ok) throw new Error("خطا در دریافت سوالات متداول");
      return response.json();
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/faqs/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "سوال با موفقیت حذف شد" });
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
    },
    onError: () => {
      toast({ title: "خطا در حذف سوال", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiRequest("PUT", `/api/faqs/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
    },
    onError: () => {
      toast({ title: "خطا در تغییر وضعیت", variant: "destructive" });
    },
  });

  // Edit FAQ form
  const editForm = useForm<EditFaqFormData>({
    resolver: zodResolver(editFaqSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
  });

  // Update FAQ mutation
  const updateFaqMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditFaqFormData }) => {
      const response = await apiRequest("PUT", `/api/faqs/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "موفقیت",
        description: "سوال با موفقیت به‌روزرسانی شد"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      setIsEditDialogOpen(false);
      setEditingFaq(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "خطا",
        description: error.message || "خطا در به‌روزرسانی سوال",
        variant: "destructive"
      });
    },
  });

  const handleEditClick = (faq: Faq) => {
    setEditingFaq(faq);
    editForm.reset({
      question: faq.question,
      answer: faq.answer,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (data: EditFaqFormData) => {
    if (editingFaq) {
      updateFaqMutation.mutate({ id: editingFaq.id, data });
    }
  };

  const filteredFaqs = faqs
    .filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.order - b.order);

  if (isLoading) {
    return (
      <DashboardLayout title="مدیریت سوالات متداول">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="مدیریت سوالات متداول">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold">سوالات متداول</h1>
            <Badge variant="secondary" className="text-xs">
              {filteredFaqs.length}
            </Badge>
          </div>
          <Button size="sm" onClick={() => setLocation("/add-faq")} data-testid="button-add-new-faq">
            <Plus className="w-4 h-4 ml-1" />
            افزودن
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو در سوالات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-9 h-9"
            data-testid="input-search-faqs"
          />
        </div>

        {/* FAQs Table */}
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium mb-1">
              {searchTerm ? "سوالی یافت نشد" : "هنوز سوالی اضافه نشده"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm ? "کلیدواژه دیگری امتحان کنید" : "اولین سوال متداول را اضافه کنید"}
            </p>
            {!searchTerm && (
              <Button size="sm" onClick={() => setLocation("/add-faq")}>
                <Plus className="w-4 h-4 ml-1" />
                افزودن سوال
              </Button>
            )}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام سوال</TableHead>
                  <TableHead className="text-right">توضیحات</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaqs.map((faq) => (
                  <TableRow key={faq.id} data-testid={`row-faq-${faq.id}`}>
                    {/* نام سوال */}
                    <TableCell className="font-medium" data-testid={`text-question-${faq.id}`}>
                      {faq.question}
                    </TableCell>
                    
                    {/* توضیحات (۱۰ حرف اول) */}
                    <TableCell className="text-muted-foreground" data-testid={`text-description-${faq.id}`}>
                      {faq.answer.length > 10 ? `${faq.answer.substring(0, 10)}...` : faq.answer}
                    </TableCell>
                    
                    {/* وضعیت */}
                    <TableCell data-testid={`cell-status-${faq.id}`}>
                      <div className="flex items-center gap-2" dir="ltr">
                        <Switch
                          id={`status-${faq.id}`}
                          checked={faq.isActive}
                          onCheckedChange={(checked) => {
                            toggleActiveMutation.mutate({ id: faq.id, isActive: checked });
                          }}
                          disabled={toggleActiveMutation.isPending}
                          data-testid={`switch-active-${faq.id}`}
                          className="data-[state=checked]:bg-primary [&>span]:data-[state=checked]:translate-x-5 [&>span]:data-[state=unchecked]:translate-x-0"
                        />
                        <span className="text-xs text-muted-foreground" dir="rtl">
                          {faq.isActive ? "فعال" : "غیرفعال"}
                        </span>
                      </div>
                    </TableCell>
                    
                    {/* عملیات */}
                    <TableCell data-testid={`cell-actions-${faq.id}`}>
                      <div className="flex items-center gap-2">
                        {/* دکمه ویرایش */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(faq)}
                          data-testid={`button-edit-${faq.id}`}
                        >
                          <Edit className="w-4 h-4 ml-1" />
                          ویرایش
                        </Button>
                        
                        {/* دکمه حذف */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              data-testid={`button-delete-${faq.id}`}
                            >
                              <Trash2 className="w-4 h-4 ml-1" />
                              حذف
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف سوال</AlertDialogTitle>
                              <AlertDialogDescription>
                                این سوال به طور کامل حذف خواهد شد. آیا مطمئن هستید؟
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>انصراف</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteFaqMutation.mutate(faq.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Edit FAQ Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditingFaq(null);
          editForm.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>ویرایش سوال متداول</DialogTitle>
            <DialogDescription>
              نام سوال و توضیحات آن را ویرایش کنید
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-6">
              {/* Question Field */}
              <FormField
                control={editForm.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام سوال</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="سوال متداول خود را وارد کنید..."
                        {...field}
                        data-testid="input-edit-question"
                      />
                    </FormControl>
                    <FormDescription>
                      سوال باید واضح و قابل فهم باشد (حداکثر ۵۰۰ کاراکتر)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Answer Field */}
              <FormField
                control={editForm.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>توضیحات</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="پاسخ کامل سوال را وارد کنید..."
                        className="min-h-32"
                        {...field}
                        data-testid="textarea-edit-answer"
                      />
                    </FormControl>
                    <FormDescription>
                      پاسخ جامع و مفصل ارائه دهید (حداکثر ۲۰۰۰ کاراکتر)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingFaq(null);
                    editForm.reset();
                  }}
                  data-testid="button-cancel-edit"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  disabled={updateFaqMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateFaqMutation.isPending ? "در حال به‌روزرسانی..." : "به‌روزرسانی"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}