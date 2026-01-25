import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Bot, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface Activity {
  id: string;
  type: "class" | "ai_practice" | "mentor";
  titleVi: string;
  titleEn: string;
  resultVi: string;
  resultEn: string;
  date: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const { t, language } = useLanguage();

  const activityIcons = {
    class: <BookOpen className="h-4 w-4" />,
    ai_practice: <Bot className="h-4 w-4" />,
    mentor: <Users className="h-4 w-4" />,
  };

  const activityColors = {
    class: "bg-primary/10 text-primary",
    ai_practice: "bg-secondary/10 text-secondary",
    mentor: "bg-accent/30 text-accent-foreground",
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("parent.recentActivities")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 py-2">
              <div className={`p-2 rounded-lg ${activityColors[activity.type]}`}>
                {activityIcons[activity.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">
                  {language === "vi" ? activity.titleVi : activity.titleEn}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {language === "vi" ? activity.resultVi : activity.resultEn}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.date}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
