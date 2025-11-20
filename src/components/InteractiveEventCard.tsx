import { Calendar, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  image: string;
}

interface InteractiveEventCardProps {
  event: Event;
  isApplied: boolean;
  onApply: () => void;
  index: number;
}

export const InteractiveEventCard = ({
  event,
  isApplied,
  onApply,
  index,
}: InteractiveEventCardProps) => {
  return (
    <Card
      className="group overflow-hidden border border-border/50 hover:border-primary/50 hover:shadow-2xl transition-all duration-500 bg-card"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-muted">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Gradient Overlay (Ensures text is readable if we put text over image, but mainly adds depth) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* --- FIX: APPLIED BADGE --- */}
        {/* Using 'bg-green-600' guarantees it is dark enough to see white text on, even in Light Mode */}
        {isApplied && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-600 text-white shadow-lg z-10 animate-in zoom-in duration-300">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">Applied</span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-6 space-y-4 relative">
        <h3 className="text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">
          {event.description}
        </p>

        {/* Button Logic */}
        <Button
          onClick={onApply}
          disabled={isApplied}
          className={`w-full mt-4 font-semibold transition-all duration-300 ${
            isApplied 
              // Custom styling for "Already Applied" to look good in both themes
              ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" 
              : "hover:scale-[1.02]"
          }`}
          variant={isApplied ? "outline" : "default"}
        >
          {isApplied ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Already Applied
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Apply Now <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </Card>
  );
};