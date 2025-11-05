# Whiteboard Learning Interface - Design Proposal

## Overview
This document outlines design options for adding a whiteboard-style learning interface to MathSageAI without disrupting the existing chat-based experience.

## Current Layout Structure
- **Header**: Fixed at top (4rem height)
- **Sidebar**: Left panel (72px width) - Sessions & Settings
- **Main Content**: Chat container with messages
- **Footer**: Below viewport

## Design Option 1: Tabbed View (Recommended)

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                    Header (Fixed)                        │
├──────────┬───────────────────────────────────────────────┤
│          │ [Chat] [Whiteboard]  ← Tabs                   │
│ Sidebar  ├───────────────────────────────────────────────┤
│          │                                                 │
│          │  ┌─────────────────────────────────────┐      │
│          │  │  Whiteboard Canvas (Full Area)       │      │
│          │  │                                     │      │
│          │  │  [Drawing Area]                     │      │
│          │  │  [Math Input Tools]                 │      │
│          │  │  [AI Feedback Overlay]              │      │
│          │  │                                     │      │
│          │  └─────────────────────────────────────┘      │
│          │                                                 │
│          │  [Toolbar: Pen, Eraser, Shapes, Math]         │
│          │  [Quick Actions: Clear, Undo, Redo]          │
└──────────┴───────────────────────────────────────────────┘
```

### Implementation Approach
- Add view mode state in `app/page.tsx`: `'chat' | 'whiteboard' | 'split'`
- Create `WhiteboardContainer.tsx` component
- Toggle between views via tabs in Header or main content area
- Same session data shared between both views

### Pros
- Clean separation of concerns
- Easy to navigate between modes
- Doesn't clutter existing UI
- Can be disabled/feature-flagged

### Cons
- Requires switching between views
- No simultaneous view of chat + whiteboard

---

## Design Option 2: Split View (Side-by-Side)

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                    Header (Fixed)                        │
├──────────┬───────────────────────────────────────────────┤
│          │ [Toggle: Chat | Whiteboard | Split]          │
│ Sidebar  ├──────────────────┬──────────────────────────┤
│          │                   │                          │
│          │   Chat Area       │   Whiteboard Area        │
│          │   (50% width)     │   (50% width)            │
│          │                   │                          │
│          │   [Messages]      │   [Canvas]              │
│          │   [Input]         │   [Toolbar]             │
│          │                   │                          │
│          ├──────────────────┴──────────────────────────┤
└──────────┴───────────────────────────────────────────────┘
```

### Implementation Approach
- Add layout mode state: `'chat' | 'whiteboard' | 'split'`
- Modify `app/page.tsx` to conditionally render split layout
- Create `WhiteboardPanel.tsx` for right side
- Resizable panels with drag handle in between

### Pros
- See both views simultaneously
- Great for visual learners
- Natural workflow (draw → discuss → draw)

### Cons
- Smaller canvas area
- More complex layout management
- Mobile responsiveness challenges

---

## Design Option 3: Overlay Whiteboard (Modal-style)

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                    Header (Fixed)                        │
├──────────┬───────────────────────────────────────────────┤
│          │                                                 │
│ Sidebar  │   Chat Interface (Normal)                     │
│          │                                                 │
│          │   [Button: "Open Whiteboard"]                 │
│          │                                                 │
│          │   ┌─────────────────────────────────────┐    │
│          │   │  Whiteboard Modal (Full Screen)     │    │
│          │   │  [X Close] [Minimize]              │    │
│          │   │                                     │    │
│          │   │  [Canvas + Tools]                  │    │
│          │   └─────────────────────────────────────┘    │
│          │                                                 │
└──────────┴───────────────────────────────────────────────┘
```

### Implementation Approach
- Add whiteboard button to ChatContainer or Header
- Modal/dialog component with full-screen option
- Can be minimized to corner or maximized
- Syncs with chat session

### Pros
- Doesn't modify existing layout
- Easy to add/remove
- Can be dismissed easily
- Works well on mobile

### Cons
- Not always visible
- Requires extra click to access
- May feel disconnected from chat

---

## Design Option 4: Embedded Canvas in Chat (In-line)

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                    Header (Fixed)                        │
├──────────┬───────────────────────────────────────────────┤
│          │  [Chat] [Whiteboard]  ← Tabs                  │
│ Sidebar  ├───────────────────────────────────────────────┤
│          │  Problem Statement (Pinned)                   │
│          ├───────────────────────────────────────────────┤
│          │  [Whiteboard Canvas]                          │
│          │  ┌─────────────────────────────────────┐     │
│          │  │  Drawing Area                       │     │
│          │  │  [Toolbar]                          │     │
│          │  └─────────────────────────────────────┘     │
│          ├───────────────────────────────────────────────┤
│          │  [Chat Messages Below Canvas]                  │
│          │  AI: "Try drawing the equation..."            │
│          │  You: [Drawing shown]                         │
│          │  [Input Area]                                 │
└──────────┴───────────────────────────────────────────────┘
```

