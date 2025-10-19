'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getRandomHeadlines, HeadlinePair } from '@/content/loops/echo-headlines';
import { useRouter } from 'next/navigation';
import { Clock, Brain, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoundResult {
  headlinePair: HeadlinePair;
  selectedIndex: number;
  reactionTime: number;
  emotionalTrigger: boolean;
}

export default function EchoLoopPage() {
  const router = useRouter();
  const [stage, setStage] = useState<'intro' | 'playing' | 'results'>('intro');
  const [headlines, setHeadlines] = useState<HeadlinePair[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [showHeadlines, setShowHeadlines] = useState(false);
  const [selectedHeadline, setSelectedHeadline] = useState<number | null>(null);

  const startGame = () => {
    const gameHeadlines = getRandomHeadlines(10);
    setHeadlines(gameHeadlines);
    setCurrentRound(0);
    setRoundResults([]);
    setStage('playing');
  };

  const startRound = () => {
    setStartTime(Date.now());
    setShowHeadlines(true);
    setSelectedHeadline(null);
  };

  const selectHeadline = (index: number) => {
    if (selectedHeadline !== null) return;

    const reactionTime = Date.now() - startTime;
    const currentHeadline = headlines[currentRound];
    
    const result: RoundResult = {
      headlinePair: currentHeadline,
      selectedIndex: index,
      reactionTime,
      emotionalTrigger: index === 0 // First headline is always emotional
    };

    setSelectedHeadline(index);
    setRoundResults(prev => [...prev, result]);

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentRound < headlines.length - 1) {
        setCurrentRound(prev => prev + 1);
        setShowHeadlines(false);
      } else {
        setStage('results');
      }
    }, 2000);
  };

  const calculateMetrics = () => {
    const emotionalSelections = roundResults.filter(r => r.emotionalTrigger).length;
    const emotionalBiasPercentage = (emotionalSelections / roundResults.length) * 100;
    const averageReactionTime = roundResults.reduce((sum, r) => sum + r.reactionTime, 0) / roundResults.length;
    
    // Self-awareness score based on reaction time consistency and emotional bias
    const reactionTimeVariance = roundResults.reduce((sum, r) => {
      return sum + Math.pow(r.reactionTime - averageReactionTime, 2);
    }, 0) / roundResults.length;
    
    const selfAwarenessScore = Math.max(0, 100 - (emotionalBiasPercentage * 2) - (reactionTimeVariance / 1000));

    return {
      emotionalBiasPercentage: Math.round(emotionalBiasPercentage),
      averageReactionTime: Math.round(averageReactionTime),
      selfAwarenessScore: Math.round(selfAwarenessScore)
    };
  };

  const metrics = stage === 'results' ? calculateMetrics() : null;

  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-light tracking-tight">Echo-Loop Game</h1>
          </div>

          <div className="space-y-6 mb-8">
            <p className="text-xl text-slate-300 font-light">
              Train your bias detection through headline pairs.
            </p>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-medium text-slate-200">How it works</h2>
              <ol className="space-y-3 text-slate-400">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm">1</span>
                  <span>You'll see two headlines about the same topic</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm">2</span>
                  <span>Pick which one "pulls you in more"</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm">3</span>
                  <span>We'll measure your reaction time and emotional triggers</span>
                </li>
              </ol>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-violet-900/20 border border-blue-700/30 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300/80">
                  <p className="font-medium text-blue-200 mb-1">What we're measuring</p>
                  <p className="leading-relaxed">
                    Emotional bias percentage, reaction time patterns, and self-awareness. 
                    This isn't about being "right"—it's about noticing your own patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-amber-500/20"
          >
            Start Echo-Loop Training
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'playing') {
    const currentHeadline = headlines[currentRound];
    const progress = ((currentRound + 1) / headlines.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-light">Round {currentRound + 1} of {headlines.length}</h2>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {startTime > 0 ? Math.round((Date.now() - startTime) / 1000) : 0}s
                </span>
              </div>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Headlines */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg text-slate-300 mb-2">Which headline pulls you in more?</h3>
              <p className="text-sm text-slate-500">Topic: {currentHeadline.topic}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[currentHeadline.emotional, currentHeadline.neutral].map((headline, index) => (
                <button
                  key={index}
                  onClick={() => selectHeadline(index)}
                  disabled={selectedHeadline !== null}
                  className={cn(
                    'p-6 rounded-2xl border-2 transition-all text-left min-h-[120px] flex items-center',
                    'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900',
                    selectedHeadline === index
                      ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                      : selectedHeadline !== null
                      ? 'border-slate-700 text-slate-600 cursor-not-allowed'
                      : 'border-slate-600 hover:border-slate-500 text-slate-300 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-sm font-medium text-slate-400">
                      {index === 0 ? 'A' : 'B'}
                    </div>
                    <p className="text-lg leading-relaxed">{headline}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Selection Feedback */}
            {selectedHeadline !== null && (
              <div className="text-center">
                <div className="text-2xl text-amber-400 mb-2">✓</div>
                <p className="text-slate-400">
                  {selectedHeadline === 0 ? 'Emotional framing' : 'Neutral framing'} selected
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'results' && metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-2">Echo-Loop Results</h2>
            <p className="text-slate-400">Your bias detection training complete</p>
          </div>

          {/* Metrics */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 text-center">
              <div className="text-3xl font-light text-amber-400 mb-2">
                {metrics.emotionalBiasPercentage}%
              </div>
              <div className="text-sm text-slate-400">Emotional Bias</div>
              <div className="text-xs text-slate-500 mt-1">
                Times emotional framing won
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 text-center">
              <div className="text-3xl font-light text-blue-400 mb-2">
                {metrics.averageReactionTime}ms
              </div>
              <div className="text-sm text-slate-400">Avg Reaction Time</div>
              <div className="text-xs text-slate-500 mt-1">
                Speed of selection
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 text-center">
              <div className="text-3xl font-light text-emerald-400 mb-2">
                {metrics.selfAwarenessScore}
              </div>
              <div className="text-sm text-slate-400">Self-Awareness</div>
              <div className="text-xs text-slate-500 mt-1">
                Pattern recognition
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-4 mb-8">
            {metrics.emotionalBiasPercentage > 60 && (
              <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-700/50 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-200 mb-2">High Emotional Bias Detected</h4>
                    <p className="text-sm text-amber-300/80 leading-relaxed">
                      You selected emotional headlines {metrics.emotionalBiasPercentage}% of the time. 
                      Notice how emotion bypasses deliberation? This is normal—the key is awareness.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {metrics.averageReactionTime < 2000 && (
              <div className="bg-gradient-to-br from-blue-900/30 to-violet-900/30 border border-blue-700/50 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-200 mb-2">Fast Decision Making</h4>
                    <p className="text-sm text-blue-300/80 leading-relaxed">
                      Your average reaction time was {metrics.averageReactionTime}ms. 
                      Quick decisions can be efficient, but consider: are you thinking or reacting?
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-700/50 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-emerald-200 mb-2">Metacognitive Insight</h4>
                  <p className="text-sm text-emerald-300/80 leading-relaxed">
                    The goal isn't to avoid emotional headlines—it's to notice when emotion 
                    drives your attention. Awareness is the first step toward choice.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setStage('intro');
                setCurrentRound(0);
                setRoundResults([]);
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Play Again
            </button>
            <button
              onClick={() => router.push('/progress')}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-amber-500/20"
            >
              View Progress Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
