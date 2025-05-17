import { NextResponse } from 'next/server';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretName = 'fluo_google';
const region = 'ap-southeast-2';

export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const redirectUrl = `${baseUrl}/admin/dash/apps`;

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(redirectUrl);
    }

    // Fetch Google secrets from AWS Secrets Manager
    const client = new SecretsManagerClient({ region });
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const data = await client.send(command);

    if (!data.SecretString) {
      return NextResponse.redirect(redirectUrl);
    }

    const config = JSON.parse(data.SecretString);

    // Get redirect_uri from environment variable
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
    if (!redirectUri) {
      return NextResponse.redirect(redirectUrl);
    }

    // Exchange the code for tokens using server-side secrets
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: config.client_id,
        client_secret: config.client_secret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(redirectUrl);
    }

    const tokens = await tokenResponse.json();

    // Save tokens to DynamoDB via /api/tokens POST
    await fetch(`${baseUrl}/api/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
      }),
    });

    // Always redirect to the dashboard page
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in Google callback:', error);
    return NextResponse.redirect(redirectUrl);
  }
} 