import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, NotebookPen, Pin, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import LearningNoteEditor from "@/components/LearningNoteEditor";
import { notesService } from "@/services/firestoreService";
import {
  calculateExerciseScore,
  parseAnnotationMarks,
  parseAnswerSpaces,
  parseAutoTags,
  parseExercises,
  parseMediaEmbeds,
  type LearningNote,
} from "@/lib/ischool";
import { cn } from "@/lib/utils";

type FirestoreTimestampLike = {
  seconds?: number;
  toDate?: () => Date;
};

interface Note extends LearningNote {
  id: string;
  userId: string;
  user_id?: string;
  isPinned: boolean;
  pinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
  created_at?: Date;
  updated_at?: Date;
  subject?: string;
  topic?: string;
  note_date?: string;
  exercise_score: number;
}

const LEGACY_COLOR_MAP: Record<string, string> = {
  yellow: "gold",
  blue: "navy",
  green: "sage",
  pink: "rose",
  purple: "rose",
};

const toDateValue = (value: unknown, fallback = new Date()): Date => {
  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === "object") {
    const timestamp = value as FirestoreTimestampLike;
    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }

    if (typeof timestamp.seconds === "number") {
      return new Date(timestamp.seconds * 1000);
    }
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback;
};

const normalizeColor = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) {
    return "cream";
  }

  return LEGACY_COLOR_MAP[value] ?? value;
};

