# MathSageAI - AWS Technology Stack Proposal

## Recommended Technology Stack for AWS Deployment

### Frontend

#### **Next.js 14+ (React Framework)**
**Pros:**
- ✅ Excellent AWS deployment options (Amplify, S3 + CloudFront)
- ✅ Built-in API routes (can replace separate backend)
- ✅ Server-side rendering (useful for SEO, though not critical)
- ✅ TypeScript support out of the box
- ✅ Great developer experience
- ✅ Large ecosystem and community
- ✅ Can be deployed as static site or serverless

**Cons:**
- ❌ Learning curve if team not familiar
- ❌ More opinionated than plain React
- ❌ Can be overkill for simple SPA (but worth it for deployment simplicity)

**AWS Deployment Options:**
1. **AWS Amplify** (Recommended for MVP)
   - Automatic deployments from Git
   - Built-in CI/CD
   - Free tier: 15 GB storage, 5 GB data transfer
   - Automatic SSL, CDN, custom domains

2. **S3 + CloudFront** (Production)
   - Static site hosting on S3
   - CloudFront CDN for global distribution
   - Very cost-effective at scale
   - More manual setup

---

### Backend

#### **Option A: Next.js API Routes (Recommended for MVP)**
**Pros:**
- ✅ Single codebase (frontend + backend)
- ✅ Deploy together on Amplify
- ✅ Simplest setup
- ✅ No separate service to manage
- ✅ Perfect for MVP

**Cons:**
- ❌ Limited to serverless functions (Amplify)
- ❌ Cold start latency possible
- ❌ Less flexible for complex backend logic
- ❌ Vendor lock-in to Amplify

**AWS Deployment:** AWS Amplify (includes API routes)

#### **Option B: Node.js + Express on AWS Lambda (Recommended for Production)**
**Pros:**
- ✅ Serverless, pay-per-use
- ✅ Automatic scaling
- ✅ No server management
- ✅ AWS Lambda free tier: 1M requests/month
- ✅ Can use Express.js with serverless-http wrapper
- ✅ Integrates with API Gateway

**Cons:**
- ❌ Cold start latency (100-500ms)
- ❌ 15-minute execution limit
- ❌ Memory limits (up to 10GB)
- ❌ More complex debugging

**AWS Deployment:** 
- **API Gateway + Lambda** (serverless)
- **Lambda Function URLs** (simpler, no API Gateway needed)

#### **Option C: Python + FastAPI on AWS Lambda**
**Pros:**
- ✅ Excellent AI/ML ecosystem
- ✅ FastAPI is modern and fast
- ✅ Mangum adapter for AWS Lambda
- ✅ Good for future ML features

**Cons:**
- ❌ Different language from frontend
- ❌ Lambda cold starts can be slower for Python
- ❌ Team needs Python knowledge

**AWS Deployment:** API Gateway + Lambda (using Mangum)

#### **Option D: Containerized on ECS/Fargate**
**Pros:**
- ✅ Full control over runtime
- ✅ No cold starts
- ✅ Can run long tasks
- ✅ Familiar development environment

**Cons:**
- ❌ More complex setup
- ❌ Higher cost (always running)
- ❌ Need to manage containers
- ❌ Overkill for MVP

**AWS Deployment:** ECS Fargate or ECS EC2

**Recommendation:** Next.js API Routes for MVP → Lambda + API Gateway for production

---

### LLM Integration

#### **OpenAI API (GPT-4 Vision + GPT-4)**
**Pros:**
- ✅ Best vision capabilities (GPT-4 Vision)
- ✅ Excellent instruction following
- ✅ Reliable, well-documented API
- ✅ Good for Socratic prompting
- ✅ Fast response times
- ✅ Can be called from Lambda

**Cons:**
- ❌ Cost ($0.03-0.06 per 1K tokens)
- ❌ API rate limits
- ❌ Requires API key management (AWS Secrets Manager)
- ❌ External dependency

