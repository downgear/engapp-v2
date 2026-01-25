import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export interface Payment {
  id: string;
  date: string;
  descriptionVi: string;
  descriptionEn: string;
  amount: string;
  status: "paid" | "pending" | "failed";
}

interface PaymentHistoryProps {
  payments: Payment[];
}

export const PaymentHistory = ({ payments }: PaymentHistoryProps) => {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const displayPayments = expanded ? payments : payments.slice(0, 3);

  const statusColors = {
    paid: "bg-primary/10 text-primary",
    pending: "bg-secondary/10 text-secondary",
    failed: "bg-destructive/10 text-destructive",
  };

  const statusLabels = {
    paid: t("parent.paid"),
    pending: t("parent.pending"),
    failed: t("parent.failed"),
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("parent.paymentHistory")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {displayPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {language === "vi" ? payment.descriptionVi : payment.descriptionEn}
                </p>
                <p className="text-xs text-muted-foreground">{payment.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">{payment.amount}</span>
                <Badge variant="secondary" className={cn("text-xs", statusColors[payment.status])}>
                  {statusLabels[payment.status]}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {payments.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? t("parent.showLess") : t("parent.viewAll")}
            <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
