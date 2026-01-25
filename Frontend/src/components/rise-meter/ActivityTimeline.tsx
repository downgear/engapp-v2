import { Bot, Users, BookOpen, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface Activity {
  id: string;
  type: "ai-practice" | "mentor" | "lesson" | "achievement";
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  timestamp: string;
  timestampEn: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

const activityIcons = {
  "ai-practice": Bot,
  mentor: Users,
  lesson: BookOpen,
  achievement: Award,
};

const activityColors = {
  "ai-practice": "bg-secondary text-secondary-foreground",
  mentor: "bg-accent text-accent-foreground",
  lesson: "bg-primary text-primary-foreground",
  achievement: "bg-primary text-primary-foreground",
};

const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  const { t, language } = useLanguage();
  
  return (
    <Card className="bg-white p-6">
      <h3 className="text-xl font-bold text-foreground mb-6">{t("riseMeter.recentActivity")}</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type];
          return (
            <div key={activity.id} className="flex gap-4">
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${activityColors[activity.type]}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {index < activities.length - 1 && (
                  <div className="absolute left-1/2 top-12 w-0.5 h-8 bg-muted -translate-x-1/2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <h4 className="font-semibold text-foreground">
                  {language === "vi" ? activity.title : activity.titleEn}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {language === "vi" ? activity.description : activity.descriptionEn}
                </p>
                <span className="text-xs text-muted-foreground">
                  {language === "vi" ? activity.timestamp : activity.timestampEn}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ActivityTimeline;
