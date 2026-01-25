import { useState } from "react";
import { Topic } from "@/pages/AIPracticeDemo";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Bot, User, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PracticeInterfaceProps {
  topic: Topic;
  onComplete: () => void;
}

interface Message {
  role: "ai" | "user";
  content: string;
}

// Generic initial message based on topic title
const getInitialMessage = (topic: Topic): Message[] => {
  return [
    { role: "ai", content: `Hello! Today we're going to practice speaking about "${topic.titleEn}". Let's start with a simple question: Can you tell me a little about yourself and your experience with this topic?` },
  ];
};

// Generic AI responses for any topic
const genericResponses: string[] = [
  "That's very interesting! Can you tell me more about that?",
  "Great point! How does that make you feel?",
  "I see. Can you give me a specific example?",
  "That's a good observation. What do you think are the main reasons for that?",
  "Interesting perspective! How has your experience changed over time?",
  "Thank you for sharing. Is there anything else you'd like to add about this topic?",
];

export const PracticeInterface = ({ topic, onComplete }: PracticeInterfaceProps) => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(getInitialMessage(topic));
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [responseIndex, setResponseIndex] = useState(0);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = { role: "user", content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsAiTyping(true);

    // Simulate AI response using generic responses
    setTimeout(() => {
      if (responseIndex < genericResponses.length) {
        setMessages(prev => [...prev, { role: "ai", content: genericResponses[responseIndex] }]);
        setResponseIndex(prev => prev + 1);
      } else {
        setMessages(prev => [...prev, { role: "ai", content: "Thank you for your responses. Let me analyze your speaking performance..." }]);
        setTimeout(onComplete, 2000);
      }
      setIsAiTyping(false);
    }, 1500);
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      // Simulate voice input
      setInputText("This is a simulated voice response for the demo.");
    }
    setIsRecording(!isRecording);
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
            <h3 className="font-semibold text-foreground">AI Practice Partner</h3>
            <p className="text-sm text-muted-foreground">{language === "vi" ? topic.titleVi : topic.titleEn}</p>
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
              message.role === "ai" ? "bg-primary/10" : "bg-secondary/10"
            }`}>
              {message.role === "ai" ? (
                <Bot className="w-4 h-4 text-primary" />
              ) : (
                <User className="w-4 h-4 text-secondary" />
              )}
            </div>
            <div className={`max-w-[75%] p-3 rounded-2xl ${
              message.role === "ai" 
                ? "bg-muted text-foreground rounded-tl-none" 
                : "bg-primary text-primary-foreground rounded-tr-none"
            }`}>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        {isAiTyping && (
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
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-3">
          <button
            onClick={handleRecordToggle}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isRecording 
                ? "bg-destructive text-destructive-foreground animate-pulse" 
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={t("aiPractice.inputPlaceholder")}
            className="flex-1 px-4 py-2 rounded-full bg-muted border-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isAiTyping}
            className="w-12 h-12 rounded-full p-0"
          >
            {isAiTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          {t("aiPractice.demoHint")}
        </p>
      </div>
    </div>
  );
};
