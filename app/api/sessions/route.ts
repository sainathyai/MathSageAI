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
      
      const result = await docClient.send(
        new ScanCommand({
          TableName: env.dynamoDbTableName,
          FilterExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId,
          },
        })
      )

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
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

