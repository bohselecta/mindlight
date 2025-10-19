import React, { useState } from 'react';
import { Brain, CheckCircle2, XCircle, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';

/**
 * Disconfirm Game - Cognitive Inoculation Module
 * 
 * Teaches falsifiability by having users:
 * 1. State a strong belief
 * 2. List conditions that would change their mind
 * 3. Get scored on specificity vs vagueness
 * 
 * Psychological Foundation:
 * - Popper's falsifiability criterion
 * - Cognitive inoculation against certainty addiction
 * - Metacognitive awareness of belief rigidity
 */

interface Falsifier {
  id: string;
  text: string;
  specificity: number; // 0-100, calculated by keyword analysis
}

interface BeliefEntry {
  belief: string;
  falsifiers: Falsifier[];
  overallScore: number;
  timestamp: number;
}

export default function DisconfirmGame() {
  const [stage, setStage] = useState<'intro' | 'belief' | 'falsifiers' | 'results'>('intro');
  const [belief, setBelief] = useState('');
  const [currentFalsifier, setCurrentFalsifier] = useState('');
  const [falsifiers, setFalsifiers] = useState<Falsifier[]>([]);
  const [showHint, setShowHint] = useState(false);

  // Specificity scoring based on linguistic patterns
  const scoreSpecificity = (text: string): number => {
    let score = 0;
    const lower = text.toLowerCase();

    // High-specificity indicators (quantifiable, falsifiable)
    const specificPatterns = [
      /\d+%/g,                          // Percentages: "polls show >60%"
      /\d+/g,                           // Numbers: "5 peer-reviewed studies"
      /(\$|€|£)\d+/g,                   // Monetary values
      /if.*then/gi,                     // Conditional logic
      /when.*exceeds?/gi,               // Threshold conditions
      /peer.?review/gi,                 // Academic standards
      /replicated|replication/gi,       // Scientific rigor
      /data.*shows?|evidence.*indicates?/gi,
      /specific(ally)?/gi,              // Self-awareness of specificity
      /measur(e|able|ed)/gi,            // Quantification awareness
    ];

    // Low-specificity indicators (vague, unfalsifiable)
    const vaguePatterns = [
      /nothing/gi,                      // "Nothing would change my mind"
      /never/gi,                        // Absolutism
      /always/gi,                       // Absolutism
      /everyone (knows|agrees)/gi,      // Appeal to consensus
      /common sense/gi,                 // Vague appeal
      /obvious(ly)?/gi,                 // Unexamined certainty
      /just.*(feel|know)/gi,           // Intuition over evidence
      /can't (imagine|see|think)/gi,   // Rigidity marker
    ];

    // Count specific patterns (add points)
    specificPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) score += matches.length * 15;
    });

    // Count vague patterns (subtract points)
    vaguePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) score -= matches.length * 20;
    });

    // Length bonus (detailed responses are usually more specific)
    if (text.length > 100) score += 10;
    if (text.length > 200) score += 10;

    // Sentence complexity (multiple clauses = nuance)
    const commaCount = (text.match(/,/g) || []).length;
    score += Math.min(commaCount * 5, 20);

    // Normalize to 0-100
    return Math.max(0, Math.min(100, score));
  };

  const addFalsifier = () => {
    if (!currentFalsifier.trim()) return;

    const specificity = scoreSpecificity(currentFalsifier);
    const newFalsifier: Falsifier = {
      id: Date.now().toString(),
      text: currentFalsifier,
      specificity
    };

    setFalsifiers(prev => [...prev, newFalsifier]);
    setCurrentFalsifier('');
    setShowHint(false);
  };

  const calculateOverallScore = (): number => {
    if (falsifiers.length === 0) return 0;
    
    // Average specificity across all falsifiers
    const avgSpecificity = falsifiers.reduce((sum, f) => sum + f.specificity, 0) / falsifiers.length;
    
    // Bonus for having multiple falsifiers (shows openness)
    const quantityBonus = Math.min(falsifiers.length * 5, 20);
    
    return Math.min(100, avgSpecificity + quantityBonus);
  };

  const getFeedback = (score: number) => {
    if (score >= 80) return {
      level: 'Excellent',
      message: 'Your falsifiers are specific and testable. You demonstrate high epistemic flexibility.',
      icon: CheckCircle2,
      color: 'emerald'
    };
    if (score >= 50) return {
      level: 'Good',
      message: 'You identified conditions that would change your mind. Try being even more specific about what evidence would count.',
      icon: Lightbulb,
      color: 'blue'
    };
    if (score >= 20) return {
      level: 'Developing',
      message: 'Your falsifiers are somewhat vague. Can you name specific data points, thresholds, or studies that would shift your view?',
      icon: AlertTriangle,
      color: 'amber'
    };
    return {
      level: 'Rigid',
      message: 'You may be experiencing certainty lock. Try this: "If X happened, and Y also occurred, I would reconsider."',
      icon: XCircle,
      color: 'red'
    };
  };

  const hints = [
    "Try starting with: 'If polling data showed...'",
    "Be specific: '3 peer-reviewed studies' beats 'some research'",
    "Use thresholds: 'If unemployment exceeds 8% for 2 quarters...'",
    "Conditional logic: 'If X happens AND Y doesn't, then...'",
  ];

  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-light">Disconfirm Game</h1>
          </div>

          <div className="space-y-6 mb-8">
            <p className="text-xl text-slate-300 font-light">
              Can you name what would change your mind?
            </p>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-medium text-slate-200">How it works</h2>
              <ol className="space-y-3 text-slate-400">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-sm flex items-center justify-center">1</span>
                  <span>State a belief you hold strongly</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-sm flex items-center justify-center">2</span>
                  <span>List specific conditions that would change your mind</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-sm flex items-center justify-center">3</span>
                  <span>Get scored on specificity vs. vagueness</span>
                </li>
              </ol>
            </div>

            <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-4">
              <p className="text-sm text-purple-300 leading-relaxed">
                <strong className="text-purple-200">Why this matters:</strong> Beliefs that can't be falsified aren't beliefs—they're identities. 
                This exercise helps you spot the difference.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStage('belief')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'belief') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-2xl mx-auto pt-12">
          <h2 className="text-2xl font-light mb-2">Step 1: State Your Belief</h2>
          <p className="text-slate-400 mb-8">Choose something you feel confident about.</p>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-6">
            <label className="block text-sm text-slate-400 mb-3">
              I believe that...
            </label>
            <textarea
              value={belief}
              onChange={(e) => setBelief(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors min-h-32 resize-none"
              placeholder="e.g., 'Climate change is primarily caused by human activity' or 'Remote work increases productivity'"
            />
            <p className="text-xs text-slate-500 mt-2">
              Tip: Be specific. "Policy X is good" is weaker than "Policy X reduces homelessness."
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStage('intro')}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStage('falsifiers')}
              disabled={belief.trim().length < 20}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'falsifiers') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-3xl mx-auto pt-12">
          <h2 className="text-2xl font-light mb-2">Step 2: What Would Change Your Mind?</h2>
          <p className="text-slate-400 mb-8">List specific, testable conditions.</p>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-6">
            <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-4 mb-4">
              <p className="text-slate-300 italic">"{belief}"</p>
            </div>

            <label className="block text-sm text-slate-400 mb-3">
              I would reconsider if...
            </label>
            <div className="space-y-3">
              <textarea
                value={currentFalsifier}
                onChange={(e) => setCurrentFalsifier(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && e.shiftKey && addFalsifier()}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors min-h-24 resize-none"
                placeholder="e.g., 'If 3+ peer-reviewed meta-analyses showed no correlation between X and Y...'"
              />
              
              {!showHint ? (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Need a hint? →
                </button>
              ) : (
                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-3">
                  <p className="text-sm text-purple-300">
                    {hints[Math.floor(Math.random() * hints.length)]}
                  </p>
                </div>
              )}

              <button
                onClick={addFalsifier}
                disabled={currentFalsifier.trim().length < 10}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all"
              >
                Add Falsifier ({falsifiers.length})
              </button>
            </div>
          </div>

          {falsifiers.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Your Falsifiers</h3>
              <div className="space-y-3">
                {falsifiers.map((f, idx) => (
                  <div key={f.id} className="bg-slate-900/50 border border-slate-600 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-sm flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-300 text-sm mb-2">{f.text}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                f.specificity >= 70 ? 'bg-emerald-500' :
                                f.specificity >= 40 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${f.specificity}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{f.specificity}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setStage('belief')}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStage('results')}
              disabled={falsifiers.length === 0}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              See Results ({falsifiers.length} falsifier{falsifiers.length !== 1 ? 's' : ''})
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    const overallScore = calculateOverallScore();
    const feedback = getFeedback(overallScore);
    const FeedbackIcon = feedback.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-3xl mx-auto pt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-2">Your Falsifiability Score</h2>
            <p className="text-slate-400">Epistemic flexibility assessment</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-6 text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-${feedback.color}-500/20 border-2 border-${feedback.color}-500/50 mb-4`}>
              <FeedbackIcon className={`w-12 h-12 text-${feedback.color}-400`} />
            </div>
            <div className="text-6xl font-light text-slate-200 mb-2">{overallScore}</div>
            <div className={`text-lg text-${feedback.color}-400 mb-4`}>{feedback.level}</div>
            <p className="text-slate-300 leading-relaxed max-w-xl mx-auto">{feedback.message}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Breakdown
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Number of falsifiers</span>
                <span className="text-slate-200 font-medium">{falsifiers.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Average specificity</span>
                <span className="text-slate-200 font-medium">
                  {falsifiers.length > 0 
                    ? Math.round(falsifiers.reduce((sum, f) => sum + f.specificity, 0) / falsifiers.length)
                    : 0}/100
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Openness bonus</span>
                <span className="text-slate-200 font-medium">+{Math.min(falsifiers.length * 5, 20)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-medium text-purple-200 mb-3">What This Reveals</h3>
            <p className="text-sm text-purple-300/80 leading-relaxed mb-3">
              Your ability to name specific falsifiers measures <strong>epistemic humility</strong>—the recognition 
              that your beliefs are provisional and evidence-dependent, not identity-protective.
            </p>
            <p className="text-xs text-purple-400/60">
              High scores correlate with lower susceptibility to echo chambers and ideological capture.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setStage('intro');
                setBelief('');
                setFalsifiers([]);
                setCurrentFalsifier('');
                setShowHint(false);
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Try Another Belief
            </button>
            <button
              onClick={() => alert('In full app: Save to Progress Dashboard')}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20"
            >
              Save Progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
