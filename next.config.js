/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    remotePatterns: [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Expose environment variables to the Next.js runtime
  // This is required for AWS Amplify SSR deployments
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    AWS_REGION: process.env.AWS_REGION,
  },
}

module.exports = nextConfig

