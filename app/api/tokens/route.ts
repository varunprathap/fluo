import { NextRequest, NextResponse } from 'next/server';
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

interface TokenData {
  id: number;
  userId: string;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: string;
  createdAt: string;
  provider: 'google';
}

const userId = 'varun@vibing.com.au'; // TODO: Replace with real user logic

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  try {
    const body = await req.json();
    const { access_token, refresh_token, expires_in } = body;
    if (!access_token) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }
    if (!process.env.TOKENS_TABLE_NAME) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    const expiresAt = expires_in 
      ? new Date(Date.now() + expires_in * 1000).toISOString()
      : undefined;
    try {
      // Delete existing tokens
      const existingToken = await dynamoDb.query({
        TableName: process.env.TOKENS_TABLE_NAME,
        IndexName: 'userId',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      }).promise();
      if (existingToken.Items && existingToken.Items.length > 0) {
        const tokenToDelete = existingToken.Items[0];
        await dynamoDb.delete({
          TableName: process.env.TOKENS_TABLE_NAME,
          Key: { id: tokenToDelete.id }
        }).promise();
      }
      // Save new token
      const tokenData: TokenData = {
        id: Date.now(),
        userId,
        access_token,
        refresh_token,
        expires_in,
        expires_at: expiresAt,
        createdAt: new Date().toISOString(),
        provider: 'google'
      };
      await dynamoDb.put({
        TableName: process.env.TOKENS_TABLE_NAME,
        Item: tokenData
      }).promise();
      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ error: 'Failed to save token', details: error.message }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  const requestId = Math.random().toString(36).substring(7);
  try {
    if (!process.env.TOKENS_TABLE_NAME) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    const result = await dynamoDb.query({
      TableName: process.env.TOKENS_TABLE_NAME,
      IndexName: 'userId',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    }).promise();
    if (!result.Items || result.Items.length === 0) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }
    const mostRecentToken = result.Items.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    return NextResponse.json(mostRecentToken);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to retrieve token', details: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const requestId = Math.random().toString(36).substring(7);
  try {
    if (!process.env.TOKENS_TABLE_NAME) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    const queryResult = await dynamoDb.query({
      TableName: process.env.TOKENS_TABLE_NAME,
      IndexName: 'userId',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    }).promise();
    if (!queryResult.Items || queryResult.Items.length === 0) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }
    const tokenToDelete = queryResult.Items.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    await dynamoDb.delete({
      TableName: process.env.TOKENS_TABLE_NAME,
      Key: { id: tokenToDelete.id }
    }).promise();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete token', details: error.message }, { status: 500 });
  }
} 