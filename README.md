# MathSageAI - AI-Powered Visual Math Tutor 🦉

An intelligent math tutoring application that guides students through problems using the Socratic method with **interactive visual teaching**. Students can work through problems via text or images, and see concepts come to life on an integrated whiteboard.

**Live Demo**: https://mathsageai.sainathyai.com

---

## ✨ Key Features

### 🎯 Core Learning Features
- **Socratic Dialogue**: Multi-turn conversations that guide students through questions, never giving direct answers
- **Visual Teaching**: AI automatically draws diagrams, graphs, and shapes to explain concepts
- **Interactive Whiteboard**: Students can draw, sketch, and visualize problems alongside AI guidance
- **Image Upload**: Upload screenshots or photos of math problems with OCR parsing
- **Math Rendering**: Beautiful LaTeX rendering using KaTeX

### 📊 Interactive Whiteboard
- **Drawing Tools**: Pen, brush, eraser, shapes (circle, rectangle, line, triangle)
- **Multiple Backgrounds**: 
  - Grid mode for general sketching
  - Coordinate plane for graphing functions
  - Number line for arithmetic visualization
- **AI-Generated Visuals**: AI draws circles, parabolas, triangles, angles, and more
- **Math Input**: LaTeX formula input and symbol palette
- **Session Persistence**: Whiteboard state saved with each conversation

### 🧠 Adaptive Learning
- **Context Awareness**: Maintains conversation history throughout the session
- **Progressive Hints**: After 2+ stuck turns, provides concrete hints
- **Visual Explanations**: Automatically generates diagrams when teaching concepts
- **Encouraging Tone**: Uses positive, supportive language

### 💾 Session Management
- **User Authentication**: Sign up/login with AWS Cognito
- **Persistent Storage**: All conversations saved to DynamoDB
- **Session History**: Access previous conversations anytime
- **Guest Mode**: Try the app without signing up

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                        │
│  ┌──────────────┐  ┌────────────┐  ┌────────────────────┐  │
│  │ Chat UI      │  │ Whiteboard │  │ Auth UI            │  │
│  │ - Messages   │  │ - Canvas   │  │ - Login/Signup     │  │
│  │ - Input      │  │ - Tools    │  │ - User Profile     │  │
│  │ - Image      │  │ - Modes    │  │                    │  │
│  └──────────────┘  └────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              Next.js (Frontend + API Routes)                 │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ /api/chat      │  │ /api/parse-img │  │ /api/sessions │ │
│  │ - Socratic AI  │  │ - OCR          │  │ - CRUD ops    │ │
│  │ - Visual teach │  │ - GPT-4 Vision │  │ - DynamoDB    │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                       AWS Services                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ DynamoDB     │  │ S3           │  │ Cognito          │  │
│  │ - Sessions   │  │ - Images     │  │ - Auth           │  │
│  │ - Messages   │  │ - Assets     │  │ - Users          │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ EC2 + Nginx  │  │ OpenAI API   │                         │
│  │ - Hosting    │  │ - GPT-4      │                         │
│  │ - SSL/HTTPS  │  │ - Vision     │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
app/
├── page.tsx                     # Main app with Chat/Whiteboard tabs
├── api/
│   ├── chat/route.ts           # Chat API with visual teaching
│   ├── parse-image/route.ts    # Image parsing
│   └── sessions/route.ts       # Session CRUD
├── types/
│   ├── index.ts                # Core types
│   └── drawing.ts              # Drawing command types
└── utils/
    ├── visualTeachingPrompt.ts # AI visual teaching instructions
    └── mathRenderer.tsx        # LaTeX rendering

components/
├── ChatContainer.tsx           # Chat UI and logic
├── ChatPanel.tsx               # Chat messages and input
├── WhiteboardContainer.tsx     # Whiteboard tools and state
├── WhiteboardCanvas.tsx        # Canvas drawing logic
├── WhiteboardToolbar.tsx       # Drawing tools UI
├── DrawingInterpreter.tsx      # AI drawing command executor
├── WhiteboardChatCombined.tsx  # Combined whiteboard + chat view
├── Header.tsx                  # App header with navigation
├── Sidebar.tsx                 # Session history sidebar
└── WelcomeScreen.tsx           # Example problems

```

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Math Rendering**: KaTeX (fast, lightweight)
- **Canvas**: HTML5 Canvas API for whiteboard
- **State**: React Context API + useRef for performance

### Backend
- **Platform**: Next.js API Routes on EC2
- **LLM**: OpenAI GPT-4 Vision (images) + GPT-4 (dialogue + visual teaching)
- **Session Storage**: AWS DynamoDB
- **Image Storage**: AWS S3
- **Authentication**: AWS Cognito
- **Process Manager**: PM2

### Deployment
- **Hosting**: AWS EC2 with Nginx reverse proxy
- **SSL**: Let's Encrypt SSL certificates
- **CI/CD**: GitHub Actions (automatic deployment)
- **Domain**: mathsageai.sainathyai.com

---

## 📋 Prerequisites

- Node.js 18+ and npm
- AWS Account
- OpenAI API Key
- Git

---

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sainathyai/MathSageAI.git
cd MathSageAI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Add your values to `.env.local`:
```env
OPENAI_API_KEY=your_openai_api_key
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=mathsageai-sessions
S3_BUCKET_NAME=mathsageai-images
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_cognito_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_cognito_client_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: AWS credentials are automatically loaded from `~/.aws/credentials`.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment

