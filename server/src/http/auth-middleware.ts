import { verifyToken } from '../auth/verify-token.js';

function isPublicPath(path: string) {
  return (
    path === '/' ||
    path === '/favicon.ico' ||
    path === '/mcp/health' ||
    path === '/debug-auth' ||
    path === '/.well-known/oauth-protected-resource' ||
    path === '/oauth/.well-known/oauth-authorization-server' ||
    path === '/oauth/authorize' ||
    path === '/oauth/token'
  );
}

function buildWwwAuthenticateHeader() {
  const publicBaseUrl = process.env.PUBLIC_BASE_URL ?? 'http://localhost:3333';
  return `Bearer realm="mcp", resource_metadata="${publicBaseUrl}/.well-known/oauth-protected-resource"`;
}

export async function authMiddleware(req: any, res: any, next: any) {
  req.auth = null;

  if (isPublicPath(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.setHeader('WWW-Authenticate', buildWwwAuthenticateHeader());

    return res.status(401).json({
      error: 'Missing or invalid Authorization header',
    });
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const decoded: any = await verifyToken(token);

    req.auth = {
      userId: decoded.sub,
      email: decoded.email ?? null,
      roles: decoded.roles ?? [],
      scopes: decoded.scopes ?? [],
      orgId: decoded.org_id ?? null,
      raw: decoded,
    };

    return next();
  } catch (err) {
    console.error('[AUTH] token verification failed:', err);

    res.setHeader(
      'WWW-Authenticate',
      `${buildWwwAuthenticateHeader()}, error="invalid_token"`
    );

    return res.status(401).json({
      error: 'Invalid token',
    });
  }
}