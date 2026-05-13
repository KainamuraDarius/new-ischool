# 📖 PROMPT 3 – iSchoolBook & iSchool Notes (Content & Learning Workspace)

## Objective
Build a comprehensive digital content engine (iSchoolBook) paired with an interactive learner workspace (iSchool Notes) that enables rich content delivery, note-taking, and integrated learning experiences.

---

## iSchoolBook – Digital Content Engine

### Content Organization Hierarchy

**Structure**:
```
Subject (e.g., "Biology")
  ├── Topic (e.g., "Cell Structure")
  │   ├── Subtopic (e.g., "Prokaryotic vs. Eukaryotic Cells")
  │   └── Subtopic (e.g., "Cell Organelles")
  └── Topic (e.g., "Photosynthesis")
      └── Subtopic (e.g., "Light Reactions")
```

**Content Ownership**:
- Admins: Can create/edit all subjects and topics
- Teachers: Can create/edit content for their assigned subjects
- Students: Read-only access to content

---

### Content Format Support

**Supported Media Types**:
1. **Rich Formatted Text**
   - Headings (H1-H6), bold, italic, underline, strikethrough
   - Bullet lists and numbered lists
   - Tables (with sortable columns)
   - Code blocks (with syntax highlighting for CS topics)
   - Block quotes and callout boxes (e.g., "Important: ...", "Example: ...")

2. **Embedded Videos**
   - YouTube embedded player
   - Vimeo embedded player
   - Local MP4 uploads (video preview thumbnail)
   - Video timeline with bookmarks (teachers can add chapter markers)

3. **Image Galleries**
   - Multi-image upload interface
   - Lightbox view (click to expand full-screen)
   - Captions for each image
   - Inline images in text (wrapped with captions)
   - Diagram upload support

4. **Hyperlinks & Cross-Subject Integration**
   - Link to other topics within same subject
   - Link to related topics in other subjects
   - Example: "See also: Photosynthesis in Biology Topic X"
   - Link visualization: breadcrumb trail showing related content path

5. **Embedded Interactive Content**
   - **PhET Simulations**: Embed interactive physics/chemistry simulations
     - Link format: `<iframe src="https://phet.colorado.edu/sims/html/..." />`
     - Students can interact directly within the content
     - Sims include control panels for experiments
   
   - **3D Model Viewer Placeholder**
     - Embed zone labeled "3D Visualization Ready"
     - Three.js-ready container (prepared for 3D model loading)
     - Teachers can upload .obj, .gltf, or .glb models
     - Interactive rotation, zoom, pan controls
     - Use case: 3D anatomy models, molecular structures, architectural designs

---

### Content Management Interface (Admin/Teacher)

**Create/Edit Content**:
- WYSIWYG editor with formatting toolbar
- Sidebar: subject/topic/subtopic navigator
- Media upload panel: drag-and-drop for images/videos
- Preview mode: see how content will appear to students
- Version control: save drafts, publish to students
- Publish settings: schedule content release, set visibility by class

**Content Actions**:
- **Publish**: Make content visible to assigned classes
- **Archive**: Hide outdated content but retain for reference
- **Duplicate**: Clone a topic as template for new content
- **Reorder**: Drag topics/subtopics to reorganize hierarchy

---

### Student Content View

**Reading Interface**:
- Left sidebar: hierarchical topic navigator (collapsible)
- Main content area: full-width topic content
- Right sidebar: quick links to related topics and activities

**Progress Tracking**:
- **Reading Progress Bar**: % of content completed per topic
  - Automatic calculation based on scroll depth
  - Visual indicator at top of page
  - Milestone badges at 25%, 50%, 75%, 100% completion
  
**Navigation**:
- Previous/Next buttons to move between subtopics
- Breadcrumb trail showing current location
- "Back to Topic" button to return to parent topic

---

### Search Functionality

**Global Search Bar** (top of iSchoolBook):
- Instant search across all subjects, topics, subtopics
- Real-time filtering as user types
- Results grouped by: Subject → Topic → Subtopic
- Highlighting of matching keywords in preview
- Search filters: Subject, Teacher, Content Type (video, images, text)
- Recent searches history

**Search Results**:
- Title, breadcrumb path, snippet preview
- Thumbnail for image-heavy content
- Click to jump directly to result

---

## iSchool Notes – Learner Workspace

### Notes Structure

**One Notes Page Per Lesson/Topic**:
- Every topic in iSchoolBook has a linked Notes page
- Notes are stored per student per topic
- Auto-linked in iSchoolBook: "Go to My Notes" button
- Separate notes interface for focused learning

---

### Notes Editor Features

**Rich Text Capabilities**:
- Formatting toolbar: bold, italic, underline, code, links, lists
- Heading levels (H2-H5)
- Text color and highlight options
- Bullet/numbered lists with nesting
- Tables for organizing information

**Media Embedding**:
- Insert images (inline or full-width)
- Embed GIFs (from Giphy or upload)
- Embed YouTube videos (with timestamps)
- Audio recordings (voice memo upload)

