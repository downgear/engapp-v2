import { useCallback, useEffect, useState } from "react";
import FloatingEffects from "@/components/FloatingEffects";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";
import type { MyEnrollment } from "@/services/api";
import type { LearningHistoryItem, Booking } from "@/types";
import { 
  BookOpen, Calendar, Video, MessageSquare, Star,
  ChevronRight, ChevronDown, Clock, User,
  Mic, BookText, Zap, Brain, Lightbulb, GraduationCap, Users,
  Target, Link2, Play, Square, CheckCircle2
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { StudentProgressVideos } from "@/components/student-dashboard/StudentProgressVideos";
import { AIPracticeWeeklyChart } from "@/components/AIPracticeWeeklyChart";
const getActivityConfig = (lang: string) => ({
  in_person_class: { icon: BookOpen, label: lang === "vi" ? "Học với GV Việt Nam" : "Vietnamese Teacher Class", color: "text-blue-500 bg-blue-50" },
  ai_practice: { icon: MessageSquare, label: lang === "vi" ? "Luyện tập AI" : "AI Practice", color: "text-green-500 bg-green-50" },
  video_call: { icon: Video, label: lang === "vi" ? "Học với GV nước ngoài" : "Foreign Teacher Class", color: "text-purple-500 bg-purple-50" },
});

const getFallbackActivityConfig = (lang: string) => ({
  icon: BookText,
  label: lang === "vi" ? "Hoạt động học tập" : "Learning Activity",
  color: "text-slate-500 bg-slate-50",
});

interface ParsedFeedback {
  speech_to_text?: string;
  response_duration?: number;
  pause_detection?: {
    has_pause?: boolean;
    pause_count?: number;
    pause_turns?: number[];
    summary?: string;
  };
  session_length?: number;
  suggestions: string[];
  highlights: string[];
}

const parseFeedbackText = (feedbackText: string | undefined): ParsedFeedback | null => {
  if (!feedbackText) return null;
  const trimmed = feedbackText.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    return JSON.parse(trimmed) as ParsedFeedback;
  } catch {
    return null;
  }
};

interface FeedbackSectionProps {
  icon: React.ReactNode;
  title: string;
  items: string[];
  colorClass: string;
  bulletColor: string;
  language: string;
}

interface StructuredFeedbackItem {
  quote?: string;
  explanation?: string;
  correction?: string;
  spoken?: string;
  expected?: string;
  errorType?: string;
}

