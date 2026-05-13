# 📅 PROMPT 2 – iSchool Timetables & Calendar (Smart Scheduling System)

## Objective
Build a professional scheduling system that auto-generates conflict-free timetables with constraint satisfaction, and maintains a synchronized calendar system for all school events, assignments, and exams.

---

## Timetables Module

### Admin Timetable Input Interface

**Required Input Fields**:
1. **School Configuration**
   - Number of periods per day (4-8 options)
   - Number of days per week (4-6 options)
   - Period duration (typically 45-60 minutes)
   - Break times (lunch, assembly, etc.)

2. **Resources to Define**
   - **Teachers**: List with names, ID, availability constraints
   - **Subjects**: Course names with credit hours per week
   - **Classes/Streams**: Grade levels and sections (e.g., Form 1A, Form 2B)
   - **Rooms/Classrooms**: Building and capacity
   - **Teacher-Subject Mapping**: Which teachers teach which subjects

3. **Constraints Input**
   - Teacher unavailability: "Teacher X unavailable Friday 2-4pm"
   - Room limitations: "Lab only available 9am-12pm"
   - Class-specific needs: "Biology needs lab, not classroom"
   - Teaching hours per teacher: "Maximum 6 periods/day"
   - Subject distribution: "Subject Y must not be consecutive > 2 periods"

---

### Auto-Generate Timetable

**Algorithm Approach**:
- Constraint-satisfaction solver (backtracking with heuristics)
- Workload balancing: ensure no teacher has back-to-back lessons
- Room efficiency: minimize unused periods
- Student experience: avoid 7+ hour days

**Generation Steps**:
1. Validate all input constraints are satisfiable
2. Create feasibility matrix for each lesson slot
3. Assign lessons using weighted heuristic (balance, constraints, preferences)
4. Detect and resolve any remaining conflicts
5. Generate conflict report and quality metrics

**Output**: Complete weekly timetable with zero hard conflicts

---

### Timetable Display & Management

**Weekly Grid View**:
- **Rows**: Time slots (periods) from first to last period
- **Columns**: Days of the week (Monday–Friday)
- **Cell Content**: 
  - Subject name (e.g., "Mathematics")
  - Teacher name
  - Class/Stream (e.g., "Form 1A")
  - Room/Location (e.g., "Lab 2")
  - Color-coded by subject (consistent colors across all timetables)

**Color-Coded System**:
- Each subject assigned a unique color
- Colors consistent across all user views (students, teachers, admins)
- Break/lunch periods: light gray background

**Live Conflict Detector**:
- Real-time validation as admin makes manual edits
- Red highlighting for conflicts (e.g., teacher in two places)
- Conflict tooltip: "Teacher X in Room A and Room B at same time"
- Prevent saving while conflicts exist (disable save button)

**Drag-and-Drop Manual Adjustments**:
- Click and drag lesson cell to new time slot
- Auto-validate on drop
- Undo/Redo buttons (last 10 edits)
- "Reset to Auto-Generated" button to revert all manual changes

**Actions**:
- **Edit Lesson**: Click cell → edit teacher/room/subject
- **Delete Lesson**: Remove lesson from timetable
- **Duplicate Week**: Copy timetable to next week
- **Copy Semester**: Replicate timetable pattern for term

---

### Personalized Timetable Views

**Student View**:
- See only their own class/stream timetable
- Highlight their subjects in colors
- Show room locations for each lesson
- "Add to Calendar" button to sync with personal calendar

**Teacher View**:
- See only their own teaching schedule
- Show all classes they teach (color-coded)
- Display total teaching hours/day
- "Plan Lesson" button for each time slot

**Admin View**:
- See full school timetable (all classes, all teachers)
- Filter by class, teacher, or subject
- Conflict overview highlighting
- Analytics: lesson density, room utilization %

---

### Export & Print

**PDF Export**:
- Generate printable PDF of full/filtered timetable
- Include legend with subject colors
- Format: A4 or A3 (landscape for better visibility)
- Include school name, term, and generation date
- Option to export per-teacher or per-class PDFs

---

## Calendar Module

### Calendar Data Sources

**Auto-Populated from Timetable**:
- All lessons appear as recurring events
- Event title: "[Subject] - [Class] - [Teacher]"
- Duration: auto-calculated from period duration
- Recurrence: weekly (Mon-Fri by default)
- Sync: if timetable is edited, calendar updates in real-time

