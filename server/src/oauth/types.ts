export type RegisteredClient = {
  client_id: string;
  client_secret?: string;
  client_name?: string;
  redirect_uris: string[];
  grant_types: string[];
  response_types: string[];
  token_endpoint_auth_method: 'none' | 'client_secret_basic' | 'client_secret_post';
  scope?: string;
};

export type LoginStateRecord = {
  brokerState: string;
  clientId: string;
  redirectUri: string;
  originalState: string;
  scope: string;
  resource?: string;
  codeChallenge: string | null;
  codeChallengeMethod: string | null;
};

export type AuthCodeRecord = {
  code: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string | null;
  codeChallengeMethod: string | null;
  subject: string;
  scope: string;
  expiresAt: number;
};