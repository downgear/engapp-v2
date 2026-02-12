import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LogIn, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO, subHours } from "date-fns";
import { vi } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";

interface VisitData {
  total: number;
  hourlyData: Array<{ hour: string; count: number }>;
}

export const VisitStatistics = () => {
  const { accessToken } = useAuth();
  const { language } = useLanguage();
  const [data, setData] = useState<VisitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;

      try {
        setLoading(true);
        const result = await api.getAdminVisitStatistics(accessToken, 24);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : (language === "vi" ? "Có lỗi xảy ra" : "An error occurred"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  // Generate all 24 hours for the chart (fill missing hours with 0)
  const generateChartData = () => {
    if (!data) return [];

    const now = new Date();
    const hours: { time: string; displayTime: string; count: number }[] = [];

    // Create a map of existing data
    const dataMap = new Map<string, number>();
    data.hourlyData.forEach((item) => {
      const hourKey = format(parseISO(item.hour), "yyyy-MM-dd HH:00");
      dataMap.set(hourKey, item.count);
    });

    // Generate all 24 hours
    for (let i = 23; i >= 0; i--) {
      const hour = subHours(now, i);
      const hourKey = format(hour, "yyyy-MM-dd HH:00");
      const displayTime = format(hour, "HH:mm");
      hours.push({
        time: hourKey,
        displayTime,
        count: dataMap.get(hourKey) || 0,
      });
    }

    return hours;
  };

  const chartData = generateChartData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="h-5 w-5" />
          {language === "vi" ? "Thống kê lượt đăng nhập (24h gần nhất)" : "Login Statistics (last 24h)"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <div className="space-y-6">
            {/* Total count */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="p-3 rounded-full bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold">{data?.total || 0}</div>
                <div className="text-sm text-muted-foreground">
                  {language === "vi" ? "Tổng lượt đăng nhập trong 24h" : "Total logins in 24h"}
                </div>
              </div>
            </div>

            {/* Line chart */}
            <div className="h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="displayTime"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value} ${language === "vi" ? "lượt" : "logins"}`, language === "vi" ? "Đăng nhập" : "Logins"]}
                      labelFormatter={(label) => `${language === "vi" ? "Giờ" : "Hour"}: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name={language === "vi" ? "Lượt đăng nhập" : "Logins"}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {language === "vi" ? "Không có dữ liệu" : "No data available"}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
