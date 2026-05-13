# 📊 PROMPT 4 – iSchool Monitor & iSchool Reports (Analytics & Academic Intelligence)

## Objective
Build comprehensive teaching analytics (Monitor) and academic reporting (Reports) systems that track engagement, attendance, and academic performance with professional visualizations and actionable insights.

---

## iSchool Monitor – Teaching Analytics Engine

### Lesson Attendance Auto-Recording

**Trigger Events**:
- When student joins a whiteboard session
- Timestamp recorded: exact join and leave times
- Auto-linked to: student iSchoolVerse ID + timetable lesson slot
- Connection metadata: join method (web, mobile), network quality

**Data Captured**:
- Student ID, name, class/stream
- Lesson ID, subject, teacher, date/time
- Join timestamp, leave timestamp
- Duration (calculated as leave - join)
- Status: Present, Late, Left Early
- Attendance flagged if student joined after 5 minutes of lesson start

---

### Per-Student Metrics

**Tracking Dashboard**:
- **Lessons Attended**: Count this term (cumulative)
- **Lessons Missed**: Count with absence tracking
  - Excused vs. unexcused (admin flags absences)
  - Pattern detection: consecutive absences trigger alert
  
- **Time-on-Task Per Subject**: 
  - Total hours spent in whiteboard sessions per subject
  - Total time spent in iSchool Notes per subject (reading + writing)
  - Combined learning time per subject
  - Visual: stacked bar chart showing whiteboard vs. notes time
  
- **Engagement Score** (0-100):
  - Algorithm: (attendance_rate × 40%) + (avg_participation_in_quizzes × 30%) + (notes_completion_rate × 20%) + (assignment_submission_rate × 10%)
  - Recalculated weekly
  - Color-coded: Green (80+), Yellow (60-79), Red (< 60)
  - Trend sparkline: last 4 weeks

**Student Engagement Report** (for their own dashboard):
- This week's engagement score
- Most active subject (by time-on-task)
- Attendance rate this term %
- Recommended: "Spend more time on [low-attendance subject]"

---

### Per-Teacher Metrics

**Teacher Performance Dashboard**:
- **Lessons Delivered vs. Planned**
  - This term: X lessons scheduled, Y lessons delivered
  - % delivery rate (target: 95%+)
  - Missing lessons flagged (e.g., lesson scheduled but no whiteboard session)
  - Bar chart: planned (blue) vs. delivered (green) by week

- **Average Lesson Duration**: 
  - Total teaching minutes / number of lessons delivered
  - Compare to expected period length (e.g., 45 min)
  - Trend: are lessons getting longer or shorter this term?

- **Students Per Session**:
  - Average attendance per lesson
  - Min/max class sizes
  - Attendance rate per class (e.g., "Form 1A: 92%, Form 1B: 78%")

**Teacher Analytics Dashboard**:
- Card: lessons delivered (number)
- Card: average class size (students)
- Card: attendance rate (%)
- Chart: weekly lesson delivery trend
- Table: per-class attendance breakdown

---

### Admin Dashboard – School-Wide Analytics

**Heatmap: Attendance by Subject & Class**
- Grid: rows = subjects, columns = classes/streams
- Cell color intensity = attendance rate %
- Dark green (90%+), yellow (70-89%), red (< 70%)
- Hover cell for detailed stats
- Identify patterns: "Class Form 2A has low Physics attendance"

**Subject Activity Analysis**:
- Ranking: Most to least active subjects (by total student hours)
- Bar chart: subject names vs. cumulative student-hours this week
- Highlights: "Mathematics has 50% of school's learning time"
- Recommendation alerts: "Low engagement in History — investigate"

**Teacher Delivery Rates**:
- Table: teacher name, lessons planned, lessons delivered, delivery %
- Highlight teachers below 90% delivery
- Filter by subject or date range

**Real-Time System Status**:
- Users online now: count by role (students, teachers, admins)
- Peak usage times: graph showing concurrent users throughout day
- System health: data sync status, server response time

---

### Missed Lesson Alerts

**Automatic Notifications**:
- **To Student**: "You missed [Subject] on [Date]. See notes and catch up."
  - Link to iSchoolBook content
  - Link to recorded lesson (if available)
  - Button: "Mark as excused absence"

