import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { getAwsConfig, env } from '@/lib/env'
import { Session } from '@/app/types'

const client = new DynamoDBClient(getAwsConfig())
const docClient = DynamoDBDocumentClient.from(client)

/**
 * POST /api/sessions - Create or update a session
 */
export async function POST(request: NextRequest) {
  try {
    const session: Session = await request.json()

    if (!session.sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // Add timestamps
    const now = new Date().toISOString()
    const sessionData: Session = {
      ...session,
      updatedAt: now,
      createdAt: session.createdAt || now,
      isGuest: !session.userId, // Mark as guest if no userId
    }

    // Save to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: env.dynamoDbTableName,
        Item: sessionData,
      })
    )

    return NextResponse.json({ success: true, session: sessionData })
  } catch (error) {
    console.error('Error saving session:', error)
    return NextResponse.json(
      { error: 'Failed to save session' },
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
      // Note: This requires a GSI (Global Secondary Index) on userId
      // For now, return empty array - implement once GSI is created
      return NextResponse.json({ 
        sessions: [],
        message: 'User session history requires DynamoDB GSI on userId (not yet implemented)'
      })
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

