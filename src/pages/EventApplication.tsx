import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, Sparkles, Loader2, Home } from "lucide-react";
import { toast } from "sonner";
import { useEvents } from "@/context/EventContext";
import { ThemeToggle } from "@/components/ThemeToggle";

// --- API Functions ---

const submitNewApplication = async (data: any) => {
  const response = await fetch('http://localhost:3000/api/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, userType: 'new' }),
  });
  if (!response.ok) throw new Error('Failed to submit');
  return response.json();
};

const submitExistingApplication = async (payload: { usn: string; eventId: string; role: string }) => {
  const response = await fetch('http://localhost:3000/api/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      usn: payload.usn, 
      userType: payload.role, 
      eventId: payload.eventId 
    }),
  });
  if (!response.ok) throw new Error('Failed to submit');
  return response.json();
};

const checkUsnExists = async (usn: string) => {
  const response = await fetch('http://localhost:3000/api/check-usn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usn }),
  });
  return response.json();
};

// --- Component ---

const EventApplication = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addAppliedEvent } = useEvents();
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [hasRegistered, setHasRegistered] = useState(false); 
  
  const [userType, setUserType] = useState<"core" | "volunteer" | "new" | null>(null);
  const [existingUsn, setExistingUsn] = useState("");

  const [newApplicant, setNewApplicant] = useState({
    usn: "", name: "", contact: "", email: "", branch: "", year: "", section: "",
  });

  const eventId = searchParams.get("id");
  const eventTitle = searchParams.get("title") || "Event";
  const eventDate = searchParams.get("date") || "";
  const eventLocation = searchParams.get("location") || "";

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleUserTypeSelection = (type: "core" | "volunteer" | "new") => {
    setUserType(type);
  };

  const handleSuccess = async () => {
    if (eventId) {
      addAppliedEvent(Number(eventId));
    }
    toast.success("Registration Successful.");
    setIsSubmitted(true);
    setIsLoading(false);
  };

  const handleExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const check = await checkUsnExists(existingUsn);
      if (check.exists) {
        await submitExistingApplication({ 
          usn: existingUsn, 
          eventId: eventId || "0", 
          role: userType || "existing" 
        });
        handleSuccess();
      } else {
        toast.error("You are not an existing member!");
        setIsLoading(false);
      }
    } catch (err) {
      toast.error("Connection Error. Is backend running?");
      setIsLoading(false);
    }
  };

  const handleNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await submitNewApplication({ ...newApplicant, eventId: eventId || "0" });
      
      toast.success("Details Registered! Now select 'Core' or 'Volunteer' to apply.", {
        duration: 4000,
        icon: <CheckCircle2 className="w-5 h-5 text-green-500"/>
      });
      
      setExistingUsn(newApplicant.usn);
      setIsLoading(false);
      setHasRegistered(true);
      setUserType(null);      
      
    } catch (err) {
      toast.error("Connection Error. Is backend running?");
      setIsLoading(false);
    }
  };

  const handleNewApplicantChange = (key: string, value: string) => {
    setNewApplicant((prev) => ({ ...prev, [key]: value }));
  };

  const isNewFormValid = Object.values(newApplicant).every(Boolean);

  // --- RENDER LOGIC ---

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-4">
        <div className="fixed top-6 right-6 z-50"><ThemeToggle /></div>

        <Card className="max-w-md w-full p-8 text-center bg-card/80 backdrop-blur-sm shadow-[var(--shadow-card)]">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary animate-in zoom-in" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Registration Successful.
          </h2>
          
          <p className="text-muted-foreground mb-8">
             Your application has been successfully recorded.
          </p>
          
          <div className="flex justify-center gap-4">
             <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" /> Return Home
             </Button>
          </div>
        </Card>
      </div>
    );
  }

  const renderFormContent = () => {
    if (!userType) {
      return (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {hasRegistered ? "Step 2: Select Your Role" : "How are you registering?"}
            </h2>
            <p className="text-muted-foreground">
              {hasRegistered ? "Your details are saved. Now apply for the event." : "Please select your role."}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Button variant="outline" size="lg" onClick={() => handleUserTypeSelection("core")} className="h-20 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all">
              Core Team Member
            </Button>
            <Button variant="outline" size="lg" onClick={() => handleUserTypeSelection("volunteer")} className="h-20 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all">
              Volunteer
            </Button>
            
            {!hasRegistered && (
              <Button variant="outline" size="lg" onClick={() => handleUserTypeSelection("new")} className="h-20 text-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all">
                Registering for the first time
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (userType === "core" || userType === "volunteer") {
      return (
        <form onSubmit={handleExistingSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="usn">Enter USN *</Label>
            <Input
              id="usn"
              type="text"
              required
              placeholder="Your USN or Member ID"
              className="bg-background/50 backdrop-blur-sm"
              value={existingUsn}
              onChange={(e) => setExistingUsn(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => setUserType(null)} className="flex-1" disabled={isLoading}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button type="submit" className="flex-1 group/btn relative overflow-hidden shadow-lg hover:shadow-xl" disabled={!existingUsn || isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />}
              Apply
            </Button>
          </div>
        </form>
      );
    }

    if (userType === "new") {
      return (
        <form onSubmit={handleNewSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new-usn">Enter USN *</Label>
            <Input id="new-usn" required placeholder="e.g. 24BTRCN026" value={newApplicant.usn} onChange={(e) => handleNewApplicantChange("usn", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-name">Enter Name *</Label>
            <Input id="new-name" required placeholder="e.g. Nitin Thakur" value={newApplicant.name} onChange={(e) => handleNewApplicantChange("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-contact">Enter Contact Number *</Label>
            <Input id="new-contact" type="tel" required placeholder="+91 98765 43210" value={newApplicant.contact} onChange={(e) => handleNewApplicantChange("contact", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-email">Enter Email Address *</Label>
            <Input id="new-email" type="email" required placeholder="nitin@university.edu" value={newApplicant.email} onChange={(e) => handleNewApplicantChange("email", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-branch">Enter Branch Name *</Label>
            <Select required onValueChange={(val) => handleNewApplicantChange("branch", val)}>
              <SelectTrigger><SelectValue placeholder="Select your branch" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CSE">Computer Science</SelectItem>
                <SelectItem value="ISE">Information Science</SelectItem>
                <SelectItem value="ECE">Electronics & Communication</SelectItem>
                <SelectItem value="MECH">Mechanical</SelectItem>
                <SelectItem value="CIVIL">Civil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-year">Enter Year *</Label>
              <Select required onValueChange={(val) => handleNewApplicantChange("year", val)}>
                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-section">Enter Section *</Label>
              <Select required onValueChange={(val) => handleNewApplicantChange("section", val)}>
                <SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setUserType(null)} className="flex-1" disabled={isLoading}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button type="submit" className="flex-1 group/btn relative overflow-hidden shadow-lg hover:shadow-xl" disabled={!isNewFormValid || isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Register Details"}
            </Button>
          </div>
        </form>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="fixed top-6 right-6 z-50"><ThemeToggle /></div>
      
      <header className="relative py-16 px-4"> {/* Removed overflow-hidden here */}
        {/* Background layers (Removed overflow-hidden) */}
        <div className="absolute inset-0 bg-slate-900/90 -z-10" />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-90" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[image:var(--gradient-shine)] animate-shimmer opacity-20" />
        </div>

        <div className={`container mx-auto max-w-4xl relative z-10 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 text-white hover:bg-white/20 backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
          </Button>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Application Form</span>
          </div>
          
          {/* --- FIXED HEADER TEXT (No Cropping) --- */}
          <h1 className="text-4xl md:text-5xl font-black mb-8 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent py-4 leading-relaxed drop-shadow-lg">
            {eventTitle}
          </h1>

          <div className="flex flex-wrap gap-4 text-white/90">
            <span className="flex items-center gap-2"><span className="text-sm font-medium">{eventDate}</span></span>
            <span className="flex items-center gap-2"><span className="text-sm font-medium">{eventLocation}</span></span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <Card className="max-w-2xl mx-auto p-8 bg-card/80 backdrop-blur-sm shadow-[var(--shadow-card)] border-0">
          {renderFormContent()}
        </Card>
      </main>
    </div>
  );
};

export default EventApplication;