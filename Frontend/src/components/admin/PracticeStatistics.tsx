import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mic, Video, TrendingUp } from "lucide-react";
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

interface PracticeData {
  aiPractice: {
    total: number;
    hourlyData: Array<{ hour: string; count: number }>;
  };
  videoCall: {
    total: number;
    hourlyData: Array<{ hour: string; count: number }>;
  };
}

export const PracticeStatistics = () => {
  const { accessToken } = useAuth();
  const [data, setData] = useState<PracticeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;

      try {
        setLoading(true);
        const result = await api.getAdminPracticeStatistics(accessToken, 24);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  // Generate chart data with all 24 hours filled
  const generateChartData = () => {
    if (!data) return [];

    const now = new Date();
    const hours: { time: string; displayTime: string; aiPractice: number; videoCall: number }[] = [];

    // Create maps for both data types
    const aiMap = new Map<string, number>();
    const videoMap = new Map<string, number>();

    data.aiPractice.hourlyData.forEach((item) => {
      const hourKey = format(parseISO(item.hour), "yyyy-MM-dd HH:00");
      aiMap.set(hourKey, item.count);
    });

    data.videoCall.hourlyData.forEach((item) => {
      const hourKey = format(parseISO(item.hour), "yyyy-MM-dd HH:00");
      videoMap.set(hourKey, item.count);
    });

    // Generate all 24 hours
    for (let i = 23; i >= 0; i--) {
      const hour = subHours(now, i);
      const hourKey = format(hour, "yyyy-MM-dd HH:00");
      const displayTime = format(hour, "HH:mm");
      hours.push({
        time: hourKey,
        displayTime,
        aiPractice: aiMap.get(hourKey) || 0,
        videoCall: videoMap.get(hourKey) || 0,
      });
    }

    return hours;
  };

  const chartData = generateChartData();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100">
                  <Mic className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {data?.aiPractice.total || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Lượt luyện nói với AI (24h)
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100">
                  <Video className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">
                    {data?.videoCall.total || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Lượt video call với giáo viên (24h)
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Combined Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Biểu đồ hoạt động luyện tập (24h gần nhất)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <div className="h-[350px]">
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
                      formatter={(value: number, name: string) => {
                        const label =
                          name === "aiPractice"
                            ? "Luyện nói AI"
                            : "Video call";
                        return [`${value} lượt`, label];
                      }}
                      labelFormatter={(label) => `Giờ: ${label}`}
                    />
                    <Legend
                      formatter={(value) =>
                        value === "aiPractice" ? "Luyện nói AI" : "Video call"
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="aiPractice"
                      name="aiPractice"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="videoCall"
                      name="videoCall"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Không có dữ liệu
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
