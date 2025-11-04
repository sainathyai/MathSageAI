# AWS Amplify Deployment Guide - MathSageAI

## Prerequisites

Before deploying, ensure you have:
- ✅ Code pushed to GitHub (master branch)
- ✅ AWS Account with admin access
- ✅ OpenAI API Key
- ✅ AWS CLI configured locally (for DynamoDB/S3 setup)

---

## Step 1: Provision AWS Resources

### 1.1 Create DynamoDB Table

```bash
aws dynamodb create-table \
    --table-name mathsage-sessions \
    --attribute-definitions \
        AttributeName=PK,AttributeType=S \
        AttributeName=SK,AttributeType=S \
    --key-schema \
        AttributeName=PK,KeyType=HASH \
        AttributeName=SK,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

**Enable TTL for automatic session cleanup:**
```bash
aws dynamodb update-time-to-live \
    --table-name mathsage-sessions \
    --time-to-live-specification \
        "Enabled=true, AttributeName=expiresAt" \
    --region us-east-1
```

### 1.2 Create S3 Bucket

```bash
aws s3 mb s3://mathsage-images-$(aws sts get-caller-identity --query Account --output text) \
    --region us-east-1
```

**Configure bucket encryption:**
```bash
aws s3api put-bucket-encryption \
    --bucket mathsage-images-$(aws sts get-caller-identity --query Account --output text) \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }' \
    --region us-east-1
```

**Block public access:**
```bash
aws s3api put-public-access-block \
    --bucket mathsage-images-$(aws sts get-caller-identity --query Account --output text) \
    --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
    --region us-east-1
```

### 1.3 Create IAM Role for Amplify

**Create trust policy file (`amplify-trust-policy.json`):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "amplify.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**Create IAM role:**
```bash
aws iam create-role \
    --role-name MathSageAI-Amplify-Role \
    --assume-role-policy-document file://amplify-trust-policy.json
```

**Create permissions policy file (`amplify-permissions.json`):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/mathsage-sessions"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::mathsage-images-*/*"
    }
  ]
}
```

**Attach policy:**
```bash
aws iam put-role-policy \
    --role-name MathSageAI-Amplify-Role \
    --policy-name MathSageAI-Permissions \
    --policy-document file://amplify-permissions.json
```

---

## Step 2: Set Up AWS Amplify

### 2.1 Go to AWS Amplify Console

1. Open AWS Console: https://console.aws.amazon.com/
2. Search for "AWS Amplify"
3. Click "Get Started" or "New app"

### 2.2 Connect GitHub Repository

1. **Select Source Control:**
   - Choose "GitHub"
   - Click "Connect branch"

2. **Authorize GitHub:**
   - You'll be redirected to GitHub
   - Authorize AWS Amplify to access your repositories

3. **Select Repository:**
   - Organization/Username: `sainathyai` (or your username)
   - Repository: `MathSageAI`
   - Branch: `master`
   - Click "Next"

### 2.3 Configure Build Settings

**App name:** `MathSageAI`

**Build settings** (should auto-detect Next.js):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

**Environment:** Select Node.js 18 or 20

Click "Next"

### 2.4 Configure Environment Variables

Click "Advanced settings" → "Environment variables"

Add the following variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `OPENAI_API_KEY` | `sk-...` | Your OpenAI API key |
| `AWS_REGION` | `us-east-1` | AWS region |
| `DYNAMODB_TABLE_NAME` | `mathsage-sessions` | DynamoDB table name |
| `S3_BUCKET_NAME` | `mathsage-images-XXXX` | Your S3 bucket name |
| `NEXT_PUBLIC_APP_URL` | (leave empty for now) | Will update after deployment |

**Important:** AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are NOT needed. Amplify uses the IAM role we created.

### 2.5 Configure Service Role (Optional but Recommended)

1. Under "Service role", select "Create new role"
2. Or use existing role: `MathSageAI-Amplify-Role`
3. This grants Amplify permissions to access DynamoDB and S3

Click "Next" → "Save and deploy"

---

## Step 3: Deploy

### 3.1 Wait for Build to Complete

Amplify will:
1. ✅ Provision environment
2. ✅ Clone repository
3. ✅ Install dependencies (`npm ci`)
4. ✅ Build Next.js app (`npm run build`)
5. ✅ Deploy to CDN

**Expected time:** 5-10 minutes

### 3.2 Monitor Build Progress

In Amplify console:
- **Provision**: Setting up build environment
- **Build**: Running npm ci and npm run build
- **Deploy**: Uploading to CDN
- **Verify**: Final checks

### 3.3 Check for Errors

If build fails:
- Click on failed step to see logs
- Common issues:
  - Missing environment variables
  - TypeScript errors
  - Missing dependencies
  - Build timeout (increase in Amplify settings)

---

## Step 4: Update Environment Variables

### 4.1 Get Deployed URL

After successful deployment, you'll see:
- **URL**: `https://master.xxxxxxx.amplifyapp.com`

### 4.2 Update NEXT_PUBLIC_APP_URL

1. Go to "Environment variables" in Amplify console
2. Edit `NEXT_PUBLIC_APP_URL`
3. Set value to your deployed URL
4. Click "Save"

**This triggers a rebuild** - Wait for it to complete.

---

## Step 5: Test Deployed App

### 5.1 Access the App

Open your deployed URL: `https://master.xxxxxxx.amplifyapp.com`

### 5.2 Test Core Features

