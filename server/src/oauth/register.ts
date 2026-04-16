import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { oauthStore } from './store.js';

// Maneja el registro dinámico de clientes OAuth.

// Este endpoint implementa la parte de "dynamic client registration":
// 1. Recibe metadata del cliente desde el cuerpo de la petición.
// 2. Valida que existan URIs de redirección.
// 3. Genera un client_id y, si procede, un client_secret.
// 4. Almacena el cliente en memoria y devuelve sus credenciales.

export async function handleRegister(req: Request, res: Response) {
  // Leer el cuerpo de la petición enviado por el cliente.
  const body: any = req.body ?? {};
  console.log('[SERVER OAUTH REGISTER] body=', JSON.stringify(body));

  // Extraer las URIs de redirección y asegurar que estén en un arreglo.
  const redirectUris = Array.isArray(body.redirect_uris) ? body.redirect_uris : [];

  if (redirectUris.length === 0) {
    console.error('[SERVER OAUTH REGISTER] invalid_client_metadata missing redirect_uris');
    return res.status(400).json({
      error: 'invalid_client_metadata',
      error_description: 'redirect_uris is required',
    });
  }

  // Determinar el método de autenticación que usará el cliente en /oauth/token.
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

  // Guardar el cliente registrado en el almacén de OAuth.
  oauthStore.clients.set(clientId, client);
  console.log('[SERVER OAUTH REGISTER] client created', {
    client_id: clientId,
    redirect_uris: client.redirect_uris,
    token_endpoint_auth_method: client.token_endpoint_auth_method,
  });

  return res.status(201).json(client);
}