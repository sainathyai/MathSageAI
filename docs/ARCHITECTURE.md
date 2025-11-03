# MathSageAI - Technical Architecture & Planning

## Tech Stack Overview

### Frontend
- **Framework**: React (with TypeScript) or Next.js (for SSR/SSG)
- **UI Library**: 
  - Tailwind CSS for styling
  - shadcn/ui or Chakra UI for components
  - React Markdown for chat messages
- **Math Rendering**: KaTeX or MathJax for LaTeX rendering
- **Image Upload**: React Dropzone or similar
- **State Management**: React Context API or Zustand for chat state
- **WebSocket/Real-time**: Socket.io client (if needed for real-time updates)

### Backend
- **Framework**: Node.js with Express or FastAPI (Python)
- **LLM Integration**: 
  - OpenAI API (GPT-4 Vision for image parsing, GPT-4/GPT-3.5 for dialogue)
  - Alternative: Anthropic Claude, or local models via Ollama
- **Image Processing**: 
  - OpenAI Vision API (primary)
  - Fallback: Tesseract.js or Google Cloud Vision API
- **Session Management**: 
  - In-memory store (Redis) for conversation context
  - Or database (PostgreSQL/MongoDB) for persistence
- **API**: RESTful API with endpoints for chat, image upload, session management

### Infrastructure
- **Deployment**: Vercel (frontend), Railway/Render (backend), or Docker containers
- **Storage**: 
  - Cloud storage (AWS S3, Cloudinary) for uploaded images (optional)
  - Or handle images as base64 in API calls
- **Database** (optional for MVP): PostgreSQL or MongoDB for user sessions/history

## Architecture Design

### System Architecture

**Frontend (React/Next.js)**
- Chat UI
- Image Upload
- Math Rendering

**Backend (Express/FastAPI)**
- Session Management
- Image Parsing
- LLM Orchestration

**External Services**
- OpenAI Vision API (image parsing)
- OpenAI GPT-4 (Socratic dialogue)
- Redis/DB (session storage)

### Component Architecture

#### Frontend Components

**Components:**
- Chat: ChatContainer, MessageList, MessageBubble, InputArea, ImageUpload
- Math: MathRenderer (KaTeX wrapper), MathInput
- UI: Button, Loading, ErrorBoundary

**Hooks:**
- useChat, useImageUpload, useSession

**Services:**
- API client, math utilities

**Types:**
- Message, Session, Problem

#### Backend Structure

**Routes:**
- Chat, Upload, Session

**Services:**
- LLM Service (OpenAI integration)
- Image Parser (Vision API)
- Socratic Engine (Socratic logic)
- Session Manager

**Middleware:**
- Authentication (optional)
- Error Handler

**Utils:**
- Math Extractor, Prompt Builder

**Types:**
- Message, Session

**Config:**
- OpenAI configuration

**Tests:**
- Test suite

## Core Features Implementation

### 1. Image Parsing & Problem Extraction
**Flow:**
1. User uploads image → Frontend converts to base64
2. POST `/api/parse-image` with image data
3. Backend calls OpenAI Vision API with prompt: "Extract the math problem from this image. Return only the problem statement in plain text."
4. Parse and validate extracted text
5. Return problem text to frontend

**Tech:**
- OpenAI Vision API (GPT-4 Vision)
- Prompt engineering for consistent extraction
- Error handling for unclear images

### 2. Socratic Dialogue System
**Flow:**
1. Initialize session with problem
2. User sends message → POST `/api/chat`
3. Backend loads conversation history
4. Build system prompt with Socratic rules:
   - You are a patient math tutor. NEVER give direct answers.
   - Guide through questions: "What information do we have?" 
   - "What method might help?" If stuck >2 turns, provide concrete hint.
   - Use encouraging language.
5. Call OpenAI GPT-4 with conversation context
6. Validate response doesn't contain direct answers
7. Return response to frontend
8. Update session history

**Tech:**
- OpenAI GPT-4 or GPT-3.5-turbo
- Conversation context management
- Response validation/filtering
- Turn counting for hint escalation

### 3. Math Rendering
**Flow:**
1. Detect LaTeX/math notation in messages (inline: `$...$`, block: `$$...$$`)
2. Use KaTeX to render math expressions
3. Handle both user input and AI responses

**Tech:**
- KaTeX library (fast, lightweight)
- React-KaTeX wrapper
- Regex to detect math notation

### 4. Chat Interface
**Features:**
- Message history with scrolling
- User/AI message distinction
- Loading states
- Error handling
- Image preview in chat
- Math rendering in messages

**Tech:**
- React hooks for state management
- LocalStorage for conversation persistence (optional)
- Auto-scroll to latest message

