import { useState, useRef, useEffect } from "react";
import { Topic } from "@/pages/AIPracticeDemo";
import { Level } from "./LevelSelector";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SuggestedResponses } from "./SuggestedResponses";
import { toast } from "sonner";

interface TranscriptEntry {
  role: "user" | "agent";
  text: string;
}

interface ChatPracticeInterfaceProps {
  topic: Topic;
  level: Level;
  onComplete: (transcript: TranscriptEntry[]) => void;
  speakingGoals?: string[];
}

interface Message {
  role: "assistant" | "user";
  content: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const CHAT_URL = `${API_BASE_URL}/ai-practice/chat`;

export const ChatPracticeInterface = ({ topic, level, onComplete, speakingGoals }: ChatPracticeInterfaceProps) => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get initial AI message on mount
  useEffect(() => {
    getInitialMessage();
  }, []);

  const getInitialMessage = async () => {
    setIsLoading(true);
    
    const topicName = language === "vi" ? topic.titleVi : topic.titleEn;
    const topicDesc = language === "vi" ? topic.description : topic.descriptionEn;
    
    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Start the conversation. This is my first message." }],
          level,
          topic: topicName,
          topicDescription: topicDesc,
          speakingGoals,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      const content = data.content || "";
      
      setMessages([{ role: "assistant", content }]);
      parseSuggestions(content);
    } catch (error) {
      console.error("Failed to get initial message:", error);
      toast.error(t("aiPractice.connectionError"));
    } finally {
      setIsLoading(false);
    }
  };

  const addAssistantMessage = (content: string) => {
    setMessages(prev => [...prev, { role: "assistant", content }]);
    parseSuggestions(content);
  };

  const parseSuggestions = (text: string) => {
    const suggestionsMatch = text.match(/---SUGGESTIONS---\s*(\{.*?\})\s*---END---/s);
    if (suggestionsMatch) {
      try {
        const parsed = JSON.parse(suggestionsMatch[1]);
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          setSuggestedResponses(parsed.suggestions);
        }
      } catch (e) {
        console.error("Failed to parse suggestions:", e);
        setSuggestedResponses([]);
      }
    } else {
      setSuggestedResponses([]);
    }
  };

  const getDisplayContent = (content: string) => {
    // Remove the suggestions block from displayed content
    return content.replace(/---SUGGESTIONS---[\s\S]*?---END---/g, "").trim();
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setSuggestedResponses([]);
    setIsLoading(true);
    setMessageCount(prev => prev + 1);

    const topicName = language === "vi" ? topic.titleVi : topic.titleEn;
    const topicDesc = language === "vi" ? topic.description : topic.descriptionEn;

    try {
      // Build conversation history for API
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          level,
          topic: topicName,
          topicDescription: topicDesc,
          speakingGoals,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      const content = data.content || "";
      
      addAssistantMessage(content);

      // Check if conversation should end
      if (messageCount >= 5) {
        // After 6 exchanges, offer to complete
        setSuggestedResponses(prev => [...prev, t("aiPractice.endPractice")]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(t("aiPractice.connectionError"));
    } finally {
      setIsLoading(false);
    }
  };

  const buildTranscript = (): TranscriptEntry[] => {
    return messages.map(m => ({
      role: m.role === "user" ? "user" : "agent",
      text: getDisplayContent(m.content),
    }));
  };

  const handleSuggestionSelect = (suggestion: string) => {
    if (suggestion === t("aiPractice.endPractice")) {
      onComplete(buildTranscript());
      return;
    }
    setInputText(suggestion);
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t("aiPractice.chat.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {language === "vi" ? topic.titleVi : topic.titleEn} • {t(`aiPractice.level.${level}`)}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === "assistant" ? "bg-primary/10" : "bg-secondary/10"
            }`}>
              {message.role === "assistant" ? (
                <Bot className="w-4 h-4 text-primary" />
              ) : (
                <User className="w-4 h-4 text-secondary" />
              )}
            </div>
            <div className={`max-w-[75%] p-3 rounded-2xl ${
              message.role === "assistant" 
                ? "bg-muted text-foreground rounded-tl-none" 
                : "bg-primary text-primary-foreground rounded-tr-none"
            }`}>
              <p className="text-sm whitespace-pre-wrap">{getDisplayContent(message.content)}</p>
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted p-3 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Responses */}
      {suggestedResponses.length > 0 && !isLoading && (
        <div className="border-t border-border p-4">
          <SuggestedResponses
            suggestions={suggestedResponses}
            onSelect={handleSuggestionSelect}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={t("aiPractice.inputPlaceholder")}
            className="flex-1 px-4 py-2 rounded-full bg-muted border-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="w-12 h-12 rounded-full p-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-muted-foreground">
            {t("aiPractice.chat.hint")}
          </p>
          {messageCount >= 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComplete(buildTranscript())}
              className="text-xs"
            >
              {t("aiPractice.chat.finish")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
