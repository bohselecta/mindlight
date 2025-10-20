'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { syncService } from '@/lib/sync/sync-service';
import { syncStateManager } from '@/lib/sync/sync-state';
import { keyStore } from '@/lib/crypto/keystore';
import { CheckCircle, AlertCircle, Clock, RefreshCw, Shield, Database } from 'lucide-react';

interface MigrationPromptProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function MigrationPrompt({ onComplete, onSkip }: MigrationPromptProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'prompt' | 'passphrase' | 'migrating' | 'complete' | 'error'>('prompt');
  const [error, setError] = useState<string>('');
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');

  useEffect(() => {
    if (!user) {
      onSkip();
    }
  }, [user, onSkip]);

  const handleStartMigration = () => {
    setStep('passphrase');
  };

  const handlePassphraseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passphrase !== confirmPassphrase) {
      setError('Passphrases do not match');
      return;
    }
    
    if (passphrase.length < 8) {
      setError('Passphrase must be at least 8 characters');
      return;
    }

    setStep('migrating');
    setIsLoading(true);
    setError('');

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Store the passphrase in key store
      await keyStore.storeKey(user.id, passphrase);
      
      // Perform migration
      const result = await syncService.migrateOnFirstLogin(user.id);
      
      if (result.success) {
        setStep('complete');
        syncStateManager.instance.enableSync(user.id);
      } else {
        setError(result.error || 'Migration failed');
        setStep('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        {step === 'prompt' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Sync your local Mindlight data?
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                We found local data on this device. Would you like to sync it to your account for backup and cross-device access?
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-blue-900 mb-1">Your data stays private</div>
                  <div className="text-blue-700">
                    Your data is encrypted on your device before sync. We can't read your assessments or progress.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStartMigration}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all"
              >
                Sync Now
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Keep Local Only
              </button>
            </div>
          </>
        )}

        {step === 'passphrase' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Create encryption passphrase
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Choose a passphrase to encrypt your data. This ensures only you can access your information.
              </p>
            </div>

            <form onSubmit={handlePassphraseSubmit} className="space-y-4">
              <div>
                <label htmlFor="passphrase" className="block text-sm font-medium text-slate-700 mb-1">
                  Passphrase
                </label>
                <input
                  id="passphrase"
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter a secure passphrase"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassphrase" className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm passphrase
                </label>
                <input
                  id="confirmPassphrase"
                  type="password"
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your passphrase"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Encrypting...' : 'Encrypt & Sync'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('prompt')}
                  className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'migrating' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Syncing your data
              </h2>
              <p className="text-slate-600 text-sm">
                Encrypting and uploading your local data to the cloud...
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 text-sm">
                <Clock className="w-4 h-4" />
                This may take a few moments
              </div>
            </div>
          </>
        )}

        {step === 'complete' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Sync complete!
              </h2>
              <p className="text-slate-600 text-sm">
                Your data has been encrypted and synced to the cloud. You can now access it from any device.
              </p>
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-4 py-3 rounded-lg font-medium transition-all"
            >
              Continue to Mindlight
            </button>
          </>
        )}

        {step === 'error' && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Sync failed
              </h2>
              <p className="text-slate-600 text-sm mb-4">
                {error}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('passphrase')}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-all"
              >
                Try Again
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Skip Sync
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
