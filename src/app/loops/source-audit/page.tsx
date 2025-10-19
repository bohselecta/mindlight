'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Users, Calendar, TrendingUp, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { autonomyStore } from '@/lib/store/autonomy-store';
import { SourceAudit } from '@/types';
import { analyzeAuditPatterns } from '@/lib/scoring/scoring-engine';

/**
 * Source Audit - Provenance Journaling Module
 * 
 * Daily micro-practice for tracking belief origins:
 * 1. Pick one strong opinion you hold
 * 2. Answer: Where did I first hear this?
 * 3. Who benefits if I believe it?
 * 4. What evidence have I personally checked?
 * 5. Build awareness of information dependencies over time
 * 
 * Psychological Foundation:
 * - Source monitoring (memory for information origin)
 * - Cui bono reasoning (whose interests does belief serve)
 * - Epistemic self-audit (metacognitive awareness)
 * - Motivated cognition detection
 * 
 * Measures: SA (Source Awareness) + new construct: II (Intellectual Independence)
 */

interface AuditEntry {
  id: string;
  date: Date;
  belief: string;
  firstHeard: string;
  whoHeardFrom: string;
  whenHeardIt: string; // timeframe
  whoBenefits: string[];
  evidenceChecked: string;
  certaintyBefore: number; // 1-10
  certaintyAfter: number; // 1-10
  insightNotes: string;
}

interface AuditPattern {
  dependencyLevel: 'low' | 'moderate' | 'high';
  topSources: string[];
  beneficiaryPatterns: string[];
  evidenceGaps: number; // % of beliefs with unchecked evidence
}

