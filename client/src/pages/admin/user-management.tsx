import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAuthenticatedRequest } from "@/lib/auth";
import type { User as UserType } from "@shared/schema";

// Extended user type to include subscription information
interface UserWithSubscription extends UserType {
  subscription?: {
    name: string;
    remainingDays: number;
    status: string;
    isTrialPeriod: boolean;
  } | null;
}

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState<UserWithSubscription | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<UserWithSubscription[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/users");
      if (!response.ok) throw new Error("خطا در دریافت کاربران");
      return response.json();
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: Partial<UserType>) => {
      const response = await createAuthenticatedRequest("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("خطا در ایجاد کاربر");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "موفقیت",
        description: "کاربر با موفقیت ایجاد شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در ایجاد کاربر",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserType> }) => {
      const response = await createAuthenticatedRequest(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("خطا در بروزرسانی کاربر");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      toast({
        title: "موفقیت",
        description: "کاربر با موفقیت بروزرسانی شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در بروزرسانی کاربر",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await createAuthenticatedRequest(`/api/users/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("خطا در حذف کاربر");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "موفقیت",
        description: "کاربر با موفقیت حذف شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در حذف کاربر",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(search.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase()) ||
                         (user.username && user.username.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default">مدیر</Badge>;
      case "user_level_1":
        return <Badge variant="secondary">کاربر سطح ۱</Badge>;
      case "user_level_2":
        return <Badge variant="outline">کاربر سطح ۲</Badge>;
      default:
        return <Badge variant="secondary">کاربر</Badge>;
    }
  };

  const handleEditUser = (user: UserWithSubscription) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      username: formData.get("username") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as string,
    };

    createUserMutation.mutate(data);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      role: formData.get("role") as string,
    };

    updateUserMutation.mutate({ id: editingUser.id, data });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("آیا از حذف این کاربر اطمینان دارید؟")) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <DashboardLayout title="مدیریت کاربران">
      <div className="space-y-6" data-testid="page-user-management">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">مدیریت کاربران</h2>
            <p className="text-muted-foreground">مشاهده و مدیریت تمام کاربران سیستم</p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            data-testid="button-create-user"
          >
            <Plus className="h-4 w-4 ml-2" />
            اضافه کردن کاربر جدید
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="جستجو در کاربران..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-users"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48" data-testid="select-role-filter">
                <SelectValue placeholder="همه نقش‌ها" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه نقش‌ها</SelectItem>
                <SelectItem value="admin">مدیر</SelectItem>
                <SelectItem value="user_level_1">کاربر سطح ۱</SelectItem>
                <SelectItem value="user_level_2">کاربر سطح ۲</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" data-testid="button-search">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">در حال بارگذاری...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="text-right">نام کاربری</TableHead>
                    <TableHead className="text-right">نام</TableHead>
                    <TableHead className="text-right">ایمیل</TableHead>
                    <TableHead className="text-right">شماره تلفن</TableHead>
                    <TableHead className="text-right">نوع اشتراک</TableHead>
                    <TableHead className="text-right">روزهای باقیمانده</TableHead>
                    <TableHead className="text-right">تاریخ عضویت</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors" data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium" data-testid={`text-user-username-${user.id}`}>
                        {user.username || '-'}
                      </TableCell>
                      <TableCell className="font-medium" data-testid={`text-user-name-${user.id}`}>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground" data-testid={`text-user-email-${user.id}`}>
                        {user.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground" data-testid={`text-user-phone-${user.id}`}>
                        {user.phone}
                      </TableCell>
                      <TableCell className="text-muted-foreground" data-testid={`text-user-subscription-${user.id}`}>
                        {user.subscription ? (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <span>{user.subscription.name}</span>
                            {user.subscription.isTrialPeriod && (
                              <Badge variant="secondary" className="text-xs">آزمایشی</Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">بدون اشتراک</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground" data-testid={`text-user-remaining-days-${user.id}`}>
                        {user.subscription ? (
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <span className={user.subscription.remainingDays <= 3 ? "text-destructive font-medium" : user.subscription.remainingDays <= 7 ? "text-orange-500 font-medium" : ""}>
                              {user.subscription.remainingDays}
                            </span>
                            <span className="text-xs text-muted-foreground">روز</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground" data-testid={`text-user-created-${user.id}`}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            data-testid={`button-edit-user-${user.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive hover:text-destructive/80"
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent data-testid="dialog-create-user">
            <DialogHeader>
              <DialogTitle>ایجاد کاربر جدید</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">نام</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    data-testid="input-create-firstName"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">نام خانوادگی</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    data-testid="input-create-lastName"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="username">نام کاربری</Label>
                <Input
                  id="username"
                  name="username"
                  required
                  data-testid="input-create-username"
                />
              </div>
              <div>
                <Label htmlFor="email">ایمیل</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  data-testid="input-create-email"
                />
              </div>
              <div>
                <Label htmlFor="phone">شماره تلفن</Label>
                <Input
                  id="phone"
                  name="phone"
                  required
                  data-testid="input-create-phone"
                />
              </div>
              <div>
                <Label htmlFor="password">رمز عبور</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  data-testid="input-create-password"
                />
              </div>
              <div>
                <Label htmlFor="role">نقش</Label>
                <Select name="role" defaultValue="user_level_1">
                  <SelectTrigger data-testid="select-create-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مدیر</SelectItem>
                    <SelectItem value="user_level_1">کاربر سطح ۱</SelectItem>
                    <SelectItem value="user_level_2">کاربر سطح ۲</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel-create"
                >
                  لغو
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  data-testid="button-create-user-submit"
                >
                  {createUserMutation.isPending ? "در حال ایجاد..." : "ایجاد کاربر"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent data-testid="dialog-edit-user">
            <DialogHeader>
              <DialogTitle>ویرایش کاربر</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <Label htmlFor="firstName">نام</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    defaultValue={editingUser.firstName}
                    required
                    data-testid="input-edit-firstName"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">نام خانوادگی</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    defaultValue={editingUser.lastName}
                    required
                    data-testid="input-edit-lastName"
                  />
                </div>
                <div>
                  <Label htmlFor="role">نقش</Label>
                  <Select name="role" defaultValue={editingUser.role}>
                    <SelectTrigger data-testid="select-edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مدیر</SelectItem>
                      <SelectItem value="user_level_1">کاربر سطح ۱</SelectItem>
                      <SelectItem value="user_level_2">کاربر سطح ۲</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 space-x-reverse">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    data-testid="button-cancel-edit"
                  >
                    لغو
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateUserMutation.isPending}
                    data-testid="button-save-user"
                  >
                    {updateUserMutation.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
