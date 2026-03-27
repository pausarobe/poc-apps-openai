export const clerkConfig = {
  issuer: process.env.CLERK_ISSUER!, 
  jwksUrl: `${process.env.CLERK_ISSUER}/.well-known/jwks.json`,
  audience: process.env.CLERK_AUDIENCE!,
};