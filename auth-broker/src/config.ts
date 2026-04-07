import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  issuer: required("BROKER_ISSUER"),
  jwtSecret: required("BROKER_JWT_SECRET"),
  mcpResource: required("MCP_RESOURCE"),
  clerkIssuer: required("CLERK_ISSUER"),
  clerkClientId: required("CLERK_CLIENT_ID"),
  clerkRedirectUri: required("CLERK_REDIRECT_URI"),
};