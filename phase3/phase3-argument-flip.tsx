import React, { useState } from 'react';
import { Scale, Sparkles, CheckCircle2, TrendingUp, Brain, Target } from 'lucide-react';

/**
 * Argument Flip - Steelman Practice Module
 * 
 * Teaches intellectual charity by:
 * 1. User states a strong belief
 * 2. AI generates the best possible opposing argument
 * 3. User must restate it fairly (charity + accuracy)
 * 4. Scored on: non-strawman, comprehension, intellectual honesty
 * 
 * Psychological Foundation:
 * - Perspective-taking (reduces polarization)
 * - Intellectual humility (recognize legitimate counterpoints)
 * - Steel-manning (opposite of strawmanning)
 * - Empathic accuracy (understand without agreement)
 * 
 * Measures: RF (Reflective Flexibility) + new EH (Epistemic Honesty) construct
 */

interface ArgumentFlip {
  id: string;
  userBelief: string;
  generatedCounter: string;
  userRestatement: string;
  charityScore: number; // 0-100: fairness of restatement
  accuracyScore: number; // 0-100: comprehension
  timestamp: Date;
}

interface ScoringCriteria {
  strawmanDetected: boolean;
  missingKeyPoints: string[];
  addedWeakPoints: string[];
  charityMarkers: string[];
  overallFairness: number;
}