**AWS Integration:**
- Store API key in **AWS Secrets Manager**
- Use **IAM roles** for Lambda access
- Consider **API Gateway throttling** to control costs

---

### Session Storage

#### **Option A: AWS ElastiCache (Redis) - Recommended for Production**
**Pros:**
- ✅ Fully managed Redis
- ✅ Fast, in-memory storage
- ✅ Automatic backups
- ✅ High availability
- ✅ Scales automatically
- ✅ Perfect for session storage

**Cons:**
- ❌ Cost (~$15/month for t3.micro)
- ❌ More setup complexity
- ❌ Overkill for MVP

**AWS Deployment:** ElastiCache for Redis (cluster mode disabled for MVP)

#### **Option B: AWS DynamoDB - Recommended for MVP**
**Pros:**
- ✅ Fully managed NoSQL database
- ✅ Serverless, pay-per-use
- ✅ Free tier: 25GB storage, 25 RCU/WCU
- ✅ Very fast (single-digit millisecond latency)
- ✅ Automatic scaling
- ✅ Simple API

**Cons:**
- ❌ NoSQL (less familiar than SQL)
- ❌ Query patterns can be limited
- ❌ Pricing can be confusing
- ❌ Slightly slower than Redis for simple reads

**AWS Deployment:** DynamoDB table with TTL for session expiration

#### **Option C: AWS RDS (PostgreSQL)**
**Pros:**
- ✅ Familiar SQL database
- ✅ Persistent storage
- ✅ Good for analytics
- ✅ Reliable, battle-tested

**Cons:**
- ❌ More expensive than DynamoDB
- ❌ Slower than Redis/DynamoDB
- ❌ Need to manage connections
- ❌ Overkill for session storage

**AWS Deployment:** RDS PostgreSQL (t3.micro for MVP, ~$15/month)

#### **Option D: In-Memory (Lambda) - For MVP Only**
**Pros:**
- ✅ Simplest implementation
- ✅ No additional cost
- ✅ Fast for single session

**Cons:**
- ❌ Lost on function restart
- ❌ Doesn't work across Lambda invocations
- ❌ Not suitable for production

**Recommendation:** DynamoDB for MVP → ElastiCache Redis for production

---

### Image Processing & Storage

#### **Image Processing: OpenAI Vision API**
**Pros:**
- ✅ Best OCR accuracy
- ✅ Handles handwritten text well
- ✅ No preprocessing needed
- ✅ Single API call

**Cons:**
- ❌ Cost per image (~$0.01-0.03)
- ❌ API dependency

#### **Image Storage: AWS S3**
**Pros:**
- ✅ Highly scalable
- ✅ Very cost-effective ($0.023/GB/month)
- ✅ Free tier: 5GB storage, 20K GET requests
- ✅ Integrates with CloudFront for CDN
- ✅ Lifecycle policies for cleanup
- ✅ Simple API

**Cons:**
- ❌ Need to manage permissions (IAM)
- ❌ Slightly more complex than base64

**AWS Integration:**
- **S3 Bucket** for image storage
- **IAM roles** for Lambda access
- **Pre-signed URLs** for secure uploads
- **CloudFront** for CDN (optional)

**Recommendation:** S3 for image storage, OpenAI Vision for processing

---

### Math Rendering

#### **KaTeX**
**Pros:**
- ✅ Fast rendering (client-side)
- ✅ Lightweight (~200KB)
- ✅ No external dependencies
- ✅ Good browser support
- ✅ Works well with React

**Cons:**
- ❌ Less LaTeX support than MathJax
- ❌ Some edge cases not supported

**Recommendation:** KaTeX (fast, lightweight, sufficient for math problems)

---

### State Management (Frontend)

#### **React Context API (MVP) → Zustand (if needed)**
**Pros:**
- ✅ Context API: Built-in, no dependencies
- ✅ Zustand: Lightweight (~1KB), simple API
- ✅ Both work well with Next.js

