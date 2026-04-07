import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import { authorizationCodes, loginStates } from "./storage.js";

export function registerCallbackRoutes(app: Express) {
  app.get("/callback", (req: Request, res: Response) => {
    const clerkCode = String(req.query.code ?? "");
    const brokerState = String(req.query.state ?? "");

    if (!clerkCode || !brokerState) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing code or state from Clerk callback",
      });
    }

    const loginState = loginStates.get(brokerState);

    if (!loginState) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Unknown or expired broker state",
      });
    }

    // Simulación inicial del usuario autenticado.
    // Más adelante aquí leeremos el usuario real desde Clerk.
    const authCode = `authcode_${nanoid(24)}`;

    authorizationCodes.set(authCode, {
      code: authCode,
      client_id: loginState.client_id,
      redirect_uri: loginState.redirect_uri,
      scope: loginState.scope,
      resource: loginState.resource,
      user: {
        sub: "clerk-user-temp",
        email: "test@example.com",
        name: "Test User",
      },
      code_challenge: loginState.code_challenge,
      code_challenge_method: loginState.code_challenge_method,
      expires_at: Date.now() + 5 * 60 * 1000,
    });

    loginStates.delete(brokerState);

    const redirectUrl = new URL(loginState.redirect_uri);
    redirectUrl.searchParams.set("code", authCode);
    redirectUrl.searchParams.set("state", loginState.state);

    return res.redirect(redirectUrl.toString());
  });
}