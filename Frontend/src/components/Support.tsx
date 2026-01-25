import { SectionWrapper } from "@/components/ui/section-wrapper";
import { MessageCircle, AlertTriangle, TrendingDown, Users, Clock, FileText, ShieldAlert } from "lucide-react";
import studentStruggling from "@/assets/student-struggling.png";
import classroomCrowded from "@/assets/classroom-crowded.png";
import { useLanguage } from "@/contexts/LanguageContext";

export const Support = () => {
  const { t } = useLanguage();

  return (
    <SectionWrapper className="bg-card py-16">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Main Heading */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary text-center">
          {t("support.title")}
        </h2>

        {/* Section 1: Student Struggles - Image Left, Text Right */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Image */}
          <div className="aspect-[4/3] rounded-2xl overflow-hidden order-2 lg:order-1">
            <img 
              src={studentStruggling} 
              alt="Student struggling with English speaking" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text Content */}
          <div className="space-y-6 order-1 lg:order-2">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              {t("support.notAlone")}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-secondary">{t("support.stat1Value")}</p>
                  <p className="text-muted-foreground">{t("support.stat1Label")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-secondary">{t("support.stat2Value")}</p>
                  <p className="text-muted-foreground">{t("support.stat2Label")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-secondary">{t("support.stat3Value")}</p>
                  <p className="text-muted-foreground">{t("support.stat3Label")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: System Problem - Text Left, Image Right */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              {t("support.systemProblem")}
            </h3>
            
            <p className="text-muted-foreground">
              {t("support.systemIntro")} <span className="font-semibold text-secondary">{t("support.systemPercent")}</span> {t("support.systemTeachers")}
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <p className="font-medium text-foreground">{t("support.issue1")}</p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-secondary" />
                </div>
                <p className="font-medium text-foreground">{t("support.issue2")}</p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-secondary" />
                </div>
                <p className="font-medium text-foreground">{t("support.issue3")}</p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-secondary" />
                </div>
                <p className="font-medium text-foreground">{t("support.issue4")}</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="aspect-[4/3] rounded-2xl overflow-hidden">
            <img 
              src={classroomCrowded} 
              alt="Crowded English classroom" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
