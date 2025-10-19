'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAutonomy } from '@/lib/hooks/useAutonomy';
import { useStreak } from '@/lib/hooks/useStreak';
import { autonomyStore } from '@/lib/store/autonomy-store';
import { DailyReflection } from '@/types';
import { Brain, Clock, CheckCircle2, Sparkles, Lightbulb, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const reflectionPrompts = {
  disconfirm: [
    "What's one belief you held today that you could test with evidence?",
    "If you had to prove yourself wrong about something, what would you look for?",
    "What assumption did you make today that you haven't verified?",
    "What would change your mind about a position you took today?"
  ],
  emotion: [
    "When did you feel most defensive today? What triggered that response?",
    "What emotional reaction did you have that surprised you?",
    "How did your mood affect your judgment today?",
    "What belief felt threatened today, and why?"
  ],
  source: [
    "Where did your strongest opinion today come from?",
    "What source influenced you most today, and how do you know it's reliable?",
    "Did you seek out opposing viewpoints on anything today?",
    "What information did you accept without questioning today?"
  ],
  meta: [
    "What cognitive pattern did you notice in yourself today?",
    "How did you handle uncertainty today?",
    "What would you do differently if you could re-live today?",
    "What insight about your thinking surprised you today?"
  ]
};

const categories = [
  { id: 'disconfirm', label: 'Falsifiability', icon: Brain, color: 'violet' },
  { id: 'emotion', label: 'Emotional Awareness', icon: Heart, color: 'rose' },
  { id: 'source', label: 'Source Awareness', icon: Sparkles, color: 'cyan' },
  { id: 'meta', label: 'Metacognition', icon: Lightbulb, color: 'amber' }
];

export default function ReflectPage() {
  const router = useRouter();
  const { userId, loading: autonomyLoading } = useAutonomy();
  const { streak, updateStreak, getStreakMessage } = useStreak();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setTimeSpent(elapsed);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime]);

  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const prompts = reflectionPrompts[categoryId as keyof typeof reflectionPrompts];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setCurrentPrompt(randomPrompt);
    setStartTime(new Date());
  };

  const saveReflection = async () => {
    if (!userId || !selectedCategory || !response.trim()) return;

    const reflection: DailyReflection = {
      id: crypto.randomUUID(),
      userId,
      date: new Date(),
      prompt: currentPrompt,
      category: selectedCategory as DailyReflection['category'],
      response: response.trim(),
      timeSpent,
      insightFlagged: response.length > 100 // Simple heuristic for "insightful" responses
    };

    try {
      await autonomyStore.saveDailyReflection(reflection);
      await updateStreak(); // Update streak after reflection
      await autonomyStore.checkBadges(); // Check for new badges
      setIsComplete(true);
    } catch (error) {
      console.error('Failed to save reflection:', error);
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'violet': return 'bg-violet-900/20 border-violet-700/30 text-violet-300';
      case 'rose': return 'bg-rose-900/20 border-rose-700/30 text-rose-300';
      case 'cyan': return 'bg-cyan-900/20 border-cyan-700/30 text-cyan-300';
      case 'amber': return 'bg-amber-900/20 border-amber-700/30 text-amber-300';
      default: return 'bg-slate-900/20 border-slate-700/30 text-slate-300';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (autonomyLoading || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <p className="text-xl text-slate-400">Loading reflection space...</p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-2xl mx-auto pt-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-light text-slate-100 mb-4">Reflection Complete</h1>
            <p className="text-lg text-slate-300 mb-6">
              You spent {formatTime(timeSpent)} reflecting on {categories.find(c => c.id === selectedCategory)?.label.toLowerCase()}.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-medium text-slate-200 mb-4">Your Reflection</h2>
            <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
              <p className="text-sm text-slate-400 mb-2">Prompt:</p>
              <p className="text-slate-300 italic">"{currentPrompt}"</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-sm text-slate-400 mb-2">Your response:</p>
              <p className="text-slate-200 leading-relaxed">{response}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 border border-emerald-700/50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-medium text-emerald-200 mb-3">Streak Update</h3>
            <p className="text-emerald-300 mb-4">{getStreakMessage()}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-400">Current streak: {streak.current} days</span>
              <span className="text-sm text-emerald-400">Longest: {streak.longest} days</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setIsComplete(false);
                setSelectedCategory('');
                setResponse('');
                setTimeSpent(0);
                setStartTime(null);
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition-all"
            >
              Reflect Again
            </button>
            <button
              onClick={() => router.push('/progress')}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20"
            >
              View Progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto pt-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-light">Daily Reflection</h1>
            </div>
            <p className="text-xl text-slate-300 font-light max-w-2xl mx-auto">
              Take a moment to examine your thinking patterns. Choose a focus area for today's reflection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => selectCategory(category.id)}
                  className={cn(
                    "p-6 rounded-2xl border transition-all hover:scale-105 text-left",
                    getCategoryColor(category.color)
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-6 h-6" />
                    <h3 className="text-lg font-medium">{category.label}</h3>
                  </div>
                  <p className="text-sm opacity-80">
                    {category.id === 'disconfirm' && "Practice identifying falsifiable conditions for your beliefs"}
                    {category.id === 'emotion' && "Notice how emotions influence your reasoning"}
                    {category.id === 'source' && "Examine where your information and opinions come from"}
                    {category.id === 'meta' && "Think about your thinking patterns and biases"}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-slate-200 mb-3">Why Reflect?</h3>
            <p className="text-slate-400 leading-relaxed mb-4">
              Daily reflection builds metacognitive awareness—the ability to observe and understand 
              your own thinking patterns. This practice helps you:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li>Recognize when emotions are driving your reasoning</li>
              <li>Identify sources of bias and assumption</li>
              <li>Develop more calibrated confidence in your beliefs</li>
              <li>Build resilience against manipulation</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
      <div className="max-w-3xl mx-auto pt-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory('')}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{formatTime(timeSpent)}</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {(() => {
              const category = categories.find(c => c.id === selectedCategory);
              const Icon = category?.icon;
              return (
                <>
                  <Icon className="w-6 h-6 text-slate-300" />
                  <h1 className="text-2xl font-light text-slate-100">{category?.label}</h1>
                </>
              );
            })()}
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-medium text-slate-200 mb-4">Reflection Prompt</h2>
            <p className="text-slate-300 leading-relaxed text-lg italic">
              "{currentPrompt}"
            </p>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-lg font-medium text-slate-200 mb-4">
            Your Response
          </label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Take your time to think deeply about this question. There's no right or wrong answer—just honest self-examination."
            className="w-full h-64 bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-slate-500">
              {response.length} characters
            </span>
            <span className="text-sm text-slate-500">
              {response.length > 100 ? '✨ Insightful response!' : 'Keep going...'}
            </span>
          </div>
        </div>

        <button
          onClick={saveReflection}
          disabled={!response.trim()}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20"
        >
          Complete Reflection
        </button>
      </div>
    </div>
  );
}
