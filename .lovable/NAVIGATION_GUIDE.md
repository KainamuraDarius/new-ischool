# iSchoolVerse – File Structure & Navigation Guide

## 📂 Your Project Structure

```
/home/kainamura/3rd SEMESTER/schoolverse-ecosystem/
├── .instructions.md ⭐ START HERE (Overview of all 5 prompts)
├── .lovable/
│   ├── QUICK_START.md (Tactical development guide)
│   └── prompts/
│       ├── README.md (Comprehensive index + integration map)
│       ├── PROMPT_1_identity_dashboard.md (Auth + Dashboards)
│       ├── PROMPT_2_timetables_calendar.md (Scheduling System)
│       ├── PROMPT_3_schoolbook_notes.md (Content + Learning)
│       ├── PROMPT_4_monitor_reports.md (Analytics + Reporting)
│       └── PROMPT_5_whiteboard.md (Live Classroom)
├── src/ (Your existing code)
├── package.json
└── ... (other project files)
```

---

## 🗺️ Navigation Guide by Role

### For Project Managers
1. **Start**: `.instructions.md` (3-min overview)
2. **Then**: `.lovable/prompts/README.md` (build order + timeline)
3. **Reference**: Quick 20-week timeline included

### For Developers (Starting New)
1. **Start**: `.instructions.md` (understand big picture)
2. **Then**: `.lovable/QUICK_START.md` (what to build first)
3. **Deep Dive**: `.lovable/prompts/PROMPT_1_identity_dashboard.md` (start building)
4. **Reference**: Individual prompt files as needed

### For Developers (Integrating Modules)
1. **Start**: `.lovable/prompts/README.md` (see module connections)
2. **Check**: The "Integration Points" section in each prompt
3. **Reference**: Specific prompt files for detailed specs

### For Architects
1. **Start**: `.lovable/prompts/README.md` (technical overview)
2. **Read**: "Technology Stack Recommendations" section
3. **Deep Dive**: All 5 prompt files (understand full system)
4. **Database**: See "Technical Specifications" in each prompt

---

## 📖 Reading Order by Use Case

### Use Case: "I need to understand the entire system"
```
1. .instructions.md (15 min)
   ↓
2. .lovable/prompts/README.md (30 min)
   ↓
3. All 5 prompt files (2 hours total, ~24 min each)
   ↓
4. .lovable/QUICK_START.md (20 min)
```
**Total Time**: ~3.5 hours (comprehensive understanding)

### Use Case: "I need to start building Prompt 1 today"
```
1. .instructions.md (15 min)
   ↓
2. .lovable/QUICK_START.md (20 min) → "What to Build First" section
   ↓
3. .lovable/prompts/PROMPT_1_identity_dashboard.md (full read)
   ↓
4. Start coding!
```
**Total Time**: ~1.5 hours (ready to code)

### Use Case: "I'm building Prompt 3, need to understand Prompt 5 integration"
```
1. .lovable/prompts/PROMPT_3_schoolbook_notes.md
   ↓
2. Look for "Integration" section
   ↓
3. Jump to .lovable/prompts/PROMPT_5_whiteboard.md
   ↓
4. Find "iSchoolBook Integration" subsection
```
**Total Time**: ~30 minutes (specific integration understanding)

### Use Case: "I need a quick 5-minute summary"
```
1. .instructions.md (5 min) → Just read the 5 module sections
```
**Total Time**: 5 minutes (executive summary)

---

## 🔑 Key Sections in Each Prompt File

Every prompt file follows this structure for easy reference:

```
PROMPT_X_title.md
├── Objective (1 paragraph)
├── Core Requirements (detailed specs)
├── UI/UX Specifications (design details)
├── Technical Specifications (database, tech stack)
├── Success Criteria (checklist to know when done)
└── Integration Points (how other modules connect)
```

**Tip**: If you want just the success criteria → jump to the bottom of each prompt.

---

## 💡 Quick Reference: What Each Prompt Solves

