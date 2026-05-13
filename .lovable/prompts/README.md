# iSchoolVerse – Professional Lovable Prompts Index

This directory contains 5 comprehensive, production-ready prompts for the iSchoolVerse educational platform. Each prompt is a detailed specification for a major module or feature.

---

## 📑 Prompt Files

### 1. [PROMPT_1_identity_dashboard.md](PROMPT_1_identity_dashboard.md)
**🔐 Unified Identity, Onboarding & Master Dashboard**

Core authentication system and personalized dashboards for all roles.

**Key Features**:
- School registration and onboarding flow
- Unique iSchoolVerse ID generation (ISV-ROLE-XXXXXX)
- Role-based dashboards: Student, Teacher, Admin
- Real-time notifications and user status
- Responsive sidebar + top bar navigation

**Integration**: Foundation module — all other modules connect here

---

### 2. [PROMPT_2_timetables_calendar.md](PROMPT_2_timetables_calendar.md)
**📅 iSchool Timetables & Calendar (Smart Scheduling System)**

Professional scheduling system with AI-powered timetable generation and unified calendar.

**Key Features**:
- Admin inputs school structure and constraints
- Auto-generates conflict-free timetables (constraint-satisfaction algorithm)
- Drag-and-drop manual adjustments with live conflict detection
- Weekly grid view with color-coded subjects
- Calendar with 4 event types: Lessons, Assignments, Exams, Meetings
- 3 view modes: Day, Week, Month
- Real-time sync between timetable and calendar
- PDF export functionality

**Integration**: Drives scheduling for all modules (lessons, calendar, monitor)

---

### 3. [PROMPT_3_schoolbook_notes.md](PROMPT_3_schoolbook_notes.md)
**📖 iSchoolBook & iSchool Notes (Content & Learning Workspace)**

Digital content engine with interactive learner workspace.

**Key Features**:
- **iSchoolBook**: Subject → Topic → Subtopic hierarchy
- Rich content support: text, videos (YouTube/Vimeo), images, PhET simulations, 3D models
- Instant full-text search across all content
- **iSchool Notes**: Student workspace with rich text editing
- Annotation tools: highlights, comments, margin notes, bookmarks
- Expandable answer boxes and inline auto-scoring quizzes
- Teacher-prepared note templates with fill-in sections
- "Activities of Integration" for cross-subject learning
- Split-screen side-by-side view (iSchoolBook + Notes)
- Auto-save and cloud sync to student profile

**Integration**: Content layer — feeds whiteboard sessions, drives learning analytics

---

### 4. [PROMPT_4_monitor_reports.md](PROMPT_4_monitor_reports.md)
**📊 iSchool Monitor & iSchool Reports (Analytics & Academic Intelligence)**

Comprehensive teaching analytics and academic reporting system.

**Key Features**:
- **iSchool Monitor** (Teaching Analytics):
  - Auto-record attendance when students join whiteboard
  - Per-student metrics: lessons attended, time-on-task, engagement score
  - Per-teacher metrics: lessons delivered vs. planned, avg class size
  - School-wide analytics: attendance heatmaps, subject activity, teacher delivery rates
  - Automated alerts for missed lessons (students + parents)

- **iSchool Reports** (Academic Intelligence):
  - Teacher score entry (CA + Exams)
  - Auto-calculated grades, ranks, averages
  - Professional PDF report cards (student photo, results, trends, remarks)
  - Class performance analytics (top students, pass rates, grade distribution)
  - Filtering: by term, class, subject, student
  - Export: PDF, Excel, CSV

**Integration**: Data layer — requires lessons (from timetable) and participation data (from whiteboard)

---

### 5. [PROMPT_5_whiteboard.md](PROMPT_5_whiteboard.md)
**🖥️ iSchool Whiteboard (Live Online Classroom)**

Professional live online classroom engine comparable to ClassIn or BigBlueButton.

**Key Features**:
- Session management: create, share links, waiting room
- Multi-participant video conferencing with adaptive quality
- Digital whiteboard canvas: pen, highlighter, shapes, text, sticky notes, undo/redo
- Screen sharing: teacher + optional student
- iSchoolBook content integration (open topics inside whiteboard)
- PhET simulation embedding and interactive demos
- Live quizzes with real-time results display
- Group chat with emoji, pinned messages, moderation
- Breakout rooms for collaborative tasks
- Full session recording: video + audio + board + chat
- Playback with synchronized whiteboard replay
- "Save Board to Notes" feature (export snapshots to student notes)
- Real-time attendance logging for iSchool Monitor

**Integration**: Capstone module — connects all modules in live teaching experience

---

## 🏗️ Recommended Build Order

| Phase | Prompt | Why | Estimated Time |
|-------|--------|-----|---|
| **1** | Identity & Dashboard | Foundation for all systems | 2-3 weeks |
| **2** | Timetables & Calendar | Structure and scheduling engine | 3-4 weeks |
| **3** | iSchoolBook & Notes | Content delivery system | 3-4 weeks |
| **4** | Monitor & Reports | Data collection and analytics | 2-3 weeks |
| **5** | Whiteboard | Live teaching platform | 4-6 weeks |

**Total Estimated Development Time**: 14-20 weeks (full team, agile sprints)

---

## 🎯 Implementation Strategy

### Phase 1: Foundation (Prompts 1-2)
**Goal**: User system and scheduling structure

**Deliverables**:
- Authentication system with role-based access
- Three distinct dashboard types
- School registration and onboarding
- Timetable auto-generation algorithm
- Calendar with basic events

**Success Metrics**:
- Users can log in and see personalized dashboards
- Timetables generate without conflicts
- Calendar events display and sync

