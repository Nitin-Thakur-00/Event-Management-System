import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider"; 
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react"; // <--- Added import for useEffect, useState

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false); // <--- Added mounted state

  // This hook ensures the component only renders after the client-side environment is ready.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null or a simple placeholder if not mounted yet (prevents hydration mismatch errors)
  if (!mounted) {
    return <Button variant="outline" size="icon" className="rounded-full border-border/50 hover:border-primary transition-all duration-300" disabled />;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-full border-border/50 hover:border-primary transition-all duration-300"
    >
      {theme === "dark" ? (
        // Displays Sun icon when theme is dark (user clicks Sun to switch to light)
        <Sun className="h-5 w-5 text-primary" />
      ) : (
        // Displays Moon icon when theme is light (user clicks Moon to switch to dark)
        <Moon className="h-5 w-5 text-primary" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};