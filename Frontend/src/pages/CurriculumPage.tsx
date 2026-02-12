import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
  weekStartDate?: string;
  weekEndDate?: string;
}

interface Enrollment {
  currentModuleNumber: number;
  paid: boolean;
  paidAt: string | null;
  course: {
    id: number;
    name: string;
    modules?: Module[];
  };
}

interface LocationState {
  courseId?: number;
  cohortCourseId?: number;
  courseName?: string;
  courseDescription?: string;
  modules?: Module[];
  enrolled?: boolean;
}

const CurriculumPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get course info from navigation state (from AllPrograms page)
  const locationState = location.state as LocationState | null;
  const cohortCourseId = locationState?.cohortCourseId;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !accessToken) return;
      
      // If we have course info from navigation state
      if (locationState?.modules && locationState.courseName && cohortCourseId) {
        try {
          // Enroll student in this course (if not already)
          await api.enrollInCohortCourse(accessToken, user.profileId, cohortCourseId);
          
          // Check if already paid
          const { paid } = await api.checkCohortEnrollmentPaid(accessToken, user.profileId, cohortCourseId);
          
          // Create enrollment object with module dates
          const mockModules = locationState.modules.map((m, index) => ({
            ...m,
            weekStartDate: m.weekStartDate || new Date(Date.now() + index * 7 * 24 * 60 * 60 * 1000).toISOString(),
            weekEndDate: m.weekEndDate || new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          }));
          
          setEnrollment({
            currentModuleNumber: 1,
            paid: paid || locationState.enrolled || false,
            paidAt: null,
            course: {
              id: locationState.courseId || 0,
              name: locationState.courseName,
              modules: mockModules,
            },
          });
        } catch (error) {
          console.error("Failed to check enrollment status:", error);
          // Fallback to locationState
          const mockModules = locationState.modules.map((m, index) => ({
            ...m,
            weekStartDate: m.weekStartDate || new Date(Date.now() + index * 7 * 24 * 60 * 60 * 1000).toISOString(),
            weekEndDate: m.weekEndDate || new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          }));
          setEnrollment({
            currentModuleNumber: 1,
            paid: locationState.enrolled || false,
            paidAt: null,
            course: {
              id: locationState.courseId || 0,
              name: locationState.courseName,
              modules: mockModules,
            },
          });
        }
        setIsLoading(false);
        return;
      }
      
      // Otherwise fetch from API (standard enrollment)
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
  }, [user, accessToken, locationState, cohortCourseId]);

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

  // Sort modules by moduleNumber to ensure correct order (1 to 8)
  const modules = [...(enrollment?.course?.modules || [])].sort((a, b) => a.moduleNumber - b.moduleNumber);
  const currentModule = enrollment?.currentModuleNumber || 1;

  // Determine module status based on payment and week dates
  const getModuleStatus = (module: Module) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If NOT PAID: First module is "current" (free preview), rest are "locked"
    if (!enrollment?.paid) {
      return module.moduleNumber === 1 ? "current" : "locked";
    }

    // If PAID: All modules are unlocked
    // Use week-based logic to determine which is "current" vs "completed"
    if (module.weekStartDate && module.weekEndDate) {
      const weekEnd = new Date(module.weekEndDate);
      weekEnd.setHours(23, 59, 59, 999);
      if (today > weekEnd) return "completed";
    }
    return "current";
  };

  // Find the current active module based on dates
  const getActiveModuleNumber = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const m of modules) {
      if (!m.weekStartDate || !m.weekEndDate) continue;
      
      const weekStart = new Date(m.weekStartDate);
      const weekEnd = new Date(m.weekEndDate);
      weekEnd.setHours(23, 59, 59, 999);
      
      if (today >= weekStart && today <= weekEnd) {
        return m.moduleNumber;
      }
    }
    // If before course starts or no dates, return 1
    if (modules.length > 0) {
      if (modules[0].weekStartDate) {
        const firstStart = new Date(modules[0].weekStartDate);
        if (today < firstStart) return 1;
      }
      return modules.length;
    }
    return 1;
  };

  const activeModuleNumber = getActiveModuleNumber();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />{language === "vi" ? "Hoàn thành" : "Completed"}</Badge>;
      case "current":
        return <Badge className="bg-primary hover:bg-primary/90"><Clock className="h-3 w-3 mr-1" />{language === "vi" ? "Đang học" : "In Progress"}</Badge>;
      default:
        return <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" />{language === "vi" ? "Chưa thanh toán" : "Unpaid"}</Badge>;
    }
  };

  // Handle module click - if locked (not paid), redirect to payment page
  const handleModuleClick = (module: Module, status: string) => {
    if (status === "locked" && !enrollment?.paid) {
      // Redirect to payment page for locked modules
      // Pass cohortCourseId so payment knows which course to unlock
      navigate(`/payment/${module.id}`, { 
        state: { 
          cohortCourseId,
          courseName: enrollment?.course?.name,
          moduleId: module.id
        } 
      });
    } else {
      // Navigate to module detail for unlocked modules
      navigate(`/curriculum/${module.id}`);
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
            <h1 className="text-2xl font-bold text-foreground">{language === "vi" ? "Chương Trình Học" : "Curriculum"}</h1>
            <p className="text-muted-foreground">
              {enrollment?.course?.name || "Speaking Foundation Program"}
            </p>
          </div>
        </div>

        {/* Program Overview Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">{language === "vi" ? "Tổng Quan Chương Trình" : "Program Overview"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Duration */}
            <Card className="border-border/50 bg-card">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{language === "vi" ? "Thời lượng" : "Duration"}</h3>
                    <p className="text-muted-foreground">{language === "vi" ? "8 tuần" : "8 weeks"}</p>
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
                    <h3 className="font-semibold text-foreground mb-1">{language === "vi" ? "Hình thức học" : "Learning Format"}</h3>
                    <p className="text-muted-foreground text-sm">
                      {language === "vi" ? "Học kết hợp (Học với GV Việt Nam + Luyện nói AI hàng ngày + Học 1-1 với GV nước ngoài hàng tuần)" : "Blended learning (Learn with Vietnamese teacher + Daily AI speaking practice + Weekly 1-on-1 with native teacher)"}
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
                    <h3 className="font-semibold text-foreground mb-1">{language === "vi" ? "Trình độ mục tiêu" : "Target Level"}</h3>
                    <p className="text-muted-foreground text-sm">
                      {language === "vi" ? "CEFR A2–B1 (Học sinh làm bài kiểm tra đầu vào để xác định trình độ)" : "CEFR A2–B1 (Students take a placement test to determine level)"}
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
                  <p className="font-semibold text-lg">{language === "vi" ? "Tiến độ học tập" : "Learning Progress"}</p>
                  <p className="text-sm text-muted-foreground">{language === "vi" ? "1 module / tuần" : "1 module / week"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{language === "vi" ? "Tiến độ hiện tại" : "Current Progress"}</p>
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
            
            return (
              <Card 
                key={module.id}
                className={`relative overflow-hidden transition-all cursor-pointer hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 ${
                  status === "locked" ? "opacity-60" : ""
                } ${status === "current" ? "border-primary ring-2 ring-primary/20" : ""}`}
                onClick={() => handleModuleClick(module, status)}
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
                    {language === "vi" ? `Tuần ${module.moduleNumber}: Chủ đề Work` : `Week ${module.moduleNumber}: Topic Work`}
                  </p>
                  
                  <div className="flex items-center text-sm text-primary font-medium">
                    {status === "locked" ? (language === "vi" ? "Thanh toán để mở khóa" : "Pay to unlock") : (language === "vi" ? "Xem chi tiết" : "View details")}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
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

