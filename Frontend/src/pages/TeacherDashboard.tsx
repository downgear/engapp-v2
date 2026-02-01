import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  BookOpen, Calendar, Video, Users, Clock, 
  CheckCircle, LogOut, ChevronRight, Link2, Link2Off, Loader2,
  Play, Square, Star
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface TeacherBooking {
  id: number;
  bookingDate: string;
  slotStartTime: string;
  slotEndTime: string;
  status: string;
  meetingStatus: 'pending' | 'in_progress' | 'ended';
  meetingLink?: string | null;
  teacherFeedback?: string | null;
  studentRating?: number | null;
  student: { id: number; name: string };
  module: { id: number; moduleNumber: number; title: string };
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  const [bookings, setBookings] = useState<TeacherBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handle Google OAuth success - exchange code for tokens
  const handleGoogleSuccess = useCallback(async (code: string) => {
    if (!accessToken) return;
    
    try {
      setGoogleLoading(true);
      const result = await api.exchangeGoogleCode(accessToken, code);
      if (result.success) {
        setGoogleConnected(true);
        if (result.email) setGoogleEmail(result.email);
        toast.success(`Đã kết nối Google Calendar${result.email ? ` (${result.email})` : ''}`);
      }
    } catch (error) {
      console.error("Failed to exchange Google code:", error);
      toast.error("Không thể kết nối với Google");
    } finally {
      setGoogleLoading(false);
    }
  }, [accessToken]);

  // Handle Google OAuth error
  const handleGoogleError = useCallback((error: string) => {
    console.error("Google OAuth error:", error);
    toast.error(`Lỗi kết nối Google: ${error}`);
    setGoogleLoading(false);
  }, []);

  // Initialize Google Auth hook
  const { requestAuth: requestGoogleAuth, isReady: googleReady } = useGoogleAuth({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || user?.role !== "teacher") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch bookings
        const response = await fetch(`${API_BASE_URL}/bookings/by-teacher/${user.profileId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        }

        // Check Google connection status
        try {
          const googleStatus = await api.getGoogleConnectionStatus(accessToken!);
          setGoogleConnected(googleStatus.connected);
          if (googleStatus.email) setGoogleEmail(googleStatus.email);
        } catch (err) {
          // Ignore - teacher may not have Google connected
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, accessToken, isAuthenticated, authLoading, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleConnectGoogle = () => {
    if (!accessToken) return;
    if (!googleReady) {
      toast.error("Google SDK chưa sẵn sàng, vui lòng thử lại");
      return;
    }
    
    setGoogleLoading(true);
    // Open Google OAuth popup
    requestGoogleAuth();
  };

  const handleDisconnectGoogle = async () => {
    if (!accessToken) return;
    
    try {
      setGoogleLoading(true);
      await api.disconnectGoogle(accessToken);
      setGoogleConnected(false);
      setGoogleEmail(null);
      toast.success("Đã ngắt kết nối Google Calendar");
    } catch (error) {
      console.error("Failed to disconnect Google:", error);
      toast.error("Không thể ngắt kết nối");
    } finally {
      setGoogleLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === "confirmed");
  const completedBookings = bookings.filter(b => b.status === "completed");

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 md:px-6 pt-28 pb-16">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
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
              <BookOpen className="h-3 w-3 mr-1" />
              Giáo viên
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Xin chào, {user?.fullName}! 👋
            </h1>
            <p className="text-muted-foreground">
              Quản lý lịch dạy và theo dõi học sinh
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                  <p className="text-sm text-muted-foreground">Lịch sắp tới</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedBookings.length}</p>
                  <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(bookings.map(b => b.student?.id)).size}
                  </p>
                  <p className="text-sm text-muted-foreground">Học sinh</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-100">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{bookings.length}</p>
                  <p className="text-sm text-muted-foreground">Tổng buổi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Google Calendar Integration */}
        <Card className="mb-8 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Video className="h-5 w-5 text-red-500" />
              Tích hợp Google Meet
            </CardTitle>
            <CardDescription>
              Kết nối Google Calendar để tự động tạo link Google Meet cho các buổi học
            </CardDescription>
          </CardHeader>
          <CardContent>
            {googleConnected ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100">
                    <Link2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-600">Đã kết nối</p>
                    {googleEmail && (
                      <p className="text-sm text-muted-foreground">{googleEmail}</p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleDisconnectGoogle}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Link2Off className="h-4 w-4 mr-2" />
                  )}
                  Ngắt kết nối
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <Link2Off className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Chưa kết nối</p>
                    <p className="text-sm text-muted-foreground">
                      Link họp sẽ được tạo tự động khi học sinh đặt lịch
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleConnectGoogle}
                  disabled={googleLoading}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Kết nối Google
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-500" />
                Lịch dạy sắp tới
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`/booking/${booking.id}`)}
                    >
                      <Avatar>
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {booking.student?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{booking.student?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(booking.bookingDate), "EEEE, dd/MM", { locale: vi })} - {booking.slotStartTime}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.meetingStatus === 'pending' && (
                          <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
                            <Clock className="h-3 w-3" /> Chưa diễn ra
                          </Badge>
                        )}
                        {booking.meetingStatus === 'in_progress' && (
                          <Badge className="bg-green-500 gap-1">
                            <Play className="h-3 w-3" /> Đang diễn ra
                          </Badge>
                        )}
                        {booking.meetingStatus === 'ended' && (
                          <Badge className="bg-gray-500 gap-1">
                            <Square className="h-3 w-3" /> Đã kết thúc
                          </Badge>
                        )}
                        <Badge variant="secondary">{booking.module?.title}</Badge>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Không có lịch dạy sắp tới</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Buổi học đã hoàn thành
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedBookings.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {completedBookings.slice(0, 10).map((booking) => (
                    <div 
                      key={booking.id} 
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/booking/${booking.id}`)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm bg-green-100 text-green-600">
                          {booking.student?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{booking.student?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(booking.bookingDate), "dd/MM/yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!booking.teacherFeedback && (
                          <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                            Chưa nhận xét
                          </Badge>
                        )}
                        {booking.studentRating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-muted-foreground">{booking.studentRating}</span>
                          </div>
                        )}
                        <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                          Hoàn thành
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Chưa có buổi học nào hoàn thành</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;

