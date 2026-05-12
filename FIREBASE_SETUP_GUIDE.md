# Firebase Setup Guide for iSchoolVerse

## Step 1: Get Your Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "ischoolverse" project
3. Click on **Project Settings** (gear icon)
4. Go to **Your apps** section
5. Find your web app or create one
6. Copy the Firebase config object

It should look like this:
```javascript
{
  apiKey: "AIzaSyD...",
  authDomain: "ischoolverse.firebaseapp.com",
  projectId: "ischoolverse",
  storageBucket: "ischoolverse.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123...",
  databaseURL: "https://ischoolverse.firebaseio.com"
}
```

## Step 2: Update Environment Variables

Create or update your `.env.local` file:

```env
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=ischoolverse.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ischoolverse
VITE_FIREBASE_STORAGE_BUCKET=ischoolverse.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123...
VITE_FIREBASE_DATABASE_URL=https://ischoolverse.firebaseio.com
```

## Step 3: Enable Firebase Services

In your Firebase Console:

1. **Authentication**
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
   - Enable "Google"

2. **Firestore Database**
   - Create a new Firestore database
   - Start in test mode (or production with rules)
   - Click Create

3. **Realtime Database** (Optional, for real-time features)
   - Create a new Realtime Database
   - Location: Choose closest to your users

4. **Cloud Storage** (Optional, for file uploads)
   - Create a bucket
   - Location: Same as Firestore

## Step 4: Deploy Firestore Security Rules

1. In Firebase Console, go to **Firestore Database > Rules**
2. Replace the default rules with the content from `firestore.rules`
3. Publish the rules

The rules file is already created in your project at `firestore.rules`. You can deploy them using the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

## Step 5: Create Firestore Collections

These will be created automatically when you first add documents, but here's the schema:

### users
```
{
  uid: "user_id"
  email: "user@example.com"
  displayName: "John Doe"
  role: "student" | "teacher" | "admin"
  photoURL: "https://..."
  createdAt: timestamp
  updatedAt: timestamp
}
```

### notes
```
{
  id: "note_id"
  userId: "user_id"
  title: "My Note"
  content: "Rich text content"
  color: "yellow" | "blue" | "green" | "purple" | "pink"
  isPinned: false
  createdAt: timestamp
  updatedAt: timestamp
}
```

### events
```
{
  id: "event_id"
  userId: "user_id"
  title: "Math Lesson"
  description: "Chapter 5"
  date: timestamp
  type: "lesson" | "assignment" | "exam" | "meeting"
  createdAt: timestamp
  updatedAt: timestamp
}
```

### lessons
```
{
  id: "lesson_id"
  title: "Algebra Basics"
  subject: "Mathematics"
  classId: "class_1"
  teacherId: "teacher_id"
  schedule: {
    dayOfWeek: 1 // 0-6 (Monday-Sunday)
    startTime: "09:00"
    endTime: "10:00"
  }
  students: ["student_id_1", "student_id_2"]
  createdAt: timestamp
  updatedAt: timestamp
}
```

### whiteboard_sessions
```
{
  id: "session_id"
  lessonId: "lesson_id"
  teacherId: "teacher_id"
  title: "Live Whiteboard"
  isLive: true
  participants: ["user_id_1", "user_id_2"]
  elements: [] // Drawing elements
  createdAt: timestamp
  endedAt: null
  updatedAt: timestamp
}
```

### assessments
```
{
  id: "assessment_id"
  studentId: "student_id"
  subjectId: "subject_id"
  score: 85
  totalScore: 100
  percentage: 85
  assessmentType: "quiz" | "assignment" | "exam"
  date: timestamp
  createdAt: timestamp
}
```

### lesson_attendance
```
{
  id: "attendance_id"
  lessonId: "lesson_id"
  userId: "student_id"
  joinedAt: timestamp
  leftAt: null
  createdAt: timestamp
}
```

## Step 6: Start Using Firebase

Your project now has:
- `src/integrations/firebase/` - Firebase configuration and auth
- `src/hooks/useFirestore.ts` - Query collections
- `src/hooks/useFirestoreDoc.ts` - Query single documents
- `src/hooks/useFirestoreMutation.ts` - Create/update/delete
- `src/services/firestoreService.ts` - Pre-built CRUD operations
- `firestore.rules` - Security rules

### Using the Services

```typescript
import { notesService } from "@/services/firestoreService";

// Get all notes
const notes = await notesService.getAll(userId);

// Create a note
const noteId = await notesService.create({
  userId,
  title: "My Note",
  content: "Content here"
});

// Update a note
await notesService.update(noteId, { title: "Updated" });

// Delete a note
await notesService.delete(noteId);
```

### Using the Hooks

```typescript
import { useFirestore } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";

// Real-time subscription
const { data: notes, loading, error } = useFirestore("notes", 
  [where("userId", "==", userId)],
  { subscribe: true }
);
```

## Troubleshooting

### "Permission denied" errors
- Check Firestore Security Rules
- Make sure user is authenticated
- Verify rule conditions match your data

### No data showing
- Make sure collections exist in Firestore
- Check that data matches the collection structure
- Verify authentication state in console

### Real-time updates not working
- Check browser console for WebSocket errors
- Verify Realtime Database is enabled
- Check network tab for blocked connections

## Next Steps

1. Migrate remaining dashboard pages:
   - Calendar.tsx - Use eventsService
   - Monitor.tsx - Use monitorService
   - Timetables.tsx - Use timetableService
   - Whiteboard.tsx - Use whiteboardService
   - Reports.tsx - Use assessmentService

2. Set up Firebase Realtime Database for:
   - Live whiteboard updates
   - Real-time collaborative features
   - Live attendance tracking

3. Configure Cloud Storage for:
   - Note attachments
   - Profile pictures
   - Whiteboard exports
