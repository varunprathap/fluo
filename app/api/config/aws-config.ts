import { DynamoDB } from 'aws-sdk';
import { awsCredentials } from '@/amplify/auth/resource';

export const dynamoDb = new DynamoDB.DocumentClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: awsCredentials.accessKeyId.toString(),
    secretAccessKey: awsCredentials.secretAccessKey.toString()
  }
}); 