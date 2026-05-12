import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Clock, AlertTriangle, Loader2, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { timetableService } from "@/services/firestoreService";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  userId: string;
  title: string;
  subject: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  room?: string;
  teacher?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 12 }, (_, i) => `${7 + i}:00`);
const COLORS = ["#e63946", "#f1faee", "#a8dadc", "#457b9d", "#1d3557", "#c4a570"];

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
};

const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

export default function TimetablesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [open, setOpen] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "",
    subject: "",
    dayOfWeek: 0,
    startTime: "08:00",
    endTime: "09:00",
    room: "",
    teacher: "",
    color: COLORS[0],
  });

  // Load lessons
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        setLoading(true);
        const userLessons = await timetableService.getTeacherLessons(user.uid);
        setLessons((userLessons || []) as Lesson[]);
      } catch (error) {
        toast.error("Failed to load timetable");
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Detect scheduling conflicts
  const conflicts = useMemo(() => {
    const conflictIds = new Set<string>();
    const lessonsByDay: Record<number, Lesson[]> = {};

    DAYS.forEach((_, i) => {
      lessonsByDay[i] = [];
    });

    lessons.forEach((lesson) => {
      lessonsByDay[lesson.dayOfWeek]?.push(lesson);
    });

    Object.values(lessonsByDay).forEach((dayLessons) => {
      for (let i = 0; i < dayLessons.length; i++) {
        for (let j = i + 1; j < dayLessons.length; j++) {
          const a = dayLessons[i];
          const b = dayLessons[j];
          const aStart = timeToMinutes(a.startTime);
          const aEnd = timeToMinutes(a.endTime);
          const bStart = timeToMinutes(b.startTime);
          const bEnd = timeToMinutes(b.endTime);

          // Check if times overlap
          if (aStart < bEnd && bStart < aEnd) {
            conflictIds.add(a.id);
            conflictIds.add(b.id);
          }
        }
      }
    });

    return conflictIds;
  }, [lessons]);

  const lessonsByDay = useMemo(() => {
    const map: Record<number, Lesson[]> = {};
    DAYS.forEach((_, i) => {
      map[i] = lessons.filter((l) => l.dayOfWeek === i).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    });
    return map;
  }, [lessons]);

  const createLesson = async () => {
    if (!user || !newLesson.title || !newLesson.subject) {
      toast.error("Please fill in required fields");
      return;
    }

    // Validate times
    if (timeToMinutes(newLesson.startTime) >= timeToMinutes(newLesson.endTime)) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      const lessonData = {
        userId: user.uid,
        ...newLesson,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const lessonId = await timetableService.createLesson(lessonData as any);
      if (lessonId) {
        const createdLesson: Lesson = {
          id: lessonId,
          ...lessonData,
        };
        setLessons((prev) => [...prev, createdLesson]);
        setNewLesson({
          title: "",
          subject: "",
          dayOfWeek: 0,
          startTime: "08:00",
          endTime: "09:00",
          room: "",
          teacher: "",
          color: COLORS[0],
        });
        setOpen(false);
        toast.success("Lesson created");
      }
    } catch (error) {
      toast.error("Failed to create lesson");
      console.error(error);
    }
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;

    try {
      await timetableService.deleteLesson(lessonId);
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      toast.success("Lesson deleted");
    } catch (error) {
      toast.error("Failed to delete lesson");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading timetable…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary flex items-center gap-2">
            <CalendarPlus className="h-7 w-7" /> Timetables
          </h1>
          <p className="text-muted-foreground">Manage your weekly lesson schedule.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New lesson
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule a lesson</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                    placeholder="e.g., Algebra"
                  />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={newLesson.subject}
                    onChange={(e) => setNewLesson({ ...newLesson, subject: e.target.value })}
                    placeholder="e.g., Mathematics"
                  />
                </div>
              </div>

              <div>
                <Label>Day of week</Label>
                <Select value={newLesson.dayOfWeek.toString()} onValueChange={(v) => setNewLesson({ ...newLesson, dayOfWeek: parseInt(v) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start time</Label>
                  <Input
                    type="time"
                    value={newLesson.startTime}
                    onChange={(e) => setNewLesson({ ...newLesson, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End time</Label>
                  <Input
                    type="time"
                    value={newLesson.endTime}
                    onChange={(e) => setNewLesson({ ...newLesson, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Room (optional)</Label>
                  <Input
                    value={newLesson.room}
                    onChange={(e) => setNewLesson({ ...newLesson, room: e.target.value })}
                    placeholder="e.g., Room 12"
                  />
                </div>
                <div>
                  <Label>Teacher (optional)</Label>
                  <Input
                    value={newLesson.teacher}
                    onChange={(e) => setNewLesson({ ...newLesson, teacher: e.target.value })}
                    placeholder="e.g., Mr. Smith"
                  />
                </div>
              </div>

              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewLesson({ ...newLesson, color: c })}
                      className={cn(
                        "w-8 h-8 rounded border-2 transition-all",
                        newLesson.color === c ? "border-foreground scale-110" : "border-border"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createLesson}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Conflict Alert */}
      {conflicts.size > 0 && (
        <Card className="p-4 border-destructive/20 bg-destructive/5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive">Scheduling conflicts detected</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {conflicts.size} lesson{conflicts.size !== 1 ? "s" : ""} overlap with other lessons. Please adjust the times.
            </p>
          </div>
        </Card>
      )}

      {/* Timetable Grid */}
      {lessons.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No lessons scheduled yet. Create your first lesson to get started.</p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Create lesson
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule a lesson</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newLesson.title}
                      onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                      placeholder="e.g., Algebra"
                    />
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Input
                      value={newLesson.subject}
                      onChange={(e) => setNewLesson({ ...newLesson, subject: e.target.value })}
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                </div>

                <div>
                  <Label>Day of week</Label>
                  <Select value={newLesson.dayOfWeek.toString()} onValueChange={(v) => setNewLesson({ ...newLesson, dayOfWeek: parseInt(v) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start time</Label>
                    <Input
                      type="time"
                      value={newLesson.startTime}
                      onChange={(e) => setNewLesson({ ...newLesson, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End time</Label>
                    <Input
                      type="time"
                      value={newLesson.endTime}
                      onChange={(e) => setNewLesson({ ...newLesson, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Room (optional)</Label>
                    <Input
                      value={newLesson.room}
                      onChange={(e) => setNewLesson({ ...newLesson, room: e.target.value })}
                      placeholder="e.g., Room 12"
                    />
                  </div>
                  <div>
                    <Label>Teacher (optional)</Label>
                    <Input
                      value={newLesson.teacher}
                      onChange={(e) => setNewLesson({ ...newLesson, teacher: e.target.value })}
                      placeholder="e.g., Mr. Smith"
                    />
                  </div>
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setNewLesson({ ...newLesson, color: c })}
                        className={cn(
                          "w-8 h-8 rounded border-2 transition-all",
                          newLesson.color === c ? "border-foreground scale-110" : "border-border"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createLesson}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Time</th>
                  {DAYS.map((day) => (
                    <th key={day} className="text-left px-4 py-3 font-semibold text-foreground">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-2 font-mono text-sm text-muted-foreground">{hour}</td>
                    {DAYS.map((_, dayIdx) => {
                      const dayLessons = lessonsByDay[dayIdx];
                      const hourStart = timeToMinutes(hour);
                      const hourEnd = hourStart + 60;
                      const matchingLessons = dayLessons.filter((l) => {
                        const lStart = timeToMinutes(l.startTime);
                        const lEnd = timeToMinutes(l.endTime);
                        return lStart < hourEnd && lEnd > hourStart;
                      });

                      return (
                        <td key={`${dayIdx}-${hour}`} className="px-2 py-2">
                          {matchingLessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={cn(
                                "rounded-lg p-2 mb-1 text-xs font-medium text-white cursor-pointer hover:shadow-md transition-shadow group relative",
                                conflicts.has(lesson.id) && "ring-2 ring-destructive"
                              )}
                              style={{ backgroundColor: lesson.color }}
                            >
                              <div>{lesson.title}</div>
                              <div className="opacity-75">{lesson.startTime}</div>
                              {lesson.room && <div className="opacity-75">{lesson.room}</div>}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteLesson(lesson.id)}
                                className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
