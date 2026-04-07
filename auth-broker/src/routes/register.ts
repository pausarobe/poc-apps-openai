import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import { clients, type RegisteredClient } from "./storage.js";

export function registerClientRoutes(app: Express) {
  app.post("/register", (req: Request, res: Response) => {
    const body = req.body ?? {};

    const tokenMethod =
      body.token_endpoint_auth_method === "client_secret_basic" ||
      body.token_endpoint_auth_method === "client_secret_post"
        ? body.token_endpoint_auth_method
        : "none";

    const client_id = `client_${nanoid(16)}`;
    const client_secret =
      tokenMethod === "none" ? undefined : `secret_${nanoid(32)}`;

    const client: RegisteredClient = {
      client_id,
      client_secret,
      redirect_uris: Array.isArray(body.redirect_uris) ? body.redirect_uris : [],
      token_endpoint_auth_method: tokenMethod,
      grant_types: Array.isArray(body.grant_types) ? body.grant_types : ["authorization_code"],
      response_types: Array.isArray(body.response_types) ? body.response_types : ["code"],
      client_name: body.client_name,
    };

    clients.set(client_id, client);

    return res.status(201).json(client);
  });
}