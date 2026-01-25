import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroStudent from "@/assets/hero-student.png";
import student1 from "@/assets/student-1.png";
import student2 from "@/assets/student-2.png";
import student3 from "@/assets/student-3.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center pt-20 bg-background overflow-hidden">
      {/* Decorative Background Blob */}
      <div className="absolute right-0 top-20 w-[60%] h-[80%] bg-primary/10 rounded-[40%] blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-relaxed text-primary">
              {t("hero.title")} <span className="text-secondary">{t("hero.ai")}</span> {t("hero.and")}{" "}
              <span className="text-secondary">{t("hero.nativeMentor")}</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-md">
              {t("hero.subtitle")}
            </p>

            <Button
              asChild
              size="lg"
              className="rounded-full px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link to="/inaugural-program">{t("hero.cta")}</Link>
            </Button>
          </div>

          {/* Right Column - Visual with Floating Cards */}
          <div className="relative animate-fade-in animate-delay-200">
            {/* Main Image Container */}
            <div className="relative aspect-square max-w-xl mx-auto">
              {/* Primary Blob Background */}
              <div className="absolute -inset-4 -left-8 -top-8 bg-primary/25 animate-blob-morph" />
              <div className="absolute -inset-4 -right-8 -bottom-8 bg-accent/25 animate-blob-morph-alt" />

              {/* Student Image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={heroStudent}
                  alt="Student learning English with native mentor via video call"
                  className="w-full h-4/5 object-cover rounded-3xl"
                />
              </div>

              {/* Pain Point Card 1 */}
              <Card className="absolute top-8 -left-4 p-4 shadow-lg animate-float max-w-[200px]">
                <div className="flex items-center gap-3">
                  <img 
                    src={student1} 
                    alt="Student" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-secondary"
                  />
                  <p className="text-sm text-muted-foreground italic leading-tight">
                    "{t("hero.painPoint1")}"
                  </p>
                </div>
              </Card>

              {/* Pain Point Card 2 */}
              <Card className="absolute top-1/2 -right-4 p-4 shadow-lg animate-float animate-delay-100 max-w-[200px]">
                <div className="flex items-center gap-3">
                  <img 
                    src={student2} 
                    alt="Student" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-secondary"
                  />
                  <p className="text-sm text-muted-foreground italic leading-tight">
                    "{t("hero.painPoint2")}"
                  </p>
                </div>
              </Card>

              {/* Pain Point Card 3 */}
              <Card className="absolute bottom-4 left-4 p-4 shadow-lg animate-float animate-delay-200 max-w-[220px]">
                <div className="flex items-center gap-3">
                  <img 
                    src={student3} 
                    alt="Student" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-secondary"
                  />
                  <p className="text-sm text-muted-foreground italic leading-tight">
                    "{t("hero.painPoint3")}"
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
