import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  BookOpen, Calendar, Video, Users, Clock, 
  CheckCircle, LogOut, ChevronRight 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface TeacherBooking {
  id: number;
  bookingDate: string;
  slotStartTime: string;
  slotEndTime: string;
  status: string;
  student: { id: number; name: string };
  module: { id: number; moduleNumber: number; title: string };
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  const [bookings, setBookings] = useState<TeacherBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || user?.role !== "teacher") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/bookings/by-teacher/${user.profileId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
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
                      onClick={() => navigate(`/session/${booking.id}`)}
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
                      <Badge variant="secondary">{booking.module?.title}</Badge>
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
                      onClick={() => navigate(`/session/${booking.id}`)}
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
                      <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                        Hoàn thành
                      </Badge>
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

