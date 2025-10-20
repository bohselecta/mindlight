'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Brain, Target, TrendingUp, Shield, ArrowRight, Heart, Network, BookOpen, Award, Scale, Search, CheckCircle, Clock } from 'lucide-react';
import { useModuleCompletion } from '@/lib/hooks/useModuleCompletion';
import { CompletionBadge } from '@/components/ui/CompletionIndicator';
import { SignInButton } from '@/components/auth/SignInButton';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/components/auth/AuthProvider';
// import { FloatingSyncStatus } from '@/components/sync/SyncStatus';

// Force dynamic rendering to avoid SSR issues with sync components
export const dynamic = 'force-dynamic';

export default function LandingPage() {
  const { getCompletionStatus, getCompletionCount, getTotalModules, loading } = useModuleCompletion();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/hero-logo.svg" alt="Mindlight" className="h-8" />
              <span className="text-xl font-bold text-slate-900">Mindlight</span>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <UserMenu />
              ) : (
                <SignInButton variant="outline" size="sm" />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <img src="/hero-logo.svg" alt="Mindlight" className="h-[85px]" />
              <h1 className="text-5xl font-bold tracking-tight text-slate-900">Mindlight</h1>
            </div>
            
            <h2 className="text-3xl font-bold text-slate-800 mb-8 mt-4">
              Notice influence. Choose your stance.
            </h2>
            
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed" style={{ lineHeight: '1.6' }}>
              A self-guided reflection suite that helps you notice when your thinking patterns 
              might be outsourced to groups, authorities, or echo chambers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/mirrors/baseline"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-10 py-5 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 flex items-center justify-center gap-3 hover:scale-105 transform"
              >
                Begin Baseline Mirror
                <ArrowRight className="w-6 h-6" />
              </Link>
              
              <div className="flex items-center gap-2 px-6 py-4 bg-emerald-50/80 backdrop-blur border border-emerald-200 rounded-xl">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-emerald-800 font-medium">Your data stays private</span>
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
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{getCompletionCount()} of {getTotalModules()} modules completed</span>
                </div>
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
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
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">How It Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg" style={{ lineHeight: '1.6' }}>
              Three simple steps to develop epistemic autonomy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900">Mirror</h3>
              <p className="text-slate-600 leading-relaxed" style={{ lineHeight: '1.6' }}>
                Assess your current thinking patterns across four key constructs: 
                epistemic autonomy, reflective flexibility, source awareness, and affect regulation.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900">Loop</h3>
              <p className="text-slate-600 leading-relaxed" style={{ lineHeight: '1.6' }}>
                Train bias detection through interactive games and exercises. 
                Learn to spot when emotion bypasses deliberation in real-time.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900">Progress</h3>
              <p className="text-slate-600 leading-relaxed" style={{ lineHeight: '1.6' }}>
                Track your autonomy growth over time with visual dashboards, 
                streak tracking, and personalized insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="relative py-16 bg-gradient-to-b from-[#F7FBFF] to-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Getting Started</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg" style={{ lineHeight: '1.6' }}>
              Begin your autonomy journey with our comprehensive assessment
            </p>
          </div>
          
          {/* Prominent Baseline Mirror Card */}
          <div className="max-w-2xl mx-auto mb-16">
            <Link
              href="/mirrors/baseline"
              className="group relative block overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm transition hover:shadow-md hover:ring-blue-300"
            >
              {/* Decorative left rail (contained now) */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-cyan-400 to-emerald-300"
              />

              <div className="relative flex items-start gap-4 p-6 pl-8">
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-200 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Baseline Mirror
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      Start here
                    </span>
                  </div>

                  <p className="text-sm text-slate-600" style={{ lineHeight: '1.6' }}>
                    Comprehensive assessment of your current epistemic autonomy across four key
                    constructs. Get your personalized autonomy score and insights.
                  </p>

                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      5 minutes
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      36 questions
                    </span>
                  </div>
                </div>

                <span className="ml-4 mt-1 text-slate-400 transition group-hover:text-slate-600">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Assessment Modules */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Assessment Modules</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg" style={{ lineHeight: '1.6' }}>
              Deep dive into your thinking patterns and identity alignment
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/mirrors/identity"
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                  Identity Mirror
                </h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4" style={{ lineHeight: '1.6' }}>
                Explore how your values align with group expectations and identify potential identity fusion.
              </p>
              <div className="flex items-center justify-between">
                <CompletionBadge completion={getCompletionStatus('identity')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/loops/echo"
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Echo-Loop Game
                </h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4" style={{ lineHeight: '1.6' }}>
                Train bias detection through interactive headline pairs and metacognitive feedback.
              </p>
              <div className="flex items-center justify-between">
                <CompletionBadge completion={getCompletionStatus('echo')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Training Modules */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Training Modules</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg" style={{ lineHeight: '1.6' }}>
              Interactive exercises to develop metacognitive skills and bias detection
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/loops/disconfirm"
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Disconfirm Game
                </h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4" style={{ lineHeight: '1.6' }}>
                Practice falsifiability thinking by identifying conditions that would disprove your beliefs.
              </p>
              <div className="flex items-center justify-between">
                <CompletionBadge completion={getCompletionStatus('disconfirm')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/mirrors/schema"
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                  Schema Reclaim
                </h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4" style={{ lineHeight: '1.6' }}>
                Emotional regulation techniques to decouple feelings from belief certainty.
              </p>
              <div className="flex items-center justify-between">
                <CompletionBadge completion={getCompletionStatus('schema')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/loops/influence"
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Network className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                  Influence Map
                </h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4" style={{ lineHeight: '1.6' }}>
                Visualize your information sources and detect echo chamber patterns.
              </p>
              <div className="flex items-center justify-between">
                <CompletionBadge completion={getCompletionStatus('influence')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/loops/argument-flip"
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Argument Flip
                </h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4" style={{ lineHeight: '1.6' }}>
                Practice steelmanning opposing views with intellectual charity and accuracy.
              </p>
              <div className="flex items-center justify-between">
                <CompletionBadge completion={getCompletionStatus('argument-flip')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/loops/source-audit"
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                  Source Audit
                </h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4" style={{ lineHeight: '1.6' }}>
                Daily provenance journaling to track belief origins and source dependencies.
              </p>
              <div className="flex items-center justify-between">
                <CompletionBadge completion={getCompletionStatus('source-audit')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Tracking & Insights</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg" style={{ lineHeight: '1.6' }}>
              Monitor your progress and access educational resources
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/progress"
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Progress Dashboard
                </h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4" style={{ lineHeight: '1.6' }}>
                Track your autonomy growth with visual dashboards, streak tracking, and personalized insights.
              </p>
              <div className="flex items-center justify-between">
                <CompletionBadge completion={getCompletionStatus('progress')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/library"
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Library
                </h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4" style={{ lineHeight: '1.6' }}>
                Educational explainers on cognitive biases, epistemic autonomy, and metacognitive skills.
              </p>
              <div className="flex items-center justify-between">
                <CompletionBadge completion={getCompletionStatus('library')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            <Link
              href="/settings"
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-400 hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-600 transition-colors">
                  Settings
                </h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4" style={{ lineHeight: '1.6' }}>
                Manage your data, export results, and customize your experience.
              </p>
              <div className="flex items-center justify-between">
                <CompletionBadge completion={getCompletionStatus('settings')} />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="py-16 bg-gradient-to-r from-cyan-50 to-blue-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Why Trust Mindlight?</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Client-Side Encryption</h3>
                <p className="text-slate-600 text-sm" style={{ lineHeight: '1.6' }}>
                  Your data is encrypted on your device before sync. We can't read your assessments or progress.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Network className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Sync Across Devices</h3>
                <p className="text-slate-600 text-sm" style={{ lineHeight: '1.6' }}>
                  Optional cloud sync lets you access your progress from any device. Works offline-first by default.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Research-Backed Methods</h3>
                <p className="text-slate-600 text-sm" style={{ lineHeight: '1.6' }}>
                  Based on cognitive science research on epistemic autonomy, metacognition, and bias detection.
                </p>
              </div>
            </div>
          </div>
          
          {/* Secondary CTA */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Ready to begin your Mindlight journey?</h3>
            <Link
              href="/mirrors/baseline"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-105 transform"
            >
              Start Your Assessment
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-12 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/hero-logo.svg" alt="Mindlight" className="h-8" />
            <span className="text-slate-200 font-semibold">Mindlight</span>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto" style={{ lineHeight: '1.6' }}>
            Empowering epistemic autonomy through self-guided reflection and metacognitive training.
          </p>
        </div>
      </div>
      
      {/* Floating Sync Status */}
      {/* <FloatingSyncStatus /> */}
    </div>
  );
}