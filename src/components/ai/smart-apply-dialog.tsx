'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Text } from '@/components/ui/typography';
import { useEffect, useState } from 'react';

type SmartApplyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectOption: (option: 'resumeOnly' | 'withCoverLetter') => void;
  isLoading?: boolean;
};

export default function SmartApplyDialog({
  open,
  onOpenChange,
  onSelectOption,
  isLoading = false,
}: SmartApplyDialogProps) {
  const [clickedOption, setClickedOption] = useState<'resumeOnly' | 'withCoverLetter' | null>(null);

  useEffect(() => {
    if (!open) {
      setClickedOption(null);
    }
  }, [open]);

  const handleSelectOption = (option: 'resumeOnly' | 'withCoverLetter') => {
    setClickedOption(option);
    onSelectOption(option);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Smart Apply</DialogTitle>
          <Text className="text-sm text-gray-600">
            Choose how you want to apply so we can enhance your resume first.
          </Text>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-3xl border border-gray-200 bg-slate-50 p-5">
            <div className="mb-2 text-sm font-semibold">Enhance resume only</div>
            <p className="text-sm leading-relaxed text-gray-600">
              Enhance your resume for this role, review it, then submit without a cover letter.
            </p>
            <Button
              className="mt-4 w-full"
              onClick={() => handleSelectOption('resumeOnly')}
              disabled={isLoading && clickedOption === 'resumeOnly'}
            >
              {isLoading && clickedOption === 'resumeOnly' ? 'Preparing...' : 'Enhance resume only'}
            </Button>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-slate-50 p-5">
            <div className="mb-2 text-sm font-semibold">Enhance resume + cover letter</div>
            <p className="text-sm leading-relaxed text-gray-600">
              Enhance your resume and generate a job-specific cover letter before submitting.
            </p>
            <Button
              className="mt-4 w-full"
              onClick={() => handleSelectOption('withCoverLetter')}
              disabled={isLoading && clickedOption === 'withCoverLetter'}
            >
              {isLoading && clickedOption === 'withCoverLetter' ? 'Preparing...' : 'Enhance resume + cover letter'}
            </Button>
          </div>

          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
