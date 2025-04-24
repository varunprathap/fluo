import { defineAuth, secret } from '@aws-amplify/backend';
import { googleClientId, googleClientSecret } from './secrets';

export const auth = defineAuth({
  loginWith: {
    // Optional: Enable email login
    // email: true,
    externalProviders: {
      callbackUrls: [
        'http://localhost:3000/auth/callback',
        'https://www.fluo.com.au/auth/callback'
      ],
      logoutUrls: [
        'http://localhost:3000',
        'https://www.fluo.com.au'
      ],
      oidc: [{
        name: 'Google',
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        issuerUrl: 'https://accounts.google.com',
        scopes: [
          'openid',
          'email',
          'profile',
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/drive.metadata.readonly'
        ],
        endpoints: {
          authorization: 'https://accounts.google.com/o/oauth2/v2/auth',
          token: 'https://oauth2.googleapis.com/token',
          userInfo: 'https://openidconnect.googleapis.com/v1/userinfo',
          jwksUri: 'https://www.googleapis.com/oauth2/v3/certs'
        }
      }]
    }
  }
});
