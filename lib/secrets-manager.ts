/**
 * AWS Secrets Manager utility
 * 
 * Fetches secrets from AWS Secrets Manager with caching and fallback to environment variables
 */

import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { getAwsConfig } from './env'

// Cache for secrets (to avoid repeated API calls)
const secretCache = new Map<string, { value: string; expiresAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Normalize API key by removing UTF-8 BOM and trimming whitespace
 * BOM (Byte Order Mark) can sometimes be present when secrets are copied from certain editors
 * 
 * @param rawValue - Raw string value that may contain BOM
 * @returns Cleaned string without BOM and trimmed
 */
function normalizeOpenAIKey(rawValue: string): string {
  if (!rawValue || typeof rawValue !== 'string') {
    return rawValue
  }
  // Remove UTF-8 BOM (\uFEFF) if present at the start
  // Also trim any leading/trailing whitespace
  return rawValue.replace(/^\uFEFF/, '').trim()
}

/**
 * Get secret from AWS Secrets Manager
 * Falls back to environment variable for local development
 * 
 * @param secretName - Name of the secret in AWS Secrets Manager
 * @param envVarFallback - Environment variable name to use as fallback (for local dev)
 * @returns Secret value
 */
export async function getSecret(
  secretName: string,
  envVarFallback?: string
): Promise<string> {
  // Check cache first
  const cached = secretCache.get(secretName)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  // For local development, use environment variable if available
  if (process.env.NODE_ENV === 'development' && envVarFallback) {
    const envValue = process.env[envVarFallback]
    if (envValue) {
      console.log(`[Secrets Manager] Using environment variable ${envVarFallback} for local development`)
      return normalizeOpenAIKey(envValue)
    }
  }

  try {
    // Fetch from AWS Secrets Manager
    const client = new SecretsManagerClient(getAwsConfig())
    const command = new GetSecretValueCommand({
      SecretId: secretName,
    })

    const response = await client.send(command)
    
    // Parse secret value (can be string or JSON)
    let secretValue: string
    if (response.SecretString) {
      // Remove BOM from raw secret string before processing
      const cleanedSecretString = normalizeOpenAIKey(response.SecretString)
      
      try {
        // Try to parse as JSON (in case secret is stored as JSON object)
        const parsed = JSON.parse(cleanedSecretString)
        // If it's an object, try to get the key that matches the secret name
        // or use common key names for API keys
        if (typeof parsed === 'string') {
          secretValue = normalizeOpenAIKey(parsed)
        } else if (typeof parsed === 'object' && parsed !== null) {
          // Try common API key field names in order of preference
          const rawKey = parsed.apiKey || parsed.api_key || parsed.OPENAI_API_KEY || parsed.openai_api_key || parsed.value || parsed.key || Object.values(parsed)[0] as string
          if (!rawKey || typeof rawKey !== 'string') {
            throw new Error(`No valid API key found in secret JSON object. Available keys: ${Object.keys(parsed).join(', ')}`)
          }
          // Normalize the extracted key (remove BOM, trim)
          secretValue = normalizeOpenAIKey(rawKey)
        } else {
          secretValue = normalizeOpenAIKey(String(parsed))
        }
        console.log(`[Secrets Manager] Successfully parsed JSON secret: ${secretName}`)
      } catch (parseError) {
        // Not JSON, use as-is (already cleaned of BOM)
        console.log(`[Secrets Manager] Secret is not JSON, using as plaintext: ${secretName}`)
        secretValue = cleanedSecretString
      }
    } else if (response.SecretBinary) {
      // Binary secret (unlikely for API keys, but handle it)
      const binaryString = Buffer.from(response.SecretBinary).toString('utf-8')
      secretValue = normalizeOpenAIKey(binaryString)
    } else {
      throw new Error('Secret value is empty')
    }
    
    // Validate that we got a non-empty string (after normalization)
    if (!secretValue || typeof secretValue !== 'string' || secretValue.length === 0) {
      throw new Error(`Secret value is empty or invalid for ${secretName}`)
    }

    // Cache the secret
    secretCache.set(secretName, {
      value: secretValue,
      expiresAt: Date.now() + CACHE_TTL,
    })

    console.log(`[Secrets Manager] Successfully retrieved secret: ${secretName}`)
    return secretValue
  } catch (error) {
    console.error(`[Secrets Manager] Error fetching secret ${secretName}:`, error)
    
    // Fallback to environment variable if available
    if (envVarFallback) {
      const envValue = process.env[envVarFallback]
      if (envValue) {
        console.warn(`[Secrets Manager] Using environment variable fallback: ${envVarFallback}`)
        return normalizeOpenAIKey(envValue)
      }
    }
    
    throw new Error(
      `Failed to retrieve secret ${secretName} from AWS Secrets Manager. ` +
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Get OpenAI API key from Secrets Manager
 * Falls back to OPENAI_API_KEY environment variable for local development
 */
export async function getOpenAIApiKey(): Promise<string> {
  const secretName = process.env.OPENAI_SECRET_NAME || 'openai/sainathyai'
  return getSecret(secretName, 'OPENAI_API_KEY')
}

/**
 * Clear secret cache (useful for testing or forced refresh)
 */
export function clearSecretCache(secretName?: string): void {
  if (secretName) {
    secretCache.delete(secretName)
  } else {
    secretCache.clear()
  }
}

