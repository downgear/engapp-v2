import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Bot, Users, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const WhyItWorks = () => {
  const { t } = useLanguage();

  const drivers = [
    {
      icon: Bot,
      title: t("why.aiTitle"),
      description: t("why.aiDesc"),
    },
    {
      icon: Users,
      title: t("why.mentorTitle"),
      description: t("why.mentorDesc"),
    },
    {
      icon: RefreshCw,
      title: t("why.loopTitle"),
      description: t("why.loopDesc"),
    },
  ];

  return (
    <SectionWrapper id="why-it-works" className="bg-white">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
            {t("why.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            {t("why.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {drivers.map((driver, index) => {
            const Icon = driver.icon;
            return (
              <div
                key={index}
                className="bg-[#fff6dc] p-8 rounded-2xl shadow-sm border border-accent/20 hover:shadow-md transition-all hover:-translate-y-1 group text-center"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>

                  <h3 className="text-xl font-bold text-primary">{driver.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{driver.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
};
