import { useState } from "react";
import { ArrowLeft, Calendar, Clock, User, CheckCircle2, Video, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Mentor } from "@/data/mentors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface BookingConfirmationProps {
  mentor: Mentor;
  date: Date;
  time: string;
  moduleId?: number;
  onBack: () => void;
  onReset: () => void;
}

export const BookingConfirmation = ({ mentor, date, time, moduleId, onBack, onReset }: BookingConfirmationProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionType, setSessionType] = useState<"video" | "voice">("video");

  const MONTHS = language === "vi"
    ? ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const DAYS = language === "vi"
    ? ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]
    : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const handleConfirm = async () => {
    if (!user || !user.profileId) {
      toast.error(language === "vi" ? "Vui lòng đăng nhập để đặt lịch" : "Please login to book");
      return;
    }

    setIsLoading(true);
    try {
      // Calculate end time (1 hour after start)
      const [hours, minutes] = time.split(":").map(Number);
      const endHours = (hours + 1).toString().padStart(2, "0");
      const slotEndTime = `${endHours}:${minutes.toString().padStart(2, "0")}`;

      await api.createBooking({
        studentId: user.profileId,
        teacherId: parseInt(mentor.id),
        moduleId: moduleId ?? 1,
        bookingDate: format(date, "yyyy-MM-dd"),
        slotStartTime: time,
      });

      setIsConfirmed(true);
      toast.success(language === "vi" ? "Đặt lịch thành công!" : "Booking confirmed!");
    } catch (error) {
      console.error("Failed to create booking:", error);
      toast.error(language === "vi" ? "Đặt lịch thất bại. Vui lòng thử lại." : "Failed to book. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (isConfirmed) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-card rounded-2xl border border-border/50 p-8 md:p-12">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            {t("booking.success")}
          </h2>
          
          <p className="text-muted-foreground mb-8">
            {t("booking.successMsg")} <span className="font-semibold text-foreground">{mentor.name}</span> {t("booking.at")}{" "}
            <span className="font-semibold text-foreground">{formatDate(date)}</span> {language === "vi" ? "lúc" : "at"}{" "}
            <span className="font-semibold text-foreground">{time}</span>.
          </p>

          <div className="bg-accent/10 rounded-xl p-6 mb-8 text-left">
            <h4 className="font-semibold text-foreground mb-3">{t("booking.nextSteps")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                <span>{t("booking.nextStep1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                <span>{t("booking.nextStep2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                <span>{t("booking.nextStep3")}</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={onReset}
              className="gap-2"
            >
              {t("booking.bookAnother")}
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => window.location.href = "/"}
            >
              {t("booking.goHome")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2 mb-6">
        <ArrowLeft className="w-4 h-4" />
        {t("booking.backToTime")}
      </Button>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {/* Header */}
        <div className="bg-primary/5 p-6 border-b border-border/50">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            {t("booking.confirmBooking")}
          </h2>
          <p className="text-muted-foreground">
            {t("booking.reviewInfo")}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mentor Info */}
          <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{t("booking.mentor")}</span>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                {mentor.name}
              </h3>
              <p className="text-sm text-muted-foreground">{mentor.country}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{t("booking.date")}</span>
              </div>
              <p className="font-semibold text-foreground">{formatDate(date)}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{t("booking.time")}</span>
              </div>
              <p className="font-semibold text-foreground">{time} (GMT+7)</p>
            </div>
          </div>

          {/* Session Type */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">{t("booking.sessionType")}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setSessionType("video")}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  sessionType === "video"
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border"
                }`}
              >
                <Video className={`w-6 h-6 mx-auto mb-2 ${sessionType === "video" ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`font-medium ${sessionType === "video" ? "text-foreground" : "text-muted-foreground"}`}>
                  {t("booking.videoCall")}
                </p>
              </button>
              <button
                onClick={() => setSessionType("voice")}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  sessionType === "voice"
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border"
                }`}
              >
                <MessageSquare className={`w-6 h-6 mx-auto mb-2 ${sessionType === "voice" ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`font-medium ${sessionType === "voice" ? "text-foreground" : "text-muted-foreground"}`}>
                  {t("booking.voiceCall")}
                </p>
              </button>
            </div>
          </div>

          {/* Specialties reminder */}
          <div className="p-4 bg-accent/10 rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">{t("booking.mentorSpecialties")}</p>
            <div className="flex flex-wrap gap-2">
              {mentor.specialty.map((spec) => (
                <Badge 
                  key={spec} 
                  variant="secondary" 
                  className="bg-primary/10 text-primary"
                >
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/50 bg-muted/20">
          <Button 
            onClick={handleConfirm}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === "vi" ? "Đang xử lý..." : "Processing..."}
              </>
            ) : (
              t("booking.confirmBtn")
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            {t("booking.demoNote")}
          </p>
        </div>
      </div>
    </div>
  );
};
