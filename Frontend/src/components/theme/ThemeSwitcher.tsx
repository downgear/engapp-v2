import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeSwitcherProps {
  compact?: boolean;
  onThemeChanged?: () => void;
}

export const ThemeSwitcher = ({ compact = false, onThemeChanged }: ThemeSwitcherProps) => {
  const { language } = useLanguage();
  const { currentTheme, setCurrentTheme, themeList } = useTheme();

  const title = language === "vi" ? "Giao diện" : "Theme";
  const subtitle = language === "vi" ? "Chọn phong cách" : "Choose style";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          className={cn(
            "gap-2 border-border/60 bg-background/80 hover:bg-muted/60",
            compact ? "h-8 px-2.5" : "h-9 px-3",
          )}
        >
          <Palette className="h-4 w-4" />
          {!compact && <span className="text-xs font-medium">{title}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="leading-tight">
          <p className="text-sm">{title}</p>
          <p className="text-xs text-muted-foreground font-normal">{subtitle}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="px-2 pb-2 flex items-center gap-2">
          {themeList.map((themeItem) => {
            const isActive = currentTheme === themeItem.key;
            return (
              <button
                key={themeItem.key}
                type="button"
                aria-label={`Switch to ${themeItem.name}`}
                title={themeItem.name}
                onClick={() => {
                  setCurrentTheme(themeItem.key);
                  onThemeChanged?.();
                }}
                className={cn(
                  "relative h-8 w-8 rounded-full transition-all duration-300",
                  themeItem.swatchClass,
                  isActive
                    ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "opacity-80 hover:opacity-100 hover:scale-105",
                )}
              >
                {isActive && <span className="absolute inset-0 rounded-full ring-4 ring-primary/20 animate-pulse" />}
              </button>
            );
          })}
        </div>

        {themeList.map((themeItem) => {
          const isActive = currentTheme === themeItem.key;
          return (
            <DropdownMenuItem
              key={themeItem.key}
              onClick={() => {
                setCurrentTheme(themeItem.key);
                onThemeChanged?.();
              }}
              className={cn("py-2", isActive && "bg-primary/10")}
            >
              <div className="flex items-center gap-2 w-full">
                <span className={cn("h-3 w-3 rounded-full", themeItem.swatchClass)} />
                <div className="leading-tight">
                  <p className="text-xs font-semibold">{themeItem.name}</p>
                  <p className="text-[11px] text-muted-foreground">{themeItem.subtitle}</p>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
