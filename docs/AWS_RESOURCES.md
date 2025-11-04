# AWS Resources Created

## DynamoDB Table

**Name:** mathsage-sessions
**Region:** us-east-1
**Status:** ACTIVE
**Billing Mode:** PAY_PER_REQUEST (on-demand)
**Primary Key:** sessionId (String)
**TTL:** Enabled (attribute: ttl)
**ARN:** arn:aws:dynamodb:us-east-1:971422717446:table/mathsage-sessions

### Features:
- Pay-per-request billing (no provisioned capacity)
- Automatic TTL expiration for old sessions
- Tagged with Project=MathSageAI, Environment=Development

### Schema:
- sessionId (String) - Primary key
- problem (String) - Math problem text
- messages (List) - Conversation messages
- turnCount (Number) - Number of turns in conversation
- createdAt (Number) - Unix timestamp
- ttl (Number) - Unix timestamp for expiration

## S3 Bucket

**Name:** mathsage-images-971422717446
**Region:** us-east-1
**Status:** ACTIVE
**ARN:** arn:aws:s3:::mathsage-images-971422717446

### Security:
- âœ… Block all public access enabled
- âœ… Server-side encryption (AES256)
- âœ… Bucket policy prevents public access

### Lifecycle:
- âœ… Automatic deletion of objects after 30 days

### Tags:
- Project: MathSageAI
- Environment: Development

## Configuration

Environment variables in .env.local:
\\\
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=mathsage-sessions
S3_BUCKET_NAME=mathsage-images-971422717446
\\\

AWS credentials are used from AWS CLI configuration (~/.aws/credentials)

## Cost Estimation

### DynamoDB (Pay-per-request)
- First 25 GB storage: Free tier
- Reads: \.25 per million requests
- Writes: \.25 per million requests
- Expected: \-5/month for low traffic

### S3
- Storage: \.023/GB/month
- PUT requests: \.005 per 1,000 requests
- GET requests: \.0004 per 1,000 requests
- Expected: \-2/month for image storage (with 30-day cleanup)

**Total AWS Cost: \-10/month** (mostly within free tier for MVP)

---

**Created:** November 3, 2025
**Status:** âœ… All resources active and configured
