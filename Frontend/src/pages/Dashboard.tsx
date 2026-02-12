import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

/**
 * Dashboard redirect page
 * Redirects users to their role-specific dashboard
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }

    // Redirect based on role
    switch (user.role) {
      case "student":
        navigate("/student-dashboard");
        break;
      case "parent":
        navigate("/parent-dashboard");
        break;
      case "teacher":
        navigate("/teacher-dashboard");
        break;
      case "admin":
        navigate("/admin-dashboard");
        break;
      default:
        navigate("/");
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">{language === "vi" ? "Đang chuyển hướng..." : "Redirecting..."}</p>
      </div>
    </div>
  );
};

export default Dashboard;

