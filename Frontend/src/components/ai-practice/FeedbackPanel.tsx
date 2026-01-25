import { Topic, FeedbackData } from "@/pages/AIPracticeDemo";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home, CheckCircle2, AlertCircle, TrendingUp, Star, Mic, BookText, Brain, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FeedbackPanelProps {
  feedback: FeedbackData;
  topic: Topic;
  onTryAgain: () => void;
  onNewTopic: () => void;
}

export const FeedbackPanel = ({ feedback, topic, onTryAgain, onNewTopic }: FeedbackPanelProps) => {
  const { t, language } = useLanguage();
  
  const getScoreColor = (score: number) => {
    if (score >= 7.5) return "text-green-600";
    if (score >= 6.0) return "text-primary";
    if (score >= 5.0) return "text-secondary";
    return "text-destructive";
  };

  const getProgressColor = (score: number) => {
    if (score >= 7.5) return "bg-green-500";
    if (score >= 6.0) return "bg-primary";
    if (score >= 5.0) return "bg-secondary";
    return "bg-destructive";
  };

  const scores = [
    { label: t("aiPractice.pronunciation"), score: feedback.pronunciation },
    { label: t("aiPractice.grammar"), score: feedback.grammar },
    { label: t("aiPractice.vocabulary"), score: feedback.vocabulary },
    { label: t("aiPractice.fluency"), score: feedback.fluency },
    { label: t("aiPractice.coherence"), score: feedback.coherence },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 mb-4">
          <Star className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">{language === "vi" ? topic.titleVi : topic.titleEn}</span>
        </div>
        <h2 className="text-lg text-muted-foreground mb-2">{t("aiPractice.overallScore")}</h2>
        <div className={`text-6xl font-display font-bold mb-2 ${getScoreColor(feedback.overall)}`}>
          {feedback.overall.toFixed(1)}
        </div>
        <p className="text-muted-foreground">{t("aiPractice.outOf9")}</p>
      </div>

      {/* Detailed Scores */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          {t("aiPractice.detailedAnalysis")}
        </h3>
        <div className="space-y-4">
          {scores.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                  {item.score.toFixed(1)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(item.score)}`}
                  style={{ width: `${(item.score / 9) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Issues - Pronunciation */}
      {((language === "vi" ? feedback.pronunciationIssues : feedback.pronunciationIssuesEn)?.length ?? 0) > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Mic className="w-5 h-5 text-blue-600" />
            Lỗi phát âm cần cải thiện
          </h3>
          <ul className="space-y-3">
            {(language === "vi" ? feedback.pronunciationIssues : feedback.pronunciationIssuesEn)?.map((issue, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Issues - Grammar */}
      {((language === "vi" ? feedback.grammarIssues : feedback.grammarIssuesEn)?.length ?? 0) > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookText className="w-5 h-5 text-purple-600" />
            Lỗi ngữ pháp cần sửa
          </h3>
          <ul className="space-y-3">
            {(language === "vi" ? feedback.grammarIssues : feedback.grammarIssuesEn)?.map((issue, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Notes - Vocabulary */}
      {((language === "vi" ? feedback.vocabularyNotes : feedback.vocabularyNotesEn)?.length ?? 0) > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-orange-600" />
            Ghi chú về từ vựng
          </h3>
          <ul className="space-y-3">
            {(language === "vi" ? feedback.vocabularyNotes : feedback.vocabularyNotesEn)?.map((note, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Notes - Fluency */}
      {((language === "vi" ? feedback.fluencyNotes : feedback.fluencyNotesEn)?.length ?? 0) > 0 && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Ghi chú về độ lưu loát
          </h3>
          <ul className="space-y-3">
            {(language === "vi" ? feedback.fluencyNotes : feedback.fluencyNotesEn)?.map((note, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Highlights */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          {t("aiPractice.strengths")}
        </h3>
        <ul className="space-y-3">
          {(language === "vi" ? feedback.highlights : feedback.highlightsEn).map((highlight, index) => (
            <li key={index} className="flex items-start gap-3 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <span className="text-muted-foreground">{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggestions */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-secondary" />
          {t("aiPractice.suggestions")}
        </h3>
        <ul className="space-y-3">
          {(language === "vi" ? feedback.suggestions : feedback.suggestionsEn).map((suggestion, index) => (
            <li key={index} className="flex items-start gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {index + 1}
              </span>
              <span className="text-muted-foreground">{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={onTryAgain}
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("aiPractice.tryAgain")}
        </Button>
        <Button
          onClick={onNewTopic}
          className="flex-1"
        >
          <Home className="w-4 h-4 mr-2" />
          {t("aiPractice.newTopic")}
        </Button>
      </div>
    </div>
  );
};