---

### Event Types & Creation

**Admins/Teachers Can Create**:
1. **Assignments**
   - Title, description, subject, due date, due time
   - Linked class/stream (auto-select for teachers)
   - Attached resources (PDF, link, file)
   - Visible to: assigned students, teachers, admins

2. **Exams**
   - Title, subject, date, start time, duration
   - Exam type (terminal, mid-term, quiz, etc.)
   - Room/hall assignment
   - Invigilator assigned
   - Visible to: all students of affected class, teachers, admins

3. **Meetings**
   - Title, participants, date, time, location/link
   - Recurring options (daily, weekly, monthly)
   - Video conference link (for parent-teacher meetings)
   - RSVP tracking

4. **School Events**
   - Title, description, date range, location
   - Public (visible to all) or private (restricted users)
   - Event type: Sports Day, Assembly, Holiday, etc.
   - Attachment support (flyers, schedules)

---

### Calendar Views

**Day View**:
- Hourly timeline from 6am to 10pm
- All events for selected day listed vertically
- Color-coded by event type (lessons=blue, assignments=yellow, exams=red, etc.)
- Quick event details on hover

**Week View**:
- Monday–Sunday grid with time slots
- Events displayed as blocks in their time slots
- 7-day rolling window
- Previous/Next week navigation

**Month View**:
- Traditional calendar grid
- Events shown as badges/tags per day
- Hover to preview event details
- Click day for detailed day view

---

### Event Notifications & Urgency Indicators

**Push Notification Badges**:
- Due in 24 hours: 🔴 Red badge
- Due in 3 days: 🟡 Yellow badge
- Due in 1 week: 🟢 Green badge
- Overdue: 🔴 Red "OVERDUE" label

**Dashboard Alerts**:
- Notification bell shows count of urgent events
- Popup list: assignments/exams due in next 7 days
- Dismissible notifications

**Email Notifications** (optional):
- Reminder emails 24 hours before due date
- Admin notifications for upcoming exams
- Parent notifications (if parent accounts exist)

---

### Student Calendar (Unified View)

**Student Calendar Features**:
- All their subject lessons displayed automatically
- All assignments they've been given (from teachers)
- All exams they're enrolled in
- Deadlines and due dates clearly marked
- Color-coded by subject (matches timetable colors)
- Subscriptions: students can add events to personal calendar (Google Calendar, Outlook, etc.)

---

### Sync & Integration

**Real-Time Sync**:
- When timetable is edited → calendar lessons update instantly
- When assignment is created → appears in all students' calendars immediately
- Conflict detection: prevent double-booking lessons

**Cross-Module Integration**:
- Lessons in calendar link to iSchoolBook content
- Exam events link to past exam papers (if available)
- Assignment events link to submission interface
- Meeting events with video link open Whiteboard session

---

## Technical Requirements

### Data Structure
- **Lessons**: Recurring events with period constraints
- **Events**: One-time or recurring calendar entries
- **Notifications**: Time-based triggers for alerts

### Performance
- Calendar renders 30+ events without lag
- Month view loads in < 1 second
- Real-time sync latency < 2 seconds

### Browser Support
- Full responsiveness: desktop, tablet, mobile
- Calendar works on Safari, Chrome, Firefox, Edge

---

## UI/UX Specifications

**Color Coding**:
- Lessons: Blue (#2E7D32)
- Assignments: Yellow (#F39C12)
- Exams: Red (#E74C3C)
- Meetings: Purple (#8E44AD)
- School Events: Gray (#34495E)

**Interaction Patterns**:
- Click event to view/edit details
- Drag event to reschedule (if permitted)
- Right-click context menu for quick actions
- Keyboard shortcuts: arrow keys to navigate, Enter to open event

---

## Success Criteria
✅ Timetable auto-generates without conflicts  
✅ Manual drag-and-drop adjustments work smoothly  
✅ Calendar syncs with timetable in real-time  
✅ All event types can be created and managed  
✅ Students see only relevant calendar events  
✅ Teachers can manage their assignments and exams  
✅ Admins have full timetable control  
✅ Push notifications appear 24 hours before due dates  
✅ PDF exports are professional and printable  
✅ Mobile calendar is fully functional  
