import jwt, { type JwtHeader } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { clerkConfig } from "./clerk-config.js";

const client = jwksClient({
  jwksUri: clerkConfig.jwksUrl,
});

function getKey(header: JwtHeader, callback: any) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export async function verifyToken(token: string) {
  return new Promise<any>((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: clerkConfig.audience,
        issuer: clerkConfig.issuer,
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
}