- **To Parents** (if parent account exists):
  - "Your child missed [X] lessons this term"
  - Link to view attendance record
  - Contact teacher button

- **To Teachers**:
  - "Student [Name] has missed 3+ lessons in your subject"
  - Quick action: mark as excused or follow up

---

## iSchool Reports – Academic Intelligence System

### Score Input Interface (Teachers)

**Assessment Entry**:
- Teacher selects: subject, class/stream, assessment type
- Assessment types:
  - **Continuous Assessment (CA)**: homework, class work, participation, projects
  - **Terminal Exams**: final term exams
  - **Mid-Term Tests**: periodic assessments

**Bulk Score Entry**:
- Table view: rows = students, columns = assessment scores
- Sortable by name, ID, or current score
- Quick-entry: tab to move between cells
- Import option: upload CSV with scores
- Validation: flags invalid scores (< 0 or > max)

**Score Metadata**:
- Max score per assessment
- Assessment weight (e.g., CA worth 30%, exams worth 70%)
- Date of assessment

---

### Automated Grade Calculations

**Grade Calculation Logic**:
1. **Per-Subject Score**:
   - Weighted average: (CA_scores × CA_weight) + (Exam_score × Exam_weight)
   - Example: (85 × 0.3) + (92 × 0.7) = 89.9 out of 100

2. **Grade Letter**:
   - A: 80-100
   - B: 70-79
   - C: 60-69
   - D: 50-59
   - E: 0-49

3. **Class Rank** (calculated per class/stream):
   - Rank student's overall score among classmates
   - Example: "Rank 3 of 45 students"

4. **Subject Averages**:
   - School-wide average for each subject
   - Compare individual score to average
   - Display: "Your score: 88 | Class avg: 76"

5. **Overall Grade** (across all subjects):
   - Average of all subject grades
   - Overall class rank (e.g., "Top 5% of school")
   - GPA equivalent (4.0 scale, if school uses GPA)

---

### Report Card Generation

**Professional Report Card Template**:

```
┌─────────────────────────────────────────┐
│ iSchoolVerse Academic Report Card       │
│ Term: 2 | Year: 2026 | School: XYZ     │
├─────────────────────────────────────────┤
│ Student: [Name]                         │
│ ID: ISV-STU-000127                      │
│ Class: Form 2A                          │
│ Period: May 1 - May 31, 2026            │
├─────────────────────────────────────────┤
│ [Student Photo Placeholder]             │
├─────────────────────────────────────────┤
│                                         │
│ ACADEMIC RESULTS                        │
│ ┌────────┬────────┬─────┬──────┐      │
│ │Subject │ Score  │Grd  │Rank  │      │
│ ├────────┼────────┼─────┼──────┤      │
│ │Math    │ 88/100 │ A   │ 2/45 │      │
│ │English │ 92/100 │ A   │ 1/45 │      │
│ │Science │ 75/100 │ B   │ 15/45│      │
│ │History │ 68/100 │ C   │ 28/45│      │
│ └────────┴────────┴─────┴──────┘      │
│                                         │
│ OVERALL PERFORMANCE                     │
│ ├─ Overall Score: 80.75                │
│ ├─ Overall Grade: A                    │
│ ├─ Class Rank: 5 of 45                 │
│ └─ Attendance: 92%                     │
│                                         │
│ PERFORMANCE TREND (3-Term Chart)        │
│ [Line graph: scores across terms]       │
│ Math:    ↗ (improving)                  │
│ English: → (stable)                     │
│ Science: ↘ (declining)                  │
│                                         │
│ TEACHER REMARKS                         │
│ "Overall good progress. Needs to focus │
│  on Science concepts. Excellent        │
│  participation in class discussions." │
│                                         │
│ [Signature Placeholder]                 │
│ Headmaster / Principal                  │
│ Date: 31 May, 2026                      │
└─────────────────────────────────────────┘
```

**PDF Export**:
- Professional formatting with school logo
- A4 or custom page size
- Print-ready quality
- Bulk export: all students in a class at once
- Digital signature option (admin initials)

---

### Report Visibility & Access

