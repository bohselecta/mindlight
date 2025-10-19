'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Tag, ArrowRight } from 'lucide-react';

const explainers = [
  {
    slug: 'echo-chambers',
    title: 'Echo Chambers',
    category: 'Information Patterns',
    readTime: '60 seconds',
    description: 'Understanding self-reinforcing information loops and how to break out of them.',
    relatedModules: ['influence-map', 'echo-loop']
  },
  {
    slug: 'confirmation-bias',
    title: 'Confirmation Bias',
    category: 'Cognitive Patterns',
    readTime: '75 seconds',
    description: 'Why you notice supporting evidence more than contradictory evidence.',
    relatedModules: ['echo-loop', 'disconfirm']
  },
  {
    slug: 'identity-fusion',
    title: 'Identity Fusion',
    category: 'Social Psychology',
    readTime: '90 seconds',
    description: 'When beliefs become who you are, and how to reclaim epistemic autonomy.',
    relatedModules: ['identity-mirror', 'schema-reclaim']
  },
  {
    slug: 'motivated-reasoning',
    title: 'Motivated Reasoning',
    category: 'Cognitive Patterns',
    readTime: '75 seconds',
    description: 'Conclusion first, justification second - how emotional preferences drive reasoning.',
    relatedModules: ['schema-reclaim', 'disconfirm']
  },
  {
    slug: 'certainty-addiction',
    title: 'Certainty Addiction',
    category: 'Cognitive Patterns',
    readTime: '60 seconds',
    description: 'The psychological need for closure and its impact on belief formation.',
    relatedModules: ['disconfirm', 'schema-reclaim']
  },
  {
    slug: 'epistemic-humility',
    title: 'Epistemic Humility',
    category: 'Cognitive Virtues',
    readTime: '60 seconds',
    description: 'Knowing what you don\'t know - the foundation of intellectual growth.',
    relatedModules: ['disconfirm', 'baseline-mirror']
  },
  {
    slug: 'source-heuristics',
    title: 'Source Heuristics',
    category: 'Information Patterns',
    readTime: '75 seconds',
    description: 'How you judge information by who said it rather than what the evidence shows.',
    relatedModules: ['influence-map', 'echo-loop']
  },
  {
    slug: 'cognitive-inoculation',
    title: 'Cognitive Inoculation',
    category: 'Mental Resilience',
    readTime: '75 seconds',
    description: 'Building immunity to misinformation through pattern recognition training.',
    relatedModules: ['disconfirm', 'echo-loop']
  }
];

const categoryColors: Record<string, string> = {
  'Information Patterns': 'cyan',
  'Cognitive Patterns': 'violet',
  'Social Psychology': 'rose',
  'Cognitive Virtues': 'emerald',
  'Mental Resilience': 'amber',
  'Schema Therapy': 'blue'
};

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto pt-12 px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-light">Knowledge Library</h1>
          </div>
          <p className="text-xl text-slate-300 font-light max-w-2xl">
            Micro-explainers on cognitive patterns, information dynamics, and epistemic autonomy. 
            Each piece is designed for quick understanding without oversimplification.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-slate-200 mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryColors).map(([category, color]) => (
              <span
                key={category}
                className={`px-3 py-1 rounded-full text-xs font-medium bg-${color}-900/20 text-${color}-300 border border-${color}-700/30`}
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Explainers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {explainers.map((explainer) => (
            <Link
              key={explainer.slug}
              href={`/library/${explainer.slug}`}
              className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-${categoryColors[explainer.category]}-900/20 text-${categoryColors[explainer.category]}-300 border border-${categoryColors[explainer.category]}-700/30`}>
                  {explainer.category}
                </span>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{explainer.readTime}</span>
                </div>
              </div>

              <h3 className="text-lg font-medium text-slate-200 mb-3 group-hover:text-cyan-300 transition-colors">
                {explainer.title}
              </h3>

              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                {explainer.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {explainer.relatedModules.slice(0, 2).map((module) => (
                    <span
                      key={module}
                      className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs"
                    >
                      {module.replace('-', ' ')}
                    </span>
                  ))}
                  {explainer.relatedModules.length > 2 && (
                    <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">
                      +{explainer.relatedModules.length - 2}
                    </span>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-medium text-slate-200 mb-3">About This Library</h3>
            <p className="text-slate-400 leading-relaxed mb-4">
              Each explainer is designed to be mechanism-focused rather than tribal. 
              We explain <em>how</em> cognitive patterns work, not <em>who</em> is right or wrong.
            </p>
            <p className="text-sm text-slate-500">
              Reading time estimates are based on 200 words per minute. 
              Take your time—understanding beats speed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