**Cons:**
- ❌ Context API can cause re-renders
- ❌ Zustand: Additional dependency

**Recommendation:** Context API for MVP, Zustand if state gets complex

---

### Monitoring & Logging

#### **AWS CloudWatch**
**Pros:**
- ✅ Built into AWS ecosystem
- ✅ Logs from Lambda automatically
- ✅ Metrics and alarms
- ✅ Free tier: 5GB ingestion, 5GB storage

**Cons:**
- ❌ Can be expensive at scale
- ❌ UI can be complex

**AWS Integration:**
- **CloudWatch Logs** for application logs
- **CloudWatch Metrics** for custom metrics
- **CloudWatch Alarms** for error notifications

---

### API Gateway & Security

#### **AWS API Gateway**
**Pros:**
- ✅ Fully managed API service
- ✅ Built-in throttling
- ✅ Authentication/authorization
- ✅ CORS handling
- ✅ Request/response transformations

**Cons:**
- ❌ Additional cost ($3.50 per million requests)
- ❌ More setup complexity
- ❌ Cold starts possible

**Alternative:** **Lambda Function URLs** (simpler, no API Gateway needed)

**Security:**
- **AWS Cognito** for user authentication (if needed)
- **IAM roles** for service-to-service auth
- **Secrets Manager** for API keys
- **WAF** for DDoS protection (if needed)

---

## Recommended AWS Architecture

### MVP Architecture (Simplest)

**AWS Amplify (Next.js App)**
- Frontend
- API Routes

**Connected Services:**
- AWS Secrets Manager (OpenAI API Key)
- AWS DynamoDB (Sessions)
- AWS S3 (Image Storage)

**Services:**
- **AWS Amplify** - Frontend + API Routes
- **AWS DynamoDB** - Session storage
- **AWS S3** - Image storage
- **AWS Secrets Manager** - API keys
- **AWS CloudWatch** - Logging

**Estimated Monthly Cost (MVP):** ~$5-10 (within free tiers mostly)

---

### Production Architecture (Scalable)

**Frontend:**
- S3 + CloudFront (Static Site)

**Backend:**
- API Gateway → AWS Lambda (Express API)

**Connected Services:**
- AWS ElastiCache (Redis) - Sessions
- AWS S3 - Images
- AWS Secrets Manager - OpenAI Key
- AWS CloudWatch - Logs

**Services:**
- **S3 + CloudFront** - Frontend hosting
- **API Gateway** - API management
- **AWS Lambda** - Backend API
- **AWS ElastiCache** - Session storage
- **AWS S3** - Image storage
- **AWS Secrets Manager** - API keys
- **AWS CloudWatch** - Monitoring

**Estimated Monthly Cost (Production):** ~$20-50 (depending on traffic)

---

## Cost Breakdown

### MVP (Low Traffic)
| Service | Usage | Cost |
|---------|-------|------|
| AWS Amplify | Free tier | $0 |
| DynamoDB | Free tier | $0 |
| S3 | Free tier | $0 |
| Lambda | Free tier | $0 |
| CloudWatch | Free tier | $0 |
| **Total** | | **~$0-5/month** |

### Production (Medium Traffic)
| Service | Usage | Cost |
|---------|-------|------|
| S3 + CloudFront | 100GB transfer | ~$10 |
| API Gateway | 1M requests | ~$3.50 |
| Lambda | 1M requests | ~$0.20 |
| ElastiCache | t3.micro | ~$15 |
| DynamoDB | 25GB storage | ~$5 |
| CloudWatch | Logs | ~$5 |
| **Total** | | **~$40-50/month** |

*Plus OpenAI API costs (~$0.10-0.50 per session)*

---

## Deployment Strategy

### Phase 1: MVP (Amplify)
1. Deploy Next.js app to **AWS Amplify**
2. Use Next.js API routes for backend
3. Store sessions in **DynamoDB**
4. Store images in **S3**
5. Store API keys in **Secrets Manager**

