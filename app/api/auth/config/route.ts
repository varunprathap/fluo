import { NextResponse } from 'next/server';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretName = 'fluo_google';
const region = 'ap-southeast-2'; // e.g., 'us-east-1'

export async function GET() {
  try {
    const client = new SecretsManagerClient({ region });
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const data = await client.send(command);

    if (!data.SecretString) {
      throw new Error('SecretString is empty');
    }

    const config = JSON.parse(data.SecretString);

    return NextResponse.json({
      clientId: config.client_id,
      redirectUri: '/api/auth/google/callback'
    });
  } catch (error) {
    console.error('Error fetching auth config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auth configuration' },
      { status: 500 }
    );
  }
} 