### Automatic Deployment (GitHub Actions)

Pushes to `master`, `main`, or `feature/advanced-features` branches automatically deploy to EC2.

**Setup**:
1. Add GitHub Secrets:
   - `EC2_HOST` - EC2 public IP or hostname
   - `EC2_USERNAME` - SSH username (usually `ubuntu`)
   - `EC2_SSH_KEY` - Private SSH key for EC2

2. Push code:
```bash
git push origin main
```

3. Monitor deployment:
   - Go to GitHub Actions tab
   - Watch the deployment workflow

See `DEPLOYMENT_SETUP.md` for detailed instructions.

---

## 🎓 How It Works

### Socratic Method + Visual Teaching

The AI tutor combines questioning with visual aids:

1. **Guides Through Questions**: "What information do we have?" "What formula applies here?"
2. **Draws Diagrams**: Automatically creates visual representations of concepts
3. **Provides Hints**: After 2+ stuck turns, gives concrete hints with visuals
4. **Never Gives Answers**: Students discover solutions themselves

### Example Interaction

**Student**: [uploads "Find area of circle with radius 5cm"]

**Tutor**: "Let's visualize this! I've drawn two circles for you - notice how the larger circle has a bigger radius. What do you think happens to the area when the radius doubles?"

*[AI draws two circles with labels]*

**Student**: "It gets 4 times bigger?"

**Tutor**: "Excellent insight! Yes, when radius doubles, area quadruples. Now, what formula do we use for the area of a circle?"

### AI Visual Teaching

The AI can draw:
- **Shapes**: Circles, rectangles, triangles, squares
- **Graphs**: Parabolas, lines on coordinate plane
- **Angles**: Show angle measurements with arc notation
- **Number Lines**: Visualize arithmetic operations
- **Custom Diagrams**: Context-specific illustrations

---

## 🧪 Testing

### Problem Types Supported
- Arithmetic (addition, subtraction, multiplication, division)
- Algebra (linear equations, quadratic equations)
- Geometry (area, perimeter, angles, circles)
- Graphing (functions, parabolas, lines)
- Word problems
- Multi-step problems

### Testing Checklist
- ✅ Verify no direct answers are given
- ✅ Test conversation context maintenance
- ✅ Test image parsing with various formats
- ✅ Verify math rendering works correctly
- ✅ Test whiteboard drawing and tools
- ✅ Test AI-generated visuals
- ✅ Test session persistence
- ✅ Test background mode switching (grid, coordinate, number line)

---

## 📖 Documentation

All documentation is in the `docs/` folder:

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System architecture and design
- [MATH_WHITEBOARD_FEATURES.md](./docs/MATH_WHITEBOARD_FEATURES.md) - Whiteboard feature details
- [AWS_RESOURCES.md](./docs/AWS_RESOURCES.md) - AWS infrastructure
- [ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md) - Environment configuration
- [DEPLOYMENT_SETUP.md](./DEPLOYMENT_SETUP.md) - Deployment guide
- [TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) - Testing strategies

---

## 🎯 Success Criteria

- ✅ Guides students through 5+ problem types
- ✅ Never gives direct answers
- ✅ Maintains conversation context
- ✅ Image parsing works accurately
- ✅ Interactive whiteboard with multiple tools
- ✅ AI-generated visual teaching
- ✅ Session persistence with DynamoDB
- ✅ Deployed with automatic CI/CD
- ✅ HTTPS with custom domain

---

## 🔒 Security

- ✅ API keys stored in environment variables (never in code)
- ✅ `.gitignore` configured to exclude secrets
- ✅ GitHub Actions secrets for deployment
- ✅ AWS Cognito for authentication
- ✅ Input validation and sanitization
- ✅ Secure image upload validation
- ✅ HTTPS with SSL certificates

---

## 💰 Cost Estimation

### Current (EC2 Deployment)
- EC2 Instance: ~$10-20/month (t2.micro/small)
- DynamoDB: Free tier (25GB storage)
- S3: Free tier (5GB storage)
- OpenAI API: ~$0.10-0.50 per session
- Domain + SSL: ~$12/year
- **Total**: ~$15-30/month + usage-based API costs

---

## 🗺️ Roadmap

### ✅ Completed (MVP)
- [x] Project setup and configuration
- [x] Chat UI with Socratic dialogue
- [x] OpenAI API integration
- [x] Math rendering with KaTeX
- [x] Image upload and parsing
- [x] Session management with DynamoDB
- [x] AWS Cognito authentication
- [x] **Interactive whiteboard with drawing tools**
- [x] **AI-generated visual teaching**
- [x] **Multiple background modes (grid, coordinate, number line)**
- [x] **Session persistence with whiteboard state**
- [x] EC2 deployment with GitHub Actions CI/CD
- [x] Custom domain with SSL

### 🚀 Future Enhancements
- [ ] Voice interface
- [ ] Animated avatar
- [ ] Difficulty level selection
- [ ] Problem generation
- [ ] Progress tracking and analytics
- [ ] Collaborative whiteboard (multi-user)
- [ ] Mobile app (React Native)
- [ ] Teacher dashboard

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is part of the Gauntlet AI curriculum.

---

## 📧 Contact

- **Website**: https://mathsageai.sainathyai.com
- **GitHub**: https://github.com/sainathyai/MathSageAI

---

**Built with ❤️ for adaptive learning and visual mathematics education**
