import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { MentorCard } from "@/components/booking/MentorCard";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { BookingConfirmation } from "@/components/booking/BookingConfirmation";
import { type Mentor } from "@/data/mentors";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

export type BookingStep = "select-mentor" | "select-time" | "confirmation";

// Default avatar for teachers without one
const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
];

const BookingDemo = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState<BookingStep>("select-mentor");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch video call teachers from API
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoading(true);
        const teachers = await api.getVideoCallTeachers();

        // Convert Teacher[] to Mentor[] format
        const mentorsList: Mentor[] = teachers.map((teacher, index) => ({
          id: teacher.id.toString(),
          name: teacher.name,
          avatar: teacher.avatarUrl || DEFAULT_AVATARS[index % DEFAULT_AVATARS.length],
          country: "Việt Nam", // Default country
          languages: ["Tiếng Anh", "Tiếng Việt"],
          specialty: teacher.specialties || [],
          rating: teacher.rating ?? 0,
          reviewCount: teacher.reviewCount ?? 0,
          bio: teacher.bio || "Giáo viên tiếng Anh chuyên nghiệp.",
          experience: "Giảng viên tại Lingriser",
          availability: ["09:00", "10:00", "14:00", "15:00", "16:00", "20:00", "21:00"],
        }));

        setMentors(mentorsList);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

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
              {isLoading ? (
                // Loading skeletons
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </>
              ) : mentors.length === 0 ? (
                // No teachers available
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    Hiện chưa có giáo viên nào khả dụng.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vui lòng quay lại sau.
                  </p>
                </div>
              ) : (
                // Teacher cards
                mentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    onSelect={handleSelectMentor}
                  />
                ))
              )}
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
      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${active
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
