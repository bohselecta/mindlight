'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAutonomy } from '@/lib/hooks/useAutonomy';
import { AssessmentWrapper } from '@/components/assessment/AssessmentWrapper';
import { Brain, CheckCircle2, XCircle, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import { DisconfirmGame, Falsifier } from '@/types';
import { autonomyStore } from '@/lib/store/autonomy-store';
import { cn } from '@/lib/utils';

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

export default function DisconfirmGamePage() {
  const router = useRouter();
  const { userId, loading: autonomyLoading } = useAutonomy();
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

  const handleSaveProgress = async () => {
    if (!userId) return;

    const overallScore = calculateOverallScore();
    const gameData: DisconfirmGame = {
      id: crypto.randomUUID(),
      userId,
      belief,
      falsifiers,
      overallScore,
      timestamp: new Date()
    };

    try {
      await autonomyStore.saveDisconfirmGame(gameData);
      await autonomyStore.checkModuleMilestones(); // Check for completion milestones
      await autonomyStore.checkBadges(); // Check for new badges
      router.push('/progress');
    } catch (error) {
      console.error('Failed to save disconfirm game:', error);
    }
  };

  const hints = [
    "Try starting with: 'If polling data showed...'",
    "Be specific: '3 peer-reviewed studies' beats 'some research'",
    "Use thresholds: 'If unemployment exceeds 8% for 2 quarters...'",
    "Conditional logic: 'If X happens AND Y doesn't, then...'",
  ];

  const progress = 
    stage === 'intro' ? 0 :
    stage === 'belief' ? 25 :
    stage === 'falsifiers' ? 75 :
    100;

  if (autonomyLoading || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <p className="text-xl text-slate-400">Loading Disconfirm Game...</p>
      </div>
    );
  }

  if (stage === 'intro') {
    return (
      <AssessmentWrapper
        title="Disconfirm Game"
        description="Can you name what would change your mind?"
        progress={progress}
        onNext={() => setStage('belief')}
        nextLabel="Start Game →"
        icon={<Brain className="w-5 h-5 text-white" />}
        showNav={false}
      >
        <div className="space-y-6">
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
      </AssessmentWrapper>
    );
  }

  if (stage === 'belief') {
    return (
      <AssessmentWrapper
        title="Step 1: State Your Belief"
        description="Choose something you feel confident about."
        progress={progress}
        onNext={() => setStage('falsifiers')}
        onBack={() => setStage('intro')}
        nextEnabled={belief.trim().length >= 20}
        nextLabel="Continue →"
        icon={<Brain className="w-5 h-5 text-white" />}
      >
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
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
        </div>
      </AssessmentWrapper>
    );
  }

  if (stage === 'falsifiers') {
    return (
      <AssessmentWrapper
        title="Step 2: What Would Change Your Mind?"
        description="List specific, testable conditions."
        progress={progress}
        onNext={() => setStage('results')}
        onBack={() => setStage('belief')}
        nextEnabled={falsifiers.length > 0}
        nextLabel={`See Results (${falsifiers.length} falsifier${falsifiers.length !== 1 ? 's' : ''})`}
        icon={<Brain className="w-5 h-5 text-white" />}
      >
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
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
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
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
                              className={cn(
                                "h-full transition-all",
                                f.specificity >= 70 ? 'bg-emerald-500' :
                                f.specificity >= 40 ? 'bg-blue-500' : 'bg-amber-500'
                              )}
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
        </div>
      </AssessmentWrapper>
    );
  }

  if (stage === 'results') {
    const overallScore = calculateOverallScore();
    const feedback = getFeedback(overallScore);
    const FeedbackIcon = feedback.icon;

    const getColorClasses = (color: string) => {
      switch (color) {
        case 'emerald': return {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/50',
          text: 'text-emerald-400'
        };
        case 'blue': return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/50',
          text: 'text-blue-400'
        };
        case 'amber': return {
          bg: 'bg-amber-500/20',
          border: 'border-amber-500/50',
          text: 'text-amber-400'
        };
        case 'red': return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          text: 'text-red-400'
        };
        default: return {
          bg: 'bg-slate-500/20',
          border: 'border-slate-500/50',
          text: 'text-slate-400'
        };
      }
    };

    const colorClasses = getColorClasses(feedback.color);

    return (
      <AssessmentWrapper
        title="Your Falsifiability Score"
        description="Epistemic flexibility assessment"
        progress={progress}
        onNext={handleSaveProgress}
        onBack={() => setStage('falsifiers')}
        nextLabel="Save Progress →"
        icon={<Brain className="w-5 h-5 text-white" />}
      >
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 text-center">
            <div className={cn("inline-flex items-center justify-center w-24 h-24 rounded-full border-2 mb-4", colorClasses.bg, colorClasses.border)}>
              <FeedbackIcon className={cn("w-12 h-12", colorClasses.text)} />
            </div>
            <div className="text-6xl font-light text-slate-200 mb-2">{overallScore}</div>
            <div className={cn("text-lg mb-4", colorClasses.text)}>{feedback.level}</div>
            <p className="text-slate-300 leading-relaxed max-w-xl mx-auto">{feedback.message}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
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

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-2xl p-6">
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
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 rounded-xl font-medium transition-all"
            >
              Try Another Belief
            </button>
          </div>
        </div>
      </AssessmentWrapper>
    );
  }

  return null;
}
