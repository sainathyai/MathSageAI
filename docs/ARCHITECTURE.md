# MathSageAI - System Architecture

## Overview

MathSageAI is a Next.js-based AI math tutor with integrated visual teaching capabilities. The system combines Socratic dialogue with an interactive whiteboard to create an immersive learning experience.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                            │
│                                                                   │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │  Chat View     │  │  Whiteboard View │  │  Auth UI        │ │
│  │                │  │                   │  │                 │ │
│  │ - Messages     │  │ - Drawing Canvas │  │ - Login/Signup  │ │
│  │ - Input        │  │ - Tools          │  │ - User Profile  │ │
│  │ - LaTeX Math   │  │ - 3 Backgrounds  │  │                 │ │
│  │ - Images       │  │ - AI Drawings    │  │                 │ │
│  └────────────────┘  └──────────────────┘  └─────────────────┘ │
│                                                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                        HTTPS / REST API
                                │
┌───────────────────────────────▼───────────────────────────────────┐
│             EC2 Instance (Ubuntu + Nginx + PM2)                   │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Next.js Application (Port 3000)                │  │
│  │                                                              │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐ │  │
│  │  │ API Routes      │  │ React Pages     │  │ Components │ │  │
│  │  │                 │  │                 │  │            │ │  │
│  │  │ /api/chat       │  │ page.tsx        │  │ Chat       │ │  │
│  │  │ /api/parse-img  │  │                 │  │ Whiteboard │ │  │
│  │  │ /api/sessions   │  │                 │  │ Auth       │ │  │
│  │  └─────────────────┘  └─────────────────┘  └────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Nginx (Reverse Proxy)                    │  │
│  │  - SSL Termination (Let's Encrypt)                          │  │
│  │  - Proxies port 443 → 3000                                  │  │
│  │  - Static file caching                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬──────────────────────────────────┘
                                 │
              ┌──────────────────┴──────────────────┐
              │                                     │
┌─────────────▼──────────┐          ┌──────────────▼────────────┐
│     AWS Services       │          │      OpenAI API           │
│                        │          │                           │
│  ┌──────────────────┐ │          │  ┌─────────────────────┐ │
│  │   DynamoDB       │ │          │  │  GPT-4              │ │
│  │  - Sessions      │ │          │  │  - Dialogue         │ │
│  │  - Messages      │ │          │  │  - Visual teaching  │ │
│  │  - Whiteboard    │ │          │  └─────────────────────┘ │
│  └──────────────────┘ │          │                           │
│                        │          │  ┌─────────────────────┐ │
│  ┌──────────────────┐ │          │  │  GPT-4 Vision       │ │
│  │   S3             │ │          │  │  - Image parsing    │ │
│  │  - Images        │ │          │  │  - OCR              │ │
│  └──────────────────┘ │          │  └─────────────────────┘ │
│                        │          └───────────────────────────┘
│  ┌──────────────────┐ │
│  │   Cognito        │ │
│  │  - Auth          │ │
│  │  - Users         │ │
│  └──────────────────┘ │
└────────────────────────┘
```

---

## Component Architecture

### Frontend Components

```
app/
├── page.tsx                         # Main app page with tabs
│   └── States: viewMode, selectedSessionId, currentSession
│
components/
├── Header.tsx                       # Navigation and user menu
├── Sidebar.tsx                      # Session history
├── WelcomeScreen.tsx                # Example problems
│
├── ChatContainer.tsx                # Chat view wrapper
│   ├── ChatPanel.tsx                # Chat logic and messages
│   │   ├── MessageBubble.tsx       # Individual message display
│   │   └── ChatInput.tsx           # Message input with image upload
│   └── WelcomeScreen.tsx           # Initial problem selection
│
├── WhiteboardChatCombined.tsx      # Whiteboard + Chat side-by-side
│   ├── WhiteboardContainer.tsx     # Whiteboard wrapper and state
│   │   ├── WhiteboardToolbar.tsx  # Drawing tools UI
│   │   ├── WhiteboardCanvas.tsx   # Canvas drawing logic
│   │   ├── DrawingInterpreter.tsx # AI drawing executor
│   │   ├── MathFormulaInput.tsx   # LaTeX input
│   │   └── MathSymbolsPalette.tsx # Math symbols
│   └── ChatPanel.tsx               # Mini chat for whiteboard view
│
└── auth/
    ├── AuthModal.tsx                # Sign in/up modal
    └── WelcomeModal.tsx             # First-time user modal
```

### Data Flow

#### 1. Chat Interaction Flow

```
User Input (Text/Image)
    │
    ▼
ChatInput Component
    │
    ├─── Image? ──→ /api/parse-image ──→ OpenAI Vision
    │                     │
    │                     ▼
    │                Extract problem text
    │                     │
    └─────────────────────┘
                          │
                          ▼
             /api/chat (Socratic Engine)
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
  OpenAI GPT-4                    Visual Teaching Prompt
        │                                   │
        └─────────────────┬─────────────────┘
                          │
                          ▼
            Response + Drawing Commands
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
  Display in Chat              Draw on Whiteboard
        │                                   │
        ▼                                   ▼
  Save to DynamoDB             Save with session
```

#### 2. Whiteboard Drawing Flow

```
User Drawing Action
    │
    ├─── Manual Drawing ──→ WhiteboardCanvas
    │                           │
    │                           ├─ pen/brush → freehand strokes
    │                           ├─ shapes → geometric shapes
    │                           └─ eraser → clear pixels
    │
    └─── AI Drawing ──→ DrawingInterpreter
                            │
                            ├─ Parse JSON commands
                            ├─ Map to canvas coordinates
                            └─ Execute drawing commands
                                │
                                ▼
                        Canvas 2D Context API
                                │
                                ▼
                          Visual Output
                                │
                                ▼
                        Save as ImageData
                                │
                                ▼
                    Store in Session (DynamoDB)
```

#### 3. Session Management Flow

```
User Signs In (Cognito)
    │
    ▼
Fetch User Sessions (/api/sessions?userId=...)
    │
    ▼
Display in Sidebar
    │
User Selects Session
    │
    ▼
Load Session (/api/sessions?sessionId=...)
    │
    ├─ Messages → Display in ChatPanel
    └─ Drawing Commands → Restore on Whiteboard
                │
                ▼
        Continue Conversation
                │
                ▼
        Auto-save after each message
```

---

## API Routes

### `/api/chat` (POST)

**Purpose**: Main chat endpoint with Socratic dialogue and visual teaching

**Request**:
```typescript
{
  message: string
  sessionId: string
  history: Message[]
  imageUrl?: string
}
```

**Response**:
```typescript
{
  message: string              // AI response text
  isCorrect?: boolean         // If answer evaluation
  drawingCommands?: DrawingCommand[]  // Visual teaching
  clearCanvas?: boolean       // Should clear whiteboard
}
```

**Logic**:
1. Build adaptive prompt based on conversation history
2. Append visual teaching instructions
3. Call OpenAI GPT-4
4. Extract drawing commands from response
5. Return message + commands

### `/api/parse-image` (POST)

**Purpose**: Parse math problems from images using OCR

**Request**:
```typescript
{
  imageData: string  // base64 encoded image
  sessionId: string
  userId: string
}
```

**Response**:
```typescript
{
  extractedText: string
  imageUrl: string  // S3 URL
}
```

**Logic**:
1. Decode base64 image
2. Upload to S3
3. Call OpenAI Vision API
4. Extract math problem text
5. Return extracted text + S3 URL

### `/api/sessions` (GET/POST)

**Purpose**: CRUD operations for user sessions

**GET** (List sessions):
```typescript
?userId=xxx
Returns: Session[]
```

**GET** (Single session):
```typescript
?sessionId=xxx
Returns: SessionData
```

**POST** (Save session):
```typescript
{
  sessionId: string
  userId: string
  title: string
  messages: Message[]
  isGuest: boolean
  createdAt: string
  updatedAt: string
}
Returns: { success: boolean }
```

---

## Key Technologies

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library
- **KaTeX**: Math rendering
- **HTML5 Canvas**: Whiteboard drawing
- **React Context**: State management

### Backend (Next.js API Routes)
- **Node.js**: Runtime
- **OpenAI API**: GPT-4 + Vision
- **AWS SDK**: DynamoDB, S3, Cognito integration

### Infrastructure
- **EC2**: Ubuntu server
- **Nginx**: Reverse proxy, SSL termination
- **PM2**: Process manager
- **Let's Encrypt**: SSL certificates
- **GitHub Actions**: CI/CD pipeline

### AWS Services
- **DynamoDB**: NoSQL database for sessions
- **S3**: Object storage for images
- **Cognito**: User authentication
- **Route 53**: DNS management (optional)

---

## Data Models

### Message Type
```typescript
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  imageUrl?: string
  isCorrect?: boolean
  isPartiallyCorrect?: boolean
  drawingCommands?: DrawingCommand[]
  clearCanvas?: boolean
}
```

### Drawing Command Types
```typescript
type DrawingCommand = 
  | CircleCommand    // {type: 'circle', x, y, radius, color, fill, ...}
  | RectangleCommand // {type: 'rectangle', x, y, width, height, ...}
  | TriangleCommand  // {type: 'triangle', x1, y1, x2, y2, x3, y3, ...}
  | LineCommand      // {type: 'line', x1, y1, x2, y2, ...}
  | ParabolaCommand  // {type: 'parabola', a, b, c, xMin, xMax, ...}
  | AngleCommand     // {type: 'angle', vx, vy, x1, y1, x2, y2, ...}
  | TextCommand      // {type: 'text', x, y, text, ...}