### Pros
- Integrated experience
- Canvas becomes part of conversation
- Natural flow

### Cons
- May feel cramped
- Complex state management
- Harder to make responsive

---

## Recommended Approach: Option 1 (Tabbed View)

### Why This Works Best
1. **Non-disruptive**: Existing chat remains unchanged
2. **Clean UX**: Clear separation between modes
3. **Flexible**: Easy to add/remove features
4. **Scalable**: Can add more views later (e.g., "Graph", "Table")

### Implementation Details

#### Component Structure
```
app/page.tsx
  └── ViewModeToggle (Chat | Whiteboard)
      ├── ChatContainer (existing)
      └── WhiteboardContainer (new)
          ├── WhiteboardCanvas (drawing area)
          ├── WhiteboardToolbar (tools)
          ├── MathInputPanel (LaTeX/formula input)
          └── AIFeedbackOverlay (hints/validation)
```

#### State Management
- Add `viewMode` state to `app/page.tsx`
- Persist preference in localStorage
- Share session data between views
- Sync messages ↔ whiteboard state

#### Whiteboard Features
1. **Drawing Tools**
   - Pen (freehand drawing)
   - Highlighter (semi-transparent)
   - Shapes (circle, rectangle, line, arrow)
   - Text tool
   - Math formula input (LaTeX)

2. **Math-Specific Tools**
   - Equation editor (LaTeX)
   - Graph plotting
   - Number line
   - Geometric shapes (protractor, ruler)
   - Grid/coordinate system toggle

3. **AI Integration**
   - Analyze drawn content
   - Provide feedback overlay
   - Suggest corrections
   - Ask questions about drawings

4. **Session Management**
   - Save whiteboard state with chat session
   - Export as image
   - Undo/redo history
   - Clear canvas

#### Technical Considerations

**Canvas Library Options:**
- **Fabric.js**: Rich features, good for complex drawings
- **Konva.js**: Performance-focused, good for animations
- **Excalidraw**: Open-source, great math support
- **React-Canvas**: React-native-like API
- **Custom Canvas API**: Full control, more work

**Math Rendering:**
- KaTeX (already in use) for formulas
- MathJax for complex expressions
- Custom LaTeX parser for handwriting → LaTeX

**Storage:**
- Store canvas state as JSON (Fabric.js/Konva)
- Or as image snapshots (S3)
- Sync with DynamoDB session data

**Mobile Considerations:**
- Touch drawing support
- Responsive toolbar
- Simplified tools on small screens
- Stylus support (iPad/tablets)

---

## User Flow Example

1. **User starts problem** → Opens chat mode (default)
2. **AI asks question** → "Can you draw the equation?"
3. **User switches to whiteboard** → Tab click
4. **User draws** → Canvas appears with tools
5. **AI analyzes drawing** → Provides feedback overlay
6. **User switches back to chat** → Discussion continues
7. **Both views sync** → Whiteboard saved with session

---

## Migration Path

### Phase 1: Basic Whiteboard (MVP)
- Tabbed view toggle
- Simple drawing (pen, eraser, clear)
- Save canvas state with session
- Basic AI analysis

### Phase 2: Math Tools
- LaTeX formula input
- Shape tools
- Grid/coordinate system
- Export functionality

### Phase 3: Advanced Features
- Handwriting recognition
- Graph plotting
- AI-guided drawing hints
- Collaborative whiteboard (future)

---

## Integration Points

### With Existing Chat
- Same session ID
- Messages can reference whiteboard state
- AI can prompt: "Draw it on the whiteboard"
- Whiteboard exports can be sent as images

### With Sidebar
- Sessions show whiteboard thumbnail
- "View Whiteboard" option in session menu
- Whiteboard count/indicator

### With Header
- View mode toggle (optional)
- Whiteboard-specific actions (export, share)

---

## Accessibility Considerations

- Keyboard navigation for tools
- Screen reader support for canvas content
- High contrast mode
- Tooltips and labels
- Alternative text input for formulas

---

## Performance Considerations

- Canvas rendering optimization
- Lazy load whiteboard component
- Debounce canvas saves
- Compress canvas state data
- Virtual scrolling for large drawings

---

## Next Steps

1. **Decision**: Choose design option (recommend Option 1)
2. **Prototype**: Build basic whiteboard component
3. **Test**: User feedback on integration
4. **Iterate**: Refine based on usage
5. **Document**: Update architecture docs

---

## Questions to Consider

1. Should whiteboard be available for all problem types?
2. Do we need real-time collaboration?
3. Should drawings be saved as images or state?
4. How do we handle mobile vs desktop differences?
5. Should AI be able to draw on whiteboard?
6. Do we need version history for drawings?


