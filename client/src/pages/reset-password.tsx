import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import loginVideo from "@assets/YouCut_20250930_005437820_1759181322984.mp4";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username) {
      toast({
        title: "خطا",
        description: "نام کاربری الزامی است",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "موفق",
          description: data.message,
        });
        setStep(2);
      } else {
        toast({
          title: "خطا",
          description: data.message || "خطا در ارسال کد",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      toast({
        title: "خطا",
        description: "تمام فیلدها الزامی هستند",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "خطا",
        description: "رمز عبور و تکرار آن باید یکسان باشند",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "خطا",
        description: "رمز عبور باید حداقل 6 کاراکتر باشد",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "موفق",
          description: data.message,
        });
        setTimeout(() => setLocation("/login"), 2000);
      } else {
        toast({
          title: "خطا",
          description: data.message || "خطا در تغییر رمز عبور",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در اتصال به سرور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">بازگردانی رمز عبور</h2>
              <p className="text-sm text-gray-600 mt-2">
                {step === 1
                  ? "نام کاربری خود را وارد کنید تا کد بازیابی به واتس‌اپ شما ارسال شود"
                  : "کد ارسال شده به واتس‌اپ و رمز عبور جدید را وارد کنید"}
              </p>
            </div>

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <Label htmlFor="username" className="text-gray-700 font-medium mb-1.5 block text-sm">
                  نام کاربری
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری خود را وارد کنید"
                  className="h-10 px-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? "در حال ارسال..." : "ارسال کد به واتس‌اپ"}
              </Button>

              <Button
                type="button"
                onClick={() => setLocation("/")}
                className="w-full h-10 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 mt-3"
              >
                بازگشت به صفحه اصلی
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <Label htmlFor="otp" className="text-gray-700 font-medium mb-1.5 block text-sm">
                  کد بازیابی (6 رقمی)
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="کد 6 رقمی ارسال شده"
                  maxLength={6}
                  className="h-10 px-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm text-center text-xl tracking-widest"
                  required
                />
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-gray-700 font-medium mb-1.5 block text-sm">
                  رمز عبور جدید
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="رمز عبور جدید (حداقل 6 کاراکتر)"
                  className="h-10 px-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium mb-1.5 block text-sm">
                  تکرار رمز عبور جدید
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="رمز عبور جدید را دوباره وارد کنید"
                  className="h-10 px-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-10 text-sm font-medium rounded-lg"
                  disabled={isLoading}
                >
                  بازگشت
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "در حال تغییر..." : "تغییر رمز عبور"}
                </Button>
              </div>
            </form>
          )}
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
          <h2 className="text-white text-2xl font-bold">به سیستم جامع مدیریت کاربران آریا بات خوش امدید</h2>
        </div>
        <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mt-24"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mb-36"></div>
      </div>
    </div>
  );
}
