# System Patterns

## Architecture Overview

**Pattern:** Next.js Full-Stack Application with AWS Services

Frontend and backend in single Next.js application using App Router:
- Frontend: React components with Tailwind CSS
- Backend: Next.js API routes (serverless functions)
- Deployment: AWS Amplify (MVP) → AWS Lambda + API Gateway (production)

## Key Technical Decisions

### Frontend Framework
**Chosen:** Next.js 14+ with App Router  
**Rationale:** Single deployment, built-in API routes, AWS Amplify integration, faster than separate frontend/backend

### State Management
**Chosen:** React Context API (MVP) → Zustand (if needed)  
**Rationale:** Built-in, no dependencies, sufficient for chat state

### Styling
**Chosen:** Tailwind CSS + shadcn/ui components  
**Rationale:** Utility-first, fast development, consistent design

### Math Rendering
**Chosen:** KaTeX  
**Rationale:** Fast, lightweight (200KB vs MathJax 500KB+), sufficient for math problems

### LLM Provider
**Chosen:** OpenAI GPT-4 Vision + GPT-4  
**Rationale:** Best vision capabilities, excellent instruction following, good for Socratic prompting

### Session Storage
**Chosen:** AWS DynamoDB (MVP) → AWS ElastiCache Redis (production)  
**Rationale:** Serverless, pay-per-use, free tier available, simple API

### Image Processing
**Chosen:** OpenAI Vision API  
**Rationale:** Best OCR accuracy, handles handwritten text, single API call

### Image Storage
**Chosen:** AWS S3  
**Rationale:** Scalable, cost-effective ($0.023/GB/month), integrates with AWS ecosystem

## Design Patterns

### Socratic Prompting Pattern
System prompt enforces Socratic method:
- Never give direct answers
- Ask guiding questions
- Provide hints after 2+ turns
- Use encouraging language
- Validate student responses positively

### Session Context Pattern
Sliding window approach:
- Store last N messages (configurable, default 10)
- Load full history from DynamoDB
- Send only recent context to LLM (cost control)

### Response Validation Pattern
Check AI responses before sending to user:
- Pattern matching for direct answers
- Re-prompt if answer detected
- Log validation failures

## Component Architecture

### Frontend Components
- ChatContainer: Main chat interface
- MessageList: Scrollable message display
- MessageBubble: Individual messages
- InputArea: Text input and send button
- ImageUpload: Drag-and-drop image upload
- MathRenderer: KaTeX wrapper

### Backend Services
- LLM Service: OpenAI integration
- Image Parser: Vision API handler
- Socratic Engine: Prompt building and validation
- Session Manager: DynamoDB operations

## API Design

### POST /api/chat
- Request: { sessionId, message, problem }
- Response: { response, sessionId, turnCount }
- Handles conversation with Socratic prompting

### POST /api/parse-image
- Request: { image: base64 }
- Response: { problem: string, confidence: number }
- Extracts math problem from image

### GET /api/session/:sessionId
- Response: { session object with messages }
- Retrieves conversation history
