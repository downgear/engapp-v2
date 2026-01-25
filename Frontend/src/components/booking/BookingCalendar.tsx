import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Mentor } from "@/data/mentors";
import { useLanguage } from "@/contexts/LanguageContext";

interface BookingCalendarProps {
  mentor: Mentor;
  onSelectTime: (date: Date, time: string) => void;
  onBack: () => void;
}

export const BookingCalendar = ({ mentor, onSelectTime, onBack }: BookingCalendarProps) => {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const DAYS = language === "vi" 
    ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const MONTHS = language === "vi"
    ? ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const isDateSelectable = (date: Date) => {
    return date >= today;
  };

  const handleDateSelect = (date: Date) => {
    if (isDateSelectable(date)) {
      setSelectedDate(date);
      setSelectedTime(null);
    }
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onSelectTime(selectedDate, selectedTime);
    }
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button & Mentor Info */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t("booking.back")}
        </Button>
        <div className="flex items-center gap-3">
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
          />
          <div>
            <p className="font-semibold text-foreground">{mentor.name}</p>
            <p className="text-sm text-muted-foreground">{mentor.country}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="font-display text-lg font-semibold">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isSelectable = isDateSelectable(date);
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isToday = date.toDateString() === today.toDateString();

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  disabled={!isSelectable}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                    ${isSelected 
                      ? "bg-primary text-primary-foreground" 
                      : isToday 
                        ? "bg-accent/20 text-accent-foreground" 
                        : isSelectable 
                          ? "hover:bg-muted text-foreground" 
                          : "text-muted-foreground/50 cursor-not-allowed"
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">
              {selectedDate 
                ? `${t("booking.timeSlots")} - ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}` 
                : t("booking.selectDate")
              }
            </h3>
          </div>

          {selectedDate ? (
            <>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {mentor.availability.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`
                      py-3 px-4 rounded-lg text-sm font-medium transition-all
                      ${selectedTime === time
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                      }
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <Button 
                onClick={handleConfirm}
                disabled={!selectedTime}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {t("booking.confirmTime")}
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              {t("booking.pleaseSelectDate")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
