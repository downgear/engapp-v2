import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface Achievement {
  id: string;
  emoji: string;
  title: string;
  titleEn: string;
  description: string;
  unlocked: boolean;
}

interface AchievementsPanelProps {
  streak: number;
  achievements: Achievement[];
  nextMilestone: string;
  nextMilestoneEn: string;
}

const AchievementsPanel = ({ streak, achievements, nextMilestone, nextMilestoneEn }: AchievementsPanelProps) => {
  const { t, language } = useLanguage();
  
  return (
    <Card className="bg-white p-6">
      <h3 className="text-xl font-bold text-foreground mb-4">{t("riseMeter.achievements")}</h3>
      
      {/* Streak */}
      <div className="bg-accent/20 rounded-xl p-4 mb-6 text-center">
        <div className="text-4xl mb-2">🔥</div>
        <p className="text-2xl font-bold text-foreground">{streak} {t("riseMeter.days")}</p>
        <p className="text-sm text-muted-foreground">{t("riseMeter.streak")}</p>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative rounded-xl p-3 text-center transition-all ${
              achievement.unlocked
                ? "bg-primary/10"
                : "bg-muted opacity-60"
            }`}
          >
            <div className="text-2xl mb-1">
              {achievement.unlocked ? achievement.emoji : <Lock className="w-6 h-6 mx-auto text-muted-foreground" />}
            </div>
            <p className="text-xs font-medium text-foreground truncate">
              {language === "vi" ? achievement.title : achievement.titleEn}
            </p>
          </div>
        ))}
      </div>

      <p className="text-sm text-center text-muted-foreground">
        {t("riseMeter.nextMilestone")} {language === "vi" ? nextMilestone : nextMilestoneEn}
      </p>
    </Card>
  );
};

export default AchievementsPanel;
