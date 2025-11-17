import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EventProvider } from "@/context/EventContext";
import { ThemeProvider } from "@/components/theme-provider";

import Index from "./pages/Index";
import EventApplication from "./pages/EventApplication";
import NotFound from "./pages/NotFound";
import DatabaseView from "./pages/DatabaseView";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <EventProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/apply" element={<EventApplication />} />
                <Route path="/database" element={<DatabaseView />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </EventProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App; // <--- THIS LINE WAS MISSING