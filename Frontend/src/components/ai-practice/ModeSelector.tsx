import { useLanguage } from "@/contexts/LanguageContext";
import { Mic, Keyboard, Volume2, MessageSquare } from "lucide-react";

export type PracticeMode = "voice" | "chat";

interface ModeSelectorProps {
  onSelect: (mode: PracticeMode) => void;
}

export const ModeSelector = ({ onSelect }: ModeSelectorProps) => {
  const { t } = useLanguage();

  const modes = [
    {
      id: "voice" as PracticeMode,
      icon: <Mic className="w-10 h-10" />,
      secondaryIcon: <Volume2 className="w-5 h-5" />,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      hoverBorder: "hover:border-primary/50",
    },
    {
      id: "chat" as PracticeMode,
      icon: <Keyboard className="w-10 h-10" />,
      secondaryIcon: <MessageSquare className="w-5 h-5" />,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/20",
      hoverBorder: "hover:border-secondary/50",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("aiPractice.selectMode")}
        </h2>
        <p className="text-muted-foreground">
          {t("aiPractice.selectModeHint")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={`group p-8 rounded-2xl border-2 ${mode.borderColor} ${mode.hoverBorder} bg-card transition-all hover:shadow-xl hover:-translate-y-2 text-left`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-20 h-20 rounded-2xl ${mode.bgColor} flex items-center justify-center ${mode.color}`}>
                {mode.icon}
              </div>
              <div className={`w-10 h-10 rounded-xl ${mode.bgColor} flex items-center justify-center ${mode.color}`}>
                {mode.secondaryIcon}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {t(`aiPractice.mode.${mode.id}`)}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t(`aiPractice.mode.${mode.id}Desc`)}
            </p>
            <ul className="space-y-2">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className={`w-2 h-2 rounded-full ${mode.color.replace("text-", "bg-")}`} />
                  {t(`aiPractice.mode.${mode.id}Feature${i}`)}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );
};
