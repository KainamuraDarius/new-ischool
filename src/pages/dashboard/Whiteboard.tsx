import { useEffect, useRef, useState } from "react";
import { Eraser, Download, Loader2, Plus, Save, Trash2, Pencil, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { whiteboardService } from "@/services/firestoreService";

interface DrawElement {
  type: "stroke" | "eraser" | "line" | "shape";
  color: string;
  size: number;
  points: { x: number; y: number }[];
  timestamp: Date;
}

interface WhiteboardSession {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  elements: DrawElement[];
  participants: string[];
  isActive: boolean;
}

const COLORS = ["#000000", "#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"];
const SIZES = [2, 4, 8, 12, 16];

export default function WhiteboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<WhiteboardSession[]>([]);
  const [activeSession, setActiveSession] = useState<WhiteboardSession | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(4);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [open, setOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentStroke = useRef<DrawElement | null>(null);
  const elements = useRef<DrawElement[]>([]);

  // Load sessions
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        setLoading(true);
        const userSessions = await whiteboardService.getSessions?.(user.uid);
        setSessions((userSessions || []) as WhiteboardSession[]);
      } catch (error) {
        toast.error("Failed to load whiteboard sessions");
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Load active session elements
  useEffect(() => {
    if (!activeSession) return;
    elements.current = activeSession.elements || [];
    redraw();
  }, [activeSession]);

  const getCanvasPosition = (e: React.PointerEvent): { x: number; y: number } | null => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvasRef.current.width,
      y: ((e.clientY - rect.top) / rect.height) * canvasRef.current.height,
    };
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#fdfaf3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all elements
    elements.current.forEach((element) => {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (element.points.length === 0) return;

      ctx.beginPath();
      ctx.moveTo(element.points[0].x, element.points[0].y);
      element.points.forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.stroke();
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!activeSession || !canvasRef.current) return;

    const pos = getCanvasPosition(e);
    if (!pos) return;

    isDrawing.current = true;
    const eraserMode = tool === "eraser";

    currentStroke.current = {
      type: tool === "eraser" ? "eraser" : "stroke",
      color: eraserMode ? "#fdfaf3" : color,
      size: eraserMode ? size * 3 : size,
      points: [pos],
      timestamp: new Date(),
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !currentStroke.current) return;

    const pos = getCanvasPosition(e);
    if (!pos) return;

    currentStroke.current.points.push(pos);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = currentStroke.current.points;
    if (points.length < 2) return;

    ctx.strokeStyle = currentStroke.current.color;
    ctx.lineWidth = currentStroke.current.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    if (!currentStroke.current) return;
    if (currentStroke.current.points.length > 0) {
      elements.current.push(currentStroke.current);
    }
    currentStroke.current = null;
    isDrawing.current = false;
  };

  const createSession = async () => {
    if (!user || !newSessionTitle.trim()) {
      toast.error("Please enter a session title");
      return;
    }

    try {
      const sessionData = {
        userId: user.uid,
        title: newSessionTitle,
        createdAt: new Date(),
        updatedAt: new Date(),
        elements: [],
        participants: [user.uid],
        isActive: true,
      };

      const sessionId = await whiteboardService.createSession(sessionData as any);
      if (sessionId) {
        const newSession: WhiteboardSession = {
          id: sessionId,
          ...sessionData,
        };
        setSessions((prev) => [newSession, ...prev]);
        setActiveSession(newSession);
        setNewSessionTitle("");
        setOpen(false);
        toast.success("Whiteboard session created");
      }
    } catch (error) {
      toast.error("Failed to create session");
      console.error(error);
    }
  };

  const saveSession = async () => {
    if (!activeSession || !user) return;

    try {
      const updatedSession: WhiteboardSession = {
        ...activeSession,
        elements: elements.current,
        updatedAt: new Date(),
      };

      await whiteboardService.updateSession(activeSession.id, updatedSession as any);
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSession.id ? updatedSession : s))
      );
      setActiveSession(updatedSession);
      toast.success("Whiteboard saved");
    } catch (error) {
      toast.error("Failed to save whiteboard");
      console.error(error);
    }
  };

  const clearBoard = () => {
    if (!activeSession) return;
    if (confirm("Clear all drawings? This cannot be undone.")) {
      elements.current = [];
      redraw();
    }
  };

  const downloadBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `whiteboard-${activeSession?.title || "untitled"}-${Date.now()}.png`;
    link.click();
    toast.success("Whiteboard downloaded");
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm("Delete this whiteboard session?")) return;

    try {
      await whiteboardService.endSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
      }
      toast.success("Session deleted");
    } catch (error) {
      toast.error("Failed to delete session");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading whiteboard…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">iSchool Whiteboard</h1>
          <p className="text-muted-foreground">Collaborative drawing for live lessons and presentations.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create whiteboard session</DialogTitle>
            </DialogHeader>
            <div>
              <Input
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
                placeholder="e.g., Chemistry Lab Session"
                onKeyDown={(e) => {
                  if (e.key === "Enter") createSession();
                }}
              />
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

      {activeSession ? (
        <div className="space-y-4">
          {/* Canvas Area */}
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-display text-lg text-foreground">{activeSession.title}</h2>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    {activeSession.participants.length} participant{activeSession.participants.length !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={saveSession}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadBoard}>
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearBoard} className="text-destructive hover:text-destructive">
                    <Eraser className="h-4 w-4 mr-1" /> Clear
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setActiveSession(null)}>
                    Close
                  </Button>
                </div>
              </div>

              {/* Drawing Tools */}
              <div className="flex flex-wrap items-center gap-3 p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={tool === "pen" ? "default" : "outline"}
                    onClick={() => setTool("pen")}
                    className="h-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={tool === "eraser" ? "default" : "outline"}
                    onClick={() => setTool("eraser")}
                    className="h-8"
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                </div>

                <div className="w-px h-6 bg-border" />

                {/* Colors */}
                <div className="flex items-center gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded border-2 transition-all ${
                        color === c ? "border-primary scale-110" : "border-border hover:border-primary"
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>

                {/* Sizes */}
                <div className="flex items-center gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`w-7 h-7 rounded border transition-all ${
                        size === s ? "border-primary bg-primary/20" : "border-border hover:border-primary"
                      }`}
                    >
                      <div
                        className="rounded-full mx-auto"
                        style={{
                          backgroundColor: color,
                          width: `${Math.max(s - 2, 1)}px`,
                          height: `${Math.max(s - 2, 1)}px`,
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Canvas */}
              <canvas
                ref={canvasRef}
                width={1200}
                height={600}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="w-full border border-border rounded-lg bg-[#fdfaf3] cursor-crosshair touch-none"
              />
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No whiteboard sessions yet. Create one to start drawing.</p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Create session
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create whiteboard session</DialogTitle>
                  </DialogHeader>
                  <div>
                    <Input
                      value={newSessionTitle}
                      onChange={(e) => setNewSessionTitle(e.target.value)}
                      placeholder="e.g., Chemistry Lab Session"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") createSession();
                      }}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createSession}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => (
                <Card
                  key={session.id}
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow group"
                  onClick={() => setActiveSession(session)}
                >
                  <div className="space-y-3">
                    <div className="h-24 bg-secondary rounded border border-border relative overflow-hidden">
                      {/* Placeholder thumbnail */}
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        {session.elements?.length || 0} elements
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {session.title}
                      </h3>
                      <div className="text-xs text-muted-foreground mt-1">
                        Created {new Date(session.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {session.participants.length}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
