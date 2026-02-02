import { useState, useCallback, useEffect, useRef } from "react";
import { Topic } from "@/pages/AIPracticeDemo";
import { Level } from "./LevelSelector";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mic, Phone, PhoneOff, Bot, Volume2, Subtitles, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ClosedCaptions } from "./ClosedCaptions";
import { SuggestedResponses } from "./SuggestedResponses";
import { toast } from "sonner";

interface TranscriptEntry {
  role: "user" | "agent";
  text: string;
}

interface VoicePracticeInterfaceProps {
  topic: Topic;
  level: Level;
  onComplete: (transcript: TranscriptEntry[]) => void;
}

interface Message {
  role: "assistant" | "user";
  content: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const AI_PRACTICE_URL = `${API_BASE_URL}/ai-practice`;

export const VoicePracticeInterface = ({ topic, level, onComplete }: VoicePracticeInterfaceProps) => {
  const { t, language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [currentCaption, setCurrentCaption] = useState("");
  const [captionSpeaker, setCaptionSpeaker] = useState<"ai" | "user">("ai");
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // AI speaks first when component mounts
  useEffect(() => {
    const initializeConversation = async () => {
      const topicName = language === "vi" ? topic.titleVi : topic.titleEn;
      const topicDesc = language === "vi" ? topic.description : topic.descriptionEn;

      try {
        setIsProcessing(true);

        // Call chat API with empty messages array - AI will introduce topic
        const chatResponse = await fetch(`${AI_PRACTICE_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [], // Empty array triggers AI's opening message
            level,
            topic: topicName,
            topicDescription: topicDesc,
          }),
        });

        if (!chatResponse.ok) {
          throw new Error(t("aiPractice.connectionError"));
        }

        const chatData = await chatResponse.json();
        const assistantText = (chatData?.content || "").trim();
        
        if (!assistantText) {
          throw new Error(t("aiPractice.connectionError"));
        }

        // Save AI's opening message
        const assistantMessage: Message = { role: "assistant", content: assistantText };
        setMessages([assistantMessage]);
        messagesRef.current = [assistantMessage];

        // Show caption and parse suggestions
        const cleanAssistantText = sanitizeCaptionText(assistantText);
        setTranscript([{ role: "agent", text: cleanAssistantText }]);
        setCurrentCaption(cleanAssistantText);
        setCaptionSpeaker("ai");
        parseSuggestions(assistantText);

        // Play AI's opening message
        await playTts(cleanAssistantText);
      } catch (error: any) {
        console.error("Failed to initialize conversation:", error);
        toast.error(error.message || t("aiPractice.connectionError"));
      } finally {
        setIsProcessing(false);
      }
    };

    initializeConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const sanitizeCaptionText = (text: string) => {
    return text.replace(/---SUGGESTIONS---[\s\S]*?---END---/g, "").trim();
  };

  function parseSuggestions(text: string) {
    const suggestionsMatch = text.match(/---SUGGESTIONS---\s*(\{.*\})\s*---END---/s);
    if (suggestionsMatch) {
      try {
        const parsed = JSON.parse(suggestionsMatch[1]);
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          setSuggestedResponses(parsed.suggestions);
        }
      } catch (e) {
        console.error("Failed to parse suggestions:", e);
      }
    }
  }

  const playTts = async (text: string) => {
    const response = await fetch(`${AI_PRACTICE_URL}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody?.message || t("aiPractice.connectionError");
      throw new Error(message);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.onended = () => {
      setIsSpeaking(false);
      URL.revokeObjectURL(audioUrl);
    };
    audioRef.current.onerror = () => {
      setIsSpeaking(false);
      URL.revokeObjectURL(audioUrl);
    };

    audioRef.current.src = audioUrl;
    setIsSpeaking(true);
    await audioRef.current.play();
  };

  const handleAudio = useCallback(
    async (audioBlob: Blob) => {
      setIsProcessing(true);
      const topicName = language === "vi" ? topic.titleVi : topic.titleEn;
      const topicDesc = language === "vi" ? topic.description : topic.descriptionEn;

      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "speech.webm");

        const transcribeResponse = await fetch(`${AI_PRACTICE_URL}/transcribe`, {
          method: "POST",
          body: formData,
        });

        if (!transcribeResponse.ok) {
          const errorBody = await transcribeResponse.json().catch(() => ({}));
          const message = errorBody?.message || t("aiPractice.voice.connectionFailed");
          throw new Error(message);
        }

        const transcribeData = await transcribeResponse.json();
        const userText = (transcribeData?.text || "").trim();
        if (!userText) {
          throw new Error(t("aiPractice.voice.connectionFailed"));
        }

        const userMessage: Message = { role: "user", content: userText };
        const baseMessages = messagesRef.current;
        const nextMessages = [...baseMessages, userMessage];
        setMessages(nextMessages);
        messagesRef.current = nextMessages;

        setTranscript((prev) => [...prev, { role: "user", text: userText }]);
        setCurrentCaption(userText);
        setCaptionSpeaker("user");

        const chatResponse = await fetch(`${AI_PRACTICE_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages,
            level,
            topic: topicName,
            topicDescription: topicDesc,
          }),
        });

        if (!chatResponse.ok) {
          const errorBody = await chatResponse.json().catch(() => ({}));
          const message = errorBody?.message || t("aiPractice.connectionError");
          throw new Error(message);
        }

        const chatData = await chatResponse.json();
        const assistantText = (chatData?.content || "").trim();
        if (!assistantText) {
          throw new Error(t("aiPractice.connectionError"));
        }

        const assistantMessage: Message = { role: "assistant", content: assistantText };
        const updatedMessages = [...nextMessages, assistantMessage];
        setMessages(updatedMessages);
        messagesRef.current = updatedMessages;

        const cleanAssistantText = sanitizeCaptionText(assistantText);
        setTranscript((prev) => [...prev, { role: "agent", text: cleanAssistantText }]);
        setCurrentCaption(cleanAssistantText);
        setCaptionSpeaker("ai");
        parseSuggestions(assistantText);
        await playTts(cleanAssistantText);
      } catch (error: any) {
        console.error("Failed to process audio:", error);
        toast.error(error.message || t("aiPractice.voice.connectionFailed"));
      } finally {
        setIsProcessing(false);
      }
    },
    [language, level, topic, t],
  );

  const startRecording = useCallback(async () => {
    if (isRecording || isProcessing) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(t("aiPractice.voice.connectionFailed"));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        handleAudio(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (error: any) {
      console.error("Failed to start recording:", error);
      toast.error(error.message || t("aiPractice.voice.connectionFailed"));
      setIsRecording(false);
    }
  }, [handleAudio, isProcessing, isRecording, t]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentCaption(`💡 Try saying: "${suggestion}"`);
    setCaptionSpeaker("user");
    setTimeout(() => {
      setCurrentCaption("");
    }, 5000);
  };

  const isActive = isRecording || isProcessing || isSpeaking;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isActive ? "bg-green-500/10" : "bg-primary/10"
            }`}>
              <Bot className={`w-5 h-5 ${isActive ? "text-green-500" : "text-primary"}`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("aiPractice.voice.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {language === "vi" ? topic.titleVi : topic.titleEn} • {t(`aiPractice.level.${level}`)}
              </p>
            </div>
          </div>
          
          {/* Captions Toggle */}
          <div className="flex items-center gap-2">
            <Subtitles className="w-4 h-4 text-muted-foreground" />
            <Switch
              checked={captionsEnabled}
              onCheckedChange={setCaptionsEnabled}
              id="captions-toggle"
            />
            <Label htmlFor="captions-toggle" className="text-sm text-muted-foreground">
              {t("aiPractice.voice.captions")}
            </Label>
          </div>
        </div>
      </div>

      {/* Voice Interface */}
      <div className="h-80 flex flex-col items-center justify-center p-8 relative">
        {/* Status Display */}
        <div className="text-center mb-8">
          {isActive ? (
            <>
              <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${
                isSpeaking 
                  ? "bg-primary/20 animate-pulse ring-4 ring-primary/30" 
                  : isRecording
                    ? "bg-primary/10 animate-pulse"
                    : "bg-muted"
              }`}>
                {isSpeaking ? (
                  <Volume2 className="w-10 h-10 text-primary animate-pulse" />
                ) : (
                  <Mic className={`w-10 h-10 ${isRecording ? "text-primary" : "text-muted-foreground"}`} />
                )}
              </div>
              <p className="text-lg font-medium text-foreground">
                {isSpeaking ? t("aiPractice.voice.aiSpeaking") : t("aiPractice.voice.yourTurn")}
              </p>
              <p className="text-sm text-muted-foreground">
                {isSpeaking ? t("aiPractice.voice.listenCarefully") : t("aiPractice.voice.speakNow")}
              </p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Mic className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground">
                {t("aiPractice.voice.ready")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("aiPractice.voice.clickToStart")}
              </p>
            </>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              disabled={isProcessing}
              size="lg"
              className="rounded-full px-8 py-6 text-lg gap-3"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {t("aiPractice.voice.connecting")}
                </>
              ) : (
                <>
                  <Phone className="w-6 h-6" />
                  {t("aiPractice.voice.startCall")}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="lg"
              className="rounded-full px-8 py-6 text-lg gap-3"
            >
              <PhoneOff className="w-6 h-6" />
              {t("aiPractice.voice.endCall")}
            </Button>
          )}
        </div>
      </div>

      {/* Suggested Responses */}
      {messages.length > 0 && !isSpeaking && suggestedResponses.length > 0 && (
        <div className="border-t border-border p-4">
          <SuggestedResponses
            suggestions={suggestedResponses}
            onSelect={handleSuggestionClick}
            disabled={isSpeaking}
          />
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border p-4 text-center">
        <p className="text-xs text-muted-foreground">
          {t("aiPractice.voice.hint")}
        </p>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => {
              stopRecording();
              onComplete(transcript);
            }}
            className="mt-2 text-sm"
          >
            {t("aiPractice.voice.finish")}
          </Button>
        )}
      </div>

      {/* Closed Captions */}
      <ClosedCaptions
        text={currentCaption}
        isVisible={captionsEnabled && isActive}
        speaker={captionSpeaker}
      />
    </div>
  );
};