**Student View**:
- Own report card only
- Results by subject with grades
- Performance trend chart (across terms)
- Attendance summary
- Teacher remarks (if included)

**Teacher View**:
- Subject results for all assigned classes
- Class performance analytics (below)
- Individual student results
- Ability to add remarks to student reports

**Parent View** (if parent accounts exist):
- Own child's report card
- Performance trend over terms
- Download PDF for records

**Admin View**:
- All students' report cards
- Filtering: by class, stream, subject, term
- Export all reports as batch PDF

---

### Class Performance Analytics

**Aggregate Stats** (per class/stream/subject):
- **Top 10 Students**: Ranked by score in subject
- **Subject Pass Rate**: % of students scoring ≥ 50
  - Target: 80%+ pass rate
  - Alert if below 60%
  
- **Grade Distribution Chart**:
  - Pie chart: % of A's, B's, C's, D's, E's
  - Compare to school average distribution
  - Example: "Form 1A: 30% A's, 45% B's, 20% C's, 5% below C"

**Subject Performance Comparison**:
- Bar chart: all subjects ranked by average score
- Highlight high-performing and struggling subjects
- Trend: Is Biology getting harder or easier this term?

**Teacher Comparison** (for same subject across classes):
- Multi-line chart: average score by teacher
- Fair comparison (account for class composition)
- Highlight best-performing teachers (for mentoring/training)

---

### Filter & Report Options

**Quick Filters**:
- By Term: previous terms or current term
- By Class/Stream: select single or multiple
- By Subject: single subject or all subjects
- By Individual Student: name/ID search
- By Date Range: custom reporting period

**Report Export Options**:
- PDF: professional report card template
- Excel: spreadsheet with all scores and calculations
- CSV: for external analysis or import to other systems

---

### Insights & Recommendations

**Student-Level Insights**:
- "Your Math score improved 5 points from last term"
- "You rank in top 10% of your class"
- "Science needs attention — schedule tutoring"

**Teacher-Level Insights**:
- "Your Form 1A class avg: 82 | School avg: 76 (excellent!)"
- "Your Form 2B has 15% failing rate — consider remedial classes"

**Admin-Level Insights**:
- "Overall school avg: 74 | Target: 75 (close!)"
- "Physics trending downward — 3-term decline"
- "Teacher retention insight: high performers should mentor low performers"

---

## Technical Specifications

### Data Model
- **Score**: ID, student_id, subject_id, teacher_id, assessment_type, score, max_score, date, term
- **Grade**: calculated field (auto-derived from scores)
- **Rank**: calculated field (per class, per term)
- **ReportCard**: ID, student_id, term, generated_date, pdf_url, remarks

### Calculation Engine
- Real-time score updates trigger automatic recalculation
- Grade calculations use transaction-safe Firestore updates
- Caching: rank calculations (run once per day)

### Performance
- Report generation: < 5 seconds per student PDF
- Analytics dashboard loads: < 2 seconds
- Score import: 500+ students in < 10 seconds

---

## UI/UX Specifications

**Monitor Dashboard Colors**:
- Attendance: Green (good), Yellow (warning), Red (critical)
- Engagement Score: Green (80+), Yellow (60-79), Red (< 60)
- Charts: Blue (attendance), Orange (time-on-task), Green (engagement)

**Reports Colors**:
- Grades: Green (A/B), Yellow (C/D), Red (E)
- Trend arrows: ↗ (up), → (stable), ↘ (down)
- Charts: Bar charts in subject colors, line graphs in contrasting colors

---

## Success Criteria
✅ Attendance auto-records when students join whiteboard sessions  
✅ Engagement score calculates and displays for each student  
✅ Teacher metrics show delivery rates and class averages  
✅ Admin heatmap reveals attendance/engagement patterns  
✅ Scores can be entered by teacher (bulk and individual)  
✅ Grades auto-calculate with rank and averages  
✅ Report cards generate as professional PDFs  
✅ Students see only their own reports  
✅ Teachers see subject results for their classes  
✅ Admins can filter and export all reports  
✅ Class performance analytics are visual and actionable  
✅ Push alerts notify students of missed lessons  
✅ Parent notifications (if enabled) are sent automatically  
