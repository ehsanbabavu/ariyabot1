import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MapPin, Plus, Edit2, Trash2, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAddressSchema } from "@shared/schema";
import type { Address } from "@shared/schema";
import { z } from "zod";

const addressFormSchema = insertAddressSchema.extend({
  recipientPhone: z.string().min(11, "شماره تلفن باید حداقل 11 رقم باشد").optional(),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

export default function Addresses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Get user's addresses
  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
    enabled: !!user,
  });

  // Form configuration
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      title: "",
      fullAddress: "",
      recipientPhone: "",
      postalCode: "",
      latitude: "",
      longitude: "",
      isDefault: false,
    },
  });

  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: async (data: AddressFormValues) => {
      const response = await apiRequest("POST", "/api/addresses", data);
      if (!response.ok) {
        throw new Error("خطا در افزودن آدرس");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: "موفقیت",
        description: "آدرس جدید اضافه شد",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AddressFormValues> }) => {
      const response = await apiRequest("PUT", `/api/addresses/${id}`, data);
      if (!response.ok) {
        throw new Error("خطا در بروزرسانی آدرس");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: "موفقیت",
        description: "آدرس بروزرسانی شد",
      });
      setIsDialogOpen(false);
      setEditingAddress(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/addresses/${id}`);
      if (!response.ok) {
        throw new Error("خطا در حذف آدرس");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: "موفقیت",
        description: "آدرس حذف شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Set default address mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PUT", `/api/addresses/${id}/default`);
      if (!response.ok) {
        throw new Error("خطا در تنظیم آدرس پیش‌فرض");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: "موفقیت",
        description: "آدرس پیش‌فرض تنظیم شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: AddressFormValues) => {
    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, data });
    } else {
      addAddressMutation.mutate(data);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    form.reset({
      title: address.title,
      fullAddress: address.fullAddress,
      recipientPhone: "", // This field doesn't exist in DB, keep empty
      postalCode: address.postalCode || "",
      latitude: address.latitude || "",
      longitude: address.longitude || "",
      isDefault: address.isDefault,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("آیا از حذف این آدرس اطمینان دارید؟")) {
      deleteAddressMutation.mutate(id);
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id);
  };

  const openAddDialog = () => {
    setEditingAddress(null);
    form.reset();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="آدرس‌های من">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">در حال بارگذاری...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="آدرس‌های من">
      <div className="space-y-6" data-testid="addresses-content">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">آدرس‌های من</h1>
              <p className="text-muted-foreground">
                {addresses.length} آدرس ثبت شده
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} data-testid="button-add-address">
                <Plus className="h-4 w-4 ml-2" />
                افزودن آدرس جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? "ویرایش آدرس" : "افزودن آدرس جدید"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان آدرس</FormLabel>
                        <FormControl>
                          <Input placeholder="مثلاً خانه، محل کار" {...field} data-testid="input-address-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fullAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>آدرس کامل</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="آدرس کامل شامل استان، شهر، خیابان و پلاک"
                            className="min-h-[80px]"
                            {...field}
                            data-testid="textarea-full-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>کد پستی</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} value={field.value ?? ""} data-testid="input-postal-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عرض جغرافیایی (اختیاری)</FormLabel>
                          <FormControl>
                            <Input placeholder="35.6892" {...field} value={field.value ?? ""} data-testid="input-latitude" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>طول جغرافیایی (اختیاری)</FormLabel>
                          <FormControl>
                            <Input placeholder="51.3890" {...field} value={field.value ?? ""} data-testid="input-longitude" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>


                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>آدرس پیش‌فرض</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            این آدرس به عنوان آدرس پیش‌فرض در سفارشات استفاده شود
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-is-default"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      لغو
                    </Button>
                    <Button
                      type="submit"
                      disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                      data-testid="button-submit-address"
                    >
                      {editingAddress ? "بروزرسانی" : "افزودن"} آدرس
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">هنوز آدرسی ثبت نکرده‌اید</h3>
              <p className="text-muted-foreground mb-4">
                برای سفارش محصولات، ابتدا آدرس خود را ثبت کنید
              </p>
              <Button onClick={openAddDialog} data-testid="button-add-first-address">
                <Plus className="h-4 w-4 ml-2" />
                افزودن اولین آدرس
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <Card key={address.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {address.title}
                      {address.isDefault && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 ml-1" />
                          پیش‌فرض
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(address)}
                        data-testid={`button-edit-${address.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-${address.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p data-testid={`text-address-${address.id}`} className="whitespace-pre-line">
                      {address.fullAddress}
                    </p>
                    {address.postalCode && (
                      <p className="font-mono text-xs mt-2 bg-muted px-2 py-1 rounded">
                        کد پستی: {address.postalCode}
                      </p>
                    )}
                    {(address.latitude && address.longitude) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        موقعیت: {address.latitude}, {address.longitude}
                      </p>
                    )}
                  </div>

                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={setDefaultMutation.isPending}
                      className="w-full"
                      data-testid={`button-set-default-${address.id}`}
                    >
                      <Star className="h-4 w-4 ml-2" />
                      تنظیم به عنوان پیش‌فرض
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}