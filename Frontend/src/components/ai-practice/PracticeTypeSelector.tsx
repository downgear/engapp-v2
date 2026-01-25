import { BookOpen, MessageCircle } from "lucide-react";
import { PracticeType } from "@/pages/AIPracticeDemo";
import { useLanguage } from "@/contexts/LanguageContext";

interface PracticeTypeSelectorProps {
  onSelect: (type: PracticeType) => void;
}

export const PracticeTypeSelector = ({ onSelect }: PracticeTypeSelectorProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <button
        onClick={() => onSelect("ielts")}
        className="group p-8 rounded-2xl bg-card border-2 border-border hover:border-primary transition-all duration-300 text-left hover:shadow-lg"
      >
        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">
          {t("aiPractice.ieltsTitle")}
        </h3>
        <p className="text-muted-foreground mb-4">
          {t("aiPractice.ieltsDesc")}
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {t("aiPractice.ieltsPart1")}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {t("aiPractice.ieltsPart2")}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {t("aiPractice.ieltsPart3")}
          </li>
        </ul>
      </button>

      <button
        onClick={() => onSelect("conversation")}
        className="group p-8 rounded-2xl bg-card border-2 border-border hover:border-secondary transition-all duration-300 text-left hover:shadow-lg"
      >
        <div className="w-16 h-16 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
          <MessageCircle className="w-8 h-8 text-secondary" />
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">
          {t("aiPractice.conversationTitle")}
        </h3>
        <p className="text-muted-foreground mb-4">
          {t("aiPractice.conversationDesc")}
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            {t("aiPractice.conv1")}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            {t("aiPractice.conv2")}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            {t("aiPractice.conv3")}
          </li>
        </ul>
      </button>
    </div>
  );
};
