import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Phone, 
  MessageSquare, 
  Link2, 
  AlertCircle, 
  CheckCircle2,
  Eye,
  Clock,
  Zap,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createAuthenticatedRequest } from "@/lib/auth";

const API_SEND_URL = "https://api.whatsiplus.com/sendMsg/";

export default function SendMessagePanel() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [messageText, setMessageText] = useState("");
  const [mediaLink, setMediaLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setMessageCount(messageText.length);
  }, [messageText]);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('0')) {
      return '+98' + cleaned.slice(1);
    }
    if (!cleaned.startsWith('+')) {
      return '+98' + cleaned;
    }
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "کپی شد",
      description: "متن کپی شد",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim() || !messageText.trim()) {
      setError("شماره همراه و متن پیام الزامی است");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const settingsResponse = await createAuthenticatedRequest("/api/whatsapp-settings");
      if (!settingsResponse.ok) {
        throw new Error("خطا در دریافت تنظیمات واتس‌اپ");
      }
      
      const settings = await settingsResponse.json();
      const apiToken = settings.token;

      if (!apiToken) {
        setError("توکن API تنظیم نشده. ابتدا تنظیمات را کامل کنید");
        return;
      }

      const formData = new FormData();
      formData.append('phonenumber', phoneNumber.replace('+', ''));
      formData.append('message', messageText);
      
      if (mediaLink.trim()) {
        formData.append('link', mediaLink);
      }

      const apiUrl = `${API_SEND_URL}${apiToken}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        try {
          const dbResponse = await createAuthenticatedRequest("/api/messages/sent", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipient: phoneNumber,
              message: `${messageText}${mediaLink.trim() ? `\n\nلینک: ${mediaLink}` : ''}`,
              status: "sent"
            }),
          });

          if (!dbResponse.ok) {
            console.error("خطا در ذخیره پیام");
          }
        } catch (dbError) {
          console.error("خطا در ذخیره پیام:", dbError);
        }

        setSuccessMessage("پیام ارسال شد");
        setPhoneNumber("");
        setMessageText("");
        setMediaLink("");
        setPreviewMode(false);
        
        toast({
          title: "✅ موفق",
          description: "پیام ارسال شد",
        });
      } else {
        throw new Error("خطا در ارسال پیام");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطا در ارسال";
      setError(errorMessage);
      toast({
        title: "❌ خطا",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="ارسال پیام واتس‌اپ">
      <div className="space-y-4" data-testid="page-send-message">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">ارسال پیام واتس‌اپ</h1>
              <p className="text-sm text-muted-foreground">ارسال پیام به مشتریان</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Badge variant="outline" className="text-xs">
              {messageCount} کاراکتر
            </Badge>
            <Badge variant={phoneNumber && messageText ? "default" : "secondary"} className="text-xs">
              {phoneNumber && messageText ? "آماده" : "ناکامل"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Main Form */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center space-x-2 space-x-reverse">
                  <MessageSquare className="w-4 h-4" />
                  <span>فرم ارسال</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-send-message">
                  
                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium flex items-center space-x-1 space-x-reverse">
                      <Phone className="w-3 h-3" />
                      <span>شماره همراه</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="+989123456789"
                      className="h-9"
                      data-testid="input-phone-number"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      مثال: +989123456789 یا 09123456789
                    </p>
                  </div>

                  {/* Message Text */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="messageText" className="text-sm font-medium flex items-center space-x-1 space-x-reverse">
                        <MessageSquare className="w-3 h-3" />
                        <span>متن پیام</span>
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(messageText)}
                        disabled={!messageText}
                        className="h-6 px-2 text-xs"
                      >
                        <Copy className="w-3 h-3 ml-1" />
                        کپی
                      </Button>
                    </div>
                    <Textarea
                      id="messageText"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="متن پیام..."
                      className="min-h-[80px] text-sm resize-none"
                      data-testid="textarea-message"
                      required
                    />
                  </div>

                  {/* Media Link */}
                  <div className="space-y-2">
                    <Label htmlFor="mediaLink" className="text-sm font-medium flex items-center space-x-1 space-x-reverse">
                      <Link2 className="w-3 h-3" />
                      <span>لینک رسانه</span>
                      <Badge variant="outline" className="text-xs">اختیاری</Badge>
                    </Label>
                    <Input
                      id="mediaLink"
                      type="url"
                      value={mediaLink}
                      onChange={(e) => setMediaLink(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="h-9"
                      data-testid="input-media-link"
                    />
                  </div>

                  {/* Messages */}
                  {error && (
                    <div className="flex items-center space-x-2 space-x-reverse p-2 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-red-700 text-sm">{error}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="flex items-center space-x-2 space-x-reverse p-2 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-green-700 text-sm">{successMessage}</span>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex items-center space-x-3 space-x-reverse pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading || !phoneNumber.trim() || !messageText.trim()}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="button-send-message"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white ml-1"></div>
                          ارسال...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 ml-1" />
                          ارسال
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                      disabled={!messageText}
                    >
                      <Eye className="w-3 h-3 ml-1" />
                      {previewMode ? 'مخفی' : 'پیش‌نمایش'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            
            {/* Quick Stats */}
            <Card className="p-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-1 space-x-reverse">
                  <Zap className="w-3 h-3 text-yellow-600" />
                  <span className="text-xs font-medium">آمار</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">کاراکتر:</span>
                    <Badge variant={messageCount > 1000 ? "destructive" : "default"} className="text-xs h-4">
                      {messageCount}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رسانه:</span>
                    <Badge variant={mediaLink ? "default" : "outline"} className="text-xs h-4">
                      {mediaLink ? "دارد" : "ندارد"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Preview */}
            {previewMode && messageText && (
              <Card className="bg-green-50 border-green-200 p-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <Eye className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-green-800">پیش‌نمایش</span>
                  </div>
                  <div className="bg-white rounded p-2 border">
                    <div className="flex items-start space-x-2 space-x-reverse">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">شما</span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-green-500 text-white p-2 rounded-lg rounded-tr-none text-xs">
                          <p className="whitespace-pre-wrap">{messageText}</p>
                          {mediaLink && (
                            <div className="mt-1 pt-1 border-t border-green-400">
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Link2 className="w-2 h-2" />
                                <span className="text-xs opacity-90">پیوست</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 space-x-reverse mt-1">
                          <Clock className="w-2 h-2 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {new Date().toLocaleTimeString('fa-IR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Tips */}
            <Card className="bg-yellow-50 border-yellow-200 p-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-1 space-x-reverse">
                  <AlertCircle className="w-3 h-3 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-800">نکات</span>
                </div>
                <div className="space-y-1 text-xs text-yellow-700">
                  <div className="flex items-start space-x-1 space-x-reverse">
                    <CheckCircle2 className="w-2 h-2 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>شماره با کد کشور</span>
                  </div>
                  <div className="flex items-start space-x-1 space-x-reverse">
                    <CheckCircle2 className="w-2 h-2 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>پیام کوتاه بهتر است</span>
                  </div>
                  <div className="flex items-start space-x-1 space-x-reverse">
                    <CheckCircle2 className="w-2 h-2 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>از ایموجی استفاده کنید</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}