import type { Express, Request, Response } from 'express';

export function registerWellKnownRoutes(app: Express) {
  app.get('/.well-known/oauth-protected-resource', (_req: Request, res: Response) => {
    res.json({
      resource: process.env.MCP_RESOURCE_URL ?? 'http://localhost:3333/mcp',
      authorization_servers: [process.env.CLERK_ISSUER],
    });
  });

  app.get('/.well-known/oauth-authorization-server', (_req: Request, res: Response) => {
    const issuer = process.env.CLERK_ISSUER;
    res.json({
      issuer,
      jwks_uri: `${issuer}/.well-known/jwks.json`,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
    });
  });
}