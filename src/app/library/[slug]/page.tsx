'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, Tag } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { serialize } from 'next-mdx-remote/serialize';
import fs from 'fs';
import path from 'path';

interface ExplainerMetadata {
  title: string;
  category: string;
  readTime: string;
  relatedModules: string[];
}

const explainers = [
  'echo-chambers',
  'confirmation-bias', 
  'identity-fusion',
  'motivated-reasoning',
  'certainty-addiction',
  'epistemic-humility',
  'source-heuristics',
  'cognitive-inoculation'
];

const categoryColors = {
  'Information Patterns': 'cyan',
  'Cognitive Patterns': 'violet',
  'Social Psychology': 'rose',
  'Cognitive Virtues': 'emerald',
  'Mental Resilience': 'amber',
  'Schema Therapy': 'blue'
};

export default function ExplainerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  if (!explainers.includes(slug)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto pt-12">
          <div className="text-center">
            <h1 className="text-2xl font-light text-slate-300 mb-4">Explainer Not Found</h1>
            <p className="text-slate-400 mb-8">The requested explainer doesn't exist.</p>
            <button
              onClick={() => router.push('/library')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              Back to Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  // For now, we'll create a simple viewer since we can't use MDXRemote in client components
  // In a real implementation, you'd need to set up MDX compilation at build time
  const explainerContent = getExplainerContent(slug);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto pt-12 px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="h-6 w-px bg-slate-600"></div>
          <div className="flex items-center gap-2 text-slate-400">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">Library</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${categoryColors[explainerContent.category]}-900/20 text-${categoryColors[explainerContent.category]}-300 border border-${categoryColors[explainerContent.category]}-700/30`}>
              {explainerContent.category}
            </span>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{explainerContent.readTime}</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-light text-slate-100 mb-4">
            {explainerContent.title}
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
            {explainerContent.content}
          </div>
        </div>

        {/* Related Modules */}
        {explainerContent.relatedModules.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Related Modules</h3>
            <div className="flex flex-wrap gap-2">
              {explainerContent.relatedModules.map((module) => (
                <span
                  key={module}
                  className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-sm"
                >
                  {module.replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getExplainerContent(slug: string) {
  const contentMap: Record<string, any> = {
    'echo-chambers': {
      title: 'Echo Chambers',
      category: 'Information Patterns',
      readTime: '60 seconds',
      relatedModules: ['influence-map', 'echo-loop'],
      content: (
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-cyan-900/20 border border-cyan-700/30 rounded-xl">
            <div className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5">⚠️</div>
            <p className="text-sm text-cyan-300">
              An echo chamber isn't just "hearing what you agree with"—it's a 
              <strong> self-reinforcing loop</strong> where information inputs confirm existing beliefs 
              without exposure to meaningful counter-evidence.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-200 mb-3">How It Forms</h3>
            <p className="text-slate-300 leading-relaxed">
              Algorithms prioritize engagement → Emotional content spreads faster → 
              You click what resonates → More of the same appears → Your perception 
              narrows without realizing it.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-200 mb-3">The Mechanism</h3>
            <p className="text-slate-300 leading-relaxed mb-3">
              Echo chambers don't create beliefs—they <strong>calcify</strong> them. Over time:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>Uncertainty decreases (you feel more certain)</li>
              <li>Nuance disappears (positions become binary)</li>
              <li>Out-groups dehumanize (they become "irrational")</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-200 mb-3">Breaking Out</h3>
            <p className="text-slate-300 leading-relaxed mb-3">
              The antidote isn't "hearing both sides"—it's <strong>procedural diversity</strong>:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              <li>Seek sources with different <em>methods</em> (academic vs journalistic vs experiential)</li>
              <li>Notice when you feel defensive (that's the echo wall)</li>
              <li>Ask: "What would I need to see to change my mind?"</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-xl">
            <p className="text-sm text-slate-400">
              <strong className="text-slate-300">Try this:</strong> Use the Influence Map 
              to visualize your information network. High homophily? That's your cue.
            </p>
          </div>
        </div>
      )
    },
    'confirmation-bias': {
      title: 'Confirmation Bias',
      category: 'Cognitive Patterns',
      readTime: '75 seconds',
      relatedModules: ['echo-loop', 'disconfirm'],
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-300 leading-relaxed">
            <strong>You notice evidence that confirms your beliefs more than evidence that challenges them.</strong> 
            This isn't a character flaw—it's a cognitive default.
          </p>

          <div>
            <h3 className="text-lg font-medium text-slate-200 mb-3">Why It Happens</h3>
            <p className="text-slate-300 leading-relaxed">
              Your brain is a pattern-recognition machine optimized for efficiency, not accuracy. 
              Challenging a belief requires mental energy. Confirming it feels like progress.
            </p>
            <p className="text-slate-300 leading-relaxed mt-3">
              Result: You unconsciously weight supportive evidence higher and dismiss contradictory 
              data as "outliers" or "biased sources."
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-200 mb-3">The Stealth Factor</h3>
            <p className="text-slate-300 leading-relaxed">
              Confirmation bias is invisible <em>to the person experiencing it</em>. Everyone thinks 
              they're being rational. The real test: <strong>can you list what would change your mind?</strong>
            </p>
            <p className="text-slate-300 leading-relaxed mt-3">
              If your answer is vague ("nothing" or "I'd need overwhelming proof"), you're in 
              confirmation lock.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-200 mb-3">Self-Correction</h3>
            <ol className="list-decimal list-inside text-slate-300 space-y-2">
              <li><strong>Falsification practice</strong>: Before defending a belief, list 3 conditions that would disprove it</li>
              <li><strong>Seek disconfirmation</strong>: Actively search for the <em>best</em> opposing argument (not the weakest strawman)</li>
              <li><strong>Track your certainty</strong>: High certainty + low exposure to counterevidence = red flag</li>
            </ol>
          </div>

          <div className="p-4 bg-violet-900/20 border border-violet-700/30 rounded-xl">
            <p className="text-sm text-violet-300">
              <strong className="text-violet-200">Research finding:</strong> People who 
              practice listing falsifiers score 23% higher on critical thinking assessments 
              (Stanovich, 2016).
            </p>
          </div>
        </div>
      )
    },
    // Add more content for other explainers as needed...
  };

  return contentMap[slug] || {
    title: 'Explainer Not Found',
    category: 'Error',
    readTime: '0 seconds',
    relatedModules: [],
    content: <p className="text-slate-400">Content not available.</p>
  };
}
