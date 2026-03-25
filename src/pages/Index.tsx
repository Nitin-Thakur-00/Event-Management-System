import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, TrendingUp, CalendarDays, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { useEvents } from "@/context/EventContext";
import { InteractiveEventCard } from "@/components/InteractiveEventCard";
import { SearchFilter } from "@/components/SearchFilter";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config";
// --- 1. Define Interface ---
interface DBEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  image_url: string;
}

const API = import.meta.env.VITE_API_URL;

// --- 2. API Fetch Functions ---
const fetchEvents = async (): Promise<DBEvent[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`);
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
};

const fetchAppCount = async (): Promise<number> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications`);
    const data = await response.json();
    return data.length;
  } catch (e) {
    return 0;
  }
};

const Index = () => {
  const navigate = useNavigate();
  const { appliedEvents } = useEvents();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [appCount, setAppCount] = useState(0);

  // --- 3. Fetch Real Data from Backend ---
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });

  useEffect(() => {
    setIsVisible(true);
    fetchAppCount().then(setAppCount);
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterType === "applied") {
      filtered = filtered.filter((event) => appliedEvents.includes(event.id));
    } else if (filterType === "upcoming") {
      filtered = filtered.filter((event) => !appliedEvents.includes(event.id));
    }
    return filtered;
  }, [searchQuery, filterType, appliedEvents, events]);

  const handleApply = (event: DBEvent) => {
    const params = new URLSearchParams({
      id: event.id.toString(), 
      title: event.title,
      date: event.date,
      location: event.location,
    });
    navigate(`/apply?${params.toString()}`);
    toast.success(`Redirecting to ${event.title} application...`, {
      duration: 2000,
    });
  };

  const nextEvent = events.length > 0 ? events[0] : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-6 right-6 z-50"><ThemeToggle /></div>
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative container mx-auto px-4 py-12">
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-glow">
            <Sparkles className="h-4 w-4 text-primary animate-float" />
            <span className="text-sm font-medium text-primary">FET-JU Events 2026</span>
          </div>
          
          {/* --- FIX: HEADER TEXT SPACING --- */}
          {/* Changed mb-4 to mb-6, added py-4 leading-relaxed to force spacing */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent py-4 leading-relaxed animate-slide-up">
            Ignite Your Campus Spirit
          </h1>
          
          {/* ADDED MARGIN TOP TO PUSH DOWN DESCRIPTION */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up mt-4" style={{ animationDelay: "100ms" }}>
            Compete in electrifying battles, showcase your talent, and connect at the heart of FET-JU.
          </p>
        </div>

        {nextEvent && (
          <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <h2 className="text-2xl font-bold text-center mb-6">Next Event Starts In</h2>
            <CountdownTimer targetDate={nextEvent.date} />
            <p className="text-center text-muted-foreground mt-4">{nextEvent.title}</p>
          </div>
        )}

        {/* --- STATS SECTION (UPDATED NAVIGATION) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: "300ms" }}>
            
            {/* 1. Total Events -> Goes to ?view=events */}
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur-md text-left hover:bg-card/80 transition-colors cursor-pointer group"
              onClick={() => navigate("/database?view=events")} // <--- CHANGED THIS
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <CalendarDays className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-foreground">
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : events.length}
                  </h3>
                  <p className="text-muted-foreground group-hover:text-primary transition-colors">Total Events →</p>
                </div>
              </div>
            </Card>

            {/* 2. Applications -> Goes to ?view=applications */}
            <Card 
              className="p-6 bg-card/50 border-border/50 backdrop-blur-md text-left cursor-pointer hover:bg-accent/10 hover:scale-[1.02] hover:border-primary/50 transition-all duration-300 group"
              onClick={() => navigate("/database?view=applications")} // <--- CHANGED THIS
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/40 transition-colors">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-foreground">{appCount}</h3>
                  <p className="text-purple-500 font-medium group-hover:translate-x-1 transition-transform">
                    View Applications →
                  </p>
                </div>
              </div>
            </Card>
        </div>

        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterType={filterType}
          onFilterChange={setFilterType}
        />

        {isLoading ? (
           <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <InteractiveEventCard
                key={event.id}
                event={{
                    ...event,
                    image: event.image_url || "/assets/event-tech.jpg"
                }}
                isApplied={appliedEvents.includes(event.id)}
                onApply={() => handleApply(event)}
                index={index}
              />
            ))}
          </div>
        )}

        {/* No results message */}
        {!isLoading && filteredEvents.length === 0 && (
          <div className="text-center py-20 animate-scale-in">
            <p className="text-2xl font-semibold text-muted-foreground mb-2">No events found</p>
            <p className="text-muted-foreground">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;