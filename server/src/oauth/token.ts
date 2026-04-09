import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { deleteAuthCode, getAuthCode } from './store.js';

export function handleToken(req: Request, res: Response) {
  const {
    grant_type,
    code,
    redirect_uri,
    client_id,
  } = req.body as Record<string, string | undefined>;

  if (grant_type !== 'authorization_code') {
    return res.status(400).json({
      error: 'unsupported_grant_type',
    });
  }

  if (!code || !redirect_uri || !client_id) {
    return res.status(400).json({
      error: 'invalid_request',
      message: 'Missing code, redirect_uri or client_id',
    });
  }

  const record = getAuthCode(code);

  if (!record) {
    return res.status(400).json({
      error: 'invalid_grant',
      message: 'Authorization code not found',
    });
  }

  if (record.clientId !== client_id || record.redirectUri !== redirect_uri) {
    return res.status(400).json({
      error: 'invalid_grant',
      message: 'Authorization code does not match client or redirect_uri',
    });
  }

  deleteAuthCode(code);

  // Placeholder temporal hasta emitir JWT real
  const accessToken = crypto.randomUUID();

  return res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
  });
}