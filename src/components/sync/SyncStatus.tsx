'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { syncStateManager } from '@/lib/sync/sync-state';
import { CheckCircle, AlertCircle, Clock, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface SyncStatusProps {
  className?: string;
}

export function SyncStatus({ className = '' }: SyncStatusProps) {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState(syncStateManager.instance.getStatus());
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = syncStateManager.instance.addListener(setSyncStatus);
    return unsubscribe;
  }, []);

  if (!user || !syncStateManager.instance.isEnabled()) {
    return null;
  }

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      await syncStateManager.instance.triggerSync(user.id);
    } finally {
      setIsManualSyncing(false);
    }
  };

  const getStatusIcon = () => {
    if (syncStatus.isSyncing || isManualSyncing) {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
    }
    if (!syncStatus.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-600" />;
    }
    if (syncStatus.lastSyncAt) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <Clock className="w-4 h-4 text-slate-500" />;
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing || isManualSyncing) {
      return 'Syncing...';
    }
    if (!syncStatus.isOnline) {
      return 'Offline';
    }
    if (syncStatus.lastSyncAt) {
      return `All changes saved • ${syncStateManager.instance.getTimeSinceLastSync()}`;
    }
    return 'Not synced';
  };

  const getStatusColor = () => {
    if (syncStatus.isSyncing || isManualSyncing) {
      return 'text-blue-600';
    }
    if (!syncStatus.isOnline) {
      return 'text-red-600';
    }
    if (syncStatus.lastSyncAt) {
      return 'text-green-600';
    }
    return 'text-slate-500';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getStatusIcon()}
      <span className={`text-sm ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      
      {syncStatus.isOnline && !syncStatus.isSyncing && !isManualSyncing && (
        <button
          onClick={handleManualSync}
          className="ml-2 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
        >
          Sync now
        </button>
      )}
    </div>
  );
}

// Floating sync status chip component
export function FloatingSyncStatus({ className = '' }: SyncStatusProps) {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState(syncStateManager.instance.getStatus());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = syncStateManager.instance.addListener(setSyncStatus);
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Show chip when there's activity or errors
    if (syncStatus.isSyncing || (!syncStatus.isOnline && syncStateManager.instance.isEnabled())) {
      setIsVisible(true);
    } else {
      // Hide after 3 seconds of inactivity
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus.isSyncing, syncStatus.isOnline]);

  if (!user || !syncStateManager.instance.isEnabled() || !isVisible) {
    return null;
  }

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
    }
    if (!syncStatus.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-600" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) {
      return 'Syncing...';
    }
    if (!syncStatus.isOnline) {
      return 'Offline';
    }
    return 'Synced';
  };

  const getStatusColor = () => {
    if (syncStatus.isSyncing) {
      return 'bg-blue-50 border-blue-200 text-blue-800';
    }
    if (!syncStatus.isOnline) {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    return 'bg-green-50 border-green-200 text-green-800';
  };

  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      <div className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border shadow-lg
        ${getStatusColor()}
        transition-all duration-300
      `}>
        {getStatusIcon()}
        <span className="text-sm font-medium">
          {getStatusText()}
        </span>
      </div>
    </div>
  );
}
