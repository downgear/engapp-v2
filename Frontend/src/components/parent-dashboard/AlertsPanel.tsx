import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, Trophy, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export interface Alert {
  id: string;
  type: "missed" | "low_engagement" | "achievement";
  messageVi: string;
  messageEn: string;
  date: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
}

export const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  const { t, language } = useLanguage();

  const alertConfig = {
    missed: {
      icon: <AlertCircle className="h-4 w-4" />,
      color: "bg-destructive/10 text-destructive border-destructive/20",
      iconBg: "bg-destructive/20",
    },
    low_engagement: {
      icon: <Clock className="h-4 w-4" />,
      color: "bg-secondary/10 text-secondary border-secondary/20",
      iconBg: "bg-secondary/20",
    },
    achievement: {
      icon: <Trophy className="h-4 w-4" />,
      color: "bg-primary/10 text-primary border-primary/20",
      iconBg: "bg-primary/20",
    },
  };

  if (alerts.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("parent.alertsNotifications")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("parent.noAlerts")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("parent.alertsNotifications")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type];
          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border",
                config.color
              )}
            >
              <div className={cn("p-1.5 rounded-full", config.iconBg)}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {language === "vi" ? alert.messageVi : alert.messageEn}
                </p>
                <p className="text-xs opacity-70 mt-0.5">{alert.date}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