### Phase 2: Content Layer (Prompts 3)
**Goal**: Learning content and note-taking

**Deliverables**:
- iSchoolBook with hierarchical content
- Rich text editor for notes
- Media embedding (videos, images, PhET)
- Search functionality
- Split-screen view

**Success Metrics**:
- Teachers can upload content
- Students can view, annotate, and save notes
- Search finds content across subjects

### Phase 3: Analytics & Intelligence (Prompt 4)
**Goal**: Tracking, reporting, and insights

**Deliverables**:
- Attendance tracking system
- Engagement metrics and dashboards
- Score entry and grade calculation
- Professional report card generation
- Analytics visualizations

**Success Metrics**:
- Dashboards display real engagement data
- Report cards auto-generate with accurate calculations
- Teachers can view class performance analytics

### Phase 4: Live Teaching (Prompt 5)
**Goal**: Synchronous classroom experience

**Deliverables**:
- Video conferencing infrastructure
- Whiteboard with collaborative drawing
- Screen sharing
- Live quizzes
- Session recording and playback

**Success Metrics**:
- Teachers can host live sessions
- Students can join and participate
- Content integrates with iSchoolBook
- Attendance auto-records
- Sessions can be played back

---

## 🔗 Module Interdependencies

```
Identity & Dashboard (1)
├── Timetables & Calendar (2)
│   ├── iSchoolBook & Notes (3)
│   │   └── Monitor & Reports (4)
│   │       └── Whiteboard (5)
│   └── Whiteboard (5) ─ attendance recording
└── Whiteboard (5) ─ session launching
```

**Key Integration Points**:
1. **Dashboard → Timetable**: Shows today's lessons, "Join Live Lesson" button
2. **Timetable → Calendar**: Lessons auto-populate as recurring events
3. **iSchoolBook → Whiteboard**: Teachers can open content inside live sessions
4. **Whiteboard → Monitor**: Attendance auto-records when students join
5. **Whiteboard → Notes**: "Save Board" exports to student notes
6. **Monitor → Reports**: Engagement data feeds report cards
7. **Reports → Dashboard**: Students see their grades on dashboard

---

## 🚀 Quick Start for Developers

1. **Read** the prompts in order (1-5) to understand full system architecture
2. **Start with Prompt 1**: Set up authentication, database schema, and dashboard components
3. **Move to Prompt 2**: Implement timetable generation and calendar
4. **Parallel Path**: As soon as lesson data exists, start Prompt 3 (content engine)
5. **Integrate Step-by-Step**: Each prompt builds on previous ones
6. **Test at Each Phase**: Don't move to next prompt until current one is solid

---

## 📊 Success Criteria for Full System

✅ **Identity**: Users log in with unique iSchoolVerse IDs and role-based permissions  
✅ **Dashboard**: All three roles have functional, populated dashboards  
✅ **Timetables**: Auto-generated, conflict-free, responsive on all devices  
✅ **Calendar**: Syncs with timetable, supports 4 event types, notifications work  
✅ **iSchoolBook**: Hierarchical content with search, media embedding, PhET simulations  
✅ **Notes**: Rich editing, auto-save, inline quizzes, cross-subject integration  
✅ **Monitor**: Attendance auto-records, engagement metrics display, heatmaps generated  
✅ **Reports**: Grades auto-calculate, professional PDFs generate, rankings visible  
✅ **Whiteboard**: Live video + whiteboard + quizzes + recording all functional  
✅ **Integrations**: All modules interconnect (attendance → reports, content → whiteboard, etc.)  
✅ **Responsiveness**: All modules work on desktop, tablet, and mobile  
✅ **Performance**: Dashboards load < 2s, whiteboard streams smoothly, no lag  

---

## 🛠️ Technology Stack Recommendations

### Frontend
- **Framework**: React (already in codebase)
- **UI Components**: shadcn/ui or custom component library
- **State Management**: Redux or Jotai
- **Real-Time**: Socket.io for whiteboard sync, Firestore listeners for dashboards

### Backend
- **Authentication**: Firebase Auth (already in use)
- **Database**: Firestore (already in use) + Supabase (if relational queries needed)
- **Video/WebRTC**: Daily.co, Agora, or Jitsi for video conferencing
- **File Storage**: Firebase Cloud Storage (already in use)
- **Scheduling**: Bull/BullMQ for background jobs (recording processing, notifications)

### Deployment
- **Frontend**: Vercel, Netlify, or Firebase Hosting
- **Backend**: Cloud Functions (Firebase), Cloud Run (Google Cloud)
- **CDN**: Cloudflare for global distribution

---

## 📝 Notes for Stakeholders

- **Security**: All prompts include role-based access control. Implement row-level security in Firestore.
- **Performance**: Video streaming and real-time whiteboard require low-latency infrastructure.
- **Scalability**: Design database with proper indexing. Use caching for dashboards (5-min TTL).
- **User Onboarding**: First-time teacher/student flows should be smooth. Test with actual users early.
- **Mobile First**: Whiteboard and calendar must work on phones and tablets. Test early and often.
- **Accessibility**: Follow WCAG 2.1 AA standards. Support keyboard navigation and screen readers.
- **Data Privacy**: FERPA compliance if US-based, GDPR if EU. Anonymize analytics where possible.

---

## 📞 Questions or Clarifications?

Each prompt file contains detailed specifications. For ambiguities:
1. Check the prompt file's "Technical Specifications" section
2. Review "Success Criteria" to understand expected outcomes
3. Refer to "Integration Points" to understand how modules connect

---

**Version**: 1.0 (May 2026)  
**Last Updated**: May 13, 2026  
**Next Review**: After Phase 1 completion
