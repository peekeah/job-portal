import axios from 'axios';

import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Applicants, ApplicantType } from '../job/company-job';
import { toast } from 'sonner';
import { useState } from 'react';
import { Resume } from '@prisma/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import ResumeViewer from '../resume-viewer';

type ApplicantTableProps = {
  jobId: string;
  applicants: Applicants[];
  type: ApplicantType;
  refetch: () => void;
};

const ApplicantsTable = ({
  applicants,
  jobId,
  type,
  refetch,
}: ApplicantTableProps) => {
  const [selectResumeToDisplay, setSelectResumeToDisplay] =
    useState<Resume | null>(null);

  const onActionSubmit = async (
    jobId: string,
    applicantId: string,
    applicantStatus: string,
  ) => {
    try {
      const payload = { jobId, studentId: applicantId, applicantStatus };

      const res = await axios.post('/api/jobs/select-candidate', payload);
      if (!res?.data?.status) {
        throw new Error(res?.data?.error || 'Error while saving');
      }
      toast.success('successfully saved');
      refetch();
    } catch (_err) {
      toast.error('error while selecting candidate');
    }
  };

  return applicants?.length ? (
    <>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Resume</TableHead>
            {type !== 'hired' ? <TableHead>Action</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants.map((el, index) => {
            return (
              <TableRow
                className="cursor-pointer transition-all"
                key={el.id || index}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{el.applicant?.name}</TableCell>
                <TableCell>{el.applicant?.email}</TableCell>
                <TableCell>{el.applicant?.mobile}</TableCell>
                <TableCell>
                  {el.resume.url ? (
                    <Button
                      onClick={() => setSelectResumeToDisplay(el?.resume)}
                    >
                      View
                    </Button>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </TableCell>
                {type !== 'hired' ? (
                  <TableCell className="space-x-3">
                    {type === 'applied' ? (
                      <Button
                        onClick={() =>
                          onActionSubmit(jobId, el.applicant.id, 'shortlisted')
                        }
                      >
                        Shortlist
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          onActionSubmit(jobId, el.applicant.id, 'hired')
                        }
                      >
                        Hire
                      </Button>
                    )}
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {selectResumeToDisplay && (
        <Dialog open={true} onOpenChange={() => setSelectResumeToDisplay(null)}>
          <DialogContent className="max-h-[90vh] min-w-4xl">
            <DialogHeader className="hidden">
              <DialogTitle>title</DialogTitle>
            </DialogHeader>
            <ResumeViewer resume={selectResumeToDisplay} />
          </DialogContent>
        </Dialog>
      )}
    </>
  ) : (
    <div className="grid h-42 w-full place-content-center bg-neutral-50">
      <span className="text-xl">No applicant found</span>
    </div>
  );
};

export default ApplicantsTable;
