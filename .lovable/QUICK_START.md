# iSchoolVerse Development Quick Reference

**Read this after `.instructions.md` for tactical next steps.**

---

## 🎯 Current Status (May 2026)

Your workspace already has:
- ✅ Firebase integration
- ✅ Supabase integration  
- ✅ Basic admin/student portals
- ✅ Component library (shadcn/ui)
- ✅ Some whiteboard and note-taking code
- ⏳ **Ready for: Full module buildout**

---

## 📋 What to Build First (PROMPT 1 – Weeks 1-3)

### Step 1: Database Schema (Firestore)
```
Collections:
├── users/
│   ├── auth_id
│   ├── role (student|teacher|admin)
│   ├── schoolVerse_id (ISV-ROLE-XXXXXX)
│   ├── school_id
│   └── profile (name, avatar, etc.)
├── schools/
│   ├── school_code
│   ├── name
│   └── settings
├── classes/
│   ├── name (Form 1A, Form 2B)
│   ├── school_id
│   └── teacher_ids
└── dashboard_widgets/
    ├── user_id
    └── widget_data
```

### Step 2: Authentication System
- Extend Firebase Auth with iSchoolVerse ID assignment
- Implement role-based route guards
- School registration flow
- User invitation system (admin creates teacher/student accounts)

### Step 3: Dashboard Components
- **StudentDashboard**: Today's timetable, assignments, notes, grades, engagement
- **TeacherDashboard**: Today's lessons, attendance, pending marks, analytics
- **AdminDashboard**: School analytics, online users, alerts, reports summary
- **Sidebar Navigation**: Module icons, profile, logout
- **Top Bar**: Notifications, search, user menu

