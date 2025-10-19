'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { syncStateManager } from '@/lib/sync/sync-state';
import { syncService } from '@/lib/sync/sync-service';
import { keyStore } from '@/lib/crypto/keystore';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Download, 
  Trash2, 
  RefreshCw, 
  Settings,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState(syncStateManager.getStatus());
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // Not found error
          throw error;
        }

        setProfile(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();

    // Subscribe to sync status changes
    const unsubscribe = syncStateManager.addListener(setSyncStatus);
    return unsubscribe;
  }, [user, supabase]);

  const handleManualSync = async () => {
    if (!user) return;

    setIsSyncing(true);
    setError('');

    try {
      await syncStateManager.triggerSync(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      const data = await syncService.exportLocalData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindlight-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete user data from Supabase (this will cascade delete all related data)
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) {
        throw error;
      }

      // Sign out and redirect
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account deletion failed');
    }
  };

  const getSyncStatusText = () => {
    if (isSyncing) {
      return 'Syncing...';
    }
    if (!syncStateManager.isEnabled()) {
      return 'Sync disabled';
    }
    if (!syncStatus.isOnline) {
      return 'Offline';
    }
    return syncStateManager.getTimeSinceLastSync();
  };

  const getSyncStatusColor = () => {
    if (isSyncing) {
      return 'text-blue-600';
    }
    if (!syncStateManager.isEnabled()) {
      return 'text-slate-500';
    }
    if (!syncStatus.isOnline) {
      return 'text-red-600';
    }
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Not signed in</h1>
          <a href="/auth/signin" className="text-blue-600 hover:text-blue-700">
            Sign in to view your profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img src="/hero-logo.svg" alt="Mindlight" className="h-8" />
            <h1 className="text-3xl font-bold text-slate-900">Profile & Settings</h1>
          </div>
          <p className="text-slate-600">
            Manage your account, sync settings, and data export options.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{user.email}</div>
                    <div className="text-sm text-slate-500">Email address</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">Magic Link Authentication</div>
                    <div className="text-sm text-slate-500">Signed in with email link</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-slate-500">Account created</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sync Status */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Sync Status
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {syncStateManager.isEnabled() ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-500" />
                    )}
                    <span className="font-medium text-slate-900">
                      {syncStateManager.isEnabled() ? 'Sync Enabled' : 'Sync Disabled'}
                    </span>
                  </div>
                  <span className={`text-sm ${getSyncStatusColor()}`}>
                    {getSyncStatusText()}
                  </span>
                </div>

                {syncStateManager.isEnabled() && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleManualSync}
                      disabled={isSyncing || !syncStatus.isOnline}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Data Management
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">Export Data</div>
                    <div className="text-sm text-slate-500">Download your local data as JSON</div>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">Delete Account</div>
                    <div className="text-sm text-slate-500">Permanently delete your account and all data</div>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Privacy Notice */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Your Privacy</h3>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Your data is encrypted on your device before sync. We can't read your assessments, progress, or personal information.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/settings"
                  className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </a>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
