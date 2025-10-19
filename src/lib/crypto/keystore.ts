/**
 * Key management for client-side encryption
 * Handles storing and retrieving encryption keys during user session
 */

import { deriveKey, generateSalt } from './encrypt';

export interface KeyStore {
  key: CryptoKey | null;
  salt: Uint8Array | null;
  userId: string | null;
}

class CryptoKeyStore {
  private keyStore: KeyStore = {
    key: null,
    salt: null,
    userId: null,
  };

  /**
   * Store encryption key for current session
   * @param userId - User ID from Supabase auth
   * @param passphrase - User's passphrase
   * @param salt - Salt for key derivation (from profile or generate new)
   */
  async storeKey(userId: string, passphrase: string, salt?: Uint8Array): Promise<void> {
    const keySalt = salt || generateSalt();
    const key = await deriveKey(passphrase, keySalt);
    
    this.keyStore = {
      key,
      salt: keySalt,
      userId,
    };
  }

  /**
   * Get stored encryption key
   * @returns CryptoKey | null - Stored key or null if not available
   */
  getKey(): CryptoKey | null {
    return this.keyStore.key;
  }

  /**
   * Get stored salt
   * @returns Uint8Array | null - Stored salt or null if not available
   */
  getSalt(): Uint8Array | null {
    return this.keyStore.salt;
  }

  /**
   * Get current user ID
   * @returns string | null - Current user ID or null if not logged in
   */
  getUserId(): string | null {
    return this.keyStore.userId;
  }

  /**
   * Check if key is available for current user
   * @param userId - User ID to check against
   * @returns boolean - True if key is available for this user
   */
  hasKey(userId: string): boolean {
    return this.keyStore.key !== null && this.keyStore.userId === userId;
  }

  /**
   * Clear stored key (on logout)
   */
  clearKey(): void {
    this.keyStore = {
      key: null,
      salt: null,
      userId: null,
    };
  }

  /**
   * Check if user has a stored key
   * @returns boolean - True if key is stored
   */
  isKeyStored(): boolean {
    return this.keyStore.key !== null;
  }
}

// Export singleton instance
export const keyStore = new CryptoKeyStore();

/**
 * Prompt user for passphrase (one-time per session)
 * @param userId - Current user ID
 * @returns Promise<string> - User's passphrase
 */
export async function promptForPassphrase(userId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // In a real implementation, this would show a modal dialog
    // For now, we'll use a simple prompt (not recommended for production)
    const passphrase = prompt('Enter your encryption passphrase:');
    
    if (!passphrase) {
      reject(new Error('Passphrase is required'));
      return;
    }
    
    if (passphrase.length < 8) {
      reject(new Error('Passphrase must be at least 8 characters'));
      return;
    }
    
    resolve(passphrase);
  });
}

/**
 * Initialize key store for user
 * @param userId - User ID from Supabase auth
 * @param salt - Salt from user profile (if exists)
 * @returns Promise<void>
 */
export async function initializeKeyStore(userId: string, salt?: Uint8Array): Promise<void> {
  if (keyStore.hasKey(userId)) {
    return; // Key already stored for this user
  }

  try {
    const passphrase = await promptForPassphrase(userId);
    await keyStore.storeKey(userId, passphrase, salt);
  } catch (error) {
    console.error('Failed to initialize key store:', error);
    throw error;
  }
}
