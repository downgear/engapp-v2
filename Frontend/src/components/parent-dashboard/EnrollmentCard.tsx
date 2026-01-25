import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EnrollmentCardProps {
  packageNameVi: string;
  packageNameEn: string;
  startDate: string;
  endDate: string;
  status: "active" | "expiring" | "expired";
}

export const EnrollmentCard = ({
  packageNameVi,
  packageNameEn,
  startDate,
  endDate,
  status,
}: EnrollmentCardProps) => {
  const { t, language } = useLanguage();

  const statusColors = {
    active: "bg-primary/10 text-primary border-primary/30",
    expiring: "bg-secondary/10 text-secondary border-secondary/30",
    expired: "bg-destructive/10 text-destructive border-destructive/30",
  };

  const statusLabels = {
    active: t("parent.statusActive"),
    expiring: t("parent.statusExpiring"),
    expired: t("parent.statusExpired"),
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t("parent.currentPlan")}</CardTitle>
          <Badge variant="outline" className={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xl font-semibold text-foreground">
            {language === "vi" ? packageNameVi : packageNameEn}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{startDate} - {endDate}</span>
          </div>
        </div>

        <Button className="w-full gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("parent.renew")}
        </Button>
      </CardContent>
    </Card>
  );
};
