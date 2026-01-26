import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Child } from "@/types";

interface ChildSelectorProps {
  children: Child[];
  selectedChildId: number | null;
  onSelectChild: (childId: number) => void;
}

export const ChildSelector = ({ children, selectedChildId, onSelectChild }: ChildSelectorProps) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {children.map((child) => (
        <button
          key={child.id}
          onClick={() => onSelectChild(child.id)}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all min-w-fit",
            selectedChildId === child.id
              ? "border-primary bg-primary/10 shadow-md"
              : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={child.avatarUrl || undefined} alt={child.name} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {child.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="font-medium text-foreground">{child.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{child.grade}</span>
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {child.cefrLevel}
              </Badge>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
