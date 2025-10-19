'use client';

import React, { useState, useEffect } from 'react';
import { VALUE_CARDS, VALUE_CATEGORIES } from '@/content/assessments/identity-items';
import { VennDrift } from '@/components/visualizations/VennDrift';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function IdentityMirrorPage() {
  const router = useRouter();
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [tribeExpectations, setTribeExpectations] = useState<Record<string, boolean>>({});
  const [stage, setStage] = useState<'selection' | 'expectations' | 'results'>('selection');

  const canContinue = selectedValues.length >= 3 && selectedValues.length <= 5;
  const canViewResults = Object.keys(tribeExpectations).length === selectedValues.length;

  const calculateDrift = () => {
    const aligned = selectedValues.filter(valueId => tribeExpectations[valueId] === true).length;
    const divergent = selectedValues.filter(valueId => tribeExpectations[valueId] === false).length;
    return { aligned, divergent, total: selectedValues.length };
  };

  const toggleValue = (valueId: string) => {
    setSelectedValues(prev => {
      if (prev.includes(valueId)) {
        return prev.filter(id => id !== valueId);
      } else if (prev.length < 5) {
        return [...prev, valueId];
      }
      return prev;
    });
  };

  const handleTribeExpectation = (valueId: string, expects: boolean) => {
    setTribeExpectations(prev => ({
      ...prev,
      [valueId]: expects
    }));
  };

  const drift = calculateDrift();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light mb-2">Identity Mirror</h1>
          <p className="text-slate-400">
            Separate your personal values from group expectations to identify potential drift.
          </p>
        </div>

        {stage === 'selection' && (
          <>
            {/* Step 1: Value Selection */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-medium mb-4 text-slate-200">
                Step 1: Choose your top 3-5 values
              </h2>
              <p className="text-slate-400 mb-6">
                Select the values that matter most to you personally, regardless of what others think.
              </p>

              {/* Value Categories */}
              {Object.entries(VALUE_CATEGORIES).map(([category, info]) => {
                const categoryValues = VALUE_CARDS.filter(v => v.category === category);
                const selectedInCategory = selectedValues.filter(id => 
                  categoryValues.some(v => v.id === id)
                ).length;

                return (
                  <div key={category} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-lg font-medium text-slate-300">{info.name}</h3>
                      <span className="text-sm text-slate-500">
                        ({selectedInCategory}/{categoryValues.length} selected)
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{info.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categoryValues.map(value => (
                        <button
                          key={value.id}
                          onClick={() => toggleValue(value.id)}
                          className={cn(
                            'p-4 rounded-xl border-2 transition-all text-sm text-left',
                            selectedValues.includes(value.id)
                              ? 'border-blue-500 bg-blue-500/20 text-blue-200'
                              : 'border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span>{value.name}</span>
                            {selectedValues.includes(value.id) && (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="mt-6 p-4 bg-slate-700/30 rounded-xl">
                <p className="text-sm text-slate-400">
                  Selected: {selectedValues.length}/5 values
                </p>
              </div>
            </div>

            {/* Continue Button */}
            {canContinue && (
              <button
                onClick={() => setStage('expectations')}
                className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
              >
                Continue to Step 2 →
              </button>
            )}
          </>
        )}

        {stage === 'expectations' && (
          <>
            {/* Step 2: Tribe Expectations */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-medium mb-4 text-slate-200">
                Step 2: Would your social group/tribe expect you to prioritize these?
              </h2>
              <p className="text-slate-400 mb-6">
                Think of the community you identify with most (political, professional, cultural, etc.)
              </p>

              <div className="space-y-4">
                {selectedValues.map(valueId => {
                  const value = VALUE_CARDS.find(v => v.id === valueId);
                  if (!value) return null;

                  return (
                    <div key={valueId} className="bg-slate-700/30 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-slate-300 font-medium">{value.name}</h3>
                          <p className="text-sm text-slate-500">{VALUE_CATEGORIES[value.category].name}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTribeExpectation(valueId, true)}
                            className={cn(
                              'px-4 py-2 rounded-lg text-sm transition-all',
                              tribeExpectations[valueId] === true
                                ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-200'
                                : 'border-2 border-slate-600 text-slate-400 hover:border-slate-500'
                            )}
                          >
                            Yes, they would
                          </button>
                          <button
                            onClick={() => handleTribeExpectation(valueId, false)}
                            className={cn(
                              'px-4 py-2 rounded-lg text-sm transition-all',
                              tribeExpectations[valueId] === false
                                ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-200'
                                : 'border-2 border-slate-600 text-slate-400 hover:border-slate-500'
                            )}
                          >
                            No, not really
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drift Warning */}
            {canViewResults && drift.divergent > 0 && (
              <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-700/50 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-200 mb-2">Venn Drift Detected</h4>
                    <p className="text-sm text-amber-300/80 leading-relaxed">
                      On <strong>{drift.divergent}</strong> of your core values, there's a mismatch 
                      between what you personally prioritize and what your group expects. Curious?
                    </p>
                    <p className="text-xs text-amber-400/60 mt-3">
                      This isn't good or bad—it's just worth noticing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Continue Button */}
            {canViewResults && (
              <button
                onClick={() => setStage('results')}
                className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
              >
                View Your Identity Profile →
              </button>
            )}
          </>
        )}

        {stage === 'results' && (
          <>
            {/* Results */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-light mb-2">Your Identity Profile</h2>
              <p className="text-slate-400">Personal values vs. group expectations</p>
            </div>

            {/* Venn Drift Visualization */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8">
              <VennDrift
                aligned={drift.aligned}
                divergent={drift.divergent}
                total={drift.total}
              />
            </div>

            {/* Selected Values Summary */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-medium mb-4 text-slate-200">Your Selected Values</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedValues.map(valueId => {
                  const value = VALUE_CARDS.find(v => v.id === valueId);
                  if (!value) return null;

                  const isAligned = tribeExpectations[valueId] === true;
                  const isDivergent = tribeExpectations[valueId] === false;

                  return (
                    <div
                      key={valueId}
                      className={cn(
                        'p-3 rounded-lg border-2',
                        isAligned && 'border-emerald-500 bg-emerald-500/10',
                        isDivergent && 'border-amber-500 bg-amber-500/10'
                      )}
                    >
                      <div className="text-sm font-medium text-slate-200">{value.name}</div>
                      <div className="text-xs text-slate-500">
                        {isAligned ? 'Aligned with tribe' : isDivergent ? 'Independent value' : 'Not rated'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Steps */}
            <div className="flex gap-4">
              <button
                onClick={() => setStage('selection')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
              >
                Start Over
              </button>
              <button
                onClick={() => router.push('/progress')}
                className="flex-1 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
              >
                View Progress Dashboard →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
