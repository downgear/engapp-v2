import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Check, Bot, Loader2, Target } from "lucide-react";
import { PracticeTypeSelector } from "@/components/ai-practice/PracticeTypeSelector";
import { ChatPracticeInterface } from "@/components/ai-practice/ChatPracticeInterface";
import { VoicePracticeInterface } from "@/components/ai-practice/VoicePracticeInterface";
import { LevelSelector, Level } from "@/components/ai-practice/LevelSelector";
import { ModeSelector, PracticeMode } from "@/components/ai-practice/ModeSelector";
import { FeedbackPanel } from "@/components/ai-practice/FeedbackPanel";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api, type WeeklyFocusResponse } from "@/services/api";
import { toast } from "sonner";

export type PracticeType = "ielts" | "conversation";

export interface Topic {
  id: string;
  title: string;
  titleVi: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: React.ReactNode;
}

export interface FeedbackData {
  overall: number;
  pronunciation: number;
  grammar: number;
  vocabulary: number;
  fluency: number;
  coherence: number;
  cohesion: number;
  suggestions: string[];
  highlights: string[];
  insufficientData?: boolean;
  // Detailed feedback fields
  pronunciationIssues?: string[];
  grammarIssues?: string[];
  vocabularyNotes?: string[];
  fluencyNotes?: string[];
  coherenceNotes?: string[];
  cohesionNotes?: string[];
}

interface TranscriptEntry {
  role: "user" | "agent";
  text: string;
}

// Removed "select-topic" step - topic is auto-selected from current module
type Step = "select-type" | "select-level" | "select-mode" | "practice" | "loading-feedback" | "feedback";

interface CurrentModule {
  id: number;
  moduleNumber: number;
  title: string;
  topic?: string;
}

