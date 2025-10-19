'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAutonomy } from '@/lib/hooks/useAutonomy';
import { AssessmentWrapper } from '@/components/assessment/AssessmentWrapper';
import { Radio, Users, TrendingUp, AlertCircle, Network, Sparkles } from 'lucide-react';
import { InfluenceSource } from '@/types';
import { autonomyStore } from '@/lib/store/autonomy-store';
import { cn } from '@/lib/utils';

/**
 * Influence Map - Information Provenance Visualization
 * 
 * Helps users:
 * 1. Log their primary information sources
 * 2. Categorize by type and perspective
 * 3. Visualize as a network graph
 * 4. Calculate homophily score (echo chamber index)
 * 5. Get suggestions for procedurally diverse sources
 * 
 * Metrics:
 * - Source diversity (0-100)
 * - Ideological range (left-center-right spread)
 * - Media type diversity (podcast, news, social, etc.)
 * - Echo chamber risk score
 */

interface Source {
  id: string;
  name: string;
  type: 'podcast' | 'news' | 'person' | 'community' | 'social';
  leaning: 'left' | 'center' | 'right' | 'unknown';
  trust: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string;
}

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  source: Source;
}

const sourceTypes = [
  { id: 'podcast', label: 'Podcast', icon: Radio },
  { id: 'news', label: 'News Site', icon: Network },
  { id: 'social', label: 'Social Media', icon: Users },
  { id: 'person', label: 'Person/Influencer', icon: Users },
  { id: 'community', label: 'Online Community', icon: Users },
];

const leanings = [
  { id: 'left', label: 'Progressive/Left', color: 'blue' },
  { id: 'center', label: 'Centrist', color: 'slate' },
  { id: 'right', label: 'Conservative/Right', color: 'red' },
  { id: 'unknown', label: 'Unknown/Mixed', color: 'violet' },
];

const frequencies = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

