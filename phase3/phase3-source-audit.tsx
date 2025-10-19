import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Users, Calendar, TrendingUp, BookOpen } from 'lucide-react';

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

export default function SourceAudit() {
  const [stage, setStage] = useState<'intro' | 'audit' | 'insights' | 'history'>('intro');
  const [currentEntry, setCurrentEntry] = useState<Partial<AuditEntry>>({
    certaintyBefore: 7,
    whoBenefits: []
  });
  const [auditHistory, setAuditHistory] = useState<AuditEntry[]>([]);

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

  const toggleBeneficiary = (option: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      whoBenefits: prev.whoBenefits?.includes(option)
        ? prev.whoBenefits.filter(b => b !== option)
        : [...(prev.whoBenefits || []), option]
    }));
  };

  const saveAudit = () => {
    const entry: AuditEntry = {
      id: Date.now().toString(),
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

    setAuditHistory(prev => [entry, ...prev]);
    setStage('insights');
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

    // Who are the recurring sources?
    const sourceCounts: Record<string, number> = {};
    auditHistory.forEach(entry => {
      const source = entry.whoHeardFrom.toLowerCase();
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const topSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([source]) => source);

    // Who benefits most frequently?
    const beneficiaryCounts: Record<string, number> = {};
    auditHistory.forEach(entry => {
      entry.whoBenefits.forEach(b => {
        beneficiaryCounts[b] = (beneficiaryCounts[b] || 0) + 1;
      });
    });

    const beneficiaryPatterns = Object.entries(beneficiaryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([b]) => b);

    // Evidence gap: how many beliefs have "not checked" evidence?
    const uncheckedCount = auditHistory.filter(entry =>
      entry.evidenceChecked.toLowerCase().includes('not checked') ||
      entry.evidenceChecked.toLowerCase().includes('haven\'t') ||
      entry.evidenceChecked.length < 20
    ).length;

    const evidenceGaps = Math.round((uncheckedCount / auditHistory.length) * 100);

    // Dependency level: high if >60% of beliefs come from <3 sources
    const totalSources = Object.keys(sourceCounts).length;
    const topThreeCount = Object.values(sourceCounts).slice(0, 3).reduce((a, b) => a + b, 0);
    const concentrationRatio = topThreeCount / auditHistory.length;

    const dependencyLevel = concentrationRatio > 0.6 ? 'high' :
                           concentrationRatio > 0.4 ? 'moderate' : 'low';

    return {
      dependencyLevel,
      topSources,
      beneficiaryPatterns,
      evidenceGaps
    };
  };

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
                placeholder="e.g., 'Joe Rogan', 'NYT article by X', 'my colleague Sarah'"
              />

              <label className="block text-sm text-slate-400 mb-2">
                Roughly when? (timeframe)
              </label>
              <input
                type="text"
                value={currentEntry.whenHeardIt || ''}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, whenHeardIt: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="e.g., '6 months ago', 'last year', 'childhood'"
              />
            </div>

            {/* Question 2: Cui bono */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                <label className="block text-sm text-slate-200">
                  Who benefits if you believe this? (select all that apply)
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {beneficiaryOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => toggleBeneficiary(option)}
                    className={`p-3 rounded-xl border-2 text-sm transition-all text-left ${
                      currentEntry.whoBenefits?.includes(option)
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-200'
                        : 'border-slate-600 hover:border-slate-500 text-slate-400'
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
                <BookOpen className="w-5 h-5 text-teal-400" />
                <label className="block text-sm text-slate-200">
                  What evidence have you personally checked?
                </label>
              </div>
              <textarea
                value={currentEntry.evidenceChecked || ''}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, evidenceChecked: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors min-h-24 resize-none"
                placeholder="e.g., 'Read the original study', 'Checked 3 sources', 'Haven't checked—trusting the source'"
              />
              <p className="text-xs text-slate-500 mt-2">
                Be honest. "I haven't checked" is a valid answer—it's data.
              </p>
            </div>

            {/* After-certainty */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <label className="block text-sm text-slate-400 mb-3">
                After reflecting on provenance, how certain are you now? (1-10)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentEntry.certaintyAfter || currentEntry.certaintyBefore}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, certaintyAfter: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-2xl font-light text-slate-200 w-12 text-center">
                  {currentEntry.certaintyAfter}
                </span>
              </div>
              
              {currentEntry.certaintyAfter !== undefined && 
               currentEntry.certaintyAfter < (currentEntry.certaintyBefore || 7) && (
                <div className="bg-teal-900/20 border border-teal-700/30 rounded-xl p-3 mt-4">
                  <p className="text-sm text-teal-300">
                    Your certainty dropped by {(currentEntry.certaintyBefore || 7) - currentEntry.certaintyAfter} points. 
                    That's source awareness in action.
                  </p>
                </div>
              )}
            </div>

            {/* Optional insight notes */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <label className="block text-sm text-slate-400 mb-3">
                Any insights? (optional)
              </label>
              <textarea
                value={currentEntry.insightNotes || ''}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, insightNotes: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors min-h-20 resize-none"
                placeholder="e.g., 'Realized I'm trusting one source for all my views on this topic'"
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
              disabled={!currentEntry.belief || !currentEntry.firstHeard || !currentEntry.whoHeardFrom}
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
    const hasEnoughData = auditHistory.length >= 7;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-3xl mx-auto pt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-2">Audit Complete</h2>
            <p className="text-slate-400">Source awareness insight</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Today's Entry</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500">Belief:</span>
                <p className="text-slate-300 mt-1">{auditHistory[0]?.belief}</p>
              </div>
              <div>
                <span className="text-slate-500">Source:</span>
                <p className="text-slate-300 mt-1">
                  {auditHistory[0]?.whoHeardFrom} ({auditHistory[0]?.whenHeardIt})
                </p>
              </div>
              {auditHistory[0]?.whoBenefits.length > 0 && (
                <div>
                  <span className="text-slate-500">Benefits:</span>
                  <p className="text-slate-300 mt-1">
                    {auditHistory[0]?.whoBenefits.join(', ')}
                  </p>
                </div>
              )}
              <div>
                <span className="text-slate-500">Certainty shift:</span>
                <p className="text-slate-300 mt-1">
                  {auditHistory[0]?.certaintyBefore} → {auditHistory[0]?.certaintyAfter}
                  {auditHistory[0]?.certaintyAfter < auditHistory[0]?.certaintyBefore && (
                    <span className="text-teal-400 ml-2">↓ Awareness increased</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {hasEnoughData ? (
            <div className="space-y-6 mb-8">
              <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 border border-teal-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-teal-200 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Pattern Analysis ({auditHistory.length} audits)
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-2">Source Dependency</div>
                    <div className={`text-2xl font-light ${
                      patterns.dependencyLevel === 'high' ? 'text-amber-400' :
                      patterns.dependencyLevel === 'moderate' ? 'text-blue-400' : 'text-emerald-400'
                    }`}>
                      {patterns.dependencyLevel.charAt(0).toUpperCase() + patterns.dependencyLevel.slice(1)}
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-2">Evidence Gaps</div>
                    <div className={`text-2xl font-light ${
                      patterns.evidenceGaps > 60 ? 'text-amber-400' :
                      patterns.evidenceGaps > 30 ? 'text-blue-400' : 'text-emerald-400'
                    }`}>
                      {patterns.evidenceGaps}%
                    </div>
                  </div>
                </div>

                {patterns.topSources.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-slate-400 mb-2">Top Sources:</div>
                    <div className="flex flex-wrap gap-2">
                      {patterns.topSources.map(source => (
                        <span key={source} className="px-3 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full text-xs text-teal-300">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {patterns.beneficiaryPatterns.length > 0 && (
                  <div>
                    <div className="text-sm text-slate-400 mb-2">Common Beneficiaries:</div>
                    <div className="flex flex-wrap gap-2">
                      {patterns.beneficiaryPatterns.map(b => (
                        <span key={b} className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs text-cyan-300">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {patterns.dependencyLevel === 'high' && (
                <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4">
                  <p className="text-sm text-amber-300 leading-relaxed">
                    <strong className="text-amber-200">Notice:</strong> Over 60% of your audited 
                    beliefs come from 3 or fewer sources. This suggests high intellectual dependency—
                    you're outsourcing a lot of judgment to a small circle.
                  </p>
                </div>
              )}

              {patterns.evidenceGaps > 50 && (
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
                  <p className="text-sm text-blue-300 leading-relaxed">
                    <strong className="text-blue-200">Pattern:</strong> {patterns.evidenceGaps}% 
                    of your beliefs rest on unchecked evidence. You're trusting sources rather than 
                    verifying claims. This is efficient but epistemically risky.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8 text-center">
              <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">
                Pattern analysis available after 7+ audits
              </p>
              <p className="text-sm text-slate-500 mt-2">
                ({auditHistory.length}/7 completed)
              </p>
            </div>
          )}

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-medium text-slate-200 mb-3">What This Reveals</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Source Audit isn't about changing your beliefs—it's about <strong>knowing their 
              provenance</strong>. Intellectual independence requires awareness of dependencies. 
              If you can't name where ideas came from, you're not thinking—you're echoing.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setStage('intro');
                setCurrentEntry({ certaintyBefore: 7, whoBenefits: [] });
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Done
            </button>
            <button
              onClick={() => setStage('history')}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-teal-500/20"
            >
              View All Audits →
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
          <h2 className="text-2xl font-light mb-8">Audit History</h2>

          <div className="space-y-4 mb-8">
            {auditHistory.map(entry => (
              <div key={entry.id} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-sm text-slate-500 mb-1">
                      {entry.date.toLocaleDateString()}
                    </div>
                    <div className="text-slate-200 font-medium">
                      {entry.belief}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Certainty</div>
                    <div className="text-sm text-slate-300">
                      {entry.certaintyBefore} → {entry.certaintyAfter}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Source:</span>
                    <p className="text-slate-400 mt-1">{entry.whoHeardFrom}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Benefits:</span>
                    <p className="text-slate-400 mt-1">
                      {entry.whoBenefits.slice(0, 2).join(', ')}
                      {entry.whoBenefits.length > 2 && ' +' + (entry.whoBenefits.length - 2)}
                    </p>
                  </div>
                </div>

                {entry.insightNotes && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <span className="text-slate-500 text-xs">Insight:</span>
                    <p className="text-slate-400 text-sm mt-1 italic">
                      "{entry.insightNotes}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setStage('intro')}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
