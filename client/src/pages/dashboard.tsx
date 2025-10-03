import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to appropriate page based on user role
    if (user?.role === "admin") {
      setLocation("/users");
    } else {
      setLocation("/profile");
    }
  }, [user, setLocation]);

  return (
    <DashboardLayout title="داشبورد">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">خوش آمدید</h2>
        <p className="text-muted-foreground">در حال انتقال به صفحه مناسب...</p>
      </div>
    </DashboardLayout>
  );
}
