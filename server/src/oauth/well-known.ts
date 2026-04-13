import type { Express, Request, Response } from 'express';

export function registerOAuthWellKnownRoutes(app: Express) {
  app.get('/.well-known/oauth-protected-resource', (_req: Request, res: Response) => {
    const resource = process.env.MCP_RESOURCE_URL ?? 'http://localhost:3333/mcp';
    const issuer = process.env.OAUTH_ISSUER_URL ?? 'http://localhost:3333/oauth';

    res.json({
      resource,
      authorization_servers: [issuer],
    });
  });

  app.get('/oauth/.well-known/oauth-authorization-server', (_req: Request, res: Response) => {
    const issuer = process.env.OAUTH_ISSUER_URL ?? 'http://localhost:3333/oauth';

    res.json({
      issuer,
      authorization_endpoint: `${issuer}/authorize`,
      token_endpoint: `${issuer}/token`,
      registration_endpoint: `${issuer}/register`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      token_endpoint_auth_methods_supported: ['none', 'client_secret_basic', 'client_secret_post'],
      code_challenge_methods_supported: ['S256', 'plain'],
      scopes_supported: ['openid', 'profile', 'email'],
    });
  });
}