import type { Express, Request, Response } from 'express';

export function registerWellKnownRoutes(app: Express) {
  
  app.get('/.well-known/oauth-protected-resource/mcp', (_req: Request, res: Response) => {
    const resource = process.env.MCP_RESOURCE_URL;
    const issuer = process.env.CLERK_ISSUER;

    if (!resource || !issuer) {
      return res.status(500).json({
        error: 'Missing MCP_RESOURCE_URL or CLERK_ISSUER',
      });
    }

    return res.json({
      resource,
      authorization_servers: [issuer],
    });
  });

  
  app.get('/.well-known/oauth-authorization-server', (_req: Request, res: Response) => {
    const issuer = process.env.CLERK_ISSUER;

    if (!issuer) {
      return res.status(500).json({
        error: 'Missing CLERK_ISSUER',
      });
    }

    return res.json({
      issuer,
      jwks_uri: `${issuer}/.well-known/jwks.json`,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,

      
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code"],
      token_endpoint_auth_methods_supported: ["client_secret_post", "none"],
      scopes_supported: ["openid", "profile", "email"],
      code_challenge_methods_supported: ["S256"],
    });
  });
}