import React from 'react';
import Link from 'next/link';
import { Sparkles, Brain, Target, TrendingUp, Shield, ArrowRight, Heart, Network, BookOpen, Award, Scale, Search } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-violet-400 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-light tracking-tight">Reflector</h1>
            </div>
            
            <h2 className="text-3xl font-light text-slate-300 mb-6">
              Notice influence. Choose your stance.
            </h2>
            
            <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              A self-guided reflection suite that helps you notice when your thinking patterns 
              might be outsourced to groups, authorities, or echo chambers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/mirrors/baseline"
                className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                Begin Baseline Mirror
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <div className="flex items-center gap-2 px-6 py-4 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-slate-300">No data leaves your device</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-24 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Three simple steps to develop epistemic autonomy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-4 text-slate-200">Mirror</h3>
              <p className="text-slate-400 leading-relaxed">
                Assess your current thinking patterns across four key constructs: 
                epistemic autonomy, reflective flexibility, source awareness, and affect regulation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-4 text-slate-200">Loop</h3>
              <p className="text-slate-400 leading-relaxed">
                Train bias detection through interactive games and exercises. 
                Learn to spot when emotion bypasses deliberation in real-time.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-4 text-slate-200">Progress</h3>
              <p className="text-slate-400 leading-relaxed">
                Track your autonomy growth over time with visual dashboards, 
                streak tracking, and personalized insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light mb-4">Training Modules</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Comprehensive tools for developing epistemic autonomy
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Phase 1 Modules */}
            <Link
              href="/mirrors/baseline"
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 group-hover:text-blue-300 transition-colors">
                  Baseline Mirror
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Comprehensive assessment of your current epistemic autonomy across four key constructs.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Phase 1</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/mirrors/identity"
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-violet-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 group-hover:text-violet-300 transition-colors">
                  Identity Mirror
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Explore how your values align with group expectations and identify potential identity fusion.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Phase 1</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/loops/echo"
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-emerald-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 group-hover:text-emerald-300 transition-colors">
                  Echo-Loop Game
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Train bias detection through interactive headline pairs and metacognitive feedback.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Phase 1</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            {/* Phase 2 Modules */}
            <Link
              href="/loops/disconfirm"
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-amber-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 group-hover:text-amber-300 transition-colors">
                  Disconfirm Game
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Practice falsifiability thinking by identifying conditions that would disprove your beliefs.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-400">Phase 2</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/mirrors/schema"
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-rose-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 group-hover:text-rose-300 transition-colors">
                  Schema Reclaim
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Emotional regulation techniques to decouple feelings from belief certainty.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-rose-400">Phase 2</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/loops/influence"
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Network className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                  Influence Map
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Visualize your information sources and detect echo chamber patterns.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-400">Phase 2</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            {/* Phase 3 Modules */}
            <Link
              href="/loops/argument-flip"
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-indigo-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                  Argument Flip
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Practice steelmanning opposing views with intellectual charity and accuracy.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-400">Phase 3</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/loops/source-audit"
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-teal-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 group-hover:text-teal-300 transition-colors">
                  Source Audit
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Daily provenance journaling to track belief origins and source dependencies.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-teal-400">Phase 3</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            {/* Additional Features */}
            <Link
              href="/reflect"
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-green-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 group-hover:text-green-300 transition-colors">
                  Daily Reflections
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Build metacognitive awareness through guided daily reflection practice.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-400">Retention</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/library"
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-indigo-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                  Knowledge Library
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Micro-explainers on cognitive patterns, bias mechanisms, and epistemic autonomy.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-400">Learning</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/progress"
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 group-hover:text-purple-300 transition-colors">
                  Progress Dashboard
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Track your autonomy growth, achievements, and streak progress over time.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-400">Analytics</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Why This Matters */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light mb-4">Why This Matters</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Understanding the mechanisms behind belief formation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-slate-200 mb-3">Echo Chambers</h3>
                <p className="text-slate-400 leading-relaxed">
                  When your information ecosystem reinforces a single worldview, 
                  it becomes harder to recognize alternative perspectives or 
                  question your assumptions.
                </p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-slate-200 mb-3">Identity Fusion</h3>
                <p className="text-slate-400 leading-relaxed">
                  When group membership merges with self-concept, 
                  disagreement feels like personal attack. 
                  This makes genuine inquiry emotionally threatening.
                </p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-slate-200 mb-3">Emotional Reasoning</h3>
                <p className="text-slate-400 leading-relaxed">
                  Strong feelings can feel like evidence. 
                  Learning to notice when emotion drives attention 
                  is the first step toward epistemic autonomy.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/20 to-violet-900/20 border border-blue-700/30 rounded-2xl p-8">
              <h3 className="text-xl font-medium text-blue-200 mb-4">The Goal</h3>
              <p className="text-blue-300/80 leading-relaxed mb-6">
                We don't tell you what to think—we help you see when you're not the one thinking.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <p className="text-sm text-blue-300/70">
                    Notice when beliefs come from social pressure rather than evidence
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <p className="text-sm text-blue-300/70">
                    Develop tolerance for uncertainty and intellectual humility
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <p className="text-sm text-blue-300/70">
                    Build metacognitive awareness of your own thinking patterns
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Research Foundation */}
      <div className="py-24 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light mb-4">Research Foundation</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Built on evidence from cognitive psychology and therapeutic practice
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-slate-200 mb-3">Schema Therapy</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Core emotional schemas like "approval-seeking" and "dependence" 
                often align with cult susceptibility and ideological capture.
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-slate-200 mb-3">Motivational Interviewing</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Non-judgmental prompts that evoke self-generated change talk 
                and restore uncertainty tolerance.
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-slate-200 mb-3">Social Identity Theory</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Helps users explore in-group/out-group bias and understand 
                how tribal membership shapes belief formation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-light mb-6">Ready to Begin?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Start with the Baseline Mirror assessment to establish your current autonomy profile.
          </p>
          
          <Link
            href="/mirrors/baseline"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
          >
            Begin Your Journey
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <p className="text-sm text-slate-500 mt-6">
            Takes about 10 minutes • Completely private • No signup required
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-slate-500 mb-2">Evidence over echo. Curiosity over certainty.</p>
            <p className="text-sm text-slate-600">Reflector v1.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
