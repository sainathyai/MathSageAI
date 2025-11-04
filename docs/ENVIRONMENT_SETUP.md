# Environment Variables Setup

## How Next.js Loads Environment Variables

Next.js automatically loads environment variables from files in this order (highest to lowest priority):

1. `.env.local` - Local overrides (gitignored, highest priority)
2. `.env.development` / `.env.production` - Environment-specific
3. `.env` - Default values (lowest priority)

**Important**: Variables are automatically available in:
- **Server-side** (API routes): `process.env.VAR_NAME`
- **Client-side** (browser): Must be prefixed with `NEXT_PUBLIC_`

## Quick Setup

### Option 1: Automatic Setup (Recommended)

```bash
npm run setup:env
```

This creates `.env.local` from `.env.example` automatically.

### Option 2: Manual Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your actual values:
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

## Environment Variables

### Required Variables

| Variable | Description | Where Used |
|----------|-------------|------------|
| `OPENAI_API_KEY` | Your OpenAI API key | API routes (server-side) |
| `AWS_REGION` | AWS region (default: us-east-1) | AWS SDK configuration |
| `DYNAMODB_TABLE_NAME` | DynamoDB table name | Session storage |
| `S3_BUCKET_NAME` | S3 bucket name | Image storage |
| `NEXT_PUBLIC_APP_URL` | App URL (for client-side) | Frontend configuration |

### AWS Credentials

**Note**: AWS credentials are automatically loaded from:
1. AWS CLI configuration (`~/.aws/credentials`) - **Already configured**
2. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
3. IAM role (if running on EC2/Lambda)

**You don't need to set AWS credentials in `.env.local`** - they're loaded automatically from AWS CLI.

## Using Environment Variables in Code

### Server-Side (API Routes)

```typescript
import { env, validateEnv } from '@/lib/env'

// Validate on startup
validateEnv()

// Use variables
const apiKey = env.openaiApiKey
const region = env.awsRegion
```

### Client-Side (React Components)

```typescript
import { publicEnv } from '@/lib/env'

// Use public variables
const appUrl = publicEnv.appUrl
```

**Important**: Only variables prefixed with `NEXT_PUBLIC_` are available in the browser.

## Validation

The `lib/env.ts` file includes validation to ensure required variables are set:

```typescript
import { validateEnv } from '@/lib/env'

// In API routes
validateEnv() // Throws error if required vars are missing
```

## Environment-Specific Files

### Development
- `.env.local` - Your local development overrides
- `.env.development` - Shared development defaults

### Production
- `.env.production` - Production defaults
- AWS Amplify will set these via environment variable configuration

## Troubleshooting

### Variables not loading?
1. Restart the dev server: `npm run dev`
2. Check file name is exactly `.env.local` (not `.env.local.txt`)
3. Verify variable is not prefixed with `NEXT_PUBLIC_` for server-side only
4. Check `.env.local` is in project root (same level as `package.json`)

### AWS credentials not working?
1. Verify AWS CLI is configured: `aws configure list`
2. Check credentials file exists: `~/.aws/credentials`
3. Verify AWS region matches: `AWS_REGION` in `.env.local`

### Build errors?
- Ensure all required variables are set
- Check for typos in variable names
- Verify `NEXT_PUBLIC_` prefix for client-side variables

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use `.env.example`** - Template file (safe to commit)
3. **Rotate keys regularly** - Especially API keys
4. **Use AWS Secrets Manager** - For production deployment
5. **Validate on startup** - Use `validateEnv()` in API routes

## Automatic Loading

Next.js automatically:
- ✅ Loads `.env.local` when you run `npm run dev`
- ✅ Loads `.env.production` when you run `npm run build`
- ✅ Makes `NEXT_PUBLIC_*` variables available in browser
- ✅ Keeps server-side variables secure (not exposed to client)

**No additional configuration needed!** Just create `.env.local` and Next.js handles the rest.

---

**Quick Start**: Run `npm run setup:env` to create `.env.local` automatically.

