import { defineAuth } from '@aws-amplify/backend';
import { secret } from '@aws-amplify/backend';

// Define Google OAuth secrets from AWS Secrets Manager
const googleSecret = secret('fluo_google');

export const googleOAuthConfig = {
  clientId: googleSecret,
  clientSecret: googleSecret,
  redirectUri: "/api/auth/google/callback"  // Keep static redirect URL
};

// Define AWS credentials
export const awsCredentials = {
  accessKeyId: secret('ACCESS_KEY_ID'),
  secretAccessKey: secret('SECRET_ACCESS_KEY')
};

export const auth = defineAuth({
  loginWith: {
    email: true
  }
});
