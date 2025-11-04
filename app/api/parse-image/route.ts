import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { env, validateEnv } from '@/lib/env'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.openaiApiKey,
})

// Validate environment variables on module load
// Note: This validation is non-blocking - errors are logged but don't prevent server startup
try {
  validateEnv()
} catch (error) {
  // Log warning but don't throw - allows server to start
  console.warn('Environment validation warning (non-fatal):', error instanceof Error ? error.message : error)
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [parse-image] Request received')
    
    // Validate environment variables at runtime
    try {
      validateEnv()
      console.log('✅ [parse-image] Environment variables validated')
    } catch (error) {
      console.error('❌ [parse-image] Environment validation failed:', error)
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          message: error instanceof Error ? error.message : 'Missing required environment variables. Please check .env.local file.'
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { image } = body

    console.log('📥 [parse-image] Image data received:', {
      hasImage: !!image,
      imageType: typeof image,
      imageLength: image?.length || 0,
      imagePrefix: image?.substring(0, 100) || 'N/A',
      startsWithData: image?.startsWith('data:') || false,
    })

    if (!image) {
      console.error('❌ [parse-image] No image data provided')
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    // Format the image URL - ensure it has the data URL prefix
    let imageUrl: string
    let detectedFormat = 'unknown'
    
    if (image.startsWith('data:')) {
      imageUrl = image
      // Extract MIME type from data URL
      const mimeMatch = image.match(/data:([^;]+);/)
      if (mimeMatch) {
        detectedFormat = mimeMatch[1]
        console.log('📋 [parse-image] Detected format from data URL:', detectedFormat)
      }
    } else if (image.startsWith('http://') || image.startsWith('https://')) {
      imageUrl = image
      detectedFormat = 'http-url'
      console.log('📋 [parse-image] Image is HTTP URL')
    } else {
      // Assume it's base64 without prefix
      // Try to detect format from first bytes (magic numbers)
      // Decode base64 to check actual binary format
      try {
        const base64Start = image.substring(0, 50)
        const binaryStart = Buffer.from(image.substring(0, 32), 'base64').toString('hex')
        
        // Check for HEIC/HEIF format (common on iPhones)
        if (base64Start.startsWith('AAAA') || binaryStart.includes('6674797068656966') || binaryStart.includes('667479706d696631')) {
          detectedFormat = 'image/heic'
          console.error('❌ [parse-image] HEIC/HEIF format detected - not supported by OpenAI')
          return NextResponse.json(
            {
              error: 'Unsupported image format',
              message: 'HEIC/HEIF format is not supported. Please convert your image to PNG, JPEG, GIF, or WebP format. You can do this by opening the image in an image editor and saving it as PNG or JPEG.',
            },
            { status: 400 }
          )
        }
        
        // Check for AVIF format (newer format, also not supported)
        // Convert binary to text to check for 'avif' signature
        const textStart = Buffer.from(image.substring(0, 20), 'base64').toString('ascii')
        if (binaryStart.includes('6674797061766966') || // 'ftypavif' in hex
            textStart.includes('avif')) {
          detectedFormat = 'image/avif'
          console.error('❌ [parse-image] AVIF format detected - not supported by OpenAI')
          return NextResponse.json(
            {
              error: 'Unsupported image format',
              message: 'AVIF format is not supported. Please convert your image to PNG, JPEG, GIF, or WebP format. You can do this by opening the image in an image editor and saving it as PNG or JPEG.',
            },
            { status: 400 }
          )
        }
        
        // Check for PNG
        if (base64Start.startsWith('iVBORw0KGgo') || binaryStart.startsWith('89504e47')) {
          detectedFormat = 'image/png'
          imageUrl = `data:image/png;base64,${image}`
        }
        // Check for JPEG
        else if (base64Start.startsWith('/9j') || binaryStart.startsWith('ffd8ff')) {
          detectedFormat = 'image/jpeg'
          imageUrl = `data:image/jpeg;base64,${image}`
        }
        // Check for GIF
        else if (base64Start.startsWith('R0lGOD') || binaryStart.startsWith('47494638')) {
          detectedFormat = 'image/gif'
          imageUrl = `data:image/gif;base64,${image}`
        }
        // Check for WebP
        else if (base64Start.startsWith('UklGR') || binaryStart.startsWith('52494646')) {
          detectedFormat = 'image/webp'
          imageUrl = `data:image/webp;base64,${image}`
        }
        else {
          // Unknown format - reject it
          console.error('❌ [parse-image] Unknown image format detected:', {
            base64Start: base64Start.substring(0, 20),
            binaryStart: binaryStart.substring(0, 20),
          })
          return NextResponse.json(
            {
              error: 'Unknown image format',
              message: 'Could not detect the image format. Please ensure your image is in PNG, JPEG, GIF, or WebP format. If you\'re using HEIC/HEIF (common on iPhones), please convert it to PNG or JPEG first.',
            },
            { status: 400 }
          )
        }
        console.log('📋 [parse-image] Detected format from base64:', detectedFormat)
      } catch (decodeError) {
        console.error('❌ [parse-image] Error decoding base64:', decodeError)
        return NextResponse.json(
          {
            error: 'Invalid image data',
            message: 'Could not decode the image data. Please ensure the image is properly encoded.',
          },
          { status: 400 }
        )
      }
    }
    
    // Validate format
    const allowedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    const formatParts = detectedFormat.toLowerCase().split('/')
    const formatExtension = formatParts[formatParts.length - 1].split(' ')[0] // Get 'png', 'jpeg', etc. (remove "(assumed)" if present)
    const isAllowed = allowedFormats.some(format => {
      const formatType = format.split('/')[1]
      return formatExtension === formatType || formatExtension === 'jpg' && formatType === 'jpeg'
    })
    
    if (!isAllowed) {
      console.error('❌ [parse-image] Unsupported format:', {
        detectedFormat,
        formatExtension,
        allowedFormats,
      })
      return NextResponse.json(
        {
          error: 'Unsupported image format',
          message: `You uploaded an unsupported image. Please make sure your image has of one the following formats: ['png', 'jpeg', 'gif', 'webp']. Detected format: ${detectedFormat}`,
        },
        { status: 400 }
      )
    }
    
    console.log('✅ [parse-image] Format validated:', detectedFormat)

    // Call OpenAI Vision API
    // Try multiple models in order of preference
    // Note: Some API keys may not have access to all vision models
    const visionModels = [
      'gpt-4o',           // Latest model with vision
      'gpt-4o-mini',      // Smaller, cheaper model with vision
      'gpt-4-turbo',      // Previous generation with vision
      'gpt-4-vision-preview', // Legacy model (may still work)
    ]

    let lastError: Error | null = null
    let response = null

    // Try each model until one works
    for (const model of visionModels) {
      try {
        console.log(`🔄 [parse-image] Trying model: ${model}`)
        response = await openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract the math problem from this image. Return only the problem statement in plain text, without solving it. If there are multiple problems, return all of them. If the image is unclear or contains no math problem, indicate that.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
        })
        
        // Success - break out of loop
        console.log(`✅ [parse-image] Image parsed successfully using model: ${model}`)
        break
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        const errorDetails = {
          model,
          message: lastError.message,
          name: lastError.name,
          stack: lastError.stack?.substring(0, 200), // First 200 chars of stack
        }
        console.warn(`⚠️ [parse-image] Failed to parse image with model ${model}:`, errorDetails)
        
        // Log full error details for debugging
        if (error instanceof Error && 'status' in error) {
          console.error(`❌ [parse-image] OpenAI API error details:`, {
            status: (error as any).status,
            statusText: (error as any).statusText,
            message: error.message,
          })
        }
        
        // If it's not a model access error, stop trying other models
        if (!lastError.message.includes('model') && 
            !lastError.message.includes('not found') &&
            !lastError.message.includes('not available') &&
            !lastError.message.includes('does not exist')) {
          console.error(`❌ [parse-image] Non-model error detected, stopping model attempts:`, lastError.message)
          throw lastError
        }
        // Otherwise, continue to next model
        console.log(`➡️ [parse-image] Continuing to next model...`)
      }
    }

    // If all models failed, throw the last error
    if (!response) {
      throw lastError || new Error('All vision models failed. Your API key may not have access to vision models.')
    }

    const problemText = response.choices[0]?.message?.content || 'Could not extract problem from image. Please try again or type the problem manually.'

    return NextResponse.json({
      problem: problemText,
    })
  } catch (error) {
    console.error('❌ [parse-image] API error:', error)
    console.error('❌ [parse-image] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    })
    
    // Provide more specific error messages
    if (error instanceof Error) {
      // Check for OpenAI API errors
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        return NextResponse.json(
          {
            error: 'Authentication failed',
            message: 'Invalid OpenAI API key. Please check your .env.local file.'
          },
          { status: 401 }
        )
      }

      // Check for rate limit errors
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again in a moment.'
          },
          { status: 429 }
        )
      }

      // Check for model errors
      if (error.message.includes('model') || 
          error.message.includes('gpt-4') ||
          error.message.includes('not found') ||
          error.message.includes('not available') ||
          error.message.includes('vision')) {
        return NextResponse.json(
          {
            error: 'Vision model not available',
            message: 'Your OpenAI API key does not have access to vision models. Please check your OpenAI subscription or upgrade your plan to use image parsing. You can still type your math problems manually.'
          },
          { status: 403 }
        )
      }

      // Check for network errors
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return NextResponse.json(
          {
            error: 'Network error',
            message: 'Failed to connect to OpenAI API. Please check your internet connection.'
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to parse image',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

