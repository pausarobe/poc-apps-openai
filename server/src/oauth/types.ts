export type AuthCodeRecord = {
  code: string;
  clientId: string;
  redirectUri: string;
  subject: string;
  createdAt: number;
};