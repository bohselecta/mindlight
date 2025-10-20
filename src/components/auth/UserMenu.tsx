'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { syncStateManager } from '@/lib/sync/sync-state';
import { User, LogOut, Settings, RefreshCw, Clock } from 'lucide-react';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className = '' }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState(syncStateManager.instance.getStatus());

  // Subscribe to sync status changes
  useState(() => {
    const unsubscribe = syncStateManager.instance.addListener(setSyncStatus);
    return unsubscribe;
  });

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    syncStateManager.instance.disableSync();
    setIsOpen(false);
  };

  const handleManualSync = async () => {
    await syncStateManager.instance.triggerSync(user.id);
  };

  const getSyncStatusText = () => {
    if (syncStatus.isSyncing) {
      return 'Syncing...';
    }
    if (!syncStateManager.instance.isEnabled()) {
      return 'Sync disabled';
    }
    if (!syncStatus.isOnline) {
      return 'Offline';
    }
    return syncStateManager.instance.getTimeSinceLastSync();
  };

  const getSyncStatusColor = () => {
    if (syncStatus.isSyncing) {
      return 'text-blue-600';
    }
    if (!syncStateManager.instance.isEnabled()) {
      return 'text-slate-500';
    }
    if (!syncStatus.isOnline) {
      return 'text-red-600';
    }
    return 'text-green-600';
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-slate-900">
            {user.email}
          </div>
          <div className={`text-xs ${getSyncStatusColor()}`}>
            {getSyncStatusText()}
          </div>
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
            <div className="p-2">
              {/* User info */}
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-sm font-medium text-slate-900">
                  {user.email}
                </div>
                <div className="text-xs text-slate-500">
                  Signed in with magic link
                </div>
              </div>

              {/* Sync status */}
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-700">Sync Status</span>
                  </div>
                  <span className={`text-xs ${getSyncStatusColor()}`}>
                    {getSyncStatusText()}
                  </span>
                </div>
                
                {syncStateManager.instance.isEnabled() && syncStatus.isOnline && (
                  <button
                    onClick={handleManualSync}
                    disabled={syncStatus.isSyncing}
                    className="mt-2 w-full text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                )}
              </div>

              {/* Menu items */}
              <div className="py-1">
                <a
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile & Settings
                </a>
                
                <a
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </a>
              </div>

              {/* Sign out */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
