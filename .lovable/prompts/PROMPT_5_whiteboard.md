# 🖥️ PROMPT 5 – iSchool Whiteboard (Live Online Classroom)

## Objective
Build a professional, feature-rich live online classroom engine comparable to ClassIn or BigBlueButton. The Whiteboard is the core synchronous teaching space where teachers lead live lessons with embedded collaboration tools.

---

## Session Management

### Session Creation & Sharing

**Teacher Initiation**:
- Option 1: "Start Live Lesson" button on Teacher Dashboard
- Option 2: Click a lesson in timetable → auto-populate session details
  - Auto-fill: subject, class/stream, expected duration
  - Pre-selected participants (the assigned class)
  - Auto-generated session title: "[Subject] - [Class] - [Date/Time]"

**Session Link Generation**:
- Unique session URL: `iSchoolVerse.app/whiteboard/session/{sessionId}`
- No external login required (students use existing iSchoolVerse auth)
- Link validity: from start time until end time + 1 hour grace period
- Teacher can disable link after session ends (archive session)

**Participant Sharing**:
- Calendar notification sent to all students in class
- Email notification with clickable session link (optional)
- In-app notification: bell icon with session count
- WhatsApp/SMS share button (copy link to clipboard)

---

### Lobby & Waiting Room

**Pre-Session Waiting Room**:
- Display: "Waiting for teacher to start session..."
- Students can preview who else is waiting
- List of participants: name, avatar, status (ready, waiting)
- Teachers see count of students waiting before admitting

**Admission Control** (Teacher):
- "Admit All" button: let everyone in at once
- Individual admission: teacher can approve students one-by-one
- Reject button: deny entry (student sees "You were not admitted")
- Waiting room shows even after session starts (latecomers join waiting room first)

**Audio/Video Test** (Optional):
- During waiting: students can test mic and camera
- Indicator: "✓ Audio OK", "✗ Camera Not Available"
- Device permission request: browser prompts once

---

## Live Classroom Features

### 1. Video Conferencing

**Multi-Participant Video Grid**:
- Teacher video: large (top-left or center if priority mode)
- Student videos: smaller tiles in a responsive grid
- Grid layout adapts to screen size:
  - Desktop: 2-6 video tiles visible, scroll for more
  - Tablet: 2-4 tiles
  - Mobile: 1 tile + scroll
- Video quality auto-adjusts based on bandwidth

**Video Controls** (on each tile & for own video):
- **Mute/Unmute Mic**: toggle icon
  - Visual indicator: red dot when muted
  - Keyboard shortcut: M
  
- **Camera On/Off**: toggle icon
  - Shows avatar/name instead when camera off
  - Keyboard shortcut: V
  
- **Participant Name Label**: always visible below video
  - Add "🙋 Hand Raised" badge if student raised hand

**Teacher-Specific Controls**:
- **Mute All**: teacher can mute all students' mics at once
- **Mute Individual**: click student video → mute option
- **Remove Participant**: kick out disruptive student (with confirmation)
- **Spotlight**: enlarge one student's video (e.g., for presenting)
- **Record**: button to start/stop recording (prominently displayed)

**Student-Specific Controls**:
- **Raise Hand**: button to signal teacher
  - Visual: hand icon appears on student's tile
  - Notification: teacher gets alert with student name
  - Teacher can lower hand or grant speaking privilege
  
- **Participant List Panel** (sidebar):
  - Scrollable list of all participants
  - Green dot: camera on, Gray dot: camera off
  - Hand raised icon: for participants with hands up
  - Teacher can search/filter by name

---

### 2. Digital Whiteboard Canvas

**Canvas Features**:
- Infinite scrollable 2D canvas (pan and zoom)
- Default zoom: 100%, range 10% - 400%
- Mouse wheel zoom or pinch-zoom on touch devices
- Pan: right-click + drag or space + drag

**Drawing Tools** (in toolbar):
1. **Pen Tool**:
   - Stroke width: 1-10px (slider)
   - Color picker: full spectrum (12 preset colors + custom picker)
   - Smoothing: automatic line smoothing for cleaner strokes
   - Pressure sensitivity (if stylus/tablet connected)

2. **Highlighter Tool**:
   - Semi-transparent strokes (50% opacity)
   - Yellow by default (color picker available)
   - Stroke width: 2-20px
   - Use case: highlight key points in diagrams

