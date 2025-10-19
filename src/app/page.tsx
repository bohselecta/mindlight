'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Brain, Target, TrendingUp, Shield, ArrowRight, Heart, Network, BookOpen, Award, Scale, Search, CheckCircle, Clock } from 'lucide-react';
import { useModuleCompletion } from '@/lib/hooks/useModuleCompletion';
import { CompletionBadge } from '@/components/ui/CompletionIndicator';

export default function LandingPage() {
  const { getCompletionStatus, getCompletionCount, getTotalModules, loading } = useModuleCompletion();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-violet-400 rounded-2xl flex items-center justify-center">
                <img src="/logo.svg" alt="Mindlight" className="w-10 h-10" />
              </div>
              <h1 className="text-5xl font-light tracking-tight">Mindlight</h1>
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
                className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 animate-pulse"
              >
                Begin Baseline Mirror
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <div className="flex items-center gap-2 px-6 py-4 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-slate-300">No data leaves your device</span>
              </div>
            </div>
            
            {/* Enhanced CTA subtext */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              <span>5 minutes • Get your autonomy score</span>
            </div>
            
            {/* Progress indicator */}
            {!loading && getTotalModules() > 0 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{getCompletionCount()} of {getTotalModules()} modules completed</span>
                </div>
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${(getCompletionCount() / getTotalModules()) * 100}%` }}
                  />
                </div>
              </div>
            )}
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

      {/* Getting Started Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light mb-4">Getting Started</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Begin your autonomy journey with our comprehensive assessment
            </p>
          </div>
          
          {/* Prominent Baseline Mirror Card */}
          <div className="max-w-2xl mx-auto mb-16">
            <Link
              href="/mirrors/baseline"
              className="group bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur border-2 border-blue-500/50 rounded-3xl p-8 hover:border-blue-400/70 transition-all shadow-xl shadow-blue-500/10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-medium text-slate-100 group-hover:text-blue-300 transition-colors">
                      Baseline Mirror
                    </h3>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-full border border-blue-500/30">
                      Start Here
                    </span>
                  </div>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Comprehensive assessment of your current epistemic autonomy across four key constructs. 
                    Get your personalized autonomy score and insights.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>5 minutes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>36 questions</span>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Assessment Modules */}
      <div className="py-24 bg-slate-800/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light mb-4">Assessment Modules</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Deep dive into your thinking patterns and identity alignment
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
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
                <CompletionBadge completion={getCompletionStatus('identity')} />
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
                <CompletionBadge completion={getCompletionStatus('echo')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Training Modules */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light mb-4">Training Modules</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Interactive exercises to develop metacognitive skills and bias detection
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <CompletionBadge completion={getCompletionStatus('disconfirm')} />
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
                <CompletionBadge completion={getCompletionStatus('schema')} />
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
                <CompletionBadge completion={getCompletionStatus('influence')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

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
                <CompletionBadge completion={getCompletionStatus('argument-flip')} />
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
                <CompletionBadge completion={getCompletionStatus('source-audit')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="py-24 bg-slate-800/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light mb-4">Tracking & Insights</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Monitor your progress and access educational resources
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/progress"
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-emerald-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 group-hover:text-emerald-300 transition-colors">
                  Progress Dashboard
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Track your autonomy growth with visual dashboards, streak tracking, and personalized insights.
              </p>
              <div className="flex items-center justify-between">
                <CompletionBadge completion={getCompletionStatus('progress')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/library"
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 group-hover:text-blue-300 transition-colors">
                  Library
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Educational explainers on cognitive biases, epistemic autonomy, and metacognitive skills.
              </p>
              <div className="flex items-center justify-between">
                <CompletionBadge completion={getCompletionStatus('library')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/settings"
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-slate-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 group-hover:text-slate-300 transition-colors">
                  Settings
                </h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Manage your data, export results, and customize your experience.
              </p>
              <div className="flex items-center justify-between">
                <CompletionBadge completion={getCompletionStatus('settings')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-slate-300 font-medium">Privacy First</span>
          </div>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto">
            All data stays on your device. No accounts required. No tracking. 
            Your epistemic autonomy journey is completely private.
          </p>
        </div>
      </div>
    </div>
  );
}