import type { Request, Response } from 'express';
import { createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import { deleteAuthCode, getAuthCode, oauthStore } from './store.js';

function toBase64Url(input: Buffer) {
  return input
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function buildCodeChallengeFromVerifier(codeVerifier: string) {
  const hash = createHash('sha256').update(codeVerifier).digest();
  return toBase64Url(hash);
}

function parseBasicAuth(authHeader?: string) {
  if (!authHeader?.startsWith('Basic ')) return null;

  const raw = authHeader.slice('Basic '.length);
  const decoded = Buffer.from(raw, 'base64').toString('utf8');
  const [clientId, clientSecret] = decoded.split(':');

  return { clientId, clientSecret };
}

export async function handleToken(req: Request, res: Response) {
  const grantType = String(req.body?.grant_type ?? '');
  const code = String(req.body?.code ?? '');
  const redirectUri = String(req.body?.redirect_uri ?? '');
  const codeVerifier = req.body?.code_verifier
    ? String(req.body.code_verifier)
    : null;

  if (grantType !== 'authorization_code') {
    return res.status(400).json({
      error: 'unsupported_grant_type',
      error_description: 'Only authorization_code is supported',
    });
  }

  if (!code || !redirectUri) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Missing code or redirect_uri',
    });
  }

  const authCode = getAuthCode(code);

  if (!authCode) {
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Unknown authorization code',
    });
  }

  if (Date.now() > authCode.expiresAt) {
    deleteAuthCode(code);
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Authorization code expired',
    });
  }

  const client = oauthStore.clients.get(authCode.clientId);

  if (!client) {
    return res.status(401).json({
      error: 'invalid_client',
      error_description: 'Unknown client',
    });
  }

  if (client.token_endpoint_auth_method === 'none') {
    const clientId = String(req.body?.client_id ?? '');

    if (clientId !== client.client_id) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Invalid public client_id',
      });
    }
  }

  if (client.token_endpoint_auth_method === 'client_secret_post') {
    const clientId = String(req.body?.client_id ?? '');
    const clientSecret = String(req.body?.client_secret ?? '');

    if (
      clientId !== client.client_id ||
      clientSecret !== client.client_secret
    ) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Invalid client credentials',
      });
    }
  }

  if (client.token_endpoint_auth_method === 'client_secret_basic') {
    const parsed = parseBasicAuth(req.headers.authorization);

    if (
      !parsed ||
      parsed.clientId !== client.client_id ||
      parsed.clientSecret !== client.client_secret
    ) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Invalid basic client credentials',
      });
    }
  }

  if (authCode.redirectUri !== redirectUri) {
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'redirect_uri does not match authorization code',
    });
  }

  if (authCode.codeChallenge) {
    if (!codeVerifier) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing code_verifier',
      });
    }

    if (authCode.codeChallengeMethod === 'S256') {
      const expectedChallenge = buildCodeChallengeFromVerifier(codeVerifier);

      if (expectedChallenge !== authCode.codeChallenge) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Invalid PKCE code_verifier',
        });
      }
    } else if (authCode.codeChallengeMethod === 'plain') {
      if (codeVerifier !== authCode.codeChallenge) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Invalid PKCE code_verifier',
        });
      }
    } else {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Unsupported code_challenge_method',
      });
    }
  }

  deleteAuthCode(code);

  const issuer = process.env.OAUTH_ISSUER_URL ?? 'http://localhost:3333/oauth';
  const audience = process.env.MCP_RESOURCE_URL ?? 'http://localhost:3333/mcp';
  const secret = process.env.OAUTH_JWT_SECRET ?? 'dev-oauth-secret';

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 3600;

  const accessToken = jwt.sign(
    {
      iss: issuer,
      sub: authCode.subject,
      aud: audience,
      scope: authCode.scope,
      iat: now,
      exp: now + expiresIn,
    },
    secret,
    { algorithm: 'HS256' }
  );

  return res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: expiresIn,
    scope: authCode.scope,
  });
}