**Pros:** Simplest deployment, single service
**Cons:** Limited to Amplify's serverless functions

### Phase 2: Production (Lambda + API Gateway)
1. Frontend: **S3 + CloudFront** (static site)
2. Backend: **Lambda + API Gateway**
3. Sessions: **ElastiCache Redis**
4. Images: **S3** (with CloudFront CDN)
5. Monitoring: **CloudWatch**

**Pros:** More scalable, better performance
**Cons:** More complex setup

---

## Implementation Checklist

### Initial Setup
- [ ] Create AWS account
- [ ] Set up IAM user with appropriate permissions
- [ ] Create S3 bucket for images
- [ ] Create DynamoDB table for sessions
- [ ] Set up Secrets Manager for OpenAI key
- [ ] Configure CloudWatch for logging

### Frontend Deployment
- [ ] Initialize Next.js project
- [ ] Set up AWS Amplify (or S3 + CloudFront)
- [ ] Configure environment variables
- [ ] Set up CI/CD pipeline

### Backend Deployment
- [ ] Set up Lambda functions (or Next.js API routes)
- [ ] Configure API Gateway (if using Lambda)
- [ ] Set up IAM roles for Lambda
- [ ] Configure CORS

### Integration
- [ ] Connect to DynamoDB
- [ ] Connect to S3
- [ ] Integrate OpenAI API
- [ ] Set up error handling
- [ ] Configure logging

---

## Pros & Cons Summary

### Advantages of AWS Stack
✅ **Scalable**: Auto-scales with traffic
✅ **Cost-effective**: Pay only for what you use
✅ **Reliable**: 99.99% uptime SLA
✅ **Integrated**: All services work together seamlessly
✅ **Secure**: Built-in IAM, encryption, security features
✅ **Managed**: Less infrastructure to maintain
✅ **Flexible**: Can start simple, scale up

### Disadvantages of AWS Stack
❌ **Learning curve**: AWS services can be complex
❌ **Vendor lock-in**: Harder to migrate away
❌ **Cost management**: Need to monitor usage
❌ **Cold starts**: Lambda cold starts can add latency
❌ **Complexity**: More services to manage
❌ **Debugging**: Can be harder than local development

---

## Alternative AWS Configurations

### Option 1: Fully Serverless (Recommended)
- **Frontend**: Amplify or S3 + CloudFront
- **Backend**: Lambda + API Gateway
- **Storage**: DynamoDB + S3
- **Pros**: Most cost-effective, auto-scales
- **Cons**: Cold starts, complexity

### Option 2: Containerized
- **Frontend**: S3 + CloudFront
- **Backend**: ECS Fargate
- **Storage**: RDS + S3
- **Pros**: No cold starts, familiar environment
- **Cons**: Always running = higher cost

### Option 3: Hybrid
- **Frontend**: S3 + CloudFront
- **Backend**: Lambda + API Gateway
- **Storage**: ElastiCache + S3
- **Pros**: Balance of cost and performance
- **Cons**: More moving parts

---

## Next Steps

1. **Choose deployment option** (Amplify for MVP or Lambda for production)
2. **Set up AWS account** and configure IAM
3. **Create resources** (S3, DynamoDB, Secrets Manager)
4. **Set up CI/CD** (Amplify or CodePipeline)
5. **Implement and deploy** incrementally

---

## Questions to Consider

1. **Expected traffic?** (affects cost and scaling strategy)
2. **Budget constraints?** (affects service choices)
3. **Team AWS expertise?** (affects complexity tolerance)
4. **Need for real-time?** (affects WebSocket/API Gateway choice)
5. **Long-term plans?** (affects architecture decisions)

---

**Recommendation:** Start with **AWS Amplify + Next.js API Routes + DynamoDB + S3** for MVP. Migrate to **Lambda + API Gateway + ElastiCache** when you need more scale or control.

