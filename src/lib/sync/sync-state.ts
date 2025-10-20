/**
 * Sync state management and background sync coordination
 * Handles periodic sync, online/offline detection, and sync status tracking
 */

import { syncService, SyncStatus } from './sync-service';

export interface SyncState {
  status: SyncStatus;
  isEnabled: boolean;
  intervalId: number | null;
}

class SyncStateManager {
  private state: SyncState = {
    status: {
      lastSyncAt: null,
      isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
      pendingChanges: 0,
      isSyncing: false,
    },
    isEnabled: false,
    intervalId: null,
  };

  private listeners: Set<(status: SyncStatus) => void> = new Set();

  constructor() {
    this.loadState();
    this.setupEventListeners();
  }

  /**
   * Load sync state from localStorage
   */
  private loadState(): void {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('mindlight_sync_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state.isEnabled = parsed.isEnabled || false;
        
        if (parsed.lastSyncAt) {
          this.state.status.lastSyncAt = new Date(parsed.lastSyncAt);
        }
      }
    } catch (error) {
      console.error('Failed to load sync state:', error);
    }
  }

  /**
   * Save sync state to localStorage
   */
  private saveState(): void {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    try {
      const stateToSave = {
        isEnabled: this.state.isEnabled,
        lastSyncAt: this.state.status.lastSyncAt?.toISOString(),
      };
      localStorage.setItem('mindlight_sync_state', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save sync state:', error);
    }
  }

  /**
   * Setup event listeners for online/offline detection
   */
  private setupEventListeners(): void {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    window.addEventListener('online', () => {
      this.state.status.isOnline = true;
      this.notifyListeners();
      
      // Trigger sync if enabled and user is logged in
      if (this.state.isEnabled) {
        this.triggerSync();
      }
    });

    window.addEventListener('offline', () => {
      this.state.status.isOnline = false;
      this.notifyListeners();
    });

    // Listen for page visibility changes to pause/resume sync
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseBackgroundSync();
      } else if (this.state.isEnabled) {
        // Note: We can't get userId here, so we'll skip resume for now
        // In a real implementation, we'd store the userId in the state
        console.log('Page visible - sync would resume if userId available');
      }
    });
  }

  /**
   * Enable sync for user
   * @param userId - User ID from Supabase auth
   */
  enableSync(userId: string): void {
    this.state.isEnabled = true;
    this.saveState();
    this.startBackgroundSync(userId);
    this.notifyListeners();
  }

  /**
   * Disable sync
   */
  disableSync(): void {
    this.state.isEnabled = false;
    this.pauseBackgroundSync();
    this.saveState();
    this.notifyListeners();
  }

  /**
   * Start background sync (every 3 minutes)
   * @param userId - User ID from Supabase auth
   */
  private startBackgroundSync(userId: string): void {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
    }

    // Initial sync
    this.triggerSync(userId);

    // Schedule periodic sync every 3 minutes
    this.state.intervalId = window.setInterval(() => {
      this.triggerSync(userId);
    }, 3 * 60 * 1000); // 3 minutes
  }

  /**
   * Pause background sync
   */
  private pauseBackgroundSync(): void {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }
  }

  /**
   * Resume background sync
   * @param userId - User ID from Supabase auth
   */
  private resumeBackgroundSync(userId: string): void {
    if (this.state.isEnabled && !this.state.intervalId) {
      this.startBackgroundSync(userId);
    }
  }

  /**
   * Trigger manual sync
   * @param userId - User ID from Supabase auth
   */
  async triggerSync(userId?: string): Promise<void> {
    if (!userId || !this.state.isEnabled || !this.state.status.isOnline) {
      return;
    }

    try {
      this.state.status.isSyncing = true;
      this.notifyListeners();

      await syncService.scheduleSync(userId);
      
      // Update status from sync service
      this.state.status = syncService.getSyncStatus();
      this.saveState();
    } catch (error) {
      console.error('Sync trigger failed:', error);
    } finally {
      this.state.status.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Get current sync state
   * @returns SyncState - Current sync state
   */
  getState(): SyncState {
    return { ...this.state };
  }

  /**
   * Get current sync status
   * @returns SyncStatus - Current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.state.status };
  }

  /**
   * Check if sync is enabled
   * @returns boolean - True if sync is enabled
   */
  isEnabled(): boolean {
    return this.state.isEnabled;
  }

  /**
   * Add listener for sync status changes
   * @param listener - Function to call when status changes
   * @returns Function - Unsubscribe function
   */
  addListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state.status);
      } catch (error) {
        console.error('Sync status listener error:', error);
      }
    });
  }

  /**
   * Update pending changes count
   * @param count - Number of pending changes
   */
  updatePendingChanges(count: number): void {
    this.state.status.pendingChanges = count;
    this.notifyListeners();
  }

  /**
   * Get time since last sync
   * @returns string - Human-readable time since last sync
   */
  getTimeSinceLastSync(): string {
    if (!this.state.status.lastSyncAt) {
      return 'Never';
    }

    const now = new Date();
    const diffMs = now.getTime() - this.state.status.lastSyncAt.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  }
}

// Export singleton instance
let syncStateManagerInstance: SyncStateManager | null = null;

export const syncStateManager = {
  get instance() {
    if (!syncStateManagerInstance) {
      syncStateManagerInstance = new SyncStateManager();
    }
    return syncStateManagerInstance;
  }
};