**Advanced Annotation Tools**:
- **Highlight Tool**: Drag to select text → highlight in yellow (customizable color)
- **Annotation Comments**: Right-click highlighted text → add comment/note
- **Margin Notes**: Click margin to add sticky notes alongside text
- **Bookmark**: Mark important sections (quick jump-to list)

---

### Interactive Learning Elements

**Expandable Answer Boxes**:
- Teachers embed questions directly in notes template
- Example: "What is the process of photosynthesis? [Click to reveal answer]"
- Student clicks to expand and see answer
- Useful for fill-in-the-blank exercises
- Track student engagement: log if student revealed answer

**Inline Quizzes**:
- Teachers embed auto-scoring quizzes in notes
- Question types:
  - Multiple-choice (single or multiple selection)
  - Short-answer with keyword matching
  - True/False
- Auto-scoring: instant feedback on answers
- Results logged to student profile
- Teacher dashboard shows quiz performance stats

---

### Notes Template (Teacher-Prepared)

**Teachers Can Create**:
- Template structure with pre-filled sections
- Pre-embedded questions and exercises
- Example structure:
  ```
  ## Overview
  [Student fills in key concepts]
  
  ## Key Points
  1. [Blank for students to fill]
  2. [Blank for students to fill]
  
  ### Inline Quiz
  [Questions embedded by teacher]
  
  ## Activities of Integration
  [Cross-subject task description]
  ```

**Student Experience**:
- Opens template-based notes
- Fills in blanks and answers inline
- All edits saved automatically
- Can print or export to PDF

---

### Activities of Integration Section

**Cross-Subject Collaborative Tasks**:
- Per topic: section listing related topics from other subjects
- Example in Biology "Photosynthesis" topic:
  - Chemistry link: "Understand chemical equations involved"
  - Geography link: "Carbon cycle in different biomes"
  - Mathematics link: "Graph photosynthesis rate vs. light intensity"

**Integration Task Format**:
- Task title and description
- Link to related topic in other subject
- Collaborative indicators: "Group activity" or "Individual"
- Due date and submission method
- Teacher grading rubric (if applicable)

---

### Auto-Save & Sync

**Real-Time Auto-Save**:
- Content saves every 10 seconds (no manual save needed)
- Offline support: changes queued and synced when online
- Save indicator: subtle "Saved" notification at top
- Version history: restore to earlier version (last 7 days of versions)

**Sync to Student Profile**:
- All notes linked to student's unique iSchoolVerse ID
- Accessible from student dashboard
- Cloud-backed up to Firestore
- Can access notes from any device

---

## Split-Screen Side-by-Side View (iSchoolBook + Notes)

### Layout Configuration

**Desktop View** (1920px+):
- Left pane (50%): iSchoolBook content (read-only)
- Divider: draggable to resize
- Right pane (50%): iSchool Notes (editable)
- Both scroll independently

**Tablet View** (768-1024px):
- Stacked vertically: iSchoolBook on top, Notes below
- Full-width each
- Toggle buttons to focus on one pane

**Mobile View** (< 768px):
- Tab switcher: "Content" and "Notes" tabs
- Can't view both simultaneously (screen too small)
- Swipe between tabs

### Synchronization
- Both panes remain in sync for the same topic
- Clicking "Go to My Notes" in iSchoolBook opens Notes pane with focus
- Breadcrumb in Notes shows current topic path

---

## Technical Specifications

### Data Model
- **Subject**: ID, name, description, color
- **Topic**: ID, subject_id, title, content_html, media_array
- **Subtopic**: ID, topic_id, title, content_html
- **Note**: ID, user_id, subtopic_id, content_html, version_history, last_modified
- **Media**: ID, type (image/video/audio), url, caption, uploaded_by, created_at

### Editor Technology
- **Rich Text Editor**: Slate.js or TipTap with custom plugins
- **Media Upload**: Firebase Storage (Cloud Storage)
- **3D Viewer**: Three.js with Orbit Controls
- **Auto-Save**: Debounced Firestore updates (10s interval)

### Performance
- Content loads < 2 seconds
- Media lazy-loading for fast initial page load
- Notes editor response time: < 100ms keystroke
- Search results appear < 500ms

---

## UI/UX Color Scheme
- **iSchoolBook**: Clean white background, dark text
- **Notes Editor**: Light gray background (#F5F5F5) for contrast
- **Highlights**: Yellow (#FFEB3B)
- **Links**: Blue (#2196F3)
- **Code blocks**: Dark background (#263238) with syntax colors

---

## Success Criteria
✅ iSchoolBook content displays with all media types embedded  
✅ Topics are organized hierarchically and searchable  
✅ PhET simulations embed and run interactively  
✅ 3D viewer placeholder is ready for model integration  
✅ Student notes sync automatically to Firestore  
✅ Expandable answers and inline quizzes auto-score  
✅ Split-screen view works responsively on all devices  
✅ Cross-subject integration tasks are visible per topic  
✅ Reading progress bar tracks completion  
✅ Search finds content across all subjects instantly  
✅ Notes can be exported to PDF  
