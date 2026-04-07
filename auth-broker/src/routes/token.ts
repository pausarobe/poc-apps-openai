import type { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { authorizationCodes, clients } from "./storage.js";
import crypto from "node:crypto";

function base64UrlEncode(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function verifyPkce(codeVerifier: string, codeChallenge: string) {
  const hashed = crypto.createHash("sha256").update(codeVerifier).digest();
  const computedChallenge = base64UrlEncode(hashed);
  return computedChallenge === codeChallenge;
}

function parseBasicAuth(authHeader?: string) {
  if (!authHeader?.startsWith("Basic ")) return null;

  const encoded = authHeader.slice("Basic ".length);
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const [client_id, client_secret] = decoded.split(":");

  return { client_id, client_secret };
}

export function registerTokenRoutes(app: Express) {
  app.post("/token", (req: Request, res: Response) => {
    const grant_type = String(req.body?.grant_type ?? "");
    const code = String(req.body?.code ?? "");
    const redirect_uri = String(req.body?.redirect_uri ?? "");
    const code_verifier = req.body?.code_verifier
      ? String(req.body.code_verifier)
      : undefined;

    if (grant_type !== "authorization_code") {
      return res.status(400).json({
        error: "unsupported_grant_type",
        error_description: "Only authorization_code is supported",
      });
    }

    if (!code || !redirect_uri) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing code or redirect_uri",
      });
    }

    const authCodeRecord = authorizationCodes.get(code);

    if (!authCodeRecord) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Unknown authorization code",
      });
    }

    if (Date.now() > authCodeRecord.expires_at) {
      authorizationCodes.delete(code);
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Authorization code expired",
      });
    }

    const client = clients.get(authCodeRecord.client_id);

    if (!client) {
      return res.status(400).json({
        error: "invalid_client",
        error_description: "Unknown client",
      });
    }

    // Validación del cliente según su método de auth
    if (client.token_endpoint_auth_method === "client_secret_post") {
      const client_id = String(req.body?.client_id ?? "");
      const client_secret = String(req.body?.client_secret ?? "");

      if (client_id !== client.client_id || client_secret !== client.client_secret) {
        return res.status(401).json({
          error: "invalid_client",
          error_description: "Invalid client credentials",
        });
      }
    }

    if (client.token_endpoint_auth_method === "client_secret_basic") {
      const parsed = parseBasicAuth(req.headers.authorization);

      if (
        !parsed ||
        parsed.client_id !== client.client_id ||
        parsed.client_secret !== client.client_secret
      ) {
        return res.status(401).json({
          error: "invalid_client",
          error_description: "Invalid basic auth client credentials",
        });
      }
    }

    if (client.token_endpoint_auth_method === "none") {
      const client_id = String(req.body?.client_id ?? "");
      if (client_id !== client.client_id) {
        return res.status(401).json({
          error: "invalid_client",
          error_description: "Invalid public client_id",
        });
      }
    }

    if (authCodeRecord.redirect_uri !== redirect_uri) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "redirect_uri does not match authorization code",
      });
    }

    if (authCodeRecord.code_challenge) {
      if (!code_verifier) {
        return res.status(400).json({
          error: "invalid_request",
          error_description: "Missing code_verifier",
        });
      }

      if (authCodeRecord.code_challenge_method !== "S256") {
        return res.status(400).json({
          error: "invalid_request",
          error_description: "Unsupported code_challenge_method",
        });
      }

      const ok = verifyPkce(code_verifier, authCodeRecord.code_challenge);

      if (!ok) {
        return res.status(400).json({
          error: "invalid_grant",
          error_description: "Invalid PKCE code_verifier",
        });
      }
    }

    authorizationCodes.delete(code);

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 3600;

    const accessToken = jwt.sign(
      {
        iss: config.issuer,
        sub: authCodeRecord.user.sub,
        aud: authCodeRecord.resource,
        scope: authCodeRecord.scope,
        email: authCodeRecord.user.email,
        name: authCodeRecord.user.name,
        iat: now,
        exp: now + expiresIn,
      },
      config.jwtSecret,
      { algorithm: "HS256" }
    );

    return res.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: expiresIn,
      scope: authCodeRecord.scope,
    });
  });
}