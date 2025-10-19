import React from 'react';
import { BASELINE_MIRROR_ITEMS } from '@/lib/scoring/assessment-bank';
import { AssessmentWrapper } from '@/components/assessment/AssessmentWrapper';
import { useResponses, useProfile } from '@/lib/hooks/useAutonomy';
import { useRouter } from 'next/navigation';
import { UserResponse } from '@/types';

export default function BaselineMirrorPage() {
  const router = useRouter();
  const { responses, saveResponse } = useResponses('baseline_mirror_v1');
  const { recalculateProfile } = useProfile();

  const handleComplete = async (allResponses: UserResponse[]) => {
    try {
      // Save all responses
      for (const response of allResponses) {
        await saveResponse(response);
      }
      
      // Recalculate profile
      await recalculateProfile();
      
      // Navigate to results or next step
      router.push('/mirrors/identity');
    } catch (error) {
      console.error('Failed to complete assessment:', error);
    }
  };

  const handleSaveProgress = async (responses: UserResponse[]) => {
    try {
      // Auto-save is handled by the hook
      console.log('Progress saved:', responses.length, 'responses');
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light mb-2">Baseline Mirror</h1>
          <p className="text-slate-400">
            A 36-item assessment across 4 constructs: Epistemic Autonomy, Reflective Flexibility, 
            Source Awareness, and Affect Regulation in Debate.
          </p>
        </div>

        {/* Assessment */}
        <AssessmentWrapper
          items={BASELINE_MIRROR_ITEMS}
          assessmentId="baseline_mirror_v1"
          onComplete={handleComplete}
          onSaveProgress={handleSaveProgress}
        />

        {/* Instructions */}
        <div className="mt-8 bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Instructions</h3>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Answer honestly based on your typical behavior and thinking patterns</li>
            <li>• There are no right or wrong answers—only your authentic responses</li>
            <li>• Your progress is automatically saved as you go</li>
            <li>• You can pause and resume at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
