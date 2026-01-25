import { Navigation } from "@/components/Navigation";
import RiseScoreCard from "@/components/rise-meter/RiseScoreCard";
import ThreeLProgress from "@/components/rise-meter/ThreeLProgress";
import SkillsRadar from "@/components/rise-meter/SkillsRadar";
import ActivityTimeline from "@/components/rise-meter/ActivityTimeline";
import AchievementsPanel from "@/components/rise-meter/AchievementsPanel";
import WeeklyGoals from "@/components/rise-meter/WeeklyGoals";
import { useLanguage } from "@/contexts/LanguageContext";

const RiseMeterDemo = () => {
  const { t } = useLanguage();

  const skillsData = [
    { skill: t("aiPractice.pronunciation"), current: 72, target: 85 },
    { skill: t("aiPractice.grammar"), current: 68, target: 80 },
    { skill: t("aiPractice.vocabulary"), current: 75, target: 85 },
    { skill: t("aiPractice.fluency"), current: 65, target: 80 },
    { skill: t("aiPractice.coherence"), current: 70, target: 85 },
  ];

  const activities = [
    { id: "1", type: "ai-practice" as const, title: "Luyện IELTS Speaking Part 2", titleEn: "IELTS Speaking Part 2 Practice", description: "Describe a memorable journey - Điểm: 6.5", descriptionEn: "Describe a memorable journey - Score: 6.5", timestamp: "Hôm nay, 14:30", timestampEn: "Today, 14:30" },
    { id: "2", type: "mentor" as const, title: "Buổi mentor với Sarah", titleEn: "Mentor session with Sarah", description: "Phản hồi phát âm và ngữ điệu", descriptionEn: "Pronunciation and intonation feedback", timestamp: "Hôm qua, 19:00", timestampEn: "Yesterday, 19:00" },
    { id: "3", type: "lesson" as const, title: "Hoàn thành bài học: Conditional Sentences", titleEn: "Completed lesson: Conditional Sentences", description: "Bài 12/20 - Module Ngữ pháp", descriptionEn: "Lesson 12/20 - Grammar Module", timestamp: "2 ngày trước", timestampEn: "2 days ago" },
    { id: "4", type: "achievement" as const, title: "Mở khóa huy hiệu: First Week!", titleEn: "Unlocked badge: First Week!", description: "Hoàn thành 7 ngày học đầu tiên", descriptionEn: "Completed first 7 days of learning", timestamp: "3 ngày trước", timestampEn: "3 days ago" },
  ];

  const achievements = [
    { id: "1", emoji: "🌟", title: "First Step", titleEn: "First Step", description: "Hoàn thành bài đầu tiên", unlocked: true },
    { id: "2", emoji: "🔥", title: "On Fire", titleEn: "On Fire", description: "7 ngày liên tiếp", unlocked: true },
    { id: "3", emoji: "🎯", title: "Sharpshooter", titleEn: "Sharpshooter", description: "Điểm 8.0+", unlocked: true },
    { id: "4", emoji: "👑", title: "Champion", titleEn: "Champion", description: "30 ngày liên tiếp", unlocked: false },
    { id: "5", emoji: "🚀", title: "Rocket", titleEn: "Rocket", description: "+10 điểm/tuần", unlocked: false },
    { id: "6", emoji: "💎", title: "Diamond", titleEn: "Diamond", description: "Đạt B2", unlocked: false },
  ];

  const weeklyGoals = [
    { id: "1", title: "Luyện tập với AI", titleEn: "AI Practice", current: 3, target: 5, unit: "lần", unitEn: "times" },
    { id: "2", title: "Hoàn thành bài học", titleEn: "Complete Lessons", current: 4, target: 4, unit: "bài", unitEn: "lessons" },
    { id: "3", title: "Thời gian học", titleEn: "Study Time", current: 120, target: 180, unit: "phút", unitEn: "minutes" },
    { id: "4", title: "Từ vựng mới", titleEn: "New Vocabulary", current: 25, target: 30, unit: "từ", unitEn: "words" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t("riseMeter.title")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("riseMeter.subtitle")}</p>
          </div>
          <div className="max-w-md mx-auto mb-12">
            <RiseScoreCard score={72} cefrLevel="B1" cefrLabel={t("riseMeter.intermediate")} weeklyChange={5} />
          </div>
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">{t("riseMeter.3lProgress")}</h2>
            <ThreeLProgress learnProgress={{ completed: 12, total: 20 }} loopMinutes={145} loopStreak={7} levelUpSessions={3} nextSessionDays={2} />
          </section>
          <section className="grid lg:grid-cols-2 gap-6 mb-12">
            <SkillsRadar data={skillsData} />
            <WeeklyGoals goals={weeklyGoals} />
          </section>
          <section className="grid lg:grid-cols-2 gap-6">
            <ActivityTimeline activities={activities} />
            <AchievementsPanel streak={7} achievements={achievements} nextMilestone="10 ngày liên tiếp" nextMilestoneEn="10 consecutive days" />
          </section>
        </div>
      </main>
    </div>
  );
};

export default RiseMeterDemo;
