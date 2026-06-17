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
import { MouseEvent, useEffect, useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { useRouter } from 'next/navigation';
import { Resume } from '@/mock/resume';
import EnhancedJobPreviewModal from '../enhanced-preview-modal';
import CoverLetterGenerator from '../ai/cover-letter-generator';
import SmartApplyDialog from '@/components/ai/smart-apply-dialog';
import { toast } from 'sonner';
import { formatInitials } from '@/lib/formater';
import { Profile } from '../student-profile/schema';

export type Job = {
  id: string;
  job_role: string;
  description: string;
  ctc: number;
  stipend: number;
  location: string;
  matchScore: number;
  hasResumeEmbedding?: boolean;
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

  const { trigger: handleApplyWithCoverLetter } = useSWRMutation(
    `/api/jobs/apply-with-cover-letter/`,
    async (
      url: string,
      { arg }: { arg: { jobId: string; resumeId: string; coverLetter: string } },
    ) => {
      try {
        const response = await axios.post(url + arg.jobId, {
          resumeId: arg.resumeId,
          coverLetter: arg.coverLetter,
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
    },
  );

  const { data: applicantProfile } = useSWR<{ data: Profile }>(
    '/api/student/profile',
    fetcher,
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
  const [smartApplyJobId, setSmartApplyJobId] = useState<string>('');
  const [smartApplyOption, setSmartApplyOption] = useState<
    'resumeOnly' | 'withCoverLetter' | null
  >(null);
  const [isSmartApplyDialogOpen, setIsSmartApplyDialogOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [selectedSmartApplyJobId, setSelectedSmartApplyJobId] = useState('');
  const selectedJob = jobs?.find((job) => job.id === smartApplyJobId);

  const onJobApply = async (e: MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (applicantProfile?.data.active_resume_id) {
      handleApplyJob({ jobId });
    } else {
      toast.error('upload resume first');
      router.push('/dashboard/profile'); // redirect to settings
    }
  };

  const onSmartApplyClick = (e: MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (applicantProfile?.data.active_resume_id) {
      setSelectedSmartApplyJobId(jobId);
      setIsSmartApplyDialogOpen(true);
    } else {
      toast.error('upload resume first');
      router.push('/dashboard/profile'); // redirect to settings
    }
  };

  const handleSmartApplySelect = async (
    option: 'resumeOnly' | 'withCoverLetter',
  ) => {
    if (!selectedSmartApplyJobId) return;

    setSmartApplyOption(option);
    setSmartApplyJobId(selectedSmartApplyJobId);
    setIsSmartApplyDialogOpen(false);
    await getEnhancededitedResumeAction(selectedSmartApplyJobId);
  };

  const onApplyWithCoverLetter = async (resumeId: string, coverLetter: string) => {
    try {
      await handleApplyWithCoverLetter({
        jobId: smartApplyJobId,
        resumeId,
        coverLetter,
      });
      setSmartApplyJobId('');
      setSmartApplyOption(null);
      setIsCoverLetterOpen(false);
    } catch (_err) {
      throw _err;
    }
  };

  useEffect(() => {
    if (enhancingError) {
      setSmartApplyJobId('');
      setSmartApplyOption(null);
    }
  }, [enhancingError]);

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
    if (!smartApplyJobId) return;
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
      setSmartApplyJobId('');
      setSmartApplyOption(null);
    } catch (_err) {
      mutate('/api/jobs');
    }
  };

  return (
    <div className="h-full w-full p-5 sm:p-7 md:px-10 lg:px-5">
      <CardTitle className="mb-3 text-2xl font-semibold text-gray-800">
        Jobs
      </CardTitle>
      {isLoading ? (
        <div className="mt-52 flex h-full justify-center py-10">
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
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12">
                      <AvatarImage
                        src={job.company.profile_pic}
                        alt="company"
                      />
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

                  {job.hasResumeEmbedding ? (
                    <Badge
                      variant={'outline'}
                      className="border-green-500 text-green-500 bg-green-100 rounded-xl"
                    >
                      {job.matchScore}% Match
                    </Badge>
                  ) : (
                    <Badge
                      variant={'outline'}
                      className="border-blue-400 text-blue-500 bg-blue-50 rounded-xl cursor-help"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/dashboard/profile');
                      }}
                      title="Upload resume in profile to unlock match score"
                    >
                      Match Pending
                    </Badge>
                  )}
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
                  <Button onClick={(e) => onJobApply(e, job.id)}>Apply</Button>
                  <Button
                    onClick={(e) => onSmartApplyClick(e, job.id)}
                    variant={'outline'}
                  >
                    Smart Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SmartApplyDialog
        open={isSmartApplyDialogOpen}
        onOpenChange={setIsSmartApplyDialogOpen}
        onSelectOption={handleSmartApplySelect}
        isLoading={isEnhancing}
      />

      {smartApplyJobId && (
        <EnhancedJobPreviewModal
          jobId={smartApplyJobId}
          isEnhancing={isEnhancing}
          enhancedResume={enhancedResume?.data}
          applying={applying}
          onApplyAction={applyWithEdits}
          onGenerateCoverLetter={() => setIsCoverLetterOpen(true)}
          showCoverLetterAction={smartApplyOption === 'withCoverLetter'}
          onCloseAction={() => {
            setSmartApplyJobId('');
            setSmartApplyOption(null);
          }}
        />
      )}

      {smartApplyOption === 'withCoverLetter' && enhancedResume?.data && selectedJob && (
        <CoverLetterGenerator
          jobId={smartApplyJobId}
          jobTitle={selectedJob.job_role}
          companyName={selectedJob.company.name}
          resumes={[enhancedResume.data]}
          open={isCoverLetterOpen}
          onOpenChange={setIsCoverLetterOpen}
          onApplyWithCoverLetter={onApplyWithCoverLetter}
        />
      )}
    </div>
  );
};

export default Jobs;
