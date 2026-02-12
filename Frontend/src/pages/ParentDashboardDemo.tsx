import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChildSelector } from "@/components/parent-dashboard/ChildSelector";
import { ProgressVideos } from "@/components/parent-dashboard/ProgressVideos";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren, useProgressVideos, useLearningHistory, useEnrollment } from "@/hooks/useParentDashboard";
import type { LearningHistoryItem } from "@/types";
import { History, AlertCircle, BookOpen, MessageSquare, Video, Calendar, Star, ChevronRight, ChevronDown, Mic, BookText, Brain, Zap, Lightbulb } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

// Activity type icons and labels
const getActivityConfig = (language: string) => ({
  in_person_class: { icon: BookOpen, label: language === "vi" ? "Học với GV Việt Nam" : "Vietnamese Teacher Class", color: "text-blue-500 bg-blue-50" },
  ai_practice: { icon: MessageSquare, label: language === "vi" ? "Luyện tập AI" : "AI Practice", color: "text-green-500 bg-green-50" },
  video_call: { icon: Video, label: language === "vi" ? "Học với GV nước ngoài" : "Foreign Teacher Class", color: "text-purple-500 bg-purple-50" },
});

// Learning History Item Component with expandable feedback
const LearningHistoryCard = ({ item }: { item: LearningHistoryItem }) => {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const config = getActivityConfig(language)[item.activityType];
  const Icon = config.icon;
  const date = parseISO(item.startTime);
  const formattedDate = format(date, "dd/MM/yyyy", { locale: language === "vi" ? vi : undefined });
  const formattedTime = format(date, "HH:mm", { locale: language === "vi" ? vi : undefined });
  const parsedFeedback = parseFeedbackText(item.aiFeedback?.feedbackText);
  const hasFeedback = !!parsedFeedback || !!item.aiFeedback?.overallScore;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild disabled={!hasFeedback}>
        <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors border ${hasFeedback ? 'cursor-pointer hover:bg-muted/50 hover:border-border/50' : ''} ${isExpanded ? 'bg-muted/30 border-border/50' : 'border-transparent'}`}>
          <div className={`p-2 rounded-lg ${config.color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-sm text-foreground truncate">
                {config.label} - Module {item.module.moduleNumber}
              </p>
              {item.aiFeedback?.overallScore && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  <Star className="h-3 w-3 mr-1" />
                  {item.aiFeedback.overallScore}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {item.module.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formattedDate} {language === "vi" ? "lúc" : "at"} {formattedTime}
              </span>
            </div>
          </div>
          {hasFeedback && (
            <div className="shrink-0 text-muted-foreground">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          )}
        </div>
      </CollapsibleTrigger>
      
      {parsedFeedback && (
        <CollapsibleContent>
          <div className="ml-11 mr-3 mt-1 mb-2 p-3 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-100/50 dark:border-green-900/30 space-y-3">
            {/* Score breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Mic className="h-3 w-3 text-blue-500" />
                <span className="text-muted-foreground">{language === "vi" ? "Phát âm:" : "Pronunciation:"}</span>
                <span className="font-medium">{parsedFeedback.pronunciation}/10</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookText className="h-3 w-3 text-purple-500" />
                <span className="text-muted-foreground">{language === "vi" ? "Ngữ pháp:" : "Grammar:"}</span>
                <span className="font-medium">{parsedFeedback.grammar}/10</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Brain className="h-3 w-3 text-orange-500" />
                <span className="text-muted-foreground">{language === "vi" ? "Từ vựng:" : "Vocabulary:"}</span>
                <span className="font-medium">{parsedFeedback.vocabulary}/10</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-yellow-500" />
                <span className="text-muted-foreground">{language === "vi" ? "Lưu loát:" : "Fluency:"}</span>
                <span className="font-medium">{parsedFeedback.fluency}/10</span>
              </div>
            </div>

            {/* Pronunciation Issues - Detailed */}
            {parsedFeedback.pronunciationIssues?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
                  <Mic className="h-3 w-3" /> {language === "vi" ? "Lỗi phát âm" : "Pronunciation Issues"}
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {parsedFeedback.pronunciationIssues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Grammar Issues - Detailed */}
            {parsedFeedback.grammarIssues?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1 flex items-center gap-1">
                  <BookText className="h-3 w-3" /> {language === "vi" ? "Lỗi ngữ pháp" : "Grammar Issues"}
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {parsedFeedback.grammarIssues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Vocabulary Notes - Detailed */}
            {parsedFeedback.vocabularyNotes?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1 flex items-center gap-1">
                  <Brain className="h-3 w-3" /> {language === "vi" ? "Ghi chú từ vựng" : "Vocabulary Notes"}
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {parsedFeedback.vocabularyNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fluency Notes - Detailed */}
            {parsedFeedback.fluencyNotes?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {language === "vi" ? "Ghi chú lưu loát" : "Fluency Notes"}
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {parsedFeedback.fluencyNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Highlights */}
            {parsedFeedback.highlights?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1 flex items-center gap-1">
                  <Star className="h-3 w-3" /> {language === "vi" ? "Điểm nổi bật" : "Highlights"}
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {parsedFeedback.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Suggestions */}
            {parsedFeedback.suggestions?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" /> {language === "vi" ? "Gợi ý cải thiện" : "Suggestions for Improvement"}
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {parsedFeedback.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({ 
  title, 
  icon, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {icon}
                {title}
              </CardTitle>
              <div className="text-muted-foreground">
                {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const ParentDashboardDemo = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const parentId = user?.role === "parent" ? user.profileId : undefined;
  const { children, isLoading: isLoadingChildren, error: childrenError } = useChildren(parentId ?? 1);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  
  const { enrollment } = useEnrollment(selectedChildId, parentId ?? 1);
  const courseId = enrollment?.course?.id || 1;
  
  const { progressVideos, isLoading: isLoadingVideos } = useProgressVideos(selectedChildId, courseId, parentId ?? 1);
  const { learningHistory, isLoading: isLoadingHistory, refetch: refetchLearningHistory } = useLearningHistory(selectedChildId, undefined, parentId ?? 1);

  // Set first child as selected when children are loaded
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  useEffect(() => {
    const handleUpdate = () => {
      refetchLearningHistory();
    };
    window.addEventListener("learning-history-updated", handleUpdate);
    return () => window.removeEventListener("learning-history-updated", handleUpdate);
  }, [refetchLearningHistory]);

  // Format video URLs for display
  const beforeVideoUrl = progressVideos?.beforeVideo?.fileUrl || null;
  const afterVideoUrl = progressVideos?.afterVideo?.fileUrl || null;
  const beforeDate = progressVideos?.beforeVideo?.uploadedAt 
    ? format(parseISO(progressVideos.beforeVideo.uploadedAt), "dd/MM/yyyy")
    : "";
  const afterDate = progressVideos?.afterVideo?.uploadedAt
    ? format(parseISO(progressVideos.afterVideo.uploadedAt), "dd/MM/yyyy")
    : "";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 md:px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">
            {t("parent.badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t("parent.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("parent.subtitle")}
          </p>
        </div>

        {/* Error State */}
        {childrenError && (
          <Card className="border-destructive/50 bg-destructive/5 mb-8">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">
                {language === "vi" ? "Không thể tải dữ liệu. Vui lòng thử lại sau." : "Unable to load data. Please try again later."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Child Selector */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            {t("parent.selectChild")}
          </h2>
          {isLoadingChildren ? (
            <div className="flex gap-3">
              <Skeleton className="h-16 w-32 rounded-xl" />
              <Skeleton className="h-16 w-32 rounded-xl" />
              <Skeleton className="h-16 w-32 rounded-xl" />
            </div>
          ) : (
            <ChildSelector
              children={children}
              selectedChildId={selectedChildId}
              onSelectChild={setSelectedChildId}
            />
          )}
        </div>

        {/* Main Content - Vertical Layout */}
        <div className="space-y-6 mb-8">
          {/* Learning History Section - Collapsible */}
          <CollapsibleSection
            title={language === "vi" ? "Lịch Sử Học Tập" : "Learning History"}
            icon={<History className="h-5 w-5 text-muted-foreground" />}
            defaultOpen={true}
          >
            {isLoadingHistory ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            ) : learningHistory.length > 0 ? (
              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                {learningHistory.slice(0, 10).map((item) => (
                  <LearningHistoryCard key={item.id} item={item} />
                ))}
                {learningHistory.length > 10 && (
                  <button className="w-full py-2 text-sm text-primary hover:text-primary/80 transition-colors">
                    {language === "vi" ? `Xem thêm ${learningHistory.length - 10} hoạt động` : `View ${learningHistory.length - 10} more activities`}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <History className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === "vi" ? "Chưa có lịch sử học tập." : "No learning history yet."}
                </p>
              </div>
            )}
          </CollapsibleSection>

          {/* Progress Videos Section - Collapsible */}
          <CollapsibleSection
            title={language === "vi" ? "Video Tiến Bộ" : "Progress Videos"}
            icon={<Video className="h-5 w-5 text-purple-500" />}
            defaultOpen={true}
          >
            {isLoadingVideos ? (
              <div className="grid md:grid-cols-2 gap-4">
                <Skeleton className="aspect-video rounded-lg" />
                <Skeleton className="aspect-video rounded-lg" />
              </div>
            ) : beforeVideoUrl || afterVideoUrl ? (
              <ProgressVideos 
                beforeVideoUrl={beforeVideoUrl || "/videos/student-before.mp4"}
                afterVideoUrl={afterVideoUrl || "/videos/student-after.mp4"}
                beforeDate={beforeDate}
                afterDate={afterDate}
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">
                  {language === "vi" ? "Chưa có video tiến bộ cho học sinh này." : "No progress videos available for this student."}
                </p>
              </div>
            )}
          </CollapsibleSection>

          {/* Enrollment Info Section - Collapsible */}
          {enrollment && (
            <CollapsibleSection
              title={language === "vi" ? "Khoá Học Đang Tham Gia" : "Current Enrollment"}
              icon={<BookOpen className="h-5 w-5 text-primary" />}
              defaultOpen={true}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{enrollment.course.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === "vi" ? "Đang học" : "Currently on"} Module {enrollment.currentModuleNumber} / {enrollment.course.modules?.length || 8}
                  </p>
                </div>
                <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                  {enrollment.status === 'active' ? (language === "vi" ? 'Đang học' : 'Active') : enrollment.status}
                </Badge>
              </div>
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{language === "vi" ? "Tiến độ" : "Progress"}</span>
                  <span>{Math.round((enrollment.currentModuleNumber / (enrollment.course.modules?.length || 8)) * 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(enrollment.currentModuleNumber / (enrollment.course.modules?.length || 8)) * 100}%` }}
                  />
                </div>
              </div>
            </CollapsibleSection>
          )}
        </div>

        {/* Demo Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          * {t("parent.demoNote")}
        </p>
      </main>
    </div>
  );
};

export default ParentDashboardDemo;
