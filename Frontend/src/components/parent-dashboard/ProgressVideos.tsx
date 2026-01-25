import { PlayCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProgressVideosProps {
  beforeVideoUrl?: string;
  afterVideoUrl?: string;
  beforeDate?: string;
  afterDate?: string;
}

export const ProgressVideos = ({
  beforeVideoUrl,
  afterVideoUrl,
  beforeDate = "01/12/2024",
  afterDate = "26/01/2025",
}: ProgressVideosProps) => {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Before Video */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{t("parent.beforeVideo")}</span>
          <span className="text-xs text-muted-foreground">{beforeDate}</span>
        </div>
        <div className="relative aspect-[9/16] max-h-[300px] bg-muted rounded-lg overflow-hidden group cursor-pointer">
          {beforeVideoUrl ? (
            <video
              src={beforeVideoUrl}
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <PlayCircle className="w-14 h-14 text-muted-foreground opacity-50" />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t("parent.beforeVideoDesc")}</p>
      </div>

      {/* After Video */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{t("parent.afterVideo")}</span>
          <span className="text-xs text-muted-foreground">{afterDate}</span>
        </div>
        <div className="relative aspect-[9/16] max-h-[300px] bg-muted rounded-lg overflow-hidden group cursor-pointer">
          {afterVideoUrl ? (
            <video
              src={afterVideoUrl}
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <PlayCircle className="w-14 h-14 text-muted-foreground opacity-50" />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t("parent.afterVideoDesc")}</p>
      </div>
    </div>
  );
};
