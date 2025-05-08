import { secret } from '@aws-amplify/backend';

export const googleClientId = secret('GOOGLE_CLIENT_ID');
export const googleClientSecret = secret('GOOGLE_CLIENT_SECRET'); 
export const accessKeyId = secret('AWS_ACCESS_KEY_ID');
export const secretAccessKey = secret('AWS_SECRET_ACCESS_KEY');