import { createContext, useContext, useState, ReactNode } from "react";

interface EventContextType {
  appliedEvents: number[];
  addAppliedEvent: (eventId: number) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [appliedEvents, setAppliedEvents] = useState<number[]>([]);

  const addAppliedEvent = (eventId: number) => {
    setAppliedEvents((prev) => [...prev, eventId]);
  };

  return (
    <EventContext.Provider value={{ appliedEvents, addAppliedEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
};
