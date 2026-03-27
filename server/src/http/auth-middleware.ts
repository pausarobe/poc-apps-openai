import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth/verify-token.js';

export async function authMiddleware(req: Request & any, res: Response, next: NextFunction) {
  if (req.path === '/mcp/health') return next();
  if (req.path.startsWith('/.well-known/')) return next();

  const authHeader = req.headers.authorization;

  req.openaiContext = {
    ephemeralUserId: req.headers['openai-ephemeral-user-id'] ?? null,
    conversationId: req.headers['openai-conversation-id'] ?? null,
  };

  req.auth = null;

  if (!authHeader?.startsWith('Bearer ')) {
    res.setHeader( 'WWW-Authenticate',
      'Bearer realm="mcp", resource_metadata="/.well-known/oauth-protected-resource"'
    );
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const claims = await verifyToken(token);

    req.auth = {
      userId: claims.sub,
      email: claims.email ?? null,
      scopes: Array.isArray(claims.scopes) ? claims.scopes : [],
      roles: Array.isArray(claims.roles) ? claims.roles : [],
      orgId: claims.org_id ?? null,
      raw: claims,
    };

    next();
  } catch (error) {
    res.setHeader(  'WWW-Authenticate',
      'Bearer realm="mcp", resource_metadata="/.well-known/oauth-protected-resource"'
    );
    return res.status(401).json({ error: 'Invalid bearer token' });
  }
}