3. **Eraser Tool**:
   - Stroke width: 5-30px
   - Erases individual strokes (not pixels)
   - Quick erase: click stroke to delete entire stroke

4. **Shape Tools**:
   - **Circle**: click and drag to draw circle
   - **Rectangle**: click and drag to draw rect
   - **Triangle**: click 3 points to form triangle
   - **Arrow**: draw line with arrowhead (direction dictated by drag)
   - **Line**: straight line between two clicks
   - Color + fill options
   - Stroke width customizable

5. **Text Tool**:
   - Click to place text box
   - Font selection: sans-serif, serif, monospace
   - Font size: 8-72pt
   - Bold, italic options
   - Text color from color picker
   - Edit text by clicking again

6. **Sticky Notes**:
   - Click to place note
   - Default: yellow, size ~3x3 inches
   - Type text directly
   - Color options: yellow, pink, blue, green
   - Drag to move around canvas
   - Delete button (X on corner)
   - Use case: brainstorming, collecting student ideas

**Undo/Redo Stack**:
- Unlimited undo (stores 50+ actions)
- Undo button & keyboard shortcut (Ctrl+Z / Cmd+Z)
- Redo button & keyboard shortcut (Ctrl+Y / Cmd+Y)
- Clear Canvas button: wipe all drawings (confirmation required)

**Real-Time Sync**:
- All drawings sync to students in < 200ms latency
- Each user sees other users' cursors (with name label)
- Collaborative editing: multiple students can draw simultaneously
- Conflict resolution: last-write-wins for simultaneous strokes

---

### 3. Screen Sharing

**Teacher Screen Share**:
- "Share Screen" button in toolbar
- Browser dialog: select full screen, browser tab, or application window
- Screen stream appears in canvas area (replaces whiteboard, or slides to side panel)
- **Quality options**: auto, 1080p, 720p, 480p (adjust for bandwidth)
- **Stop Sharing** button to exit screen share

**Student Screen Share** (with teacher permission):
- Teacher grants permission per student
- Student can then choose to share (same dialog as teacher)
- Teacher can revoke permission
- Use case: student presents solution to class

**Screen Share Display**:
- Takes up main canvas/whiteboard area
- Can still access whiteboard tools (overlay on shared screen)
- Chat and video grid remain visible (side panels)

---

### 4. Content Sharing

**Open iSchoolBook Content**:
- "Open Content" button → select subject/topic/subtopic
- iSchoolBook content displays in split pane (left) or overlay
- Teacher can click through content while discussing
- Students follow along with same content view
- Can switch between whiteboard and content seamlessly

**Embed PhET Simulations**:
- "Insert PhET Simulation" → search by name
- PhET interactive loads in canvas area
- Teacher can demonstrate physics/chemistry concepts live
- Students can interact with simulation (if teacher enables)
- Real-time sync of simulation state (all see same experiment)

**Share Custom Link**:
- "Paste Link" → paste any URL
- Loads in overlay/side panel
- Useful for: external resources, videos, diagrams
- Access: click link or open in new tab option

---

### 5. Live Quizzes

**Launch Quiz** (Teacher):
- "Start Quiz" button → select quiz from library
- Quiz types:
  - **Multiple Choice**: show 4-5 options, students click answer
  - **Multiple Selection**: "Select all that apply"
  - **Short Answer**: students type response (50-200 chars)
  - **True/False**: simple binary choice

**Quiz Display** (Students):
- Full-screen quiz interface (minimal distraction)
- Question text + options/input field
- Timer (if set by teacher): countdown visible
- "Submit Answer" button (disabled until teacher opens quiz)

**Quiz Workflow**:
1. Teacher launches quiz
2. Quiz appears on all students' screens
3. Teacher sets timer (e.g., 60 seconds) and opens for submissions
4. Students select answer and click submit
5. Timer expires → teacher sees results
6. Teacher reveals answers (show correct answer + student responses)

**Results Display** (Real-Time Bar Chart):
- Horizontal bar chart: answer options (A, B, C, D) on Y-axis
- Bar length = # students who chose that option
- Color-coded: green bar for correct answer
- Show %: "A: 12 students (30%)", "B: 28 students (70%)"
- Display name of correct answer below chart
- Brief explanation (if teacher provided)

**Quiz Features**:
- Multiple quizzes per session
- Can pause and return to whiteboard
- Results saved for attendance/Monitor tracking
- Teacher can show/hide answer key

---

### 6. Chat Panel

