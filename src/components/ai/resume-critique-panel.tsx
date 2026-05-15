'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Spinner } from '../ui/spinner';
import { toast } from 'sonner';
import { IconX } from '@tabler/icons-react';

const getStorageKey = (resumeId: string) => `resume-critique-${resumeId}`;

type CritiqueResume = {
  id: string;
  title: string;
};

type Props = {
  resume: CritiqueResume;
  onClose?: () => void;
};

export default function ResumeCritiquePanel({ resume, onClose }: Props) {
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSavedOutput, setHasSavedOutput] = useState(false);

  useEffect(() => {
    if (!resume?.id) return;
    const saved = window.localStorage.getItem(getStorageKey(resume.id));
    if (saved) {
      setOutput(saved);
      setHasSavedOutput(true);
    }
  }, [resume.id]);

  const handleRunCritique = async () => {
    setError(null);
    setOutput('');
    setHasSavedOutput(false);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/ai/resume-critique', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeId: resume.id }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          payload?.message || payload?.error || 'Failed to run critique',
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Unable to read response stream');
      }

      const decoder = new TextDecoder();
      let done = false;
      let accumulated = '';

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setOutput((prev) => prev + chunk);
        }
        done = streamDone;
      }

      window.localStorage.setItem(getStorageKey(resume.id), accumulated);
      setHasSavedOutput(true);
      setIsStreaming(false);
    } catch (err) {
      setIsStreaming(false);
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      toast.error(message);
    }
  };

  const handleClearSaved = () => {
    window.localStorage.removeItem(getStorageKey(resume.id));
    setHasSavedOutput(false);
    setOutput('');
  };

  const hasContent = Boolean(output.trim());

  return (
    <Card className="mt-6">
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Resume critique</h3>
            <p className="text-sm text-gray-600">
              Analyze this resume for strengths, weaknesses, and improvement suggestions.
            </p>
            <p className="mt-1 text-sm text-gray-500">Resume: {resume.title}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {hasSavedOutput ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearSaved}
              >
                Clear saved critique
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={handleRunCritique}
              disabled={isStreaming}
              size="sm"
            >
              {isStreaming ? 'Analyzing…' : 'Run critique'}
            </Button>
          </div>
        </div>

        {isStreaming ? (
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700">
            <Spinner className="h-4 w-4 animate-spin" />
            <span>Streaming critique from OpenAI...</span>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {hasContent ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6">{output}</pre>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            {hasSavedOutput
              ? 'Saved critique content is available. Run again to refresh it.'
              : 'No critique has been generated yet. Click Run critique to begin.'}
          </div>
        )}

        {onClose ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="gap-2"
            >
              <IconX className="h-4 w-4" />
              Close
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
