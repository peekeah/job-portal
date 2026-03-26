'use client';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';
import useSWR from 'swr';
import z from 'zod';
import { companySchema, jobSchema } from '@/lib/schema';
import { fetcher } from '@/lib/fetcher';
import { companySizeMap } from '@/components/company-profile/page';
import { useParams } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { Card } from '../ui/card';
import EnhancedJobPreviewModal from '../enhanced-preview-modal';
import { Resume } from '@/mock/resume';
import { Spinner } from '../ui/spinner';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatInitials } from '@/lib/formater';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import {
  IconBriefcase,
  IconBuilding,
  IconMapPin,
  IconWorld,
} from '@tabler/icons-react';

type Job = z.infer<typeof jobSchema> & {
  id: string;
  company: z.infer<typeof companySchema>;
};

export type ResJob = {
  id: string;
  job_role: string;
  description: string;
  ctc: number;
  stipend: number;
  location: string;
  company: {
    name: string;
    company_founding_year: number;
    company_type: string;
    address: string;
  };
  skills_required: string[];
};

export type Response = {
  status: boolean;
  data: ResJob[];
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

const formatCompanySize = (size: string) => {
  return `${companySizeMap.get(size)} ` + `employees`;
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

type CompanyMetadataProps = {
  location: string;
  companyType: string;
  companySize: string;
  className?: string;
};

const CompanyMetadata = ({
  location,
  companyType,
  companySize,
  className,
}: CompanyMetadataProps) => {
  return (
    <div
      className={cn(
        'hidden flex-wrap items-center gap-2 text-xs sm:gap-4 sm:text-sm md:flex',
        className,
      )}
    >
      <div className="flex items-center gap-0.5 text-gray-600 sm:gap-1.5">
        <IconMapPin className="text-primary size-3" />
        <span className="truncate">{location}</span>
      </div>
      <div className="flex items-center gap-0.5 text-gray-600 sm:gap-1.5">
        <IconBuilding className="text-primary size-3" />
        <span className="truncate">{companyType}</span>
      </div>
      <div className="flex items-center gap-1 text-gray-600 sm:gap-1.5">
        <IconBriefcase className="text-primary size-3" />
        <span className="truncate">{formatCompanySize(companySize)}</span>
      </div>
    </div>
  );
};

export function JobDetails() {
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
    error,
  } = useSWRMutation('/api/jobs/enhance-resume/', getEnhancededitedResume);

  const [enhancePreviewJobId, setEnhancePreviewJobId] = useState<string>('');

  const { jobId } = useParams<{ jobId: string }>();

  const { data: jobRes, isLoading } = useSWR<{ data: Job }>(
    `/api/jobs/${jobId}`,
    fetcher,
  );
  const jobData = jobRes?.data;

  const applyWithEdits = async (
    jobId: string,
    resumeId: string,
    resumeData: Resume,
  ) => {
    if (!enhancePreviewJobId) return;
    try {
      await handleApplyJobWithEdits({
        jobId,
        resumeId,
        resumeData: JSON.stringify(resumeData),
      });
      setEnhancePreviewJobId('');
    } catch (_err) {
      toast.error('error while applying');
    }
  };

  if (error) {
    setEnhancePreviewJobId('');
  }

  if (isLoading) {
    return (
      <div className="mt-72 flex items-center justify-center py-10">
        <Spinner className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <>
      {jobData ? (
        <div className="flex min-h-screen px-3 py-4 sm:px-4 sm:py-8 lg:px-6 lg:py-12">
          <div className="w-full max-w-4xl">
            <Card className="sm:py-0">
              <div className="space-y-4 sm:space-y-0">
                <div className="space-y-4 px-4 sm:space-y-6 sm:px-6 sm:pb-8 md:py-6">
                  <div className="flex flex-col items-start justify-between gap-1 sm:flex-row">
                    <div className="flex w-full items-center gap-3 sm:w-auto sm:gap-5">
                      <div className="relative shrink-0">
                        <Avatar className="size-16 md:size-24">
                          <AvatarImage
                            src={jobData.company?.profile_pic ?? ''}
                            alt={jobData.company?.name}
                          />
                          <AvatarFallback>
                            <span className="font-sans text-3xl font-bold md:text-5xl">
                              {formatInitials(
                                (jobData.company?.name as string) || '',
                              )}
                            </span>
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="min-w-0 flex-1 sm:space-y-1">
                        <div className="flex flex-wrap items-center gap-1 text-xs text-gray-600 sm:gap-2 sm:text-sm">
                          <IconBuilding className="text-primary size-3.5" />
                          <span className="truncate font-semibold text-gray-900 sm:text-lg">
                            {jobData.company.name}
                          </span>
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-green-700 sm:py-1">
                            Actively hiring
                          </span>
                        </div>
                        <CompanyMetadata
                          location={jobData.company.address}
                          companyType={jobData.company.company_type}
                          companySize={jobData.company.size!}
                          className="hidden md:flex"
                        />
                      </div>
                    </div>
                    <CompanyMetadata
                      location={jobData.company.address}
                      companyType={jobData.company.company_type}
                      companySize={jobData.company.size!}
                      className="mt-1 flex md:hidden"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-6 px-4 pb-6 sm:space-y-8 sm:px-6 sm:pb-8">
                  {/* CTC Card */}
                  <div className="space-y-1.5">
                    <h1 className="bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl leading-tight font-bold text-transparent sm:text-3xl">
                      {jobData.job_role}
                    </h1>
                    <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-linear-to-r from-blue-600 to-indigo-500 p-4 text-white sm:flex-row sm:items-center sm:rounded-2xl sm:p-6">
                      <div className="w-full sm:w-auto">
                        <div className="mb-2 flex items-center gap-2 text-blue-100">
                          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="text-xs font-medium sm:text-sm">
                            Annual Compensation
                          </span>
                        </div>
                        <p className="text-2xl font-bold sm:text-3xl">
                          ₹{jobData.ctc} LPA
                        </p>
                        {jobData.stipend > 0 && (
                          <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                            + ₹{jobData.stipend} stipend
                          </p>
                        )}
                      </div>
                      <div className="space-x-3">
                        <Button
                          className="lg:text-md bg-white font-semibold text-blue-600 transition-colors hover:bg-blue-50 lg:p-5"
                          onClick={() => handleApplyJob({ jobId: jobData?.id })}
                        >
                          Apply
                        </Button>
                        <Button
                          className="lg:text-md bg-white font-semibold text-blue-600 transition-colors hover:bg-blue-50 lg:p-5"
                          onClick={() => {
                            getEnhancededitedResumeAction(jobData.id);
                            setEnhancePreviewJobId(jobData.id);
                          }}
                        >
                          Enhance & Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* About the Role */}
                  <div className="space-y-3 sm:space-y-4">
                    <h2 className="text-xl font-bold sm:text-2xl">
                      About the Role
                    </h2>
                    <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                      {jobData.description}
                    </p>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Company Info Grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3">
                    <div>
                      <p className="mb-1 text-xs text-gray-600 sm:text-sm">
                        Company Founded
                      </p>
                      <p className="text-base font-semibold sm:text-lg">
                        {jobData.company.founding_year}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-gray-600 sm:text-sm">
                        Company Size
                      </p>
                      <p className="text-base font-semibold sm:text-lg">
                        {formatCompanySize(jobData.company.size!)}
                      </p>
                    </div>
                    <div className="sm:col-span-2 md:col-span-1">
                      <p className="mb-1 text-xs text-gray-600 sm:text-sm">
                        Location
                      </p>
                      <p className="wrap-break-words text-base font-semibold sm:text-lg">
                        {jobData.company.address}
                      </p>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* About Company */}
                  <div className="space-y-3 sm:space-y-4">
                    <h2 className="text-xl font-bold sm:text-2xl">
                      About {jobData.company.name}
                    </h2>
                    <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                      {jobData.company.bio}
                    </p>

                    {jobData.company.website && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 sm:text-sm">
                        <IconWorld className="text-primary size-4" />
                        <a
                          href={jobData.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary break-all hover:underline"
                        >
                          {jobData.company.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <hr className="border-gray-200" />

                  {/* Required Skills */}
                  <div className="space-y-4 sm:space-y-5">
                    <h2 className="text-xl font-bold sm:text-2xl">
                      Required Skills
                    </h2>

                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {jobData.skills_required.map((skill, index) => (
                        <Badge
                          key={skill + index}
                          variant={'outline'}
                          className="border-primary text-primary bg-primary/10 rounded-xl"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {enhancePreviewJobId && (
        <EnhancedJobPreviewModal
          jobId={jobId}
          isEnhancing={isEnhancing}
          enhancedResume={enhancedResume?.data}
          applying={applying}
          onApplyAction={applyWithEdits}
          onCloseAction={() => {
            setEnhancePreviewJobId('');
          }}
        />
      )}
    </>
  );
}
