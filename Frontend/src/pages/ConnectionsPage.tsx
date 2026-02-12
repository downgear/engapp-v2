import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, Users, UserPlus, User, Video, BookOpen,
  Mail, Phone, ChevronRight
} from "lucide-react";
import { api } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface Connection {
  id: number;
  linkedUserId: number;
  linkType: 'parent' | 'teacher';
  createdAt: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
  teacher?: {
    id: number;
    teacherType: 'in_person' | 'video_call' | 'both';
    bio?: string;
    specialties?: string[];
  };
}

const ConnectionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddParentOpen, setIsAddParentOpen] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [newParentEmail, setNewParentEmail] = useState("");
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!user?.profileId) return;
      try {
        const data = await api.getStudentConnections(user.profileId);
        setConnections(data);
      } catch (error) {
        console.error("Failed to fetch connections:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConnections();
  }, [user?.profileId]);

  const parentConnections = connections.filter(c => c.linkType === 'parent');
  const teacherConnections = connections.filter(c => c.linkType === 'teacher');
  
  // Split teachers into in-person and video call
  const inPersonTeachers = teacherConnections.filter(
    c => c.teacher?.teacherType === 'in_person' || c.teacher?.teacherType === 'both'
  );
  const videoCallTeachers = teacherConnections.filter(
    c => c.teacher?.teacherType === 'video_call' || c.teacher?.teacherType === 'both'
  );

  const handleAddParent = async () => {
    if (!user?.profileId || !newParentEmail.trim()) return;
    setIsSubmitting(true);
    try {
      await api.createConnection({
        studentId: user.profileId,
        email: newParentEmail.trim(),
        linkType: 'parent'
      });
      toast.success(language === "vi" ? "Đã tạo kết nối thành công!" : "Connection created successfully!");
      setNewParentEmail("");
      setIsAddParentOpen(false);
      // Refetch connections
      const data = await api.getStudentConnections(user.profileId);
      setConnections(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : (language === "vi" ? "Không thể tạo kết nối" : "Unable to create connection");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!user?.profileId || !newTeacherEmail.trim()) return;
    setIsSubmitting(true);
    try {
      await api.createConnection({
        studentId: user.profileId,
        email: newTeacherEmail.trim(),
        linkType: 'teacher'
      });
      toast.success(language === "vi" ? "Đã tạo kết nối thành công!" : "Connection created successfully!");
      setNewTeacherEmail("");
      setIsAddTeacherOpen(false);
      // Refetch connections
      const data = await api.getStudentConnections(user.profileId);
      setConnections(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : (language === "vi" ? "Không thể tạo kết nối" : "Unable to create connection");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ConnectionCard = ({ connection, showTeacherType = false }: { connection: Connection; showTeacherType?: boolean }) => (
    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        {connection.user.avatarUrl ? (
          <img 
            src={connection.user.avatarUrl} 
            alt={connection.user.fullName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <User className="h-6 w-6 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{connection.user.fullName}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span className="truncate">{connection.user.email}</span>
        </div>
        {connection.user.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{connection.user.phone}</span>
          </div>
        )}
      </div>
      {showTeacherType && connection.teacher && (
        <Badge variant="secondary" className="shrink-0">
          {connection.teacher.teacherType === 'in_person' && (language === "vi" ? 'GV Việt Nam' : 'Vietnamese Teacher')}
          {connection.teacher.teacherType === 'video_call' && (language === "vi" ? 'GV nước ngoài' : 'Foreign Teacher')}
          {connection.teacher.teacherType === 'both' && (language === "vi" ? 'Cả hai' : 'Both')}
        </Badge>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-28 pb-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/student-dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{language === "vi" ? "Kết nối" : "Connections"}</h1>
            <p className="text-muted-foreground">
              {language === "vi" ? "Quản lý kết nối với phụ huynh và giáo viên" : "Manage connections with parents and teachers"}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Parents Section */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  {language === "vi" ? "Phụ huynh" : "Parents"}
                </CardTitle>
                <Dialog open={isAddParentOpen} onOpenChange={setIsAddParentOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      {language === "vi" ? "Thêm kết nối" : "Add Connection"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{language === "vi" ? "Thêm kết nối phụ huynh" : "Add Parent Connection"}</DialogTitle>
                      <DialogDescription>
                        {language === "vi" ? "Nhập email của phụ huynh để tạo kết nối. Phụ huynh cần có tài khoản trên hệ thống." : "Enter the parent's email to create a connection. The parent must have an account on the system."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="parent-email">{language === "vi" ? "Email phụ huynh" : "Parent Email"}</Label>
                        <Input
                          id="parent-email"
                          type="email"
                          placeholder="email@example.com"
                          value={newParentEmail}
                          onChange={(e) => setNewParentEmail(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleAddParent} 
                        className="w-full"
                        disabled={isSubmitting || !newParentEmail.trim()}
                      >
                        {isSubmitting ? (language === "vi" ? "Đang xử lý..." : "Processing...") : (language === "vi" ? "Gửi yêu cầu kết nối" : "Send Connection Request")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : parentConnections.length > 0 ? (
                <div className="space-y-3">
                  {parentConnections.map((conn) => (
                    <ConnectionCard key={conn.id} connection={conn} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">{language === "vi" ? "Chưa có kết nối với phụ huynh" : "No parent connections yet"}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "vi" ? "Nhấn \"Thêm kết nối\" để liên kết với phụ huynh" : "Click \"Add Connection\" to link with a parent"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teachers Section */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  {language === "vi" ? "Giáo viên" : "Teachers"}
                </CardTitle>
                <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      {language === "vi" ? "Thêm kết nối" : "Add Connection"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{language === "vi" ? "Thêm kết nối giáo viên" : "Add Teacher Connection"}</DialogTitle>
                      <DialogDescription>
                        {language === "vi" ? "Nhập email của giáo viên để tạo kết nối. Giáo viên cần có tài khoản trên hệ thống." : "Enter the teacher's email to create a connection. The teacher must have an account on the system."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="teacher-email">{language === "vi" ? "Email giáo viên" : "Teacher Email"}</Label>
                        <Input
                          id="teacher-email"
                          type="email"
                          placeholder="email@example.com"
                          value={newTeacherEmail}
                          onChange={(e) => setNewTeacherEmail(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleAddTeacher} 
                        className="w-full"
                        disabled={isSubmitting || !newTeacherEmail.trim()}
                      >
                        {isSubmitting ? (language === "vi" ? "Đang xử lý..." : "Processing...") : (language === "vi" ? "Gửi yêu cầu kết nối" : "Send Connection Request")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : teacherConnections.length > 0 ? (
                <div className="space-y-6">
                  {/* In-person Teachers */}
                  {inPersonTeachers.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <h4 className="font-medium text-sm text-muted-foreground">{language === "vi" ? "Giáo viên Việt Nam" : "Vietnamese Teachers"}</h4>
                      </div>
                      <div className="space-y-3">
                        {inPersonTeachers.map((conn) => (
                          <ConnectionCard key={conn.id} connection={conn} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Call Teachers */}
                  {videoCallTeachers.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Video className="h-4 w-4 text-purple-500" />
                        <h4 className="font-medium text-sm text-muted-foreground">{language === "vi" ? "Giáo viên nước ngoài" : "Foreign Teachers"}</h4>
                      </div>
                      <div className="space-y-3">
                        {videoCallTeachers.map((conn) => (
                          <ConnectionCard key={conn.id} connection={conn} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">{language === "vi" ? "Chưa có kết nối với giáo viên" : "No teacher connections yet"}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "vi" ? "Nhấn \"Thêm kết nối\" để liên kết với giáo viên" : "Click \"Add Connection\" to link with a teacher"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ConnectionsPage;

