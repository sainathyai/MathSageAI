import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { getAwsConfig, env } from '@/lib/env'
import { SessionData } from '@/lib/session-manager'

const client = new DynamoDBClient(getAwsConfig())
const docClient = DynamoDBDocumentClient.from(client)

/**
 * POST /api/sessions - Create or update a session
 */
export async function POST(request: NextRequest) {
  try {
    const session: SessionData = await request.json()

    if (!session.sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // Add timestamps
    const now = new Date().toISOString()
    const sessionData: SessionData = {
      ...session,
      updatedAt: now,
      createdAt: session.createdAt || now,
      isGuest: !session.userId, // Mark as guest if no userId
    }

    console.log('💾 Saving to DynamoDB:', {
      sessionId: sessionData.sessionId,
      userId: sessionData.userId,
      isGuest: sessionData.isGuest,
      messageCount: sessionData.messages?.length || 0,
    })

    // Save to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: env.dynamoDbTableName,
        Item: sessionData,
      })
    )

    console.log('✅ Session saved successfully')
    return NextResponse.json({ success: true, session: sessionData })
  } catch (error) {
    console.error('❌ Error saving session:', error)
    return NextResponse.json(
      { error: 'Failed to save session', details: (error as Error).message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sessions?sessionId=... - Get a specific session
 * GET /api/sessions?userId=... - Get all sessions for a user
 */
export async function GET(request: NextRequest) {
  try {
    // Validate environment variables first
    if (!env.dynamoDbTableName) {
      console.error('❌ DYNAMODB_TABLE_NAME environment variable is not set')
      return NextResponse.json(
        { 
          error: 'Configuration error',
          details: 'DYNAMODB_TABLE_NAME environment variable is not set'
        },
        { status: 500 }
      )
    }

    if (!env.awsRegion) {
      console.error('❌ RESOURCES_REGION environment variable is not set')
      return NextResponse.json(
        { 
          error: 'Configuration error',
          details: 'RESOURCES_REGION environment variable is not set'
        },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')

    if (sessionId) {
      // Get specific session
      const result = await docClient.send(
        new GetCommand({
          TableName: env.dynamoDbTableName,
          Key: { sessionId },
        })
      )

      if (!result.Item) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ session: result.Item })
    } else if (userId) {
      // Query all sessions for user
      // Note: Since we don't have a GSI on userId, we use Scan with FilterExpression
      // This is inefficient for large datasets but works for MVP
      // TODO: Create GSI on userId-updatedAt-index for better performance
      console.log('🔍 Querying sessions for userId:', userId)
      console.log('📋 Table name:', env.dynamoDbTableName)
      console.log('🌍 Region:', env.awsRegion)
      
      // Use Scan with FilterExpression to find sessions by userId
      // Try with attribute_exists first, fallback to simple equality if that fails
      const scanParams: any = {
        TableName: env.dynamoDbTableName,
        FilterExpression: '#uid = :userId',
        ExpressionAttributeNames: {
          '#uid': 'userId', // Use attribute name mapping for clarity
        },
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      }

      console.log('📋 Scan parameters:', {
        tableName: scanParams.TableName,
        filterExpression: scanParams.FilterExpression,
        userId: userId,
      })

      const result = await docClient.send(new ScanCommand(scanParams))

      console.log('📊 Scan result:', {
        count: result.Count,
        scannedCount: result.ScannedCount,
        items: result.Items?.length || 0,
      })

      // Sort by updatedAt descending (most recent first)
      const sessions = (result.Items || []) as SessionData[]
      sessions.sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime()
        const dateB = new Date(b.updatedAt).getTime()
        return dateB - dateA
      })

      console.log('✅ Returning sessions:', sessions.length)
      return NextResponse.json({ sessions })
    } else {
      return NextResponse.json(
        { error: 'sessionId or userId parameter is required' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('❌ Error fetching session:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Log detailed error information
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : undefined,
    })
    
    // Always return error details (not just in dev) to help diagnose issues
    return NextResponse.json(
      { 
        error: 'Failed to fetch session',
        details: errorMessage,
        // Include additional context
        context: {
          tableName: env.dynamoDbTableName,
          region: env.awsRegion,
          errorName: error instanceof Error ? error.name : 'Unknown',
        },
        // Only include stack in development
        ...(env.isDevelopment && { stack: errorStack })
      },
      { status: 500 }
    )
  }
}

