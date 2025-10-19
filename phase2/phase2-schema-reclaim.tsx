import React, { useState } from 'react';
import { Heart, Brain, Shield, Zap, Activity, CheckCircle2 } from 'lucide-react';

/**
 * Schema Reclaim - Emotional Decoupling Module
 * 
 * Based on Young's Schema Therapy, helps users:
 * 1. Identify emotional triggers when beliefs are challenged
 * 2. Learn a 60-second regulation technique
 * 3. Re-examine the belief without emotional charge
 * 4. Measure ARD (Affect Regulation in Debate) improvement
 * 
 * Key Schemas Addressed:
 * - Approval-Seeking (need for validation from authority)
 * - Dependence (outsourcing judgment to groups)
 * - Punitiveness (harsh reactions to dissent)
 * - Defectiveness (worthiness tied to belief correctness)
 */

interface SchemaType {
  id: string;
  name: string;
  description: string;
  trigger: string;
  icon: any;
  color: string;
}

const schemas: SchemaType[] = [
  {
    id: 'approval',
    name: 'Approval-Seeking',
    description: 'Your sense of worth depends on agreement from admired figures',
    trigger: 'When an authority I respect disagrees with me, I feel...',
    icon: Heart,
    color: 'rose'
  },
  {
    id: 'dependence',
    name: 'Dependence',
    description: 'You defer to your group for judgment rather than trusting your own',
    trigger: 'When I hold a belief my community rejects, I feel...',
    icon: Shield,
    color: 'blue'
  },
  {
    id: 'punitiveness',
    name: 'Punitiveness',
    description: 'You experience harsh, punitive reactions when beliefs are challenged',
    trigger: 'When someone challenges my core belief, I feel...',
    icon: Zap,
    color: 'amber'
  },
  {
    id: 'defectiveness',
    name: 'Defectiveness',
    description: 'Being wrong feels like a personal flaw rather than a learning opportunity',
    trigger: 'When I realize I might be wrong about something important, I feel...',
    icon: Brain,
    color: 'violet'
  }
];

const emotions = [
  'Shame', 'Anger', 'Anxiety', 'Fear', 'Worthless', 
  'Defensive', 'Panicked', 'Rejected', 'Confused', 'Calm'
];

