import { Topic, FeedbackData } from "@/pages/AIPracticeDemo";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home, CheckCircle2, AlertCircle, Mic, Clock3, Timer, PauseCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FeedbackPanelProps {
  feedback: FeedbackData;
  topic: Topic;
  onTryAgain: () => void;
  onNewTopic: () => void;
}

// Type for structured feedback items (grammar, pronunciation errors, etc.)
interface StructuredFeedbackItem {
  quote?: string;
  explanation?: string;
  correction?: string;
  spoken?: string;
  expected?: string;
  errorType?: string;
}

// Helper to safely render feedback items (handles both strings and JSON objects)
const renderFeedbackItem = (item: unknown): React.ReactNode => {
  if (item == null) return null;
  
  // If it's a string, check if it's JSON
  if (typeof item === 'string') {
    const trimmed = item.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed) as StructuredFeedbackItem;
        return renderStructuredItem(parsed);
      } catch {
        // Not valid JSON, render as string
        return trimmed;
      }
    }
    return trimmed;
  }
  
  // If it's an object, render as structured item
  if (typeof item === 'object') {
    return renderStructuredItem(item as StructuredFeedbackItem);
  }
  
  return String(item);
};

// Render a structured feedback item nicely
const renderStructuredItem = (item: StructuredFeedbackItem): React.ReactNode => {
  return (
    <div className="space-y-1">
      {item.quote && (
        <div>
          <span className="text-muted-foreground/70 text-xs">Câu gốc: </span>
          <span className="italic text-red-600 dark:text-red-400">"{item.quote}"</span>
        </div>
      )}
      {item.spoken && (
        <div>
          <span className="text-muted-foreground/70 text-xs">Phát âm: </span>
          <span className="italic text-red-600 dark:text-red-400">"{item.spoken}"</span>
          {item.expected && (
            <>
              <span className="text-muted-foreground/70 text-xs"> → </span>
              <span className="italic text-green-600 dark:text-green-400">"{item.expected}"</span>
            </>
          )}
        </div>
      )}
      {item.explanation && (
        <div>
          <span className="text-muted-foreground/70 text-xs">Giải thích: </span>
          <span>{item.explanation}</span>
        </div>
      )}
      {item.correction && (
        <div>
          <span className="text-muted-foreground/70 text-xs">Sửa lại: </span>
          <span className="text-green-600 dark:text-green-400">"{item.correction}"</span>
        </div>
      )}
      {item.errorType && (
        <div>
          <span className="text-xs px-1.5 py-0.5 bg-muted rounded">{item.errorType}</span>
        </div>
      )}
    </div>
  );
};

export const FeedbackPanel = ({ feedback, topic, onTryAgain, onNewTopic }: FeedbackPanelProps) => {
  const { t, language } = useLanguage();

  // Check if insufficient data
  if (feedback.insufficientData) {
    return (
      <div className="space-y-6">
        {/* Insufficient Data Warning */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-2xl p-8 border-2 border-yellow-200 dark:border-yellow-800">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {language === "vi" ? "Cần luyện tập thêm" : "Need More Practice"}
            </h2>
            <p className="text-muted-foreground max-w-md">
              {language === "vi" 
                ? "Bạn cần nói ít nhất 3 lượt hội thoại để chúng tôi có đủ dữ liệu đánh giá chi tiết. Hãy thử lại và trả lời đầy đủ hơn nhé!"
                : "You need at least 3 conversation turns for us to provide detailed assessment. Please try again and give more complete answers!"}
            </p>
          </div>
        </div>

        {/* Feedback items */}
        {feedback.suggestions && feedback.suggestions.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-secondary" />
              {t("aiPractice.suggestions")}
            </h3>
            <ul className="space-y-3">
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

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
  }

  const sessionTurns = Math.max(0, Math.round(feedback.session_length || 0));

  return (
    <div className="space-y-6">
      {/* Motivation Card */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 mb-4">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">{language === "vi" ? topic.titleVi : topic.titleEn}</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {language === "vi" ? "Bạn đã làm rất tốt!" : "You did a great job!"}
        </h2>
        <p className="text-muted-foreground">
          {language === "vi"
            ? "Mục tiêu của AI là giúp bạn nói lâu hơn, đều hơn và tự tin hơn mỗi ngày."
            : "The AI goal is to help you speak longer, more consistently, and more confidently each day."}
        </p>
      </div>

      {/* Speaking Analytics */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Clock3 className="w-5 h-5 text-primary" />
          {language === "vi" ? "Phân tích buổi nói" : "Session Analytics"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="rounded-xl border border-border p-4 bg-muted/20">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Timer className="w-3.5 h-3.5" />{language === "vi" ? "Session length" : "Session length"}</p>
            <p className="text-2xl font-bold text-foreground">{sessionTurns} {language === "vi" ? "lượt" : "turns"}</p>
          </div>
          <div className="rounded-xl border border-border p-4 bg-muted/20">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Mic className="w-3.5 h-3.5" />{language === "vi" ? "Response duration" : "Response duration"}</p>
            <p className="text-2xl font-bold text-foreground">{(feedback.response_duration || 0).toFixed(1)}s</p>
          </div>
          <div className="rounded-xl border border-border p-4 bg-muted/20">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><PauseCircle className="w-3.5 h-3.5" />{language === "vi" ? "Pause detection" : "Pause detection"}</p>
            <p className="text-2xl font-bold text-foreground">{feedback.pause_detection?.pause_count ?? 0}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          {language === "vi"
            ? "Session = tổng số lượt nói qua lại; Response duration = thời lượng trung bình cho 1 câu nói."
            : "Session = total back-and-forth speaking turns; Response duration = average duration per sentence."}
        </p>
        {feedback.pause_detection?.summary && (
          <p className="text-sm text-muted-foreground">{feedback.pause_detection.summary}</p>
        )}
        {feedback.speech_to_text && (
          <div className="mt-4 rounded-xl border border-border p-4 bg-background/60">
            <p className="text-xs font-medium text-muted-foreground mb-2">{language === "vi" ? "Speech to text" : "Speech to text"}</p>
            <p className="text-sm text-foreground leading-relaxed">{feedback.speech_to_text}</p>
          </div>
        )}
      </div>

      {/* Highlights */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          {t("aiPractice.strengths")}
        </h3>
        <ul className="space-y-3">
          {feedback.highlights?.map((highlight, index) => (
            <li key={index} className="flex items-start gap-3 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <div className="text-muted-foreground flex-1">{renderFeedbackItem(highlight)}</div>
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
          {feedback.suggestions?.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {index + 1}
              </span>
              <div className="text-muted-foreground flex-1">{renderFeedbackItem(suggestion)}</div>
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
