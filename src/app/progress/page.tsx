'use client';

import React, { useState, useEffect } from 'react';
import { ConstructRadar } from '@/components/visualizations/ConstructRadar';
import { ScoreCard } from '@/components/visualizations/ScoreCard';
import { TrendChart } from '@/components/visualizations/TrendChart';
import { useProfile } from '@/lib/hooks/useAutonomy';
import { useStreak } from '@/lib/hooks/useStreak';
import { useProgress } from '@/lib/hooks/useProgress';
import { useAutonomy } from '@/lib/hooks/useAutonomy';
import { autonomyStore } from '@/lib/store/autonomy-store';
import { useRouter } from 'next/navigation';
import { Badge } from '@/types';
import { TrendingUp, Calendar, Target, Download, RefreshCw, Award, Trophy, Star, Brain, Heart, Shield, Network, Scale, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pdfExporter, PDFReportData } from '@/lib/utils/pdf-exporter';

export default function ProgressDashboardPage() {
  const router = useRouter();
  const { profile, recalculateProfile, loading: profileLoading } = useProfile();
  const { streak, updateStreak, getStreakMessage, loading: streakLoading } = useStreak();
  const { progressData, addAhaMoment, getProgressInsights, getSuggestedModule, loading: progressLoading } = useProgress();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('all');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [phase2Stats, setPhase2Stats] = useState({
    disconfirmGames: 0,
    schemaReclaims: 0,
    influenceSources: 0,
    reflections: 0
  });
  const [phase3Stats, setPhase3Stats] = useState({
    argumentFlips: 0,
    sourceAudits: 0,
    ehScore: 0,
    iiScore: 0
  });
  const [loadingPhase2, setLoadingPhase2] = useState(true);
  const [loadingPhase3, setLoadingPhase3] = useState(true);

  useEffect(() => {
    // Update streak when component mounts
    updateStreak();
  }, [updateStreak]);

  useEffect(() => {
    // Load Phase 2 data
    const loadPhase2Data = async () => {
      try {
        const { userId } = useAutonomy();
        const user = userId();
        if (!user) return;

        const [
          badgesData,
          disconfirmGames,
          schemaReclaims,
          influenceSources,
          reflections
        ] = await Promise.all([
          autonomyStore.checkBadges(),
          autonomyStore.getDisconfirmGames(user),
          autonomyStore.getSchemaReclaims(user),
          autonomyStore.getInfluenceSources(user),
          autonomyStore.getDailyReflections(user)
        ]);

        setBadges(badgesData);
        setPhase2Stats({
          disconfirmGames: disconfirmGames.length,
          schemaReclaims: schemaReclaims.length,
          influenceSources: influenceSources.length,
          reflections: reflections.length
        });
      } catch (error) {
        console.error('Failed to load Phase 2 data:', error);
      } finally {
        setLoadingPhase2(false);
      }
    };

    loadPhase2Data();
  }, []);

  useEffect(() => {
    // Load Phase 3 data
    const loadPhase3Data = async () => {
      try {
        const { userId } = useAutonomy();
        const user = userId();
        if (!user) return;

        const [
          argumentFlips,
          sourceAudits
        ] = await Promise.all([
          autonomyStore.getArgumentFlips(user),
          autonomyStore.getSourceAudits(user)
        ]);

        // Calculate EH and II scores
        const { calculateEH, calculateII } = await import('@/lib/scoring/scoring-engine');
        const ehScore = calculateEH(argumentFlips);
        const iiScore = calculateII(sourceAudits);

        setPhase3Stats({
          argumentFlips: argumentFlips.length,
          sourceAudits: sourceAudits.length,
          ehScore,
          iiScore
        });
      } catch (error) {
        console.error('Failed to load Phase 3 data:', error);
      } finally {
        setLoadingPhase3(false);
      }
    };

    loadPhase3Data();
  }, []);

  const handleExport = async () => {
    try {
      const { userId } = useAutonomy();
      const user = userId();
      if (!user || !profile) return;

      // Gather all data for PDF report
      const [
        badgesData,
        reflections,
        disconfirmGames,
        schemaReclaims,
        influenceSources
      ] = await Promise.all([
        autonomyStore.checkBadges(),
        autonomyStore.getDailyReflections(user),
        autonomyStore.getDisconfirmGames(user),
        autonomyStore.getSchemaReclaims(user),
        autonomyStore.getInfluenceSources(user)
      ]);

      const reportData: PDFReportData = {
        profile,
        streak,
        badges: badgesData,
        reflections,
        disconfirmGames,
        schemaReclaims,
        influenceSources,
        generatedAt: new Date()
      };

      // Generate PDF report
      const pdfBlob = await pdfExporter.generateReport(reportData);
      
      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reflector-progress-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  const suggestedModule = profile ? getSuggestedModule(profile) : null;
  const insights = getProgressInsights();

  if (profileLoading || streakLoading || progressLoading || loadingPhase2 || loadingPhase3) {
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
    <div id="progress-dashboard" className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
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
              title="Recalculate Profile"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all"
              title="Export PDF Report"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Badge Gallery */}
        {badges.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-medium mb-6 text-slate-200 flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              Achievements ({badges.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-center hover:border-amber-500/50 transition-all"
                >
                  <div className="text-2xl mb-2">{badge.icon}</div>
                  <div className="text-xs font-medium text-slate-200 mb-1">{badge.name}</div>
                  <div className="text-xs text-slate-400">{badge.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase 2 Module Status */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-medium mb-6 text-slate-200 flex items-center gap-2">
            <Brain className="w-6 h-6 text-violet-400" />
            Phase 2 Modules
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-5 h-5 text-violet-400" />
                <span className="text-sm font-medium text-slate-200">Disconfirm Game</span>
              </div>
              <div className="text-2xl font-light text-violet-400 mb-1">{phase2Stats.disconfirmGames}</div>
              <div className="text-xs text-slate-400">Games completed</div>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-5 h-5 text-rose-400" />
                <span className="text-sm font-medium text-slate-200">Schema Reclaim</span>
              </div>
              <div className="text-2xl font-light text-rose-400 mb-1">{phase2Stats.schemaReclaims}</div>
              <div className="text-xs text-slate-400">Sessions completed</div>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Network className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-medium text-slate-200">Influence Map</span>
              </div>
              <div className="text-2xl font-light text-cyan-400 mb-1">{phase2Stats.influenceSources}</div>
              <div className="text-xs text-slate-400">Sources mapped</div>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-slate-200">Daily Reflections</span>
              </div>
              <div className="text-2xl font-light text-emerald-400 mb-1">{phase2Stats.reflections}</div>
              <div className="text-xs text-slate-400">Reflections completed</div>
            </div>
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
              interpretation={profile.interpretation[construct as keyof typeof profile.interpretation]}
            />
          ))}
        </div>

        {/* Phase 3 Constructs */}
        {(phase3Stats.ehScore > 0 || phase3Stats.iiScore > 0) && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-medium mb-6 text-slate-200">Advanced Constructs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {phase3Stats.ehScore > 0 && (
                <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-700/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Scale className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-indigo-200">Epistemic Honesty (EH)</h3>
                      <p className="text-sm text-indigo-400">Intellectual charity in argumentation</p>
                    </div>
                  </div>
                  <div className="text-4xl font-light text-indigo-200 mb-2">{phase3Stats.ehScore}</div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                      style={{ width: `${phase3Stats.ehScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-400">
                    Based on {phase3Stats.argumentFlips} Argument Flip{phase3Stats.argumentFlips !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
              
              {phase3Stats.iiScore > 0 && (
                <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 border border-teal-700/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-teal-200">Intellectual Independence (II)</h3>
                      <p className="text-sm text-teal-400">Source diversity & evidence verification</p>
                    </div>
                  </div>
                  <div className="text-4xl font-light text-teal-200 mb-2">{phase3Stats.iiScore}</div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-1000"
                      style={{ width: `${phase3Stats.iiScore}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-400">
                    Based on {phase3Stats.sourceAudits} Source Audit{phase3Stats.sourceAudits !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            onClick={() => router.push('/loops/disconfirm')}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl p-4 transition-all"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-medium text-slate-200">Disconfirm Game</div>
              <div className="text-xs text-slate-500">Practice falsifiability</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/mirrors/schema')}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl p-4 transition-all"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="text-sm font-medium text-slate-200">Schema Reclaim</div>
              <div className="text-xs text-slate-500">Emotional regulation</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/loops/influence')}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl p-4 transition-all"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-sm font-medium text-slate-200">Influence Map</div>
              <div className="text-xs text-slate-500">Map your sources</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/loops/argument-flip')}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl p-4 transition-all"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">⚖️</div>
              <div className="text-sm font-medium text-slate-200">Argument Flip</div>
              <div className="text-xs text-slate-500">Steelman practice</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/loops/source-audit')}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl p-4 transition-all"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-sm font-medium text-slate-200">Source Audit</div>
              <div className="text-xs text-slate-500">Track belief origins</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/reflect')}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl p-4 transition-all"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">💭</div>
              <div className="text-sm font-medium text-slate-200">Daily Reflection</div>
              <div className="text-xs text-slate-500">Build metacognitive awareness</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/library')}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl p-4 transition-all"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="text-sm font-medium text-slate-200">Knowledge Library</div>
              <div className="text-xs text-slate-500">Learn about cognitive patterns</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/loops/echo')}
            className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl p-4 transition-all"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🎮</div>
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
