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
import { api, ProgramResponse, CohortResponse, CohortCourseResponse } from "@/services/api";

// Use API types
type Program = ProgramResponse;
type Cohort = CohortResponse;
type Course = CohortCourseResponse;

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
    case "in_progress":
      return <Badge className="bg-green-500">Đang diễn ra</Badge>;
    case "upcoming":
    case "registration_open":
      return <Badge className="bg-blue-500">Sắp khai giảng</Badge>;
    case "completed":
      return <Badge variant="secondary">Đã hoàn thành</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getLevelBadge = (level: string) => {
  switch (level) {
    case "basic":
      return <Badge variant="outline" className="border-green-500 text-green-600">Cơ bản</Badge>;
    case "advanced":
      return <Badge variant="outline" className="border-purple-500 text-purple-600">Nâng cao</Badge>;
    default:
      return <Badge variant="outline">{level}</Badge>;
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const AllPrograms = () => {
  const navigate = useNavigate();
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
            Tất cả chương trình học
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá các khóa học tiếng Anh chất lượng cao, được thiết kế riêng cho người Việt
          </p>
        </div>

        {/* Programs */}
        {programs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Layers className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Chưa có chương trình nào</h3>
              <p className="text-muted-foreground">Vui lòng quay lại sau.</p>
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
                                {getStatusBadge(cohort.status)}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Calendar className="h-4 w-4" />
                                Bắt đầu: {formatDate(cohort.startDate)}
                                <span className="mx-2">•</span>
                                <BookOpen className="h-4 w-4" />
                                {cohort.courses.length} khóa học
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
                                        Đang theo học
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <XCircle className="h-4 w-4" />
                                        Chưa đăng ký
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
                                        {getLevelBadge(course.level)}
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
                                          <p className="text-muted-foreground">Thời gian</p>
                                          <p className="font-medium">{formatDate(course.startDate)}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-orange-500" />
                                        <div>
                                          <p className="text-muted-foreground">Thời lượng</p>
                                          <p className="font-medium">3 tháng</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4 text-green-500" />
                                        <div>
                                          <p className="text-muted-foreground">Học viên</p>
                                          <p className="font-medium">{course.enrolledStudents}/{course.maxStudents}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <DollarSign className="h-4 w-4 text-purple-500" />
                                        <div>
                                          <p className="text-muted-foreground">Học phí</p>
                                          <p className="font-medium">{formatPrice(course.price)}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Modules Preview */}
                                    <div className="bg-muted/30 rounded-lg p-4 mb-6">
                                      <p className="text-sm font-medium mb-2">
                                        Nội dung khóa học ({course.modules.length} modules)
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
                                            + {course.modules.length - 3} modules khác...
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
                                          Vào học
                                          <ArrowRight className="h-4 w-4" />
                                        </>
                                      ) : (
                                        <>
                                          Đăng ký ngay
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
              <p className="text-sm text-muted-foreground">Chương trình</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FolderOpen className="h-10 w-10 text-blue-500 mx-auto mb-3" />
              <p className="text-3xl font-bold">
                {programs.reduce((acc, p) => acc + p.cohorts.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Đợt khai giảng</p>
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
              <p className="text-sm text-muted-foreground">Khóa học</p>
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
              <p className="text-sm text-muted-foreground">Học viên</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AllPrograms;
