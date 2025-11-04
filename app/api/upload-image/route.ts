import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getAwsConfig, env } from '@/lib/env'
import { v4 as uuidv4 } from 'uuid'

const s3Client = new S3Client(getAwsConfig())

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string | null
    const sessionId = formData.get('sessionId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${uuidv4()}.${fileExtension}`
    
    // Organize by user/session structure: userId/sessionId/filename or guest/sessionId/filename
    const prefix = userId ? `users/${userId}` : 'guests'
    const s3Key = `${prefix}/${sessionId}/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.s3BucketName,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
        // Images are publicly readable via bucket policy
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          sessionId,
          userId: userId || 'guest',
        },
      })
    )

    // Generate S3 URL
    const s3Url = `https://${env.s3BucketName}.s3.${env.awsRegion}.amazonaws.com/${s3Key}`

    return NextResponse.json({
      success: true,
      url: s3Url,
      key: s3Key,
      fileName,
    })
  } catch (error) {
    console.error('Error uploading image to S3:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

