export type RegisteredClient = {
  client_id: string;
  client_secret?: string;
  redirect_uris: string[];
  token_endpoint_auth_method: "none" | "client_secret_basic" | "client_secret_post";
  grant_types: string[];
  response_types: string[];
  client_name?: string;
};

export type LoginStateRecord = {
  client_id: string;
  redirect_uri: string;
  state: string;
  scope: string;
  resource: string;
  code_challenge?: string;
  code_challenge_method?: string;
};

export type AuthorizationCodeRecord = {
  code: string;
  client_id: string;
  redirect_uri: string;
  scope: string;
  resource: string;
  user: {
    sub: string;
    email?: string;
    name?: string;
  };
  code_challenge?: string;
  code_challenge_method?: string;
  expires_at: number;
};

export const clients = new Map<string, RegisteredClient>();
export const loginStates = new Map<string, LoginStateRecord>();
export const authorizationCodes = new Map<string, AuthorizationCodeRecord>();