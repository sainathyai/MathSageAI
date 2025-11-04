# MathSageAI - AI Math Tutor

An intelligent math tutoring application that guides students through math problems using the Socratic method. The system accepts problems via text input or image uploads and helps students discover solutions through guided dialogue, never providing direct answers.

## 🎯 Project Overview

MathSageAI is an AI-powered math tutor that uses Socratic questioning to help students learn. Inspired by the OpenAI x Khan Academy demo, it creates an interactive learning experience where students work through problems with guided questions rather than receiving direct answers.

### Key Features

- **Socratic Dialogue**: Multi-turn conversations that guide students through questions
- **Image Upload**: Upload screenshots or photos of math problems with OCR parsing
- **Math Rendering**: Beautiful LaTeX rendering using KaTeX
- **Context Awareness**: Maintains conversation history throughout the session
- **Response Validation**: Ensures the AI never gives direct answers
- **Session Management**: Persistent conversation storage with AWS DynamoDB

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Math Rendering**: KaTeX
- **State Management**: React Context API

### Backend
- **Platform**: Next.js API Routes on AWS Amplify (MVP)
- **LLM**: OpenAI GPT-4 Vision (images) + GPT-4 (dialogue)
- **Session Storage**: AWS DynamoDB
- **Image Storage**: AWS S3
- **Secrets Management**: AWS Secrets Manager

### Deployment
- **Frontend**: AWS Amplify (MVP) → S3 + CloudFront (production)
- **Backend**: Next.js API Routes on Amplify (MVP) → AWS Lambda + API Gateway (production)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- AWS Account (for deployment)
- OpenAI API Key
- Git

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MathSageAI
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

**Automatic Setup** (Recommended):
```bash
npm run setup:env
```

This creates `.env.local` from `.env.example`. Then edit `.env.local` and add your OpenAI API key.

**Manual Setup**:
Copy `.env.example` to `.env.local` and add your values:
```bash
cp .env.example .env.local
```

