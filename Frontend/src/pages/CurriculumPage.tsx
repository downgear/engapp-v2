import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";
import type { MyEnrollment } from "@/services/api";
import FloatingEffects from "@/components/FloatingEffects";
import {
  BookOpen, ChevronRight, CheckCircle2, Clock,
  ArrowLeft, Target, Users, GraduationCap, Calendar,
} from "lucide-react";

interface ModuleItem {
  id: number;
  moduleNumber: number;
  title: string;
  topic?: string;
  weekStartDate?: string;
  weekEndDate?: string;
}

const getModuleStatus = (module: ModuleItem, paid: boolean) => {
  if (!paid) {
    return module.moduleNumber === 1 ? "current" : "locked";
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (module.weekStartDate && module.weekEndDate) {
    const weekEnd = new Date(module.weekEndDate);
    weekEnd.setHours(23, 59, 59, 999);
    if (today > weekEnd) return "completed";
  }
  return "current";
};

const getStatusBadge = (status: string, language: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {language === "vi" ? "Hoàn thành" : "Completed"}
        </Badge>
      );
    case "current":
      return (
        <Badge className="bg-primary hover:bg-primary/90">
          <Clock className="h-3 w-3 mr-1" />
          {language === "vi" ? "Đang học" : "In Progress"}
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          {language === "vi" ? "Chưa đến" : "Upcoming"}
        </Badge>
      );
  }
};

const CurriculumPage = () => {
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();

  const [enrollments, setEnrollments] = useState<MyEnrollment[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<MyEnrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !accessToken) return;
      setIsLoading(true);
      try {
        const data = await api.getMyEnrollments(accessToken, user.profileId);
        setEnrollments(data);
      } catch (error) {
        console.error("Failed to fetch enrollments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, accessToken]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <FloatingEffects intensity="subtle" />
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}
          </div>
        </main>
      </div>
    );
  }

  // ── Module detail view ───────────────────────────────────────────────────
  if (selectedEnrollment) {
    const modules = [...selectedEnrollment.course.modules].sort(
      (a, b) => a.moduleNumber - b.moduleNumber,
    );
    const paid = selectedEnrollment.paid;

    const getActiveModuleNumber = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (const m of modules) {
        if (!m.weekStartDate || !m.weekEndDate) continue;
        const start = new Date(m.weekStartDate);
        const end = new Date(m.weekEndDate);
        end.setHours(23, 59, 59, 999);
        if (today >= start && today <= end) return m.moduleNumber;
      }
      return modules.length > 0 ? 1 : 1;
    };

    const activeModuleNumber = getActiveModuleNumber();

    return (
      <div className="min-h-screen bg-background">
        <FloatingEffects intensity="subtle" />
        <Navigation />
        <main className="container mx-auto px-4 pt-28 pb-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => setSelectedEnrollment(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {selectedEnrollment.course.name}
              </h1>
              {selectedEnrollment.course.cohortName && (
                <p className="text-muted-foreground">{selectedEnrollment.course.cohortName}</p>
              )}
            </div>
          </div>

          {/* Overview cards */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {language === "vi" ? "Tổng Quan Khoá Học" : "Course Overview"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-border/50 bg-card">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {language === "vi" ? "Thời lượng" : "Duration"}
                      </h3>
                      <p className="text-muted-foreground">
                        {modules.length} {language === "vi" ? "tuần" : "weeks"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {language === "vi" ? "Hình thức học" : "Learning Format"}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {language === "vi"
                          ? "Học kết hợp (GV Việt Nam + AI hàng ngày + GV nước ngoài hàng tuần)"
                          : "Blended (Vietnamese teacher + Daily AI + Weekly native teacher)"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {language === "vi" ? "Trình độ" : "Level"}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {selectedEnrollment.course.level || "A2–B1"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Progress card */}
          <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="py-6">
              <div className="flex flex-wrap gap-6 justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">
                      {language === "vi" ? "Tiến độ học tập" : "Learning Progress"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === "vi" ? "1 module / tuần" : "1 module / week"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {language === "vi" ? "Tiến độ hiện tại" : "Current Progress"}
                  </p>
                  <p className="font-bold text-2xl text-primary">
                    {activeModuleNumber} / {modules.length}{" "}
                    <span className="text-base font-normal text-muted-foreground">modules</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules grid */}
          {modules.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center text-muted-foreground">
                {language === "vi" ? "Khoá học chưa có module nào." : "No modules in this course yet."}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {modules.map((module) => {
                const status = getModuleStatus(module, paid);
                return (
                  <Card
                    key={module.id}
                    className={`relative overflow-hidden transition-all cursor-pointer hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 ${
                      status === "locked" ? "opacity-60" : ""
                    } ${status === "current" ? "border-primary ring-2 ring-primary/20" : ""}`}
                    onClick={() => navigate(`/curriculum/${module.id}`)}
                  >
                    <CardContent className="p-5">
                      <div
                        className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-sm font-bold ${
                          status === "current"
                            ? "bg-primary text-primary-foreground"
                            : status === "completed"
                            ? "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        #{module.moduleNumber}
                      </div>
                      <div className="mt-4 mb-3">{getStatusBadge(status, language)}</div>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 min-h-[3rem]">
                        {module.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        {module.topic
                          ? `${language === "vi" ? "Chủ đề" : "Topic"}: ${module.topic}`
                          : `${language === "vi" ? "Tuần" : "Week"} ${module.moduleNumber}`}
                      </p>
                      <div className="flex items-center text-sm text-primary font-medium">
                        {language === "vi" ? "Xem chi tiết" : "View details"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ── Course list view ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <FloatingEffects intensity="subtle" />
      <Navigation />
      <main className="container mx-auto px-4 pt-28 pb-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/student-dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === "vi" ? "Khoá Học Của Tôi" : "My Courses"}
            </h1>
            <p className="text-muted-foreground">
              {enrollments.length}{" "}
              {language === "vi" ? "khoá học đang theo học" : "enrolled courses"}
            </p>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {language === "vi" ? "Bạn chưa đăng ký khoá học nào" : "No courses yet"}
              </h3>
              <p className="text-muted-foreground">
                {language === "vi"
                  ? "Liên hệ admin để được thêm vào khoá học."
                  : "Contact an admin to be enrolled in a course."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              const { course } = enrollment;
              return (
                <Card
                  key={enrollment.enrollmentId}
                  className="overflow-hidden transition-all cursor-pointer hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 border-green-500/40 bg-green-50/20 dark:bg-green-950/10"
                  onClick={() => setSelectedEnrollment(enrollment)}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {language === "vi" ? "Đang theo học" : "Enrolled"}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-2">
                      {course.name}
                    </h3>
                    {course.cohortName && (
                      <p className="text-sm text-muted-foreground mb-3">{course.cohortName}</p>
                    )}

                    {/* Meta */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>
                          {course.modules.length}{" "}
                          {language === "vi" ? "modules" : "modules"}
                        </span>
                      </div>
                      {course.startDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(course.startDate).toLocaleDateString(
                              language === "vi" ? "vi-VN" : "en-US",
                            )}
                          </span>
                        </div>
                      )}
                      {course.teacher && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{course.teacher.name}</span>
                        </div>
                      )}
                    </div>

                    <Button className="w-full gap-2" size="sm">
                      {language === "vi" ? "Vào học" : "Continue Learning"}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CurriculumPage;
