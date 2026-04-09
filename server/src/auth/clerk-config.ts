export const clerkConfig = {
  issuer: process.env.CLERK_ISSUER!,
  audience: process.env.CLERK_AUDIENCE!,
  jwksUrl: `${process.env.CLERK_ISSUER}/.well-known/jwks.json`,
};