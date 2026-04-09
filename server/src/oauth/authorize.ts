import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { saveAuthCode } from './store.js';

export function handleAuthorize(req: Request, res: Response) {
  const {
    client_id,
    redirect_uri,
    state,
    response_type,
  } = req.query as Record<string, string | undefined>;

  if (!client_id || !redirect_uri || !state) {
    return res.status(400).json({
      error: 'invalid_request',
      message: 'Missing client_id, redirect_uri or state',
    });
  }

  if (response_type && response_type !== 'code') {
    return res.status(400).json({
      error: 'unsupported_response_type',
      message: 'Only response_type=code is supported',
    });
  }

  // Placeholder temporal.
  // Aquí después meteremos la redirección a Clerk.
  const fakeSubject = 'pending-clerk-user';

  const code = crypto.randomUUID();

  saveAuthCode({
    code,
    clientId: client_id,
    redirectUri: redirect_uri,
    subject: fakeSubject,
    createdAt: Date.now(),
  });

  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set('code', code);
  redirectUrl.searchParams.set('state', state);

  return res.redirect(302, redirectUrl.toString());
}