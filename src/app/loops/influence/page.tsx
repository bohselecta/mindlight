'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Network } from 'lucide-react';

/**
 * Influence Map - Information Provenance Visualization
 * 
 * Helps users:
 * - Map their information sources and detect echo chamber patterns
 * - Understand homophily in their information diet
 * - Develop source awareness for epistemic autonomy
 */

export default function InfluenceMapPage() {
  const router = useRouter();
  const [stage, setStage] = useState<'intro'>('intro');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto pt-12 px-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Network className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-light text-slate-100 mb-4">Influence Map</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Where do your beliefs actually come from?
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-medium text-slate-200">What you'll discover</h2>
            <p className="text-slate-400 leading-relaxed">
              Most people underestimate how homogeneous their information diet is. This exercise maps 
              your sources and reveals echo chamber patterns you might not notice day-to-day.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-xl p-4">
                <div className="text-2xl text-cyan-400 mb-1">📊</div>
                <div className="text-sm text-cyan-300">Source diversity score</div>
              </div>
              <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-xl p-4">
                <div className="text-2xl text-cyan-400 mb-1">🔍</div>
                <div className="text-sm text-cyan-300">Homophily detection</div>
              </div>
            </div>
          </div>

          <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-xl p-4">
            <p className="text-sm text-cyan-300 leading-relaxed">
              <strong className="text-cyan-200">Privacy note:</strong> Your sources stay on your device. 
              We're showing you patterns, not judging content.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-slate-400 mb-8">This module is being updated. Please check back soon!</p>
          <button
            onClick={() => router.push('/')}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-3 rounded-xl font-medium transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}