import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface SkillData {
  skill: string;
  current: number;
  target: number;
}

interface SkillsRadarProps {
  data: SkillData[];
}

const SkillsRadar = ({ data }: SkillsRadarProps) => {
  const { t } = useLanguage();
  
  return (
    <Card className="bg-white p-6">
      <h3 className="text-xl font-bold text-foreground mb-4 text-center">
        {t("riseMeter.skillsAnalysis")}
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="hsl(var(--muted))" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            />
            <Radar
              name={t("riseMeter.target")}
              dataKey="target"
              stroke="hsl(var(--secondary))"
              fill="hsl(var(--secondary))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Radar
              name={t("riseMeter.current")}
              dataKey="current"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default SkillsRadar;
