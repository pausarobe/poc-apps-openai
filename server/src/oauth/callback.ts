import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  deleteLoginState,
  getLoginState,
  saveAuthCode,
} from './store.js';

export async function handleCallback(req: Request, res: Response) {
  const codeFromClerk = String(req.query.code ?? '');
  const brokerState = String(req.query.state ?? '');

  if (!codeFromClerk || !brokerState) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Missing code or state',
    });
  }

  const loginState = getLoginState(brokerState);

  if (!loginState) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Unknown or expired broker state',
    });
  }

  const authCode = `authcode_${randomUUID()}`;

  saveAuthCode({
    code: authCode,
    clientId: loginState.clientId,
    redirectUri: loginState.redirectUri,
    codeChallenge: loginState.codeChallenge ?? null,
    codeChallengeMethod: loginState.codeChallengeMethod ?? null,
    subject: 'clerk-user-temp',
    scope: loginState.scope,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  deleteLoginState(brokerState);

  const redirectUrl = new URL(loginState.redirectUri);
  redirectUrl.searchParams.set('code', authCode);
  redirectUrl.searchParams.set('state', loginState.originalState);

  return res.redirect(redirectUrl.toString());
}