import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Bot, Users, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProgressSummaryProps {
  classesAttended: number;
  totalClasses: number;
  aiPracticeMinutes: number;
  mentorSessionsCompleted: number;
  cefrProgress: number;
  currentCefr: string;
  targetCefr: string;
  highlights: string[];
}

export const ProgressSummary = ({
  classesAttended,
  totalClasses,
  aiPracticeMinutes,
  mentorSessionsCompleted,
  cefrProgress,
  currentCefr,
  targetCefr,
  highlights,
}: ProgressSummaryProps) => {
  const { t } = useLanguage();

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("parent.weeklySummary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weekly Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{classesAttended}/{totalClasses}</p>
              <p className="text-xs text-muted-foreground">{t("parent.classesAttended")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Bot className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{aiPracticeMinutes}</p>
              <p className="text-xs text-muted-foreground">{t("parent.aiMinutes")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/30">
              <Users className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{mentorSessionsCompleted}</p>
              <p className="text-xs text-muted-foreground">{t("parent.mentorSessions")}</p>
            </div>
          </div>
        </div>

        {/* CEFR Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("parent.cefrProgress")}</span>
            <span className="font-medium text-foreground">{currentCefr} → {targetCefr}</span>
          </div>
          <Progress value={cefrProgress} className="h-2" />
        </div>

        {/* Highlights */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">{t("parent.highlights")}</p>
          <ul className="space-y-1">
            {highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