**Chat Sidebar**:
- Fixed right panel (collapsible on mobile)
- List of all messages with: sender name, timestamp, message text
- Scroll to view message history (scrollback 100+ messages)

**Message Composition**:
- Text input at bottom of chat
- Character limit: 2000 chars (warn at 1800)
- Auto-focus: click anywhere in chat area
- Keyboard: Enter to send, Shift+Enter for new line

**Emoji Support**:
- Emoji picker: smiley face button → emoji grid
- Quick-access to recent emojis
- Support: 👍 👎 🙌 😂 ❤️ 🤔 etc.
- Shortcut codes: `:smile:` → 😊

**Teacher Moderation**:
- **Pin Message**: right-click message → "Pin for All"
  - Pinned message appears at top of chat (highlighted)
  - Use case: "Important: Save this link..."
  - Max 3 pinned messages
  
- **Delete Message**: right-click own message → delete
  - Teacher can delete any message
  - Deleted messages show: "[Deleted by teacher]"

- **Mute Student Chat**: click student name → "Mute Chat"
  - Student can't send messages (but can receive)
  - Muted indicator appears next to student name
  - Teacher can unmute anytime

**Chat Features**:
- Timestamp for each message (HH:MM AM/PM)
- Show number of unread messages (badge on chat tab)
- Message reactions: students can emoji-react to messages (like in Slack)
- "At" mentions: type `@studentname` to highlight them

---

### 7. Breakout Rooms

**Teacher Creates Breakout Rooms**:
- "Create Breakout Rooms" button
- Configure:
  - Number of rooms: 2-8
  - Room names (auto-labeled "Room 1, Room 2" or custom)
  - Assign students: auto-divide equally or manual assignment
  - Max time in breakout: 10-60 minutes (optional countdown)

**Launch Rooms**:
- Teacher opens rooms → all students auto-routed to assigned room
- Each room has: video grid, whiteboard, chat (separate per room)
- Teacher can visit rooms one-by-one (listen/monitor)
- 60-second countdown warning before rooms close

