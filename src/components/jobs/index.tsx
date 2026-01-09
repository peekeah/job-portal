"use client"

import axios, { AxiosError } from 'axios';
import useSWR from 'swr';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetcher } from '@/lib/fetcher';
import { Spinner } from '../ui/spinner';
import { Heading, Text } from '../ui/typography';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import EnhancedPreviewModal from '@/components/enhanced-preview-modal';
import { useState } from 'react';

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

const Jobs = () => {

  const { data: resData, error, isLoading } = useSWR<Response>('/api/jobs', fetcher)
  const jobs = resData?.data;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewingJobId, setPreviewingJobId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const handleApplyJob = async (jobId: string) => {
    try {
      const response = await axios.post(`/api/jobs/apply/${jobId}`, {});
      alert(response.data.data);

    } catch (err) {
      if (err instanceof AxiosError) {
        alert(err?.response?.data?.error)
      } else {
        alert("something went wrong")
      }
      console.log(err);
    }
  }

  
  const openPreview = async (jobId: string) => {
    try {
      // get current user's resume url
      const profile = await axios.get('/api/student/profile');
      const resumeUrl: string | null | undefined = profile?.data?.data?.resume_url;
      if (!resumeUrl) return alert('Upload your resume first.');
      if (!resumeUrl.toLowerCase().endsWith('.pdf')) return alert('Preview supports PDF only.');

      // Use the existing resume URL for initial preview (no blank PDF)
      setPreviewUrl(resumeUrl);
      setPreviewingJobId(jobId);
    } catch (err) {
      if (err instanceof AxiosError) {
        alert(err?.response?.data?.error)
      } else {
        alert('Failed to preview enhanced resume');
      }
      console.error(err);
    }
  }

  const applyWithEdits = async () => {
    if (!previewingJobId) return;
    setApplying(true);
    try {
      // await axios.post(`/api/jobs/apply-with-edits/${previewingJobId}`)
      alert('Applied with edited resume');
      setPreviewUrl(null);
      setPreviewingJobId(null);
    } catch (err) {
      if (err instanceof AxiosError) {
        alert(err?.response?.data?.error)
      } else {
        alert('Failed to apply');
      }
      console.error(err);
    } finally {
      setApplying(false);
    }
  }

  if (error) {
    return (
      <div className='h-full w-full grid mx-auto mt-32'>
        <span className='text-xl font-bold'>Error while fetching data</span>
      </div>
    )
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
                    <Button onClick={() => handleApplyJob(job.id)}>Apply</Button>
                    <Button onClick={() => openPreview(job.id)} variant={"outline"}>
                      Enhance resume
                    </Button>
                    <Button variant={"outline"}>View Job</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
      }

      {previewUrl && (
        <EnhancedPreviewModal
          onApply={applyWithEdits}
          onClose={() => {setPreviewUrl(null); setPreviewingJobId(null); }}
          applying={applying}
        />
      )}
    </div>
  )
}

export default Jobs 
