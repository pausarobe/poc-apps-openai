import type { Request, Response } from 'express';
import { createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import { deleteAuthCode, getAuthCode, oauthStore } from './store.js';

// Convierte un buffer a Base64URL según el estándar PKCE y JWT.
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

// Maneja el intercambio de código de autorización por token de acceso.

// Este endpoint implementa el flujo de "authorization_code":
// 1. Valida que el grant_type sea válido.
// 2. Busca y valida el auth code en memoria.
// 3. Verifica caducidad, client_id, redirect_uri y credenciales del cliente.
// 4. Comprueba PKCE si se usó code_challenge en la autorización.
// 5. Emite un JWT usado como access_token y lo devuelve al cliente.
export async function handleToken(req: Request, res: Response) {
  // Extraer los parámetros enviados al endpoint de token.
  const grantType = String(req.body?.grant_type ?? '');
  const code = String(req.body?.code ?? '');
  const redirectUri = String(req.body?.redirect_uri ?? '');
  const codeVerifier = req.body?.code_verifier
    ? String(req.body.code_verifier)
    : null;

  console.log('[SERVER OAUTH TOKEN] request:', {
    grantType,
    code,
    redirectUri,
    codeVerifierProvided: codeVerifier != null,
    authHeader: req.headers.authorization,
  });

  if (grantType !== 'authorization_code') {
    console.error('[SERVER OAUTH TOKEN] unsupported_grant_type', { grantType });
    return res.status(400).json({
      error: 'unsupported_grant_type',
      error_description: 'Only authorization_code is supported',
    });
  }

  // Validar que el grant_type sea authorization_code.
  if (!code || !redirectUri) {
    console.error('[SERVER OAUTH TOKEN] invalid_request missing code/redirectUri', {
      codePresent: !!code,
      redirectUri,
    });
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Missing code or redirect_uri',
    });
  }

  // Recuperar el auth code almacenado previamente.
  const authCode = getAuthCode(code);

  if (!authCode) {
    console.error('[SERVER OAUTH TOKEN] invalid_grant unknown auth code', { code });
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

  // Cargar los datos del cliente que generó el auth code.
  const client = oauthStore.clients.get(authCode.clientId);

  if (!client) {
    console.error('[SERVER OAUTH TOKEN] invalid_client unknown client', { clientId: authCode.clientId });
    return res.status(401).json({
      error: 'invalid_client',
      error_description: 'Unknown client',
    });
  }

  if (client.token_endpoint_auth_method === 'none') {
    const clientId = String(req.body?.client_id ?? '');

    if (clientId !== client.client_id) {
      console.error('[SERVER OAUTH TOKEN] invalid_client invalid public client_id', {
        clientId,
        expected: client.client_id,
      });
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
      console.error('[SERVER OAUTH TOKEN] invalid_client invalid client_secret_post', {
        clientId,
        clientSecretProvided: !!clientSecret,
      });
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Invalid client credentials',
      });
    }
  }

  if (client.token_endpoint_auth_method === 'client_secret_basic') {
    // Validar credenciales del cliente en el header Authorization Basic.
    const parsed = parseBasicAuth(req.headers.authorization);

    if (
      !parsed ||
      parsed.clientId !== client.client_id ||
      parsed.clientSecret !== client.client_secret
    ) {
      console.error('[SERVER OAUTH TOKEN] invalid_client invalid basic client credentials', {
        parsed,
      });
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Invalid basic client credentials',
      });
    }
  }

  // Verificar que el redirect_uri coincide con el código de autorización.
  if (authCode.redirectUri !== redirectUri) {
    console.error('[SERVER OAUTH TOKEN] invalid_grant redirect_uri mismatch', {
      expected: authCode.redirectUri,
      received: redirectUri,
    });
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'redirect_uri does not match authorization code',
    });
  }

  if (authCode.codeChallenge) {
    // Validar PKCE cuando el auth code fue creado con un code_challenge.
    if (!codeVerifier) {
      console.error('[SERVER OAUTH TOKEN] invalid_request missing code_verifier');
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing code_verifier',
      });
    }

    if (authCode.codeChallengeMethod === 'S256') {
      const expectedChallenge = buildCodeChallengeFromVerifier(codeVerifier);

      if (expectedChallenge !== authCode.codeChallenge) {
        console.error('[SERVER OAUTH TOKEN] invalid_grant invalid PKCE code_verifier', {
          expectedChallenge,
          codeChallenge: authCode.codeChallenge,
          codeVerifier,
        });
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Invalid PKCE code_verifier',
        });
      }
    } else if (authCode.codeChallengeMethod === 'plain') {
      if (codeVerifier !== authCode.codeChallenge) {
        console.error('[SERVER OAUTH TOKEN] invalid_grant invalid PKCE plain verifier', {
          codeVerifier,
          expected: authCode.codeChallenge,
        });
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

  // Consumir el auth code para que no pueda usarse de nuevo.
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