export default function InfluenceMapPage() {
  const router = useRouter();
  const { userId, loading: autonomyLoading } = useAutonomy();
  const [stage, setStage] = useState<'intro' | 'add-sources' | 'visualization' | 'insights'>('intro');
  const [sources, setSources] = useState<Source[]>([]);
  const [currentSource, setCurrentSource] = useState<Partial<Source>>({
    type: 'podcast',
    leaning: 'center',
    trust: 3,
    frequency: 'weekly',
    category: 'general'
  });
  const [nodes, setNodes] = useState<NetworkNode[]>([]);

  useEffect(() => {
    if (stage === 'visualization' && sources.length > 0) {
      generateNetwork();
    }
  }, [stage, sources]);

  const addSource = () => {
    if (!currentSource.name?.trim()) return;

    const newSource: Source = {
      id: Date.now().toString(),
      name: currentSource.name,
      type: currentSource.type || 'podcast',
      leaning: currentSource.leaning || 'center',
      trust: currentSource.trust || 3,
      frequency: currentSource.frequency || 'weekly',
      category: currentSource.category || 'general'
    };

    setSources(prev => [...prev, newSource]);
    setCurrentSource({
      type: 'podcast',
      leaning: 'center',
      trust: 3,
      frequency: 'weekly',
      category: 'general'
    });
  };

  const removeSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const generateNetwork = () => {
    const centerX = 200;
    const centerY = 200;
    const radius = 120;

    const newNodes: NetworkNode[] = sources.map((source, index) => {
      const angle = (index / sources.length) * 2 * Math.PI;
      const trustOffset = (source.trust - 3) * 15; // High trust = closer to center

      return {
        id: source.id,
        x: centerX + (radius - trustOffset) * Math.cos(angle),
        y: centerY + (radius - trustOffset) * Math.sin(angle),
        source
      };
    });

    setNodes(newNodes);
  };

  const calculateMetrics = () => {
    if (sources.length === 0) return null;

    // Type diversity (0-100)
    const uniqueTypes = new Set(sources.map(s => s.type)).size;
    const typeDiversity = (uniqueTypes / sourceTypes.length) * 100;

    // Ideological diversity (0-100)
    const leaningCounts: Record<string, number> = {};
    sources.forEach(s => {
      leaningCounts[s.leaning] = (leaningCounts[s.leaning] || 0) + 1;
    });
    
    const uniqueLeanings = Object.keys(leaningCounts).length;
    const ideologicalDiversity = (uniqueLeanings / leanings.length) * 100;

    // Homophily score (echo chamber risk: 0 = diverse, 100 = echo chamber)
    const dominantLeaning = Object.entries(leaningCounts)
      .sort((a, b) => b[1] - a[1])[0];
    const homophily = ((dominantLeaning?.[1] || 0) / sources.length) * 100;

    // Overall diversity (inverse of homophily)
    const overallDiversity = 100 - homophily;

    return {
      typeDiversity: Math.round(typeDiversity),
      ideologicalDiversity: Math.round(ideologicalDiversity),
      homophily: Math.round(homophily),
      overallDiversity: Math.round(overallDiversity),
      dominantLeaning: dominantLeaning?.[0] || 'none',
      totalSources: sources.length
    };
  };

  const getSuggestions = () => {
    const metrics = calculateMetrics();
    if (!metrics) return [];

    const suggestions: string[] = [];

    if (metrics.homophily > 60) {
      const underrepresented = leanings.find(
        l => !sources.find(s => s.leaning === l.id)
      );
      if (underrepresented) {
        suggestions.push(`Add a ${underrepresented.label} source to reduce echo chamber effect`);
      }
    }

    if (metrics.typeDiversity < 50) {
      const missingTypes = sourceTypes.filter(
        t => !sources.find(s => s.type === t.id)
      );
      if (missingTypes.length > 0) {
        suggestions.push(`Try adding a ${missingTypes[0].label} to diversify source types`);
      }
    }

    const unknownCount = sources.filter(s => s.leaning === 'unknown').length;
    if (unknownCount === 0) {
      suggestions.push('Consider adding non-political sources (science, culture, tech) for cognitive balance');
    }

    return suggestions;
  };

  const handleSaveProgress = async () => {
    if (!userId || sources.length === 0) return;

    try {
      // Save each source to the database
      for (const source of sources) {
        const influenceSource: InfluenceSource = {
          id: source.id,
          userId: userId(),
          name: source.name,
          type: source.type,
          leaning: source.leaning,
          trust: source.trust,
          frequency: source.frequency,
          category: source.category
        };
        await autonomyStore.saveInfluenceSource(influenceSource);
      }
      
      await autonomyStore.checkModuleMilestones(); // Check for completion milestones
      await autonomyStore.checkBadges(); // Check for new badges
      router.push('/progress');
    } catch (error) {
      console.error('Failed to save influence sources:', error);
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-400';
      case 'slate': return 'text-slate-400';
      case 'red': return 'text-red-400';
      case 'violet': return 'text-violet-400';
      default: return 'text-slate-400';
    }
  };

  const progress = 
    stage === 'intro' ? 0 :
    stage === 'add-sources' ? 50 :
    stage === 'visualization' ? 75 :
    100;

  if (autonomyLoading || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <p className="text-xl text-slate-400">Loading Influence Map...</p>
      </div>
    );
  }

  if (stage === 'intro') {
    return (
      <AssessmentWrapper
        title="Influence Map"
        description="Where do your beliefs actually come from?"
        progress={progress}
        onNext={() => setStage('add-sources')}
        nextLabel="Map My Sources →"
        icon={<Network className="w-5 h-5 text-white" />}
        showNav={false}
      >
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-medium text-slate-200">What you'll discover</h2>
            <p className="text-slate-400 leading-relaxed">
              Most people underestimate how homogeneous their information diet is. This exercise maps 
              your sources and reveals echo chamber patterns you might not notice day-to-day.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-xl p-4">
                <div className="text-2xl text-cyan-400 mb-1">📊</div>
                <div className="text-sm text-cyan-300">Source diversity score</div>
              </div>
              <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-xl p-4">
                <div className="text-2xl text-cyan-400 mb-1">🔍</div>
                <div className="text-sm text-cyan-300">Homophily detection</div>
              </div>
            </div>
          </div>

          <div className="bg-cyan-900/20 border border-cyan-700/30 rounded-xl p-4">
            <p className="text-sm text-cyan-300 leading-relaxed">
              <strong className="text-cyan-200">Privacy note:</strong> Your sources stay on your device. 
              We're showing you patterns, not judging content.
            </p>
          </div>
        </div>
      </AssessmentWrapper>
    );
  }

  if (stage === 'add-sources') {
    return (
      <AssessmentWrapper
        title="Log Your Information Sources"
        description="Add at least 5-10 sources for meaningful insights"
        progress={progress}
        onNext={() => setStage('visualization')}
        onBack={() => setStage('intro')}
        nextEnabled={sources.length >= 5}
        nextLabel="Visualize Network →"
        icon={<Network className="w-5 h-5 text-white" />}
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Add source form */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Add a Source</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Name</label>
                <input
                  type="text"
                  value={currentSource.name || ''}
                  onChange={(e) => setCurrentSource(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., 'NYT', 'Joe Rogan', 'r/politics'"
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Type</label>
                <select
                  value={currentSource.type}
                  onChange={(e) => setCurrentSource(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  aria-label="Source type"
                >
                  {sourceTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Perspective/Lean</label>
                <select
                  value={currentSource.leaning}
                  onChange={(e) => setCurrentSource(prev => ({ ...prev, leaning: e.target.value as any }))}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  aria-label="Source perspective or leaning"
                >
                  {leanings.map(l => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Trust Level: {currentSource.trust}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={currentSource.trust}
                  onChange={(e) => setCurrentSource(prev => ({ ...prev, trust: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  aria-label="Trust level from 1 to 5"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Frequency</label>
                <select
                  value={currentSource.frequency}
                  onChange={(e) => setCurrentSource(prev => ({ ...prev, frequency: e.target.value as any }))}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  aria-label="Source frequency"
                >
                  {frequencies.map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Category</label>
                <input
                  type="text"
                  value={currentSource.category || ''}
                  onChange={(e) => setCurrentSource(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., 'politics', 'tech', 'science'"
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <button
                onClick={addSource}
                disabled={!currentSource.name?.trim()}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all"
              >
                Add Source
              </button>
            </div>
          </div>

          {/* Current sources list */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-200">Your Sources ({sources.length})</h3>
              {sources.length >= 5 && (
                <span className="text-xs text-emerald-400">✓ Ready to visualize</span>
              )}
            </div>

            {sources.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No sources added yet. Start by adding your most-consulted news source, podcast, or influencer.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sources.map(source => {
                  const leaning = leanings.find(l => l.id === source.leaning);
                  return (
                    <div key={source.id} className="bg-slate-900/50 border border-slate-600 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-200">{source.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{source.type}</span>
                          <span className="text-xs text-slate-600">•</span>
                          <span className={cn("text-xs", getColorClasses(leaning?.color || 'slate'))}>
                            {leaning?.label}
                          </span>
                          <span className="text-xs text-slate-600">•</span>
                          <span className="text-xs text-slate-500">
                            {'⭐'.repeat(source.trust)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeSource(source.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </AssessmentWrapper>
    );
  }

  if (stage === 'visualization') {
    const metrics = calculateMetrics();
    
    return (
      <AssessmentWrapper
        title="Your Information Network"
        description="Visual representation of your sources"
        progress={progress}
        onNext={() => setStage('insights')}
        onBack={() => setStage('add-sources')}
        nextLabel="View Insights →"
        icon={<Network className="w-5 h-5 text-white" />}
      >
        <div className="space-y-6">
          {/* Network visualization */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Source Network</h3>
            <div className="relative mx-auto w-[400px] h-[400px]">
              <svg width="400" height="400" className="absolute inset-0">
                {/* Draw connections */}
                {nodes.map((node, i) => {
                  const nextNode = nodes[(i + 1) % nodes.length];
                  return (
                    <line
                      key={`line-${i}`}
                      x1={node.x}
                      y1={node.y}
                      x2={nextNode.x}
                      y2={nextNode.y}
                      stroke="rgba(6, 182, 212, 0.3)"
                      strokeWidth="1"
                    />
                  );
                })}
                
                {/* Draw nodes */}
                {nodes.map(node => {
                  const leaning = leanings.find(l => l.id === node.source.leaning);
                  const colorClasses = getColorClasses(leaning?.color || 'slate');
                  return (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={8 + node.source.trust * 2}
                        fill="rgba(6, 182, 212, 0.2)"
                        stroke="rgba(6, 182, 212, 0.6)"
                        strokeWidth="2"
                      />
                      <text
                        x={node.x}
                        y={node.y + 4}
                        textAnchor="middle"
                        className="text-xs fill-slate-300"
                      >
                        {node.source.name.substring(0, 3)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Metrics */}
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-light text-cyan-400 mb-1">{metrics.typeDiversity}</div>
                <div className="text-xs text-slate-400">Type Diversity</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-light text-blue-400 mb-1">{metrics.ideologicalDiversity}</div>
                <div className="text-xs text-slate-400">Ideological Diversity</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-light text-amber-400 mb-1">{metrics.homophily}</div>
                <div className="text-xs text-slate-400">Echo Chamber Risk</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-light text-emerald-400 mb-1">{metrics.overallDiversity}</div>
                <div className="text-xs text-slate-400">Overall Diversity</div>
              </div>
            </div>
          )}
        </div>
      </AssessmentWrapper>
    );
  }

  if (stage === 'insights') {
    const metrics = calculateMetrics();
    const suggestions = getSuggestions();
    
    return (
      <AssessmentWrapper
        title="Source Awareness Insights"
        description="Understanding your information ecosystem"
        progress={progress}
        onNext={handleSaveProgress}
        onBack={() => setStage('visualization')}
        nextLabel="Save Progress →"
        icon={<Network className="w-5 h-5 text-white" />}
      >
        <div className="space-y-6">
          {/* Overall assessment */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 text-center">
            <div className="text-4xl font-light text-slate-200 mb-2">
              {metrics?.overallDiversity || 0}
            </div>
            <div className="text-lg text-cyan-400 mb-4">
              {metrics && metrics.overallDiversity >= 70 ? 'Diverse' : 
               metrics && metrics.overallDiversity >= 40 ? 'Moderate' : 'Echo Chamber Risk'} 
              Information Diet
            </div>
            <p className="text-slate-300 leading-relaxed max-w-xl mx-auto">
              {metrics && metrics.overallDiversity >= 70 
                ? 'You have a well-balanced information diet with diverse sources and perspectives.'
                : metrics && metrics.overallDiversity >= 40
                ? 'Your information sources show moderate diversity. Consider adding more varied perspectives.'
                : 'Your information sources show high homophily. This creates echo chamber risk.'}
            </p>
          </div>

          {/* Detailed breakdown */}
          {metrics && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-slate-200 mb-4">Diversity Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Source Types</span>
                    <span className="text-slate-200">{metrics.typeDiversity}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Ideological Range</span>
                    <span className="text-slate-200">{metrics.ideologicalDiversity}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Sources</span>
                    <span className="text-slate-200">{metrics.totalSources}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Dominant Perspective</span>
                    <span className="text-slate-200">{metrics.dominantLeaning}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-slate-200 mb-4">Recommendations</h3>
                {suggestions.length > 0 ? (
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span className="text-sm text-slate-300">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Your information diet is well-balanced!</p>
                )}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-cyan-200 mb-3">What This Reveals</h3>
            <p className="text-sm text-cyan-300/80 leading-relaxed">
              Your <strong>Source Awareness (SA)</strong> score measures how consciously you curate your information diet. 
              High diversity indicates you're actively seeking multiple perspectives rather than defaulting to 
              algorithmically-curated echo chambers.
            </p>
            <p className="text-xs text-cyan-400/60 mt-3">
              Regular source auditing helps maintain epistemic independence and reduces susceptibility to ideological capture.
            </p>
          </div>
        </div>
      </AssessmentWrapper>
    );
  }

  return null;
}
