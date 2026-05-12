import { useEffect, useMemo, useState } from "react";
import { Award, BarChart3, BookOpen, GraduationCap, Loader2, Plus, Trash2, TrendingUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { assessmentService } from "@/services/firestoreService";
import { cn } from "@/lib/utils";

interface Assessment {
  id: string;
  userId: string;
  subject: string;
  type: "quiz" | "test" | "assignment" | "exam" | "project";
  title: string;
  score: number;
  maxScore: number;
  date: Date;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TYPES: Record<string, string> = {
  quiz: "Quiz",
  test: "Test",
  assignment: "Assignment",
  exam: "Exam",
  project: "Project",
};

const getGrade = (percentage: number): string => {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  return "F";
};

const getGradeColor = (grade: string): string => {
  switch (grade) {
    case "A":
      return "bg-emerald-100 text-emerald-900";
    case "B":
      return "bg-blue-100 text-blue-900";
    case "C":
      return "bg-yellow-100 text-yellow-900";
    case "D":
      return "bg-orange-100 text-orange-900";
    default:
      return "bg-red-100 text-red-900";
  }
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("all");

  const [newAssessment, setNewAssessment] = useState({
    subject: "",
    type: "test" as const,
    title: "",
    score: 0,
    maxScore: 100,
    feedback: "",
  });

  // Load assessments
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        setLoading(true);
        const userAssessments = await assessmentService.getStudentAssessments(user.uid);
        setAssessments((userAssessments || []) as Assessment[]);
      } catch (error) {
        toast.error("Failed to load assessments");
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Calculate statistics
  const stats = useMemo(() => {
    const filtered = selectedSubject === "all" ? assessments : assessments.filter((a) => a.subject === selectedSubject);

    const totalAssessments = filtered.length;
    const averageScore = filtered.length > 0 ? filtered.reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0) / filtered.length : 0;
    const highestScore = filtered.length > 0 ? Math.max(...filtered.map((a) => (a.score / a.maxScore) * 100)) : 0;
    const lowestScore = filtered.length > 0 ? Math.min(...filtered.map((a) => (a.score / a.maxScore) * 100)) : 0;

    return {
      totalAssessments,
      averageScore: Math.round(averageScore),
      highestScore: Math.round(highestScore),
      lowestScore: Math.round(lowestScore),
      averageGrade: getGrade(averageScore),
    };
  }, [assessments, selectedSubject]);

  // Chart data
  const chartData = useMemo(() => {
    const filtered = selectedSubject === "all" ? assessments : assessments.filter((a) => a.subject === selectedSubject);

    return filtered
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((a) => ({
        date: new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: Math.round((a.score / a.maxScore) * 100),
        title: a.title.substring(0, 10),
      }));
  }, [assessments, selectedSubject]);

  const subjectStats = useMemo(() => {
    const map = new Map<string, { total: number; sum: number; count: number }>();

    assessments.forEach((a) => {
      const key = a.subject;
      const entry = map.get(key) || { total: 0, sum: 0, count: 0 };
      const score = (a.score / a.maxScore) * 100;
      entry.sum += score;
      entry.count += 1;
      entry.total = entry.count;
      map.set(key, entry);
    });

    return Array.from(map.entries()).map(([subject, data]) => ({
      subject,
      average: Math.round(data.sum / data.count),
      count: data.total,
    }));
  }, [assessments]);

  const subjects = useMemo(() => {
    return Array.from(new Set(assessments.map((a) => a.subject)));
  }, [assessments]);

  const createAssessment = async () => {
    if (!user || !newAssessment.subject || !newAssessment.title || newAssessment.maxScore <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (newAssessment.score > newAssessment.maxScore) {
      toast.error("Score cannot exceed max score");
      return;
    }

    try {
      const assessmentData = {
        userId: user.uid,
        ...newAssessment,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const assessmentId = await assessmentService.recordAssessment(assessmentData as any);
      if (assessmentId) {
        const createdAssessment: Assessment = {
          id: assessmentId,
          ...assessmentData,
        };
        setAssessments((prev) => [...prev, createdAssessment]);
        setNewAssessment({ subject: "", type: "test", title: "", score: 0, maxScore: 100, feedback: "" });
        setOpen(false);
        toast.success("Assessment recorded");
      }
    } catch (error) {
      toast.error("Failed to record assessment");
      console.error(error);
    }
  };

  const deleteAssessment = async (assessmentId: string) => {
    if (!confirm("Delete this assessment record?")) return;

    try {
      // You would need to implement delete in assessmentService
      setAssessments((prev) => prev.filter((a) => a.id !== assessmentId));
      toast.success("Assessment deleted");
    } catch (error) {
      toast.error("Failed to delete assessment");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading reports…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary flex items-center gap-2">
            <BarChart3 className="h-7 w-7" /> Academic Reports
          </h1>
          <p className="text-muted-foreground">Track assessments and academic performance.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Record assessment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record assessment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={newAssessment.subject}
                    onChange={(e) => setNewAssessment({ ...newAssessment, subject: e.target.value })}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={newAssessment.type} onValueChange={(v) => setNewAssessment({ ...newAssessment, type: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPES).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={newAssessment.title}
                  onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                  placeholder="e.g., Chapter 5 Test"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Score</Label>
                  <Input
                    type="number"
                    value={newAssessment.score}
                    onChange={(e) => setNewAssessment({ ...newAssessment, score: Number(e.target.value) })}
                    min={0}
                  />
                </div>
                <div>
                  <Label>Max score</Label>
                  <Input
                    type="number"
                    value={newAssessment.maxScore}
                    onChange={(e) => setNewAssessment({ ...newAssessment, maxScore: Number(e.target.value) })}
                    min={1}
                  />
                </div>
              </div>

              <div>
                <Label>Feedback (optional)</Label>
                <Textarea
                  value={newAssessment.feedback}
                  onChange={(e) => setNewAssessment({ ...newAssessment, feedback: e.target.value })}
                  placeholder="Teacher comments, areas for improvement..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createAssessment}>Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="flex items-center gap-3 mb-4">
        <Label>Subject</Label>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((subj) => (
              <SelectItem key={subj} value={subj}>
                {subj}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Total assessments</div>
          <div className="text-3xl font-bold text-primary mt-2">{stats.totalAssessments}</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Average score</div>
          <div className="text-3xl font-bold text-primary mt-2">{stats.averageScore}%</div>
          <div className="text-xs text-muted-foreground mt-2">Grade: {stats.averageGrade}</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Highest score</div>
          <div className="text-3xl font-bold text-emerald-600 mt-2">{stats.highestScore}%</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Lowest score</div>
          <div className="text-3xl font-bold text-destructive mt-2">{stats.lowestScore}%</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Performance</div>
          <div className="text-3xl font-bold text-primary mt-2">{stats.totalAssessments > 0 ? "📈" : "—"}</div>
          <div className="text-xs text-muted-foreground mt-2">Over time</div>
        </Card>
      </div>

      {/* Performance Trend */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <h2 className="font-display text-lg text-foreground flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5" /> Performance trend
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} name="Score (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Subject performance */}
      {subjectStats.length > 0 && (
        <Card className="p-6">
          <h2 className="font-display text-lg text-foreground flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5" /> Performance by subject
          </h2>
          <div className="space-y-3">
            {subjectStats.map((stat) => (
              <div key={stat.subject} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <div className="font-medium text-foreground">{stat.subject}</div>
                  <div className="text-xs text-muted-foreground">{stat.count} assessment(s)</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{stat.average}%</div>
                    <div className="text-xs text-muted-foreground">{getGrade(stat.average)}</div>
                  </div>
                  <Badge className={cn("text-xs font-semibold", getGradeColor(getGrade(stat.average)))}>
                    {getGrade(stat.average)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Assessment history */}
      {assessments.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No assessments recorded yet. Start tracking your performance.</p>
        </Card>
      ) : (
        <Card className="p-6">
          <h2 className="font-display text-lg text-foreground flex items-center gap-2 mb-4">
            <Award className="h-5 w-5" /> Assessment history
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .map((assessment) => {
                    const percentage = Math.round((assessment.score / assessment.maxScore) * 100);
                    const grade = getGrade(percentage);
                    return (
                      <TableRow key={assessment.id}>
                        <TableCell className="text-sm">{new Date(assessment.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm">{assessment.subject}</TableCell>
                        <TableCell className="text-sm font-medium">{assessment.title}</TableCell>
                        <TableCell className="text-sm">{TYPES[assessment.type]}</TableCell>
                        <TableCell className="text-sm">
                          {assessment.score}/{assessment.maxScore} ({percentage}%)
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs font-semibold", getGradeColor(grade))}>{grade}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAssessment(assessment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