**Breakout Room Interface** (per student):
- Smaller participant grid (just their room)
- Room-specific whiteboard (each room has independent canvas)
- Room chat (messages don't cross to main session)
- "Room 2" label visible at top
- Leave room early: back to main session (if teacher allows)

**Teacher Monitoring**:
- Overview: list of rooms with status (active, completed, time left)
- "Visit Room" button: teacher joins that room temporarily
- "Record Room Activity": log whiteboard activity per room

**Return to Main Session**:
- Timer countdown: "Returning to main session in 60 seconds..."
- Teacher can skip countdown and force return
- All room whiteboards auto-archived
- Chat history of rooms saved to session recording

---

## Recording & Playback

### Automatic Recording

**Start Recording**:
- "Record Session" button → red indicator shows recording active
- Captures: video feed (all participants), audio (all mics), whiteboard (all strokes), chat messages, quiz answers
- Local indication: "● Recording" label in top-right
- Notification to students: "This session is being recorded"

**Recording Storage**:
- Auto-saved to Firebase Cloud Storage
- Duration: up to 8 hours per session
- File format: MP4 video + WebM + MP3 audio (for accessibility)
- Backup: cloud and optionally local download

### Playback & Access

**Playback Interface**:
- Video player with timeline (scrubber bar)
- Play/pause, speed control (0.5x to 2x), full-screen
- Synchronized display:
  - Main: video grid (all participants' video replay)
  - Overlay: whiteboard strokes replay in real-time
  - Sidebar: chat messages appear chronologically as video plays

**Features During Playback**:
- Timestamp captions (show time like "10:35")
- Jump to timestamp: click on chat message to jump to that moment in video
- Download option: "Download Recording" (students can't download, teachers/admins can)
- Speed playback: skip through recording faster

**Recording Availability**:
- **Students**: can replay anytime after session ends
- **Teachers**: can replay and download
- **Admins**: full access to all recordings
- **Parents**: can't access (privacy)
- Retention: keep for 1 term (auto-delete old recordings)

---

## "Save Board to Notes" Feature

**Export Whiteboard to Notes**:
- During or after session: "Save Board to Notes" button
- Trigger: creates a snapshot of current board state
- Dialog:
  - Select which students this exports to
  - Add optional caption: "Here's the diagram we drew..."
  - Select destination: which note topic

**Result**:
- Whiteboard snapshot (high-res image) embedded in student's iSchool Notes
- Linked to the lesson topic
- Students can mark it up with their own annotations
- Teacher can see what students added on top of the board

**Batch Save**:
- Save entire board history as a series of images (step-by-step)
- Create animated GIF of board evolution (if supported)

---

## Integration with Other Modules

### Session Auto-Linking

**Timetable Integration**:
- Whiteboard session auto-links to scheduled lesson slot
- Session context shows: subject, class, teacher from timetable
- Lesson marked as "delivered" when session recording available

**iSchool Monitor Integration**:
- Attendance recorded: every join timestamped with student ID
- Duration tracked: time from join to leave
- Engagement metrics: # quiz attempts, # messages sent, # hands raised
- Real-time: dashboard updates as session progresses

**iSchool Notes Integration**:
- Session recording linked in notes page
- "Playback Lesson Recording" button in student notes
- Board export auto-saves to notes (as discussed above)
- Notes written during/after session can link to specific timecode

**iSchoolBook Integration**:
- Content opened during session is logged
- If PhET simulation used: log which simulation and student interactions
- Cross-reference in learning analytics

---

## UI/UX Specifications

### Layout & Responsiveness

**Desktop (1920px+)**:
- Left: Large teacher video (40% width) + participant grid below
- Center: Whiteboard canvas (60% of remaining space)
- Right: Chat sidebar + Participant List (collapsible)
- Top: Toolbar with all session controls

**Laptop (1024-1920px)**:
- Stacked: Video grid on top (50%), whiteboard below (50%)
- Right sidebar: chat + participants (collapsible)

**Tablet (768-1024px)**:
- Full-width whiteboard
- Video grid as collapsible panel
- Chat slides in from right
- Toolbar icons are larger for touch

**Mobile (< 768px)**:
- Simplified layout: whiteboard full-width
- Video/chat as tabs at bottom
- Toolbar icons stack vertically
- Portrait orientation: whiteboard scales down
- Landscape: better fit for drawing

### Color Scheme
- **Background**: Dark gray (#2C3E50) for reduced eye strain
- **Whiteboard Canvas**: White (#FFFFFF)
- **Toolbar**: Dark (#263238)
- **Active Button**: Gold (#F5A623)
- **Muted Indicator**: Red (#E74C3C)
- **Hand Raised**: Bright Yellow (#F1C40F)

### Accessibility
- All buttons have tooltips (hover on desktop, long-press on mobile)
- Keyboard shortcuts for all major functions
- High contrast colors for visibility
- Screen reader support for all UI elements
- Captions for video (auto-generated via speech-to-text optional)

---

## Technical Requirements

### Real-Time Communication
- **Video/Audio**: WebRTC for P2P or MCU architecture
- **Whiteboard Sync**: Socket.io or WebSocket for low-latency drawing sync
- **Chat**: Socket.io with message queuing
- **Latency Target**: < 200ms for all interactions

### Performance
- Handle 50+ concurrent participants smoothly
- Video quality adapts based on network bandwidth
- Whiteboard canvas: no lag during drawing (< 16ms input latency)
- Recording doesn't impact live performance

### Recording & Storage
- Video encoding: H.264 (MP4), VP8 (WebM)
- Audio encoding: AAC, Opus
- Storage: Firebase Cloud Storage
- CDN delivery: fast playback from anywhere

### Browser Compatibility
- Chrome, Firefox, Safari, Edge (all modern versions)
- Mobile: iOS Safari, Chrome Mobile
- Fallback: if WebRTC unavailable, graceful degradation to audio-only

---

## Success Criteria
✅ Teachers can start sessions and share links  
✅ Students join via unique link with no external login  
✅ Waiting room shows before teacher admits  
✅ Video grid displays and syncs for all participants  
✅ Whiteboard tools work smoothly without lag  
✅ Drawing syncs to all students in real-time  
✅ Screen sharing works (teacher + optional student)  
✅ PhET simulations embed and run interactively  
✅ iSchoolBook content opens in overlay  
✅ Live quizzes launch and show results chart  
✅ Chat works with emoji and pinned messages  
✅ Breakout rooms separate students into sub-sessions  
✅ Session auto-records video, audio, board, chat  
✅ Playback syncs video with board replay  
✅ "Save Board to Notes" exports snapshots to student notes  
✅ Attendance auto-records in iSchool Monitor  
✅ Mobile layout is fully functional (tablets & phones)  
✅ Responsive on all screen sizes  
✅ Recording loads < 5 seconds  
✅ Real-time sync latency < 200ms  
