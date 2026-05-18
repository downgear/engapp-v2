import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  User,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  sender: { id: number; fullName: string; role: string } | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const ChatWidget = () => {
  const { user, accessToken, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const unreadPollRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      const result = await api.getUserUnreadCount(accessToken);
      setUnreadCount(result.count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, [accessToken]);

  const initConversation = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const conv = await api.getOrCreateConversation(accessToken);
      setConversationId(conv.id);
    } catch (err) {
      console.error("Failed to init conversation:", err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchMessages = useCallback(async (silent = false) => {
    if (!accessToken || !conversationId) return;
    
    try {
      if (!silent) setLoading(true);
      const msgs = await api.getConversationMessages(accessToken, conversationId);
      setMessages(msgs);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [accessToken, conversationId]);

  // Initialize conversation when opened
  useEffect(() => {
    if (isOpen && accessToken && !conversationId) {
      initConversation();
    }
  }, [isOpen, accessToken, conversationId, initConversation]);

  // Poll for unread count when chat is CLOSED
  useEffect(() => {
    if (!isAuthenticated || !accessToken || user?.role === "admin") return;

    // Initial fetch
    fetchUnreadCount();

    // Poll every 10 seconds when chat is closed
    if (!isOpen) {
      unreadPollRef.current = setInterval(() => {
        fetchUnreadCount();
      }, 10000);
    }

    return () => {
      if (unreadPollRef.current) {
        clearInterval(unreadPollRef.current);
      }
    };
  }, [isOpen, isAuthenticated, accessToken, user?.role, fetchUnreadCount]);

  // Reset unread count when opening chat (messages will be marked as read)
  useEffect(() => {
    if (isOpen) {
      // Clear unread count when chat opens (messages get marked as read on fetch)
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Poll for new messages when open
  useEffect(() => {
    if (isOpen && conversationId && accessToken) {
      // Initial fetch
      fetchMessages();
      
      // Poll every 5 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(true);
      }, 5000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [isOpen, conversationId, accessToken, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Don't show chat widget for admin users or unauthenticated users
  if (!isAuthenticated || !user || user.role === "admin") {
    return null;
  }

  const handleSend = async () => {
    if (!accessToken || !newMessage.trim()) return;
    
    try {
      setSending(true);
      
      // Create conversation if not exists
      let convId = conversationId;
      if (!convId) {
        const conv = await api.getOrCreateConversation(accessToken);
        convId = conv.id;
        setConversationId(convId);
      }
      
      const msg = await api.sendChatMessage(accessToken, convId, newMessage.trim());
      setMessages((prev) => [...prev, msg as Message]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className={cn("fixed bottom-6 right-6 z-50", isOpen && "hidden")}>
        <Button
          className="h-14 w-14 rounded-full shadow-lg relative"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-6 min-w-6 flex items-center justify-center px-1.5 bg-red-500 text-white border-2 border-background animate-pulse"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[360px] h-[500px] bg-background border rounded-lg shadow-xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">{language === "vi" ? "Hỗ trợ khách hàng" : "Customer Support"}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mb-2 opacity-50" />
                <p>{language === "vi" ? "Chào bạn! Bạn cần hỗ trợ gì?" : "Hi! How can we help you?"}</p>
                <p className="text-sm">{language === "vi" ? "Nhắn tin để bắt đầu cuộc trò chuyện." : "Send a message to start a conversation."}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.senderId === user?.legacyUserId;
                  const isAdmin = msg.sender?.role === "admin";
                  
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {isAdmin ? (
                            <Shield className="h-4 w-4 text-primary" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg px-3 py-2",
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {!isMe && (
                          <p className="text-xs font-medium mb-1 opacity-70">
                            {isAdmin ? "Admin" : msg.sender?.fullName}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p
                          className={cn(
                            "text-xs mt-1 opacity-70",
                            isMe ? "text-right" : "text-left"
                          )}
                        >
                          {format(new Date(msg.createdAt), "HH:mm", {
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder={language === "vi" ? "Nhập tin nhắn..." : "Type a message..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={sending || !newMessage.trim()}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
