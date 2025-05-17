import { googleOAuthConfig } from '@/amplify/auth/resource';

// Client-side configuration
export const googleAuthConfig = {
  // Only use NEXT_PUBLIC_ prefixed environment variables for client-side
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || "/api/auth/google/callback",
  scope: "email profile openid https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly",
  prompt: "consent",
  responseType: "code",
  access_type: "offline",
  include_granted_scopes: true,
  state: typeof window !== "undefined" ? Math.random().toString(36).substring(7) : "",
};