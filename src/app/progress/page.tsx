'use client';

import React, { useState, useEffect } from 'react';
import { ConstructRadar } from '@/components/visualizations/ConstructRadar';
import { ScoreCard } from '@/components/visualizations/ScoreCard';
import { TrendChart } from '@/components/visualizations/TrendChart';
import { useProfile } from '@/lib/hooks/useAutonomy';
import { useStreak } from '@/lib/hooks/useStreak';
import { useProgress } from '@/lib/hooks/useProgress';
import { useRouter } from 'next/navigation';
import { TrendingUp, Calendar, Target, Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProgressDashboardPage() {
  const router = useRouter();
  const { profile, recalculateProfile, loading: profileLoading } = useProfile();
  const { streak, updateStreak, getStreakMessage, loading: streakLoading } = useStreak();
  const { progressData, addAhaMoment, getProgressInsights, getSuggestedModule, loading: progressLoading } = useProgress();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('all');

  useEffect(() => {
    // Update streak when component mounts
    updateStreak();
  }, [updateStreak]);

  const handleExport = async () => {
    try {
      const { exportData } = await import('@/lib/hooks/useAutonomy');
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reflector-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const suggestedModule = profile ? getSuggestedModule(profile) : null;
  const insights = getProgressInsights();

  if (profileLoading || streakLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-md text-center">
          <Target className="w-16 h-16 text-slate-400 mx-auto mb-6" />
          <h2 className="text-2xl font-light mb-4">No Progress Data Yet</h2>
          <p className="text-slate-400 mb-8">
            Complete the Baseline Mirror assessment to start tracking your epistemic autonomy journey.
          </p>
          <button
            onClick={() => router.push('/mirrors/baseline')}
            className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
          >
            Begin Baseline Mirror
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light mb-2">Progress Dashboard</h1>
            <p className="text-slate-400">Your epistemic autonomy journey</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={recalculateProfile}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Streak Display */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-light text-violet-400 mb-1">{streak.current}</div>
                <div className="text-sm text-slate-400">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-blue-400 mb-1">{streak.longest}</div>
                <div className="text-sm text-slate-400">Longest Streak</div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-300">{getStreakMessage()}</p>
              <div className="flex gap-2 mt-2">
                {Object.entries(streak.milestones).map(([milestone, achieved]) => (
                  <div
                    key={milestone}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs',
                      achieved ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
                    )}
                  >
                    {milestone === 'seven' ? '7' : milestone === 'twentyOne' ? '21' : '60'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Radar Chart */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-medium mb-6 text-slate-200">Current Autonomy Profile</h2>
          <ConstructRadar scores={profile.scores} />
        </div>

        {/* Individual Score Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {Object.entries(profile.scores).map(([construct, score]) => (
            <ScoreCard
              key={construct}
              construct={construct as any}
              score={score}
              interpretation={profile.interpretation[construct as any]}
            />
          ))}
        </div>

        {/* Trend Chart */}
        {progressData.historicalScores.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-medium mb-6 text-slate-200">Progress Over Time</h2>
            <TrendChart
              data={progressData.historicalScores}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
        )}

        {/* Insights and Suggestions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Progress Insights */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-medium mb-4 text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Progress Insights
            </h3>
            {insights.length > 0 ? (
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <p key={index} className="text-sm text-slate-300 leading-relaxed">
                    {insight}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Complete more assessments to see progress insights.
              </p>
            )}
          </div>

          {/* Suggested Next Module */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-medium mb-4 text-slate-200 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              Suggested Next Step
            </h3>
            {suggestedModule ? (
              <div>
                <p className="text-sm text-slate-300 mb-3">
                  {suggestedModule.message}
                </p>
                <button
                  onClick={() => {
                    const routes = {
                      'Baseline Mirror': '/mirrors/baseline',
                      'Disconfirm Practice': '/loops/disconfirm',
                      'Influence Map': '/mirrors/influence',
                      'Schema Reclaim': '/loops/schema'
                    };
                    const route = routes[suggestedModule.module as keyof typeof routes];
                    if (route) router.push(route);
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20"
                >
                  Try {suggestedModule.module}
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                All constructs are well-balanced. Continue exploring different modules.
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/mirrors/baseline')}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl p-4 transition-all"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🧠</div>
              <div className="text-sm font-medium text-slate-200">Baseline Mirror</div>
              <div className="text-xs text-slate-500">Reassess your autonomy</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/loops/echo')}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl p-4 transition-all"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-medium text-slate-200">Echo-Loop Game</div>
              <div className="text-xs text-slate-500">Train bias detection</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/settings')}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl p-4 transition-all"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="text-sm font-medium text-slate-200">Settings</div>
              <div className="text-xs text-slate-500">Export & preferences</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
