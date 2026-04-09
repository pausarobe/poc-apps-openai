import jwt, { type JwtHeader } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { clerkConfig } from './clerk-config.js';

const client = jwksClient({
  jwksUri: clerkConfig.jwksUrl,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,
});

function getKey(header: JwtHeader, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }

    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export async function verifyToken(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        issuer: clerkConfig.issuer,
        audience: clerkConfig.audience,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(decoded);
      }
    );
  });
}