import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { testSecrets } from './auth/test-secrets';

const backend = defineBackend({
  auth,
  data,
  testSecrets
});
