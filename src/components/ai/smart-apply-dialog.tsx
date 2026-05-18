'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Text } from '@/components/ui/typography';

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
              onClick={() => onSelectOption('resumeOnly')}
              disabled={isLoading}
            >
              {isLoading ? 'Preparing...' : 'Enhance resume only'}
            </Button>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-slate-50 p-5">
            <div className="mb-2 text-sm font-semibold">Enhance resume + cover letter</div>
            <p className="text-sm leading-relaxed text-gray-600">
              Enhance your resume and generate a job-specific cover letter before submitting.
            </p>
            <Button
              className="mt-4 w-full"
              onClick={() => onSelectOption('withCoverLetter')}
              disabled={isLoading}
            >
              {isLoading ? 'Preparing...' : 'Enhance resume + cover letter'}
            </Button>
          </div>

          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
