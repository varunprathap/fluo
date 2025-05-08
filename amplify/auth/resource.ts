import { defineAuth, secret } from '@aws-amplify/backend';
import { googleClientId, googleClientSecret } from './secrets';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
})
