import { SectionWrapper } from "@/components/ui/section-wrapper";
import { GraduationCap, Bot, Users, ArrowRight, ArrowDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Solution = () => {
  const { t, language } = useLanguage();

  const steps = [
    {
      number: "1",
      title: "Learn",
      subtitle: language === 'vi' ? "Khơi nguồn" : "Spark",
      titleKey: "solution.learnTitle",
      descKey: "solution.learnDesc",
      icon: GraduationCap,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      number: "2",
      title: "Loop",
      subtitle: language === 'vi' ? "Luyện tập" : "Practice",
      titleKey: "solution.loopTitle",
      descKey: "solution.loopDesc",
      icon: Bot,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    {
      number: "3",
      title: "Level Up",
      subtitle: language === 'vi' ? "Thực chiến" : "Real Match",
      titleKey: "solution.levelUpTitle",
      descKey: "solution.levelUpDesc",
      icon: Users,
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
    },
  ];

  return (
    <SectionWrapper id="solution" className="relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/solution-bg.mp4" type="video/mp4" />
      </video>
      
      {/* Green Overlay */}
      <div className="absolute inset-0 bg-primary/95 z-10" />
      
      <div className="max-w-6xl mx-auto space-y-12 relative z-20">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            <span className="text-accent">3L Model™</span>: {t("solution.title")}
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {t("solution.subtitle")}
          </p>
        </div>

        {/* Sequential Flow Layout */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col lg:flex-row items-center">
              {/* Step Card */}
              <div className="relative bg-card p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all hover:-translate-y-1 w-72 md:w-80 h-64 overflow-hidden">
                {/* Large Background Number */}
                <span className="absolute left-2 top-1 text-[120px] font-bold text-accent/20 leading-none select-none pointer-events-none">
                  {step.number}
                </span>
                
                <div className="space-y-3 text-center relative z-10">
                  {/* Icon */}
                  <div className="flex items-center justify-center">
                    <div className={`w-12 h-12 rounded-xl ${step.iconBg} flex items-center justify-center`}>
                      <step.icon className={`h-6 w-6 ${step.iconColor}`} />
                    </div>
                  </div>
                  
                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm font-semibold text-foreground">{t(step.titleKey)}</p>
                  <p className="text-sm text-muted-foreground">
                    {t(step.descKey)}
                  </p>
                </div>
              </div>

              {/* Arrow Connector */}
              {index < steps.length - 1 && (
                <>
                  {/* Desktop Arrow */}
                  <div className="hidden lg:flex items-center justify-center px-4">
                    <div className="relative">
                      <ArrowRight className="h-12 w-12 text-accent animate-pulse" strokeWidth={3} />
                    </div>
                  </div>
                  {/* Mobile Arrow */}
                  <div className="flex lg:hidden items-center justify-center py-3">
                    <ArrowDown className="h-12 w-12 text-accent animate-pulse" strokeWidth={3} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};
