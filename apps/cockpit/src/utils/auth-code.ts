/**
 * AES-256-GCM auth code encryption for the MCP OAuth flow.
 *
 * Encrypts Supabase session tokens into an opaque auth code that the
 * MCP server can decrypt. Both sides derive a 256-bit key via SHA-256
 * of the shared COSHIP_API_SECRET.
 *
 * Wire format (base64url-encoded, no padding):
 *   iv[12 bytes] || ciphertext || authTag[16 bytes]
 */

import { createCipheriv, createHash, randomBytes } from "crypto";

export function encryptAuthCode(data: object, secret: string): string {
  const key = createHash("sha256").update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, enc, authTag])
    .toString("base64url");
}
