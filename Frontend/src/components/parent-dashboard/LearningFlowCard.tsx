import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Bot, Video, RefreshCw, Target, CheckCircle2, Circle } from "lucide-react";
import { api, type WeeklyFocusResponse } from "@/services/api";

interface LearningFlowCardProps {
  moduleId: number | undefined;
  aiPracticeCount: number;
  hasVideoCall: boolean;
  language: string;
}

export const LearningFlowCard = ({ moduleId, aiPracticeCount, hasVideoCall, language }: LearningFlowCardProps) => {
  const [weeklyFocus, setWeeklyFocus] = useState<WeeklyFocusResponse | null>(null);

  useEffect(() => {
    if (!moduleId) return;
    api.getWeeklyFocusByModule(moduleId).then(setWeeklyFocus).catch(() => {});
  }, [moduleId]);

  const steps = [
    {
      icon: BookOpen,
      label: language === "vi" ? "Học trên lớp" : "Offline Class",
      sublabel: weeklyFocus?.weekTopic || (language === "vi" ? "Với GV Việt Nam" : "With Vietnamese teacher"),
      color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
      done: !!weeklyFocus,
    },
    {
      icon: Bot,
      label: language === "vi" ? "Luyện với AI" : "AI Practice",
      sublabel: aiPracticeCount > 0
        ? (language === "vi" ? `${aiPracticeCount} lần luyện tập` : `${aiPracticeCount} sessions`)
        : (language === "vi" ? "Chưa luyện tập" : "Not practiced yet"),
      color: "text-green-500 bg-green-100 dark:bg-green-900/30",
      done: aiPracticeCount > 0,
    },
    {
      icon: Video,
      label: language === "vi" ? "Mentor hỗ trợ" : "Mentor Session",
      sublabel: language === "vi" ? "Video call 1-1" : "1-on-1 video call",
      color: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
      done: hasVideoCall,
    },
    {
      icon: RefreshCw,
      label: language === "vi" ? "Phản hồi tuần sau" : "Next Week Feedback",
      sublabel: language === "vi" ? "Vòng lặp tiếp tục" : "Loop continues",
      color: "text-orange-500 bg-orange-100 dark:bg-orange-900/30",
      done: false,
    },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-500" />
          {language === "vi" ? "Mô hình 3L tuần này" : "This Week's 3L Model"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Weekly topic banner */}
        {weeklyFocus && (
          <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800/30">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
              {language === "vi" ? "Chủ đề tuần:" : "Week topic:"} {weeklyFocus.weekTopic}
            </p>
            {weeklyFocus.speakingGoals.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {weeklyFocus.speakingGoals.map((goal, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                    {goal}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Flow steps */}
        <div className="flex items-start justify-between gap-1">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center text-center flex-1">
                  <div className={`relative w-12 h-12 rounded-full flex items-center justify-center ${step.color}`}>
                    <Icon className="h-5 w-5" />
                    {step.done && (
                      <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-green-500 bg-background rounded-full" />
                    )}
                    {!step.done && index < 3 && (
                      <Circle className="absolute -top-1 -right-1 h-4 w-4 text-muted-foreground/30 bg-background rounded-full" />
                    )}
                  </div>
                  <p className="text-xs font-medium mt-2 leading-tight">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight max-w-[80px]">{step.sublabel}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-6 h-0.5 mt-6 flex-shrink-0 ${step.done ? 'bg-green-400' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
