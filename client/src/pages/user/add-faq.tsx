import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertFaqSchema } from "@shared/schema";
import { Plus, HelpCircle, ArrowLeft } from "lucide-react";
import { z } from "zod";

// Form validation schema extending the insert schema
const createFaqSchema = insertFaqSchema.extend({
  question: z.string().min(1, "سوال نمی‌تواند خالی باشد").max(500, "سوال نمی‌تواند بیش از ۵۰۰ کاراکتر باشد"),
  answer: z.string().min(1, "پاسخ نمی‌تواند خالی باشد").max(2000, "پاسخ نمی‌تواند بیش از ۲۰۰۰ کاراکتر باشد"),
  order: z.number().min(0, "ترتیب نمی‌تواند منفی باشد").optional(),
});

type CreateFaqFormData = z.infer<typeof createFaqSchema>;

export default function AddFaqPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateFaqFormData>({
    resolver: zodResolver(createFaqSchema),
    defaultValues: {
      question: "",
      answer: "",
      isActive: true,
      order: 0,
    },
  });

  const createFaqMutation = useMutation({
    mutationFn: async (data: CreateFaqFormData) => {
      const response = await apiRequest("POST", "/api/faqs", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "موفقیت",
        description: "سوال متداول با موفقیت ایجاد شد",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      setLocation("/manage-faqs");
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message || "خطا در ایجاد سوال متداول",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateFaqFormData) => {
    createFaqMutation.mutate(data);
  };

  return (
    <DashboardLayout title="افزودن سوال متداول">
      <div className="container mx-auto py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setLocation("/manage-faqs")}
            data-testid="button-back-to-manage-faqs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">افزودن سوال متداول جدید</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              اطلاعات سوال جدید
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Question Field */}
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سوال</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="سوال متداول خود را وارد کنید..."
                          {...field}
                          data-testid="input-faq-question"
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
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>پاسخ</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="پاسخ کامل سوال را وارد کنید..."
                          className="min-h-32"
                          {...field}
                          data-testid="textarea-faq-answer"
                        />
                      </FormControl>
                      <FormDescription>
                        پاسخ جامع و مفصل ارائه دهید (حداکثر ۲۰۰۰ کاراکتر)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Order Field */}
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ترتیب نمایش</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-faq-order"
                        />
                      </FormControl>
                      <FormDescription>
                        عدد کمتر در ابتدای لیست نمایش داده می‌شود
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Active Status */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base">وضعیت</FormLabel>
                      <FormDescription>
                        آیا این سوال در صفحه عمومی نمایش داده شود؟
                      </FormDescription>
                      <FormControl>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">نمایش در صفحه عمومی</span>
                          <div className="flex items-center gap-2" dir="ltr">
                            <Switch
                              id="faq-status"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-faq-active"
                              className="data-[state=checked]:bg-primary [&>span]:data-[state=checked]:translate-x-5 [&>span]:data-[state=unchecked]:translate-x-0"
                            />
                            <span className="text-sm text-muted-foreground" dir="rtl">
                              {field.value ? "فعال" : "غیرفعال"}
                            </span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={createFaqMutation.isPending}
                    data-testid="button-create-faq"
                  >
                    {createFaqMutation.isPending ? "در حال ایجاد..." : "ایجاد سوال متداول"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/manage-faqs")}
                    data-testid="button-cancel-create-faq"
                  >
                    انصراف
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}