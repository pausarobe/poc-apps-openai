export function getToolContext(extra: any) {
  return {
    authInfo: extra?.authInfo ?? null,
    headers: extra?.requestInfo?.headers ?? {},
    openaiSubject: extra?._meta?.['openai/subject'] ?? null,
    openaiSession: extra?._meta?.['openai/session'] ?? null,
    openaiOrganization: extra?._meta?.['openai/organization'] ?? null,
  };
}

export function requireAuthInfo(extra: any) {
  if (!extra?.authInfo) {
    const err: any = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  return extra.authInfo;
}
