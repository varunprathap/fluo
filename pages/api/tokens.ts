import { NextApiRequest, NextApiResponse } from 'next';
import { DynamoDB } from 'aws-sdk';
import { getCurrentUser } from 'aws-amplify/auth';

// Configure DynamoDB with region
const dynamoDb = new DynamoDB.DocumentClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

interface TokenData {
  token: string;
  expiresAt?: string;
  createdAt: string;
  userId: string;
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
    // Verify user authentication
    // const user = await getCurrentUser();
    
    // if (!user) {
    //   console.error(`[${requestId}] Unauthorized: No authenticated user found`);
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    switch (req.method) {
      case 'POST': {
        const { token, expiresAt } = req.body;
        
        // Validate input
        if (!token) {
          console.error(`[${requestId}] Bad Request: Token is required`);
          return res.status(400).json({ error: 'Token is required' });
        }

        if (expiresAt && isNaN(Date.parse(expiresAt))) {
          console.error(`[${requestId}] Bad Request: Invalid expiresAt format`);
          return res.status(400).json({ error: 'Valid expiresAt is required in ISO 8601 format' });
        }

        // Check table name
        if (!process.env.TOKENS_TABLE_NAME) {
          console.error(`[${requestId}] Configuration Error: TOKENS_TABLE_NAME not set`);
          return res.status(500).json({ error: 'Server configuration error' });
        }

        try {
          // First, check for existing token
          const existingToken = await dynamoDb.query({
            TableName: process.env.TOKENS_TABLE_NAME,
            IndexName: 'userId', // Assuming you have a GSI on userId
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': 'varun@vibing.com.au'
            }
          }).promise();

          // If existing token found, delete it
          if (existingToken.Items && existingToken.Items.length > 0) {
            console.log(`[${requestId}] Found existing token, removing...`);
            await dynamoDb.delete({
              TableName: process.env.TOKENS_TABLE_NAME,
              Key: { id: existingToken.Items[0].id }
            }).promise();
          }

          // Save new token with retry logic
          const maxRetries = 3;
          let attempt = 0;
          let success = false;
          let lastError: Error | null = null;

          while (attempt < maxRetries && !success) {
            try {
              const tokenData: TokenData = {
                id: Date.now(),
                userId: 'varun@vibing.com.au',
                token,
                createdAt: new Date().toISOString(),
                ...(expiresAt && { expiresAt })
              };

              await dynamoDb.put({
                TableName: process.env.TOKENS_TABLE_NAME,
                Item: tokenData
              }).promise();

              console.log(`[${requestId}] Successfully saved new token for user varun@vibing.com.au`);
              success = true;
            } catch (error) {
              lastError = error as Error;
              attempt++;
              console.warn(`[${requestId}] Retry attempt ${attempt} failed:`, error);
              
              if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 100;
                console.log(`[${requestId}] Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
              }
            }
          }

          if (!success) {
            console.error(`[${requestId}] Failed to save token after ${maxRetries} attempts:`, lastError);
            return res.status(500).json({ 
              error: 'Failed to save token',
              details: lastError?.message
            });
          }

          return res.status(200).json({ success: true });
        } catch (error) {
          console.error(`[${requestId}] Error in token management:`, error);
          return res.status(500).json({ 
            error: 'Failed to manage token',
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
          const result = await dynamoDb.get({
            TableName: process.env.TOKENS_TABLE_NAME,
            Key: { userId: 'varun@vibing.com.au' }
          }).promise();

          if (!result.Item) {
            console.log(`[${requestId}] Token not found for user `);
            return res.status(404).json({ error: 'Token not found' });
          }

          console.log(`[${requestId}] Successfully retrieved token for user`);
          return res.status(200).json(result.Item);
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
          await dynamoDb.delete({
            TableName: process.env.TOKENS_TABLE_NAME,
            Key: { userId: 'varun@vibing.com.au' }
          }).promise();

          console.log(`[${requestId}] Successfully deleted token for user varun@vibing.com.au`);
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