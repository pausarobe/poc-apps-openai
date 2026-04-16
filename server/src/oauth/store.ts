import type { AuthCodeRecord, LoginStateRecord, RegisteredClient } from './types.js';

// Almacén en memoria para OAuth.

// authCodes: códigos de autorización temporales generados tras el login.
// clients: clientes registrados dinámicamente con metadata de OAuth.
// loginStates: estados temporales usados durante el redireccionamiento hacia Clerk.
const authCodes = new Map<string, AuthCodeRecord>();
const clients = new Map<string, RegisteredClient>();
const loginStates = new Map<string, LoginStateRecord>();

export const oauthStore = {
  authCodes,
  clients,
  loginStates,
};

// Guardar un código de autorización temporal generado durante el callback.
export function saveAuthCode(record: AuthCodeRecord) {
  authCodes.set(record.code, record);
}

export function getAuthCode(code: string) {
  // Recuperar un auth code guardado para el intercambio por token.
  return authCodes.get(code) ?? null;
}

// Eliminar un auth code una vez usado o caducado.
export function deleteAuthCode(code: string) {
  authCodes.delete(code);
}

// Guardar un estado de login temporal entre /oauth/authorize y /oauth/callback.
export function saveLoginState(record: LoginStateRecord) {
  loginStates.set(record.brokerState, record);
}

export function getLoginState(brokerState: string) {
  // Recuperar el estado interno del broker de autorización.
  return loginStates.get(brokerState) ?? null;
}

export function deleteLoginState(brokerState: string) {
  loginStates.delete(brokerState);
}