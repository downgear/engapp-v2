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
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { language } = useLanguage();

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
          <p>{language === "vi" ? "Module không tồn tại" : "Module not found"}</p>
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
              <Badge className="bg-primary">{language === "vi" ? "Tuần" : "Week"} {module.moduleNumber}</Badge>
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
                <h2 className="font-semibold text-lg">{language === "vi" ? "Chủ đề: Work" : "Topic: Work"}</h2>
                <p className="text-muted-foreground">
                  {language === "vi" ? <>Học và luyện tập các kỹ năng giao tiếp về {module.title.toLowerCase()}</> : <>Learn and practice communication skills about {module.title.toLowerCase()}</>}
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
              {language === "vi" ? "Lịch Học Trong Tuần" : "Weekly Schedule"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monday" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="monday" className="text-sm">
                  {language === "vi" ? "Thứ Hai" : "Monday"}
                </TabsTrigger>
                <TabsTrigger value="tuethu" className="text-sm">
                  {language === "vi" ? "Thứ Ba–Thứ Năm" : "Tue–Thu"}
                </TabsTrigger>
                <TabsTrigger value="friday" className="text-sm">
                  {language === "vi" ? "Thứ Sáu hoặc Cuối Tuần" : "Fri or Weekend"}
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
                        {language === "vi" ? "Buổi Học Với Giáo Viên Việt Nam" : "Class With Vietnamese Teacher"}
                      </h3>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        {language === "vi" ? "Hình thức: Lớp nhóm nhỏ (15 học sinh, 1 giáo viên)" : "Format: Small group class (15 students, 1 teacher)"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      {language === "vi" ? "Học sinh học và luyện tập:" : "Students learn and practice:"}
                    </h4>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <span>{language === "vi" ? <><strong>Kỳ vọng và quy tắc rõ ràng:</strong> Sai lầm là cơ hội học tập - không ai bị phán xét</> : <><strong>Clear expectations and rules:</strong> Mistakes are learning opportunities - no one is judged</>}</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <span>{language === "vi" ? <><strong>Từ vựng mới:</strong> 10-15 từ/cụm từ về chủ đề "{module.title}"</> : <><strong>New vocabulary:</strong> 10-15 words/phrases about "{module.title}"</>}</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <span>{language === "vi" ? <><strong>Ngữ pháp:</strong> Cấu trúc câu cơ bản để giao tiếp hiệu quả</> : <><strong>Grammar:</strong> Basic sentence structures for effective communication</>}</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <span>{language === "vi" ? <><strong>Thực hành nhóm:</strong> Hoạt động pair work, role-play với bạn học</> : <><strong>Group practice:</strong> Pair work and role-play activities with classmates</>}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {language === "vi" ? "Thời gian: 90 phút | 8:00 AM - 9:30 AM" : "Duration: 90 minutes | 8:00 AM - 9:30 AM"}
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
                        {language === "vi" ? "Luyện Tập Với AI" : "AI Practice"}
                      </h3>
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        {language === "vi" ? "Hình thức: Tự học với AI tutor 24/7" : "Format: Self-study with AI tutor 24/7"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      {language === "vi" ? "Mục tiêu luyện tập:" : "Practice goals:"}
                    </h4>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{language === "vi" ? <><strong>Ôn tập từ vựng:</strong> Củng cố 10-15 từ đã học trong buổi học trên lớp</> : <><strong>Vocabulary review:</strong> Reinforce 10-15 words learned in class</>}</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{language === "vi" ? <><strong>Luyện phát âm:</strong> AI sẽ đánh giá và hướng dẫn phát âm chính xác</> : <><strong>Pronunciation practice:</strong> AI evaluates and guides correct pronunciation</>}</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{language === "vi" ? <><strong>Đàm thoại tự do:</strong> Thực hành hội thoại với AI về chủ đề "{module.title}"</> : <><strong>Free conversation:</strong> Practice dialogue with AI about "{module.title}"</>}</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{language === "vi" ? <><strong>Nhận feedback chi tiết:</strong> Điểm số và gợi ý cải thiện sau mỗi phiên</> : <><strong>Detailed feedback:</strong> Scores and improvement suggestions after each session</>}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 p-3 bg-green-100/50 dark:bg-green-900/30 rounded-lg flex items-center justify-between">
                    <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {language === "vi" ? "Luyện tập không giới hạn | Mọi lúc, mọi nơi" : "Unlimited practice | Anytime, anywhere"}
                    </p>
                  </div>

                  <Button 
                    onClick={handleAIPractice}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    {language === "vi" ? <>Bắt đầu luyện tập với AI - Chủ đề: {module.title}</> : <>Start AI Practice - Topic: {module.title}</>}
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
                        {language === "vi" ? "Học 1-1 Với Giáo Viên Nước Ngoài" : "1-on-1 With Foreign Teacher"}
                      </h3>
                      <p className="text-purple-700 dark:text-purple-300 text-sm">
                        {language === "vi" ? "Hình thức: Buổi học riêng 30 phút với mentor" : "Format: Private 30-minute session with mentor"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      {language === "vi" ? "Nội dung buổi học:" : "Session content:"}
                    </h4>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                        <span>{language === "vi" ? <><strong>Đánh giá tiến độ:</strong> Giáo viên review các bài luyện tập AI trong tuần</> : <><strong>Progress assessment:</strong> Teacher reviews AI practice sessions during the week</>}</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                        <span>{language === "vi" ? <><strong>Sửa lỗi cá nhân:</strong> Nhận feedback chi tiết về phát âm, ngữ pháp, từ vựng</> : <><strong>Personal correction:</strong> Detailed feedback on pronunciation, grammar, vocabulary</>}</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                        <span>{language === "vi" ? <><strong>Thực hành hội thoại:</strong> Role-play thực tế với giáo viên bản ngữ</> : <><strong>Conversation practice:</strong> Real-life role-play with native teacher</>}</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                        <span>{language === "vi" ? <><strong>Hướng dẫn học tiếp:</strong> Lời khuyên cụ thể để cải thiện trong tuần sau</> : <><strong>Study guidance:</strong> Specific advice for improvement next week</>}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg">
                    <p className="text-sm text-purple-800 dark:text-purple-200 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {language === "vi" ? "Đặt lịch linh hoạt theo thời gian rảnh của bạn" : "Flexible scheduling based on your free time"}
                    </p>
                  </div>

                  <Button 
                    onClick={handleBooking}
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    {language === "vi" ? "Đặt lịch học với Giáo Viên Nước Ngoài" : "Book Session With Foreign Teacher"}
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

