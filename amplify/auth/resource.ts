import { defineAuth } from '@aws-amplify/backend';


export const auth = defineAuth({
  loginWith: {
    email: true,
    // Add social providers here if needed
  },
});