const breathingSteps = [
  { phase: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose' },
  { phase: 'Hold', duration: 4, instruction: 'Hold your breath gently' },
  { phase: 'Exhale', duration: 4, instruction: 'Breathe out slowly through your mouth' },
  { phase: 'Hold', duration: 4, instruction: 'Pause before the next breath' },
];

export default function SchemaReclaim() {
  const [stage, setStage] = useState<'intro' | 'select-schema' | 'identify-emotion' | 'breathing' | 'belief-check' | 'results'>('intro');
  const [selectedSchema, setSelectedSchema] = useState<SchemaType | null>(null);
  const [preEmotions, setPreEmotions] = useState<string[]>([]);
  const [preIntensity, setPreIntensity] = useState(5);
  const [breathingComplete, setBreathingComplete] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState(0);
  const [breathingProgress, setBreathingProgress] = useState(0);
  const [postBeliefCertainty, setPostBeliefCertainty] = useState<number | null>(null);
  const [preBeliefCertainty, setPreBeliefCertainty] = useState(8);
  const [beliefStatement, setBeliefStatement] = useState('');

  const toggleEmotion = (emotion: string) => {
    setPreEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const startBreathing = () => {
    setStage('breathing');
    setBreathingPhase(0);
    setBreathingProgress(0);
    runBreathingCycle();
  };

  const runBreathingCycle = () => {
    let currentPhase = 0;
    let currentProgress = 0;
    const totalCycles = 4; // 4 complete breath cycles = ~60 seconds
    let completedCycles = 0;

    const interval = setInterval(() => {
      const stepDuration = breathingSteps[currentPhase].duration;
      currentProgress += 0.1;

      if (currentProgress >= stepDuration) {
        currentProgress = 0;
        currentPhase = (currentPhase + 1) % breathingSteps.length;
        
        if (currentPhase === 0) {
          completedCycles++;
          if (completedCycles >= totalCycles) {
            clearInterval(interval);
            setBreathingComplete(true);
            setTimeout(() => setStage('belief-check'), 1000);
          }
        }
      }

      setBreathingPhase(currentPhase);
      setBreathingProgress((currentProgress / stepDuration) * 100);
    }, 100);
  };

  const calculateARDImprovement = (): number => {
    if (postBeliefCertainty === null) return 0;
    
    // ARD improvement = reduction in reactivity (measured by certainty drop + emotional regulation)
    const certaintyDelta = preBeliefCertainty - postBeliefCertainty;
    const emotionalIntensityPenalty = (preIntensity / 10) * 20; // High intensity = harder to regulate
    
    // Score 0-100: higher = better regulation
    const score = Math.max(0, Math.min(100, 
      50 + (certaintyDelta * 10) + (breathingComplete ? 30 : 0) - emotionalIntensityPenalty
    ));
    
    return Math.round(score);
  };

  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-light">Schema Reclaim</h1>
          </div>

          <div className="space-y-6 mb-8">
            <p className="text-xl text-slate-300 font-light">
              Decouple emotions from belief formation
            </p>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-medium text-slate-200">What you'll learn</h2>
              <p className="text-slate-400 leading-relaxed">
                When your beliefs are challenged, certain emotional patterns (schemas) can hijack your thinking. 
                This module helps you notice these triggers and reclaim autonomy.
              </p>
              <div className="bg-violet-900/20 border border-violet-700/30 rounded-xl p-4">
                <p className="text-sm text-violet-300 leading-relaxed">
                  <strong className="text-violet-200">The pattern:</strong> Emotional charge → Defensive certainty → Closed mind
                </p>
                <p className="text-sm text-violet-300 leading-relaxed mt-2">
                  <strong className="text-violet-200">The reclaim:</strong> Notice trigger → Regulate → Re-examine belief
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {schemas.map(schema => {
                const Icon = schema.icon;
                return (
                  <div key={schema.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                    <Icon className={`w-5 h-5 text-${schema.color}-400 mb-2`} />
                    <div className="text-sm font-medium text-slate-300">{schema.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{schema.description}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setStage('select-schema')}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/20"
          >
            Begin Exercise
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'select-schema') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-3xl mx-auto pt-12">
          <h2 className="text-2xl font-light mb-2">Choose Your Trigger Pattern</h2>
          <p className="text-slate-400 mb-8">Which emotional pattern feels most familiar when your beliefs are challenged?</p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {schemas.map(schema => {
              const Icon = schema.icon;
              const isSelected = selectedSchema?.id === schema.id;
              return (
                <button
                  key={schema.id}
                  onClick={() => setSelectedSchema(schema)}
                  className={`text-left p-6 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? `border-${schema.color}-500 bg-${schema.color}-500/10`
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-${schema.color}-500/20 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${schema.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-slate-200 mb-2">{schema.name}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{schema.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className={`w-6 h-6 text-${schema.color}-400`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStage('intro')}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStage('identify-emotion')}
              disabled={!selectedSchema}
              className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'identify-emotion') {
    const Icon = selectedSchema?.icon || Brain;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-3xl mx-auto pt-12">
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-10 h-10 rounded-xl bg-${selectedSchema?.color}-500/20 flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${selectedSchema?.color}-400`} />
            </div>
            <h2 className="text-2xl font-light">{selectedSchema?.name}</h2>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-6">
            <p className="text-lg text-slate-300 mb-6 italic">"{selectedSchema?.trigger}"</p>

            <label className="block text-sm text-slate-400 mb-3">
              Select all emotions you experience (choose at least one):
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {emotions.map(emotion => (
                <button
                  key={emotion}
                  onClick={() => toggleEmotion(emotion)}
                  className={`p-3 rounded-xl border-2 text-sm transition-all ${
                    preEmotions.includes(emotion)
                      ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                      : 'border-slate-600 hover:border-slate-500 text-slate-400'
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>

            <label className="block text-sm text-slate-400 mb-3">
              Intensity of this emotional response (1-10):
            </label>
            <div className="flex items-center gap-4 mb-6">
              <input
                type="range"
                min="1"
                max="10"
                value={preIntensity}
                onChange={(e) => setPreIntensity(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <span className="text-2xl font-light text-slate-200 w-12 text-center">{preIntensity}</span>
            </div>

            <label className="block text-sm text-slate-400 mb-3">
              Quick: State the belief being challenged:
            </label>
            <input
              type="text"
              value={beliefStatement}
              onChange={(e) => setBeliefStatement(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="e.g., 'Tax policy X is effective' or 'Remote work reduces productivity'"
            />

            <div className="mt-6">
              <label className="block text-sm text-slate-400 mb-3">
                Right now, how certain are you this belief is correct? (1-10):
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={preBeliefCertainty}
                  onChange={(e) => setPreBeliefCertainty(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <span className="text-2xl font-light text-slate-200 w-12 text-center">{preBeliefCertainty}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStage('select-schema')}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Back
            </button>
            <button
              onClick={startBreathing}
              disabled={preEmotions.length === 0 || !beliefStatement.trim()}
              className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Begin Regulation →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'breathing') {
    const currentStep = breathingSteps[breathingPhase];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <h2 className="text-2xl font-light text-center mb-12">60-Second Regulation</h2>

          <div className="relative mx-auto mb-12" style={{ width: '280px', height: '280px' }}>
            {/* Breathing circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border-4 border-violet-500/50 transition-all duration-[400ms] ease-in-out flex items-center justify-center"
                style={{
                  width: breathingPhase % 2 === 0 ? '280px' : '180px',
                  height: breathingPhase % 2 === 0 ? '280px' : '180px',
                }}
              >
                <div className="text-center">
                  <div className="text-4xl font-light text-violet-300 mb-2">
                    {currentStep.phase}
                  </div>
                  <div className="text-sm text-slate-400">
                    {Math.ceil((breathingSteps[breathingPhase].duration - (breathingProgress / 100 * breathingSteps[breathingPhase].duration)))}s
                  </div>
                </div>
              </div>
            </div>

            {/* Progress ring */}
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 280 280">
              <circle
                cx="140"
                cy="140"
                r="136"
                fill="none"
                stroke="rgba(139, 92, 246, 0.1)"
                strokeWidth="8"
              />
              <circle
                cx="140"
                cy="140"
                r="136"
                fill="none"
                stroke="rgba(139, 92, 246, 0.8)"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 136}`}
                strokeDashoffset={`${2 * Math.PI * 136 * (1 - breathingProgress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-100"
              />
            </svg>
          </div>

          <p className="text-center text-slate-300 text-lg mb-8">
            {currentStep.instruction}
          </p>

          {breathingComplete && (
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <p className="text-emerald-300">Regulation complete. Notice any shift?</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'belief-check') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-2xl mx-auto pt-12">
          <h2 className="text-2xl font-light mb-2">Re-examine Your Belief</h2>
          <p className="text-slate-400 mb-8">After emotional regulation, how do you feel about this belief?</p>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-6">
            <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-4 mb-6">
              <p className="text-slate-300 italic">"{beliefStatement}"</p>
            </div>

            <label className="block text-sm text-slate-400 mb-3">
              Now, how certain are you this belief is correct? (1-10):
            </label>
            <div className="flex items-center gap-4 mb-4">
              <input
                type="range"
                min="1"
                max="10"
                value={postBeliefCertainty ?? preBeliefCertainty}
                onChange={(e) => setPostBeliefCertainty(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <span className="text-2xl font-light text-slate-200 w-12 text-center">
                {postBeliefCertainty ?? preBeliefCertainty}
              </span>
            </div>

            {postBeliefCertainty !== null && postBeliefCertainty !== preBeliefCertainty && (
              <div className="bg-violet-900/20 border border-violet-700/30 rounded-xl p-4 mt-4">
                <p className="text-sm text-violet-300">
                  Your certainty shifted by {Math.abs(preBeliefCertainty - postBeliefCertainty)} points 
                  {postBeliefCertainty < preBeliefCertainty ? ' (decreased)' : ' (increased)'}.
                  This is affect regulation in action.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setStage('results')}
            disabled={postBeliefCertainty === null}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            See Your ARD Score →
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    const ardScore = calculateARDImprovement();
    const certaintyChange = preBeliefCertainty - (postBeliefCertainty ?? preBeliefCertainty);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-3xl mx-auto pt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-2">Affect Regulation Score</h2>
            <p className="text-slate-400">ARD (Affect Regulation in Debate)</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-6 text-center">
            <div className="text-6xl font-light text-slate-200 mb-4">{ardScore}</div>
            <div className="text-lg text-violet-400 mb-4">
              {ardScore >= 70 ? 'Excellent' : ardScore >= 50 ? 'Good' : 'Developing'} Regulation
            </div>
            <p className="text-slate-300 leading-relaxed max-w-xl mx-auto">
              {ardScore >= 70 
                ? 'You demonstrated strong ability to decouple emotion from belief evaluation.'
                : ardScore >= 50
                ? 'You showed some capacity to regulate affect. Practice strengthens this skill.'
                : 'This is challenging work. Regular practice builds emotional flexibility.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Before Regulation</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Emotions</span>
                  <span className="text-slate-200">{preEmotions.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Intensity</span>
                  <span className="text-slate-200">{preIntensity}/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Certainty</span>
                  <span className="text-slate-200">{preBeliefCertainty}/10</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-slate-200 mb-4">After Regulation</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Breathing</span>
                  <span className="text-emerald-400">✓ Completed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Certainty</span>
                  <span className="text-slate-200">{postBeliefCertainty}/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Change</span>
                  <span className={certaintyChange > 0 ? 'text-emerald-400' : certaintyChange < 0 ? 'text-amber-400' : 'text-slate-400'}>
                    {certaintyChange > 0 ? '↓' : certaintyChange < 0 ? '↑' : '→'} {Math.abs(certaintyChange)} points
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-900/30 to-fuchsia-900/30 border border-violet-700/50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-medium text-violet-200 mb-3">What This Means</h3>
            <p className="text-sm text-violet-300/80 leading-relaxed">
              The <strong>{ selectedSchema?.name}</strong> schema often creates defensive certainty when beliefs are challenged. 
              By regulating the emotional trigger first, you create space for more flexible thinking.
            </p>
            <p className="text-xs text-violet-400/60 mt-3">
              Regular practice strengthens your ability to hold beliefs provisionally rather than protectively.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setStage('intro');
                setSelectedSchema(null);
                setPreEmotions([]);
                setPreIntensity(5);
                setBreathingComplete(false);
                setBreathingPhase(0);
                setBreathingProgress(0);
                setPostBeliefCertainty(null);
                setPreBeliefCertainty(8);
                setBeliefStatement('');
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Try Another Schema
            </button>
            <button
              onClick={() => alert('In full app: Save ARD improvement to Progress Dashboard')}
              className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/20"
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
