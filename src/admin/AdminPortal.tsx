import { useCallback, useEffect, useMemo, useState } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  Activity,
  ArrowUpRight,
  Bell,
  BookOpen,
  GraduationCap,
  Loader2,
  LogOut,
  RefreshCcw,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { signIn, signInWithGoogle, signUp } from "@/integrations/firebase";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/integrations/firebase/config";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Role = "admin" | "teacher" | "student";

type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

type PortalStats = {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalAdmins: number;
  totalLessons: number;
  totalAssessments: number;
  totalWhiteboards: number;
  activeWhiteboards: number;
  averageScore: number;
};

type PortalAlert = {
  id: string;
  title: string;
  detail: string;
  tone: "neutral" | "warning" | "success";
};

const ROLE_BADGE_STYLES: Record<Role, string> = {
  admin: "bg-accent/20 text-foreground border-accent/40",
  teacher: "bg-primary/10 text-primary border-primary/20",
  student: "bg-secondary text-secondary-foreground border-border",
};

const defaultStats: PortalStats = {
  totalUsers: 0,
  totalTeachers: 0,
  totalStudents: 0,
  totalAdmins: 0,
  totalLessons: 0,
  totalAssessments: 0,
  totalWhiteboards: 0,
  activeWhiteboards: 0,
  averageScore: 0,
};

