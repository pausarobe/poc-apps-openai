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

  app.get('/.well-known/oauth-authorization-server', async (_req: Request, res: Response) => {
    const issuer = process.env.CLERK_ISSUER;

    if (!issuer) {
      return res.status(500).json({
        error: 'Missing CLERK_ISSUER',
      });
    }

    try {
      const clerkMetadataUrl = `${issuer}/.well-known/oauth-authorization-server`;
      const response = await fetch(clerkMetadataUrl);

      if (!response.ok) {
        return res.status(502).json({
          error: 'Failed to fetch Clerk authorization server metadata',
          status: response.status,
        });
      }

      const metadata = await response.json() as Record<string, unknown>;

      return res.json({
        ...metadata,

        // Opcional: limitar scopes a los que sí usas ahora
        scopes_supported: ['openid', 'profile', 'email'],
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Unable to load Clerk authorization server metadata',
      });
    }
  });
}