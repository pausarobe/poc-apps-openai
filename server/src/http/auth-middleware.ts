import jwt from 'jsonwebtoken';

function isPublicPath(path: string) {
  return (
    path === '/' ||
    path === '/favicon.ico' ||
    path === '/mcp/health' ||
    path === '/debug-auth' ||
    path === '/.well-known/oauth-protected-resource' ||
    path === '/oauth/.well-known/oauth-authorization-server' ||
    path === '/oauth/register' ||
    path === '/oauth/authorize' ||
    path === '/oauth/callback' ||
    path === '/oauth/token' ||
    path === '/register' ||
    path === '/authorize' ||
    path === '/callback' ||
    path === '/token'
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
  const secret = process.env.OAUTH_JWT_SECRET ?? 'dev-oauth-secret';

  try {
    const decoded: any = jwt.verify(token, secret);

    req.auth = {
      userId: decoded.sub,
      scopes: decoded.scope?.split(' ') ?? [],
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