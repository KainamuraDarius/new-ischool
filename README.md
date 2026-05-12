# iSchoolVerse

iSchoolVerse is a React + Firebase school operating system prototype with a unified dashboard for learning, planning, and assessment.

## Current modules

- `Overview`: dashboard landing page with module navigation.
- `Notes`: Firebase-backed note taking with autosave, search, pinning, and color themes.
- `Calendar`: month-view scheduling for lessons, assignments, exams, meetings, and other events.
- `Reports`: subjects, assessments, weighted averages, and simple report-card summaries.
- `iSchoolBook`, `Monitor`, `Timetables`, `Whiteboard`: placeholder module shells ready for implementation.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Firebase Auth + Firestore
- TanStack Query

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
```

3. Run the app:

```bash
npm run dev
```

## Database

Firebase uses the following services for data persistence:

- **Firestore**: Primary database for storing collections (profiles, notes, events, subjects, etc.)
- **Realtime Database**: For real-time synchronization across multiple users
- **Storage**: For file uploads and media management
- **Authentication**: Email/password and OAuth (Google) sign-in
- `assessments`

Row-level security is enabled so users can only access their own data.

## Status

This repo has been moved forward from an earlier Lovable-generated starting point. The main app flow now uses native Supabase auth directly, and the remaining unfinished work is mostly feature depth rather than initial scaffolding.
