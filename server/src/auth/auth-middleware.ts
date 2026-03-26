import { verifyToken } from "../auth/verify-token";

export async function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.auth = null;
    return next();
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

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}