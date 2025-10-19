import React, { useState } from 'react';
import { Sparkles, TrendingUp, Users, Brain, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ReflectorPrototype() {
  const [stage, setStage] = useState('welcome'); // welcome, assessment, values, results
  const [responses, setResponses] = useState({});
  const [valueCards, setValueCards] = useState([]);
  const [tribeExpectations, setTribeExpectations] = useState({});

  // Assessment items (subset for prototype)
  const assessmentItems = [
    {
      id: 'eai_01',
      construct: 'EAI',
      type: 'likert7',
      prompt: 'Before sharing an opinion, I scan for whether it's truly mine.',
      reverse: false
    },
    {
      id: 'eai_02',
      construct: 'EAI',
      type: 'likert7',
      prompt: 'When my favorite commentator changes their view, I usually update mine too.',
      reverse: true
    },
    {
      id: 'rf_01',
      construct: 'RF',
      type: 'likert7',
      prompt: 'I can list specific evidence that would change my mind about my strongest beliefs.',
      reverse: false
    },
    {
      id: 'sa_01',
      construct: 'SA',
      type: 'likert7',
      prompt: 'I can name the first three places I heard the claims I repeat most often.',
      reverse: false
    },
    {
      id: 'ard_01',
      construct: 'ARD',
      type: 'likert7',
      prompt: 'When someone refutes "my side," I can stay curious for at least one minute.',
      reverse: false
    },
    {
      id: 'vignette_01',
      construct: 'ARD',
      type: 'vignette',
      prompt: 'You read a claim from a trusted source that conflicts with your core values.',
      options: [
        { id: 'a', text: 'Defend my values first, check the claim later', score: 1 },
        { id: 'b', text: 'Check the claim first, then consider my response', score: 7 },
        { id: 'c', text: 'Ignore it—this source has lost credibility', score: 2 },
        { id: 'd', text: 'Seek out a source that challenges the claim', score: 6 }
      ]
    }
  ];

  const valueOptions = [
    'Personal Freedom', 'Community Care', 'Truth-Seeking', 'Loyalty', 
    'Innovation', 'Tradition', 'Equality', 'Merit', 
    'Compassion', 'Discipline', 'Creativity', 'Stability'
  ];

  const calculateScores = () => {
    const constructs = { EAI: [], RF: [], SA: [], ARD: [] };
    
    Object.entries(responses).forEach(([itemId, value]) => {
      const item = assessmentItems.find(i => i.id === itemId);
      if (!item) return;
      
      let score = value;
      if (item.reverse && item.type === 'likert7') {
        score = 8 - value;
      }
      
      constructs[item.construct].push(score);
    });

    const scores = {};
    Object.entries(constructs).forEach(([construct, values]) => {
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        scores[construct] = Math.round((avg / 7) * 100);
      }
    });

    return scores;
  };

  const handleLikertResponse = (itemId, value) => {
    setResponses(prev => ({ ...prev, [itemId]: value }));
  };

  const handleVignetteResponse = (itemId, optionId) => {
    const item = assessmentItems.find(i => i.id === itemId);
    const option = item.options.find(o => o.id === optionId);
    setResponses(prev => ({ ...prev, [itemId]: option.score }));
  };

  const toggleValueCard = (value) => {
    setValueCards(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : prev.length < 5 ? [...prev, value] : prev
    );
  };

  const handleTribeExpectation = (value, expects) => {
    setTribeExpectations(prev => ({ ...prev, [value]: expects }));
  };

  const calculateVennDrift = () => {
    const aligned = valueCards.filter(v => tribeExpectations[v] === true).length;
    const divergent = valueCards.filter(v => tribeExpectations[v] === false).length;
    return { aligned, divergent, total: valueCards.length };
  };

  if (stage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-violet-400 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-light tracking-tight">Reflector</h1>
          </div>
          
          <div className="space-y-6 mb-8">
            <p className="text-xl text-slate-300 font-light">
              You bring the mind. We bring the mirror.
            </p>
            
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-medium text-slate-200">What is this?</h2>
              <p className="text-slate-400 leading-relaxed">
                A self-guided reflection suite that helps you notice when your thinking patterns 
                might be outsourced to groups, authorities, or echo chambers.
              </p>
              <p className="text-slate-400 leading-relaxed">
                We don't tell you what to think—we help you notice when you're not the one thinking.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                <Brain className="w-5 h-5 text-blue-400 mb-2" />
                <div className="text-sm font-medium text-slate-300">Non-judgmental</div>
                <div className="text-xs text-slate-500 mt-1">No right answers, only awareness</div>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                <Users className="w-5 h-5 text-violet-400 mb-2" />
                <div className="text-sm font-medium text-slate-300">Mechanism-focused</div>
                <div className="text-xs text-slate-500 mt-1">Not about tribes or politics</div>
              </div>
            </div>

            <div className="text-sm text-slate-500 space-y-2">
              <p>⏱️ This demo takes 5-7 minutes</p>
              <p>🔒 All responses stay local—nothing leaves your browser</p>
            </div>
          </div>

          <button
            onClick={() => setStage('assessment')}
            className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
          >
            Begin Baseline Mirror
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'assessment') {
    const completedCount = Object.keys(responses).length;
    const totalCount = assessmentItems.length;
    const progress = (completedCount / totalCount) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-light">Baseline Mirror</h2>
              <span className="text-sm text-slate-400">{completedCount} of {totalCount}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-8">
            {assessmentItems.map((item, index) => (
              <div key={item.id} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-sm text-slate-400">
                    {index + 1}
                  </div>
                  <p className="text-slate-200 leading-relaxed flex-1">{item.prompt}</p>
                </div>

                {item.type === 'likert7' ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-slate-500 px-1">
                      <span>Strongly Disagree</span>
                      <span>Neutral</span>
                      <span>Strongly Agree</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map(value => (
                        <button
                          key={value}
                          onClick={() => handleLikertResponse(item.id, value)}
                          className={`flex-1 h-12 rounded-lg border-2 transition-all ${
                            responses[item.id] === value
                              ? 'border-violet-500 bg-violet-500/20 text-white'
                              : 'border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {item.options.map(option => (
                      <button
                        key={option.id}
                        onClick={() => handleVignetteResponse(item.id, option.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          responses[item.id] === option.score
                            ? 'border-violet-500 bg-violet-500/10 text-slate-200'
                            : 'border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <span className="text-sm">{String.fromCharCode(65 + item.options.indexOf(option))}.</span> {option.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {completedCount === totalCount && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStage('values')}
                className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
              >
                Continue to Identity Mirror →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'values') {
    const drift = calculateVennDrift();
    const canContinue = valueCards.length >= 3 && Object.keys(tribeExpectations).length === valueCards.length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-light mb-2">Identity Mirror</h2>
          <p className="text-slate-400 mb-8">Let's separate your personal values from group expectations.</p>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-medium mb-4 text-slate-200">Step 1: Choose your top 3-5 values</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {valueOptions.map(value => (
                <button
                  key={value}
                  onClick={() => toggleValueCard(value)}
                  className={`p-4 rounded-xl border-2 transition-all text-sm ${
                    valueCards.includes(value)
                      ? 'border-blue-500 bg-blue-500/20 text-blue-200'
                      : 'border-slate-600 hover:border-slate-500 text-slate-400'
                  }`}
                >
                  {value}
                  {valueCards.includes(value) && (
                    <CheckCircle2 className="w-4 h-4 inline ml-2" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">Selected: {valueCards.length}/5</p>
          </div>

          {valueCards.length >= 3 && (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-medium mb-4 text-slate-200">
                Step 2: Would your social group/tribe expect you to prioritize these?
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Think of the community you identify with most (political, professional, cultural, etc.)
              </p>
              <div className="space-y-3">
                {valueCards.map(value => (
                  <div key={value} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                    <span className="text-slate-300">{value}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTribeExpectation(value, true)}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${
                          tribeExpectations[value] === true
                            ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-200'
                            : 'border-2 border-slate-600 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        Yes, they would
                      </button>
                      <button
                        onClick={() => handleTribeExpectation(value, false)}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${
                          tribeExpectations[value] === false
                            ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-200'
                            : 'border-2 border-slate-600 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        No, not really
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canContinue && drift.divergent > 0 && (
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

          {canContinue && (
            <button
              onClick={() => setStage('results')}
              className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
            >
              View Your Autonomy Profile →
            </button>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    const scores = calculateScores();
    const drift = calculateVennDrift();

    const getInsight = (construct, score) => {
      if (score >= 70) return { 
        level: 'High', 
        badgeClasses: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        barClasses: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
        message: 'Strong independence' 
      };
      if (score >= 40) return { 
        level: 'Moderate', 
        badgeClasses: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        barClasses: 'bg-gradient-to-r from-blue-500 to-blue-400',
        message: 'Room to grow' 
      };
      return { 
        level: 'Developing', 
        badgeClasses: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        barClasses: 'bg-gradient-to-r from-amber-500 to-amber-400',
        message: 'Opportunity here' 
      };
    };

    const constructLabels = {
      EAI: 'Epistemic Autonomy',
      RF: 'Reflective Flexibility',
      SA: 'Source Awareness',
      ARD: 'Affect Regulation'
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-2">Your Autonomy Profile</h2>
            <p className="text-slate-400">One strength. One opportunity.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {Object.entries(scores).map(([construct, score]) => {
              const insight = getInsight(construct, score);
              return (
                <div key={construct} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-slate-200">{constructLabels[construct]}</h3>
                    <span className={`text-sm px-3 py-1 rounded-full border ${insight.badgeClasses}`}>
                      {insight.level}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${insight.barClasses}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-2xl font-light text-slate-300">{score}</span>
                      <span className="text-sm text-slate-500">/ 100</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-400">{insight.message}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-medium mb-4 text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              Identity Drift Analysis
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-light text-emerald-400 mb-1">{drift.aligned}</div>
                <div className="text-xs text-slate-400">Aligned with tribe</div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-light text-amber-400 mb-1">{drift.divergent}</div>
                <div className="text-xs text-slate-400">Independent values</div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-light text-blue-400 mb-1">{drift.total}</div>
                <div className="text-xs text-slate-400">Total values examined</div>
              </div>
            </div>

            {drift.divergent > 0 && (
              <div className="bg-gradient-to-r from-violet-900/30 to-blue-900/30 border border-violet-700/30 rounded-xl p-4">
                <p className="text-sm text-slate-300 leading-relaxed">
                  Your personal values diverge from group expectations on <strong>{drift.divergent}</strong> key areas. 
                  This suggests you maintain some independent judgment—worth continuing to nurture.
                </p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-violet-900/30 border border-blue-700/50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-medium mb-3 text-blue-200">What's Next?</h3>
            <p className="text-sm text-blue-300/80 mb-4 leading-relaxed">
              This baseline gives you a starting point. In a full version, you'd explore:
            </p>
            <ul className="space-y-2 text-sm text-blue-300/70">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Echo-Loop Game:</strong> Train yourself to spot confirmation bias in real-time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Disconfirm Practice:</strong> Build the skill of listing what would change your mind</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Schema Reclaim:</strong> Decouple emotional triggers from belief formation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Influence Map:</strong> Visualize where your beliefs actually come from</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setStage('welcome');
                setResponses({});
                setValueCards([]);
                setTribeExpectations({});
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Start Over
            </button>
            <button
              className="flex-1 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
              onClick={() => alert('In the full app, this would continue to daily reflection loops and your autonomy dashboard.')}
            >
              Continue Journey
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-8">
            Evidence over echo. Curiosity over certainty.
          </p>
        </div>
      </div>
    );
  }
}
