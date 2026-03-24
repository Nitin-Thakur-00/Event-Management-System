import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // Added useSearchParams
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table2, ArrowLeft, Users, ShieldCheck, HeartHandshake, CalendarDays } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const DatabaseView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Hook to read URL params
  
  // Determine which view mode we are in ('events' or 'applications')
  const viewMode = searchParams.get("view") || "applications"; 

  const [applications, setApplications] = useState<any[]>([]);
  const [coreTeam, setCoreTeam] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Fetch everything (simplest approach), we just hide what we don't need
    fetch('/api/applications').then(res => res.json()).then(setApplications);
    fetch('/api/core-team').then(res => res.json()).then(setCoreTeam);
    fetch('/api/volunteers').then(res => res.json()).then(setVolunteers);
    fetch('/api/events').then(res => res.json()).then(setEvents);
  }, []);

  // Dynamic Title based on view
  const pageTitle = viewMode === 'events' ? "Events Master List" : "Applications Dashboard";
  const pageDesc = viewMode === 'events' ? "View all scheduled events" : "View Core Team, Volunteers, and Participants";

  return (
    <div className="min-h-screen bg-background p-8 transition-colors duration-500">
      <div className="fixed top-6 right-6 z-50"><ThemeToggle /></div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-purple-500/20">
                {viewMode === 'events' ? <CalendarDays className="w-8 h-8 text-purple-500" /> : <Users className="w-8 h-8 text-purple-500" />}
            </div>
            <div>
                <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
                <p className="text-muted-foreground">{pageDesc}</p>
            </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/")} className="border-border hover:bg-accent">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </div>

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* --- VIEW MODE: EVENTS --- */}
        {viewMode === 'events' && (
            <Card className="p-6 bg-card border-border shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                    <CalendarDays className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold text-primary">Events List</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Event Title</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Location</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-foreground">
                            {events.map((ev) => (
                                <tr key={ev.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-3 font-mono text-zinc-500">{ev.id}</td>
                                    <td className="px-4 py-3 font-bold">{ev.title}</td>
                                    <td className="px-4 py-3">{ev.date}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{ev.location}</td>
                                </tr>
                            ))}
                            {events.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No Events found</td></tr>}
                        </tbody>
                    </table>
                </div>
            </Card>
        )}

        {/* --- VIEW MODE: APPLICATIONS (Core, Volunteers, Apps) --- */}
        {viewMode === 'applications' && (
            <>
                {/* Table 1: Core Team */}
                <Card className="p-6 bg-card border-border shadow-xl">
                    <div className="flex items-center gap-2 mb-6">
                        <ShieldCheck className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-xl font-bold text-yellow-500">Core Team</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                <tr><th className="px-4 py-3">USN</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Assigned Event</th><th className="px-4 py-3">Role</th></tr>
                            </thead>
                            <tbody className="divide-y divide-border text-foreground">
                                {coreTeam.map((m) => (
                                    <tr key={m.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 font-mono">{m.usn}</td>
                                        <td className="px-4 py-3">{m.name}</td>
                                        <td className="px-4 py-3 text-blue-500 font-medium">{m.event_title || `ID: ${m.event_id}`}</td>
                                        <td className="px-4 py-3"><span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs border border-yellow-500/20">CORE</span></td>
                                    </tr>
                                ))}
                                {coreTeam.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No Core Team members yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Table 2: Volunteers */}
                <Card className="p-6 bg-card border-border shadow-xl">
                    <div className="flex items-center gap-2 mb-6">
                        <HeartHandshake className="w-6 h-6 text-pink-500" />
                        <h2 className="text-xl font-bold text-pink-500">Volunteers</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                <tr><th className="px-4 py-3">USN</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Assigned Event</th><th className="px-4 py-3">Role</th></tr>
                            </thead>
                            <tbody className="divide-y divide-border text-foreground">
                                {volunteers.map((v) => (
                                    <tr key={v.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 font-mono">{v.usn}</td>
                                        <td className="px-4 py-3">{v.name}</td>
                                        <td className="px-4 py-3 text-blue-500 font-medium">{v.event_title || `ID: ${v.event_id}`}</td>
                                        <td className="px-4 py-3"><span className="bg-pink-500/10 text-pink-500 px-2 py-1 rounded text-xs border border-pink-500/20">VOLUNTEER</span></td>
                                    </tr>
                                ))}
                                {volunteers.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No Volunteers yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Table 3: Application List */}
                <Card className="p-6 bg-card border-border shadow-xl">
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="w-6 h-6 text-blue-400" />
                        <h2 className="text-xl font-bold text-blue-400">Application List (Registered Users)</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                <tr><th className="px-4 py-3">USN</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Email</th></tr>
                            </thead>
                            <tbody className="divide-y divide-border text-foreground">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 font-mono">{app.usn}</td>
                                        <td className="px-4 py-3">{app.name}</td>
                                        <td className="px-4 py-3">{app.contact}</td>
                                        <td className="px-4 py-3">{app.email}</td>
                                    </tr>
                                ))}
                                {applications.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No users registered yet</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </>
        )}

      </div>
    </div>
  );
};

export default DatabaseView;