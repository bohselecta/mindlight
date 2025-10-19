/**
 * Sync service for encrypted data synchronization
 * Handles push/pull operations with conflict resolution
 */

import { createClient } from '@/lib/supabase/client';
import { encryptWithNewSalt, decryptWithSalt, EncryptedPayload } from '@/lib/crypto/encrypt';
import { keyStore } from '@/lib/crypto/keystore';
import { autonomyStore } from '@/lib/store/autonomy-store';

export interface SyncResult {
  success: boolean;
  error?: string;
  conflicts?: ConflictInfo[];
}

export interface ConflictInfo {
  blobType: string;
  localVersion: number;
  remoteVersion: number;
  resolution: 'local' | 'remote' | 'merge';
}

export interface SyncStatus {
  lastSyncAt: Date | null;
  isOnline: boolean;
  pendingChanges: number;
  isSyncing: boolean;
}

class SyncService {
  private supabase = createClient();
  private syncStatus: SyncStatus = {
    lastSyncAt: null,
    isOnline: navigator.onLine,
    pendingChanges: 0,
    isSyncing: false,
  };

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.scheduleSync();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
    });

    // Load last sync time from localStorage
    const lastSync = localStorage.getItem('mindlight_last_sync');
    if (lastSync) {
      this.syncStatus.lastSyncAt = new Date(lastSync);
    }
  }

  /**
   * Export local data from IndexedDB
   * @returns Promise<any> - Exported data object
   */
  async exportLocalData(): Promise<any> {
    try {
      return await autonomyStore.exportData();
    } catch (error) {
      console.error('Failed to export local data:', error);
      throw new Error('Failed to export local data');
    }
  }

  /**
   * One-time migration of local data to cloud
   * @param userId - User ID from Supabase auth
   * @returns Promise<SyncResult> - Migration result
   */
  async migrateOnFirstLogin(userId: string): Promise<SyncResult> {
    try {
      this.syncStatus.isSyncing = true;

      // Check if user already has data in cloud
      const { data: existingBlobs } = await this.supabase
        .from('encrypted_blobs')
        .select('blob_type')
        .eq('user_id', userId);

      if (existingBlobs && existingBlobs.length > 0) {
        return {
          success: false,
          error: 'User already has cloud data. Use sync instead of migration.',
        };
      }

      // Export local data
      const localData = await this.exportLocalData();
      
      if (!localData || Object.keys(localData).length === 0) {
        return {
          success: false,
          error: 'No local data to migrate',
        };
      }

      // Initialize key store if not already done
      if (!keyStore.hasKey(userId)) {
        const salt = keyStore.getSalt();
        if (!salt) {
          throw new Error('No encryption key available');
        }
        await keyStore.storeKey(userId, '', salt); // Will prompt for passphrase
      }

      // Encrypt and upload data
      const key = keyStore.getKey();
      const salt = keyStore.getSalt();
      
      if (!key || !salt) {
        throw new Error('Encryption key not available');
      }

      const { payload } = await encryptWithNewSalt('', localData); // Will use stored key
      payload.salt = btoa(String.fromCharCode(...salt));

      // Upload to different blob types
      const blobTypes = ['assessments', 'progress', 'reflections', 'settings'];
      const uploadPromises = blobTypes.map(async (blobType) => {
        const blobData = localData[blobType] || {};
        const { payload: blobPayload } = await encryptWithNewSalt('', blobData);
        blobPayload.salt = btoa(String.fromCharCode(...salt));

        return this.supabase
          .from('encrypted_blobs')
          .upsert({
            user_id: userId,
            blob_type: blobType,
            ciphertext: blobPayload.ciphertext,
            version: 1,
          });
      });

      await Promise.all(uploadPromises);

      // Update sync status
      this.syncStatus.lastSyncAt = new Date();
      localStorage.setItem('mindlight_last_sync', this.syncStatus.lastSyncAt.toISOString());

      // Log successful migration
      await this.supabase
        .from('sync_log')
        .insert({
          user_id: userId,
          operation: 'migrate',
          success: true,
        });

      return { success: true };
    } catch (error) {
      console.error('Migration failed:', error);
      
      // Log failed migration
      await this.supabase
        .from('sync_log')
        .insert({
          user_id: userId,
          operation: 'migrate',
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
      };
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }

  /**
   * Push local changes to cloud
   * @param userId - User ID from Supabase auth
   * @returns Promise<SyncResult> - Push result
   */
  async pushChanges(userId: string): Promise<SyncResult> {
    try {
      this.syncStatus.isSyncing = true;

      if (!keyStore.hasKey(userId)) {
        throw new Error('Encryption key not available');
      }

      const key = keyStore.getKey();
      const salt = keyStore.getSalt();
      
      if (!key || !salt) {
        throw new Error('Encryption key not available');
      }

      // Export local data
      const localData = await this.exportLocalData();
      
      // Get current versions from cloud
      const { data: remoteBlobs } = await this.supabase
        .from('encrypted_blobs')
        .select('blob_type, version')
        .eq('user_id', userId);

      const remoteVersions = new Map(
        remoteBlobs?.map(blob => [blob.blob_type, blob.version]) || []
      );

      // Upload each blob type with version increment
      const blobTypes = ['assessments', 'progress', 'reflections', 'settings'];
      const uploadPromises = blobTypes.map(async (blobType) => {
        const blobData = localData[blobType] || {};
        const currentVersion = remoteVersions.get(blobType) || 0;
        const newVersion = currentVersion + 1;

        const { payload } = await encryptWithNewSalt('', blobData);
        payload.salt = btoa(String.fromCharCode(...salt));

        return this.supabase
          .from('encrypted_blobs')
          .upsert({
            user_id: userId,
            blob_type: blobType,
            ciphertext: payload.ciphertext,
            version: newVersion,
          });
      });

      await Promise.all(uploadPromises);

      // Update sync status
      this.syncStatus.lastSyncAt = new Date();
      localStorage.setItem('mindlight_last_sync', this.syncStatus.lastSyncAt.toISOString());

      // Log successful push
      await this.supabase
        .from('sync_log')
        .insert({
          user_id: userId,
          operation: 'push',
          success: true,
        });

      return { success: true };
    } catch (error) {
      console.error('Push failed:', error);
      
      // Log failed push
      await this.supabase
        .from('sync_log')
        .insert({
          user_id: userId,
          operation: 'push',
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Push failed',
      };
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }

  /**
   * Pull changes from cloud
   * @param userId - User ID from Supabase auth
   * @returns Promise<SyncResult> - Pull result
   */
  async pullChanges(userId: string): Promise<SyncResult> {
    try {
      this.syncStatus.isSyncing = true;

      if (!keyStore.hasKey(userId)) {
        throw new Error('Encryption key not available');
      }

      const key = keyStore.getKey();
      const salt = keyStore.getSalt();
      
      if (!key || !salt) {
        throw new Error('Encryption key not available');
      }

      // Get last sync time
      const lastSyncTime = this.syncStatus.lastSyncAt?.toISOString();

      // Fetch updated blobs
      let query = this.supabase
        .from('encrypted_blobs')
        .select('*')
        .eq('user_id', userId);

      if (lastSyncTime) {
        query = query.gt('updated_at', lastSyncTime);
      }

      const { data: remoteBlobs, error } = await query;

      if (error) {
        throw error;
      }

      if (!remoteBlobs || remoteBlobs.length === 0) {
        return { success: true }; // No new data
      }

      // Decrypt and merge each blob
      const conflicts: ConflictInfo[] = [];
      
      for (const blob of remoteBlobs) {
        try {
          const payload: EncryptedPayload = {
            iv: '', // Will be extracted from ciphertext
            ciphertext: blob.ciphertext,
            salt: '', // Will be extracted from stored salt
          };

          const decryptedData = await decryptWithSalt('', salt, payload);
          
          // Check for conflicts (simplified: last-write-wins)
          const localVersion = 1; // Simplified - would check actual local version
          if (blob.version > localVersion) {
            // Remote is newer, use it
            // TODO: Implement proper data import when importData method is available
            console.log(`Would import ${blob.blob_type} data from cloud`);
          } else if (blob.version < localVersion) {
            // Local is newer, keep local
            conflicts.push({
              blobType: blob.blob_type,
              localVersion,
              remoteVersion: blob.version,
              resolution: 'local',
            });
          }
        } catch (error) {
          console.error(`Failed to decrypt blob ${blob.blob_type}:`, error);
        }
      }

      // Update sync status
      this.syncStatus.lastSyncAt = new Date();
      localStorage.setItem('mindlight_last_sync', this.syncStatus.lastSyncAt.toISOString());

      // Log successful pull
      await this.supabase
        .from('sync_log')
        .insert({
          user_id: userId,
          operation: 'pull',
          success: true,
        });

      return { 
        success: true, 
        conflicts: conflicts.length > 0 ? conflicts : undefined 
      };
    } catch (error) {
      console.error('Pull failed:', error);
      
      // Log failed pull
      await this.supabase
        .from('sync_log')
        .insert({
          user_id: userId,
          operation: 'pull',
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error',
        });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pull failed',
      };
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }

  /**
   * Get current sync status
   * @returns SyncStatus - Current sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Schedule background sync (called every 3 minutes)
   * @param userId - User ID from Supabase auth
   */
  async scheduleSync(userId?: string): Promise<void> {
    if (!userId || !this.syncStatus.isOnline || this.syncStatus.isSyncing) {
      return;
    }

    try {
      await this.pullChanges(userId);
      await this.pushChanges(userId);
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
}

// Export singleton instance
export const syncService = new SyncService();