const normalizeNote = (note: Partial<Note> & Record<string, unknown>): Note => {
  const autoTags = parseAutoTags(note.auto_tags);
  const exercises = parseExercises(note.exercises);
  const createdAt = toDateValue(note.createdAt ?? note.created_at);
  const updatedAt = toDateValue(note.updatedAt ?? note.updated_at, createdAt);
  const isPinned = Boolean(note.isPinned ?? note.pinned);
  const subject =
    typeof note.subject === "string" && note.subject.trim()
      ? note.subject
      : autoTags.subject;
  const topic =
    typeof note.topic === "string" && note.topic.trim()
      ? note.topic
      : autoTags.lesson;

  return {
    id: typeof note.id === "string" ? note.id : "",
    userId:
      typeof note.userId === "string"
        ? note.userId
        : typeof note.user_id === "string"
          ? note.user_id
          : "",
    user_id:
      typeof note.user_id === "string"
        ? note.user_id
        : typeof note.userId === "string"
          ? note.userId
          : undefined,
    title:
      typeof note.title === "string" && note.title.trim()
        ? note.title
        : "Untitled note",
    content: typeof note.content === "string" ? note.content : "",
    color: normalizeColor(note.color),
    isPinned,
    pinned: isPinned,
    createdAt,
    updatedAt,
    created_at: createdAt,
    updated_at: updatedAt,
    subject,
    topic,
    note_date:
      typeof note.note_date === "string" && note.note_date.trim()
        ? note.note_date
        : autoTags.date,
    annotation_marks: parseAnnotationMarks(note.annotation_marks),
    answer_spaces: parseAnswerSpaces(note.answer_spaces),
    auto_tags: {
      ...autoTags,
      subject: subject ?? autoTags.subject,
      lesson: topic ?? autoTags.lesson,
    },
    media_embeds: parseMediaEmbeds(note.media_embeds),
    exercises,
    exercise_score:
      typeof note.exercise_score === "number"
        ? note.exercise_score
        : calculateExerciseScore(exercises),
  };
};

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<number | null>(null);

  // Load notes from Firestore
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        setLoading(true);
        const fetchedNotes = await notesService.getAll(user.uid);
        const normalizedNotes = fetchedNotes.map((note) =>
          normalizeNote(note as Partial<Note> & Record<string, unknown>)
        );
        setNotes(normalizedNotes);
        if (normalizedNotes.length > 0) {
          setActiveId(normalizedNotes[0].id);
        }
      } catch (error) {
        toast.error("Failed to load notes");
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const active = useMemo(() => notes.find((note) => note.id === activeId) ?? null, [activeId, notes]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return notes;
    return notes.filter((note) =>
      [note.title, note.content, note.subject ?? ""].some((value) => value.toLowerCase().includes(search))
    );
  }, [notes, query]);

  const createNote = async () => {
    if (!user) return;
    try {
      const noteId = await notesService.create({
        userId: user.uid,
        title: "Untitled note",
        content: "",
        color: "gold",
      });
      
      if (noteId) {
        const newNote = normalizeNote({
          id: noteId,
          userId: user.uid,
          title: "Untitled note",
          content: "",
          color: "gold",
          isPinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          annotation_marks: [],
          answer_spaces: [],
          auto_tags: {},
          media_embeds: [],
          exercises: [],
          exercise_score: 0,
        });
        setNotes((current) => [newNote, ...current]);
        setActiveId(noteId);
        toast.success("Note created");
      }
    } catch (error) {
      toast.error("Failed to create note");
      console.error(error);
    }
  };

  const scheduleSave = (id: string, partial: Partial<Note>) => {
    // Update local state immediately
    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? normalizeNote({
              ...note,
              ...partial,
              updatedAt: new Date(),
            })
          : note
      )
    );
    
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = window.setTimeout(async () => {
      try {
        await notesService.update(id, partial);
        setSaving(false);
      } catch (error) {
        setSaving(false);
        toast.error("Failed to save note");
      }
    }, 450);
  };

  const setColor = async (color: string) => {
    if (!active) return;
    try {
      await notesService.update(active.id, { color });
      setNotes((current) =>
        current.map((note) =>
          note.id === active.id
            ? normalizeNote({ ...note, color, updatedAt: new Date() })
            : note
        )
      );
    } catch (error) {
      toast.error("Failed to update note color");
    }
  };

  const togglePin = async () => {
    if (!active) return;
    try {
      const next = !active.isPinned;
      await notesService.toggle(active.id, next);
      setNotes((current) => 
        [...current]
          .map((note) =>
            note.id === active.id
              ? normalizeNote({
                  ...note,
                  isPinned: next,
                  pinned: next,
                  updatedAt: new Date(),
                })
              : note
          )
          .sort((a, b) => {
            if (a.isPinned !== b.isPinned) return Number(b.isPinned) - Number(a.isPinned);
            return b.updatedAt.getTime() - a.updatedAt.getTime();
          })
      );
      toast.success(next ? "Note pinned" : "Note unpinned");
    } catch (error) {
      toast.error("Failed to update pin status");
    }
  };

  const remove = async () => {
    if (!active) return;
    try {
      await notesService.delete(active.id);
      const remaining = notes.filter((note) => note.id !== active.id);
      setNotes(remaining);
      setActiveId((current) => (current === active.id ? remaining[0]?.id ?? null : current));
      toast.success("Note deleted");
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading iSchool Notes…
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-9rem)] flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-foreground flex items-center gap-2">
            <NotebookPen className="h-6 w-6 text-primary" />
            iSchool Notes
          </h1>
          <p className="text-sm text-muted-foreground">Learner workspace with auto-tagged lesson notes, practice, highlights, and progress tracking.</p>
        </div>
        <Button onClick={createNote}>
          <Plus className="h-4 w-4 mr-2" />
          New note
        </Button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[330px_1fr] gap-4 flex-1 min-h-0">
        <aside className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes…" className="pl-9" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {notes.length === 0 ? "No notes yet. Create your first lesson note." : "No notes matched your search."}
              </div>
            ) : (
              <ul>
                {filtered.map((note) => (
                  <li key={note.id}>
                    <button
                      onClick={() => setActiveId(note.id)}
                      className={cn(
                        "w-full text-left px-4 py-4 border-b border-border/60 transition-colors hover:bg-muted/40",
                        activeId === note.id && "bg-secondary/60",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">{note.title || "Untitled note"}</span>
                        {note.isPinned && <Pin className="h-3.5 w-3.5 text-accent ml-auto" />}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {note.subject && <Badge variant="outline">{note.subject}</Badge>}
                        {note.topic && <Badge variant="outline">{note.topic}</Badge>}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2">{new Date(note.updatedAt).toLocaleString()}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <div className="min-h-0 flex flex-col gap-4">
          {active && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_240px_180px] gap-4 items-end">
                <div className="flex-1 min-h-0">
                  <LearningNoteEditor
                    note={active}
                    saving={saving}
                    onUpdate={(partial) => active && scheduleSave(active.id, partial)}
                    onTogglePin={togglePin}
                    onDelete={remove}
                    onSetColor={setColor}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
