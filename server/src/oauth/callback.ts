import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  deleteLoginState,
  getLoginState,
  saveAuthCode,
} from './store.js';

// Manejar la devolución de llamada del intermediario de Clerk.
// Convierte la respuesta del código de autorización de Clerk en el propio código de autorización del servidor,
// lo almacena y redirige de nuevo al URI de redirección del cliente.

export async function handleCallback(req: Request, res: Response) {
  const codeFromClerk = String(req.query.code ?? '');
  const brokerState = String(req.query.state ?? '');

  console.log('[SERVER OAUTH CALLBACK] params=', {
    codeFromClerkPresent: !!codeFromClerk,
    brokerState,
  });

  if (!codeFromClerk || !brokerState) {
    console.error('[SERVER OAUTH CALLBACK] invalid_request missing code or state', {
      codeFromClerk,
      brokerState,
    });
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Missing code or state',
    });
  }

  const loginState = getLoginState(brokerState);

  if (!loginState) {
    console.error('[SERVER OAUTH CALLBACK] invalid_request unknown or expired broker state', {
      brokerState,
    });
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

  console.log('[SERVER OAUTH CALLBACK] auth code saved', {
    authCode,
    clientId: loginState.clientId,
    redirectUri: loginState.redirectUri,
    codeChallengeMethod: loginState.codeChallengeMethod,
  });

  deleteLoginState(brokerState);

  const redirectUrl = new URL(loginState.redirectUri);
  redirectUrl.searchParams.set('code', authCode);
  redirectUrl.searchParams.set('state', loginState.originalState);

  return res.redirect(redirectUrl.toString());
}