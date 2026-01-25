import { SectionWrapper } from "@/components/ui/section-wrapper";
import universityLogos from "@/assets/university-logos.png";
import cefrLogo from "@/assets/cefr-logo.webp";
import utAustinLogo from "@/assets/ut-austin-logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

export const Evidence = () => {
  const { t } = useLanguage();

  return (
    <SectionWrapper id="evidence" className="bg-[#fff6dc]">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
            {t("evidence.title")}
          </h2>
        </div>

        {/* 3 Column Layout */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Column 1: Ivy League */}
          <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-lg shadow-primary/10 space-y-4">
            <div className="flex items-center justify-center">
              <img 
                src={universityLogos} 
                alt="Teachers College, Columbia University & University of Pennsylvania" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-center font-semibold text-foreground">
              {t("evidence.ivyLeague")}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Teachers College, Columbia University & University of Pennsylvania
            </p>
          </div>

          {/* Column 2: CEFR */}
          <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-lg shadow-primary/10 space-y-4">
            <div className="flex items-center justify-center">
              <img 
                src={cefrLogo} 
                alt="CEFR - Common European Framework" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-center font-semibold text-foreground">
              {t("evidence.cefr")}
            </p>
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>{t("evidence.cefrNote1")}</p>
              <p>{t("evidence.cefrNote2")}</p>
            </div>
          </div>

          {/* Column 3: S-FLCAS */}
          <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-lg shadow-primary/10 space-y-4">
            <div className="flex items-center justify-center">
              <img 
                src={utAustinLogo} 
                alt="University of Texas at Austin" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-center font-semibold text-foreground">
              {t("evidence.flcas")}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              {t("evidence.flcasNote")}
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
