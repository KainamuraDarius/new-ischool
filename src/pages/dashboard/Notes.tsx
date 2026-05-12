import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpenCheck, Loader2, NotebookPen, Pin, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LearningNoteEditor from "@/components/LearningNoteEditor";
import { notesService } from "@/services/firestoreService";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  color?: string;
  isPinned: boolean;
  createdAt: any;
  updatedAt: any;
  subject?: string;
  topic?: string;
}

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
        setNotes(fetchedNotes as Note[]);
        if (fetchedNotes.length > 0) {
          setActiveId(fetchedNotes[0].id);
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
        color: "yellow",
      });
      
      if (noteId) {
        const newNote: Note = {
          id: noteId,
          userId: user.uid,
          title: "Untitled note",
          content: "",
          color: "yellow",
          isPinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
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
    setNotes((current) => current.map((note) => (note.id === id ? { ...note, ...partial } : note)));
    
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
      setNotes((current) => current.map((note) => (note.id === active.id ? { ...note, color } : note)));
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
          .map((note) => (note.id === active.id ? { ...note, isPinned: next } : note))
          .sort((a, b) => {
            if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
            return b.updatedAt.localeCompare(a.updatedAt);
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
