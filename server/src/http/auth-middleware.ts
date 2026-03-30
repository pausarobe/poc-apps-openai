import { verifyToken } from "../auth/verify-token.js";

export async function authMiddleware(req: any, res: any, next: any) {
  console.error("[AUTH] path:", req.path, "method:", req.method);
  console.error("[AUTH] auth header present:", Boolean(req.headers.authorization));

  // Rutas públicas
  if (req.path === "/mcp/health") return next();
  if (req.path === "/debug-auth") return next();
  if (req.path.startsWith("/.well-known/")) return next();
  if(req.path ==="/") return next();
  if(req.path ==="/favicon.ico") return next();

  const authHeader = req.headers.authorization;

  req.auth = null;

  if (!authHeader?.startsWith("Bearer ")) {
    console.error("[AUTH] blocking request with 401:", req.path);

    res.setHeader(
      "WWW-Authenticate",
      'Bearer realm="mcp", resource_metadata="https://poc-apps-openai.onrender.com/.well-known/oauth-protected-resource"'
    );

    return res.status(401).json({
      error: "Missing or invalid Authorization header",
    });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = await verifyToken(token);

    req.auth = {
      userId: decoded.sub,
      email: decoded.email,
      roles: decoded.roles || [],
      scopes: decoded.scopes || [],
      orgId: decoded.org_id,
    };

    return next();
  } catch (err) {
    console.error("[AUTH] token verification failed on path:", req.path, err);

    res.setHeader(
      "WWW-Authenticate",
      'Bearer error="invalid_token", resource_metadata="https://poc-apps-openai.onrender.com/.well-known/oauth-protected-resource"'
    );

    return res.status(401).json({ error: "Invalid token" });
  }
}