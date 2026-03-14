import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Clock, BarChart3, Flame, Timer } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api, type AIPracticeWeeklyStats } from "@/services/api";

interface AIPracticeWeeklyChartProps {
  studentId: number;
  /** If provided, fetch via parent endpoint */
  parentId?: number;
  language: string;
}

export const AIPracticeWeeklyChart = ({
  studentId,
  parentId,
  language,
}: AIPracticeWeeklyChartProps) => {
  const [stats, setStats] = useState<AIPracticeWeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = parentId
          ? await api.getChildAIPracticeStats(parentId, studentId, 8)
          : await api.getStudentAIPracticeStats(studentId, 8);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch AI practice stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [studentId, parentId]);

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[220px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-500" />
          {language === "vi" ? "Luyện tập AI trong tuần" : "Weekly AI Practice"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
            <Timer className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                {stats.recommendedDailyMinutesMin}-{stats.recommendedDailyMinutesMax} {language === "vi" ? "phút" : "min"}
              </p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                {language === "vi" ? "Gợi ý tối thiểu mỗi ngày" : "Recommended daily minimum"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
            <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {stats.completedPracticeRounds}
              </p>
              <p className="text-xs text-green-600/80 dark:text-green-400/80">
                {language === "vi" ? "Số vòng practice hoàn thành" : "Completed practice rounds"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {stats.totalMinutes}
              </p>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                {language === "vi" ? "Tổng số phút luyện trong tuần" : "Total practice minutes this week"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
            <Flame className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">
                {stats.currentStreakDays}
              </p>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
                {language === "vi" ? "Streak duy trì liên tục (ngày)" : "Consecutive streak (days)"}
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
              allowDecimals={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => {
                if (name === "sessions")
                  return [value, language === "vi" ? "Số phiên" : "Sessions"];
                return [`${value} ${language === "vi" ? "phút" : "min"}`, language === "vi" ? "Số phút" : "Minutes"];
              }}
              labelFormatter={(label) =>
                `${language === "vi" ? "Tuần" : "Week"} ${label}`
              }
            />
            <Legend
              formatter={(value) => {
                if (value === "sessions")
                  return language === "vi" ? "Số phiên" : "Sessions";
                return language === "vi" ? "Số phút" : "Minutes";
              }}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar
              yAxisId="left"
              dataKey="sessions"
              fill="hsl(142, 71%, 45%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              yAxisId="right"
              dataKey="minutes"
              fill="hsl(217, 91%, 60%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
