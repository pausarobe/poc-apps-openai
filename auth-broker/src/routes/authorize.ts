import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import { config } from "../config.js";
import { clients, loginStates } from "./storage.js";

export function registerAuthorizeRoutes(app: Express) {
  app.get("/authorize", (req: Request, res: Response) => {
    const client_id = String(req.query.client_id ?? "");
    const redirect_uri = String(req.query.redirect_uri ?? "");
    const state = String(req.query.state ?? "");
    const scope = String(req.query.scope ?? "openid profile email");
    const resource = String(req.query.resource ?? config.mcpResource);
    const code_challenge = req.query.code_challenge
      ? String(req.query.code_challenge)
      : undefined;
    const code_challenge_method = req.query.code_challenge_method
      ? String(req.query.code_challenge_method)
      : undefined;

    if (!client_id || !redirect_uri || !state) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing client_id, redirect_uri, or state",
      });
    }

    const client = clients.get(client_id);

    if (!client) {
      return res.status(400).json({
        error: "invalid_client",
        error_description: "Unknown client_id",
      });
    }

    if (!client.redirect_uris.includes(redirect_uri)) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "redirect_uri is not registered for this client",
      });
    }

    const brokerLoginState = `broker_state_${nanoid(24)}`;

    loginStates.set(brokerLoginState, {
      client_id,
      redirect_uri,
      state,
      scope,
      resource,
      code_challenge,
      code_challenge_method,
    });

    const clerkAuthorizeUrl = new URL(`${config.clerkIssuer}/oauth/authorize`);
    clerkAuthorizeUrl.searchParams.set("client_id", config.clerkClientId);
    clerkAuthorizeUrl.searchParams.set("redirect_uri", config.clerkRedirectUri);
    clerkAuthorizeUrl.searchParams.set("response_type", "code");
    clerkAuthorizeUrl.searchParams.set("scope", "openid profile email");
    clerkAuthorizeUrl.searchParams.set("state", brokerLoginState);

    return res.redirect(clerkAuthorizeUrl.toString());
  });
}