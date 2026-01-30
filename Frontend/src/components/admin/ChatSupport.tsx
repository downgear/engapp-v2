import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Send,
  Loader2,
  User,
  Shield,
  X,
  ChevronLeft,
  Check,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Conversation {
  id: number;
  userId: number;
  user: { id: number; fullName: string; email: string; role: string } | null;
  status: string;
  unreadCount: number;
  lastMessage: { message: string; createdAt: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  sender: { id: number; fullName: string; role: string } | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  student: "Học sinh",
  parent: "Phụ huynh",
  teacher: "Giáo viên",
};

export const ChatSupport = () => {
  const { user, accessToken } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState("open");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch conversations
  const fetchConversations = useCallback(async (silent = false) => {
    if (!accessToken) return;

    try {
      if (!silent) setLoading(true);
      const result = await api.getAdminConversations(accessToken, {
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setConversations(result.conversations);
    } catch (err) {
      if (!silent) toast.error("Không thể tải danh sách hội thoại");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [accessToken, statusFilter]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Poll for new conversations/messages
  useEffect(() => {
    pollIntervalRef.current = setInterval(() => {
      fetchConversations(true);
      if (selectedConv) {
        fetchMessages(selectedConv.id, true);
      }
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedConv, fetchConversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (convId: number, silent = false) => {
    if (!accessToken) return;

    try {
      if (!silent) setLoadingMessages(true);
      const msgs = await api.getConversationMessages(accessToken, convId);
      setMessages(msgs);
      
      // Update unread count in conversations list
      if (!silent) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch (err) {
      if (!silent) toast.error("Không thể tải tin nhắn");
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    fetchMessages(conv.id);
  };

  const handleSend = async () => {
    if (!accessToken || !selectedConv || !newMessage.trim()) return;

    try {
      setSending(true);
      const msg = await api.sendChatMessage(
        accessToken,
        selectedConv.id,
        newMessage.trim()
      );
      setMessages((prev) => [...prev, msg as Message]);
      setNewMessage("");
    } catch (err) {
      toast.error("Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  };

  const handleCloseConversation = async () => {
    if (!accessToken || !selectedConv) return;

    try {
      await api.closeConversation(accessToken, selectedConv.id);
      toast.success("Đã đóng hội thoại");
      
      // Update local state
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id ? { ...c, status: "closed" } : c
        )
      );
      setSelectedConv((prev) =>
        prev ? { ...prev, status: "closed" } : null
      );
    } catch (err) {
      toast.error("Không thể đóng hội thoại");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              Hội thoại
              {totalUnread > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {totalUnread}
                </Badge>
              )}
            </CardTitle>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Đang mở</SelectItem>
              <SelectItem value="closed">Đã đóng</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[480px]">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Không có hội thoại nào
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    className={cn(
                      "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                      selectedConv?.id === conv.id && "bg-muted"
                    )}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {conv.user?.fullName || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ROLE_LABELS[conv.user?.role || ""] || conv.user?.role}
                          </p>
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <Badge variant="destructive" className="flex-shrink-0">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-sm text-muted-foreground mt-2 truncate">
                        {conv.lastMessage.message}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.updatedAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                      <Badge
                        variant={conv.status === "open" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {conv.status === "open" ? "Đang mở" : "Đã đóng"}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2 flex flex-col">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedConv(null)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedConv.user?.fullName || "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedConv.user?.email}
                    </p>
                  </div>
                </div>
                {selectedConv.status === "open" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCloseConversation}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Đóng hội thoại
                  </Button>
                )}
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                  <p>Chưa có tin nhắn</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isAdmin = msg.sender?.role === "admin";
                    
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2",
                          isAdmin ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isAdmin && (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg px-3 py-2",
                            isAdmin
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {!isAdmin && (
                            <p className="text-xs font-medium mb-1 opacity-70">
                              {msg.sender?.fullName}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.message}
                          </p>
                          <p
                            className={cn(
                              "text-xs mt-1 opacity-70",
                              isAdmin ? "text-right" : "text-left"
                            )}
                          >
                            {format(new Date(msg.createdAt), "HH:mm", {
                              locale: vi,
                            })}
                          </p>
                        </div>
                        {isAdmin && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Shield className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            {selectedConv.status === "open" ? (
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                  />
                  <Button
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
            ) : (
              <div className="p-4 border-t text-center text-muted-foreground">
                Hội thoại đã được đóng
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Chọn một hội thoại</p>
            <p className="text-sm">để bắt đầu hỗ trợ khách hàng</p>
          </div>
        )}
      </Card>
    </div>
  );
};
