import { defineSecret } from '@aws-amplify/backend';

export const googleClientId = defineSecret('GOOGLE_CLIENT_ID');
export const googleClientSecret = defineSecret('GOOGLE_CLIENT_SECRET'); 