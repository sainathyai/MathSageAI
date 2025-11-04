# MathSageAI - UI/UX Design Plan

## Design Philosophy

**Goal:** Create a professional, intuitive, and engaging learning environment that feels modern, trustworthy, and encouraging.

**Key Principles:**
- Clean, minimalist interface to reduce cognitive load
- Warm, encouraging color scheme (not sterile)
- Clear visual hierarchy
- Responsive and accessible
- Delightful micro-interactions

---

## Color Palette

### Primary Colors
- **Brand Primary:** Indigo-600 (#4F46E5) - Trust, intelligence, learning
- **Brand Secondary:** Purple-500 (#A855F7) - Creativity, thinking
- **Accent:** Emerald-500 (#10B981) - Success, encouragement

### Neutral Colors
- **Background:** Slate-50 (#F8FAFC) - Light, clean
- **Surface:** White (#FFFFFF) - Cards, containers
- **Text Primary:** Slate-900 (#0F172A) - Main content
- **Text Secondary:** Slate-600 (#475569) - Supporting text
- **Border:** Slate-200 (#E2E8F0) - Subtle dividers

### Semantic Colors
- **Success:** Emerald-500 - Correct answers, progress
- **Warning:** Amber-500 - Hints, attention needed
- **Error:** Red-500 - Validation errors
- **Info:** Blue-500 - Information, tips

---

## Layout Structure

### Overall Layout (Desktop)
```
┌─────────────────────────────────────────────────────────────┐
│                    Header (Sticky)                          │
│  Logo | Navigation | User Actions                           │
├─────────────┬───────────────────────────────┬──────────────┤
│             │                               │              │
│  Sidebar    │     Main Chat Area            │  Info Panel  │
│  (Sessions) │                               │  (Optional)  │
│             │  [Messages]                   │              │
│  - New Chat │                               │  Tips        │
│  - History  │  [Input Area]                 │  Progress    │
│  - Settings │                               │              │
│             │                               │              │
└─────────────┴───────────────────────────────┴──────────────┘
```

### Mobile Layout
```
┌─────────────────────────┐
│   Header (Sticky)       │
│   [Menu] Logo           │
├─────────────────────────┤
│                         │
│   Main Chat Area        │
│                         │
│   [Messages]            │
│                         │
│                         │
│   [Input Area]          │
│                         │
└─────────────────────────┘
```

---

## Navigation System

### Primary Navigation (Header)
- **Logo/Home** - Return to main chat
- **New Problem** - Start fresh conversation
- **Examples** - Pre-loaded example problems
- **About** - Information about the tutor
- **How It Works** - Guide to Socratic method

### Secondary Navigation (Sidebar)
- **Session List** - Recent conversations
  - Today
  - Yesterday
  - This Week
  - Older
- **Settings** - User preferences
- **Help** - Quick tips and support

### Mobile Navigation
- Hamburger menu (left)
- Primary actions accessible
- Slide-out drawer for history

---

## Component Design

### 1. Header
**Design:**
- Fixed/sticky at top
- Clean, minimal design
- Subtle shadow on scroll
- Responsive collapse on mobile

**Elements:**
- Logo with icon + "MathSageAI" wordmark
- Navigation links (desktop)
- New Problem button (CTA)
- Menu icon (mobile)

**Interactions:**
- Smooth scroll animation
- Active state for current page
- Hover effects on links

---

### 2. Chat Interface

#### Message Bubbles
**Student Messages (Right-aligned):**
- Blue/Indigo background
- White text
- Rounded corners (more on left)
- Avatar placeholder
- Timestamp

**Tutor Messages (Left-aligned):**
- White background
- Dark text
- Subtle border
- Tutor avatar/icon
- Timestamp
- Math rendering support

**System Messages (Centered):**
- Light background
- Small, subtle
- For events (new session, problem loaded)

**Design Details:**
- Max width for readability
- Proper spacing between messages
- Smooth entrance animations
- Math equations rendered with KaTeX
- Code syntax highlighting for equations

---

#### Input Area
**Design:**
- Fixed at bottom
- Elevated/floating appearance
- Clean, spacious
- Multi-line support

**Elements:**
- Text input (auto-expanding textarea)
- Image upload button (with icon)
- Send button (prominent)
- Character/word count (subtle)
- Upload preview area

**Features:**
- Drag and drop for images
- Preview uploaded images
- Clear/remove image option
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Loading state when processing

---

### 3. Sidebar

#### Session History
**Design:**
- Scrollable list
- Grouped by date
- Compact, scannable

**Each Session Item:**
- Problem title/preview
- Timestamp
- Status indicator (active, completed)
- Hover actions (delete, rename)

**Features:**
- Search/filter sessions
- Clear all option
- Export conversation

#### Settings Panel
- Difficulty level selector
- Theme toggle (light/dark)
- Notification preferences
- About/Help links

---

### 4. Welcome Screen (Empty State)

**Design:**
- Centered, welcoming
- Clear call-to-action

**Elements:**
- Large, friendly icon/illustration
- Welcome message
- "How can I help you today?"
- Sample problem cards (clickable)
- Upload image prompt
- Text input prompt

**Sample Problems:**
- 3-4 cards with example problems
- Different difficulty levels
- Visual icons for problem types

---

### 5. Math Rendering

**Integration:**
- KaTeX for fast rendering
- Inline: $x + 5$
- Block: $$\\frac{x}{2} = 10$$

**Styling:**
- Proper font sizing
- Readable equations
- Copy equation button on hover
- Syntax highlighting

---

### 6. Image Upload Area

**States:**
1. **Default:** Dashed border, upload icon, "Drop image here or click to upload"
2. **Drag Over:** Highlighted border, "Drop to upload"
3. **Uploading:** Progress bar, "Uploading..."
4. **Uploaded:** Preview thumbnail, problem text extracted, remove button
5. **Error:** Error message, retry option

**Design:**
- Clean, simple
- Visual feedback at every step
- Image preview before sending
- Problem extraction preview

---

## Responsive Design

### Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Mobile Optimizations
- Full-width chat area
- Collapsible sidebar (drawer)
- Touch-friendly buttons (min 44px)
- Simplified navigation
- Bottom sheet for actions

### Tablet Optimizations
- Sidebar can toggle
- Flexible layout
- Optimized for landscape/portrait

---

## Animations & Micro-interactions

### Entrance Animations
- Messages fade in and slide up
- Smooth, natural (200-300ms)
- Stagger for multiple messages

### Interactions
- Button hover states (scale, color change)
- Input focus (border highlight, subtle glow)
- Sidebar slide in/out
- Image upload bounce

### Loading States
- Skeleton screens for loading content
- Pulsing dots for "AI is thinking"
- Progress bars for uploads
- Shimmer effects

### Transitions
- Page transitions (fade)
- Smooth scrolling
- Expand/collapse animations

---

## Typography

### Font Stack
- **Primary:** Inter, system-ui, sans-serif
- **Monospace:** JetBrains Mono, monospace (for math)

### Type Scale
- **H1:** 2.25rem (36px) - Page titles
- **H2:** 1.875rem (30px) - Section headers
- **H3:** 1.5rem (24px) - Subsections
- **Body:** 1rem (16px) - Main text
- **Small:** 0.875rem (14px) - Captions, timestamps

### Font Weights
- **Regular:** 400 - Body text
- **Medium:** 500 - Emphasis
- **Semibold:** 600 - Headings, buttons
- **Bold:** 700 - Strong emphasis

---

## Accessibility

### WCAG 2.1 AA Compliance
- Color contrast ratios > 4.5:1
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- Alt text for images
- ARIA labels

### Features
- Skip to main content link
- Keyboard shortcuts
- Reduced motion option
- High contrast mode
- Font size adjustment

---

## Component Library

### Using shadcn/ui
Professional, accessible components:
- Button
- Input / Textarea
- Card
- Dialog / Modal
- Dropdown Menu
- Tabs
- Badge
- Avatar
- Separator
- Skeleton
- Toast notifications

### Custom Components
- MessageBubble
- MathRenderer
- ImageUpload
- SessionList
- WelcomeScreen
- ChatContainer

---

## User Experience Flow

### First-Time User
1. Land on welcome screen
2. See example problems
3. Click or type a problem
4. Receive welcoming tutor message
5. Begin Socratic dialogue

### Returning User
1. See last conversation
2. Option to continue or start new
3. Access session history
4. Seamless experience

### Image Upload Flow
1. Click upload or drag image
2. Preview image
3. AI extracts problem
4. User confirms or edits
5. Conversation begins

---

## Performance Considerations

- Lazy load components
- Optimize images
- Virtual scrolling for long conversations
- Debounce text input
- Code splitting for routes
- Minimize bundle size

---

## Design Inspiration

- **ChatGPT** - Clean, professional chat interface
- **Linear** - Beautiful, minimal design
- **Notion** - Excellent typography and spacing
- **Vercel** - Modern, sleek aesthetic
- **Stripe** - Professional, trustworthy design

---

## Implementation Priority

### Phase 1: Core UI (This PR)
1. ✅ Header with navigation
2. ✅ Basic chat layout
3. ✅ Message bubbles
4. ✅ Input area
5. ✅ Sidebar structure
6. ✅ Welcome screen
7. ✅ Responsive design
8. ✅ Basic animations

### Phase 2: Enhanced Features (Next PR)
- Math rendering integration
- Image upload functionality
- Session management
- Settings panel
- Advanced animations
- Dark mode

### Phase 3: Polish (Future)
- Onboarding flow
- Tutorial/Help system
- Advanced customization
- Analytics dashboard

---

**Status:** Ready for implementation  
**Target:** Professional, production-ready UI for first PR

