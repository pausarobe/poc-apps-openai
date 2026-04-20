import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { createClerkClient } from '@clerk/backend';
import {
  deleteLoginState,
  getLoginState,
  saveAuthCode,
} from './store.js';

// Maneja la devolución de llamada del intermediario de Clerk.

// Este endpoint funciona como puente entre el proveedor de identidad Clerk y el cliente OAuth:
// 1. Recibe el código de autorización de Clerk y el estado del broker.
// 2. Recupera el estado de login interno guardado previamente.
// 3. Intercambia el código con Clerk para obtener access_token.
// 4. Obtiene userinfo de Clerk.
// 5. Consulta memberships del usuario con Clerk backend.
// 6. Genera un nuevo auth_code propio del servidor con datos reales.
// 7. Guarda el auth_code junto con la información del cliente y PKCE.
// 8. Borra el estado temporal y redirige al cliente con el code y el state original.
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

  try {
    // Intercambiar el código con Clerk para obtener access_token
    const clerkIssuer = process.env.CLERK_ISSUER;
    const clerkClientId = process.env.CLERK_CLIENT_ID;
    const clerkClientSecret = process.env.CLERK_CLIENT_SECRET;
    const clerkRedirectUri = process.env.CLERK_REDIRECT_URI;

    if (!clerkIssuer || !clerkClientId || !clerkClientSecret || !clerkRedirectUri) {
      console.error('[SERVER OAUTH CALLBACK] missing Clerk environment variables');
      return res.status(500).json({
        error: 'server_error',
        error_description: 'Clerk configuration missing',
      });
    }

    const tokenResponse = await fetch(`${clerkIssuer}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clerkClientId,
        client_secret: clerkClientSecret,
        code: codeFromClerk,
        redirect_uri: clerkRedirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('[SERVER OAUTH CALLBACK] failed to exchange code with Clerk', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
      });
      return res.status(500).json({
        error: 'server_error',
        error_description: 'Failed to exchange code with Clerk',
      });
    }

    const tokenData: any = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('[SERVER OAUTH CALLBACK] no access_token in Clerk response');
      return res.status(500).json({
        error: 'server_error',
        error_description: 'No access_token from Clerk',
      });
    }

    // Obtener userinfo de Clerk
    const userinfoResponse = await fetch(`${clerkIssuer}/oauth/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userinfoResponse.ok) {
      console.error('[SERVER OAUTH CALLBACK] failed to get userinfo from Clerk', {
        status: userinfoResponse.status,
        statusText: userinfoResponse.statusText,
      });
      return res.status(500).json({
        error: 'server_error',
        error_description: 'Failed to get userinfo from Clerk',
      });
    }

    const userInfo: any = await userinfoResponse.json();
    const { sub, email, name } = userInfo;

    if (!sub) {
      console.error('[SERVER OAUTH CALLBACK] no sub in userinfo');
      return res.status(500).json({
        error: 'server_error',
        error_description: 'No user ID from Clerk',
      });
    }

    // Usar Clerk backend para obtener memberships
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      console.error('[SERVER OAUTH CALLBACK] missing CLERK_SECRET_KEY');
      return res.status(500).json({
        error: 'server_error',
        error_description: 'Clerk secret key missing',
      });
    }

    const clerkClient = createClerkClient({ secretKey: clerkSecretKey });
    const memberships = await clerkClient.users.getOrganizationMembershipList({ userId: sub });

    let role: string | null = null;
    let organizationId: string | null = null;
    let organizationSlug: string | null = null;

    if (memberships.data.length > 0) {
      const firstMembership = memberships.data[0];
      if(firstMembership){
        role = firstMembership.role ?? null;
        organizationId = firstMembership.organization.id ?? null;
        organizationSlug = firstMembership.organization.slug ?? null;
      }
    }

    // Generar el auth code interno que devolverá el servidor al cliente.
    const authCode = `authcode_${randomUUID()}`;

    saveAuthCode({
      code: authCode,
      clientId: loginState.clientId,
      redirectUri: loginState.redirectUri,
      codeChallenge: loginState.codeChallenge ?? null,
      codeChallengeMethod: loginState.codeChallengeMethod ?? null,
      subject: sub,
      scope: loginState.scope,
      expiresAt: Date.now() + 5 * 60 * 1000,
      email: email || null,
      name: name || null,
      role,
      organizationId,
      organizationSlug,
    });

    console.log('[SERVER OAUTH CALLBACK] auth code saved', {
      authCode,
      clientId: loginState.clientId,
      redirectUri: loginState.redirectUri,
      codeChallengeMethod: loginState.codeChallengeMethod,
      subject: sub,
      email,
      name,
      role,
      organizationId,
      organizationSlug,
    });

    // Borrar el estado temporal ya usado para no reutilizarlo.
    deleteLoginState(brokerState);

    const redirectUrl = new URL(loginState.redirectUri);
    redirectUrl.searchParams.set('code', authCode);
    redirectUrl.searchParams.set('state', loginState.originalState);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('[SERVER OAUTH CALLBACK] unexpected error', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Unexpected error during callback',
    });
  }
}