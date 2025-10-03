import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Search, HelpCircle } from "lucide-react";
import type { Faq } from "@shared/schema";

export default function FaqsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const { data: faqs = [], isLoading } = useQuery<Faq[]>({
    queryKey: ["/api/faqs/active"],
  });

  // Filter FAQs based on search term
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpanded = (faqId: string) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="سوالات متداول">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-lg">در حال بارگذاری سوالات متداول...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="سوالات متداول">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">سوالات متداول</h1>
          </div>
          <p className="text-muted-foreground">
            پاسخ سوالات رایج خود را در اینجا پیدا کنید
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در سوالات متداول..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
                data-testid="input-faq-search"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQs List */}
        {filteredFaqs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "سوالی یافت نشد" : "هنوز سوالی اضافه نشده است"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "متأسفانه سوالی با این عبارت جستجو یافت نشد. لطفاً کلمات کلیدی دیگری امتحان کنید."
                    : "به زودی سوالات متداول در اینجا نمایش داده خواهند شد."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <Card key={faq.id} className="transition-all duration-200 hover:shadow-md">
                <Collapsible
                  open={expandedFaq === faq.id}
                  onOpenChange={() => toggleExpanded(faq.id)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-right text-lg leading-relaxed">
                          {faq.question}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          data-testid={`button-toggle-faq-${faq.id}`}
                        >
                          {expandedFaq === faq.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="prose prose-sm max-w-none text-right">
                        <div
                          className="text-muted-foreground leading-relaxed whitespace-pre-wrap"
                          data-testid={`text-faq-answer-${faq.id}`}
                        >
                          {faq.answer}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}

        {/* Results Count */}
        {searchTerm && (
          <div className="text-center text-sm text-muted-foreground">
            {filteredFaqs.length} سوال از {faqs.length} سوال یافت شد
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}