- [ ] **UI Loads:** Homepage loads with MathSageAI branding
- [ ] **Text Input:** Type a math problem and send
- [ ] **Socratic Dialogue:** AI responds with guiding questions (no direct answers)
- [ ] **Math Rendering:** LaTeX expressions render correctly
- [ ] **Image Upload:** Upload an image of a math problem
- [ ] **Image Parsing:** Problem extracted from image
- [ ] **Context Maintenance:** AI remembers conversation history
- [ ] **Responsive Design:** Test on mobile/tablet

### 5.3 Check Console for Errors

Open browser DevTools (F12):
- Console tab: Check for JavaScript errors
- Network tab: Check for failed API requests

**Common Issues:**
- **CORS errors:** Check API route configuration
- **401 Unauthorized:** Check OpenAI API key in environment variables
- **DynamoDB errors:** Check IAM permissions and table name
- **S3 errors:** Check bucket permissions and name

---

## Step 6: Configure Custom Domain (Optional)

### 6.1 Add Custom Domain

1. In Amplify console, go to "Domain management"
2. Click "Add domain"
3. Enter your domain (e.g., `mathsage.ai`)
4. Configure DNS settings as instructed

### 6.2 SSL Certificate

Amplify automatically provisions SSL certificate via AWS Certificate Manager (ACM).

**Wait time:** 24-48 hours for DNS propagation.

---

## Step 7: Set Up Continuous Deployment

### 7.1 Automatic Deployments

Already configured! Every push to `master` branch triggers:
1. Amplify detects changes
2. Runs build
3. Deploys to production
4. Updates live URL

### 7.2 Branch-Based Deployments (Optional)

Create preview environments for feature branches:

1. In Amplify console, go to "Branches"
2. Click "Connect branch"
3. Select branch (e.g., `feature/phase2-concept-tracking`)
4. Each branch gets its own URL: `https://phase2.xxxxxxx.amplifyapp.com`

**Useful for:** Testing features before merging to master.

---

## Troubleshooting

### Build Fails with "Module not found"

**Solution:** Ensure all dependencies are in `package.json`:
```bash
npm install
git add package.json package-lock.json
git commit -m "fix: Update dependencies"
git push origin master
```

### Runtime Error: "Cannot connect to DynamoDB"

**Possible causes:**
1. **Wrong table name:** Check `DYNAMODB_TABLE_NAME` environment variable
2. **Wrong region:** Check `AWS_REGION` environment variable
3. **IAM permissions:** Ensure Amplify role has DynamoDB access
4. **Table doesn't exist:** Verify table exists in correct region

**Solution:**
```bash
# Verify table exists
aws dynamodb describe-table --table-name mathsage-sessions --region us-east-1
```

### OpenAI API Errors

**Possible causes:**
1. **Invalid API key:** Check `OPENAI_API_KEY` environment variable
2. **Rate limiting:** Wait a few minutes, try again
3. **Insufficient credits:** Check OpenAI account billing

**Solution:** 
- Verify API key in OpenAI dashboard
- Test locally with same key to rule out code issues

### Images Not Loading

**Possible causes:**
1. **S3 bucket doesn't exist:** Check `S3_BUCKET_NAME`
2. **IAM permissions:** Ensure Amplify role has S3 access
3. **CORS configuration:** Check S3 bucket CORS settings

**Solution:**
```bash
# Verify bucket exists
aws s3 ls s3://mathsage-images-XXXX --region us-east-1
```

---

## Monitoring & Logs

### Access Logs

1. Go to Amplify console
2. Click on your app
3. Navigate to "Monitoring" tab

**Available logs:**
- **Access logs:** HTTP requests
- **Function logs:** API route execution (Next.js API routes run on Lambda@Edge)

### CloudWatch Logs

For detailed debugging:
1. Go to AWS CloudWatch console
2. Navigate to "Logs" → "Log groups"
3. Find: `/aws/amplify/MathSageAI`

---

## Cost Optimization

### Amplify Pricing

- **Build minutes:** $0.01 per build minute
- **Data transfer:** $0.15 per GB (beyond free tier)
- **Storage:** $0.023 per GB-month

### Estimated Monthly Cost (Low Traffic)

- **Amplify:** ~$0-5 (mostly free tier)
- **DynamoDB:** ~$0-2 (free tier covers 25GB + 25 RCU/WCU)
- **S3:** ~$0-1 (free tier covers 5GB storage)
- **OpenAI API:** ~$10-50 (depends on usage)

**Total:** ~$10-60/month for low-medium traffic

---

## Next Steps After Deployment

1. ✅ **Update README:** Add deployed URL
2. ✅ **Test all features:** Complete submission checklist
3. ✅ **Create example walkthroughs:** Document conversations using deployed app
4. ✅ **Record demo video:** Show deployed app working
5. ✅ **Submit:** Provide GitHub + deployed URL + video link

---

## Quick Reference

### Deployed URL
`https://master.xxxxxxx.amplifyapp.com` (update after deployment)

### Environment Variables
```
OPENAI_API_KEY=sk-...
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=mathsage-sessions
S3_BUCKET_NAME=mathsage-images-XXXX
NEXT_PUBLIC_APP_URL=https://master.xxxxxxx.amplifyapp.com
```

### AWS Resources
- **DynamoDB Table:** `mathsage-sessions` (us-east-1)
- **S3 Bucket:** `mathsage-images-XXXX` (us-east-1)
- **IAM Role:** `MathSageAI-Amplify-Role`

### Useful Commands
```bash
# View DynamoDB table
aws dynamodb describe-table --table-name mathsage-sessions --region us-east-1

# List S3 bucket
aws s3 ls s3://mathsage-images-XXXX --region us-east-1

# Check Amplify apps
aws amplify list-apps --region us-east-1
```

---

**🚀 Ready to deploy! Follow the steps above and your app will be live in ~15-30 minutes.**