const AIPracticeDemo = () => {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>("select-type");
  const [practiceType, setPracticeType] = useState<PracticeType | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedMode, setSelectedMode] = useState<PracticeMode | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [currentModule, setCurrentModule] = useState<CurrentModule | null>(null);
  const [isLoadingModule, setIsLoadingModule] = useState(true);
  const [weeklyFocus, setWeeklyFocus] = useState<WeeklyFocusResponse | null>(null);

  // Fetch current module on load
  useEffect(() => {
    const loadCurrentModule = async () => {
      if (!isAuthenticated || !user) {
        setIsLoadingModule(false);
        return;
      }

      try {
        let studentId: number | null = null;
        if (user.role === "student") {
          studentId = user.profileId;
        } else if (user.role === "parent") {
          const children = await api.getChildren(user.profileId);
          studentId = children[0]?.id || null;
        }

        if (studentId) {
          const enrollment = await api.getStudentEnrollment(studentId);
          const topicFromUrl = searchParams.get("topic");
          const modules = enrollment?.course?.modules || [];

          // If topic is in URL, find matching module; otherwise use current module
          let module = topicFromUrl
            ? modules.find((m) => m.topic === topicFromUrl || m.title === topicFromUrl)
            : undefined;
          if (!module) {
            module = modules.find((m) => m.moduleNumber === enrollment?.currentModuleNumber);
          }

          if (module) {
            const topicName = topicFromUrl || module.topic || "Work";
            setCurrentModule({
              id: module.id,
              moduleNumber: module.moduleNumber,
              title: module.title,
              topic: topicName,
            });

            // Fetch weekly focus for this module
            try {
              const focus = await api.getWeeklyFocusByModule(module.id);
              if (focus) setWeeklyFocus(focus);
            } catch {
              // no weekly focus set
            }
            
            setSelectedTopic({
              id: `module-${module.id}`,
              title: module.title,
              titleVi: module.title,
              titleEn: module.title,
              description: `Luyện tập chủ đề: ${topicName}`,
              descriptionEn: `Practice topic: ${topicName}`,
              icon: <BookOpen className="w-5 h-5" />,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load current module:", error);
      } finally {
        setIsLoadingModule(false);
      }
    };

    loadCurrentModule();
  }, [isAuthenticated, user, searchParams]);

  // Skip topic selection - go directly to level selection
  const handleSelectType = (type: PracticeType) => {
    setPracticeType(type);
    setStep("select-level");
  };

  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    setStep("select-mode");
  };

  const handleSelectMode = (mode: PracticeMode) => {
    setSelectedMode(mode);
    setStep("practice");
  };

  const resolveStudentId = async () => {
    if (!isAuthenticated || !user) return null;
    if (user.role === "student") return user.profileId;
    if (user.role === "parent") {
      const children = await api.getChildren(user.profileId);
      return children[0]?.id || null;
    }
    return null;
  };

  const resolveCurrentModule = async (studentId: number) => {
    try {
      const enrollment = await api.getStudentEnrollment(studentId);
      return enrollment?.course?.modules?.find(
        (m) => m.moduleNumber === enrollment.currentModuleNumber
      );
    } catch {
      return undefined;
    }
  };

  const recordLearningHistory = async (feedbackToStore: FeedbackData) => {
    const studentId = await resolveStudentId();
    if (!studentId) return;
    const module = await resolveCurrentModule(studentId);
    
    // Luôn dùng thời gian thực tế
    const now = new Date();
    const timestamp = now.toISOString();
    
    await api.createStudentLearningHistory(studentId, {
      moduleId: module?.id,
      activityType: "ai_practice",
      startTime: timestamp,
      endTime: timestamp,
      aiFeedback: {
        feedbackText: JSON.stringify(feedbackToStore),
        overallScore: feedbackToStore.overall,
      },
    });
    window.dispatchEvent(new Event("learning-history-updated"));
  };

  const handlePracticeComplete = async (transcript?: TranscriptEntry[]) => {
    if (!selectedTopic || !selectedLevel) return;

    // If no transcript or it's from chat mode without transcript, use fallback
    if (!transcript || transcript.length === 0) {
      const fallbackFeedback = getDefaultFeedback();
      setFeedback(fallbackFeedback);
      try {
        await recordLearningHistory(fallbackFeedback);
      } catch (error) {
        console.error("Failed to record learning history:", error);
      }
      setStep("feedback");
      return;
    }

    setStep("loading-feedback");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/ai-practice/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          topic: language === "vi" ? selectedTopic.titleVi : selectedTopic.titleEn,
          level: selectedLevel,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get feedback");
      }

      const data = await response.json();
      const feedbackData = data?.feedback || getDefaultFeedback();
      setFeedback(feedbackData);
      try {
        await recordLearningHistory(feedbackData);
      } catch (error) {
        console.error("Failed to record learning history:", error);
      }
    } catch (err) {
      console.error("Failed to get feedback:", err);
      toast.error(t("aiPractice.feedbackError"));
      const fallbackFeedback = getDefaultFeedback();
      setFeedback(fallbackFeedback);
      try {
        await recordLearningHistory(fallbackFeedback);
      } catch (error) {
        console.error("Failed to record learning history:", error);
      }
    }

    setStep("feedback");
  };

  const getDefaultFeedback = (): FeedbackData => ({
    overall: 6.0,
    pronunciation: 6.0,
    grammar: 6.0,
    vocabulary: 6.0,
    fluency: 6.0,
    coherence: 6.0,
    cohesion: 6.0,
    suggestions: language === "vi" ? [
      "Thử luyện tập thêm để có nhiều dữ liệu đánh giá hơn",
      "Cố gắng nói nhiều hơn trong các buổi thực hành",
      "Mở rộng câu trả lời với nhiều chi tiết hơn",
    ] : [
      "Try practicing more to get more evaluation data",
      "Try speaking more during practice sessions",
      "Expand your answers with more details",
    ],
    highlights: language === "vi" ? [
      "Bạn đã hoàn thành buổi luyện tập",
      "Bạn có sự dũng cảm để thực hành tiếng Anh",
      "Tiếp tục cố gắng để tiến bộ hơn",
    ] : [
      "You completed the practice session",
      "You have the courage to practice English",
      "Keep trying to improve",
    ],
  });

  const handleBack = () => {
    switch (step) {
      case "select-level":
        setStep("select-type");
        setPracticeType(null);
        break;
      case "select-mode":
        setStep("select-level");
        setSelectedLevel(null);
        break;
      case "practice":
        setStep("select-mode");
        setSelectedMode(null);
        break;
      case "feedback":
        setStep("practice");
        setFeedback(null);
        break;
    }
  };

  const handleReset = () => {
    setStep("select-type");
    setPracticeType(null);
    setSelectedTopic(null);
    setSelectedLevel(null);
    setSelectedMode(null);
    setFeedback(null);
  };

  // Updated steps - removed topic selection step
  const steps = [
    { key: "select-type", label: t("aiPractice.step1") },
    { key: "select-level", label: t("aiPractice.step3") },
    { key: "select-mode", label: t("aiPractice.step4") },
    { key: "practice", label: t("aiPractice.step5") },
    { key: "feedback", label: t("aiPractice.step6") },
  ];
  const currentIndex = steps.findIndex(s => s.key === step || (step === "loading-feedback" && s.key === "feedback"));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Bot className="w-4 h-4" />
            <span className="text-sm font-medium">{t("aiPractice.badge")}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">{t("aiPractice.title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("aiPractice.subtitle")}</p>
          
          {/* Show current module topic */}
          {currentModule && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20">
              <BookOpen className="w-4 h-4 text-accent-foreground" />
              <span className="text-sm">
                <span className="text-muted-foreground">{language === "vi" ? "Chủ đề:" : "Topic:"}</span>{" "}
                <span className="font-medium text-foreground">{currentModule.title}</span>
                <span className="text-muted-foreground"> (Module {currentModule.moduleNumber})</span>
              </span>
            </div>
          )}

          {/* Weekly speaking goals from teacher */}
          {weeklyFocus && weeklyFocus.speakingGoals.length > 0 && (
            <div className="mt-3 inline-flex flex-col items-center gap-1.5 px-5 py-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30">
              <div className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-400">
                <Target className="w-4 h-4" />
                {language === "vi" ? "Mục tiêu tuần này:" : "This week's goals:"}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {weeklyFocus.speakingGoals.map((goal, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-12 overflow-x-auto pb-2">
          <div className="flex items-center gap-1 md:gap-2">
            {steps.map((s, index) => (
              <div key={s.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-colors ${
                    index < currentIndex ? "bg-primary text-primary-foreground" : index === currentIndex ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"
                  }`}>
                    {index < currentIndex ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : index + 1}
                  </div>
                  <span className={`mt-2 text-[10px] md:text-xs max-w-[60px] md:max-w-none text-center ${index <= currentIndex ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.label}</span>
                </div>
                {index < steps.length - 1 && <div className={`w-4 md:w-8 h-0.5 mx-1 md:mx-2 ${index < currentIndex ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {step !== "select-type" && step !== "loading-feedback" && (
            <Button variant="ghost" onClick={handleBack} className="mb-6 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />{t("aiPractice.back")}
            </Button>
          )}
          
          {step === "select-type" && <PracticeTypeSelector onSelect={handleSelectType} />}
          {step === "select-level" && <LevelSelector onSelect={handleSelectLevel} />}
          {step === "select-mode" && <ModeSelector onSelect={handleSelectMode} />}
          {step === "practice" && selectedTopic && selectedLevel && selectedMode === "chat" && (
            <ChatPracticeInterface topic={selectedTopic} level={selectedLevel} onComplete={handlePracticeComplete} speakingGoals={weeklyFocus?.speakingGoals} />
          )}
          {step === "practice" && selectedTopic && selectedLevel && selectedMode === "voice" && (
            <VoicePracticeInterface topic={selectedTopic} level={selectedLevel} onComplete={handlePracticeComplete} speakingGoals={weeklyFocus?.speakingGoals} />
          )}
          {step === "loading-feedback" && (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t("aiPractice.analyzingPerformance")}
              </h3>
              <p className="text-muted-foreground">
                {t("aiPractice.pleaseWait")}
              </p>
            </div>
          )}
          {step === "feedback" && feedback && selectedTopic && <FeedbackPanel feedback={feedback} topic={selectedTopic} onTryAgain={() => setStep("practice")} onNewTopic={handleReset} />}
        </div>
      </main>
    </div>
  );
};

export default AIPracticeDemo;
