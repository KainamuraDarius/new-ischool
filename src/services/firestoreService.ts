import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

type FirestoreDateLike =
  | Date
  | Timestamp
  | string
  | number
  | null
  | undefined
  | {
      seconds?: number;
      toDate?: () => Date;
    };

const toDate = (
  value: FirestoreDateLike,
  fallback: Date = new Date()
): Date => {
  if (value instanceof Date) {
    return value;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value && typeof value === "object") {
    if (typeof value.toDate === "function") {
      return value.toDate();
    }

    if (typeof value.seconds === "number") {
      return new Date(value.seconds * 1000);
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

const toTimestamp = (value: FirestoreDateLike, fallback?: Date) =>
  Timestamp.fromDate(toDate(value, fallback));

const mergeSnapshotDocs = (
  ...snapshots: Array<{ docs: Array<{ id: string; data: () => DocumentData }> }>
) => {
  const docsById = new Map<string, { id: string; data: () => DocumentData }>();

  snapshots.forEach((snapshot) => {
    snapshot.docs.forEach((docSnapshot) => {
      if (!docsById.has(docSnapshot.id)) {
        docsById.set(docSnapshot.id, docSnapshot);
      }
    });
  });

  return Array.from(docsById.values());
};

const normalizeWhiteboardSession = (id: string, data: DocumentData) => ({
  id,
  ...data,
  userId: data.userId ?? data.teacherId ?? "",
  teacherId: data.teacherId ?? data.userId ?? "",
  lessonId: data.lessonId ?? null,
  title: data.title ?? "Untitled whiteboard",
  participants: Array.isArray(data.participants) ? data.participants : [],
  elements: Array.isArray(data.elements)
    ? data.elements.map((element: DocumentData) => ({
        ...element,
        timestamp: toDate(element?.timestamp),
      }))
    : [],
  isActive: data.isActive ?? data.isLive ?? false,
  isLive: data.isLive ?? data.isActive ?? false,
  createdAt: toDate(data.createdAt, toDate(data.updatedAt)),
  updatedAt: toDate(data.updatedAt, toDate(data.createdAt)),
  endedAt: data.endedAt ? toDate(data.endedAt) : undefined,
});

const normalizeLesson = (id: string, data: DocumentData) => ({
  id,
  ...data,
  userId: data.userId ?? data.teacherId ?? "",
  teacherId: data.teacherId ?? data.userId ?? "",
  title: data.title ?? data.subject ?? "Untitled lesson",
  subject: data.subject ?? data.subjectId ?? "",
  room: data.room ?? data.roomId ?? "",
  teacher: data.teacher ?? "",
  color: data.color ?? "#457b9d",
  createdAt: toDate(data.createdAt, toDate(data.updatedAt)),
  updatedAt: toDate(data.updatedAt, toDate(data.createdAt)),
});

const normalizeAssessment = (id: string, data: DocumentData) => {
  const maxScore = Number(data.maxScore ?? data.totalScore ?? 100);
  const score = Number(data.score ?? 0);
  const percentage =
    typeof data.percentage === "number"
      ? data.percentage
      : maxScore > 0
        ? (score / maxScore) * 100
        : 0;

  return {
    id,
    ...data,
    userId: data.userId ?? data.studentId ?? "",
    studentId: data.studentId ?? data.userId ?? "",
    subject: data.subject ?? data.subjectId ?? "",
    subjectId: data.subjectId ?? data.subject ?? "",
    type: data.type ?? data.assessmentType ?? "test",
    assessmentType: data.assessmentType ?? data.type ?? "test",
    title: data.title ?? "Untitled assessment",
    score,
    maxScore,
    totalScore: maxScore,
    percentage,
    feedback: data.feedback ?? "",
    date: toDate(data.date ?? data.assessedOn),
    assessedOn: toDate(data.assessedOn ?? data.date),
    createdAt: toDate(data.createdAt, toDate(data.updatedAt)),
    updatedAt: toDate(data.updatedAt, toDate(data.createdAt)),
  };
};

const normalizeLessonSession = (id: string, data: DocumentData) => ({
  id,
  ...data,
  userId: data.userId ?? data.teacherId ?? "",
  teacherId: data.teacherId ?? data.userId ?? "",
  title: data.title ?? "Untitled session",
  subject: data.subject ?? "",
  scheduledAt: toDate(data.scheduledAt),
  startedAt: data.startedAt ? toDate(data.startedAt) : undefined,
  endedAt: data.endedAt ? toDate(data.endedAt) : undefined,
  status: data.status ?? "scheduled",
  createdAt: toDate(data.createdAt, toDate(data.updatedAt)),
  updatedAt: toDate(data.updatedAt, toDate(data.createdAt)),
});

const normalizeAttendanceRecord = (id: string, data: DocumentData) => ({
  id,
  ...data,
  userId: data.userId ?? "",
  lessonId: data.lessonId ?? null,
  status: data.status ?? "present",
  timestamp: toDate(data.timestamp ?? data.joinedAt),
  joinedAt: data.joinedAt ? toDate(data.joinedAt) : undefined,
  leftAt: data.leftAt ? toDate(data.leftAt) : undefined,
  duration:
    typeof data.duration === "number" ? data.duration : undefined,
  notes: data.notes ?? "",
  createdAt: data.createdAt ? toDate(data.createdAt) : undefined,
});

// ============ NOTES SERVICE ============

export const notesService = {
  async getAll(userId: string) {
    const q = query(collection(db, "notes"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }));
  },

  async getOne(noteId: string) {
    const docRef = doc(db, "notes", noteId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async create(data: {
    userId: string;
    title: string;
    content: string;
    color?: string;
  }) {
    const docRef = await addDoc(collection(db, "notes"), {
      ...data,
      isPinned: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async update(noteId: string, data: Partial<DocumentData>) {
    const docRef = doc(db, "notes", noteId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(noteId: string) {
    const docRef = doc(db, "notes", noteId);
    await deleteDoc(docRef);
  },

  async toggle(noteId: string, isPinned: boolean) {
    await this.update(noteId, { isPinned });
  },

  async search(userId: string, searchTerm: string) {
    const all = await this.getAll(userId);
    return all.filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
};

// ============ CALENDAR/EVENTS SERVICE ============

export const eventsService = {
  async getAll(userId: string) {
    const q = query(collection(db, "events"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
      date: toDate(docSnapshot.data().date),
    }));
  },

  async getByDateRange(userId: string, startDate: Date, endDate: Date) {
    const all = await this.getAll(userId);
    return all.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= startDate && eventDate <= endDate;
    });
  },

  async create(data: {
    userId: string;
    title: string;
    date: Date;
    type: "lesson" | "assignment" | "exam" | "meeting";
    description?: string;
  }) {
    const docRef = await addDoc(collection(db, "events"), {
      ...data,
      date: Timestamp.fromDate(data.date),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async update(eventId: string, data: Partial<DocumentData>) {
    const docRef = doc(db, "events", eventId);
    if (data.date) {
      data.date = toTimestamp(data.date);
    }

    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(eventId: string) {
    const docRef = doc(db, "events", eventId);
    await deleteDoc(docRef);
  },
};

// ============ WHITEBOARD SERVICE ============

export const whiteboardService = {
  async createSession(data: {
    userId?: string;
    teacherId?: string;
    lessonId?: string | null;
    title: string;
    participants?: string[];
    elements?: DocumentData[];
    isActive?: boolean;
    isLive?: boolean;
    createdAt?: FirestoreDateLike;
    updatedAt?: FirestoreDateLike;
  }) {
    const ownerId = data.userId ?? data.teacherId;

    if (!ownerId) {
      throw new Error("Missing whiteboard owner");
    }

    const docRef = await addDoc(collection(db, "whiteboard_sessions"), {
      userId: ownerId,
      teacherId: data.teacherId ?? ownerId,
      lessonId: data.lessonId ?? null,
      title: data.title,
      participants:
        data.participants && data.participants.length > 0
          ? data.participants
          : [ownerId],
      elements: Array.isArray(data.elements) ? data.elements : [],
      isActive: data.isActive ?? data.isLive ?? true,
      isLive: data.isLive ?? data.isActive ?? true,
      createdAt: data.createdAt
        ? toTimestamp(data.createdAt)
        : Timestamp.now(),
      updatedAt: data.updatedAt
        ? toTimestamp(data.updatedAt)
        : Timestamp.now(),
    });
    return docRef.id;
  },

  async getSessions(userId: string) {
    const [userSnapshot, teacherSnapshot] = await Promise.all([
      getDocs(
        query(collection(db, "whiteboard_sessions"), where("userId", "==", userId))
      ),
      getDocs(
        query(
          collection(db, "whiteboard_sessions"),
          where("teacherId", "==", userId)
        )
      ),
    ]);

    return mergeSnapshotDocs(userSnapshot, teacherSnapshot)
      .map((docSnapshot) =>
        normalizeWhiteboardSession(docSnapshot.id, docSnapshot.data())
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  },

  async getSession(sessionId: string) {
    const docRef = doc(db, "whiteboard_sessions", sessionId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists()
      ? normalizeWhiteboardSession(docSnap.id, docSnap.data())
      : null;
  },

  async updateSession(sessionId: string, data: Partial<DocumentData>) {
    const docRef = doc(db, "whiteboard_sessions", sessionId);
    const payload: DocumentData = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    if (payload.createdAt) {
      payload.createdAt = toTimestamp(payload.createdAt);
    }

    if (Array.isArray(payload.elements)) {
      payload.elements = payload.elements.map((element: DocumentData) => ({
        ...element,
        timestamp: element?.timestamp
          ? toTimestamp(element.timestamp)
          : Timestamp.now(),
      }));
    }

    if (payload.isActive !== undefined && payload.isLive === undefined) {
      payload.isLive = payload.isActive;
    }

    if (payload.isLive !== undefined && payload.isActive === undefined) {
      payload.isActive = payload.isLive;
    }

    await updateDoc(docRef, payload);
  },

  async addParticipant(sessionId: string, userId: string) {
    const docRef = doc(db, "whiteboard_sessions", sessionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const participants = docSnap.data().participants || [];
      if (!participants.includes(userId)) {
        await updateDoc(docRef, {
          participants: [...participants, userId],
          updatedAt: Timestamp.now(),
        });
      }
    }
  },

  async addElement(sessionId: string, element: DocumentData) {
    const docRef = doc(db, "whiteboard_sessions", sessionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const elements = docSnap.data().elements || [];
      await updateDoc(docRef, {
        elements: [
          ...elements,
          {
            ...element,
            id: Date.now().toString(),
            timestamp: element?.timestamp
              ? toTimestamp(element.timestamp)
              : Timestamp.now(),
          },
        ],
        updatedAt: Timestamp.now(),
      });
    }
  },

  async clearBoard(sessionId: string) {
    const docRef = doc(db, "whiteboard_sessions", sessionId);
    await updateDoc(docRef, {
      elements: [],
      updatedAt: Timestamp.now(),
    });
  },

  async endSession(sessionId: string) {
    const docRef = doc(db, "whiteboard_sessions", sessionId);
    await updateDoc(docRef, {
      isActive: false,
      isLive: false,
      endedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },
};

// ============ MONITOR/ATTENDANCE SERVICE ============

export const monitorService = {
  async createLessonSession(data: {
    userId?: string;
    teacherId?: string;
    title: string;
    subject?: string;
    scheduledAt: FirestoreDateLike;
    status?: "scheduled" | "in-progress" | "completed";
  }) {
    const ownerId = data.userId ?? data.teacherId;

    if (!ownerId) {
      throw new Error("Missing lesson session owner");
    }

    const docRef = await addDoc(collection(db, "lesson_sessions"), {
      userId: ownerId,
      teacherId: data.teacherId ?? ownerId,
      title: data.title,
      subject: data.subject ?? "",
      scheduledAt: toTimestamp(data.scheduledAt),
      status: data.status ?? "scheduled",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  },

  async getTeacherSessions(userId: string) {
    const [userSnapshot, teacherSnapshot] = await Promise.all([
      getDocs(
        query(collection(db, "lesson_sessions"), where("userId", "==", userId))
      ),
      getDocs(
        query(collection(db, "lesson_sessions"), where("teacherId", "==", userId))
      ),
    ]);

    return mergeSnapshotDocs(userSnapshot, teacherSnapshot)
      .map((docSnapshot) =>
        normalizeLessonSession(docSnapshot.id, docSnapshot.data())
      )
      .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
  },

  async recordAttendance(
    lessonIdOrData:
      | string
      | {
          lessonId: string;
          userId: string;
          joinedAt?: FirestoreDateLike;
          leftAt?: FirestoreDateLike | null;
          status?: "present" | "absent" | "late";
          timestamp?: FirestoreDateLike;
          duration?: number;
          notes?: string;
        },
    userId?: string,
    record?: {
      status?: "present" | "absent" | "late";
      timestamp?: FirestoreDateLike;
      duration?: number;
      notes?: string;
    }
  ) {
    const payload =
      typeof lessonIdOrData === "string"
        ? {
            lessonId: lessonIdOrData,
            userId: userId ?? "",
            joinedAt: record?.timestamp ?? new Date(),
            leftAt: null,
            status: record?.status ?? "present",
            timestamp: record?.timestamp ?? new Date(),
            duration: record?.duration,
            notes: record?.notes ?? "",
          }
        : {
            lessonId: lessonIdOrData.lessonId,
            userId: lessonIdOrData.userId,
            joinedAt:
              lessonIdOrData.joinedAt ??
              lessonIdOrData.timestamp ??
              new Date(),
            leftAt: lessonIdOrData.leftAt ?? null,
            status: lessonIdOrData.status ?? "present",
            timestamp:
              lessonIdOrData.timestamp ??
              lessonIdOrData.joinedAt ??
              new Date(),
            duration: lessonIdOrData.duration,
            notes: lessonIdOrData.notes ?? "",
          };

    const docRef = await addDoc(collection(db, "lesson_attendance"), {
      lessonId: payload.lessonId,
      userId: payload.userId,
      status: payload.status,
      timestamp: toTimestamp(payload.timestamp),
      joinedAt: toTimestamp(payload.joinedAt),
      leftAt: payload.leftAt ? toTimestamp(payload.leftAt) : null,
      duration: payload.duration ?? null,
      notes: payload.notes,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getLessonAttendance(lessonId: string) {
    const q = query(
      collection(db, "lesson_attendance"),
      where("lessonId", "==", lessonId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnapshot) =>
      normalizeAttendanceRecord(docSnapshot.id, docSnapshot.data())
    );
  },

  async getStudentAttendance(userId: string) {
    const q = query(
      collection(db, "lesson_attendance"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnapshot) =>
      normalizeAttendanceRecord(docSnapshot.id, docSnapshot.data())
    );
  },

  async getUserAttendance(userId: string) {
    return this.getStudentAttendance(userId);
  },

  async markLeft(attendanceId: string) {
    const docRef = doc(db, "lesson_attendance", attendanceId);
    await updateDoc(docRef, {
      leftAt: Timestamp.now(),
    });
  },
};

// ============ TIMETABLE SERVICE ============

export const timetableService = {
  async createLesson(data: {
    userId?: string;
    teacherId?: string;
    title?: string;
    subject?: string;
    subjectId?: string;
    room?: string;
    roomId?: string;
    teacher?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    classId?: string;
    color?: string;
    createdAt?: FirestoreDateLike;
    updatedAt?: FirestoreDateLike;
  }) {
    const ownerId = data.userId ?? data.teacherId;

    if (!ownerId) {
      throw new Error("Missing lesson owner");
    }

    const docRef = await addDoc(collection(db, "lessons"), {
      userId: ownerId,
      teacherId: data.teacherId ?? ownerId,
      title: data.title ?? data.subject ?? "Untitled lesson",
      subject: data.subject ?? data.subjectId ?? "",
      subjectId: data.subjectId ?? data.subject ?? "",
      room: data.room ?? data.roomId ?? "",
      roomId: data.roomId ?? data.room ?? "",
      teacher: data.teacher ?? "",
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      classId: data.classId ?? "",
      color: data.color ?? "#457b9d",
      createdAt: data.createdAt
        ? toTimestamp(data.createdAt)
        : Timestamp.now(),
      updatedAt: data.updatedAt
        ? toTimestamp(data.updatedAt)
        : Timestamp.now(),
    });
    return docRef.id;
  },

  async getTeacherLessons(teacherId: string) {
    const [teacherSnapshot, userSnapshot] = await Promise.all([
      getDocs(
        query(collection(db, "lessons"), where("teacherId", "==", teacherId))
      ),
      getDocs(
        query(collection(db, "lessons"), where("userId", "==", teacherId))
      ),
    ]);

    return mergeSnapshotDocs(teacherSnapshot, userSnapshot)
      .map((docSnapshot) => normalizeLesson(docSnapshot.id, docSnapshot.data()))
      .sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) {
          return a.dayOfWeek - b.dayOfWeek;
        }

        return a.startTime.localeCompare(b.startTime);
      });
  },

  async getClassLessons(classId: string) {
    const q = query(collection(db, "lessons"), where("classId", "==", classId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnapshot) =>
      normalizeLesson(docSnapshot.id, docSnapshot.data())
    );
  },

  async updateLesson(lessonId: string, data: Partial<DocumentData>) {
    const docRef = doc(db, "lessons", lessonId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteLesson(lessonId: string) {
    const docRef = doc(db, "lessons", lessonId);
    await deleteDoc(docRef);
  },
};

// ============ ASSESSMENTS/REPORTS SERVICE ============

export const assessmentService = {
  async recordAssessment(data: {
    userId?: string;
    studentId?: string;
    subject?: string;
    subjectId?: string;
    title?: string;
    score: number;
    maxScore?: number;
    totalScore?: number;
    type?:
      | "quiz"
      | "test"
      | "assignment"
      | "exam"
      | "project";
    assessmentType?:
      | "quiz"
      | "test"
      | "assignment"
      | "exam"
      | "project";
    feedback?: string;
    date?: FirestoreDateLike;
    assessedOn?: FirestoreDateLike;
    createdAt?: FirestoreDateLike;
    updatedAt?: FirestoreDateLike;
  }) {
    const ownerId = data.userId ?? data.studentId;
    const maxScore = Number(data.maxScore ?? data.totalScore ?? 100);
    const score = Number(data.score ?? 0);
    const assessmentDate = data.date ?? data.assessedOn ?? new Date();
    const type = data.type ?? data.assessmentType ?? "test";
    const subject = data.subject ?? data.subjectId ?? "";

    if (!ownerId) {
      throw new Error("Missing assessment owner");
    }

    const docRef = await addDoc(collection(db, "assessments"), {
      userId: ownerId,
      studentId: data.studentId ?? ownerId,
      subject,
      subjectId: data.subjectId ?? subject,
      title: data.title ?? `${subject || "General"} ${type}`,
      type,
      assessmentType: type,
      score,
      maxScore,
      totalScore: maxScore,
      feedback: data.feedback ?? "",
      date: toTimestamp(assessmentDate),
      assessedOn: toTimestamp(assessmentDate),
      percentage: maxScore > 0 ? (score / maxScore) * 100 : 0,
      createdAt: data.createdAt
        ? toTimestamp(data.createdAt)
        : Timestamp.now(),
      updatedAt: data.updatedAt
        ? toTimestamp(data.updatedAt)
        : Timestamp.now(),
    });
    return docRef.id;
  },

  async getStudentAssessments(studentId: string) {
    const [userSnapshot, studentSnapshot] = await Promise.all([
      getDocs(
        query(collection(db, "assessments"), where("userId", "==", studentId))
      ),
      getDocs(
        query(
          collection(db, "assessments"),
          where("studentId", "==", studentId)
        )
      ),
    ]);

    return mergeSnapshotDocs(userSnapshot, studentSnapshot)
      .map((docSnapshot) =>
        normalizeAssessment(docSnapshot.id, docSnapshot.data())
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  },

  async getSubjectAssessments(subjectId: string) {
    const [subjectSnapshot, subjectIdSnapshot] = await Promise.all([
      getDocs(
        query(collection(db, "assessments"), where("subject", "==", subjectId))
      ),
      getDocs(
        query(
          collection(db, "assessments"),
          where("subjectId", "==", subjectId)
        )
      ),
    ]);

    return mergeSnapshotDocs(subjectSnapshot, subjectIdSnapshot)
      .map((docSnapshot) =>
        normalizeAssessment(docSnapshot.id, docSnapshot.data())
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  },

  async getStudentProgress(studentId: string) {
    const assessments = await this.getStudentAssessments(studentId);
    const bySubject: Record<string, typeof assessments> = {};

    assessments.forEach((assessment) => {
      const subjectKey = assessment.subjectId || assessment.subject || "General";
      if (!bySubject[subjectKey]) {
        bySubject[subjectKey] = [];
      }
      bySubject[subjectKey].push(assessment);
    });

    return Object.entries(bySubject).map(([subjectId, subjectAssessments]) => ({
      subjectId,
      averageScore:
        subjectAssessments.reduce((sum, assessment) => {
          return sum + assessment.percentage;
        }, 0) / subjectAssessments.length,
      assessmentCount: subjectAssessments.length,
      assessments: subjectAssessments,
    }));
  },
};

// ============ PROFILES/USERS SERVICE ============

export const profileService = {
  async getProfile(userId: string) {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async createProfile(
    userId: string,
    data: {
      email: string;
      displayName: string;
      role: "student" | "teacher" | "admin";
      photoURL?: string;
    }
  ) {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }).catch(() => {
      return setDoc(docRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });
  },

  async updateProfile(userId: string, data: Partial<DocumentData>) {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },
};
