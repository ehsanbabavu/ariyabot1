import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ContentSection {
  id: string;
  sectionKey: string;
  title?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SectionEditorProps {
  section: ContentSection;
  onSave: (data: { id: string; title?: string; subtitle?: string; content?: string; imageUrl?: string; isActive: boolean }) => void;
  isSaving: boolean;
}

function SectionEditor({ section, onSave, isSaving }: SectionEditorProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: section.title || "",
    subtitle: section.subtitle || "",
    content: section.content || "",
    imageUrl: section.imageUrl || "",
    isActive: section.isActive,
  });

  const [jsonError, setJsonError] = useState("");

  const validateJSON = (value: string) => {
    if (!value.trim()) return true;
    try {
      JSON.parse(value);
      setJsonError("");
      return true;
    } catch (e) {
      setJsonError("فرمت JSON نامعتبر است");
      return false;
    }
  };

  const handleSave = () => {
    if (!validateJSON(formData.content)) {
      toast({
        title: "خطا",
        description: "لطفاً فرمت JSON را بررسی کنید",
        variant: "destructive",
      });
      return;
    }

    onSave({
      id: section.id,
      ...formData,
    });
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(formData.content);
      setFormData({ ...formData, content: JSON.stringify(parsed, null, 2) });
      setJsonError("");
    } catch (e) {
      toast({
        title: "خطا",
        description: "نمی‌توان JSON را فرمت کرد",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">{section.title}</h3>
          <div className="flex gap-2 items-center">
            <Label htmlFor={`active-${section.id}`} className="text-sm">فعال</Label>
            <input
              id={`active-${section.id}`}
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
          </div>
        </div>

        <div>
          <Label htmlFor={`title-${section.id}`}>عنوان بخش</Label>
          <Input
            id={`title-${section.id}`}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="عنوان بخش"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor={`subtitle-${section.id}`}>توضیحات کوتاه</Label>
          <Textarea
            id={`subtitle-${section.id}`}
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="توضیحات کوتاه"
            rows={2}
            className="mt-2"
          />
        </div>

        {section.sectionKey === "how-it-works" && (
          <div>
            <Label htmlFor={`image-${section.id}`}>آدرس تصویر</Label>
            <Input
              id={`image-${section.id}`}
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
              className="mt-2"
            />
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor={`content-${section.id}`}>محتوای JSON</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={formatJSON}
              type="button"
            >
              فرمت JSON
            </Button>
          </div>
          <Textarea
            id={`content-${section.id}`}
            value={formData.content}
            onChange={(e) => {
              setFormData({ ...formData, content: e.target.value });
              validateJSON(e.target.value);
            }}
            placeholder='[{"key": "value"}]'
            rows={15}
            className="mt-2 font-mono text-sm"
            dir="ltr"
          />
          {jsonError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{jsonError}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded">
          <p className="font-semibold mb-2">راهنمای ویرایش:</p>
          {section.sectionKey === "features" && (
            <p>فرمت: لیستی از اشیا با فیلدهای icon, title, description</p>
          )}
          {section.sectionKey === "how-it-works" && (
            <p>فرمت: لیستی از مراحل با فیلدهای icon, title, description</p>
          )}
          {section.sectionKey === "screenshots" && (
            <p>فرمت: لیستی از آدرس تصاویر (آرایه‌ی ساده از stringها)</p>
          )}
          {section.sectionKey === "pricing" && (
            <p>فرمت: لیستی از پلن‌ها با فیلدهای name, monthly, yearly, features[], popular</p>
          )}
          {section.sectionKey === "testimonials" && (
            <p>فرمت: لیستی از نظرات با فیلدهای quote, name, title, image</p>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || !!jsonError}
          className="w-full"
        >
          <Save className="ml-2 h-4 w-4" />
          {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
      </div>
    </Card>
  );
}

export default function ContentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("features");

  const { data: sections, isLoading } = useQuery<ContentSection[]>({
    queryKey: ["content-sections"],
    queryFn: async () => {
      const response = await fetch("/api/content-sections");
      if (!response.ok) throw new Error("خطا در دریافت محتوا");
      return response.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { id: string; title?: string; subtitle?: string; content?: string; imageUrl?: string; isActive: boolean }) => {
      const response = await apiRequest("PUT", `/api/admin/content-sections/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-sections"] });
      toast({
        title: "موفق",
        description: "تغییرات با موفقیت ذخیره شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "خطا در ذخیره تغییرات",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title="مدیریت محتوای سایت">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">در حال بارگذاری...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const sectionMap = sections?.reduce((acc, section) => {
    acc[section.sectionKey] = section;
    return acc;
  }, {} as Record<string, ContentSection>);

  return (
    <DashboardLayout title="مدیریت محتوای سایت">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">مدیریت محتوای صفحه اصلی</h1>
          <p className="text-gray-600">محتوای تمام بخش‌های صفحه اصلی سایت را ویرایش کنید</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="features">ویژگی‌ها</TabsTrigger>
            <TabsTrigger value="how-it-works">چگونه کار می‌کند</TabsTrigger>
            <TabsTrigger value="screenshots">اسکرین‌شات‌ها</TabsTrigger>
            <TabsTrigger value="pricing">قیمت‌گذاری</TabsTrigger>
            <TabsTrigger value="testimonials">نظرات</TabsTrigger>
          </TabsList>

          <TabsContent value="features">
            {sectionMap?.["features"] ? (
              <SectionEditor 
                section={sectionMap["features"]} 
                onSave={(data) => saveMutation.mutate(data)}
                isSaving={saveMutation.isPending}
              />
            ) : (
              <p>بخش یافت نشد</p>
            )}
          </TabsContent>

          <TabsContent value="how-it-works">
            {sectionMap?.["how-it-works"] ? (
              <SectionEditor 
                section={sectionMap["how-it-works"]} 
                onSave={(data) => saveMutation.mutate(data)}
                isSaving={saveMutation.isPending}
              />
            ) : (
              <p>بخش یافت نشد</p>
            )}
          </TabsContent>

          <TabsContent value="screenshots">
            {sectionMap?.["screenshots"] ? (
              <SectionEditor 
                section={sectionMap["screenshots"]} 
                onSave={(data) => saveMutation.mutate(data)}
                isSaving={saveMutation.isPending}
              />
            ) : (
              <p>بخش یافت نشد</p>
            )}
          </TabsContent>

          <TabsContent value="pricing">
            {sectionMap?.["pricing"] ? (
              <SectionEditor 
                section={sectionMap["pricing"]} 
                onSave={(data) => saveMutation.mutate(data)}
                isSaving={saveMutation.isPending}
              />
            ) : (
              <p>بخش یافت نشد</p>
            )}
          </TabsContent>

          <TabsContent value="testimonials">
            {sectionMap?.["testimonials"] ? (
              <SectionEditor 
                section={sectionMap["testimonials"]} 
                onSave={(data) => saveMutation.mutate(data)}
                isSaving={saveMutation.isPending}
              />
            ) : (
              <p>بخش یافت نشد</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