**Required Variables:**
- `OPENAI_API_KEY` - Your OpenAI API key
- `AWS_REGION` - AWS region (default: us-east-1)
- `DYNAMODB_TABLE_NAME` - DynamoDB table name
- `S3_BUCKET_NAME` - S3 bucket name
- `NEXT_PUBLIC_APP_URL` - App URL (default: http://localhost:3000)

**Note**: AWS credentials are automatically loaded from AWS CLI configuration (`~/.aws/credentials`). No need to set them in `.env.local`.

**See**: 
- [docs/ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md) - Environment variables guide
- [docs/LOGO_SETUP.md](./docs/LOGO_SETUP.md) - Logo setup instructions
- [docs/AWS_RESOURCES.md](./docs/AWS_RESOURCES.md) - AWS infrastructure details

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
MathSageAI/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/          # Chat endpoint
│   │   └── parse-image/   # Image parsing endpoint
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript types
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Shared components (if needed)
├── hooks/                 # Shared hooks (if needed)
├── utils/                 # Shared utilities (if needed)
├── types/                 # Shared types (if needed)
├── public/                # Static assets
├── docs/                  # Documentation
│   ├── README.md         # Documentation index
│   ├── PROJECT_OVERVIEW.md
│   ├── ARCHITECTURE.md
│   ├── PROJECT_PLAN.md
│   ├── DECISION_MAKING.md
│   ├── AWS_TECH_STACK_PROPOSAL.md
│   └── REACT_VS_NEXTJS.md
├── .env.local             # Environment variables (gitignored)
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
└── README.md              # This file
```

## 🎓 How It Works

### Socratic Method

The AI tutor follows the Socratic method:
1. **Never gives direct answers** - Always guides through questions
2. **Asks guiding questions** - "What information do we have?", "What method might help?"
3. **Provides hints** - After 2+ turns of being stuck, provides concrete hints
4. **Encouraging tone** - Uses positive, supportive language

### Example Interaction

**Student**: [uploads "2x + 5 = 13"]

**Tutor**: "What are we trying to find in this equation?"

**Student**: "x"

**Tutor**: "Right! To get x alone, we need to undo the +5 and ×2. Which should we undo first?"

**Student**: "the +5?"

**Tutor**: "Exactly! How do we undo adding 5?"

### Problem Types Supported

- Arithmetic problems
- Algebra equations
- Geometry problems
- Word problems
- Multi-step problems

## 🧪 Testing

The application has been tested with 5+ problem types:
- Simple arithmetic (addition, subtraction, multiplication, division)
- Linear equations (one variable)
- Quadratic equations
- Geometry problems (area, perimeter, angles)
- Word problems
- Multi-step algebraic problems

### Testing Checklist

- [ ] Verify no direct answers are given
- [ ] Test conversation context maintenance
- [ ] Test image parsing with various formats
- [ ] Verify math rendering works correctly
- [ ] Test session persistence

## 🚢 Deployment

### AWS Amplify Deployment (MVP)

1. **Set up AWS Amplify**:
   - Connect your GitHub repository
   - Configure build settings
   - Set environment variables in Amplify console

2. **AWS Services Setup**:
   - Create DynamoDB table for sessions
   - Create S3 bucket for images
   - Store OpenAI API key in AWS Secrets Manager

3. **Deploy**:
   - Push to main branch triggers automatic deployment
   - Or manually deploy from Amplify console

### Production Deployment (Future)

For production scale, migrate to:
- **Frontend**: S3 + CloudFront
- **Backend**: AWS Lambda + API Gateway
- **Sessions**: AWS ElastiCache Redis
- **Images**: S3 + CloudFront CDN

## 📖 Documentation

All documentation is located in the `docs/` folder:

- [PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md) - Project overview and requirements
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System architecture and design
- [PROJECT_PLAN.md](./docs/PROJECT_PLAN.md) - Detailed implementation plan
- [DECISION_MAKING.md](./docs/DECISION_MAKING.md) - Technology decisions and rationale
- [AWS_TECH_STACK_PROPOSAL.md](./docs/AWS_TECH_STACK_PROPOSAL.md) - AWS deployment guide
- [REACT_VS_NEXTJS.md](./docs/REACT_VS_NEXTJS.md) - Framework comparison guide

## 🎯 Success Criteria

- ✅ Guides students through 5+ problem types
- ✅ Never gives direct answers
- ✅ Maintains conversation context
- ✅ Image parsing works accurately
- ✅ Deployed and accessible

## 🔒 Security

- API keys stored in AWS Secrets Manager (never in code)
- Environment variables for sensitive data
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure image upload validation

## 💰 Cost Estimation

### MVP (Low Traffic)
- AWS Amplify: Free tier
- DynamoDB: Free tier (25GB storage)
- S3: Free tier (5GB storage)
- OpenAI API: ~$0.10-0.50 per session
- **Total**: ~$0-5/month (mostly free tier)

### Production (Medium Traffic)
- AWS Services: ~$20-50/month
- OpenAI API: ~$0.10-0.50 per session
- **Total**: ~$40-100/month (depending on usage)

## 🤝 Contributing

This is a project for Gauntlet C3. For contributions:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

This project is part of the Gauntlet C3 curriculum.

## 📧 Contact

For questions or issues, contact:
- **Instructor**: John Chen
- **Email**: john.chen@superbuilders.school

## 🗺️ Roadmap

### MVP (Days 1-5)
- [x] Project setup and configuration
- [x] Basic chat UI
- [x] OpenAI API integration
- [x] Socratic prompt engineering
- [x] Math rendering with KaTeX
- [x] Image upload and parsing
- [x] Session management
- [x] AWS deployment

### Stretch Features (Future)
- [ ] Interactive whiteboard
- [ ] Step-by-step visualization
- [ ] Voice interface
- [ ] Animated avatar
- [ ] Difficulty modes
- [ ] Problem generation

---

**Built with ❤️ for Gauntlet C3**

