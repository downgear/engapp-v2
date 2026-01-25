import { SectionWrapper } from "@/components/ui/section-wrapper";
import { UserPlus, ClipboardCheck, BookOpen, MessageSquare, Users, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

export const HowItWorks = () => {
  const { t } = useLanguage();
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const steps = [
    {
      icon: UserPlus,
      title: t("how.step1"),
      description: t("how.step1Desc"),
      link: null,
    },
    {
      icon: ClipboardCheck,
      title: t("how.step2"),
      description: t("how.step2Desc"),
      link: null,
    },
    {
      icon: BookOpen,
      title: t("how.step3"),
      description: t("how.step3Desc"),
      link: null,
    },
    {
      icon: MessageSquare,
      title: t("how.step4"),
      description: t("how.step4Desc"),
      link: null,
    },
    {
      icon: Users,
      title: t("how.step5"),
      description: t("how.step5Desc"),
      link: null,
    },
    {
      icon: TrendingUp,
      title: t("how.step6"),
      description: t("how.step6Desc"),
      link: "/rise-meter",
    },
  ];

  useEffect(() => {
    const observers = stepRefs.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSteps((prev) => 
                prev.includes(index) ? prev : [...prev, index]
              );
            } else {
              setVisibleSteps((prev) => 
                prev.filter((i) => i !== index)
              );
            }
          });
        },
        { threshold: 0.3 }
      );
      
      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <SectionWrapper id="how-it-works" className="bg-white">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
            {t("how.title")}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t("how.subtitle")}
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-0 left-1/2 w-1 h-full bg-primary -translate-x-1/2" />
          
          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              const isVisible = visibleSteps.includes(index);
              
              return (
                <div
                  key={index}
                  ref={(el) => (stepRefs.current[index] = el)}
                  className={`flex items-center gap-8 ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  <div 
                    className={`flex-1 ${isEven ? 'lg:text-right' : 'lg:text-left'} transition-all duration-700 ${
                      isVisible 
                        ? 'opacity-100 translate-x-0' 
                        : `opacity-0 ${isEven ? '-translate-x-16' : 'translate-x-16'}`
                    }`}
                  >
                    <div className="bg-[#fff6dc] p-6 rounded-2xl shadow-lg shadow-primary/10 inline-block max-w-md">
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold">
                          {step.link ? (
                            <Link to={step.link} className="hover:opacity-80 transition-opacity">
                              <span className="text-foreground">Track with </span>
                              <span className="text-primary">Rise Meter™</span>
                            </Link>
                          ) : (
                            step.title
                          )}
                        </h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`relative z-10 flex-shrink-0 transition-all duration-500 delay-200 ${
                      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 hidden lg:block" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