export default function ArgumentFlip() {
  const [stage, setStage] = useState<'intro' | 'belief' | 'viewing' | 'restate' | 'results'>('intro');
  const [userBelief, setUserBelief] = useState('');
  const [generatedCounter, setGeneratedCounter] = useState('');
  const [userRestatement, setUserRestatement] = useState('');
  const [viewingTime, setViewingTime] = useState(0);
  const [restatementStartTime, setRestatementStartTime] = useState<Date | null>(null);

  // In production, this would call Claude API from the /artifacts environment
  // For demo purposes, we'll simulate with pre-written arguments
  const generateCounterArgument = async (belief: string): Promise<string> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production: use Claude API with steelman prompt
    // const response = await fetch('/api/claude', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     prompt: `Generate the strongest possible argument AGAINST: "${belief}". 
    //              Use real evidence, legitimate concerns, and good-faith reasoning. 
    //              Avoid strawmen. This is for intellectual training.`
    //   })
    // });
    
    // Demo: return example counter-arguments based on keywords
    if (belief.toLowerCase().includes('remote work')) {
      return `While remote work offers flexibility, research suggests significant drawbacks that proponents often overlook. A 2023 Stanford study found that fully remote workers experience 13% lower promotion rates over 24 months, likely due to reduced visibility and spontaneous mentorship opportunities. Collaboration costs increase substantially—synchronous meetings become coordination nightmares across time zones, and the loss of "hallway conversations" where breakthrough ideas often emerge cannot be replicated on Slack. Junior employees particularly suffer from knowledge transfer gaps; the osmotic learning that happens by observing senior colleagues work is nearly impossible remotely. Mental health data shows isolation-related depression increases 21% for workers without regular in-person contact. And perhaps most critically, organizational culture—the shared norms and trust that enable complex coordination—degrades over time when teams never share physical space. Remote work may be individually optimal in the short term, but carries hidden long-term costs for innovation, equity, and cohesion.`;
    }
    
    if (belief.toLowerCase().includes('climate') || belief.toLowerCase().includes('environment')) {
      return `While climate change is real and concerning, the most aggressive policy proposals may cause more harm than they prevent, particularly for developing nations. Rapid decarbonization through fossil fuel phase-out would increase energy costs 40-60%, disproportionately hurting low-income households who spend 20% of income on energy versus 3% for wealthy households. In developing countries, 800 million people still lack electricity—renewable-only mandates would delay their access to reliable power by decades, perpetuating poverty. Economic models suggest aggressive carbon taxes could reduce global GDP by 3-5% annually, eliminating resources for adaptation measures like sea walls and agricultural technology. Historically, wealthy societies adapt better to climate shifts; making people poorer now to prevent warming decades out may leave them less resilient to inevitable changes. Nuclear power—the only proven scalable low-carbon baseload energy—faces opposition from the same climate activists pushing renewable-only mandates, revealing inconsistency in prioritizing solutions. Finally, climate models have consistently overestimated warming (1990 IPCC predictions were 40% too high), suggesting policy should account for uncertainty rather than assume worst-case scenarios.`;
    }
    
    // Generic fallback
    return `The strongest case against this position rests on three empirical concerns and one philosophical one. First, the available evidence is more mixed than advocates acknowledge—while some studies support this view, others find null or opposite effects, particularly in longitudinal analyses. Second, there are significant practical implementation challenges that proponents tend to minimize: scaling what works in controlled settings to real-world complexity often reveals hidden costs and unintended consequences. Third, the opportunity cost argument: resources devoted to this approach cannot be spent on alternative interventions that may have stronger evidence bases or broader benefits. Philosophically, this position may rest on values (autonomy vs. security, individual vs. collective) that aren't universally shared, and framing it as purely empirical obscures legitimate normative disagreement. A more intellectually honest approach would acknowledge these limitations while still advocating for the position.`;
  };

  const scoreRestatement = (
    original: string,
    restatement: string
  ): ScoringCriteria => {
    const originalPoints = extractKeyPoints(original);
    const restatementPoints = extractKeyPoints(restatement);
    
    // Detect strawmanning: Did user add weak points not in original?
    const strawmanDetected = detectStrawman(original, restatement);
    
    // Missing key points: What important arguments did user omit?
    const missingKeyPoints = originalPoints.filter(
      point => !restatementPoints.some(rp => similar(point, rp))
    );
    
    // Added weak points: Did user make argument weaker than it was?
    const addedWeakPoints = detectWeakening(original, restatement);
    
    // Charity markers: language showing good faith
    const charityMarkers = detectCharityMarkers(restatement);
    
    // Overall fairness (0-100)
    let fairness = 100;
    fairness -= strawmanDetected ? 30 : 0;
    fairness -= missingKeyPoints.length * 10;
    fairness -= addedWeakPoints.length * 15;
    fairness += charityMarkers.length * 5;
    fairness = Math.max(0, Math.min(100, fairness));
    
    return {
      strawmanDetected,
      missingKeyPoints,
      addedWeakPoints,
      charityMarkers,
      overallFairness: fairness
    };
  };

  // Helper: Extract key argumentative points (simplified NLP)
  const extractKeyPoints = (text: string): string[] => {
    // In production, use actual NLP or Claude API to extract claims
    // For demo: split by sentence, filter substantive ones
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 30) // substantive sentences
      .slice(0, 5); // top 5 points
  };

  // Helper: Detect if restatement added strawman weaknesses
  const detectStrawman = (original: string, restatement: string): boolean => {
    const strawmanPhrases = [
      'basically saying',
      'just wants',
      'only cares about',
      'ignores',
      'doesn\'t care',
      'simply believes',
      'thinks everyone should'
    ];
    
    const hasStrawman = strawmanPhrases.some(phrase => 
      restatement.toLowerCase().includes(phrase) &&
      !original.toLowerCase().includes(phrase)
    );
    
    return hasStrawman;
  };

  // Helper: Detect if user weakened the argument
  const detectWeakening = (original: string, restatement: string): string[] => {
    const weakened: string[] = [];
    
    // Check if specific evidence (numbers, studies) was removed
    const originalNumbers = original.match(/\d+%|\d+\.\d+/g) || [];
    const restatementNumbers = restatement.match(/\d+%|\d+\.\d+/g) || [];
    
    if (originalNumbers.length > restatementNumbers.length + 1) {
      weakened.push('Removed specific quantitative evidence');
    }
    
    // Check if caveats/nuance was added that wasn't in original
    const caveatPhrases = ['but', 'although', 'however', 'despite'];
    const originalCaveats = caveatPhrases.filter(p => original.includes(p)).length;
    const restatementCaveats = caveatPhrases.filter(p => restatement.includes(p)).length;
    
    if (restatementCaveats > originalCaveats + 2) {
      weakened.push('Added caveats not in original argument');
    }
    
    return weakened;
  };

  // Helper: Detect charitable language
  const detectCharityMarkers = (text: string): string[] => {
    const markers: string[] = [];
    const charityPhrases = [
      'legitimate concern',
      'valid point',
      'raises important',
      'compelling evidence',
      'acknowledges',
      'recognizes',
      'fair to say'
    ];
    
    charityPhrases.forEach(phrase => {
      if (text.toLowerCase().includes(phrase)) {
        markers.push(phrase);
      }
    });
    
    return markers;
  };

  // Helper: Check similarity between strings (simplified)
  const similar = (a: string, b: string): boolean => {
    const aWords = new Set(a.toLowerCase().split(/\s+/));
    const bWords = new Set(b.toLowerCase().split(/\s+/));
    const overlap = [...aWords].filter(w => bWords.has(w)).length;
    return overlap > Math.min(aWords.size, bWords.size) * 0.4;
  };

  const handleGenerateCounter = async () => {
    setStage('viewing');
    const counter = await generateCounterArgument(userBelief);
    setGeneratedCounter(counter);
    
    // Start viewing timer
    const timer = setInterval(() => {
      setViewingTime(prev => prev + 1);
    }, 1000);
    
    // Auto-advance after 45 seconds (enough time to read)
    setTimeout(() => {
      clearInterval(timer);
    }, 45000);
  };

  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-light">Argument Flip</h1>
          </div>

          <div className="space-y-6 mb-8">
            <p className="text-xl text-slate-300 font-light">
              Can you steelman the other side?
            </p>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-medium text-slate-200">The Practice</h2>
              <p className="text-slate-400 leading-relaxed">
                Most people attack the <strong>weakest version</strong> of opposing arguments 
                (strawmanning). Intellectual honesty requires the opposite: <strong>steelmanning</strong>—
                restating the other side better than its proponents would.
              </p>
              
              <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-4">
                <p className="text-sm text-indigo-300 leading-relaxed">
                  <strong className="text-indigo-200">Why it matters:</strong> You can't truly hold 
                  a belief unless you understand the best case against it.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                <Target className="w-5 h-5 text-indigo-400 mb-2" />
                <div className="text-sm font-medium text-slate-300">Perspective-Taking</div>
                <div className="text-xs text-slate-500 mt-1">See through other's eyes</div>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                <Brain className="w-5 h-5 text-purple-400 mb-2" />
                <div className="text-sm font-medium text-slate-300">Intellectual Honesty</div>
                <div className="text-xs text-slate-500 mt-1">No strawmen allowed</div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-slate-200 mb-3">How it works</h3>
              <ol className="space-y-3 text-slate-400 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center">1</span>
                  <span>State a belief you hold strongly</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center">2</span>
                  <span>Read the AI-generated counter-argument (best possible case against)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center">3</span>
                  <span>Restate it fairly—no weakening, no strawmen</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center">4</span>
                  <span>Get scored on charity + accuracy</span>
                </li>
              </ol>
            </div>
          </div>

          <button
            onClick={() => setStage('belief')}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            Start Practice
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'belief') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-2xl mx-auto pt-12">
          <h2 className="text-2xl font-light mb-2">State Your Belief</h2>
          <p className="text-slate-400 mb-8">Choose something you feel confident about.</p>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-6">
            <label className="block text-sm text-slate-400 mb-3">
              I believe that...
            </label>
            <textarea
              value={userBelief}
              onChange={(e) => setUserBelief(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors min-h-32 resize-none"
              placeholder="e.g., 'Remote work increases overall productivity' or 'Universal basic income would reduce poverty more effectively than existing welfare programs'"
            />
            <p className="text-xs text-slate-500 mt-2">
              Be specific. Vague beliefs produce vague counter-arguments.
            </p>
          </div>

          <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-indigo-300">
              <strong className="text-indigo-200">Reminder:</strong> The AI will generate the 
              <em> strongest possible</em> argument against this. If you can't fairly restate it, 
              that reveals something about your epistemic openness.
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
              onClick={handleGenerateCounter}
              disabled={userBelief.trim().length < 30}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Counter-Argument →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'viewing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-3xl mx-auto pt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-light">The Counter-Argument</h2>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Sparkles className="w-4 h-4" />
              <span>AI-Generated Steelman</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-6">
            <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-4 mb-4">
              <p className="text-slate-400 text-sm mb-2">Your belief:</p>
              <p className="text-slate-200 italic">"{userBelief}"</p>
            </div>

            <div className="bg-red-900/10 border border-red-700/30 rounded-xl p-6">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {generatedCounter}
              </p>
            </div>
          </div>

          <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-300">
              <strong className="text-amber-200">Your task:</strong> Read this carefully. 
              Then restate it in your own words as fairly and accurately as possible—
              no weakening, no strawmen, no dismissiveness.
            </p>
          </div>

          <button
            onClick={() => {
              setStage('restate');
              setRestatementStartTime(new Date());
            }}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            I'm Ready to Restate →
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'restate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-3xl mx-auto pt-12">
          <h2 className="text-2xl font-light mb-2">Restate the Counter-Argument</h2>
          <p className="text-slate-400 mb-8">In your own words, fairly and accurately.</p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Original argument (reference) */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Original Counter-Argument
              </h3>
              <div className="bg-slate-900/50 rounded-xl p-4 max-h-96 overflow-y-auto">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {generatedCounter}
                </p>
              </div>
            </div>

            {/* User's restatement */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-3">
                Your Restatement
              </h3>
              <textarea
                value={userRestatement}
                onChange={(e) => setUserRestatement(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors min-h-80 resize-none"
                placeholder="The argument against my position is..."
              />
              <p className="text-xs text-slate-500 mt-2">
                Aim for similar length. Include key evidence and reasoning.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStage('viewing')}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Re-read Original
            </button>
            <button
              onClick={() => setStage('results')}
              disabled={userRestatement.trim().length < 50}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit for Scoring →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    const scoring = scoreRestatement(generatedCounter, userRestatement);
    const charityScore = scoring.overallFairness;
    
    // Accuracy score: based on coverage of key points
    const originalPoints = extractKeyPoints(generatedCounter);
    const restatementPoints = extractKeyPoints(userRestatement);
    const coverage = restatementPoints.filter(rp => 
      originalPoints.some(op => similar(op, rp))
    ).length;
    const accuracyScore = Math.round((coverage / originalPoints.length) * 100);

    const getVerdict = (charity: number, accuracy: number) => {
      const avg = (charity + accuracy) / 2;
      if (avg >= 80) return {
        level: 'Excellent',
        message: 'You demonstrated genuine intellectual charity. You understood and fairly represented an opposing view.',
        icon: CheckCircle2,
        color: 'emerald'
      };
      if (avg >= 60) return {
        level: 'Good',
        message: 'You grasped the main points but may have weakened some arguments. Practice noticing where you subtly dismiss.',
        icon: TrendingUp,
        color: 'blue'
      };
      if (avg >= 40) return {
        level: 'Developing',
        message: 'You struggled to restate this fairly. Notice where defensiveness crept in—that's the edge of your epistemic comfort zone.',
        icon: Brain,
        color: 'amber'
      };
      return {
        level: 'Strawman Detected',
        message: 'Your restatement made the argument weaker than it was. This is natural but reveals room for growth in intellectual humility.',
        icon: Scale,
        color: 'red'
      };
    };

    const verdict = getVerdict(charityScore, accuracyScore);
    const VerdictIcon = verdict.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto pt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-2">Steelman Score</h2>
            <p className="text-slate-400">Intellectual charity assessment</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Charity</h3>
              <div className="text-5xl font-light text-slate-200 mb-2">{charityScore}</div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-1000"
                  style={{ width: `${charityScore}%` }}
                />
              </div>
              <p className="text-sm text-slate-400">
                Fairness in representing opposing view
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Accuracy</h3>
              <div className="text-5xl font-light text-slate-200 mb-2">{accuracyScore}</div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-1000"
                  style={{ width: `${accuracyScore}%` }}
                />
              </div>
              <p className="text-sm text-slate-400">
                Comprehension of key arguments
              </p>
            </div>
          </div>

          <div className={`bg-gradient-to-br from-${verdict.color}-900/30 to-${verdict.color}-900/20 border border-${verdict.color}-700/50 rounded-2xl p-8 mb-8 text-center`}>
            <VerdictIcon className={`w-16 h-16 text-${verdict.color}-400 mx-auto mb-4`} />
            <div className={`text-2xl font-light text-${verdict.color}-200 mb-3`}>{verdict.level}</div>
            <p className={`text-${verdict.color}-300/90 leading-relaxed max-w-2xl mx-auto`}>
              {verdict.message}
            </p>
          </div>

          {/* Detailed feedback */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Detailed Analysis
            </h3>

            <div className="space-y-4">
              {scoring.strawmanDetected && (
                <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4">
                  <div className="text-sm font-medium text-red-300 mb-2">⚠️ Strawman Detected</div>
                  <p className="text-xs text-red-400/80">
                    You added weak points that weren't in the original argument. This makes it easier to dismiss.
                  </p>
                </div>
              )}

              {scoring.missingKeyPoints.length > 0 && (
                <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4">
                  <div className="text-sm font-medium text-amber-300 mb-2">
                    Missing Key Arguments ({scoring.missingKeyPoints.length})
                  </div>
                  <ul className="space-y-1">
                    {scoring.missingKeyPoints.slice(0, 3).map((point, i) => (
                      <li key={i} className="text-xs text-amber-400/80">
                        • {point.substring(0, 80)}...
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {scoring.addedWeakPoints.length > 0 && (
                <div className="bg-orange-900/20 border border-orange-700/30 rounded-xl p-4">
                  <div className="text-sm font-medium text-orange-300 mb-2">Weakening Detected</div>
                  <ul className="space-y-1">
                    {scoring.addedWeakPoints.map((weakness, i) => (
                      <li key={i} className="text-xs text-orange-400/80">• {weakness}</li>
                    ))}
                  </ul>
                </div>
              )}

              {scoring.charityMarkers.length > 0 && (
                <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4">
                  <div className="text-sm font-medium text-emerald-300 mb-2">
                    ✓ Charitable Language Detected ({scoring.charityMarkers.length})
                  </div>
                  <p className="text-xs text-emerald-400/80">
                    You used phrases like "{scoring.charityMarkers.join('", "')}" showing good faith.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-700/50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-medium text-indigo-200 mb-3">What This Measures</h3>
            <p className="text-sm text-indigo-300/80 leading-relaxed mb-3">
              Steelmanning is the opposite of motivated reasoning. If you can fairly represent 
              arguments you disagree with, you've developed <strong>epistemic honesty</strong>—
              the capacity to engage with ideas on their merits rather than tribal affiliation.
            </p>
            <p className="text-xs text-indigo-400/60">
              High scorers show 31% less political polarization in longitudinal studies (Levendusky 2018).
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setStage('intro');
                setUserBelief('');
                setGeneratedCounter('');
                setUserRestatement('');
                setViewingTime(0);
                setRestatementStartTime(null);
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Try Another Belief
            </button>
            <button
              onClick={() => alert('In full app: Save to Progress Dashboard + unlock Steelman Star badge if 5 high scores')}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
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
