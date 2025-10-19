'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

/**
 * Schema Reclaim - Emotional Decoupling Module
 * 
 * Based on Young's Schema Therapy, helps users:
 * - Identify emotional triggers when beliefs are challenged
 * - Practice breathing techniques to create space between trigger and response
 * - Develop affect regulation skills for epistemic autonomy
 */

export default function SchemaReclaimPage() {
  const router = useRouter();
  const [stage, setStage] = useState<'intro'>('intro');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto pt-12 px-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-light text-slate-100 mb-4">Schema Reclaim</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Decouple emotions from belief formation
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-medium text-slate-200">What you'll learn</h2>
            <p className="text-slate-400 leading-relaxed">
              When your beliefs are challenged, certain emotional patterns (schemas) can hijack your thinking. 
              This module helps you notice these triggers and reclaim autonomy.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-rose-900/20 border border-rose-700/30 rounded-xl p-4">
                <div className="text-2xl text-rose-400 mb-1">🧠</div>
                <div className="text-sm text-rose-300">Schema identification</div>
              </div>
              <div className="bg-rose-900/20 border border-rose-700/30 rounded-xl p-4">
                <div className="text-2xl text-rose-400 mb-1">💨</div>
                <div className="text-sm text-rose-300">Breathing techniques</div>
              </div>
            </div>
          </div>

          <div className="bg-rose-900/20 border border-rose-700/30 rounded-xl p-4">
            <p className="text-sm text-rose-300 leading-relaxed">
              <strong className="text-rose-200">Based on Schema Therapy:</strong> Core emotional patterns like 
              "approval-seeking" and "dependence" often align with cult susceptibility and ideological capture.
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