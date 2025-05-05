import { NextApiRequest, NextApiResponse } from 'next';
import { DynamoDB } from 'aws-sdk';

// Configure DynamoDB with region
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

/**
 * API handler for managing tokens.
 * 
 * @param {NextApiRequest} req - The HTTP request object, containing method and body.
 * @param {NextApiResponse} res - The HTTP response object, used to send responses.
 * @returns {Promise<void>} - Resolves when the response is sent.
 * 
 * Handles POST requests to save tokens with an expiration date to DynamoDB.
 * Returns appropriate HTTP status codes and error messages for invalid input or server errors.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] ${req.method} ${req.url}`);

  try {
    // Using hardcoded user ID
    const userId = 'varun@vibing.com.au';

    switch (req.method) {
      case 'POST': {
        const { access_token, refresh_token, expires_in } = req.body;
        
        // Validate input
        if (!access_token) {
          console.error(`[${requestId}] Bad Request: Access token is required`);
          return res.status(400).json({ error: 'Access token is required' });
        }

        // Calculate expiration date if expires_in is provided
        const expiresAt = expires_in 
          ? new Date(Date.now() + expires_in * 1000).toISOString()
          : undefined;

        // Check table name
        if (!process.env.TOKENS_TABLE_NAME) {
          console.error(`[${requestId}] Configuration Error: TOKENS_TABLE_NAME not set`);
          return res.status(500).json({ error: 'Server configuration error' });
        }

        try {
          // First, find and delete any existing tokens
          const existingToken = await dynamoDb.query({
            TableName: process.env.TOKENS_TABLE_NAME,
            IndexName: 'userId',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': userId
            }
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

          console.log(`[${requestId}] Successfully saved token for user ${userId}`);
          return res.status(200).json({ success: true });
        } catch (error) {
          console.error(`[${requestId}] Error saving token:`, error);
          return res.status(500).json({ 
            error: 'Failed to save token',
            details: (error as Error).message
          });
        }
      }

      case 'GET': {
        if (!process.env.TOKENS_TABLE_NAME) {
          console.error(`[${requestId}] Configuration Error: TOKENS_TABLE_NAME not set`);
          return res.status(500).json({ error: 'Server configuration error' });
        }

        try {
          // Query using userId-index GSI
          const result = await dynamoDb.query({
            TableName: process.env.TOKENS_TABLE_NAME,
            IndexName: 'userId',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': userId
            }
          }).promise();

          if (!result.Items || result.Items.length === 0) {
            console.log(`[${requestId}] Token not found for user ${userId}`);
            return res.status(404).json({ error: 'Token not found' });
          }

          // Get the most recent token
          const mostRecentToken = result.Items.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

          console.log(`[${requestId}] Successfully retrieved token for user ${userId}`);
          return res.status(200).json(mostRecentToken);
        } catch (error) {
          console.error(`[${requestId}] Error retrieving token:`, error);
          return res.status(500).json({ 
            error: 'Failed to retrieve token',
            details: (error as Error).message
          });
        }
      }

      case 'DELETE': {
        if (!process.env.TOKENS_TABLE_NAME) {
          console.error(`[${requestId}] Configuration Error: TOKENS_TABLE_NAME not set`);
          return res.status(500).json({ error: 'Server configuration error' });
        }

        try {
          // First, find the token using the GSI
          const queryResult = await dynamoDb.query({
            TableName: process.env.TOKENS_TABLE_NAME,
            IndexName: 'userId',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': userId
            }
          }).promise();

          if (!queryResult.Items || queryResult.Items.length === 0) {
            console.log(`[${requestId}] No token found to delete for user ${userId}`);
            return res.status(404).json({ error: 'Token not found' });
          }

          // Get the most recent token
          const tokenToDelete = queryResult.Items.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

          // Delete using the primary key (id)
          await dynamoDb.delete({
            TableName: process.env.TOKENS_TABLE_NAME,
            Key: { id: tokenToDelete.id }
          }).promise();

          console.log(`[${requestId}] Successfully deleted token for user ${userId}`);
          return res.status(200).json({ success: true });
        } catch (error) {
          console.error(`[${requestId}] Error deleting token:`, error);
          return res.status(500).json({ 
            error: 'Failed to delete token',
            details: (error as Error).message
          });
        }
      }

      default:
        console.error(`[${requestId}] Method not allowed: ${req.method}`);
        return res.status(405).json({ error: `Method not allowed: ${req.method}` });
    }
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: (error as Error).message
    });
  }
}