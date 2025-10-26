import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RotateCcw, CloudUpload, Package, DollarSign, Hash, FileText, FolderTree } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/auth";
import type { Category } from "@shared/schema";

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    quantity: "",
    priceBeforeDiscount: "",
    priceAfterDiscount: "",
  });
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories for selection
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const formDataToSend = new FormData();
      formDataToSend.append("name", data.name);
      formDataToSend.append("description", data.description);
      if (data.categoryId) formDataToSend.append("categoryId", data.categoryId);
      formDataToSend.append("quantity", data.quantity);
      formDataToSend.append("priceBeforeDiscount", data.priceBeforeDiscount);
      formDataToSend.append("priceAfterDiscount", data.priceAfterDiscount);

      if (productImage) {
        formDataToSend.append("productImage", productImage);
      }

      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {};
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization;
      }
      
      const response = await fetch("/api/products", {
        method: "POST",
        headers,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "خطا در ایجاد محصول" }));
        throw new Error(errorData.message || "خطا در ایجاد محصول");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      handleReset();
      toast({
        title: "موفقیت",
        description: "محصول با موفقیت اضافه شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message || "خطا در ایجاد محصول",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.quantity || !formData.priceBeforeDiscount) {
      toast({
        title: "خطا",
        description: "لطفاً تمام فیلدهای الزامی را پر کنید",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(formData.quantity);
    const priceBeforeDiscount = parseFloat(formData.priceBeforeDiscount);
    const priceAfterDiscount = formData.priceAfterDiscount ? parseFloat(formData.priceAfterDiscount) : 0;

    if (quantity < 0) {
      toast({
        title: "خطا",
        description: "تعداد نمی‌تواند منفی باشد",
        variant: "destructive",
      });
      return;
    }

    if (priceBeforeDiscount <= 0) {
      toast({
        title: "خطا",
        description: "قیمت باید بیشتر از صفر باشد",
        variant: "destructive",
      });
      return;
    }

    if (priceAfterDiscount && priceAfterDiscount >= priceBeforeDiscount) {
      toast({
        title: "خطا",
        description: "قیمت تخفیف‌دار باید کمتر از قیمت اصلی باشد",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate(formData);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: "",
      quantity: "",
      priceBeforeDiscount: "",
      priceAfterDiscount: "",
    });
    setProductImage(null);
    setImagePreview("");
    // Reset file input
    const fileInput = document.getElementById("productImage") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "خطا",
        description: "لطفاً یک فایل تصویری انتخاب کنید",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: "خطا",
        description: "حجم تصویر نباید بیش از ۵ مگابایت باشد",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    setProductImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <DashboardLayout title="افزودن محصول">
      <div className="max-w-4xl mx-auto space-y-4" data-testid="page-add-product">
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-add-product">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Image Upload - Left */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CloudUpload className="h-4 w-4" />
                  تصویر محصول
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-4 text-center transition-colors hover:border-primary/50 cursor-pointer"
                  onClick={() => document.getElementById("productImage")?.click()}
                >
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img
                        src={imagePreview}
                        alt="پیش‌نمایش"
                        className="w-full h-32 object-cover rounded-md"
                        data-testid="img-product-preview"
                      />
                      <p className="text-xs text-muted-foreground">کلیک برای تغییر</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <CloudUpload className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-xs text-muted-foreground">انتخاب تصویر</p>
                      <p className="text-xs text-muted-foreground">حداکثر 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="productImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  data-testid="input-product-image"
                />
              </CardContent>
            </Card>

            {/* Main Form - Right */}
            <div className="lg:col-span-2 space-y-4">
              {/* Basic Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    اطلاعات اصلی
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="productName" className="text-xs">نام محصول *</Label>
                    <Input
                      id="productName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="نام محصول..."
                      className="h-8 text-sm"
                      required
                      data-testid="input-product-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="categorySelect" className="text-xs flex items-center gap-1">
                      <FolderTree className="h-3 w-3" />
                      دسته‌بندی
                    </Label>
                    <Select
                      value={formData.categoryId || "none"}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value === "none" ? "" : value })}
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger className="h-8 text-sm" data-testid="select-category">
                        <SelectValue placeholder={categoriesLoading ? "در حال بارگیری..." : "انتخاب دسته‌بندی"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" data-testid="select-category-none">بدون دسته‌بندی</SelectItem>
                        {categories.map((category) => (
                          <SelectItem 
                            key={category.id} 
                            value={category.id}
                            data-testid={`select-category-${category.id}`}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="quantity" className="text-xs flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        تعداد *
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="تعداد"
                        className="h-8 text-sm"
                        min="0"
                        required
                        data-testid="input-product-quantity"
                      />
                    </div>

                    <div>
                      <Label htmlFor="priceBeforeDiscount" className="text-xs flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        قیمت اصلی *
                      </Label>
                      <Input
                        id="priceBeforeDiscount"
                        type="number"
                        value={formData.priceBeforeDiscount}
                        onChange={(e) => setFormData({ ...formData, priceBeforeDiscount: e.target.value })}
                        placeholder="قیمت (تومان)"
                        className="h-8 text-sm"
                        min="0"
                        step="0.01"
                        required
                        data-testid="input-price-before-discount"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="priceAfterDiscount" className="text-xs">قیمت تخفیف‌دار (اختیاری)</Label>
                    <Input
                      id="priceAfterDiscount"
                      type="number"
                      value={formData.priceAfterDiscount}
                      onChange={(e) => setFormData({ ...formData, priceAfterDiscount: e.target.value })}
                      placeholder="قیمت با تخفیف (تومان)"
                      className="h-8 text-sm"
                      min="0"
                      step="0.01"
                      data-testid="input-price-after-discount"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-xs">توضیحات</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="توضیحات محصول..."
                      className="text-sm resize-none"
                      rows={3}
                      data-testid="textarea-product-description"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={createProductMutation.isPending}
                  className="flex-1 h-9"
                  data-testid="button-add-product"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  {createProductMutation.isPending ? "در حال افزودن..." : "افزودن محصول"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="h-9"
                  data-testid="button-reset-product-form"
                >
                  <RotateCcw className="w-4 h-4 ml-2" />
                  پاک کردن
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}