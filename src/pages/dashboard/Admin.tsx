import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShieldCheck,
  Users,
  BookOpen,
  Activity,
  GraduationCap,
  TrendingUp,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { db } from "@/integrations/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: "admin" | "teacher" | "student";
  createdAt: Date;
}

interface Stats {
  totalUsers: number;
  totalLessons: number;
  totalAssessments: number;
  averageScore: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalLessons: 0,
    totalAssessments: 0,
    averageScore: 0,
  });
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        // Check if user is admin by checking their profile
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDocs(
          query(collection(db, "users"), where("uid", "==", user.uid))
        );

        let isUserAdmin = false;
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          isUserAdmin = userData.role === "admin";
        }

        setIsAdmin(isUserAdmin);
        if (!isUserAdmin) {
          setLoading(false);
          return;
        }

        await loadAll();
      } catch (error) {
        console.error("Failed to check admin status:", error);
        setIsAdmin(false);
        setLoading(false);
      }
    })();
  }, [user]);

  const loadAll = async () => {
    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList: UserProfile[] = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        email: doc.data().email || "",
        displayName: doc.data().displayName,
        role: doc.data().role || "student",
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      setUsers(usersList);

      // Get stats
      const lessonsSnapshot = await getDocs(collection(db, "lessons"));
      const assessmentsSnapshot = await getDocs(collection(db, "assessments"));

      let totalScore = 0;
      let scoreCount = 0;
      assessmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.score !== undefined && data.maxScore) {
          totalScore += (data.score / data.maxScore) * 100;
          scoreCount++;
        }
      });

      setStats({
        totalUsers: usersList.length,
        totalLessons: lessonsSnapshot.size,
        totalAssessments: assessmentsSnapshot.size,
        averageScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
      });

      setLoading(false);
    } catch (error) {
      console.error("Failed to load stats:", error);
      toast.error("Failed to load admin data");
      setLoading(false);
    }
  };

  const toggleRole = async (uid: string, newRole: "admin" | "teacher" | "student") => {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
      );
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      toast.error("Failed to update user role");
      console.error(error);
    }
  };

  const promoteSelfToAdmin = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          role: "admin",
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date(),
        },
        { merge: true }
      );
      toast.success("You are now an admin. Reloading…");
      setTimeout(() => location.reload(), 600);
    } catch (error) {
      toast.error("Failed to promote to admin");
      console.error(error);
    }
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) =>
        (u.displayName ?? "").toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.uid.includes(s)
    );
  }, [users, q]);

  if (isAdmin === null || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="p-8 text-center space-y-4">
          <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground" />
          <h1 className="font-display text-2xl">Admin access required</h1>
          <p className="text-sm text-muted-foreground">
            This area is restricted to school administrators. If you're the
            school owner setting up iSchoolVerse, you can claim the first admin
            role for your account below.
          </p>
          <Button onClick={promoteSelfToAdmin}>Make me an admin</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-foreground flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          iSchoolVerse Admin
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage users, roles, and monitor school-wide statistics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold text-foreground">
                {stats.totalUsers}
              </p>
            </div>
            <Users className="h-8 w-8 text-primary/40" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Lessons</p>
              <p className="text-3xl font-bold text-foreground">
                {stats.totalLessons}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-primary/40" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Assessments</p>
              <p className="text-3xl font-bold text-foreground">
                {stats.totalAssessments}
              </p>
            </div>
            <Activity className="h-8 w-8 text-primary/40" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Score</p>
              <p className="text-3xl font-bold text-foreground">
                {stats.averageScore}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary/40" />
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          User Management
        </h2>

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((userItem) => (
                <TableRow key={userItem.uid}>
                  <TableCell className="font-mono text-sm">
                    {userItem.email}
                  </TableCell>
                  <TableCell>{userItem.displayName || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{userItem.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {userItem.role !== "admin" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleRole(userItem.uid, "admin")}
                      >
                        Make Admin
                      </Button>
                    )}
                    {userItem.role !== "teacher" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleRole(userItem.uid, "teacher")}
                      >
                        Make Teacher
                      </Button>
                    )}
                    {userItem.role !== "student" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleRole(userItem.uid, "student")}
                      >
                        Make Student
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            No users found.
          </div>
        )}
      </Card>
    </div>
  );
}
