import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { oauthStore } from './store.js';

// Manejamos el registro dinamico de cliente OAuth.
// Crea un nuevo registro de cliente en memoria y devuelve las credenciales del cliente.

export async function handleRegister(req: Request, res: Response) {
  const body: any = req.body ?? {};
  console.log('[SERVER OAUTH REGISTER] body=', JSON.stringify(body));

  const redirectUris = Array.isArray(body.redirect_uris) ? body.redirect_uris : [];

  if (redirectUris.length === 0) {
    console.error('[SERVER OAUTH REGISTER] invalid_client_metadata missing redirect_uris');
    return res.status(400).json({
      error: 'invalid_client_metadata',
      error_description: 'redirect_uris is required',
    });
  }

  const tokenEndpointAuthMethod =
    body.token_endpoint_auth_method === 'client_secret_basic' ||
    body.token_endpoint_auth_method === 'client_secret_post'
      ? body.token_endpoint_auth_method
      : 'none';

  const clientId = `client_${randomUUID()}`;
  const clientSecret =
    tokenEndpointAuthMethod === 'none' ? undefined : `secret_${randomUUID()}`;

  const client = {
    client_id: clientId,
    client_secret: clientSecret,
    client_name: body.client_name ?? 'Dynamic MCP Client',
    redirect_uris: redirectUris,
    grant_types: Array.isArray(body.grant_types) ? body.grant_types : ['authorization_code'],
    response_types: Array.isArray(body.response_types) ? body.response_types : ['code'],
    token_endpoint_auth_method: tokenEndpointAuthMethod,
    scope: typeof body.scope === 'string' ? body.scope : 'openid profile email',
  };

  oauthStore.clients.set(clientId, client);
  console.log('[SERVER OAUTH REGISTER] client created', {
    client_id: clientId,
    redirect_uris: client.redirect_uris,
    token_endpoint_auth_method: client.token_endpoint_auth_method,
  });

  return res.status(201).json(client);
}