## Data Flow

### Session Management

**Flow:**
1. User starts → Create session ID
2. Store session in Redis/Memory/DB
3. Each message includes session ID
4. Load conversation history on each request
5. Update history after each message

### Conversation Context

**Session Structure:**
- id: string
- problem: string (extracted from image or text)
- messages: Message[]
- turnCount: number
- difficulty: 'beginner' | 'intermediate' | 'advanced'
- createdAt: timestamp

**Message Structure:**
- role: 'user' | 'assistant'
- content: string
- timestamp: Date
- containsMath: boolean

## API Design

### Endpoints

#### POST `/api/parse-image`

**Request:**
- image: base64_encoded_image_data

**Response:**
- problem: extracted problem text
- confidence: confidence score

#### POST `/api/chat`

**Request:**
- sessionId: unique session identifier
- message: user's message
- problem: optional, if first message

**Response:**
- response: AI tutor response
- sessionId: session identifier
- turnCount: number of turns

#### GET `/api/session/:sessionId`

**Response:**
- session object with id, problem, messages array, turnCount

## Stretch Features Architecture

### Interactive Whiteboard
- **Tech**: Fabric.js or Konva.js for canvas manipulation
- **Backend**: WebSocket for real-time sync (Socket.io)
- **Storage**: Store canvas state in session

### Voice Interface
- **Tech**: 
  - Web Speech API (browser) for speech-to-text
  - Web Speech Synthesis API for text-to-speech
  - Or: OpenAI Whisper API + TTS service

### Step Visualization
- **Tech**: React Spring or Framer Motion for animations
- **Logic**: Parse AI response for steps, animate sequentially

### Animated Avatar
- **Tech**: Lottie animations or 2D sprite animations
- **Triggers**: Based on conversation tone/emotion detection

## Security & Performance

### Security
- Rate limiting on API endpoints
- Input sanitization
- Image size/type validation
- API key protection (backend only)

### Performance
- Caching conversation context (Redis)
- Debouncing user input
- Lazy loading for math rendering
- Image compression before upload

## Development Phases

### Phase 1: MVP (Days 1-2)
- Basic chat UI
- Text input for problems
- LLM integration with Socratic prompt
- Basic math rendering

### Phase 2: Image Parsing (Day 2-3)
- Image upload component
- Vision API integration
- Problem extraction

### Phase 3: Polish (Day 4)
- UI/UX improvements
- Error handling
- Conversation persistence
- Testing with multiple problem types

### Phase 4: Deployment (Day 5)
- Deploy frontend (Vercel)
- Deploy backend (Railway/Render)
- Documentation
- Demo video

### Phase 5: Stretch (Days 6-7)
- Whiteboard implementation
- Voice interface
- Additional polish features

## Environment Variables

### Backend

**Environment Variables:**
- OPENAI_API_KEY: OpenAI API key
- PORT: Server port (default 3001)
- REDIS_URL: Redis connection URL (optional)
- DATABASE_URL: Database connection URL (optional)
- NODE_ENV: Environment (production/development)

### Frontend

**Environment Variables:**
- VITE_API_URL: API URL for development
- API_URL: API URL for production

## Testing Strategy

### Unit Tests
- Math parsing/extraction logic
- Socratic prompt building
- Response validation

### Integration Tests
- API endpoints
- LLM integration mocking
- Image parsing flow

### Manual Testing
- 5+ problem types (arithmetic, algebra, geometry, word problems, multi-step)
- Verify no direct answers given
- Test conversation context maintenance

## Monitoring & Analytics

### Metrics to Track
- Response time
- API usage/costs
- User engagement (session length, messages per session)
- Error rates
- Image parsing success rate

## Cost Estimation

### OpenAI API Costs (approximate)
- GPT-4 Vision: ~$0.01-0.03 per image
- GPT-4: ~$0.03-0.06 per 1K tokens (dialogue)
- Estimated: $0.10-0.50 per session (10-20 messages)

### Infrastructure
- Hosting: Free tier (Vercel, Railway) or ~$5-10/month
- Database: Free tier (Supabase, PlanetScale) or ~$5/month

## Next Steps

1. **Set up project structure**
   - Initialize frontend (React/Next.js)
   - Initialize backend (Node.js/Express or FastAPI)
   - Set up TypeScript configuration

2. **Implement core features in order:**
   - Basic chat UI
   - LLM integration with Socratic prompt
   - Image upload & parsing
   - Math rendering
   - Session management

3. **Testing & iteration**
   - Test with various problem types
   - Refine prompts
   - Improve error handling

4. **Deployment**
   - Deploy frontend & backend
   - Set up monitoring
   - Create documentation

