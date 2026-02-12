import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  User,
  BookOpen,
  History,
  Star,
  ChevronDown,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Target,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { api } from "@/services/api";
import type { LearningHistoryItem } from "@/types";

interface BookingDetail {
  id: number;
  bookingDate: string;
  slotStartTime: string;
  slotEndTime: string;
  status: string;
  notes: string | null;
  student: {
    id: number;
    name: string;
    email: string;
    grade: string;
    cefrLevel: string;
  };
  module: {
    id: number;
    moduleNumber: number;
    title: string;
    topic: string;
  };
}

const StudentSessionDetailPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, isLoading: authLoading } = useAuth();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [learningHistory, setLearningHistory] = useState<LearningHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const fetchData = useCallback(async () => {
    if (!bookingId || !accessToken) return;

    try {
      // Fetch booking details
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error("Failed to fetch booking");

      const bookingData = await response.json();
      setBooking(bookingData);

      // Fetch student's learning history
      if (bookingData.student?.id) {
        const history = await api.getStudentLearningHistory(bookingData.student.id);
        setLearningHistory(history);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, accessToken]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || user?.role !== "teacher") {
      navigate("/login");
      return;
    }

    fetchData();
  }, [authLoading, isAuthenticated, user, navigate, fetchData]);

  const toggleExpand = (id: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ai_practice":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "video_call":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "in_person_class":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case "ai_practice":
        return "Luyện tập AI";
      case "video_call":
        return "Học với GV nước ngoài";
      case "in_person_class":
        return "Học với GV Việt Nam";
      default:
        return type;
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    return "text-red-500";
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-28 pb-16 max-w-5xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </main>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-28 pb-16 max-w-5xl">
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy buổi học</h2>
            <Button onClick={() => navigate("/teacher-dashboard")}>
              Quay lại Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 pt-28 pb-16 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/teacher-dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Chi tiết buổi học</h1>
            <p className="text-muted-foreground">
              Thông tin học sinh và lịch sử học tập
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Meeting Details */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-500" />
                Thông tin cuộc họp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg bg-primary/20 text-primary">
                    {booking.student?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{booking.student?.name}</p>
                  <p className="text-sm text-muted-foreground">{booking.student?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{booking.student?.grade}</Badge>
                    <Badge variant="outline">{booking.student?.cefrLevel}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày</p>
                    <p className="font-medium">
                      {format(parseISO(booking.bookingDate), "EEEE, dd MMMM yyyy", { locale: vi })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian</p>
                    <p className="font-medium">
                      {booking.slotStartTime} - {booking.slotEndTime || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Module</p>
                    <p className="font-medium">
                      Module {booking.module?.moduleNumber}: {booking.module?.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                  <Target className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Chủ đề</p>
                    <p className="font-medium">{booking.module?.topic || booking.module?.title}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Badge
                  variant={booking.status === "confirmed" ? "default" : "secondary"}
                  className={
                    booking.status === "confirmed"
                      ? "bg-green-500"
                      : booking.status === "completed"
                      ? "bg-blue-500"
                      : ""
                  }
                >
                  {booking.status === "confirmed"
                    ? "Đã xác nhận"
                    : booking.status === "completed"
                    ? "Đã hoàn thành"
                    : booking.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Student Info */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Thông tin học sinh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-xl text-center">
                  <p className="text-3xl font-bold text-primary">
                    {learningHistory.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Hoạt động</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl text-center">
                  <p className="text-3xl font-bold text-green-500">
                    {learningHistory.filter((h) => h.aiFeedback?.overallScore && h.aiFeedback.overallScore >= 7).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Điểm cao (≥7)</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Điểm trung bình</span>
                </div>
                <p className="text-3xl font-bold">
                  {learningHistory.filter((h) => h.aiFeedback?.overallScore).length > 0
                    ? (
                        learningHistory
                          .filter((h) => h.aiFeedback?.overallScore)
                          .reduce((acc, h) => acc + (h.aiFeedback?.overallScore || 0), 0) /
                        learningHistory.filter((h) => h.aiFeedback?.overallScore).length
                      ).toFixed(1)
                    : "N/A"}
                  <span className="text-lg text-muted-foreground">/10</span>
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Phân loại hoạt động</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <MessageSquare className="h-3 w-3" />
                    AI: {learningHistory.filter((h) => h.activityType === "ai_practice").length}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Video className="h-3 w-3" />
                    Video: {learningHistory.filter((h) => h.activityType === "video_call").length}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <BookOpen className="h-3 w-3" />
                    Lớp: {learningHistory.filter((h) => h.activityType === "in_person_class").length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning History */}
        <Card className="border-border/50 mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <History className="h-5 w-5 text-orange-500" />
              Lịch sử học tập của {booking.student?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {learningHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Chưa có lịch sử học tập</p>
              </div>
            ) : (
              <div className="space-y-3">
                {learningHistory.map((item) => (
                  <Collapsible
                    key={item.id}
                    open={expandedItems.has(item.id)}
                    onOpenChange={() => toggleExpand(item.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-3 p-3 rounded-lg transition-colors border cursor-pointer hover:bg-muted/50 hover:border-border/50 border-transparent">
                        {getActivityIcon(item.activityType)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {getActivityLabel(item.activityType)} - Module {item.module?.moduleNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.module?.title} • {format(parseISO(item.startTime), "dd/MM/yyyy 'lúc' HH:mm")}
                          </p>
                        </div>
                        {item.aiFeedback?.overallScore && (
                          <div className="flex items-center gap-1">
                            <Star className={`h-4 w-4 ${getScoreColor(item.aiFeedback.overallScore)}`} />
                            <span className={`font-bold ${getScoreColor(item.aiFeedback.overallScore)}`}>
                              {item.aiFeedback.overallScore}
                            </span>
                          </div>
                        )}
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform ${
                            expandedItems.has(item.id) ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-7 mt-2 p-4 bg-muted/30 rounded-lg space-y-3">
                        {item.aiFeedback && (() => {
                          // Try to parse JSON feedback
                          let parsedFeedback: Record<string, unknown> | null = null;
                          try {
                            if (item.aiFeedback.feedbackText.startsWith('{')) {
                              parsedFeedback = JSON.parse(item.aiFeedback.feedbackText);
                            }
                          } catch {
                            parsedFeedback = null;
                          }

                          if (parsedFeedback) {
                            return (
                              <>
                                {/* Highlights */}
                                {Array.isArray(parsedFeedback.highlights) && parsedFeedback.highlights.length > 0 && (
                                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <p className="text-xs font-medium text-green-600 mb-2">✨ Điểm tốt</p>
                                    <ul className="text-sm space-y-1">
                                      {(parsedFeedback.highlights as string[]).map((h, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <span className="text-green-500">•</span>
                                          <span>{h}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Pronunciation Issues */}
                                {Array.isArray(parsedFeedback.pronunciationIssues) && parsedFeedback.pronunciationIssues.length > 0 && (
                                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="text-xs font-medium text-red-600 mb-2">🎤 Phát âm cần cải thiện</p>
                                    <ul className="text-sm space-y-1">
                                      {(parsedFeedback.pronunciationIssues as string[]).map((p, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <span className="text-red-500">•</span>
                                          <span>{p}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Grammar Issues */}
                                {Array.isArray(parsedFeedback.grammarIssues) && parsedFeedback.grammarIssues.length > 0 && (
                                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <p className="text-xs font-medium text-orange-600 mb-2">📝 Ngữ pháp cần sửa</p>
                                    <ul className="text-sm space-y-1">
                                      {(parsedFeedback.grammarIssues as string[]).map((g, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <span className="text-orange-500">•</span>
                                          <span>{g}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Vocabulary Notes */}
                                {Array.isArray(parsedFeedback.vocabularyNotes) && parsedFeedback.vocabularyNotes.length > 0 && (
                                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-xs font-medium text-blue-600 mb-2">📚 Từ vựng</p>
                                    <ul className="text-sm space-y-1">
                                      {(parsedFeedback.vocabularyNotes as string[]).map((v, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <span className="text-blue-500">•</span>
                                          <span>{v}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Fluency Notes */}
                                {Array.isArray(parsedFeedback.fluencyNotes) && parsedFeedback.fluencyNotes.length > 0 && (
                                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <p className="text-xs font-medium text-purple-600 mb-2">🎯 Độ lưu loát</p>
                                    <ul className="text-sm space-y-1">
                                      {(parsedFeedback.fluencyNotes as string[]).map((f, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <span className="text-purple-500">•</span>
                                          <span>{f}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Suggestions */}
                                {Array.isArray(parsedFeedback.suggestions) && parsedFeedback.suggestions.length > 0 && (
                                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <p className="text-xs font-medium text-yellow-600 mb-2">💡 Gợi ý cải thiện</p>
                                    <ul className="text-sm space-y-1">
                                      {(parsedFeedback.suggestions as string[]).map((s, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <span className="text-yellow-500">•</span>
                                          <span>{s}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </>
                            );
                          }

                          // Fallback to simple display
                          return (
                            <>
                              <div>
                                <p className="text-sm font-medium mb-1 flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  Phản hồi AI
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {item.aiFeedback.feedbackText}
                                </p>
                              </div>

                              {item.aiFeedback.pronunciationNotes && (
                                <div className="p-3 bg-background rounded-lg">
                                  <p className="text-xs font-medium text-red-500 mb-1">🎤 Phát âm</p>
                                  <p className="text-sm">{item.aiFeedback.pronunciationNotes}</p>
                                </div>
                              )}

                              {item.aiFeedback.grammarNotes && (
                                <div className="p-3 bg-background rounded-lg">
                                  <p className="text-xs font-medium text-orange-500 mb-1">📝 Ngữ pháp</p>
                                  <p className="text-sm">{item.aiFeedback.grammarNotes}</p>
                                </div>
                              )}

                              {item.aiFeedback.vocabularyNotes && (
                                <div className="p-3 bg-background rounded-lg">
                                  <p className="text-xs font-medium text-blue-500 mb-1">📚 Từ vựng</p>
                                  <p className="text-sm">{item.aiFeedback.vocabularyNotes}</p>
                                </div>
                              )}

                              {item.aiFeedback.fluencyNotes && (
                                <div className="p-3 bg-background rounded-lg">
                                  <p className="text-xs font-medium text-green-500 mb-1">🎯 Lưu loát</p>
                                  <p className="text-sm">{item.aiFeedback.fluencyNotes}</p>
                                </div>
                              )}
                            </>
                          );
                        })()}

                        {item.teacherFeedback && (
                          <div className="border-t pt-3">
                            <p className="text-sm font-medium mb-1 flex items-center gap-1">
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                              Nhận xét giáo viên ({item.teacherFeedback.teacherName})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.teacherFeedback.feedbackText}
                            </p>
                            {item.teacherFeedback.improvementSuggestions && (
                              <p className="text-sm mt-2">
                                <span className="font-medium">Gợi ý cải thiện:</span>{" "}
                                {item.teacherFeedback.improvementSuggestions}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudentSessionDetailPage;

