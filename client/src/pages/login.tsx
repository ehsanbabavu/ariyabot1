import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import loginVideo from "@assets/YouCut_20250930_005437820_1759181322984.mp4";

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoginLoading, loginError } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailOrUsername || !password) {
      toast({
        title: "خطا",
        description: "لطفاً تمام فیلدها را پر کنید",
        variant: "destructive",
      });
      return;
    }

    login({ email: emailOrUsername, password });
  };

  useEffect(() => {
    if (loginError) {
      toast({
        title: "خطا در ورود",
        description: "نام کاربری یا رمز عبور اشتباه است",
        variant: "destructive",
      });
    }
  }, [loginError, toast]);

  return (
    <div className="min-h-screen flex" data-testid="page-login">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-login">
              <div>
                <Label htmlFor="emailOrUsername" className="text-gray-700 font-medium mb-1.5 block text-sm">
                  نام کاربری
                </Label>
                <Input
                  id="emailOrUsername"
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="نام کاربری"
                  className="h-10 px-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                  autoComplete="username"
                  data-testid="input-email-or-username"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium mb-1.5 block text-sm">
                  رمز عبور
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور"
                  className="h-10 px-3 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                  autoComplete="current-password"
                  data-testid="input-password"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    data-testid="checkbox-remember"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                    مرا به خاطر بسپار
                  </Label>
                </div>
                <Link href="/reset-password" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                  بازگردانی رمز عبور!
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-10 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={isLoginLoading}
                data-testid="button-login"
              >
                {isLoginLoading ? "در حال ورود..." : "ورود"}
              </Button>
              
              <div className="text-center pt-5">
                <span className="text-gray-600 text-sm">هنوز ثبت نام نکرده اید؟</span>
                <Link href="/register" className="text-blue-600 hover:text-blue-700 hover:underline mr-1 font-medium text-sm" data-testid="link-register">
                  ثبت نام کنید
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
          <h2 className="text-white text-2xl font-bold">به سیستم جامع مدیریت کاربران آریا بات خوش امدید</h2>
        </div>
        <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mt-24"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mb-36"></div>
      </div>
    </div>
  );
}
