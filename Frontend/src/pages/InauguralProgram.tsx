import { useState } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/services/api";
import { Users, Clock, Target, BookOpen, MessageSquare, Bot, UserCheck, CheckCircle2, Gift, Sparkles, GraduationCap, Home, Video } from "lucide-react";
import scheduleClassroom from "@/assets/schedule-classroom.png";
import scheduleAiPractice from "@/assets/schedule-ai-practice.png";
import scheduleMentor from "@/assets/schedule-mentor.png";
import instructorKhai from "@/assets/instructor-khai-sf.jpg";
import { toast } from "sonner";
import { z } from "zod";
const registrationSchema = z.object({
  parentName: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(1, "Phone is required").max(20),
  email: z.string().trim().email("Invalid email").max(255),
  primaryGoal: z.string().max(100).optional(),
  wantsToSignup: z.boolean(),
  interestReason: z.string().max(1000).optional(),
  rejectionReason: z.string().max(1000).optional()
});
const InauguralProgram = () => {
  const {
    t
  } = useLanguage();
  const [formData, setFormData] = useState({
    parentName: "",
    phone: "",
    email: "",
    primaryGoal: "",
    wantsToSignup: null as boolean | null,
    interestReason: "",
    rejectionReason: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.wantsToSignup === null) {
      toast.error(t("inaugural.pleaseSelectIntent"));
      return;
    }
    setIsSubmitting(true);
    try {
      const validated = registrationSchema.parse({
        parentName: formData.parentName,
        phone: formData.phone,
        email: formData.email,
        primaryGoal: formData.primaryGoal || undefined,
        wantsToSignup: formData.wantsToSignup,
        interestReason: formData.wantsToSignup ? formData.interestReason : undefined,
        rejectionReason: !formData.wantsToSignup ? formData.rejectionReason : undefined
      });
      
      await api.submitInauguralRegistration({
        parentName: validated.parentName,
        phone: validated.phone,
        email: validated.email,
        primaryGoal: validated.primaryGoal,
        wantsToSignup: validated.wantsToSignup,
        interestReason: validated.interestReason,
        rejectionReason: validated.rejectionReason
      });
      toast.success(t("inaugural.formSuccess"));
      setFormData({
        parentName: "",
        phone: "",
        email: "",
        primaryGoal: "",
        wantsToSignup: null,
        interestReason: "",
        rejectionReason: ""
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(t("inaugural.formError"));
    } finally {
      setIsSubmitting(false);
    }
  };
  return <main className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">{t("inaugural.badge")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            {t("inaugural.title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("inaugural.subtitle")}
          </p>
        </div>
      </section>

      {/* Program Overview - Yellow */}
      <SectionWrapper id="overview" className="bg-[#fff6dc]">
        <div className="text-center mb-12">
          <Link to="/curriculum" className="inline-block hover:opacity-80 transition-opacity">
            <h2 className="text-3xl font-bold mb-4 text-primary md:text-5xl hover:underline decoration-2 underline-offset-4 cursor-pointer">
              {t("inaugural.overviewTitle")}
            </h2>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-border/50 backdrop-blur opacity-100 bg-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t("inaugural.programLength")}</h3>
                  <p className="text-muted-foreground">{t("inaugural.programLengthValue")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="pt-6 bg-primary-foreground">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t("inaugural.programFormat")}</h3>
                  <p className="text-muted-foreground text-sm">{t("inaugural.programFormatValue")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="pt-6 bg-primary-foreground">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t("inaugural.targetLevel")}</h3>
                  <p className="text-muted-foreground text-sm">{t("inaugural.targetLevelValue")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 backdrop-blur bg-primary-foreground">
            <CardContent className="pt-6 bg-primary-foreground">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t("inaugural.classSize")}</h3>
                  <p className="text-muted-foreground text-sm">{t("inaugural.classSizeValue")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 backdrop-blur bg-primary-foreground">
            <CardContent className="pt-6 bg-primary-foreground">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <UserCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t("inaugural.mentorPractice")}</h3>
                  <p className="text-muted-foreground text-sm">{t("inaugural.mentorPracticeValue")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="pt-6 bg-primary-foreground">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{t("inaugural.aiPractice")}</h3>
                  <p className="text-muted-foreground text-sm">{t("inaugural.aiPracticeValue")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>

      {/* Weekly Schedule - White */}
      <SectionWrapper className="bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-primary md:text-5xl">
            {t("inaugural.weeklyScheduleTitle")}
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {t("inaugural.weeklyScheduleDesc")}
          </p>
        </div>

        <div className="space-y-8">
          {/* Step 1: In-Person Classroom */}
          <Card className="border-border/50 overflow-hidden bg-primary/10">
            <div className="flex flex-col lg:flex-row">
              <div 
                className="lg:w-1/3 min-h-[250px] p-6 flex items-center justify-center relative"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${scheduleClassroom})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="text-center relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">1</div>
                  <h3 className="text-lg font-semibold text-white">{t("inaugural.step1Title")}</h3>
                  <p className="text-sm text-white/80">{t("inaugural.step1Timing")}</p>
                </div>
              </div>
              <CardContent className="lg:w-2/3 p-6">
                <p className="text-muted-foreground mb-4">{t("inaugural.step1Intro")}</p>
                <h4 className="font-semibold text-foreground mb-3">{t("inaugural.studentsWill")}</h4>
                <ul className="space-y-2">
                  {["step1Point1", "step1Point2", "step1Point3", "step1Point4"].map(key => <li key={key} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{t(`inaugural.${key}`)}</span>
                    </li>)}
                </ul>
                <p className="text-sm text-muted-foreground mt-4 italic">{t("inaugural.step1Footer")}</p>
              </CardContent>
            </div>
          </Card>

          {/* Step 2: Daily AI Practice */}
          <Card className="border-border/50 overflow-hidden bg-primary/10">
            <div className="flex flex-col lg:flex-row">
              <div 
                className="lg:w-1/3 min-h-[250px] p-6 flex items-center justify-center relative"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${scheduleAiPractice})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="text-center relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">2</div>
                  <h3 className="text-lg font-semibold text-white">{t("inaugural.step2Title")}</h3>
                  <p className="text-sm text-white/80">{t("inaugural.step2Timing")}</p>
                </div>
              </div>
              <CardContent className="lg:w-2/3 p-6">
                <p className="text-muted-foreground mb-4">{t("inaugural.step2Intro")}</p>
                <h4 className="font-semibold text-foreground mb-3">{t("inaugural.aiAllows")}</h4>
                <ul className="space-y-2">
                  {["step2Point1", "step2Point2", "step2Point3", "step2Point4"].map(key => <li key={key} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{t(`inaugural.${key}`)}</span>
                    </li>)}
                </ul>
                <p className="text-sm text-muted-foreground mt-4 italic">{t("inaugural.step2Footer")}</p>
              </CardContent>
            </div>
          </Card>

          {/* Step 3: Mentor Session */}
          <Card className="border-border/50 overflow-hidden bg-primary/10">
            <div className="flex flex-col lg:flex-row">
              <div 
                className="lg:w-1/3 min-h-[250px] p-6 flex items-center justify-center relative"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${scheduleMentor})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="text-center relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">3</div>
                  <h3 className="text-lg font-semibold text-white">{t("inaugural.step3Title")}</h3>
                  <p className="text-sm text-white/80">{t("inaugural.step3Timing")}</p>
                </div>
              </div>
              <CardContent className="lg:w-2/3 p-6">
                <p className="text-muted-foreground mb-4">{t("inaugural.step3Intro")}</p>
                <h4 className="font-semibold text-foreground mb-3">{t("inaugural.studentsWill")}</h4>
                <ul className="space-y-2">
                  {["step3Point1", "step3Point2", "step3Point3", "step3Point4"].map(key => <li key={key} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{t(`inaugural.${key}`)}</span>
                    </li>)}
                </ul>
                <p className="text-sm text-muted-foreground mt-4 italic">{t("inaugural.step3Footer")}</p>
              </CardContent>
            </div>
          </Card>
        </div>
      </SectionWrapper>

      {/* Sample Week 1 Schedule - Green */}
      <SectionWrapper className="bg-primary/10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 text-primary md:text-5xl">
            {t("inaugural.sampleWeekTitle")}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-primary/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-primary mb-2">{t("inaugural.week1Focus")}</h3>
            <p className="text-muted-foreground">{t("inaugural.week1Theme")}</p>
            <p className="text-sm text-muted-foreground mt-2">{t("inaugural.week1Goal")}</p>
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("inaugural.week1Evidence")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">{t("inaugural.byEndOfWeek1")}</p>
              <ul className="space-y-1.5">
                {["evidence1", "evidence2", "evidence3"].map(key => <li key={key} className="flex items-start gap-2 text-muted-foreground text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{t(`inaugural.${key}`)}</span>
                  </li>)}
              </ul>
              <p className="text-xs text-muted-foreground mt-3 italic">{t("inaugural.evidenceNote")}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="monday" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="monday" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">{t("inaugural.mondayTitle")}</span>
              <span className="sm:hidden">Mon</span>
            </TabsTrigger>
            <TabsTrigger value="tuethu" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">{t("inaugural.tueThuTitle")}</span>
              <span className="sm:hidden">Tue-Thu</span>
            </TabsTrigger>
            <TabsTrigger value="friday" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">{t("inaugural.fridayTitle")}</span>
              <span className="sm:hidden">Fri</span>
            </TabsTrigger>
          </TabsList>

          {/* Monday */}
          <TabsContent value="monday">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t("inaugural.mondayTitle")}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t("inaugural.mondaySubtitle")}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">{t("inaugural.mondayFormat")}</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">{t("inaugural.learnPractice")}</h4>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {["mondayPoint1", "mondayPoint2", "mondayPoint3", "mondayPoint4"].map(key => <li key={key} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{t(`inaugural.${key}`)}</span>
                        </li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">{t("inaugural.competencyFocus")}</h4>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {["competency1", "competency2", "competency3", "competency4", "competency5"].map(key => <li key={key} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{t(`inaugural.${key}`)}</span>
                        </li>)}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tuesday-Thursday */}
          <TabsContent value="tuethu">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t("inaugural.tueThuTitle")}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t("inaugural.tueThuSubtitle")}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">{t("inaugural.tueThuFormat")}</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">{t("inaugural.studentsDo")}</h4>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {["tueThuPoint1", "tueThuPoint2", "tueThuPoint3", "tueThuPoint4"].map(key => <li key={key} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{t(`inaugural.${key}`)}</span>
                        </li>)}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">{t("inaugural.aiProvides")}</h4>
                      <p className="text-sm text-muted-foreground">{t("inaugural.aiFeedbackDesc")}</p>
                    </div>
                    <p className="text-sm text-muted-foreground italic">{t("inaugural.aiPurpose")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friday/Weekend */}
          <TabsContent value="friday">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t("inaugural.fridayTitle")}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t("inaugural.fridaySubtitle")}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">{t("inaugural.fridayFormat")}</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">{t("inaugural.inSession")}</h4>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {["fridayPoint1", "fridayPoint2", "fridayPoint3", "fridayPoint4"].map(key => <li key={key} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{t(`inaugural.${key}`)}</span>
                        </li>)}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">{t("inaugural.mentorsDoNot")}</h4>
                      <p className="text-sm text-muted-foreground">{t("inaugural.mentorNoDoDesc")}</p>
                    </div>
                    <p className="text-sm text-muted-foreground italic">{t("inaugural.mentorPurpose")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </SectionWrapper>

      {/* Inaugural Cohort Benefits - Yellow */}
      <SectionWrapper className="bg-[#fff6dc]">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium">{t("inaugural.exclusiveBenefits")}</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-primary md:text-5xl">
            {t("inaugural.benefitsTitle")}
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {t("inaugural.benefitsDesc")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">50%</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t("inaugural.benefit1Title")}</h3>
                <p className="text-muted-foreground text-sm">{t("inaugural.benefit1Desc")}</p>
                <div className="mt-4 pt-4 border-t border-primary/20">
                  <p className="text-sm text-muted-foreground line-through">2,300,000 VND</p>
                  <p className="text-2xl font-bold text-primary">1,150,000 VND</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("inaugural.8weekProgram")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">10%</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t("inaugural.benefit2Title")}</h3>
                <p className="text-muted-foreground text-sm">{t("inaugural.benefit2Desc")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-muted-foreground mt-8 max-w-2xl mx-auto">
          {t("inaugural.benefitsFooter")}
        </p>
      </SectionWrapper>

      {/* Instructor Section - White */}
      <SectionWrapper className="bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-primary md:text-5xl">
            {t("inaugural.instructorTitle")}
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {t("inaugural.instructorSubtitle")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-border/50 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div 
                className="md:w-1/3 relative min-h-[300px] md:min-h-full flex flex-col items-center justify-end p-8"
                style={{
                  backgroundImage: `url(${instructorKhai})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center top'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="relative z-10 text-center">
                  <h3 className="text-xl font-bold text-white text-center">{t("inaugural.instructorName")}</h3>
                  <p className="text-sm text-white/80 text-center">{t("inaugural.instructorRole")}</p>
                </div>
              </div>
              <CardContent className="md:w-2/3 p-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      {t("inaugural.qualifications")}
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{t("inaugural.qual1")}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {t("inaugural.experience")}
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{t("inaugural.exp1")}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <p className="text-muted-foreground italic">
                      "{t("inaugural.instructorQuote")}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </SectionWrapper>

      {/* Register Interest Form - Yellow */}
      <SectionWrapper id="register" className="bg-[#fff6dc]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("inaugural.registerTitle")}
            </h2>
            <p className="text-muted-foreground">{t("inaugural.registerSubtitle")}</p>
          </div>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-foreground mb-2">{t("inaugural.registerNote")}</h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {["registerBenefit1", "registerBenefit2", "registerBenefit3"].map(key => <li key={key} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{t(`inaugural.${key}`)}</span>
                    </li>)}
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="parentName">{t("inaugural.parentName")}</Label>
                  <Input id="parentName" type="text" required value={formData.parentName} onChange={e => setFormData({
                  ...formData,
                  parentName: e.target.value
                })} placeholder={t("inaugural.parentNamePlaceholder")} className="mt-1.5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">{t("inaugural.phone")}</Label>
                    <Input id="phone" type="tel" required value={formData.phone} onChange={e => setFormData({
                    ...formData,
                    phone: e.target.value
                  })} placeholder={t("inaugural.phonePlaceholder")} className="mt-1.5" />
                  </div>

                  <div>
                    <Label htmlFor="email">{t("inaugural.email")}</Label>
                    <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({
                    ...formData,
                    email: e.target.value
                  })} placeholder={t("inaugural.emailPlaceholder")} className="mt-1.5" />
                  </div>
                </div>

                {/* Primary Goal Question */}
                <div className="border-t pt-6">
                  <Label className="text-base font-medium">{t("inaugural.primaryGoalQuestion")}</Label>
                  <RadioGroup className="mt-3 space-y-3" value={formData.primaryGoal} onValueChange={value => setFormData({
                  ...formData,
                  primaryGoal: value
                })}>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="academic" id="goal-academic" />
                      <Label htmlFor="goal-academic" className="cursor-pointer flex-1">{t("inaugural.goalAcademic")}</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="confidence" id="goal-confidence" />
                      <Label htmlFor="goal-confidence" className="cursor-pointer flex-1">{t("inaugural.goalConfidence")}</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Yes/No Question */}
                <div className="border-t pt-6">
                  <Label className="text-base font-medium">{t("inaugural.wantsToSignupQuestion")}</Label>
                  <RadioGroup className="mt-3 space-y-3" value={formData.wantsToSignup === null ? "" : formData.wantsToSignup ? "yes" : "no"} onValueChange={value => setFormData({
                  ...formData,
                  wantsToSignup: value === "yes",
                  interestReason: value === "yes" ? formData.interestReason : "",
                  rejectionReason: value === "no" ? formData.rejectionReason : ""
                })}>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="yes" id="signup-yes" />
                      <Label htmlFor="signup-yes" className="cursor-pointer flex-1">{t("inaugural.yesInterested")}</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="no" id="signup-no" />
                      <Label htmlFor="signup-no" className="cursor-pointer flex-1">{t("inaugural.noNotInterested")}</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Conditional Follow-up Questions */}
                {formData.wantsToSignup === true && <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <Label htmlFor="interestReason" className="text-base font-medium">
                      {t("inaugural.whatInterestedYou")}
                    </Label>
                    <Textarea id="interestReason" value={formData.interestReason} onChange={e => setFormData({
                  ...formData,
                  interestReason: e.target.value
                })} placeholder={t("inaugural.interestReasonPlaceholder")} className="mt-2 bg-white" rows={4} />
                  </div>}

                {formData.wantsToSignup === false && <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <Label htmlFor="rejectionReason" className="text-base font-medium">
                      {t("inaugural.whyNotInterested")}
                    </Label>
                    <Textarea id="rejectionReason" value={formData.rejectionReason} onChange={e => setFormData({
                  ...formData,
                  rejectionReason: e.target.value
                })} placeholder={t("inaugural.rejectionReasonPlaceholder")} className="mt-2" rows={4} />
                  </div>}

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || formData.wantsToSignup === null}>
                  {isSubmitting ? t("inaugural.submitting") : t("inaugural.submit")}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-4">
                {t("inaugural.contactNote")}
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>
    </main>;
};
export default InauguralProgram;