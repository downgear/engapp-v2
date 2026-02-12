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
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  User,
  BookOpen,
  Mail,
  Phone,
  Star,
  MapPin,
  GraduationCap,
  AlertCircle,
  Play,
  Square,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface BookingDetail {
  id: number;
  bookingDate: string;
  slotStartTime: string;
  slotEndTime: string;
  status: string;
  meetingStatus: 'pending' | 'in_progress' | 'ended';
  meetingLink?: string | null;
  googleEventId?: string | null;
  endedAt?: string | null;
  teacherFeedback?: string | null;
  studentRating?: number | null;
  studentComment?: string | null;
  createdAt: string;
  student?: {
    id: number;
    name: string;
  };
  teacher: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    bio?: string;
    specialties?: string | string[];
    teacherType: 'in_person' | 'video_call' | 'both';
  };
  module: {
    id: number;
    moduleNumber: number;
    title: string;
    topic: string;
  };
}

const BookingDetailPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Feedback states
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [studentRating, setStudentRating] = useState(0);
  const [studentComment, setStudentComment] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

  const fetchData = useCallback(async () => {
    if (!bookingId || !accessToken) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error("Failed to fetch booking");

      const bookingData = await response.json();
      setBooking(bookingData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, accessToken]);

  useEffect(() => {
    if (authLoading) return;

    // Allow both students and teachers to view booking details
    if (!isAuthenticated || (user?.role !== "student" && user?.role !== "teacher")) {
      navigate("/login");
      return;
    }

    fetchData();
  }, [authLoading, isAuthenticated, user, navigate, fetchData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Đã xác nhận</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Đã hoàn thành</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMeetingStatusBadge = (meetingStatus: string) => {
    switch (meetingStatus) {
      case "pending":
        return <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600"><Clock className="h-3 w-3" /> Chưa diễn ra</Badge>;
      case "in_progress":
        return <Badge className="bg-green-500 gap-1"><Play className="h-3 w-3" /> Đang diễn ra</Badge>;
      case "ended":
        return <Badge className="bg-gray-500 gap-1"><Square className="h-3 w-3" /> Đã kết thúc</Badge>;
      default:
        return <Badge variant="secondary">{meetingStatus}</Badge>;
    }
  };

  // Meeting actions
  const handleEndMeeting = async () => {
    if (!accessToken || !booking || user?.role !== 'teacher') return;
    setIsActionLoading(true);
    try {
      const updated = await api.endMeeting(accessToken, booking.id, user.profileId);
      setBooking({ ...booking, ...updated });
      setShowFeedbackForm(true);
      toast({ title: "Thành công", description: "Đã kết thúc buổi học" });
    } catch (error) {
      console.error("Failed to end meeting:", error);
      toast({ title: "Lỗi", description: "Không thể kết thúc buổi học", variant: "destructive" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!accessToken || !booking || !teacherFeedback.trim()) return;
    setIsActionLoading(true);
    try {
      const updated = await api.addTeacherFeedback(accessToken, booking.id, user?.profileId || 0, teacherFeedback);
      setBooking({ ...booking, ...updated });
      setShowFeedbackForm(false);
      toast({ title: "Thành công", description: "Đã gửi nhận xét cho học sinh" });
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast({ title: "Lỗi", description: "Không thể gửi nhận xét", variant: "destructive" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!accessToken || !booking || studentRating === 0) return;
    setIsActionLoading(true);
    try {
      const updated = await api.addStudentRating(accessToken, booking.id, user?.profileId || 0, studentRating, studentComment);
      setBooking({ ...booking, ...updated });
      setShowRatingForm(false);
      toast({ title: "Thành công", description: "Đã gửi đánh giá cho giáo viên" });
    } catch (error) {
      console.error("Failed to submit rating:", error);
      toast({ title: "Lỗi", description: "Không thể gửi đánh giá", variant: "destructive" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const getTeacherTypeBadge = (type: string) => {
    switch (type) {
      case "in_person":
        return <Badge variant="outline" className="gap-1"><MapPin className="h-3 w-3" /> GV Việt Nam</Badge>;
      case "video_call":
        return <Badge variant="outline" className="gap-1"><Video className="h-3 w-3" /> GV nước ngoài</Badge>;
      case "both":
        return <Badge variant="outline" className="gap-1"><GraduationCap className="h-3 w-3" /> Cả hai</Badge>;
      default:
        return null;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
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
        <main className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy lịch hẹn</h2>
            <Button onClick={() => navigate(user?.role === 'teacher' ? "/teacher-dashboard" : "/student-dashboard")}>
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

      <main className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(user?.role === 'teacher' ? "/teacher-dashboard" : "/student-dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Chi tiết lịch hẹn</h1>
            <p className="text-muted-foreground">
              Thông tin buổi học với GV nước ngoài
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
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Chủ đề</p>
                    <p className="font-medium">{booking.module?.topic || booking.module?.title}</p>
                  </div>
                </div>

                {/* Google Meet Link */}
                {booking.meetingLink ? (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                    <Video className="h-5 w-5 text-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">Link Google Meet</p>
                      <a 
                        href={booking.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-green-600 hover:text-green-700 hover:underline truncate block"
                      >
                        {booking.meetingLink}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-dashed">
                    <Video className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Link Google Meet</p>
                      <p className="font-medium text-muted-foreground italic">Chưa có - chờ giáo viên kết nối Google</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trạng thái đặt lịch</span>
                  {getStatusBadge(booking.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trạng thái buổi học</span>
                  {getMeetingStatusBadge(booking.meetingStatus || 'pending')}
                </div>
              </div>

              {/* Action buttons */}
              {booking.status === "confirmed" && (
                <div className="pt-2 space-y-2">
                  {booking.meetingLink ? (
                    <>
                      <Button 
                        className="w-full gap-2" 
                        variant="default"
                        onClick={() => window.open(booking.meetingLink!, '_blank')}
                      >
                        <Video className="h-4 w-4" />
                        Tham gia Google Meet
                      </Button>
                      
                      {/* Teacher: End Meeting Button */}
                      {user?.role === 'teacher' && booking.meetingStatus !== 'ended' && (
                        <Button 
                          className="w-full gap-2" 
                          variant="destructive"
                          onClick={handleEndMeeting}
                          disabled={isActionLoading}
                        >
                          {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
                          Kết thúc buổi học
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button className="w-full gap-2" variant="secondary" disabled>
                        <Video className="h-4 w-4" />
                        Đang chờ link họp
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Link Google Meet sẽ được tạo khi giáo viên kết nối Google Calendar
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Teacher Feedback Section */}
              {booking.meetingStatus === 'ended' && user?.role === 'teacher' && !booking.teacherFeedback && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium">Nhận xét cho học sinh</h4>
                  </div>
                  <Textarea 
                    placeholder="Nhập nhận xét về buổi học..."
                    value={teacherFeedback}
                    onChange={(e) => setTeacherFeedback(e.target.value)}
                    className="mb-2"
                  />
                  <Button 
                    className="w-full" 
                    onClick={handleSubmitFeedback}
                    disabled={!teacherFeedback.trim() || isActionLoading}
                  >
                    {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Gửi nhận xét
                  </Button>
                </div>
              )}

              {/* Display Teacher Feedback */}
              {booking.teacherFeedback && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Nhận xét từ giáo viên</span>
                  </div>
                  <p className="text-sm bg-muted/30 p-3 rounded-lg">{booking.teacherFeedback}</p>
                </div>
              )}

              {/* Student Rating Section */}
              {booking.meetingStatus === 'ended' && user?.role === 'student' && !booking.studentRating && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h4 className="font-medium">Đánh giá giáo viên</h4>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setStudentRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star 
                          className={`h-8 w-8 ${star <= studentRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea 
                    placeholder="Nhập nhận xét (không bắt buộc)..."
                    value={studentComment}
                    onChange={(e) => setStudentComment(e.target.value)}
                    className="mb-2"
                  />
                  <Button 
                    className="w-full" 
                    onClick={handleSubmitRating}
                    disabled={studentRating === 0 || isActionLoading}
                  >
                    {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Gửi đánh giá
                  </Button>
                </div>
              )}

              {/* Display Student Rating */}
              {booking.studentRating && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Đánh giá từ học sinh</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`h-5 w-5 ${star <= (booking.studentRating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  {booking.studentComment && (
                    <p className="text-sm bg-muted/30 p-3 rounded-lg">{booking.studentComment}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Card - Show Student for Teacher, Teacher for Student */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                {user?.role === 'teacher' ? 'Học sinh' : 'Giảng viên'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.role === 'teacher' ? (
                /* Student Profile for Teacher View */
                <>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-2xl bg-blue-500/20 text-blue-600">
                        {booking.student?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-xl">{booking.student?.name || "Học sinh"}</p>
                      <Badge variant="outline" className="gap-1">
                        <GraduationCap className="h-3 w-3" /> Học sinh
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                /* Teacher Profile for Student View */
                <>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                        {booking.teacher?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-xl">{booking.teacher?.name}</p>
                      {getTeacherTypeBadge(booking.teacher?.teacherType)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {booking.teacher?.email && (
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{booking.teacher.email}</p>
                        </div>
                      </div>
                    )}

                    {booking.teacher?.phone && (
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <Phone className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Điện thoại</p>
                          <p className="font-medium">{booking.teacher.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {booking.teacher?.bio && (
                    <div className="p-4 bg-muted/30 rounded-xl">
                      <p className="text-sm font-medium mb-2">Giới thiệu</p>
                      <p className="text-sm text-muted-foreground">{booking.teacher.bio}</p>
                    </div>
                  )}

                  {booking.teacher?.specialties && (
                    <div>
                      <p className="text-sm font-medium mb-2">Chuyên môn</p>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          // Parse specialties if it's a JSON string
                          let specialtiesArray: string[] = [];
                          try {
                            if (typeof booking.teacher.specialties === 'string') {
                              specialtiesArray = JSON.parse(booking.teacher.specialties);
                            } else if (Array.isArray(booking.teacher.specialties)) {
                              specialtiesArray = booking.teacher.specialties;
                            }
                          } catch {
                            specialtiesArray = [];
                          }
                          return specialtiesArray.map((specialty, index) => (
                            <Badge key={index} variant="secondary">
                              {specialty}
                            </Badge>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Created Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Đặt lịch vào: {format(parseISO(booking.createdAt), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
        </div>
      </main>
    </div>
  );
};

export default BookingDetailPage;

