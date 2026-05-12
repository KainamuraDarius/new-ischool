import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock3, MapPin, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventsService } from "@/services/firestoreService";
import { cn } from "@/lib/utils";

type EventType = "lesson" | "assignment" | "exam" | "meeting" | "other";
type CalendarView = "month" | "week" | "day";

interface Event {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: EventType;
  date: Date;
  time?: string;
  endTime?: string;
  allDay: boolean;
  location?: string;
  subject?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TYPE_STYLES: Record<EventType, string> = {
  lesson: "bg-primary/10 text-primary border-primary/20",
  assignment: "bg-accent/20 text-accent-foreground border-accent/30",
  exam: "bg-destructive/10 text-destructive border-destructive/25",
  meeting: "bg-secondary text-secondary-foreground border-border",
  other: "bg-muted text-muted-foreground border-border",
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function startOfWeek(date: Date) {
  const copy = startOfDay(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function endOfWeek(date: Date) {
  return addDays(startOfWeek(date), 7);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function toLocalInput(iso: string) {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function prettyTimeRange(event: Event) {
  if (event.allDay) return "All day";
  return `${event.time} - ${event.endTime || ""}`;
}

function viewLabel(view: CalendarView, cursor: Date) {
  if (view === "day") {
    return cursor.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }
  if (view === "week") {
    const start = startOfWeek(cursor);
    const end = addDays(start, 6);
    return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
  }
  return cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function fetchRange(view: CalendarView, cursor: Date) {
  if (view === "day") return { start: startOfDay(cursor), end: addDays(startOfDay(cursor), 1) };
  if (view === "week") return { start: startOfWeek(cursor), end: endOfWeek(cursor) };
  return { start: addDays(startOfWeek(startOfMonth(cursor)), -7), end: addDays(endOfWeek(endOfMonth(cursor)), 7) };
}

function moveCursor(cursor: Date, view: CalendarView, direction: -1 | 1) {
  if (view === "day") return addDays(cursor, direction);
  if (view === "week") return addDays(cursor, direction * 7);
  return addMonths(cursor, direction);
}

function hoursUntil(date: Date) {
  const diff = date.getTime() - Date.now();
  return diff / (1000 * 60 * 60);
}

function isUpcoming(event: Event) {
  const hours = hoursUntil(event.date);
  return hours >= 0 && hours <= 24;
}

export default function CalendarModule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Event> | null>(null);

  // Load events from Firestore
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        setLoading(true);
        const range = fetchRange(view, cursor);
        const allEvents = await eventsService.getByDateRange(user.uid, range.start, range.end);
        setEvents(allEvents as Event[]);
      } catch (error) {
        toast.error("Failed to load events");
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, view, cursor]);

  const monthGrid = useMemo(() => {
    const first = startOfMonth(cursor);
    const gridStart = startOfWeek(first);
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }, [cursor]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(cursor), index)), [cursor]);

  const eventsForDay = (date: Date) =>
    events
      .filter((event) => sameDay(event.date, date))
      .sort((left, right) => left.date.getTime() - right.date.getTime());

  const selectedEvents = eventsForDay(selectedDate);
  const upcomingEvents = useMemo(() => events.filter(isUpcoming), [events]);

  const openNew = (date?: Date) => {
    const base = date ?? selectedDate;
    setEditing({
      userId: user?.uid ?? "",
      title: "",
      description: "",
      type: "lesson",
      date: base,
      time: "09:00",
      endTime: "10:00",
      allDay: false,
      location: "",
      subject: "",
      color: "navy",
    });
    setOpen(true);
  };

  const openEdit = (event: Event) => {
    setEditing(event);
    setOpen(true);
  };

  const save = async () => {
    if (!editing || !user) return;

    const eventData = {
      userId: user.uid,
      title: editing.title || editing.subject || "Untitled event",
      description: editing.description,
      type: editing.type || ("lesson" as EventType),
      date: editing.date || new Date(),
      time: editing.time,
      endTime: editing.endTime,
      allDay: editing.allDay || false,
      location: editing.location,
      subject: editing.subject,
    };

    try {
      if (editing.id) {
        await eventsService.update(editing.id, eventData);
        setEvents((current) =>
          current.map((event) => (event.id === editing.id ? { ...event, ...eventData } : event))
        );
        toast.success("Event updated");
      } else {
        const eventId = await eventsService.create(eventData as any);
        if (eventId) {
          const newEvent: Event = {
            id: eventId,
            ...eventData,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setEvents((current) =>
            [...current, newEvent].sort((left, right) => left.date.getTime() - right.date.getTime())
          );
          toast.success("Event created");
        }
      }
      setOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error("Failed to save event");
      console.error(error);
    }
  };

  const remove = async () => {
    if (!editing?.id) return;

    try {
      await eventsService.delete(editing.id);
      setEvents((current) => current.filter((event) => event.id !== editing.id));
      setOpen(false);
      setEditing(null);
      toast.success("Event deleted");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground">iSchool Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Day, week, and month views for lessons, assignments, exams, meetings, and timetable-published sessions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCursor((current) => moveCursor(current, view, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[15rem] text-center font-display">{viewLabel(view, cursor)}</div>
          <Button variant="outline" size="icon" onClick={() => setCursor((current) => moveCursor(current, view, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const today = startOfDay(new Date());
              setCursor(today);
              setSelectedDate(today);
            }}
          >
            Today
          </Button>
          <Button onClick={() => openNew()}>
            <Plus className="h-4 w-4 mr-2" />
            New event
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Upcoming badges</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-3xl font-display text-primary">{upcomingEvents.length}</span>
            <Badge className="bg-accent text-accent-foreground">Next 24 hours</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">These are the events currently close enough to surface as push-style reminders.</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Total events</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-3xl font-display text-primary">
              {events.length}
            </span>
            <Badge variant="outline">Calendar</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">All your scheduled events across the calendar.</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Selected day</p>
          <div className="mt-3 text-2xl font-display text-primary">
            {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <p className="text-sm text-muted-foreground mt-2">{selectedEvents.length} scheduled item(s) in focus.</p>
        </Card>
      </section>

      <Tabs value={view} onValueChange={(value) => setView(value as CalendarView)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="day">Day</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          <Card className="p-4">
            {loading ? (
              <div className="min-h-[24rem] flex items-center justify-center text-muted-foreground">
                <Sparkles className="h-4 w-4 mr-2" />
                Loading events…
              </div>
            ) : view === "month" ? (
              <>
                <div className="grid grid-cols-7 text-xs font-medium text-muted-foreground mb-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="px-2 py-1">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthGrid.map((date) => {
                    const dayEvents = eventsForDay(date);
                    const inMonth = date.getMonth() === cursor.getMonth();
                    const isSelected = sameDay(date, selectedDate);
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => {
                          setSelectedDate(date);
                          setCursor(date);
                        }}
                        onDoubleClick={() => openNew(date)}
                        className={cn(
                          "min-h-[100px] rounded-xl border p-2 text-left transition-colors",
                          inMonth ? "bg-card" : "bg-muted/30",
                          isSelected ? "border-primary ring-2 ring-primary/20" : "border-border",
                        )}
                      >
                        <div className={cn(
                          "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-medium",
                          sameDay(date, new Date()) ? "bg-accent text-accent-foreground" : "text-foreground",
                        )}>
                          {date.getDate()}
                        </div>

                        <div className="mt-2 space-y-1">
                          {dayEvents.slice(0, 3).map((event) => (
                            <div key={event.id} className={cn("rounded-md border px-2 py-1 text-[11px] truncate", TYPE_STYLES[event.type])}>
                              {event.subject || event.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : view === "week" ? (
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {weekDays.map((date) => {
                  const dayEvents = eventsForDay(date);
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "rounded-2xl border p-4 text-left min-h-[28rem]",
                        sameDay(date, selectedDate) ? "border-primary ring-2 ring-primary/20" : "border-border",
                      )}
                    >
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{date.toLocaleDateString(undefined, { weekday: "short" })}</div>
                      <div className="text-lg font-display text-foreground mt-1">{date.getDate()}</div>
                      <div className="mt-4 space-y-2">
                        {dayEvents.length === 0 && <div className="text-sm text-muted-foreground">No events</div>}
                        {dayEvents.map((event) => (
                          <div key={event.id} className={cn("rounded-xl border px-3 py-2", TYPE_STYLES[event.type])}>
                            <div className="font-medium text-sm">{event.subject || event.title}</div>
                            <div className="text-xs mt-1 opacity-80">{prettyTimeRange(event)}</div>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEvents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    Nothing scheduled for this day yet.
                  </div>
                ) : (
                  selectedEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => openEdit(event)}
                      className={cn("w-full rounded-2xl border p-4 text-left transition-colors hover:bg-muted/40", TYPE_STYLES[event.type])}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{event.type}</Badge>
                        {isUpcoming(event) && <Badge className="bg-accent text-accent-foreground">Upcoming</Badge>}
                      </div>
                      <div className="font-display text-xl mt-3">{event.subject || event.title}</div>
                      <div className="text-sm mt-2 flex flex-wrap items-center gap-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" />{prettyTimeRange(event)}</span>
                        {event.location && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{event.location}</span>}
                      </div>
                      {event.description && <p className="text-sm text-foreground/80 mt-3">{event.description}</p>}
                    </button>
                  ))
                )}
              </div>
            )}
          </Card>

          <Card className="p-4 h-fit">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Agenda</div>
                <div className="font-display text-lg text-foreground mt-1">
                  {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => openNew(selectedDate)}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {selectedEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  No events here yet.
                </div>
              ) : (
                selectedEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => openEdit(event)}
                    className="w-full rounded-xl border border-border/70 bg-card px-4 py-3 text-left hover:bg-muted/40"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{event.type}</Badge>
                    </div>
                    <div className="font-medium text-foreground mt-2">{event.subject || event.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{prettyTimeRange(event)}</div>
                    {event.location && <div className="text-xs text-muted-foreground mt-1">{event.location}</div>}
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>
      </Tabs>

      <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Event details" : "New event"}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  value={editing.title || ""}
                  onChange={(event) => setEditing({ ...editing, title: event.target.value })}
                  placeholder="Science revision"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select
                    value={editing.type || "lesson"}
                    onValueChange={(value) => setEditing({ ...editing, type: value as EventType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lesson">Lesson</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>All day</Label>
                  <button
                    onClick={() => setEditing({ ...editing, allDay: !editing.allDay })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                      editing.allDay
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border hover:bg-muted/80"
                    )}
                  >
                    {editing.allDay ? "Yes" : "No"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Input
                    value={editing.subject || ""}
                    onChange={(event) => setEditing({ ...editing, subject: event.target.value })}
                    placeholder="Mathematics"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input
                    value={editing.location || ""}
                    onChange={(event) => setEditing({ ...editing, location: event.target.value })}
                    placeholder="Room 12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editing.date ? editing.date.toISOString().split('T')[0] : ""}
                    onChange={(event) => {
                      const newDate = new Date(event.target.value);
                      setEditing({ ...editing, date: newDate });
                    }}
                  />
                </div>
                {!editing.allDay && (
                  <div className="space-y-1.5">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={editing.time || "09:00"}
                      onChange={(event) => setEditing({ ...editing, time: event.target.value })}
                    />
                  </div>
                )}
              </div>

              {!editing.allDay && (
                <div className="space-y-1.5">
                  <Label>End time</Label>
                  <Input
                    type="time"
                    value={editing.endTime || "10:00"}
                    onChange={(event) => setEditing({ ...editing, endTime: event.target.value })}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={editing.description || ""}
                  onChange={(event) => setEditing({ ...editing, description: event.target.value })}
                  placeholder="Agenda, materials, links..."
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            {editing?.id ? (
              <Button variant="ghost" onClick={remove} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            ) : <span />}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