### Step 4: Navigation System
- Route structure for all 3 dashboards
- Role-based route protection (students can't access teacher dashboard)
- Deep linking (remember last visited module)

---

## 📅 What to Build Second (PROMPT 2 – Weeks 4-7)

### Step 1: Timetable Generation Algorithm
- Input validation (teachers, subjects, classes, constraints)
- Constraint-satisfaction solver (CSP with backtracking)
- Conflict detection algorithm
- Balance optimization

### Step 2: Timetable UI
- Weekly grid component (periods × days)
- Color-coded subjects
- Drag-drop for manual adjustments
- Undo/redo stack
- Live conflict highlighting (red cells)

### Step 3: Calendar System
- Firestore schema for events (lessons, assignments, exams, meetings)
- Auto-populate lessons from timetable
- Day/Week/Month view components
- Notification system (badges for due dates)

### Step 4: Integration
- Dashboard "Today's Timetable" widget pulls from this module
- Calendar notification badges on dashboard
- "Join Live Lesson" button wired to whiteboard (Prompt 5)

---

## 📖 What to Build Third (PROMPT 3 – Weeks 8-11)

### Step 1: iSchoolBook Content Engine
- Hierarchical subject/topic/subtopic database structure
- WYSIWYG editor (Slate.js or TipTap)
- Media upload (Firebase Cloud Storage)
- YouTube/Vimeo embedding
- PhET simulation iframe embed zone

### Step 2: iSchool Notes Workspace
- Rich text editor for student notes
- Highlight + annotation tools
- Inline quiz component (multiple choice + auto-scoring)
- Expandable answer boxes (for teacher templates)
- Auto-save to Firestore per 10 seconds

### Step 3: Split-Screen View
- Responsive layout: iSchoolBook left, Notes right (desktop)
- Stacked layout for tablet/mobile
- Both scroll independently
- Synchronized to same topic

### Step 4: Search & Integration
- Full-text search across all content
- Search results grouped by subject
- Link highlighting in content
- "Add to My Notes" button from iSchoolBook

---

## 📊 What to Build Fourth (PROMPT 4 – Weeks 12-14)

### Step 1: Attendance & Engagement Tracking
- Auto-record attendance when whiteboard session starts (integrate with Prompt 5)
- Calculate engagement score per student
- Dashboard: show attendance heatmap, subject activity ranking
- Alerts: send to students/parents when lessons are missed

### Step 2: Score Entry & Grade Calculation
- Teacher score input form (CA + Exams)
- Auto-calculate: grade, rank, class average
- Validation: flag invalid scores
- Bulk CSV import option

### Step 3: Report Card Generation
- Professional PDF template (student photo, results, trend chart, remarks)
- Auto-generate for whole class
- Filtering: by term, class, subject
- Export options: PDF, Excel, CSV

### Step 4: Analytics Dashboards
- Admin: attendance heatmap, teacher delivery rates, school-wide metrics
- Teacher: per-class attendance, per-subject performance, delivery trends
- Student: own grades, class rank, performance trend

---

## 🖥️ What to Build Fifth (PROMPT 5 – Weeks 15-20)

### Step 1: WebRTC Video Conferencing
- Choose platform: Daily.co, Agora, Jitsi, or pure WebRTC
- Multi-participant video grid
- Mute/unmute, camera on/off, participant list
- Waiting room before teacher admits

### Step 2: Whiteboard Canvas
- Drawing tools: pen, highlighter, eraser, shapes, text, sticky notes
- Real-time sync via Socket.io
- Undo/redo stack
- Clear canvas button
- Infinite pan/zoom

### Step 3: Advanced Features
- Screen sharing (teacher + optional student)
- iSchoolBook content opener (embed inside session)
- PhET simulation embedding
- Live quizzes (launch, student answer, instant results chart)
- Chat sidebar with emoji and message pinning

### Step 4: Recording & Integration
- Record video + audio + board + chat
- Playback with synchronized whiteboard replay
- "Save Board to Notes" exports to student notes
- Auto-link to Monitor (attendance + duration)
- Archive recordings to Cloud Storage

---

## 🔗 Critical Integration Points

### Dashboard ↔ Timetable
```
ComponentEvent: User clicks "Join Live Lesson" button
Action: Fetch lesson from timetable (Period → Time → Subject → Teacher)
Target: Open Whiteboard session with lesson context
```

### Timetable ↔ Calendar
```
TriggerEvent: Admin saves timetable
Action: Auto-create recurring lesson events in calendar
Target: All student calendars populate automatically
```

### iSchoolBook ↔ Whiteboard
```
Feature: "Open Content" button in whiteboard
Action: Load iSchoolBook topic in sidebar/overlay
Target: Teacher demonstrates content live while drawing
```

### Whiteboard ↔ Monitor
```
TriggerEvent: Student joins whiteboard session
Action: Record timestamp + student ID + lesson_id
Target: Monitor dashboard shows attendance + engagement metrics
```

### Whiteboard ↔ Notes
```
Feature: "Save Board" button
Action: Export whiteboard snapshot
Target: Auto-embed in student's iSchool Notes for that topic
```

### Monitor ↔ Reports
```
TriggerEvent: Term ends
Action: Pull engagement metrics from Monitor
Target: Include in student report card context
```

---

## ⚠️ Key Technical Decisions (Already Made)

✅ **Firebase** for auth + Firestore for primary database  
✅ **Supabase** available for relational queries if needed  
✅ **React + TypeScript** for frontend  
✅ **Vite** for build tool  
✅ **shadcn/ui** for UI components  
✅ **TailwindCSS** for styling  

### Still Need to Choose:
- [ ] **Whiteboard Library**: Fabric.js, Konva, or custom Canvas?
- [ ] **Video Platform**: Daily.co, Agora, Jitsi, or self-hosted?
- [ ] **Rich Text Editor**: Slate.js, TipTap, or Prosemirror?
- [ ] **Scheduler Library**: node-schedule, Bull for background jobs?
- [ ] **PDF Generator**: PDFKit, jsPDF, or puppeteer?

---

## 📞 Common Questions

**Q: How long to build everything?**  
A: ~20 weeks with a full-stack team working in 2-week sprints. Can parallelize some work (e.g., Prompts 3 & 4 can overlap).

**Q: Can we launch a partial system?**  
A: Yes! Launch Phase 1 (Dashboard + Auth) alone → add Timetable & Calendar → then add content. Users can start using it immediately.

**Q: How many developers needed?**  
A: 
- 1 dev: 6+ months (sequential)
- 2 devs: 3-4 months (frontend + backend)
- 4+ devs: 5-6 weeks (full parallel)

**Q: Is the code in the workspace ready?**  
A: Partially. You have basic admin/student portals and some components. PROMPT 1 will require cleanup and full role-based refactor.

**Q: What about mobile apps?**  
A: Start with responsive web (works on all devices). Native apps (iOS/Android) can come later using React Native or Flutter.

---

## 🎓 Learning Paths for Team

**If team is new to:**
- **Real-time systems** (websockets, Socket.io): Study whiteboard sync architecture (Prompt 5)
- **Analytics/dashboards**: Study Monitor heatmaps and engagement calculations (Prompt 4)
- **Constraint satisfaction**: Study timetable generation algorithm (Prompt 2)
- **Video streaming**: Study WebRTC architecture for video conferencing (Prompt 5)

---

## ✅ Launch Checklist (Before Going Live)

**Before Phase 1 Launch**:
- [ ] Authentication tested (sign up, sign in, sign out, reset password)
- [ ] All 3 dashboards render correctly
- [ ] iSchoolVerse ID displays properly
- [ ] Responsive on phone, tablet, desktop
- [ ] Notifications work
- [ ] 50+ users can log in simultaneously without issues

**Before Phase 2 Launch**:
- [ ] Timetable generates without conflicts for 100+ lessons
- [ ] Manual drag-drop adjustments work smoothly
- [ ] Calendar syncs in real-time
- [ ] PDF export is professional quality

**Before Phase 3 Launch**:
- [ ] Teachers can upload content (text, video, images, PhET)
- [ ] Search finds content across 500+ topics
- [ ] Student notes auto-save every 10 seconds
- [ ] Highlight & annotations work smoothly

**Before Phase 4 Launch**:
- [ ] Attendance auto-records from whiteboard (needs Prompt 5 running)
- [ ] Teachers can enter scores for 100+ students
- [ ] Report cards generate in < 5 seconds
- [ ] Grades calculate correctly (spot-check 10 students)

**Before Phase 5 Launch** (Full public launch):
- [ ] 20+ users in a whiteboard session with smooth video
- [ ] Board drawing has < 50ms latency
- [ ] Session records without dropping frames
- [ ] Playback syncs board with video correctly
- [ ] Load test: 500+ concurrent students on platform

---

## 🚀 Ready to Start?

1. Read `.instructions.md` (overview)
2. Read `.lovable/prompts/README.md` (detailed roadmap)
3. Read `PROMPT_1_identity_dashboard.md` (start here)
4. Create Firebase collections (users, schools, classes, etc.)
5. Build authentication system
6. Build dashboard components
7. **Ship Phase 1 in 3 weeks** 🎉

---

**Good luck! iSchoolVerse is going to be amazing.** 🚀

Questions? Check the individual prompt files — they have detailed specs and success criteria.