const tryParseJSON = (str: string): StructuredFeedbackItem | null => {
  if (!str.startsWith('{')) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

const StructuredItem = ({ item, bulletColor, language }: { item: StructuredFeedbackItem; bulletColor: string; language: string }) => (
  <li className="flex items-start gap-1 pb-1.5 border-b border-border/30 last:border-0">
    <span className={`${bulletColor} mt-0.5`}>•</span>
    <div className="flex-1 space-y-0.5">
      {item.quote && (
        <div>
          <span className="text-muted-foreground/70">{language === "vi" ? "Câu gốc: " : "Original: "}</span>
          <span className="italic text-red-600 dark:text-red-400">"{item.quote}"</span>
        </div>
      )}
      {item.spoken && (
        <div>
          <span className="text-muted-foreground/70">{language === "vi" ? "Phát âm: " : "Pronunciation: "}</span>
          <span className="italic text-red-600 dark:text-red-400">"{item.spoken}"</span>
          {item.expected && (
            <>
              <span className="text-muted-foreground/70"> → </span>
              <span className="italic text-green-600 dark:text-green-400">"{item.expected}"</span>
            </>
          )}
        </div>
      )}
      {item.explanation && (
        <div>
          <span className="text-muted-foreground/70">{language === "vi" ? "Giải thích: " : "Explanation: "}</span>
          <span>{item.explanation}</span>
        </div>
      )}
      {item.correction && (
        <div>
          <span className="text-muted-foreground/70">{language === "vi" ? "Sửa lại: " : "Correction: "}</span>
          <span className="text-green-600 dark:text-green-400">"{item.correction}"</span>
        </div>
      )}
      {item.errorType && (
        <div>
          <span className="text-muted-foreground/70">{language === "vi" ? "Loại lỗi: " : "Error type: "}</span>
          <span className="text-xs px-1.5 py-0.5 bg-muted rounded">{item.errorType}</span>
        </div>
      )}
    </div>
  </li>
);

const FeedbackSection = ({ icon, title, items, colorClass, bulletColor, language }: FeedbackSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const processedItems = (items || [])
    .map(item => {
      if (item == null) return null;
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (!trimmed) return null;
        const parsed = tryParseJSON(trimmed);
        if (parsed) return { type: 'structured' as const, data: parsed };
        return { type: 'text' as const, data: trimmed };
      }
      if (typeof item === 'object') {
        return { type: 'structured' as const, data: item as StructuredFeedbackItem };
      }
      return { type: 'text' as const, data: String(item) };
    })
    .filter((item): item is { type: 'structured'; data: StructuredFeedbackItem } | { type: 'text'; data: string } => item != null);
  
  if (processedItems.length === 0) return null;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={`text-xs font-medium ${colorClass} flex items-center gap-1 hover:opacity-80 transition-opacity`}>
          {icon}
          <span>{title}</span>
          <span className="text-muted-foreground font-normal">({processedItems.length})</span>
          {isOpen ? <ChevronDown className="h-3 w-3 ml-auto" /> : <ChevronRight className="h-3 w-3 ml-auto" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="text-xs text-muted-foreground space-y-1 mt-1 ml-4">
          {processedItems.map((item, i) => (
            item.type === 'structured' ? (
              <StructuredItem key={i} item={item.data} bulletColor={bulletColor} language={language} />
            ) : (
              <li key={i} className="flex items-start gap-1">
                <span className={`${bulletColor} mt-0.5`}>•</span>
                <span className="break-words">{item.data.length > 500 ? item.data.substring(0, 500) + '...' : item.data}</span>
              </li>
            )
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
};

interface CourseRowProps {
  enrollment: MyEnrollment;
  language: string;
  navigate: (path: string) => void;
}

const CourseRow = ({ enrollment, language, navigate }: CourseRowProps) => {
  const { course, paid } = enrollment;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalModules = course.modules.length || 1;

  const currentModuleNum = (() => {
    for (const m of course.modules) {
      if (!m.weekStartDate || !m.weekEndDate) continue;
      const start = new Date(m.weekStartDate);
      const end = new Date(m.weekEndDate);
      end.setHours(23, 59, 59, 999);
      if (today >= start && today <= end) return m.moduleNumber;
    }
    return 1;
  })();

  const progress = Math.round((currentModuleNum / totalModules) * 100);

  return (
    <div
      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={() => navigate("/curriculum")}
    >
      <div className="p-2 rounded-lg bg-primary/10">
        <GraduationCap className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-foreground truncate">{course.name}</p>
          <Badge className="bg-green-500 text-white shrink-0 text-[10px] py-0">
            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
            {language === "vi" ? "Đang học" : "Enrolled"}
          </Badge>
        </div>
        {course.cohortName && (
          <p className="text-xs text-muted-foreground mb-1.5">{course.cohortName}</p>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${paid ? progress : (100 / totalModules)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {language === "vi" ? `Module ${currentModuleNum}/${totalModules}` : `Module ${currentModuleNum}/${totalModules}`}
          </span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  );
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();
  
  const activityConfig = getActivityConfig(language);
  
  const [enrollments, setEnrollments] = useState<MyEnrollment[]>([]);
  const [programs, setPrograms] = useState<ProgramResponse[]>([]);
  const [coursesExpanded, setCoursesExpanded] = useState(false);
  const [programExpanded, setProgramExpanded] = useState<Record<number, boolean>>({});
  const [cohortExpanded, setCohortExpanded] = useState<Record<number, boolean>>({});
  const [learningHistory, setLearningHistory] = useState<LearningHistoryItem[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleProgram = (programId: number) => {
    setProgramExpanded(prev => ({ ...prev, [programId]: !prev[programId] }));
  };

  const toggleCohort = (cohortId: number) => {
    setCohortExpanded(prev => ({ ...prev, [cohortId]: !prev[cohortId] }));
  };

  const enrolledCourseIds = new Set(enrollments.map(e => e.cohortCourseId));

  const fetchData = useCallback(async () => {
    if (!user || !accessToken) return;

    setIsLoading(true);

    try {
      const [enrollmentResult, historyResult, bookingsResult] = await Promise.allSettled([
        api.getMyEnrollments(accessToken, user.profileId),
        api.getStudentLearningHistory(user.profileId),
        api.getStudentBookings(user.profileId),
      ]);

      if (enrollmentResult.status === "fulfilled") {
        setEnrollments(enrollmentResult.value);
      } else {
        console.error("Failed to fetch enrollments:", enrollmentResult.reason);
      }

      if (historyResult.status === "fulfilled") {
        setLearningHistory(historyResult.value);
      } else {
        console.error("Failed to fetch learning history:", historyResult.reason);
        setLearningHistory([]);
      }

      if (bookingsResult.status === "fulfilled") {
        setUpcomingBookings(bookingsResult.value.filter((b) => b.status === "confirmed"));
      } else {
        console.error("Failed to fetch bookings:", bookingsResult.reason);
        setUpcomingBookings([]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || user?.role !== "student") {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, accessToken, isAuthenticated, authLoading, navigate, fetchData]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchData();
    };
    window.addEventListener("learning-history-updated", handleUpdate);
    return () => window.removeEventListener("learning-history-updated", handleUpdate);
  }, [fetchData]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-500">
        <Navigation />
        <main className="container mx-auto px-4 md:px-6 pt-28 pb-16">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 lg:col-span-2" />
            <Skeleton className="h-48" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <FloatingEffects intensity="subtle" />
      <Navigation />

      <main className="container mx-auto px-4 md:px-6 pt-28 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-8">
          <div>
            <Badge variant="secondary" className="mb-4">
              <User className="h-3 w-3 mr-1" />
              {language === "vi" ? "Học sinh" : "Student"}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {language === "vi" ? "Xin chào" : "Hello"}, {user?.fullName}! 👋
            </h1>
            <p className="text-muted-foreground">
              {language === "vi" ? "Tiếp tục hành trình học tiếng Anh của bạn" : "Continue your English learning journey"}
            </p>
          </div>

        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Courses — collapsible list */}
            <Card className="border-border/50">
              <Collapsible open={coursesExpanded} onOpenChange={setCoursesExpanded}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 rounded-t-lg transition-colors select-none">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="flex-1">
                        {language === "vi" ? "Khoá học đang tham gia" : "My Courses"}
                      </span>
                      <Badge variant="secondary" className="text-xs font-normal mr-1">
                        {enrollments.length}
                      </Badge>
                      {coursesExpanded
                        ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>

                {/* Always show first course as preview */}
                {enrollments.length === 0 ? (
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {language === "vi" ? "Bạn chưa tham gia khoá học nào." : "You're not enrolled in any courses yet."}
                    </p>
                  </CardContent>
                ) : (
                  <>
                    {/* First course always visible */}
                    <CardContent className="pt-0 pb-3">
                      <CourseRow enrollment={enrollments[0]} language={language} navigate={navigate} />
                    </CardContent>

                    {/* Remaining courses revealed on expand */}
                    {enrollments.length > 1 && (
                      <CollapsibleContent>
                        <CardContent className="pt-0 space-y-2 border-t border-border/30">
                          {enrollments.slice(1).map((e) => (
                            <CourseRow key={e.enrollmentId} enrollment={e} language={language} navigate={navigate} />
                          ))}
                        </CardContent>
                      </CollapsibleContent>
                    )}
                  </>
                )}
              </Collapsible>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-6 flex flex-col gap-2 bg-white dark:bg-card shadow-sm border-border/50 hover:shadow-md hover:bg-white dark:hover:bg-card transition-shadow"
                onClick={() => navigate("/ai-practice")}
              >
                <MessageSquare className="h-8 w-8 text-green-500" />
                <span className="text-xs font-medium">{language === "vi" ? "Luyện tập với AI" : "Practice with AI"}</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 flex flex-col gap-2 bg-white dark:bg-card shadow-sm border-border/50 hover:shadow-md hover:bg-white dark:hover:bg-card transition-shadow"
                onClick={() => navigate("/booking")}
              >
                <Video className="h-8 w-8 text-purple-500" />
                <span className="text-xs font-medium">{language === "vi" ? "Đặt lịch với GV nước ngoài" : "Book Foreign Teacher"}</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 flex flex-col gap-2 bg-white dark:bg-card shadow-sm border-border/50 hover:shadow-md hover:bg-white dark:hover:bg-card transition-shadow"
                onClick={() => navigate("/connections")}
              >
                <Users className="h-8 w-8 text-blue-500" />
                <span className="text-xs font-medium">{language === "vi" ? "Kết nối" : "Connections"}</span>
              </Button>
            </div>

            {/* Progress Videos - Before & After */}
            {enrollments.length > 0 && (
              <StudentProgressVideos 
                studentId={user!.profileId} 
                courseId={enrollments[0].course.courseId} 
              />
            )}

            {/* Upcoming Bookings */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  {language === "vi" ? "Lịch học với GV nước ngoài sắp tới" : "Upcoming Foreign Teacher Sessions"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingBookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => navigate(`/booking/${booking.id}`)}
                      >
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Video className="h-5 w-5 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{booking.teacher?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(booking.bookingDate), "EEEE, dd/MM/yyyy", { locale: vi })}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-medium">{booking.slotStartTime}</p>
                          <div className="flex items-center gap-1 justify-end">
                            {booking.meetingStatus === 'pending' && (
                              <Badge variant="outline" className="text-xs gap-1 border-yellow-500 text-yellow-600">
                                <Clock className="h-2.5 w-2.5" /> {language === "vi" ? "Chưa diễn ra" : "Pending"}
                              </Badge>
                            )}
                            {booking.meetingStatus === 'in_progress' && (
                              <Badge className="text-xs gap-1 bg-green-500">
                                <Play className="h-2.5 w-2.5" /> {language === "vi" ? "Đang diễn ra" : "In Progress"}
                              </Badge>
                            )}
                            {booking.meetingStatus === 'ended' && (
                              <Badge className="text-xs gap-1 bg-gray-500">
                                <Square className="h-2.5 w-2.5" /> {language === "vi" ? "Đã kết thúc" : "Ended"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">{language === "vi" ? "Chưa có lịch hẹn nào" : "No upcoming appointments"}</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate("/booking")}>
                      {language === "vi" ? "Đặt lịch ngay" : "Book Now"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Practice Stats + Learning History */}
          <div className="space-y-6">
            {/* AI Practice Weekly Chart */}
            <AIPracticeWeeklyChart
              studentId={user!.profileId}
              language={language}
            />

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">
                  {language === "vi" ? "Hoạt động gần đây" : "Recent Activity"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {learningHistory.length > 0 ? (
                  <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                    {learningHistory.slice(0, 10).map((item) => {
                      const config = activityConfig[item.activityType] || getFallbackActivityConfig(language);
                      const Icon = config.icon;
                      const isExpanded = expandedItems.has(item.id);
                      const parsedFeedback = parseFeedbackText(item.aiFeedback?.feedbackText);
                      const hasAiFeedback =
                        item.activityType === "ai_practice" ||
                        !!parsedFeedback ||
                        !!item.aiFeedback?.speechToText;
                      const hasTeacherFeedback = !!item.teacherFeedback?.feedbackText;
                      const hasFeedback = hasAiFeedback || hasTeacherFeedback;
                      
                      return (
                        <Collapsible 
                          key={item.id} 
                          open={isExpanded} 
                          onOpenChange={() => hasFeedback && toggleExpanded(item.id)}
                        >
                          <CollapsibleTrigger asChild disabled={!hasFeedback}>
                            <div className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${hasFeedback ? 'cursor-pointer hover:bg-muted/50' : ''} ${isExpanded ? 'bg-muted/30' : ''}`}>
                              <div className={`p-1.5 rounded-lg ${config.color}`}>
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{config.label}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(parseISO(item.startTime), "dd/MM HH:mm")}
                                </p>
                              </div>
                              {hasTeacherFeedback && (
                                <Badge variant="outline" className="text-xs shrink-0 border-purple-300 text-purple-600">
                                  <MessageSquare className="h-3 w-3 mr-0.5" />
                                  {language === "vi" ? "Nhận xét" : "Feedback"}
                                </Badge>
                              )}
                              {hasFeedback && (
                                <div className="shrink-0 text-muted-foreground">
                                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </div>
                              )}
                            </div>
                          </CollapsibleTrigger>
                          
                          {parsedFeedback && (
                            <CollapsibleContent>
                              <div className="ml-8 mt-1 mb-2 p-3 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-100/50 dark:border-green-900/30 space-y-3">
                                {/* Speaking analytics summary */}
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">{language === "vi" ? "Session:" : "Session:"}</span>{" "}
                                    <span className="font-medium">
                                      {Math.round(parsedFeedback.session_length || 0)} {language === "vi" ? "lượt" : "turns"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">{language === "vi" ? "Response:" : "Response:"}</span>{" "}
                                    <span className="font-medium">{(parsedFeedback.response_duration || 0).toFixed(1)}s</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">{language === "vi" ? "Pause:" : "Pause:"}</span>{" "}
                                    <span className="font-medium">{parsedFeedback.pause_detection?.pause_count || 0}</span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                  {language === "vi"
                                    ? "Session = tổng số lượt nói qua lại; Response = thời lượng trung bình cho 1 câu nói."
                                    : "Session = total back-and-forth speaking turns; Response = average duration per sentence."}
                                </p>

                                {/* Highlights - Collapsible */}
                                <FeedbackSection
                                  icon={<Star className="h-3 w-3" />}
                                  title={language === "vi" ? "Điểm nổi bật" : "Highlights"}
                                  items={parsedFeedback.highlights || []}
                                  colorClass="text-green-700 dark:text-green-400"
                                  bulletColor="text-green-500"
                                  language={language}
                                />
                                
                                {/* Suggestions - Collapsible */}
                                <FeedbackSection
                                  icon={<Lightbulb className="h-3 w-3" />}
                                  title={language === "vi" ? "Gợi ý cải thiện" : "Improvement Suggestions"}
                                  items={parsedFeedback.suggestions || []}
                                  colorClass="text-amber-700 dark:text-amber-400"
                                  bulletColor="text-amber-500"
                                  language={language}
                                />
                              </div>
                            </CollapsibleContent>
                          )}

                          {!parsedFeedback && item.activityType === "ai_practice" && (
                            <CollapsibleContent>
                              <div className="ml-8 mt-1 mb-2 p-3 rounded-lg border border-amber-200/60 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-800/40">
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                  {language === "vi"
                                    ? "Buổi luyện tập này chưa có dữ liệu phân tích chi tiết do lỗi đồng bộ trước đó. Các buổi mới sẽ hiển thị bình thường."
                                    : "This practice session has no detailed analytics due to a previous sync error. New sessions will display normally."}
                                </p>
                              </div>
                            </CollapsibleContent>
                          )}

                          {/* Teacher Feedback for Video Call */}
                          {hasTeacherFeedback && (
                            <CollapsibleContent>
                              <div 
                                className="ml-8 mt-1 mb-2 p-3 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg border border-purple-100/50 dark:border-purple-900/30 space-y-2 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                                onClick={() => item.bookingId && navigate(`/booking/${item.bookingId}`)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400">
                                    <User className="h-4 w-4" />
                                    <span>{language === "vi" ? "Nhận xét từ giáo viên" : "Teacher Feedback"} {item.teacherFeedback?.teacherName && `(${item.teacherFeedback.teacherName})`}</span>
                                  </div>
                                  {item.bookingId && (
                                    <Badge variant="outline" className="text-xs border-purple-300 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900">
                                      <Video className="h-3 w-3 mr-1" />
                                      {language === "vi" ? "Xem chi tiết & Đánh giá" : "View Details & Rate"}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                                  {item.teacherFeedback?.feedbackText}
                                </p>
                                {item.teacherFeedback?.improvementSuggestions && (
                                  <div className="mt-2 pt-2 border-t border-purple-100/50 dark:border-purple-900/30">
                                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                      <Lightbulb className="h-3 w-3" />
                                      {language === "vi" ? "Gợi ý cải thiện" : "Improvement Suggestions"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {item.teacherFeedback.improvementSuggestions}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          )}
                        </Collapsible>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {language === "vi" ? "Chưa có hoạt động nào" : "No activities yet"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;

