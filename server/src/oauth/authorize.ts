import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { saveLoginState } from './store.js';
import { oauthStore } from './store.js';

export async function handleAuthorize(req: Request, res: Response) {
  const clientId = String(req.query.client_id ?? '');
  const redirectUri = String(req.query.redirect_uri ?? '');
  const originalState = String(req.query.state ?? '');
  const scope = String(req.query.scope ?? 'openid profile email');
  const resource = req.query.resource ? String(req.query.resource) : undefined;
  const codeChallenge = req.query.code_challenge
    ? String(req.query.code_challenge)
    : null;
  const codeChallengeMethod = req.query.code_challenge_method
    ? String(req.query.code_challenge_method)
    : null;

  if (!clientId || !redirectUri || !originalState) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Missing client_id, redirect_uri or state',
    });
  }

  const client = oauthStore.clients.get(clientId);

  if (!client) {
    return res.status(400).json({
      error: 'invalid_client',
      error_description: 'Unknown client_id',
    });
  }

  if (!client.redirect_uris.includes(redirectUri)) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'redirect_uri is not registered for this client',
    });
  }

  if (codeChallengeMethod && !['S256', 'plain'].includes(codeChallengeMethod)) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Unsupported code_challenge_method',
    });
  }

  const brokerState = `broker_state_${randomUUID()}`;

  saveLoginState({
    brokerState,
    clientId,
    redirectUri,
    originalState,
    scope,
    resource,
    codeChallenge,
    codeChallengeMethod,
  });

  const clerkIssuer = process.env.CLERK_ISSUER;
  const clerkClientId = process.env.CLERK_CLIENT_ID;
  const clerkRedirectUri = process.env.CLERK_REDIRECT_URI;

  if (!clerkIssuer || !clerkClientId || !clerkRedirectUri) {
    return res.status(500).json({
      error: 'server_error',
      error_description:
        'Missing CLERK_ISSUER, CLERK_CLIENT_ID or CLERK_REDIRECT_URI',
    });
  }

  const clerkAuthorizeUrl = new URL(`${clerkIssuer}/oauth/authorize`);
  clerkAuthorizeUrl.searchParams.set('client_id', clerkClientId);
  clerkAuthorizeUrl.searchParams.set('redirect_uri', clerkRedirectUri);
  clerkAuthorizeUrl.searchParams.set('response_type', 'code');
  clerkAuthorizeUrl.searchParams.set('scope', 'openid profile email');
  clerkAuthorizeUrl.searchParams.set('state', brokerState);

  return res.redirect(clerkAuthorizeUrl.toString());
}