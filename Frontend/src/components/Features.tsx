import { SectionWrapper } from "@/components/ui/section-wrapper";
import { GraduationCap, Sparkles, Users, LineChart, Route } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

export const Features = () => {
  const { t, language } = useLanguage();

  const features = [
    {
      icon: GraduationCap,
      title: t("features.curriculum"),
      description: t("features.curriculumDesc"),
      link: null,
    },
    {
      icon: Sparkles,
      title: t("features.aiPractice"),
      description: t("features.aiPracticeDesc"),
      link: null,
    },
    {
      icon: Users,
      title: t("features.mentor"),
      description: t("features.mentorDesc"),
      link: null,
    },
    {
      icon: LineChart,
      title: t("features.riseMeter"),
      description: t("features.riseMeterDesc"),
      link: "/rise-meter",
    },
    {
      icon: Route,
      title: t("features.personalized"),
      description: t("features.personalizedDesc"),
      link: null,
    },
  ];

  return (
    <SectionWrapper id="features" className="bg-[#fff6dc] relative overflow-hidden">
      {/* Animated Wave at Bottom */}
      <div className="absolute -bottom-4 left-0 w-full flex items-end justify-between h-48 px-0">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="flex-1 mx-px bg-secondary/30 rounded-t-full"
            style={{
              animation: `soundWave 2.5s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
              height: `${40 + Math.random() * 80}px`,
              transformOrigin: 'bottom',
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">{t("features.title")}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-primary p-8 rounded-2xl shadow-sm border border-primary hover:shadow-md transition-all hover:-translate-y-1 group"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    {feature.link ? (
                      <Link to={feature.link} className="hover:opacity-80 transition-opacity">
                        <span className="text-white">{language === 'vi' ? 'Tiến bộ với ' : 'Progress with '}</span>
                        <span className="text-accent">Rise Meter™</span>
                      </Link>
                    ) : (
                      feature.title
                    )}
                  </h3>
                  <p className="text-white/80 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
};
