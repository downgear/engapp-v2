import { GraduationCap, Bot, Users, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

interface ThreeLProgressProps {
  learnProgress: { completed: number; total: number };
  loopMinutes: number;
  loopStreak: number;
  levelUpSessions: number;
  nextSessionDays: number;
}

const ThreeLProgress = ({
  learnProgress,
  loopMinutes,
  loopStreak,
  levelUpSessions,
  nextSessionDays,
}: ThreeLProgressProps) => {
  const { t } = useLanguage();
  const learnPercent = (learnProgress.completed / learnProgress.total) * 100;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Learn */}
      <Card className="bg-primary text-primary-foreground p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Learn</h3>
        </div>
        <p className="text-lg mb-2">
          {learnProgress.completed}/{learnProgress.total} {t("riseMeter.lessonsCompleted")}
        </p>
        <Progress value={learnPercent} className="h-2 bg-white/20" />
        <p className="text-sm mt-2 opacity-80">{t("riseMeter.continueUnlock")}</p>
      </Card>

      {/* Loop */}
      <Card className="bg-secondary text-secondary-foreground p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Loop</h3>
        </div>
        <p className="text-lg mb-2">{loopMinutes} {t("riseMeter.aiMinutes")}</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="font-semibold">{loopStreak} {t("riseMeter.consecutiveDays")}</span>
        </div>
        <p className="text-sm mt-2 opacity-80">{t("riseMeter.keepStreak")}</p>
      </Card>

      {/* Level Up */}
      <Card className="bg-accent text-accent-foreground p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Level Up</h3>
        </div>
        <p className="text-lg mb-2">{levelUpSessions} {t("riseMeter.mentorSessions")}</p>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          <span>{t("riseMeter.nextSession")} {nextSessionDays} {t("riseMeter.daysAway")}</span>
        </div>
        <p className="text-sm mt-2 opacity-80">{t("riseMeter.mentorBreakthrough")}</p>
      </Card>
    </div>
  );
};

export default ThreeLProgress;
