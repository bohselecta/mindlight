import React, { useState, useEffect } from 'react';
import { Radio, Share2, Users, TrendingUp, AlertCircle, Globe, MessageSquare } from 'lucide-react';

interface Source {
  id: string;
  name: string;
  type: 'person' | 'platform' | 'community' | 'media';
  leaning: 'left' | 'center' | 'right' | 'neutral' | 'unknown';
  frequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  trust: number; // 1-10 scale
}

interface InfluenceMetrics {
  totalSources: number;
  uniquePerspectives: number;
  homophilyScore: number; // 0-100, higher = more echo chamber
  diversityIndex: number; // 0-100, higher = more diverse
  avgTrust: number;
  topLeaning: string;
}

export default function InfluenceMap() {
  const [stage, setStage] = useState<'intro' | 'collection' | 'visualization'>('intro');
  const [sources, setSources] = useState<Source[]>([]);
  const [currentSource, setCurrentSource] = useState<Partial<Source>>({});
  const [metrics, setMetrics] = useState<InfluenceMetrics | null>(null);

  useEffect(() => {
    if (sources.length > 0) {
      setMetrics(calculateMetrics(sources));
    }
  }, [sources]);

  const calculateMetrics = (sources: Source[]): InfluenceMetrics => {
    const leanings = sources.map(s => s.leaning).filter(l => l !== 'unknown');
    const uniqueLeanings = new Set(leanings);
    
    // Homophily: how clustered are sources?
    const leaningCounts = leanings.reduce((acc, l) => {
      acc[l] = (acc[l] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const maxCount = Math.max(...Object.values(leaningCounts));
    const homophilyScore = sources.length > 0 
      ? Math.round((maxCount / sources.length) * 100) 
      : 0;

    // Diversity: number of unique perspectives / total
    const diversityIndex = sources.length > 0
      ? Math.round((uniqueLeanings.size / 5) * 100) // 5 possible leanings
      : 0;

    const avgTrust = sources.length > 0
      ? sources.reduce((sum, s) => sum + s.trust, 0) / sources.length
      : 0;

    const topLeaning = Object.entries(leaningCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

    return {
      totalSources: sources.length,
      uniquePerspectives: uniqueLeanings.size,
      homophilyScore,
      diversityIndex,
      avgTrust: Math.round(avgTrust * 10) / 10,
      topLeaning
    };
  };

  const addSource = () => {
    if (currentSource.name && currentSource.type) {
      const newSource: Source = {
        id: Date.now().toString(),
        name: currentSource.name,
        type: currentSource.type as Source['type'],
        leaning: currentSource.leaning || 'unknown',
        frequency: currentSource.frequency || 'weekly',
        trust: currentSource.trust || 5
      };
      setSources([...sources, newSource]);
      setCurrentSource({});
    }
  };

  const removeSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
  };

  const getLeaningColor = (leaning: string) => {
    const colors = {
      left: 'bg-blue-500',
      center: 'bg-purple-500',
      right: 'bg-red-500',
      neutral: 'bg-slate-500',
      unknown: 'bg-slate-600'
    };
    return colors[leaning as keyof typeof colors] || colors.unknown;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      person: Users,
      platform: Globe,
      community: MessageSquare,
      media: Radio
    };
    const Icon = icons[type as keyof typeof icons] || Share2;
    return <Icon className="w-4 h-4" />;
  };

  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-400 rounded-xl flex items-center justify-center">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-light tracking-tight">Influence Map</h1>
          </div>

          <div className="space-y-6 mb-8">
            <p className="text-xl text-slate-300 font-light">
              Map your information ecosystem to reveal hidden patterns.
            </p>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-medium text-slate-200">How it works</h2>
              <ol className="space-y-3 text-slate-400">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-sm">1</span>
                  <span>List the people, platforms, and communities that shape your worldview</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-sm">2</span>
                  <span>Tag each source's perspective and your trust level</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-sm">3</span>
                  <span>See your homophily score and diversity index visualized</span>
                </li>
              </ol>
            </div>

            <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-300/80">
                  <p className="font-medium text-amber-200 mb-1">What we'll measure</p>
                  <p className="leading-relaxed">
                    Echo chamber tendency (homophily), source diversity, perspective balance, 
                    and trust calibration. This isn't about being "balanced"—it's about awareness.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStage('collection')}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/20"
          >
            Begin Source Audit
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'collection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-light mb-2">Source Collection</h2>
          <p className="text-slate-400 mb-8">
            Add at least 5 sources that significantly influence how you think about the world.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Add Source Form */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-medium mb-4 text-slate-200">Add a Source</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="e.g., New York Times, Joe Rogan, r/philosophy"
                    value={currentSource.name || ''}
                    onChange={(e) => setCurrentSource({ ...currentSource, name: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['person', 'platform', 'community', 'media'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setCurrentSource({ ...currentSource, type })}
                        className={`p-3 rounded-lg border-2 transition-all text-sm capitalize ${
                          currentSource.type === type
                            ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                            : 'border-slate-600 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {getTypeIcon(type)}
                          {type}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Perspective</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['left', 'center', 'right', 'neutral', 'unknown'] as const).map(leaning => (
                      <button
                        key={leaning}
                        onClick={() => setCurrentSource({ ...currentSource, leaning })}
                        className={`p-2 rounded-lg border-2 transition-all text-xs capitalize ${
                          currentSource.leaning === leaning
                            ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                            : 'border-slate-600 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {leaning}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Trust Level: {currentSource.trust || 5}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentSource.trust || 5}
                    onChange={(e) => setCurrentSource({ ...currentSource, trust: parseInt(e.target.value) })}
                    className="w-full accent-violet-500"
                  />
                </div>

                <button
                  onClick={addSource}
                  disabled={!currentSource.name || !currentSource.type}
                  className="w-full bg-violet-500 hover:bg-violet-600 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2.5 rounded-lg transition-all"
                >
                  Add Source
                </button>
              </div>
            </div>

            {/* Source List */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-medium mb-4 text-slate-200">
                Your Sources ({sources.length})
              </h3>
              
              {sources.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  No sources added yet. Start mapping your influence network.
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {sources.map(source => (
                    <div
                      key={source.id}
                      className="bg-slate-700/30 rounded-lg p-3 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-slate-400">{getTypeIcon(source.type)}</div>
                          <span className="text-sm font-medium text-slate-200 truncate">
                            {source.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded ${getLeaningColor(source.leaning)} text-white`}>
                            {source.leaning}
                          </span>
                          <span className="text-xs text-slate-500">
                            Trust: {source.trust}/10
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeSource(source.id)}
                        className="text-slate-500 hover:text-red-400 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {sources.length >= 5 && (
            <button
              onClick={() => setStage('visualization')}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/20"
            >
              Visualize My Influence Map →
            </button>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'visualization' && metrics) {
    const homophilyLevel = metrics.homophilyScore > 70 ? 'high' : metrics.homophilyScore > 40 ? 'moderate' : 'low';
    const diversityLevel = metrics.diversityIndex > 60 ? 'high' : metrics.diversityIndex > 30 ? 'moderate' : 'low';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-light mb-2 text-center">Your Influence Map</h2>
          <p className="text-slate-400 mb-8 text-center">
            Patterns in how information reaches you
          </p>

          {/* Metrics Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 text-center">
              <div className="text-3xl font-light text-violet-400 mb-2">{metrics.totalSources}</div>
              <div className="text-sm text-slate-400">Total Sources</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 text-center">
              <div className="text-3xl font-light text-blue-400 mb-2">{metrics.uniquePerspectives}</div>
              <div className="text-sm text-slate-400">Unique Perspectives</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 text-center">
              <div className={`text-3xl font-light mb-2 ${
                homophilyLevel === 'high' ? 'text-amber-400' : 
                homophilyLevel === 'moderate' ? 'text-blue-400' : 'text-emerald-400'
              }`}>
                {metrics.homophilyScore}%
              </div>
              <div className="text-sm text-slate-400">Homophily</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 text-center">
              <div className={`text-3xl font-light mb-2 ${
                diversityLevel === 'high' ? 'text-emerald-400' : 
                diversityLevel === 'moderate' ? 'text-blue-400' : 'text-amber-400'
              }`}>
                {metrics.diversityIndex}%
              </div>
              <div className="text-sm text-slate-400">Diversity Index</div>
            </div>
          </div>

          {/* Network Visualization */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8">
            <h3 className="text-lg font-medium mb-6 text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              Source Distribution
            </h3>
            
            <div className="grid grid-cols-5 gap-4 mb-8">
              {(['left', 'center', 'right', 'neutral', 'unknown'] as const).map(leaning => {
                const count = sources.filter(s => s.leaning === leaning).length;
                const percentage = sources.length > 0 ? (count / sources.length) * 100 : 0;
                
                return (
                  <div key={leaning} className="text-center">
                    <div className="mb-2">
                      <div className={`h-32 rounded-lg ${getLeaningColor(leaning)} opacity-80`} 
                           style={{ height: `${Math.max(percentage * 1.5, 20)}px` }} />
                    </div>
                    <div className="text-xs text-slate-400 capitalize">{leaning}</div>
                    <div className="text-lg font-light text-slate-300">{count}</div>
                  </div>
                );
              })}
            </div>

            {/* Type Distribution */}
            <div className="grid grid-cols-4 gap-4">
              {(['person', 'platform', 'community', 'media'] as const).map(type => {
                const count = sources.filter(s => s.type === type).length;
                return (
                  <div key={type} className="bg-slate-700/30 rounded-xl p-4 text-center">
                    <div className="text-slate-400 mb-2">{getTypeIcon(type)}</div>
                    <div className="text-sm text-slate-400 capitalize mb-1">{type}</div>
                    <div className="text-xl font-light text-slate-300">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-4 mb-8">
            {homophilyLevel === 'high' && (
              <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-700/50 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-200 mb-2">High Homophily Detected</h4>
                    <p className="text-sm text-amber-300/80 leading-relaxed mb-3">
                      {metrics.homophilyScore}% of your sources share the same perspective ({metrics.topLeaning}). 
                      This suggests your information ecosystem may reinforce a single worldview.
                    </p>
                    <p className="text-xs text-amber-400/70">
                      Consider: What would a high-quality source from a different perspective add?
                    </p>
                  </div>
                </div>
              </div>
            )}

            {diversityLevel === 'low' && (
              <div className="bg-gradient-to-br from-blue-900/30 to-violet-900/30 border border-blue-700/50 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-200 mb-2">Limited Source Diversity</h4>
                    <p className="text-sm text-blue-300/80 leading-relaxed mb-3">
                      Your {metrics.uniquePerspectives} unique perspectives cover {metrics.diversityIndex}% 
                      of the ideological spectrum. There may be gaps in how you encounter information.
                    </p>
                    <p className="text-xs text-blue-400/70">
                      Suggestion: Add at least one source that actively challenges your current views.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {diversityLevel === 'high' && homophilyLevel === 'low' && (
              <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-700/50 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-emerald-200 mb-2">Strong Source Diversity</h4>
                    <p className="text-sm text-emerald-300/80 leading-relaxed">
                      You're drawing from {metrics.uniquePerspectives} different perspectives 
                      with relatively balanced distribution. This suggests active information seeking 
                      across ideological boundaries.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setStage('collection');
              }}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 rounded-xl font-medium transition-all"
            >
              Add More Sources
            </button>
            <button
              onClick={() => alert('In full app: Export data, track changes over time, get personalized bridge source recommendations')}
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/20"
            >
              Next Steps
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
