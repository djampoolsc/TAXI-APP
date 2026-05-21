import { ManagementClient } from 'auth0';
import dotenv from 'dotenv';

dotenv.config();

export const auth0Management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
});

export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  audience: process.env.AUTH0_AUDIENCE || 'https://axiom-peru-api',
  scope: 'openid profile email',
};

export function validateAuth0Config() {
  if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_CLIENT_ID || !process.env.AUTH0_CLIENT_SECRET) {
    console.warn('⚠ Auth0 configuration incomplete. Using JWT only mode.');
    return false;
  }
  return true;
}