| Prompt | Solves | Key Problem |
|--------|--------|------------|
| **1** | "How do users log in and see their dashboard?" | Multi-role authentication + personalization |
| **2** | "How do we schedule 100+ teachers and 1000+ students?" | Timetable conflict resolution |
| **3** | "How do teachers deliver content and students learn?" | Digital content + interactive notes |
| **4** | "How do we track progress and generate reports?" | Analytics + automatic grading |
| **5** | "How do teachers teach live online?" | Real-time video + collaboration |

---

## 🎯 Feature Checklist by Module

### PROMPT 1 ✓
- [ ] School registration
- [ ] Teacher/student account creation by admin
- [ ] Unique iSchoolVerse ID assignment
- [ ] Three dashboard types (student, teacher, admin)
- [ ] Role-based navigation

### PROMPT 2 ✓
- [ ] Timetable auto-generation (constraint-satisfaction)
- [ ] Drag-drop manual adjustments
- [ ] Live conflict detection (red highlighting)
- [ ] Calendar with 4 event types
- [ ] Day/Week/Month views
- [ ] PDF export

### PROMPT 3 ✓
- [ ] Hierarchical content (Subject → Topic → Subtopic)
- [ ] Rich text + video + images + PhET + 3D models
- [ ] Searchable across all content
- [ ] Student notes with annotation tools
- [ ] Inline quizzes with auto-scoring
- [ ] Split-screen view
- [ ] Auto-save every 10 seconds

### PROMPT 4 ✓
- [ ] Auto-record attendance (from Prompt 5)
- [ ] Engagement score per student
- [ ] Teacher delivery metrics
- [ ] School-wide analytics (heatmaps, rankings)
- [ ] Score entry + auto-calculated grades
- [ ] Professional PDF report cards
- [ ] Class performance analytics
- [ ] Export: PDF, Excel, CSV

### PROMPT 5 ✓
- [ ] Multi-participant video
- [ ] Whiteboard with drawing tools
- [ ] Screen sharing (teacher + optional student)
- [ ] iSchoolBook content integration
- [ ] PhET simulation embedding
- [ ] Live quizzes with instant results
- [ ] Chat with emoji + pinned messages
- [ ] Breakout rooms
- [ ] Full session recording
- [ ] Synchronized playback
- [ ] "Save Board to Notes"
- [ ] Attendance auto-logging

---

## 🚀 One-Page Launch Checklist

Copy this checklist into your project management tool:

```
PHASE 1 (Weeks 1-3): Identity & Dashboard
├── [ ] Firebase auth + iSchoolVerse ID generation
├── [ ] 3 dashboard types (components built)
├── [ ] Sidebar navigation (responsive)
├── [ ] Notifications system
├── [ ] Test with 50+ concurrent users
└── Launch Phase 1!

PHASE 2 (Weeks 4-7): Timetables & Calendar
├── [ ] Timetable auto-generation algorithm
├── [ ] Weekly grid UI component
├── [ ] Calendar (day/week/month)
├── [ ] Event types (lesson, assignment, exam, meeting)
├── [ ] Real-time sync
└── Launch Phase 2!

PHASE 3 (Weeks 8-11): iSchoolBook & Notes
├── [ ] iSchoolBook hierarchy + WYSIWYG editor
├── [ ] Media upload (videos, images, PhET)
├── [ ] Student notes editor
├── [ ] Annotation tools (highlight, comment)
├── [ ] Inline quizzes
├── [ ] Split-screen view
└── Launch Phase 3!

PHASE 4 (Weeks 12-14): Monitor & Reports
├── [ ] Attendance auto-record (integrate with Whiteboard)
├── [ ] Engagement score calculation
├── [ ] Score entry system
├── [ ] Auto-grade calculation
├── [ ] PDF report card generation
├── [ ] Analytics dashboards
└── Launch Phase 4!

PHASE 5 (Weeks 15-20): Whiteboard
├── [ ] Video conferencing (choose platform)
├── [ ] Whiteboard canvas + drawing tools
├── [ ] Screen sharing
├── [ ] Live quizzes
├── [ ] Chat + emoji
├── [ ] Breakout rooms
├── [ ] Session recording
├── [ ] Attendance auto-log + Monitor integration
└── PUBLIC LAUNCH! 🎉
```

