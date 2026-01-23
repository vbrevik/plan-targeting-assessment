# Video Demo Recording Guide

**Purpose**: Record a walkthrough video of the SmartOps system for PowerPoint presentation  
**Duration Target**: 5-8 minutes per section  
**Resolution**: 1920×1080 (Full HD)

---

## Setup Instructions

### 1. Prepare Your Environment

```bash
# Terminal 1: Start the backend
cd backend
cargo run

# Terminal 2: Start the frontend
cd frontend
npm run dev
```

### 2. Browser Setup

1. Open Chrome/Firefox at `http://localhost:5173`
2. Press `Cmd+Shift+P` (Chrome) → "Show Device Toolbar"
3. Set custom resolution: **1920 × 1080**
4. Zoom to 100%
5. Hide browser bookmarks bar (`Cmd+Shift+B`)

### 3. Recording Tool

**macOS**: 
- `Cmd+Shift+5` → Select "Record Selected Portion"
- Draw rectangle around browser window
- Click "Record"

**Windows**:
- `Win+G` → Xbox Game Bar
- Click record button

---

## Recording Script

### Section 1: System Overview (2 min)

**Screen**: Login Page → Role Selector

```
NARRATION:
"Welcome to SmartOps - the NATO COPD Targeting Workbench.
The system supports multiple staff roles, each with tailored dashboards.
Let me demonstrate the key capabilities."
```

**Actions**:
1. Show login page briefly
2. Login (any credentials)
3. Click Role Selector dropdown
4. Hover over each role to show the names:
   - Commander
   - J2 (Intelligence)
   - J3 (Operations)
   - J5 (Plans)
   - Targeting Cell
5. Select "Targeting Cell"

---

### Section 2: Targeting Cell Dashboard (3 min)

**Screen**: `/smartops/targeting-cell-dashboard`

```
NARRATION:
"The Targeting Cell Dashboard provides a single-screen overview 
of all targeting operations. Key decision gates are always visible 
at the top - these are GO/NO-GO indicators that must all be green 
before any strike can proceed."
```

**Actions**:
1. **Decision Gates Bar**: Hover over each gate (ROE, CDE, Weather, Deconfliction)
2. **F3EAD Pipeline**: Click each stage to highlight
3. **Top Priority Targets**: Click one target to show detail
4. **Quick Access panel**: Expand if collapsed
5. Toggle between "Dashboard" and "Full View" modes
6. Use `Cmd+K` to show Quick Search
7. Type a search term, show results

---

### Section 3: Target Detail View (2 min)

**Screen**: Click a target from the list

```
NARRATION:
"Each target has a comprehensive detail view showing its current 
status in the F3EAD cycle, associated intelligence, BDA history, 
and risk assessment."
```

**Actions**:
1. Show target name, ID, classification badge
2. Point out F3EAD stage indicator
3. Show Status Transition buttons (Nominated → Validated → Approved)
4. Click one to demonstrate status change
5. Scroll to show Timeline section
6. Show any BDA reports linked

---

### Section 4: Mission Command Overview (1 min)

**Screen**: Scroll to Mission Command section or navigate to detail page

```
NARRATION:
"The Mission Command panel shows Commander's Intent, current 
targeting guidance, and decision authority levels. This ensures 
all targeting actions align with strategic objectives."
```

**Actions**:
1. Show Commander's Intent text
2. Show Targeting Guidance panel
3. Show Authority Matrix

---

### Section 5: J3 Operations Dashboard (2 min)

**Screen**: Switch to J3 role

```
NARRATION:
"Switching to the J3 Operations role, we see a different 
dashboard focused on current operations, battle rhythm, 
and pending actions."
```

**Actions**:
1. Click Role Selector → J3 Operations
2. Show the different sidebar navigation
3. Highlight Battle Rhythm events
4. Show Active Operations cards with progress bars
5. Show Pending Actions with priority tags

---

### Section 6: BDA Workbench (Optional - 1 min)

**Screen**: Navigate to BDA section

```
NARRATION:
"The Battle Damage Assessment workbench allows analysts to 
upload imagery, annotate damage, and track assessment status."
```

**Actions**:
1. Navigate to BDA Workbench
2. Show a report (if any exist)
3. Show the image comparison viewer (if available)

---

## Post-Recording

### 1. Review and Trim

- Open recording in QuickTime (macOS) or Video Editor (Windows)
- Trim any pauses or mistakes
- Export as `.mp4` (H.264 codec for compatibility)

### 2. Create PowerPoint

```
Slide 1: Title
- "SmartOps - NATO COPD Targeting Workbench"
- Classification banner

Slide 2: System Overview
- Screenshot of role selector
- Key capabilities bullet points

Slide 3-4: Video Demo
- Insert → Video → Movie from File
- Set to "Play on Click" or "Automatically"
- Size to fill slide (maintain aspect ratio)

Slide 5: Architecture Diagram (optional)
- Show component overview

Slide 6: Key Features Summary
- Decision Gates
- F3EAD Pipeline
- Role-based dashboards
- Real-time updates

Slide 7: Questions
```

### 3. Export Options

**For maximum compatibility on unknown computers**:

1. **PowerPoint**: Save As → PowerPoint 97-2003 (`.ppt`) if unsure of version
2. **Video embed**: Use "Link to file" instead of embed if file is large
3. **Backup**: Export PowerPoint as PDF (loses video but works everywhere)
4. **Alternative**: Export video separately and play with VLC (portable version)

---

## File Checklist for USB Drive

```
📁 SmartOps_Presentation/
├── SmartOps_Presentation.pptx    # Main presentation
├── SmartOps_Demo.mp4             # Video recording
├── SmartOps_Demo_Short.mp4       # 2-min highlight reel (optional)
├── Screenshots/                   # Backup screenshots
│   ├── 01_login.png
│   ├── 02_targeting_dashboard.png
│   ├── 03_target_detail.png
│   ├── ...
├── Backup.pdf                     # PDF version (no video)
└── VLC_Portable/                  # Optional: VLC portable for video
```

---

## Tips for Recording

1. **Slow down mouse movements** - easier to follow
2. **Pause 2 seconds** on each important element
3. **Avoid scrolling quickly** - causes motion blur in recordings
4. **Clear browser state** - use incognito mode for clean demo
5. **Close other apps** - no notification popups
6. **Turn off system sounds** - or record with mic muted
7. **Do a practice run** - time yourself, adjust script
