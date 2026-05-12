import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Clock3, Loader2, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { monitorService } from "@/services/firestoreService";
import { cn } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  userId: string;
  lessonId?: string;
  status: "present" | "absent" | "late";
  timestamp: Date;
  duration?: number;
  notes?: string;
}

interface LessonSession {
  id: string;
  userId: string;
  title: string;
  subject?: string;
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  status: "scheduled" | "in-progress" | "completed";
}

type SessionStatus = LessonSession["status"];

const STATUS_COLORS: Record<string, string> = {
  present: "bg-emerald-100 text-emerald-900",
  absent: "bg-red-100 text-red-900",
  late: "bg-yellow-100 text-yellow-900",
  scheduled: "bg-blue-100 text-blue-900",
  "in-progress": "bg-purple-100 text-purple-900",
  completed: "bg-green-100 text-green-900",
};

export default function MonitorPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<LessonSession[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    subject: "",
    scheduledAt: new Date().toISOString().slice(0, 16),
  });
  const [newAttendance, setNewAttendance] = useState({
    status: "present" as const,
    notes: "",
  });

  // Load data from Firestore
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        setLoading(true);
        // Load lesson sessions for the user
        const userSessions = await monitorService.getTeacherSessions?.(user.uid);
        setSessions((userSessions || []) as LessonSession[]);

        // Load attendance records
        const userAttendance = await monitorService.getStudentAttendance?.(user.uid);
        setAttendance((userAttendance || []) as AttendanceRecord[]);
      } catch (error) {
        toast.error("Failed to load monitoring data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === "completed").length;
    const totalPresent = attendance.filter((a) => a.status === "present").length;
    const totalAbsent = attendance.filter((a) => a.status === "absent").length;
    const totalLate = attendance.filter((a) => a.status === "late").length;
    const totalRecords = attendance.length;
    const attendanceRate = totalRecords > 0 ? Math.round(((totalPresent + totalLate) / totalRecords) * 100) : 0;
    const totalMinutes = attendance.reduce((sum, a) => sum + (a.duration || 0), 0);

    return {
      totalSessions,
      completedSessions,
      totalPresent,
      totalAbsent,
      totalLate,
      totalRecords,
      attendanceRate,
      totalMinutes,
    };
  }, [sessions, attendance]);

  const createSession = async () => {
    if (!user || !newSession.title) {
      toast.error("Please fill in the required fields");
      return;
    }

    try {
      const sessionData = {
        userId: user.uid,
        title: newSession.title,
        subject: newSession.subject,
        scheduledAt: new Date(newSession.scheduledAt),
        status: "scheduled" as const,
      };

      // You would need to implement this in firestoreService
      const sessionId = await monitorService.createLessonSession?.(sessionData);
      if (sessionId) {
        setSessions((prev) => [
          ...prev,
          {
            id: sessionId,
            ...sessionData,
          },
        ]);
        setNewSession({ title: "", subject: "", scheduledAt: new Date().toISOString().slice(0, 16) });
        setOpen(false);
        toast.success("Lesson session created");
      }
    } catch (error) {
      toast.error("Failed to create session");
      console.error(error);
    }
  };

  const recordAttendance = async (sessionId: string) => {
    if (!user) return;

    try {
      const now = new Date();
      await monitorService.recordAttendance(sessionId, user.uid, {
        status: newAttendance.status,
        timestamp: now,
        notes: newAttendance.notes,
      });

      const record: AttendanceRecord = {
        id: `${sessionId}-${Date.now()}`,
        userId: user.uid,
        lessonId: sessionId,
        ...newAttendance,
        timestamp: now,
      };

      setAttendance((prev) => [record, ...prev]);
      setNewAttendance({ status: "present", notes: "" });
      toast.success("Attendance recorded");
    } catch (error) {
      toast.error("Failed to record attendance");
      console.error(error);
    }
  };

  const updateSessionStatus = async (sessionId: string, newStatus: "scheduled" | "in-progress" | "completed") => {
    try {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                status: newStatus,
                startedAt: newStatus === "in-progress" && !s.startedAt ? new Date() : s.startedAt,
                endedAt: newStatus === "completed" && !s.endedAt ? new Date() : s.endedAt,
              }
            : s
        )
      );
      toast.success(`Session marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update session");
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Session deleted");
    } catch (error) {
      toast.error("Failed to delete session");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading iSchool Monitor…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary flex items-center gap-2">
            <Activity className="h-7 w-7" /> iSchool Monitor
          </h1>
          <p className="text-muted-foreground">Track lesson attendance, time on task, and lesson effectiveness.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create lesson session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  placeholder="e.g., Algebra Lesson 5"
                />
              </div>
              <div>
                <Label>Subject (optional)</Label>
                <Input
                  value={newSession.subject}
                  onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <Label>Scheduled time</Label>
                <Input
                  type="datetime-local"
                  value={newSession.scheduledAt}
                  onChange={(e) => setNewSession({ ...newSession, scheduledAt: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createSession}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Lesson sessions</div>
          <div className="text-3xl font-bold text-primary mt-2">{stats.totalSessions}</div>
          <div className="text-xs text-muted-foreground mt-2">{stats.completedSessions} completed</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Attendance rate</div>
          <div className="text-3xl font-bold text-primary mt-2">{stats.attendanceRate}%</div>
          <div className="text-xs text-muted-foreground mt-2">{stats.totalPresent} present, {stats.totalAbsent} absent</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Time on task</div>
          <div className="text-3xl font-bold text-primary mt-2">{stats.totalMinutes}</div>
          <div className="text-xs text-muted-foreground mt-2">minutes recorded</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Attendance records</div>
          <div className="text-3xl font-bold text-primary mt-2">{stats.totalRecords}</div>
          <div className="text-xs text-muted-foreground mt-2">{stats.totalLate} marked late</div>
        </Card>
      </div>

      {/* Lesson Sessions */}
      <Card className="p-6">
        <h2 className="font-display text-xl text-foreground flex items-center gap-2 mb-4">
          <Clock3 className="h-5 w-5" /> Lesson sessions
        </h2>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No lesson sessions yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/40 transition-colors">
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{session.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {session.subject && <span>{session.subject} · </span>}
                    {new Date(session.scheduledAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={cn("text-xs font-medium", STATUS_COLORS[session.status])}>{session.status}</Badge>

                  <Select
                    value={session.status}
                    onValueChange={(newStatus) =>
                      updateSessionStatus(session.id, newStatus as SessionStatus)
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="ghost" size="sm" onClick={() => deleteSession(session.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Attendance Records */}
      <Card className="p-6">
        <h2 className="font-display text-xl text-foreground flex items-center gap-2 mb-4">
          <Users className="h-5 w-5" /> Attendance records
        </h2>

        {attendance.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No attendance records yet. Record attendance during a lesson session.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attendance.slice(0, 10).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/40 transition-colors">
                <div className="flex-1">
                  <div className="text-sm text-foreground">
                    {record.timestamp.toLocaleString()}
                    {record.duration && <span> · {record.duration} min</span>}
                  </div>
                  {record.notes && <div className="text-xs text-muted-foreground mt-1">{record.notes}</div>}
                </div>

                <Badge className={cn("text-xs font-medium", STATUS_COLORS[record.status])}>{record.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Alerts */}
      {stats.totalAbsent > 0 && (
        <Card className="p-6 border-destructive/20 bg-destructive/5">
          <h2 className="font-display text-xl text-foreground flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" /> Attendance alerts
          </h2>
          <div className="text-sm text-muted-foreground">
            You have <span className="font-semibold text-destructive">{stats.totalAbsent} absent</span> and{" "}
            <span className="font-semibold text-yellow-600">{stats.totalLate} late</span> records. Review them in your attendance history above.
          </div>
        </Card>
      )}
    </div>
  );
}
