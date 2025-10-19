'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAutonomy } from '@/lib/hooks/useAutonomy';
import { AssessmentWrapper } from '@/components/assessment/AssessmentWrapper';
import { Heart, Brain, Shield, Zap, Activity, CheckCircle2 } from 'lucide-react';
import { SchemaReclaim } from '@/types';
import { autonomyStore } from '@/lib/store/autonomy-store';
import { cn } from '@/lib/utils';

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

export default function SchemaReclaimPage() {
  const router = useRouter();
  const { userId, loading: autonomyLoading } = useAutonomy();
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

  const handleSaveProgress = async () => {
    if (!userId || !selectedSchema || postBeliefCertainty === null) return;

    const ardScore = calculateARDImprovement();
    const sessionData: SchemaReclaim = {
      id: crypto.randomUUID(),
      userId,
      schema: selectedSchema.id as 'approval' | 'dependence' | 'punitiveness' | 'defectiveness',
      preRegulation: { 
        emotion: preEmotions.join(', '), 
        intensity: preIntensity, 
        certainty: preBeliefCertainty 
      },
      postRegulation: { 
        emotion: 'Regulated', 
        intensity: Math.max(1, preIntensity - 2), 
        certainty: postBeliefCertainty 
      },
      timestamp: new Date()
    };

    try {
      await autonomyStore.saveSchemaReclaim(sessionData);
      await autonomyStore.checkModuleMilestones(); // Check for completion milestones
      await autonomyStore.checkBadges(); // Check for new badges
      router.push('/progress');
    } catch (error) {
      console.error('Failed to save schema reclaim session:', error);
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'rose': return {
        bg: 'bg-rose-500/20',
        border: 'border-rose-500',
        text: 'text-rose-400',
        accent: 'accent-rose-500'
      };
      case 'blue': return {
        bg: 'bg-blue-500/20',
        border: 'border-blue-500',
        text: 'text-blue-400',
        accent: 'accent-blue-500'
      };
      case 'amber': return {
        bg: 'bg-amber-500/20',
        border: 'border-amber-500',
        text: 'text-amber-400',
        accent: 'accent-amber-500'
      };
      case 'violet': return {
        bg: 'bg-violet-500/20',
        border: 'border-violet-500',
        text: 'text-violet-400',
        accent: 'accent-violet-500'
      };
      default: return {
        bg: 'bg-slate-500/20',
        border: 'border-slate-500',
        text: 'text-slate-400',
        accent: 'accent-slate-500'
      };
    }
  };

  const progress = 
    stage === 'intro' ? 0 :
    stage === 'select-schema' ? 20 :
    stage === 'identify-emotion' ? 40 :
    stage === 'breathing' ? 60 :
    stage === 'belief-check' ? 80 :
    100;

  if (autonomyLoading || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <p className="text-xl text-slate-400">Loading Schema Reclaim...</p>
      </div>
    );
  }

  if (stage === 'intro') {
    return (
      <AssessmentWrapper
        title="Schema Reclaim"
        description="Decouple emotions from belief formation"
        progress={progress}
        onNext={() => setStage('select-schema')}
        nextLabel="Begin Exercise →"
        icon={<Activity className="w-5 h-5 text-white" />}
        showNav={false}
      >
        <div className="space-y-6">
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
              const colorClasses = getColorClasses(schema.color);
              return (
                <div key={schema.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                  <Icon className={cn("w-5 h-5 mb-2", colorClasses.text)} />
                  <div className="text-sm font-medium text-slate-300">{schema.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{schema.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </AssessmentWrapper>
    );
  }

  if (stage === 'select-schema') {
    return (
      <AssessmentWrapper
        title="Choose Your Trigger Pattern"
        description="Which emotional pattern feels most familiar when your beliefs are challenged?"
        progress={progress}
        onNext={() => setStage('identify-emotion')}
        onBack={() => setStage('intro')}
        nextEnabled={selectedSchema !== null}
        nextLabel="Continue →"
        icon={<Activity className="w-5 h-5 text-white" />}
      >
        <div className="grid md:grid-cols-2 gap-4">
          {schemas.map(schema => {
            const Icon = schema.icon;
            const isSelected = selectedSchema?.id === schema.id;
            const colorClasses = getColorClasses(schema.color);
            return (
              <button
                key={schema.id}
                onClick={() => setSelectedSchema(schema)}
                className={cn(
                  "text-left p-6 rounded-2xl border-2 transition-all",
                  isSelected
                    ? `${colorClasses.border} ${colorClasses.bg}`
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn("flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center", colorClasses.bg)}>
                    <Icon className={cn("w-6 h-6", colorClasses.text)} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-slate-200 mb-2">{schema.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{schema.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className={cn("w-6 h-6", colorClasses.text)} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </AssessmentWrapper>
    );
  }

  if (stage === 'identify-emotion') {
    const Icon = selectedSchema?.icon || Brain;
    const colorClasses = getColorClasses(selectedSchema?.color || 'violet');
    
    return (
      <AssessmentWrapper
        title={selectedSchema?.name || 'Emotional Identification'}
        description="Identify your emotional response to belief challenges"
        progress={progress}
        onNext={startBreathing}
        onBack={() => setStage('select-schema')}
        nextEnabled={preEmotions.length > 0 && beliefStatement.trim().length > 0}
        nextLabel="Begin Regulation →"
        icon={<Icon className="w-5 h-5 text-white" />}
      >
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <p className="text-lg text-slate-300 mb-6 italic">"{selectedSchema?.trigger}"</p>

            <label className="block text-sm text-slate-400 mb-3">
              Select all emotions you experience (choose at least one):
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {emotions.map(emotion => (
                <button
                  key={emotion}
                  onClick={() => toggleEmotion(emotion)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-sm transition-all",
                    preEmotions.includes(emotion)
                      ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                      : 'border-slate-600 hover:border-slate-500 text-slate-400'
                  )}
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
                className={cn("flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer", colorClasses.accent)}
                aria-label="Emotional intensity from 1 to 10"
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
                  className={cn("flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer", colorClasses.accent)}
                  aria-label="Belief certainty from 1 to 10"
                />
                <span className="text-2xl font-light text-slate-200 w-12 text-center">{preBeliefCertainty}</span>
              </div>
            </div>
          </div>
        </div>
      </AssessmentWrapper>
    );
  }

  if (stage === 'breathing') {
    const currentStep = breathingSteps[breathingPhase];
    return (
      <AssessmentWrapper
        title="60-Second Regulation"
        description="Follow the breathing pattern"
        progress={progress}
        showNav={false}
        icon={<Activity className="w-5 h-5 text-white" />}
      >
        <div className="space-y-8">
          <div className="relative mx-auto" style={{ width: '280px', height: '280px' }}>
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

          <p className="text-center text-slate-300 text-lg">
            {currentStep.instruction}
          </p>

          {breathingComplete && (
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <p className="text-emerald-300">Regulation complete. Notice any shift?</p>
            </div>
          )}
        </div>
      </AssessmentWrapper>
    );
  }

  if (stage === 'belief-check') {
    return (
      <AssessmentWrapper
        title="Re-examine Your Belief"
        description="After emotional regulation, how do you feel about this belief?"
        progress={progress}
        onNext={() => setStage('results')}
        onBack={() => setStage('breathing')}
        nextEnabled={postBeliefCertainty !== null}
        nextLabel="See Your ARD Score →"
        icon={<Activity className="w-5 h-5 text-white" />}
      >
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
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
                aria-label="Post-regulation belief certainty from 1 to 10"
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
        </div>
      </AssessmentWrapper>
    );
  }

  if (stage === 'results') {
    const ardScore = calculateARDImprovement();
    const certaintyChange = preBeliefCertainty - (postBeliefCertainty ?? preBeliefCertainty);

    return (
      <AssessmentWrapper
        title="Affect Regulation Score"
        description="ARD (Affect Regulation in Debate)"
        progress={progress}
        onNext={handleSaveProgress}
        onBack={() => setStage('belief-check')}
        nextLabel="Save Progress →"
        icon={<Activity className="w-5 h-5 text-white" />}
      >
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 text-center">
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

          <div className="grid md:grid-cols-2 gap-6">
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

          <div className="bg-gradient-to-br from-violet-900/30 to-fuchsia-900/30 border border-violet-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-violet-200 mb-3">What This Means</h3>
            <p className="text-sm text-violet-300/80 leading-relaxed">
              The <strong>{selectedSchema?.name}</strong> schema often creates defensive certainty when beliefs are challenged. 
              Your ability to regulate this emotional response and re-examine the belief with less certainty 
              indicates improved <strong>Affect Regulation in Debate (ARD)</strong>.
            </p>
            <p className="text-xs text-violet-400/60 mt-3">
              High ARD scores correlate with reduced ideological capture and increased epistemic humility.
            </p>
          </div>
        </div>
      </AssessmentWrapper>
    );
  }

  return null;
}
