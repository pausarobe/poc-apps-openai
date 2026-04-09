import type { AuthCodeRecord } from './types.js';

const authCodes = new Map<string, AuthCodeRecord>();

export function saveAuthCode(record: AuthCodeRecord) {
  authCodes.set(record.code, record);
}

export function getAuthCode(code: string) {
  return authCodes.get(code) ?? null;
}

export function deleteAuthCode(code: string) {
  authCodes.delete(code);
}