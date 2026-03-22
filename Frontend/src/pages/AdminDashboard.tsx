import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/services/api";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  BookOpen, 
  Shield,
  BarChart3,
  MessageSquare,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { UserManagement } from "@/components/admin/UserManagement";
import { VisitStatistics } from "@/components/admin/VisitStatistics";
import { PracticeStatistics } from "@/components/admin/PracticeStatistics";
import { ChatSupport } from "@/components/admin/ChatSupport";
import { CourseManagement } from "@/components/admin/CourseManagement";

interface UserStatistics {
  total: number;
  breakdown: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
}

interface VisitStats {
  total: number;
  hourlyData: Array<{ hour: string; count: number }>;
}

interface PracticeStats {
  aiPractice: { total: number };
  videoCall: { total: number };
}

interface ChatUnreadCount {
  count: number;
}

const COLORS = {
  student: "#3b82f6", // blue
  parent: "#10b981", // green
  teacher: "#8b5cf6", // purple
};

const getRoleLabels = (lang: string): Record<string, string> => ({
  student: lang === "vi" ? "Học sinh" : "Student",
  parent: lang === "vi" ? "Phụ huynh" : "Parent",
  teacher: lang === "vi" ? "Giáo viên" : "Teacher",
});

const ROLE_ICONS: Record<string, React.ReactNode> = {
  student: <GraduationCap className="h-5 w-5" />,
  parent: <UserCheck className="h-5 w-5" />,
  teacher: <BookOpen className="h-5 w-5" />,
};

const AdminDashboard = () => {
  const { user, accessToken } = useAuth();
  const { language } = useLanguage();
  const roleLabels = getRoleLabels(language);
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);
  const [practiceStats, setPracticeStats] = useState<PracticeStats | null>(null);
  const [chatUnread, setChatUnread] = useState<ChatUnreadCount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;

      try {
        setLoading(true);
        const [stats, visits, practice, unread] = await Promise.all([
          api.getAdminUserStatistics(accessToken),
          api.getAdminVisitStatistics(accessToken).catch(() => null),
          api.getAdminPracticeStatistics(accessToken).catch(() => null),
          api.getAdminUnreadCount(accessToken).catch(() => null),
        ]);
        setUserStats(stats);
        setVisitStats(visits);
        setPracticeStats(practice);
        setChatUnread(unread);
      } catch (err) {
        setError(err instanceof Error ? err.message : (language === "vi" ? "Có lỗi xảy ra" : "An error occurred"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  const pieChartData = userStats?.breakdown.map((item) => ({
    name: roleLabels[item.role] || item.role,
    value: item.count,
    percentage: item.percentage,
    color: COLORS[item.role as keyof typeof COLORS] || "#6b7280",
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{language === "vi" ? "Bảng điều khiển quản trị" : "Admin Dashboard"}</h1>
              <p className="text-muted-foreground">
                {language === "vi" ? "Xin chào" : "Hello"}, {user?.fullName}
              </p>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "vi" ? "Tổng quan" : "Overview"}</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "vi" ? "Khóa học" : "Courses"}</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "vi" ? "Người dùng" : "Users"}</span>
            </TabsTrigger>
            <TabsTrigger value="visits" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "vi" ? "Truy cập" : "Visits"}</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "vi" ? "Luyện tập" : "Practice"}</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "vi" ? "Hỗ trợ" : "Support"}</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Total Users Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {language === "vi" ? "Thống kê người dùng" : "User Statistics"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : userStats ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-primary">
                          {userStats.total}
                        </div>
                        <div className="text-muted-foreground mt-1">
                          {language === "vi" ? "Tổng số người đăng ký" : "Total registered users"}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {userStats.breakdown.map((item) => (
                          <div
                            key={item.role}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="p-2 rounded-full"
                                style={{
                                  backgroundColor: `${COLORS[item.role as keyof typeof COLORS]}20`,
                                  color: COLORS[item.role as keyof typeof COLORS],
                                }}
                              >
                                {ROLE_ICONS[item.role]}
                              </div>
                              <span className="font-medium">
                                {roleLabels[item.role] || item.role}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{item.count}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.percentage}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{language === "vi" ? "Không có dữ liệu" : "No data available"}</p>
                  )}
                </CardContent>
              </Card>

              {/* Pie Chart Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === "vi" ? "Phân bố người dùng" : "User Distribution"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <Skeleton className="h-48 w-48 rounded-full" />
                    </div>
                  ) : pieChartData.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) =>
                              `${name}: ${percentage}%`
                            }
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number, name: string) => [
                              `${value} ${language === "vi" ? "người" : "users"}`,
                              name,
                            ]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      {language === "vi" ? "Không có dữ liệu" : "No data available"}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick stats summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                onClick={() => setActiveTab("visits")}
              >
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="text-center">
                      <Skeleton className="h-8 w-16 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </div>
                  ) : (
                    <div className="text-center">
                      <Settings className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-3xl font-bold text-blue-500">
                        {visitStats?.total ?? 0}
                      </div>
                      <p className="font-medium">{language === "vi" ? "Lượt truy cập" : "Visits"}</p>
                      <p className="text-sm text-muted-foreground">{language === "vi" ? "trong 24h qua" : "in the last 24h"}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card 
                className="cursor-pointer hover:border-green-500 hover:shadow-md transition-all"
                onClick={() => setActiveTab("practice")}
              >
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="text-center">
                      <Skeleton className="h-8 w-16 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </div>
                  ) : (
                    <div className="text-center">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <div className="text-3xl font-bold text-green-500">
                        {(practiceStats?.aiPractice?.total ?? 0) + (practiceStats?.videoCall?.total ?? 0)}
                      </div>
                      <p className="font-medium">{language === "vi" ? "Lượt luyện tập" : "Practice Sessions"}</p>
                      <p className="text-sm text-muted-foreground">
                        AI: {practiceStats?.aiPractice?.total ?? 0} | Video: {practiceStats?.videoCall?.total ?? 0}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card 
                className="cursor-pointer hover:border-orange-500 hover:shadow-md transition-all"
                onClick={() => setActiveTab("chat")}
              >
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="text-center">
                      <Skeleton className="h-8 w-16 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </div>
                  ) : (
                    <div className="text-center">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <div className="text-3xl font-bold text-orange-500">
                        {chatUnread?.count ?? 0}
                      </div>
                      <p className="font-medium">{language === "vi" ? "Tin nhắn chờ" : "Pending Messages"}</p>
                      <p className="text-sm text-muted-foreground">{language === "vi" ? "cần phản hồi" : "need reply"}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Course Management Tab */}
          <TabsContent value="courses">
            <CourseManagement />
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          {/* Visit Statistics Tab */}
          <TabsContent value="visits">
            <VisitStatistics />
          </TabsContent>

          {/* Practice Statistics Tab */}
          <TabsContent value="practice">
            <PracticeStatistics />
          </TabsContent>

          {/* Chat Support Tab */}
          <TabsContent value="chat">
            <ChatSupport />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
