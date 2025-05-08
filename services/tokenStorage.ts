import { getCurrentUser } from 'aws-amplify/auth';
import { get, post } from 'aws-amplify/api';

export interface TokenData {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt?: string;
}

export class TokenStorage {
  private static instance: TokenStorage;
  private currentToken: string | null = null;

  private constructor() {}

  public static getInstance(): TokenStorage {
    if (!TokenStorage.instance) {
      TokenStorage.instance = new TokenStorage();
    }
    return TokenStorage.instance;
  }

  public async saveToken(token: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const tokenData: TokenData = {
        token,
        userId: user.userId,
        createdAt: new Date().toISOString(),
        // Optional: Add token expiration if available
        // expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
      };

      // Store token in backend
      await post({
        apiName: 'AdminAPI',
        path: '/tokens',
        options: {
          body: tokenData,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      });

      this.currentToken = token;
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  }

  public async getToken(): Promise<string | null> {
    try {
      if (this.currentToken) {
        return this.currentToken;
      }

      const user = await getCurrentUser();
      if (!user) {
        return null;
      }

      // Fetch token from backend
      const response = await get({
        apiName: 'AdminAPI',
        path: `/tokens/${user.userId}`,
        options: {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      });

      const tokenData = await response.body.json() as TokenData;
      this.currentToken = tokenData.token;
      return this.currentToken;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  public async deleteToken(): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return;
      }

      // Delete token from backend
      await post({
        apiName: 'AdminAPI',
        path: `/tokens/${user.userId}/delete`,
        options: {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      });

      this.currentToken = null;
    } catch (error) {
      console.error('Error deleting token:', error);
      throw error;
    }
  }
} 