import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";
import type { Enrollment, LearningHistoryItem, Booking } from "@/types";
import { 
  BookOpen, Calendar, Video, MessageSquare, Star, 
  ChevronRight, ChevronDown, Clock, User, LogOut,
  Mic, BookText, Zap, Brain, Lightbulb, GraduationCap, Users
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

const activityConfig = {
  in_person_class: { icon: BookOpen, label: "Học trên lớp", color: "text-blue-500 bg-blue-50" },
  ai_practice: { icon: MessageSquare, label: "Luyện tập AI", color: "text-green-500 bg-green-50" },
  video_call: { icon: Video, label: "Video Call", color: "text-purple-500 bg-purple-50" },
};

interface ParsedFeedback {
  overall: number;
  pronunciation: number;
  grammar: number;
  vocabulary: number;
  fluency: number;
  coherence: number;
  suggestions: string[];
  highlights: string[];
  // New detailed fields
  pronunciationIssues?: string[];
  grammarIssues?: string[];
  vocabularyNotes?: string[];
  fluencyNotes?: string[];
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

// Collapsible feedback section component
interface FeedbackSectionProps {
  icon: React.ReactNode;
  title: string;
  items: string[];
  colorClass: string;
  bulletColor: string;
}

const FeedbackSection = ({ icon, title, items, colorClass, bulletColor }: FeedbackSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!items?.length) return null;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={`text-xs font-medium ${colorClass} flex items-center gap-1 hover:opacity-80 transition-opacity`}>
          {icon}
          <span>{title}</span>
          <span className="text-muted-foreground font-normal">({items.length})</span>
          {isOpen ? <ChevronDown className="h-3 w-3 ml-auto" /> : <ChevronRight className="h-3 w-3 ml-auto" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="text-xs text-muted-foreground space-y-0.5 mt-1 ml-4">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-1">
              <span className={`${bulletColor} mt-0.5`}>•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
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

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [enrollmentData, historyData, bookingsData] = await Promise.all([
        api.getStudentEnrollment(user.profileId),
        api.getStudentLearningHistory(user.profileId),
        api.getStudentBookings(user.profileId),
      ]);
      setEnrollment(enrollmentData);
      setLearningHistory(historyData);
      setUpcomingBookings(bookingsData.filter(b => b.status === "confirmed"));
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
  }, [user, isAuthenticated, authLoading, navigate, fetchData]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchData();
    };
    window.addEventListener("learning-history-updated", handleUpdate);
    return () => window.removeEventListener("learning-history-updated", handleUpdate);
  }, [fetchData]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
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
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 md:px-6 pt-28 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Badge variant="secondary" className="mb-4">
              <User className="h-3 w-3 mr-1" />
              Học sinh
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Xin chào, {user?.fullName}! 👋
            </h1>
            <p className="text-muted-foreground">
              Tiếp tục hành trình học tiếng Anh của bạn
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Course */}
            {enrollment && (
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Khoá học đang tham gia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-foreground">{enrollment.course.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Module {enrollment.currentModuleNumber} / {enrollment.course.modules?.length || 8}
                      </p>
                    </div>
                    <Badge variant="default">Đang học</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tiến độ</span>
                      <span className="font-medium">
                        {Math.round((enrollment.currentModuleNumber / (enrollment.course.modules?.length || 8)) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(enrollment.currentModuleNumber / (enrollment.course.modules?.length || 8)) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                </CardContent>
              </Card>
            )}

            {/* Curriculum Card */}
            {enrollment && (
              <Card 
                className="border-border/50 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                onClick={() => navigate("/curriculum")}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Chương trình
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      Thời lượng 8 tuần
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-4 gap-2">
                    {(enrollment.course.modules || []).slice(0, 8).map((module) => {
                      // Use week-based status
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const weekStart = new Date(module.weekStartDate);
                      const weekEnd = new Date(module.weekEndDate);
                      weekEnd.setHours(23, 59, 59, 999);
                      
                      const courseModules = enrollment.course.modules || [];
                      const courseStarted = courseModules.length > 0 && today >= new Date(courseModules[0].weekStartDate);
                      
                      let status: 'current' | 'completed' | 'locked';
                      if (!courseStarted) {
                        status = module.moduleNumber === 1 ? 'current' : 'locked';
                      } else if (today > weekEnd) {
                        status = 'completed';
                      } else if (today >= weekStart && today <= weekEnd) {
                        status = 'current';
                      } else {
                        status = 'locked';
                      }
                      
                      return (
                        <div 
                          key={module.id}
                          className={`p-2 rounded-lg text-center text-xs font-medium transition-colors ${
                            status === 'current'
                              ? "bg-primary text-primary-foreground ring-2 ring-primary/20" 
                              : status === 'completed'
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <div className="font-bold">M{module.moduleNumber}</div>
                          <div className="truncate text-[10px] mt-0.5 opacity-80">
                            {status === 'current' ? "Đang học" : status === 'completed' ? "Xong" : "Chờ"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-6 flex flex-col gap-2 bg-white dark:bg-card shadow-sm border-border/50 hover:shadow-md hover:bg-white dark:hover:bg-card transition-shadow"
                onClick={() => navigate("/ai-practice")}
              >
                <MessageSquare className="h-8 w-8 text-green-500" />
                <span className="text-xs font-medium">Luyện tập với AI</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 flex flex-col gap-2 bg-white dark:bg-card shadow-sm border-border/50 hover:shadow-md hover:bg-white dark:hover:bg-card transition-shadow"
                onClick={() => navigate("/booking")}
              >
                <Video className="h-8 w-8 text-purple-500" />
                <span className="text-xs font-medium">Đặt lịch Video Call</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 flex flex-col gap-2 bg-white dark:bg-card shadow-sm border-border/50 hover:shadow-md hover:bg-white dark:hover:bg-card transition-shadow"
                onClick={() => navigate("/connections")}
              >
                <Users className="h-8 w-8 text-blue-500" />
                <span className="text-xs font-medium">Kết nối</span>
              </Button>
            </div>

            {/* Upcoming Bookings */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Lịch Video Call sắp tới
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
                        <div className="text-right">
                          <p className="font-medium">{booking.slotStartTime}</p>
                          <Badge variant="secondary" className="text-xs">
                            {booking.module?.title}
                          </Badge>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Chưa có lịch hẹn nào</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate("/booking")}>
                      Đặt lịch ngay
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Learning History */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">
                  Hoạt động gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                {learningHistory.length > 0 ? (
                  <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                    {learningHistory.slice(0, 10).map((item) => {
                      const config = activityConfig[item.activityType];
                      const Icon = config.icon;
                      const isExpanded = expandedItems.has(item.id);
                      const parsedFeedback = parseFeedbackText(item.aiFeedback?.feedbackText);
                      const hasFeedback = !!parsedFeedback || !!item.aiFeedback?.overallScore;
                      
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
                              {item.aiFeedback?.overallScore && (
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  <Star className="h-3 w-3 mr-0.5" />
                                  {item.aiFeedback.overallScore}
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
                                {/* Score breakdown */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <Mic className="h-3 w-3 text-blue-500" />
                                    <span className="text-muted-foreground">Phát âm:</span>
                                    <span className="font-medium">{parsedFeedback.pronunciation}/10</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <BookText className="h-3 w-3 text-purple-500" />
                                    <span className="text-muted-foreground">Ngữ pháp:</span>
                                    <span className="font-medium">{parsedFeedback.grammar}/10</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Brain className="h-3 w-3 text-orange-500" />
                                    <span className="text-muted-foreground">Từ vựng:</span>
                                    <span className="font-medium">{parsedFeedback.vocabulary}/10</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Zap className="h-3 w-3 text-yellow-500" />
                                    <span className="text-muted-foreground">Lưu loát:</span>
                                    <span className="font-medium">{parsedFeedback.fluency}/10</span>
                                  </div>
                                </div>

                                {/* Pronunciation Issues - Collapsible */}
                                <FeedbackSection
                                  icon={<Mic className="h-3 w-3" />}
                                  title="Lỗi phát âm"
                                  items={parsedFeedback.pronunciationIssues || []}
                                  colorClass="text-blue-700 dark:text-blue-400"
                                  bulletColor="text-blue-500"
                                />

                                {/* Grammar Issues - Collapsible */}
                                <FeedbackSection
                                  icon={<BookText className="h-3 w-3" />}
                                  title="Lỗi ngữ pháp"
                                  items={parsedFeedback.grammarIssues || []}
                                  colorClass="text-purple-700 dark:text-purple-400"
                                  bulletColor="text-purple-500"
                                />

                                {/* Vocabulary Notes - Collapsible */}
                                <FeedbackSection
                                  icon={<Brain className="h-3 w-3" />}
                                  title="Ghi chú từ vựng"
                                  items={parsedFeedback.vocabularyNotes || []}
                                  colorClass="text-orange-700 dark:text-orange-400"
                                  bulletColor="text-orange-500"
                                />

                                {/* Fluency Notes - Collapsible */}
                                <FeedbackSection
                                  icon={<Zap className="h-3 w-3" />}
                                  title="Ghi chú lưu loát"
                                  items={parsedFeedback.fluencyNotes || []}
                                  colorClass="text-yellow-700 dark:text-yellow-400"
                                  bulletColor="text-yellow-500"
                                />
                                
                                {/* Highlights - Collapsible */}
                                <FeedbackSection
                                  icon={<Star className="h-3 w-3" />}
                                  title="Điểm nổi bật"
                                  items={parsedFeedback.highlights || []}
                                  colorClass="text-green-700 dark:text-green-400"
                                  bulletColor="text-green-500"
                                />
                                
                                {/* Suggestions - Collapsible */}
                                <FeedbackSection
                                  icon={<Lightbulb className="h-3 w-3" />}
                                  title="Gợi ý cải thiện"
                                  items={parsedFeedback.suggestions || []}
                                  colorClass="text-amber-700 dark:text-amber-400"
                                  bulletColor="text-amber-500"
                                />
                              </div>
                            </CollapsibleContent>
                          )}
                        </Collapsible>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Chưa có hoạt động nào
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

