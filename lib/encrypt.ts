'use server';

import * as jose from 'jose'

const secretKey = jose.base64url.decode(process.env.ENCRYPTION_SECRET!); // Ensure it's defined

// Function to encrypt a payload
export async function encrypt(payload: Record<string, string>): Promise<string> {
  try {

    const jwe = await new jose.EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' }) // Direct encryption with AES-256-GCM
    .encrypt(secretKey); // Encrypt with the symmetric key
    return jwe;
  } catch (error) {
    throw new Error('Invalid token');
}
}

// Function to decrypt a payload
export async function decrypt(encryptedPayload: string): Promise<Record<string, string>> {
  try {
    // Decrypt the compact JWE (encrypted payload) using the symmetric key
    // check if the payload is a string
    const { plaintext } = await jose.compactDecrypt(encryptedPayload, secretKey);
    
    // If the decrypted payload is a string (as it's arbitrary data), parse it as needed
    const decodedPayload = new TextDecoder().decode(plaintext);
    
    // Optionally, you can parse the result into JSON if your original payload was JSON:
    const payload = JSON.parse(decodedPayload);

    const { sessionId, expiresAt } = payload;
    // Turn datenow into string object

    const decryptedPayload = {
      sessionId : sessionId,
      expiresAt: expiresAt,
    };

    return decryptedPayload
  } catch (error) {
    throw new Error('Invalid token');
  }
}