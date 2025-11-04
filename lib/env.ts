/**
 * Environment variables configuration
 * 
 * Next.js automatically loads environment variables from:
 * - .env.local (highest priority, gitignored)
 * - .env.development / .env.production (environment-specific)
 * - .env (lowest priority)
 * 
 * Server-side variables: Available as process.env.VAR_NAME
 * Client-side variables: Must be prefixed with NEXT_PUBLIC_
 */

// Server-side environment variables (only available in API routes)
export const env = {
  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  
  // AWS Configuration
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  dynamoDbTableName: process.env.DYNAMODB_TABLE_NAME || 'mathsage-sessions',
  s3BucketName: process.env.S3_BUCKET_NAME || 'mathsage-images-971422717446',
  
  // Node environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const

// Client-side environment variables (available in browser)
export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const

/**
 * Validate required environment variables
 * Call this in API routes to ensure all required vars are set
 */
export function validateEnv() {
  const required = {
    OPENAI_API_KEY: env.openaiApiKey,
    DYNAMODB_TABLE_NAME: env.dynamoDbTableName,
    S3_BUCKET_NAME: env.s3BucketName,
  }

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env.local file.`
    )
  }

  return true
}

/**
 * Get AWS configuration
 * Uses AWS CLI credentials from ~/.aws/credentials automatically
 */
export function getAwsConfig() {
  return {
    region: env.awsRegion,
    // Credentials are automatically loaded from:
    // 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
    // 2. AWS credentials file (~/.aws/credentials)
    // 3. IAM role (if running on EC2/Lambda)
    // No need to explicitly set credentials if AWS CLI is configured
  }
}

