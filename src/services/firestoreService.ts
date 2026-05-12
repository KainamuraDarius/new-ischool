import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  DocumentData,
  WriteBatch,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

// ============ NOTES SERVICE ============

export const notesService = {
  async getAll(userId: string) {
    const q = query(collection(db, "notes"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
    return all.filter((note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
};

// ============ CALENDAR/EVENTS SERVICE ============

export const eventsService = {
  async getAll(userId: string) {
    const q = query(
      collection(db, "events"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
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
    if (data.date instanceof Date) {
      data.date = Timestamp.fromDate(data.date);
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
    lessonId: string;
    teacherId: string;
    title: string;
  }) {
    const docRef = await addDoc(collection(db, "whiteboard_sessions"), {
      ...data,
      isLive: false,
      participants: [data.teacherId],
      elements: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getSession(sessionId: string) {
    const docRef = doc(db, "whiteboard_sessions", sessionId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async updateSession(sessionId: string, data: Partial<DocumentData>) {
    const docRef = doc(db, "whiteboard_sessions", sessionId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
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
        elements: [...elements, { ...element, id: Date.now().toString() }],
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
      isLive: false,
      endedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },
};

// ============ MONITOR/ATTENDANCE SERVICE ============

export const monitorService = {
  async recordAttendance(data: {
    lessonId: string;
    userId: string;
    joinedAt: Date;
  }) {
    const docRef = await addDoc(collection(db, "lesson_attendance"), {
      ...data,
      joinedAt: Timestamp.fromDate(data.joinedAt),
      leftAt: null,
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
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      joinedAt: doc.data().joinedAt?.toDate(),
      leftAt: doc.data().leftAt?.toDate(),
    }));
  },

  async getUserAttendance(userId: string) {
    const q = query(
      collection(db, "lesson_attendance"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      joinedAt: doc.data().joinedAt?.toDate(),
      leftAt: doc.data().leftAt?.toDate(),
    }));
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
    subjectId: string;
    teacherId: string;
    roomId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    classId: string;
  }) {
    const docRef = await addDoc(collection(db, "lessons"), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getTeacherLessons(teacherId: string) {
    const q = query(
      collection(db, "lessons"),
      where("teacherId", "==", teacherId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async getClassLessons(classId: string) {
    const q = query(
      collection(db, "lessons"),
      where("classId", "==", classId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
    studentId: string;
    subjectId: string;
    score: number;
    totalScore: number;
    assessmentType: "quiz" | "assignment" | "exam";
    date: Date;
  }) {
    const docRef = await addDoc(collection(db, "assessments"), {
      ...data,
      date: Timestamp.fromDate(data.date),
      percentage: (data.score / data.totalScore) * 100,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async getStudentAssessments(studentId: string) {
    const q = query(
      collection(db, "assessments"),
      where("studentId", "==", studentId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
    }));
  },

  async getSubjectAssessments(subjectId: string) {
    const q = query(
      collection(db, "assessments"),
      where("subjectId", "==", subjectId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
    }));
  },

  async getStudentProgress(studentId: string) {
    const assessments = await this.getStudentAssessments(studentId);
    const bySubject: Record<string, any[]> = {};

    assessments.forEach((assessment) => {
      if (!bySubject[assessment.subjectId]) {
        bySubject[assessment.subjectId] = [];
      }
      bySubject[assessment.subjectId].push(assessment);
    });

    return Object.entries(bySubject).map(([subjectId, assesses]) => ({
      subjectId,
      averageScore:
        assesses.reduce((sum, a) => sum + a.percentage, 0) / assesses.length,
      assessmentCount: assesses.length,
      assessments: assesses,
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

  async createProfile(userId: string, data: {
    email: string;
    displayName: string;
    role: "student" | "teacher" | "admin";
    photoURL?: string;
  }) {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }).catch(() => {
      // If doc doesn't exist, create it
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
