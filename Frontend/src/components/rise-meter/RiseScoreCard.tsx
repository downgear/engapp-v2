import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface RiseScoreCardProps {
  score: number;
  cefrLevel: string;
  cefrLabel: string;
  weeklyChange: number;
}

const RiseScoreCard = ({ score, cefrLevel, cefrLabel, weeklyChange }: RiseScoreCardProps) => {
  const { t } = useLanguage();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const isPositive = weeklyChange >= 0;

  return (
    <Card className="bg-white p-8 text-center">
      <h2 className="text-2xl font-bold text-foreground mb-6">{t("riseMeter.riseScore")}</h2>
      
      <div className="flex justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-primary">{score}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>
      </div>

      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-lg px-4 py-2 mb-4">
        {cefrLevel} - {cefrLabel}
      </Badge>

      <div className={`flex items-center justify-center gap-2 ${isPositive ? 'text-primary' : 'text-destructive'}`}>
        {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        <span className="font-semibold">
          {isPositive ? '+' : ''}{weeklyChange} {t("riseMeter.pointsThisWeek")}
        </span>
      </div>

      <p className="mt-4 text-muted-foreground">
        {isPositive ? t("riseMeter.progressingWell") : t("riseMeter.keepTrying")}
      </p>
    </Card>
  );
};

export default RiseScoreCard;
