'use client';

import axios, { AxiosError } from 'axios';
import useSWR, { useSWRConfig } from 'swr';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { fetcher } from '@/lib/fetcher';
import { Spinner } from '../ui/spinner';
import { Heading, Text } from '../ui/typography';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { useRouter } from 'next/navigation';
import { Resume } from '@/mock/resume';
import EnhancedJobPreviewModal from '../enhanced-preview-modal';
import { toast } from 'sonner';
import { formatInitials } from '@/lib/formater';

export type Job = {
  id: string;
  job_role: string;
  description: string;
  ctc: number;
  stipend: number;
  location: string;
  company: {
    name: string;
    profile_pic?: string;
    company_founding_year: number;
    company_type: string;
    address: string;
  };
  skills_required: string[];
};

export type Response = {
  status: boolean;
  data: Job[];
};

type ApplyJobPaylod = {
  jobId: string;
};

const applyJobApiCall = async (
  url: string,
  { arg: { jobId } }: { arg: ApplyJobPaylod },
) => {
  try {
    const response = await axios.post(url + jobId);
    toast.success(response.data.data);
    return response.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      toast.error(err?.response?.data?.message);
    } else {
      toast.error('something went wrong');
    }
  }
};

type ApplyJobWithEditsPayload = {
  jobId: string;
  resumeId: string;
  resumeData: string;
};

const applyJobWithEditsApiCall = async (
  url: string,
  { arg: { jobId, resumeId, resumeData } }: { arg: ApplyJobWithEditsPayload },
) => {
  try {
    const response = await axios.post(url + jobId, {
      resumeId,
      resumeData,
    });
    toast.success(response.data.data);
    return response.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      toast.error(err?.response?.data?.message);
    } else {
      toast.error('something went wrong');
    }
  }
};

const getEnhancededitedResume = async (
  url: string,
  { arg }: { arg: string },
) => {
  const res = await axios.post(url + arg);
  return res.data;
};

const Jobs = () => {
  const { trigger: handleApplyJob, isMutating: applying } = useSWRMutation(
    `/api/jobs/apply/`,
    applyJobApiCall,
  );

  const { trigger: handleApplyJobWithEdits } = useSWRMutation(
    `/api/jobs/apply-with-edits/`,
    applyJobWithEditsApiCall,
  );

  const {
    data: enhancedResume,
    trigger: getEnhancededitedResumeAction,
    isMutating: isEnhancing,
    error: enhancingError,
  } = useSWRMutation('/api/jobs/enhance-resume/', getEnhancededitedResume);

  const {
    data: resData,
    error,
    isLoading,
  } = useSWR<Response>('/api/jobs', fetcher);
  const jobs = resData?.data;

  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [enahncePreviewJobId, setEnahancePreviewJobId] = useState<string>('');

  if (error || (!isLoading && !resData)) {
    return (
      <div className="mx-auto mt-32 grid h-full w-full">
        <span className="text-xl font-bold">Error while fetching data</span>
      </div>
    );
  }

  const applyWithEdits = async (
    jobId: string,
    resumeId: string,
    resumeData: Resume,
  ) => {
    if (!enahncePreviewJobId) return;
    mutate(
      '/api/jobs',
      (currentData?: Response) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          data: currentData.data.filter((job: Job) => job.id !== jobId),
        };
      },
      false,
    );
    try {
      await handleApplyJobWithEdits({
        jobId,
        resumeId,
        resumeData: JSON.stringify(resumeData),
      });
    } catch (_err) {
      mutate('/api/jobs');
    }
    setEnahancePreviewJobId('');
  };

  if (enhancingError) {
    setEnahancePreviewJobId('');
  }

  return (
    <div className="h-full w-full p-5 sm:p-7 md:px-10 lg:px-5">
      <CardTitle className="mb-3 text-2xl font-semibold text-gray-800">
        Jobs
      </CardTitle>
      {isLoading ? (
        <div className="mt-32 flex items-center justify-center py-10">
          <Spinner className="h-6 w-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading...</span>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 pb-3 lg:grid-cols-2">
          {jobs?.map((job) => (
            <Card
              key={job.id}
              className="cursor-pointer py-4 md:py-5"
              onClick={() => router.push(`dashboard/job/${job.id}`)}
            >
              <CardContent className="px-4 md:px-6">
                <div className="mb-3 flex items-center gap-4">
                  <Avatar className="size-12">
                    <AvatarImage src={job.company.profile_pic} alt="company" />
                    <AvatarFallback>
                      {formatInitials(job.company.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{job.company.name}</div>
                    <div className="text-sm text-neutral-500">
                      {job.company.address}
                    </div>
                  </div>
                </div>
                <Heading variant="h4">{job.job_role}</Heading>
                <Text className="line-clamp-2 text-neutral-500">
                  {job.description}
                </Text>

                <Text className="my-2 font-semibold">$ {job.ctc}k/year</Text>
                <Text className="space-x-1 text-neutral-500">
                  {job?.skills_required.map((el) => (
                    <Badge
                      key={el}
                      variant={'outline'}
                      className="border-primary text-primary bg-primary/10 rounded-xl"
                    >
                      {el}
                    </Badge>
                  ))}
                </Text>
                <div className="mt-4 space-x-3">
                  <Button onClick={() => handleApplyJob({ jobId: job.id })}>
                    Apply
                  </Button>
                  <Button
                    onClick={() => {
                      setEnahancePreviewJobId(job.id);
                      getEnhancededitedResumeAction(job.id);
                    }}
                    variant={'outline'}
                  >
                    Enhance & apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {enahncePreviewJobId && (
        <EnhancedJobPreviewModal
          jobId={enahncePreviewJobId}
          isEnhancing={isEnhancing}
          enhancedResume={enhancedResume?.data}
          applying={applying}
          onApplyAction={applyWithEdits}
          onCloseAction={() => {
            setEnahancePreviewJobId('');
          }}
        />
      )}
    </div>
  );
};

export default Jobs;
