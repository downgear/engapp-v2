import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Bot, MessageSquare, Loader2 } from "lucide-react";
import { api, type MentorBriefResponse } from "@/services/api";

interface MentorBriefCardProps {
  studentId: number;
  moduleId: number;
  accessToken: string;
  language: string;
}

export const MentorBriefCard = ({ studentId, moduleId, accessToken, language }: MentorBriefCardProps) => {
  const [brief, setBrief] = useState<MentorBriefResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getMentorBrief(accessToken, studentId, moduleId);
        setBrief(data);
      } catch {
        // no data available
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accessToken, studentId, moduleId]);

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!brief || (!brief.weeklyFocus && brief.aiPracticeCount === 0)) {
    return null;
  }

  return (
    <Card className="border-orange-200 dark:border-orange-800/30 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/10 dark:to-amber-950/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-500" />
          {language === "vi" ? "Tóm tắt cho Mentor (3L)" : "Mentor Brief (3L)"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Week Topic */}
        {brief.weeklyFocus && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {language === "vi" ? "Chủ đề tuần" : "Week Topic"}
            </p>
            <p className="font-semibold text-lg">{brief.weeklyFocus.weekTopic}</p>

            {brief.weeklyFocus.speakingGoals.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {brief.weeklyFocus.speakingGoals.map((goal, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                    {goal}
                  </Badge>
                ))}
              </div>
            )}

            {brief.weeklyFocus.teacherNotes && (
              <div className="mt-2 p-3 bg-white/60 dark:bg-background/40 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === "vi" ? "Ghi chú từ giáo viên:" : "Teacher notes:"}
                </p>
                <p className="text-sm">{brief.weeklyFocus.teacherNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* AI Practice Count */}
        <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-background/40 rounded-lg">
          <Bot className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">
              {language === "vi" ? "Luyện AI trong tuần" : "AI Practice this week"}
            </p>
            <p className="font-semibold text-lg">{brief.aiPracticeCount} {language === "vi" ? "lần" : "sessions"}</p>
          </div>
        </div>

        {/* Last AI Feedback Summary */}
        {brief.lastAiFeedbackSummary && (
          <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-background/40 rounded-lg">
            <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                {language === "vi" ? "Phản hồi AI gần nhất" : "Latest AI feedback"}
              </p>
              <p className="text-sm mt-1">{brief.lastAiFeedbackSummary}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
