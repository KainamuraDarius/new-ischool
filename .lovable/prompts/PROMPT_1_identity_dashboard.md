# 🔐 PROMPT 1 – Unified Identity, Onboarding & Master Dashboard

## Objective
Build the iSchoolVerse master authentication and dashboard system with professional onboarding flow, unique user identification, and role-based personalized dashboards.

---

## Core Requirements

### 1. School Registration & Onboarding Flow
- **School Registration**: Schools register with a unique school code
- **Admin Account Creation**: First admin creates their account upon school registration
- **Teacher/Student Management**: Admins create teacher and student accounts within their school
- **Unique iSchoolVerse ID**: Every user receives `ISV-ROLE-XXXXXX` format ID
  - Example: `ISV-STU-000127`, `ISV-TCH-004521`, `ISV-ADM-000015`
- **Role-Based Access Control**: Three roles with distinct permissions
  - **Student**: Access to timetable, assignments, notes, calendar, reports
  - **Teacher**: Full lesson management, attendance tracking, assessment creation, class analytics
  - **Admin**: School-wide analytics, user management, system configuration, reports oversight

---

## Dashboard Specifications

### Student Dashboard
**Layout**: Split sidebar + main content area

**Primary Widgets** (in order of importance):
1. **Today's Timetable Card**
   - Display today's 3-4 upcoming lessons
   - Show subject, teacher name, time, room
   - Color-coded by subject
   - "Join Live Lesson" button appears when whiteboard session is active

2. **Upcoming Assignments & Exams**
   - 5-day lookahead calendar
   - Due dates with urgency indicators (red if due within 24 hours)
   - Quick link to assignment details

3. **Recent Notes Card**
   - Last 3-5 notes accessed
   - Subject + timestamp
   - One-click access to edit

4. **Performance Summary Card**
   - Grades trend sparkline chart
   - Current overall score
   - Best/worst subjects
   - Link to full report card

5. **Quick Links Row**
   - View Full Timetable
   - Browse iSchoolBook
   - View Calendar
   - Access Reports

---

### Teacher Dashboard
**Layout**: Split sidebar + main content area

**Primary Widgets**:
1. **Today's Lessons to Teach**
   - Time, subject, class/stream, room, student count
   - "Start Live Lesson" button (links to Whiteboard)
   - Cancel/reschedule option
   - Lesson preparation checklist (if resources attached)

2. **Class Attendance Summary**
   - Table: class/stream name, enrollment, present today, absent, late
   - Trend: attendance rate % for the week
   - Missing attendance flag for unrecorded lessons

3. **Pending Assessments to Mark**
   - List of submitted assignments/quizzes awaiting grading
   - Student name, submission date, status
   - One-click access to grading interface
   - Days overdue indicator (red)

4. **Lesson Analytics Card**
   - Bar chart: lessons planned vs. delivered this term
   - Average lesson duration this week
   - Total students taught this week

5. **Notifications Bell**
   - Unread assignment submissions
   - Low attendance alerts
   - Parent inquiry notifications

---

### Admin Dashboard
**Layout**: Split sidebar + main content area

**Primary Widgets**:
1. **School-Wide Analytics Summary**
   - Total users online (real-time)
   - Total lessons this week
   - Average attendance rate %
   - Overall system health indicator

2. **Active Users Online (Real-Time)**
   - Count of logged-in students, teachers, admins
   - Who's online right now (quick view)
   - Status indicators (in lesson, idle, etc.)

3. **Timetable Overview**
   - Week view mini-calendar
   - Total periods scheduled
   - Conflict indicators (if any remain)
   - Most active class/stream
   - Teacher load balance visualization

4. **Reports Summary Widget**
   - Link to generate term reports
   - Last report generation date
   - Quick filters: by class, by subject

5. **System Alerts & Notifications**
   - New user registrations pending approval
   - Data sync issues
   - Backup status
   - Permission requests from teachers/parents

---

## UI/UX Design Specifications

### Visual Design
- **Color Palette**:
  - Primary: Deep Navy Blue (#0D1B2A)
  - Secondary: White (#FFFFFF)
  - Accent: Gold (#F5A623)
  - Status colors: Green (#27AE60 - success), Red (#E74C3C - alert), Yellow (#F39C12 - warning)
  
- **Typography**:
  - Headlines: Bold, 24-32px
  - Body text: Regular, 14-16px
  - Card titles: Semi-bold, 16-18px

### Layout Components
1. **Sidebar Navigation**
   - Module icons with labels
   - Collapsible on mobile
   - User profile section with avatar and iSchoolVerse ID
   - Logout button

2. **Top Bar**
   - Notifications bell with unread count badge
   - Search bar (global module search)
   - User avatar with dropdown (settings, profile, logout)
   - Real-time clock/date

3. **Main Content Area**
   - Card-based widget layout
   - Grid system (4 columns on desktop, 2 on tablet, 1 on mobile)
   - Smooth hover transitions and animations
   - Loading skeleton states for widgets

4. **Cards & Widgets**
   - Border-radius: 8-12px
   - Box shadow: subtle (0 2px 8px rgba(0,0,0,0.1))
   - Padding: 16-24px
   - Smooth transitions on hover (200ms ease)

---

## Responsiveness Requirements
- **Desktop** (1920px+): Full sidebar, 4-column grid, all widgets visible
- **Laptop** (1024-1920px): Full sidebar, 3-column grid
- **Tablet** (768-1024px): Collapsible sidebar, 2-column grid
- **Mobile** (< 768px): Sidebar hidden, hamburger menu, 1-column stack, stacked cards

---

## Technical Implementation Notes

### Authentication & Authorization
- Integrate with existing Firebase auth
- Store user role and iSchoolVerse ID in Firestore user document
- Implement role-based route guards
- Session management: persist login for 7 days (with optional "Remember Me")

### Dashboard Data Loading
- Fetch user profile and role on app initialization
- Lazy-load dashboard widgets (prioritize above-the-fold)
- Real-time listeners for notifications and online status
- Cache dashboard data with 5-minute refresh intervals

### Performance Requirements
- Initial dashboard load: < 2 seconds
- Widget load time: < 1 second each (lazy loaded)
- Smooth 60 FPS animations and transitions
- Mobile-optimized: < 100KB initial JS bundle for dashboard

---

## Integration Points
- **Timetables Module**: Fetch today's lessons and generate "Join Live Lesson" buttons
- **Calendar Module**: Display upcoming assignments and exams
- **Monitor Module**: Pull attendance and engagement metrics for performance cards
- **Reports Module**: Link to student/teacher reports
- **Whiteboard Module**: Enable "Start/Join Live Lesson" buttons
- **Notifications**: Subscribe to real-time updates for alerts and badges

---

## Success Criteria
✅ All three roles have distinct, purpose-built dashboards  
✅ iSchoolVerse ID is displayed and persistent  
✅ Dashboard loads within 2 seconds  
✅ Responsive on desktop, tablet, and mobile  
✅ All navigation and action buttons are functional  
✅ Notifications appear in real-time  
✅ Users can navigate to all major modules from dashboard  
