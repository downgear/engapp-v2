import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/services/api";
import { 
  BookOpen, ArrowLeft, Users, MessageSquare, Video,
  Calendar, Target, CheckCircle2, Clock, Sparkles
} from "lucide-react";

interface Module {
  id: number;
  moduleNumber: number;
  title: string;
  weekStartDate: string;
  weekEndDate: string;
}

const ModuleDetailPage = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [module, setModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchModule = async () => {
      if (!moduleId) return;
      try {
        const moduleData = await api.getCourseModule(parseInt(moduleId));
        setModule(moduleData);
      } catch (error) {
        console.error("Failed to fetch module:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchModule();
  }, [moduleId]);

  const handleAIPractice = () => {
    // Navigate to AI practice with the module topic
    const topic = module?.title || "Work";
    navigate(`/ai-practice?topic=${encodeURIComponent(topic)}`);
  };

  const handleBooking = () => {
    navigate("/booking");
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-28 pb-8 max-w-4xl">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-[500px]" />
        </main>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 pt-28 pb-8 max-w-4xl">
          <p>Module không tồn tại</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-28 pb-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/curriculum")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline">Module {module.moduleNumber}</Badge>
              <Badge className="bg-primary">Tuần {module.moduleNumber}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{module.title}</h1>
          </div>
        </div>

        {/* Module Overview */}
        <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-primary/10">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Chủ đề: Work</h2>
                <p className="text-muted-foreground">
                  Học và luyện tập các kỹ năng giao tiếp về {module.title.toLowerCase()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Schedule Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Lịch Học Trong Tuần
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monday" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="monday" className="text-sm">
                  Thứ Hai
                </TabsTrigger>
                <TabsTrigger value="tuethu" className="text-sm">
                  Thứ Ba–Thứ Năm
                </TabsTrigger>
                <TabsTrigger value="friday" className="text-sm">
                  Thứ Sáu hoặc Cuối Tuần
                </TabsTrigger>
              </TabsList>

              {/* Monday - In-person Class */}
              <TabsContent value="monday" className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-6 border border-blue-100 dark:border-blue-900">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">
                        Buổi Học Trực Tiếp Trên Lớp
                      </h3>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        Hình thức: Lớp nhóm nhỏ (15 học sinh, 1 giáo viên)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      Học sinh học và luyện tập:
                    </h4>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <span><strong>Kỳ vọng và quy tắc rõ ràng:</strong> Sai lầm là cơ hội học tập - không ai bị phán xét</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <span><strong>Từ vựng mới:</strong> 10-15 từ/cụm từ về chủ đề "{module.title}"</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <span><strong>Ngữ pháp:</strong> Cấu trúc câu cơ bản để giao tiếp hiệu quả</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <span><strong>Thực hành nhóm:</strong> Hoạt động pair work, role-play với bạn học</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Thời gian: 90 phút | 8:00 AM - 9:30 AM
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Tue-Thu - AI Practice */}
              <TabsContent value="tuethu" className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-6 border border-green-100 dark:border-green-900">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900">
                      <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-green-900 dark:text-green-100">
                        Luyện Tập Với AI
                      </h3>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        Hình thức: Tự học với AI tutor 24/7
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      Mục tiêu luyện tập:
                    </h4>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span><strong>Ôn tập từ vựng:</strong> Củng cố 10-15 từ đã học trong buổi học trên lớp</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span><strong>Luyện phát âm:</strong> AI sẽ đánh giá và hướng dẫn phát âm chính xác</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span><strong>Đàm thoại tự do:</strong> Thực hành hội thoại với AI về chủ đề "{module.title}"</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span><strong>Nhận feedback chi tiết:</strong> Điểm số và gợi ý cải thiện sau mỗi phiên</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 p-3 bg-green-100/50 dark:bg-green-900/30 rounded-lg flex items-center justify-between">
                    <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Luyện tập không giới hạn | Mọi lúc, mọi nơi
                    </p>
                  </div>

                  <Button 
                    onClick={handleAIPractice}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Bắt đầu luyện tập với AI - Chủ đề: {module.title}
                  </Button>
                </div>
              </TabsContent>

              {/* Fri/Weekend - Video Call Booking */}
              <TabsContent value="friday" className="space-y-4">
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-6 border border-purple-100 dark:border-purple-900">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900">
                      <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-purple-900 dark:text-purple-100">
                        Video Call 1-1 Với Giáo Viên
                      </h3>
                      <p className="text-purple-700 dark:text-purple-300 text-sm">
                        Hình thức: Buổi học riêng 30 phút với mentor
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      Nội dung buổi học:
                    </h4>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                        <span><strong>Đánh giá tiến độ:</strong> Giáo viên review các bài luyện tập AI trong tuần</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                        <span><strong>Sửa lỗi cá nhân:</strong> Nhận feedback chi tiết về phát âm, ngữ pháp, từ vựng</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                        <span><strong>Thực hành hội thoại:</strong> Role-play thực tế với giáo viên bản ngữ</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                        <span><strong>Hướng dẫn học tiếp:</strong> Lời khuyên cụ thể để cải thiện trong tuần sau</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg">
                    <p className="text-sm text-purple-800 dark:text-purple-200 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Đặt lịch linh hoạt theo thời gian rảnh của bạn
                    </p>
                  </div>

                  <Button 
                    onClick={handleBooking}
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Đặt lịch Video Call với Giáo Viên
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ModuleDetailPage;

