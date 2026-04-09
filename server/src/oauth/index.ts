import type { Express } from 'express';
import { handleAuthorize } from './authorize.js';
import { handleToken } from './token.js';
import { registerOAuthWellKnownRoutes } from './well-known.js';

export function registerOAuthRoutes(app: Express) {
  registerOAuthWellKnownRoutes(app);

  app.get('/oauth/authorize', handleAuthorize);
  app.post('/oauth/token', handleToken);
}