# Technical Context

## Technology Stack

### Frontend
- **Framework:** Next.js 14+ with TypeScript
- **UI Library:** Tailwind CSS + shadcn/ui
- **Math Rendering:** KaTeX
- **State Management:** React Context API
- **Image Upload:** React Dropzone

### Backend
- **Platform:** Next.js API Routes (serverless functions)
- **Runtime:** Node.js 20+
- **LLM:** OpenAI GPT-4 Vision + GPT-4
- **Session Storage:** AWS DynamoDB
- **Image Storage:** AWS S3
- **Secrets:** AWS Secrets Manager

### Development Tools
- **Language:** TypeScript 5.4+
- **Linting:** ESLint with next/core-web-vitals
- **Validation:** Zod for schema validation
- **Package Manager:** npm

### Deployment
- **MVP:** AWS Amplify (frontend + API routes)
- **Production:** S3 + CloudFront (frontend) + Lambda + API Gateway (backend)

## Development Setup

### Prerequisites
- Node.js 18+ (20+ recommended)
- npm or yarn
- AWS Account (for deployment)
- OpenAI API Key

### Environment Variables
```
OPENAI_API_KEY - OpenAI API key
AWS_REGION - AWS region (default: us-east-1)
DYNAMODB_TABLE_NAME - DynamoDB table name
S3_BUCKET_NAME - S3 bucket name
NEXT_PUBLIC_APP_URL - App URL
```

**Note**: AWS credentials use AWS CLI configuration (~/.aws/credentials), not environment variables.

### Installation
```
npm install
```

### Development Server
```
npm run dev
```

### Build
```
npm run build
```

### Deployment
AWS Amplify handles automatic deployment from Git

## Dependencies

### Core Dependencies
- next: ^14.2.0 - Framework
- react: ^18.3.1 - UI library
- react-dom: ^18.3.1 - React DOM
- typescript: ^5.4.0 - Type safety

### AWS SDK
- @aws-sdk/client-dynamodb - DynamoDB client
- @aws-sdk/client-s3 - S3 client
- @aws-sdk/lib-dynamodb - DynamoDB document client
- @aws-sdk/client-secrets-manager - Secrets Manager client

### AI & Math
- openai: ^4.0.0 - OpenAI SDK
- katex: ^0.16.0 - Math rendering
- react-katex: ^3.0.0 - React KaTeX wrapper

### UI & Utils
- tailwindcss: ^3.4.0 - Styling
- react-dropzone: ^14.2.0 - Image upload
- zod: ^3.22.0 - Schema validation

## Project Structure
```
app/ - Next.js app directory with App Router
  api/ - API routes
    chat/ - Chat endpoint
    parse-image/ - Image parsing endpoint
  components/ - React components
  hooks/ - Custom React hooks
  utils/ - Utility functions
  types/ - TypeScript types
  layout.tsx - Root layout
  page.tsx - Home page
  globals.css - Global styles
docs/ - Documentation
memory-bank/ - Memory bank files
public/ - Static assets
```

## Configuration Files
- package.json - Dependencies and scripts
- tsconfig.json - TypeScript configuration
- next.config.js - Next.js configuration
- tailwind.config.ts - Tailwind CSS configuration
- postcss.config.js - PostCSS configuration
- .cursorrules - Cursor AI rules

## Cost Considerations

### OpenAI API
- GPT-4 Vision: ~$0.01-0.03 per image
- GPT-4: ~$0.03-0.06 per 1K tokens
- Estimated: $0.10-0.50 per session

### AWS Services (MVP)
- Amplify: Free tier
- DynamoDB: Free tier (25GB storage)
- S3: Free tier (5GB storage)
- Total: ~$0-5/month within free tiers
