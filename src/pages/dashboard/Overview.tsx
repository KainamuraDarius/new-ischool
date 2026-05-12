import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  BookOpen, NotebookPen, Calendar as CalIcon, Activity, BarChart3,
  CalendarRange, Presentation, Clock, MapPin, TrendingUp, Users, ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "@/integrations/firebase/config";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

type Role = "admin" | "teacher" | "student";

interface UserProfile {
  displayName?: string;
  role?: Role;
}

const moduleCards = [
  { title: "iSchoolBook", desc: "Interactive content & cross-subject lessons.", url: "/dashboard/book", icon: BookOpen },
  { title: "Notes", desc: "Capture, annotate & practice.", url: "/dashboard/notes", icon: NotebookPen },
  { title: "Calendar", desc: "Lessons, assignments, exams.", url: "/dashboard/calendar", icon: CalIcon },
  { title: "Monitor", desc: "Attendance & teaching analytics.", url: "/dashboard/monitor", icon: Activity },
  { title: "Reports", desc: "Continuous assessment & report cards.", url: "/dashboard/reports", icon: BarChart3 },
  { title: "Timetables", desc: "Conflict-free school scheduling.", url: "/dashboard/timetables", icon: CalendarRange },
  { title: "Whiteboard", desc: "Live digital classroom.", url: "/dashboard/whiteboard", icon: Presentation },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Overview() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<Role>("student");

  const [events, setEvents] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [tt, setTt] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [counts, setCounts] = useState({ sessions: 0, boards: 0, subjects: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        // Get user profile
        const profileSnap = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
        if (!profileSnap.empty) {
          const userData = profileSnap.docs[0].data() as UserProfile;
          setProfile(userData);
          setRole(userData.role || "student");
        }

        const today = new Date();
        const todayDow = today.getDay();
        const horizon = new Date();
        horizon.setDate(horizon.getDate() + 7);

        // Get events within date range
        const eventsSnap = await getDocs(
          query(collection(db, "events"), where("userId", "==", user.uid), orderBy("startAt"), limit(5))
        );
        setEvents(
          eventsSnap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((e) => new Date(e.startAt) >= today && new Date(e.startAt) <= horizon)
        );

        // Get recent notes
        const notesSnap = await getDocs(
          query(collection(db, "notes"), where("userId", "==", user.uid), orderBy("updatedAt", "desc"), limit(5))
        );
        setNotes(notesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        // Get lessons for today (simplified - would need more complex logic for real timetable)
        const lessonsSnap = await getDocs(
          query(collection(db, "lessons"), where("teacherId", "==", user.uid))
        );
        setTt(
          lessonsSnap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((l) => l.dayOfWeek === todayDow)
        );

        // Get assessments
        const assessSnap = await getDocs(
          query(collection(db, "assessments"), where("userId", "==", user.uid), orderBy("assessedOn", "desc"), limit(20))
        );
        setAssessments(assessSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        // Get counts
        const sessionsSnap = await getDocs(query(collection(db, "whiteboard_sessions")));
        const boardsSnap = await getDocs(collection(db, "whiteboard_sessions"));
        
        setCounts({
          sessions: sessionsSnap.size,
          boards: boardsSnap.size,
          subjects: 0, // Can be updated based on your data structure
        });
      } catch (error) {
        console.error("Error loading overview data:", error);
      }
    })();
  }, [user]);

  const perfAvg = useMemo(() => {
    if (!assessments.length) return null;
    const pcts = assessments.map((a) => (Number(a.score || 0) / Number(a.maxScore || 1)) * 100);
    return Math.round(pcts.reduce((s, x) => s + x, 0) / pcts.length);
  }, [assessments]);

  const fmtTime = (iso: string | any) => {
    const date = typeof iso === "string" ? new Date(iso) : iso.toDate?.() || new Date(iso);
    return date.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <section className="rounded-2xl bg-gradient-hero text-primary-foreground p-8 md:p-10 shadow-elevated">
        <div className="flex items-center gap-2 text-primary-foreground/70 text-sm uppercase tracking-widest">
          <span>One ID · One Dashboard</span>
          <Badge variant="secondary" className="ml-2 capitalize gap-1">
            {role === "admin" ? <ShieldCheck className="h-3 w-3" /> : role === "teacher" ? <Users className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
            {role}
          </Badge>
        </div>
        <h1 className="font-display text-3xl md:text-4xl mt-2">
          Welcome{profile?.displayName ? `, ${profile.displayName}` : ""} to iSchoolVerse
        </h1>
        <p className="mt-3 text-primary-foreground/80 max-w-2xl">
          {role === "admin" && "School-wide pulse: schedules, sessions, and academic outcomes at a glance."}
          {role === "teacher" && "Your teaching day: timetable, lessons to deliver, and class performance."}
          {role === "student" && "Your learning day: upcoming lessons, recent notes, and progress."}
        </p>
        {role === "admin" && (
          <div className="mt-5">
            <Link
              to="/dashboard/admin"
              className="inline-flex items-center gap-2 rounded-md bg-primary-foreground/10 hover:bg-primary-foreground/20 border border-primary-foreground/20 px-3 py-1.5 text-sm transition-colors"
            >
              <ShieldCheck className="h-4 w-4" /> Open school administration →
            </Link>
          </div>
        )}
      </section>

      {/* Widgets */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's timetable */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold">Today · {DAY_NAMES[new Date().getDay()]}</h3>
            </div>
            <Link to="/dashboard/timetables" className="text-xs text-muted-foreground hover:text-foreground">Open timetable →</Link>
          </div>
          {tt.length === 0 ? (
            <p className="text-sm text-muted-foreground">No lessons scheduled for today.</p>
          ) : (
            <ul className="divide-y divide-border">
              {tt.map((e) => (
                <li key={e.id} className="py-2.5 flex items-center gap-3">
                  <div className="text-xs font-mono text-muted-foreground w-24">
                    {e.startTime?.slice(0, 5)}–{e.endTime?.slice(0, 5)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{e.title || e.subject}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {[e.teacher, e.class, e.room].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Performance / role-tinted */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold">
                {role === "admin" ? "School pulse" : role === "teacher" ? "Class performance" : "Your performance"}
              </h3>
            </div>
            <Link to="/dashboard/reports" className="text-xs text-muted-foreground hover:text-foreground">Reports →</Link>
          </div>
          {perfAvg === null ? (
            <p className="text-sm text-muted-foreground">No assessments recorded yet.</p>
          ) : (
            <>
              <div className="text-4xl font-display font-bold text-primary">{perfAvg}%</div>
              <p className="text-xs text-muted-foreground mt-1">Average across {assessments.length} recent assessments</p>
            </>
          )}
          {role !== "student" && (
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
              <Stat label="Sessions" value={counts.sessions} />
              <Stat label="Boards" value={counts.boards} />
              <Stat label="Subjects" value={counts.subjects} />
            </div>
          )}
        </Card>

        {/* Upcoming events */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalIcon className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold">Upcoming</h3>
            </div>
            <Link to="/dashboard/calendar" className="text-xs text-muted-foreground hover:text-foreground">Calendar →</Link>
          </div>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing in the next 7 days.</p>
          ) : (
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className="flex items-start gap-2.5">
                  <Clock className="h-3.5 w-3.5 mt-1 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{e.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{fmtTime(e.startAt)}</span>
                      {e.location && (<><span>·</span><MapPin className="h-3 w-3" /><span className="truncate">{e.location}</span></>)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent notes */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <NotebookPen className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold">Recent notes</h3>
            </div>
            <Link to="/dashboard/notes" className="text-xs text-muted-foreground hover:text-foreground">All notes →</Link>
          </div>
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet — start capturing your learning.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {notes.map((n) => (
                <li key={n.id}>
                  <Link to="/dashboard/notes" className="block p-3 rounded-md border border-border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-2">
                      {n.isPinned && <Badge variant="secondary" className="h-4 px-1 text-[10px]">Pinned</Badge>}
                      <span className="font-medium text-sm truncate">{n.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {n.subject || "Untagged"} · {new Date(n.updatedAt.seconds ? n.updatedAt.seconds * 1000 : n.updatedAt).toLocaleDateString()}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section>
        <h2 className="font-display text-xl mb-4 text-foreground">All modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {moduleCards.map((m) => (
            <Link key={m.url} to={m.url}>
              <Card className="p-5 h-full hover:shadow-elevated hover:-translate-y-0.5 transition-all border-border/60 bg-card">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-3">
                  <m.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">{m.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-lg font-semibold text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
