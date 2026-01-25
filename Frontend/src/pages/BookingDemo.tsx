import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { MentorCard } from "@/components/booking/MentorCard";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { BookingConfirmation } from "@/components/booking/BookingConfirmation";
import { mentors, type Mentor } from "@/data/mentors";
import { useLanguage } from "@/contexts/LanguageContext";

export type BookingStep = "select-mentor" | "select-time" | "confirmation";

const BookingDemo = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState<BookingStep>("select-mentor");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleSelectMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setStep("select-time");
  };

  const handleSelectTime = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep("confirmation");
  };

  const handleBack = () => {
    if (step === "select-time") {
      setStep("select-mentor");
      setSelectedMentor(null);
    } else if (step === "confirmation") {
      setStep("select-time");
      setSelectedDate(null);
      setSelectedTime(null);
    }
  };

  const handleReset = () => {
    setStep("select-mentor");
    setSelectedMentor(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("booking.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("booking.subtitle")}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <StepIndicator 
              number={1} 
              label={t("booking.step1")} 
              active={step === "select-mentor"} 
              completed={step !== "select-mentor"} 
            />
            <div className="w-12 h-0.5 bg-border" />
            <StepIndicator 
              number={2} 
              label={t("booking.step2")} 
              active={step === "select-time"} 
              completed={step === "confirmation"} 
            />
            <div className="w-12 h-0.5 bg-border" />
            <StepIndicator 
              number={3} 
              label={t("booking.step3")} 
              active={step === "confirmation"} 
              completed={false} 
            />
          </div>

          {/* Content */}
          {step === "select-mentor" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  onSelect={handleSelectMentor}
                />
              ))}
            </div>
          )}

          {step === "select-time" && selectedMentor && (
            <BookingCalendar
              mentor={selectedMentor}
              onSelectTime={handleSelectTime}
              onBack={handleBack}
            />
          )}

          {step === "confirmation" && selectedMentor && selectedDate && selectedTime && (
            <BookingConfirmation
              mentor={selectedMentor}
              date={selectedDate}
              time={selectedTime}
              onBack={handleBack}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </main>
  );
};

const StepIndicator = ({ 
  number, 
  label, 
  active, 
  completed 
}: { 
  number: number; 
  label: string; 
  active: boolean; 
  completed: boolean;
}) => (
  <div className="flex flex-col items-center gap-2">
    <div 
      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
        active 
          ? "bg-primary text-primary-foreground" 
          : completed 
            ? "bg-primary/20 text-primary" 
            : "bg-muted text-muted-foreground"
      }`}
    >
      {completed ? "✓" : number}
    </div>
    <span className={`text-sm font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>
      {label}
    </span>
  </div>
);

export default BookingDemo;
