import { useEffect, useState } from "react";
import { TrendingUp, Users, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCounterProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  delay?: number;
}

const StatCounter = ({ icon, label, value, suffix = "", delay = 0 }: StatCounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <Card className={cn(
      "p-6 bg-card border-border/50 transition-all duration-500 hover:border-primary/50",
      "hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)] animate-slide-up group"
    )}
    style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div>
          <p className="text-3xl font-bold text-primary tabular-nums">
            {count}{suffix}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
};

export const StatsCounter = ({ totalEvents, appliedCount }: { totalEvents: number; appliedCount: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <StatCounter
        icon={<Calendar className="h-6 w-6" />}
        label="Total Events"
        value={totalEvents}
        delay={0}
      />
      <StatCounter
        icon={<TrendingUp className="h-6 w-6" />}
        label="Applications"
        value={appliedCount}
        delay={100}
      />
      <StatCounter
        icon={<Users className="h-6 w-6" />}
        label="Participants"
        value={1250}
        suffix="+"
        delay={200}
      />
    </div>
  );
};
