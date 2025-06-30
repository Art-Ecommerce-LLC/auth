'use server';

import * as jose from 'jose'

const secretKey = jose.base64url.decode(process.env.ENCRYPTION_SECRET!); // Ensure it's defined
import { SessionPayload } from '@/models/models';
// Function to encrypt a payload
export async function encrypt(payload: Record<string, string | Date>): Promise<string> {
  try {
    console.log('payload', payload)
    const jwe = await new jose.EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' }) // Direct encryption with AES-256-GCM
    .encrypt(secretKey); // Encrypt with the symmetric key
    console.log('jwe', jwe)
    return jwe;
  } catch (error) {
    throw new Error('Invalid token');
}
}

// Function to decrypt a payload
export async function decrypt(encryptedPayload: string): Promise<SessionPayload> {
  try {

    const { plaintext } = await jose.compactDecrypt(encryptedPayload, secretKey);
    const decodedPayload = new TextDecoder().decode(plaintext);

    const payload = JSON.parse(decodedPayload) as SessionPayload;
    if (payload.expiresAt && new Date(payload.expiresAt) < new Date(Date.now())){
      throw new Error('Token expired');
    }

    return payload;

  } catch (error) {
    throw new Error('Invalid token');
  }
}