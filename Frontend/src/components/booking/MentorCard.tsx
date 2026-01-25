import { Star, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Mentor } from "@/data/mentors";
import { useLanguage } from "@/contexts/LanguageContext";

interface MentorCardProps {
  mentor: Mentor;
  onSelect: (mentor: Mentor) => void;
}

export const MentorCard = ({ mentor, onSelect }: MentorCardProps) => {
  const { t } = useLanguage();

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
      {/* Avatar & Basic Info */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start gap-4">
          <img
            src={mentor.avatar}
            alt={mentor.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl font-bold text-foreground truncate">
              {mentor.name}
            </h3>
            <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{mentor.country}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="font-semibold text-foreground">{mentor.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({mentor.reviewCount} {t("booking.reviews")})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="px-6 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {mentor.bio}
        </p>
      </div>

      {/* Languages */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2 text-sm">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">
            {mentor.languages.join(", ")}
          </span>
        </div>
      </div>

      {/* Specialties */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-2">
          {mentor.specialty.slice(0, 3).map((spec) => (
            <Badge 
              key={spec} 
              variant="secondary" 
              className="bg-primary/10 text-primary hover:bg-primary/20"
            >
              {spec}
            </Badge>
          ))}
        </div>
      </div>

      {/* Experience & CTA */}
      <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-border/50 mt-2">
        <span className="text-sm text-muted-foreground">
          {mentor.experience}
        </span>
        <Button 
          onClick={() => onSelect(mentor)}
          className="bg-primary hover:bg-primary/90"
        >
          {t("booking.selectMentor")}
        </Button>
      </div>
    </div>
  );
};
