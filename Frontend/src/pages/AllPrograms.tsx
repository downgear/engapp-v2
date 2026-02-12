import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Calendar,
  Users,
  GraduationCap,
  Clock,
  DollarSign,
  Layers,
  FolderOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { api, ProgramResponse, CohortResponse, CohortCourseResponse } from "@/services/api";

// Use API types
type Program = ProgramResponse;
type Cohort = CohortResponse;
type Course = CohortCourseResponse;

const getStatusBadge = (status: string, language: string) => {
  switch (status) {
    case "active":
    case "in_progress":
      return <Badge className="bg-green-500">{language === "vi" ? "Đang diễn ra" : "In Progress"}</Badge>;
    case "upcoming":
    case "registration_open":
      return <Badge className="bg-blue-500">{language === "vi" ? "Sắp khai giảng" : "Upcoming"}</Badge>;
    case "completed":
      return <Badge variant="secondary">{language === "vi" ? "Đã hoàn thành" : "Completed"}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getLevelBadge = (level: string, language: string) => {
  switch (level) {
    case "basic":
      return <Badge variant="outline" className="border-green-500 text-green-600">{language === "vi" ? "Cơ bản" : "Basic"}</Badge>;
    case "advanced":
      return <Badge variant="outline" className="border-purple-500 text-purple-600">{language === "vi" ? "Nâng cao" : "Advanced"}</Badge>;
    default:
      return <Badge variant="outline">{level}</Badge>;
  }
};

const formatPrice = (price: number, language: string) => {
  if (language === "vi") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateString: string, language: string) => {
  return new Date(dateString).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const AllPrograms = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, accessToken, isAuthenticated } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>([]);
  const [paidCourseIds, setPaidCourseIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await api.getAllPrograms();
        setPrograms(data);
        
        // If user is a student, get their enrolled and paid courses from API
        if (isAuthenticated && user?.role === 'student' && accessToken) {
          try {
            const enrollments = await api.getStudentCohortEnrollments(accessToken, user.profileId);
            const enrolledIds = enrollments.map(e => e.cohortCourseId);
            const paidIds = enrollments.filter(e => e.paid).map(e => e.cohortCourseId);
            setEnrolledCourseIds(enrolledIds);
            setPaidCourseIds(paidIds);
          } catch (e) {
            console.error("Failed to fetch enrollments:", e);
          }
        }
      } catch (error) {
        console.error("Failed to fetch programs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user, accessToken]);

  const isEnrolled = (courseId: number) => {
    return enrolledCourseIds.includes(courseId);
  };

  const isPaid = (courseId: number) => {
    return paidCourseIds.includes(courseId);
  };

  const handleCourseAction = (course: Course) => {
    const enrolled = isEnrolled(course.id);
    const paid = isPaid(course.id);
    
    // Navigate to curriculum with course info
    navigate("/curriculum", { 
      state: { 
        courseId: course.id, 
        cohortCourseId: course.id,
        courseName: course.name,
        courseDescription: course.description,
        modules: course.modules,
        enrolled: paid // If paid, consider fully enrolled
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-28 pb-16 max-w-6xl">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 pt-28 pb-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {language === "vi" ? "Tất cả chương trình học" : "All Programs"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === "vi" ? "Khám phá các khóa học tiếng Anh chất lượng cao, được thiết kế riêng cho người Việt" : "Explore high-quality English courses designed specifically for Vietnamese learners"}
          </p>
        </div>

        {/* Programs */}
        {programs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Layers className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{language === "vi" ? "Chưa có chương trình nào" : "No programs available"}</h3>
              <p className="text-muted-foreground">{language === "vi" ? "Vui lòng quay lại sau." : "Please check back later."}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {programs.map((program) => (
              <Card key={program.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/20 rounded-xl">
                      <Layers className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-2">{program.name}</CardTitle>
                      <CardDescription className="text-base">
                        {program.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible defaultValue="cohort-1" className="w-full">
                    {program.cohorts.map((cohort) => (
                      <AccordionItem key={cohort.id} value={`cohort-${cohort.id}`}>
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-4 text-left">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <FolderOpen className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <div className="font-semibold flex items-center gap-2">
                                {cohort.name}
                                {getStatusBadge(cohort.status, language)}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Calendar className="h-4 w-4" />
                                {language === "vi" ? "Bắt đầu" : "Starts"}: {formatDate(cohort.startDate, language)}
                                <span className="mx-2">•</span>
                                <BookOpen className="h-4 w-4" />
                                {cohort.courses.length} {language === "vi" ? "khóa học" : "courses"}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-4 grid md:grid-cols-2 gap-6">
                            {cohort.courses.map((course) => {
                              const enrolled = isEnrolled(course.id);
                              return (
                                <Card
                                  key={course.id}
                                  className={`relative overflow-hidden transition-all hover:shadow-lg ${
                                    enrolled 
                                      ? "border-green-500/50 bg-green-50/30 dark:bg-green-950/10" 
                                      : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  {/* Enrollment Status Banner */}
                                  <div className={`absolute top-0 right-0 px-4 py-1.5 text-sm font-medium rounded-bl-lg ${
                                    enrolled 
                                      ? "bg-green-500 text-white" 
                                      : "bg-muted text-muted-foreground"
                                  }`}>
                                    {enrolled ? (
                                      <span className="flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4" />
                                        {language === "vi" ? "Đang theo học" : "Enrolled"}
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <XCircle className="h-4 w-4" />
                                        {language === "vi" ? "Chưa đăng ký" : "Not Enrolled"}
                                      </span>
                                    )}
                                  </div>

                                  <CardContent className="p-6 pt-10">
                                    {/* Course Header */}
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex items-center gap-2">
                                        <GraduationCap className="h-6 w-6 text-primary" />
                                        <h3 className="text-xl font-semibold">{course.name}</h3>
                                      </div>
                                      <div className="flex gap-2">
                                        {getLevelBadge(course.level, language)}
                                      </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-muted-foreground mb-6 line-clamp-2">
                                      {course.description}
                                    </p>

                                    {/* Course Info Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                      <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        <div>
                                          <p className="text-muted-foreground">{language === "vi" ? "Thời gian" : "Schedule"}</p>
                                          <p className="font-medium">{formatDate(course.startDate, language)}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-orange-500" />
                                        <div>
                                          <p className="text-muted-foreground">{language === "vi" ? "Thời lượng" : "Duration"}</p>
                                          <p className="font-medium">{language === "vi" ? "3 tháng" : "3 months"}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4 text-green-500" />
                                        <div>
                                          <p className="text-muted-foreground">{language === "vi" ? "Học viên" : "Students"}</p>
                                          <p className="font-medium">{course.enrolledStudents}/{course.maxStudents}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <DollarSign className="h-4 w-4 text-purple-500" />
                                        <div>
                                          <p className="text-muted-foreground">{language === "vi" ? "Học phí" : "Tuition"}</p>
                                          <p className="font-medium">{formatPrice(course.price, language)}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Modules Preview */}
                                    <div className="bg-muted/30 rounded-lg p-4 mb-6">
                                      <p className="text-sm font-medium mb-2">
                                        {language === "vi" ? `Nội dung khóa học (${course.modules.length} modules)` : `Course Content (${course.modules.length} modules)`}
                                      </p>
                                      <ul className="text-sm text-muted-foreground space-y-1">
                                        {course.modules.slice(0, 3).map((module) => (
                                          <li key={module.id} className="flex items-center gap-2">
                                            <BookOpen className="h-3 w-3" />
                                            Module {module.moduleNumber}: {module.title}
                                          </li>
                                        ))}
                                        {course.modules.length > 3 && (
                                          <li className="text-primary">
                                            + {course.modules.length - 3} {language === "vi" ? "modules khác..." : "more modules..."}
                                          </li>
                                        )}
                                      </ul>
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                      className="w-full gap-2"
                                      variant={enrolled ? "default" : "outline"}
                                      onClick={() => handleCourseAction(course)}
                                    >
                                      {enrolled ? (
                                        <>
                                          {language === "vi" ? "Vào học" : "Continue Learning"}
                                          <ArrowRight className="h-4 w-4" />
                                        </>
                                      ) : (
                                        <>
                                          {language === "vi" ? "Đăng ký ngay" : "Register Now"}
                                          <ArrowRight className="h-4 w-4" />
                                        </>
                                      )}
                                    </Button>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Layers className="h-10 w-10 text-primary mx-auto mb-3" />
              <p className="text-3xl font-bold">{programs.length}</p>
              <p className="text-sm text-muted-foreground">{language === "vi" ? "Chương trình" : "Programs"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FolderOpen className="h-10 w-10 text-blue-500 mx-auto mb-3" />
              <p className="text-3xl font-bold">
                {programs.reduce((acc, p) => acc + p.cohorts.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">{language === "vi" ? "Đợt khai giảng" : "Cohorts"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <GraduationCap className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <p className="text-3xl font-bold">
                {programs.reduce(
                  (acc, p) => acc + p.cohorts.reduce((a, c) => a + c.courses.length, 0),
                  0
                )}
              </p>
              <p className="text-sm text-muted-foreground">{language === "vi" ? "Khóa học" : "Courses"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-10 w-10 text-purple-500 mx-auto mb-3" />
              <p className="text-3xl font-bold">
                {programs.reduce(
                  (acc, p) =>
                    acc +
                    p.cohorts.reduce(
                      (a, c) => a + c.courses.reduce((x, course) => x + course.enrolledStudents, 0),
                      0
                    ),
                  0
                )}
              </p>
              <p className="text-sm text-muted-foreground">{language === "vi" ? "Học viên" : "Students"}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AllPrograms;
