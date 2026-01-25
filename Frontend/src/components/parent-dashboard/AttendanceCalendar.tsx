import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Circle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export interface AttendanceDay {
  date: string;
  status: "attended" | "missed" | "upcoming" | "none";
}

interface AttendanceCalendarProps {
  attendanceData: AttendanceDay[];
  attendanceRate: number;
  missedCount: number;
}

export const AttendanceCalendar = ({
  attendanceData,
  attendanceRate,
  missedCount,
}: AttendanceCalendarProps) => {
  const { t } = useLanguage();

  const statusIcons = {
    attended: <Check className="h-3 w-3 text-primary" />,
    missed: <X className="h-3 w-3 text-destructive" />,
    upcoming: <Circle className="h-3 w-3 text-muted-foreground" />,
    none: null,
  };

  const statusBg = {
    attended: "bg-primary/20 border-primary/30",
    missed: "bg-destructive/20 border-destructive/30",
    upcoming: "bg-muted border-border",
    none: "bg-transparent border-transparent",
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("parent.attendanceOverview")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calendar Grid - Last 4 weeks */}
        <div className="grid grid-cols-7 gap-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div key={i} className="text-center text-xs text-muted-foreground font-medium py-1">
              {day}
            </div>
          ))}
          {attendanceData.map((day, index) => (
            <div
              key={index}
              className={cn(
                "aspect-square flex items-center justify-center rounded-md border text-xs",
                statusBg[day.status]
              )}
            >
              {statusIcons[day.status]}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary/20 border border-primary/30" />
            <span>{t("parent.attended")}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-destructive/20 border border-destructive/30" />
            <span>{t("parent.missed")}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted border border-border" />
            <span>{t("parent.upcoming")}</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex justify-between pt-2 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-semibold text-primary">{attendanceRate}%</p>
            <p className="text-xs text-muted-foreground">{t("parent.attendanceRate")}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-destructive">{missedCount}</p>
            <p className="text-xs text-muted-foreground">{t("parent.missedSessions")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
