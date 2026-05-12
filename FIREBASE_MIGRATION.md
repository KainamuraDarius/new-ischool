# Firebase Migration Guide

## Overview
This document outlines the migration from Supabase to Firebase for the iSchoolVerse project.

## Migration Status

### ✅ Completed
- [x] Install Firebase SDK (`firebase` v10.8.1)
- [x] Remove Supabase SDK from dependencies
- [x] Create Firebase configuration (`src/integrations/firebase/config.ts`)
- [x] Create Firebase authentication utilities (`src/integrations/firebase/auth.ts`)
- [x] Create Firebase integration index (`src/integrations/firebase/index.ts`)
- [x] Update `useAuth` hook to use Firebase Auth
- [x] Update `Auth.tsx` authentication page to use Firebase
- [x] Update `AppSidebar.tsx` to remove Supabase database queries
- [x] Update `lovable` integration to remove Supabase session calls
- [x] Update environment variables (.env.example)
- [x] Update README.md with Firebase configuration
- [x] Update WHITEBOARD_IMPLEMENTATION.md with Firebase references
- [x] Update package.json to use Firebase instead of Supabase

### 🚀 In Progress / TODO
- [ ] Migrate dashboard pages to use Firebase:
  - [ ] `src/pages/dashboard/Notes.tsx` - Replace Supabase queries with Firestore
  - [ ] `src/pages/dashboard/Calendar.tsx` - Replace with Firestore collections
  - [ ] `src/pages/dashboard/Monitor.tsx` - Use Firestore for attendance tracking
  - [ ] `src/pages/dashboard/Reports.tsx` - Use Firestore for assessment data
  - [ ] `src/pages/dashboard/Timetables.tsx` - Replace with Firestore timetable data
  - [ ] `src/pages/dashboard/Whiteboard.tsx` - Use Firestore for whiteboard data
  - [ ] `src/pages/dashboard/Admin.tsx` - Migrate admin functions to Firebase
  - [ ] `src/pages/dashboard/Book.tsx` - Use Firestore for content management

- [ ] Migrate library utilities:
  - [ ] `src/lib/ischool.ts` - Replace Types from Supabase with Firebase interfaces
  - [ ] `src/lib/timetable.ts` - Update with Firebase data structures

- [ ] Create Firebase Firestore hooks:
  - [ ] `useFirestoreCollection()` - Query collections
  - [ ] `useFirestoreDocument()` - Query individual documents
  - [ ] `useFirestoreMutation()` - Create/update/delete operations

- [ ] Set up Firestore Security Rules

- [ ] Remove Supabase folder from project

## Environment Setup

### Firebase Configuration (.env)
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
```

## Firestore Collections Schema

### users
```
{
  uid: string (document ID)
  email: string
  displayName: string
  photoURL: string
  role: 'student' | 'teacher' | 'admin'
  createdAt: timestamp
  updatedAt: timestamp
}
```

### notes
```
{
  id: string (document ID)
  userId: string (reference to user)
  title: string
  content: string (rich text)
  isPinned: boolean
  color: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### lessons
```
{
  id: string (document ID)
  title: string
  subject: string
  schedule: {
    dayOfWeek: number
    startTime: string
    endTime: string
  }
  teachers: [string] (user IDs)
  students: [string] (user IDs)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### whiteboard_sessions
```
{
  id: string (document ID)
  lessonId: string
  teacherId: string
  participants: [string] (user IDs)
  elements: [object] (drawing elements)
  isLive: boolean
  createdAt: timestamp
  endedAt: timestamp
}
```

### assessments
```
{
  id: string (document ID)
  subject: string
  studentId: string
  score: number
  totalScore: number
  date: timestamp
  assessmentType: string
}
```

## Migration Process

### For Each Page:

1. **Remove Supabase imports:**
   ```typescript
   // Before
   import { supabase } from "@/integrations/supabase/client";
   import type { Tables } from "@/integrations/supabase/types";
   
   // After
   import { db, auth } from "@/integrations/firebase";
   import { collection, query, where, getDocs } from "firebase/firestore";
   ```

2. **Replace queries:**
   ```typescript
   // Before
   const { data } = await supabase
     .from('notes')
     .select('*')
     .eq('userId', user.id);
   
   // After
   const q = query(collection(db, 'notes'), where('userId', '==', user.id));
   const querySnapshot = await getDocs(q);
   const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
   ```

3. **Replace mutations:**
   ```typescript
   // Before
   await supabase.from('notes').insert({ title, content, userId });
   
   // After
   import { addDoc } from "firebase/firestore";
   await addDoc(collection(db, 'notes'), { title, content, userId, createdAt: new Date() });
   ```

## Next Steps

1. Migrate dashboard pages one by one
2. Test each page with Firestore data
3. Remove Supabase folder once all pages are migrated
4. Set up Firestore Security Rules
5. Deploy to production

## Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Migration Guide](https://firebase.google.com/docs/firestore/migrate-to-realtime-database)
