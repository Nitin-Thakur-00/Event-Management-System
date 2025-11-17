import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveEventCardProps {
  event: {
    id: number;
    title: string;
    date: string;
    location: string;
    description: string;
    image: string;
  };
  isApplied: boolean;
  onApply: () => void;
  index: number;
}

export const InteractiveEventCard = ({ 
  event, 
  isApplied, 
  onApply, 
  index 
}: InteractiveEventCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/50 bg-card transition-all duration-500",
        "hover:border-primary/50 hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]",
        "animate-slide-up"
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none",
        "bg-gradient-to-br from-primary/20 via-transparent to-accent/20",
        isHovered && "opacity-100"
      )} />

      {/* Image container with zoom effect */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className={cn(
            "h-full w-full object-cover transition-transform duration-700",
            isHovered && "scale-110"
          )}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        
        {/* Floating sparkle effect */}
        {isHovered && (
          <div className="absolute top-4 right-4 animate-float">
            <Sparkles className="h-6 w-6 text-primary animate-glow" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative p-6 space-y-4">
        <h3 className={cn(
          "text-xl font-bold transition-colors duration-300",
          isHovered && "text-primary"
        )}>
          {event.title}
        </h3>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{event.location}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>

        <Button
          onClick={onApply}
          disabled={isApplied}
          className={cn(
            "w-full relative overflow-hidden transition-all duration-300",
            "bg-primary hover:bg-primary/90",
            isApplied && "bg-muted hover:bg-muted",
            isHovered && !isApplied && "shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
          )}
        >
          {/* Animated shimmer effect */}
          {isHovered && !isApplied && (
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          )}
          
          <span className="relative flex items-center justify-center gap-2">
            {isApplied ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Applied
              </>
            ) : (
              "Apply Now"
            )}
          </span>
        </Button>
      </div>

      {/* Corner accent */}
      <div className={cn(
        "absolute top-0 right-0 w-20 h-20 bg-primary/10 blur-3xl transition-opacity duration-500",
        isHovered && "opacity-100",
        !isHovered && "opacity-0"
      )} />
    </Card>
  );
};
