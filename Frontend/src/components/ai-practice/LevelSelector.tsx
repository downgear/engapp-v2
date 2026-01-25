import { useLanguage } from "@/contexts/LanguageContext";
import { GraduationCap, BookOpen, Award } from "lucide-react";

export type Level = "beginner" | "intermediate" | "advanced";

interface LevelSelectorProps {
  onSelect: (level: Level) => void;
}

export const LevelSelector = ({ onSelect }: LevelSelectorProps) => {
  const { t } = useLanguage();

  const levels = [
    {
      id: "beginner" as Level,
      icon: <BookOpen className="w-8 h-8" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      hoverBorder: "hover:border-green-500/50",
    },
    {
      id: "intermediate" as Level,
      icon: <GraduationCap className="w-8 h-8" />,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      hoverBorder: "hover:border-blue-500/50",
    },
    {
      id: "advanced" as Level,
      icon: <Award className="w-8 h-8" />,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      hoverBorder: "hover:border-purple-500/50",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("aiPractice.selectLevel")}
        </h2>
        <p className="text-muted-foreground">
          {t("aiPractice.selectLevelHint")}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => onSelect(level.id)}
            className={`group p-6 rounded-2xl border-2 ${level.borderColor} ${level.hoverBorder} bg-card transition-all hover:shadow-lg hover:-translate-y-1 text-left`}
          >
            <div className={`w-16 h-16 rounded-xl ${level.bgColor} flex items-center justify-center mb-4 ${level.color}`}>
              {level.icon}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {t(`aiPractice.level.${level.id}`)}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t(`aiPractice.level.${level.id}Desc`)}
            </p>
            <ul className="space-y-1.5">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={`w-1.5 h-1.5 rounded-full ${level.color.replace("text-", "bg-")}`} />
                  {t(`aiPractice.level.${level.id}Feature${i}`)}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );
};
