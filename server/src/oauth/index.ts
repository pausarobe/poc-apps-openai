import type { Express } from 'express';
import { handleAuthorize } from './authorize.js';
import { handleToken } from './token.js';
import { registerOAuthWellKnownRoutes } from './well-known.js';
import { handleRegister } from './register.js';
import { handleCallback } from './callback.js';
import 'dotenv/config';

// Registrar las rutas principales del servidor OAuth.

// Se configuran los endpoints de discovery, autorización, token, registro y callback.
export function registerOAuthRoutes(app: Express) {
  registerOAuthWellKnownRoutes(app);

  app.get('/oauth/authorize', handleAuthorize);
  app.post('/oauth/token', handleToken);
  app.post('/oauth/register', handleRegister);
  app.post('/oauth/callback', handleCallback);
}