```

### Session Data
```typescript
interface SessionData {
  sessionId: string
  userId: string
  title: string
  messages: Message[]
  isGuest: boolean
  createdAt: string
  updatedAt: string
}
```

---

## Security Architecture

### Authentication
- **AWS Cognito** for user authentication
- JWT tokens for session management
- Guest mode for unauthenticated access

### API Security
- Environment variables for secrets (`.env.local`)
- GitHub Secrets for deployment
- No secrets in code or git
- Input validation and sanitization
- Rate limiting (future enhancement)

### Data Security
- HTTPS only (Let's Encrypt SSL)
- Secure session cookies
- AWS IAM roles for service access
- S3 bucket policies for image access
- DynamoDB encryption at rest

---

## Deployment Architecture

### CI/CD Pipeline (GitHub Actions)

```
Developer pushes code
    │
    ▼
GitHub Actions Workflow Triggered
    │
    ├─ Checkout code
    ├─ SSH into EC2
    │   ├─ Pull latest code
    │   ├─ npm ci (clean install)
    │   ├─ npm run build
    │   └─ pm2 restart mathsageai
    │
    └─ Deployment complete
```

### EC2 Setup
- **OS**: Ubuntu 22.04 LTS
- **Node.js**: v18 LTS
- **PM2**: Process manager (keeps app running, auto-restart)
- **Nginx**: Reverse proxy (port 80/443 → 3000)
- **SSL**: Let's Encrypt with auto-renewal

### Monitoring
- PM2 logs: `pm2 logs mathsageai`
- Nginx access logs: `/var/log/nginx/access.log`
- Nginx error logs: `/var/log/nginx/error.log`
- Application logs: Console output captured by PM2

---

## Performance Optimizations

### Frontend
- Code splitting with Next.js dynamic imports
- Image optimization with Next.js Image component
- Lazy loading for whiteboard components
- Canvas `willReadFrequently` hint for performance
- Debounced drawing saves
- Memoized components (`React.memo`)

### Backend
- DynamoDB query optimization (GSI if needed)
- S3 pre-signed URLs for image uploads
- Gzip compression (Nginx)
- Static asset caching (Nginx)
- Connection pooling for AWS SDK

### Caching Strategy
- Nginx caches static assets (`/_next/static`) for 365 days
- Browser caching for immutable assets
- Session data cached in memory (React state)
- Future: Redis for session caching

---

## Scalability Considerations

### Current Architecture (Single EC2)
- Suitable for: 10-100 concurrent users
- Bottleneck: Single server
- Cost: Low (~$15-30/month)

### Future Scaling Options

**Horizontal Scaling**:
- Multiple EC2 instances behind ALB
- Stateless API (sessions in DynamoDB, not memory)
- Sticky sessions or JWT for auth

**Serverless Migration**:
- Lambda functions for API routes
- API Gateway for routing
- CloudFront for static assets
- ElastiCache Redis for session caching

**Database Optimization**:
- DynamoDB auto-scaling
- Global Secondary Indexes for queries
- DynamoDB Streams for real-time updates

---

## Development Workflow

### Local Development
1. Clone repo
2. Install dependencies (`npm install`)
3. Configure `.env.local`
4. Run dev server (`npm run dev`)
5. Make changes
6. Test locally
7. Commit and push

### Deployment
1. Push to `main` or `feature/advanced-features` branch
2. GitHub Actions runs automatically
3. Code deployed to EC2
4. PM2 restarts application
5. Verify at https://mathsageai.sainathyai.com

### Testing Strategy
- Manual testing of core features
- Visual regression testing (screenshots)
- User acceptance testing with real problems
- Future: Jest unit tests, Playwright E2E tests

---

## Future Architecture Enhancements

### Phase 1 (Current) ✅
- ✅ Socratic dialogue
- ✅ Interactive whiteboard
- ✅ Visual teaching with AI drawings
- ✅ Session persistence
- ✅ EC2 deployment with CI/CD

### Phase 2 (Next 3-6 months)
- [ ] Real-time collaboration (Socket.io)
- [ ] Teacher dashboard
- [ ] Student progress tracking
- [ ] Advanced analytics
- [ ] Mobile responsiveness improvements

### Phase 3 (6-12 months)
- [ ] Mobile app (React Native)
- [ ] Voice interface
- [ ] Video explanations
- [ ] Gamification
- [ ] Multi-language support
- [ ] Serverless architecture migration

---

## Conclusion

MathSageAI's architecture is designed for rapid iteration and scalability. The current single-server setup provides excellent performance for early users while maintaining flexibility for future growth. The modular component design and clear separation of concerns enable easy feature additions and maintenance.

Key strengths:
- ✅ Simple, maintainable codebase
- ✅ Automatic deployment pipeline
- ✅ Secure by default
- ✅ Cost-effective
- ✅ Ready to scale

For detailed implementation guides, see:
- [MATH_WHITEBOARD_FEATURES.md](./MATH_WHITEBOARD_FEATURES.md) - Whiteboard technical details
- [DEPLOYMENT_SETUP.md](../DEPLOYMENT_SETUP.md) - Deployment guide
- [AWS_RESOURCES.md](./AWS_RESOURCES.md) - AWS infrastructure setup
