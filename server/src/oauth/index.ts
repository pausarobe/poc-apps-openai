import type { Express } from 'express';
import { handleAuthorize } from './authorize.js';
import { handleToken } from './token.js';
import { registerOAuthWellKnownRoutes } from './well-known.js';
import { handleRegister } from './register.js';
import { handleCallback } from './callback.js';
import 'dotenv/config';


export function registerOAuthRoutes(app: Express) {
  registerOAuthWellKnownRoutes(app);

  app.get('/oauth/authorize', handleAuthorize);
  app.post('/oauth/token', handleToken);
  app.post('/oauth/register', handleRegister);
  app.post('/oauth/callback', handleCallback);
}