const toDateValue = (value: unknown, fallback = new Date()) => {
  if (value instanceof Date) {
    return value;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value && typeof value === "object") {
    const maybeTimestamp = value as { toDate?: () => Date; seconds?: number };
    if (typeof maybeTimestamp.toDate === "function") {
      return maybeTimestamp.toDate();
    }

    if (typeof maybeTimestamp.seconds === "number") {
      return new Date(maybeTimestamp.seconds * 1000);
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

const getInitials = (profile: Pick<UserProfile, "displayName" | "email">) => {
  const source = profile.displayName || profile.email;
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");
};

const parseProfile = (
  uid: string,
  data: Record<string, unknown>
): UserProfile => ({
  uid,
  email: typeof data.email === "string" ? data.email : "",
  displayName:
    typeof data.displayName === "string" && data.displayName.trim()
      ? data.displayName
      : "iSchoolVerse User",
  role:
    data.role === "admin" || data.role === "teacher" || data.role === "student"
      ? data.role
      : "student",
  createdAt: toDateValue(data.createdAt),
  updatedAt: toDateValue(data.updatedAt, toDateValue(data.createdAt)),
});

const buildAlerts = (stats: PortalStats): PortalAlert[] => {
  const alerts: PortalAlert[] = [];

  if (stats.totalAdmins <= 1) {
    alerts.push({
      id: "admin-coverage",
      title: "Single-admin setup",
      detail: "Add a secondary admin account to avoid a single point of failure.",
      tone: "warning",
    });
  }

  if (stats.activeWhiteboards > 0) {
    alerts.push({
      id: "live-lessons",
      title: `${stats.activeWhiteboards} live lesson${
        stats.activeWhiteboards === 1 ? "" : "s"
      } running`,
      detail: "Monitor active whiteboard sessions from the learner platform if needed.",
      tone: "success",
    });
  }

  if (stats.totalAssessments === 0) {
    alerts.push({
      id: "reports-seed",
      title: "Reports module is still empty",
      detail: "No assessment records found yet. Teachers need to start recording CA and exam scores.",
      tone: "neutral",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "all-clear",
      title: "System checks look healthy",
      detail: "No urgent administrative alerts were detected in the current dataset.",
      tone: "success",
    });
  }

  return alerts;
};

export default function AdminPortal() {
  const { user, loading, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [portalBusy, setPortalBusy] = useState(true);
  const [bootstrapBusy, setBootstrapBusy] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<PortalStats>(defaultStats);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");

  const alerts = useMemo(() => buildAlerts(stats), [stats]);

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter((entry) =>
      [entry.displayName, entry.email, entry.uid, entry.role]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search, users]);

  const isAdmin = profile?.role === "admin";

  const loadAdminData = useCallback(async () => {
    setPortalBusy(true);

    try {
      const [usersSnapshot, lessonsSnapshot, assessmentsSnapshot, whiteboardsSnapshot] =
        await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "lessons")),
          getDocs(collection(db, "assessments")),
          getDocs(collection(db, "whiteboard_sessions")),
        ]);

      const nextUsers = usersSnapshot.docs
        .map((userDoc) =>
          parseProfile(
            userDoc.id,
            userDoc.data() as Record<string, unknown>
          )
        )
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      let totalPercent = 0;
      let scoreCount = 0;

      assessmentsSnapshot.forEach((assessmentDoc) => {
        const data = assessmentDoc.data();
        const score = Number(data.score ?? 0);
        const maxScore = Number(data.maxScore ?? data.totalScore ?? 0);

        if (maxScore > 0) {
          totalPercent += (score / maxScore) * 100;
          scoreCount += 1;
        }
      });

      const nextStats: PortalStats = {
        totalUsers: nextUsers.length,
        totalTeachers: nextUsers.filter((entry) => entry.role === "teacher")
          .length,
        totalStudents: nextUsers.filter((entry) => entry.role === "student")
          .length,
        totalAdmins: nextUsers.filter((entry) => entry.role === "admin").length,
        totalLessons: lessonsSnapshot.size,
        totalAssessments: assessmentsSnapshot.size,
        totalWhiteboards: whiteboardsSnapshot.size,
        activeWhiteboards: whiteboardsSnapshot.docs.filter((sessionDoc) => {
          const data = sessionDoc.data();
          return Boolean(data.isActive ?? data.isLive);
        }).length,
        averageScore:
          scoreCount > 0 ? Math.round(totalPercent / scoreCount) : 0,
      };

      setUsers(nextUsers);
      setStats(nextStats);
    } catch (error) {
      console.error(error);
      toast.error("Failed to refresh school-wide admin data");
    } finally {
      setPortalBusy(false);
    }
  }, []);

  const hydratePortal = useCallback(
    async (currentUser: FirebaseUser) => {
      setPortalBusy(true);

      try {
        const profileRef = doc(db, "users", currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
          setProfile(null);
          setUsers([]);
          setStats(defaultStats);
          setPortalBusy(false);
          return;
        }

        const nextProfile = parseProfile(
          profileSnap.id,
          profileSnap.data() as Record<string, unknown>
        );

        setProfile(nextProfile);

        if (nextProfile.role !== "admin") {
          setUsers([]);
          setStats(defaultStats);
          setPortalBusy(false);
          return;
        }

        await loadAdminData();
      } catch (error) {
        console.error(error);
        toast.error("Failed to load the admin portal");
        setPortalBusy(false);
      }
    },
    [loadAdminData]
  );

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      setProfile(null);
      setUsers([]);
      setStats(defaultStats);
      setPortalBusy(false);
      return;
    }

    void hydratePortal(user);
  }, [hydratePortal, loading, user]);

  const handleEmailSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthBusy(true);
    const result = await signIn(email, password);
    setAuthBusy(false);

    if (result.error) {
      toast.error(result.error.message || "Unable to sign in");
      return;
    }

    toast.success("Signed in to the admin portal");
  };

  const handleGoogleSignIn = async () => {
    setAuthBusy(true);
    const result = await signInWithGoogle();
    setAuthBusy(false);

    if (result.error) {
      toast.error(result.error.message || "Google sign-in failed");
      return;
    }

    toast.success("Signed in with Google");
  };

  const createAdminProfile = useCallback(
    async (currentUser: FirebaseUser, nextName?: string) => {
      const profileRef = doc(db, "users", currentUser.uid);
      const now = Timestamp.now();

      await setDoc(
        profileRef,
        {
          uid: currentUser.uid,
          email: currentUser.email ?? "",
          displayName:
            nextName ||
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "iSchoolVerse Admin",
          role: "admin",
          createdAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
    },
    []
  );

  const handleCreateAdminAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthBusy(true);

    const result = await signUp(email, password, name);

    if (result.error || !result.user) {
      setAuthBusy(false);
      toast.error(result.error?.message || "Unable to create admin account");
      return;
    }

    try {
      await createAdminProfile(result.user, name);
      await hydratePortal(result.user);
      toast.success("Admin account created successfully");
      setPassword("");
      setEmail("");
      setName("");
    } catch (error) {
      console.error(error);
      toast.error("Account was created, but admin profile setup failed");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleBootstrapAdmin = async () => {
    if (!user) {
      return;
    }

    setBootstrapBusy(true);

    try {
      await createAdminProfile(user);
      toast.success("This account now has admin access");
      await hydratePortal(user);
    } catch (error) {
      console.error(error);
      toast.error("Failed to grant admin access to this account");
    } finally {
      setBootstrapBusy(false);
    }
  };

  const updateRole = async (uid: string, role: Role) => {
    try {
      await updateDoc(doc(db, "users", uid), {
        role,
        updatedAt: Timestamp.now(),
      });

      setUsers((current) =>
        current.map((entry) =>
          entry.uid === uid
            ? {
                ...entry,
                role,
                updatedAt: new Date(),
              }
            : entry
        )
      );

      if (profile?.uid === uid) {
        setProfile((current) =>
          current
            ? {
                ...current,
                role,
                updatedAt: new Date(),
              }
            : current
        );
      }

      toast.success(`Updated role to ${role}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update the user role");
    }
  };

  if (loading || portalBusy) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,166,35,0.12),_transparent_35%),linear-gradient(180deg,#f8f4eb_0%,#edf1f7_100%)] flex items-center justify-center text-primary">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-6 py-4 shadow-elevated backdrop-blur">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">Loading iSchoolVerse Admin…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,166,35,0.14),_transparent_30%),linear-gradient(180deg,#eef3fb_0%,#f7f1e6_100%)] px-6 py-10">
        <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] bg-gradient-to-br from-[#0D1B2A] via-[#12253b] to-[#1b3656] p-8 md:p-10 text-white shadow-elevated">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/80">
              <ShieldCheck className="h-3.5 w-3.5" />
              Dedicated Admin Portal
            </div>
            <h1 className="mt-6 max-w-2xl font-display text-4xl font-bold tracking-tight md:text-5xl">
              Run iSchoolVerse administration from its own Firebase-hosted control room.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/78">
              Manage user roles, monitor school-wide activity, and keep the main
              learner experience separate from leadership operations.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Card className="border-white/10 bg-white/8 p-4 text-white shadow-none">
                <div className="flex items-center gap-2 text-sm text-white/72">
                  <Users className="h-4 w-4 text-[#F5A623]" />
                  Access control
                </div>
                <div className="mt-3 text-2xl font-semibold">Admins only</div>
                <p className="mt-2 text-sm text-white/68">
                  Separate sign-in and role verification before portal access.
                </p>
              </Card>
              <Card className="border-white/10 bg-white/8 p-4 text-white shadow-none">
                <div className="flex items-center gap-2 text-sm text-white/72">
                  <TrendingUp className="h-4 w-4 text-[#F5A623]" />
                  School analytics
                </div>
                <div className="mt-3 text-2xl font-semibold">Live stats</div>
                <p className="mt-2 text-sm text-white/68">
                  Lessons, assessments, whiteboards, and active roles at a glance.
                </p>
              </Card>
              <Card className="border-white/10 bg-white/8 p-4 text-white shadow-none">
                <div className="flex items-center gap-2 text-sm text-white/72">
                  <School className="h-4 w-4 text-[#F5A623]" />
                  Separate hosting
                </div>
                <div className="mt-3 text-2xl font-semibold">Own site</div>
                <p className="mt-2 text-sm text-white/68">
                  This portal is deployed independently from the learner platform.
                </p>
              </Card>
            </div>
          </section>

          <Card className="rounded-[2rem] border-border/70 bg-card/90 p-6 shadow-elevated backdrop-blur md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                  iSchoolVerse Admin
                </div>
                <h2 className="text-2xl font-display font-semibold text-foreground">
                  Sign in or create the primary admin account
                </h2>
              </div>
            </div>

            <Tabs defaultValue="signin" className="mt-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create admin</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6 space-y-4">
                <form className="space-y-4" onSubmit={handleEmailSignIn}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      placeholder="admin@school.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      placeholder="Enter your admin password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={authBusy}
                  >
                    {authBusy ? "Signing in…" : "Access admin portal"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6 space-y-4">
                <form className="space-y-4" onSubmit={handleCreateAdminAccount}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Full name
                    </label>
                    <Input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      placeholder="School administrator"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      placeholder="admin@school.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={6}
                      required
                      placeholder="Choose a secure password"
                    />
                  </div>
                  <p className="text-xs leading-6 text-muted-foreground">
                    This bootstrap flow creates an admin profile directly in
                    Firebase for the signed-in account.
                  </p>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={authBusy}
                  >
                    {authBusy ? "Creating admin…" : "Create primary admin"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]">
                <span className="bg-card px-3 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={authBusy}
            >
              Continue with Google
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,166,35,0.14),_transparent_30%),linear-gradient(180deg,#eef3fb_0%,#f7f1e6_100%)] px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <Card className="rounded-[2rem] border-border/70 bg-card/90 p-8 shadow-elevated backdrop-blur">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <Badge className="bg-accent/20 text-foreground border-accent/40">
                  Admin access required
                </Badge>
                <div>
                  <h1 className="text-3xl font-display font-semibold text-foreground">
                    This account is signed in, but it does not yet have admin privileges.
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                    If this is the first leadership account for iSchoolVerse,
                    you can bootstrap admin access below. Otherwise, ask an
                    existing admin to promote this account.
                  </p>
                </div>
              </div>
              <Avatar className="h-14 w-14 border border-border bg-secondary">
                <AvatarFallback className="bg-secondary text-foreground">
                  {profile ? getInitials(profile) : "IS"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="mt-8 grid gap-4 rounded-2xl border border-border/70 bg-background/75 p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="text-sm font-medium text-foreground">
                  Signed in as
                </div>
                <div className="mt-1 text-muted-foreground">
                  {user.email}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleBootstrapAdmin}
                  disabled={bootstrapBusy}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {bootstrapBusy ? "Granting access…" : "Make this account admin"}
                </Button>
                <Button variant="outline" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,166,35,0.15),_transparent_28%),linear-gradient(180deg,#eef3fb_0%,#f9f4eb_100%)]">
      <header className="border-b border-border/80 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D1B2A] text-white shadow-soft">
              <ShieldCheck className="h-6 w-6 text-[#F5A623]" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Separate Firebase Site
              </div>
              <h1 className="text-2xl font-display font-semibold text-foreground">
                iSchoolVerse Admin
              </h1>
            </div>
          </div>

          <div className="min-w-[240px] flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users, IDs, roles…"
                className="border-border/70 bg-background pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => void loadAdminData()}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              asChild
            >
              <a
                href="https://ischoolverse.web.app"
                target="_blank"
                rel="noreferrer"
              >
                Open learner app
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 md:flex">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {alerts.length} active alert{alerts.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-border bg-card px-3 py-2">
              <Avatar className="h-9 w-9 border border-border bg-secondary">
                <AvatarFallback className="bg-secondary text-foreground">
                  {getInitials(profile)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <div className="text-sm font-medium text-foreground">
                  {profile.displayName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {profile.email}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <Card className="rounded-[2rem] border-border/70 bg-gradient-to-br from-[#0D1B2A] via-[#14273f] to-[#204163] p-8 text-white shadow-elevated">
            <Badge className="border-white/15 bg-white/10 text-white/86">
              Master admin workspace
            </Badge>
            <h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold tracking-tight">
              Operate the school-wide control layer without touching the learner-facing site.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/78">
              This portal is hosted separately so leadership workflows can stay
              isolated from classroom use while still reading the same Firebase
              project data.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Users"
                value={stats.totalUsers}
                detail={`${stats.totalStudents} students · ${stats.totalTeachers} teachers`}
                icon={Users}
                tone="dark"
              />
              <StatCard
                label="Lessons"
                value={stats.totalLessons}
                detail="Scheduled learning sessions in the current dataset"
                icon={BookOpen}
                tone="dark"
              />
              <StatCard
                label="Assessments"
                value={stats.totalAssessments}
                detail={`Average score ${stats.averageScore}%`}
                icon={TrendingUp}
                tone="dark"
              />
              <StatCard
                label="Live Boards"
                value={stats.activeWhiteboards}
                detail={`${stats.totalWhiteboards} total whiteboard sessions`}
                icon={Video}
                tone="dark"
              />
            </div>
          </Card>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className="rounded-[1.75rem] border-border/70 bg-card/85 p-5 shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={[
                      "mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl",
                      alert.tone === "warning" && "bg-accent/20 text-accent-foreground",
                      alert.tone === "success" && "bg-emerald-100 text-emerald-700",
                      alert.tone === "neutral" && "bg-secondary text-secondary-foreground",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {alert.tone === "warning" ? (
                      <Bell className="h-4 w-4" />
                    ) : alert.tone === "success" ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <Activity className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {alert.title}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {alert.detail}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Admin accounts"
            value={stats.totalAdmins}
            detail="Leadership users with full portal access"
            icon={ShieldCheck}
          />
          <StatCard
            label="Teacher accounts"
            value={stats.totalTeachers}
            detail="Instructional staff profiles currently registered"
            icon={School}
          />
          <StatCard
            label="Student accounts"
            value={stats.totalStudents}
            detail="Learner profiles inside the Firebase project"
            icon={GraduationCap}
          />
          <StatCard
            label="Active sessions"
            value={stats.activeWhiteboards}
            detail="Whiteboard classrooms currently marked live"
            icon={Video}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-[2rem] border-border/70 bg-card/92 p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl font-semibold text-foreground">
                  User control matrix
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Promote or adjust user roles from the dedicated admin site.
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {visibleUsers.length} visible user
                {visibleUsers.length === 1 ? "" : "s"}
              </Badge>
            </div>

            <div className="mt-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleUsers.map((entry) => (
                    <TableRow key={entry.uid}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border bg-secondary">
                            <AvatarFallback className="bg-secondary text-foreground">
                              {getInitials(entry)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">
                              {entry.displayName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {entry.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {entry.uid}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={ROLE_BADGE_STYLES[entry.role]}
                        >
                          {entry.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          {(["admin", "teacher", "student"] as Role[]).map(
                            (role) => (
                              <Button
                                key={role}
                                size="sm"
                                variant={
                                  entry.role === role ? "default" : "outline"
                                }
                                onClick={() => void updateRole(entry.uid, role)}
                              >
                                {role}
                              </Button>
                            )
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[2rem] border-border/70 bg-card/92 p-6 shadow-soft">
              <div className="flex items-center gap-2 text-foreground">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl font-semibold">
                  Operational snapshot
                </h3>
              </div>
              <div className="mt-5 space-y-4">
                <MetricRow
                  label="Average assessment score"
                  value={`${stats.averageScore}%`}
                />
                <MetricRow
                  label="Whiteboard sessions recorded"
                  value={stats.totalWhiteboards}
                />
                <MetricRow
                  label="Admin to teacher ratio"
                  value={
                    stats.totalTeachers > 0
                      ? `${Math.max(stats.totalAdmins, 1)}:${stats.totalTeachers}`
                      : "0:0"
                  }
                />
                <MetricRow
                  label="User coverage"
                  value={`${stats.totalStudents + stats.totalTeachers} managed profiles`}
                />
              </div>
            </Card>

            <Card className="rounded-[2rem] border-border/70 bg-card/92 p-6 shadow-soft">
              <div className="flex items-center gap-2 text-foreground">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl font-semibold">
                  Recommended next upgrades
                </h3>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
                <li>
                  Add school-code onboarding and proper admin invitations.
                </li>
                <li>
                  Move admin provisioning to Cloud Functions for stricter security.
                </li>
                <li>
                  Add separate admin-only notifications and audit logs.
                </li>
                <li>
                  Add live charts for attendance, reporting, and timetable health.
                </li>
              </ul>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "light",
}: {
  label: string;
  value: number | string;
  detail: string;
  icon: typeof Users;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";

  return (
    <Card
      className={[
        "rounded-[1.5rem] border p-5 shadow-soft",
        isDark
          ? "border-white/10 bg-white/8 text-white shadow-none"
          : "border-border/70 bg-card/92 text-foreground",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            className={
              isDark ? "text-sm text-white/70" : "text-sm text-muted-foreground"
            }
          >
            {label}
          </div>
          <div className="mt-3 text-3xl font-semibold">{value}</div>
        </div>
        <div
          className={[
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            isDark ? "bg-white/10 text-[#F5A623]" : "bg-primary/10 text-primary",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p
        className={[
          "mt-3 text-sm leading-6",
          isDark ? "text-white/66" : "text-muted-foreground",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {detail}
      </p>
    </Card>
  );
}

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
