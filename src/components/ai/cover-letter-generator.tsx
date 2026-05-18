'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { IconX, IconDownload, IconCopy } from '@tabler/icons-react';

type ResumeItem = {
  id: string;
  title: string;
  type: 'pdf' | 'json';
  url: string | null;
  json: unknown;
};

interface CoverLetterGeneratorProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  resumes: ResumeItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyWithCoverLetter?: (resumeId: string, coverLetter: string) => Promise<void>;
}

export default function CoverLetterGenerator({
  jobId,
  jobTitle,
  companyName,
  jobDescription,
  resumes,
  open,
  onOpenChange,
  onApplyWithCoverLetter,
}: CoverLetterGeneratorProps) {
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (open && resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
    if (!open) {
      setCoverLetter('');
      setIsGenerating(false);
    }
  }, [open, resumes, selectedResumeId]);

  const handleGenerateCoverLetter = async () => {
    if (!selectedResumeId) {
      toast.error('Please select a resume first');
      return;
    }

    setIsGenerating(true);
    setCoverLetter('');

    try {
      const response = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          resumeId: selectedResumeId,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message || 'Failed to generate cover letter');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setCoverLetter(prev => prev + chunk);
      }
    } catch (error) {
      console.error('Cover letter generation failed', error);
      toast.error('Failed to generate cover letter. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      toast.success('Cover letter copied to clipboard');
    } catch (error) {
      toast.error('Unable to copy cover letter');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cover-letter-${jobTitle.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApplyWithCoverLetter = async () => {
    if (!onApplyWithCoverLetter || !coverLetter) {
      toast.error('Cover letter is required to apply');
      return;
    }

    try {
      await onApplyWithCoverLetter(selectedResumeId, coverLetter);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to apply with cover letter:', error);
      toast.error('Failed to apply. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">Generate Cover Letter</div>
              <div className="text-sm text-gray-600">
                {jobTitle} at {companyName}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <IconX className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-auto px-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">Resume</label>
            <select
              value={selectedResumeId}
              onChange={event => setSelectedResumeId(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
            >
              {resumes.map(resume => (
                <option key={resume.id} value={resume.id}>
                  {resume.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleGenerateCoverLetter}
              disabled={isGenerating || !selectedResumeId}
            >
              {isGenerating ? (
                <>
                  <Spinner className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Cover Letter'
              )}
            </Button>
            {coverLetter && (
              <>
                <Button variant="outline" onClick={handleCopy}>
                  <IconCopy className="mr-2 h-4 w-4" /> Copy
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <IconDownload className="mr-2 h-4 w-4" /> Download
                </Button>
                {onApplyWithCoverLetter && (
                  <Button
                    onClick={handleApplyWithCoverLetter}
                    disabled={coverLetter.trim().length < 50}
                    className="bg-green-600 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Apply with Cover Letter
                  </Button>
                )}
              </>
            )}
          </div>
          {coverLetter && coverLetter.trim().length < 50 && (
            <p className="text-xs text-amber-600">
              Cover letter must be at least 50 characters to apply.
            </p>
          )}

          <div className="min-h-[240px] overflow-auto rounded-2xl border border-gray-200 bg-slate-50 p-4 text-sm leading-relaxed text-gray-800">
            {isGenerating && !coverLetter ? (
              <div className="flex h-60 items-center justify-center text-gray-500">
                <Spinner className="h-6 w-6 animate-spin" />
                <span className="ml-3">Generating personalized cover letter…</span>
              </div>
            ) : (
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder="Your generated cover letter will appear here. You can edit it before applying."
                className="min-h-[240px] w-full resize-none rounded-2xl border border-transparent bg-slate-50 p-3 text-sm leading-relaxed text-gray-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