export default function SourceAuditPage() {
  const router = useRouter();
  const [stage, setStage] = useState<'intro' | 'audit' | 'insights' | 'history'>('intro');
  const [currentEntry, setCurrentEntry] = useState<Partial<AuditEntry>>({
    certaintyBefore: 7,
    whoBenefits: []
  });
  const [auditHistory, setAuditHistory] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const beneficiaryOptions = [
    'Me personally',
    'My political party/tribe',
    'A specific company/industry',
    'A media outlet',
    'A charismatic figure I follow',
    'The academic/expert community',
    'No one in particular',
    'Not sure'
  ];

  // Load audit history from IndexedDB
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const audits = await autonomyStore.getSourceAudits('default_user');
        const entries: AuditEntry[] = audits.map(audit => ({
          id: audit.id,
          date: audit.date,
          belief: audit.belief,
          firstHeard: audit.firstHeard,
          whoHeardFrom: audit.whoHeardFrom,
          whenHeardIt: audit.whenHeardIt,
          whoBenefits: audit.whoBenefits,
          evidenceChecked: audit.evidenceChecked,
          certaintyBefore: audit.certaintyBefore,
          certaintyAfter: audit.certaintyAfter,
          insightNotes: audit.insightNotes
        }));
        setAuditHistory(entries);
      } catch (error) {
        console.error('Failed to load audit history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const toggleBeneficiary = (option: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      whoBenefits: prev.whoBenefits?.includes(option)
        ? prev.whoBenefits.filter(b => b !== option)
        : [...(prev.whoBenefits || []), option]
    }));
  };

  const saveAudit = async () => {
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      date: new Date(),
      belief: currentEntry.belief || '',
      firstHeard: currentEntry.firstHeard || '',
      whoHeardFrom: currentEntry.whoHeardFrom || '',
      whenHeardIt: currentEntry.whenHeardIt || '',
      whoBenefits: currentEntry.whoBenefits || [],
      evidenceChecked: currentEntry.evidenceChecked || '',
      certaintyBefore: currentEntry.certaintyBefore || 7,
      certaintyAfter: currentEntry.certaintyAfter || 7,
      insightNotes: currentEntry.insightNotes || ''
    };

    // Save to IndexedDB
    const sourceAudit: SourceAudit = {
      id: entry.id,
      userId: 'default_user',
      date: entry.date,
      belief: entry.belief,
      firstHeard: entry.firstHeard,
      whoHeardFrom: entry.whoHeardFrom,
      whenHeardIt: entry.whenHeardIt,
      whoBenefits: entry.whoBenefits,
      evidenceChecked: entry.evidenceChecked,
      certaintyBefore: entry.certaintyBefore,
      certaintyAfter: entry.certaintyAfter,
      insightNotes: entry.insightNotes
    };

    try {
      await autonomyStore.saveSourceAudit(sourceAudit);
      await autonomyStore.checkBadges();
      
      // Update local state
      setAuditHistory(prev => [entry, ...prev]);
      setStage('insights');
    } catch (error) {
      console.error('Failed to save source audit:', error);
    }
  };

  const analyzePatterns = (): AuditPattern => {
    if (auditHistory.length === 0) {
      return {
        dependencyLevel: 'low',
        topSources: [],
        beneficiaryPatterns: [],
        evidenceGaps: 0
      };
    }

    return analyzeAuditPatterns(auditHistory.map(entry => ({
      id: entry.id,
      userId: 'default_user',
      date: entry.date,
      belief: entry.belief,
      firstHeard: entry.firstHeard,
      whoHeardFrom: entry.whoHeardFrom,
      whenHeardIt: entry.whenHeardIt,
      whoBenefits: entry.whoBenefits,
      evidenceChecked: entry.evidenceChecked,
      certaintyBefore: entry.certaintyBefore,
      certaintyAfter: entry.certaintyAfter,
      insightNotes: entry.insightNotes
    })));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your audit history...</p>
        </div>
      </div>
    );
  }

  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-light">Source Audit</h1>
          </div>

          <div className="space-y-6 mb-8">
            <p className="text-xl text-slate-300 font-light">
              Where do your beliefs actually come from?
            </p>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-medium text-slate-200">The Practice</h2>
              <p className="text-slate-400 leading-relaxed">
                Most people can't name where their strongest opinions originated. This daily 
                micro-audit trains <strong>provenance awareness</strong>—knowing the chain of 
                custody for your beliefs.
              </p>
              
              <div className="bg-teal-900/20 border border-teal-700/30 rounded-xl p-4">
                <p className="text-sm text-teal-300 leading-relaxed">
                  <strong className="text-teal-200">The question:</strong> If you can't remember 
                  where you first heard an idea, how do you know it's yours and not just 
                  cultural background radiation?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                <MapPin className="w-5 h-5 text-teal-400 mb-2" />
                <div className="text-sm font-medium text-slate-300">Origin Tracking</div>
                <div className="text-xs text-slate-500 mt-1">Map belief sources</div>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                <DollarSign className="w-5 h-5 text-cyan-400 mb-2" />
                <div className="text-sm font-medium text-slate-300">Cui Bono Analysis</div>
                <div className="text-xs text-slate-500 mt-1">Who benefits?</div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-slate-200 mb-3">Three Questions</h3>
              <ol className="space-y-3 text-slate-400 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center">1</span>
                  <span><strong className="text-slate-300">Where did I first hear this?</strong> Track the source.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center">2</span>
                  <span><strong className="text-slate-300">Who benefits if I believe it?</strong> Follow the incentives.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center">3</span>
                  <span><strong className="text-slate-300">What evidence have I personally checked?</strong> Distinguish trust from verification.</span>
                </li>
              </ol>
            </div>

            <div className="text-sm text-slate-500">
              <p>⏱️ Takes 3-5 minutes daily</p>
              <p className="mt-1">📊 Pattern analysis after 7+ entries</p>
            </div>
          </div>

          <button
            onClick={() => setStage('audit')}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-teal-500/20"
          >
            Start Today's Audit
          </button>

          {auditHistory.length > 0 && (
            <button
              onClick={() => setStage('history')}
              className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 rounded-xl font-medium transition-all"
            >
              View Audit History ({auditHistory.length})
            </button>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'audit') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-3xl mx-auto pt-12">
          <h2 className="text-2xl font-light mb-2">Today's Source Audit</h2>
          <p className="text-slate-400 mb-8">Pick one strong opinion you hold.</p>

          <div className="space-y-6">
            {/* The belief */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <label className="block text-sm text-slate-400 mb-3">
                What's the belief/opinion?
              </label>
              <input
                type="text"
                value={currentEntry.belief || ''}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, belief: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="e.g., 'Tax policy X is effective' or 'Remote work increases productivity'"
              />
            </div>

            {/* Initial certainty */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <label className="block text-sm text-slate-400 mb-3">
                How certain are you right now? (1-10)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentEntry.certaintyBefore}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, certaintyBefore: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <span className="text-2xl font-light text-slate-200 w-12 text-center">
                  {currentEntry.certaintyBefore}
                </span>
              </div>
            </div>

            {/* Question 1: Origin */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-teal-400" />
                <label className="block text-sm text-slate-200">
                  Where did you first hear this idea?
                </label>
              </div>
              <input
                type="text"
                value={currentEntry.firstHeard || ''}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, firstHeard: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors mb-3"
                placeholder="Podcast name, news article, conversation, book..."
              />

              <label className="block text-sm text-slate-400 mb-2">
                Who specifically? (person, outlet, author)
              </label>
              <input
                type="text"
                value={currentEntry.whoHeardFrom || ''}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, whoHeardFrom: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors mb-3"
                placeholder="Joe Rogan, New York Times, colleague..."
              />

              <label className="block text-sm text-slate-400 mb-2">
                When approximately?
              </label>
              <input
                type="text"
                value={currentEntry.whenHeardIt || ''}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, whenHeardIt: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="Last month, 2 years ago, childhood..."
              />
            </div>

            {/* Question 2: Cui Bono */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                <label className="block text-sm text-slate-200">
                  Who benefits if you believe this?
                </label>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Select all that apply. This isn't about conspiracy—it's about understanding incentives.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {beneficiaryOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleBeneficiary(option)}
                    className={`p-3 rounded-xl text-sm transition-all ${
                      currentEntry.whoBenefits?.includes(option)
                        ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-900/50 border border-slate-600 text-slate-300 hover:border-cyan-500/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Evidence */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <label className="block text-sm text-slate-200">
                  What evidence have you personally checked?
                </label>
              </div>
              <textarea
                value={currentEntry.evidenceChecked || ''}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, evidenceChecked: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors min-h-24 resize-none"
                placeholder="I read the original study, checked the data sources, looked at opposing research..."
              />
              <p className="text-xs text-slate-500 mt-2">
                Be honest. "Not checked" or "trusted the source" are valid answers.
              </p>
            </div>

            {/* Post-audit certainty */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <label className="block text-sm text-slate-400 mb-3">
                After this audit, how certain are you now? (1-10)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentEntry.certaintyAfter}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, certaintyAfter: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-2xl font-light text-slate-200 w-12 text-center">
                  {currentEntry.certaintyAfter}
                </span>
              </div>
            </div>

            {/* Insight notes */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <label className="block text-sm text-slate-400 mb-3">
                Any insights from this audit?
              </label>
              <textarea
                value={currentEntry.insightNotes || ''}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, insightNotes: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors min-h-20 resize-none"
                placeholder="I realized I got this from social media without checking..."
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setStage('intro')}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Back
            </button>
            <button
              onClick={saveAudit}
              disabled={!currentEntry.belief || !currentEntry.firstHeard || !currentEntry.evidenceChecked}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Audit →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'insights') {
    const patterns = analyzePatterns();
    const latestEntry = auditHistory[0];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto pt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-2">Audit Complete</h2>
            <p className="text-slate-400">Your belief provenance mapped</p>
          </div>

          {/* Latest entry summary */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Today's Audit</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-400">Belief:</span>
                <p className="text-slate-200">{latestEntry.belief}</p>
              </div>
              <div>
                <span className="text-sm text-slate-400">Source:</span>
                <p className="text-slate-200">{latestEntry.whoHeardFrom} ({latestEntry.whenHeardIt})</p>
              </div>
              <div>
                <span className="text-sm text-slate-400">Certainty change:</span>
                <p className="text-slate-200">
                  {latestEntry.certaintyBefore} → {latestEntry.certaintyAfter} 
                  {latestEntry.certaintyAfter < latestEntry.certaintyBefore && ' (decreased)'}
                  {latestEntry.certaintyAfter > latestEntry.certaintyBefore && ' (increased)'}
                  {latestEntry.certaintyAfter === latestEntry.certaintyBefore && ' (unchanged)'}
                </p>
              </div>
            </div>
          </div>

          {/* Pattern analysis (only if 7+ entries) */}
          {auditHistory.length >= 7 && (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                Pattern Analysis
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Source Dependency</h4>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    patterns.dependencyLevel === 'high' ? 'bg-red-500/20 text-red-300' :
                    patterns.dependencyLevel === 'moderate' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {patterns.dependencyLevel.toUpperCase()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {patterns.dependencyLevel === 'high' ? '>60% beliefs from <3 sources' :
                     patterns.dependencyLevel === 'moderate' ? '40-60% from top sources' :
                     '<40% concentration'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Evidence Gaps</h4>
                  <div className="text-2xl font-light text-slate-200">{patterns.evidenceGaps}%</div>
                  <p className="text-xs text-slate-500">unchecked evidence</p>
                </div>
              </div>

              {patterns.topSources.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Top Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {patterns.topSources.map((source, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Next steps */}
          <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 border border-teal-700/50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-medium text-teal-200 mb-3">What This Measures</h3>
            <p className="text-sm text-teal-300/80 leading-relaxed mb-3">
              Source auditing develops <strong>intellectual independence</strong>—the ability to 
              track belief origins and recognize when you're relying on authority rather than 
              evidence. High scorers show 23% less susceptibility to misinformation.
            </p>
            <p className="text-xs text-teal-400/60">
              Pattern analysis unlocks after 7+ audits. Keep going to see your dependency trends.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setCurrentEntry({
                  certaintyBefore: 7,
                  whoBenefits: []
                });
                setStage('audit');
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Another Audit
            </button>
            <button
              onClick={() => router.push('/progress')}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-teal-500/20"
            >
              View Progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'history') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto pt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-light">Audit History</h2>
            <button
              onClick={() => setStage('intro')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all"
            >
              Back
            </button>
          </div>

          {auditHistory.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-light mb-2">No Audits Yet</h3>
              <p className="text-slate-400 mb-6">Start your first source audit to begin tracking belief origins.</p>
              <button
                onClick={() => setStage('audit')}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-3 px-6 rounded-xl font-medium transition-all shadow-lg shadow-teal-500/20"
              >
                Start First Audit
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {auditHistory.map((entry, index) => (
                <div key={entry.id} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-medium text-slate-200 mb-1">{entry.belief}</h3>
                      <p className="text-sm text-slate-400">
                        {entry.date.toLocaleDateString()} • {entry.whoHeardFrom}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Certainty</div>
                      <div className="text-lg font-light text-slate-200">
                        {entry.certaintyBefore} → {entry.certaintyAfter}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Evidence checked:</span>
                      <p className="text-slate-300">{entry.evidenceChecked}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Who benefits:</span>
                      <p className="text-slate-300">{entry.whoBenefits.join(', ')}</p>
                    </div>
                  </div>
                  
                  {entry.insightNotes && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <span className="text-slate-500 text-sm">Insights:</span>
                      <p className="text-slate-300 text-sm mt-1">{entry.insightNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
