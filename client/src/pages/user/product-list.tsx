import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, CloudUpload, Package, DollarSign, Hash, FileText, FolderTree, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createAuthenticatedRequest, getAuthHeaders } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import type { Product, Category } from "@shared/schema";

export default function ProductList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categorySortOrder, setCategorySortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    quantity: "",
    priceBeforeDiscount: "",
    priceAfterDiscount: "",
  });
  const [editProductImage, setEditProductImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isLevel2User = user?.role === "user_level_2";

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/products");
      if (!response.ok) throw new Error("خطا در دریافت محصولات");
      return response.json();
    },
  });

  // Fetch categories to display category names
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const response = await createAuthenticatedRequest(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("خطا در بروزرسانی محصول");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "موفقیت",
        description: "محصول با موفقیت بروزرسانی شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در بروزرسانی محصول",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await createAuthenticatedRequest(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("خطا در حذف محصول");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "موفقیت",
        description: "محصول با موفقیت حذف شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در حذف محصول",
        variant: "destructive",
      });
    },
  });

  const editProductMutation = useMutation({
    mutationFn: async (data: typeof editFormData & { id: string }) => {
      const formDataToSend = new FormData();
      formDataToSend.append("name", data.name);
      formDataToSend.append("description", data.description);
      if (data.categoryId) formDataToSend.append("categoryId", data.categoryId);
      formDataToSend.append("quantity", data.quantity);
      formDataToSend.append("priceBeforeDiscount", data.priceBeforeDiscount);
      formDataToSend.append("priceAfterDiscount", data.priceAfterDiscount);

      if (editProductImage) {
        formDataToSend.append("productImage", editProductImage);
      }

      const authHeaders = getAuthHeaders();
      const headers: Record<string, string> = {};
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization;
      }
      
      const response = await fetch(`/api/products/${data.id}`, {
        method: "PUT",
        headers,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "خطا در ویرایش محصول" }));
        throw new Error(errorData.message || "خطا در ویرایش محصول");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      handleEditModalClose();
      toast({
        title: "موفقیت",
        description: "محصول با موفقیت ویرایش شد",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا",
        description: error.message || "خطا در ویرایش محصول",
        variant: "destructive",
      });
    },
  });

  // Add to cart mutation for user_level_2
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      const res = await createAuthenticatedRequest("/api/cart/add", {
        method: "POST",
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "خطا در اضافه کردن به سبد خرید" }));
        throw new Error(errorData.message || "خطا در اضافه کردن به سبد خرید");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "موفقیت",
        description: "محصول به سبد خرید اضافه شد",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message || "خطا در اضافه کردن به سبد خرید",
        variant: "destructive",
      });
    },
  });

  // Get category name by categoryId
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "بدون دسته‌بندی";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "نامشخص";
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && product.isActive) ||
                         (statusFilter === "inactive" && !product.isActive);
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Apply category sorting if enabled
    if (categorySortOrder !== 'none') {
      const categoryNameA = getCategoryName(a.categoryId);
      const categoryNameB = getCategoryName(b.categoryId);
      
      const comparison = categoryNameA.localeCompare(categoryNameB, 'fa');
      return categorySortOrder === 'asc' ? comparison : -comparison;
    }
    return 0; // No sorting
  });

  const handleToggleActive = (product: Product) => {
    updateProductMutation.mutate({
      id: product.id,
      data: { isActive: !product.isActive },
    });
  };

  const handleDelete = (productId: string) => {
    if (confirm("آیا از حذف این محصول اطمینان دارید؟")) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description || "",
      categoryId: product.categoryId || "",
      quantity: product.quantity.toString(),
      priceBeforeDiscount: product.priceBeforeDiscount,
      priceAfterDiscount: product.priceAfterDiscount || "",
    });
    setEditImagePreview(product.image || "");
    setEditProductImage(null);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setEditFormData({
      name: "",
      description: "",
      categoryId: "",
      quantity: "",
      priceBeforeDiscount: "",
      priceAfterDiscount: "",
    });
    setEditProductImage(null);
    setEditImagePreview("");
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct || !editFormData.name.trim() || !editFormData.quantity || !editFormData.priceBeforeDiscount) {
      toast({
        title: "خطا",
        description: "لطفاً تمام فیلدهای الزامی را پر کنید",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(editFormData.quantity);
    const priceBeforeDiscount = parseFloat(editFormData.priceBeforeDiscount);
    const priceAfterDiscount = editFormData.priceAfterDiscount ? parseFloat(editFormData.priceAfterDiscount) : 0;

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

    editProductMutation.mutate({ ...editFormData, id: editingProduct.id });
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setEditProductImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const formatPrice = (price: string | null) => {
    if (!price) return "-";
    return parseFloat(price).toLocaleString("fa-IR") + " تومان";
  };

  // Handle category sort
  const handleCategorySortToggle = () => {
    if (categorySortOrder === 'none') {
      setCategorySortOrder('asc');
    } else if (categorySortOrder === 'asc') {
      setCategorySortOrder('desc');
    } else {
      setCategorySortOrder('none');
    }
  };

  // Get sort icon for category column
  const getCategorySortIcon = () => {
    if (categorySortOrder === 'asc') return <ChevronUp className="h-4 w-4" />;
    if (categorySortOrder === 'desc') return <ChevronDown className="h-4 w-4" />;
    return <ChevronsUpDown className="h-4 w-4" />;
  };

  return (
    <DashboardLayout title="لیست محصولات">
      <div className="space-y-6" data-testid="page-product-list">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {isLevel2User ? "فروشگاه محصولات" : "لیست محصولات"}
            </h2>
            <p className="text-muted-foreground">
              {isLevel2User ? "مشاهده و خرید محصولات موجود" : "مدیریت محصولات اضافه شده توسط شما"}
            </p>
          </div>
          {!isLevel2User && (
            <Link href="/add-product">
              <Button data-testid="button-add-product">
                <Plus className="w-4 h-4 ml-2" />
                افزودن محصول
              </Button>
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="جستجو در محصولات..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-products"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <SelectValue placeholder="همه محصولات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه محصولات</SelectItem>
                <SelectItem value="active">فعال</SelectItem>
                <SelectItem value="inactive">غیرفعال</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" data-testid="button-search">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">در حال بارگذاری...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="text-right">تصویر</TableHead>
                    <TableHead className="text-right">نام محصول</TableHead>
                    <TableHead className="text-right">
                      <button 
                        onClick={handleCategorySortToggle}
                        className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
                        data-testid="button-sort-category"
                      >
                        دسته‌بندی
                        {getCategorySortIcon()}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">تعداد</TableHead>
                    <TableHead className="text-right">قیمت اصلی</TableHead>
                    <TableHead className="text-right">قیمت تخفیف‌دار</TableHead>
                    {!isLevel2User && <TableHead className="text-right">وضعیت</TableHead>}
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {search || statusFilter !== "all" ? "محصولی یافت نشد" : "هیچ محصولی اضافه نکرده‌اید"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/50 transition-colors" data-testid={`row-product-${product.id}`}>
                        <TableCell>
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                              data-testid={`img-product-${product.id}`}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <span className="text-muted-foreground text-xs">بدون تصویر</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-foreground" data-testid={`text-product-name-${product.id}`}>
                            {product.name}
                          </p>
                        </TableCell>
                        <TableCell className="text-muted-foreground" data-testid={`text-product-category-${product.id}`}>
                          {getCategoryName(product.categoryId)}
                        </TableCell>
                        <TableCell className="text-muted-foreground" data-testid={`text-product-quantity-${product.id}`}>
                          {product.quantity}
                        </TableCell>
                        <TableCell className="text-muted-foreground" data-testid={`text-product-price-before-${product.id}`}>
                          {formatPrice(product.priceBeforeDiscount)}
                        </TableCell>
                        <TableCell className="font-medium text-foreground" data-testid={`text-product-price-after-${product.id}`}>
                          {formatPrice(product.priceAfterDiscount)}
                        </TableCell>
                        {!isLevel2User && (
                          <TableCell>
                            <div className="flex items-center gap-2" dir="ltr">
                              <Switch
                                checked={product.isActive}
                                onCheckedChange={() => handleToggleActive(product)}
                                data-testid={`switch-product-active-${product.id}`}
                                className="data-[state=checked]:bg-primary [&>span]:data-[state=checked]:translate-x-5 [&>span]:data-[state=unchecked]:translate-x-0"
                              />
                              <span className={`text-sm ${product.isActive ? 'text-foreground' : 'text-muted-foreground'}`} dir="rtl">
                                {product.isActive ? 'فعال' : 'غیرفعال'}
                              </span>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            {isLevel2User ? (
                              // Add to cart button for user_level_2
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => addToCartMutation.mutate({ productId: product.id, quantity: 1 })}
                                disabled={addToCartMutation.isPending || !product.isActive || product.quantity <= 0}
                                className="text-white"
                                data-testid={`button-add-to-cart-${product.id}`}
                              >
                                <ShoppingCart className="h-4 w-4 ml-1" />
                                {addToCartMutation.isPending ? "در حال اضافه..." : "افزودن به سبد"}
                              </Button>
                            ) : (
                              // Edit and delete buttons for admin and user_level_1
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditProduct(product)}
                                  className="text-primary hover:text-primary/80"
                                  data-testid={`button-edit-product-${product.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(product.id)}
                                  className="text-destructive hover:text-destructive/80"
                                  data-testid={`button-delete-product-${product.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Edit Product Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={(open) => { if (!open) handleEditModalClose(); else setIsEditModalOpen(open); }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-product">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                ویرایش محصول
              </DialogTitle>
            </DialogHeader>
            
            {editingProduct && (
              <form onSubmit={handleEditSubmit} className="space-y-4" data-testid="form-edit-product">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Image Upload - Left */}
                  <div className="lg:col-span-1">
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1">
                        <CloudUpload className="h-3 w-3" />
                        تصویر محصول
                      </Label>
                      <div 
                        className="border-2 border-dashed border-border rounded-lg p-4 text-center transition-colors hover:border-primary/50 cursor-pointer"
                        onClick={() => document.getElementById("editProductImage")?.click()}
                      >
                        {editImagePreview ? (
                          <div className="space-y-2">
                            <img
                              src={editImagePreview}
                              alt="پیش‌نمایش"
                              className="w-full h-32 object-cover rounded-md"
                              data-testid="img-edit-product-preview"
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
                        id="editProductImage"
                        accept="image/*"
                        onChange={handleEditImageChange}
                        className="hidden"
                        data-testid="input-edit-product-image"
                      />
                    </div>
                  </div>

                  {/* Main Form - Right */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label htmlFor="editProductName" className="text-xs">نام محصول *</Label>
                        <Input
                          id="editProductName"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          placeholder="نام محصول..."
                          className="h-8 text-sm"
                          required
                          data-testid="input-edit-product-name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="editCategorySelect" className="text-xs flex items-center gap-1">
                          <FolderTree className="h-3 w-3" />
                          دسته‌بندی
                        </Label>
                        <Select
                          value={editFormData.categoryId || "none"}
                          onValueChange={(value) => setEditFormData({ ...editFormData, categoryId: value === "none" ? "" : value })}
                        >
                          <SelectTrigger className="h-8 text-sm" data-testid="select-edit-category">
                            <SelectValue placeholder="انتخاب دسته‌بندی" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">بدون دسته‌بندی</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="editQuantity" className="text-xs flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            تعداد *
                          </Label>
                          <Input
                            id="editQuantity"
                            type="number"
                            value={editFormData.quantity}
                            onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                            placeholder="تعداد"
                            className="h-8 text-sm"
                            min="0"
                            required
                            data-testid="input-edit-product-quantity"
                          />
                        </div>

                        <div>
                          <Label htmlFor="editPriceBeforeDiscount" className="text-xs flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            قیمت اصلی *
                          </Label>
                          <Input
                            id="editPriceBeforeDiscount"
                            type="number"
                            value={editFormData.priceBeforeDiscount}
                            onChange={(e) => setEditFormData({ ...editFormData, priceBeforeDiscount: e.target.value })}
                            placeholder="قیمت (تومان)"
                            className="h-8 text-sm"
                            min="0"
                            step="0.01"
                            required
                            data-testid="input-edit-price-before-discount"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="editPriceAfterDiscount" className="text-xs">قیمت تخفیف‌دار (اختیاری)</Label>
                        <Input
                          id="editPriceAfterDiscount"
                          type="number"
                          value={editFormData.priceAfterDiscount}
                          onChange={(e) => setEditFormData({ ...editFormData, priceAfterDiscount: e.target.value })}
                          placeholder="قیمت با تخفیف (تومان)"
                          className="h-8 text-sm"
                          min="0"
                          step="0.01"
                          data-testid="input-edit-price-after-discount"
                        />
                      </div>

                      <div>
                        <Label htmlFor="editDescription" className="text-xs">توضیحات</Label>
                        <Textarea
                          id="editDescription"
                          value={editFormData.description}
                          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                          placeholder="توضیحات محصول..."
                          className="text-sm resize-none"
                          rows={3}
                          data-testid="textarea-edit-product-description"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={editProductMutation.isPending}
                        className="flex-1 h-9"
                        data-testid="button-save-edit-product"
                      >
                        <Package className="w-4 h-4 ml-2" />
                        {editProductMutation.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleEditModalClose}
                        disabled={editProductMutation.isPending}
                        className="h-9"
                        data-testid="button-cancel-edit-product"
                      >
                        لغو
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
