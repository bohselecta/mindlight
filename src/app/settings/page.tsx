'use client';

import React, { useState } from 'react';
import { useExport } from '@/lib/hooks/useAutonomy';
import { createAutonomyStore } from '@/lib/store/autonomy-store';
import { useRouter } from 'next/navigation';
import { Download, Trash2, Shield, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { exportData, exportCSV } = useExport();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reflector-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csv = await exportCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reflector-scores-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async () => {
    try {
      const store = createAutonomyStore();
      await store.clearData();
      setShowClearConfirm(false);
      router.push('/');
    } catch (error) {
      console.error('Clear data failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light mb-2">Settings</h1>
          <p className="text-slate-400">Manage your data and preferences</p>
        </div>

        {/* Data Export */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-medium mb-4 text-slate-200 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-400" />
            Data Export
          </h2>
          <p className="text-slate-400 mb-6">
            Download your complete assessment data and progress history.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={handleExportJSON}
              disabled={isExporting}
              className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-xl transition-all disabled:opacity-50"
            >
              <Download className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <div className="text-sm font-medium text-slate-200">Export JSON</div>
                <div className="text-xs text-slate-500">Complete data with metadata</div>
              </div>
            </button>
            
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-xl transition-all disabled:opacity-50"
            >
              <Download className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <div className="text-sm font-medium text-slate-200">Export CSV</div>
                <div className="text-xs text-slate-500">Scores for analysis</div>
              </div>
            </button>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-medium mb-4 text-slate-200 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Privacy & Security
          </h2>
          
          <div className="space-y-4">
            <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4">
              <h3 className="text-sm font-medium text-emerald-200 mb-2">Local-First Storage</h3>
              <p className="text-sm text-emerald-300/80">
                All your data is stored locally in your browser. Nothing is sent to external servers 
                unless you explicitly export it.
              </p>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
              <h3 className="text-sm font-medium text-blue-200 mb-2">No Tracking</h3>
              <p className="text-sm text-blue-300/80">
                We don't use analytics, cookies, or any tracking technologies. Your privacy is protected by design.
              </p>
            </div>
            
            <div className="bg-violet-900/20 border border-violet-700/30 rounded-xl p-4">
              <h3 className="text-sm font-medium text-violet-200 mb-2">Data Ownership</h3>
              <p className="text-sm text-violet-300/80">
                You own your data completely. Export it anytime, delete it anytime. No questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* Clear Data */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-medium mb-4 text-slate-200 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-400" />
            Clear All Data
          </h2>
          <p className="text-slate-400 mb-6">
            Permanently delete all your assessment data, progress, and settings. This action cannot be undone.
          </p>
          
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 rounded-xl transition-all"
            >
              Clear All Data
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-200 mb-2">Are you absolutely sure?</h3>
                    <p className="text-sm text-red-300/80">
                      This will permanently delete all your assessment responses, progress data, 
                      streak information, and settings. You cannot recover this data.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleClearData}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all"
                >
                  Yes, Delete Everything
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* About */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-medium mb-4 text-slate-200 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            About Reflector
          </h2>
          
          <div className="space-y-4 text-slate-300">
            <p>
              Reflector is a self-guided metacognitive training suite designed to help you develop 
              epistemic autonomy—the ability to form and maintain beliefs based on evidence rather 
              than social pressure or authority.
            </p>
            
            <p>
              Built on evidence from Schema Therapy, Motivational Interviewing, Social Identity Theory, 
              and cognitive psychology research on belief formation and bias.
            </p>
            
            <div className="bg-slate-700/30 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-200 mb-2">Research Foundations</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Young, J. E. (2003). Schema therapy: A practitioner's guide</li>
                <li>• Miller, W. R., & Rollnick, S. (2013). Motivational interviewing</li>
                <li>• Tajfel, H., & Turner, J. C. (1979). Social identity theory</li>
                <li>• Kahneman, D. (2011). Thinking, fast and slow</li>
              </ul>
            </div>
            
            <p className="text-sm text-slate-500">
              <strong>Disclaimer:</strong> This tool is for educational and self-reflection purposes only. 
              It is not a substitute for professional therapy or clinical assessment.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          <p>Evidence over echo. Curiosity over certainty.</p>
          <p className="mt-1">Reflector v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
