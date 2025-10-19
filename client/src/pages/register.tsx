import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import loginVideo from "@assets/YouCut_20250930_005437820_1759181322984.mp4";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const { register, isRegisterLoading, registerError } = useAuth();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.password) {
      toast({
        title: "خطا",
        description: "لطفاً تمام فیلدها را پر کنید",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطا",
        description: "رمز عبور و تکرار آن مطابقت ندارند",
        variant: "destructive",
      });
      return;
    }

    // فرمت کردن شماره موبایل: اگر با 0 شروع شد، 0 رو حذف کن و 98 اضافه کن، اگر 98 داشت همون رو بفرست
    let formattedPhone = formData.phone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '98' + formattedPhone.slice(1);
    }

    register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formattedPhone,
      password: formData.password,
    });
  };

  if (registerError) {
    toast({
      title: "خطا در ثبت نام",
      description: "خطایی رخ داده است. لطفاً دوباره تلاش کنید",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen flex" data-testid="page-register">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-register">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="text-gray-700 font-medium mb-1.5 block text-sm">نام</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="نام"
                    className="h-10 px-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    required
                    data-testid="input-firstName"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-gray-700 font-medium mb-1.5 block text-sm">نام خانوادگی</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="نام خانوادگی"
                    className="h-10 px-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    required
                    data-testid="input-lastName"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-gray-700 font-medium mb-1.5 block text-sm">شماره تلفن</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className="h-10 px-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                  data-testid="input-phone"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="password" className="text-gray-700 font-medium mb-1.5 block text-sm">رمز عبور</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="رمز عبور"
                    className="h-10 px-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    required
                    autoComplete="new-password"
                    data-testid="input-password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium mb-1.5 block text-sm">تکرار رمز عبور</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="تکرار رمز عبور"
                    className="h-10 px-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    required
                    autoComplete="new-password"
                    data-testid="input-confirmPassword"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-10 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={isRegisterLoading}
                data-testid="button-register"
              >
                {isRegisterLoading ? "در حال ثبت نام..." : "ثبت نام"}
              </Button>
              
              <div className="text-center pt-4">
                <span className="text-gray-600 text-sm">قبلاً ثبت نام کرده‌اید؟</span>
                <Link href="/login" className="text-blue-600 hover:text-blue-700 hover:underline mr-1 font-medium text-sm" data-testid="link-login">
                  وارد شوید
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center">
          <video 
            src={loginVideo} 
            autoPlay
            loop
            muted
            playsInline
            className="max-w-md w-full mx-auto rounded-2xl shadow-2xl mb-6"
          />
          <h2 className="text-white text-3xl font-bold mb-3">به جمع ما بپیوندید!</h2>
          <p className="text-white/90 text-base">حساب کاربری خود را ایجاد کنید</p>
        </div>
        <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mt-24"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mb-36"></div>
      </div>
    </div>
  );
}
