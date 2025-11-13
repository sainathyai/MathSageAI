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
  // OpenAI - Now fetched from AWS Secrets Manager (see lib/secrets-manager.ts)
  // OPENAI_API_KEY env var is only used as fallback for local development
  openaiApiKey: process.env.OPENAI_API_KEY || '', // Fallback for local dev only
  
  // AWS Configuration
  // Note: AWS_REGION cannot be used in Amplify (reserved prefix)
  // Using RESOURCES_REGION instead, defaults to us-east-1 where all resources are located
  awsRegion: process.env.RESOURCES_REGION || 'us-east-1',
  dynamoDbTableName: process.env.DYNAMODB_TABLE_NAME || 'mathsage-sessions',
  s3BucketName: process.env.S3_BUCKET_NAME || 'mathsage-images-971422717446',
  openaiSecretName: process.env.OPENAI_SECRET_NAME || 'openai/sainathyai',
  
  // Node environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const

// Client-side environment variables (available in browser)
export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  cognitoUserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  cognitoClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
} as const

/**
 * Validate required environment variables
 * Note: OPENAI_API_KEY is no longer required - it's fetched from Secrets Manager
 * Call this in API routes to ensure all required vars are set
 */
export function validateEnv() {
  const required = {
    // OPENAI_API_KEY is now fetched from Secrets Manager, not required as env var
    DYNAMODB_TABLE_NAME: env.dynamoDbTableName,
    S3_BUCKET_NAME: env.s3BucketName,
  }

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check AWS Secrets Manager and Amplify environment variables.`
    )
  }

  return true
}

/**
 * Get AWS configuration
 * In Amplify, credentials are automatically provided via IAM role
 * The SDK will use the default credential provider chain:
 * 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
 * 2. IAM role (in Amplify/Lambda - automatically available)
 * 3. AWS credentials file (~/.aws/credentials) - for local dev
 */
export function getAwsConfig() {
  return {
    region: env.awsRegion,
    // Don't explicitly set credentials - let SDK use default provider chain
    // In Amplify, the IAM role credentials are automatically available
  }
}

