import { useLanguage } from "@/contexts/LanguageContext";
import { Lightbulb } from "lucide-react";

interface SuggestedResponsesProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

export const SuggestedResponses = ({ suggestions, onSelect, disabled = false }: SuggestedResponsesProps) => {
  const { t } = useLanguage();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lightbulb className="w-4 h-4 text-yellow-500" />
        <span>{t("aiPractice.suggestedResponses")}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
            className="px-4 py-2 text-sm rounded-full bg-muted/50 hover:bg-muted text-foreground border border-border hover:border-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
