import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar, Zap, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface OverviewCardsProps {
  riseScore: number;
  riseScoreChange: number;
  attendanceRate: number;
  engagementLevel: "low" | "medium" | "high";
  nextSession: string;
}

export const OverviewCards = ({
  riseScore,
  riseScoreChange,
  attendanceRate,
  engagementLevel,
  nextSession,
}: OverviewCardsProps) => {
  const { t } = useLanguage();

  const engagementColors = {
    low: "text-destructive bg-destructive/10",
    medium: "text-secondary bg-secondary/10",
    high: "text-primary bg-primary/10",
  };

  const engagementLabels = {
    low: t("parent.engagementLow"),
    medium: t("parent.engagementMedium"),
    high: t("parent.engagementHigh"),
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Rise Score */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{t("parent.riseScore")}</span>
            <div className={`flex items-center gap-1 text-xs ${riseScoreChange >= 0 ? "text-primary" : "text-destructive"}`}>
              {riseScoreChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {riseScoreChange > 0 ? "+" : ""}{riseScoreChange}
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{riseScore}</p>
        </CardContent>
      </Card>

      {/* Attendance */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{t("parent.attendance")}</span>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold text-foreground">{attendanceRate}%</p>
        </CardContent>
      </Card>

      {/* Engagement */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{t("parent.engagement")}</span>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${engagementColors[engagementLevel]}`}>
            {engagementLabels[engagementLevel]}
          </span>
        </CardContent>
      </Card>

      {/* Next Session */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{t("parent.nextSession")}</span>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">{nextSession}</p>
        </CardContent>
      </Card>
    </div>
  );
};
