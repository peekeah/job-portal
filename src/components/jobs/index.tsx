"use client"

import axios, { AxiosError } from 'axios';
import useSWR, { useSWRConfig } from 'swr';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetcher } from '@/lib/fetcher';
import { Spinner } from '../ui/spinner';
import { Heading, Text } from '../ui/typography';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import EnhancedPreviewModal from '@/components/enhanced-preview-modal';
import { useState } from 'react';
import useSWRMutation from 'swr/mutation';

export type Job = {
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
  }
  skills_required: string[];
};

export type Response = {
  status: boolean;
  data: Job[]
}

type ApplyJobPaylod = {
  jobId: string;
  resumeId?: string;
}

const applyJobApiCall = async (url: string, { arg: { jobId, resumeId } }: { arg: ApplyJobPaylod }) => {
  try {
    const payload = resumeId ? { resumeId } : {}
    const response = await axios.post(url + jobId, payload);
    alert(response.data.data);
    return response.data
  } catch (err) {
    if (err instanceof AxiosError) {
      alert(err?.response?.data?.message)
    } else {
      alert("something went wrong")
    }
    console.log(err);
  }
}

const Jobs = () => {

  const { data: appliedRes, trigger: handleApplyJob, isMutating: applying } = useSWRMutation(`/api/jobs/apply/`, applyJobApiCall)
  const { data: resData, error, isLoading } = useSWR<Response>('/api/jobs', fetcher)
  const jobs = resData?.data;

  const { mutate } = useSWRConfig()
  const [enahncePreviewJobId, setEnahancePreviewJobId] = useState<string>("")

  if (error || (!isLoading && !resData)) {
    return (
      <div className='h-full w-full grid mx-auto mt-32'>
        <span className='text-xl font-bold'>Error while fetching data</span>
      </div>
    )
  }

  const applyWithEdits = async (jobId: string, resumeId: string) => {
    if (!enahncePreviewJobId) return;
    mutate("/api/jobs",
      (currentData?: Response) => {
        if (!currentData) return currentData;

        return {
          ...currentData,
          data: currentData.data.filter(
            (job: Job) => job.id !== jobId
          ),
        };
      },
      false
    );
    try {
      await handleApplyJob({ jobId, resumeId });
    } catch (err) {
      mutate("/api/jobs");
    }

    setEnahancePreviewJobId("");
  }

  return (
    <div className='p-5 sm:p-7 md:p-10 lg:px-5 md:my-5 h-full w-full'>
      <Heading variant={"h2"}>Jobs</Heading>
      {
        isLoading ? (
          <div className="flex mt-32 items-center justify-center py-10">
            <Spinner className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading...</span>
          </div>
        ) :
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
            {jobs?.map((job) => (
              <Card key={job.id}>
                <CardContent>
                  <div className='flex gap-4 items-center mb-3'>
                    <Avatar className='size-12'>
                      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                      <AvatarFallback>Job</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className='font-medium'>{job.company.name}</div>
                      <div className='text-sm text-neutral-500'>{job.company.address}</div>
                    </div>
                  </div>
                  <Heading variant='h4'>{job.job_role}</Heading>
                  <Text className='line-clamp-2 text-neutral-500'>{job.description}</Text>
                  <Text className='my-2'>$ {job.ctc}k/year</Text>
                  <Text className='text-neutral-500 space-x-1'>{job.skills_required.map(el => (
                    <Badge key={el} variant={"outline"}>{el}</Badge>
                  ))}</Text>
                  <div className='mt-4 space-x-3'>
                    <Button onClick={() => handleApplyJob({ jobId: job.id })}>Apply</Button>
                    <Button onClick={() => { setEnahancePreviewJobId(job.id) }} variant={"outline"}>
                      Enhance & apply
                    </Button>
                    <Button variant={"outline"}>View Job</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
      }

      {
        enahncePreviewJobId && (
          <EnhancedPreviewModal
            jobId={enahncePreviewJobId}
            applying={applying}
            onApplyAction={applyWithEdits}
            onCloseAction={() => { setEnahancePreviewJobId(""); }}
          />
        )
      }
    </div>
  )
}

export default Jobs

