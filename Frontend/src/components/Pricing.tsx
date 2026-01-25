import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

export const Pricing = () => {
  const { t } = useLanguage();

  const cohortPlans = [
    {
      duration: t("pricing.6weeks"),
      price: "1,800,000 VND",
      badge: t("pricing.mostSavings"),
      features: [
        t("pricing.weeklyClass"),
        t("pricing.limitedAI"),
        t("pricing.riseMeterTracking"),
        t("pricing.cefrCurriculum"),
      ],
    },
    {
      duration: t("pricing.8weeks"),
      price: "2,300,000 VND",
      badge: t("pricing.bestValue"),
      popular: true,
      features: [
        t("pricing.weeklyClass"),
        t("pricing.unlimitedAI"),
        t("pricing.weeklyMentor45"),
        t("pricing.riseMeterTracking"),
        t("pricing.cefrCurriculum"),
      ],
    },
    {
      duration: t("pricing.12weeks"),
      price: "3,200,000 VND",
      badge: t("pricing.maxResults"),
      features: [
        t("pricing.weeklyClass"),
        t("pricing.unlimitedAI"),
        t("pricing.weeklyMentor45x2"),
        t("pricing.riseMeterTracking"),
        t("pricing.cefrCurriculum"),
      ],
    },
  ];

  const flexiblePlans = [
    {
      title: t("pricing.aiOnly"),
      price: "120,000 VND/month",
      description: t("pricing.aiOnlyDesc"),
      features: [t("pricing.unlimitedAIPractice"), t("pricing.realTimeFeedback"), t("pricing.progressTracking")],
    },
    {
      title: t("pricing.mentorOnly"),
      price: "150,000 VND/session",
      description: t("pricing.mentorOnlyDesc"),
      features: [t("pricing.30minSession"), t("pricing.nativeMentor"), t("pricing.personalizedFeedback")],
    },
    {
      title: t("pricing.combo"),
      price: "350,000 VND/month",
      popular: true,
      description: t("pricing.comboDesc"),
      features: [t("pricing.unlimitedAIPractice"), t("pricing.4sessions"), t("pricing.fullTracking")],
    },
  ];

  return (
    <SectionWrapper id="pricing" className="bg-muted/30">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
            {t("pricing.title")}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t("pricing.subtitle")}
          </p>
        </div>

        <Tabs defaultValue="cohort" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
            <TabsTrigger value="cohort" className="text-base">{t("pricing.cohort")}</TabsTrigger>
            <TabsTrigger value="flexible" className="text-base">{t("pricing.flexible")}</TabsTrigger>
          </TabsList>

          <TabsContent value="cohort" className="mt-12">
            <div className="grid md:grid-cols-3 gap-6">
              {cohortPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-card p-8 rounded-2xl shadow-md border-2 ${
                    plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'
                  } relative`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                      {plan.badge}
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{plan.duration}</h3>
                      <div className="text-3xl font-bold text-primary">{plan.price}</div>
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                      <Link to="/inaugural-program">{t("pricing.signUp")}</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flexible" className="mt-12">
            <div className="grid md:grid-cols-3 gap-6">
              {flexiblePlans.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-card p-8 rounded-2xl shadow-md border-2 ${
                    plan.popular ? 'border-secondary shadow-lg' : 'border-border'
                  }`}
                >
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
                      <div className="text-2xl font-bold text-secondary mb-2">{plan.price}</div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                      <Link to="/inaugural-program">{t("pricing.start")}</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SectionWrapper>
  );
};
