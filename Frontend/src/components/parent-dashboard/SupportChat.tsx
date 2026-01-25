import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface ChatMessage {
  id: string;
  sender: "parent" | "support";
  messageVi: string;
  messageEn: string;
  time: string;
}

interface SupportChatProps {
  messages: ChatMessage[];
}

export const SupportChat = ({ messages }: SupportChatProps) => {
  const { t, language } = useLanguage();

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t("parent.supportChat")}</CardTitle>
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.sender === "parent" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className={message.sender === "support" ? "bg-primary/20 text-primary" : "bg-muted"}>
                  {message.sender === "support" ? "S" : "P"}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  message.sender === "parent"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p>{language === "vi" ? message.messageVi : message.messageEn}</p>
                <span className="text-xs opacity-70 mt-1 block">{message.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            placeholder={t("parent.typeMessage")}
            className="flex-1"
            disabled
          />
          <Button size="icon" disabled>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {t("parent.chatDemoNote")}
        </p>
      </CardContent>
    </Card>
  );
};
