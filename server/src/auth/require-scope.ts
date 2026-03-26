export function requireScope(req: any, scope: string) {
  if (!req.auth?.scopes?.includes(scope)) {
    const err: any = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
}
