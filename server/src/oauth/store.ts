import type { AuthCodeRecord, LoginStateRecord, RegisteredClient } from './types.js';

const authCodes = new Map<string, AuthCodeRecord>();
const clients = new Map<string, RegisteredClient>();
const loginStates = new Map<string, LoginStateRecord>();

export const oauthStore = {
  authCodes,
  clients,
  loginStates,
};

export function saveAuthCode(record: AuthCodeRecord) {
  authCodes.set(record.code, record);
}

export function getAuthCode(code: string) {
  return authCodes.get(code) ?? null;
}

export function deleteAuthCode(code: string) {
  authCodes.delete(code);
}

export function saveLoginState(record: LoginStateRecord) {
  loginStates.set(record.brokerState, record);
}

export function getLoginState(brokerState: string) {
  return loginStates.get(brokerState) ?? null;
}

export function deleteLoginState(brokerState: string) {
  loginStates.delete(brokerState);
}