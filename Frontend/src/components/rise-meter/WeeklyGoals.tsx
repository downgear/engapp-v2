import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

interface Goal {
  id: string;
  title: string;
  titleEn: string;
  current: number;
  target: number;
  unit: string;
  unitEn: string;
}

interface WeeklyGoalsProps {
  goals: Goal[];
}

const WeeklyGoals = ({ goals }: WeeklyGoalsProps) => {
  const { t, language } = useLanguage();
  
  return (
    <Card className="bg-white p-6">
      <h3 className="text-xl font-bold text-foreground mb-6">{t("riseMeter.weeklyGoals")}</h3>
      <div className="space-y-5">
        {goals.map((goal) => {
          const percent = Math.min((goal.current / goal.target) * 100, 100);
          const isComplete = goal.current >= goal.target;

          return (
            <div key={goal.id}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-foreground">
                  {language === "vi" ? goal.title : goal.titleEn}
                </span>
                <span className={`text-sm font-semibold ${isComplete ? 'text-primary' : 'text-muted-foreground'}`}>
                  {goal.current}/{goal.target} {language === "vi" ? goal.unit : goal.unitEn}
                  {isComplete && <Check className="inline w-4 h-4 ml-1" />}
                </span>
              </div>
              <Progress 
                value={percent} 
                className={`h-3 ${isComplete ? '[&>div]:bg-primary' : '[&>div]:bg-secondary'}`}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default WeeklyGoals;
