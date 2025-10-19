import React, { useState, useEffect } from 'react';
import { Radio, Users, TrendingUp, AlertCircle, Network, Sparkles } from 'lucide-react';

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
  type: 'podcast' | 'news' | 'social' | 'person' | 'community' | 'other';
  perspective: 'left' | 'center-left' | 'center' | 'center-right' | 'right' | 'non-political';
  influence: number; // 1-5 how often you consult this source
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
  { id: 'other', label: 'Other', icon: Sparkles },
];

const perspectives = [
  { id: 'left', label: 'Progressive/Left', color: 'blue' },
  { id: 'center-left', label: 'Center-Left', color: 'cyan' },
  { id: 'center', label: 'Centrist', color: 'slate' },
  { id: 'center-right', label: 'Center-Right', color: 'orange' },
  { id: 'right', label: 'Conservative/Right', color: 'red' },
  { id: 'non-political', label: 'Non-Political', color: 'violet' },
];

export default function InfluenceMap() {
  const [stage, setStage] = useState<'intro' | 'add-sources' | 'visualization' | 'insights'>('intro');
  const [sources, setSources] = useState<Source[]>([]);
  const [currentSource, setCurrentSource] = useState<Partial<Source>>({
    type: 'podcast',
    perspective: 'center',
    influence: 3
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
      type: currentSource.type || 'other',
      perspective: currentSource.perspective || 'center',
      influence: currentSource.influence || 3
    };

    setSources(prev => [...prev, newSource]);
    setCurrentSource({
      type: 'podcast',
      perspective: 'center',
      influence: 3
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
      const influenceOffset = (source.influence - 3) * 15; // High influence = closer to center

      return {
        id: source.id,
        x: centerX + (radius - influenceOffset) * Math.cos(angle),
        y: centerY + (radius - influenceOffset) * Math.sin(angle),
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
    const perspectiveCounts: Record<string, number> = {};
    sources.forEach(s => {
      perspectiveCounts[s.perspective] = (perspectiveCounts[s.perspective] || 0) + 1;
    });
    
    const uniquePerspectives = Object.keys(perspectiveCounts).length;
    const ideologicalDiversity = (uniquePerspectives / perspectives.length) * 100;

    // Homophily score (echo chamber risk: 0 = diverse, 100 = echo chamber)
    const dominantPerspective = Object.entries(perspectiveCounts)
      .sort((a, b) => b[1] - a[1])[0];
    const homophily = ((dominantPerspective?.[1] || 0) / sources.length) * 100;

    // Overall diversity (inverse of homophily)
    const overallDiversity = 100 - homophily;

    return {
      typeDiversity: Math.round(typeDiversity),
      ideologicalDiversity: Math.round(ideologicalDiversity),
      homophily: Math.round(homophily),
      overallDiversity: Math.round(overallDiversity),
      dominantPerspective: dominantPerspective?.[0] || 'none',
      totalSources: sources.length
    };
  };

  const getSuggestions = () => {
    const metrics = calculateMetrics();
    if (!metrics) return [];

    const suggestions: string[] = [];

    if (metrics.homophily > 60) {
      const underrepresented = perspectives.find(
        p => !sources.find(s => s.perspective === p.id)
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

    const nonPoliticalCount = sources.filter(s => s.perspective === 'non-political').length;
    if (nonPoliticalCount === 0) {
      suggestions.push('Consider adding non-political sources (science, culture, tech) for cognitive balance');
    }

    return suggestions;
  };

  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Network className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-light">Influence Map</h1>
          </div>

          <div className="space-y-6 mb-8">
            <p className="text-xl text-slate-300 font-light">
              Where do your beliefs actually come from?
            </p>

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

          <button
            onClick={() => setStage('add-sources')}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/20"
          >
            Map My Sources
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'add-sources') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto pt-12">
          <h2 className="text-2xl font-light mb-2">Log Your Information Sources</h2>
          <p className="text-slate-400 mb-8">Add at least 5-10 sources for meaningful insights</p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
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
                  >
                    {sourceTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Perspective/Lean</label>
                  <select
                    value={currentSource.perspective}
                    onChange={(e) => setCurrentSource(prev => ({ ...prev, perspective: e.target.value as any }))}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    {perspectives.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Influence (how often you check): {currentSource.influence}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={currentSource.influence}
                    onChange={(e) => setCurrentSource(prev => ({ ...prev, influence: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Rarely</span>
                    <span>Daily</span>
                  </div>
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
                    const perspective = perspectives.find(p => p.id === source.perspective);
                    return (
                      <div key={source.id} className="bg-slate-900/50 border border-slate-600 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-200">{source.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">{source.type}</span>
                            <span className="text-xs text-slate-600">•</span>
                            <span className={`text-xs text-${perspective?.color}-400`}>
                              {perspective?.label}
                            </span>
                            <span className="text-xs text-slate-600">•</span>
                            <span className="text-xs text-slate-500">
                              {'⭐'.repeat(source.influence)}
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

          <div className="flex gap-4">
            <button
              onClick={() => setStage('intro')}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStage('visualization')}
              disabled={sources.length < 3}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Visualize Network ({sources.length} sources) →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'visualization') {
    const metrics = calculateMetrics();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-5xl mx-auto pt-12">
          <h2 className="text-2xl font-light mb-2 text-center">Your Information Network</h2>
          <p className="text-slate-400 mb-8 text-center">Source proximity to center = influence frequency</p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-medium text-slate-400">Overall Diversity</h3>
              </div>
              <div className="text-4xl font-light text-slate-200 mb-1">
                {metrics?.overallDiversity}
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                  style={{ width: `${metrics?.overallDiversity}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-medium text-slate-400">Echo Chamber Risk</h3>
              </div>
              <div className="text-4xl font-light text-slate-200 mb-1">
                {metrics?.homophily}%
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all"
                  style={{ width: `${metrics?.homophily}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Network className="w-5 h-5 text-violet-400" />
                <h3 className="text-sm font-medium text-slate-400">Total Sources</h3>
              </div>
              <div className="text-4xl font-light text-slate-200 mb-1">
                {metrics?.totalSources}
              </div>
              <p className="text-xs text-slate-500">
                {metrics && metrics.totalSources >= 10 ? 'Good sample size' : 'Add more for accuracy'}
              </p>
            </div>
          </div>

          {/* Network visualization */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8">
            <div className="relative" style={{ height: '400px' }}>
              <svg width="100%" height="100%" viewBox="0 0 400 400">
                {/* Center node (you) */}
                <circle cx="200" cy="200" r="12" fill="rgb(34, 211, 238)" opacity="0.3" />
                <circle cx="200" cy="200" r="6" fill="rgb(34, 211, 238)" />
                <text x="200" y="225" textAnchor="middle" fill="rgb(148, 163, 184)" fontSize="12">
                  You
                </text>

                {/* Connection lines */}
                {nodes.map(node => (
                  <line
                    key={`line-${node.id}`}
                    x1="200"
                    y1="200"
                    x2={node.x}
                    y2={node.y}
                    stroke="rgb(71, 85, 105)"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                ))}

                {/* Source nodes */}
                {nodes.map(node => {
                  const perspective = perspectives.find(p => p.id === node.source.perspective);
                  const colorMap: Record<string, string> = {
                    blue: 'rgb(59, 130, 246)',
                    cyan: 'rgb(34, 211, 238)',
                    slate: 'rgb(148, 163, 184)',
                    orange: 'rgb(251, 146, 60)',
                    red: 'rgb(239, 68, 68)',
                    violet: 'rgb(167, 139, 250)'
                  };
                  const color = colorMap[perspective?.color || 'slate'];

                  return (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={4 + node.source.influence}
                        fill={color}
                        opacity="0.8"
                      />
                      <text
                        x={node.x}
                        y={node.y - 12}
                        textAnchor="middle"
                        fill="rgb(203, 213, 225)"
                        fontSize="10"
                      >
                        {node.source.name.length > 15 
                          ? node.source.name.substring(0, 12) + '...' 
                          : node.source.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {perspectives.map(p => (
                <div key={p.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${p.color}-500`} />
                  <span className="text-xs text-slate-400">{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStage('insights')}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/20"
          >
            See Detailed Insights →
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'insights') {
    const metrics = calculateMetrics();
    const suggestions = getSuggestions();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-3xl mx-auto pt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-2">Network Insights</h2>
            <p className="text-slate-400">What your information diet reveals</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Diversity Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Type Diversity</span>
                    <span className="text-sm text-slate-200">{metrics?.typeDiversity}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${metrics?.typeDiversity}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Ideological Range</span>
                    <span className="text-sm text-slate-200">{metrics?.ideologicalDiversity}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-500 transition-all"
                      style={{ width: `${metrics?.ideologicalDiversity}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Pattern Detection</h3>
              <div className="space-y-3">
                {metrics && metrics.homophily > 60 && (
                  <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-amber-300">High Homophily</div>
                        <div className="text-xs text-amber-400/70 mt-1">
                          {metrics.homophily}% of sources share similar perspective
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {metrics && metrics.ideologicalDiversity < 40 && (
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-blue-300">Narrow Range</div>
                        <div className="text-xs text-blue-400/70 mt-1">
                          Limited ideological diversity detected
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-700/50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-medium text-cyan-200 mb-4">Suggestions for Diversity</h3>
              <ul className="space-y-3">
                {suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-sm flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-cyan-300">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-medium text-slate-200 mb-3">What This Means</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              Information diversity doesn't mean you need to agree with all perspectives—it means you're 
              <strong> aware of your information inputs</strong> and can make informed choices about exposure.
            </p>
            <p className="text-xs text-slate-500">
              High homophily correlates with increased certainty, reduced cognitive flexibility, and 
              susceptibility to confirmation bias.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStage('add-sources')}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Add More Sources
            </button>
            <button
              onClick={() => alert('In full app: Save Source Awareness score to Progress Dashboard')}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/20"
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
