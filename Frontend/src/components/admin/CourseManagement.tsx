import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calendar,
  Users,
  GraduationCap,
  Clock,
  DollarSign,
  Layers,
  FolderOpen,
  Edit,
  Plus,
  Trash2,
  Loader2,
  Check,
  ChevronsUpDown,
  User,
  Brain,
  Video,
  School,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { api, ProgramResponse, CohortResponse, CohortCourseResponse, ModuleResponse, ModuleContentData, AIPracticeContentData, TeacherSessionContentData } from "@/services/api";

// Teacher type for selection
interface TeacherOption {
  id: number;
  name: string;
  email: string;
}

// Types (using API response types)
type Program = ProgramResponse;
type Cohort = CohortResponse;
type Course = CohortCourseResponse;

const getStatusBadge = (status: string, lang: string = "vi") => {
  switch (status) {
    case "active":
    case "in_progress":
      return <Badge className="bg-green-500">{lang === "vi" ? "Đang diễn ra" : "In Progress"}</Badge>;
    case "upcoming":
    case "registration_open":
      return <Badge className="bg-blue-500">{lang === "vi" ? "Sắp khai giảng" : "Upcoming"}</Badge>;
    case "completed":
      return <Badge variant="secondary">{lang === "vi" ? "Đã hoàn thành" : "Completed"}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getLevelBadge = (level: string, lang: string = "vi") => {
  switch (level) {
    case "basic":
      return <Badge variant="outline" className="border-green-500 text-green-600">{lang === "vi" ? "Cơ bản" : "Basic"}</Badge>;
    case "advanced":
      return <Badge variant="outline" className="border-purple-500 text-purple-600">{lang === "vi" ? "Nâng cao" : "Advanced"}</Badge>;
    default:
      return <Badge variant="outline">{level}</Badge>;
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const CourseManagement = () => {
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const { language } = useLanguage();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Teachers for selection
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [teacherPopoverOpen, setTeacherPopoverOpen] = useState(false);
  
  // Dialog states
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [cohortDialogOpen, setCohortDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [editingCohort, setEditingCohort] = useState<{ cohort: Cohort; programId: number } | null>(null);
  const [editingCourse, setEditingCourse] = useState<{ course: Course; programId: number; cohortId: number } | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(null);

  // Module dialog states
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<{ module: ModuleResponse; courseId: number } | null>(null);
  const [moduleTargetCourseId, setModuleTargetCourseId] = useState<number | null>(null);
  const [moduleForm, setModuleForm] = useState({
    moduleNumber: 1,
    title: "",
    topic: "",
    description: "",
    weekStartDate: "",
    weekEndDate: "",
    mondayVocabulary: "",
    mondayGrammar: "",
    mondayActivities: "",
    mondayNotes: "",
    aiTopics: "",
    aiExercises: "",
    aiNotes: "",
    teacherGoals: "",
    teacherFocus: "",
    teacherNotes: "",
  });

  // Form states
  const [programForm, setProgramForm] = useState({ name: "", description: "" });
  const [cohortForm, setCohortForm] = useState({ name: "", startDate: "", status: "upcoming" as "active" | "upcoming" | "completed" });
  const [courseForm, setCourseForm] = useState({
    name: "",
    description: "",
    level: "basic" as "basic" | "advanced",
    status: "upcoming" as "upcoming" | "registration_open" | "in_progress" | "completed",
    startDate: "",
    endDate: "",
    price: 0,
    maxStudents: 20,
    teacherId: null as number | null,
  });

  // Fetch programs from API
  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAllPrograms();
      setPrograms(data);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: language === "vi" ? "Không thể tải dữ liệu chương trình" : "Failed to load program data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch teachers for selection
  const fetchTeachers = async () => {
    try {
      const data = await api.getTeachers();
      setTeachers(data.map((t: any) => ({
        id: t.id,
        name: t.name,
        email: t.email,
      })));
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchTeachers();
  }, []);
  
  // Find selected teacher
  const selectedTeacher = useMemo(() => {
    if (!courseForm.teacherId) return null;
    return teachers.find(t => t.id === courseForm.teacherId) || null;
  }, [courseForm.teacherId, teachers]);

  // Program CRUD
  const openAddProgram = () => {
    setEditingProgram(null);
    setProgramForm({ name: "", description: "" });
    setProgramDialogOpen(true);
  };

  const openEditProgram = (program: Program) => {
    setEditingProgram(program);
    setProgramForm({ name: program.name, description: program.description });
    setProgramDialogOpen(true);
  };

  const saveProgram = async () => {
    if (!programForm.name.trim()) {
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: language === "vi" ? "Vui lòng nhập tên chương trình" : "Please enter a program name", variant: "destructive" });
      return;
    }
    if (!accessToken) {
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: language === "vi" ? "Vui lòng đăng nhập lại" : "Please log in again", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (editingProgram) {
        await api.updateProgram(accessToken, editingProgram.id, programForm);
        toast({ title: language === "vi" ? "Thành công" : "Success", description: language === "vi" ? "Đã cập nhật chương trình" : "Program updated" });
      } else {
        await api.createProgram(accessToken, programForm);
        toast({ title: language === "vi" ? "Thành công" : "Success", description: language === "vi" ? "Đã thêm chương trình mới" : "New program added" });
      }
      setProgramDialogOpen(false);
      await fetchPrograms(); // Refresh data
    } catch (error) {
      console.error("Failed to save program:", error);
      const errorMessage = error instanceof Error ? error.message : (language === "vi" ? "Không thể lưu chương trình" : "Failed to save program");
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProgram = async (programId: number) => {
    if (!confirm(language === "vi" ? "Bạn có chắc muốn xóa chương trình này?" : "Are you sure you want to delete this program?")) return;
    if (!accessToken) return;

    try {
      await api.deleteProgram(accessToken, programId);
      toast({ title: language === "vi" ? "Đã xóa" : "Deleted", description: language === "vi" ? "Chương trình đã được xóa" : "Program deleted" });
      await fetchPrograms();
    } catch (error) {
      console.error("Failed to delete program:", error);
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: language === "vi" ? "Không thể xóa chương trình" : "Failed to delete program", variant: "destructive" });
    }
  };

  // Cohort CRUD
  const openAddCohort = (programId: number) => {
    setSelectedProgramId(programId);
    setEditingCohort(null);
    setCohortForm({ name: "", startDate: "", status: "upcoming" });
    setCohortDialogOpen(true);
  };

  const openEditCohort = (cohort: Cohort, programId: number) => {
    setSelectedProgramId(programId);
    setEditingCohort({ cohort, programId });
    setCohortForm({ name: cohort.name, startDate: cohort.startDate, status: cohort.status as "active" | "upcoming" | "completed" });
    setCohortDialogOpen(true);
  };

  const saveCohort = async () => {
    if (!cohortForm.name.trim() || !cohortForm.startDate) {
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: language === "vi" ? "Vui lòng điền đầy đủ thông tin" : "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (!accessToken) {
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: language === "vi" ? "Vui lòng đăng nhập lại" : "Please log in again", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (editingCohort) {
        await api.updateCohort(accessToken, editingCohort.cohort.id, cohortForm);
        toast({ title: language === "vi" ? "Thành công" : "Success", description: language === "vi" ? "Đã cập nhật cohort" : "Cohort updated" });
      } else if (selectedProgramId) {
        await api.createCohort(accessToken, { ...cohortForm, programId: selectedProgramId });
        toast({ title: language === "vi" ? "Thành công" : "Success", description: language === "vi" ? "Đã thêm cohort mới" : "New cohort added" });
      }
      setCohortDialogOpen(false);
      await fetchPrograms();
    } catch (error) {
      console.error("Failed to save cohort:", error);
      const errorMessage = error instanceof Error ? error.message : (language === "vi" ? "Không thể lưu cohort" : "Failed to save cohort");
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCohort = async (_programId: number, cohortId: number) => {
    if (!confirm(language === "vi" ? "Bạn có chắc muốn xóa cohort này?" : "Are you sure you want to delete this cohort?")) return;
    if (!accessToken) return;

    try {
      await api.deleteCohort(accessToken, cohortId);
      toast({ title: language === "vi" ? "Đã xóa" : "Deleted", description: language === "vi" ? "Cohort đã được xóa" : "Cohort deleted" });
      await fetchPrograms();
    } catch (error) {
      console.error("Failed to delete cohort:", error);
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: language === "vi" ? "Không thể xóa cohort" : "Failed to delete cohort", variant: "destructive" });
    }
  };

  // Course CRUD
  const openAddCourse = (programId: number, cohortId: number) => {
    setSelectedProgramId(programId);
    setSelectedCohortId(cohortId);
    setEditingCourse(null);
    setCourseForm({
      name: "",
      description: "",
      level: "basic",
      status: "upcoming",
      startDate: "",
      endDate: "",
      price: 0,
      maxStudents: 20,
      teacherId: null,
    });
    setCourseDialogOpen(true);
  };

  const openEditCourse = (course: Course, programId: number, cohortId: number) => {
    setSelectedProgramId(programId);
    setSelectedCohortId(cohortId);
    setEditingCourse({ course, programId, cohortId });
    setCourseForm({
      name: course.name,
      description: course.description,
      level: course.level,
      status: course.status,
      startDate: course.startDate,
      endDate: course.endDate,
      price: course.price,
      maxStudents: course.maxStudents,
      teacherId: course.teacherId || null,
    });
    setCourseDialogOpen(true);
  };

  const saveCourse = async () => {
    if (!courseForm.name.trim()) {
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: language === "vi" ? "Vui lòng điền đầy đủ thông tin" : "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (!accessToken) {
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: language === "vi" ? "Vui lòng đăng nhập lại" : "Please log in again", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (editingCourse) {
        await api.updateCohortCourse(accessToken, editingCourse.course.id, {
          level: courseForm.level,
          displayName: courseForm.name,
          description: courseForm.description,
          maxStudents: courseForm.maxStudents,
          teacherId: courseForm.teacherId,
        });
        toast({ title: language === "vi" ? "Thành công" : "Success", description: language === "vi" ? "Đã cập nhật khóa học" : "Course updated" });
      } else if (selectedCohortId) {
        // For new courses, we need to link to an existing course (use courseId 1 as default)
        await api.createCohortCourse(accessToken, {
          cohortId: selectedCohortId,
          courseId: 1, // Default course - in production, you'd have a course selector
          level: courseForm.level,
          displayName: courseForm.name,
          description: courseForm.description,
          maxStudents: courseForm.maxStudents,
          teacherId: courseForm.teacherId,
        });
        toast({ title: language === "vi" ? "Thành công" : "Success", description: language === "vi" ? "Đã thêm khóa học mới" : "New course added" });
      }
      setCourseDialogOpen(false);
      await fetchPrograms();
    } catch (error) {
      console.error("Failed to save course:", error);
      const errorMessage = error instanceof Error ? error.message : (language === "vi" ? "Không thể lưu khóa học" : "Failed to save course");
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCourse = async (_programId: number, _cohortId: number, courseId: number) => {
    if (!confirm(language === "vi" ? "Bạn có chắc muốn xóa khóa học này?" : "Are you sure you want to delete this course?")) return;
    if (!accessToken) return;

    try {
      await api.deleteCohortCourse(accessToken, courseId);
      toast({ title: language === "vi" ? "Đã xóa" : "Deleted", description: language === "vi" ? "Khóa học đã được xóa" : "Course deleted" });
      await fetchPrograms();
    } catch (error) {
      console.error("Failed to delete course:", error);
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: language === "vi" ? "Không thể xóa khóa học" : "Failed to delete course", variant: "destructive" });
    }
  };

  // Module CRUD
  const openAddModule = (courseId: number, existingModuleCount: number) => {
    setModuleTargetCourseId(courseId);
    setEditingModule(null);
    setModuleForm({
      moduleNumber: existingModuleCount + 1,
      title: "",
      topic: "",
      description: "",
      weekStartDate: "",
      weekEndDate: "",
      mondayVocabulary: "",
      mondayGrammar: "",
      mondayActivities: "",
      mondayNotes: "",
      aiTopics: "",
      aiExercises: "",
      aiNotes: "",
      teacherGoals: "",
      teacherFocus: "",
      teacherNotes: "",
    });
    setModuleDialogOpen(true);
  };

  const openEditModule = (module: ModuleResponse, courseId: number) => {
    setModuleTargetCourseId(courseId);
    setEditingModule({ module, courseId });
    setModuleForm({
      moduleNumber: module.moduleNumber,
      title: module.title,
      topic: module.topic,
      description: module.description || "",
      weekStartDate: module.weekStartDate || "",
      weekEndDate: module.weekEndDate || "",
      mondayVocabulary: module.mondayContent?.vocabulary?.join(", ") || "",
      mondayGrammar: module.mondayContent?.grammar || "",
      mondayActivities: module.mondayContent?.activities || "",
      mondayNotes: module.mondayContent?.notes || "",
      aiTopics: module.aiPracticeContent?.topics?.join(", ") || "",
      aiExercises: module.aiPracticeContent?.exercises || "",
      aiNotes: module.aiPracticeContent?.notes || "",
      teacherGoals: module.teacherSessionContent?.goals?.join(", ") || "",
      teacherFocus: module.teacherSessionContent?.focus || "",
      teacherNotes: module.teacherSessionContent?.notes || "",
    });
    setModuleDialogOpen(true);
  };

  const saveModule = async () => {
    if (!moduleForm.title.trim() || !moduleForm.topic.trim()) {
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: language === "vi" ? "Vui lòng điền tên và chủ đề module" : "Please fill in module name and topic", variant: "destructive" });
      return;
    }
    if (!accessToken) {
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: language === "vi" ? "Vui lòng đăng nhập lại" : "Please log in again", variant: "destructive" });
      return;
    }

    const mondayContent: ModuleContentData = {
      vocabulary: moduleForm.mondayVocabulary ? moduleForm.mondayVocabulary.split(",").map(s => s.trim()).filter(Boolean) : [],
      grammar: moduleForm.mondayGrammar || undefined,
      activities: moduleForm.mondayActivities || undefined,
      notes: moduleForm.mondayNotes || undefined,
    };

    const aiPracticeContent: AIPracticeContentData = {
      topics: moduleForm.aiTopics ? moduleForm.aiTopics.split(",").map(s => s.trim()).filter(Boolean) : [],
      exercises: moduleForm.aiExercises || undefined,
      notes: moduleForm.aiNotes || undefined,
    };

    const teacherSessionContent: TeacherSessionContentData = {
      goals: moduleForm.teacherGoals ? moduleForm.teacherGoals.split(",").map(s => s.trim()).filter(Boolean) : [],
      focus: moduleForm.teacherFocus || undefined,
      notes: moduleForm.teacherNotes || undefined,
    };

    setIsSaving(true);
    try {
      if (editingModule) {
        await api.updateModule(accessToken, editingModule.module.id, {
          moduleNumber: moduleForm.moduleNumber,
          title: moduleForm.title,
          topic: moduleForm.topic,
          description: moduleForm.description || undefined,
          weekStartDate: moduleForm.weekStartDate || undefined,
          weekEndDate: moduleForm.weekEndDate || undefined,
          mondayContent,
          aiPracticeContent,
          teacherSessionContent,
        });
        toast({ title: language === "vi" ? "Thành công" : "Success", description: language === "vi" ? "Đã cập nhật module" : "Module updated" });
      } else if (moduleTargetCourseId) {
        await api.createModule(accessToken, {
          courseId: moduleTargetCourseId,
          moduleNumber: moduleForm.moduleNumber,
          title: moduleForm.title,
          topic: moduleForm.topic,
          description: moduleForm.description || undefined,
          weekStartDate: moduleForm.weekStartDate || undefined,
          weekEndDate: moduleForm.weekEndDate || undefined,
          mondayContent,
          aiPracticeContent,
          teacherSessionContent,
        });
        toast({ title: language === "vi" ? "Thành công" : "Success", description: language === "vi" ? "Đã thêm module mới" : "New module added" });
      }
      setModuleDialogOpen(false);
      await fetchPrograms();
    } catch (error) {
      console.error("Failed to save module:", error);
      const errorMessage = error instanceof Error ? error.message : (language === "vi" ? "Không thể lưu module" : "Failed to save module");
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteModule = async (moduleId: number) => {
    if (!confirm(language === "vi" ? "Bạn có chắc muốn xóa module này?" : "Are you sure you want to delete this module?")) return;
    if (!accessToken) return;

    try {
      await api.deleteModule(accessToken, moduleId);
      toast({ title: language === "vi" ? "Đã xóa" : "Deleted", description: language === "vi" ? "Module đã được xóa" : "Module deleted" });
      await fetchPrograms();
    } catch (error) {
      console.error("Failed to delete module:", error);
      toast({ title: language === "vi" ? "Lỗi" : "Error", description: language === "vi" ? "Không thể xóa module" : "Failed to delete module", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{language === "vi" ? "Quản lý Khóa học" : "Course Management"}</h2>
          <p className="text-muted-foreground">
            {language === "vi" ? "Quản lý chương trình, cohort và các khóa học" : "Manage programs, cohorts and courses"}
          </p>
        </div>
        <Button className="gap-2" onClick={openAddProgram}>
          <Plus className="h-4 w-4" />
          {language === "vi" ? "Thêm chương trình mới" : "Add New Program"}
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : programs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{language === "vi" ? "Chưa có chương trình nào" : "No programs yet"}</p>
            <Button className="mt-4" onClick={openAddProgram}>
              <Plus className="h-4 w-4 mr-2" />
              {language === "vi" ? "Thêm chương trình đầu tiên" : "Add First Program"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {programs.map((program) => (
          <Card key={program.id} className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{program.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {program.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => openEditProgram(program)}>
                    <Edit className="h-4 w-4" />
                    {language === "vi" ? "Chỉnh sửa" : "Edit"}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700" onClick={() => deleteProgram(program.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
            {/* Add Cohort Button */}
            <div className="mb-4">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => openAddCohort(program.id)}>
                <Plus className="h-4 w-4" />
                {language === "vi" ? "Thêm Cohort mới" : "Add New Cohort"}
              </Button>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {program.cohorts.map((cohort) => (
                <AccordionItem key={cohort.id} value={`cohort-${cohort.id}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 text-left flex-1">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <FolderOpen className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          {cohort.name}
                          {getStatusBadge(cohort.status, language)}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4" />
                          Bắt đầu: {formatDate(cohort.startDate)}
                          <span className="mx-2">•</span>
                          <BookOpen className="h-4 w-4" />
                          {cohort.courses.length} {language === "vi" ? "khóa học" : "courses"}
                        </div>
                      </div>
                      <div className="flex gap-1 mr-4" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditCohort(cohort, program.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => deleteCohort(program.id, cohort.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 space-y-4">
                      {/* Add Course Button */}
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => openAddCourse(program.id, cohort.id)}>
                        <Plus className="h-4 w-4" />
                        {language === "vi" ? "Thêm khóa học mới" : "Add New Course"}
                      </Button>

                      {/* Courses in this cohort */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {cohort.courses.map((course) => (
                          <Card
                            key={course.id}
                            className={`cursor-pointer transition-all hover:border-primary/50 ${
                              selectedCourse?.id === course.id
                                ? "border-primary ring-2 ring-primary/20"
                                : ""
                            }`}
                            onClick={() => setSelectedCourse(course)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-5 w-5 text-primary" />
                                  <span className="font-semibold">{course.name}</span>
                                </div>
                                <div className="flex gap-2">
                                  {getLevelBadge(course.level, language)}
                                  {getStatusBadge(course.status, language)}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-4">
                                {course.description}
                              </p>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{formatDate(course.startDate)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>3 {language === "vi" ? "tháng" : "months"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {course.enrolledStudents}/{course.maxStudents} {language === "vi" ? "học viên" : "students"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <span>{formatPrice(course.price)}</span>
                                </div>
                              </div>
                              {/* Teacher Info */}
                              <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{language === "vi" ? "Giảng viên:" : "Teacher:"}</span>
                                {course.teacher ? (
                                  <span className="font-medium">{course.teacher.name}</span>
                                ) : (
                                  <span className="text-orange-500 italic">{language === "vi" ? "Chưa xác định" : "Not assigned"}</span>
                                )}
                              </div>
                              <div className="mt-4 pt-3 border-t flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  {course.modules.length} modules
                                </span>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" className="gap-1" onClick={(e) => { e.stopPropagation(); openEditCourse(course, program.id, cohort.id); }}>
                                    <Edit className="h-4 w-4" />
                                    {language === "vi" ? "Sửa" : "Edit"}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="gap-1 text-red-600" onClick={(e) => { e.stopPropagation(); deleteCourse(program.id, cohort.id, course.id); }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Course Details */}
                      {selectedCourse && (
                        <Card className="mt-4 border-primary/30 bg-primary/5">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <BookOpen className="h-5 w-5" />
                              {language === "vi" ? "Chi tiết:" : "Details:"} {selectedCourse.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* Course Info */}
                              <div className="grid md:grid-cols-4 gap-4">
                                <div className="p-3 bg-background rounded-lg">
                                  <p className="text-sm text-muted-foreground">{language === "vi" ? "Học phí" : "Tuition"}</p>
                                  <p className="font-semibold">{formatPrice(selectedCourse.price)}</p>
                                </div>
                                <div className="p-3 bg-background rounded-lg">
                                  <p className="text-sm text-muted-foreground">{language === "vi" ? "Thời gian" : "Duration"}</p>
                                  <p className="font-semibold">
                                    {formatDate(selectedCourse.startDate)} - {formatDate(selectedCourse.endDate)}
                                  </p>
                                </div>
                                <div className="p-3 bg-background rounded-lg">
                                  <p className="text-sm text-muted-foreground">{language === "vi" ? "Số học viên" : "Students"}</p>
                                  <p className="font-semibold">
                                    {selectedCourse.enrolledStudents} / {selectedCourse.maxStudents}
                                  </p>
                                </div>
                                <div className="p-3 bg-background rounded-lg">
                                  <p className="text-sm text-muted-foreground">{language === "vi" ? "Số module" : "Modules"}</p>
                                  <p className="font-semibold">{selectedCourse.modules.length} modules</p>
                                </div>
                              </div>

                              {/* Modules Table */}
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium">{language === "vi" ? "Danh sách Modules" : "Module List"}</h4>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => openAddModule(selectedCourse.courseId, selectedCourse.modules.length)}
                                  >
                                    <Plus className="h-4 w-4" />
                                    {language === "vi" ? "Thêm Module" : "Add Module"}
                                  </Button>
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-20">#</TableHead>
                                      <TableHead>{language === "vi" ? "Tên Module" : "Module Name"}</TableHead>
                                      <TableHead>{language === "vi" ? "Chủ đề" : "Topic"}</TableHead>
                                      <TableHead className="w-20">{language === "vi" ? "Nội dung" : "Content"}</TableHead>
                                      <TableHead className="w-24 text-right">{language === "vi" ? "Hành động" : "Actions"}</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedCourse.modules
                                      .slice()
                                      .sort((a, b) => a.moduleNumber - b.moduleNumber)
                                      .map((module) => (
                                      <TableRow key={module.id}>
                                        <TableCell className="font-medium">
                                          Module {module.moduleNumber}
                                        </TableCell>
                                        <TableCell>{module.title}</TableCell>
                                        <TableCell>
                                          <Badge variant="outline">{module.topic}</Badge>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex gap-1">
                                            {module.mondayContent && (
                                              <span title={language === "vi" ? "Thứ 2" : "Monday"}>
                                                <School className="h-3.5 w-3.5 text-blue-500" />
                                              </span>
                                            )}
                                            {module.aiPracticeContent && (
                                              <span title={language === "vi" ? "AI (Thứ 3-5)" : "AI (Tue-Thu)"}>
                                                <Brain className="h-3.5 w-3.5 text-green-500" />
                                              </span>
                                            )}
                                            {module.teacherSessionContent && (
                                              <span title={language === "vi" ? "GV (Thứ 6-CN)" : "Teacher (Fri-Sun)"}>
                                                <Video className="h-3.5 w-3.5 text-purple-500" />
                                              </span>
                                            )}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex gap-1 justify-end">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7"
                                              onClick={() => openEditModule(module, selectedCourse.courseId)}
                                            >
                                              <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7 text-red-600"
                                              onClick={() => deleteModule(module.id)}
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                    {selectedCourse.modules.length === 0 && (
                                      <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                                          {language === "vi" ? "Chưa có module nào. Hãy thêm module đầu tiên." : "No modules yet. Add the first module."}
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ))}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Layers className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{programs.length}</p>
            <p className="text-sm text-muted-foreground">{language === "vi" ? "Chương trình" : "Programs"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FolderOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {programs.reduce((acc, p) => acc + p.cohorts.length, 0)}
            </p>
            <p className="text-sm text-muted-foreground">{language === "vi" ? "Cohort" : "Cohorts"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <GraduationCap className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {programs.reduce(
                (acc, p) => acc + p.cohorts.reduce((a, c) => a + c.courses.length, 0),
                0
              )}
            </p>
            <p className="text-sm text-muted-foreground">{language === "vi" ? "Khóa học" : "Courses"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {programs.reduce(
                (acc, p) =>
                  acc +
                  p.cohorts.reduce(
                    (a, c) => a + c.courses.reduce((x, course) => x + course.enrolledStudents, 0),
                    0
                  ),
                0
              )}
            </p>
            <p className="text-sm text-muted-foreground">{language === "vi" ? "Học viên" : "Students"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Program Dialog */}
      <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? (language === "vi" ? "Chỉnh sửa chương trình" : "Edit Program") : (language === "vi" ? "Thêm chương trình mới" : "Add New Program")}
            </DialogTitle>
            <DialogDescription>
              {editingProgram ? (language === "vi" ? "Cập nhật thông tin chương trình" : "Update program information") : (language === "vi" ? "Tạo chương trình học mới" : "Create a new learning program")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="program-name">{language === "vi" ? "Tên chương trình *" : "Program Name *"}</Label>
              <Input
                id="program-name"
                value={programForm.name}
                onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                placeholder={language === "vi" ? "VD: Chương trình Tiếng Anh Giao tiếp" : "e.g.: English Communication Program"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program-desc">{language === "vi" ? "Mô tả" : "Description"}</Label>
              <Textarea
                id="program-desc"
                value={programForm.description}
                onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                placeholder={language === "vi" ? "Mô tả ngắn về chương trình..." : "Short description about the program..."}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgramDialogOpen(false)} disabled={isSaving}>
              {language === "vi" ? "Hủy" : "Cancel"}
            </Button>
            <Button onClick={saveProgram} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingProgram ? (language === "vi" ? "Cập nhật" : "Update") : (language === "vi" ? "Thêm mới" : "Add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cohort Dialog */}
      <Dialog open={cohortDialogOpen} onOpenChange={setCohortDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCohort ? (language === "vi" ? "Chỉnh sửa Cohort" : "Edit Cohort") : (language === "vi" ? "Thêm Cohort mới" : "Add New Cohort")}
            </DialogTitle>
            <DialogDescription>
              {editingCohort ? (language === "vi" ? "Cập nhật thông tin cohort" : "Update cohort information") : (language === "vi" ? "Tạo đợt khai giảng mới" : "Create a new cohort")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cohort-name">{language === "vi" ? "Tên Cohort *" : "Cohort Name *"}</Label>
              <Input
                id="cohort-name"
                value={cohortForm.name}
                onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                placeholder={language === "vi" ? "VD: Khóa Khai Giảng Tháng 3/2026" : "e.g.: March 2026 Cohort"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cohort-date">{language === "vi" ? "Ngày bắt đầu *" : "Start Date *"}</Label>
              <Input
                id="cohort-date"
                type="date"
                value={cohortForm.startDate}
                onChange={(e) => setCohortForm({ ...cohortForm, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cohort-status">{language === "vi" ? "Trạng thái" : "Status"}</Label>
              <Select
                value={cohortForm.status}
                onValueChange={(value: "active" | "upcoming" | "completed") => 
                  setCohortForm({ ...cohortForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">{language === "vi" ? "Sắp khai giảng" : "Upcoming"}</SelectItem>
                  <SelectItem value="active">{language === "vi" ? "Đang diễn ra" : "In Progress"}</SelectItem>
                  <SelectItem value="completed">{language === "vi" ? "Đã hoàn thành" : "Completed"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCohortDialogOpen(false)} disabled={isSaving}>
              {language === "vi" ? "Hủy" : "Cancel"}
            </Button>
            <Button onClick={saveCohort} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCohort ? (language === "vi" ? "Cập nhật" : "Update") : (language === "vi" ? "Thêm mới" : "Add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingModule
                ? (language === "vi" ? "Chỉnh sửa Module" : "Edit Module")
                : (language === "vi" ? "Thêm Module mới" : "Add New Module")}
            </DialogTitle>
            <DialogDescription>
              {language === "vi"
                ? "Mỗi module tương ứng với 1 tuần học, gồm 3 phần: Thứ 2 (lớp offline), Thứ 3–5 (luyện AI), Thứ 6–CN (với giáo viên nước ngoài)"
                : "Each module corresponds to 1 week of study with 3 parts: Monday (offline class), Tue–Thu (AI practice), Fri–Sun (with foreign teacher)"}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">{language === "vi" ? "Thông tin" : "Info"}</TabsTrigger>
              <TabsTrigger value="monday" className="text-blue-600">
                <School className="h-3.5 w-3.5 mr-1" />
                {language === "vi" ? "Thứ 2" : "Monday"}
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-green-600">
                <Brain className="h-3.5 w-3.5 mr-1" />
                {language === "vi" ? "Thứ 3–5" : "Tue–Thu"}
              </TabsTrigger>
              <TabsTrigger value="teacher" className="text-purple-600">
                <Video className="h-3.5 w-3.5 mr-1" />
                {language === "vi" ? "Thứ 6–CN" : "Fri–Sun"}
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Info */}
            <TabsContent value="info" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === "vi" ? "Số Module *" : "Module Number *"}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={moduleForm.moduleNumber}
                    onChange={(e) => setModuleForm({ ...moduleForm, moduleNumber: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === "vi" ? "Chủ đề (Topic) *" : "Topic *"}</Label>
                  <Input
                    value={moduleForm.topic}
                    onChange={(e) => setModuleForm({ ...moduleForm, topic: e.target.value })}
                    placeholder={language === "vi" ? "VD: Giao tiếp cơ bản" : "e.g.: Basic Communication"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === "vi" ? "Tên Module *" : "Module Title *"}</Label>
                <Input
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder={language === "vi" ? "VD: Giới thiệu bản thân" : "e.g.: Self Introduction"}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "vi" ? "Mô tả" : "Description"}</Label>
                <Textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder={language === "vi" ? "Mô tả nội dung module..." : "Module content description..."}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === "vi" ? "Ngày bắt đầu tuần" : "Week Start Date"}</Label>
                  <Input
                    type="date"
                    value={moduleForm.weekStartDate}
                    onChange={(e) => setModuleForm({ ...moduleForm, weekStartDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === "vi" ? "Ngày kết thúc tuần" : "Week End Date"}</Label>
                  <Input
                    type="date"
                    value={moduleForm.weekEndDate}
                    onChange={(e) => setModuleForm({ ...moduleForm, weekEndDate: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Monday — Offline Class */}
            <TabsContent value="monday" className="space-y-4 pt-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg mb-2">
                <School className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-400 text-sm">
                    {language === "vi" ? "Thứ Hai — Luyện tập Offline tại lớp học" : "Monday — Offline Class Practice"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "vi" ? "Học từ vựng, ngữ pháp, luyện tập theo cặp với giáo viên Việt" : "Vocabulary, grammar, pair practice with Vietnamese teacher"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === "vi" ? "Từ vựng (cách nhau bằng dấu phẩy)" : "Vocabulary (comma-separated)"}</Label>
                <Textarea
                  value={moduleForm.mondayVocabulary}
                  onChange={(e) => setModuleForm({ ...moduleForm, mondayVocabulary: e.target.value })}
                  placeholder={language === "vi" ? "VD: introduce, greet, name, hobby, occupation" : "e.g.: introduce, greet, name, hobby, occupation"}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "vi" ? "Ngữ pháp" : "Grammar"}</Label>
                <Input
                  value={moduleForm.mondayGrammar}
                  onChange={(e) => setModuleForm({ ...moduleForm, mondayGrammar: e.target.value })}
                  placeholder={language === "vi" ? "VD: Thì hiện tại đơn, câu hỏi Yes/No" : "e.g.: Simple Present Tense, Yes/No questions"}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "vi" ? "Hoạt động lớp học" : "Class Activities"}</Label>
                <Textarea
                  value={moduleForm.mondayActivities}
                  onChange={(e) => setModuleForm({ ...moduleForm, mondayActivities: e.target.value })}
                  placeholder={language === "vi" ? "VD: Đóng vai giới thiệu bản thân, trò chơi từ vựng..." : "e.g.: Role-play self-introduction, vocabulary games..."}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "vi" ? "Ghi chú cho giáo viên" : "Teacher Notes"}</Label>
                <Textarea
                  value={moduleForm.mondayNotes}
                  onChange={(e) => setModuleForm({ ...moduleForm, mondayNotes: e.target.value })}
                  placeholder={language === "vi" ? "Ghi chú thêm..." : "Additional notes..."}
                  rows={2}
                />
              </div>
            </TabsContent>

            {/* Tab 3: Tue–Thu — AI Practice */}
            <TabsContent value="ai" className="space-y-4 pt-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg mb-2">
                <Brain className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400 text-sm">
                    {language === "vi" ? "Thứ Ba–Thứ Năm — Luyện tập với AI" : "Tuesday–Thursday — AI Practice"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "vi" ? "Tự học với AI 24/7: ôn từ vựng, luyện phát âm, hội thoại" : "Self-study with AI 24/7: vocabulary review, pronunciation, conversation"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === "vi" ? "Chủ đề luyện tập (cách nhau bằng dấu phẩy)" : "Practice Topics (comma-separated)"}</Label>
                <Textarea
                  value={moduleForm.aiTopics}
                  onChange={(e) => setModuleForm({ ...moduleForm, aiTopics: e.target.value })}
                  placeholder={language === "vi" ? "VD: Tự giới thiệu, Hỏi về nghề nghiệp, Mô tả sở thích" : "e.g.: Self-introduction, Asking about jobs, Describing hobbies"}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "vi" ? "Bài tập AI" : "AI Exercises"}</Label>
                <Textarea
                  value={moduleForm.aiExercises}
                  onChange={(e) => setModuleForm({ ...moduleForm, aiExercises: e.target.value })}
                  placeholder={language === "vi" ? "VD: Hội thoại 5 phút/ngày, Phát âm 10 từ vựng mới..." : "e.g.: 5-min conversation daily, Pronounce 10 new words..."}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "vi" ? "Ghi chú" : "Notes"}</Label>
                <Textarea
                  value={moduleForm.aiNotes}
                  onChange={(e) => setModuleForm({ ...moduleForm, aiNotes: e.target.value })}
                  placeholder={language === "vi" ? "Ghi chú thêm..." : "Additional notes..."}
                  rows={2}
                />
              </div>
            </TabsContent>

            {/* Tab 4: Fri–Sun — Foreign Teacher Session */}
            <TabsContent value="teacher" className="space-y-4 pt-4">
              <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg mb-2">
                <Video className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-700 dark:text-purple-400 text-sm">
                    {language === "vi" ? "Thứ Sáu–Chủ Nhật — Luyện với Giáo viên Nước ngoài" : "Friday–Sunday — Practice with Foreign Teacher"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "vi" ? "1-on-1 video call 30 phút với giáo viên bản ngữ" : "30-minute 1-on-1 video call with native/foreign teacher"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === "vi" ? "Mục tiêu buổi học (cách nhau bằng dấu phẩy)" : "Session Goals (comma-separated)"}</Label>
                <Textarea
                  value={moduleForm.teacherGoals}
                  onChange={(e) => setModuleForm({ ...moduleForm, teacherGoals: e.target.value })}
                  placeholder={language === "vi" ? "VD: Tự giới thiệu lưu loát, Trả lời câu hỏi về bản thân" : "e.g.: Introduce yourself fluently, Answer questions about yourself"}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "vi" ? "Trọng tâm buổi học" : "Session Focus"}</Label>
                <Input
                  value={moduleForm.teacherFocus}
                  onChange={(e) => setModuleForm({ ...moduleForm, teacherFocus: e.target.value })}
                  placeholder={language === "vi" ? "VD: Phát âm và ngữ điệu khi giới thiệu bản thân" : "e.g.: Pronunciation and intonation in self-introduction"}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "vi" ? "Ghi chú cho giáo viên" : "Notes for Teacher"}</Label>
                <Textarea
                  value={moduleForm.teacherNotes}
                  onChange={(e) => setModuleForm({ ...moduleForm, teacherNotes: e.target.value })}
                  placeholder={language === "vi" ? "Hướng dẫn cho giáo viên nước ngoài..." : "Instructions for foreign teacher..."}
                  rows={2}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setModuleDialogOpen(false)} disabled={isSaving}>
              {language === "vi" ? "Hủy" : "Cancel"}
            </Button>
            <Button onClick={saveModule} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingModule ? (language === "vi" ? "Cập nhật" : "Update") : (language === "vi" ? "Thêm Module" : "Add Module")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Dialog */}
      <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? (language === "vi" ? "Chỉnh sửa khóa học" : "Edit Course") : (language === "vi" ? "Thêm khóa học mới" : "Add New Course")}
            </DialogTitle>
            <DialogDescription>
              {editingCourse ? (language === "vi" ? "Cập nhật thông tin khóa học" : "Update course information") : (language === "vi" ? "Tạo khóa học mới trong cohort" : "Create a new course in the cohort")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course-name">{language === "vi" ? "Tên khóa học *" : "Course Name *"}</Label>
                <Input
                  id="course-name"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  placeholder={language === "vi" ? "VD: Khóa Cơ Bản" : "e.g.: Basic Course"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-level">{language === "vi" ? "Cấp độ" : "Level"}</Label>
                <Select
                  value={courseForm.level}
                  onValueChange={(value: "basic" | "advanced") => 
                    setCourseForm({ ...courseForm, level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">{language === "vi" ? "Cơ bản" : "Basic"}</SelectItem>
                    <SelectItem value="advanced">{language === "vi" ? "Nâng cao" : "Advanced"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-desc">{language === "vi" ? "Mô tả" : "Description"}</Label>
              <Textarea
                id="course-desc"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder={language === "vi" ? "Mô tả về khóa học..." : "Course description..."}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course-start">{language === "vi" ? "Ngày bắt đầu *" : "Start Date *"}</Label>
                <Input
                  id="course-start"
                  type="date"
                  value={courseForm.startDate}
                  onChange={(e) => setCourseForm({ ...courseForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-end">{language === "vi" ? "Ngày kết thúc *" : "End Date *"}</Label>
                <Input
                  id="course-end"
                  type="date"
                  value={courseForm.endDate}
                  onChange={(e) => setCourseForm({ ...courseForm, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course-price">{language === "vi" ? "Học phí (VNĐ)" : "Tuition (VND)"}</Label>
                <Input
                  id="course-price"
                  type="number"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-max">{language === "vi" ? "Số học viên tối đa" : "Max Students"}</Label>
                <Input
                  id="course-max"
                  type="number"
                  value={courseForm.maxStudents}
                  onChange={(e) => setCourseForm({ ...courseForm, maxStudents: parseInt(e.target.value) || 20 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-status">{language === "vi" ? "Trạng thái" : "Status"}</Label>
                <Select
                  value={courseForm.status}
                  onValueChange={(value: "upcoming" | "registration_open" | "in_progress" | "completed") => 
                    setCourseForm({ ...courseForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">{language === "vi" ? "Sắp tới" : "Upcoming"}</SelectItem>
                    <SelectItem value="registration_open">{language === "vi" ? "Mở đăng ký" : "Registration Open"}</SelectItem>
                    <SelectItem value="in_progress">{language === "vi" ? "Đang học" : "In Progress"}</SelectItem>
                    <SelectItem value="completed">{language === "vi" ? "Hoàn thành" : "Completed"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Teacher Selection */}
            <div className="space-y-2">
              <Label>{language === "vi" ? "Giảng viên" : "Teacher"}</Label>
              <Popover open={teacherPopoverOpen} onOpenChange={setTeacherPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={teacherPopoverOpen}
                    className="w-full justify-between"
                  >
                    {selectedTeacher ? (
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedTeacher.name} ({selectedTeacher.email})
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{language === "vi" ? "Chọn giảng viên..." : "Select a teacher..."}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder={language === "vi" ? "Tìm theo tên hoặc email..." : "Search by name or email..."} />
                    <CommandList>
                      <CommandEmpty>{language === "vi" ? "Không tìm thấy giảng viên" : "No teachers found"}</CommandEmpty>
                      <CommandGroup>
                        {/* Option to clear selection */}
                        <CommandItem
                          onSelect={() => {
                            setCourseForm({ ...courseForm, teacherId: null });
                            setTeacherPopoverOpen(false);
                          }}
                        >
                          <span className="text-muted-foreground italic">{language === "vi" ? "Chưa xác định" : "Not assigned"}</span>
                        </CommandItem>
                        {teachers.map((teacher) => (
                          <CommandItem
                            key={teacher.id}
                            value={`${teacher.name} ${teacher.email}`}
                            onSelect={() => {
                              setCourseForm({ ...courseForm, teacherId: teacher.id });
                              setTeacherPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                courseForm.teacherId === teacher.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{teacher.name}</span>
                              <span className="text-xs text-muted-foreground">{teacher.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                {language === "vi" ? "Gõ để tìm kiếm theo tên hoặc email giảng viên" : "Type to search by teacher name or email"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseDialogOpen(false)} disabled={isSaving}>
              {language === "vi" ? "Hủy" : "Cancel"}
            </Button>
            <Button onClick={saveCourse} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCourse ? (language === "vi" ? "Cập nhật" : "Update") : (language === "vi" ? "Thêm mới" : "Add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
