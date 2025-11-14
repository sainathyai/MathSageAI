# AWS Credentials Fix - "Could not load credentials from any providers"

## Issue
Error: `Could not load credentials from any providers` when accessing DynamoDB from Next.js API routes in Amplify.

## Root Cause
Amplify's WEB_COMPUTE platform (Next.js) uses the service role attached to the Amplify app to provide credentials. However, the AWS SDK might not be finding these credentials through the default provider chain.

## Solution

### Option 1: Verify Service Role is Attached (CRITICAL)
The Amplify app must have a service role attached that has the necessary permissions.

**Check:**
```bash
aws amplify get-app --app-id d2ohw6j2qrh9l8 --query 'app.iamServiceRoleArn'
```

**Current Service Role:** `arn:aws:iam::971422717446:role/amplifyconsole-backend-role`

### Option 2: Verify IAM Role Permissions
The service role must have permissions for:
- DynamoDB access
- S3 access  
- Secrets Manager access

**Current Permissions (MathSageAIaccess policy):**
- ✅ `cloudwatch:*`
- ✅ `dynamodb:*`
- ✅ `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket`
- ✅ `secretsmanager:GetSecretValue`
- ✅ `secretsmanager:DescribeSecret`

### Option 3: Use Environment Variables (Temporary Workaround)
If IAM role credentials aren't working, you can temporarily use access keys:

**Add to Amplify Environment Variables:**
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key

**Note:** This is less secure but can work as a temporary solution.

### Option 4: Check Amplify Service Role Trust Policy
The service role must allow Amplify to assume it:

**Required Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "amplify.amazonaws.com",
          "lambda.amazonaws.com",
          "edgelambda.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**Current Trust Policy:** ✅ Correct (includes amplify.amazonaws.com)

## Next Steps

1. **Verify Service Role is Attached in Amplify Console:**
   - Go to Amplify Console → App Settings → General
   - Check "Service role" is set to `amplifyconsole-backend-role`

2. **If Service Role is Missing:**
   - Attach the role: `amplifyconsole-backend-role`
   - Redeploy the app

3. **If Still Failing:**
   - Temporarily add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as environment variables
   - This will allow the SDK to find credentials via environment variables
   - Then investigate why IAM role credentials aren't working

## Current Status

- ✅ Service Role: `amplifyconsole-backend-role` is attached
- ✅ IAM Permissions: All required permissions are present
- ✅ Trust Policy: Correctly configured
- ❌ Credentials: SDK can't find credentials

**Most Likely Issue:** Amplify WEB_COMPUTE might need explicit credential configuration or the service role credentials aren't being injected into the runtime environment.

