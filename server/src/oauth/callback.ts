import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  deleteLoginState,
  getLoginState,
  saveAuthCode,
} from './store.js';

// Maneja la devolución de llamada del intermediario de Clerk.

// Este endpoint funciona como puente entre el proveedor de identidad Clerk y el cliente OAuth:
// 1. Recibe el código de autorización de Clerk y el estado del broker.
// 2. Recupera el estado de login interno guardado previamente.
// 3. Genera un nuevo auth_code propio del servidor.
// 4. Guarda el auth_code junto con la información del cliente y PKCE.
// 5. Borra el estado temporal y redirige al cliente con el code y el state original.
export async function handleCallback(req: Request, res: Response) {
  // Leer el código y estado que devuelve Clerk.
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

  // Recuperar el estado temporal guardado durante /oauth/authorize.
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

  // Generar el auth code interno que devolverá el servidor al cliente.
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

  // Borrar el estado temporal ya usado para no reutilizarlo.
  deleteLoginState(brokerState);

  const redirectUrl = new URL(loginState.redirectUri);
  redirectUrl.searchParams.set('code', authCode);
  redirectUrl.searchParams.set('state', loginState.originalState);

  return res.redirect(redirectUrl.toString());
}