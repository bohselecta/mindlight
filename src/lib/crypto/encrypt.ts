/**
 * Client-side encryption utilities using WebCrypto API
 * Implements AES-GCM encryption with PBKDF2 key derivation
 */

export interface EncryptedPayload {
  iv: string; // base64 encoded initialization vector
  ciphertext: string; // base64 encoded encrypted data
  salt: string; // base64 encoded salt for key derivation
}

export interface CryptoKeyPair {
  key: CryptoKey;
  salt: Uint8Array;
}

/**
 * Derive a cryptographic key from a passphrase using PBKDF2
 * @param passphrase - User's passphrase
 * @param salt - Random salt (generated on first use)
 * @returns Promise<CryptoKey> - AES-GCM key for encryption/decryption
 */
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Create a new ArrayBuffer from the Uint8Array to ensure proper typing
  const saltBuffer = new Uint8Array(salt).buffer;

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000, // OWASP recommended minimum
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a random salt for key derivation
 * @returns Uint8Array - 16 bytes of random data
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Encrypt data using AES-GCM
 * @param key - CryptoKey derived from passphrase
 * @param data - Object to encrypt
 * @returns Promise<EncryptedPayload> - Encrypted data with IV and salt
 */
export async function encrypt(key: CryptoKey, data: any): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const jsonString = JSON.stringify(data);
  const dataBuffer = encoder.encode(jsonString);
  
  // Generate random IV for each encryption
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
  
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer
  );

  return {
    iv: arrayBufferToBase64(iv),
    ciphertext: arrayBufferToBase64(ciphertext),
    salt: arrayBufferToBase64(new Uint8Array(0)), // Will be set by caller
  };
}

/**
 * Decrypt data using AES-GCM
 * @param key - CryptoKey derived from passphrase
 * @param payload - EncryptedPayload containing IV and ciphertext
 * @returns Promise<any> - Decrypted object
 */
export async function decrypt(key: CryptoKey, payload: EncryptedPayload): Promise<any> {
  const decoder = new TextDecoder();
  const iv = base64ToArrayBuffer(payload.iv);
  const ciphertext = base64ToArrayBuffer(payload.ciphertext);
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    ciphertext
  );

  const jsonString = decoder.decode(decryptedBuffer);
  return JSON.parse(jsonString);
}

/**
 * Encrypt data with a new salt (for first-time encryption)
 * @param passphrase - User's passphrase
 * @param data - Object to encrypt
 * @returns Promise<{payload: EncryptedPayload, salt: Uint8Array}> - Encrypted data and salt
 */
export async function encryptWithNewSalt(passphrase: string, data: any): Promise<{payload: EncryptedPayload, salt: Uint8Array}> {
  const salt = generateSalt();
  const key = await deriveKey(passphrase, salt);
  const payload = await encrypt(key, data);
  payload.salt = arrayBufferToBase64(salt);
  
  return { payload, salt };
}

/**
 * Decrypt data using stored salt
 * @param passphrase - User's passphrase
 * @param salt - Salt used for key derivation
 * @param payload - EncryptedPayload to decrypt
 * @returns Promise<any> - Decrypted object
 */
export async function decryptWithSalt(passphrase: string, salt: Uint8Array, payload: EncryptedPayload): Promise<any> {
  const key = await deriveKey(passphrase, salt);
  return decrypt(key, payload);
}

// Utility functions for base64 encoding/decoding
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
