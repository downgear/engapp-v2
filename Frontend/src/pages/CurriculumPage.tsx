import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";
import { 
  BookOpen, ChevronRight, CheckCircle2, Clock, Lock,
  ArrowLeft, Target, Users, MessageSquare, Video
} from "lucide-react";

interface Module {
  id: number;
  moduleNumber: number;
  title: string;
  topic?: string;
  weekStartDate: string;
  weekEndDate: string;
}

interface Enrollment {
  currentModuleNumber: number;
  course: {
    id: number;
    name: string;
    modules?: Module[];
  };
}

const CurriculumPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const enrollmentData = await api.getStudentEnrollment(user.profileId);
        setEnrollment(enrollmentData);
      } catch (error) {
        console.error("Failed to fetch enrollment:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  const modules = enrollment?.course?.modules || [];
  const currentModule = enrollment?.currentModuleNumber || 1;

  // Determine module status based on week dates
  // For demo: if course hasn't started yet, first module is "current" (accessible)
  const getModuleStatus = (module: Module) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(module.weekStartDate);
    const weekEnd = new Date(module.weekEndDate);
    weekEnd.setHours(23, 59, 59, 999);

    // Check if course has started
    const courseStarted = modules.length > 0 && today >= new Date(modules[0].weekStartDate);

    // If course hasn't started yet, make first module "current" for demo
    if (!courseStarted) {
      return module.moduleNumber === 1 ? "current" : "locked";
    }

    // If today is after the week ended, it's completed
    if (today > weekEnd) return "completed";
    // If today is within the week, it's current/unlocked
    if (today >= weekStart && today <= weekEnd) return "current";
    // If today is before the week starts, it's locked
    return "locked";
  };

  // Find the current active module based on dates
  const getActiveModuleNumber = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const m of modules) {
      const weekStart = new Date(m.weekStartDate);
      const weekEnd = new Date(m.weekEndDate);
      weekEnd.setHours(23, 59, 59, 999);
      
      if (today >= weekStart && today <= weekEnd) {
        return m.moduleNumber;
      }
    }
    // If before course starts, return 1; if after, return last module
    if (modules.length > 0) {
      const firstStart = new Date(modules[0].weekStartDate);
      if (today < firstStart) return 1; // Course hasn't started, show first as "upcoming"
      return modules.length; // Course ended
    }
    return 1;
  };

  const activeModuleNumber = getActiveModuleNumber();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Hoàn thành</Badge>;
      case "current":
        return <Badge className="bg-primary hover:bg-primary/90"><Clock className="h-3 w-3 mr-1" />Đang học</Badge>;
      default:
        return <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" />Chưa mở</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-28 pb-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/student-dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Chương Trình Học</h1>
            <p className="text-muted-foreground">
              {enrollment?.course?.name || "Speaking Foundation Program"}
            </p>
          </div>
        </div>

        {/* Program Overview Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Tổng Quan Chương Trình</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Duration */}
            <Card className="border-border/50 bg-card">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Thời lượng</h3>
                    <p className="text-muted-foreground">8 tuần</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Format */}
            <Card className="border-border/50 bg-card">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Hình thức học</h3>
                    <p className="text-muted-foreground text-sm">
                      Học kết hợp (Học trực tiếp trên lớp + Luyện nói AI hàng ngày + Mentor 1-1 hàng tuần)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Target Level */}
            <Card className="border-border/50 bg-card">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Trình độ mục tiêu</h3>
                    <p className="text-muted-foreground text-sm">
                      CEFR A2–B1 (Học sinh làm bài kiểm tra đầu vào để xác định trình độ)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Info */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="py-6">
            <div className="flex flex-wrap gap-6 justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Tiến độ học tập</p>
                  <p className="text-sm text-muted-foreground">1 module / tuần</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tiến độ hiện tại</p>
                <p className="font-bold text-2xl text-primary">
                  {activeModuleNumber} / 8 <span className="text-base font-normal text-muted-foreground">modules</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((module) => {
            const status = getModuleStatus(module);
            const isClickable = status !== "locked";
            
            return (
              <Card 
                key={module.id}
                className={`relative overflow-hidden transition-all ${
                  isClickable 
                    ? "cursor-pointer hover:shadow-lg hover:border-primary/50 hover:-translate-y-1" 
                    : "opacity-60"
                } ${status === "current" ? "border-primary ring-2 ring-primary/20" : ""}`}
                onClick={() => isClickable && navigate(`/curriculum/${module.id}`)}
              >
                <CardContent className="p-5">
                  {/* Module Number Badge */}
                  <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-sm font-bold ${
                    status === "current" 
                      ? "bg-primary text-primary-foreground" 
                      : status === "completed"
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    #{module.moduleNumber}
                  </div>
                  
                  <div className="mt-4 mb-3">
                    {getStatusBadge(status)}
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2 min-h-[3rem]">
                    {module.title}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground mb-3">
                    Tuần {module.moduleNumber}: Chủ đề Work
                  </p>
                  
                  {isClickable && (
                    <div className="flex items-center text-sm text-primary font-medium">
                      Xem chi tiết
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default CurriculumPage;

