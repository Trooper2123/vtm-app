import { Auth0Client } from "@auth0/nextjs-auth0/server";

// The Vercel Auth0 integration currently exposes credentials with the VTM_AUTH_ prefix.
// Local development can keep using the SDK's standard AUTH0_* names from .env.local.
export const auth0 = new Auth0Client({
  domain: process.env.VTM_AUTH_AUTH0_DOMAIN ?? process.env.AUTH0_DOMAIN,
  clientId: process.env.VTM_AUTH_AUTH0_CLIENT_ID ?? process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.VTM_AUTH_AUTH0_CLIENT_SECRET ?? process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.VTM_AUTH_AUTH0_SECRET ?? process.env.AUTH0_SECRET,
  authorizationParameters: {
    audience: process.env.VTM_AUTH_AUTH0_AUDIENCE ?? process.env.AUTH0_AUDIENCE,
    scope: "openid profile email",
  },
});
