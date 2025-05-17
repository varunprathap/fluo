import { defineFunction } from '@aws-amplify/backend';
import { secret } from '@aws-amplify/backend';

export const testSecrets = defineFunction({
  name: 'testSecrets',
  entry: './test-secrets.ts',
  environment: {
    GOOGLE_CLIENT_ID: secret('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: secret('GOOGLE_CLIENT_SECRET'),
    AWS_ACCESS_KEY_ID: secret('AWS_ACCESS_KEY_ID'),
    AWS_SECRET_ACCESS_KEY: secret('AWS_SECRET_ACCESS_KEY')
  }
}); 