---

## 📞 When You're Stuck

1. **"What should I build next?"**  
   → Read `.lovable/QUICK_START.md` → "What to Build First/Second/Third" sections

2. **"How does Feature X work?"**  
   → Find Feature X in the relevant prompt file → read that section

3. **"How do Module A and Module B connect?"**  
   → Check `.lovable/prompts/README.md` → "Module Interdependencies" section

4. **"What's the database schema?"**  
   → Find "Technical Specifications" or "Data Model" in each prompt file

5. **"How do I know when Prompt X is done?"**  
   → Check "Success Criteria" at the end of each prompt file

6. **"Should I use Technology X or Y?"**  
   → Check "Technology Stack Recommendations" in `.lovable/prompts/README.md`

---

## 🎓 Learning Resources

For each major feature, external resources recommended in prompts:

- **Constraint-Satisfaction Algorithm** (Prompt 2): Google OR-Tools, Algorithms textbooks
- **Real-Time Whiteboard Sync** (Prompt 5): Socket.io docs, Collaboration algorithms
- **WebRTC Video** (Prompt 5): WebRTC documentation, Video codec guides
- **Analytics Dashboards** (Prompt 4): Data visualization libraries (D3, Recharts)
- **PDF Generation** (Prompt 4): PDFKit, jsPDF, Puppeteer docs

---

## 🎯 Success = You Can Answer These

By the time you're done, you should be able to answer:

1. "How does a new student register and see their dashboard?" → Prompt 1
2. "How does the timetable know which teacher teaches which class?" → Prompt 2
3. "How can a student annotate a lesson during note-taking?" → Prompt 3
4. "How does the system know a student attended a lesson?" → Prompt 4 + Prompt 5
5. "How can a teacher share their screen while drawing?" → Prompt 5
6. "How are all 5 modules connected?" → `.lovable/prompts/README.md` Interdependencies section

---

## 📊 Files at a Glance

| File | Size | Read Time | Best For |
|------|------|-----------|----------|
| `.instructions.md` | 2 KB | 5-15 min | Quick overview |
| `.lovable/QUICK_START.md` | 8 KB | 20 min | Tactical planning |
| `.lovable/prompts/README.md` | 12 KB | 30 min | Build order + integration map |
| `PROMPT_1_identity_dashboard.md` | 15 KB | 25 min | Auth system specs |
| `PROMPT_2_timetables_calendar.md` | 18 KB | 30 min | Scheduling algorithm |
| `PROMPT_3_schoolbook_notes.md` | 20 KB | 35 min | Content system specs |
| `PROMPT_4_monitor_reports.md` | 18 KB | 30 min | Analytics specs |
| `PROMPT_5_whiteboard.md` | 25 KB | 40 min | Live classroom specs |
| **Total** | **~118 KB** | **~3.5 hours** | Complete system |

---

## ✨ Final Tips

1. **Don't skip Phase 1**: Authentication and dashboards are the foundation. Everything depends on this.

2. **Test phases incrementally**: Don't wait until Phase 5 to test. Test each phase before moving to the next.

3. **Involve real users early**: Get teachers and students to test Phase 2 (timetables) as soon as it's working.

4. **Prioritize responsiveness**: All modules must work on phones. Test on actual devices, not just browser zoom.

5. **Performance matters**: Whiteboard especially needs low latency. Test early and often.

6. **Document as you go**: Your team will thank you. Keep a DEVELOPMENT log.

7. **Use the prompts as source of truth**: When in doubt, check the relevant prompt file. They have all the specs.

---

**You've got everything you need to build an amazing platform! 🚀**

Start with `.instructions.md` → `.lovable/QUICK_START.md` → `PROMPT_1_identity_dashboard.md` → Start coding!

Questions? The prompts have all the details. Good luck!
