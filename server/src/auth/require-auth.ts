export function requireAuth(req: any) {
  if (!req.auth) {
    const err: any = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
}